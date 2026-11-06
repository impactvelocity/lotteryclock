/**
 * One side of Día de Muertos' ofrenda (web: Ofrenda in muertos-scene.tsx and the pieces in
 * muertos-art.tsx): headstones at the back, a row of pillar candles, a calaverita and marigolds
 * in front. Everything is laid out on the web's 420 × 130 grid (ground at y = 126) and the whole
 * strip is scaled down to fit, so the keyframes below move in grid units like the web's.
 *
 * Static art is drawn in three still SVGs (candle bodies, their rims and wicks, the front row);
 * only what changes with the bet or mood (glows, warm wax, flames, smoke, rattling headstones,
 * hands out of the ground) are separate views, so lighting a candle never re-parses any SVG.
 */
import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { cubicBezier } from 'react-native-reanimated';
import Svg, { Ellipse, G, Line, Path, SvgXml } from 'react-native-svg';

import { Art } from '../art';
import type { SceneMood } from '../types';
import { MU, MK, clamp, flung, innerXml } from './art';
import { frac } from '@/lib/rand';

export const OF_W = 420;
export const OF_H = 130;
const GROUND = 126;

/**
 * The web fades the inner end of each strip out with a mask (opaque to 82%, clear at 100%), so
 * it melts into the Set Alarm button. Views can't be masked, so each piece takes the mask's
 * opacity where it stands.
 */
const fadeAt = (x: number) => Math.round(clamp(1 - (x - OF_W * 0.82) / (OF_W * 0.18)) * 100) / 100;

/**
 * The candles, on the grid. The right side is the same altar mirrored (ofrendas are
 * symmetric); `on` is when each candle lights, as a share of the bet, so the two sides light up
 * in a different order.
 */
const CANDLES = [
  { x: 24, h: 40, s: 1, on: [0.05, 0.33] },
  { x: 92, h: 62, s: 1.15, on: [0.5, 0.1] },
  { x: 130, h: 34, s: 0.9, on: [0.75, 0.85] },
  { x: 214, h: 50, s: 1.05, on: [0.25, 0.55] },
  { x: 300, h: 30, s: 0.85, on: [0.9, 0.7] },
  { x: 346, h: 54, s: 1, on: [0.4, 0.2] },
  { x: 398, h: 26, s: 0.8, on: [0.62, 0.95] },
].map((c, i) => ({
  ...c,
  dur: +(1.1 + frac(i, 71) * 0.9).toFixed(2),
  delay: +(-frac(i, 72) * 2).toFixed(2),
  fade: fadeAt(c.x),
}));

/** Skeleton hands that reach up out of the ground on a late result, by the headstones. */
const HANDS = [
  { x: 41, s: 1.55, delay: [0.05, 0.3], flip: false },
  { x: 284, s: 1.35, delay: [0.32, 0.12], flip: true },
];

const HEADSTONES = [
  { x: 52, s: 1.45, cross: true },
  { x: 262, s: 1.05, cross: false },
];

/** The front row (the calaverita and six marigolds), composed into one SVG from the art files. */
const FRONT_XML = (() => {
  const place = (x: number, y: number, s: number, art: string) =>
    `<g transform="translate(${x} ${y}) scale(${s})" opacity="${fadeAt(x)}">${art}</g>`;
  const marigold = innerXml('muertos/marigold');
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${OF_W} ${OF_H}">`,
    place(168, GROUND - 17 * 1.25, 1.25, innerXml('muertos/calaverita')),
    ...(
      [
        [56, 118, 0.9],
        [118, 121, 0.6],
        [184, 121, 0.72],
        [252, 117, 1],
        [320, 120, 0.7],
        [376, 119, 0.82],
      ] as const
    ).map(([x, y, s]) => place(x, y, s, marigold)),
    '</svg>',
  ].join('');
})();

/** Candle bodies: a pillar with a rounded foot, and its shade band. Still. */
const CandleBodies = memo(function CandleBodies() {
  return (
    <Svg width={OF_W} height={OF_H} viewBox={`0 0 ${OF_W} ${OF_H}`} style={StyleSheet.absoluteFill}>
      {CANDLES.map((c, i) => (
        <G key={i} transform={`translate(${c.x} ${GROUND}) scale(${c.s})`} opacity={c.fade}>
          <Path d={`M-9 ${-c.h}H9V-2.6C9 .8-9 .8-9-2.6Z`} fill={MU.wax} />
          <Path d={`M4.5 ${-c.h + 0.4}H9V-2.6Q9-.4 4.5-.1Z`} fill="#E4D3B4" />
        </G>
      ))}
    </Svg>
  );
});

/** Candle tops: wax drips and the rim (from candle-body.svg), and the wick. Still. */
const CandleTops = memo(function CandleTops() {
  return (
    <Svg width={OF_W} height={OF_H} viewBox={`0 0 ${OF_W} ${OF_H}`} style={StyleSheet.absoluteFill}>
      {CANDLES.map((c, i) => (
        <G key={i} transform={`translate(${c.x} ${GROUND}) scale(${c.s})`} opacity={c.fade}>
          {/* candle-body.svg's top, moved so its rim (centred on y = 2.6 there) sits on y = -h */}
          <G transform={`translate(-9 ${-c.h - 2.6})`}>
            <Path
              fill="#FFF9EE"
              d="M1.1 3.1H3.5V9.5C3.5 12.4 1.1 12.4 1.1 9.5ZM4.4 3.3H6.3V7.3C6.3 9.8 4.4 9.8 4.4 7.3ZM14.3 3.1H16.5V6C16.5 8.6 14.3 8.6 14.3 6Z"
            />
            <Ellipse cx={9} cy={2.6} rx={9} ry={2.6} fill="#FFF9EE" />
            <Ellipse cx={9} cy={2.6} rx={5.8} ry={1.5} fill="#E4D3B4" />
            <Ellipse cx={8.5} cy={2.3} rx={4.7} ry={0.9} fill={MU.wax} />
          </G>
          <Line x1={0} y1={-c.h} x2={0} y2={-c.h - 5.5} stroke="#3A2A20" strokeWidth={1.3} strokeLinecap="round" />
        </G>
      ))}
    </Svg>
  );
});

const FrontRow = memo(function FrontRow() {
  return <SvgXml xml={FRONT_XML} width={OF_W} height={OF_H} style={StyleSheet.absoluteFill} />;
});

/* ------------------------------------------------------------------ a skeleton hand */

const BONE_STROKE = { stroke: MU.bone, strokeLinecap: 'round', fill: 'none' } as const;
/** Clods of earth thrown up as a hand breaks through: where each flies to. */
const DIRT = [
  { dx: -14, dy: -16, r: 1.8 },
  { dx: -6, dy: -24, r: 1.3 },
  { dx: 5, dy: -21, r: 1.6 },
  { dx: 13, dy: -13, r: 1.4 },
  { dx: 1, dy: -28, r: 1.1 },
].map((d) => ({ ...d, kf: flung(d.dx, d.dy, 1) }));

/** The hand's own box, in its units: (0, 0) is where it breaks the ground. */
const HAND_BOX = { left: -30, top: -60, w: 60, h: 74 };

/**
 * A skeleton hand reaching up out of the ground at (x, y) on the grid, about 28 wide and 50
 * tall: it bursts up through the earth after `delay` seconds, throwing up clods, then waves
 * about. Everything below the ground is clipped, so it rises out of it rather than appearing whole.
 */
function BonyHand({ x, s, delay, flip }: { x: number; s: number; delay: number; flip: boolean }) {
  const { left, top, w, h } = HAND_BOX;
  return (
    <View
      style={{
        position: 'absolute',
        left: x + left,
        top: GROUND + top,
        width: w,
        height: h,
        transformOrigin: [-left, -top, 0],
        transform: [{ scaleX: flip ? -s : s }, { scaleY: s }],
      }}
    >
      {/* Everything above the ground */}
      <View style={{ position: 'absolute', left: 0, top: 0, width: w, height: -top, overflow: 'hidden' }}>
        <Animated.View
          style={{
            width: w,
            height: h,
            animationName: MK.rise,
            animationDuration: '0.75s',
            animationDelay: `${delay}s`,
            animationTimingFunction: cubicBezier(0.25, 0.9, 0.35, 1),
            animationFillMode: 'both',
          }}
        >
          <Animated.View
            style={{
              width: w,
              height: h,
              // Pivots on the wrist end of the forearm
              transformOrigin: [-left, -top + 10, 0],
              animationName: MK.wave,
              animationDuration: '1.1s',
              animationDelay: `${(delay + 0.75).toFixed(2)}s`,
              animationIterationCount: 'infinite',
              animationTimingFunction: 'ease-in-out',
            }}
          >
            <Svg width={w} height={h} viewBox={`${left} ${top} ${w} ${h}`}>
              {/* Forearm: radius and ulna, running on down into the ground */}
              <Path d="M-2.6 10L-3-17M2.6 10L3.2-17" strokeWidth={3.6} {...BONE_STROKE} />
              {/* Wrist */}
              <Ellipse cx={0} cy={-20.5} rx={6.8} ry={4.6} fill={MU.bone} />
              {/* Palm bones, splaying out to the knuckles */}
              <Path d="M-4.6-22.5L-7.4-31.5M-1.6-23.5L-2.6-34M1.6-23.5L2.4-34M4.6-22.5L7-31" strokeWidth={2.5} {...BONE_STROKE} />
              {/* Fingers, two joints each */}
              <Path
                d="M-7.9-33.8L-9.2-39.6M-9.6-41.6L-10.4-45.6M-2.8-36.4L-3.3-43M-3.5-45L-3.8-49.6M2.6-36.4L3.2-43M3.4-45L3.8-49.6M7.5-33.4L8.8-39M9.2-41L10-44.6"
                strokeWidth={2.3}
                {...BONE_STROKE}
              />
              {/* Thumb */}
              <Path d="M-6-19.5L-10.5-24.5M-11.8-26.2L-13.6-29.6" strokeWidth={2.4} {...BONE_STROKE} />
            </Svg>
          </Animated.View>
        </Animated.View>
      </View>
      {/* The earth heaving up where it breaks through */}
      <Svg width={w} height={h} viewBox={`${left} ${top} ${w} ${h}`} style={StyleSheet.absoluteFill}>
        <Path d="M-13 1Q-6-4.5 0-5 6-4.5 13 1Z" fill={MU.stoneInk} />
      </Svg>
      {DIRT.map((d, i) => (
        <Animated.View
          key={i}
          style={{
            position: 'absolute',
            left: -left - d.r,
            top: -top - 3 - d.r,
            width: d.r * 2,
            height: d.r * 2,
            borderRadius: d.r,
            backgroundColor: i % 2 ? MU.stoneInk : '#4A3A5E',
            opacity: 0,
            animationName: d.kf,
            animationDuration: '0.7s',
            animationDelay: Math.round((delay + 0.1 + i * 0.03) * 1000),
            animationTimingFunction: cubicBezier(0.2, 0.7, 0.4, 1),
            animationFillMode: 'both',
          }}
        />
      ))}
    </View>
  );
}

/* ------------------------------------------------------------------ the strip */

const GLOW =
  'radial-gradient(circle closest-side, rgba(255,179,71,0.6) 0%, rgba(255,122,31,0.18) 45%, rgba(255,122,31,0) 100%)';
const WARM = 'linear-gradient(180deg, rgba(255,122,31,0.85) 0%, rgba(255,122,31,0) 100%)';

/**
 * One side of the ofrenda, `width` pt wide, standing on the bottom of its parent (the rail).
 * `lit` is the share of the bet the candles are lit up to; `flare` the flame size.
 */
export function Ofrenda({
  side,
  width,
  lit,
  flare,
  mood,
}: {
  side: 0 | 1;
  width: number;
  lit: number;
  flare: number;
  mood: SceneMood;
}) {
  const k = width / OF_W;
  const risen = mood === 'loss';
  return (
    <View
      style={{
        position: 'absolute',
        bottom: 0,
        [side ? 'right' : 'left']: 0,
        width: OF_W,
        height: OF_H,
        transformOrigin: side ? 'right bottom' : 'left bottom',
        transform: [{ scale: k }],
      }}
    >
      <View style={[StyleSheet.absoluteFill, side ? { transform: [{ scaleX: -1 }] } : null]}>
        {/* Back row: headstones, rattling on a late result as the dead get up */}
        {HEADSTONES.map((hs, i) => (
          <Animated.View
            key={i}
            style={[
              {
                position: 'absolute',
                left: hs.x - 14 * hs.s,
                top: GROUND - 44 * hs.s,
                width: 28 * hs.s,
                height: 44 * hs.s,
                transformOrigin: 'bottom',
              },
              risen && {
                animationName: MK.jolt,
                animationDuration: '2.2s',
                animationIterationCount: 'infinite',
                animationTimingFunction: 'ease-in-out',
              },
            ]}
          >
            <Art
              name={hs.cross ? 'muertos/headstone' : 'muertos/headstone-lines'}
              width={28 * hs.s}
              height={44 * hs.s}
            />
          </Animated.View>
        ))}
        {/* Late: the dead reach up out of the ground in front of them */}
        {risen && HANDS.map((hd, i) => <BonyHand key={i} x={hd.x} s={hd.s} delay={hd.delay[side]} flip={hd.flip} />)}

        {/* Candlelight round each lit flame */}
        {CANDLES.map((c, i) => {
          const on = c.on[side] < lit;
          // Setting the alarm lights them one after another, in their usual order
          const wait = mood === 'set' ? +(c.on[side] * 0.9).toFixed(2) : 0;
          const r = 30 * c.s;
          return (
            <Animated.View
              key={i}
              style={{
                position: 'absolute',
                left: c.x - r,
                top: GROUND - (c.h + 12) * c.s - r,
                width: r * 2,
                height: r * 2,
                backgroundImage: GLOW,
                opacity: on ? c.fade : 0,
                transform: [{ scale: flare }],
                transitionProperty: ['opacity', 'transform'],
                transitionDuration: [450, 400],
                transitionDelay: [wait * 1000, 0],
                transitionTimingFunction: 'ease-out',
              }}
            />
          );
        })}
        <CandleBodies />
        {/* Wax warmed orange by the flame, like candlelight on a real ofrenda */}
        {CANDLES.map((c, i) => {
          const on = c.on[side] < lit;
          const wait = mood === 'set' ? c.on[side] * 0.9 : 0;
          return (
            <Animated.View
              key={i}
              style={{
                position: 'absolute',
                left: c.x - 9 * c.s,
                top: GROUND - c.h * c.s,
                width: 18 * c.s,
                height: Math.min(18, c.h * 0.55) * c.s,
                backgroundImage: WARM,
                opacity: on ? c.fade : 0,
                transitionProperty: 'opacity',
                transitionDuration: 450,
                transitionDelay: wait * 1000,
                transitionTimingFunction: 'ease-out',
              }}
            />
          );
        })}
        <CandleTops />

        {CANDLES.map((c, i) => {
          const on = c.on[side] < lit;
          const wait = mood === 'set' ? c.on[side] * 0.9 : 0;
          // A snooze snuffs them all (every candle burns while the alarm's set): smoke curls
          // up from the wick, two wisps one after the other
          if (!on && mood === 'win')
            return [0, 1].map((j) => (
              <Animated.View
                key={`${i}-${j}`}
                style={{
                  position: 'absolute',
                  left: c.x - 4,
                  top: GROUND - (c.h + 6) * c.s - 20,
                  width: 8,
                  height: 20,
                  opacity: 0,
                  transformOrigin: 'bottom',
                  animationName: MK.smoke,
                  animationDuration: '2.6s',
                  animationDelay: `${(0.3 + j * 1.3 - c.delay * 0.4).toFixed(2)}s`,
                  animationIterationCount: 'infinite',
                  animationTimingFunction: 'ease-out',
                }}
              >
                <Svg width={8} height={20} viewBox="-4 -20 8 20">
                  <Path
                    d="M0 0C-2.4-3.5 2.4-6.5 0-10S2.2-16 0-19"
                    fill="none"
                    stroke="rgba(246,235,211,0.8)"
                    strokeWidth={1.6 * c.s}
                    strokeLinecap="round"
                  />
                </Svg>
              </Animated.View>
            ));
          // The flame, its base just over the wick: catches (or goes out) after `wait`, then flickers
          return (
            <Animated.View
              key={i}
              style={{
                position: 'absolute',
                left: c.x - 6 * c.s,
                top: GROUND - (c.h + 4) * c.s - 24 * c.s,
                width: 12 * c.s,
                height: 24 * c.s,
                transformOrigin: 'bottom',
                transform: [{ scale: flare }],
                opacity: on ? c.fade : 0,
                transitionProperty: ['opacity', 'transform'],
                transitionDuration: [450, 400],
                transitionDelay: [wait * 1000, 0],
                transitionTimingFunction: 'ease-out',
              }}
            >
              <Animated.View
                style={{
                  flex: 1,
                  transformOrigin: 'bottom',
                  animationName: MK.flicker,
                  animationDuration: `${c.dur}s`,
                  animationDelay: `${c.delay}s`,
                  animationIterationCount: 'infinite',
                  animationTimingFunction: 'ease-in-out',
                  // (An unlit flame holds still rather than flickering unseen.)
                  animationPlayState: on ? 'running' : 'paused',
                }}
              >
                <Art name="muertos/candle-flame" width={12 * c.s} height={24 * c.s} />
              </Animated.View>
            </Animated.View>
          );
        })}

        {/* Front row: a calaverita and marigolds */}
        <FrontRow />
      </View>
    </View>
  );
}

