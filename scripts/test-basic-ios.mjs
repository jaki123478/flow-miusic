import { Innertube, UniversalCache } from 'youtubei.js';

async function test() {
  const yt = await Innertube.create({
    cache: new UniversalCache(false),
    generate_session_locally: true,
  });
  console.log('Testing getBasicInfo for fcnDmrtj6Sk...');
  try {
    const basic = await yt.getBasicInfo('fcnDmrtj6Sk', { client: 'IOS' });
    console.log('basic.streaming_data formats:', basic.streaming_data?.adaptive_formats?.length);
    const format = basic.chooseFormat({ type: 'audio' });
    console.log('basic format url:', format?.url ? 'DIRECT URL' : 'NO URL');
  } catch (err) {
    console.error('getBasicInfo failed:', err.message);
  }
}
test().catch(console.error);
