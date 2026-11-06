/**
 * Poker's chips, ported from web/src/components/scenes/poker-scene.tsx: stacks seen from a
 * little above (each chip its own view, so chips can drop on, lift off or topple over), and a
 * chip seen face on, for chips in flight.
 */
import { memo, useMemo } from 'react';
import { View } from 'react-native';
import Animated, { css, cubicBezier, Easing, Keyframe } from 'react-native-reanimated';
import Svg, { Circle, Defs, Ellipse, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

import { frac } from '@/lib/rand';
import { css as rgb, mixHex } from '@/themes/themes';

/** Chip colours: face, side (the edge, in shadow), and the edge inserts. */
export const CHIPS = {
  red: { face: '#D3343C', side: '#A5242B', spot: '#F6F0E4' },
  black: { face: '#2C2C33', side: '#18181D', spot: '#F6F0E4' },
  blue: { face: '#2F63C6', side: '#1F4592', spot: '#F6F0E4' },
  white: { face: '#F2EDE3', side: '#CCC4B5', spot: '#D3343C' },
  purple: { face: '#7B3FA6', side: '#572A7A', spot: '#FFD966' },
  gold: { face: '#EDC151', side: '#B88A24', spot: '#FFF7DD' },
} as const;
export type ChipColor = keyof typeof CHIPS;

/** A chip in the stack view: 100 units wide, seen from a little above. */
const RX = 44;
const RY = 19;
const TH = 8;
/** One chip's box: its edge band plus the top and bottom of its ellipse. */
const BOX_H = TH + 2 * RY;
/** Room under the bottom chip for its contact shadow. */
const FOOT = 2;

const shade = (hex: string, toward: string, t: number) => rgb(mixHex(hex, toward, t));

/** An ellipse's circumference (Ramanujan), for laying dashes out like the web's pathLength. */
const perimeter = (a: number, b: number) => Math.PI * (3 * (a + b) - Math.sqrt((3 * a + b) * (a + 3 * b)));
const INSERTS_LEN = perimeter(RX * 0.84, RY * 0.84) / 64;

/**
 * One chip, drawn in its own 100 × 46 box: its edge band (lower edge centred at y 38) and its
 * face on top. `turn` rotates the edge inserts, like a real messy stack; `cx` nudges it sideways.
 */
const ChipShape = memo(function ChipShape({ color, cx, turn }: { color: ChipColor; cx: number; turn: number }) {
  const c = CHIPS[color];
  const yB = BOX_H - RY;
  const yT = yB - TH;
  const l = cx - RX;
  const r = cx + RX;
  const band = `M${l} ${yT}V${yB}A${RX} ${RY} 0 0 0 ${r} ${yB}V${yT}A${RX} ${RY} 0 0 1 ${l} ${yT}Z`;
  // Inserts on the visible (front) half of the edge, narrowing as they turn away
  const spots = Array.from({ length: 8 }, (_, k) => {
    const a = ((turn + k * 45) * Math.PI) / 180;
    const s = Math.sin(a);
    if (s < 0.15) return null;
    const x = cx + RX * Math.cos(a);
    const hw = 4.8 * s;
    return (
      <Rect key={k} x={x - hw} y={yT + RY * s + 1.2} width={hw * 2} height={TH - 2.4} fill={c.spot} opacity={0.55 + s * 0.4} />
    );
  });
  return (
    <Svg viewBox={`0 0 100 ${BOX_H}`} width="100%" height="100%">
      <Defs>
        <LinearGradient id="side" x1="0" x2="1" y1="0" y2="0">
          <Stop offset="0" stopColor={shade(c.side, '#FFFFFF', 0.18)} />
          <Stop offset="0.32" stopColor={c.side} />
          <Stop offset="0.78" stopColor={c.side} />
          <Stop offset="1" stopColor={shade(c.side, '#000000', 0.4)} />
        </LinearGradient>
      </Defs>
      <Path d={band} fill="url(#side)" />
      {spots}
      <Path d={`M${l} ${yB}A${RX} ${RY} 0 0 0 ${r} ${yB}`} fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth={0.9} />
      <Ellipse cx={cx} cy={yT} rx={RX} ry={RY} fill={c.face} />
      {/* Inserts round the rim of the face, lined up with the ones on the edge */}
      <Ellipse
        cx={cx}
        cy={yT}
        rx={RX * 0.84}
        ry={RY * 0.84}
        fill="none"
        stroke={c.spot}
        strokeWidth={5}
        strokeDasharray={[4 * INSERTS_LEN, 4 * INSERTS_LEN]}
        strokeDashoffset={(2 - turn / 5.625) * INSERTS_LEN}
      />
      <Ellipse cx={cx} cy={yT} rx={RX * 0.6} ry={RY * 0.6} fill={shade(c.face, '#FFFFFF', 0.1)} />
      <Ellipse
        cx={cx}
        cy={yT}
        rx={RX * 0.6}
        ry={RY * 0.6}
        fill="none"
        stroke={c.spot}
        strokeOpacity={0.6}
        strokeWidth={1}
        strokeDasharray={[2.2, 2.4]}
      />
      {/* Light catching the front lip */}
      <Path
        d={`M${l + 1} ${yT + 1}A${RX} ${RY} 0 0 0 ${r - 1} ${yT + 1}`}
        fill="none"
        stroke="rgba(255,255,255,0.22)"
        strokeWidth={1}
      />
    </Svg>
  );
});

const EASE_OUT = cubicBezier(0, 0, 0.58, 1);
const EASE_IN = cubicBezier(0.42, 0, 1, 1);

/**
 * A stack of `n` chips, its bottom centre at the bottom centre of its box, `width` pt across.
 * New chips drop on from above and leave the same way. With `topple` set, every chip but the
 * bottom one tips over and skids out across the felt, the higher chips sliding furthest, then
 * fades: a busted stack.
 */
export function ChipStack({
  n,
  color,
  width,
  seed,
  topple = false,
}: {
  n: number;
  color: ChipColor;
  width: number;
  seed: number;
  topple?: boolean;
}) {
  const u = width / 100;
  const chipH = BOX_H * u;
  // Which way this stack falls
  const dir = frac(seed, 77) < 0.5 ? -1 : 1;

  const { drop, lift } = useMemo(
    () => ({
      // Dropped on from a chip's height above, with a little bounce
      drop: new Keyframe({
        0: { opacity: 0, transform: [{ translateY: -16 * u }] },
        100: { opacity: 1, transform: [{ translateY: 0 }], easing: Easing.bezier(0.3, 1.5, 0.6, 1) },
      }).duration(260),
      lift: new Keyframe({
        0: { opacity: 1, transform: [{ translateY: 0 }] },
        100: { opacity: 0, transform: [{ translateY: -10 * u }] },
      }).duration(180),
    }),
    [u],
  );

  // Busted: lean, then fall to the felt, tilted, and skid out flat, spilling the stack in a
  // line: the higher the chip, the further it goes. A beat lying there, then gone.
  const falls = useMemo(
    () =>
      topple
        ? Array.from({ length: n }, (_, i) => {
            const k = (s: number) => frac(i, seed + s);
            const dist = dir * (14 + i * 10 + k(5) * 10) * u;
            const fall = (i * TH + i * 1.2 + (k(6) - 0.3) * 14) * u;
            const tilt = dir * (20 + k(7) * 25);
            const flat = (k(10) - 0.5) * 8;
            const at = (x: number, y: number, r: number) => ({
              transform: [{ translateX: x }, { translateY: y }, { rotate: `${r}deg` }],
            });
            return {
              duration: 1.5 + k(8) * 0.2,
              delay: 0.55 + k(9) * 0.08,
              keyframes: css.keyframes({
                '0%': { ...at(0, 0, 0), opacity: 1, animationTimingFunction: EASE_OUT },
                '14%': { ...at(dir * 3 * u, -4 * u, dir * 8), animationTimingFunction: EASE_IN },
                '42%': { ...at(dist * 0.75, fall, tilt), animationTimingFunction: EASE_OUT },
                '50%': { ...at(dist * 0.9, fall - 4 * u, flat), animationTimingFunction: EASE_IN },
                '58%': { ...at(dist, fall, flat), animationTimingFunction: 'linear' },
                '82%': { ...at(dist, fall, flat), opacity: 1, animationTimingFunction: 'linear' },
                '100%': { ...at(dist, fall, flat), opacity: 0 },
              }),
            };
          })
        : [],
    [topple, n, seed, dir, u],
  );

  return (
    <View style={{ width, height: (Math.max(n, 1) * TH + 2 * RY + 4) * u }}>
      {/* Contact shadow on the felt */}
      <Svg
        viewBox="0 0 100 46"
        width={width}
        height={46 * u}
        // Centred 18 units up (the web's Y0 + 3)
        style={{ position: 'absolute', left: 0, bottom: (RY - 1 - 23) * u }}
      >
        <Ellipse cx={50} cy={23} rx={RX + 4} ry={RY + 2} fill="rgba(0,0,0,0.28)" />
      </Svg>
      {Array.from({ length: n }, (_, i) => (
        <Animated.View
          key={i}
          entering={drop.delay(Math.min(i, 6) * 15)}
          exiting={lift}
          style={{ position: 'absolute', left: 0, right: 0, bottom: (FOOT + i * TH) * u, height: chipH }}
        >
          <Animated.View
            style={[
              { flex: 1 },
              topple &&
                i > 0 && {
                  animationName: falls[i].keyframes,
                  animationDuration: `${falls[i].duration}s`,
                  animationDelay: `${falls[i].delay}s`,
                  animationFillMode: 'forwards',
                },
            ]}
          >
            <ChipShape color={color} cx={50 + (frac(i, seed) - 0.5) * 3.2} turn={frac(i, seed + 1) * 45} />
          </Animated.View>
        </Animated.View>
      ))}
    </View>
  );
}

/** A chip seen face on (for chips in flight), `size` pt across. */
export const ChipFace = memo(function ChipFace({ color, size }: { color: ChipColor; size: number }) {
  const c = CHIPS[color];
  // The web's pathLength 48 on the inserts ring
  const seg = (2 * Math.PI * 38) / 48;
  return (
    <Svg viewBox="-50 -50 100 100" width={size} height={size}>
      <Circle r={49} fill={c.side} />
      <Circle r={45} fill={c.face} />
      <Circle
        r={38}
        fill="none"
        stroke={c.spot}
        strokeWidth={11}
        strokeDasharray={[4 * seg, 4 * seg]}
        strokeDashoffset={2 * seg}
      />
      <Circle r={26} fill={shade(c.face, '#FFFFFF', 0.12)} />
      <Circle r={26} fill="none" stroke={c.spot} strokeOpacity={0.6} strokeWidth={2} strokeDasharray={[4, 4.5]} />
    </Svg>
  );
});
