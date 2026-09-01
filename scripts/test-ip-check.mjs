async function test() {
  const res = await fetch('https://flow-music-app-two.vercel.app/api/play?v=dQw4w9WgXcQ');
  const data = await res.json();
  console.log('Resolved URL:', data.url ? data.url.substring(0, 100) + '...' : 'null');
  if (data.url) {
    try {
      const audioRes = await fetch(data.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
          'Range': 'bytes=0-1024'
        }
      });
      console.log('Fetch status from local machine:', audioRes.status);
      const text = await audioRes.text();
      console.log('Fetch response preview:', text.substring(0, 200));
    } catch (e) {
      console.error('Fetch error:', e.message);
    }
  }
}
test().catch(console.error);
