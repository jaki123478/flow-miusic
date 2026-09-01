import { Innertube, UniversalCache } from 'youtubei.js';

async function debugSong(id) {
  const yt = await Innertube.create({
    cache: new UniversalCache(false),
    generate_session_locally: true,
  });

  console.log('Testing video:', id);
  try {
    const basic = await yt.getBasicInfo(id, { client: 'IOS' });
    console.log('IOS Basic status:', basic.basic_info.title);
    const f = basic.chooseFormat({ type: 'audio' });
    console.log('IOS format url:', f?.url ? 'YES' : 'NO');
  } catch (e) {
    console.error('IOS error:', e.message);
  }

  try {
    const basicWeb = await yt.getBasicInfo(id, { client: 'WEB' });
    console.log('WEB Basic status:', basicWeb.basic_info.title);
    const f = basicWeb.chooseFormat({ type: 'audio' });
    console.log('WEB format url:', f?.url ? 'YES' : 'NO (cipher)');
    if (f && typeof f.decipher === 'function') {
      const u = await f.decipher(yt.session.player);
      console.log('WEB deciphered url:', u ? 'YES: ' + u.substring(0, 60) : 'NO');
    }
  } catch (e) {
    console.error('WEB error:', e.message);
  }

  try {
    const info = await yt.getInfo(id);
    console.log('Full getInfo title:', info.basic_info.title);
    const f = info.chooseFormat({ type: 'audio' });
    console.log('Full getInfo audio format:', f?.url ? 'YES' : 'NO');
    if (f && typeof f.decipher === 'function') {
      const u = await f.decipher(yt.session.player);
      console.log('Full getInfo deciphered:', u ? 'YES' : 'NO');
    }
  } catch (e) {
    console.error('Full getInfo error:', e.message);
  }
}

debugSong('s5gkKLr68Qo').catch(console.error);
