// Renders each src/*.html to a PNG at 2x, sized to its .canvas.
// Usage (from the repo root): node docs/submission-images/render.mjs [name ...]
import { createRequire } from "node:module";
import { globSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(path.join(here, "../../brag-output/work/package.json"));
const puppeteer = require("puppeteer-core");

const names = process.argv.slice(2).length ? process.argv.slice(2) : ["hero", "dial", "themes", "app"];
const exe = globSync(process.env.HOME + "/.cache/puppeteer/chrome/mac_arm-*/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing")[0];
const browser = await puppeteer.launch({ executablePath: exe, headless: true, args: ["--allow-file-access-from-files", "--force-color-profile=srgb"] });
const page = await browser.newPage();
await page.setViewport({ width: 1200, height: 800, deviceScaleFactor: 2 });
for (const name of names) {
  await page.goto("file://" + path.join(here, "src", name + ".html"), { waitUntil: "networkidle0" });
  await page.evaluate(() => document.fonts.ready);
  const el = await page.$(".canvas");
  await el.screenshot({ path: path.join(here, name + ".png") });
  const box = await el.boundingBox();
  console.log(name, Math.round(box.width) + "×" + Math.round(box.height));
}
await browser.close();
