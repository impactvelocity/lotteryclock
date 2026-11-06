// Renders scenes/index.html frame by frame: node capture-scenes.mjs <startSec> <endSec> [--every K] [--workers N]
import puppeteer from 'puppeteer-core';
import { globSync, mkdirSync, writeFileSync } from 'node:fs';
const FPS = 30;
const a = +process.argv[2], b = +process.argv[3];
const opt = (k, d) => (process.argv.includes(k) ? +process.argv[process.argv.indexOf(k) + 1] : d);
const every = opt('--every', 1), workers = opt('--workers', 4);
const out = new URL('./scenes/frames/', import.meta.url).pathname;
mkdirSync(out, { recursive: true });
const exe = globSync(process.env.HOME + '/.cache/puppeteer/chrome/mac_arm-*/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing')[0];
const browser = await puppeteer.launch({ executablePath: exe, headless: true, protocolTimeout: 60000, args: ['--hide-scrollbars', '--force-color-profile=srgb', '--allow-file-access-from-files'] });
const frames = [];
for (let f = Math.round(a * FPS); f <= Math.round(b * FPS); f += every) frames.push(f);
let next = 0;
await Promise.all(Array.from({ length: workers }, async () => {
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
  page.on('pageerror', (e) => console.log('[pageerror]', String(e).slice(0, 300)));
  await page.goto('file://' + new URL('./scenes/index.html', import.meta.url).pathname);
  await page.evaluate(() => Promise.race([window.ready, new Promise((r) => setTimeout(r, 5000))]));
  const cdp = await page.createCDPSession();
  while (next < frames.length) {
    const f = frames[next++];
    await page.evaluate((t) => window.render(t), f / FPS);
    const { data } = await cdp.send('Page.captureScreenshot', { format: 'jpeg', quality: 93, optimizeForSpeed: true });
    writeFileSync(`${out}/g${String(f).padStart(5, '0')}.jpg`, Buffer.from(data, 'base64'));
    if (f % 300 === 0) console.log('frame', f);
  }
}));
await browser.close();
console.log('done', frames.length);
