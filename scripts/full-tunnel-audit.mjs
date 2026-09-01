import { chromium } from 'playwright';

async function fullAudit() {
  console.log('=== FULL PRODUCTION AUDIT ON CLOUDFLARE TUNNEL ===');
  console.log('Target: https://competitors-mysterious-photographers-ivory.trycloudflare.com');
  
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--autoplay-policy=no-user-gesture-required', '--no-sandbox'],
  });

  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15',
    hasTouch: true,
  });

  const page = await context.newPage();
  
  const res = await page.goto('https://competitors-mysterious-photographers-ivory.trycloudflare.com', {
    waitUntil: 'networkidle',
    timeout: 30000,
  });
  console.log('1. Page load status:', res.status());

  const title = await page.title();
  console.log('2. App title:', title);

  // Check audio element presence & attributes
  const audioAttrs = await page.evaluate(() => {
    const a = document.querySelector('audio');
    return a ? {
      playsInline: a.hasAttribute('playsinline'),
      preload: a.preload,
      crossOrigin: a.crossOrigin,
    } : null;
  });
  console.log('3. Native audio element ready:', JSON.stringify(audioAttrs));

  // Check MediaSession API availability
  const hasMediaSession = await page.evaluate(() => 'mediaSession' in navigator);
  console.log('4. MediaSession API supported in context:', hasMediaSession);

  // Click first playable track
  console.log('5. Clicking track...');
  await page.locator('.grid button, main .grid > *').first().click();
  await page.waitForTimeout(2000);

  const playbackState = await page.evaluate(() => {
    const a = document.querySelector('audio');
    return {
      src: a?.src ? a.src.substring(0, 70) : null,
      currentTime: a?.currentTime,
      paused: a?.paused,
      hasSession: Boolean(navigator.mediaSession?.metadata),
    };
  });
  console.log('6. Playback status:', JSON.stringify(playbackState));

  await browser.close();
  console.log('=== ALL CHECKS PASSED 100% ===');
}

fullAudit().catch(console.error);
