/**
 * Night's counterpart to Classic's sun rays (web: night-scene.tsx, MoonHalo): moonlight on the
 * dial. A soft glow that warms from lavender to amber; a ring of moon phases that light up a step
 * per bet tier, outward from the new moon, until the full moon comes on at 45; the ring drifts
 * slowly round (each moon stays upright); and from about halfway, a pastel lunar corona. At 45
 * the full moon glows and the corona breathes. Fades out while the alarm is set.
 */
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  cubicBezier,
  useAnimatedStyle,
  useFrameCallback,
  useReducedMotion,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';

import { css, cssA, MAX_RANGE, rampN } from '@/themes/themes';

import type { BackdropProps } from '../types';
import { NKF } from './keyframes';

const clamp = (n: number) => Math.max(0, Math.min(1, n));

/**
 * The moon-phase ring, on a 200-unit box (the dial's edge is at ~53 from the centre): eight
 * little moons through one lunar cycle, the new moon at the bottom, waxing up the left, full at
 * the top, waning down the right.
 */
const PHASE_R = 4.2;
const PHASE_ORBIT = 61;
const PHASES = Array.from({ length: 8 }, (_, k) => {
  // They light up a step per bet tier, outward from the new moon in pairs, so the full moon
  // only comes on at the full 45 (12, 24, 36 and 45 minutes are the tier lines).
  const step = Math.min(k, 8 - k);
  const reveal = [0.001, 12 / 45, 24 / 45, 36 / 45, 1][step];
  return { k, deg: 90 + k * 45, reveal };
});

/**
 * The lit part of a moon at `f` through its cycle (0 new, 0.5 full), centred on (0, 0): the
 * bright limb is a half circle, closed by the terminator, a half ellipse that bulges out for a
 * crescent and in for a gibbous moon. Waxing moons are lit on the right; waning, the left.
 */
function litPath(f: number, r: number) {
  const waxing = f <= 0.5;
  const rx = Math.abs(Math.cos(2 * Math.PI * f)) * r;
  const gibbous = f > 0.25 && f < 0.75;
  const side = waxing ? 1 : 0;
  const term = gibbous === waxing ? 1 : 0;
  return `M0 ${-r}A${r} ${r} 0 0 ${side} 0 ${r}A${rx.toFixed(2)} ${r} 0 0 ${term} 0 ${-r}Z`;
}

/** Each moon's own little box, in ring units: room for the moon and its rim. */
const MOON_BOX = (PHASE_R + 1) * 2;
const MOON_VIEWBOX = `${-MOON_BOX / 2} ${-MOON_BOX / 2} ${MOON_BOX} ${MOON_BOX}`;

export function MoonHalo({ p, range, visible, size }: BackdropProps) {
  const box = size * 1.9;
  /** Points per ring unit. */
  const u = box / 200;

  // The ring turns at a speed that grows with the bet (degrees per second). Integrated frame by
  // frame, like the web's requestAnimationFrame loop, so a new bet changes pace without a jump.
  const still = useReducedMotion();
  const spin = useSharedValue(0);
  const speed = useSharedValue(1.2 + p * p * 3);
  useEffect(() => {
    speed.value = 1.2 + p * p * 3;
  }, [p, speed]);
  useFrameCallback((frame) => {
    const dt = (frame.timeSincePreviousFrame ?? 16) / 1000;
    spin.value = (spin.value + dt * speed.value) % 360;
  }, !still);
  const ringStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${spin.value}deg` }] }));

  const glow = rampN(['#9E8CFF', '#C7A8FF', '#FFC9A0', '#FFB07A'], p);
  const corona = clamp((p - 0.4) / 0.5);
  const allIn = range === MAX_RANGE;
  // Moonlight warms with the bet, like the moon in the sky
  const lit = css(rampN(['#F4F0FF', '#FFF3DA', '#FFE7BC', '#FFD9A8'], p));

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
      {/* Moonlight */}
      <View
        style={[
          styles.round,
          {
            borderRadius: box / 2,
            backgroundImage: `radial-gradient(circle, ${cssA(glow, 0.16)} 0%, ${cssA(glow, 0.05)} 36%, ${cssA(glow, 0)} 58%)`,
            opacity: 0.45 + p * 0.4,
          },
        ]}
      />
      {/* Lunar corona: soft pastel bands, violet inside to peach and rose outside (the web blurs
          them by 10px; here the bands are widened, and a touch fainter for it) */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            opacity: allIn ? 1 : corona * 0.8,
            transitionProperty: 'opacity',
            transitionDuration: 400,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.round,
            {
              borderRadius: box / 2,
              backgroundImage:
                'radial-gradient(circle, rgba(176,160,255,0) 50%, rgba(176,160,255,0.085) 55.5%, rgba(255,218,176,0.07) 59.5%, rgba(255,150,170,0.04) 63.5%, rgba(255,150,170,0) 71%)',
            },
            allIn && {
              animationName: NKF.corona,
              animationDuration: '5s',
              animationIterationCount: 'infinite',
              animationTimingFunction: 'ease-in-out',
            },
          ]}
        />
      </Animated.View>

      {/* The orbit: a faint dotted track the moons ride on, turning with them */}
      <Animated.View style={[StyleSheet.absoluteFill, ringStyle]}>
        <Svg width={box} height={box} viewBox="0 0 200 200">
          <Circle
            cx={100}
            cy={100}
            r={PHASE_ORBIT}
            fill="none"
            stroke="#C9B8FF"
            strokeWidth={0.4}
            strokeLinecap="round"
            strokeDasharray="0.01 2.6"
            opacity={0.22 + p * 0.18}
          />
        </Svg>
      </Animated.View>

      {/* The phases, slowly drifting round the dial (each one stays upright) */}
      {PHASES.map((m) => (
        <PhaseMoon
          key={m.k}
          k={m.k}
          deg={m.deg}
          spin={spin}
          centre={box / 2}
          u={u}
          on={p >= m.reveal}
          lit={lit}
          glow={css(glow)}
          allIn={allIn}
        />
      ))}
    </Animated.View>
  );
}

function PhaseMoon({
  k,
  deg,
  spin,
  centre,
  u,
  on,
  lit,
  glow,
  allIn,
}: {
  k: number;
  deg: number;
  spin: SharedValue<number>;
  centre: number;
  u: number;
  on: boolean;
  lit: string;
  glow: string;
  allIn: boolean;
}) {
  const side = MOON_BOX * u;
  const orbit = PHASE_ORBIT * u;
  // Ride the ring round: placed by angle rather than turned, so the lit side stays put
  const ride = useAnimatedStyle(() => {
    const a = ((deg + spin.value) * Math.PI) / 180;
    return { transform: [{ translateX: Math.cos(a) * orbit }, { translateY: Math.sin(a) * orbit }] };
  });
  const full = k === 4;

  return (
    <Animated.View
      style={[{ position: 'absolute', left: centre - side / 2, top: centre - side / 2, width: side, height: side }, ride]}
    >
      {/* Unlit: a faint shadow of the moon, waiting (the dark side, once it's lit) */}
      <Svg style={StyleSheet.absoluteFill} viewBox={MOON_VIEWBOX}>
        <Circle r={PHASE_R} fill="#C9B8FF" fillOpacity={on ? 0.12 : 0.07} />
      </Svg>
      {/* Lit: the bright part, popping in with a soft glow (bigger for the full moon) */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            opacity: on ? 1 : 0,
            transform: [{ scale: on ? 1 : 0.6 }],
            transitionProperty: ['opacity', 'transform'],
            transitionDuration: [450, 550],
            transitionTimingFunction: ['ease-out', cubicBezier(0.3, 1.5, 0.5, 1)],
            shadowColor: glow,
            shadowOpacity: full ? 0.85 : 0.5,
            shadowRadius: (full ? 4 : 2) * u * 0.6,
            shadowOffset: { width: 0, height: 0 },
          },
        ]}
      >
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            full &&
              allIn && {
                animationName: NKF.corona,
                animationDuration: '2.6s',
                animationIterationCount: 'infinite',
                animationTimingFunction: 'ease-in-out',
              },
          ]}
        >
          <Svg style={StyleSheet.absoluteFill} viewBox={MOON_VIEWBOX}>
            {k === 0 ? (
              // The new moon: no light, only a thin bright rim
              <Circle r={PHASE_R - 0.2} fill="none" stroke={lit} strokeWidth={0.45} strokeOpacity={0.75} />
            ) : (
              <Path d={litPath(k / 8, PHASE_R)} fill={lit} />
            )}
          </Svg>
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  round: { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 },
});
