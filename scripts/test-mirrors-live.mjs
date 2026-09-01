async function testInvidious() {
  const mirrors = [
    'https://yt.artemislena.eu',
    'https://invidious.jing.rocks',
    'https://inv.tux.pizza',
    'https://invidious.drgns.space',
    'https://invidious.privacydev.net',
    'https://vid.priv.au',
    'https://iv.ggtyler.dev',
    'https://invidious.asir.dev',
    'https://invidious.projectsegfau.lt',
  ];

  const id = '4mQyEqbaUOU';
  for (const mirror of mirrors) {
    try {
      const start = Date.now();
      const res = await fetch(mirror + '/api/v1/videos/' + id, {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(3000)
      });
      if (res.ok) {
        const data = await res.json();
        const audios = (data.adaptiveFormats || []).filter(f => (f.type || f.mimeType || '').startsWith('audio/'));
        console.log('Mirror ' + mirror + ' -> SUCCESS in ' + (Date.now() - start) + 'ms! Audios:', audios.length);
        if (audios[0]?.url) {
          console.log('Sample audio url:', audios[0].url.substring(0, 60));
        }
      } else {
        console.log('Mirror ' + mirror + ' -> status ' + res.status);
      }
    } catch (e) {
      console.log('Mirror ' + mirror + ' -> ' + e.message);
    }
  }
}

testInvidious().catch(console.error);
