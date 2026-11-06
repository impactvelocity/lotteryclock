/**
 * Digital's background (web: digital-scene.tsx, DigitalScene): an 8-bit arcade screen that gets
 * more unstable as the bet grows.
 *
 *   0 min     insert coin: a quiet starfield, the grid floor barely crawling
 *   1–11      easy mode: the grid starts to roll, the first power-ups float in
 *   12–23     level up: more stars and power-ups, the grid speeds up
 *   24–35     hard mode: the screen warms towards magenta, the first glitches
 *   36–44     boss fight: glitches tear across the screen, the grid races
 *   45        final boss: everything at full tilt, and the screen jolts
 *
 * While the draw rolls the stars streak past at warp speed. A snooze is an extra life (hearts and
 * 1UPs float up); a late result is game over (the picture collapses like a switched-off CRT and
 * everything drops); on the dot is a high score (a striped sun rises over the hills, PERFECT!s
 * float up through pixel confetti, the grid cycles colours).
 * Purely decorative and pointer-transparent.
 */
import { memo, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  cubicBezier,
  css as cssAnim,
  FadeIn,
  FadeInUp,
  FadeOut,
  FadeOutDown,
  steps,
  useAnimatedStyle,
  useFrameCallback,
  useReducedMotion,
  useSharedValue,
} from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Mask, Path, Pattern, RadialGradient, Rect, Stop } from 'react-native-svg';

import { frac } from '@/lib/rand';
import { ALL_THEMES, css, cssA, rampN, rgbOf } from '@/themes/themes';

import { KF } from '../anim';
import type { SceneProps } from '../types';
import { DKF, fallKF, riseKF, scanrollKF, warpKF } from './keyframes';
import { HorizonTile, PixelSunset, PixelWord, PowerUp, PX, type PowerUpKind } from './pixels';

type RGB = [number, number, number];

const clamp = (n: number) => Math.max(0, Math.min(1, n));
const abs = StyleSheet.absoluteFill;

/** Pixel stars, above the horizon. Each comes out at its `order` of the bet, so the same ones are always first. */
const STAR_COLORS = [PX.white, PX.white, PX.cyan, PX.pinkLight, PX.yellow];
const STARS = Array.from({ length: 72 }, (_, i) => ({
  x: frac(i, 81),
  /** Share of the sky above the horizon (the web's 2% to 6% short of it). */
  y: frac(i, 82),
  s: [2, 2, 3, 3, 4][Math.floor(frac(i, 83) * 5)],
  color: STAR_COLORS[Math.floor(frac(i, 84) * STAR_COLORS.length)],
  order: frac(i, 87),
}));
/**
 * The web blinks every star on its own clock; to keep the animated views down, they blink a
 * layer at a time here, each layer a scatter across the whole sky.
 */
const BLINK_LAYERS = 6;

/**
 * Warp streaks, fanning out from the middle of the screen during the draw (the web has 44; a
 * phone screen reads as full with fewer).
 */
const WARP = Array.from({ length: 30 }, (_, i) => ({
  angle: Math.round(frac(i, 91) * 360),
  dur: 0.5 + frac(i, 92) * 0.6,
  delay: -frac(i, 93) * 1.1,
  len: Math.round(40 + frac(i, 94) * 90),
  color: [PX.white, PX.cyan, PX.lime, PX.pinkLight][i % 4],
}));

/** Glitch bars: thin slices of the screen that tear sideways, more of them as the bet climbs. */
const GLITCHES = Array.from({ length: 9 }, (_, i) => ({
  y: 6 + frac(i, 101) * 84,
  h: 2 + Math.round(frac(i, 102) * 7),
  dur: 1.6 + frac(i, 103) * 2.4,
  delay: -frac(i, 104) * 3,
  color: i % 2 ? PX.cyan : PX.magenta,
}));
/** How many glitch bars each tier shows. */
const GLITCHES_AT = [0, 0, 0, 2, 5, 9];

type Token = { x: number; y: number; size: number; kind: PowerUpKind; dur: number; delay: number; inner?: boolean };

/**
 * Power-ups at the edges, in the order they come out (clear of the middle column). On a phone
 * the web shrinks them to 65% and drops the inner ones, as here.
 */
const TOKENS: Token[] = [
  { x: 6, y: 34, size: 34, kind: 'coin', dur: 2.4, delay: -0.4 },
  { x: 93, y: 28, size: 38, kind: 'heart', dur: 2.8, delay: -1.6 },
  { x: 4, y: 62, size: 36, kind: 'star', dur: 3.2, delay: -1 },
  { x: 95, y: 58, size: 26, kind: 'bolt', dur: 2.6, delay: -2 },
  { x: 16, y: 20, size: 30, kind: 'gem', dur: 3, delay: -0.8, inner: true },
  { x: 84, y: 76, size: 30, kind: 'potion', dur: 2.2, delay: -1.3, inner: true },
  { x: 3, y: 84, size: 32, kind: 'key', dur: 2.9, delay: -2.4 },
  { x: 90, y: 14, size: 32, kind: 'clock', dur: 3.4, delay: -0.2 },
  { x: 18, y: 76, size: 26, kind: 'heart', dur: 2.5, delay: -1.8, inner: true },
  { x: 82, y: 44, size: 28, kind: 'gem', dur: 2.7, delay: -2.2, inner: true },
  { x: 12, y: 48, size: 26, kind: 'coin', dur: 2.3, delay: -1.1, inner: true },
  { x: 96, y: 88, size: 34, kind: 'star', dur: 3.1, delay: -2.8 },
];
const TOKENS_AT = [0, 2, 4, 6, 9, 12];
const TOKEN_SCALE = 0.65;

/** Extra life: hearts and 1UPs rising from the bottom of the screen. */
const RISERS = Array.from({ length: 16 }, (_, i) => ({
  x: 4 + frac(i, 111) * 92,
  delay: frac(i, 112) * 1.8,
  dur: 2.2 + frac(i, 113) * 1.4,
  kind: i % 3 === 0 ? ('1up' as const) : i % 3 === 1 ? ('heart' as const) : ('coin' as const),
  size: Math.round(20 + frac(i, 114) * 14),
}));

/** High score: PERFECT!s floating up through the confetti. */
const PERFECTS = [4, 20, 36, 52, 68, 84].map((x, i) => ({
  // Spread across the screen, each nudged a little, so no two words overlap
  x: x + frac(i, 141) * 4,
  delay: 0.3 + frac(i, 142) * 1.6,
  dur: 2.6 + frac(i, 143) * 1.2,
}));

/** High score: pixel confetti tumbling down in quarter turns (the web's 48, thinned a little). */
const CONFETTI_COLORS = [PX.lime, PX.yellow, PX.cyan, PX.magenta, PX.red, PX.white];
const CONFETTI = Array.from({ length: 40 }, (_, i) => ({
  x: frac(i, 121) * 100,
  s: 5 + Math.round(frac(i, 122) * 6),
  dur: 2 + frac(i, 123) * 1.6,
  delay: frac(i, 124) * 1.6,
  spin: frac(i, 125) > 0.5 ? 720 : -720,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
}));

/** The horizon's height on a phone (the web's 48px); each tile is 200 × 24 pixels, so 400pt wide. */
const HORIZON_H = 48;
/** The grid's cell, in the floor plane's own pt, and its perspective (the web's 48px and 240px). */
const CELL = 48;
const PERSPECTIVE = 240;
const TILT = (64 * Math.PI) / 180;

/** High score: a striped sun rising from behind the hills. */
const SUN_RISE = cssAnim.keyframes({
  from: { transform: [{ translateY: '100%' }] },
  to: { transform: [{ translateY: '0%' }] },
});

/**
 * The sky behind the screen: the theme's background, radial-gradient(circle at 50% 20%, a, b),
 * each ramping with the bet. For painting over the grid where the web masks it out.
 */
const SKY = ALL_THEMES.find((t) => t.id === 'digital')?.bg;
const skyAt = (p: number): [string, string] =>
  SKY && SKY.kind !== 'flat' ? [css(rampN(SKY.a, p)), css(rampN(SKY.b, p))] : ['#123A2C', '#04120C'];

/** The CSS hue-rotate() filter's colour matrix, for the high score's colour-cycling grid. */
function hueRotate([r, g, b]: RGB, deg: number): RGB {
  const a = (deg * Math.PI) / 180;
  const c = Math.cos(a);
  const s = Math.sin(a);
  const m = [
    [0.213 + c * 0.787 - s * 0.213, 0.715 - c * 0.715 - s * 0.715, 0.072 - c * 0.072 + s * 0.928],
    [0.213 - c * 0.213 + s * 0.143, 0.715 + c * 0.285 + s * 0.14, 0.072 - c * 0.072 - s * 0.283],
    [0.213 - c * 0.213 - s * 0.787, 0.715 - c * 0.715 + s * 0.715, 0.072 + c * 0.928 + s * 0.072],
  ];
  return m.map((row) => Math.round(Math.max(0, Math.min(255, row[0] * r + row[1] * g + row[2] * b)))) as RGB;
}

export function DigitalScene({ p, tier, mood, width, height, dial }: SceneProps) {
  const won = mood === 'win' || mood === 'jackpot';
  const over = mood === 'loss';
  const warp = mood === 'set';
  // A snooze lights the screen up; a jackpot runs it at full tilt.
  const hot = clamp(mood === 'jackpot' ? 1 : mood === 'win' ? 0.7 : p);
  const starsOut = over ? 0.15 : warp ? 0.35 : 0.25 + hot * 0.75;
  const tokens = TOKENS_AT[mood === 'jackpot' ? 5 : tier];
  const glitches = over ? 0 : GLITCHES_AT[mood === 'jackpot' ? 3 : tier];

  // The grid: phosphor green → cyan → magenta with the bet; cyan for an extra life, red at game over.
  const gridRGB: RGB =
    mood === 'win' ? rgbOf(PX.cyan) : over ? rgbOf(PX.red) : rampN(['#3DFF7E', '#3DE0FF', '#FF3DCB'], p);
  const grid = css(gridRGB);
  // Grid speed in pt a second: crawling at rest, racing at the full 45, frozen at game over.
  const speed = over ? 0 : warp ? 420 : mood === 'jackpot' ? 200 : mood === 'win' ? 90 : 14 + p * p * 160;

  // The web's horizon sits level with the dial's centre on a phone, so the hills peek out either
  // side of it and the grid floor runs down to the rail.
  const horizon = Math.round(dial.y);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        abs,
        styles.clip,
        // Final boss: every few seconds the whole screen jolts
        tier === 5 && mood === 'idle'
          ? {
              animationName: DKF.jolt,
              animationDuration: '3.2s',
              animationIterationCount: 'infinite',
              animationTimingFunction: 'step-end', // steps(1)
            }
          : null,
      ]}
    >
      {/* Pixel starfield */}
      <PixelStars starsOut={starsOut} width={width} horizon={horizon} height={height} />

      {/* The horizon: the grid floor rolling towards you, a glow, pixel hills and buildings */}
      <Floor
        width={width}
        height={height}
        horizon={horizon}
        p={p}
        gridRGB={gridRGB}
        opacity={over ? 0.45 : 0.55 + hot * 0.35}
        speed={speed}
        cycling={mood === 'jackpot'}
      />
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: horizon - 96,
          height: 192,
          backgroundImage: `radial-gradient(ellipse 60% 50% at 50% 50%, ${cssA(gridRGB, 0.16 + hot * 0.16)} 0%, ${cssA(gridRGB, 0)} 70%)`,
        }}
      />
      {/* High score: a striped sun rises from behind the hills. Off to the right, where the screen
          is clear: centred, it would sit behind the clock's digits and the theme picker. */}
      {mood === 'jackpot' && <Sunrise width={width} horizon={horizon} />}
      <View style={[styles.hills, { top: horizon - HORIZON_H, height: HORIZON_H }]}>
        {[0, 1, 2].map((i) => (
          <HorizonTile key={i} edge={grid} height={HORIZON_H} />
        ))}
      </View>
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: horizon,
          height: 2,
          backgroundColor: grid,
          boxShadow: `0 0 12px ${grid}`,
          opacity: 0.8,
        }}
      />

      {/* Warp speed while the draw rolls: streaks fanning out from the middle */}
      {warp && <Warp width={width} height={height} />}

      {/* Power-ups floating at the edges, from "Easy mode" up */}
      {TOKENS.slice(0, tokens).map((tk, i) =>
        tk.inner ? null : (
          <PowerToken key={i} tk={tk} i={i} width={width} height={height} won={won} over={over} glow={cssA(gridRGB, 0.35)} />
        ),
      )}

      {/* Glitches tearing across the screen as the bet climbs */}
      {GLITCHES.slice(0, glitches).map((g, i) => {
        const c = rgbOf(g.color);
        return (
          <Animated.View
            key={i}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: (g.y / 100) * height,
              height: g.h,
              backgroundImage: `linear-gradient(to right, ${cssA(c, 0)}, ${cssA(c, 0.5)} 20%, ${cssA(c, 0.35)} 80%, ${cssA(c, 0)})`,
              mixBlendMode: 'screen',
              opacity: 0,
              animationName: DKF.glitch,
              animationDuration: `${Math.round(g.dur * 100) / 100}s`,
              animationDelay: `${Math.round(g.delay * 100) / 100}s`,
              animationIterationCount: 'infinite',
              animationTimingFunction: 'step-end', // steps(1)
            }}
          />
        );
      })}

      {/* Extra life: hearts, coins and 1UPs floating up (twice through, then it settles) */}
      {mood === 'win' && <ExtraLife width={width} height={height} />}

      {/* High score: pixel confetti, and PERFECT!s */}
      {mood === 'jackpot' && <HighScore width={width} height={height} />}

      {/* CRT scanlines over everything, and a faint refresh band rolling down */}
      <Animated.View
        style={[abs, { opacity: over ? 0.9 : 0.55, transitionProperty: 'opacity', transitionDuration: 600 }]}
      >
        <Scanlines width={width} height={height} />
      </Animated.View>
      <Animated.View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: -160,
          height: 160,
          backgroundImage: `linear-gradient(to bottom, ${cssA(gridRGB, 0)}, ${cssA(gridRGB, 0.05)}, ${cssA(gridRGB, 0)})`,
          animationName: scanrollKF(height),
          animationDuration: '7s',
          animationIterationCount: 'infinite',
          animationTimingFunction: 'linear',
        }}
      />
      {/* The tube's dark corners */}
      <View
        style={[
          abs,
          { backgroundImage: 'radial-gradient(ellipse 90% 80% at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.45) 100%)' },
        ]}
      />

      {/* Game over: the picture collapses to a line, then a dot, like a switched-off CRT; the screen goes dim and red */}
      {over && (
        <Animated.View style={abs} exiting={FadeOut.duration(300)}>
          <Animated.View
            style={[
              abs,
              {
                backgroundImage:
                  'radial-gradient(ellipse 80% 70% at 50% 45%, rgba(60,0,16,0.25) 30%, rgba(14,2,6,0.7) 100%)',
                animationName: KF.fadeIn,
                animationDuration: '0.8s',
                animationDelay: '0.35s',
                animationTimingFunction: 'ease-out',
                animationFillMode: 'both',
              },
            ]}
          />
          <Animated.View
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: height * 0.45,
              height: 3,
              backgroundColor: PX.white,
              boxShadow: `0 0 18px ${PX.white}, 0 0 40px ${PX.cyan}`,
              opacity: 0,
              animationName: DKF.crtOff,
              animationDuration: '0.9s',
              animationTimingFunction: 'ease-in',
              animationFillMode: 'both',
            }}
          />
        </Animated.View>
      )}
    </Animated.View>
  );
}

const PixelStars = memo(function PixelStars({
  starsOut,
  width,
  horizon,
  height,
}: {
  starsOut: number;
  width: number;
  horizon: number;
  height: number;
}) {
  // From near the top to a little short of the horizon
  const top = height * 0.02;
  const span = Math.max(0, horizon - height * 0.06 - top);
  return (
    <>
      {Array.from({ length: BLINK_LAYERS }, (_, g) => (
        <Animated.View
          key={g}
          style={[
            abs,
            {
              animationName: KF.blink,
              animationDuration: `${Math.round((1.2 + g * 0.5) * 100) / 100}s`,
              animationDelay: `${Math.round((-g * 0.5) * 100) / 100}s`,
              animationIterationCount: 'infinite',
              animationTimingFunction: 'step-end', // steps(1)
            },
          ]}
        >
          {STARS.map((s, i) =>
            i % BLINK_LAYERS === g ? (
              <Animated.View
                key={i}
                style={{
                  position: 'absolute',
                  left: s.x * width,
                  top: top + s.y * span,
                  width: s.s,
                  height: s.s,
                  backgroundColor: s.color,
                  boxShadow: s.s > 2 ? `0 0 6px ${s.color}` : undefined,
                  opacity: s.order < starsOut ? 1 : 0,
                  transitionProperty: 'opacity',
                  transitionDuration: 400,
                }}
              />
            ) : null,
          )}
        </Animated.View>
      ))}
    </>
  );
});

/**
 * The grid floor: a plane of lines tipped back in perspective (as on the web), rolling towards
 * you. The web masks it to fade in from the horizon and clear round the bottom middle, so the tier
 * name and the result read cleanly over it; native views can't mask, so the sky's own gradient is
 * painted back over it there instead (the sky is all that's behind it).
 */
function Floor({
  width,
  height,
  horizon,
  p,
  gridRGB,
  opacity,
  speed,
  cycling,
}: {
  width: number;
  height: number;
  horizon: number;
  p: number;
  gridRGB: RGB;
  opacity: number;
  speed: number;
  /** High score: the grid cycles through every colour. */
  cycling: boolean;
}) {
  const floor = height - horizon;
  // The plane only needs to reach the bottom of the screen (and must stop short of the eye)
  const reach = (PERSPECTIVE * floor) / (PERSPECTIVE * Math.cos(TILT) + floor * Math.sin(TILT));
  const planeH = Math.ceil(Math.min(PERSPECTIVE / Math.sin(TILT) - 8, reach + CELL / 2));
  const planeW = width * 2;

  // Rolled frame by frame, like the web's requestAnimationFrame loop, so a new speed takes over
  // without a jump
  const still = useReducedMotion();
  const roll = useSharedValue(0);
  const pace = useSharedValue(speed);
  useEffect(() => {
    pace.value = speed;
  }, [speed, pace]);
  useFrameCallback((frame) => {
    const dt = (frame.timeSincePreviousFrame ?? 16) / 1000;
    roll.value = (roll.value + dt * pace.value) % CELL;
  }, !still);
  const rolling = useAnimatedStyle(() => ({ transform: [{ translateY: roll.value }] }));

  // 2pt lines at the start of every cell, both ways (plus a cell above, to roll in)
  const lines = (() => {
    let d = '';
    for (let x = 0; x < planeW; x += CELL) d += `M${x} 0h2v${planeH + CELL}h-2z`;
    for (let y = 0; y < planeH + CELL; y += CELL) d += `M0 ${y}h${planeW}v2h${-planeW}z`;
    return d;
  })();
  const colours = cycling ? [0, 120, 240].map((deg) => hueRotate(gridRGB, deg)) : [gridRGB];

  return (
    <View style={{ position: 'absolute', left: 0, right: 0, top: horizon, height: floor, overflow: 'hidden' }}>
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          left: -width / 2,
          width: planeW,
          height: planeH,
          transformOrigin: '50% 0%',
          transform: [{ perspective: PERSPECTIVE }, { rotateX: '64deg' }],
          opacity,
          transitionProperty: 'opacity',
          transitionDuration: 500,
        }}
      >
        <Animated.View style={[{ position: 'absolute', left: 0, top: -CELL, width: planeW, height: planeH + CELL }, rolling]}>
          {colours.map((c, k) => (
            <Animated.View
              key={k}
              style={[
                abs,
                cycling && {
                  animationName: DKF.hue,
                  animationDuration: '1.6s',
                  // Copy k takes its turn a k-th third into the cycle, so the hue turns forwards
                  animationDelay: `${(-((3 - k) % 3) * 1.6) / 3}s`,
                  animationIterationCount: 'infinite',
                  animationTimingFunction: 'linear',
                },
              ]}
            >
              <Svg width={planeW} height={planeH + CELL}>
                <Path d={lines} fill={cssA(c, 0.55)} />
              </Svg>
            </Animated.View>
          ))}
        </Animated.View>
      </Animated.View>
      <FloorCover width={width} height={height} horizon={horizon} p={p} />
    </View>
  );
}

/**
 * The sky, painted over the grid where the web's mask hides it: thick at the horizon and fading
 * out by 45% of the way down, and round an oval at the bottom middle (behind the tier name and
 * the result). The mask's luminance is 1 − fade × oval, built by laying one over the other.
 */
const FloorCover = memo(function FloorCover({
  width,
  height,
  horizon,
  p,
}: {
  width: number;
  height: number;
  horizon: number;
  p: number;
}) {
  const floor = height - horizon;
  const [a, b] = skyAt(p);
  // The sky is radial-gradient(circle at 50% 20%, a, b) over the whole scene: farthest corner
  const r = Math.hypot(width / 2, height * 0.8);
  return (
    <Svg style={abs} width={width} height={floor}>
      <Defs>
        <RadialGradient
          id="lc-px-sky"
          gradientUnits="userSpaceOnUse"
          cx={width / 2}
          cy={height * 0.2 - horizon}
          fx={width / 2}
          fy={height * 0.2 - horizon}
          r={r}
        >
          <Stop offset={0} stopColor={a} />
          <Stop offset={1} stopColor={b} />
        </RadialGradient>
        <LinearGradient id="lc-px-fade" x1="0" y1="0" x2="0" y2="1">
          <Stop offset={0} stopColor="#FFFFFF" stopOpacity={1} />
          <Stop offset={0.45} stopColor="#FFFFFF" stopOpacity={0} />
        </LinearGradient>
        {/* The web's ellipse 26% 42% at 50% 78%: a circle of radius 26%, stretched to 42% tall */}
        <RadialGradient
          id="lc-px-oval"
          cx="0.5"
          cy="0.78"
          fx="0.5"
          fy="0.78"
          r="0.26"
          gradientTransform={`translate(0 0.78) scale(1 ${(0.42 / 0.26).toFixed(4)}) translate(0 -0.78)`}
        >
          <Stop offset={0.35} stopColor="#FFFFFF" stopOpacity={1} />
          <Stop offset={1} stopColor="#FFFFFF" stopOpacity={0} />
        </RadialGradient>
        <Mask id="lc-px-cover" maskUnits="userSpaceOnUse" x={0} y={0} width={width} height={floor}>
          <Rect x={0} y={0} width={width} height={floor} fill="url(#lc-px-fade)" />
          <Rect x={0} y={0} width={width} height={floor} fill="url(#lc-px-oval)" />
        </Mask>
      </Defs>
      <Rect x={0} y={0} width={width} height={floor} fill="url(#lc-px-sky)" mask="url(#lc-px-cover)" />
    </Svg>
  );
});

/** High score: the striped sun rising over the hills, with a warm glow behind it. */
function Sunrise({ width, horizon }: { width: number; horizon: number }) {
  const w = Math.min(190, width * 0.34);
  const h = (w * 34) / 48;
  return (
    <Animated.View
      exiting={FadeOut.duration(400)}
      style={{ position: 'absolute', left: width * 0.8 - w / 2, top: horizon - h, width: w, height: h }}
    >
      <Animated.View
        style={{
          position: 'absolute',
          left: -w / 2,
          top: -h / 2,
          width: w * 2,
          height: h * 2,
          backgroundImage:
            'radial-gradient(circle at 50% 70%, rgba(255,61,203,0.35) 0%, rgba(255,225,53,0.12) 35%, rgba(255,225,53,0) 62%)',
          animationName: KF.fadeIn,
          animationDuration: '1.2s',
          animationDelay: '0.4s',
          animationTimingFunction: 'ease-out',
          animationFillMode: 'both',
        }}
      />
      <View style={[abs, styles.clip]}>
        <Animated.View
          style={{
            animationName: SUN_RISE,
            animationDuration: '1.6s',
            animationDelay: '0.3s',
            animationTimingFunction: cubicBezier(0.2, 0.7, 0.3, 1),
            animationFillMode: 'both',
          }}
        >
          <PixelSunset width={w} />
        </Animated.View>
      </View>
    </Animated.View>
  );
}

/** Warp speed: streaks shooting out from the middle of the screen, each along its own angle. */
function Warp({ width, height }: { width: number; height: number }) {
  const kf = warpKF(width);
  return (
    <Animated.View
      entering={FadeIn.duration(400)}
      exiting={FadeOut.duration(300)}
      style={{ position: 'absolute', left: width / 2, top: height * 0.42 }}
    >
      {WARP.map((w, i) => (
        <View key={i} style={[styles.spoke, { transform: [{ rotate: `${w.angle}deg` }] }]}>
          <Animated.View
            style={{
              position: 'absolute',
              left: 0,
              top: -1,
              width: w.len,
              height: 2,
              transformOrigin: '0% 50%',
              backgroundImage: `linear-gradient(to right, ${cssA(rgbOf(w.color), 0)}, ${w.color})`,
              opacity: 0,
              animationName: kf,
              animationDuration: `${Math.round(w.dur * 100) / 100}s`,
              animationDelay: `${Math.round(w.delay * 100) / 100}s`,
              animationIterationCount: 'infinite',
              animationTimingFunction: 'linear',
            }}
          />
        </View>
      ))}
    </Animated.View>
  );
}

/** One power-up, bobbing in chunky steps (coins flip); at game over it drops off the screen. */
function PowerToken({
  tk,
  i,
  width,
  height,
  won,
  over,
  glow,
}: {
  tk: Token;
  i: number;
  width: number;
  height: number;
  won: boolean;
  over: boolean;
  glow: string;
}) {
  const bobDur = won ? tk.dur * 0.35 : tk.dur;
  return (
    <Animated.View
      entering={FadeInUp.springify().stiffness(180).damping(18)}
      exiting={FadeOutDown}
      style={{
        position: 'absolute',
        left: (tk.x / 100) * width - tk.size / 2,
        top: (tk.y / 100) * height - tk.size / 2,
        transform: [{ scale: TOKEN_SCALE }],
      }}
    >
      <Animated.View
        style={{
          opacity: 0.95,
          transform: [{ translateY: over ? 1400 : 0 }],
          transitionProperty: 'transform',
          transitionDuration: over ? 1100 : 400,
          transitionDelay: over ? 500 + (i % 5) * 80 : 0,
          transitionTimingFunction: over ? cubicBezier(0.5, 0, 0.9, 0.5) : 'ease-out',
        }}
      >
        <Animated.View
          style={{
            animationName: DKF.bob,
            animationDuration: `${Math.round(bobDur * 100) / 100}s`,
            animationDelay: `${tk.delay}s`,
            animationIterationCount: 'infinite',
            animationTimingFunction: steps(3, 'jump-none'),
            // The web's drop-shadow glow; iOS shadows trace the pixels the same way
            shadowColor: glow,
            shadowOpacity: 1,
            shadowRadius: 4,
            shadowOffset: { width: 0, height: 0 },
          }}
        >
          <Animated.View
            style={
              tk.kind === 'coin'
                ? {
                    animationName: DKF.coinFlip,
                    animationDuration: `${Math.round((tk.dur * 0.6) * 100) / 100}s`,
                    animationDelay: `${tk.delay}s`,
                    animationIterationCount: 'infinite',
                    animationTimingFunction: steps(4),
                  }
                : undefined
            }
          >
            <PowerUp kind={tk.kind} size={tk.size} />
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
}

/** A glow round pixel art (the web's drop-shadow), traced by an iOS shadow. */
const glowOf = (color: string) =>
  ({ shadowColor: color, shadowOpacity: 1, shadowRadius: 3, shadowOffset: { width: 0, height: 0 } }) as const;

/** Extra life: hearts, coins and 1UPs floating up from the bottom (twice through, then it settles). */
function ExtraLife({ width, height }: { width: number; height: number }) {
  const kf = riseKF(height);
  return (
    <Animated.View style={abs} exiting={FadeOut.duration(400)}>
      {RISERS.map((r, i) => (
        <Animated.View
          key={i}
          style={{
            position: 'absolute',
            bottom: 0,
            left: (r.x / 100) * width,
            opacity: 0,
            animationName: kf,
            animationDuration: `${Math.round(r.dur * 100) / 100}s`,
            animationDelay: `${Math.round(r.delay * 100) / 100}s`,
            animationIterationCount: 2,
            animationTimingFunction: steps(18),
            animationFillMode: 'both',
          }}
        >
          {r.kind === '1up' ? (
            <View style={glowOf(PX.lime)}>
              <PixelWord word="oneUp" height={18} />
            </View>
          ) : (
            <PowerUp kind={r.kind} size={r.size} />
          )}
        </Animated.View>
      ))}
    </Animated.View>
  );
}

/** High score: pixel confetti tumbling down, and PERFECT!s floating up through it. */
function HighScore({ width, height }: { width: number; height: number }) {
  const rise = riseKF(height);
  return (
    <Animated.View style={abs} exiting={FadeOut.duration(400)}>
      {CONFETTI.map((c, i) => (
        <Animated.View
          key={i}
          style={{
            position: 'absolute',
            top: -16,
            left: (c.x / 100) * width,
            width: c.s,
            height: c.s,
            backgroundColor: c.color,
            opacity: 0,
            animationName: fallKF(height, c.spin),
            animationDuration: `${Math.round(c.dur * 100) / 100}s`,
            animationDelay: `${Math.round(c.delay * 100) / 100}s`,
            animationIterationCount: 2,
            animationTimingFunction: steps(24),
            animationFillMode: 'both',
          }}
        />
      ))}
      {PERFECTS.map((w, i) => (
        <Animated.View
          key={`w${i}`}
          style={{
            position: 'absolute',
            bottom: 0,
            left: (w.x / 100) * width,
            opacity: 0,
            animationName: rise,
            animationDuration: `${Math.round(w.dur * 100) / 100}s`,
            animationDelay: `${Math.round(w.delay * 100) / 100}s`,
            animationIterationCount: 2,
            animationTimingFunction: steps(18),
            animationFillMode: 'both',
          }}
        >
          {/* The web's 20px words, at its 75% for phones */}
          <View style={glowOf(PX.yellow)}>
            <PixelWord word="perfect" height={15} />
          </View>
        </Animated.View>
      ))}
    </Animated.View>
  );
}

/** CRT scanlines: a dark line every 4pt. */
const Scanlines = memo(function Scanlines({ width, height }: { width: number; height: number }) {
  return (
    <Svg width={width} height={height}>
      <Defs>
        <Pattern id="lc-px-scan" patternUnits="userSpaceOnUse" x={0} y={0} width={4} height={4}>
          <Rect x={0} y={0} width={4} height={1} fill="rgba(0,0,0,0.22)" />
        </Pattern>
      </Defs>
      <Rect x={0} y={0} width={width} height={height} fill="url(#lc-px-scan)" />
    </Svg>
  );
});

const styles = StyleSheet.create({
  clip: { overflow: 'hidden' },
  hills: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  spoke: { position: 'absolute', left: 0, top: 0, width: 0, height: 0 },
});
