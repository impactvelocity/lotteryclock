/**
 * Old-film effects laid over the whole Play screen, text and dial included (web: FilmFX in
 * ouija-scene.tsx), all kept faint: moving grain, specks that flash for a frame, running lines
 * that skip across and a slow warm light leak. No flicker: the board itself holds steady.
 *
 * Kept cheap: the grain is one still vector tile pattern, jittered by moving its view (no
 * redraws); twelve specks and two lines step on and off; the leak is one gradient breathing.
 */
import { memo, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { css, FadeIn, steps } from 'react-native-reanimated';
import Svg, { Defs, Path, Pattern, Rect } from 'react-native-svg';

import { BONE, OK, grainPath } from './art';
import { frac } from '@/lib/rand';

/** Neutral grain: light and dark specks on one 100-pt tile. */
const GRAIN_TILE = 100;
const GRAIN_LIGHT = grainPath(380, GRAIN_TILE, 23, 0.4, 0.9);
const GRAIN_DARK = grainPath(380, GRAIN_TILE, 29, 0.4, 0.9);
/** The grain layer overhangs the screen by this much each way, so its jitter never shows an edge. */
const OVER = 40;

const Grain = memo(function Grain({ width, height }: { width: number; height: number }) {
  const w = width + OVER * 2;
  const h = height + OVER * 2;
  return (
    <Svg width={w} height={h}>
      <Defs>
        <Pattern id="lc-ouija-film-grain" patternUnits="userSpaceOnUse" width={GRAIN_TILE} height={GRAIN_TILE}>
          <Path d={GRAIN_LIGHT} fill="#FFFFFF" />
          <Path d={GRAIN_DARK} fill="#000000" />
        </Pattern>
      </Defs>
      <Rect width={w} height={h} fill="url(#lc-ouija-film-grain)" />
    </Svg>
  );
});

/** Dust and nicks on the print that flash up for a frame or two, then vanish. */
const SPECKS = Array.from({ length: 12 }, (_, i) => ({
  x: frac(i, 81),
  y: frac(i, 82),
  s: 1.5 + frac(i, 83) * 3.5,
  dur: +(2.2 + frac(i, 84) * 5).toFixed(2),
  delay: +(-frac(i, 85) * 7).toFixed(2),
  dark: frac(i, 86) > 0.55,
  o: +(0.18 + frac(i, 87) * 0.25).toFixed(2),
  // Irregular blobs, not perfect dots
  r: [0.4 + frac(i, 88) * 0.6, 0.3 + frac(i, 89) * 0.7] as const,
}));

/** Thin running lines that jump along the frame now and then. */
const RUN_LINES = [
  { dur: 7.3, delay: -1.2, o: 0.07 },
  { dur: 11.9, delay: -6.4, o: 0.05 },
];

export function FilmFX({ width, height }: { width: number; height: number }) {
  // lc-film-line: where the line jumps to, as a share of the width (run with steps(1))
  const line = useMemo(() => {
    const at = (x: number, opacity: number) => ({ opacity, transform: [{ translateX: x * width }] });
    return css.keyframes({
      '0%': at(0.23, 0),
      '30%': at(0.23, 1),
      '33%': at(0.24, 1),
      '35%': at(0.61, 1),
      '38%': at(0.61, 0),
      '70%': at(0.82, 1),
      '72%': at(0.81, 1),
      '74%': at(0.81, 0),
      '100%': at(0.81, 0),
    });
  }, [width]);

  return (
    <Animated.View
      pointerEvents="none"
      entering={FadeIn.duration(600)}
      style={[StyleSheet.absoluteFill, { overflow: 'hidden' }]}
    >
      <Animated.View
        style={{
          position: 'absolute',
          left: -OVER,
          top: -OVER,
          opacity: 0.09,
          mixBlendMode: 'overlay',
          animationName: OK.grain,
          animationDuration: '0.42s',
          animationIterationCount: 'infinite',
          animationTimingFunction: steps(1, 'jump-end'),
        }}
      >
        <Grain width={width} height={height} />
      </Animated.View>
      {SPECKS.map((d, i) => (
        <View
          key={i}
          style={{ position: 'absolute', left: d.x * width, top: d.y * height, opacity: d.o }}
        >
          <Animated.View
            style={{
              width: d.s,
              height: d.s * 0.8,
              borderTopLeftRadius: d.s * d.r[0],
              borderBottomRightRadius: d.s * d.r[0],
              borderTopRightRadius: d.s * d.r[1],
              borderBottomLeftRadius: d.s * d.r[1],
              backgroundColor: d.dark ? '#000' : BONE,
              opacity: 0,
              animationName: OK.speck,
              animationDuration: `${d.dur}s`,
              animationDelay: `${d.delay}s`,
              animationIterationCount: 'infinite',
              animationTimingFunction: steps(1, 'jump-end'),
            }}
          />
        </View>
      ))}
      {RUN_LINES.map((l, i) => (
        <View key={i} style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 1, opacity: l.o }}>
          <Animated.View
            style={{
              flex: 1,
              backgroundImage: `linear-gradient(180deg, transparent 0%, ${BONE} 10%, ${BONE} 90%, transparent 100%)`,
              opacity: 0,
              animationName: line,
              animationDuration: `${l.dur}s`,
              animationDelay: `${l.delay}s`,
              animationIterationCount: 'infinite',
              animationTimingFunction: steps(1, 'jump-end'),
            }}
          />
        </View>
      ))}
      {/* A warm light leak breathing in from the top right */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundImage: 'radial-gradient(ellipse 45% 65% at 100% 15%, rgba(255,140,60,0.9) 0%, transparent 70%)',
            mixBlendMode: 'screen',
            opacity: 0,
            animationName: OK.leak,
            animationDuration: '11s',
            animationIterationCount: 'infinite',
            animationTimingFunction: 'ease-in-out',
          },
        ]}
      />
    </Animated.View>
  );
}
