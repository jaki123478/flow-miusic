import { Innertube, UniversalCache } from 'youtubei.js';

async function test() {
  const yt = await Innertube.create({
    cache: new UniversalCache(false),
    generate_session_locally: true,
    lang: 'it',
    location: 'IT',
  });
  const info = await yt.getInfo('WMK3JXG3Fx0');
  const format = info.chooseFormat({ type: 'audio', quality: 'best' });
  console.log('Deciphering format...');
  const url = await format.decipher(yt.session.player);
  console.log('Deciphered URL:', url.substring(0, 80));
}
test().catch(console.error);
