import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { BUILDING_ART } from "@/components/scenes/night-buildings";
import { frac } from "@/lib/rand";

/*
 * The share card's backdrop: the Night theme's sky, drawn from the same art as the site's night
 * scene (./components/scenes/art/night): a full moon, sparkle stars, bats, thin night clouds, a
 * shooting star and the city skyline with its windows lit. One SVG, so the card stays a single
 * image layer under the phones and the pitch.
 */

const W = 1200;
const H = 630;
const ART = join(process.cwd(), "src/components/scenes/art");

/** An SVG file's contents without its outer <svg> tag (and any <title>), to nest in a <g>. */
async function inner(path: string) {
  const svg = await readFile(join(ART, path), "utf8");
  return svg
    .replace(/^[\s\S]*?<svg[^>]*>/, "")
    .replace(/<\/svg>\s*$/, "")
    .replace(/<title[\s\S]*?<\/title>/, "");
}

const n = (v: number) => Math.round(v * 100) / 100;

/* ---------------------------------------------------------------- skyline */

type Row = {
  salt: number;
  min: number;
  max: number;
  fill: string;
  glow: string;
  /** Share of windows with the lights on. */
  lit: number;
  dim: number;
};

function skyline({ salt, min, max, fill, glow, lit, dim }: Row) {
  let out = "";
  let x = -24;
  let prev = -1;
  for (let i = 0; x < W; i++) {
    let k = Math.floor(frac(i, salt) * BUILDING_ART.length);
    if (k === prev) k = (k + 3) % BUILDING_ART.length;
    prev = k;
    const art = BUILDING_ART[k];
    const s = min + frac(i, salt + 1) * (max - min);
    const w = art.w * s;
    const ty = n(H - 170 * s);
    const t =
      frac(i, salt + 2) > 0.5
        ? `translate(${n(x + w)} ${ty}) scale(${n(-s)} ${n(s)})`
        : `translate(${n(x)} ${ty}) scale(${n(s)})`;
    let g = `<path d="${art.d}" fill="${fill}"${art.evenodd ? ' fill-rule="evenodd"' : ""}/>`;
    art.windows.forEach(([wx, wy, ww, wh], m) => {
      if (frac(i * 53 + m, salt + 4) >= lit) return;
      const tv = frac(i * 53 + m, salt + 5) > 0.92;
      g += `<rect x="${wx}" y="${wy}" width="${ww}" height="${wh}" rx="1.5" fill="${tv ? "#A9C2FF" : glow}" opacity="${dim}"/>`;
    });
    if (art.beacon) {
      const [bx, by] = art.beacon;
      g += `<circle cx="${bx}" cy="${by}" r="8" fill="#FF4D5E" opacity="0.14"/><circle cx="${bx}" cy="${by}" r="3.2" fill="#FF4D5E" opacity="0.75"/>`;
    }
    out += `<g transform="${t}">${g}</g>`;
    x += w * (0.9 + frac(i, salt + 3) * 0.14);
  }
  return out;
}

/* ---------------------------------------------------------------- sky */

/** Little stars: denser up high, thinning out towards the rooftops. */
function stars() {
  let out = "";
  for (let i = 0; i < 140; i++) {
    const x = n(frac(i, 21) * W);
    const y = n(frac(i, 22) ** 1.25 * 480);
    const r = n(0.6 + frac(i, 23) * 1.1);
    const o = n(0.3 + frac(i, 24) * 0.6);
    if (frac(i, 25) > 0.8) out += `<circle cx="${x}" cy="${y}" r="${n(r * 3)}" fill="#FFECC8" opacity="${n(o * 0.18)}"/>`;
    out += `<circle cx="${x}" cy="${y}" r="${r}" fill="#FFF4DE" opacity="${o}"/>`;
  }
  return out;
}

/** Sparkle stars (the site's star art), placed in the open sky: [x, y, size, faint]. */
const SPARKLES: [number, number, number, boolean][] = [
  [560, 64, 26, false],
  [742, 118, 16, false],
  [318, 46, 15, true],
  [128, 36, 12, true],
  [652, 408, 18, false],
  [480, 486, 12, true],
  [1168, 330, 14, true],
  [24, 300, 12, true],
];

const BATS: [number, number, number, number][] = [
  // [x, y, width, tilt]
  [1112, 84, 30, -10],
  [1172, 122, 18, 8],
  [1074, 26, 16, -16],
];

/** Thin night clouds (the site's cloud shapes in Night's colours): [x, y, width]. */
const CLOUDS: [number, number, number, number][] = [
  [1040, 86, 180, 2],
  [270, 4, 230, 0],
  [-90, 404, 300, 3],
];

/** Builds the backdrop as an SVG data URI. */
export async function nightBackdrop() {
  const [moon, starBright, starFaint, bat, cloud] = await Promise.all([
    inner("night/moon-full.svg"),
    inner("night/star-bright.svg"),
    inner("night/star-faint.svg"),
    inner("night/bat-level.svg"),
    inner("classic/cloud-02.svg"),
  ]);

  // The moon, shaded like the site's: warm seas and craters, lit from the upper right
  const moonArt = moon
    .replace('fill="#FFF3DA"', 'fill="url(#moon-face)"')
    .replaceAll("#000000", "#6E4A2C")
    // Softer seas and craters than the site's: they go muddy this small
    .replace('opacity="0.12"', 'opacity="0.08"')
    .replace('opacity="0.18"', 'opacity="0.11"');
  const MX = 1128;
  const MY = 70;
  const MR = 40;

  const sparkles = SPARKLES.map(([x, y, size, faint]) => {
    const art = (faint ? starFaint : starBright).replaceAll("currentColor", "#FFF1D6");
    return `<g transform="translate(${n(x - size / 2)} ${n(y - size / 2)}) scale(${n(size / 24)})">${art}</g>`;
  }).join("");

  const bats = BATS.map(
    ([x, y, w, tilt]) =>
      `<g transform="translate(${x} ${y}) rotate(${tilt}) scale(${n(w / 32)}) translate(-16 -7)">${bat}</g>`,
  ).join("");

  // The cloud file's shape, recoloured: Night's violet top and bellies, kept faint
  const clouds = CLOUDS.map(([x, y, w], i) => {
    const art = cloud
      .replaceAll("cloud-2-clip", `night-cloud-${i}`)
      .replace('fill="#FFFDF8"', 'fill="#4A2B66"')
      .replace('fill="#FFE9DC"', 'fill="#563170"')
      .replace('fill="#FFD8C4"', 'fill="#63387A"');
    return `<g transform="translate(${x} ${y}) scale(${n(w / 280)})" opacity="0.34">${art}</g>`;
  }).join("");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs>
  <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#0D0820"/>
    <stop offset="0.5" stop-color="#1B1035"/>
    <stop offset="1" stop-color="#2E1746"/>
  </linearGradient>
  <radialGradient id="city-glow" cx="0.5" cy="1" r="0.5">
    <stop offset="0" stop-color="#B4505E" stop-opacity="0.26"/>
    <stop offset="0.5" stop-color="#86396A" stop-opacity="0.16"/>
    <stop offset="1" stop-color="#5A3470" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="stage" cx="0.5" cy="0.5" r="0.5">
    <stop offset="0" stop-color="#9B5DE5" stop-opacity="0.42"/>
    <stop offset="0.45" stop-color="#7A3FB8" stop-opacity="0.18"/>
    <stop offset="1" stop-color="#5A3470" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="moon-glow" cx="0.5" cy="0.5" r="0.5">
    <stop offset="0" stop-color="#FFE2B4" stop-opacity="0.34"/>
    <stop offset="0.35" stop-color="#FFD6A0" stop-opacity="0.12"/>
    <stop offset="1" stop-color="#FFD6A0" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="moon-face" cx="0.58" cy="0.4" r="0.62">
    <stop offset="0" stop-color="#FFF3DA"/>
    <stop offset="0.75" stop-color="#FFF3DA"/>
    <stop offset="1" stop-color="#EBD9BC"/>
  </radialGradient>
  <linearGradient id="streak" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#FFF6E2"/>
    <stop offset="0.25" stop-color="#FFF0D2" stop-opacity="0.6"/>
    <stop offset="1" stop-color="#FFF0D2" stop-opacity="0"/>
  </linearGradient>
</defs>
<rect width="${W}" height="${H}" fill="url(#sky)"/>
<ellipse cx="600" cy="${H}" rx="760" ry="300" fill="url(#city-glow)"/>
<ellipse cx="925" cy="330" rx="400" ry="330" fill="url(#stage)"/>
${stars()}
${sparkles}
<g transform="translate(612 34) rotate(158)"><rect width="150" height="2" rx="1" fill="url(#streak)"/></g>
<circle cx="${MX}" cy="${MY}" r="${MR * 4}" fill="url(#moon-glow)"/>
<g transform="translate(${MX - MR * (40 / 30)} ${MY - MR * (40 / 30)}) scale(${n(MR / 30)})">${moonArt}</g>
${clouds}
${bats}
<g opacity="0.8">
${skyline({ salt: 70, min: 0.42, max: 0.64, fill: "#23143A", glow: "#FFB060", lit: 0.22, dim: 0.3 })}
${skyline({ salt: 30, min: 0.3, max: 0.46, fill: "#140B26", glow: "#FFC870", lit: 0.26, dim: 0.65 })}
</g>
</svg>`;
  return Buffer.from(svg).toString("base64");
}
