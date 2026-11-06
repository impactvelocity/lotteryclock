/**
 * Ouija's counterpart to Classic's sun rays (web: SpiritRing in ouija-scene.tsx): a spirit-board
 * ring round the dial. A–Z then 1–0 run round it, and from "A faint whisper" up a glass
 * planchette slides from letter to letter spelling the spirits' message, faster the bigger the
 * bet. Engravings (dotted ring, rays, a great triangle) come up behind it as the bet grows.
 * Fades out while the alarm is set.
 */
import { memo, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  css,
  Easing,
  useAnimatedStyle,
  useFrameCallback,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, ClipPath, Defs, FeGaussianBlur, Filter, G, Path, Text } from 'react-native-svg';

import { KF } from '../anim';
import type { BackdropProps } from '../types';
import { BONE, EMBER, GOLD, SERIF, STAR, clamp } from './art';
import { cssA, rampN, tierIndex } from '@/themes/themes';

const MESSAGES = ['', 'HUSH', 'SOON', 'WAKE UP', 'NO REST', 'GOODBYE'];
/** Milliseconds per letter at each tier: half travelling, half resting on it. */
const PACE = [0, 1500, 1200, 950, 720, 540];

/** Slot 0 (the top) and 27 are stars; A–Z fill 1–26 clockwise, then 1–9 and 0. */
const SLOTS = ['*', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ', '*', ...'1234567890'];
const STEP = 360 / SLOTS.length;
const slotOf = (ch: string) => SLOTS.indexOf(ch);

/** Radii, in dial units (the dial is 358 across); the ring's own box is 680 across. */
const HALF = 340;
const R_IN = 182;
const R_LETTER = 194;
const R_OUT = 207;
const R_DOTS = 224;
const R_RAYS = 234;
const R_TRI = 286;
const VIEWBOX = `${-HALF} ${-HALF} ${HALF * 2} ${HALF * 2}`;

const r1 = (n: number) => Math.round(n * 10) / 10;

const RING_DOTS = Array.from({ length: 96 }, (_, i) => {
  const a = (i / 96) * Math.PI * 2;
  return { x: r1(Math.sin(a) * R_DOTS), y: r1(-Math.cos(a) * R_DOTS), r: i % 8 === 0 ? 2 : 1 };
});

const TRIANGLE = [0, 120, 240].map((deg) => {
  const a = (deg * Math.PI) / 180;
  return { x: r1(Math.sin(a) * R_TRI), y: r1(-Math.cos(a) * R_TRI) };
});

/** Shortest way round from one angle to another, in degrees. */
function nearest(from: number, to: number) {
  const d = ((((to - from) % 360) + 540) % 360) - 180;
  return from + d;
}

/**
 * A letter flaring ember while the glass rests on it: up in 200 ms, held for the rest, then
 * cooling over 1.4 s (the web's fill and opacity transitions), one keyframe run per tier's pace.
 */
const FLASH = PACE.map((pace) => {
  const hold = Math.max(pace * 0.5, 300);
  const total = hold + 1400;
  const pct = (ms: number) => `${Math.round((ms / total) * 1000) / 10}%`;
  return {
    total,
    frames: css.keyframes({
      '0%': { opacity: 0 },
      [pct(200)]: { opacity: 1 },
      [pct(hold)]: { opacity: 1 },
      '100%': { opacity: 0 },
    }),
  };
});

/** The still parts: the great triangle (outside the letter ring only), the rules and the letters. */
const Triangle = memo(function Triangle({ D }: { D: number }) {
  const big = HALF * 1.5;
  return (
    <Svg viewBox={VIEWBOX} width={D} height={D} fill="none" stroke={GOLD} style={StyleSheet.absoluteFill}>
      <Defs>
        {/* The triangle only shows outside the letter ring */}
        <ClipPath id="lc-ouija-tri-clip">
          <Path
            d={`M${-big} ${-big}H${big}V${big}H${-big}Z M0 ${-(R_DOTS - 8)}a${R_DOTS - 8} ${R_DOTS - 8} 0 1 0 0.01 0Z`}
            clipRule="evenodd"
          />
        </ClipPath>
      </Defs>
      <G clipPath="url(#lc-ouija-tri-clip)" strokeWidth={1}>
        <Path d={TRIANGLE.map((t, i) => `${i ? 'L' : 'M'}${t.x} ${t.y}`).join('') + 'Z'} />
        {TRIANGLE.map((t, i) => (
          <G key={i} transform={`translate(${t.x} ${t.y})`}>
            <Circle r={9} strokeWidth={0.8} />
            <Path d={STAR} fill={GOLD} stroke="none" transform="translate(-6 -6) scale(0.5)" />
          </G>
        ))}
      </G>
    </Svg>
  );
});

const Rules = memo(function Rules({ D }: { D: number }) {
  return (
    <Svg viewBox={VIEWBOX} width={D} height={D} fill="none" stroke={GOLD} style={StyleSheet.absoluteFill}>
      <Circle r={R_IN} strokeWidth={0.8} />
      <Circle r={R_OUT} strokeWidth={1} />
      <Circle r={R_OUT + 4} strokeWidth={0.5} />
    </Svg>
  );
});

const Letters = memo(function Letters({ D }: { D: number }) {
  return (
    <Svg viewBox={VIEWBOX} width={D} height={D} style={StyleSheet.absoluteFill}>
      {SLOTS.map((ch, i) => {
        const at = `rotate(${(i * STEP).toFixed(2)}) translate(0 ${-R_LETTER})`;
        return ch === '*' ? (
          <Path key={i} d={STAR} fill={GOLD} opacity={0.8} transform={`${at} translate(-6 -6) scale(0.5)`} />
        ) : (
          <Text
            key={i}
            transform={at}
            fontFamily={SERIF}
            fontSize={15}
            textAnchor="middle"
            alignmentBaseline="central"
            fill={GOLD}
          >
            {ch}
          </Text>
        );
      })}
    </Svg>
  );
});

const Dots = memo(function Dots({ D }: { D: number }) {
  return (
    <Svg viewBox={VIEWBOX} width={D} height={D} style={StyleSheet.absoluteFill}>
      {RING_DOTS.map((d, i) => (
        <Circle key={i} cx={d.x} cy={d.y} r={d.r} fill={GOLD} />
      ))}
    </Svg>
  );
});

/** The sunburst: alternating long and short rays, every tenth longest, growing with the bet. */
const Rays = memo(function Rays({ D, rays }: { D: number; rays: number }) {
  let d = '';
  for (let i = 0; i < 120; i++) {
    const a = (i / 120) * Math.PI * 2;
    const len = (i % 10 === 0 ? 44 : i % 2 === 0 ? 22 : 12) * (0.5 + rays * 0.5);
    const s = Math.sin(a);
    const c = -Math.cos(a);
    d += `M${r1(s * R_RAYS)} ${r1(c * R_RAYS)}L${r1(s * (R_RAYS + len))} ${r1(c * (R_RAYS + len))}`;
  }
  return (
    <Svg viewBox={VIEWBOX} width={D} height={D} style={StyleSheet.absoluteFill}>
      <Path d={d} stroke={GOLD} strokeWidth={0.8} strokeLinecap="round" />
    </Svg>
  );
});

/** One letter flaring as the glass rests on it, in the ember glow the web blurs behind it. */
function Flash({ slot, tier, D }: { slot: number; tier: number; D: number }) {
  const k = D / (HALF * 2);
  const a = (slot * STEP * Math.PI) / 180;
  const box = 40 * k;
  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: D / 2 + Math.sin(a) * R_LETTER * k - box / 2,
        top: D / 2 - Math.cos(a) * R_LETTER * k - box / 2,
        width: box,
        height: box,
        transform: [{ rotate: `${slot * STEP}deg` }],
        opacity: 0,
        animationName: FLASH[tier].frames,
        animationDuration: FLASH[tier].total,
        animationTimingFunction: 'linear',
      }}
    >
      <Svg viewBox="-20 -20 40 40" width={box} height={box}>
        <Defs>
          <Filter id="lc-ouija-letter-glow" x="-100%" y="-100%" width="300%" height="300%">
            <FeGaussianBlur stdDeviation={3.5} />
          </Filter>
        </Defs>
        <Text
          fontFamily={SERIF}
          fontSize={15}
          textAnchor="middle"
          alignmentBaseline="central"
          fill={EMBER}
          filter="url(#lc-ouija-letter-glow)"
        >
          {SLOTS[slot]}
        </Text>
        <Text fontFamily={SERIF} fontSize={15} textAnchor="middle" alignmentBaseline="central" fill="#FFE2B8">
          {SLOTS[slot]}
        </Text>
      </Svg>
    </Animated.View>
  );
}

export function SpiritRing({ p, range, visible, size }: BackdropProps) {
  const tier = tierIndex(range);
  const active = visible && tier > 0;
  const D = size * 1.9;
  const k = D / (HALF * 2);

  // Where the planchette is heading (a running angle, so it always takes the short way round),
  // and the letters it has rested on lately (the last one still cooling as the next flares).
  const [turn, setTurn] = useState(0);
  const [flashes, setFlashes] = useState<{ id: number; slot: number; tier: number }[]>([]);
  const pace = PACE[tier];

  useEffect(() => {
    if (!active) return;
    const word = [...MESSAGES[tier]].map((ch) => (ch === ' ' ? null : slotOf(ch)));
    // Spell the word, rest at the top, repeat
    const seq = [...word, 0, null];
    let k = 0;
    let id: ReturnType<typeof setTimeout>;
    const next = () => {
      const s = seq[k++ % seq.length];
      if (s === null) {
        id = setTimeout(next, pace);
        return;
      }
      setTurn((t) => nearest(t, s * STEP));
      id = setTimeout(() => {
        if (s !== 0) setFlashes((f) => [...f.slice(-1), { id: Date.now(), slot: s, tier }]);
        id = setTimeout(next, pace * 0.5);
      }, pace * 0.55);
    };
    id = setTimeout(next, 300);
    return () => clearTimeout(id);
  }, [active, tier, pace]);

  // At rest the glass waits at the top star
  const shownTurn = active ? turn : Math.round(turn / 360) * 360;
  const glass = useSharedValue(0);
  useEffect(() => {
    glass.set(
      withTiming(shownTurn, {
        duration: active ? pace * 0.5 : 800,
        easing: Easing.bezier(0.5, 0, 0.25, 1),
      }),
    );
  }, [shownTurn, active, pace, glass]);
  const glassStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${glass.get()}deg` }] }));

  // Engravings turn slowly, quicker as the spirits stir (on the UI thread, so a new speed
  // never makes them jump)
  const speed = useSharedValue(1.5);
  const angle = useSharedValue(0);
  useEffect(() => {
    speed.set(1.5 + p * p * 10);
  }, [p, speed]);
  const spin = useFrameCallback((f) => {
    angle.set((angle.get() + ((f.timeSincePreviousFrame ?? 0) / 1000) * speed.get()) % 360);
  }, false);
  useEffect(() => {
    spin.setActive(visible);
  }, [visible, spin]);
  const spinStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${angle.get()}deg` }] }));

  const glow = rampN(['#C9A55A', '#F08A3C', '#E5432E'], p);
  const rays = clamp((p - 0.15) / 0.6);
  const triangle = clamp((p - 0.45) / 0.4);
  const fade = (opacity: number, ms = 300) =>
    ({ opacity, transitionProperty: 'opacity', transitionDuration: ms }) as const;

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
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundImage: `radial-gradient(circle, ${cssA(glow, 0.3)} 0%, ${cssA(glow, 0.1)} 34%, ${cssA(glow, 0)} 60%)`,
            opacity: 0.25 + p * 0.75,
            animationName: KF.pulse,
            // (By tier, not the bet itself: a new duration restarts the beat.)
            animationDuration: `${(3.4 - (tier / 5) * 2).toFixed(2)}s`,
            animationIterationCount: 'infinite',
            animationTimingFunction: 'ease-in-out',
          },
        ]}
      />

      {/* The great triangle, rising with the bet */}
      <Animated.View style={[StyleSheet.absoluteFill, fade(triangle * 0.45, 400)]}>
        <Triangle D={D} />
      </Animated.View>

      {/* Turning engravings: dotted ring and sunburst */}
      <Animated.View style={[StyleSheet.absoluteFill, spinStyle]}>
        <Animated.View style={[StyleSheet.absoluteFill, fade(0.25 + p * 0.45)]}>
          <Dots D={D} />
        </Animated.View>
        <Animated.View style={[StyleSheet.absoluteFill, fade(rays * 0.5)]}>
          <Rays D={D} rays={Math.round(rays * 20) / 20} />
        </Animated.View>
      </Animated.View>

      {/* Rules either side of the letters, and the letters */}
      <View style={[StyleSheet.absoluteFill, { opacity: 0.45 + p * 0.3 }]}>
        <Rules D={D} />
      </View>
      <View style={[StyleSheet.absoluteFill, { opacity: 0.6 + p * 0.25 }]}>
        <Letters D={D} />
      </View>
      {flashes.map((f) => (
        <Flash key={f.id} slot={f.slot} tier={f.tier} D={D} />
      ))}

      {/* The planchette's glass, gliding round the ring */}
      <Animated.View style={[StyleSheet.absoluteFill, glassStyle]}>
        <Animated.View
          style={{
            position: 'absolute',
            left: D / 2 - 25 * k,
            top: D / 2 - R_LETTER * k - 25 * k,
            width: 50 * k,
            height: 50 * k,
            ...fade(active ? 1 : 0.55, 400),
          }}
        >
          <Animated.View
            style={[
              { flex: 1 },
              tier >= 4 &&
                active && {
                  animationName: KF.shake,
                  animationDuration: '0.28s',
                  animationIterationCount: 'infinite',
                  animationTimingFunction: 'linear',
                },
            ]}
          >
            <Svg viewBox="-25 -25 50 50" width={50 * k} height={50 * k} fill="none">
              <Circle r={16.5} fill="rgba(255,226,184,0.07)" stroke={BONE} strokeWidth={1.4} />
              <Circle r={12.5} stroke={GOLD} strokeWidth={0.7} strokeDasharray="0.1 3" strokeLinecap="round" />
              <Path d="M0 -16.5v-5M0 16.5v5M-16.5 0h-5M16.5 0h5" stroke={BONE} strokeWidth={1.2} strokeLinecap="round" />
            </Svg>
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
}
