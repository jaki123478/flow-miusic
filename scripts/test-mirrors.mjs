async function testMirrors(id) {
  const apis = [
    { name: 'cobalt', url: 'https://api.cobalt.tools', fn: async () => {
      const res = await fetch('https://api.cobalt.tools', {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: 'https://www.youtube.com/watch?v=' + id, downloadMode: 'audio' }),
        signal: AbortSignal.timeout(4000)
      });
      const d = await res.json();
      return d.url || d.streamUrl;
    }},
    { name: 'piped-kavin', url: 'https://pipedapi.kavin.rocks/streams/' + id, fn: async () => {
      const res = await fetch('https://pipedapi.kavin.rocks/streams/' + id, { signal: AbortSignal.timeout(3500) });
      const d = await res.json();
      const s = d.audioStreams || d.adaptiveFormats;
      return s?.[0]?.url;
    }},
    { name: 'piped-coffee', url: 'https://api.piped.private.coffee/streams/' + id, fn: async () => {
      const res = await fetch('https://api.piped.private.coffee/streams/' + id, { signal: AbortSignal.timeout(3500) });
      const d = await res.json();
      const s = d.audioStreams || d.adaptiveFormats;
      return s?.[0]?.url;
    }},
    { name: 'invidious-nerdvpn', url: 'https://invidious.nerdvpn.de/api/v1/videos/' + id, fn: async () => {
      const res = await fetch('https://invidious.nerdvpn.de/api/v1/videos/' + id, { signal: AbortSignal.timeout(3500) });
      const d = await res.json();
      const s = (d.adaptiveFormats || []).filter(f => (f.type || f.mimeType || '').startsWith('audio'));
      return s?.[0]?.url;
    }},
    { name: 'invidious-nadeko', url: 'https://inv.nadeko.net/api/v1/videos/' + id, fn: async () => {
      const res = await fetch('https://inv.nadeko.net/api/v1/videos/' + id, { signal: AbortSignal.timeout(3500) });
      const d = await res.json();
      const s = (d.adaptiveFormats || []).filter(f => (f.type || f.mimeType || '').startsWith('audio'));
      return s?.[0]?.url;
    }}
  ];

  for (const api of apis) {
    try {
      const start = Date.now();
      const url = await api.fn();
      console.log(api.name, '-> OK in', Date.now() - start, 'ms, url:', url ? url.substring(0, 60) : 'null');
    } catch (e) {
      console.log(api.name, '-> ERROR:', e.message);
    }
  }
}

testMirrors('ZqSlV5LmrTg').catch(console.error);
