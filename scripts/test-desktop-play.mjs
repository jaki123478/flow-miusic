import { chromium } from 'playwright';

async function run() {
  console.log('Launching browser test on production...');
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--autoplay-policy=no-user-gesture-required', '--no-sandbox'],
  });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });
  const page = await context.newPage();

  page.on('console', msg => console.log('[BROWSER CONSOLE]', msg.type(), msg.text()));
  page.on('pageerror', err => console.error('[BROWSER ERROR]', err.message));

  console.log('Navigating to https://flow-music-app-two.vercel.app ...');
  await page.goto('https://flow-music-app-two.vercel.app', { waitUntil: 'networkidle', timeout: 30000 });

  // Click on the first track button on the homepage
  console.log('Clicking on first track card...');
  const card = page.locator('button').filter({ hasText: 'Infinity' }).first();
  await card.click();
  console.log('Clicked track!');

  // Wait 6 seconds and check progress
  for (let s = 1; s <= 6; s++) {
    await page.waitForTimeout(1000);
    const timeState = await page.evaluate(() => {
      const timeEls = Array.from(document.querySelectorAll('span, div, p')).map(e => e.textContent?.trim()).filter(t => /^\d+:\d{2}$/.test(t || ''));
      return timeEls;
    });
    console.log(`[T+${s}s] Timers found on page:`, JSON.stringify(timeState));
  }

  await page.screenshot({ path: 'screenshots/05_desktop_player_verified.png' });
  console.log('Screenshot saved to screenshots/05_desktop_player_verified.png');
  await browser.close();
}

run().catch(console.error);
