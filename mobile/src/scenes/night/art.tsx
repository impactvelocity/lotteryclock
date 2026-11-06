/**
 * Night's illustrations (web: night-art.tsx, and the cloud from sunrise-art.tsx), from the SVGs
 * in web/src/components/scenes/art/night. The bat's three wing poses share one path structure:
 * the web morphs between them with SMIL; here the in-between frames are worked out once and
 * drawn side by side on a strip that slides past a window, a frame at a time.
 */
import { memo, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { steps } from 'react-native-reanimated';
import Svg, { Circle, ClipPath, Defs, G, Path } from 'react-native-svg';

import { Art } from '../art';
import { NKF } from './keyframes';
import { fontFor } from '@/themes/fonts';

/* ---------------------------------------------------------------- bats */

/** The bat's wing poses on a 32 × 14 grid: raised, level, lowered. Same commands in each. */
const BAT_RAISED =
  'M 13 6.1 C 9 3.8 5 2 0.5 0.7 Q 2.8 4.7 4.8 6.1 Q 5.8 5.3 6.9 8.2 Q 8.9 6.9 8.2 8.3 Q 10.3 9.5 11.4 9.2 Q 11.5 8.1 13 9.8 C 13.3 14.2 18.7 14.2 19 9.8 Q 20.5 8.1 20.6 9.2 Q 21.7 9.5 23.8 8.3 Q 23.1 6.9 25.1 8.2 Q 26.2 5.3 27.2 6.1 Q 29.2 4.7 31.5 0.7 C 27 2 23 3.8 19 6.1 L 18.4 2.4 Q 18.2 1.8 17.6 2.4 L 16.6 4.1 Q 16 3.8 15.4 4.1 L 14.4 2.4 Q 13.8 1.8 13.6 2.4 Z';
const BAT_LEVEL =
  'M 13 6.1 C 9 3.6 5 2.6 0.5 5.4 Q 2.7 7.7 4.8 9.4 Q 5.8 7.4 6.9 10.7 Q 8.9 8.7 8.2 10.6 Q 10.3 11.5 11.4 10.4 Q 11.5 9 13 9.8 C 13.3 14.2 18.7 14.2 19 9.8 Q 20.5 9 20.6 10.4 Q 21.7 11.5 23.8 10.6 Q 23.1 8.7 25.1 10.7 Q 26.2 7.4 27.2 9.4 Q 29.3 7.7 31.5 5.4 C 27 2.6 23 3.6 19 6.1 L 18.4 2.4 Q 18.2 1.8 17.6 2.4 L 16.6 4.1 Q 16 3.8 15.4 4.1 L 14.4 2.4 Q 13.8 1.8 13.6 2.4 Z';
const BAT_LOWERED =
  'M 13 6.1 C 9 5.5 4 7.8 0.5 12.7 Q 2.7 10.7 4.8 12.3 Q 5.8 10.2 6.9 12.7 Q 8.9 9.7 8.2 11.7 Q 10.3 12.3 11.4 10.8 Q 11.5 9.5 13 9.8 C 13.3 14.2 18.7 14.2 19 9.8 Q 20.5 9.5 20.6 10.8 Q 21.7 12.3 23.8 11.7 Q 23.1 9.7 25.1 12.7 Q 26.2 10.2 27.2 12.3 Q 29.3 10.7 31.5 12.7 C 28 7.8 23 5.5 19 6.1 L 18.4 2.4 Q 18.2 1.8 17.6 2.4 L 16.6 4.1 Q 16 3.8 15.4 4.1 L 14.4 2.4 Q 13.8 1.8 13.6 2.4 Z';
/** One wingbeat: up, through level, down, and back (the web's keyTimes 0, ¼, ½, ¾, 1). */
const BAT_BEAT = [BAT_RAISED, BAT_LEVEL, BAT_LOWERED, BAT_LEVEL, BAT_RAISED];

/** cubic-bezier(x1, y1, x2, y2) as a function of x, for working out the in-between poses. */
function bezier(x1: number, y1: number, x2: number, y2: number) {
  const at = (a: number, b: number, t: number) => 3 * a * t * (1 - t) ** 2 + 3 * b * t * t * (1 - t) + t ** 3;
  return (x: number) => {
    let t = x;
    for (let i = 0; i < 8; i++) {
      const dx = 3 * x1 * (1 - t) ** 2 + 6 * (x2 - x1) * t * (1 - t) + 3 * (1 - x2) * t * t;
      if (Math.abs(dx) < 1e-6) break;
      t = Math.max(0, Math.min(1, t - (at(x1, x2, t) - x) / dx));
    }
    return at(y1, y2, t);
  };
}

const NUM = /-?\d*\.?\d+/g;

/** A path part-way (`u`) from `a` to `b`: they share their commands, so only the numbers move. */
function lerpPath(a: string, b: string, u: number) {
  const to = b.match(NUM)!.map(Number);
  let i = 0;
  return a.replace(NUM, (m) => {
    const v = Number(m) + (to[i++] - Number(m)) * u;
    return String(Math.round(v * 100) / 100);
  });
}

/** Frames per wingbeat: enough for a smooth flap at a bat's size. */
const BAT_FRAMES = 12;
const EASE = bezier(0.4, 0, 0.6, 1);
const BAT_STRIP = Array.from({ length: BAT_FRAMES }, (_, f) => {
  const t = (f / BAT_FRAMES) * 4;
  const seg = Math.floor(t);
  return lerpPath(BAT_BEAT[seg], BAT_BEAT[seg + 1], EASE(t - seg));
});

/** A bat in flight, `width` wide: the wings beat through the three poses every `beat` seconds. */
export const Bat = memo(function Bat({ width, beat }: { width: number; beat: number }) {
  const h = (width * 14) / 32;
  return (
    <View style={{ width, height: h, overflow: 'hidden' }}>
      <Animated.View
        style={{
          width: width * BAT_FRAMES,
          height: h,
          animationName: NKF.flap,
          animationDuration: `${beat}s`,
          animationIterationCount: 'infinite',
          animationTimingFunction: steps(BAT_FRAMES),
        }}
      >
        <Svg width={width * BAT_FRAMES} height={h} viewBox={`0 0 ${32 * BAT_FRAMES} 14`}>
          {BAT_STRIP.map((d, f) => (
            <Path key={f} d={d} fill="#0C0614" transform={`translate(${32 * f} 0)`} />
          ))}
        </Svg>
      </Animated.View>
    </View>
  );
});

/* ---------------------------------------------------------------- moon */

/**
 * The full moon's surface (80 × 80 grid, disc r 30 at 40,40), from art/night/moon-full.svg:
 * the dark "seas" (maria), crater rims and craters, each drawn at its own opacity in one shade
 * over any fill, so they follow the moon's colour as it warms.
 */
export const MOON_SURFACE = {
  maria: {
    opacity: 0.12,
    d: [
      'M 24 20 C 29 15 39 15 42 21 C 44 25 39 27 38 31 C 36 35 30 34 27 30 C 24 27 20 26 24 20 Z',
      'M 46 28 C 53 23 63 30 63 37 C 62 43 55 46 51 43 C 47 41 50 37 46 35 C 43 33 43 30 46 28 Z',
      'M 30 41 C 34 37 43 39 45 44 C 48 47 46 50 49 54 C 50 60 43 64 38 61 C 34 58 35 54 31 53 C 26 51 26 45 30 41 Z',
      'M 19 39 C 22 37 26 39 26 42 C 27 46 22 49 19 46 C 17 44 17 41 19 39 Z',
    ],
  },
  rims: {
    opacity: 0.06,
    circles: [
      [24, 31, 3.7],
      [58, 47, 4.3],
      [52, 57, 3.4],
    ] as [number, number, number][],
  },
  craters: {
    opacity: 0.18,
    circles: [
      [24, 31, 2.5],
      [42, 22, 2],
      [58, 47, 3],
      [31, 58, 2],
      [52, 57, 2.4],
      [48, 41, 1.8],
      [36, 34, 1.5],
    ] as [number, number, number][],
  },
};

/** The seas, rims and craters in warm shading, for the moon's 80-unit grid. */
export function MoonSurface() {
  return (
    <G fill="#6E4A2C">
      <G opacity={MOON_SURFACE.maria.opacity}>
        {MOON_SURFACE.maria.d.map((d, i) => (
          <Path key={i} d={d} />
        ))}
      </G>
      {[MOON_SURFACE.rims, MOON_SURFACE.craters].map((set, k) => (
        <G key={k} opacity={set.opacity}>
          {set.circles.map(([cx, cy, r], i) => (
            <Circle key={i} cx={cx} cy={cy} r={r} />
          ))}
        </G>
      ))}
    </G>
  );
}

/* ---------------------------------------------------------------- stars */

const SPIKES =
  'M 12 0 C 12.2 9.8 12.6 11.4 24 12 C 12.6 12.6 12.2 14.2 12 24 C 11.8 14.2 11.4 12.6 0 12 C 11.4 11.4 11.8 9.8 12 0 Z';
const SPIKES_SHORT =
  'M 8.8 8.8 Q 11.5 11.1 12 11.2 Q 12.5 11.1 15.2 8.8 Q 12.9 11.5 12.8 12 Q 12.9 12.5 15.2 15.2 Q 12.5 12.9 12 12.8 Q 11.5 12.9 8.8 15.2 Q 11.1 12.5 11.2 12 Q 11.1 11.5 8.8 8.8 Z';

/**
 * A bright star on a 24 × 24 grid (art/night/star-bright.svg): a soft halo, diffraction spikes
 * tapering to hairlines and a white-hot core. `tint` colours the halo and spikes.
 */
export const StarArt = memo(function StarArt({ size, tint = '#FFF3DC' }: { size: number; tint?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={12} r={5} fill={tint} opacity={0.12} />
      <Circle cx={12} cy={12} r={2.8} fill={tint} opacity={0.28} />
      <Path d={SPIKES} fill={tint} />
      <Path d={SPIKES_SHORT} fill={tint} />
      <Circle cx={12} cy={12} r={1.5} fill="#FFFFFF" />
    </Svg>
  );
});

/* ---------------------------------------------------------------- clouds */

/** Outlines of the five clouds (web: sunrise-art.tsx), on a 280 × 160 grid with flat bottoms at y = 132. */
const CLOUD_SHAPES = [
  'M 44 132 C 22 132 18 118 22 104 C 25 91 37 83 52 84 C 50 62 67 47 88 50 C 96 22 135 19 151 45 C 171 35 196 46 199 67 C 224 61 244 79 241 98 C 264 101 269 132 244 132 Z',
  'M 37 132 C 15 132 14 105 34 100 C 30 78 49 62 68 68 C 74 39 111 34 128 57 C 145 44 174 48 182 73 C 203 63 226 77 225 99 C 248 94 264 111 254 124 C 250 130 244 132 235 132 Z',
  'M 47 132 C 22 132 19 102 42 96 C 39 75 57 62 76 67 C 72 35 104 16 128 34 C 149 19 180 33 179 61 C 203 53 226 68 224 90 C 244 85 261 104 253 120 C 250 128 242 132 232 132 Z',
  'M 31 132 C 12 132 11 110 27 103 C 28 83 47 73 65 80 C 73 57 100 53 116 69 C 129 43 165 40 182 65 C 201 56 223 70 222 91 C 245 90 261 107 253 122 C 249 130 242 132 231 132 Z',
  'M 49 132 C 26 132 21 107 39 97 C 34 76 51 58 73 62 C 78 34 111 24 132 44 C 155 32 183 47 185 72 C 204 65 225 78 225 97 C 247 96 260 113 250 125 C 246 130 240 132 230 132 Z',
];

/** A cloud: `top` colour above, with two belly bands underneath. */
export const Cloud = memo(function Cloud({
  shape,
  width,
  top,
  belly,
  bellyLight,
  id,
}: {
  shape: number;
  width: number;
  top: string;
  belly: string;
  bellyLight: string;
  id: string;
}) {
  const d = CLOUD_SHAPES[shape % CLOUD_SHAPES.length];
  return (
    <Svg width={width} height={(width * 160) / 280} viewBox="0 0 280 160">
      <Defs>
        <ClipPath id={id}>
          <Path d={d} />
        </ClipPath>
      </Defs>
      <Path fill={top} d={d} />
      <G clipPath={`url(#${id})`}>
        <Path fill={bellyLight} d="M 8 107 C 60 117 92 101 142 111 C 192 121 222 106 274 109 L 274 145 L 8 145 Z" />
        <Path fill={belly} d="M 8 125 C 62 119 104 126 151 123 C 198 120 234 125 274 121 L 274 145 L 8 145 Z" />
      </G>
    </Svg>
  );
});

/* ---------------------------------------------------------------- sheep */

/** Seconds for one sheep to cross the lane; a new one sets off every half of that. */
const CROSS_S = 1.2;
const GAP_S = CROSS_S / 2;
/** The first sheep is already on its way in, so it clears the fence this soon. */
const FIRST_CLEAR_S = 0.3;

/** A soft moonlit rim round each sheep (the web's drop-shadow; iOS shadows follow the art). */
const SHEEP_GLOW = {
  shadowColor: '#F4EEF8',
  shadowOpacity: 0.45,
  shadowRadius: 1.5,
  shadowOffset: { width: 0, height: 0 },
} as const;

/**
 * "Counting sheep": while Night's draw rolls, sheep hop a little fence one after another and
 * the count pops up as each one clears it. Sits just above the progress bar, which is their ground.
 */
export function CountingSheep({ ink, fence }: { ink: string; fence: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    const first = setTimeout(() => {
      setCount(1);
      interval = setInterval(() => setCount((c) => c + 1), GAP_S * 1000);
    }, FIRST_CLEAR_S * 1000);
    return () => {
      clearTimeout(first);
      clearInterval(interval);
    };
  }, []);

  return (
    <View style={styles.lane}>
      <View style={styles.fence}>
        <Art name="night/fence" width={34} height={17} color={fence} />
      </View>
      {[0, 1].map((i) => {
        const timing = {
          animationDuration: `${CROSS_S}s`,
          animationDelay: `${Math.round((i * GAP_S - (CROSS_S / 2 - FIRST_CLEAR_S)) * 100) / 100}s`,
          animationIterationCount: 'infinite',
          animationTimingFunction: 'linear',
          animationFillMode: 'backwards',
        } as const;
        return (
          <Animated.View key={i} style={[StyleSheet.absoluteFill, { animationName: NKF.sheepRun, ...timing }]}>
            <Animated.View style={[StyleSheet.absoluteFill, { animationName: NKF.sheepHop, ...timing }]}>
              <Animated.View style={[styles.sheep, SHEEP_GLOW, { animationName: NKF.sheepGround, ...timing }]}>
                <Art name="night/sheep-standing" width={40} height={30} />
              </Animated.View>
              <Animated.View style={[styles.sheep, SHEEP_GLOW, { animationName: NKF.sheepAir, ...timing }]}>
                <Art name="night/sheep-jumping" width={40} height={30} />
              </Animated.View>
            </Animated.View>
          </Animated.View>
        );
      })}
      {count > 0 && (
        <Animated.Text
          key={count}
          style={[
            styles.count,
            {
              color: ink,
              animationName: NKF.countPop,
              animationDuration: '0.55s',
              animationTimingFunction: 'ease-out',
              animationFillMode: 'both',
            },
          ]}
        >
          {count}
        </Animated.Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  lane: { width: 160, height: 44 },
  fence: { position: 'absolute', bottom: 0, left: 80 - 17 },
  sheep: { position: 'absolute', bottom: 0, left: 0, width: 40, height: 30 },
  count: {
    position: 'absolute',
    top: 0,
    right: 4,
    fontFamily: fontFor('sans', 800),
    fontSize: 14,
    fontVariant: ['tabular-nums'],
  },
});
