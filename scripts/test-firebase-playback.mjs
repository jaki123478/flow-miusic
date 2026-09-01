import { chromium } from 'playwright';

async function testFirebasePlayback() {
  console.log('=== TESTING FIREBASE HOSTING AUDIO PLAYBACK ===');
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--autoplay-policy=no-user-gesture-required', '--no-sandbox'],
  });

  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15',
  });

  const res = await page.goto('https://social-flow-f1aca.web.app', { waitUntil: 'networkidle' });
  console.log('Firebase App Loaded Status:', res.status());

  await page.waitForTimeout(1000);
  console.log('Clicking track...');
  await page.locator('.grid button, main .grid > *').first().click();

  for (let s = 1; s <= 4; s++) {
    await page.waitForTimeout(1000);
    const audioState = await page.evaluate(() => {
      const a = document.querySelector('audio');
      return {
        src: a?.src ? a.src.substring(0, 70) : null,
        currentTime: a?.currentTime,
        paused: a?.paused,
        duration: a?.duration,
      };
    });
    console.log('[T+' + s + 's] ' + JSON.stringify(audioState));
  }

  await browser.close();
  console.log('=== FIREBASE TEST PASSED ===');
}

testFirebasePlayback().catch(console.error);
