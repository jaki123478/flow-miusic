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

const SIMPMUSIC_AUDIO_ITAGS = [251, 250, 141, 774];
const SIMPMUSIC_MUXED_FALLBACK_ITAGS = [18];

function formatMime(format) {
  return String(format?.mimeType || format?.mime_type || format?.type || '');
}

function formatItag(format) {
  return Number(format?.itag || 0);
}

function sortByAudioPreference(a, b) {
  const ap = SIMPMUSIC_AUDIO_ITAGS.indexOf(formatItag(a));
  const bp = SIMPMUSIC_AUDIO_ITAGS.indexOf(formatItag(b));
  if (ap !== -1 || bp !== -1) return (ap === -1 ? 999 : ap) - (bp === -1 ? 999 : bp);
  return Number(b?.bitrate || b?.averageBitrate || 0) - Number(a?.bitrate || a?.averageBitrate || 0);
}

function pickPlayableFormat(formats) {
  const playable = formats.filter((f) => f?.url || typeof f?.decipher === 'function');
  const audio = playable
    .filter((f) => formatMime(f).startsWith('audio/') || SIMPMUSIC_AUDIO_ITAGS.includes(formatItag(f)))
    .sort(sortByAudioPreference);
  if (audio[0]) return audio[0];
  return playable.find((f) => SIMPMUSIC_MUXED_FALLBACK_ITAGS.includes(formatItag(f)) || f?.has_audio || f?.hasAudio) || null;
}

async function resolveViaPlayerApi(id) {
  const clients = [
    {
      name: 'IOS',
      num: '5',
      userAgent: 'com.google.ios.youtube/20.11.6 (iPhone16,2; U; CPU iOS 17_5_1 like Mac OS X)',
      context: {
        clientName: 'IOS',
        clientVersion: '20.11.6',
        deviceMake: 'Apple',
        deviceModel: 'iPhone16,2',
        osName: 'iOS',
        osVersion: '17.5.1.21F90',
        platform: 'MOBILE',
        hl: 'it',
        gl: 'IT',
      },
    },
    {
      name: 'ANDROID',
      num: '3',
      userAgent: 'com.google.android.youtube/20.10.36 (Linux; U; Android 14; it_IT) gzip',
      context: {
        clientName: 'ANDROID',
        clientVersion: '20.10.36',
        hl: 'it',
        gl: 'IT',
      },
    },
  ];

  for (const client of clients) {
    try {
      const res = await fetch('https://youtubei.googleapis.com/youtubei/v1/player?prettyPrint=false', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': client.userAgent,
          'X-YouTube-Client-Name': client.num,
          'X-YouTube-Client-Version': client.context.clientVersion,
        },
        body: JSON.stringify({
          videoId: id,
          context: { client: client.context },
          contentCheckOk: true,
          racyCheckOk: true,
        }),
        signal: AbortSignal.timeout(12000),
      });
      if (!res.ok) continue;
      const data = await res.json();
      if (data?.playabilityStatus?.status !== 'OK') continue;
      const picked = pickPlayableFormat([
        ...(data?.streamingData?.adaptiveFormats || []),
        ...(data?.streamingData?.formats || []),
      ]);
      if (picked?.url) return picked.url;
    } catch (err) {
      console.warn('[resolveViaPlayerApi]', client.name, err?.message || err);
    }
  }
  return null;
}

async function resolveAudioUrl(id) {
  const hit = urlCache.get(id);
  if (hit && hit.exp > Date.now()) return hit.url;

  const direct = await resolveViaPlayerApi(id);
  if (direct) {
    urlCache.set(id, { url: direct, exp: Date.now() + 45 * 60_000 });
    return direct;
  }

  let yt = null;
  try {
    yt = await getTube();
  } catch (err) {
    console.error('[resolveAudioUrl init error]', id, err?.message || err);
    ytInstance = null;
    return null;
  }
  const clients = ['IOS', 'ANDROID', 'YTMUSIC', 'WEB'];

  for (const client of clients) {
    try {
      const info = await yt.getBasicInfo(id, { client });
      const format =
        pickPlayableFormat([...(info.streaming_data?.adaptive_formats || []), ...(info.streaming_data?.formats || [])]) ||
        info.chooseFormat({ type: 'audio' }) ||
        info.chooseFormat({ type: 'audio', quality: 'best' }) ||
        info.chooseFormat({ type: 'audio', format: 'mp4' });

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

    const directUrl = await resolveAudioUrl(id);
    if (!directUrl) {
      res.writeHead(404);
      res.end('No stream found');
      return;
    }

    try {
      const upstream = await fetch(directUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15',
          Accept: 'audio/*,*/*',
          ...(req.headers.range ? { Range: req.headers.range } : {}),
        },
        signal: AbortSignal.timeout(25000),
      });

      if (!upstream.ok && upstream.status !== 206) {
        throw new Error('upstream ' + upstream.status);
      }

      const headers = {
        'Content-Type': upstream.headers.get('content-type') || 'audio/mp4',
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=86400',
        'Access-Control-Allow-Origin': '*',
      };
      const contentRange = upstream.headers.get('content-range');
      const contentLength = upstream.headers.get('content-length');
      if (contentRange) headers['Content-Range'] = contentRange;
      if (contentLength) headers['Content-Length'] = contentLength;

      res.writeHead(upstream.status, headers);
      if (!upstream.body || req.method === 'HEAD') {
        res.end();
        return;
      }

      const reader = upstream.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (!res.write(value)) await new Promise((resolve) => res.once('drain', resolve));
      }
      res.end();
    } catch (err) {
      console.error('[stream proxy error]', id, err?.message || err);
      res.writeHead(502);
      res.end('Stream proxy error');
    }
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('[Flow Turbo Audio Server] Running on http://0.0.0.0:' + PORT);
});
