// Frame-by-frame capture of the real LotteryClock site under virtual time.
// Usage: node capture-site.mjs <clip-name> [--frames N] [--every K]
import puppeteer from 'puppeteer-core';
import { globSync, mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { CLIPS } from './clips.mjs';

const FPS = 30;
const DT = 1000 / FPS;
const W = 1920, H = 1080;
const BASE = 'http://localhost:3123/';

const name = process.argv[2];
const clip = CLIPS[name];
if (!clip) throw new Error('No clip ' + name + '. Have: ' + Object.keys(CLIPS).join(', '));
const argFrames = process.argv.includes('--frames') ? +process.argv[process.argv.indexOf('--frames') + 1] : null;
const every = process.argv.includes('--every') ? +process.argv[process.argv.indexOf('--every') + 1] : 1;
const outDir = new URL(`./clips/${name}/`, import.meta.url).pathname;
rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

const exe = globSync(process.env.HOME + '/.cache/puppeteer/chrome/mac_arm-*/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing')[0];
const browser = await puppeteer.launch({
  executablePath: exe,
  headless: true,
  args: ['--hide-scrollbars', '--force-color-profile=srgb', '--disable-background-timer-throttling', '--disable-renderer-backgrounding', '--font-render-hinting=none'],
});
const page = await browser.newPage();
await page.setViewport({ width: W, height: H, deviceScaleFactor: clip.dsf ?? 1.5 });
await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);
await page.evaluateOnNewDocument(readFileSync(new URL('./vtime.js', import.meta.url), 'utf8'));
page.on('console', (m) => { if (m.type() === 'error') console.log('[page]', m.text().slice(0, 200)); });
page.on('pageerror', (e) => console.log('[pageerror]', String(e).slice(0, 300)));

console.log(name, 'loading');
await page.goto(BASE + (clip.query ?? ''), { waitUntil: 'networkidle0' });
await page.addStyleTag({
  content: `
    main > section:not(:first-child), footer { display: none !important; }
    body { padding-bottom: 900px; background: #fff; }
    html { scroll-behavior: auto !important; }
    ${clip.css ?? ''}
  `,
});
await page.evaluate(async () => {
  await Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 4000))]);
  const imgs = [...document.images].filter((i) => i.loading !== 'lazy' && i.offsetParent);
  await Promise.race([
    Promise.all(imgs.map((i) => (i.complete ? null : new Promise((r) => { i.onload = i.onerror = r; })))),
    new Promise((r) => setTimeout(r, 4000)),
  ]);
});
// Warm up: let hydration, effects and entry animations settle in virtual time.
const setScroll = (y) => page.evaluate((y) => window.scrollTo(0, y), y);
await setScroll(scrollAt(0));
for (let i = 0; i < (clip.warm ?? 60); i++) await page.evaluate((dt) => window.__vt.step(dt), DT);
if (clip.setup) await clip.setup(page);

const cdp = await page.createCDPSession();
console.log(name, 'ready');

// ---- helpers resolved in the page ----
const dialGeom = () => page.evaluate(() => {
  const s = document.querySelector('[role=slider][aria-label="Gamble window"]');
  const dial = s.closest('.aspect-square.touch-none') || s.parentElement;
  const r = dial.getBoundingClientRect();
  return { cx: r.left + r.width / 2, cy: r.top + r.height / 2, R: (r.width / 2) * (148 / 179), value: +s.getAttribute('aria-valuenow') };
});
const rectOf = (sel, text) => page.evaluate((sel, text) => {
  const els = [...document.querySelectorAll(sel)].filter((e) => !text || e.textContent.includes(text));
  const e = els.find((e) => { const r = e.getBoundingClientRect(); return r.width && r.height; });
  if (!e) return null;
  const r = e.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height };
}, sel, text);

async function resolve(target) {
  if (target.x !== undefined) return { x: target.x, y: target.y };
  if (target.dial !== undefined) {
    const g = await dialGeom();
    const ang = (Math.min(target.dial * 8, 357) * Math.PI) / 180;
    return { x: g.cx + g.R * Math.sin(ang), y: g.cy - g.R * Math.cos(ang), ang: Math.min(target.dial * 8, 357) };
  }
  if (target.sel) {
    const r = await rectOf(target.sel, target.text);
    if (!r) { writeFileSync(`${outDir}/log.json`, JSON.stringify(log, null, 1)); throw new Error('Not found: ' + target.sel + ' ' + (target.text ?? '')); }
    return { x: r.x + (target.dx ?? 0), y: r.y + (target.dy ?? 0) };
  }
  throw new Error('bad target');
}

const ease = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
function scrollAt(t) {
  const s = clip.scroll ?? 0;
  if (typeof s === 'number') return s;
  // keyframes: [[t, y], ...] eased between
  let prev = s[0];
  for (const kf of s) {
    if (t <= kf[0]) {
      if (kf === prev) return kf[1];
      const k = ease((t - prev[0]) / (kf[0] - prev[0]));
      return prev[1] + (kf[1] - prev[1]) * k;
    }
    prev = kf;
  }
  return prev[1];
}

// ---- run ----
const actions = [...clip.actions].sort((a, b) => a.t - b.t);
const pre = Math.round((clip.preroll ?? 0) * FPS);
const total = argFrames ?? pre + Math.round(clip.duration * FPS);
const cur = { x: W / 2, y: H + 40, visible: false, pressed: false };
const live = []; // running moves
const log = { events: [], status: [] };
let lastStatus = '';
let ai = 0;

for (let f = 0; f < total; f++) {
  const t = f / FPS;
  // start actions due this frame
  while (ai < actions.length && actions[ai].t <= t + 1e-6) {
    const a = actions[ai++];
    log.events.push({ t: +(a.t - pre / FPS).toFixed(3), type: a.type, ...(a.offset !== undefined ? { offset: a.offset } : {}), ...(a.label ? { label: a.label } : {}) });
    if (a.type === 'show') { cur.visible = true; if (a.at) Object.assign(cur, await resolve(a.at)); }
    else if (a.type === 'hide') cur.visible = false;
    else if (a.type === 'move' || a.type === 'drag') {
      const to = await resolve(a.to);
      let from = { x: cur.x, y: cur.y };
      if (a.to.dial !== undefined) {
        const g = await dialGeom();
        const fa = ((Math.atan2(cur.x - g.cx, -(cur.y - g.cy)) * 180) / Math.PI + 360) % 360;
        live.push({ kind: 'arc', t0: a.t, dur: a.dur, g, a0: a.fromAng ?? fa, a1: to.ang, drag: a.type === 'drag' });
      } else live.push({ kind: 'line', t0: a.t, dur: a.dur, from, to, arc: a.arc ?? 0.12 });
    } else if (a.type === 'press') {
      await page.mouse.move(cur.x, cur.y);
      await page.mouse.down();
      cur.pressed = true;
      await page.evaluate(() => window.__cursor.downs.push(window.__vt.now));
    } else if (a.type === 'release') {
      await page.mouse.up();
      cur.pressed = false;
    } else if (a.type === 'click') {
      await page.mouse.move(cur.x, cur.y);
      await page.mouse.down();
      await page.evaluate(() => window.__cursor.downs.push(window.__vt.now));
      await page.mouse.up();
    } else if (a.type === 'force') {
      // The next draw lands on `offset` minutes (negative = early).
      const R = a.range ?? (await dialGeom()).value;
      const r = (a.offset + R + 0.5) / (2 * R + 1);
      await page.evaluate((r) => { window.__forceRand = [r]; }, r);
    } else if (a.type === 'key') {
      await page.keyboard.press(a.key);
    } else if (a.type === 'eval') {
      await page.evaluate(a.fn);
    }
  }
  // advance running moves
  for (let i = live.length - 1; i >= 0; i--) {
    const m = live[i];
    const k = Math.min(1, (t - m.t0) / m.dur);
    const e = ease(Math.max(0, k));
    if (m.kind === 'arc') {
      const ang = ((m.a0 + (m.a1 - m.a0) * e) * Math.PI) / 180;
      cur.x = m.g.cx + m.g.R * Math.sin(ang);
      cur.y = m.g.cy - m.g.R * Math.cos(ang);
    } else {
      // a gentle curve, like a hand
      const dx = m.to.x - m.from.x, dy = m.to.y - m.from.y;
      const bow = Math.sin(Math.PI * e) * m.arc;
      cur.x = m.from.x + dx * e - dy * bow;
      cur.y = m.from.y + dy * e + dx * bow;
    }
    if (k >= 1) live.splice(i, 1);
  }
  await page.mouse.move(cur.x, cur.y);
  await page.evaluate((c) => Object.assign(window.__cursor, c), { x: cur.x, y: cur.y, visible: cur.visible, pressed: cur.pressed });
  await setScroll(scrollAt(t));
  const vt = await page.evaluate((dt) => window.__vt.step(dt), DT);

  const status = await page.evaluate(() => {
    const s = document.querySelector('[aria-live=polite]');
    return s ? s.innerText.replace(/\s+/g, ' ').trim() : '';
  });
  if (status !== lastStatus) { log.status.push({ t: +(t - pre / FPS).toFixed(3), status }); lastStatus = status; }

  if (f >= pre && (f - pre) % every === 0) {
    await page.screenshot({ path: `${outDir}/f${String(f - pre).padStart(5, '0')}.jpg`, type: 'jpeg', quality: 93, optimizeForSpeed: true });
  }
  if (f % 150 === 0) console.log(name, 'frame', f, '/', total, 'vt', Math.round(vt));
}
writeFileSync(`${outDir}/log.json`, JSON.stringify(log, null, 1));
console.log(name, 'done', total, 'frames');
await browser.close();
