/**
 * Prize wheel's background, ported from web/src/components/scenes/wheel-scene.tsx: a game-show
 * floor that gets louder as the bet grows.
 *
 *   0 min     no spin: house lights low, two idle spotlights
 *   1–11      free spin: the first chips float up at the edges
 *   12–23     round and round: more chips, the sparkle comes on
 *   24–35     bonus round: a third spotlight, coins join the chips
 *   36–44     high stakes: four spotlights, sparkle everywhere
 *   45        mega jackpot: everything at full tilt
 *
 * A snooze is a payout (coins rain down); a late result is "bankrupt" (the lights drop).
 *
 * iOS has no conic gradients or CSS masks, so the spotlight cones, the payout fan and the
 * sunburst are SVG wedges whose gradients carry the web's fade. Big soft layers are drawn at a
 * fraction of their size and scaled up (`Lowres`), which keeps their bitmaps small and softens
 * them like the web's gradients. Purely decorative and pointer-transparent.
 */
import { useEffect, useMemo, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  css,
  cubicBezier,
  Easing,
  FadeIn,
  FadeInUp,
  FadeOut,
  FadeOutDown,
  Keyframe,
  useAnimatedStyle,
  useFrameCallback,
  useReducedMotion,
  useSharedValue,
} from 'react-native-reanimated';
import Svg, { Defs, G, LinearGradient, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

import { KF, loop } from '@/scenes/anim';
import type { BackdropProps, SceneProps } from '@/scenes/types';
import { frac } from '@/lib/rand';
import { cssA, MAX_RANGE, rampN } from '@/themes/themes';

import { isRound, SPARKLE, TokenArt, type TokenKind } from './art';

const clamp = (n: number) => Math.max(0, Math.min(1, n));
const r2 = (n: number) => Math.round(n * 100) / 100;

/* ---------------- Drawing helpers ---------------- */

/**
 * Draws its children (an SVG laid out in a `w` × `h` box) at 1/`k` of the size and scales the
 * result up: a far smaller bitmap for big, soft layers, and a little extra softness for free.
 */
function Lowres({ w, h, k, children }: { w: number; h: number; k: number; children: ReactNode }) {
  return (
    <View
      style={{
        position: 'absolute',
        left: (w - w / k) / 2,
        top: (h - h / k) / 2,
        width: w / k,
        height: h / k,
        transform: [{ scale: k }],
      }}
    >
      <Svg viewBox={`0 0 ${w} ${h}`} width={w / k} height={h / k}>
        {children}
      </Svg>
    </View>
  );
}

/**
 * A spotlight cone in a `w` × `h` box, its lamp at the bottom (or top) centre. The web's conic
 * gradient (bright down the middle, fading to nothing at its edges) is approximated by nested
 * wedges, `layers` of [half-angle in degrees, alpha]; `fade` is the fade along the beam,
 * [offset from the lamp 0..1, alpha multiplier].
 */
function Cone({
  id,
  w,
  h,
  rgb,
  layers,
  fade,
  down = false,
}: {
  id: string;
  w: number;
  h: number;
  rgb: string;
  layers: [number, number][];
  fade: [number, number][];
  down?: boolean;
}) {
  const ax = w / 2;
  const ay = down ? 0 : h;
  const end = down ? h : 0;
  return (
    <>
      <Defs>
        <LinearGradient id={id} x1="0" y1={ay} x2="0" y2={end} gradientUnits="userSpaceOnUse">
          {fade.map(([o, a]) => (
            <Stop key={o} offset={o} stopColor={`rgb(${rgb})`} stopOpacity={a} />
          ))}
        </LinearGradient>
      </Defs>
      {layers.map(([deg, a]) => {
        const dx = r2(h * Math.tan((deg * Math.PI) / 180));
        return (
          <Path key={deg} d={`M${ax} ${ay}L${ax - dx} ${end}H${ax + dx}Z`} fill={`url(#${id})`} opacity={a} />
        );
      })}
    </>
  );
}

/** One path of `n` wedges round (cx, cy), each `on` degrees wide every `every` degrees. */
function rays(cx: number, cy: number, r: number, n: number, on: number, every: number, from = 0) {
  let d = '';
  for (let i = 0; i < n; i++) {
    const a1 = ((from + i * every) * Math.PI) / 180;
    const a2 = ((from + i * every + on) * Math.PI) / 180;
    d += `M${cx} ${cy}L${r2(cx + r * Math.sin(a1))} ${r2(cy - r * Math.cos(a1))}A${r} ${r} 0 0 1 ${r2(cx + r * Math.sin(a2))} ${r2(cy - r * Math.cos(a2))}Z`;
  }
  return d;
}

/* ---------------- Spotlights ---------------- */

/** Spotlights sweeping up from the floor: where they stand (% across), their swing, their colour. */
const BEAMS = [
  { x: 4, from: 12, to: 34, dur: 7, delay: 0, rgb: '255,205,90' },
  { x: 96, from: -12, to: -34, dur: 8, delay: -3, rgb: '255,100,180' },
  { x: 24, from: -8, to: 18, dur: 6, delay: -1.5, rgb: '175,125,255' },
  { x: 76, from: 8, to: -18, dur: 6.5, delay: -4.2, rgb: '255,205,90' },
];
const BEAMS_AT = [2, 2, 2, 3, 4, 4];

/** lc-sweep, one per beam (each has its own swing). */
const SWEEPS = BEAMS.map((b) =>
  css.keyframes({
    '0%, 100%': { transform: [{ rotate: `${b.from}deg` }] },
    '50%': { transform: [{ rotate: `${b.to}deg` }] },
  }),
);

/** lc-beam-die: bankrupt makes each spotlight sputter and go out. */
const BEAM_DIE = css.keyframes({
  '0%': { opacity: 1 },
  '10%': { opacity: 0.15 },
  '18%': { opacity: 0.9 },
  '30%': { opacity: 0.05 },
  '38%': { opacity: 0.6 },
  '52%, 100%': { opacity: 0 },
});

/** A beam's cone: ±8° with the web's 0 → 0.7 → 1 → 0.7 → 0 falloff, at alpha 0.5. */
const BEAM_LAYERS: [number, number][] = [
  [8, 0.09],
  [6, 0.17],
  [4, 0.13],
  [2, 0.08],
];
/** Beams fade out as they climb. */
const BEAM_FADE: [number, number][] = [
  [0, 1],
  [0.45, 0.5],
  [0.95, 0],
];

/** A win swings every spotlight in gold. */
const GOLD = '255,205,90';

/** Bankrupt: the one cold spotlight left on, shining down from the top (±12°). */
const LONE_LAYERS: [number, number][] = [
  [12, 0.045],
  [10, 0.085],
  [8, 0.085],
  [6, 0.055],
  [4, 0.03],
  [2, 0.03],
];
const LONE_FADE: [number, number][] = [
  [0, 1],
  [0.55, 0.8],
  [1, 0],
];
/** ...which clunks on a beat after the others go out. */
const LONE_ON = css.keyframes({
  '0%': { opacity: 0 },
  '20%': { opacity: 1 },
  '45%': { opacity: 0.4 },
  '100%': { opacity: 1 },
});

/* ---------------- Tokens ---------------- */

type Token = {
  x: number;
  y: number;
  size: number;
  kind: TokenKind;
  dur: number;
  delay: number;
  tilt: number;
  /** Nearer the middle: left out on phones, where it would sit behind the text. */
  inner?: boolean;
};

/**
 * Chips, coins and lucky charms floating at the edges, in the order they come out. Kept clear
 * of the middle column, and hugging the very edge level with the dial, where the side labels sit.
 */
const TOKENS: Token[] = [
  { x: 5, y: 36, size: 46, kind: 'pink', dur: 5.4, delay: -1, tilt: -16 },
  { x: 92, y: 30, size: 40, kind: 'coin', dur: 4.6, delay: -2.5, tilt: 0 },
  { x: 3, y: 64, size: 32, kind: 'violet', dur: 6.2, delay: -3, tilt: 20 },
  { x: 96, y: 70, size: 44, kind: 'mint', dur: 5.8, delay: -0.5, tilt: -10 },
  { x: 3, y: 18, size: 36, kind: 'cherries', dur: 4.2, delay: -1.8, tilt: -8 },
  { x: 95, y: 48, size: 30, kind: 'pink', dur: 5, delay: -4, tilt: 14 },
  { x: 18, y: 24, size: 32, kind: 'die', dur: 4.8, delay: -3.4, tilt: 12, inner: true },
  { x: 82, y: 80, size: 36, kind: 'clover', dur: 6.6, delay: -2, tilt: -14, inner: true },
  { x: 3, y: 86, size: 38, kind: 'mint', dur: 5.2, delay: -4.6, tilt: -22 },
  { x: 90, y: 16, size: 34, kind: 'star', dur: 4.4, delay: -0.8, tilt: 10 },
  { x: 20, y: 80, size: 32, kind: 'horseshoe', dur: 5.6, delay: -1.2, tilt: 8, inner: true },
  { x: 80, y: 22, size: 22, kind: 'coin', dur: 4, delay: -2.2, tilt: 0, inner: true },
  { x: 14, y: 52, size: 40, kind: 'ticket', dur: 6, delay: -2.8, tilt: 6, inner: true },
  { x: 86, y: 58, size: 26, kind: 'coin', dur: 4.6, delay: -3.6, tilt: 0, inner: true },
];
const TOKENS_AT = [0, 2, 4, 6, 9, 14];
/** On a phone the web shrinks the tokens to 60%. */
const TOKEN_SCALE = 0.6;

/** lc-float-spin, per token (each has its own tilt): bob up 14px and turn 14° more. */
const FLOATS = TOKENS.map((tk) =>
  css.keyframes({
    '0%, 100%': { transform: [{ translateY: 0 }, { rotate: `${tk.tilt}deg` }] },
    '50%': { transform: [{ translateY: -14 * TOKEN_SCALE }, { rotate: `${tk.tilt + 14}deg` }] },
  }),
);

/** Bankrupt: each token drops out of the bottom, tumbling. */
const FALLS = TOKENS.map((tk, i) =>
  css.keyframes({
    from: { transform: [{ translateY: 0 }, { rotate: '0deg' }] },
    to: { transform: [{ translateY: 1400 }, { rotate: `${tk.tilt * 3 + (i % 2 ? 200 : -200)}deg` }] },
  }),
);
const FALL_EASE = cubicBezier(0.5, 0, 0.9, 0.5);

/** lc-coin-flip: a coin turning over (edge on at the middle). */
const COIN_FLIP = css.keyframes({
  '0%, 100%': { transform: [{ scaleX: 1 }] },
  '50%': { transform: [{ scaleX: 0.12 }] },
});

/* ---------------- Sparkle ---------------- */

/**
 * Sparkles come out in a fixed order (`order`), so the same ones are always first. The web has
 * 44; 22 keeps the scene within its animation budget on a phone.
 */
const SPARK_COLORS = ['#FFE08A', '#FF8CC6', '#FFFFFF', '#C9A6FF'];
const SPARKS = Array.from({ length: 22 }, (_, i) => ({
  x: frac(i, 51) * 100,
  y: 4 + frac(i, 52) * 80,
  s: Math.round(6 + frac(i, 53) * 12),
  delay: r2(frac(i, 54) * 4),
  dur: r2(1.8 + frac(i, 55) * 2.4),
  order: frac(i, 56),
  color: SPARK_COLORS[Math.floor(frac(i, 57) * SPARK_COLORS.length)],
}));

/** lc-glint: wink on, turning, and off again. */
const GLINT = css.keyframes({
  '0%, 100%': { opacity: 0, transform: [{ scale: 0.3 }, { rotate: '0deg' }] },
  '50%': { opacity: 1, transform: [{ scale: 1 }, { rotate: '45deg' }] },
});

/* ---------------- Payout ---------------- */

/** The payout: coins (with the odd chip or charm) raining down on a snooze or a jackpot. */
const RAIN_CHIPS = ['pink', 'violet', 'mint'] as const;
const RAIN_CHARMS = ['star', 'cherries', 'clover', 'horseshoe'] as const;
/** The web throws 26; 14 keeps the shower within the animation budget. */
const RAIN = Array.from({ length: 14 }, (_, i) => ({
  x: frac(i, 71) * 100,
  size: Math.round(16 + frac(i, 72) * 18),
  dur: r2(2.2 + frac(i, 73) * 1.6),
  delay: r2(frac(i, 74) * 1.6),
  spin: frac(i, 75) > 0.5 ? 1 : -1,
  kind: (frac(i, 76) > 0.86 ? RAIN_CHARMS[i % 4] : frac(i, 76) > 0.7 ? RAIN_CHIPS[i % 3] : 'coin') as TokenKind,
}));
const RAIN_EASE = cubicBezier(0.45, 0, 0.8, 0.6);

/** The payout fan: a big disc of faint gold rays round the bottom centre (the button). */
const FAN = 1800;
const FAN_RAYS = rays(FAN / 2, FAN / 2, FAN / 2, 30, 5, 12);
/** The fan opens out as it comes on. */
const FAN_IN = new Keyframe({
  0: { opacity: 0, transform: [{ scale: 0.6 }] },
  100: { opacity: 1, transform: [{ scale: 1 }], easing: Easing.bezier(0.2, 0.8, 0.3, 1) },
}).duration(900);

/* ---------------- The scene ---------------- */

export function WheelScene({ p, tier, mood, width, height }: SceneProps) {
  const payout = mood === 'win' || mood === 'jackpot';
  // A snooze is a payout, so the room celebrates; jackpot runs it at full tilt.
  const hot = clamp(mood === 'jackpot' ? 1 : mood === 'win' ? 0.8 : p);
  // Bankrupt: the house lights drop, the spotlights sputter out and the chips fall off the table.
  const bankrupt = mood === 'loss';
  const lights = bankrupt ? 0.18 : 1;
  const beams = payout ? BEAMS.length : BEAMS_AT[tier];
  // Phones leave out the tokens nearer the middle (they'd sit behind the text)
  const tokens = TOKENS.slice(0, TOKENS_AT[mood === 'jackpot' ? 5 : tier])
    .map((tk, i) => ({ tk, i }))
    .filter(({ tk }) => !tk.inner);
  const sparksOut = (0.08 + hot * 0.92) * (bankrupt ? 0.2 : 1);

  const floor = rampN(['#7A3DCC', '#C24FC0', '#FF8A4D'], hot);

  // A beam is 2:5, reaching well past the top of the screen
  const bh = height * 1.35;
  const bw = bh * 0.4;
  // The lone cold light: 3:4, most of the way down
  const lh = height * 0.85;
  const lw = lh * 0.75;

  // The rain falls past the bottom of the screen (115vh on the web)
  const rainFall = useMemo(
    () =>
      [1, -1].map((spin) =>
        css.keyframes({
          '0%': { opacity: 0, transform: [{ translateY: 0 }, { rotate: '0deg' }] },
          '8%': { opacity: 1 },
          '85%': { opacity: 1 },
          '100%': { opacity: 0, transform: [{ translateY: height * 1.15 }, { rotate: `${spin * 540}deg` }] },
        }),
      ),
    [height],
  );

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { overflow: 'hidden' }]}>
      {/* Floor glow under the stage: violet when it's quiet, gold-orange at full tilt */}
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: '65%',
          backgroundImage: `radial-gradient(ellipse 70% 60% at 50% 100%, ${cssA(floor, r2(0.2 + hot * 0.3))} 0%, ${cssA(floor, r2(0.06 + hot * 0.1))} 50%, transparent 78%)`,
          opacity: lights,
          transitionProperty: 'opacity',
          transitionDuration: 700,
        }}
      />

      {/* Payout: a fan of rays rising from the button, turning slowly */}
      {payout && (
        <Animated.View
          entering={FAN_IN}
          exiting={FadeOut.duration(300)}
          style={{
            position: 'absolute',
            left: width / 2 - FAN / 2,
            top: height - FAN / 2,
            width: FAN,
            height: FAN,
            mixBlendMode: 'screen',
          }}
        >
          <Animated.View style={{ flex: 1, opacity: mood === 'jackpot' ? 1 : 0.8, ...loop(KF.spin, 90, { ease: 'linear' }) }}>
            <Lowres w={FAN} h={FAN} k={6}>
              <Defs>
                {/* Clear right round the button, then fading out as the rays spread */}
                <RadialGradient id="fan" cx={FAN / 2} cy={FAN / 2} r={FAN / 2} gradientUnits="userSpaceOnUse">
                  <Stop offset="0.09" stopColor={`rgb(${GOLD})`} stopOpacity={0} />
                  <Stop offset="0.2" stopColor={`rgb(${GOLD})`} stopOpacity={0.11} />
                  <Stop offset="0.55" stopColor={`rgb(${GOLD})`} stopOpacity={0.06} />
                  <Stop offset="1" stopColor={`rgb(${GOLD})`} stopOpacity={0} />
                </RadialGradient>
              </Defs>
              <Path d={FAN_RAYS} fill="url(#fan)" />
            </Lowres>
          </Animated.View>
        </Animated.View>
      )}

      {/* Spotlights sweeping up from the floor. A snooze swings them all in gold, a jackpot in
          every colour and faster still; bankrupt makes each one sputter and go out. */}
      {BEAMS.slice(0, beams).map((b, i) => (
        <Animated.View
          key={i}
          entering={FadeIn.duration(600)}
          exiting={FadeOut.duration(600)}
          style={{
            position: 'absolute',
            bottom: 0,
            left: (b.x / 100) * width - bw / 2,
            width: bw,
            height: bh,
            mixBlendMode: 'screen',
          }}
        >
          <Animated.View
            style={{
              flex: 1,
              opacity: bankrupt ? 0.7 : r2(0.28 + hot * 0.6),
              transitionProperty: 'opacity',
              transitionDuration: 600,
            }}
          >
            <Animated.View
              style={[
                { flex: 1 },
                bankrupt && {
                  animationName: BEAM_DIE,
                  animationDuration: '1.3s',
                  animationTimingFunction: 'linear',
                  animationDelay: `${r2(i * 0.2)}s`,
                  animationFillMode: 'forwards',
                },
              ]}
            >
              <Animated.View
                style={{
                  flex: 1,
                  transformOrigin: ['50%', '100%', 0],
                  transform: [{ rotate: `${b.from}deg` }],
                  animationName: SWEEPS[i],
                  animationDuration: `${payout ? r2(b.dur * (mood === 'jackpot' ? 0.3 : 0.45)) : b.dur}s`,
                  animationDelay: `${b.delay}s`,
                  animationIterationCount: 'infinite',
                  animationTimingFunction: 'ease-in-out',
                }}
              >
                <Lowres w={bw} h={bh} k={3}>
                  <Cone
                    id={`beam${i}`}
                    w={bw}
                    h={bh}
                    rgb={mood === 'win' ? GOLD : b.rgb}
                    layers={BEAM_LAYERS}
                    fade={BEAM_FADE}
                  />
                </Lowres>
              </Animated.View>
            </Animated.View>
          </Animated.View>
        </Animated.View>
      ))}

      {/* Sparkle, more of it the higher the bet */}
      {SPARKS.map((s, i) =>
        s.order < sparksOut ? (
          <Animated.View
            key={i}
            entering={FadeIn.duration(400)}
            exiting={FadeOut.duration(400)}
            style={{ position: 'absolute', left: (s.x / 100) * width, top: (s.y / 100) * height, width: s.s, height: s.s }}
          >
            <Animated.View
              style={{
                flex: 1,
                opacity: 0,
                animationName: GLINT,
                animationDuration: `${s.dur}s`,
                animationDelay: `${s.delay}s`,
                animationIterationCount: 'infinite',
                animationTimingFunction: 'ease-in-out',
              }}
            >
              <Svg viewBox="-6 -6 36 36" width={s.s * 1.5} height={s.s * 1.5} style={{ margin: -s.s * 0.25 }}>
                {/* A soft halo standing in for the web's drop-shadow glow */}
                <Path d={SPARKLE} fill={s.color} opacity={0.3} transform="translate(-3 -3) scale(1.25)" />
                <Path d={SPARKLE} fill={s.color} />
              </Svg>
            </Animated.View>
          </Animated.View>
        ) : null,
      )}

      {/* Chips and coins drifting at the edges, from "Free spin" up */}
      {tokens.map(({ tk, i }) => {
        const size = tk.size * TOKEN_SCALE;
        return (
          <Animated.View
            key={i}
            entering={FadeInUp.springify().stiffness(160).damping(18)}
            exiting={FadeOutDown.duration(250)}
            style={{
              position: 'absolute',
              left: (tk.x / 100) * width - size / 2,
              top: (tk.y / 100) * height - size / 2,
              width: size,
              height: size,
            }}
          >
            {/* Off the table: each one drops out of the bottom, tumbling */}
            <Animated.View
              style={[
                { flex: 1, opacity: 0.92 },
                bankrupt && {
                  animationName: FALLS[i],
                  animationDuration: '1.2s',
                  animationTimingFunction: FALL_EASE,
                  animationDelay: `${r2(0.25 + (i % 5) * 0.1)}s`,
                  animationFillMode: 'forwards',
                },
              ]}
            >
              <Animated.View
                style={{
                  flex: 1,
                  transform: [{ rotate: `${tk.tilt}deg` }],
                  // A payout gets them bouncing
                  ...loop(FLOATS[i], payout ? r2(tk.dur * 0.3) : tk.dur, { delay: tk.delay }),
                }}
              >
                <Animated.View
                  style={[
                    { flex: 1, borderRadius: isRound(tk.kind) ? size / 2 : 0 },
                    // A soft shadow under the round ones (the web's drop-shadow)
                    isRound(tk.kind) && { boxShadow: `0 ${8 * TOKEN_SCALE}px ${10 * TOKEN_SCALE}px rgba(10,2,20,0.45)` },
                    tk.kind === 'coin' && loop(COIN_FLIP, r2(tk.dur * 0.7), { delay: tk.delay }),
                  ]}
                >
                  <TokenArt kind={tk.kind} size={size} />
                </Animated.View>
              </Animated.View>
            </Animated.View>
          </Animated.View>
        );
      })}

      {/* Payout: a shower of coins on a snooze or a jackpot (twice through, then it settles) */}
      {payout && (
        <Animated.View exiting={FadeOut.duration(400)} style={StyleSheet.absoluteFill}>
          {RAIN.map((c, i) => (
            <Animated.View
              key={i}
              style={{
                position: 'absolute',
                left: (c.x / 100) * width,
                top: -40,
                width: c.size,
                height: c.size,
                opacity: 0,
                animationName: rainFall[c.spin > 0 ? 0 : 1],
                animationDuration: `${c.dur}s`,
                animationTimingFunction: RAIN_EASE,
                animationDelay: `${c.delay}s`,
                animationIterationCount: 2,
                animationFillMode: 'both',
              }}
            >
              <Animated.View
                style={[
                  { flex: 1 },
                  c.kind === 'coin' && loop(COIN_FLIP, r2(0.5 + (i % 4) * 0.12), { ease: 'linear' }),
                ]}
              >
                <TokenArt kind={c.kind} size={c.size} />
              </Animated.View>
            </Animated.View>
          ))}
        </Animated.View>
      )}

      {/* Bankrupt: the room goes dark round the edges */}
      <View
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(ellipse 80% 70% at 50% 45%, transparent 30%, rgba(8,2,14,0.55) 100%)',
          opacity: bankrupt ? 1 : 0,
          transitionProperty: 'opacity',
          transitionDuration: 700,
        }}
      />

      {/* ...and once the spotlights are out, one cold light clunks on overhead */}
      {bankrupt && (
        <Animated.View
          exiting={FadeOut.duration(300)}
          style={{ position: 'absolute', top: 0, left: width / 2 - lw / 2, width: lw, height: lh, mixBlendMode: 'screen' }}
        >
          <Animated.View
            style={{
              flex: 1,
              opacity: 0,
              animationName: LONE_ON,
              animationDuration: '0.5s',
              animationDelay: '1.5s',
              animationFillMode: 'forwards',
            }}
          >
            <Lowres w={lw} h={lh} k={2}>
              <Cone id="lone" w={lw} h={lh} rgb="214,205,255" layers={LONE_LAYERS} fade={LONE_FADE} down />
            </Lowres>
          </Animated.View>
        </Animated.View>
      )}
    </View>
  );
}

/* ---------------- The sunburst behind the dial ---------------- */

/** The burst's wedges: 7.5° on, 7.5° off, all the way round. */
const BURST = 1000;
const BURST_RAYS = rays(BURST / 2, BURST / 2, BURST / 2, 24, 7.5, 15);

/**
 * Prize wheel's counterpart to Classic's sun rays: a game-show sunburst behind the dial. Its
 * wedges turn violet → pink → gold and spin faster the bigger the bet, so dragging the bell
 * winds the wheel up. The rotation is accumulated per frame (not a CSS animation), so changing
 * speed never jumps. Fades out while the alarm is set.
 */
export function WheelBurst({ p, range, visible, size }: BackdropProps) {
  const reduce = useReducedMotion();
  const angle = useSharedValue(0);
  // Degrees per second: a slow turn even at the full 45
  const speed = useSharedValue(4);

  useEffect(() => {
    speed.set(4 + p * p * 20);
  }, [p, speed]);

  const frame = useFrameCallback((f) => {
    const dt = f.timeSincePreviousFrame ?? 0;
    angle.set((angle.get() + (dt / 1000) * speed.get()) % 360);
  }, false);

  // Only turn while it can be seen
  useEffect(() => {
    frame.setActive(visible && !reduce);
  }, [frame, visible, reduce]);

  const spin = useAnimatedStyle(() => ({ transform: [{ rotate: `${angle.get()}deg` }] }));

  const core = rampN(['#8C4DFF', '#D94FC8', '#FF9F3D'], p);
  const tone = rampN(['#B48CFF', '#FF7FD0', '#FFC860'], p);
  const allIn = range === MAX_RANGE;
  const box = size * 1.9;
  // The web's mask (clear inside half the radius, solid at 57%, 45% at 80%, gone at the edge)
  // folded into the wedges' fill
  const fade = (a: number) =>
    [
      [0.5, 0],
      [0.57, a],
      [0.8, a * 0.45],
      [1, 0],
    ] as const;

  return (
    <View
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
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: box / 2,
          backgroundImage: `radial-gradient(circle, ${cssA(core, 0.4)} 0%, ${cssA(core, 0.14)} 36%, ${cssA(core, 0)} 62%)`,
          opacity: r2(0.55 + p * 0.45),
        }}
      />
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { opacity: r2(0.45 + p * 0.55), transitionProperty: 'opacity', transitionDuration: 300 },
          allIn && loop(KF.pulse, 1.2),
        ]}
      >
        <Animated.View style={[{ width: box, height: box }, spin]}>
          <Lowres w={box} h={box} k={2}>
            <G transform={`scale(${box / BURST})`}>
              <Defs>
                {(['on', 'off'] as const).map((k) => (
                  <RadialGradient
                    key={k}
                    id={`burst-${k}`}
                    cx={BURST / 2}
                    cy={BURST / 2}
                    r={BURST / 2}
                    gradientUnits="userSpaceOnUse"
                  >
                    {fade(k === 'on' ? 0.22 : 0.04).map(([o, a]) => (
                      <Stop key={o} offset={o} stopColor={cssA(tone, 1)} stopOpacity={a} />
                    ))}
                  </RadialGradient>
                ))}
              </Defs>
              <Rect width={BURST} height={BURST} rx={BURST / 2} fill="url(#burst-off)" />
              <Path d={BURST_RAYS} fill="url(#burst-on)" />
            </G>
          </Lowres>
        </Animated.View>
      </Animated.View>
    </View>
  );
}
