/**
 * Classic's sun behind the dial (web: SunRays in sunrise-scene.tsx): a warm glow centred on the
 * dial, and from "Feeling lucky" up a ring of soft rays that fades in and turns faster the
 * bigger the bet. The rotation is accumulated per frame (not a looping animation), so changing
 * speed never jumps. Fades out while the alarm is set.
 */
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useFrameCallback, useSharedValue } from 'react-native-reanimated';
import Svg, { Defs, Path, RadialGradient, Stop } from 'react-native-svg';

import { cssA, css, MAX_RANGE, rampN } from '@/themes/themes';

import { KF, loop } from '../anim';
import type { BackdropProps } from '../types';

/** The rays: 6° wide every 20° (the web's repeating conic gradient), as wedges round the centre. */
function wedges(r: number) {
  const pt = (deg: number) => {
    const a = (deg * Math.PI) / 180;
    return `${(r + r * Math.sin(a)).toFixed(1)} ${(r - r * Math.cos(a)).toFixed(1)}`;
  };
  let d = '';
  for (let a = 0; a < 360; a += 20) d += `M ${r} ${r} L ${pt(a)} A ${r} ${r} 0 0 1 ${pt(a + 6)} Z `;
  return d;
}

/**
 * The web's mask on the rays, out from the centre: clear over the dial, solid just past it,
 * then fading out (offset, alpha).
 */
const FADE: [number, number][] = [
  [0.52, 0],
  [0.6, 1],
  [0.78, 0.6],
  [1, 0],
];

export function SunRays({ p, range, visible, size }: BackdropProps) {
  const box = size * 1.9;
  const r = box / 2;

  const speed = useSharedValue(0);
  const angle = useSharedValue(0);
  useEffect(() => {
    speed.set(3 + p * p * 42); // degrees per second
  }, [p, speed]);
  useFrameCallback((frame) => {
    angle.set((angle.get() + ((frame.timeSincePreviousFrame ?? 0) / 1000) * speed.get()) % 360);
  });
  const turn = useAnimatedStyle(() => ({ transform: [{ rotate: `${angle.get()}deg` }] }));

  const core = rampN(['#FFD9A8', '#FFC48A', '#FFA866', '#FF8A4A'], p);
  const ray = css(rampN(['#FFFFFF', '#FFF8EC', '#FFF1DC'], p));
  const rays = Math.max(0, Math.min(1, (p - 0.25) / 0.6)) * 0.8;
  const allIn = range === MAX_RANGE;

  return (
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
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            borderRadius: r,
            backgroundImage: `radial-gradient(circle, ${cssA(core, 0.45)} 0%, ${cssA(core, 0.14)} 36%, ${cssA(core, 0)} 62%)`,
            opacity: 0.55 + p * 0.45,
          },
        ]}
      />
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { opacity: rays, transitionProperty: 'opacity', transitionDuration: 300 },
          allIn ? loop(KF.pulse, 1.4) : null,
        ]}
      >
        <Animated.View style={[StyleSheet.absoluteFill, turn]}>
          <Svg width={box} height={box}>
            <Defs>
              <RadialGradient id="lc-sun-rays" cx={r} cy={r} r={r} gradientUnits="userSpaceOnUse">
                {FADE.map(([at, a]) => (
                  <Stop key={at} offset={at} stopColor={ray} stopOpacity={0.5 * a} />
                ))}
              </RadialGradient>
            </Defs>
            <Path d={wedges(r)} fill="url(#lc-sun-rays)" />
          </Svg>
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
}
