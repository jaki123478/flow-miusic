const base = 'https://flow-music-app-two.vercel.app';
const paths = [
  '/',
  '/explore',
  '/search',
  '/radio',
  '/library',
  '/charts',
  '/discover',
  '/fresh',
  '/mix',
  '/settings',
  '/api/stream?v=dQw4w9WgXcQ',
  '/api/play?v=dQw4w9WgXcQ'
];

async function check() {
  for (const p of paths) {
    try {
      const res = await fetch(base + p, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      const text = await res.text();
      const is500 = res.status === 500 || text.includes('status\":500');
      console.log(res.status, p, is500 ? '--> ERROR: ' + text.substring(0, 100) : 'OK (' + text.length + ' bytes)');
    } catch (e) {
      console.log('FETCH ERR', p, e.message);
    }
  }
}
check();
