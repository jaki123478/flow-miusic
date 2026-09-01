import { Innertube, UniversalCache } from 'youtubei.js';

async function testSingle(id) {
  const yt = await Innertube.create({
    cache: new UniversalCache(false),
    generate_session_locally: true,
    lang: 'it',
    location: 'IT',
  });

  console.log('Testing ID:', id);
  try {
    const basic = await yt.getBasicInfo(id, { client: 'IOS' });
    console.log('IOS Basic formats count:', basic.streaming_data?.adaptive_formats?.length || 0);
    const f = basic.chooseFormat({ type: 'audio' });
    console.log('IOS format url:', f?.url ? 'FOUND' : 'NOT FOUND');
  } catch (e) {
    console.error('IOS error:', e.message);
  }

  try {
    const basicAnd = await yt.getBasicInfo(id, { client: 'ANDROID' });
    console.log('ANDROID Basic formats count:', basicAnd.streaming_data?.adaptive_formats?.length || 0);
    const f = basicAnd.chooseFormat({ type: 'audio' });
    console.log('ANDROID format url:', f?.url ? 'FOUND' : 'NOT FOUND');
  } catch (e) {
    console.error('ANDROID error:', e.message);
  }
}

testSingle('ZqSlV5LmrTg').catch(console.error);
