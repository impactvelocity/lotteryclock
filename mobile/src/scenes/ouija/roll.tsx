/**
 * Shown above the progress bar while the draw rolls ("Consulting the other side"; web: OuijaRoll
 * in ouija-scene.tsx): a little spirit board, with the planchette gliding from letter to letter,
 * each one flaring ember as the glass rests on it.
 */
import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { css } from 'react-native-reanimated';
import Svg, { Circle, Defs, G, Path, RadialGradient, Rect, Stop, Text } from 'react-native-svg';

import { BONE, EMBER, GOLD, SERIF } from './art';

/** The board's own grid, drawn at W × H pt. */
const VB_W = 168;
const VB_H = 72;
const W = 200;
const H = 86;
const K = W / VB_W;

/** Mini board letters: A–M on an upper arc, N–Z on a lower one. */
const MINI_C = { x: 84, y: 84 };
const MINI_LETTERS = [
  ...Array.from('ABCDEFGHIJKLM', (ch, i) => ({ ch, r: 62, a: -60 + (120 / 12) * i })),
  ...Array.from('NOPQRSTUVWXYZ', (ch, i) => ({ ch, r: 45, a: -60 + (120 / 12) * i })),
].map(({ ch, r, a }) => {
  const rad = (a * Math.PI) / 180;
  return {
    ch,
    a,
    r,
    x: Math.round((MINI_C.x + Math.sin(rad) * r) * 10) / 10,
    y: Math.round((MINI_C.y - Math.cos(rad) * r) * 10) / 10,
  };
});
const miniAt = (ch: string) => MINI_LETTERS.find((l) => l.ch === ch)!;

/** Where the glass drifts while the draw rolls, a letter at a time, like it's thinking it over. */
const DARTS = 'KEYNOTAG'.split('').map(miniAt);
/** Seconds per letter: about 60% gliding there, the rest resting on it. */
const DART_S = 0.55;
const GLIDE = 0.6;
const DURATION = `${DART_S * DARTS.length}s`;
const pct = (t: number) => `${Math.round(t * 1000) / 10}%`;

/** The planchette's path: glide to each letter, rest there, on round. Its box is 40 pt, centred. */
const GLASS = 40;
const at = (l: (typeof DARTS)[number]) => ({
  transform: [{ translateX: l.x * K - GLASS / 2 }, { translateY: l.y * K - GLASS / 2 }],
});
const GLASS_PATH = css.keyframes({
  '0%': at(DARTS[DARTS.length - 1]),
  ...Object.fromEntries(
    DARTS.flatMap((l, i) => [
      [pct((i + GLIDE) / DARTS.length), at(l)],
      [pct((i + 1) / DARTS.length), at(l)],
    ]),
  ),
});

/** Each letter flares while the glass rests on it. */
const FLARES = DARTS.map((_, i) => {
  const a = (i + GLIDE) / DARTS.length;
  const b = (i + 1) / DARTS.length;
  return css.keyframes({
    '0%': { opacity: 0 },
    [pct(Math.max(0.001, a - 0.01))]: { opacity: 0 },
    [pct(a)]: { opacity: 1 },
    [pct(b - 0.02)]: { opacity: 1 },
    [pct(b)]: { opacity: 0 },
    '100%': { opacity: 0 },
  });
});

const letterProps = (l: (typeof MINI_LETTERS)[number]) => ({
  x: l.x,
  y: l.y,
  fontSize: l.r > 50 ? 8.5 : 7,
  fontFamily: SERIF,
  textAnchor: 'middle' as const,
  alignmentBaseline: 'central' as const,
  transform: `rotate(${l.a.toFixed(1)} ${l.x} ${l.y})`,
});

/** The board: charcoal, double gold rule, YES and NO, a tiny sun and moon, the letters. */
const Board = memo(function Board() {
  return (
    <Svg viewBox={`0 0 ${VB_W} ${VB_H}`} width={W} height={H} style={StyleSheet.absoluteFill}>
      <Rect x={1} y={1} width={166} height={70} rx={10} fill="#120F0D" fillOpacity={0.85} stroke={GOLD} strokeOpacity={0.7} />
      <Rect x={5} y={5} width={158} height={62} rx={7} fill="none" stroke={GOLD} strokeOpacity={0.3} strokeWidth={0.6} />
      <G fill={GOLD}>
        <Text x={21} y={17} fontSize={7.5} fontFamily={SERIF} textAnchor="middle" letterSpacing={0.75}>
          YES
        </Text>
        <Text x={147} y={17} fontSize={7.5} fontFamily={SERIF} textAnchor="middle" letterSpacing={0.75}>
          NO
        </Text>
        <Text x={84} y={65} fontSize={5} fontFamily={SERIF} textAnchor="middle" letterSpacing={1.5} fillOpacity={0.7}>
          GOODBYE
        </Text>
        <Circle cx={21} cy={27} r={3} fill="none" stroke={GOLD} strokeWidth={0.7} />
        <Path d="M144 24a3.4 3.4 0 1 0 4.6 4.6a2.7 2.7 0 0 1 -4.6 -4.6z" />
        {MINI_LETTERS.map((l) => (
          <Text key={l.ch} {...letterProps(l)} fillOpacity={0.85}>
            {l.ch}
          </Text>
        ))}
      </G>
    </Svg>
  );
});

/** A letter flared ember: a soft ember outline under the bright glyph (for the web's drop-shadow). */
const Flare = memo(function Flare({ i }: { i: number }) {
  const l = DARTS[i];
  return (
    <Svg viewBox={`0 0 ${VB_W} ${VB_H}`} width={W} height={H}>
      <Text {...letterProps(l)} fill={EMBER} stroke={EMBER} strokeWidth={1.6} strokeOpacity={0.45}>
        {l.ch}
      </Text>
      <Text {...letterProps(l)} fill="#FFE2C6">
        {l.ch}
      </Text>
    </Svg>
  );
});

/** A planchette with its window at (0, 0), point up. */
const PLANCHETTE = 'M0 -18C6 -12 11 -5 11 1C11 7 6 10 0 10C-6 10 -11 7 -11 1C-11 -5 -6 -12 0 -18Z';

const Glass = memo(function Glass() {
  const u = GLASS / K;
  return (
    <Svg viewBox={`${-u / 2} ${-u / 2} ${u} ${u}`} width={GLASS} height={GLASS}>
      <Defs>
        <RadialGradient id="lc-ouija-mini-glow">
          <Stop offset="0" stopColor={EMBER} stopOpacity={0.9} />
          <Stop offset="1" stopColor={EMBER} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Circle r={9} fill="url(#lc-ouija-mini-glow)" opacity={0.55} />
      <Path d={PLANCHETTE} fill={BONE} fillOpacity={0.14} stroke={BONE} strokeWidth={1} strokeLinejoin="round" />
      <Circle r={5} fill="none" stroke={BONE} strokeWidth={1} />
      <Path d="M-1.6 -11.5a2.2 2.2 0 1 0 3.2 0a1.8 1.8 0 0 1 -3.2 0z" fill={BONE} fillOpacity={0.8} />
    </Svg>
  );
});

export function OuijaRoll() {
  return (
    <View style={{ width: W, height: H, marginBottom: 8 }}>
      <Board />
      {DARTS.map((_, i) => (
        <Animated.View
          key={i}
          style={[
            StyleSheet.absoluteFill,
            {
              opacity: 0,
              animationName: FLARES[i],
              animationDuration: DURATION,
              animationIterationCount: 'infinite',
              animationTimingFunction: 'linear',
            },
          ]}
        >
          <Flare i={i} />
        </Animated.View>
      ))}
      <Animated.View
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: GLASS,
          height: GLASS,
          animationName: GLASS_PATH,
          animationDuration: DURATION,
          animationIterationCount: 'infinite',
          animationTimingFunction: 'ease-in-out',
        }}
      >
        <Glass />
      </Animated.View>
    </View>
  );
}
