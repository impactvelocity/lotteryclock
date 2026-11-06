/**
 * Caffè's own keyframes, ported from the web app's globals.css (the "Caffè scene" block, plus
 * lc-drift, lc-flap, lc-flicker and lc-mu-pop). The shared ones (lc-bob, lc-spin) come from
 * ../anim. Lengths are in pt; where the web's are in an illustration's own units, the keyframes
 * are built (and cached) for a given scale.
 */
import { css } from 'react-native-reanimated';

type Keyframes = ReturnType<typeof css.keyframes>;

/** Build keyframes once per key (a width or a scale), then reuse them. */
function cached<K>(make: (k: K) => Keyframes) {
  const cache = new Map<K, Keyframes>();
  return (k: K) => {
    let kf = cache.get(k);
    if (!kf) {
      kf = make(k);
      cache.set(k, kf);
    }
    return kf;
  };
}

/** lc-drift: clouds and swallows cross the whole scene, starting just off the left edge. */
export const driftFor = cached((width: number) =>
  css.keyframes({
    from: { transform: [{ translateX: -320 }] },
    to: { transform: [{ translateX: width + 40 }] },
  }),
);

/** lc-cafe-ride: the Vespa crosses the street, then a pause before it's back. */
export const rideFor = cached((width: number) =>
  css.keyframes({
    '0%': { transform: [{ translateX: -120 }] },
    '60%, 100%': { transform: [{ translateX: width + 40 }] },
  }),
);

/** lc-cafe-steam: a wisp rises off the cup, swelling and fading (`u`: pt per steam unit). */
export const steamFor = cached((u: number) =>
  css.keyframes({
    '0%': { opacity: 0, transform: [{ translateY: 14 * u }, { scaleX: 0.7 }] },
    '30%': { opacity: 1 },
    '100%': { opacity: 0, transform: [{ translateY: -34 * u }, { scaleX: 1.25 }] },
  }),
);

/** lc-cafe-puff: a puff of steam off the moka (`u`: pt per moka unit). */
export const puffFor = cached((u: number) =>
  css.keyframes({
    '0%': { opacity: 0, transform: [{ translateX: 0 }, { translateY: 0 }, { scale: 0.4 }] },
    '20%': { opacity: 1 },
    '100%': { opacity: 0, transform: [{ translateX: -3 * u }, { translateY: -14 * u }, { scale: 1.7 }] },
  }),
);

/** lc-cafe-bump: the Vespa bumping over the cobbles (`u`: pt per Vespa unit). */
export const bumpFor = cached((u: number) =>
  css.keyframes({
    '0%, 100%': { transform: [{ translateY: 0 }] },
    '50%': { transform: [{ translateY: -1.4 * u }] },
  }),
);

/** lc-flap: wings sweep down and back up. */
export const FLAP = css.keyframes({
  '0%, 100%': { transform: [{ scaleY: 1 }] },
  '50%': { transform: [{ scaleY: -0.45 }] },
});

/** lc-cafe-swoop: swallows dip and climb as they fly. */
export const SWOOP = css.keyframes({
  '0%, 100%': { transform: [{ translateY: 0 }, { rotate: '-3deg' }] },
  '50%': { transform: [{ translateY: 38 }, { rotate: '5deg' }] },
});

/** lc-cafe-rattle: the moka rattling on the stove. */
export const RATTLE = css.keyframes({
  '0%, 100%': { transform: [{ translateX: 0 }, { rotate: '0deg' }] },
  '25%': { transform: [{ translateX: -1 }, { rotate: '-2.5deg' }] },
  '75%': { transform: [{ translateX: 1 }, { rotate: '2.5deg' }] },
});

/** lc-cafe-doze: dozing off, a slow nod. */
export const DOZE = css.keyframes({
  '0%, 100%': { transform: [{ rotate: '0deg' }, { translateY: 0 }] },
  '50%': { transform: [{ rotate: '-7deg' }, { translateY: 1 }] },
});

/** lc-cafe-scarf: the rider's scarf streaming out behind. */
export const SCARF = css.keyframes({
  '0%, 100%': { transform: [{ rotate: '0deg' }, { scaleY: 1 }] },
  '50%': { transform: [{ rotate: '-6deg' }, { scaleY: 0.8 }] },
});

/** lc-flicker: the gas ring's little flames. */
export const FLICKER = css.keyframes({
  '0%, 100%': { transform: [{ scaleX: 1 }, { scaleY: 1 }, { skewX: '0deg' }] },
  '20%': { transform: [{ scaleX: 0.94 }, { scaleY: 1.08 }, { skewX: '2.5deg' }] },
  '45%': { transform: [{ scaleX: 1.05 }, { scaleY: 0.93 }, { skewX: '-2deg' }] },
  '70%': { transform: [{ scaleX: 0.97 }, { scaleY: 1.05 }, { skewX: '1.5deg' }] },
});

/** lc-mu-pop: popping up beside the result. */
export const POP = css.keyframes({
  '0%': { transform: [{ scale: 0 }, { rotate: '-40deg' }] },
  '60%': { transform: [{ scale: 1.18 }, { rotate: '8deg' }] },
  '100%': { transform: [{ scale: 1 }, { rotate: '0deg' }] },
});

/** lc-cafe-heart: a heart floats up round the clock, drifting `dx` sideways. */
export const heartFor = cached((dx: number) =>
  css.keyframes({
    '0%': { opacity: 0, transform: [{ translateX: 0 }, { translateY: 0 }, { scale: 0.3 }] },
    '15%': { opacity: 1, transform: [{ translateX: 0 }, { translateY: -12 }, { scale: 1 }] },
    '100%': { opacity: 0, transform: [{ translateX: dx }, { translateY: -130 }, { scale: 0.85 }] },
  }),
);
