/**
 * Classic's own keyframes, ported from the web app's globals.css (the "Classic sunrise scene"
 * block). The shared ones (lc-bob, lc-twinkle, lc-spin, lc-pulse) come from ../anim.
 * Lengths are in pt; the village's are in its art units, so they're built for a given scale.
 */
import { css } from 'react-native-reanimated';

/** lc-drift: clouds and birds cross the whole scene, starting just off the left edge. */
const drifts = new Map<number, ReturnType<typeof css.keyframes>>();
export function driftFor(width: number) {
  let kf = drifts.get(width);
  if (!kf) {
    kf = css.keyframes({
      from: { transform: [{ translateX: -320 }] },
      to: { transform: [{ translateX: width + 40 }] },
    });
    drifts.set(width, kf);
  }
  return kf;
}

/** lc-flap: wings sweep down and back up. */
export const FLAP = css.keyframes({
  '0%, 100%': { transform: [{ scaleY: 1 }] },
  '50%': { transform: [{ scaleY: -0.45 }] },
});

/** lc-glint: a four-point sparkle winking across the sky. */
export const GLINT = css.keyframes({
  '0%, 100%': { opacity: 0, transform: [{ scale: 0.3 }, { rotate: '0deg' }] },
  '50%': { opacity: 1, transform: [{ scale: 1 }, { rotate: '45deg' }] },
});

/** lc-sun-wake: the rising sun pops a little each time it wakes up a bit more. */
export const SUN_WAKE = css.keyframes({
  '0%': { transform: [{ scale: 0.88 }] },
  '60%': { transform: [{ scale: 1.08 }] },
  '100%': { transform: [{ scale: 1 }] },
});

/** lc-mu-pop: popping up beside the result. */
export const POP = css.keyframes({
  '0%': { transform: [{ scale: 0 }, { rotate: '-40deg' }] },
  '60%': { transform: [{ scale: 1.18 }, { rotate: '8deg' }] },
  '100%': { transform: [{ scale: 1 }, { rotate: '0deg' }] },
});

/** The rising sun's climb over the progress bar: from below the horizon to just clear of it. */
export const SUN_RISE = css.keyframes({
  from: { transform: [{ translateY: 76 }] },
  to: { transform: [{ translateY: 14 }] },
});

/** lc-rooster-look: one way, then the other, while the draw rolls (a hard flip, like steps(1)). */
export const ROOSTER_LOOK = css.keyframes({
  '0%, 49.9%': { transform: [{ scaleX: 1 }] },
  '50%, 100%': { transform: [{ scaleX: -1 }] },
});

/** lc-rooster-breathe: asleep on the post, a slow breath. */
export const ROOSTER_BREATHE = css.keyframes({
  '0%, 100%': { transform: [{ scaleX: 1 }, { scaleY: 1 }] },
  '50%': { transform: [{ scaleX: 1.015 }, { scaleY: 0.985 }] },
});

/** The village's keyframes, whose distances are in its art units: built per scale (pt per unit). */
const village = new Map<number, ReturnType<typeof villageKeyframes>>();
export function villageFor(scale: number) {
  let kf = village.get(scale);
  if (!kf) {
    kf = villageKeyframes(scale);
    village.set(scale, kf);
  }
  return kf;
}

function villageKeyframes(s: number) {
  return {
    /** lc-puff: chimney smoke swells as it rises and drifts off. */
    puff: css.keyframes({
      '0%': { opacity: 0, transform: [{ translateX: 0 }, { translateY: 0 }, { scale: 0.5 }] },
      '15%': { opacity: 0.85 },
      '100%': { opacity: 0, transform: [{ translateX: 14 * s }, { translateY: -58 * s }, { scale: 2.2 }] },
    }),
    /** lc-zzz: a z drifting up off the sleeping rooster. */
    zzz: css.keyframes({
      '0%': {
        opacity: 0,
        transform: [{ translateX: 0 }, { translateY: 0 }, { scale: 0.6 }, { rotate: '-12deg' }],
      },
      '20%': { opacity: 0.9 },
      '100%': {
        opacity: 0,
        transform: [{ translateX: 22 * s }, { translateY: -48 * s }, { scale: 1.15 }, { rotate: '10deg' }],
      },
    }),
    /** lc-ring-mark: the rooster's crow, pulsing out of his beak. */
    ringMark: css.keyframes({
      '0%': { opacity: 0, transform: [{ translateX: -4 * s }] },
      '40%': { opacity: 1 },
      '100%': { opacity: 0, transform: [{ translateX: 4 * s }] },
    }),
    /** lc-rooster-strut: right on time, chest out, strutting on the spot. */
    strut: css.keyframes({
      '0%, 100%': { transform: [{ translateY: 0 }, { rotate: '0deg' }] },
      '50%': { transform: [{ translateY: -1.5 * s }, { rotate: '-2deg' }] },
    }),
  };
}
