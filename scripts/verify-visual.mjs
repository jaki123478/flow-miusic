import { chromium } from 'playwright';

async function run() {
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

  console.log('Opening https://flow-music-app-two.vercel.app ...');
  await page.goto('https://flow-music-app-two.vercel.app', { waitUntil: 'networkidle', timeout: 30000 });
  await page.screenshot({ path: 'screenshots/01_mobile_home.png' });
  console.log('Captured screenshots/01_mobile_home.png');

  // Open Radio tab
  await page.goto('https://flow-music-app-two.vercel.app/radio', { waitUntil: 'networkidle', timeout: 30000 });
  await page.screenshot({ path: 'screenshots/02_mobile_radio.png' });
  console.log('Captured screenshots/02_mobile_radio.png');

  // Open Explore tab
  await page.goto('https://flow-music-app-two.vercel.app/explore', { waitUntil: 'networkidle', timeout: 30000 });
  await page.screenshot({ path: 'screenshots/03_mobile_explore.png' });
  console.log('Captured screenshots/03_mobile_explore.png');

  // Open Search tab
  await page.goto('https://flow-music-app-two.vercel.app/search', { waitUntil: 'networkidle', timeout: 30000 });
  await page.screenshot({ path: 'screenshots/04_mobile_search.png' });
  console.log('Captured screenshots/04_mobile_search.png');

  await browser.close();
  console.log('All screenshots captured successfully!');
}

run().catch(console.error);
