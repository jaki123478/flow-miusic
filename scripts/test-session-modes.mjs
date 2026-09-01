import { Innertube, UniversalCache } from 'youtubei.js';

async function testSessionModes() {
  console.log('Testing mode 1: generate_session_locally = false (default)');
  try {
    const yt1 = await Innertube.create({
      cache: new UniversalCache(false),
      generate_session_locally: false,
    });
    const info1 = await yt1.getBasicInfo('4mQyEqbaUOU', { client: 'IOS' });
    console.log('Mode 1 IOS title:', info1.basic_info.title, 'has formats:', !!info1.streaming_data?.adaptive_formats?.length);
  } catch (e) {
    console.error('Mode 1 failed:', e.message);
  }

  console.log('Testing mode 2: standard Innertube.create()');
  try {
    const yt2 = await Innertube.create();
    const info2 = await yt2.getBasicInfo('4mQyEqbaUOU', { client: 'IOS' });
    console.log('Mode 2 IOS title:', info2.basic_info.title, 'has formats:', !!info2.streaming_data?.adaptive_formats?.length);
  } catch (e) {
    console.error('Mode 2 failed:', e.message);
  }
}

testSessionModes().catch(console.error);
