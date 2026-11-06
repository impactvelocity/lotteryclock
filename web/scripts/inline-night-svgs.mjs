// Turns web/src/components/scenes/art/night/buildings/*.svg into BUILDING_ART in night-buildings.ts.
// Usage (from web/): node scripts/inline-night-svgs.mjs
//
// Each building SVG is: viewBox "0 0 W 170", a <path id="silhouette">, a <g id="windows"> of
// <rect>s and, optionally, a <circle id="beacon"> at the antenna tip (see
// docs/night-theme-svg-prompts.md). The rest of Night's art (bats, moon, stars, sheep, fence)
// is small enough to be inlined by hand in night-art.tsx.
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const artDir = "src/components/scenes/art/night/buildings";
const outFile = "src/components/scenes/night-buildings.ts";

/** In BUILDING_ART order: the skyline's weights (night-skyline.tsx) follow this list. */
const NAMES = [
  "art-deco-tower",
  "thin-spire",
  "rooftop-water-tower",
  "gabled-house",
  "domed-building",
  "flat-roof-block",
  "apartment-block-01",
  "apartment-block-02",
  "clock-tower",
  "setback-skyscraper",
  "brownstone",
  "radio-mast-block",
];

const attr = (tag, name) => tag.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1];
const num = (v) => Number(Number(v).toFixed(2));

/** Every y coordinate in an absolute path (control points included, so it errs high). */
function pathYs(d) {
  const ys = [];
  for (const [, cmd, args] of d.matchAll(/([MLHVCSQTAZ])([^MLHVCSQTAZ]*)/gi)) {
    if (cmd !== cmd.toUpperCase()) throw new Error(`Relative command "${cmd}" in path`);
    const n = (args.match(/-?[\d.]+(?:e-?\d+)?/gi) ?? []).map(Number);
    if (cmd === "V") ys.push(...n);
    else if (cmd === "A") for (let i = 6; i < n.length; i += 7) ys.push(n[i]);
    else if ("MLCSQT".includes(cmd)) for (let i = 1; i < n.length; i += 2) ys.push(n[i]);
  }
  return ys;
}

function building(name) {
  const src = readFileSync(join(artDir, `${name}.svg`), "utf8");
  const vb = attr(src.match(/<svg[^>]*>/)[0], "viewBox").split(/\s+/).map(Number);
  if (vb[3] !== 170) throw new Error(`${name}: viewBox must be 170 high`);
  const pathTag = src.match(/<path[^>]*id="silhouette"[^>]*>/)?.[0];
  if (!pathTag) throw new Error(`${name}: no <path id="silhouette">`);
  const d = attr(pathTag, "d").replace(/\s+/g, " ").trim();
  const evenodd = attr(pathTag, "fill-rule") === "evenodd";
  const winGroup = src.match(/<g[^>]*id="windows"[^>]*>([\s\S]*?)<\/g>/)?.[1] ?? "";
  const windows = [...winGroup.matchAll(/<rect[^>]*>/g)].map(([r]) =>
    ["x", "y", "width", "height"].map((k) => num(attr(r, k))),
  );
  const beaconTag = src.match(/<circle[^>]*id="beacon"[^>]*>/)?.[0];
  const beacon = beaconTag ? [num(attr(beaconTag, "cx")), num(attr(beaconTag, "cy"))] : undefined;
  const top = Math.floor(
    Math.min(...pathYs(d), ...(beacon ? [beacon[1] - Number(attr(beaconTag, "r") ?? 3)] : [])),
  );
  return { name, top, w: vb[2], d, evenodd, windows, beacon };
}

const art = NAMES.map(building);
const body = art
  .map((b) =>
    [
      "  {",
      `    name: ${JSON.stringify(b.name)},`,
      `    top: ${b.top},`,
      `    w: ${b.w},`,
      `    d: ${JSON.stringify(b.d)},`,
      ...(b.evenodd ? ["    evenodd: true,"] : []),
      `    windows: ${JSON.stringify(b.windows).replace(/,/g, ", ")},`,
      ...(b.beacon ? [`    beacon: [${b.beacon.join(", ")}],`] : []),
      "  },",
    ].join("\n"),
  )
  .join("\n");

writeFileSync(
  outFile,
  `/* Generated from ./art/night/buildings/*.svg by scripts/inline-night-svgs.mjs: don't edit by hand.
   (viewBox 0 0 w 170, flat bottom at y=170.) */

export type BuildingArt = {
  name: string;
  /** Highest point of the silhouette (antenna tip included). */
  top: number;
  /** Width on the 170-high grid. */
  w: number;
  /** Silhouette. */
  d: string;
  /** Draw the silhouette with fill-rule evenodd (cut-outs, like the clock face). */
  evenodd?: boolean;
  /** Windows as [x, y, width, height]. */
  windows: [number, number, number, number][];
  /** Antenna tip, where a red beacon blinks. */
  beacon?: [number, number];
};

export const BUILDING_ART: BuildingArt[] = [
${body}
];
`,
);
console.log(`Wrote ${art.length} buildings to ${outFile}`);
