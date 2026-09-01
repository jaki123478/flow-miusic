import { Innertube, UniversalCache } from 'youtubei.js';

async function test() {
  const yt = await Innertube.create({
    cache: new UniversalCache(false),
    generate_session_locally: true,
  });
  const info = await yt.getInfo('ZqSlV5LmrTg', { client: 'IOS' });
  const format = info.chooseFormat({ type: 'audio', quality: 'best' });
  console.log('Full format URL:', format.url);

  // Test downloading first 100 bytes of the audio stream
  console.log('Fetching range bytes 0-100 from format.url...');
  const res = await fetch(format.url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
      'Range': 'bytes=0-100',
    }
  });
  console.log('Stream response status:', res.status, 'Content-Length:', res.headers.get('content-length'), 'Content-Type:', res.headers.get('content-type'));
}

test().catch(console.error);
