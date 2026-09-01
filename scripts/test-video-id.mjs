import { Innertube, UniversalCache } from 'youtubei.js';

async function testVideo(id) {
  console.log('Testing video:', id);
  try {
    const yt = await Innertube.create({
      cache: new UniversalCache(false),
      generate_session_locally: true,
      lang: 'it',
      location: 'IT',
    });
    console.log('Created Innertube instance');
    try {
      const basic = await yt.getBasicInfo(id, { client: 'IOS' });
      const format = basic.chooseFormat({ type: 'audio' });
      console.log('IOS Basic format:', format ? format.url ? 'has url' : 'no direct url (has decipher?)' : 'null');
      if (format) {
        console.log('Format keys:', Object.keys(format));
        console.log('Decipher url method:', typeof format.decipher);
      }
    } catch (e) {
      console.error('IOS Basic error:', e.message);
    }

    try {
      const info = await yt.getInfo(id);
      const format = info.chooseFormat({ type: 'audio' });
      console.log('Web info format:', format ? format.url ? 'has url' : 'needs decipher' : 'null');
      if (format && typeof format.decipher === 'function') {
        const url = await format.decipher(yt.session.player);
        console.log('Deciphered url:', url.substring(0, 100));
      }
    } catch (e) {
      console.error('Web info error:', e.message);
    }
  } catch (e) {
    console.error('Innertube init error:', e.message);
  }
}

testVideo('WMK3JXG3Fx0').catch(console.error);
