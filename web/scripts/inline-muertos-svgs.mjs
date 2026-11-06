// Turns web/src/components/scenes/art/muertos/*.svg into React fragments in muertos-svg.tsx.
// Usage (from web/): node scripts/inline-muertos-svgs.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const artDir = "src/components/scenes/art/muertos";
const outFile = "src/components/scenes/muertos-svg.tsx";
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

function jsx(node, indent) {
  if (!ALLOWED.has(node.tag)) throw new Error(`Unexpected <${node.tag}>`);
  const pad = " ".repeat(indent);
  // Ids are dropped: the scene repeats these pieces, and the code targets groups itself.
  const attrs = node.attrs
    .filter(([k]) => k !== "id" && k !== "xmlns")
    .map(([k, v]) => `${camel(k)}="${v}"`)
    .join(" ");
  const open = `${node.tag}${attrs ? ` ${attrs}` : ""}`;
  if (!node.kids.length) return `${pad}<${open} />`;
  return [`${pad}<${open}>`, ...node.kids.map((k) => jsx(k, indent + 2)), `${pad}</${node.tag}>`].join("\n");
}

const frag = (nodes, indent = 2) =>
  ["<>", ...nodes.map((n) => jsx(n, indent + 2)), `${" ".repeat(indent)}</>`].join("\n");

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

// Papel picado: one evenodd path each; keep just the outline data.
const papel = Object.fromEntries(
  ["skull", "flower", "heart", "star"].map((d) => {
    const svg = parse(read(`papel-picado-${d}`));
    const paths = svg.kids.filter((k) => k.tag === "path");
    if (paths.length !== 1 || svg.kids.length !== 1) throw new Error(`papel ${d}: expected one path`);
    return [d, attr(paths[0], "d")];
  }),
);

const body = parse(read("candle-body"));
const flame = parse(read("candle-flame"));
const monarch = parse(read("monarch"));
const bloom = parse(read("marigold-bloom"));
const FACES = ["rest", "candle", "marigold", "dance", "spirits", "back"];

const out = `/**
 * Día de Muertos art, generated from the SVGs in ./art/muertos (attributes camelCased for
 * React, ids dropped because the scene repeats these pieces). Edit those files, then
 * run \`node scripts/inline-muertos-svgs.mjs\` (from web/) rather than editing this by hand.
 * muertos-art.tsx places the pieces.
 */

/** Papel picado outlines on a 40 × 50 grid: one evenodd path, the cut-outs are holes. */
export const PAPEL_PICADO = {
${Object.entries(papel)
  .map(([k, d]) => `  ${k}:\n    "${d}",`)
  .join("\n")}
} as const;

/** Candle wax drips and rim, on the candle's 18 × 60 grid (rim centred on y = 2.6). */
export const CANDLE_DRIPS = ${frag(need(body, "drips").kids, 0)};

export const CANDLE_RIM = ${frag(need(body, "rim").kids, 0)};

/** Candle flame, 12 × 24, base at (6, 24). */
export const CANDLE_FLAME = ${frag(need(flame, "flame").kids, 0)};

/** Cempasúchil with two leaves, centred on (0, 0), 44 × 36. */
export const MARIGOLD = ${frag(parse(read("marigold")).kids, 0)};

/** Calaverita, centred on (0, 0), 30 × 34. */
export const CALAVERITA = ${frag(parse(read("calaverita")).kids, 0)};

/** Headstones standing on (0, 0), 28 × 44. */
export const HEADSTONE_CROSS = ${frag(parse(read("headstone")).kids, 0)};

export const HEADSTONE_LINES = ${frag(parse(read("headstone-lines")).kids, 0)};

/** Monarch on a 40 × 30 grid; the wings meet the body at x = 20. */
export const MONARCH_WINGS = ${frag([need(monarch, "wing-left"), need(monarch, "wing-right")], 0)};

export const MONARCH_BODY = ${frag(need(monarch, "body").kids, 0)};

/** The bloom behind the dial (200 × 200, centred on 100, 100): back, middle and front rings. */
export const BLOOM_RINGS = [
${["ring-outer", "ring-mid", "ring-inner"].map((id) => `  ${frag(need(bloom, id).kids, 2)},`).join("\n")}
];

/** The calavera mascot (180 × 180), one face per bet tier: ${FACES.join(", ")}. */
export const CALAVERA_FACES = [
${FACES.map((f) => `  // ${f}\n  ${frag(parse(read(`calavera-${f}`)).kids, 2)},`).join("\n")}
];
`;

writeFileSync(outFile, out);
console.log(`wrote ${outFile} (${out.length} chars)`);
