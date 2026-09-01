import { Innertube } from 'youtubei.js';

async function testPlayerApi(id) {
  // Test raw YouTube player API endpoint
  const body = {
    context: {
      client: {
        clientName: 'IOS',
        clientVersion: '19.45.4',
        deviceMake: 'Apple',
        deviceModel: 'iPhone16,2',
        osName: 'iOS',
        osVersion: '17.5.1.21F90',
        hl: 'it',
        gl: 'IT',
      }
    },
    videoId: id,
    playbackContext: {
      contentPlaybackContext: {
        html5Preference: 'HTML5_PREF_WANTS',
      }
    },
    contentCheckOk: true,
    racyCheckOk: true,
  };

  console.log('Sending raw player request...');
  const res = await fetch('https://www.youtube.com/youtubei/v1/player?prettyPrint=false', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'com.google.ios.youtube/19.45.4 (iPhone16,2; U; CPU iOS 17_5_1 like Mac OS X; it_IT)',
      'X-YouTube-Client-Name': '5',
      'X-YouTube-Client-Version': '19.45.4',
    },
    body: JSON.stringify(body),
  });

  console.log('Status:', res.status);
  const data = await res.json();
  console.log('playabilityStatus:', data.playabilityStatus?.status, data.playabilityStatus?.reason);
  const streamingData = data.streamingData;
  console.log('adaptiveFormats count:', streamingData?.adaptiveFormats?.length || 0);
  if (streamingData?.adaptiveFormats) {
    const audioFormats = streamingData.adaptiveFormats.filter(f => f.mimeType?.startsWith('audio/'));
    console.log('audioFormats count:', audioFormats.length);
    if (audioFormats[0]) {
      console.log('Sample format:', audioFormats[0].mimeType, 'url:', audioFormats[0].url ? audioFormats[0].url.substring(0, 80) : 'cipher: ' + !!audioFormats[0].signatureCipher);
    }
  }
}

testPlayerApi('dQw4w9WgXcQ').catch(console.error);
