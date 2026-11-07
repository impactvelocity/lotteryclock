// Gallery images: one 3:2 shot per theme, straight from the site's hero.
// The dial sits in the middle at 28 minutes, with just the theme's name above it.
// Needs the web dev server running (default http://localhost:3005, or set BASE).
// Usage (from the repo root): node docs/submission-images/gallery.mjs [themeId ...]
import { createRequire } from "node:module";
import { globSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(path.join(here, "../../brag-output/work/package.json"));
const puppeteer = require("puppeteer-core");

const BASE = process.env.BASE ?? "http://localhost:3005/";
const ALL = ["classic", "night", "muertos", "wheel", "poker", "ouija", "tarot"];
const ids = process.argv.slice(2).length ? process.argv.slice(2) : ALL;
const W = 1200, H = 800; // 3:2, rendered at 2x
const RANGE = 28;
const DIAL = 440; // dial width in px (the site's own is 380)
const TITLE_SIZE = 38; // theme name, px
const TITLE_TOP = 64; // theme name: just below the header row, above the dial and its rings
const BUTTON_BOTTOM = 28; // Set Alarm button, from the bottom edge

const outDir = path.join(here, "gallery");
mkdirSync(outDir, { recursive: true });

const exe = globSync(process.env.HOME + "/.cache/puppeteer/chrome/mac_arm-*/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing")[0];
const browser = await puppeteer.launch({ executablePath: exe, headless: true, args: ["--hide-scrollbars", "--force-color-profile=srgb"] });
const page = await browser.newPage();
await page.setViewport({ width: W, height: H, deviceScaleFactor: 2 });
page.on("pageerror", (e) => console.log("[pageerror]", String(e).slice(0, 200)));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const SLIDER = '[role=slider][aria-label="Gamble window"]';

for (const id of ids) {
  await page.goto(`${BASE}?theme=${id}`, { waitUntil: "networkidle0" });
  await page.evaluate(() => document.fonts.ready);
  await sleep(1200); // entry animations

  // Turn the bell to 28 minutes, one real key press at a time
  await page.focus(SLIDER);
  for (let i = 0; i < 60; i++) {
    const v = await page.$eval(SLIDER, (s) => +s.getAttribute("aria-valuenow"));
    if (v === RANGE) break;
    await page.keyboard.press(v < RANGE ? "ArrowRight" : "ArrowLeft");
    await sleep(40);
  }
  await page.$eval(SLIDER, (s) => s.blur());

  const name = await page.evaluate(({ W, H, DIAL, TITLE_SIZE, TITLE_TOP, BUTTON_BOTTOM }) => {
    const slider = document.querySelector('[role=slider][aria-label="Gamble window"]');
    const col = slider.closest(".max-w-6xl");
    const wrap = col.parentElement; // the hero: scene layer + header + content column
    const section = wrap.parentElement;
    const grid = [...col.children].find((c) => c.contains(slider));
    const stage = [...grid.children].find((c) => c.contains(slider));
    const h1 = col.querySelector("h1");
    const picker = [...col.children].find((c) => /\d+\/\d+/.test(c.textContent));
    const themeName = picker.textContent.replace(/\d+\/\d+.*/, "").trim();

    // Only the hero, at exactly 3:2
    for (const s of document.querySelectorAll("main > section")) if (s !== section) s.style.display = "none";
    document.querySelector("footer")?.style.setProperty("display", "none");
    for (const c of section.children) if (c !== wrap) c.style.display = "none";
    document.body.style.overflow = "hidden";
    for (const p of document.querySelectorAll("nextjs-portal")) p.style.display = "none"; // dev badge
    Object.assign(wrap.style, { width: W + "px", height: H + "px" });
    // Header: just the logo (left) and Built for Kiroween (right)
    const header = wrap.querySelector("header");
    header.querySelector("nav").style.visibility = "hidden";
    for (const b of header.querySelectorAll('[aria-label="Source code on GitHub"], [aria-label^="Mute"], [aria-label^="Unmute"], [aria-label="Menu"]'))
      b.parentElement.style.display = "none";

    // Everything but the dial and its two side labels goes
    for (const c of col.children) if (c !== grid) c.style.display = "none";
    // Dial in the middle of the frame
    Object.assign(col.style, { position: "absolute", inset: "0", padding: "0", maxWidth: "none", justifyContent: "center" });
    // No transition, or the hero measures the dial mid-resize (its size normally eases)
    Object.assign(stage.style, { transition: "none", width: DIAL + "px", height: DIAL + "px" });
    const dialBox = stage.getBoundingClientRect();
    const dy = H / 2 - (dialBox.top + dialBox.height / 2);
    grid.style.transform = `translateY(${dy}px)`;

    // The theme's name above it, in the hero's own type
    const cs = getComputedStyle(h1);
    const title = document.createElement("div");
    title.setAttribute("data-gallery", "title");
    title.innerHTML = "<span></span>";
    title.firstChild.textContent = themeName;
    Object.assign(title.style, {
      // Up in the header row, between the logo and Built for Kiroween
      position: "absolute", left: "0", right: "0", top: TITLE_TOP + "px",
      display: "flex", justifyContent: "center",
      fontFamily: cs.fontFamily, fontWeight: "500", color: cs.color, letterSpacing: cs.letterSpacing,
      textShadow: cs.textShadow, fontSize: TITLE_SIZE + "px", lineHeight: "1", zIndex: "5",
    });
    wrap.appendChild(title);

    // The site's Set Alarm button in its socket (it normally sits on the rail at the hero's foot)
    const socket = [...section.querySelectorAll("button")].find((b) => /set alarm/i.test(b.textContent))?.parentElement;
    if (socket) {
      const btn = socket.cloneNode(true);
      btn.setAttribute("data-gallery", "button");
      Object.assign(btn.style, {
        position: "absolute", left: "50%", bottom: BUTTON_BOTTOM + "px",
        transform: "translateX(-50%)", zIndex: "5",
      });
      wrap.appendChild(btn);
    }
    window.scrollTo(0, 0);
    return themeName;
  }, { W, H, DIAL, TITLE_SIZE, TITLE_TOP, BUTTON_BOTTOM });

  // The hero only re-measures where the dial is (for the sun and the rings behind it) when the
  // wrapper resizes, so nudge its size now the dial has moved, then let the scene settle.
  await sleep(600);
  await page.evaluate(async (W) => {
    const wrap = document.querySelector('[role=slider][aria-label="Gamble window"]').closest(".max-w-6xl").parentElement;
    const frame = () => new Promise((r) => requestAnimationFrame(() => r()));
    wrap.style.width = W - 2 + "px";
    await frame(); await frame();
    wrap.style.width = W + "px";
    await frame(); await frame();
  }, W);
  await sleep(900);
  const off = await page.evaluate(() => {
    const slider = document.querySelector('[role=slider][aria-label="Gamble window"]');
    const s = slider.closest(".max-w-6xl").querySelector(".relative.mx-auto").getBoundingClientRect();
    // The div the hero places at the dial's measured centre (left/top in px, not 0)
    const spot = [...document.querySelectorAll("div.absolute")].find((d) => /px$/.test(d.style.left) && /px$/.test(d.style.top) && d.style.left !== "0px" && d.style.top !== "0px" && d.children.length && !d.closest(".max-w-6xl"));
    if (!spot) return null;
    const b = spot.getBoundingClientRect();
    return Math.round(Math.hypot(b.left - (s.left + s.width / 2), b.top - (s.top + s.height / 2)));
  });
  if (off) console.log(id, `warning: backdrop ${off}px off the dial centre`);

  // Clear small scene props (Poker's chips, Tarot's clouds, sparkles, petals) off the side labels,
  // the title and the Set Alarm button
  const cleared = await page.evaluate(() => {
    const slider = document.querySelector('[role=slider][aria-label="Gamble window"]');
    const col = slider.closest(".max-w-6xl");
    const wrap = col.parentElement;
    const grid = [...col.children].find((c) => c.contains(slider));
    const labels = [...grid.children].filter((c) => !c.contains(slider)).flatMap((c) => [...c.querySelectorAll("*")].filter((e) => e.children.length === 0 && e.textContent.trim()));
    const ours = [...wrap.querySelectorAll("[data-gallery]")];
    // Labels clear props up to 260px; the title and button only small ones (petals, sparkles),
    // so scenery like Tarot's cloud bank or Muertos' candles stays whole
    const box = (e, max) => {
      const r = e.getBoundingClientRect();
      return { l: r.left - 6, r: r.right + 6, t: r.top - 4, b: r.bottom + 4, max };
    };
    const boxes = [...labels.map((e) => box(e, 260)), ...ours.map((e) => box(e.dataset.gallery === "title" ? e.firstChild : e, 60))];
    const hit = (r) => boxes.some((b) => r.width <= b.max && r.height <= b.max && r.left < b.r && r.right > b.l && r.top < b.b && r.bottom > b.t);
    let n = 0;
    for (const e of wrap.querySelectorAll("img, svg, div, span")) {
      if (col.contains(e) || e.closest("header") || e.closest("[data-gallery]") || e.closest("[data-hidden-prop]")) continue;
      const r = e.getBoundingClientRect();
      if (!r.width || r.width > 260 || r.height > 260) continue; // props only, not whole layers
      if (hit(r)) { e.style.visibility = "hidden"; e.setAttribute("data-hidden-prop", ""); n++; }
    }
    return n;
  });
  if (cleared) console.log(id, `cleared ${cleared} prop(s) off the text and button`);
  const file = path.join(outDir, `${ALL.indexOf(id) + 1}-${id}.png`);
  await page.screenshot({ path: file, clip: { x: 0, y: 0, width: W, height: H } });
  console.log(id, name, "→", path.relative(process.cwd(), file));
}
await browser.close();
