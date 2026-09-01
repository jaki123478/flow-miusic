import { Innertube, UniversalCache } from 'youtubei.js';

async function getAudio(id) {
  const yt = await Innertube.create({
    cache: new UniversalCache(false),
    generate_session_locally: true,
    lang: 'it',
    location: 'IT',
  });

  const clients = ['IOS', 'ANDROID', 'WEB'];
  for (const client of clients) {
    try {
      const info = await yt.getBasicInfo(id, { client });
      const format = info.chooseFormat({ type: 'audio' });
      if (format) {
        if (format.url) return { client, url: format.url };
        if (typeof format.decipher === 'function') {
          const u = await format.decipher(yt.session.player);
          if (u) return { client: client + ' (deciphered)', url: u };
        }
      }
    } catch (e) {
      // try next
    }
  }
  return null;
}

async function main() {
  const ids = ['WMK3JXG3Fx0', 'dQw4w9WgXcQ', 'kffacxfA7G4'];
  for (const id of ids) {
    const res = await getAudio(id);
    console.log(id, '->', res ? res.client + ' : ' + res.url.substring(0, 80) : 'FAILED');
  }
}

main().catch(console.error);
