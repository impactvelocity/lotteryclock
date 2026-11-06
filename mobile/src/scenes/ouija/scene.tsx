/**
 * Ouija's background (web: OuijaScene in ouija-scene.tsx): a candlelit spirit board, engraved in
 * antique gold on charcoal, seen through old film (grain, dust, scratches). It gets more
 * haunted as the bet grows.
 *
 *   0 min     the spirits rest: every candle out, smoke curling off the wicks
 *   1–11      a faint whisper: the first candle catches
 *   12–23     something stirs: more candles
 *   24–35     the planchette moves: half the candles lit, embers drifting up
 *   36–45     possessed → the spirits decide: every candle burning, the board smouldering
 *
 * A snooze snuffs the candles; a late result flares them. As on the web's phone layout, the sun
 * and moon over YES and NO and the moths are left out: there's no room beside the dial.
 */
import { memo, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { css, cubicBezier, FadeIn, FadeOut, steps } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  LinearGradient,
  Path,
  Pattern,
  RadialGradient,
  Rect,
  Stop,
} from 'react-native-svg';

import type { SceneProps } from '../types';
import { BONE, EMBER, GOLD, OK, STAR, clamp, grainPath } from './art';
import { frac } from '@/lib/rand';
import { cssA, rampN } from '@/themes/themes';

/* ------------------------------------------------------------------ stars */

/**
 * Engraved stars. The web twinkles each of its 34 on its own; here they twinkle in six groups
 * (each scattered over the whole sky) and come out group by group as the spirits stir.
 */
const STAR_GROUPS = 6;
const STARS = Array.from({ length: 34 }, (_, i) => ({
  x: 0.03 + frac(i, 71) * 0.94,
  y: 0.06 + frac(i, 72) * 0.78,
  r: 0.6 + frac(i, 73) * 1.1,
  sparkle: frac(i, 74) > 0.7,
  group: Math.min(STAR_GROUPS - 1, Math.floor(frac(i, 75) * STAR_GROUPS)),
}));
const TWINKLE = [
  { dur: 2.8, delay: -0.6 },
  { dur: 3.6, delay: -2.2 },
  { dur: 4.4, delay: -1.1 },
  { dur: 3.1, delay: -2.9 },
  { dur: 5.0, delay: -0.3 },
  { dur: 3.9, delay: -3.4 },
];

const StarGroup = memo(function StarGroup({ g, width, height }: { g: number; width: number; height: number }) {
  return (
    <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
      {STARS.filter((s) => s.group === g).map((s, i) => {
        const x = s.x * width;
        const y = s.y * height;
        return s.sparkle ? (
          <Path key={i} d={STAR} fill={GOLD} transform={`translate(${x} ${y}) scale(${(s.r * 9) / 24})`} />
        ) : (
          <Circle key={i} cx={x + s.r * 0.9} cy={y + s.r * 0.9} r={s.r * 0.9} fill={GOLD} />
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
        { opacity: g / STAR_GROUPS < out ? 0.75 : 0, transitionProperty: 'opacity', transitionDuration: 500 },
      ]}
    >
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            animationName: OK.twinkle,
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

/* ------------------------------------------------------------------ the frame */

/**
 * The board's border: two gold rules with a concave notch cut into each corner, a star sitting
 * in the notch. Lines are plain views so they stretch with the screen; the corners stay crisp.
 */
const R = 26; // notch radius on the outer rule
const G_ = 5; // gap between the rules
const RI = Math.sqrt((R + G_) ** 2 - G_ * G_); // where the inner rule meets its notch

const Corner = memo(function Corner() {
  return (
    <Svg width={40} height={40} viewBox="0 0 40 40" fill="none" stroke={GOLD}>
      <Path d={`M0.5 ${R}A${R} ${R} 0 0 0 ${R} 0.5`} strokeWidth={1} />
      <Path d={`M${G_} ${RI}A${R + G_} ${R + G_} 0 0 0 ${RI} ${G_}`} strokeWidth={0.6} />
      <Path d={STAR} fill={GOLD} stroke="none" transform="translate(4.5 4.5) scale(0.42)" />
    </Svg>
  );
});

function Frame({ top }: { top: number }) {
  const line = (style: object) => <View style={[{ position: 'absolute', backgroundColor: GOLD }, style]} />;
  return (
    <View style={{ position: 'absolute', left: 12, right: 12, top, bottom: 16, opacity: 0.45, mixBlendMode: 'screen' }}>
      {line({ left: R, right: R, top: 0, height: 1 })}
      {line({ left: R, right: R, bottom: 0, height: 1 })}
      {line({ top: R, bottom: R, left: 0, width: 1 })}
      {line({ top: R, bottom: R, right: 0, width: 1 })}
      {line({ left: RI, right: RI, top: G_, height: 0.6, opacity: 0.7 })}
      {line({ left: RI, right: RI, bottom: G_, height: 0.6, opacity: 0.7 })}
      {line({ top: RI, bottom: RI, left: G_, width: 0.6, opacity: 0.7 })}
      {line({ top: RI, bottom: RI, right: G_, width: 0.6, opacity: 0.7 })}
      {(
        [
          { left: 0, top: 0 },
          { right: 0, top: 0, transform: [{ scaleX: -1 }] },
          { left: 0, bottom: 0, transform: [{ scaleY: -1 }] },
          { right: 0, bottom: 0, transform: [{ scale: -1 }] },
        ] as const
      ).map((c, i) => (
        <View key={i} style={[{ position: 'absolute', width: 40, height: 40 }, c]}>
          <Corner />
        </View>
      ))}
    </View>
  );
}

/* ------------------------------------------------------------------ candles */

/** Candles per side, on a 100 × 124 strip whose floor is y = 116. */
type CandleSpec = { cx: number; w: number; h: number; order: number };
const CANDLES: Record<'left' | 'right', CandleSpec[]> = {
  left: [
    { cx: 22, w: 12, h: 72, order: 0 },
    { cx: 47, w: 15, h: 46, order: 2 },
    { cx: 72, w: 10, h: 28, order: 4 },
  ],
  right: [
    { cx: 78, w: 12, h: 62, order: 1 },
    { cx: 53, w: 14, h: 82, order: 3 },
    { cx: 29, w: 11, h: 36, order: 5 },
  ],
};
const FLOOR = 116;
const STRIP_W = 100;
const STRIP_H = 124;
/** The strip's size on screen: tucked into the corner, a little bigger than the web's phone size. */
const STRIP_SCALE = 0.46;
/** How many candles burn at each tier. */
const LIT_AT = [0, 1, 2, 3, 4, 6];

const f2 = (n: number) => Math.round(n * 100) / 100;

/** Saucers, bodies with a melted lip and a drip running down the front: everything that stays put. */
const CandleBodies = memo(function CandleBodies({ side }: { side: 'left' | 'right' }) {
  return (
    <Svg
      width={STRIP_W}
      height={STRIP_H}
      viewBox={`0 0 ${STRIP_W} ${STRIP_H}`}
      style={StyleSheet.absoluteFill}
      fill="none"
      stroke={GOLD}
      strokeWidth={1}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {CANDLES[side].map(({ cx, w, h }, i) => {
        const top = FLOOR - h;
        const l = cx - w / 2;
        const body = `M${f2(l)} ${FLOOR}V${f2(top + 2.5)}c${f2(w * 0.2)} 1.6 ${f2(w * 0.35)} -1.2 ${f2(w * 0.5)} -.4s${f2(w * 0.3)} 1.4 ${f2(w * 0.5)} .4V${FLOOR}`;
        const dripLen = Math.min(14, h * 0.24);
        const drip = `M${f2(l + w * 0.26)} ${f2(top + 2.4)}v${f2(dripLen)}a1.3 1.3 0 0 0 2.6 0v${f2(-dripLen * 0.6)}`;
        return (
          <G key={i}>
            <Path d={`M${f2(l - 6)} ${FLOOR}h${f2(w + 12)}`} />
            <Path d={`M${f2(l - 4)} ${FLOOR}q${f2(w / 2 + 4)} 6 ${f2(w + 8)} 0`} strokeWidth={0.7} />
            <Path d={body} fill="#110E0C" />
            <Path d={drip} strokeWidth={0.8} />
          </G>
        );
      })}
    </Svg>
  );
});

/** A flame `flameH` tall standing on (0, 0), in a 12-wide box: gradient body, white-hot core. */
const Flame = memo(function Flame({ flameH, id }: { flameH: number; id: string }) {
  const h = flameH + 2;
  return (
    <Svg width={12} height={h} viewBox={`-6 ${-h + 1} 12 ${h}`}>
      <Defs>
        <LinearGradient id={id} x1="0" y1="1" x2="0" y2="0">
          <Stop offset="0" stopColor={EMBER} />
          <Stop offset="0.55" stopColor="#FFB14E" />
          <Stop offset="1" stopColor="#FFF0C9" />
        </LinearGradient>
      </Defs>
      <Path
        d={`M0 1c-4 -3 -4.2 ${f2(-flameH * 0.55)} 0 ${-flameH}c4.2 ${f2(flameH * 0.45)} 4 ${f2(flameH - 3)} 0 ${flameH}z`}
        fill={`url(#${id})`}
      />
      <Path d="M0 .5c-1.6 -1.4 -1.8 -3.6 0 -6.5c1.8 2.9 1.6 5.1 0 6.5z" fill="#FFF6DD" />
    </Svg>
  );
});

const HALO =
  'radial-gradient(circle closest-side, rgba(255,180,94,0.55) 0%, rgba(255,106,43,0.18) 45%, rgba(255,106,43,0) 100%)';

/** Three candles on saucers, in a bottom corner. They catch one at a time as the bet grows. */
function Candles({ side, lit, flare }: { side: 'left' | 'right'; lit: number; flare: boolean }) {
  const left = side === 'left';
  const flameH = flare ? 19 : 13;
  return (
    <View
      style={{
        position: 'absolute',
        bottom: 12,
        [left ? 'left' : 'right']: 8,
        width: STRIP_W,
        height: STRIP_H,
        transformOrigin: left ? 'left bottom' : 'right bottom',
        transform: [{ scale: STRIP_SCALE }],
      }}
    >
      {CANDLES[side].map((c, i) => {
        const on = c.order < lit;
        const wickTop = FLOOR - c.h - 4;
        const r = flare ? 34 : 26;
        return (
          <View key={i} style={StyleSheet.absoluteFill}>
            {/* Warm pool of light round the flame (lit state outside, flicker inside) */}
            <Animated.View
              style={{
                position: 'absolute',
                left: c.cx - r,
                top: wickTop - 6 - r,
                width: r * 2,
                height: r * 2,
                opacity: on ? 1 : 0,
                transitionProperty: 'opacity',
                transitionDuration: 500,
              }}
            >
              <Animated.View
                style={{
                  flex: 1,
                  backgroundImage: HALO,
                  animationName: OK.glow,
                  animationDuration: `${(2.1 + i * 0.4).toFixed(1)}s`,
                  animationDelay: `${(i * 0.3).toFixed(1)}s`,
                  animationIterationCount: 'infinite',
                  animationTimingFunction: 'ease-in-out',
                  animationPlayState: on ? 'running' : 'paused',
                }}
              />
            </Animated.View>
          </View>
        );
      })}
      <CandleBodies side={side} />
      {CANDLES[side].map((c, i) => {
        const on = c.order < lit;
        const top = FLOOR - c.h;
        const wickTop = top - 4;
        return (
          <View key={i} style={StyleSheet.absoluteFill}>
            {/* Wick */}
            <View
              style={{
                position: 'absolute',
                left: c.cx - 0.6,
                top: wickTop,
                width: 1.2,
                height: 5,
                borderRadius: 0.6,
                backgroundColor: on ? '#3A2A1C' : GOLD,
              }}
            />
            {/* Flame: catches with a pop, then flickers */}
            <Animated.View
              style={{
                position: 'absolute',
                left: c.cx - 6,
                top: wickTop + 1 - (flameH + 2),
                width: 12,
                height: flameH + 2,
                transformOrigin: 'bottom',
                transform: [{ scale: on ? 1 : 0.2 }],
                opacity: on ? 1 : 0,
                transitionProperty: ['transform', 'opacity'],
                transitionDuration: [450, 300],
                transitionTimingFunction: [cubicBezier(0.3, 1.6, 0.5, 1), 'ease'],
              }}
            >
              <Animated.View
                style={{
                  flex: 1,
                  transformOrigin: 'bottom',
                  animationName: OK.flame,
                  animationDuration: `${(1.3 + i * 0.37).toFixed(2)}s`,
                  animationDelay: `${(-i * 0.5).toFixed(1)}s`,
                  animationIterationCount: 'infinite',
                  animationTimingFunction: 'ease-in-out',
                  animationPlayState: on ? 'running' : 'paused',
                }}
              >
                <Flame flameH={flameH} id={`lc-ouija-flame-${side}-${i}`} />
              </Animated.View>
            </Animated.View>
            {/* Smoke from a snuffed wick */}
            <Animated.View
              style={{
                position: 'absolute',
                left: c.cx - 4,
                top: wickTop - 33,
                width: 8,
                height: 33,
                opacity: on ? 0 : 1,
                transitionProperty: 'opacity',
                transitionDuration: 600,
              }}
            >
              <Animated.View
                style={{
                  flex: 1,
                  opacity: 0,
                  animationName: OK.smoke,
                  animationDuration: `${(3.2 + i * 0.6).toFixed(1)}s`,
                  animationDelay: `${(i * 0.9).toFixed(1)}s`,
                  animationIterationCount: 'infinite',
                  animationTimingFunction: 'ease-out',
                  animationPlayState: on ? 'paused' : 'running',
                }}
              >
                <Svg width={8} height={33} viewBox="-4 -32 8 33">
                  <Path
                    d="M0 0c-3 -4 3 -7 0 -11s3 -7 0 -11 2.5 -6 0 -9"
                    fill="none"
                    stroke={BONE}
                    strokeWidth={0.8}
                    strokeLinecap="round"
                  />
                </Svg>
              </Animated.View>
            </Animated.View>
          </View>
        );
      })}
    </View>
  );
}

/* ------------------------------------------------------------------ embers */

/** Sparks drifting up off the board. */
const EMBERS = Array.from({ length: 18 }, (_, i) => ({
  x: 0.04 + frac(i, 81) * 0.92,
  size: 1.5 + frac(i, 82) * 2.5,
  dur: +(5 + frac(i, 83) * 6).toFixed(1),
  delay: +(-frac(i, 84) * 10).toFixed(1),
  drift: Math.round((frac(i, 85) - 0.5) * 80),
}));
const EMBERS_AT = [0, 0, 0, 6, 12, 18];

/** lc-ember, one per spark for its own drift. */
const EMBER_FRAMES = EMBERS.map((e) =>
  css.keyframes({
    '0%': { opacity: 0, transform: [{ translateX: 0 }, { translateY: 0 }, { scale: 1 }] },
    '10%': { opacity: 0.9 },
    '100%': { opacity: 0, transform: [{ translateX: e.drift }, { translateY: -340 }, { scale: 0.3 }] },
  }),
);

function Embers({ count }: { count: number }) {
  return EMBERS.slice(0, count).map((e, i) => (
    <Animated.View
      key={i}
      entering={FadeIn.duration(400)}
      exiting={FadeOut.duration(400)}
      style={{ position: 'absolute', bottom: 0, left: `${e.x * 100}%` }}
    >
      <Animated.View
        style={{
          width: e.size,
          height: e.size,
          borderRadius: e.size / 2,
          backgroundColor: '#FFB46B',
          boxShadow: `0 0 ${e.size * 3}px ${EMBER}`,
          opacity: 0,
          animationName: EMBER_FRAMES[i],
          animationDuration: `${e.dur}s`,
          animationDelay: `${e.delay}s`,
          animationIterationCount: 'infinite',
          animationTimingFunction: 'ease-out',
        }}
      />
    </Animated.View>
  ));
}

/* ------------------------------------------------------------------ grunge */

/** Dust on the print: irregular blobs, not perfect dots. */
const DUST = Array.from({ length: 46 }, (_, i) => ({
  x: frac(i, 61),
  y: frac(i, 62),
  s: 1 + frac(i, 63) * 2.4,
  o: 0.04 + frac(i, 64) * 0.1,
  squash: 0.6 + frac(i, 65) * 0.4,
  tilt: Math.round(frac(i, 66) * 180),
}));

/** Stray hairs caught in the gate. */
const HAIRS = [
  { x: 0.13, y: 0.64, rot: 20, d: 'M0 0c6-3 10 2 16-1s9-7 14-4' },
  { x: 0.82, y: 0.33, rot: -35, d: 'M0 0c4 5 9 4 12 1s8-2 9 4' },
  { x: 0.61, y: 0.91, rot: 70, d: 'M0 0c3-4 7-3 9 0s6 3 8-1 5-5 9-2' },
];

/** Blotchy, uneven darkness, like a print that's been handled for a century (the web's mottle). */
const BLOTCHES = Array.from({ length: 14 }, (_, i) => ({
  x: frac(i, 91),
  y: frac(i, 92),
  rx: 0.18 + frac(i, 93) * 0.3,
  ry: 0.1 + frac(i, 94) * 0.2,
  o: 0.35 + frac(i, 95) * 0.5,
}));

/** Warm grain specks, one 120-pt tile repeated (the web's GRAIN, held still: it's faint). */
const WARM_GRAIN = grainPath(260, 120, 41, 0.4, 1);

/** Long vertical scratches (left, top, height as shares of the scene; tilt), plus one diagonal gouge. */
const SCRATCHES = [
  { x: 0.09, top: 0, h: 0.74, rot: 0.6, o: 0.05, dur: 3.1 },
  { x: 0.235, top: 0.3, h: 0.7, rot: -0.4, o: 0.03, dur: 4.3 },
  { x: 0.67, top: 0.04, h: 0.4, rot: 0.3, o: 0.035, dur: 2.7 },
  { x: 0.885, top: 0.16, h: 0.84, rot: -0.8, o: 0.05, dur: 3.7 },
  { x: 0.41, top: 0.56, h: 0.44, rot: 0.2, o: 0.03, dur: 5.2 },
  { x: 0.74, top: 0.02, h: 0.2, rot: 58, o: 0.04, dur: 6.1 },
];

/** Mottling, grain, dust and hairs: one still SVG. */
const Grime = memo(function Grime({ width, height }: { width: number; height: number }) {
  return (
    <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
      <Defs>
        <RadialGradient id="lc-ouija-blotch">
          <Stop offset="0" stopColor="#000" stopOpacity={1} />
          <Stop offset="1" stopColor="#000" stopOpacity={0} />
        </RadialGradient>
        <Pattern id="lc-ouija-grain" patternUnits="userSpaceOnUse" width={120} height={120}>
          <Path d={WARM_GRAIN} fill="#EDE3CC" />
        </Pattern>
      </Defs>
      <G opacity={0.18}>
        {BLOTCHES.map((b, i) => (
          <Ellipse
            key={i}
            cx={b.x * width}
            cy={b.y * height}
            rx={b.rx * width}
            ry={b.ry * height}
            fill="url(#lc-ouija-blotch)"
            opacity={b.o}
          />
        ))}
      </G>
      <Rect width={width} height={height} fill="url(#lc-ouija-grain)" opacity={0.06} />
      {DUST.map((d, i) => (
        <Ellipse
          key={i}
          cx={d.x * width}
          cy={d.y * height}
          rx={d.s / 2}
          ry={(d.s * 0.8 * d.squash) / 2}
          fill={BONE}
          opacity={d.o}
          transform={`rotate(${d.tilt} ${d.x * width} ${d.y * height})`}
        />
      ))}
      {HAIRS.map((hr, i) => (
        <Path
          key={i}
          d={hr.d}
          fill="none"
          stroke={BONE}
          strokeWidth={0.6}
          opacity={0.08}
          transform={`translate(${hr.x * width} ${hr.y * height}) rotate(${hr.rot})`}
        />
      ))}
    </Svg>
  );
});

/** Old-film texture on top of the scene: mottling, grain, dust, hairs, scratches, a vignette. */
function Grunge({ width, height }: { width: number; height: number }) {
  return (
    <>
      <Grime width={width} height={height} />
      {SCRATCHES.map((s, i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            left: s.x * width,
            top: s.top * height,
            width: 1,
            height: s.h * height,
            transformOrigin: 'top',
            transform: [{ rotate: `${s.rot}deg` }],
            opacity: s.o,
          }}
        >
          <Animated.View
            style={{
              flex: 1,
              backgroundImage: `linear-gradient(180deg, transparent 0%, ${BONE} 15%, ${BONE} 80%, transparent 100%)`,
              animationName: OK.scratch,
              animationDuration: `${s.dur}s`,
              animationDelay: -i * 700,
              animationIterationCount: 'infinite',
              animationTimingFunction: steps(1, 'jump-end'),
            }}
          />
        </View>
      ))}
      {/* Vignette */}
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundImage:
              'radial-gradient(ellipse 85% 75% at 50% 42%, transparent 52%, rgba(0,0,0,0.24) 84%, rgba(0,0,0,0.42) 100%)',
          },
        ]}
      />
    </>
  );
}

/* ------------------------------------------------------------------ the scene */

export function OuijaScene({ p, tier, mood, width, height }: SceneProps) {
  const insets = useSafeAreaInsets();
  // A snooze settles the spirits; a late result riles them up.
  const stir = clamp(mood === 'win' ? p * 0.3 : mood === 'loss' ? 0.6 + p * 0.4 : p);
  const lit = mood === 'win' ? 0 : mood === 'loss' || mood === 'jackpot' ? 6 : LIT_AT[tier];
  const flare = mood === 'loss';
  const embers = mood === 'win' ? 0 : mood === 'loss' ? EMBERS.length : EMBERS_AT[tier];
  const starsOut = 0.3 + stir * 0.7;
  const smoulder = rampN(['#9A6A30', '#B5502A', '#C2361F'], stir);
  const glow = useMemo(
    () =>
      `radial-gradient(ellipse 75% 65% at 50% 100%, ${cssA(smoulder, 0.06 + stir * 0.3)} 0%, ${cssA(smoulder, 0.02 + stir * 0.09)} 45%, transparent 75%)`,
    [smoulder, stir],
  );

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { overflow: 'hidden' }]}>
      {/* The board smoulders from below as the spirits stir */}
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '70%', backgroundImage: glow }} />

      <Stars out={starsOut} width={width} height={height} />

      {/* The board's border, from just under the status bar down to the rail */}
      <Frame top={Math.max(12, insets.top - 6)} />

      <Candles side="left" lit={lit} flare={flare} />
      <Candles side="right" lit={lit} flare={flare} />

      <Embers count={embers} />

      <Grunge width={width} height={height} />
    </View>
  );
}
