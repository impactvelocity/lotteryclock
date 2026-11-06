/**
 * Día de Muertos' counterpart to Classic's sun rays (web: MarigoldBloom in muertos-scene.tsx):
 * the dial becomes the heart of a giant cempasúchil, like the scalloped flower round a sugar
 * skull's eye. Three rings of petals peek out round the dial, turning against each other, faster
 * and brighter the bigger the bet, with a ring of dots beyond. Fades out while the alarm is set.
 */
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useFrameCallback, useSharedValue } from 'react-native-reanimated';
import Svg, { Circle, SvgXml } from 'react-native-svg';

import { KF } from '../anim';
import { ART } from '../art';
import type { BackdropProps } from '../types';
import { MK, MU } from './art';
import { cssA, MAX_RANGE, rampN } from '@/themes/themes';

/** marigold-bloom.svg split into its three petal rings (back to front), so each can turn on its own. */
const RINGS = (() => {
  const svg = ART['muertos/marigold-bloom'];
  const open = svg.match(/^<svg[^>]*>/)?.[0] ?? '<svg viewBox="0 0 200 200">';
  const at = ['ring-outer', 'ring-mid', 'ring-inner'].map((id) => svg.indexOf(`<g id="${id}"`));
  const end = svg.lastIndexOf('</svg>');
  return at.map((a, i) => `${open}${svg.slice(a, at[i + 1] ?? end)}</svg>`);
})();
/** How fast and which way each ring turns. */
const DIRS = [1, -0.7, 0.45];

/**
 * Out on the dark sky just past the petal tips (66), not on the petals, where they clashed.
 * The web twinkles each in one of five phases; here each phase is one group.
 */
const DOTS = Array.from({ length: 30 }, (_, i) => {
  const a = (i * 12 * Math.PI) / 180;
  return {
    x: Math.round((100 + 69 * Math.sin(a)) * 100) / 100,
    y: Math.round((100 - 69 * Math.cos(a)) * 100) / 100,
    phase: i % 5,
  };
});

function Ring({ xml, size, style }: { xml: string; size: number; style: object }) {
  return (
    <Animated.View style={[StyleSheet.absoluteFill, style]}>
      <SvgXml xml={xml} width={size} height={size} />
    </Animated.View>
  );
}

export function MarigoldBloom({ p, range, visible, size }: BackdropProps) {
  const D = size * 1.9;
  const allIn = range === MAX_RANGE;
  const warm = rampN(['#FFB347', '#FF8A3D', '#F0446E'], p);
  // Opens up with the bet: a bud peeking out round the dial at 0, in full bloom at 45. Capped
  // at 0.94 so the dots out past the petals stay clear of the labels either side and below. All
  // in, it beats: the pulse (up to × 1.07) starts small enough to peak at that same cap.
  const scale = allIn ? 0.94 / 1.07 : 0.84 + p * 0.1;

  // The rings turn at a speed that follows the bet (degrees per second), smoothly: the angle
  // runs on the UI thread, so changing speed never makes them jump.
  const speed = useSharedValue(2);
  const angle = useSharedValue(0);
  useEffect(() => {
    speed.set(2 + p * p * 28);
  }, [p, speed]);
  const spin = useFrameCallback((f) => {
    angle.set((angle.get() + ((f.timeSincePreviousFrame ?? 0) / 1000) * speed.get()) % 3600);
  }, false);
  useEffect(() => {
    spin.setActive(visible);
  }, [visible, spin]);
  const r0 = useAnimatedStyle(() => ({ transform: [{ rotate: `${angle.get() * DIRS[0]}deg` }] }));
  const r1 = useAnimatedStyle(() => ({ transform: [{ rotate: `${angle.get() * DIRS[1]}deg` }] }));
  const r2 = useAnimatedStyle(() => ({ transform: [{ rotate: `${angle.get() * DIRS[2]}deg` }] }));

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: (size - D) / 2,
        top: (size - D) / 2,
        width: D,
        height: D,
        opacity: visible ? 1 : 0,
        transitionProperty: 'opacity',
        transitionDuration: 400,
        transitionTimingFunction: 'ease-out',
      }}
    >
      {/* Warm candle glow */}
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundImage: `radial-gradient(circle, ${cssA(warm, 0.3)} 0%, ${cssA(warm, 0.1)} 36%, ${cssA(warm, 0)} 62%)`,
            opacity: 0.5 + p * 0.5,
          },
        ]}
      />
      {/* (Kept opaque: see-through orange on the navy sky turns muddy brown.) */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            transform: [{ scale }],
            transitionProperty: 'transform',
            transitionDuration: 300,
            transitionTimingFunction: 'ease-out',
          },
        ]}
      >
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            allIn && {
              animationName: KF.pulse,
              animationDuration: '1.3s',
              animationIterationCount: 'infinite',
              animationTimingFunction: 'ease-in-out',
            },
          ]}
        >
          <Ring xml={RINGS[0]} size={D} style={r0} />
          <Ring xml={RINGS[1]} size={D} style={r1} />
          <Ring xml={RINGS[2]} size={D} style={r2} />
          {/* Small, bone-white and dim: a faint glimmer round the flower, not a second ring */}
          {[0, 1, 2, 3, 4].map((phase) => (
            <Animated.View
              key={phase}
              style={[
                StyleSheet.absoluteFill,
                {
                  animationName: MK.twinkle,
                  animationDuration: '2.4s',
                  animationDelay: `${phase * 0.4}s`,
                  animationIterationCount: 'infinite',
                  animationTimingFunction: 'ease-in-out',
                },
              ]}
            >
              <Svg viewBox="0 0 200 200" width={D} height={D} opacity={0.55}>
                {DOTS.filter((d) => d.phase === phase).map((d, i) => (
                  <Circle key={i} cx={d.x} cy={d.y} r={0.8} fill={MU.bone} />
                ))}
              </Svg>
            </Animated.View>
          ))}
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
}
