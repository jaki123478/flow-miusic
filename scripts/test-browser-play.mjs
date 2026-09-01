import { chromium } from 'playwright';

async function run() {
  console.log('Launching Chrome browser...');
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--autoplay-policy=no-user-gesture-required', '--no-sandbox'],
  });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
  });
  const page = await context.newPage();

  page.on('console', msg => console.log('[BROWSER CONSOLE]', msg.type(), msg.text()));
  page.on('pageerror', err => console.error('[BROWSER ERROR]', err.message));
  page.on('response', res => {
    if (res.status() >= 400) {
      console.log('[BROWSER HTTP ERROR]', res.status(), res.url());
    }
  });

  console.log('Navigating to https://flow-music-app-two.vercel.app...');
  await page.goto('https://flow-music-app-two.vercel.app', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);

  // Click on the first track button
  console.log('Clicking on first track card...');
  const trackCard = page.locator('button.quick-tile').first();
  await trackCard.click();
  console.log('Clicked track card!');

  // Monitor audio element for 8 seconds
  for (let s = 1; s <= 8; s++) {
    await page.waitForTimeout(1000);
    const audioState = await page.evaluate(() => {
      const audio = document.querySelector('audio');
      if (!audio) return null;
      return {
        currentTime: audio.currentTime,
        duration: audio.duration,
        paused: audio.paused,
        readyState: audio.readyState,
        src: audio.src,
      };
    });
    console.log(`[T+${s}s]`, JSON.stringify(audioState));
    if (audioState && audioState.currentTime > 0) {
      console.log(`\n🎉 SUCCESS! Audio is actively playing at ${audioState.currentTime.toFixed(2)}s (duration: ${audioState.duration}s)! 🎉\n`);
      break;
    }
  }

  await page.screenshot({ path: 'screenshots/03_playback_success.png' });
  await browser.close();
  console.log('Browser test finished!');
}

run().catch(console.error);
