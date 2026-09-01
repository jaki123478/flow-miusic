async function test() {
  const res = await fetch('https://www.youtube.com/youtubei/v1/player?prettyPrint=false', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'com.google.android.youtube/19.29.35 (Linux; U; Android 11) gzip',
    },
    body: JSON.stringify({
      context: {
        client: {
          clientName: 'ANDROID',
          clientVersion: '19.29.35',
          androidSdkVersion: 30,
          hl: 'it',
          gl: 'IT',
        },
      },
      videoId: 'WMK3JXG3Fx0',
    }),
  });
  console.log('Status:', res.status);
  const json = await res.json();
  console.log('playabilityStatus:', JSON.stringify(json.playabilityStatus));
  console.log('streamingData keys:', Object.keys(json.streamingData || {}));
}
test().catch(console.error);
