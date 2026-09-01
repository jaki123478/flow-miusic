async function testResolvers(id) {
  console.log('Testing video:', id);

  // Test 1: Invidious public instances list
  try {
    const invListRes = await fetch('https://api.invidious.io/instances.json?sort_by=health', { signal: AbortSignal.timeout(5000) });
    const instances = await invListRes.json();
    console.log('Fetched invidious instances count:', instances.length);
    
    // Filter healthy instances with api enabled
    const working = instances.filter(i => i[1]?.type === 'https' && i[1]?.api === true && i[1]?.health && parseFloat(i[1]?.health) > 90);
    console.log('Healthy HTTPS API instances:', working.length);

    for (const [domain, info] of working.slice(0, 8)) {
      try {
        const testUrl = info.uri + '/api/v1/videos/' + id;
        console.log('Trying instance:', domain, testUrl);
        const start = Date.now();
        const res = await fetch(testUrl, { signal: AbortSignal.timeout(4000) });
        if (res.ok) {
          const data = await res.json();
          const audioFormats = (data.adaptiveFormats || []).filter(f => (f.type || f.mimeType || '').startsWith('audio/'));
          console.log('-> ' + domain + ' SUCCESS in ' + (Date.now() - start) + 'ms! Found ' + audioFormats.length + ' audio streams.');
          if (audioFormats.length > 0) {
            console.log('Sample audio URL:', audioFormats[0].url.substring(0, 80));
            // Test if audio URL can be fetched
            const audioFetch = await fetch(audioFormats[0].url, {
              headers: { 'Range': 'bytes=0-1024', 'User-Agent': 'Mozilla/5.0' },
              signal: AbortSignal.timeout(4000)
            });
            console.log('Audio stream fetch status:', audioFetch.status, audioFetch.headers.get('content-type'));
            break;
          }
        } else {
          console.log('-> ' + domain + ' status:', res.status);
        }
      } catch (e) {
        console.log('-> ' + domain + ' error:', e.message);
      }
    }
  } catch (e) {
    console.error('Invidious list error:', e.message);
  }
}

testResolvers('dQw4w9WgXcQ').catch(console.error);
