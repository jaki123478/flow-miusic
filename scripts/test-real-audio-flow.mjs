import { chromium } from 'playwright';

async function runTest() {
  console.log('=== STARTING AUTOMATED REAL-DEVICE PLAYBACK TEST ===');
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: [
      '--autoplay-policy=no-user-gesture-required',
      '--no-sandbox',
      '--disable-web-security',
      '--use-fake-ui-for-media-stream',
    ],
  });

  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Mobile/15E148 Safari/604.1',
    hasTouch: true,
  });

  const page = await context.newPage();

  const networkLogs = [];
  page.on('request', req => {
    if (req.url().includes('/api/') || req.url().includes('googlevideo') || req.url().includes('youtube')) {
      networkLogs.push('[REQ] ' + req.method() + ' ' + req.url().substring(0, 80));
    }
  });

  page.on('response', async res => {
    if (res.url().includes('/api/') || res.url().includes('googlevideo')) {
      networkLogs.push('[RES] ' + res.status() + ' ' + res.url().substring(0, 80) + ' Type: ' + res.headers()['content-type']);
    }
  });

  page.on('console', msg => console.log('[BROWSER CONSOLE]', msg.type(), msg.text()));
  page.on('pageerror', err => console.error('[PAGE ERROR]', err.message));

  console.log('1. Loading https://flow-music-app-two.vercel.app ...');
  const res = await page.goto('https://flow-music-app-two.vercel.app', { waitUntil: 'networkidle', timeout: 30000 });
  console.log('Page loaded with status:', res.status());

  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'screenshots/test_step1_home.png' });

  console.log('2. Clicking first song on home...');
  const firstTrackBtn = page.locator('main button, main a').filter({ hasText: 'Infinity' }).first();
  const exists = await firstTrackBtn.count();
  console.log('Infinity track found:', exists > 0);
  if (exists > 0) {
    await firstTrackBtn.click();
  } else {
    // Click any track
    await page.locator('.grid button, main .grid > *').first().click();
  }

  console.log('3. Monitoring audio playback for 8 seconds...');
  for (let s = 1; s <= 8; s++) {
    await page.waitForTimeout(1000);
    const audioState = await page.evaluate(() => {
      const audio = document.querySelector('audio');
      const win = window;
      const store = win.__FLOW_STORE__ || null;
      return {
        audioSrc: audio ? audio.src.substring(0, 80) : null,
        audioPaused: audio ? audio.paused : null,
        audioCurrentTime: audio ? audio.currentTime : null,
        audioDuration: audio ? audio.duration : null,
        audioError: audio?.error ? { code: audio.error.code, message: audio.error.message } : null,
        renderedTime: Array.from(document.querySelectorAll('span, p, div')).map(e => e.textContent?.trim()).filter(t => /^\d+:\d{2}$/.test(t || ''))
      };
    });
    console.log('[T+' + s + 's] State: ' + JSON.stringify(audioState));
  }

  await page.screenshot({ path: 'screenshots/test_step2_playing.png' });

  console.log('4. Simulating background / screen locked (visibilityState: hidden)...');
  await page.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', { value: 'hidden', writable: true });
    Object.defineProperty(document, 'hidden', { value: true, writable: true });
    document.dispatchEvent(new Event('visibilitychange'));
  });

  console.log('5. Monitoring in background for 5 seconds...');
  for (let s = 1; s <= 5; s++) {
    await page.waitForTimeout(1000);
    const bgState = await page.evaluate(() => {
      const audio = document.querySelector('audio');
      return {
        audioPaused: audio ? audio.paused : null,
        audioCurrentTime: audio ? audio.currentTime : null,
      };
    });
    console.log('[BG+' + s + 's] State: ' + JSON.stringify(bgState));
  }

  console.log('=== NETWORK ACTIVITY SUMMARY ===');
  networkLogs.forEach(l => console.log(l));

  await browser.close();
  console.log('=== TEST COMPLETED ===');
}

runTest().catch(console.error);
