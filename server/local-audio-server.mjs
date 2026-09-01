import http from 'node:http';
import { Innertube } from 'youtubei.js';

const PORT = process.env.STREAM_PORT ? parseInt(process.env.STREAM_PORT, 10) : 3001;
const cache = new Map();

let ytInstance = null;
async function getTube() {
  if (!ytInstance) {
    ytInstance = await Innertube.create();
  }
  return ytInstance;
}

async function resolveAudioUrl(id) {
  const hit = cache.get(id);
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
        cache.set(id, { url: format.url, exp: Date.now() + 15 * 60_000 });
        return format.url;
      }
      if (format && typeof format.decipher === 'function') {
        const u = await format.decipher(yt.session.player);
        if (u) {
          cache.set(id, { url: u, exp: Date.now() + 15 * 60_000 });
          return u;
        }
      }
    } catch {
      /* continue */
    }
  }
  return null;
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
    res.end(JSON.stringify({ status: 'ok', port: PORT, time: Date.now() }));
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

    const target = await resolveAudioUrl(id).catch(() => null);
    if (!target) {
      res.writeHead(404);
      res.end('No stream found');
      return;
    }

    try {
      const range = req.headers['range'] || 'bytes=0-';
      const upstream = await fetch(target, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15',
          Range: range,
        },
      });

      const resHeaders = {
        'Content-Type': upstream.headers.get('content-type') || 'audio/mp4',
        'Accept-Ranges': 'bytes',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=3600',
      };

      const cr = upstream.headers.get('content-range');
      if (cr) resHeaders['Content-Range'] = cr;

      const cl = upstream.headers.get('content-length');
      if (cl) resHeaders['Content-Length'] = cl;

      res.writeHead(upstream.status, resHeaders);

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
    } catch (e) {
      console.error('[stream proxy error]', e);
      res.writeHead(302, { Location: target });
      res.end();
    }
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('[Flow Audio Server] Running on http://0.0.0.0:' + PORT);
});
