/**
 * Latte art for the dial (the web's "latte" ornament: LatteArt in cafe-art.tsx), on the dial's
 * 358-unit grid, under the minute ticks. The dial is a cappuccino seen from above; above the
 * time, the barista's pour gets fancier with the bet (a little heart, a heart, a tulip, a
 * rosetta), and from Doppio up the cup's being stirred: the crema swirls round, faster at the
 * full 45. A green band round the cup's lip matches the saucer behind it.
 */
import { useEffect, type ComponentType, type ReactNode } from 'react';
import Animated, {
  Easing,
  useAnimatedProps,
  useFrameCallback,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Circle, G, Path, Text as SvgText, type GProps } from 'react-native-svg';

import { frac } from '@/lib/rand';
import { fontFor } from '@/themes/fonts';
import { tierIndex } from '@/themes/themes';

import type { DialLayerProps } from '../types';
import { CA } from './palette';

const C = 179;
const POUR = CA.crema;
const r2 = (n: number) => Math.round(n * 100) / 100;

/** SVG groups only take a transform matrix natively, so turning and popping go through `matrix`. */
const AnimatedG = Animated.createAnimatedComponent(G as ComponentType<GProps & { matrix?: number[] }>);

/** A latte-art heart with its pour line, about 30 wide, centred on (0, 0). */
function PourHeart({ s = 1 }: { s?: number }) {
  return (
    <G transform={`scale(${s})`}>
      <Path d="M0 11C-6 6.6-15 2-15-5A7.6 7.6 0 0 1 0-8 7.6 7.6 0 0 1 15-5C15 2 6 6.6 0 11Z" />
      <Path d="M0-6.6V14" fill="none" stroke={POUR} strokeWidth={1.6} strokeLinecap="round" />
    </G>
  );
}

function Tulip() {
  return (
    <G>
      <G transform="translate(0 6)">
        <PourHeart s={0.95} />
      </G>
      <Path d="M-10-6.4C-10-11.6-5.6-14.4 0-12.2 5.6-14.4 10-11.6 10-6.4 6-9 -6-9-10-6.4Z" />
      <Path d="M-6.4-15.6C-6.4-19-3.4-20.6 0-19.2 3.4-20.6 6.4-19 6.4-15.6 3.6-17.4-3.6-17.4-6.4-15.6Z" />
    </G>
  );
}

/** A rosetta: stacked waves of milk with the pour drawn up through them. */
const ROSETTA = Array.from({ length: 7 }, (_, k) => {
  const y = 13 - k * 4.6;
  const w = 15 - k * 1.7;
  return `M${r2(-w)} ${r2(y - 3)}Q0 ${r2(y + 4.4)} ${r2(w)} ${r2(y - 3)}`;
}).join('');

function Rosetta() {
  return (
    <G fill="none" stroke={POUR} strokeLinecap="round">
      <Path d={ROSETTA} strokeWidth={3.2} />
      <Path d="M0-20V18" strokeWidth={1.6} />
    </G>
  );
}

/** The crema swirling round the cup once it's stirred. */
const SWIRL = Array.from({ length: 7 }, (_, k) => {
  const r = 86 + (k % 3) * 9;
  const a1 = ((k * 360) / 7) * (Math.PI / 180);
  const a2 = a1 + 0.9 + (k % 2) * 0.35;
  const pt = (a: number, rr: number) => `${r2(C + rr * Math.sin(a))} ${r2(C - rr * Math.cos(a))}`;
  return `M${pt(a1, r)}A${r} ${r} 0 0 1 ${pt(a2, r - 4)}`;
}).join('');

/** Bubbles in the foam, near the crema. */
const BUBBLES = Array.from({ length: 14 }, (_, i) => {
  const a = frac(i, 401) * Math.PI * 2;
  const r = 92 + frac(i, 402) * 16;
  return { x: r2(C + r * Math.sin(a)), y: r2(C - r * Math.cos(a)), r: r2(1 + frac(i, 403) * 1.4) };
});

/** lc-icon-pop's easing, applied to each keyframe segment as CSS does. */
const POP_EASE = Easing.bezier(0.2, 0.9, 0.3, 1.2);

/**
 * The motif pops in whenever the tier changes (lc-icon-pop: scale 0.4 → 1.2 → 1 while it turns
 * -25° → 8° → 0), about its own centre at (0, 0).
 */
function Pop({ children }: { children: ReactNode }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.set(
      withSequence(
        withTiming(0.6, { duration: 270, easing: POP_EASE }),
        withTiming(1, { duration: 180, easing: POP_EASE }),
      ),
    );
  }, [t]);
  const animatedProps = useAnimatedProps(() => {
    const v = t.get();
    const [k, deg] =
      v <= 0.6 ? [0.4 + (v / 0.6) * 0.8, -25 + (v / 0.6) * 33] : [1.2 - ((v - 0.6) / 0.4) * 0.2, 8 - ((v - 0.6) / 0.4) * 8];
    const a = (deg * Math.PI) / 180;
    return { matrix: [k * Math.cos(a), k * Math.sin(a), -k * Math.sin(a), k * Math.cos(a), 0, 0] };
  });
  return (
    <AnimatedG animatedProps={animatedProps} fill={POUR} opacity={0.55}>
      {children}
    </AnimatedG>
  );
}

export function LatteArt({ range }: DialLayerProps) {
  const tier = tierIndex(range);
  const stirred = tier >= 4;

  // Stirring: the angle accumulates per frame, so speeding up never jumps; unstirred, it settles
  // straight back to rest (the web drops the animation).
  const speed = useSharedValue(0);
  const angle = useSharedValue(0);
  const stir = useFrameCallback((frame) => {
    angle.set((angle.get() + ((frame.timeSincePreviousFrame ?? 0) / 1000) * speed.get()) % 360);
  }, false);
  useEffect(() => {
    speed.set(stirred ? 360 / (tier === 5 ? 2.2 : 7) : 0);
    if (!stirred) angle.set(0);
    stir.setActive(stirred);
  }, [stirred, tier, speed, angle, stir]);
  const turn = useAnimatedProps(() => {
    const a = (angle.get() * Math.PI) / 180;
    const c = Math.cos(a);
    const s = Math.sin(a);
    return { matrix: [c, s, -s, c, C - c * C + s * C, C - s * C - c * C] };
  });

  const motif = tier === 0 ? <PourHeart s={0.62} /> : tier === 1 ? <PourHeart /> : tier === 2 ? <Tulip /> : <Rosetta />;

  return (
    <G>
      {/* The cup's green band, round the lip */}
      <Circle cx={C} cy={C} r={169.5} fill="none" stroke={CA.shutter} strokeWidth={2.6} opacity={0.85} />
      <G fill="none" stroke={POUR} strokeWidth={0.9} opacity={0.4}>
        {BUBBLES.map((b, i) => (
          <Circle key={i} cx={b.x} cy={b.y} r={b.r} />
        ))}
      </G>
      <AnimatedG animatedProps={turn}>
        {stirred && <Path d={SWIRL} fill="none" stroke={POUR} strokeWidth={3} strokeLinecap="round" opacity={0.42} />}
        <G transform={`translate(${C} 121)`}>
          <Pop key={tier}>{motif}</Pop>
        </G>
      </AnimatedG>
      {/* "Good morning", dusted on in cocoa through a stencil */}
      <SvgText
        x={C}
        y={252}
        fontSize={9.5}
        textAnchor="middle"
        letterSpacing={9.5 * 0.3}
        fill={POUR}
        opacity={0.75}
        fontFamily={fontFor('serif')}
      >
        BUONGIORNO
      </SvgText>
    </G>
  );
}
