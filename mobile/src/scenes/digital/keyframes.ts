/**
 * Digital's own keyframes, ported from the web app's globals.css (@keyframes lc-*). The shared
 * ones (blink, pulse, fadeIn…) live in ../anim.ts. A few travel the height or width of the
 * screen, so they're made per size (and kept).
 */
import { css } from 'react-native-reanimated';

type KF = ReturnType<typeof css.keyframes>;

/** How bright a pixel ring is between ripples, as a share of its flare (the web's brightness(1.8)). */
export const RIPPLE_REST = 0.55;

export const DKF = {
  /** lc-px-bob: power-ups bob in chunky steps */
  bob: css.keyframes({
    '0%, 100%': { transform: [{ translateY: 0 }] },
    '50%': { transform: [{ translateY: -10 }] },
  }),
  /** lc-coin-flip: a coin flipping over, seen edge-on halfway */
  coinFlip: css.keyframes({
    '0%, 100%': { transform: [{ scaleX: 1 }] },
    '50%': { transform: [{ scaleX: 0.12 }] },
  }),
  /** lc-glitch-bar: a slice of the screen tears sideways for a moment, then it's gone */
  glitch: css.keyframes({
    '0%, 84%, 100%': { opacity: 0, transform: [{ translateX: 0 }] },
    '86%': { opacity: 1, transform: [{ translateX: -28 }] },
    '89%': { opacity: 0.6, transform: [{ translateX: 20 }] },
    '92%': { opacity: 1, transform: [{ translateX: -8 }] },
    '95%': { opacity: 0, transform: [{ translateX: 0 }] },
  }),
  /** lc-px-jolt: final boss, every so often the whole screen jolts */
  jolt: css.keyframes({
    '0%, 90%, 100%': { transform: [{ translateX: 0 }, { translateY: 0 }] },
    '91%': { transform: [{ translateX: -4 }, { translateY: 2 }] },
    '93%': { transform: [{ translateX: 4 }, { translateY: -2 }] },
    '95%': { transform: [{ translateX: -2 }, { translateY: 0 }] },
  }),
  /** lc-crt-off: game over, the picture collapses to a bright line, then a dot, then it's gone */
  crtOff: css.keyframes({
    '0%': { opacity: 0, transform: [{ scaleX: 1 }, { scaleY: 40 }] },
    '12%': { opacity: 1, transform: [{ scaleX: 1 }, { scaleY: 1 }] },
    '55%': { opacity: 1, transform: [{ scaleX: 0.02 }, { scaleY: 1 }] },
    '70%': { opacity: 1, transform: [{ scaleX: 0.006 }, { scaleY: 2.5 }] },
    '100%': { opacity: 0, transform: [{ scaleX: 0.006 }, { scaleY: 2.5 }] },
  }),
  /**
   * lc-px-ripple: one ring at a time flares, rippling outward. The web brightens it with a
   * filter; here the ring is drawn at its flared strength and dimmed the rest of the time.
   */
  ripple: css.keyframes({
    '0%, 100%': { opacity: RIPPLE_REST },
    '12%': { opacity: 1 },
    '24%': { opacity: RIPPLE_REST },
  }),
  /**
   * Three copies of the grid, a third of the colour wheel apart, taking turns (for the web's
   * hue-rotate): each holds for a third of the cycle, with a quick crossfade into the next.
   */
  hue: css.keyframes({
    '0%, 28%': { opacity: 1 },
    '33.3%, 95%': { opacity: 0 },
    '100%': { opacity: 1 },
  }),
  /** lc-bit-hop: Bit hops on the spot, squashing as it lands */
  bitHop: css.keyframes({
    '0%, 100%': { transform: [{ translateY: 0 }, { scaleX: 1.08 }, { scaleY: 0.92 }] },
    '18%': { transform: [{ translateY: 0 }, { scaleX: 1 }, { scaleY: 1 }] },
    '50%': { transform: [{ translateY: -12 }, { scaleX: 0.96 }, { scaleY: 1.04 }] },
    '82%': { transform: [{ translateY: 0 }, { scaleX: 1 }, { scaleY: 1 }] },
  }),
  /** lc-bit-shadow: ...and its shadow shrinks while it's in the air */
  bitShadow: css.keyframes({
    '0%, 100%': { opacity: 0.55, transform: [{ scaleX: 1 }] },
    '50%': { opacity: 0.25, transform: [{ scaleX: 0.6 }] },
  }),
  /** lc-px-swap: two frames swapping (Bit's eyes darting left and right) */
  swap: css.keyframes({
    '0%, 49.9%': { opacity: 1 },
    '50%, 100%': { opacity: 0 },
  }),
  /** lc-px-shake: knocked out, a few hard shakes */
  shake: css.keyframes({
    '0%, 100%': { transform: [{ translateX: 0 }] },
    '25%': { transform: [{ translateX: -3 }] },
    '75%': { transform: [{ translateX: 3 }] },
  }),
  /** lc-mu-pop: popping up beside the result */
  pop: css.keyframes({
    '0%': { transform: [{ scale: 0 }, { rotate: '-40deg' }] },
    '60%': { transform: [{ scale: 1.18 }, { rotate: '8deg' }] },
    '100%': { transform: [{ scale: 1 }, { rotate: '0deg' }] },
  }),
};

function cached(store: Map<string, KF>, key: string, make: () => KF) {
  let kf = store.get(key);
  if (!kf) {
    kf = make();
    store.set(key, kf);
  }
  return kf;
}
const SIZED = new Map<string, KF>();

/** lc-warp: a streak shoots out from the middle of the screen (75vw), along its parent's angle. */
export const warpKF = (width: number) =>
  cached(SIZED, `warp${Math.round(width)}`, () =>
    css.keyframes({
      '0%': { opacity: 0, transform: [{ translateX: 12 }, { scaleX: 0.2 }] },
      '25%': { opacity: 1 },
      '100%': { opacity: 0.9, transform: [{ translateX: Math.round(width * 0.75) }, { scaleX: 1.6 }] },
    }),
  );

/** lc-px-rise: a heart, a coin or a 1UP floats up the screen (75vh). */
export const riseKF = (height: number) =>
  cached(SIZED, `rise${Math.round(height)}`, () =>
    css.keyframes({
      '0%': { opacity: 0, transform: [{ translateY: 20 }] },
      '10%': { opacity: 1 },
      '80%': { opacity: 1 },
      '100%': { opacity: 0, transform: [{ translateY: -Math.round(height * 0.75) }] },
    }),
  );

/** lc-coin-fall: pixel confetti falls the height of the screen, tumbling a few quarter turns. */
export const fallKF = (height: number, spin: number) =>
  cached(SIZED, `fall${Math.round(height)}:${spin}`, () =>
    css.keyframes({
      '0%': { opacity: 0, transform: [{ translateY: 0 }, { rotate: '0deg' }] },
      '8%': { opacity: 1 },
      '85%': { opacity: 1 },
      '100%': { opacity: 0, transform: [{ translateY: Math.round(height * 1.15) }, { rotate: `${spin}deg` }] },
    }),
  );

/** lc-scanroll: a CRT's refresh band rolling down the screen. */
export const scanrollKF = (height: number) =>
  cached(SIZED, `scan${Math.round(height)}`, () =>
    css.keyframes({
      from: { transform: [{ translateY: 0 }] },
      to: { transform: [{ translateY: Math.round(height + 320) }] },
    }),
  );
