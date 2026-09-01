async function test() {
  const u = 'https://flow-music-app-two.vercel.app/';
  const headersList = [
    { name: 'No headers', h: {} },
    { name: 'Only User-Agent', h: { 'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4_1 like Mac OS X)' } },
    { name: 'Only Accept', h: { 'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8' } },
    { name: 'Only Accept-Encoding', h: { 'Accept-Encoding': 'gzip, deflate, br' } },
    { name: 'Only Accept-Language', h: { 'Accept-Language': 'it-IT,it;q=0.9' } },
  ];

  for (const item of headersList) {
    const res = await fetch(u, { headers: item.h });
    console.log(item.name + ' -> Status: ' + res.status);
  }
}
test().catch(console.error);
