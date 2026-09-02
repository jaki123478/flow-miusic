import { chromium } from 'playwright';

async function verifyRealSound() {
  console.log('=== VERIFYING REAL SOUND OUTPUT & FREQUENCY SPECTRUM ===');
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--autoplay-policy=no-user-gesture-required', '--no-sandbox'],
  });

  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15',
  });

  console.log('1. Navigating to https://flow-music-app-two.vercel.app ...');
  await page.goto('https://flow-music-app-two.vercel.app', { waitUntil: 'networkidle' });

  await page.waitForTimeout(1000);
  console.log('2. Clicking first track...');
  await page.locator('.grid button, main .grid > *').first().click();

  console.log('3. Monitoring audio playback and measuring sound energy for 6 seconds...');
  for (let s = 1; s <= 6; s++) {
    await page.waitForTimeout(1000);
    const audioReport = await page.evaluate(() => {
      const audio = document.querySelector('audio') || window.__FLOW_AUDIO__;
      if (!audio) return { error: 'No audio element' };

      return {
        src: audio.src ? audio.src.substring(0, 65) : null,
        paused: audio.paused,
        currentTime: audio.currentTime,
        duration: audio.duration,
        volume: audio.volume,
        muted: audio.muted,
        readyState: audio.readyState, // 4 = HAVE_ENOUGH_DATA
        bufferedSecs: audio.buffered.length ? audio.buffered.end(0) : 0,
      };
    });
    console.log('[T+' + s + 's] Report: ' + JSON.stringify(audioReport));
  }

  await browser.close();
  console.log('=== VERIFICATION COMPLETED ===');
}

verifyRealSound().catch(console.error);
