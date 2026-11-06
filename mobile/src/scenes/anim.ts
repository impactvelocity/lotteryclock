/**
 * Shared keyframes, ported from the web app's globals.css (@keyframes lc-*), for Reanimated 4's
 * CSS animations. Use them on an Animated.View (or an animated react-native-svg element):
 *
 *   <Animated.View style={{ animationName: KF.float, animationDuration: '4s',
 *     animationIterationCount: 'infinite', animationTimingFunction: 'ease-in-out',
 *     animationDelay: '-1.2s' }} />
 *
 * Theme scenes define their own keyframes next to them with css.keyframes(); only the ones
 * several themes share live here. Transforms are in pt (the web's px), angles as '12deg'.
 */
import { css } from 'react-native-reanimated';

export const KF = {
  /** lc-float: bob up and grow a touch */
  float: css.keyframes({
    '0%, 100%': { transform: [{ translateY: 0 }, { scale: 1 }] },
    '50%': { transform: [{ translateY: -12 }, { scale: 1.18 }] },
  }),
  /** lc-spin */
  spin: css.keyframes({
    from: { transform: [{ rotate: '0deg' }] },
    to: { transform: [{ rotate: '360deg' }] },
  }),
  /** lc-pulse */
  pulse: css.keyframes({
    '0%, 100%': { transform: [{ scale: 1 }] },
    '50%': { transform: [{ scale: 1.07 }] },
  }),
  /** lc-blink */
  blink: css.keyframes({
    '0%, 100%': { opacity: 1 },
    '50%': { opacity: 0.3 },
  }),
  /** lc-shake */
  shake: css.keyframes({
    '0%, 100%': { transform: [{ translateX: 0 }, { rotate: '0deg' }] },
    '25%': { transform: [{ translateX: -2 }, { rotate: '-0.5deg' }] },
    '75%': { transform: [{ translateX: 2 }, { rotate: '0.5deg' }] },
  }),
  /** lc-twinkle */
  twinkle: css.keyframes({
    '0%, 100%': { opacity: 0.15, transform: [{ scale: 0.7 }] },
    '50%': { opacity: 1, transform: [{ scale: 1 }] },
  }),
  /** lc-ring: a bell wobbling */
  ring: css.keyframes({
    '0%, 100%': { transform: [{ rotate: '0deg' }] },
    '25%': { transform: [{ rotate: '-14deg' }] },
    '75%': { transform: [{ rotate: '14deg' }] },
  }),
  /** Gentle side-to-side sway */
  sway: css.keyframes({
    '0%, 100%': { transform: [{ rotate: '-3deg' }] },
    '50%': { transform: [{ rotate: '3deg' }] },
  }),
  /** Slow up-down bob, 6pt */
  bob: css.keyframes({
    '0%, 100%': { transform: [{ translateY: 0 }] },
    '50%': { transform: [{ translateY: -6 }] },
  }),
  /** Fade in from nothing */
  fadeIn: css.keyframes({
    from: { opacity: 0 },
    to: { opacity: 1 },
  }),

  // ── Used by the core Play screen (dial, rail, status) ──
  /** lc-bulb-chase: marquee chase round lit bulbs */
  chase: css.keyframes({
    '0%, 30%': { opacity: 1 },
    '36%, 100%': { opacity: 0.38 },
  }),
  /** lc-bulb-attract: one dim glint travelling round unlit bulbs */
  attract: css.keyframes({
    '0%': { opacity: 1 },
    '3%': { opacity: 0.45 },
    '10%, 100%': { opacity: 1 },
  }),
  /** The "+ 10 mins" under the time gives a small nudge on every change */
  popIn: css.keyframes({
    '0%': { transform: [{ scale: 1.18 }] },
    '60%': { transform: [{ scale: 0.97 }] },
    '100%': { transform: [{ scale: 1 }] },
  }),
  /** lc-letter-wave */
  letterWave: css.keyframes({
    '0%, 55%, 100%': { transform: [{ translateY: 0 }] },
    '25%': { transform: [{ translateY: -5 }] },
  }),
  /** lc-bell-nudge: an idle bell gives the odd ring */
  bellNudge: css.keyframes({
    '0%, 80%, 100%': { transform: [{ rotate: '0deg' }] },
    '83%': { transform: [{ rotate: '-18deg' }] },
    '86%': { transform: [{ rotate: '15deg' }] },
    '89%': { transform: [{ rotate: '-10deg' }] },
    '92%': { transform: [{ rotate: '6deg' }] },
    '95%': { transform: [{ rotate: '-2deg' }] },
  }),
  /** lc-zzz: a Z drifting up and away */
  zzz: css.keyframes({
    '0%': { opacity: 0, transform: [{ translateX: 0 }, { translateY: 0 }, { scale: 0.6 }, { rotate: '-12deg' }] },
    '20%': { opacity: 0.9 },
    '100%': { opacity: 0, transform: [{ translateX: 22 }, { translateY: -48 }, { scale: 1.15 }, { rotate: '10deg' }] },
  }),
  /** lc-ring-mark */
  ringMark: css.keyframes({
    '0%': { opacity: 0, transform: [{ translateX: -4 }] },
    '40%': { opacity: 1 },
    '100%': { opacity: 0, transform: [{ translateX: 4 }] },
  }),
  /** lc-icon-pop */
  iconPop: css.keyframes({
    '0%': { transform: [{ scale: 0.4 }, { rotate: '-25deg' }] },
    '60%': { transform: [{ scale: 1.2 }, { rotate: '8deg' }] },
    '100%': { transform: [{ scale: 1 }, { rotate: '0deg' }] },
  }),
  /** lc-step-blink: a freshly set clock, hard on/off (use with steps) */
  stepBlink: css.keyframes({
    '0%, 49.9%': { opacity: 1 },
    '50%, 100%': { opacity: 0.06 },
  }),
};

/** Loop forever at a given length, with an optional (negative = already running) delay. */
export const loop = (
  name: (typeof KF)[keyof typeof KF],
  seconds: number,
  opts: { delay?: number; ease?: 'linear' | 'ease-in-out' | 'ease-out' | 'ease-in'; alternate?: boolean } = {},
) =>
  ({
    animationName: name,
    animationDuration: `${seconds}s`,
    animationDelay: `${opts.delay ?? 0}s`,
    animationIterationCount: 'infinite',
    animationTimingFunction: opts.ease ?? 'ease-in-out',
    animationDirection: opts.alternate ? 'alternate' : 'normal',
  }) as const;
