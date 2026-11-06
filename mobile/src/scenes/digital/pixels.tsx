/**
 * Digital's pixel art (web: digital-art.tsx), from the sprite grids in ./sprite-grids.json, a copy
 * of web/src/components/scenes/art/digital/sprite-grids.json (one character per pixel, keyed to
 * its palette). Each grid is turned into runs of one colour, and each colour into a single path:
 * react-native-svg has no shape-rendering="crispEdges", and one path per colour leaves no
 * hairline seams between the pixels.
 */
import { memo } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { G, Path } from 'react-native-svg';

import type { SceneMood } from '../types';
import GRIDS from './sprite-grids.json';

/** The arcade palette, by name, for colours the code sets itself. */
export const PX = {
  outline: '#1A0B24',
  pink: '#FF4FA3',
  pinkShade: '#C22E7A',
  pinkLight: '#FFB3D6',
  yellow: '#FFE135',
  yellowShade: '#E0A800',
  gold: '#C98A00',
  screen: '#0B2018',
  lime: '#5CFF95',
  cyan: '#3DE0FF',
  magenta: '#FF3DCB',
  magentaShade: '#B5208F',
  red: '#FF3D6E',
  white: '#FFFFFF',
  ground: '#06150F',
} as const;

/** The grids' own palette: one character per colour ("." is transparent). */
const PALETTE = GRIDS.palette as Record<string, string | null>;

type Grid = { width: number; height: number; layers?: Record<string, string[]>; pixels?: string[] };
const SPRITES = GRIDS.sprites as unknown as Record<string, Grid>;

type Run = { x: number; y: number; w: number; c: string };

/** One sprite: its size in pixels, and a path per colour key (runs of pixels, merged). */
export type Sprite = { w: number; h: number; paths: { c: string; d: string }[] };

/** Turn a character grid into a sprite. "." is transparent; every other character is a colour key. */
export function sprite(rows: string[]): Sprite {
  const runs: Run[] = [];
  rows.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const c = row[x];
      let w = 1;
      while (row[x + w] === c) w++;
      if (c !== '.') runs.push({ x, y, w, c });
      x += w;
    }
  });
  const byColour = new Map<string, string>();
  for (const r of runs) byColour.set(r.c, (byColour.get(r.c) ?? '') + `M${r.x} ${r.y}h${r.w}v1h${-r.w}z`);
  return {
    w: Math.max(...rows.map((r) => r.length)),
    h: rows.length,
    paths: [...byColour].map(([c, d]) => ({ c, d })),
  };
}

/** A grid's rows, its layers flattened in order (later layers draw over earlier ones). */
function rowsOf(name: string): string[] {
  const g = SPRITES[name];
  const layers = g.layers ? Object.values(g.layers) : [g.pixels ?? []];
  return Array.from({ length: g.height }, (_, y) =>
    Array.from({ length: g.width }, (_, x) => {
      let c = '.';
      for (const l of layers) if (l[y]?.[x] && l[y][x] !== '.') c = l[y][x];
      return c;
    }).join(''),
  );
}

/** The smallest box round every pixel drawn in `rows`. */
function boundsOf(rows: string[]) {
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -1;
  let y1 = -1;
  rows.forEach((r, y) =>
    [...r].forEach((c, x) => {
      if (c === '.') return;
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

/** A sprite's pixels as SVG, at (x, y) in the parent's units. `pal` recolours any of its keys. */
export function Pixels({ s, pal, x = 0, y = 0 }: { s: Sprite; pal?: Record<string, string>; x?: number; y?: number }) {
  return (
    <G transform={x || y ? `translate(${x} ${y})` : undefined}>
      {s.paths.map(({ c, d }) => (
        <Path key={c} d={d} fill={pal?.[c] ?? PALETTE[c] ?? c} />
      ))}
    </G>
  );
}

/* ---------------- Bit: Digital's mascot, a pocket LCD clock ---------------- */

const bit = (name: string) => sprite(rowsOf(name));

/** Bit per tier: dozing at "Insert coin", up to wild-eyed at "Final boss". */
export const TIER_BITS = ['insert-coin', 'easy', 'level-up', 'hard', 'boss', 'final-boss'].map((n) => bit(`bit-${n}`));

/** Bit's reaction to a result: dozes off, gets knocked out, or sees stars. */
export const RESULT_BITS: Partial<Record<SceneMood, Sprite>> = {
  win: bit('bit-snooze'),
  loss: bit('bit-game-over'),
  jackpot: bit('bit-perfect'),
};

export const LOOK_LEFT = bit('bit-look-left');
export const LOOK_RIGHT = bit('bit-look-right');

/**
 * One frame of Bit, `size` square. Each frame is a 22-pixel cell with the casing at x 2–19,
 * y 2–21; the box is the web's view, cropped close round the casing (1 2 20 20), and the extras
 * (Zs, sweat, sparkles) spill past it.
 */
export const BitSprite = memo(function BitSprite({
  s,
  size,
  style,
}: {
  s: Sprite;
  size: number;
  style?: StyleProp<ViewStyle>;
}) {
  const px = size / 20;
  return (
    <View style={[{ width: size, height: size }, style]}>
      <Svg
        style={{ position: 'absolute', left: -px, top: -2 * px }}
        width={22 * px}
        height={22 * px}
        viewBox="0 0 22 22"
      >
        <Pixels s={s} />
      </Svg>
    </View>
  );
});

/* ---------------- Power-ups: float round the screen, more of them as the bet grows ---------------- */

const POWER_UP_KINDS = ['heart', 'coin', 'star', 'bolt', 'gem', 'key', 'potion', 'clock'] as const;
export type PowerUpKind = (typeof POWER_UP_KINDS)[number];

/** Each power-up in its full 12-pixel cell, so they all come out the same size. */
const POWER_UPS = Object.fromEntries(POWER_UP_KINDS.map((k) => [k, sprite(rowsOf(k))])) as Record<PowerUpKind, Sprite>;

/** One power-up, `size` pt square. */
export const PowerUp = memo(function PowerUp({ kind, size }: { kind: PowerUpKind; size: number }) {
  const s = POWER_UPS[kind];
  return (
    <Svg width={size} height={(size * s.h) / s.w} viewBox={`0 0 ${s.w} ${s.h}`}>
      <Pixels s={s} />
    </Svg>
  );
});

/* ---------------- Lettering ---------------- */

const WORDS = {
  oneUp: sprite(trimmed(rowsOf('one-up'))),
  gameOver: sprite(trimmed(rowsOf('game-over'))),
  perfect: sprite(trimmed(rowsOf('perfect'))),
  continue: sprite(trimmed(rowsOf('continue'))),
};
export type PixelWordKind = keyof typeof WORDS;

/** A word in outlined pixel lettering ("1UP", "PERFECT!"…), `height` pt tall. */
export const PixelWord = memo(function PixelWord({ word, height }: { word: PixelWordKind; height: number }) {
  const s = WORDS[word];
  return (
    <Svg height={height} width={(height * s.w) / s.h} viewBox={`0 0 ${s.w} ${s.h}`}>
      <Pixels s={s} />
    </Svg>
  );
});

/* ---------------- Scenery ---------------- */

const HORIZON_GRID = SPRITES.horizon.layers!;
const HORIZON_GROUND = sprite(HORIZON_GRID.silhouette);
const HORIZON_EDGE = sprite(HORIZON_GRID.edge);
/** The horizon strip's size in pixels (it tiles left to right). */
export const HORIZON_SIZE = { w: SPRITES.horizon.width, h: SPRITES.horizon.height };

/** One tile of the horizon, `height` pt tall: blocky hills and little buildings, its top edge and windows lit in `edge`. */
export const HorizonTile = memo(function HorizonTile({ edge, height }: { edge: string; height: number }) {
  return (
    <Svg
      width={(height * HORIZON_SIZE.w) / HORIZON_SIZE.h}
      height={height}
      viewBox={`0 0 ${HORIZON_SIZE.w} ${HORIZON_SIZE.h}`}
    >
      <Pixels s={HORIZON_GROUND} />
      <Pixels s={HORIZON_EDGE} pal={{ l: edge }} />
    </Svg>
  );
});

const SUNSET = sprite(rowsOf('sunset'));

/** A striped pixel sun, for a perfect result, `width` pt wide. */
export const PixelSunset = memo(function PixelSunset({ width }: { width: number }) {
  return (
    <Svg width={width} height={(width * SUNSET.h) / SUNSET.w} viewBox={`0 0 ${SUNSET.w} ${SUNSET.h}`}>
      <Pixels s={SUNSET} />
    </Svg>
  );
});

/* ---------------- Dial pieces ---------------- */

/** A pixel bell for the dial's handle (10 × 9), drawn in white: recolour its "w" to tint it. */
export const PIXEL_BELL = sprite(trimmed(rowsOf('bell')));

/** The dial's lives (7 × 6): a full heart, and an empty outline for a life already lost (draw its "w"). */
const HEART_BOX = boundsOf(rowsOf('heart-full'));
export const PIXEL_HEART = sprite(trimmed(rowsOf('heart-full'), HEART_BOX));
export const PIXEL_HEART_EMPTY = sprite(trimmed(rowsOf('heart-empty'), HEART_BOX));
