async function testMobile() {
  const urls = [
    'https://flow-music-app-two.vercel.app/',
    'https://flow-music-app-two.vercel.app/charts',
    'https://flow-music-app-two.vercel.app/radio',
    'https://flow-music-app-two.vercel.app/api/auth/get-session',
    'https://flow-music-app-two.vercel.app/_server?_serverFnId=src_lib_music_catalog_ts_getHomeFeed',
  ];

  const headers = {
    'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Mobile/15E148 Safari/604.1',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
  };

  for (const u of urls) {
    try {
      const res = await fetch(u, { headers });
      const text = await res.text();
      console.log('URL ' + u + ' -> Status: ' + res.status + ', Type: ' + res.headers.get('content-type') + ', Snippet: ' + text.substring(0, 100).replace(/\n/g, ' '));
    } catch (e) {
      console.log('URL ' + u + ' -> FETCH ERROR: ' + e.message);
    }
  }
}

testMobile().catch(console.error);
