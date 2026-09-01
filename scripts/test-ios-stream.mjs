import { Innertube, UniversalCache } from 'youtubei.js';

async function testFetchStream(id) {
  const yt = await Innertube.create({
    cache: new UniversalCache(false),
    generate_session_locally: true,
  });

  const basic = await yt.getBasicInfo(id, { client: 'IOS' });
  const format = basic.chooseFormat({ type: 'audio' });
  console.log('Stream URL:', format.url.substring(0, 100) + '...');
  
  const res = await fetch(format.url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
      'Range': 'bytes=0-1024',
    }
  });

  console.log('Upstream status:', res.status);
  console.log('Upstream content-range:', res.headers.get('content-range'));
  console.log('Upstream content-type:', res.headers.get('content-type'));
}

testFetchStream('ZqSlV5LmrTg').catch(console.error);
