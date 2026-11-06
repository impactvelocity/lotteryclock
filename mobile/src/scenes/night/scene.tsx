/**
 * Night's background (web: night-scene.tsx, NightScene): a city night that gets more restless
 * as the bet grows.
 *
 *   0 min     lights out: a thin crescent, a few stars, the city asleep
 *   1–11      restless: more stars, the odd window flicks on
 *   12–23     night owl: the moon fills out, bats come out
 *   24–35     midnight gamble: half the city's awake, the first shooting star
 *   36–45     insomnia → full moon madness: a full moon, a sky full of stars and streaks
 *
 * A snooze puts the city back to bed (lights off, moon wanes); a late result brings the dawn up
 * behind the skyline. Purely decorative and pointer-transparent.
 */
import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import Svg, { Circle, Defs, G, Mask, RadialGradient, Stop } from 'react-native-svg';

import { frac } from '@/lib/rand';
import { css, cssA, rampN } from '@/themes/themes';

import { KF, loop } from '../anim';
import type { SceneProps } from '../types';
import { Bat, Cloud, MoonSurface, StarArt } from './art';
import { driftKF, NKF } from './keyframes';
import { Skyline } from './skyline';

const clamp = (n: number) => Math.max(0, Math.min(1, n));

/** The city's height on a phone (the web's 120px), sitting on the rail. */
const SKYLINE_H = 124;
/** The moon in the sky, top right (the web's 44px on a phone, a touch bigger here). */
const MOON_PT = 46;

/** Stars come out in a fixed order (`order`), so the same ones are always first. */
const STARS = Array.from({ length: 72 }, (_, i) => ({
  x: frac(i, 21) * 100,
  y: frac(i, 22) * 70,
  r: 0.7 + frac(i, 23) * 1.5,
  delay: frac(i, 24) * 4,
  dur: 2.2 + frac(i, 25) * 3,
  order: frac(i, 26),
  sparkle: frac(i, 27) > 0.88,
}));
/**
 * The web twinkles every star on its own clock. To keep the animated views down, the plain dots
 * twinkle a layer at a time (each layer a scatter across the whole sky, on its own clock); the
 * few bright, spiky ones still twinkle on their own.
 */
const GLIMMER_LAYERS = 6;

/** Shooting stars: start points (as % of the scene) and their own rhythm. */
const SHOOTERS = [
  { left: 78, top: 8, dur: 7, delay: 1 },
  { left: 40, top: 4, dur: 9, delay: 4.5 },
  { left: 95, top: 22, dur: 8, delay: 2.8 },
  { left: 62, top: 14, dur: 11, delay: 7 },
  { left: 25, top: 10, dur: 10, delay: 5.6 },
];
const SHOOTERS_AT = [0, 0, 0, 1, 3, 5];

const BATS = [
  { top: 16, dur: 17, delay: -3, size: 30 },
  { top: 21, dur: 17, delay: -3.7, size: 22 },
  { top: 30, dur: 22, delay: -12, size: 26 },
  { top: 12, dur: 15, delay: -9, size: 18 },
  { top: 34, dur: 22, delay: -12.6, size: 18 },
  { top: 25, dur: 19, delay: -16, size: 24 },
  { top: 9, dur: 16, delay: -1, size: 16 },
];
const BATS_AT = [0, 0, 2, 3, 5, 7];

const CLOUDS = [
  { top: 12, w: 260, dur: 190, delay: -40, shape: 1 },
  { top: 30, w: 180, dur: 150, delay: -110, shape: 3 },
  { top: 52, w: 300, dur: 220, delay: -160, shape: 0 },
  { top: 22, w: 140, dur: 130, delay: -70, shape: 4 },
];

export function NightScene({ p, tier, mood, width, height }: SceneProps) {
  // A snooze sends everyone back to bed; a late result is the sun coming up.
  const restless = clamp(mood === 'win' ? p * 0.35 : p);
  const dawn = mood === 'loss' ? 0.45 + p * 0.55 : 0;
  const starsOut = 0.18 + restless * 0.82;
  const windowsOn = 0.03 + restless * 0.6;
  const bats = mood === 'win' ? 0 : BATS_AT[tier];
  const shooters = mood === 'win' ? 0 : SHOOTERS_AT[tier];

  const cityGlow = rampN(['#5A3470', '#86396A', '#B4505E'], restless);
  const drift = driftKF(width);

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.clip]}>
      {/* Glow over the city: violet when it's quiet, hot amber when nobody's sleeping */}
      <View
        style={[
          styles.foot,
          {
            height: '50%',
            backgroundImage: `radial-gradient(ellipse 75% 55% at 50% 100%, ${cssA(cityGlow, 0.14 + restless * 0.14)} 0%, ${cssA(cityGlow, 0.04 + restless * 0.05)} 50%, ${cssA(cityGlow, 0)} 78%)`,
          },
        ]}
      />
      {/* Dawn creeping up behind the skyline (late results only) */}
      <Animated.View
        style={[
          styles.foot,
          {
            height: '55%',
            backgroundImage:
              'radial-gradient(ellipse 80% 70% at 50% 100%, rgba(255,150,90,0.55) 0%, rgba(255,150,90,0.18) 45%, rgba(255,150,90,0) 75%)',
            opacity: dawn,
            transitionProperty: 'opacity',
            transitionDuration: 900,
            transitionTimingFunction: 'ease-out',
          },
        ]}
      />

      {/* Stars come out as the bet grows */}
      <Stars starsOut={starsOut} shine={1 - dawn * 0.6} width={width} height={height} />

      {/* Shooting stars, more of them the higher the bet */}
      {SHOOTERS.slice(0, shooters).map((s, i) => (
        <Animated.View
          key={i}
          style={[
            styles.shooter,
            {
              left: (s.left / 100) * width,
              top: (s.top / 100) * height,
              animationName: NKF.shoot,
              animationDuration: `${s.dur}s`,
              animationDelay: `${s.delay}s`,
              animationIterationCount: 'infinite',
              animationTimingFunction: 'ease-out',
            },
          ]}
        />
      ))}

      <Moon phase={restless} dawn={dawn} width={width} height={height} />

      {/* Thin night clouds, drifting across the moon */}
      {CLOUDS.map((c, i) => (
        <Animated.View
          key={i}
          style={{
            position: 'absolute',
            left: 0,
            top: (c.top / 100) * height,
            opacity: 0.32,
            animationName: drift,
            animationDuration: `${c.dur}s`,
            animationDelay: `${c.delay}s`,
            animationIterationCount: 'infinite',
            animationTimingFunction: 'linear',
          }}
        >
          <Cloud shape={c.shape} width={c.w} top="#3E2556" bellyLight="#4A2B60" belly="#57326A" id={`lc-night-cloud-${i}`} />
        </Animated.View>
      ))}

      {/* Bats from "Night owl" up */}
      {BATS.slice(0, bats).map((b, i) => (
        <Animated.View
          key={i}
          entering={FadeIn.duration(600)}
          exiting={FadeOut.duration(600)}
          style={{ position: 'absolute', left: 0, top: (b.top / 100) * height }}
        >
          <Animated.View
            style={{
              animationName: drift,
              animationDuration: `${b.dur}s`,
              animationDelay: `${b.delay}s`,
              animationIterationCount: 'infinite',
              animationTimingFunction: 'linear',
            }}
          >
            <Animated.View style={loop(KF.bob, 1.8 + i * 0.25)}>
              <Bat width={b.size} beat={0.34 + (i % 3) * 0.06} />
            </Animated.View>
          </Animated.View>
        </Animated.View>
      ))}

      {/* The city: windows light up as the bet (and the insomnia) grows */}
      <Skyline lit={Math.round(windowsOn * 50) / 50} width={width} height={SKYLINE_H} />
    </View>
  );
}

const Stars = memo(function Stars({
  starsOut,
  shine,
  width,
  height,
}: {
  starsOut: number;
  /** How bright the stars that are out are (they pale as the dawn comes up). */
  shine: number;
  width: number;
  height: number;
}) {
  const shown = (order: number) => ({
    opacity: order < starsOut ? shine : 0,
    transitionProperty: 'opacity',
    transitionDuration: 500,
  });
  return (
    <>
      {Array.from({ length: GLIMMER_LAYERS }, (_, g) => (
        <Animated.View
          key={g}
          style={[
            StyleSheet.absoluteFill,
            {
              animationName: NKF.glimmer,
              animationDuration: `${Math.round((2.2 + g * 0.6) * 100) / 100}s`,
              animationDelay: `${Math.round((-g * 0.9) * 100) / 100}s`,
              animationIterationCount: 'infinite',
              animationTimingFunction: 'ease-in-out',
            },
          ]}
        >
          {STARS.map((s, i) =>
            !s.sparkle && i % GLIMMER_LAYERS === g ? (
              <Animated.View
                key={i}
                style={[
                  styles.dot,
                  {
                    left: (s.x / 100) * width,
                    top: (s.y / 100) * height,
                    width: s.r * 2,
                    height: s.r * 2,
                    borderRadius: s.r,
                  },
                  shown(s.order),
                ]}
              />
            ) : null,
          )}
        </Animated.View>
      ))}
      {STARS.map((s, i) =>
        s.sparkle ? (
          <Animated.View
            key={i}
            style={[{ position: 'absolute', left: (s.x / 100) * width, top: (s.y / 100) * height }, shown(s.order)]}
          >
            <Animated.View style={loop(KF.twinkle, s.dur, { delay: -s.delay })}>
              <StarArt size={s.r * 11} tint="#FFF1D6" />
            </Animated.View>
          </Animated.View>
        ) : null,
      )}
    </>
  );
});

/**
 * The moon waxes from a thin crescent to full as the bet grows, and glows warmer. The unlit
 * part still shows, faintly (earthshine), and the lit face shades off towards its edge.
 */
function Moon({ phase, dawn, width, height }: { phase: number; dawn: number; width: number; height: number }) {
  // The shadow disc slides off the moon: at 2r apart, it's full.
  const r = 30;
  const shift = r * (0.42 + phase * 1.75);
  const fill = css(rampN(['#F4F0FF', '#FFF3DA', '#FFE7BC', '#FFD9A8'], phase));
  const limb = css(rampN(['#D9CFEA', '#EBD9BC', '#E8C9A0', '#E2B88E'], phase));
  const glow = 0.18 + phase * 0.3;
  // The web's drop-shadows are in the moon's 80-unit grid; iOS shadows trace the art's own
  // outline the same way, so the glow follows the lit part (a tight rim and a wide, faint bloom)
  const unit = MOON_PT / 80;
  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: height * 0.07,
        right: width * 0.05,
        width: MOON_PT,
        height: MOON_PT,
        opacity: 1 - dawn * 0.7,
        transitionProperty: 'opacity',
        transitionDuration: 900,
      }}
    >
      {/* Earthshine: the dark side, only just there */}
      <Svg style={StyleSheet.absoluteFill} viewBox="0 0 80 80">
        <Circle cx={40} cy={40} r={r} fill="#C9B8FF" opacity={0.035 * (1 - phase)} />
      </Svg>
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            shadowColor: 'rgb(255,214,160)',
            shadowOpacity: glow,
            shadowRadius: (10 + phase * 14) * unit * 0.6,
            shadowOffset: { width: 0, height: 0 },
          },
        ]}
      >
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              shadowColor: 'rgb(255,226,180)',
              shadowOpacity: glow * 0.9,
              shadowRadius: 3 * unit * 0.6,
              shadowOffset: { width: 0, height: 0 },
            },
          ]}
        >
          <Svg style={StyleSheet.absoluteFill} viewBox="0 0 80 80">
            <Defs>
              <Mask id="lc-night-moon">
                <Circle cx={40} cy={40} r={r} fill="#FFFFFF" />
                {shift < r * 2 && <Circle cx={40 - shift} cy={40 - shift * 0.12} r={r} fill="#000000" />}
              </Mask>
              {/* Lit from the upper right; darker towards the limb */}
              <RadialGradient id="lc-night-moon-face" cx="0.58" cy="0.4" r="0.62">
                <Stop offset={0} stopColor={fill} />
                <Stop offset={0.75} stopColor={fill} />
                <Stop offset={1} stopColor={limb} />
              </RadialGradient>
            </Defs>
            <G mask="url(#lc-night-moon)">
              <Circle cx={40} cy={40} r={r} fill="url(#lc-night-moon-face)" />
              <MoonSurface />
            </G>
          </Svg>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  clip: { overflow: 'hidden' },
  foot: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  dot: {
    position: 'absolute',
    backgroundColor: '#FFF4DE',
    boxShadow: '0 0 5px rgba(255,236,200,0.75)',
  },
  shooter: {
    position: 'absolute',
    width: 130,
    height: 1.5,
    borderRadius: 1,
    backgroundImage: 'linear-gradient(90deg, #FFF6E2 0%, rgba(255,240,210,0.6) 25%, rgba(255,240,210,0) 100%)',
    boxShadow: '0 0 6px rgba(255,236,200,0.6)',
    opacity: 0,
  },
});
