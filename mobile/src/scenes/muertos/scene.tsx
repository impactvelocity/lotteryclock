/**
 * Día de Muertos' background (web: MuertosScene in muertos-scene.tsx): an ofrenda by candlelight
 * that comes alive as the bet grows.
 *
 *   0 min     rest in peace: one candle each side, a few flags, a quiet sky
 *   1–11      light a candle: more candles, the first petals drift down
 *   12–23     follow the marigolds: petals fall steadily, a monarch arrives
 *   24–35     dance with the dead: more monarchs
 *   36–45     raise the spirits → back from the dead: every candle blazing, a petal storm,
 *             a flight of monarchs, the flags flapping in the wind
 *
 * Setting the alarm lights every candle on the ofrenda, one after another. A snooze lets
 * everyone rest (candles snuffed and smoking, souls gone); a late result flares every candle
 * and has skeleton hands bursting out of the ground by rattling headstones.
 */
import { memo, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { css, FadeIn, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';

import { Art } from '../art';
import type { SceneProps } from '../types';
import { FLAG_DESIGNS, MK, MU, PapelFlag, Petal, clamp } from './art';
import { Ofrenda } from './ofrenda';
import { HEADER_H } from '@/components/play-layout';
import { frac } from '@/lib/rand';
import { cssA, rampN } from '@/themes/themes';

const SPARKLE = 'M12 0C12.8 7 17 11.2 24 12 17 12.8 12.8 17 12 24 11.2 17 7 12.8 0 12 7 11.2 11.2 7 12 0z';

/* ------------------------------------------------------------------ stars */

/**
 * The web twinkles each of its 44 stars on its own. Here they twinkle in six groups (each
 * scattered all over the sky, so it still reads as a shimmer), and come out group by group as
 * the fiesta heats up: six animated views rather than 44.
 */
const STAR_GROUPS = 6;
const STARS = Array.from({ length: 44 }, (_, i) => ({
  x: frac(i, 51),
  y: 0.06 + frac(i, 52) * 0.6,
  r: 0.7 + frac(i, 53) * 1.4,
  group: Math.min(STAR_GROUPS - 1, Math.floor(frac(i, 56) * STAR_GROUPS)),
  sparkle: frac(i, 57) > 0.8,
}));
const TWINKLE = [
  { dur: 2.6, delay: -0.4 },
  { dur: 3.4, delay: -2.1 },
  { dur: 4.2, delay: -1.3 },
  { dur: 3.0, delay: -2.6 },
  { dur: 4.8, delay: -0.9 },
  { dur: 3.7, delay: -3.2 },
];

const StarGroup = memo(function StarGroup({ g, width, height }: { g: number; width: number; height: number }) {
  return (
    <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
      {STARS.filter((s) => s.group === g).map((s, i) => {
        const x = s.x * width;
        const y = s.y * height;
        return s.sparkle ? (
          <Path key={i} d={SPARKLE} fill="#FFF1D6" transform={`translate(${x} ${y}) scale(${(s.r * 8) / 24})`} />
        ) : (
          <Circle key={i} cx={x + s.r} cy={y + s.r} r={s.r} fill="#FFF4DE" />
        );
      })}
    </Svg>
  );
});

function Stars({ out, width, height }: { out: number; width: number; height: number }) {
  return TWINKLE.map((t, g) => (
    <Animated.View
      key={g}
      style={[
        StyleSheet.absoluteFill,
        { opacity: g / STAR_GROUPS < out ? 0.9 : 0, transitionProperty: 'opacity', transitionDuration: 500 },
      ]}
    >
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            animationName: MK.twinkle,
            animationDuration: `${t.dur}s`,
            animationDelay: `${t.delay}s`,
            animationIterationCount: 'infinite',
            animationTimingFunction: 'ease-in-out',
          },
        ]}
      >
        <StarGroup g={g} width={width} height={height} />
      </Animated.View>
    </Animated.View>
  ));
}

/* ------------------------------------------------------------------ papel picado */

const FLAG_COLORS = [MU.rose, MU.orange, MU.teal, MU.marigold, MU.purple, MU.sky];

/**
 * One string of flags per side, hung just under the header across the top corner (the web's
 * phone layout: its second, lower string only shows on wide screens). y values are on the web's
 * 220-unit swag, squashed into BOX_H.
 */
const SWAG_H = 220;
const BOX_W = 150;
const BOX_H = 56;
const FLAG_W = 18;
const STRING = { y0: 0, yc: 90, y1: 0, x1: 100, flags: 7 };

function bezier(a: number, c: number, b: number, t: number) {
  return (1 - t) * (1 - t) * a + 2 * t * (1 - t) * c + t * t * b;
}

const sx = (pct: number) => (pct / 100) * BOX_W;
const sy = (u: number) => (u / SWAG_H) * BOX_H;

const FLAGS = Array.from({ length: STRING.flags }, (_, i) => {
  const { y0, yc, y1, x1, flags } = STRING;
  const t = (i + 0.5) / flags;
  const x = -2 + (x1 + 2) * t;
  const y = bezier(y0, yc, y1, t);
  // Lean with the string's slope (assuming a ~300px wide swag)
  const slope = 2 * (1 - t) * (yc - y0) + 2 * t * (y1 - yc);
  const lean = (Math.atan2(slope, 3 * (x1 + 2)) * 180) / Math.PI;
  return { x: sx(x), y: sy(y) - 1, lean: +lean.toFixed(1) };
});

const STRING_D = `M${sx(-2)} ${sy(STRING.y0)}Q${sx((STRING.x1 - 2) / 2)} ${sy(STRING.yc)} ${sx(STRING.x1)} ${sy(STRING.y1)}`;

function PapelPicado({ side, p, top, windy }: { side: 0 | 1; p: number; top: number; windy: boolean }) {
  const shown = 0.62 + p * 0.38;
  return (
    <View
      style={{
        position: 'absolute',
        top,
        [side ? 'right' : 'left']: 0,
        width: BOX_W,
        height: BOX_H,
        transform: side ? [{ scaleX: -1 }] : undefined,
      }}
    >
      <Svg width={BOX_W} height={BOX_H} style={[StyleSheet.absoluteFill, { overflow: 'visible' }]}>
        <Path d={STRING_D} fill="none" stroke="rgba(246,235,211,0.5)" strokeWidth={1.2} />
        {/* The pin it hangs from */}
        <Circle cx={sx(STRING.x1)} cy={sy(STRING.y1)} r={2.5} fill="rgba(246,235,211,0.7)" />
      </Svg>
      {FLAGS.map((f, i) => {
        const k = i + side * 2;
        const visible = frac(i, 81 + side) < shown;
        return (
          <Animated.View
            key={i}
            style={{
              position: 'absolute',
              left: f.x - FLAG_W / 2,
              top: f.y,
              width: FLAG_W,
              transformOrigin: 'top',
              transform: [{ rotate: `${f.lean}deg` }],
              opacity: visible ? 0.93 : 0,
              transitionProperty: 'opacity',
              transitionDuration: 400,
            }}
          >
            <Animated.View
              style={{
                transformOrigin: 'top',
                // Swinging gently; in the wind (or when the dead rise) flapping fast
                animationName: windy ? MK.gust : MK.sway,
                animationDuration: windy
                  ? `${(0.5 + frac(k, 85) * 0.3).toFixed(2)}s`
                  : `${(2.6 + frac(k, 83) * 1.6).toFixed(2)}s`,
                animationDelay: `${(-frac(k, 84) * 3).toFixed(2)}s`,
                animationIterationCount: 'infinite',
                animationTimingFunction: 'ease-in-out',
              }}
            >
              <PapelFlag
                design={FLAG_DESIGNS[k % FLAG_DESIGNS.length]}
                color={FLAG_COLORS[(i + side * 3) % FLAG_COLORS.length]}
                width={FLAG_W}
              />
            </Animated.View>
          </Animated.View>
        );
      })}
    </View>
  );
}

/* ------------------------------------------------------------------ petals */

/**
 * Marigold petals drifting down: the path that guides the souls home. The web's fall and its
 * tumble are two nested animations; here each petal's tumble is folded into its fall (a whole
 * number of turns on the way down), one animated view per petal. 16 rather than the web's 28.
 */
const PETAL_COLORS = [MU.marigold, MU.orange, '#FFB53A', MU.rose, MU.orange];
const PETALS = Array.from({ length: 16 }, (_, i) => {
  const dur = 9 + frac(i, 63) * 8;
  const spin = 2.5 + frac(i, 65) * 3;
  return {
    left: frac(i, 61),
    size: Math.round(7 + frac(i, 62) * 7),
    dur,
    // Negative delays, so the sky's already mid-fall when the theme opens
    delay: -frac(i, 64) * 17,
    turns: Math.max(1, Math.round(dur / spin)),
    dx: Math.round(-40 + frac(i, 66) * 120),
    color: PETAL_COLORS[i % PETAL_COLORS.length],
    order: frac(i, 67),
  };
});

function Petals({ amount, height }: { amount: number; height: number }) {
  // lc-petal-fall + lc-tumble, falling the scene's height. The web falls 1000px; the same speed here.
  const fall = height + 40;
  const pace = fall / 1040;
  const frames = useMemo(
    () =>
      PETALS.map((pt) =>
        css.keyframes({
          '0%': {
            opacity: 0,
            transform: [{ translateX: 0 }, { translateY: -40 }, { rotate: '0deg' }, { rotateX: '0deg' }],
          },
          '8%': { opacity: 1 },
          '80%': { opacity: 1 },
          '100%': {
            opacity: 0,
            transform: [
              { translateX: pt.dx },
              { translateY: fall },
              { rotate: `${pt.turns * 360}deg` },
              { rotateX: `${pt.turns * 360}deg` },
            ],
          },
        }),
      ),
    [fall],
  );
  return PETALS.map((pt, i) =>
    pt.order < amount ? (
      <Animated.View
        key={i}
        entering={FadeIn.duration(700)}
        exiting={FadeOut.duration(700)}
        style={{ position: 'absolute', top: 0, left: `${pt.left * 100}%` }}
      >
        <Animated.View
          style={{
            opacity: 0,
            animationName: frames[i],
            animationDuration: `${(pt.dur * pace).toFixed(2)}s`,
            animationDelay: `${(pt.delay * pace).toFixed(2)}s`,
            animationIterationCount: 'infinite',
            animationTimingFunction: 'linear',
          }}
        >
          <Petal size={pt.size} color={pt.color} />
        </Animated.View>
      </Animated.View>
    ) : null,
  );
}

/* ------------------------------------------------------------------ monarchs */

/** Monarchs: the souls coming home. Five at most on a phone (the web flies seven across a desktop). */
const MONARCHS = [
  { top: 0.34, dur: 24, delay: -5, size: 42, flap: 0.34 },
  { top: 0.46, dur: 28, delay: -14, size: 34, flap: 0.3 },
  { top: 0.24, dur: 21, delay: -9, size: 30, flap: 0.28 },
  { top: 0.55, dur: 30, delay: -20, size: 40, flap: 0.36 },
  { top: 0.4, dur: 26, delay: -2, size: 28, flap: 0.26 },
];
const MONARCHS_AT = [0, 0, 1, 2, 4, 5];

/** lc-flit's path (time, rise, tilt), eased between its keyframes. */
const FLIT = [
  [0, 0, -6],
  [0.25, -16, 5],
  [0.5, -5, -3],
  [0.75, -20, 8],
  [1, 0, -6],
] as const;
function flitAt(t: number) {
  const k = Math.min(FLIT.length - 2, Math.floor(t * 4));
  const [t0, y0, r0] = FLIT[k];
  const [t1, y1, r1] = FLIT[k + 1];
  const u = (t - t0) / (t1 - t0);
  const e = u * u * (3 - 2 * u);
  return { y: Math.round((y0 + (y1 - y0) * e) * 10) / 10, r: Math.round((r0 + (r1 - r0) * e) * 10) / 10 };
}

/**
 * A monarch's flight in one animation: the web nests lc-flit (wandering up and down), a fixed
 * 62° heading and lc-wing (wings folding in about the body) in three elements. Here the wing
 * beats are sampled into the flit's cycle (a whole number of beats, near the web's rhythm), so
 * each monarch is two animated views (drift + flight) rather than three.
 */
function flight(flitS: number, flapS: number) {
  const beats = Math.max(1, Math.round(flitS / flapS));
  const frames: Record<string, { transform: [{ translateY: number }, { rotate: string }, { rotate: string }, { scaleX: number }] }> = {};
  for (let k = 0; k <= beats * 2; k++) {
    const t = k / (beats * 2);
    const { y, r } = flitAt(t);
    frames[`${Math.round(t * 10000) / 100}%`] = {
      transform: [{ translateY: y }, { rotate: `${r}deg` }, { rotate: '62deg' }, { scaleX: k % 2 ? 0.2 : 1 }],
    };
  }
  return css.keyframes(frames);
}
const FLIGHTS = MONARCHS.map((m, i) => ({ frames: flight(2.4 + i * 0.3, m.flap), dur: 2.4 + i * 0.3 }));

function Monarchs({ count, width, height }: { count: number; width: number; height: number }) {
  // lc-drift: in from off the left, out past the right, at the web's speed (~31 pt/s)
  const span = width + 100;
  const pace = span / 750;
  const drift = useMemo(
    () =>
      css.keyframes({
        from: { transform: [{ translateX: -60 }] },
        to: { transform: [{ translateX: width + 40 }] },
      }),
    [width],
  );
  return MONARCHS.slice(0, count).map((m, i) => (
    <Animated.View
      key={i}
      entering={FadeIn.duration(600)}
      exiting={FadeOut.duration(600)}
      style={{ position: 'absolute', left: 0, top: m.top * height }}
    >
      <Animated.View
        style={{
          animationName: drift,
          animationDuration: `${(m.dur * pace).toFixed(1)}s`,
          animationDelay: `${(m.delay * pace).toFixed(1)}s`,
          animationIterationCount: 'infinite',
          animationTimingFunction: 'linear',
        }}
      >
        <Animated.View
          style={{
            animationName: FLIGHTS[i].frames,
            animationDuration: `${FLIGHTS[i].dur.toFixed(2)}s`,
            animationIterationCount: 'infinite',
            animationTimingFunction: 'linear',
          }}
        >
          <Art name="muertos/monarch" width={m.size} height={m.size * 0.75} />
        </Animated.View>
      </Animated.View>
    </Animated.View>
  ));
}

/* ------------------------------------------------------------------ the scene */

export function MuertosScene({ p, tier, mood, width, height }: SceneProps) {
  const insets = useSafeAreaInsets();
  // A snooze lets the dead rest; a late result wakes every candle at once.
  const lively = clamp(mood === 'win' ? p * 0.25 : p);
  const betLit = 0.15 + p * 0.86;
  // Every candle burns once the alarm's set (and stays lit late or right on time); a snooze
  // snuffs all but one.
  const lit = mood === 'win' ? 0.08 : mood === 'idle' ? betLit : 1.01;
  const flare = mood === 'loss' ? 1.3 : 0.85 + lively * 0.3;
  const starsOut = 0.3 + lively * 0.7;
  const petals = mood === 'win' ? 0 : mood === 'loss' ? 1 : p === 0 ? 0 : 0.15 + p * 0.85;
  const monarchs = mood === 'win' ? 0 : mood === 'jackpot' ? MONARCHS.length : MONARCHS_AT[tier];
  const glow = 0.1 + lively * 0.22 + (mood === 'loss' ? 0.2 : 0);
  const glowRGB = rampN(['#FF9A3D', '#FF7A2E', '#F0446E'], lively);
  const windy = tier >= 4 || mood === 'loss';
  // The ofrenda takes 38% of the width each side, the middle left clear for the Set Alarm button
  const altar = Math.min(440, width * 0.38);

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { overflow: 'hidden' }]}>
      {/* Candlelight warming the bottom of the sky */}
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: '55%',
          backgroundImage: `radial-gradient(ellipse 75% 70% at 50% 100%, ${cssA(glowRGB, glow)} 0%, ${cssA(glowRGB, glow * 0.35)} 45%, transparent 78%)`,
        }}
      />

      <Stars out={starsOut} width={width} height={height} />

      {/* Papel picado, strung across both top corners, just under the header */}
      <PapelPicado side={0} p={p} top={insets.top + 2 + HEADER_H - 4} windy={windy} />
      <PapelPicado side={1} p={p} top={insets.top + 2 + HEADER_H - 4} windy={windy} />

      <Petals amount={petals} height={height} />
      <Monarchs count={monarchs} width={width} height={height} />

      {/* The ofrenda: candles, marigolds and calaveras on both sides, on the rail */}
      <Ofrenda side={0} width={altar} lit={lit} flare={flare} mood={mood} />
      <Ofrenda side={1} width={altar} lit={lit} flare={flare} mood={mood} />
    </View>
  );
}
