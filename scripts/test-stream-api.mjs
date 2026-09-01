async function testApi() {
  const url = 'https://flow-music-app-two.vercel.app/api/stream?v=ZqSlV5LmrTg&src=1';
  console.log('Testing endpoint:', url);
  const res = await fetch(url);
  console.log('Status:', res.status);
  const data = await res.json();
  console.log('Response:', data);
}
testApi().catch(console.error);
