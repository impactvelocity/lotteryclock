/**
 * Night's own keyframes, ported from the web app's globals.css (@keyframes lc-*). The shared
 * ones (twinkle, bob, blink…) live in ../anim.ts.
 */
import { css, cubicBezier } from 'react-native-reanimated';

export const NKF = {
  /** lc-twinkle without the scale, for a whole layer of stars at once */
  glimmer: css.keyframes({
    '0%, 100%': { opacity: 0.15 },
    '50%': { opacity: 1 },
  }),
  /** lc-shoot: a quick streak down and to the left, then a long wait */
  shoot: css.keyframes({
    '0%': { opacity: 0, transform: [{ translateX: 0 }, { translateY: 0 }, { rotate: '-26.5deg' }] },
    '2%': { opacity: 1 },
    '10%': { opacity: 0, transform: [{ translateX: -280 }, { translateY: 140 }, { rotate: '-26.5deg' }] },
    '100%': { opacity: 0, transform: [{ translateX: -280 }, { translateY: 140 }, { rotate: '-26.5deg' }] },
  }),
  /** lc-beacon: a red aircraft beacon */
  beacon: css.keyframes({
    '0%, 100%': { opacity: 0.2 },
    '12%': { opacity: 1 },
    '30%': { opacity: 0.2 },
  }),
  /** lc-tv: the flicker of a TV left on (run with steps(1)) */
  tv: css.keyframes({
    '0%': { opacity: 0.85 },
    '25%': { opacity: 0.5 },
    '45%': { opacity: 0.95 },
    '70%, 100%': { opacity: 0.65 },
  }),
  /** lc-corona: the lunar corona (and the full moon on the phase ring) breathing at the full 45 */
  corona: css.keyframes({
    '0%, 100%': { opacity: 0.8, transform: [{ scale: 1 }] },
    '50%': { opacity: 1, transform: [{ scale: 1.015 }] },
  }),
  /** A bat's wingbeat: slides a strip of frames past a window (run with steps(frames)) */
  flap: css.keyframes({
    from: { transform: [{ translateX: '0%' }] },
    to: { transform: [{ translateX: '-100%' }] },
  }),

  /*
   * Counting sheep: run across the lane, hop the fence in the middle, switch to the jumping pose
   * in the air. The web fades the lane's ends with a mask; here the run fades the sheep in and
   * out over the same stretch (18% of the lane at each end).
   */
  sheepRun: css.keyframes({
    '0%': { opacity: 0, transform: [{ translateX: -44 }] },
    '11.5%': { opacity: 0 },
    '25.4%': { opacity: 1 },
    '74.6%': { opacity: 1 },
    '88.5%': { opacity: 0 },
    '100%': { opacity: 0, transform: [{ translateX: 164 }] },
  }),
  sheepHop: css.keyframes({
    '0%, 32%': { transform: [{ translateY: 0 }], animationTimingFunction: cubicBezier(0.2, 0.7, 0.4, 1) },
    '50%': { transform: [{ translateY: -19 }], animationTimingFunction: cubicBezier(0.6, 0, 0.8, 0.3) },
    '68%, 100%': { transform: [{ translateY: 0 }] },
  }),
  sheepGround: css.keyframes({
    '0%, 32.9%': { opacity: 1 },
    '33%, 67%': { opacity: 0 },
    '67.1%, 100%': { opacity: 1 },
  }),
  sheepAir: css.keyframes({
    '0%, 32.9%': { opacity: 0 },
    '33%, 67%': { opacity: 1 },
    '67.1%, 100%': { opacity: 0 },
  }),
  /** lc-count-pop: the count popping up as each sheep clears the fence */
  countPop: css.keyframes({
    '0%': { opacity: 0, transform: [{ translateY: 6 }, { scale: 0.5 }] },
    '45%': { opacity: 1, transform: [{ translateY: 0 }, { scale: 1.2 }] },
    '100%': { opacity: 1, transform: [{ translateY: 0 }, { scale: 1 }] },
  }),
};

/**
 * lc-drift: clouds and bats cross the whole scene, starting just off the left edge. Its end
 * depends on the screen's width, so it's made per width (and kept).
 */
const drifts = new Map<number, ReturnType<typeof css.keyframes>>();
export function driftKF(width: number) {
  const w = Math.round(width);
  let kf = drifts.get(w);
  if (!kf) {
    kf = css.keyframes({
      from: { transform: [{ translateX: -320 }] },
      to: { transform: [{ translateX: w + 40 }] },
    });
    drifts.set(w, kf);
  }
  return kf;
}
