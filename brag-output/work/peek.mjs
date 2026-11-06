import puppeteer from 'puppeteer-core';
import { globSync } from 'node:fs';
const exe = globSync(process.env.HOME + '/.cache/puppeteer/chrome/mac_arm-*/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing')[0];
const browser = await puppeteer.launch({ executablePath: exe, headless: true, args: ['--hide-scrollbars','--force-color-profile=srgb'] });
const page = await browser.newPage();
await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
const out = process.argv[2] || 'shots';
const themes = (process.argv[3] || 'classic').split(',');
for (const th of themes) {
  await page.goto('http://localhost:3123/?theme=' + th, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: `${out}/hero-${th}.jpg`, quality: 80 });
}
if (process.argv[4] === 'full') {
  await page.screenshot({ path: `${out}/full.jpg`, fullPage: true, quality: 70 });
  const h = await page.evaluate(() => [...document.querySelectorAll('section, footer')].map(s => [s.id || s.tagName, Math.round(s.getBoundingClientRect().top + scrollY), Math.round(s.getBoundingClientRect().height)]));
  console.log(JSON.stringify(h));
}
await browser.close();
