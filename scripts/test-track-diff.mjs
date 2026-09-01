import { Innertube, UniversalCache } from 'youtubei.js';

async function test() {
  const yt = await Innertube.create({
    cache: new UniversalCache(false),
    generate_session_locally: true,
    lang: 'it',
    location: 'IT',
  });
  console.log('Fetching info for WMK3JXG3Fx0...');
  try {
    const info = await yt.getInfo('WMK3JXG3Fx0');
    console.log('Default getInfo playability_status:', info.playability_status?.status);
    const format = info.chooseFormat({ type: 'audio', quality: 'best' });
    console.log('Format url:', format?.url ? 'Direct URL' : 'Needs decipher');
  } catch (err) {
    console.error('Default error:', err.message);
  }

  try {
    const infoIOS = await yt.getInfo('WMK3JXG3Fx0', { client: 'IOS' });
    console.log('IOS getInfo playability_status:', infoIOS.playability_status?.status);
    const formatIOS = infoIOS.chooseFormat({ type: 'audio', quality: 'best' });
    console.log('IOS Format url:', formatIOS?.url ? 'Direct URL' : 'Needs decipher');
  } catch (err) {
    console.error('IOS error:', err.message);
  }

  try {
    const infoTV = await yt.getInfo('WMK3JXG3Fx0', { client: 'TV_EMBEDDED' });
    console.log('TV_EMBEDDED playability_status:', infoTV.playability_status?.status);
    const formatTV = infoTV.chooseFormat({ type: 'audio', quality: 'best' });
    console.log('TV_EMBEDDED Format url:', formatTV?.url ? 'Direct URL' : 'Needs decipher');
  } catch (err) {
    console.error('TV_EMBEDDED error:', err.message);
  }
}

test().catch(console.error);
