import { chromium } from 'playwright';

async function run() {
  console.log('Testing iPhone viewport on production...');
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--autoplay-policy=no-user-gesture-required', '--no-sandbox'],
  });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Mobile/15E148 Safari/604.1',
  });
  const page = await context.newPage();

  page.on('console', msg => console.log('[IPHONE CONSOLE]', msg.type(), msg.text()));
  page.on('pageerror', err => console.error('[IPHONE ERROR]', err.message));

  console.log('Navigating to https://flow-music-app-two.vercel.app ...');
  const res = await page.goto('https://flow-music-app-two.vercel.app', { waitUntil: 'networkidle', timeout: 30000 });
  console.log('Page HTTP Status:', res.status());

  // Click on the first interactive track tile
  const tile = page.locator('.grid button, .grid a, main button').first();
  await tile.click();
  console.log('Clicked first track!');

  for (let s = 1; s <= 4; s++) {
    await page.waitForTimeout(1000);
    const timers = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('span, div, p')).map(e => e.textContent?.trim()).filter(t => /^\d+:\d{2}$/.test(t || ''));
    });
    console.log(`[T+${s}s] Timers:`, JSON.stringify(timers));
  }

  await page.screenshot({ path: 'screenshots/06_iphone_final.png' });
  console.log('Saved screenshots/06_iphone_final.png');
  await browser.close();
}

run().catch(console.error);
