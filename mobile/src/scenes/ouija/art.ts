/**
 * Ouija's palette, shapes and keyframes (web: the top of ouija-scene.tsx and the lc-* keyframes
 * in globals.css), shared by the scene, the spirit ring, the roll and the film overlay.
 */
import { css } from 'react-native-reanimated';

import { frac } from '@/lib/rand';

/** Antique gold, for the engraved line work. */
export const GOLD = '#C9A55A';
export const BONE = '#ECE3CF';
export const EMBER = '#FF6A2B';
/** Geist Serif's Triangle cut (the theme's title font): every dot is a little triangle. */
export const SERIF = 'GeistSerif-Triangle';

export const clamp = (n: number) => Math.max(0, Math.min(1, n));

/** A four-point star on a 24-unit grid, pinched thin like an engraving. */
export const STAR =
  'M12 0C12.6 8.2 15.8 11.4 24 12 15.8 12.6 12.6 15.8 12 24 11.4 15.8 8.2 12.6 0 12 8.2 11.4 11.4 8.2 12 0z';

export const OK = {
  /** lc-twinkle, opacity only (for whole groups of stars) */
  twinkle: css.keyframes({
    '0%, 100%': { opacity: 0.15 },
    '50%': { opacity: 1 },
  }),
  /** lc-flame: a candle flame stretching and leaning */
  flame: css.keyframes({
    '0%, 100%': { transform: [{ scaleX: 1 }, { scaleY: 1 }, { skewX: '0deg' }] },
    '20%': { transform: [{ scaleX: 0.92 }, { scaleY: 1.1 }, { skewX: '-3deg' }] },
    '45%': { transform: [{ scaleX: 1.05 }, { scaleY: 0.94 }, { skewX: '2deg' }] },
    '70%': { transform: [{ scaleX: 0.96 }, { scaleY: 1.06 }, { skewX: '-1deg' }] },
  }),
  /** lc-candle-glow: the pool of light breathing with the flame */
  glow: css.keyframes({
    '0%, 100%': { opacity: 1 },
    '30%': { opacity: 0.78 },
    '55%': { opacity: 0.95 },
    '80%': { opacity: 0.7 },
  }),
  /** lc-smoke: a thread of smoke off a snuffed wick */
  smoke: css.keyframes({
    '0%': { opacity: 0, transform: [{ translateY: 2 }] },
    '25%': { opacity: 0.45 },
    '100%': { opacity: 0, transform: [{ translateY: -10 }] },
  }),
  /** lc-grain: film grain jumping about a few times a second (run with steps(1)) */
  grain: css.keyframes({
    '0%': { transform: [{ translateX: 0 }, { translateY: 0 }] },
    '17%': { transform: [{ translateX: -28 }, { translateY: 18 }] },
    '33%': { transform: [{ translateX: 22 }, { translateY: -31 }] },
    '50%': { transform: [{ translateX: -13 }, { translateY: -9 }] },
    '67%': { transform: [{ translateX: 31 }, { translateY: 23 }] },
    '83%': { transform: [{ translateX: -21 }, { translateY: 29 }] },
    '100%': { transform: [{ translateX: 0 }, { translateY: 0 }] },
  }),
  /** lc-scratch: a scratch on the print skipping sideways and flickering (run with steps(1)) */
  scratch: css.keyframes({
    '0%': { opacity: 1, transform: [{ translateX: 0 }] },
    '22%': { opacity: 0.4, transform: [{ translateX: 3 }] },
    '41%': { opacity: 1, transform: [{ translateX: -2 }] },
    '63%': { opacity: 0, transform: [{ translateX: 1 }] },
    '71%': { opacity: 0.8, transform: [{ translateX: -4 }] },
    '100%': { opacity: 0.8, transform: [{ translateX: -4 }] },
  }),
  /** lc-film-speck: a speck on the print, there for a frame (run with steps(1)) */
  speck: css.keyframes({
    '0%, 96%': { opacity: 0 },
    '97%, 100%': { opacity: 1 },
  }),
  /** lc-film-leak: a warm light leak breathing in */
  leak: css.keyframes({
    '0%, 100%': { opacity: 0 },
    '40%': { opacity: 0.08 },
    '55%': { opacity: 0.05 },
    '70%': { opacity: 0.09 },
  }),
};

/**
 * Film grain as vector specks (react-native-svg has no feTurbulence): `n` tiny squares
 * scattered over a `size` tile, as one path, so a Pattern can repeat it. Deterministic.
 */
export function grainPath(n: number, size: number, salt: number, min = 0.5, max = 1.2) {
  let d = '';
  for (let i = 0; i < n; i++) {
    const x = Math.round(frac(i, salt) * size * 10) / 10;
    const y = Math.round(frac(i, salt + 1) * size * 10) / 10;
    const s = Math.round((min + frac(i, salt + 2) * (max - min)) * 10) / 10;
    d += `M${x} ${y}h${s}v${s}h${-s}z`;
  }
  return d;
}
