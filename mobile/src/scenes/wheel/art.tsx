/**
 * Prize wheel's illustrations, ported from web/src/components/scenes/wheel-art.tsx: the dial's
 * wheel face and pointer, Lucky the mascot, and the little wheel spun during the draw. The
 * floating chips, coins and charms come straight from art/wheel via <Art>.
 */
import { memo, useEffect, useState } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useAnimatedReaction,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  type SharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, Ellipse, G, Line, LinearGradient, Path, RadialGradient, Stop, Text } from 'react-native-svg';

import { ROLL_BAR_MS } from '@/lib/roll';
import { Art, type ArtKey } from '@/scenes/art';
import type { DialLayerProps } from '@/scenes/types';
import { sans } from '@/themes/fonts';
import { MAX_RANGE } from '@/themes/themes';

/** A four-point sparkle on a 24-unit grid. */
export const SPARKLE = 'M12 0C12.8 7 17 11.2 24 12 17 12.8 12.8 17 12 24 11.2 17 7 12.8 0 12 7 11.2 11.2 7 12 0z';


const AnimatedG = Animated.createAnimatedComponent(G);
const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/** CSS ease-out. */
const EASE_OUT = Easing.bezier(0, 0, 0.58, 1);

/* ---------------- Tokens: chips, coins and charms that float round the room ---------------- */

export type TokenKind =
  | 'pink'
  | 'violet'
  | 'mint'
  | 'coin'
  | 'die'
  | 'cherries'
  | 'horseshoe'
  | 'clover'
  | 'star'
  | 'ticket';

const TOKEN_ART: Record<TokenKind, ArtKey> = {
  pink: 'wheel/chip-pink',
  violet: 'wheel/chip-violet',
  mint: 'wheel/chip-mint',
  coin: 'wheel/coin',
  die: 'wheel/token-die',
  cherries: 'wheel/token-cherries',
  horseshoe: 'wheel/token-horseshoe',
  clover: 'wheel/token-clover',
  star: 'wheel/token-star',
  ticket: 'wheel/token-ticket',
};

/** Round tokens (chips and coins), which can cast a round shadow. */
export const isRound = (k: TokenKind) => k === 'pink' || k === 'violet' || k === 'mint' || k === 'coin';

/** One token's art (art/wheel/chip-*, coin, token-*), on a 64-unit grid. */
export const TokenArt = memo(function TokenArt({ kind, size }: { kind: TokenKind; size: number }) {
  return <Art name={TOKEN_ART[kind]} width={size} height={size} />;
});

/* ---------------- Lucky, the mascot ---------------- */

/** Lucky's coin and cheeks: the same in every face (art/wheel/lucky-*.svg, 180-unit grid). */
const LUCKY_COIN = (
  <>
    <Circle cx="90" cy="90" r="52" fill="#E3921A" />
    <Circle cx="90" cy="90" r="45" fill="#FFC93D" />
    <Path d="M 49.8 69.8 A 45 45 0 0 1 130.2 69.8 Q 90 80 49.8 69.8 Z" fill="#FFE38A" />
    <Path
      d="M 128 90 A 38 38 0 1 1 52 90 A 38 38 0 1 1 128 90 Z M 126 90 A 36 36 0 1 0 54 90 A 36 36 0 1 0 126 90 Z"
      fill="#E3921A"
      fillRule="evenodd"
    />
    <Ellipse cx="64" cy="105" rx="7" ry="4" fill="#F4A98B" />
    <Ellipse cx="116" cy="105" rx="7" ry="4" fill="#F4A98B" />
  </>
);

const LUCKY_EYES = (
  <>
    <Circle cx="74" cy="95" r="4.2" fill="#2A0C40" />
    <Circle cx="106" cy="95" r="4.2" fill="#2A0C40" />
  </>
);

/** One face per bet tier: asleep, curious, happy, excited, nervous, ecstatic. */
const LUCKY_FACES = [
  // No spin: asleep
  <>
    <Path
      d="M 66 92 Q 74 100 82 92 Q 83 91 84 93 Q 75 106 65 94 Q 64 92 66 92 Z M 98 92 Q 106 100 114 92 Q 116 91 116 94 Q 106 106 97 94 Q 96 92 98 92 Z"
      fill="#2A0C40"
    />
    <Ellipse cx="90" cy="113" rx="2.8" ry="3.3" fill="#2A0C40" />
  </>,
  // Free spin: just woken, curious
  <>
    {LUCKY_EYES}
    <Ellipse cx="90" cy="113" rx="4" ry="5" fill="#2A0C40" />
  </>,
  // Round and round: happy
  <>
    {LUCKY_EYES}
    <Path d="M 79 109 Q 90 120 101 109 Q 103 108 103 111 Q 90 127 77 111 Q 77 108 79 109 Z" fill="#2A0C40" />
  </>,
  // Bonus round: sparkly-eyed
  <>
    <Ellipse cx="74" cy="95" rx="6.5" ry="7" fill="#2A0C40" />
    <Ellipse cx="106" cy="95" rx="6.5" ry="7" fill="#2A0C40" />
    <Path d="M 73 90 Q 73.6 92.4 76 93 Q 73.6 93.6 73 96 Q 72.4 93.6 70 93 Q 72.4 92.4 73 90 Z" fill="#FFF4E0" />
    <Path d="M 105 90 Q 105.6 92.4 108 93 Q 105.6 93.6 105 96 Q 104.4 93.6 102 93 Q 104.4 92.4 105 90 Z" fill="#FFF4E0" />
    <Path d="M 77 109 Q 90 114 103 109 C 102 132 78 132 77 109 Z" fill="#2A0C40" />
    <Path d="M 83 121 Q 90 115 97 121 Q 90 129 83 121 Z" fill="#F0478A" />
  </>,
  // High stakes: nervous, glancing sideways, sweating
  <>
    <Circle cx="71" cy="95" r="4.2" fill="#2A0C40" />
    <Circle cx="103" cy="95" r="4.2" fill="#2A0C40" />
    <Path
      d="M 78 113 Q 77 111 79 111 L 85 115 L 91 111 L 97 115 L 102 112 Q 104 111 104 113 L 98 119 Q 97 120 96 119 L 91 115 L 86 119 Q 85 120 84 119 Z"
      fill="#2A0C40"
    />
    <Path d="M 124 82 C 123 88 117 93 118 98 C 119 106 130 106 131 98 C 132 93 126 88 124 82 Z" fill="#FFF4E0" />
  </>,
  // Mega jackpot: ecstatic, with sparkles
  <>
    <Path
      d="M 65 96 Q 74 81 83 96 Q 84 99 81 99 Q 74 88 67 99 Q 64 99 65 96 Z M 97 96 Q 106 81 115 96 Q 116 99 113 99 Q 106 88 99 99 Q 96 99 97 96 Z"
      fill="#2A0C40"
    />
    <Path d="M 74 108 Q 90 115 106 108 C 105 138 75 138 74 108 Z" fill="#2A0C40" />
    <Path d="M 80 124 Q 90 113 100 124 Q 90 135 80 124 Z" fill="#F0478A" />
    <Path d="M 40 39 Q 41.2 43.8 46 45 Q 41.2 46.2 40 51 Q 38.8 46.2 34 45 Q 38.8 43.8 40 39 Z" fill="#FFC93D" />
    <Path d="M 143 47 Q 144.6 53.4 151 55 Q 144.6 56.6 143 63 Q 141.4 56.6 135 55 Q 141.4 53.4 143 47 Z" fill="#FFC93D" />
    <Path d="M 142 127 Q 143 131 147 132 Q 143 133 142 137 Q 141 133 137 132 Q 141 131 142 127 Z" fill="#FFC93D" />
  </>,
];

/**
 * Lucky, Prize wheel's mascot: a gold coin whose face changes with the bet tier. Shown beside
 * the tier name in place of the line icon. Sized to the coin (the web crops its view to
 * 26..154); the jackpot sparkles spill past the box.
 */
export const LuckyFace = memo(function LuckyFace({ tier, size }: { tier: number; size: number }) {
  // The whole 180-unit drawing, scaled so its 128-unit coin fills `size`
  const full = (size * 180) / 128;
  const off = (-size * 26) / 128;
  return (
    <View style={{ width: size, height: size, overflow: 'visible' }}>
      <Svg viewBox="0 0 180 180" width={full} height={full} style={{ position: 'absolute', left: off, top: off }}>
        {LUCKY_COIN}
        {LUCKY_FACES[Math.max(0, Math.min(LUCKY_FACES.length - 1, tier))]}
      </Svg>
    </View>
  );
});

/* ---------------- The dial's wheel face ---------------- */

/** The dial's own grid (the core dial lays everything out in a 358-unit square). */
const C = 358 / 2;
/** One wedge per five minutes: nine of them, so every wedge edge sits on a long minute tick. */
const WEDGE_MIN = 5;
const WEDGES = MAX_RANGE / WEDGE_MIN;
const WEDGE_DEG = (360 / MAX_RANGE) * WEDGE_MIN;
/** The hub the time sits on (the time button is 95 across from the centre). */
const HUB_R = 97;
const IN_R = 99;
/** Just inside the bet track (148 ± 13). */
const OUT_R = 134;
const LABEL_R = 107;
/** The gold rim the marquee bulbs sit on (bulbs are at 171), kept clear of the track's outer edge (161). */
const RIM_R = 172;
const RIM_W = 11;

const r3 = (n: number) => Math.round(n * 1000) / 1000;

function pt(deg: number, r: number): [number, number] {
  const a = (deg * Math.PI) / 180;
  return [r3(C + r * Math.sin(a)), r3(C - r * Math.cos(a))];
}

function wedgePath(a1: number, a2: number, r1: number, r2: number) {
  const [x1, y1] = pt(a1, r2);
  const [x2, y2] = pt(a2, r2);
  const [x3, y3] = pt(a2, r1);
  const [x4, y4] = pt(a1, r1);
  return `M${x1} ${y1}A${r2} ${r2} 0 0 1 ${x2} ${y2}L${x3} ${y3}A${r1} ${r1} 0 0 0 ${x4} ${y4}z`;
}

/**
 * Wedge colours, dim until the bet reaches them. The last wedge (40–45 min) is the jackpot.
 * Lit wedges shade from `deep` at the hub out to `hi` at the rim, like a lacquered wheel.
 * `halo` outlines the number so it reads on any wedge; `glint` colours the sparkles beside it.
 */
const WEDGE = {
  a: {
    deep: '#6A2FCF',
    on: '#8E4BE6',
    hi: '#B47EFF',
    off: '#3A1858',
    ink: '#FFFFFF',
    dimInk: 'rgba(255,244,224,0.8)',
    halo: 'rgba(36,6,58,0.6)',
    glint: '#FFE38A',
  },
  b: {
    deep: '#A13BB8',
    on: '#C957D9',
    hi: '#EF8EF5',
    off: '#4C1C66',
    ink: '#FFFFFF',
    dimInk: 'rgba(255,244,224,0.8)',
    halo: 'rgba(60,8,70,0.6)',
    glint: '#FFF4E0',
  },
  // Unlit, it stays in the plum family with a gold number, so it doesn't go muddy
  jackpot: {
    deep: '#F09A1A',
    on: '#FFC93D',
    hi: '#FFE98F',
    off: '#46183F',
    ink: '#4A1A06',
    dimInk: '#FFC93D',
    halo: 'rgba(255,240,190,0.55)',
    glint: '#B8570E',
  },
} as const;

/** The wedge ring as one shape (rim to hub), for the gloss laid over every wedge. */
const RING = [OUT_R, IN_R]
  .map((r) => `M${C - r} ${C}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0z`)
  .join('');

const WEDGE_LIST = Array.from({ length: WEDGES }, (_, k) => {
  const a1 = k * WEDGE_DEG;
  const mid = a1 + WEDGE_DEG / 2;
  const [lx, ly] = pt(mid, LABEL_R);
  return {
    k,
    kind: (k === WEDGES - 1 ? 'jackpot' : k % 2 ? 'b' : 'a') as keyof typeof WEDGE,
    d: wedgePath(a1, a1 + WEDGE_DEG, IN_R, OUT_R),
    label: String((k + 1) * WEDGE_MIN),
    lx,
    ly,
    // Labels lean with their wedge, but the bottom ones turn round so nothing reads upside down
    rot: r3(mid > 90 && mid < 270 ? mid + 180 : mid),
    edge: [pt(a1, IN_R), pt(a1, OUT_R)] as const,
    // A sparkle either side of the number
    glints: [pt(mid - 13, LABEL_R), pt(mid + 13, LABEL_R)] as const,
    peg: pt(a1, OUT_R - 3.5),
  };
});

/**
 * lc-wedge-flash: a white flash over a wedge as it comes on (0.55 → 0 in 0.45 s). Driven by an
 * animated prop: Reanimated's CSS keyframes don't reach SVG opacity reliably.
 */
function WedgeFlash({ d }: { d: string }) {
  const o = useSharedValue(0.55);
  useEffect(() => {
    o.set(withTiming(0, { duration: 450, easing: EASE_OUT }));
  }, [o]);
  const animatedProps = useAnimatedProps(() => ({ opacity: o.get() }));
  return <AnimatedPath d={d} fill="#FFFFFF" animatedProps={animatedProps} />;
}

/** The numbers sit on their label point: SVG text has no central baseline here, so nudge down. */
const LABEL_SIZE = 13;
const LABEL_DY = LABEL_SIZE * 0.36;

/**
 * Prize wheel's dial face, drawn under the minute ticks: a gold rim for the marquee bulbs,
 * nine wedges that light up as the bet reaches them (a white flash as each one comes on),
 * gold pegs on the wedge edges, and a hub for the time to sit on.
 */
export function WheelFace({ range }: DialLayerProps) {
  return (
    <G>
      <Defs>
        <LinearGradient id="lc-wheel-rim" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#FFE38A" />
          <Stop offset="0.5" stopColor="#F7B33B" />
          <Stop offset="1" stopColor="#C9761A" />
        </LinearGradient>
        <RadialGradient id="lc-wheel-hub" cx="50%" cy="36%" r="70%">
          <Stop offset="0" stopColor="#4A1868" />
          <Stop offset="1" stopColor="#22083A" />
        </RadialGradient>
        {(['a', 'b', 'jackpot'] as const).map((kind) => (
          <RadialGradient key={kind} id={`lc-wedge-${kind}`} cx={C} cy={C} r={OUT_R} gradientUnits="userSpaceOnUse">
            <Stop offset={r3(IN_R / OUT_R)} stopColor={WEDGE[kind].deep} />
            <Stop offset="0.86" stopColor={WEDGE[kind].on} />
            <Stop offset="1" stopColor={WEDGE[kind].hi} />
          </RadialGradient>
        ))}
        {/* Light from above: a sheen over the top of the wheel, a little shade under it */}
        <LinearGradient id="lc-wheel-gloss" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.26" />
          <Stop offset="0.45" stopColor="#FFFFFF" stopOpacity="0" />
          <Stop offset="0.7" stopColor="#14021F" stopOpacity="0" />
          <Stop offset="1" stopColor="#14021F" stopOpacity="0.28" />
        </LinearGradient>
      </Defs>

      {/* A dark channel between the track and the rim, so a gold arc never runs into the gold rim */}
      <Circle
        cx={C}
        cy={C}
        r={(161 + RIM_R - RIM_W / 2) / 2}
        fill="none"
        stroke="#16052A"
        strokeWidth={RIM_R - RIM_W / 2 - 161}
      />
      <Circle cx={C} cy={C} r={RIM_R} fill="none" stroke="url(#lc-wheel-rim)" strokeWidth={RIM_W} />
      {[RIM_R - RIM_W / 2, RIM_R + RIM_W / 2].map((r) => (
        <Circle key={r} cx={C} cy={C} r={r} fill="none" stroke="rgba(90,36,0,0.45)" strokeWidth={1} />
      ))}

      {WEDGE_LIST.map((w) => {
        const lit = range > w.k * WEDGE_MIN;
        return (
          <G key={w.k}>
            <Path d={w.d} fill={lit ? `url(#lc-wedge-${w.kind})` : WEDGE[w.kind].off} />
            {lit && (
<WedgeFlash d={w.d} />
            )}
          </G>
        );
      })}
      <Path d={RING} fillRule="evenodd" fill="url(#lc-wheel-gloss)" />

      {WEDGE_LIST.map((w) => {
        const lit = range > w.k * WEDGE_MIN;
        const tone = WEDGE[w.kind];
        const label = {
          x: w.lx,
          y: w.ly + LABEL_DY,
          textAnchor: 'middle',
          transform: `rotate(${w.rot} ${w.lx} ${w.ly})`,
          fontSize: LABEL_SIZE,
          fontFamily: sans(800),
          letterSpacing: -0.26,
        } as const;
        return (
          <G key={w.k}>
            {w.glints.map(([x, y], i) => (
              <Path
                key={i}
                d={SPARKLE}
                fill={tone.glint}
                opacity={lit ? 0.95 : 0.22}
                transform={`translate(${r3(x - 3.6)} ${r3(y - 3.6)}) scale(0.3)`}
              />
            ))}
            {/* A soft outline under the number, so it reads on the bright and the dim wedges alike */}
            <Text
              {...label}
              fill="none"
              stroke={lit ? tone.halo : 'rgba(20,4,32,0.55)'}
              strokeWidth={3}
              strokeLinejoin="round"
            >
              {w.label}
            </Text>
            <Text {...label} fill={lit ? tone.ink : tone.dimInk}>
              {w.label}
            </Text>
          </G>
        );
      })}

      {WEDGE_LIST.map(({ k, edge: [[x1, y1], [x2, y2]] }) => (
        <Line key={k} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(22,5,36,0.6)" strokeWidth={1.5} />
      ))}
      {WEDGE_LIST.map(({ k, peg: [x, y] }) => (
        <Circle key={k} cx={x} cy={y} r={2.4} fill="#FFE38A" stroke="#B8741A" strokeWidth={0.8} />
      ))}

      <Circle cx={C} cy={C} r={HUB_R} fill="url(#lc-wheel-hub)" stroke="#FFC93D" strokeWidth={3} />
      <Circle cx={C} cy={C} r={HUB_R - 6} fill="none" stroke="rgba(255,201,61,0.18)" strokeWidth={1} />
    </G>
  );
}

/** The pointer (art/wheel/pointer.svg), on its own 40 × 52 grid. */
function PointerArt({ highlight = true }: { highlight?: boolean }) {
  return (
    <>
      <Circle cx="20" cy="17" r="13" fill="#FFC93D" />
      <Path d="M 8.3 22.6 H 31.7 L 20 49 Z" fill="#FFC93D" />
      <Path d="M 20 4 A 13 13 0 0 1 20 30 Z M 20 17 L 31.7 22.6 L 20 49 Z" fill="#E3921A" />
      {highlight && <Path d="M 9.2 15.5 C 10.2 9.5 14.8 6 20 6 V 9 C 16 9 12.7 11.8 11.8 15.8 Z" fill="#FFE38A" />}
      <Circle cx="20" cy="17" r="5" fill="#FFF4E0" />
      <Circle cx="20" cy="17" r="2.2" fill="#E3921A" />
    </>
  );
}

/** The pointer's silhouette, for its shadow (iOS SVG has no drop-shadow filter). */
const POINTER_SHADOW =
  'M 33 17 A 13 13 0 0 0 7 17 A 13 13 0 0 0 8.3 22.6 L 20 49 L 31.7 22.6 A 13 13 0 0 0 33 17 Z';


/**
 * The gold pointer at 12 o'clock (art/wheel/pointer.svg). It flicks on every minute of the
 * bet, like the flapper on a prize wheel clacking over the pegs, back and forth.
 */
export function WheelPointer({ range }: DialLayerProps) {
  const flick = useSharedValue(0);

  useEffect(() => {
    // lc-flick: out to ±12° in the first 35% of 0.28 s, then back
    flick.set(
      withSequence(
        withTiming(range % 2 ? -12 : 12, { duration: 98, easing: EASE_OUT }),
        withTiming(0, { duration: 182, easing: EASE_OUT }),
      ),
    );
  }, [range, flick]);

  // SVG groups only take a transform matrix natively: rotate about the pivot at (20, 17)
  const animatedProps = useAnimatedProps(() => {
    const a = (flick.get() * Math.PI) / 180;
    const c = Math.cos(a);
    const s = Math.sin(a);
    return { matrix: [c, s, -s, c, 20 - c * 20 + s * 17, 17 - s * 20 - c * 17] };
  });

  return (
    <G transform={`translate(${C - 20} -19)`}>
      <AnimatedG animatedProps={animatedProps as never}>
        <Path d={POINTER_SHADOW} fill="rgba(20,4,30,0.28)" transform="translate(0 3)" />
        <PointerArt />
      </AnimatedG>
    </G>
  );
}

/* ---------------- The draw: a little wheel spun hard ---------------- */

/** The mini wheel's centre, on a 100 × 106 grid with the pointer above it. */
const MC = [50, 58] as const;

function mpt(deg: number, r: number): [number, number] {
  const a = (deg * Math.PI) / 180;
  return [r3(MC[0] + r * Math.sin(a)), r3(MC[1] - r * Math.cos(a))];
}

const MINI_WEDGES = WEDGE_LIST.map((w) => {
  const a1 = w.k * WEDGE_DEG;
  const [x1, y1] = mpt(a1, 39);
  const [x2, y2] = mpt(a1 + WEDGE_DEG, 39);
  const [x3, y3] = mpt(a1 + WEDGE_DEG, 11);
  const [x4, y4] = mpt(a1, 11);
  return {
    k: w.k,
    kind: w.kind,
    d: `M${x1} ${y1}A39 39 0 0 1 ${x2} ${y2}L${x3} ${y3}A11 11 0 0 0 ${x4} ${y4}z`,
    edge: [mpt(a1, 11), mpt(a1, 39)] as const,
    peg: mpt(a1, 36),
  };
});

const MINI_BULBS = Array.from({ length: 12 }, (_, i) => ({ i, at: mpt(i * 30 + 15, 44) }));

/**
 * The bulbs round the mini wheel chase (lc-bulb-chase: on for the first 30% of each 0.45 s,
 * then dim), every third one together. One shared clock drives all twelve.
 */
const CHASE_S = 0.45;

function Bulb({ i, x, y, clock }: { i: number; x: number; y: number; clock: SharedValue<number> }) {
  // The web's delay, -((3 - i % 3) % 3) × 0.15 s, as a share of the cycle
  const phase = (((3 - (i % 3)) % 3) * 0.15) / CHASE_S;
  const animatedProps = useAnimatedProps(() => {
    const t = (clock.get() + phase) % 1;
    const opacity = t <= 0.3 ? 1 : t >= 0.36 ? 0.38 : 1 - ((t - 0.3) / 0.06) * 0.62;
    return { opacity };
  });
  return <AnimatedCircle cx={x} cy={y} r={1.9} fill={i % 2 ? '#FF8FD2' : '#FFF8E1'} animatedProps={animatedProps} />;
}

/** The roll's height in pt (the web draws it 72px tall). */
const ROLL_H = 72;
const K = ROLL_H / 106;
const ROLL_W = 100 * K;

/**
 * Prize wheel's show while the draw rolls: a little prize wheel spun hard, slowing to a stop as
 * the bar fills, its pointer clacking over every peg and the bulbs chasing round the rim.
 */
export function WheelRoll() {
  const reduce = useReducedMotion();
  // Three to four turns, finishing with the progress bar (it starts 250ms late)
  const [total] = useState(() => 1080 + Math.random() * 360);
  const angle = useSharedValue(0);
  const flap = useSharedValue(0);
  const chase = useSharedValue(0);

  useEffect(() => {
    angle.set(withTiming(total, { duration: ROLL_BAR_MS, easing: Easing.out(Easing.cubic) }));
    chase.set(withRepeat(withTiming(1, { duration: CHASE_S * 1000, easing: Easing.linear }), -1));
  }, [angle, chase, total]);

  // Each peg that passes knocks the pointer aside
  useAnimatedReaction(
    () => Math.floor(angle.get() / WEDGE_DEG),
    (next, prev) => {
      if (prev !== null && next !== prev) {
        flap.set(withSequence(withTiming(-24, { duration: 80, easing: EASE_OUT }), withTiming(0, { duration: 80 })));
      }
    },
  );

  // With reduced motion it holds still, but the pointer still clacks out the draw
  const spin = useAnimatedStyle(() => ({ transform: [{ rotate: `${reduce ? 0 : angle.get()}deg` }] }));
  const flapStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${reduce ? 0 : flap.get()}deg` }] }));

  // The spinning part is its own view, so it turns on the UI thread
  const spinBox = 39 * 2 * K;
  // The flapper: art/wheel/pointer.svg at half size, hinged on its pin
  const flapW = 40 * 0.5 * K;
  const flapH = 52 * 0.5 * K;

  return (
    <View style={{ width: ROLL_W, height: ROLL_H, marginBottom: 6 }}>
      <Svg viewBox="0 0 100 106" width={ROLL_W} height={ROLL_H} style={{ position: 'absolute' }}>
        <Circle cx={MC[0]} cy={MC[1]} r={50} fill="rgba(255,201,61,0.16)" />
      </Svg>
      <Animated.View
        style={[
          { position: 'absolute', left: MC[0] * K - spinBox / 2, top: MC[1] * K - spinBox / 2, width: spinBox, height: spinBox },
          spin,
        ]}
      >
        <Svg viewBox={`${MC[0] - 39} ${MC[1] - 39} 78 78`} width={spinBox} height={spinBox}>
          {MINI_WEDGES.map((w) => (
            <Path key={w.k} d={w.d} fill={WEDGE[w.kind].on} />
          ))}
          {MINI_WEDGES.map(({ k, edge: [[x1, y1], [x2, y2]] }) => (
            <Line key={k} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(22,5,36,0.55)" strokeWidth={1} />
          ))}
          {MINI_WEDGES.map(({ k, peg: [x, y] }) => (
            <Circle key={k} cx={x} cy={y} r={1.6} fill="#FFE38A" />
          ))}
        </Svg>
      </Animated.View>
      <Svg viewBox="0 0 100 106" width={ROLL_W} height={ROLL_H} style={{ position: 'absolute' }}>
        <Circle cx={MC[0]} cy={MC[1]} r={40.5} fill="none" stroke="#16052A" strokeWidth={3} />
        <Circle cx={MC[0]} cy={MC[1]} r={44} fill="none" stroke="#FFC93D" strokeWidth={6} />
        <Circle cx={MC[0]} cy={MC[1]} r={47} fill="none" stroke="#C9761A" strokeWidth={1} />
        {MINI_BULBS.map(({ i, at: [x, y] }) => (
          <Bulb key={i} i={i} x={x} y={y} clock={chase} />
        ))}
        <Circle cx={MC[0]} cy={MC[1]} r={11} fill="#2A0C40" stroke="#FFC93D" strokeWidth={2.5} />
        <Path d={SPARKLE} fill="#FFC93D" transform={`translate(${MC[0] - 5} ${MC[1] - 5}) scale(0.4167)`} />
      </Svg>
      <Animated.View
        style={[
          {
            position: 'absolute',
            left: 40 * K,
            top: 4.5 * K,
            width: flapW,
            height: flapH,
            // Hinged on the pin (art/wheel/pointer.svg's circle centre)
            transformOrigin: ['50%', `${(17 / 52) * 100}%`, 0],
          },
          flapStyle,
        ]}
      >
        <Svg viewBox="0 0 40 52" width={flapW} height={flapH}>
          <Path d={POINTER_SHADOW} fill="rgba(20,4,30,0.35)" transform="translate(0 2)" />
          <PointerArt highlight={false} />
        </Svg>
      </Animated.View>
    </View>
  );
}
