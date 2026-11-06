/**
 * Classic's background (web/src/components/scenes/sunrise-scene.tsx): a sunrise that plays out
 * across the bet, over a village that wakes up with it (./village.tsx).
 *
 *   0 min     pre-dawn: a few stars, pale clouds, the village asleep
 *   1–11      first light: the stars fade, the horizon starts to glow, the first lights on
 *   12–23     golden morning: clouds catch the light, the first birds, chimneys smoking
 *   24–35     warm: more birds, the horizon burns brighter
 *   36–45     blazing: glints across the sky, a full flock, the rooster crowing
 *
 * Purely decorative and never touchable; the screen draws the sky gradient itself.
 */
import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut, ZoomIn, ZoomOut } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { css, cssA, rampN } from '@/themes/themes';

import { KF, loop } from '../anim';
import type { ArtKey } from '../art';
import type { SceneProps } from '../types';
import { Gull, GULL_PIVOT, SPARKLE } from './bits';
import { driftFor, FLAP, GLINT } from './keyframes';
import { parseArt, renderSvg } from './svg-tree';
import { Village, type RoosterPose } from './village';

/** Deterministic layout: tops as a share of the scene's height, widths in pt. */
const CLOUDS = [
  { top: 9, w: 230, dur: 140, delay: -20, depth: 1 },
  { top: 24, w: 140, dur: 95, delay: -70, depth: 0.6 },
  { top: 47, w: 280, dur: 170, delay: -120, depth: 1 },
  { top: 17, w: 110, dur: 85, delay: -10, depth: 0.5 },
  { top: 64, w: 190, dur: 150, delay: -45, depth: 0.8 },
  { top: 36, w: 160, dur: 120, delay: -95, depth: 0.7 },
];
const CLOUD_ART: ArtKey[] = [
  'classic/cloud-01',
  'classic/cloud-02',
  'classic/cloud-03',
  'classic/cloud-04',
  'classic/cloud-05',
];
/** The art's two belly bands, which take the sky's sunrise colour. */
const BELLY_LIGHT = '#FFE9DC';
const BELLY = '#FFD8C4';

const BIRDS = [
  { top: 15, dur: 21, delay: -4, size: 26 },
  { top: 19, dur: 21, delay: -4.6, size: 18 },
  { top: 30, dur: 26, delay: -15, size: 22 },
  { top: 11, dur: 18, delay: -11, size: 16 },
  { top: 33, dur: 26, delay: -15.5, size: 15 },
  { top: 24, dur: 23, delay: -19, size: 20 },
  { top: 8, dur: 19, delay: -1, size: 14 },
];
/** How many birds are up at each tier. */
const BIRDS_AT = [0, 0, 2, 3, 5, 7];

const STARS = [
  { x: 6, y: 10, r: 1.6, d: 0 },
  { x: 15, y: 6, r: 1.1, d: 1.2 },
  { x: 19, y: 22, r: 1.3, d: 0.5 },
  { x: 4, y: 28, r: 1, d: 2.1 },
  { x: 84, y: 9, r: 1.4, d: 0.8 },
  { x: 92, y: 20, r: 1.1, d: 1.7 },
  { x: 77, y: 15, r: 0.9, d: 2.6 },
];

/** Four-point glints that wink across the sky once the bet gets hot. */
const GLINTS = [
  { x: 12, y: 40, s: 16, d: 0 },
  { x: 86, y: 34, s: 20, d: 0.7 },
  { x: 24, y: 62, s: 12, d: 1.4 },
  { x: 74, y: 58, s: 14, d: 0.3 },
  { x: 8, y: 74, s: 18, d: 1.1 },
  { x: 93, y: 70, s: 12, d: 1.8 },
  { x: 33, y: 18, s: 11, d: 2.2 },
  { x: 66, y: 12, s: 13, d: 0.9 },
];

const clamp = (n: number) => Math.max(0, Math.min(1, n));

export function SunriseScene({ p, tier, mood, width, height }: SceneProps) {
  // A snooze puts the sky back to sleep a little; a late result burns hotter.
  const sun = clamp(mood === 'win' ? p * 0.5 : mood === 'loss' ? 0.35 + p : p);
  const night = clamp(1 - sun * 2.4);

  const bellyRGB = rampN(['#ECEEFA', '#F8E2EA', '#FFD8C4', '#FFCBAE', '#FFBD9A'], sun);
  // The upper band sits halfway between the belly and the cloud's cream top
  const cream = [255, 253, 248];
  const bellyLight = `rgb(${bellyRGB.map((v, k) => Math.round((v + cream[k]) / 2)).join(',')})`;
  const horizon = rampN(['#FFD9C2', '#FFC79A', '#FFB070', '#FF9450'], sun);
  const birds = mood === 'win' ? 0 : BIRDS_AT[tier];
  const glints = mood === 'jackpot' ? GLINTS.length : tier >= 4 && mood !== 'win' ? (tier === 5 ? GLINTS.length : 5) : 0;

  // The village: asleep at no bet, up and about as it grows. While the draw rolls the windmill
  // spins like a loading wheel; a snooze sends everyone back to bed, a late result wakes the lot.
  const awake = mood === 'win' ? 0 : mood === 'loss' ? 1 : mood === 'jackpot' ? Math.max(0.65, p) : p;
  const spin =
    mood === 'win' ? 0 : mood === 'loss' ? 110 : mood === 'set' ? 85 : mood === 'jackpot' ? 40 : 4 + p * p * 50;
  const pose: RoosterPose =
    mood === 'win'
      ? 'asleep'
      : mood === 'loss'
        ? 'crow'
        : mood === 'jackpot'
          ? 'proud'
          : mood === 'set'
            ? 'look'
            : tier === 0
              ? 'asleep'
              : tier >= 4
                ? 'crow'
                : 'stand';
  const drift = driftFor(width);

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { overflow: 'hidden' }]}>
      {/* Horizon glow: the sun about to break over the rail */}
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: '70%',
          backgroundImage: `radial-gradient(ellipse 65% 60% at 50% 100%, ${cssA(horizon, 0.18 + sun * 0.55)} 0%, ${cssA(horizon, 0.08 + sun * 0.2)} 45%, transparent 75%)`,
        }}
      />

      {/* Drifting clouds; their bellies catch the sunrise colour */}
      {CLOUDS.map((c, i) => (
        <Animated.View
          key={i}
          style={{
            position: 'absolute',
            left: 0,
            top: (c.top / 100) * height,
            opacity: 0.22 + c.depth * 0.2,
            ...loop(drift, c.dur, { delay: c.delay, ease: 'linear' }),
          }}
        >
          <Cloud shape={i} width={c.w} belly={css(bellyRGB)} bellyLight={bellyLight} />
        </Animated.View>
      ))}

      {/* Pre-dawn stars, gone by first light */}
      {night > 0 && (
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            { opacity: night, transitionProperty: 'opacity', transitionDuration: 500 },
          ]}
        >
          {STARS.map((s, i) => (
            <Animated.View
              key={i}
              style={{
                position: 'absolute',
                left: (s.x / 100) * width,
                top: (s.y / 100) * height,
                ...loop(KF.twinkle, 3, { delay: s.d }),
              }}
            >
              <Svg viewBox="0 0 24 24" width={s.r * 9} height={s.r * 9}>
                <Path d={SPARKLE} fill="#C9A6D8" />
              </Svg>
            </Animated.View>
          ))}
        </Animated.View>
      )}

      {/* Morning birds: a pair at "Feeling lucky", a flock by the top tier */}
      {BIRDS.slice(0, birds).map((b, i) => (
        <Animated.View
          key={i}
          entering={FadeIn.duration(600)}
          exiting={FadeOut.duration(600)}
          style={{ position: 'absolute', left: 0, top: (b.top / 100) * height }}
        >
          <Animated.View style={loop(drift, b.dur, { delay: b.delay, ease: 'linear' })}>
            <Animated.View style={loop(KF.bob, 2.4 + i * 0.3)}>
              <Animated.View
                style={{
                  transformOrigin: GULL_PIVOT,
                  ...loop(FLAP, 0.5 + (i % 3) * 0.08),
                }}
              >
                {/* White gulls: they read as sky, never as stray marks over the text */}
                <Gull width={b.size} drop={24 / b.size} />
              </Animated.View>
            </Animated.View>
          </Animated.View>
        </Animated.View>
      ))}

      {/* Sun glints when things get hot */}
      {GLINTS.slice(0, glints).map((g, i) => (
        <Animated.View
          key={i}
          entering={ZoomIn.springify().stiffness(400).damping(20)}
          exiting={ZoomOut.duration(250)}
          style={{ position: 'absolute', left: (g.x / 100) * width, top: (g.y / 100) * height, width: g.s, height: g.s }}
        >
          <Animated.View style={{ flex: 1, ...loop(GLINT, 2.4, { delay: g.d }) }}>
            <Glint size={g.s} />
          </Animated.View>
        </Animated.View>
      ))}

      <Village
        sun={sun}
        awake={Math.round(awake * 50) / 50}
        cascade={mood === 'win' || mood === 'loss' || mood === 'jackpot'}
        spin={Math.round(spin)}
        pose={pose}
        rainbow={mood === 'jackpot'}
        flush={mood === 'loss'}
        width={width}
        height={height}
      />
    </View>
  );
}

/**
 * A cloud (./art/classic/cloud-0N.svg): cream on top, with two belly bands underneath that
 * take the sky's current sunrise colour, so the clouds warm up with the bet.
 */
const Cloud = memo(function Cloud({
  shape,
  width,
  belly,
  bellyLight,
}: {
  shape: number;
  width: number;
  belly: string;
  bellyLight: string;
}) {
  const art = parseArt(CLOUD_ART[shape % CLOUD_ART.length]);
  return (
    <Svg viewBox="0 0 280 160" width={width} height={(width * 160) / 280}>
      {renderSvg(art.kids, { [BELLY_LIGHT]: bellyLight, [BELLY]: belly })}
    </Svg>
  );
});

/** A white sparkle with a warm glow (the web's drop-shadow), drawn as a soft, larger copy under it. */
function Glint({ size }: { size: number }) {
  return (
    <Svg viewBox="-6 -6 36 36" width={size * 1.5} height={size * 1.5} style={{ margin: -size * 0.25 }}>
      <Path d={SPARKLE} fill="rgb(255,170,90)" opacity={0.35} transform="translate(12 12) scale(1.45) translate(-12 -12)" />
      <Path d={SPARKLE} fill="rgb(255,170,90)" opacity={0.45} transform="translate(12 12) scale(1.2) translate(-12 -12)" />
      <Path d={SPARKLE} fill="#FFFFFF" />
    </Svg>
  );
}
