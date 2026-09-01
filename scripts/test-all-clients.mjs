import { Innertube, UniversalCache } from 'youtubei.js';

async function test() {
  const yt = await Innertube.create({
    cache: new UniversalCache(false),
    generate_session_locally: true,
  });

  const clients = ['IOS', 'ANDROID', 'YTMUSIC', 'WEB', 'MWEB', 'TV_EMBEDDED', 'WEB_EMBEDDED'];
  for (const client of clients) {
    try {
      const info = await yt.getInfo('WMK3JXG3Fx0', { client });
      const format = info.chooseFormat({ type: 'audio', quality: 'best' });
      console.log('Client ' + client + ': format url = ' + (format?.url ? 'YES (direct)' : 'NO (needs cipher)') + ', status = ' + info.playability_status?.status);
    } catch (e) {
      console.log('Client ' + client + ': ERROR: ' + e.message);
    }
  }
}
test().catch(console.error);
