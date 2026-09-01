async function test() {
  const ids = ['dQw4w9WgXcQ', 'WMK3JXG3Fx0', '4eyU67wF_q8'];
  for (const id of ids) {
    const res = await fetch('https://flow-music-app-two.vercel.app/api/play?v=' + id);
    const data = await res.json();
    console.log('ID ' + id + ': status=' + res.status + ', url=' + (data.url ? 'SUCCESS (direct audio stream)' : 'null'));
  }
}
test().catch(console.error);
