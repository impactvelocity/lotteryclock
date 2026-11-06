/**
 * Poker's background, ported from web/src/components/scenes/poker-scene.tsx: a card table under
 * a lamp that gets hotter as the bet grows.
 *
 *   0 min     check: a quiet table, a couple of short stacks
 *   1–11      small blind: the first chips go in
 *   12–23     call: the stacks grow
 *   24–35     raise: the stacks grow tall, the lamp warms
 *   36–44     re-raise: the edges of the room go dark
 *   45        all in: every stack at full height
 *
 * A snooze bursts the pot back out at you (a fountain of chips from behind the dial, PotLight);
 * a late result busts you (the lamp dims a touch and your stacks topple); right on time splits
 * the pot (the burst flies both ways evenly).
 *
 * Laid out like the web hero on a phone, where the side labels and the status fill the width:
 * the felt and its padded rail, and one stack tucked against each edge beside the dial (the web
 * leaves its deck, dealer button, hole cards and loose chips off phones). The web's turbulence
 * noise (felt nap, wood pores) is a tile of seeded specks here. Purely decorative and
 * pointer-transparent.
 */
import { memo, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { css, FadeOut, useReducedMotion } from 'react-native-reanimated';
import Svg, { ClipPath, Defs, Ellipse, G, Path, Pattern, RadialGradient, Rect, Stop } from 'react-native-svg';

import { KF, loop } from '@/scenes/anim';
import type { BackdropProps, DialSpot, SceneProps } from '@/scenes/types';
import { frac } from '@/lib/rand';
import { css as rgb, cssA, MAX_RANGE, rampN } from '@/themes/themes';

import { ChipFace, ChipStack, type ChipColor } from './chips';

const r2 = (n: number) => Math.round(n * 100) / 100;

/* ---------------- Where things sit ---------------- */

/**
 * The web hero on a phone, in CSS px, as its percentages are measured: 390 wide, its top 416
 * above the screenshot's top and 1084 tall, with the dial (320 across) centred 290 down. Hero
 * percentages are mapped through it onto the app's scene, scaled by the dial, so the table sits
 * round the dial and the rail just as it does on the web.
 */
const REF = { w: 390, h: 1084, top: -416, dialY: 290, dial: 320 };

function heroMap(width: number, dial: DialSpot) {
  const k = dial.size / REF.dial;
  return {
    /** x of a hero percentage across, in pt. */
    x: (pct: number) => (pct / 100) * width,
    /** y of a hero percentage down, in pt. */
    y: (pct: number) => dial.y + (REF.top + (pct / 100) * REF.h - REF.dialY) * k,
    /** A hero percentage of its height, as a length in pt. */
    h: (pct: number) => (pct / 100) * REF.h * k,
    /** CSS px, as pt. */
    px: (n: number) => (n * width) / REF.w,
  };
}

/* ---------------- The table: felt, betting line, padded rail ---------------- */

/**
 * Specks for the felt's nap and the wood's pores: fine dark and light flecks (plain alpha, so
 * they read the same over any shade of green), on a tile that repeats.
 */
const TILE = 72;
const SPECKS = Array.from({ length: 260 }, (_, i) => ({
  x: r2(frac(i, 11) * TILE),
  y: r2(frac(i, 12) * TILE),
  // Slightly stretched sideways, like brushed felt
  w: r2(0.7 + frac(i, 13) * 1.5),
  h: r2(0.5 + frac(i, 14) * 0.5),
  dark: frac(i, 15) < 0.56,
  a: r2(0.1 + frac(i, 16) * 0.25),
}));

/** The table's edge, as an ellipse in hero percentages. The printed betting line runs inside it. */
const TABLE = { cx: 50, cy: 36, rx: 57, ry: 82 };
const LINE = { rx: 46, ry: 66 };
/** How far out the rail's shading runs, as a multiple of the felt ellipse. */
const RAIL_OUT = 1.2;

/**
 * Grain running round the rail: near-concentric rings, each a little off-centre and squashed so
 * neighbouring lines drift together and apart, broken into long streaks. A few are pale figure.
 */
const GRAIN = Array.from({ length: 50 }, (_, i) => {
  const f = (s: number) => frac(i, s);
  const roll = f(23);
  // Mostly fine dark lines; some pale figure; a few broad, faint growth bands
  const kind = roll < 0.18 ? 'light' : roll > 0.86 ? 'band' : 'line';
  const squash = 0.01 * Math.sin(i * 0.41 + 0.8);
  return {
    k: 1.006 + (i / 49) * 0.19 + (f(21) - 0.5) * 0.003,
    dx: 0.4 * Math.sin(i * 0.29),
    dy: 0.5 * Math.sin(i * 0.21 + 1.7),
    sx: 1 + squash,
    sy: 1 - squash,
    light: kind === 'light',
    width: kind === 'band' ? 5 + f(24) * 6 : kind === 'light' ? 1.2 + f(24) * 1.6 : 0.5 + f(24) * 1.1,
    opacity: kind === 'band' ? 0.06 + f(25) * 0.06 : kind === 'light' ? 0.05 + f(25) * 0.07 : 0.14 + f(25) * 0.26,
    // Long streaks with the odd break, in hundredths of the ring
    dash:
      kind === 'band'
        ? undefined
        : [9 + f(26) * 26, 0.2 + f(27) * 0.7, 4 + f(28) * 14, 0.15 + f(29) * 0.5],
    offset: f(30) * 100,
  };
});

/** An ellipse's circumference (Ramanujan), for the web's pathLength-based dashes. */
const perimeter = (a: number, b: number) => Math.PI * (3 * (a + b) - Math.sqrt((3 * a + b) * (a + 3 * b)));

type Table = { cx: number; cy: number; rx: number; ry: number; lineRx: number; lineRy: number; railPath: string };

function tableOf(width: number, height: number, dial: DialSpot): Table {
  const m = heroMap(width, dial);
  const cx = m.x(TABLE.cx);
  const cy = m.y(TABLE.cy);
  const rx = m.x(TABLE.rx);
  const ry = m.h(TABLE.ry);
  return {
    cx,
    cy,
    rx,
    ry,
    lineRx: m.x(LINE.rx),
    lineRy: m.h(LINE.ry),
    railPath: `M-10 -10H${width + 10}V${height + 10}H-10Z M${cx - rx} ${cy}a${rx} ${ry} 0 1 0 ${rx * 2} 0a${rx} ${ry} 0 1 0 ${-rx * 2} 0Z`,
  };
}

/** The felt's nap: specks over the whole scene. Never changes, so it's drawn once. */
const Felt = memo(function Felt({ width, height }: { width: number; height: number }) {
  return (
    <Svg width={width} height={height} style={[StyleSheet.absoluteFill, { opacity: 0.4 }]}>
      <Defs>
        <Pattern id="nap" width={TILE} height={TILE} patternUnits="userSpaceOnUse">
          {SPECKS.map((s, i) => (
            <Rect key={i} x={s.x} y={s.y} width={s.w} height={s.h} fill={s.dark ? '#000' : '#fff'} opacity={s.a} />
          ))}
        </Pattern>
      </Defs>
      <Rect width={width} height={height} fill="url(#nap)" />
    </Svg>
  );
});

/**
 * The wooden rail round the bottom corners: its rounded profile, grain, a brass inlay, the
 * groove where the felt tucks under. None of it depends on the bet, so it's drawn once.
 */
const Rail = memo(function Rail({ width, height, table: tb }: { width: number; height: number; table: Table }) {
  const { cx, cy, rx, ry } = tb;
  const R = rx * RAIL_OUT;
  const at = (k: number) => k / RAIL_OUT;
  const ring = (k: number) => ({ cx, cy, rx: rx * k, ry: ry * k });
  return (
    <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
      <Defs>
        {/* The rail's rounded profile: a dark groove, the lip catching the lamp, the crown, then
            falling away into shadow toward the room */}
        <RadialGradient id="rail" gradientUnits="userSpaceOnUse" cx={cx} cy={cy} rx={R} ry={(R * ry) / rx}>
          <Stop offset={at(1)} stopColor="#120703" />
          <Stop offset={at(1.005)} stopColor="#9A5129" />
          <Stop offset={at(1.014)} stopColor="#6A2F14" />
          <Stop offset={at(1.036)} stopColor="#8E4721" />
          <Stop offset={at(1.062)} stopColor="#62290F" />
          <Stop offset={at(1.1)} stopColor="#4A1E0B" />
          <Stop offset={at(1.15)} stopColor="#321307" />
          <Stop offset={1} stopColor="#1F0B04" />
        </RadialGradient>
        <ClipPath id="railclip">
          <Path clipRule="evenodd" d={tb.railPath} />
        </ClipPath>
        <Pattern id="pores" width={TILE} height={TILE} patternUnits="userSpaceOnUse">
          {SPECKS.filter((s) => s.dark).map((s, i) => (
            <Rect key={i} x={s.x} y={s.y} width={s.h * 1.6} height={s.w} fill="#000" opacity={s.a * 1.6} />
          ))}
        </Pattern>
      </Defs>

      {/* The rail's shadow falling across the felt, soft at its far edge */}
      <Ellipse {...ring(1)} fill="none" stroke="#000" strokeOpacity={0.14} strokeWidth={30} />
      <Ellipse {...ring(1)} fill="none" stroke="#000" strokeOpacity={0.2} strokeWidth={12} />

      {/* The wooden rail */}
      <Path fillRule="evenodd" fill="url(#rail)" d={tb.railPath} />
      <G clipPath="url(#railclip)" fill="none">
        {GRAIN.map((g, i) => {
          const grx = rx * g.k * g.sx;
          const gry = ry * g.k * g.sy;
          const unit = perimeter(grx, gry) / 100;
          return (
            <Ellipse
              key={i}
              cx={cx + g.dx}
              cy={cy + g.dy}
              rx={grx}
              ry={gry}
              stroke={g.light ? '#F0B47A' : '#1A0803'}
              strokeOpacity={g.opacity}
              strokeWidth={g.width}
              strokeDasharray={g.dash?.map((d) => r2(d * unit))}
              strokeDashoffset={r2(g.offset * unit)}
            />
          );
        })}
        {/* Open pores in the wood */}
        <Path fillRule="evenodd" fill="url(#pores)" d={tb.railPath} opacity={0.45} />
        {/* A brass inlay set into the wood, in a dark channel */}
        <Ellipse {...ring(1.088)} stroke="#120602" strokeOpacity={0.55} strokeWidth={4} />
        <Ellipse {...ring(1.088)} stroke="#D6AE62" strokeOpacity={0.62} strokeWidth={1.3} />
      </G>
      {/* The groove where the felt tucks under, and the polished lip just outside it */}
      <Ellipse {...ring(1)} fill="none" stroke="#0B0402" strokeOpacity={0.9} strokeWidth={2.5} />
      <Ellipse {...ring(1.0045)} fill="none" stroke="#FFD9A8" strokeOpacity={0.32} strokeWidth={1} />
    </Svg>
  );
});

/**
 * What the lamp does to the table: the printed betting line glowing a little brighter under a
 * hot lamp, and its reflection in the rail's lacquer along the crown, warming with the bet.
 */
function TableLight({
  width,
  height,
  table: tb,
  heat,
  lamp,
}: {
  width: number;
  height: number;
  table: Table;
  heat: number;
  lamp: string;
}) {
  const { cx, cy, rx, ry } = tb;
  const ring = (k: number) => ({ cx, cy, rx: rx * k, ry: ry * k });
  return (
    <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
      <Defs>
        <ClipPath id="railclip">
          <Path clipRule="evenodd" d={tb.railPath} />
        </ClipPath>
      </Defs>
      <Ellipse
        cx={cx}
        cy={cy}
        rx={tb.lineRx}
        ry={tb.lineRy}
        fill="none"
        stroke="#E8C872"
        strokeOpacity={r2(0.22 + heat * 0.12)}
        strokeWidth={2}
      />
      <Ellipse
        cx={cx}
        cy={cy}
        rx={tb.lineRx - 0.009 * width}
        ry={tb.lineRy * (1 - 1.2 / 66)}
        fill="none"
        stroke="#E8C872"
        strokeOpacity={r2(0.1 + heat * 0.06)}
        strokeWidth={1}
      />
      <G clipPath="url(#railclip)" fill="none">
        <Ellipse {...ring(1.034)} stroke={lamp} strokeOpacity={r2(0.07 + heat * 0.07)} strokeWidth={18} />
        <Ellipse {...ring(1.032)} stroke="#FFE7C2" strokeOpacity={r2(0.1 + heat * 0.06)} strokeWidth={2.5} />
      </G>
    </Svg>
  );
}

/* ---------------- Chip stacks ---------------- */

/**
 * The stacks the web keeps on phones: one tucked against each screen edge beside the dial
 * (anchored by their bottom centre, hero %), each running from `min` to `max` chips as the bet
 * grows. Both keep one chip on a late result; the rest topple.
 */
const STACKS: { x: number; y: number; color: ChipColor; min: number; max: number }[] = [
  { x: 3.5, y: 70, color: 'red', min: 4, max: 13 },
  { x: 96.5, y: 73, color: 'black', min: 3, max: 12 },
];
/** The web's stacks are 62px wide, at 62% on a phone. */
const STACK_W = 62 * 0.62;

/* ---------------- The scene ---------------- */

export function PokerScene({ p, mood, width, height, dial }: SceneProps) {
  const win = mood === 'win';
  const loss = mood === 'loss';
  // How hot the table is: a snooze rakes in the whole pot, a late result busts you.
  const heat = win ? 1 : loss ? 0 : p;
  const lamp = rampN(['#FFF3D2', '#FFE6A8', '#FFD08A'], heat);
  const vignette = 0.32 + p * 0.2 + (loss ? 0.2 : 0);
  const m = heroMap(width, dial);
  const table = useMemo(() => tableOf(width, height, dial), [width, height, dial]);
  const stackW = m.px(STACK_W);

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { overflow: 'hidden' }]}>
      <Felt width={width} height={height} />

      {/* The lamp over the table: a pool of light that warms with the bet */}
      <View
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `radial-gradient(ellipse 55% 50% at 50% 48%, ${cssA(lamp, r2(0.07 + heat * 0.07))} 0%, ${cssA(lamp, 0.02)} 60%, transparent 80%)`,
        }}
      />
      {/* The room beyond the lamp, closing in as the stakes rise */}
      <View
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `radial-gradient(ellipse 80% 75% at 50% 46%, transparent 50%, rgba(0,0,0,${r2(vignette)}) 100%)`,
        }}
      />

      <Rail width={width} height={height} table={table} />
      <TableLight width={width} height={height} table={table} heat={heat} lamp={rgb(lamp)} />

      {/* Stacks against the edges: taller as the bet grows. Busted, they topple, all but one chip. */}
      {STACKS.map((s, i) => {
        // On a late result the stack still holds what was bet (heat drops to 0, but the chips
        // that fall are the ones that were there)
        const n = Math.round(s.min + (s.max - s.min) * (loss ? p : heat));
        return (
          <View
            key={i}
            style={{
              position: 'absolute',
              left: m.x(s.x) - stackW / 2,
              bottom: height - m.y(s.y),
              width: stackW,
            }}
          >
            <ChipStack n={n} color={s.color} width={stackW} seed={i * 7 + 3} topple={loss} />
          </View>
        );
      })}
    </View>
  );
}

/* ---------------- The pot bursting open ---------------- */

const FOUNTAIN_COLORS: ChipColor[] = ['gold', 'gold', 'gold', 'gold', 'red', 'black', 'purple', 'blue', 'white', 'red'];

/**
 * Chips bursting out of the pot, in shares of the dial's size: thrown out to either side from
 * behind the dial in wide, low arcs, so they clear the time and the verdict quickly and land on
 * the felt out by your stacks (`side`, `out` and `land`: where each comes down, from the
 * dial's centre).
 */
const FOUNTAIN = Array.from({ length: 28 }, (_, i) => {
  const f = (s: number) => frac(i, s);
  // Alternate sides, so each side gets its share
  const side = i % 2 ? 1 : -1;
  return {
    color: FOUNTAIN_COLORS[Math.floor(f(41) * FOUNTAIN_COLORS.length)],
    side,
    out: 0.7 + f(42) * 0.95,
    land: 0.3 + f(43) * 0.5,
    lift: 0.2 + f(44) * 0.35,
    flight: 0.85 + f(45) * 0.45,
    delay: f(46) * 0.55,
    size: 24 + f(47) * 14,
    turns: 1 + Math.floor(f(48) * 3),
    tilt: (f(49) - 0.5) * 60,
  };
});

/** A split pot: half the chips, each with a twin flying exactly the other way. */
const SPLIT = FOUNTAIN.slice(0, 12)
  .filter((c) => c.side === 1)
  .flatMap((c) => [c, { ...c, side: -1, tilt: -c.tilt }]);

/**
 * How far over a chip ends up when it lands: lying flat on the table, seen from the same angle
 * as the stacks (cos 64° ≈ RY / RX).
 */
const LIE_FLAT = 64;
/** How long a chip lies on the felt, then how long it takes to fade. */
const REST = 0.55;
const FADE = 0.35;
/** Samples along each throw: its arc is laid down as straight runs between them. */
const STEPS = 12;

/**
 * The pot bursting: chips thrown out from behind the dial, spinning through wide arcs, landing
 * flat on the felt by your stacks, then fading. Played once, as the result lands. Each throw is
 * one keyframed view: x runs at a steady pace while y rises and falls under gravity, sampled.
 */
function ChipFountain({ size, split }: { size: number; split: boolean }) {
  const reduce = useReducedMotion();
  // How far out a chip can be thrown: the dial's size on wide screens, less on a phone so most
  // land on screen (the dial is 82% of the screen's width)
  const reach = Math.min(size, size / 0.82 / 3);
  const throws = useMemo(
    () =>
      (split ? SPLIT : FOUNTAIN).map((c) => {
        const total = c.flight + REST + FADE;
        // When it tops out, so the rise and fall feel like one arc under gravity
        const apex = 1 / (1 + Math.sqrt((c.lift + c.land) / c.lift));
        const L = c.lift * size;
        const D = c.land * size;
        const spin = c.side * (c.turns * 360 + LIE_FLAT);
        const at = (t: number) => {
          // t: seconds into the throw
          const u = Math.min(1, t / c.flight);
          const y = u < apex ? -L * (1 - (1 - u / apex) ** 2) : -L + (L + D) * ((u - apex) / (1 - apex)) ** 2;
          const grow = Math.min(1, t / 0.3);
          return {
            transform: [
              { translateX: r2(c.side * c.out * reach * u) },
              { translateY: r2(y) },
              { scale: r2(0.5 + 0.5 * (1 - (1 - grow) ** 2)) },
              { perspective: 220 },
              { rotate: `${r2(c.tilt * (1 - u))}deg` },
              { rotateX: `${r2(spin * u)}deg` },
            ],
          };
        };
        const frames: Record<string, object> = {};
        for (let s = 0; s <= STEPS; s++) {
          const t = (s / STEPS) * c.flight;
          frames[`${r2((t / total) * 100)}%`] = { ...at(t), ...(s === 1 ? { opacity: 1 } : {}) };
        }
        frames['0%'] = { ...at(0), opacity: 0 };
        frames[`${r2(((c.flight + REST) / total) * 100)}%`] = { ...at(c.flight), opacity: 1 };
        frames['100%'] = { ...at(c.flight), opacity: 0 };
        return { c, total, keyframes: css.keyframes(frames) };
      }),
    [size, split, reach],
  );
  if (reduce) return null;
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: size / 2, top: size / 2 }}>
      {throws.map(({ c, total, keyframes }, i) => (
        <Animated.View
          key={i}
          style={{
            position: 'absolute',
            // From the edge of the time, not its middle
            left: c.side * size * 0.12 - c.size / 2,
            top: -c.size / 2,
            opacity: 0,
            animationName: keyframes,
            animationDuration: `${r2(total)}s`,
            animationDelay: `${r2(0.15 + c.delay)}s`,
            animationTimingFunction: 'linear',
            animationFillMode: 'both',
          }}
        >
          <ChipFace color={c.color} size={c.size} />
        </Animated.View>
      ))}
    </View>
  );
}

/**
 * Poker's counterpart to the sun rays: the lamp's pool of light on the pot, warming and
 * brightening with the bet, and a printed pot circle on the felt. At all in, the circle
 * breathes. Fades out while the alarm is set. A snooze bursts the pot open (chips flying out
 * from behind the dial); right on time splits it, half flying each way.
 */
export function PotLight({ p, range, visible, size, mood }: BackdropProps) {
  const glow = rampN(['#FFF1C9', '#FFE09A', '#FFBF6A'], p);
  const allIn = range === MAX_RANGE;
  const box = size * 1.9;
  return (
    <>
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
            backgroundImage: `radial-gradient(circle, ${cssA(glow, r2(0.2 + p * 0.14))} 0%, ${cssA(glow, 0.07)} 36%, ${cssA(glow, 0)} 62%)`,
          }}
        />
        <Animated.View
          style={[
            {
              position: 'absolute',
              inset: box * 0.18,
              borderRadius: box,
              borderWidth: 1.5,
              borderColor: 'rgba(232,200,114,0.26)',
              boxShadow: '0 0 0 5px rgba(232,200,114,0.06)',
            },
            allIn && loop(KF.pulse, 1.2),
          ]}
        />
      </View>
      {(mood === 'win' || mood === 'jackpot') && (
        <Animated.View exiting={FadeOut.duration(250)} style={{ position: 'absolute', left: 0, top: 0 }}>
          <ChipFountain size={size} split={mood === 'jackpot'} />
        </Animated.View>
      )}
    </>
  );
}
