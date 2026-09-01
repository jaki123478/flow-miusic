// @ts-nocheck
import http from 'node:http';
import { Innertube } from 'youtubei.js';

const PORT = process.env.STREAM_PORT ? parseInt(process.env.STREAM_PORT, 10) : 3001;
const bufferCache = new Map();
const urlCache = new Map();

let ytInstance = null;
async function getTube() {
  if (!ytInstance) {
    ytInstance = await Innertube.create();
  }
  return ytInstance;
}

async function resolveAudioUrl(id) {
  const hit = urlCache.get(id);
  if (hit && hit.exp > Date.now()) return hit.url;

  const yt = await getTube();
  const clients = ['IOS', 'ANDROID', 'YTMUSIC', 'WEB'];

  for (const client of clients) {
    try {
      const info = await yt.getBasicInfo(id, { client });
      const format =
        info.chooseFormat({ type: 'audio' }) ||
        info.chooseFormat({ type: 'audio', quality: 'best' }) ||
        info.chooseFormat({ type: 'audio', format: 'mp4' }) ||
        info.streaming_data?.adaptive_formats?.find(f => (f.mime_type || '').startsWith('audio/')) ||
        info.streaming_data?.formats?.find(f => (f.mime_type || '').startsWith('audio/') || f.has_audio);

      if (format?.url) {
        urlCache.set(id, { url: format.url, exp: Date.now() + 60 * 60_000 });
        return format.url;
      }
      if (format && typeof format.decipher === 'function') {
        const u = await format.decipher(yt.session.player);
        if (u) {
          urlCache.set(id, { url: u, exp: Date.now() + 60 * 60_000 });
          return u;
        }
      }
    } catch {
      /* continue */
    }
  }
  return null;
}

async function getAudioBuffer(id) {
  const cached = bufferCache.get(id);
  if (cached && cached.exp > Date.now()) return cached;

  const url = await resolveAudioUrl(id);
  if (!url) return null;

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15',
      },
    });
    if (!res.ok) return null;
    const arrayBuf = await res.arrayBuffer();
    const buf = Buffer.from(arrayBuf);
    const contentType = res.headers.get('content-type') || 'audio/mp4';
    const entry = {
      buffer: buf,
      contentType,
      length: buf.length,
      exp: Date.now() + 120 * 60_000,
    };
    bufferCache.set(id, entry);
    // Trim cache to max 20 songs
    if (bufferCache.size > 20) {
      const oldest = bufferCache.keys().next().value;
      if (oldest) bufferCache.delete(oldest);
    }
    return entry;
  } catch (err) {
    console.error('[getAudioBuffer error]', id, err);
    return null;
  }
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Range, Accept, Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, 'http://' + (req.headers.host || 'localhost'));
  const id = url.searchParams.get('v') || '';

  if (url.pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', port: PORT, cacheSize: bufferCache.size, time: Date.now() }));
    return;
  }

  if (url.pathname === '/api/play') {
    if (!/^[\w-]{11}$/.test(id)) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ url: null }));
      return;
    }
    const audioUrl = await resolveAudioUrl(id).catch(() => null);
    res.writeHead(audioUrl ? 200 : 404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ url: audioUrl }));
    return;
  }

  if (url.pathname === '/api/stream') {
    if (!/^[\w-]{11}$/.test(id)) {
      res.writeHead(400);
      res.end('Bad request');
      return;
    }

    const audioEntry = await getAudioBuffer(id);
    if (!audioEntry) {
      // Fallback to direct redirect if buffering failed
      const directUrl = await resolveAudioUrl(id);
      if (directUrl) {
        res.writeHead(302, { Location: directUrl });
        res.end();
        return;
      }
      res.writeHead(404);
      res.end('No stream found');
      return;
    }

    const { buffer, contentType, length } = audioEntry;
    const rangeHeader = req.headers.range;

    if (rangeHeader) {
      const parts = rangeHeader.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10) || 0;
      const end = parts[1] ? parseInt(parts[1], 10) : length - 1;
      const chunkSize = end - start + 1;

      res.writeHead(206, {
        'Content-Range': 'bytes ' + start + '-' + end + '/' + length,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, immutable',
        'Access-Control-Allow-Origin': '*',
      });
      res.end(buffer.subarray(start, end + 1));
    } else {
      res.writeHead(200, {
        'Content-Length': length,
        'Content-Type': contentType,
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=86400, immutable',
        'Access-Control-Allow-Origin': '*',
      });
      res.end(buffer);
    }
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('[Flow Turbo Audio Server] Running on http://0.0.0.0:' + PORT);
});
