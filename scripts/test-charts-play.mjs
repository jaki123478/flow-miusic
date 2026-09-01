import { chromium } from 'playwright';

async function run() {
  console.log('Launching browser test...');
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

  console.log('Opening https://flow-music-app-two.vercel.app/charts ...');
  await page.goto('https://flow-music-app-two.vercel.app/charts', { waitUntil: 'networkidle', timeout: 30000 });

  // Click on the first track row
  console.log('Clicking on first track in charts...');
  const trackBtn = page.locator('button').filter({ hasText: /1/ }).first();
  await trackBtn.click();
  console.log('Clicked track!');

  // Monitor playback for 8s
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
      console.log(`>>> SUCCESS: Audio playing at ${audioState.currentTime.toFixed(2)}s / ${audioState.duration}s! <<<`);
      break;
    }
  }

  await browser.close();
}

run().catch(console.error);
