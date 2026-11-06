"use client";

/**
 * Digital's pixel art, from the sprite grids in ./art/digital/sprite-grids.json (one character
 * per pixel, keyed to its palette; the SVGs beside it are the same art as rects). Each grid is
 * turned into crisp rectangles, runs of the same colour merged into one. Edit the JSON to
 * change a sprite; the SVGs are for viewing.
 */

import type { CSSProperties } from "react";
import GRIDS from "@/components/scenes/art/digital/sprite-grids.json";
import type { SceneMood } from "@/components/scenes/types";

/** The arcade palette, by name, for colours the code sets itself. */
export const PX = {
  outline: "#1A0B24",
  pink: "#FF4FA3",
  pinkShade: "#C22E7A",
  pinkLight: "#FFB3D6",
  yellow: "#FFE135",
  yellowShade: "#E0A800",
  gold: "#C98A00",
  screen: "#0B2018",
  lime: "#5CFF95",
  cyan: "#3DE0FF",
  magenta: "#FF3DCB",
  magentaShade: "#B5208F",
  red: "#FF3D6E",
  white: "#FFFFFF",
  ground: "#06150F",
} as const;

/** The grids' own palette: one character per colour ("." is transparent). */
const PALETTE = GRIDS.palette as Record<string, string | null>;

type Grid = { width: number; height: number; layers?: Record<string, string[]>; pixels?: string[] };
const SPRITES = GRIDS.sprites as unknown as Record<string, Grid>;

type Run = { x: number; y: number; w: number; c: string };

/** One sprite: its size in pixels and its runs, each still keyed by the character it was drawn with. */
export type Sprite = { w: number; h: number; runs: Run[] };

/** Turn a character grid into runs. "." is transparent; every other character is a colour key. */
export function sprite(rows: string[]): Sprite {
  const runs: Run[] = [];
  rows.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const c = row[x];
      let w = 1;
      while (row[x + w] === c) w++;
      if (c !== ".") runs.push({ x, y, w, c });
      x += w;
    }
  });
  return { w: Math.max(...rows.map((r) => r.length)), h: rows.length, runs };
}

/** A grid's rows, its layers flattened in order (later layers draw over earlier ones). */
function rowsOf(name: string): string[] {
  const g = SPRITES[name];
  const layers = g.layers ? Object.values(g.layers) : [g.pixels ?? []];
  return Array.from({ length: g.height }, (_, y) =>
    Array.from({ length: g.width }, (_, x) => {
      let c = ".";
      for (const l of layers) if (l[y]?.[x] && l[y][x] !== ".") c = l[y][x];
      return c;
    }).join(""),
  );
}

/** The smallest box round every pixel drawn in `rows`. */
function boundsOf(rows: string[]) {
  let x0 = Infinity, y0 = Infinity, x1 = -1, y1 = -1;
  rows.forEach((r, y) =>
    [...r].forEach((c, x) => {
      if (c === ".") return;
      x0 = Math.min(x0, x);
      y0 = Math.min(y0, y);
      x1 = Math.max(x1, x);
      y1 = Math.max(y1, y);
    }),
  );
  return { x0, y0, x1, y1 };
}

/** Cropped to `box` (by default, its own pixels), so a sprite drawn in a cell sits at 0,0. */
function trimmed(rows: string[], box = boundsOf(rows)): string[] {
  return rows.slice(box.y0, box.y1 + 1).map((r) => r.slice(box.x0, box.x1 + 1));
}

/** A sprite's rectangles, at (x, y) in the parent's units. `pal` recolours any of its keys. */
export function Pixels({
  s,
  pal,
  x = 0,
  y = 0,
}: {
  s: Sprite;
  pal?: Record<string, string>;
  x?: number;
  y?: number;
}) {
  return (
    <g transform={x || y ? `translate(${x} ${y})` : undefined}>
      {s.runs.map((r, i) => (
        <rect key={i} x={r.x} y={r.y} width={r.w} height={1} fill={pal?.[r.c] ?? PALETTE[r.c] ?? r.c} />
      ))}
    </g>
  );
}

/* ---------------- Bit: Digital's mascot, a pocket LCD clock ---------------- */

const bit = (name: string) => sprite(rowsOf(name));

/** Bit per tier: dozing at "Insert coin", up to wild-eyed at "Final boss". */
const TIER_BITS = ["insert-coin", "easy", "level-up", "hard", "boss", "final-boss"].map((n) => bit(`bit-${n}`));

/** Bit's reaction to a result: dozes off, gets knocked out, or sees stars. */
const RESULT_BITS: Partial<Record<SceneMood, Sprite>> = {
  win: bit("bit-snooze"),
  loss: bit("bit-game-over"),
  jackpot: bit("bit-perfect"),
};

const LOOK_LEFT = bit("bit-look-left");
const LOOK_RIGHT = bit("bit-look-right");

/**
 * One frame of Bit. Each frame is a 22-pixel cell with the casing at x 2–19, y 2–21; the view is
 * cropped close round the casing, and the extras (Zs, sweat, sparkles) spill past it.
 */
function BitSprite({ s, className, style }: { s: Sprite; className?: string; style?: CSSProperties }) {
  return (
    <svg
      aria-hidden
      viewBox="1 2 20 20"
      shapeRendering="crispEdges"
      className={className}
      style={{ overflow: "visible", ...style }}
    >
      <Pixels s={s} />
    </svg>
  );
}

/** Bit, beside the tier name: one face per tier (in place of the line icon). */
export function BitFace({ tier, className, style }: { tier: number; className?: string; style?: CSSProperties }) {
  return <BitSprite s={TIER_BITS[Math.max(0, Math.min(TIER_BITS.length - 1, tier))]} className={className} style={style} />;
}

/** Bit reacts beside the result badge: dozes off, gets knocked out, or sees stars. */
export function BitVerdict({ mood, className }: { mood: SceneMood; className?: string }) {
  const s = RESULT_BITS[mood];
  if (!s) return null;
  const move =
    mood === "loss"
      ? "lc-px-shake 0.5s steps(2) 0.5s 3"
      : mood === "jackpot"
        ? "lc-bit-hop 0.5s ease-in-out 0.45s infinite"
        : "lc-px-bob 2.4s steps(3, jump-none) 0.45s infinite";
  return (
    <span aria-hidden className={`pointer-events-none absolute block max-sm:hidden ${className ?? ""}`} style={{ marginRight: 8 }}>
      <span className="block" style={{ animation: "lc-mu-pop 0.45s cubic-bezier(0.2, 0.9, 0.3, 1.2) both" }}>
        <span className="block" style={{ transformOrigin: "50% 100%", animation: move }}>
          <BitSprite s={s} className="block h-12 w-12" />
        </span>
      </span>
    </span>
  );
}

/**
 * Digital's show while the draw rolls: Bit hopping on the spot, eyes darting left and right,
 * a pixel shadow squashing under each landing.
 */
export function DigitalRoll() {
  const swap = (first: boolean) => ({ animation: `lc-px-swap 0.5s steps(1) ${first ? "0s" : "-0.25s"} infinite` });
  return (
    <div aria-hidden className="relative mb-2 h-[60px] w-[60px]">
      <div
        className="absolute bottom-0 left-1/2 h-[4px] w-[34px] -translate-x-1/2"
        style={{ background: "rgba(0,0,0,0.45)", animation: "lc-bit-shadow 0.5s ease-in-out infinite" }}
      />
      <div className="absolute inset-x-0 bottom-[3px] h-[52px]" style={{ transformOrigin: "50% 100%", animation: "lc-bit-hop 0.5s ease-in-out infinite" }}>
        <BitSprite s={LOOK_LEFT} className="absolute inset-0 h-full w-full" style={swap(true)} />
        <BitSprite s={LOOK_RIGHT} className="absolute inset-0 h-full w-full" style={swap(false)} />
      </div>
    </div>
  );
}

/* ---------------- Power-ups: float round the screen, more of them as the bet grows ---------------- */

const POWER_UP_KINDS = ["heart", "coin", "star", "bolt", "gem", "key", "potion", "clock"] as const;
export type PowerUpKind = (typeof POWER_UP_KINDS)[number];

/** Each power-up in its full 12-pixel cell, so they all come out the same size. */
const POWER_UPS = Object.fromEntries(POWER_UP_KINDS.map((k) => [k, sprite(rowsOf(k))])) as Record<PowerUpKind, Sprite>;

/** One power-up, `size` px square, pixels kept crisp. */
export function PowerUp({ kind, size, className, style }: { kind: PowerUpKind; size: number; className?: string; style?: CSSProperties }) {
  const s = POWER_UPS[kind];
  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${s.w} ${s.h}`}
      width={size}
      height={(size * s.h) / s.w}
      shapeRendering="crispEdges"
      className={className}
      style={style}
    >
      <Pixels s={s} />
    </svg>
  );
}

/* ---------------- Lettering ---------------- */

const WORDS = {
  oneUp: sprite(trimmed(rowsOf("one-up"))),
  gameOver: sprite(trimmed(rowsOf("game-over"))),
  perfect: sprite(trimmed(rowsOf("perfect"))),
  continue: sprite(trimmed(rowsOf("continue"))),
};
export type PixelWordKind = keyof typeof WORDS;

/** A word in outlined pixel lettering ("1UP", "PERFECT!"…), `height` px tall. */
export function PixelWord({ word, height, className, style }: { word: PixelWordKind; height: number; className?: string; style?: CSSProperties }) {
  const s = WORDS[word];
  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${s.w} ${s.h}`}
      height={height}
      width={(height * s.w) / s.h}
      shapeRendering="crispEdges"
      className={className}
      style={style}
    >
      <Pixels s={s} />
    </svg>
  );
}

/* ---------------- Scenery ---------------- */

const HORIZON_GRID = SPRITES.horizon.layers!;
const HORIZON_GROUND = sprite(HORIZON_GRID.silhouette);
const HORIZON_EDGE = sprite(HORIZON_GRID.edge);
/** The horizon strip's size in pixels (it tiles left to right). */
export const HORIZON_SIZE = { w: SPRITES.horizon.width, h: SPRITES.horizon.height };

/** One tile of the horizon: blocky hills and little buildings, its top edge and windows lit in `edge`. */
export function HorizonTile({ edge, className, style }: { edge: string; className?: string; style?: CSSProperties }) {
  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${HORIZON_SIZE.w} ${HORIZON_SIZE.h}`}
      preserveAspectRatio="none"
      shapeRendering="crispEdges"
      className={className}
      style={style}
    >
      <Pixels s={HORIZON_GROUND} />
      <Pixels s={HORIZON_EDGE} pal={{ l: edge }} />
    </svg>
  );
}

const SUNSET = sprite(rowsOf("sunset"));

/** A striped pixel sun, for a perfect result. */
export function PixelSunset({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg aria-hidden viewBox={`0 0 ${SUNSET.w} ${SUNSET.h}`} shapeRendering="crispEdges" className={className} style={style}>
      <Pixels s={SUNSET} />
    </svg>
  );
}

/* ---------------- Dial pieces ---------------- */

/** A pixel bell for the dial's handle (10 × 9), drawn in white: recolour its "w" to tint it. */
export const PIXEL_BELL = sprite(trimmed(rowsOf("bell")));

/** The dial's lives (7 × 6): a full heart, and an empty outline for a life already lost (draw its "w"). */
const HEART_BOX = boundsOf(rowsOf("heart-full"));
export const PIXEL_HEART = sprite(trimmed(rowsOf("heart-full"), HEART_BOX));
export const PIXEL_HEART_EMPTY = sprite(trimmed(rowsOf("heart-empty"), HEART_BOX));
