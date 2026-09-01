import { Innertube, UniversalCache } from 'youtubei.js';

async function resolve(id) {
  const yt = await Innertube.create({
    cache: new UniversalCache(false),
    generate_session_locally: true,
  });

  try {
    const info = await yt.getInfo(id, { client: 'IOS' });
    const format =
      info.chooseFormat({ type: 'audio', quality: 'best' }) ||
      info.chooseFormat({ type: 'audio', format: 'mp4' }) ||
      info.chooseFormat({ type: 'audio' });
    if (format?.url) return format.url;
  } catch (e) {
    console.log('IOS getInfo failed:', e.message);
  }

  try {
    const basic = await yt.getBasicInfo(id, { client: 'IOS' });
    const format =
      basic.chooseFormat({ type: 'audio', quality: 'best' }) ||
      basic.chooseFormat({ type: 'audio', format: 'mp4' }) ||
      basic.chooseFormat({ type: 'audio' });
    if (format?.url) return format.url;
  } catch (e) {
    console.log('IOS getBasicInfo failed:', e.message);
  }

  return null;
}

async function test() {
  const ids = ['WMK3JXG3Fx0', '4eyU67wF_q8', 'ZqSlV5LmrTg', 'dQw4w9WgXcQ'];
  for (const id of ids) {
    const url = await resolve(id);
    console.log('ID ' + id + ' -> ' + (url ? 'RESOLVED (' + url.substring(0, 40) + '...)' : 'FAILED'));
  }
}

test().catch(console.error);
