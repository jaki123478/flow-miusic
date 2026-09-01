async function diag(id) {
  console.log('Testing extraction for videoId:', id);

  // Method 1: Direct Android InnerTube player endpoint
  try {
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
        videoId: id,
      }),
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) {
      const json = await res.json();
      const formats = json.streamingData?.adaptiveFormats || [];
      console.log('Direct Android returned formats count:', formats.length, 'first format mimeType:', formats[0]?.mimeType);
      const audioFormat = formats.find(f => (f.mimeType || '').includes('audio') && f.url);
      if (audioFormat?.url) {
        console.log('[SUCCESS] Direct Android player returned URL:', audioFormat.url.substring(0, 60));
        return audioFormat.url;
      }
    }
  } catch (e) {
    console.log('Direct Android failed:', e.message);
  }

  // Method 2: Direct iOS InnerTube player endpoint
  try {
    const res = await fetch('https://www.youtube.com/youtubei/v1/player?prettyPrint=false', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'com.google.ios.youtube/19.29.1 (iPhone14,5; U; CPU iOS 17_5_1 like Mac OS X; it_IT)',
      },
      body: JSON.stringify({
        context: {
          client: {
            clientName: 'IOS',
            clientVersion: '19.29.1',
            deviceMake: 'Apple',
            deviceModel: 'iPhone14,5',
            hl: 'it',
            gl: 'IT',
          },
        },
        videoId: id,
      }),
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) {
      const json = await res.json();
      const formats = json.streamingData?.adaptiveFormats || [];
      console.log('Direct iOS returned formats count:', formats.length, 'first format mimeType:', formats[0]?.mimeType);
      const audioFormat = formats.find(f => (f.mimeType || '').includes('audio') && f.url);
      if (audioFormat?.url) {
        console.log('[SUCCESS] Direct iOS player returned URL:', audioFormat.url.substring(0, 60));
        return audioFormat.url;
      }
    }
  } catch (e) {
    console.log('Direct iOS failed:', e.message);
  }

  // Method 3: Cobalt instance / Piped instances
  const pipedInstances = [
    'https://pipedapi.kavin.rocks',
    'https://api.piped.private.coffee',
    'https://pipedapi.tokhmi.xyz',
    'https://piped.video',
  ];
  for (const inst of pipedInstances) {
    try {
      const res = await fetch(inst + '/streams/' + id, { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        const json = await res.json();
        const audios = json.audioStreams || [];
        if (audios.length && audios[0].url) {
          console.log('[SUCCESS] Piped ' + inst + ' returned audio URL:', audios[0].url.substring(0, 60));
          return audios[0].url;
        }
      }
    } catch (e) {
      console.log('Piped ' + inst + ' failed:', e.message);
    }
  }
}

diag('WMK3JXG3Fx0').catch(console.error);
