/**
 * Magic 8 Ball: a studio product shot rather than an illustrated scene. Monochrome (ink black,
 * one cobalt blue and white), glossy and mostly still. Ported from
 * web/src/components/scenes/eightball-scene.tsx.
 *
 * - EightBallScene: the studio. A near-black sweep, a key light from the upper left with dust
 *   drifting through it, out-of-focus bokeh, and the ball's blue glow pooling on the floor.
 * - EightBall (behind the dial): a giant glossy 8 ball whose window is the dial. Setting the
 *   alarm shakes it, then it leans in so the clock sits in its window, and the die floats up
 *   behind the drawn time.
 * - EightBallDie (on the dial), EightBallRoll, EightBallVerdict: the die (./die.tsx).
 *
 * Purely decorative and never touchable.
 */
import { memo, useId, useMemo, useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { css, cubicBezier } from 'react-native-reanimated';
import Svg, {
  Circle,
  Defs,
  FeGaussianBlur,
  Filter,
  G,
  LinearGradient,
  Path,
  RadialGradient,
  Stop,
  Text,
} from 'react-native-svg';

import { frac } from '@/lib/rand';
import { fontFor } from '@/themes/fonts';

import { KF } from '../anim';
import type { BackdropProps, SceneProps, ThemeKit } from '../types';
import { BOB_KF, cleanId, Die, DieDefs, EightBallDie, EightBallRoll, EightBallVerdict, r2 } from './die';

/** The ball's diameter, in dial widths. */
const BALL = 1.6;
/** The ball is drawn in a 1000-unit square; one dial width is this many units. */
const PER_DIAL = 1000 / BALL;
/** The window's opening (just outside the dial's disc) and the bezel round it, in ball units. */
const WIN_R = Math.round(0.49 * PER_DIAL);
const BEZEL_R = Math.round(0.535 * PER_DIAL);
/**
 * Once the alarm is set the ball leans in: up a little and bigger, so the clock and the result
 * below it sit inside the window.
 */
const LEAN_SHIFT = -0.13;
const LEAN_SCALE = 1.32;
/**
 * The bedside clock's centre once set, in dial widths above the dial's: the play screen draws it
 * from the dial's top + 34 pt, about 118 pt tall, so about 0.22 up. (On the web it's 0.35.)
 */
const CLOCK_RISE = 0.22;
/** Where the clock's digits sit in the window while it leans in, in ball units from the centre. */
const CLOCK_DY = Math.round(((-CLOCK_RISE - LEAN_SHIFT) / LEAN_SCALE) * PER_DIAL);
const LEAN = {
  transitionProperty: 'transform',
  transitionDuration: 750,
  transitionTimingFunction: cubicBezier(0.2, 0.8, 0.2, 1),
} as const;

/** Ring segment between radii r1 and r2 from angle a1 to a2 (degrees, 0 = up, clockwise). */
function sector(cx: number, cy: number, r1: number, rr: number, a1: number, a2: number) {
  const at = (a: number, r: number) => {
    const t = (a * Math.PI) / 180;
    return `${r2(cx + r * Math.sin(t))} ${r2(cy - r * Math.cos(t))}`;
  };
  const large = a2 - a1 > 180 ? 1 : 0;
  return `M${at(a1, rr)}A${rr} ${rr} 0 ${large} 1 ${at(a2, rr)}L${at(a2, r1)}A${r1} ${r1} 0 ${large} 0 ${at(a1, r1)}Z`;
}

/**
 * Room round the ball's 1000-unit square, in units: its rim light and bounce, softened, spill a
 * little past the ball's edge, and an SVG is clipped to its own box.
 */
const PAD = 30;

/** An SVG on the ball's grid, `d` across, with PAD units spare all round (overflow is clipped). */
function BallCanvas({ d, children }: { d: number; children: ReactNode }) {
  const k = d / 1000;
  return (
    <Svg
      viewBox={`${-PAD} ${-PAD} ${1000 + PAD * 2} ${1000 + PAD * 2}`}
      width={(1000 + PAD * 2) * k}
      height={(1000 + PAD * 2) * k}
      style={{ position: 'absolute', left: -PAD * k, top: -PAD * k }}
    >
      {children}
    </Svg>
  );
}

/* ------------------------------------------------------------------------------------------ */
/* Behind the dial                                                                             */
/* ------------------------------------------------------------------------------------------ */

/**
 * Bubbles shaken loose in the window, as % of the ball (fewer than the web's 26, to keep the
 * animated layers down while the studio's dust is moving too).
 */
const WINDOW_BUBBLES = Array.from({ length: 14 }, (_, i) => ({
  x: r2(50 + (frac(i, 91) - 0.5) * 46),
  size: r2(0.5 + frac(i, 92) * 1.2),
  dur: r2(1.6 + frac(i, 93) * 2.2),
  delay: r2(frac(i, 94) * 2.4),
  wob: r2(2 + frac(i, 95) * 6),
  wobDur: r2(0.6 + frac(i, 96) * 0.9),
}));

/**
 * lc-e8-rise and lc-e8-wobble in one, so each bubble is a single animated view: up `rise` pt,
 * fading in and out, swinging ±`wob` every `wobDur` seconds of its `dur`.
 */
function bubbleKeyframes(rise: number, wob: number, dur: number, wobDur: number) {
  const frames: Record<string, { opacity?: number; transform: [{ translateX: number }, { translateY: number }] }> = {};
  const swings = Math.max(1, Math.round(dur / wobDur));
  for (let k = 0; k <= swings; k++) {
    const t = k / swings;
    frames[`${r2(t * 100)}%`] = { transform: [{ translateX: k % 2 ? wob : -wob }, { translateY: t * rise }] };
  }
  frames['0%'].opacity = 0;
  frames['100%'].opacity = 0;
  return css.keyframes({ ...frames, '12%': { opacity: 1 }, '80%': { opacity: 1 } });
}

/** The "8" peeking round the upper right, foreshortened as the ball curves away. */
const DECAL = (() => {
  // Round to the right of the theme picker, even once the ball leans in
  const a = 56;
  const t = (a * Math.PI) / 180;
  return { x: r2(500 + 408 * Math.sin(t)), y: r2(500 - 408 * Math.cos(t)), a };
})();

/** Highlight shapes, in ball units: a softbox's reflection, a hot spot, a bounce and the window's glare. */
const HL = {
  softbox: sector(500, 500, 348, 474, 280, 342),
  streak: sector(500, 500, 436, 456, 290, 334),
  bounce: sector(500, 500, 450, 488, 198, 242),
  glare: sector(500, 500, WIN_R - 52, WIN_R - 16, 296, 338),
  glareSmall: sector(500, 500, WIN_R - 40, WIN_R - 30, 118, 140),
  hot: (() => {
    const t = (311 * Math.PI) / 180;
    return { x: r2(500 + 398 * Math.sin(t)), y: r2(500 - 398 * Math.cos(t)) };
  })(),
};

/** The ball itself: its body, the 8, and the window's bezel and liquid. Static. */
const BallBody = memo(function BallBody({ d }: { d: number }) {
  const id = `e8b-${cleanId(useId())}`;
  return (
    <Svg viewBox="0 0 1000 1000" width={d} height={d} style={StyleSheet.absoluteFill}>
      <Defs>
        <RadialGradient id={`${id}-body`} cx="0.36" cy="0.3" r="0.78">
          <Stop offset="0" stopColor="#363A4D" />
          <Stop offset="0.17" stopColor="#1B1D27" />
          <Stop offset="0.45" stopColor="#0A0B10" />
          <Stop offset="0.8" stopColor="#030304" />
          <Stop offset="1" stopColor="#000000" />
        </RadialGradient>
        <RadialGradient id={`${id}-decal`} cx="0.38" cy="0.32" r="0.75">
          <Stop offset="0" stopColor="#FFFFFF" />
          <Stop offset="0.6" stopColor="#E9EBF2" />
          <Stop offset="1" stopColor="#A9AEBE" />
        </RadialGradient>
        <LinearGradient id={`${id}-bezel`} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#000000" />
          <Stop offset="0.55" stopColor="#07080D" />
          <Stop offset="1" stopColor="#22263C" />
        </LinearGradient>
        <LinearGradient id={`${id}-lip`} x1="0.15" y1="0.1" x2="0.85" y2="0.9">
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity={0.4} />
          <Stop offset="0.45" stopColor="#FFFFFF" stopOpacity={0.04} />
          <Stop offset="1" stopColor="#8EA6FF" stopOpacity={0.3} />
        </LinearGradient>
        <RadialGradient id={`${id}-liquid`} cx="0.5" cy="0.44" r="0.58">
          <Stop offset="0" stopColor="#16247A" />
          <Stop offset="0.45" stopColor="#0C164C" />
          <Stop offset="0.82" stopColor="#050A26" />
          <Stop offset="1" stopColor="#02040E" />
        </RadialGradient>
      </Defs>

      {/* The ball */}
      <Circle cx={500} cy={500} r={500} fill={`url(#${id}-body)`} />
      <Circle cx={500} cy={500} r={497} fill="none" stroke="rgba(150,170,255,0.12)" strokeWidth={3} />

      {/* The 8 */}
      <G transform={`translate(${DECAL.x} ${DECAL.y}) rotate(${DECAL.a}) scale(1 0.58)`}>
        <Circle r={82} fill={`url(#${id}-decal)`} />
        <Text
          y={4}
          textAnchor="middle"
          alignmentBaseline="central"
          fontSize={118}
          fontFamily={fontFor('sans', 800)}
          fill="#07080C"
        >
          8
        </Text>
      </G>

      {/* The window: a recessed bezel, then the dark liquid (only seen once the dial lifts away) */}
      <Circle cx={500} cy={500} r={BEZEL_R} fill={`url(#${id}-bezel)`} />
      <Circle cx={500} cy={500} r={BEZEL_R - 2} fill="none" stroke={`url(#${id}-lip)`} strokeWidth={3.5} />
      <Circle cx={500} cy={500} r={WIN_R} fill={`url(#${id}-liquid)`} />
    </Svg>
  );
});

/** Rim light, lower right: cobalt, softened. Static; its view's opacity follows the bet. */
const Rim = memo(function Rim({ d }: { d: number }) {
  const id = `e8m-${cleanId(useId())}`;
  return (
    <BallCanvas d={d}>
      <Defs>
        <LinearGradient id={`${id}-rim`} gradientUnits="userSpaceOnUse" x1="180" y1="160" x2="840" y2="860">
          <Stop offset="0" stopColor="#5A78FF" stopOpacity={0} />
          <Stop offset="0.6" stopColor="#5A78FF" stopOpacity={0} />
          <Stop offset="1" stopColor="#7C9BFF" stopOpacity={0.95} />
        </LinearGradient>
        <Filter id={`${id}-soft`} x="-20%" y="-20%" width="140%" height="140%">
          <FeGaussianBlur stdDeviation={7} />
        </Filter>
      </Defs>
      <Circle
        cx={500}
        cy={500}
        r={493}
        fill="none"
        stroke={`url(#${id}-rim)`}
        strokeWidth={14}
        filter={`url(#${id}-soft)`}
      />
    </BallCanvas>
  );
});

/** Gloss over everything: a softbox's reflection, a hot spot, a bounce, and glare on the glass. Static. */
const Gloss = memo(function Gloss({ d }: { d: number }) {
  const id = `e8g-${cleanId(useId())}`;
  return (
    <BallCanvas d={d}>
      <Defs>
        <Filter id={`${id}-hl`} x="-30%" y="-30%" width="160%" height="160%">
          <FeGaussianBlur stdDeviation={10} />
        </Filter>
        <Filter id={`${id}-hl2`} x="-30%" y="-30%" width="160%" height="160%">
          <FeGaussianBlur stdDeviation={3} />
        </Filter>
        {/* The reflection is brightest at the hot spot and fades out along the curve */}
        <RadialGradient id={`${id}-sheen`} gradientUnits="userSpaceOnUse" cx={HL.hot.x} cy={HL.hot.y} r={240}>
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity={0.5} />
          <Stop offset="0.45" stopColor="#FFFFFF" stopOpacity={0.16} />
          <Stop offset="1" stopColor="#FFFFFF" stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Path d={HL.softbox} fill={`url(#${id}-sheen)`} filter={`url(#${id}-hl)`} />
      <Path d={HL.streak} fill={`url(#${id}-sheen)`} filter={`url(#${id}-hl2)`} />
      <Circle cx={HL.hot.x} cy={HL.hot.y} r={13} fill="#FFFFFF" opacity={0.75} filter={`url(#${id}-hl2)`} />
      <Path d={HL.bounce} fill="#8EA6FF" opacity={0.14} filter={`url(#${id}-hl)`} />
      <Path d={HL.glare} fill="#FFFFFF" opacity={0.07} filter={`url(#${id}-hl2)`} />
      <Path d={HL.glareSmall} fill="#FFFFFF" opacity={0.05} filter={`url(#${id}-hl2)`} />
    </BallCanvas>
  );
});

/** The die that floats up in the window while the alarm is set, on the ball's grid. Static art. */
const WindowDie = memo(function WindowDie({ d, glow }: { d: number; glow: boolean }) {
  const id = `e8w-${cleanId(useId())}`;
  const cy = 500 + CLOCK_DY;
  const r = Math.round((0.39 / LEAN_SCALE) * PER_DIAL);
  return (
    <Svg viewBox="0 0 1000 1000" width={d} height={d} style={StyleSheet.absoluteFill}>
      <Defs>
        <DieDefs id={id} />
        {/* On the dot it glows (the web's drop-shadow, as a halo behind it) */}
        <RadialGradient id={`${id}-halo`}>
          <Stop offset="0.4" stopColor="#6E96FF" stopOpacity={0.7} />
          <Stop offset="1" stopColor="#6E96FF" stopOpacity={0} />
        </RadialGradient>
      </Defs>
      {glow && <Circle cx={500} cy={cy + r * 0.1} r={r * 1.15} fill={`url(#${id}-halo)`} />}
      <Die id={id} cx={500} cy={cy} r={r} />
    </Svg>
  );
});

/** Ink swirling after the shake: three dark blots (% of the ball), turning slowly. */
const SWIRL = [
  [36, 40, 30],
  [64, 56, 34],
  [46, 70, 28],
];

/** lc-e8-surface: the die floats up out of the murk to the glass (the web also un-blurs it) */
const SURFACE_KF = (d: number) =>
  css.keyframes({
    '0%': { opacity: 0, transform: [{ translateY: 0.16 * d }, { scale: 0.55 }, { rotate: '-38deg' }] },
    '55%': { opacity: 0.85 },
    '100%': { opacity: 1, transform: [{ translateY: 0 }, { scale: 1 }, { rotate: '0deg' }] },
  });
/** lc-e8-shake: shaken hard while the alarm is being set (the web's % of the ball, in pt) */
const SHAKE_KF = (d: number) =>
  css.keyframes({
    '0%, 100%': { transform: [{ translateX: 0 }, { translateY: 0 }, { rotate: '0deg' }] },
    '20%': { transform: [{ translateX: -0.014 * d }, { translateY: 0.009 * d }, { rotate: '-3deg' }] },
    '45%': { transform: [{ translateX: 0.016 * d }, { translateY: -0.007 * d }, { rotate: '2.6deg' }] },
    '70%': { transform: [{ translateX: -0.008 * d }, { translateY: -0.011 * d }, { rotate: '-1.6deg' }] },
  });
/** lc-e8-pulse: the glow behind the ball, breathing while it's being asked */
const PULSE_KF = css.keyframes({
  '0%, 100%': { opacity: 0.8 },
  '50%': { opacity: 1 },
});

/**
 * A giant glossy 8 ball behind the dial, the dial set into it as its window. Rim light and the
 * blue glow behind it grow with the bet. Setting the alarm shakes it; it then leans in so the
 * clock sits in the window, and the die floats up behind the drawn time.
 */
function EightBall({ p, visible, size, mood }: BackdropProps) {
  const d = Math.round(size * BALL);
  const leaning = !visible;
  const win = (WIN_R / 1000) * d;

  // Each new shake (Set alarm, Roll again) restarts the bubbles and sends the die back down
  const [shakes, setShakes] = useState({ mood, n: 0 });
  if (shakes.mood !== mood) setShakes({ mood, n: shakes.n + (mood === 'set' ? 1 : 0) });

  const lean = [{ translateY: leaning ? LEAN_SHIFT * size : 0 }, { scale: leaning ? LEAN_SCALE : 1 }];
  const kf = useMemo(
    () => ({
      shake: SHAKE_KF(d),
      surface: SURFACE_KF(d),
      bubbles: WINDOW_BUBBLES.map((b) => bubbleKeyframes(-Math.round(d * 0.56), b.wob, b.dur, b.wobDur)),
    }),
    [d],
  );
  // The die's centre, as a share of the ball (for its transforms' origin)
  const dieOrigin = `50% ${r2(50 + CLOCK_DY / 10)}%`;

  return (
    <View
      pointerEvents="none"
      style={{ position: 'absolute', left: size / 2 - d / 2, top: size / 2 - d / 2, width: d, height: d }}
    >
      {/* Backlight: lifts the black ball off the black studio, and brightens with the bet */}
      <Animated.View
        style={[
          LEAN,
          {
            position: 'absolute',
            inset: -d * 0.42,
            opacity: leaning ? 1 : r2(0.3 + p * 0.6),
            transform: lean,
            transitionProperty: ['opacity', 'transform'],
            transitionDuration: [400, 750],
          },
        ]}
      >
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              borderRadius: d,
              backgroundImage:
                'radial-gradient(circle, rgba(58,84,255,0.34) 0%, rgba(44,64,230,0.14) 36%, rgba(40,60,220,0) 64%)',
            },
            leaning && {
              animationName: PULSE_KF,
              animationDuration: '2.4s',
              animationIterationCount: 'infinite',
              animationTimingFunction: 'ease-in-out',
            },
          ]}
        />
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, LEAN, { transform: lean }]}>
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            mood === 'set' && {
              animationName: kf.shake,
              animationDuration: '0.26s',
              animationDelay: '0.1s',
              animationIterationCount: 6,
              animationTimingFunction: 'ease-in-out',
            },
          ]}
        >
          <BallBody d={d} />
          {/* Rim light, stronger as the bet grows */}
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              {
                opacity: leaning ? 1 : r2(0.5 + p * 0.5),
                transitionProperty: 'opacity',
                transitionDuration: 400,
              },
            ]}
          >
            <Rim d={d} />
          </Animated.View>

          {/* What floats in the window while the alarm is set */}
          {leaning && (
            <View
              style={{
                position: 'absolute',
                left: d / 2 - win,
                top: d / 2 - win,
                width: win * 2,
                height: win * 2,
                borderRadius: win,
                overflow: 'hidden',
              }}
            >
              {/* Back on the ball's grid */}
              <View style={{ position: 'absolute', left: win - d / 2, top: win - d / 2, width: d, height: d }}>
                {/* Ink swirling after the shake */}
                <Animated.View
                  style={[
                    StyleSheet.absoluteFill,
                    {
                      opacity: 0.55,
                      animationName: KF.spin,
                      animationDuration: '16s',
                      animationIterationCount: 'infinite',
                      animationTimingFunction: 'linear',
                    },
                  ]}
                >
                  {SWIRL.map(([x, y, s]) => (
                    <View
                      key={`${x}-${y}`}
                      style={{
                        position: 'absolute',
                        left: ((x - s / 2) / 100) * d,
                        top: ((y - s / 2) / 100) * d,
                        width: (s / 100) * d,
                        height: (s / 100) * d,
                        borderRadius: d,
                        backgroundImage: 'radial-gradient(circle, rgba(2,4,16,0.9) 0%, rgba(2,4,16,0) 70%)',
                      }}
                    />
                  ))}
                </Animated.View>

                {/* The die, floating up out of the murk once the shaking stops, then rocking */}
                <Animated.View
                  key={`die-${shakes.n}`}
                  style={[
                    StyleSheet.absoluteFill,
                    {
                      transformOrigin: dieOrigin,
                      animationName: kf.surface,
                      animationDuration: '2.4s',
                      animationDelay: '1.1s',
                      animationFillMode: 'both',
                      animationTimingFunction: cubicBezier(0.2, 0.7, 0.2, 1),
                    },
                  ]}
                >
                  <Animated.View
                    style={[
                      StyleSheet.absoluteFill,
                      {
                        transformOrigin: dieOrigin,
                        animationName: BOB_KF,
                        animationDuration: '5.5s',
                        animationDelay: '3.5s',
                        animationIterationCount: 'infinite',
                        animationTimingFunction: 'ease-in-out',
                      },
                    ]}
                  >
                    <WindowDie d={d} glow={mood === 'jackpot'} />
                  </Animated.View>
                </Animated.View>

                {/* Bubbles shaken loose */}
                {WINDOW_BUBBLES.map((b, i) => {
                  const s = (b.size / 100) * d;
                  return (
                    <Animated.View
                      key={`${shakes.n}-${i}`}
                      style={{
                        position: 'absolute',
                        left: (b.x / 100) * d,
                        top: 0.78 * d,
                        width: s,
                        height: s,
                        borderRadius: s,
                        borderWidth: 1,
                        borderColor: 'rgba(205,220,255,0.5)',
                        backgroundImage:
                          'radial-gradient(circle at 34% 30%, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.85) 12%, rgba(160,185,255,0.14) 32%, rgba(160,185,255,0.04) 72%)',
                        animationName: kf.bubbles[i],
                        animationDuration: `${b.dur}s`,
                        animationDelay: `${b.delay}s`,
                        animationIterationCount: 'infinite',
                        animationTimingFunction: 'linear',
                        animationFillMode: 'both',
                      }}
                    />
                  );
                })}
              </View>
            </View>
          )}

          <Gloss d={d} />
        </Animated.View>
      </Animated.View>
    </View>
  );
}

/* ------------------------------------------------------------------------------------------ */
/* The studio                                                                                  */
/* ------------------------------------------------------------------------------------------ */

/** Dust in the key light, coming out in a fixed order as the bet grows (the web has 34). */
const MOTES = Array.from({ length: 28 }, (_, i) => ({
  x: r2(3 + frac(i, 61) * 50),
  y: r2(3 + frac(i, 62) * 72),
  s: r2(1 + frac(i, 63) * 2),
  o: r2(0.2 + frac(i, 64) * 0.5),
  dur: r2(16 + frac(i, 65) * 16),
  delay: r2(-frac(i, 66) * 24),
  order: frac(i, 67),
}));
/** lc-e8-mote: dust turning slowly in the key light */
const MOTE_KF = css.keyframes({
  '0%, 100%': { transform: [{ translateX: 0 }, { translateY: 0 }] },
  '33%': { transform: [{ translateX: 14 }, { translateY: -10 }] },
  '66%': { transform: [{ translateX: -9 }, { translateY: 12 }] },
});

/** Out-of-focus highlights round the edges of the frame; one more per tier. */
const BOKEH = [
  { x: 7, y: 24, s: 64 },
  { x: 91, y: 18, s: 52 },
  { x: 13, y: 66, s: 40 },
  { x: 94, y: 58, s: 84 },
  { x: 80, y: 82, s: 34 },
  { x: 22, y: 88, s: 48 },
  { x: 70, y: 7, s: 26 },
  { x: 33, y: 10, s: 22 },
  { x: 97, y: 90, s: 42 },
  { x: 3, y: 92, s: 58 },
].map((b, i) => {
  const dx = Math.round((frac(i, 72) - 0.5) * 40);
  const dy = Math.round((frac(i, 73) - 0.5) * 30);
  return {
    ...b,
    dur: r2(26 + frac(i, 71) * 20),
    // lc-e8-drift, to this one's own (dx, dy)
    drift: css.keyframes({
      from: { transform: [{ translateX: 0 }, { translateY: 0 }] },
      to: { transform: [{ translateX: dx }, { translateY: dy }] },
    }),
  };
});

/** lc-e8-flash: on the dot, one flash of cobalt light */
const FLASH_KF = css.keyframes({
  '0%': { opacity: 0 },
  '15%': { opacity: 1 },
  '100%': { opacity: 0 },
});

function EightBallScene({ p, tier, mood }: SceneProps) {
  const motes = MOTES.filter((m) => m.order < 0.35 + p * 0.65);
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { overflow: 'hidden' }]}>
      {/* Key light from the upper left */}
      <View
        style={{
          position: 'absolute',
          left: '-18%',
          top: '-30%',
          width: '85%',
          height: '140%',
          backgroundImage:
            'radial-gradient(ellipse 44% 58% at 32% 0%, rgba(160,178,255,0.15) 0%, rgba(150,170,255,0.05) 46%, rgba(150,170,255,0) 72%)',
          transform: [{ rotate: '-16deg' }],
          opacity: r2(0.75 + p * 0.25),
        }}
      />
      {/* The ball's glow pooling on the floor */}
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: '50%',
          backgroundImage: `radial-gradient(ellipse 42% 62% at 50% 100%, rgba(52,80,255,${r2(0.07 + p * 0.17)}) 0%, rgba(52,80,255,0) 72%)`,
        }}
      />
      {/* A faint horizon where the sweep meets the floor */}
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: '16%',
          height: StyleSheet.hairlineWidth * 3,
          backgroundImage:
            'linear-gradient(90deg, rgba(150,170,255,0) 0%, rgba(150,170,255,0.08) 30%, rgba(150,170,255,0.08) 70%, rgba(150,170,255,0) 100%)',
        }}
      />

      {BOKEH.slice(0, 4 + tier).map((b) => (
        <Animated.View
          key={`${b.x}-${b.y}`}
          style={{
            position: 'absolute',
            left: `${b.x}%`,
            top: `${b.y}%`,
            marginLeft: -b.s / 2,
            marginTop: -b.s / 2,
            animationName: KF.fadeIn,
            animationDuration: '0.8s',
            animationFillMode: 'both',
            animationTimingFunction: 'ease-out',
          }}
        >
          <Animated.View
            style={{
              width: b.s,
              height: b.s,
              borderRadius: b.s,
              borderWidth: 1,
              borderColor: 'rgba(150,172,255,0.1)',
              backgroundImage: 'radial-gradient(circle, rgba(120,145,255,0.03) 0%, rgba(120,145,255,0.08) 100%)',
              // The web softens these with a 1.5 px blur; a faint halo stands in for it
              boxShadow: '0 0 3px rgba(150,172,255,0.08)',
              animationName: b.drift,
              animationDuration: `${b.dur}s`,
              animationIterationCount: 'infinite',
              animationDirection: 'alternate',
              animationTimingFunction: 'ease-in-out',
            }}
          />
        </Animated.View>
      ))}

      {motes.map((m, i) => (
        <Animated.View
          key={i}
          style={{
            position: 'absolute',
            left: `${m.x}%`,
            top: `${m.y}%`,
            width: m.s,
            height: m.s,
            borderRadius: m.s,
            backgroundColor: '#FFFFFF',
            opacity: m.o,
            animationName: MOTE_KF,
            animationDuration: `${m.dur}s`,
            animationDelay: `${m.delay}s`,
            animationIterationCount: 'infinite',
            animationTimingFunction: 'ease-in-out',
          }}
        />
      ))}

      {/* On the dot: a flash of cobalt light, as if the window lit up */}
      {mood === 'jackpot' && (
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundImage: 'radial-gradient(circle at 50% 45%, rgba(90,125,255,0.35) 0%, rgba(90,125,255,0) 55%)',
              animationName: FLASH_KF,
              animationDuration: '1.4s',
              animationFillMode: 'both',
              animationTimingFunction: 'ease-out',
            },
          ]}
        />
      )}
    </View>
  );
}

export const kit: ThemeKit = {
  Scene: EightBallScene,
  DialBackdrop: EightBall,
  DialUnder: EightBallDie,
  RollFlourish: EightBallRoll,
  ResultFlourish: EightBallVerdict,
};
