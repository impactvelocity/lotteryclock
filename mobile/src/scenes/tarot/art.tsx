/**
 * Tarot illustrations, ported from web/src/components/scenes/tarot-art.tsx. The art itself is in
 * ./svg.tsx (converted from the web's tarot-svg.tsx); these components place it and animate it.
 */
import { memo, useEffect, useMemo, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  css,
  type CSSKeyframesRule,
  cubicBezier,
  useAnimatedStyle,
  useFrameCallback,
  useReducedMotion,
  useSharedValue,
} from 'react-native-reanimated';
import Svg, { G, Path, Rect } from 'react-native-svg';

import type { SceneMood } from '../types';
import {
  BOLT_SHORT,
  BOLT_TALL,
  CARD_BACK,
  CLOUDS,
  EYE_IRIS,
  EYE_LID,
  EYE_TOP,
  EYE_WHITE,
  MOON_FACES,
  MOON_RAYS,
  PLANETS,
  SUN_FACES,
  SUN_RAYS,
} from './svg';

export const TA = {
  ink: '#17383A',
  mint: '#9CD3C7',
  teal: '#2E6E6A',
  coral: '#F07F68',
  blush: '#F5B3A3',
  chartreuse: '#D7EA7B',
  cream: '#FBF4E6',
  gold: '#E2AE4A',
};

/* Keyframes (web/src/app/globals.css) */

/** lc-icon-pop: a new face pops in, like the tier icons do */
export const POP_KF = css.keyframes({
  '0%': { transform: [{ scale: 0.4 }, { rotate: '-25deg' }] },
  '60%': { transform: [{ scale: 1.2 }, { rotate: '8deg' }] },
  '100%': { transform: [{ scale: 1 }, { rotate: '0deg' }] },
});
/** lc-strike: lightning stutters as it strikes, holds, then goes dark until the next one */
export const STRIKE_KF = css.keyframes({
  '0%, 100%': { opacity: 0 },
  '1%': { opacity: 1 },
  '3%': { opacity: 0.2 },
  '5%, 34%': { opacity: 1 },
  '42%': { opacity: 0 },
});
/** lc-eye-blink / lc-eye-glance / lc-eye-rays: the all-seeing eye */
const BLINK_KF = css.keyframes({
  '0%, 44%, 52%, 100%': { transform: [{ scaleY: 1 }] },
  '48%': { transform: [{ scaleY: 0.08 }] },
});
const glanceKeyframes = (px: number) =>
  css.keyframes({
    '0%, 12%, 100%': { transform: [{ translateX: 0 }] },
    '20%, 40%': { transform: [{ translateX: -px }] },
    '56%, 78%': { transform: [{ translateX: px }] },
    '88%': { transform: [{ translateX: 0 }] },
  });
const RAYS_KF = css.keyframes({
  '0%, 100%': { opacity: 0.75, transform: [{ scale: 0.96 }] },
  '50%': { opacity: 1, transform: [{ scale: 1.04 }] },
});

/** The tier icons' pop, played once whenever the element mounts (key it to replay). */
export const POP = {
  animationName: POP_KF,
  animationDuration: '0.45s',
  animationTimingFunction: cubicBezier(0.2, 0.9, 0.3, 1.2),
  animationFillMode: 'both',
} as const;

/**
 * Turns a view at `speed` degrees a second, which can change smoothly (a CSS spin would jump
 * when its duration changed mid-turn). Integrated on the UI thread; holds still for Reduce Motion.
 */
export function useTurning(speed: number) {
  const reduce = useReducedMotion();
  const rate = useSharedValue(speed);
  const angle = useSharedValue(0);
  useEffect(() => {
    rate.set(speed);
  }, [rate, speed]);
  useFrameCallback((frame) => {
    const dt = frame.timeSincePreviousFrame ?? 0;
    angle.set((angle.get() + (dt / 1000) * rate.get()) % 360);
  }, !reduce);
  return useAnimatedStyle(() => ({ transform: [{ rotate: `${angle.get()}deg` }] }));
}

/**
 * The sun (180 × 180 grid), one face per bet tier: serene, dreamy, knowing, devilish, alarmed,
 * wild with joy. Its rays turn, faster the bigger the bet.
 */
export function TarotSun({
  face,
  speed,
  size,
}: {
  /** 0 temperance, 1 star, 2 fortune, 3 devil, 4 tower, 5 fool. */
  face: number;
  /** How fast the rays turn, degrees a second. */
  speed: number;
  size: number;
}) {
  const rays = useTurning(speed);
  const i = Math.max(0, Math.min(SUN_FACES.length - 1, face));
  return (
    <View style={{ width: size, height: size }}>
      <Animated.View style={[StyleSheet.absoluteFill, rays]}>
        <Grid180 size={size}>{SUN_RAYS}</Grid180>
      </Animated.View>
      <Animated.View key={i} style={[StyleSheet.absoluteFill, POP]}>
        <Grid180 size={size}>{SUN_FACES[i]}</Grid180>
      </Animated.View>
    </View>
  );
}

/** The moon's faces, in order. */
export const MOON_MOODS: SceneMood[] = ['idle', 'set', 'win', 'loss', 'jackpot'];

/** The crescent moon (180 × 180 grid), whose face follows the draw: asleep, peeking, blissful, aghast, winking. */
export function TarotMoon({ mood, size }: { mood: SceneMood; size: number }) {
  const i = Math.max(0, MOON_MOODS.indexOf(mood));
  return (
    <View style={{ width: size, height: size }}>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            animationName: SPIN_KF,
            animationDuration: '140s',
            animationIterationCount: 'infinite',
            animationTimingFunction: 'linear',
            animationDirection: 'reverse',
          },
        ]}
      >
        <Grid180 size={size}>{MOON_RAYS}</Grid180>
      </Animated.View>
      <Animated.View key={i} style={[StyleSheet.absoluteFill, POP]}>
        <Grid180 size={size}>{MOON_FACES[i]}</Grid180>
      </Animated.View>
    </View>
  );
}
const SPIN_KF = css.keyframes({
  from: { transform: [{ rotate: '0deg' }] },
  to: { transform: [{ rotate: '360deg' }] },
});

/** The sun's and moon's 180-unit square. Static art, so it's memoised. */
const Grid180 = memo(function Grid180({ size, children }: { size: number; children: ReactNode }) {
  return (
    <Svg viewBox="0 0 180 180" width={size} height={size}>
      {children}
    </Svg>
  );
});

/** One of the four planets (64 × 64 cells): ringed, small ringed, banded, a comet tick. */
export const Planet = memo(function Planet({ kind, size }: { kind: number; size: number }) {
  return (
    <Svg viewBox={`${(kind % 4) * 74} 0 64 64`} width={size} height={size}>
      {PLANETS[kind % 4]}
    </Svg>
  );
});

/** A lightning bolt (90 × 240), from top right down to a point at bottom left. Sized by width. */
export const Bolt = memo(function Bolt({ tall, width }: { tall: boolean; width: number }) {
  return (
    <Svg viewBox={tall ? '0 0 90 240' : '110 0 90 240'} width={width} height={(width * 240) / 90}>
      {tall ? BOLT_TALL : BOLT_SHORT}
    </Svg>
  );
});

/** A scalloped tattoo cloud (280 × 160 grid, flat bottom at y = 132), sized by width. */
export const TarotCloud = memo(function TarotCloud({
  kind,
  width,
  fill = TA.cream,
}: {
  kind: number;
  width: number;
  fill?: string;
}) {
  const c = CLOUDS[kind % 3];
  return (
    <Svg viewBox="0 0 280 160" width={width} height={(width * 160) / 280}>
      <G fill={fill}>{c.outline}</G>
      {c.creases}
    </Svg>
  );
});

/** The card stock's hard offset shadow (the web's drop-shadow(3px 4px 0 …)), on the card's own face so it turns with it. */
function CardShadow({ width }: { width: number }) {
  return (
    <View
      style={{
        position: 'absolute',
        left: 3,
        top: 4,
        width,
        height: (width * 240) / 140,
        borderRadius: (width * 10) / 140,
        backgroundColor: 'rgba(23,56,58,0.18)',
      }}
    />
  );
}

const CardBack = memo(function CardBack({ width }: { width: number }) {
  return (
    <>
      <CardShadow width={width} />
      <Svg viewBox="0 0 140 240" width={width} height={(width * 240) / 140}>
        {CARD_BACK}
      </Svg>
    </>
  );
});

const FLIP = {
  transitionProperty: 'transform',
  transitionDuration: 700,
  transitionTimingFunction: cubicBezier(0.4, 0, 0.2, 1),
  backfaceVisibility: 'hidden',
} as const;

/**
 * A tarot card (140 × 240), `width` wide. Face down it shows the card back; `flipped` turns it
 * over to show `face` (drawn on the same grid) on cream card stock. Each side turns on its own
 * with its back hidden, which reads the same as the web's one turning card.
 */
export function TarotCard({
  width,
  flipped,
  face,
  reversed = false,
}: {
  width: number;
  flipped: boolean;
  face?: ReactNode;
  /** Turns the face upside down: a reversed card. */
  reversed?: boolean;
}) {
  const height = (width * 240) / 140;
  return (
    <View style={{ width, height }}>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          FLIP,
          { transform: [{ perspective: 700 }, { rotateY: flipped ? '180deg' : '0deg' }] },
        ]}
      >
        <CardBack width={width} />
      </Animated.View>
      {face != null && (
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            FLIP,
            { transform: [{ perspective: 700 }, { rotateY: flipped ? '360deg' : '180deg' }] },
          ]}
        >
          <CardShadow width={width} />
          <Svg viewBox="0 0 140 240" width={width} height={height}>
            <Rect x="1.5" y="1.5" width="137" height="237" rx="10" fill={TA.cream} stroke={TA.ink} strokeWidth="3" />
            <Rect x="9" y="9" width="122" height="222" rx="5" fill="none" stroke={TA.ink} strokeWidth="1.5" />
            <G transform={reversed ? 'rotate(180 70 120)' : undefined}>{face}</G>
          </Svg>
        </Animated.View>
      )}
    </View>
  );
}

/**
 * The all-seeing eye (160 × 110, cropped to 120 × 82), glancing about and blinking now and then.
 * Each moving part is its own layer on the same grid.
 */
export function SeeingEye({ width }: { width: number }) {
  const height = (width * 82) / 120;
  // The eye's centre (80, 70) on the cropped grid, for the rays' breath and the blink
  const origin = `${((80 - 20) / 120) * 100}% ${((70 - 14) / 82) * 100}%`;
  // lc-eye-glance moves the iris 9 grid units each way
  const glance = useMemo(() => glanceKeyframes((9 * width) / 120), [width]);
  const layer = (children: ReactNode) => (
    <Svg viewBox="20 14 120 82" width={width} height={height} style={StyleSheet.absoluteFill}>
      {children}
    </Svg>
  );
  return (
    <View style={{ width, height }}>
      <Animated.View style={[StyleSheet.absoluteFill, { transformOrigin: origin }, eyeLoop(RAYS_KF, 2.4)]}>
        {layer(EYE_TOP)}
      </Animated.View>
      <Animated.View style={[StyleSheet.absoluteFill, { transformOrigin: origin }, eyeLoop(BLINK_KF, 3.2)]}>
        {layer(EYE_WHITE)}
        <Animated.View style={[StyleSheet.absoluteFill, eyeLoop(glance, 3.2)]}>{layer(EYE_IRIS)}</Animated.View>
        {layer(EYE_LID)}
      </Animated.View>
    </View>
  );
}

const eyeLoop = (name: CSSKeyframesRule, seconds: number) =>
  ({
    animationName: name,
    animationDuration: `${seconds}s`,
    animationIterationCount: 'infinite',
    animationTimingFunction: 'ease-in-out',
  }) as const;

/** An engraved four-point sparkle or eight-point star, on a 24-unit grid. */
const SPARKLE =
  'M12 1.5C12.7 7.6 16.4 11.3 22.5 12 16.4 12.7 12.7 16.4 12 22.5 11.3 16.4 7.6 12.7 1.5 12 7.6 11.3 11.3 7.6 12 1.5z';
const STAR8 =
  'M12 1.5 13.5 8.4 18.7 5.3 15.6 10.5 22.5 12 15.6 13.5 18.7 18.7 13.5 15.6 12 22.5 10.5 15.6 5.3 18.7 8.4 13.5 1.5 12 8.4 10.5 5.3 5.3 10.5 8.4z';

export const Sparkle = memo(function Sparkle({ eight, size, fill }: { eight: boolean; size: number; fill: string }) {
  return (
    <Svg viewBox="0 0 24 24" width={size} height={size}>
      <Path
        d={eight ? STAR8 : SPARKLE}
        fill={fill}
        stroke={TA.ink}
        strokeWidth={size < 14 ? 2.2 : 1.6}
        strokeLinejoin="round"
      />
    </Svg>
  );
});
