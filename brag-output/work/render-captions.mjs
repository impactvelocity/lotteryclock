// One transparent PNG per caption line, styled in Geist, anchored bottom-centre.
import puppeteer from 'puppeteer-core';
import { globSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
const TL = JSON.parse(readFileSync(new URL('./timeline.json', import.meta.url), 'utf8'));
const out = new URL('./captions/', import.meta.url).pathname;
mkdirSync(out, { recursive: true });
const exe = globSync(process.env.HOME + '/.cache/puppeteer/chrome/mac_arm-*/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing')[0];
const browser = await puppeteer.launch({ executablePath: exe, headless: true, args: ['--force-color-profile=srgb', '--allow-file-access-from-files'] });
const page = await browser.newPage();
await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
const font = new URL('./scenes/assets/Geist-Variable.woff2', import.meta.url).href;
await page.setContent(`<!doctype html><html><head><style>
@font-face { font-family: Geist; src: url(${font}) format('woff2'); font-weight: 100 900; }
html, body { margin: 0; background: transparent; width: 1920px; height: 1080px; }
#c { position: absolute; left: 50%; bottom: 34px; transform: translateX(-50%); max-width: 1480px; width: max-content;
  padding: 14px 30px 16px; border-radius: 22px; background: rgba(26, 13, 30, 0.82);
  box-shadow: 0 0 0 1px rgba(255,255,255,.08), 0 14px 30px -12px rgba(0,0,0,.45);
  font-family: Geist; font-weight: 560; font-size: 40px; line-height: 1.28; letter-spacing: -0.005em; color: #fff; text-align: center; text-wrap: balance; }
</style></head><body><div id="c"></div></body></html>`, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
const meta = {};
for (const l of Object.values(TL.lines)) {
  await page.evaluate((txt) => { document.getElementById('c').textContent = txt; }, l.text);
  await page.evaluate(() => document.fonts.ready);
  const r = await page.evaluate(() => { const b = document.getElementById('c').getBoundingClientRect(); return { x: b.left, y: b.top, w: b.width, h: b.height }; });
  const pad = 30;
  const clip = { x: Math.floor(r.x - pad), y: Math.floor(r.y - pad), width: Math.ceil(r.w + 2 * pad), height: Math.ceil(r.h + 2 * pad) };
  await page.screenshot({ path: `${out}/${l.id}.png`, omitBackground: true, clip });
  meta[l.id] = { x: clip.x, y: clip.y };
}
writeFileSync(`${out}/meta.json`, JSON.stringify(meta));
await browser.close();
console.log('captions', Object.keys(meta).length);
