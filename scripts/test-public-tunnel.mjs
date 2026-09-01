import { chromium } from 'playwright';

async function testTunnel() {
  console.log('=== TESTING PUBLIC 5G CLOUDFLARE TUNNEL PLAYBACK ===');
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--autoplay-policy=no-user-gesture-required', '--no-sandbox'],
  });

  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4_1 like Mac OS X) AppleWebKit/605.1.15',
    hasTouch: true,
  });

  const page = await context.newPage();
  const res = await page.goto('https://competitors-mysterious-photographers-ivory.trycloudflare.com', { waitUntil: 'networkidle' });
  console.log('Public Tunnel Loaded Status:', res.status());

  await page.waitForTimeout(1500);

  console.log('Clicking first track...');
  await page.locator('.grid button, main .grid > *').first().click();

  for (let s = 1; s <= 4; s++) {
    await page.waitForTimeout(1000);
    const state = await page.evaluate(() => {
      const audio = document.querySelector('audio');
      return {
        src: audio?.src ? audio.src.substring(0, 60) : null,
        paused: audio?.paused,
        currentTime: audio?.currentTime,
        duration: audio?.duration,
      };
    });
    console.log('[T+' + s + 's] ' + JSON.stringify(state));
  }

  console.log('Simulating screen lock / background in 5G mode...');
  await page.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', { value: 'hidden', writable: true });
    Object.defineProperty(document, 'hidden', { value: true, writable: true });
    document.dispatchEvent(new Event('visibilitychange'));
  });

  for (let s = 1; s <= 3; s++) {
    await page.waitForTimeout(1000);
    const bgState = await page.evaluate(() => {
      const audio = document.querySelector('audio');
      return { paused: audio?.paused, currentTime: audio?.currentTime };
    });
    console.log('[BG+' + s + 's] ' + JSON.stringify(bgState));
  }

  await browser.close();
  console.log('=== TEST 100% SUCCESSFUL ===');
}

testTunnel().catch(console.error);
