/**
 * Caffè's counterpart to Classic's sun rays (web: CafeSaucer in cafe-scene.tsx): the dial's cup
 * sits on a saucer (with its handle, a spoon and a biscotto), steaming harder the bigger the
 * bet. Fades out while the alarm is set. On a jackpot, hearts float up round the clock.
 */
import { View } from 'react-native';
import Animated, { FadeOut } from 'react-native-reanimated';
import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, RadialGradient, Stop } from 'react-native-svg';

import { frac } from '@/lib/rand';

import type { BackdropProps } from '../types';
import { heartFor, steamFor } from './keyframes';
import { CA, HEART } from './palette';

/** Saucer units per dial width: the saucer's radius (200) is 0.62 of a dial. */
const UNIT = 200 / 0.62;

/** Steam wisps rising off the cup, in an engraved ink line over a soft white glow. */
const WISPS = [
  { x: 0, s: 1, d: 0 },
  { x: -0.13, s: 0.8, d: 0.9 },
  { x: 0.13, s: 0.85, d: 1.7 },
  { x: -0.25, s: 0.65, d: 0.4 },
  { x: 0.25, s: 0.7, d: 1.3 },
];
const WISP = 'M0 0C-9-12 9-22 0-36S-9-58 0-72';
/** A wisp's box in steam units, round its base at (0, 0): room for the curve and its glow. */
const WISP_BOX = { x: -12, y: -77, w: 24, h: 82 };

/** Hearts floating up round the clock on a jackpot. */
const HEARTS = Array.from({ length: 10 }, (_, i) => ({
  x: (i % 2 ? 1 : -1) * (0.3 + frac(i, 501) * 0.32),
  y: 0.05 + frac(i, 502) * 0.25,
  s: 0.9 + frac(i, 503) * 0.9,
  d: i * 0.32,
  dx: Math.round((frac(i, 504) - 0.5) * 50),
  fill: [CA.terracotta, CA.pink, CA.ochre][i % 3],
}));

/** The teaspoon's handle. */
const SPOON = 'M193-2.2C205-2.6 220-3.4 262-4.6 266-4.6 268-2.6 268 0S266 4.6 262 4.6C220 3.4 205 2.6 193 2.2Z';

/** Almonds in the cantuccino: x, y, rx, ry, angle. */
const ALMONDS = [
  [-10, 1, 4, 2.6, -20],
  [3, -2, 3.4, 2.2, 15],
  [11, 3, 3, 2, -5],
  [-2, 4, 2.4, 1.6, 30],
];

export function CafeSaucer({ p, visible, size, mood }: BackdropProps) {
  const box = size * 1.6;
  const wisps = 2 + Math.round(p * 3);
  const rise = 3.6 - p * 1.7;
  // The steam's own grid: 240 units across 0.62 of the dial, its base just under the cup's rim
  const u = (size * 0.62) / 240;
  const steamW = size * 0.62;
  const steamH = 110 * u;
  const steam = steamFor(Math.round(u * 1000) / 1000);
  const ink = 0.3 + p * 0.25;

  return (
    <>
      <Animated.View
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: (size - box) / 2,
          top: (size - box) / 2,
          width: box,
          height: box,
          opacity: visible ? 1 : 0,
          transitionProperty: 'opacity',
          transitionDuration: 400,
          transitionTimingFunction: 'ease-out',
        }}
      >
        <Svg
          width={box}
          height={box}
          viewBox={`${-UNIT * 0.8} ${-UNIT * 0.8} ${UNIT * 1.6} ${UNIT * 1.6}`}
          style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}
        >
          <Defs>
            {/* The web blurs a dark disc for the saucer's shadow; a soft-edged gradient does here */}
            <RadialGradient id="shadow" cx={7} cy={14} r={216} gradientUnits="userSpaceOnUse">
              <Stop offset={0} stopColor={CA.ink} stopOpacity={0.16} />
              <Stop offset={186 / 216} stopColor={CA.ink} stopOpacity={0.16} />
              <Stop offset={200 / 216} stopColor={CA.ink} stopOpacity={0.08} />
              <Stop offset={1} stopColor={CA.ink} stopOpacity={0} />
            </RadialGradient>
            <LinearGradient id="steel" x1="0" y1="0" x2="0" y2="1">
              <Stop offset={0} stopColor={CA.steelLight} />
              <Stop offset={1} stopColor={CA.steelMid} />
            </LinearGradient>
          </Defs>
          {/* Saucer, its shadow, rim and green band */}
          <Circle cx={7} cy={14} r={216} fill="url(#shadow)" />
          <Circle r={200} fill={CA.porcelain} stroke={CA.ink} strokeOpacity={0.3} strokeWidth={1.6} />
          <Circle r={195} fill="none" stroke="#EFE5D6" strokeWidth={6} />
          <Circle r={186} fill="none" stroke={CA.shutter} strokeWidth={4.5} />
          <Circle r={179} fill="none" stroke={CA.shutter} strokeWidth={1.2} />
          <Circle r={168} fill="#F5ECDE" stroke={CA.ink} strokeOpacity={0.12} strokeWidth={1.2} />

          {/* The cup's handle, out at three o'clock */}
          <G stroke={CA.ink} strokeWidth={1.6} strokeOpacity={0.4}>
            <Path d="M150-18C182-24 210-14 210 0S182 24 150 18Z" fill={CA.porcelain} />
            <Path d="M162-7.4C180-9.6 194-5.6 194 0S180 9.6 162 7.4Z" fill="#EDE2D0" />
            <Path
              d="M160-13.6C184-17 203-10 203 0S184 17 160 13.6"
              fill="none"
              stroke={CA.shutter}
              strokeOpacity={0.85}
              strokeWidth={1.8}
            />
          </G>

          {/* A teaspoon, lower left */}
          <G transform="rotate(135)">
            <Path d={SPOON} transform="translate(3 -4)" fill={CA.ink} opacity={0.14} />
            <Ellipse cx={183} cy={-4} rx={16} ry={11} fill={CA.ink} opacity={0.14} />
            <Ellipse
              cx={180}
              cy={0}
              rx={16}
              ry={11}
              fill="url(#steel)"
              stroke={CA.ink}
              strokeOpacity={0.5}
              strokeWidth={1.2}
            />
            <Ellipse cx={178} cy={-2} rx={9} ry={5} fill={CA.steelLight} />
            <Path d={SPOON} fill="url(#steel)" stroke={CA.ink} strokeOpacity={0.5} strokeWidth={1.2} />
            <Path d="M206-1 258-2.2" stroke="#FFFFFF" strokeWidth={1.4} strokeLinecap="round" opacity={0.8} />
          </G>

          {/* A cantuccino, upper right */}
          <G transform="translate(118 -140) rotate(40)" stroke={CA.ink} strokeWidth={1.2} strokeOpacity={0.55}>
            <Path d="M-21 7C-21-4-12-9.6 0-9.6S21-4 21 7Z" fill="#E7B46A" />
            <Path
              d="M-19-1C-14-7-7-9 0-9S14-7 19-1"
              fill="none"
              stroke="#B9773F"
              strokeOpacity={1}
              strokeWidth={2.4}
            />
            {ALMONDS.map(([x, y, rx, ry, a], i) => (
              <Ellipse
                key={i}
                cx={x}
                cy={y}
                rx={rx}
                ry={ry}
                transform={`rotate(${a} ${x} ${y})`}
                fill={i % 2 ? '#F6DFB2' : '#C98A52'}
                strokeWidth={0.6}
              />
            ))}
          </G>
        </Svg>

        {/* Steam, rising off the top of the cup (only while the dial's out) */}
        {visible && (
          <Animated.View
            exiting={FadeOut.duration(400)}
            style={{
              position: 'absolute',
              left: (box - steamW) / 2,
              top: box / 2 - size * 0.49 - size * 0.27,
              width: steamW,
              height: steamH,
            }}
          >
            {WISPS.slice(0, wisps).map((w, i) => (
              // Placed and scaled about its base, then rising and swelling (in its own units)
              <View
                key={i}
                style={{
                  position: 'absolute',
                  left: (120 + w.x * 240 + WISP_BOX.x) * u,
                  top: steamH + WISP_BOX.y * u,
                  width: WISP_BOX.w * u,
                  height: WISP_BOX.h * u,
                  transformOrigin: [-WISP_BOX.x * u, -WISP_BOX.y * u, 0],
                  transform: [{ scale: w.s }],
                }}
              >
                <Animated.View
                  style={{
                    flex: 1,
                    opacity: 0,
                    transformOrigin: [-WISP_BOX.x * u, -WISP_BOX.y * u, 0],
                    animationName: steam,
                    animationDuration: `${rise.toFixed(2)}s`,
                    animationDelay: `${(-w.d * rise * 0.45).toFixed(2)}s`,
                    animationIterationCount: 'infinite',
                    animationTimingFunction: 'ease-in-out',
                  }}
                >
                  <Svg
                    width={WISP_BOX.w * u}
                    height={WISP_BOX.h * u}
                    viewBox={`${WISP_BOX.x} ${WISP_BOX.y} ${WISP_BOX.w} ${WISP_BOX.h}`}
                  >
                    <Path d={WISP} fill="none" stroke="#FFFFFF" strokeWidth={9} strokeLinecap="round" opacity={0.55} />
                    <Path d={WISP} fill="none" stroke={CA.ink} strokeWidth={2.2} strokeLinecap="round" opacity={ink} />
                  </Svg>
                </Animated.View>
              </View>
            ))}
          </Animated.View>
        )}
      </Animated.View>

      {/* On the dot: hearts float up round the clock */}
      {mood === 'jackpot' &&
        HEARTS.map((h, i) => (
          <Animated.View
            key={i}
            pointerEvents="none"
            style={{
              position: 'absolute',
              left: size / 2 + h.x * size - 9 * h.s,
              top: size / 2 - size * 0.15 + h.y * size,
              width: 18 * h.s,
              height: 14 * h.s,
              opacity: 0,
              animationName: heartFor(h.dx),
              animationDuration: '2.6s',
              animationDelay: `${h.d}s`,
              animationIterationCount: 'infinite',
              animationTimingFunction: 'ease-out',
            }}
          >
            <Svg viewBox="-9 -7 18 14" width={18 * h.s} height={14 * h.s}>
              <Path d={HEART} fill={h.fill} stroke={CA.ink} strokeWidth={1.1} />
            </Svg>
          </Animated.View>
        ))}
    </>
  );
}
