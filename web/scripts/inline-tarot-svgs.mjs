// Turns web/src/components/scenes/art/tarot/*.svg into React fragments in tarot-svg.tsx.
// Usage (from web/): node scripts/inline-tarot-svgs.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const artDir = "src/components/scenes/art/tarot";
const outFile = "src/components/scenes/tarot-svg.tsx";
const read = (name) => readFileSync(join(artDir, `${name}.svg`), "utf8");

/** Parse the tiny subset these files use: elements + double-quoted attributes, no text. */
function parse(src) {
  const root = { tag: "#root", attrs: [], kids: [] };
  const stack = [root];
  const re = /<(\/?)([a-zA-Z]+)((?:\s+[a-zA-Z:-]+="[^"]*")*)\s*(\/?)>/g;
  let m;
  let last = 0;
  while ((m = re.exec(src))) {
    const between = src.slice(last, m.index).trim();
    if (between) throw new Error(`Unexpected text: ${between.slice(0, 40)}`);
    last = re.lastIndex;
    const [, close, tag, attrSrc, selfClose] = m;
    if (close) {
      const top = stack.pop();
      if (top.tag !== tag) throw new Error(`Mismatched </${tag}> (open: ${top.tag})`);
      continue;
    }
    const attrs = [...attrSrc.matchAll(/([a-zA-Z:-]+)="([^"]*)"/g)].map(([, k, v]) => [k, v]);
    const node = { tag, attrs, kids: [] };
    stack.at(-1).kids.push(node);
    if (!selfClose) stack.push(node);
  }
  if (stack.length !== 1) throw new Error("Unclosed element");
  const svg = root.kids[0];
  if (svg?.tag !== "svg") throw new Error("Root is not <svg>");
  return svg;
}

const ALLOWED = new Set(["g", "path", "circle", "ellipse", "rect"]);
const camel = (k) => k.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
const attr = (n, k) => n.attrs.find(([a]) => a === k)?.[1];

/**
 * Ids and classes are dropped: the scene repeats these pieces, and the code targets groups itself.
 * `drop` removes more attributes (e.g. fill, so a parent <g fill> can recolour a shape).
 */
function jsx(node, indent, drop = []) {
  if (!ALLOWED.has(node.tag)) throw new Error(`Unexpected <${node.tag}>`);
  const pad = " ".repeat(indent);
  const attrs = node.attrs
    .filter(([k]) => k !== "id" && k !== "class" && k !== "xmlns" && !drop.includes(k))
    .map(([k, v]) => `${camel(k)}="${v}"`)
    .join(" ");
  const open = `${node.tag}${attrs ? ` ${attrs}` : ""}`;
  if (!node.kids.length) return `${pad}<${open} />`;
  return [
    `${pad}<${open}>`,
    ...node.kids.map((k) => jsx(k, indent + 2, drop)),
    `${pad}</${node.tag}>`,
  ].join("\n");
}

const frag = (nodes, indent = 0, drop = []) =>
  ["<>", ...nodes.map((n) => jsx(n, indent + 2, drop)), `${" ".repeat(indent)}</>`].join("\n");

function byId(node, id) {
  if (attr(node, "id") === id) return node;
  for (const k of node.kids) {
    const hit = byId(k, id);
    if (hit) return hit;
  }
  return null;
}
function need(node, id) {
  const hit = byId(node, id);
  if (!hit) throw new Error(`Missing #${id}`);
  return hit;
}
/** A group's children, as a fragment. */
const kids = (svg, id, indent = 0, drop = []) => frag(need(svg, id).kids, indent, drop);

// The sun and moon: one face per tier / mood, sharing one set of rays (checked identical).
const SUNS = ["temperance", "star", "fortune", "devil", "tower", "fool"];
const MOONS = ["idle", "set", "win", "loss", "jackpot"];
function faces(prefix, names) {
  const svgs = names.map((n) => parse(read(`${prefix}-${n}`)));
  const rays = svgs.map((s) => kids(s, "rays"));
  if (rays.some((r) => r !== rays[0])) throw new Error(`${prefix}: rays differ between faces`);
  return { rays: rays[0], faces: svgs.map((s) => kids(s, "face", 2)) };
}
const sun = faces("sun", SUNS);
const moon = faces("moon", MOONS);

const wheel = parse(read("fortune-wheel"));
const wreath = parse(read("wreath"));
const planets = parse(read("planets"));
const lightning = parse(read("lightning"));
const suits = parse(read("suits"));
const clouds = parse(read("clouds"));
const eye = parse(read("eye"));
const cardBack = parse(read("card-back"));

const suitPath = (id) => {
  const paths = need(suits, id).kids;
  if (paths.length !== 1 || paths[0].tag !== "path") throw new Error(`suit ${id}: expected one path`);
  return attr(paths[0], "d");
};

const out = `/**
 * Tarot art, generated from the SVGs in ./art/tarot (attributes camelCased for React, ids and
 * classes dropped because the scene repeats these pieces). Edit those files, then run
 * \`node scripts/inline-tarot-svgs.mjs\` (from web/) rather than editing this by hand.
 * tarot-art.tsx places the pieces. The prompts that made the art: docs/tarot-theme-svg-prompts.md.
 */

/** The sun's 32 engraved rays (180 × 180, centred on 90, 90), the same for every face. */
export const SUN_RAYS = ${sun.rays};

/** The sun's face (r 46 at 90, 90), one per bet tier: ${SUNS.join(", ")}. */
export const SUN_FACES = [
${SUNS.map((n, i) => `  // ${n}\n  ${sun.faces[i]},`).join("\n")}
];

/** The moon's 40 fine rays (180 × 180, centred on 90, 90), the same for every mood. */
export const MOON_RAYS = ${moon.rays};

/** The crescent moon's profile face, one per mood: ${MOONS.join(", ")}. */
export const MOON_FACES = [
${MOONS.map((n, i) => `  // ${n}\n  ${moon.faces[i]},`).join("\n")}
];

/**
 * The wheel of fortune (400 × 400, centred on 200, 200): its band (r 136 to 176), split into 12
 * segments, with a glyph in each. (The minute ticks inside it would sit under the dial, and the
 * gold rim with its finials read poorly on the sky, so both are left out.)
 */
export const WHEEL_BAND = ${frag([need(wheel, "band"), need(wheel, "glyphs")])};

/** The World's laurel wreath (400 × 400, centred on 200, 200; clear inside r 114). */
export const WREATH_LEAVES = [${kids(wreath, "leaves-left", 2)}, ${kids(wreath, "leaves-right", 2)}];

export const WREATH_RIBBONS = [${kids(wreath, "ribbon-top", 2)}, ${kids(wreath, "ribbon-bottom", 2)}];

/** Four planets, each in a 64 × 64 cell of a 286 × 64 sheet (cells at x = 0, 74, 148, 222). */
export const PLANETS = [
${["planet-ringed", "planet-small-ringed", "planet-banded", "planet-orbit"].map((id) => `  ${kids(planets, id, 2)},`).join("\n")}
];

/** Lightning (200 × 240 sheet): a tall bolt in x 0–90 and a short one in x 110–200. */
export const BOLT_TALL = ${kids(lightning, "bolt-tall")};

export const BOLT_SHORT = ${kids(lightning, "bolt-short")};

/** Minor arcana suits on a 24 × 24 grid: one evenodd path each, drawn in currentColor. */
export const SUIT_PATHS = {
${["wands", "cups", "swords", "pentacles"].map((id) => `  ${id}: "${suitPath(id)}",`).join("\n")}
} as const;

/**
 * Three scalloped clouds on a 280 × 160 grid, flat bottoms on y = 132. The outlines have no fill
 * of their own, so the scene can colour them.
 */
export const CLOUDS = [
${[1, 2, 3]
  .map(
    (n) =>
      `  {\n    outline: ${kids(clouds, `cloud-${n}-outline`, 4, ["fill"])},\n    creases: ${kids(clouds, `cloud-${n}-creases`, 4)},\n  },`,
  )
  .join("\n")}
];

/** The back of a tarot card (140 × 240), the same either way up. */
export const CARD_BACK = ${frag([need(cardBack, "field"), need(cardBack, "filigree"), need(cardBack, "medallion")])};

/** The all-seeing eye (160 × 110, eye centred on 80, 70): rays and crown, the white, the iris, the lid. */
export const EYE_TOP = ${frag([need(eye, "rays"), need(eye, "crown")])};

export const EYE_WHITE = ${frag(need(eye, "eye").kids.slice(0, 1))};

export const EYE_IRIS = ${frag(need(eye, "eye").kids.slice(1))};

export const EYE_LID = ${kids(eye, "lid")};
`;

writeFileSync(outFile, out);
console.log(`wrote ${outFile} (${out.length} chars)`);
