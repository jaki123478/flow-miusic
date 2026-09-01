import { Innertube, UniversalCache } from 'youtubei.js';

async function testExtraction(ids) {
  const yt = await Innertube.create({
    cache: new UniversalCache(false),
    generate_session_locally: true,
  });

  for (const id of ids) {
    try {
      const basic = await yt.getBasicInfo(id, { client: 'IOS' });
      const audio =
        basic.chooseFormat({ type: 'audio' }) ||
        basic.streaming_data?.adaptive_formats?.find(f => (f.mime_type || '').startsWith('audio/')) ||
        basic.streaming_data?.formats?.find(f => f.has_audio);
      
      const url = audio?.url || (typeof audio?.decipher === 'function' ? await audio.decipher(yt.session.player) : null);
      console.log(id, '->', url ? 'OK: ' + url.substring(0, 60) + '...' : 'FAILED');
    } catch (e) {
      console.log(id, '-> ERROR:', e.message);
    }
  }
}

testExtraction(['s5gkKLr68Qo', 'WMK3JXG3Fx0', 'ZqSlV5LmrTg', 'dQw4w9WgXcQ', 'kffacxfA7G4', 'H03IbSzl3Lw']).catch(console.error);
