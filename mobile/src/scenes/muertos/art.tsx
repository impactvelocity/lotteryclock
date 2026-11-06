/**
 * Día de Muertos illustrations, ported from web/src/components/scenes/muertos-art.tsx. The art
 * itself is the web app's SVGs (art/muertos, via <Art>); these components place it, colour it
 * and animate it. Keyframes ported from the web's globals.css (@keyframes lc-*) live here too.
 */
import { memo } from 'react';
import { View } from 'react-native';
import { css } from 'react-native-reanimated';
import Svg, { Circle, Ellipse, Path, Rect } from 'react-native-svg';

import { ART, Art, type ArtKey } from '../art';

export const MU = {
  bone: '#F6EBD3',
  wax: '#F3E6CC',
  navy: '#141A33',
  rose: '#F0306E',
  red: '#E8461E',
  orange: '#FF7A1F',
  marigold: '#FFC23D',
  gold: '#FFD45A',
  teal: '#2FB8A6',
  leaf: '#2E9C8A',
  purple: '#9A5BE0',
  sky: '#5BC0F0',
  stone: '#1D2752',
  stoneInk: '#2B3768',
};

export const clamp = (n: number) => Math.max(0, Math.min(1, n));

/** An art file's markup without its <svg> wrapper, to compose several pieces into one SVG. */
export function innerXml(name: ArtKey): string {
  return ART[name].replace(/^<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
}

/* ------------------------------------------------------------------ keyframes */

export const MK = {
  /** lc-twinkle, opacity only (for whole groups of stars, which mustn't scale as one) */
  twinkle: css.keyframes({
    '0%, 100%': { opacity: 0.15 },
    '50%': { opacity: 1 },
  }),
  /** lc-flicker: a candle flame stretching and leaning */
  flicker: css.keyframes({
    '0%, 100%': { transform: [{ scaleX: 1 }, { scaleY: 1 }, { skewX: '0deg' }] },
    '20%': { transform: [{ scaleX: 0.94 }, { scaleY: 1.08 }, { skewX: '2.5deg' }] },
    '45%': { transform: [{ scaleX: 1.05 }, { scaleY: 0.93 }, { skewX: '-2deg' }] },
    '70%': { transform: [{ scaleX: 0.97 }, { scaleY: 1.05 }, { skewX: '1.5deg' }] },
  }),
  /** lc-sway: a flag swinging on its string */
  sway: css.keyframes({
    '0%, 100%': { transform: [{ rotate: '-4deg' }, { skewX: '0deg' }] },
    '50%': { transform: [{ rotate: '4deg' }, { skewX: '0deg' }] },
  }),
  /**
   * lc-sway and lc-flutter in one (the web nests them): a flag flapping fast in the wind,
   * still leaning a little either way.
   */
  gust: css.keyframes({
    '0%, 100%': { transform: [{ rotate: '-3deg' }, { skewX: '0deg' }] },
    '30%': { transform: [{ rotate: '8deg' }, { skewX: '-5deg' }] },
    '65%': { transform: [{ rotate: '-7deg' }, { skewX: '4deg' }] },
  }),
  /** lc-mu-smoke: a wisp curling up off a snuffed wick */
  smoke: css.keyframes({
    '0%': { opacity: 0, transform: [{ translateX: 0 }, { translateY: 0 }, { scale: 0.7 }] },
    '20%': { opacity: 0.6 },
    '100%': { opacity: 0, transform: [{ translateX: 3 }, { translateY: -26 }, { scale: 1.5 }] },
  }),
  /** lc-mu-jolt: a headstone rattling as whoever's under it gets up */
  jolt: css.keyframes({
    '0%, 30%, 100%': { transform: [{ rotate: '0deg' }] },
    '4%': { transform: [{ rotate: '-4deg' }] },
    '8%': { transform: [{ rotate: '4deg' }] },
    '12%': { transform: [{ rotate: '-3deg' }] },
    '16%': { transform: [{ rotate: '3deg' }] },
    '20%': { transform: [{ rotate: '-1.5deg' }] },
    '25%': { transform: [{ rotate: '1.5deg' }] },
  }),
  /** lc-mu-rise: a hand bursting up out of the ground */
  rise: css.keyframes({
    '0%': { transform: [{ translateY: 54 }] },
    '62%': { transform: [{ translateY: -5 }] },
    '82%': { transform: [{ translateY: 1.5 }] },
    '100%': { transform: [{ translateY: 0 }] },
  }),
  /** lc-mu-wave */
  wave: css.keyframes({
    '0%, 100%': { transform: [{ rotate: '-10deg' }] },
    '50%': { transform: [{ rotate: '10deg' }] },
  }),
  /** lc-mu-maraca */
  maraca: css.keyframes({
    '0%, 100%': { transform: [{ rotate: '-30deg' }] },
    '50%': { transform: [{ rotate: '14deg' }] },
  }),
  /** lc-mu-dance: hop and rock */
  dance: css.keyframes({
    '0%, 100%': { transform: [{ translateY: 0 }, { rotate: '-10deg' }] },
    '25%': { transform: [{ translateY: -7 }, { rotate: '0deg' }] },
    '50%': { transform: [{ translateY: 0 }, { rotate: '10deg' }] },
    '75%': { transform: [{ translateY: -7 }, { rotate: '0deg' }] },
  }),
  /** lc-mu-doze: nodding off */
  doze: css.keyframes({
    '0%, 100%': { transform: [{ rotate: '-7deg' }, { translateY: 0 }] },
    '50%': { transform: [{ rotate: '5deg' }, { translateY: 2 }] },
  }),
  /** lc-mu-pop: popping up as the result lands */
  pop: css.keyframes({
    '0%': { transform: [{ scale: 0 }, { rotate: '-40deg' }] },
    '60%': { transform: [{ scale: 1.18 }, { rotate: '8deg' }] },
    '100%': { transform: [{ scale: 1 }, { rotate: '0deg' }] },
  }),
};

/** lc-mu-seed / lc-mu-dirt: something flung out to (dx, dy), fading as it goes. */
export function flung(dx: number, dy: number, from = 0.5) {
  return css.keyframes({
    '0%': { opacity: 0, transform: [{ translateX: 0 }, { translateY: 0 }, { scale: from }] },
    '25%': { opacity: 1 },
    '100%': { opacity: 0, transform: [{ translateX: dx }, { translateY: dy }, { scale: 1 }] },
  });
}

/* ------------------------------------------------------------------ papel picado */

export const FLAG_DESIGNS = ['skull', 'flower', 'heart', 'star'] as const;
export type FlagDesign = (typeof FLAG_DESIGNS)[number];

/** The one evenodd path of a flag's art file (the cut-outs are holes), so flags draw without parsing XML. */
const FLAG_PATHS = Object.fromEntries(
  FLAG_DESIGNS.map((d) => [d, ART[`muertos/papel-picado-${d}`].match(/ d="([^"]+)"/)?.[1] ?? '']),
) as Record<FlagDesign, string>;

/** A papel picado flag (40 × 50 grid), `width` wide. */
export const PapelFlag = memo(function PapelFlag({
  design,
  color,
  width,
}: {
  design: FlagDesign;
  color: string;
  width: number;
}) {
  return (
    <Svg viewBox="0 0 40 50" width={width} height={width * 1.25}>
      <Path d={FLAG_PATHS[design]} fill={color} fillRule="evenodd" />
      {/* The fold over the string catches a little light */}
      <Rect width={40} height={3} fill="rgba(255,255,255,0.28)" />
    </Svg>
  );
});

/* ------------------------------------------------------------------ in the air */

/** A single marigold petal (10 × 14 grid), in the given colour. */
export const Petal = memo(function Petal({ size, color }: { size: number; color: string }) {
  return (
    <Svg viewBox="0 0 10 14" width={size} height={size * 1.4}>
      <Path
        d="M5 0C5.8 2.1 8.4 3.2 8.8 5.1C10.8 6.6 9.3 8 9.5 9.5C9.4 12.1 7.4 14 5 14C2.6 14 .6 12.1 .5 9.5C.7 8-.8 6.6 1.2 5.1C1.6 3.2 4.2 2.1 5 0Z"
        fill={color}
      />
      <Path
        d="M5 3C4.2 6 5.9 9 5 11.8"
        fill="none"
        stroke={MU.navy}
        strokeWidth={0.7}
        strokeLinecap="round"
        opacity={0.18}
      />
    </Svg>
  );
});

/** A maraca (20 × 44 grid), painted like the one the dancing calavera holds. */
export const Maraca = memo(function Maraca({ width, height }: { width: number; height: number }) {
  return (
    <Svg viewBox="0 0 20 44" width={width} height={height}>
      <Rect x={8.4} y={18} width={3.2} height={25} rx={1.6} fill={MU.teal} />
      <Ellipse cx={10} cy={11} rx={8.5} ry={10.5} fill={MU.orange} />
      <Path d="M1.7 9.2Q10 14.6 18.3 9.2L18.5 12.8Q10 18.6 1.5 12.8Z" fill={MU.rose} />
      <Circle cx={6.5} cy={5.4} r={1.3} fill={MU.gold} />
      <Circle cx={11.8} cy={4.2} r={1.3} fill={MU.gold} />
      <Circle cx={7.6} cy={17.4} r={1.1} fill={MU.gold} />
      <Circle cx={12.6} cy={17} r={1.1} fill={MU.gold} />
    </Svg>
  );
});

/* ------------------------------------------------------------------ the mascot */

const FACES: ArtKey[] = [
  'muertos/calavera-rest',
  'muertos/calavera-candle',
  'muertos/calavera-marigold',
  'muertos/calavera-dance',
  'muertos/calavera-spirits',
  'muertos/calavera-back',
];

/**
 * The calavera mascot (180 × 180 grid), one face per bet tier: resting in peace, a candle in
 * its eye, marigold eyes, dancing with a maraca, monarchs circling, flames over its head.
 */
export const CalaveraFace = memo(function CalaveraFace({ tier, size }: { tier: number; size: number }) {
  return (
    <View style={{ width: size, height: size }}>
      <Art name={FACES[Math.max(0, Math.min(FACES.length - 1, tier))]} width={size} height={size} />
    </View>
  );
});
