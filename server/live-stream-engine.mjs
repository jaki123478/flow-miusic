// @ts-nocheck
import http from 'node:http';
import { Innertube } from 'youtubei.js';
import { PassThrough } from 'node:stream';

const PORT = process.env.STREAM_PORT ? parseInt(process.env.STREAM_PORT, 10) : 3001;

let yt = null;
async function getTube() {
  if (!yt) yt = await Innertube.create();
  return yt;
}

// Master state on PC
const masterState = {
  queue: [],
  index: 0,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  current: null,
};

// Connected client responses for the live audio stream
const streamClients = new Set();
// Connected SSE clients for metadata updates
const sseClients = new Set();

function broadcastSse(data) {
  const msg = 'data: ' + JSON.stringify(data) + '\n\n';
  for (const client of sseClients) {
    try { client.write(msg); } catch (_) { sseClients.delete(client); }
  }
}

async function resolveAudioUrl(id) {
  try {
    const tube = await getTube();
    const clients = ['IOS', 'ANDROID', 'YTMUSIC', 'WEB'];
    for (const client of clients) {
      try {
        const info = await tube.getBasicInfo(id, { client });
        const format =
          info.chooseFormat({ type: 'audio' }) ||
          info.chooseFormat({ type: 'audio', quality: 'best' }) ||
          info.chooseFormat({ type: 'audio', format: 'mp4' }) ||
          info.streaming_data?.adaptive_formats?.find(f => (f.mime_type || '').startsWith('audio/')) ||
          info.streaming_data?.formats?.find(f => (f.mime_type || '').startsWith('audio/') || f.has_audio);

        if (format?.url) return format.url;
        if (format && typeof format.decipher === 'function') {
          const u = await format.decipher(tube.session.player);
          if (u) return u;
        }
      } catch (_) {}
    }
  } catch (_) {}
  return null;
}

// Live audio broadcast loop
let isPumping = false;
let currentAbortCtrl = null;

async function playNextInLiveStream() {
  if (!masterState.queue.length) return;
  if (masterState.index >= masterState.queue.length) {
    masterState.index = 0; // loop queue
  }

  const track = masterState.queue[masterState.index];
  masterState.current = track;
  masterState.isPlaying = true;
  masterState.currentTime = 0;
  masterState.duration = track.duration || 0;
  broadcastSse({ type: 'track_change', current: track, index: masterState.index, isPlaying: true });

  console.log('[PC Live Stream] Starting track:', track.title, track.id);
  const audioUrl = await resolveAudioUrl(track.videoId || track.id);
  if (!audioUrl) {
    console.log('[PC Live Stream] Failed to resolve, skipping to next');
    masterState.index++;
    return playNextInLiveStream();
  }

  try {
    currentAbortCtrl = new AbortController();
    const res = await fetch(audioUrl, {
      signal: currentAbortCtrl.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15',
      },
    });

    if (!res.ok || !res.body) {
      masterState.index++;
      return playNextInLiveStream();
    }

    const reader = res.body.getReader();
    while (masterState.isPlaying) {
      const { done, value } = await reader.read();
      if (done) break;
      for (const client of streamClients) {
        try { client.write(value); } catch (_) { streamClients.delete(client); }
      }
    }

    // Song completed naturally -> proceed to next track in queue seamlessly!
    if (masterState.isPlaying) {
      masterState.index++;
      playNextInLiveStream();
    }
  } catch (err) {
    if (err.name !== 'AbortError') {
      console.error('[PC Live Stream] Read error:', err);
    }
  }
}

// HTTP Server
const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Range, Accept, Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, 'http://' + (req.headers.host || 'localhost'));

  // 1. SSE Real-time State updates
  if (url.pathname === '/api/live/events') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    });
    res.write('data: ' + JSON.stringify({ type: 'init', state: masterState }) + '\n\n');
    sseClients.add(res);
    req.on('close', () => sseClients.delete(res));
    return;
  }

  // 2. Continuous Master Audio Stream
  if (url.pathname === '/api/live/stream') {
    res.writeHead(200, {
      'Content-Type': 'audio/mp4',
      'Transfer-Encoding': 'chunked',
      'Cache-Control': 'no-cache, no-store',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    });
    streamClients.add(res);
    req.on('close', () => streamClients.delete(res));

    // If not currently streaming, start streaming current queue
    if (!isPumping && masterState.queue.length) {
      isPumping = true;
      playNextInLiveStream();
    }
    return;
  }

  // 3. Remote Control commands from phone to PC
  if (url.pathname === '/api/live/control') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const cmd = JSON.parse(body || '{}');
        console.log('[PC Remote Command]', cmd.action);

        if (cmd.action === 'set_queue') {
          masterState.queue = cmd.queue || [];
          masterState.index = cmd.index || 0;
          masterState.isPlaying = true;
          if (currentAbortCtrl) currentAbortCtrl.abort();
          isPumping = true;
          playNextInLiveStream();
        } else if (cmd.action === 'play') {
          masterState.isPlaying = true;
          if (!isPumping && masterState.queue.length) {
            isPumping = true;
            playNextInLiveStream();
          }
        } else if (cmd.action === 'pause') {
          masterState.isPlaying = false;
          if (currentAbortCtrl) currentAbortCtrl.abort();
          isPumping = false;
        } else if (cmd.action === 'next') {
          masterState.index = (masterState.index + 1) % (masterState.queue.length || 1);
          if (currentAbortCtrl) currentAbortCtrl.abort();
          isPumping = true;
          playNextInLiveStream();
        } else if (cmd.action === 'prev') {
          masterState.index = masterState.index > 0 ? masterState.index - 1 : (masterState.queue.length - 1);
          if (currentAbortCtrl) currentAbortCtrl.abort();
          isPumping = true;
          playNextInLiveStream();
        }

        broadcastSse({ type: 'state_update', state: masterState });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, state: masterState }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  // 4. Standalone direct stream
  if (url.pathname === '/api/stream') {
    const id = url.searchParams.get('v') || '';
    if (!/^[\w-]{11}$/.test(id)) {
      res.writeHead(400);
      res.end('Bad request');
      return;
    }
    const directUrl = await resolveAudioUrl(id);
    if (!directUrl) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    try {
      const range = req.headers.range || 'bytes=0-';
      const upstream = await fetch(directUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15',
          Range: range,
        },
      });
      res.writeHead(upstream.status, {
        'Content-Type': upstream.headers.get('content-type') || 'audio/mp4',
        'Accept-Ranges': 'bytes',
        'Content-Range': upstream.headers.get('content-range') || '',
        'Content-Length': upstream.headers.get('content-length') || '',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=86400',
      });
      if (upstream.body) {
        const reader = upstream.body.getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          res.write(value);
        }
      }
      res.end();
      return;
    } catch (_) {
      res.writeHead(302, { Location: directUrl });
      res.end();
      return;
    }
  }

  res.writeHead(404);
  res.end('Not found');
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('[Flow Master Audio Engine] Running on port ' + PORT);
});
