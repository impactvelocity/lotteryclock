/**
 * Good Morning's lower area: a village on rolling hills that wakes up with the bet
 * (web/src/components/scenes/sunrise-village.tsx).
 *
 *   0 min     everyone's asleep: dark windows, the rooster dozing on his fence post
 *   1–11      the first bedroom lights, a lazy turn of the windmill
 *   12–35     more lights, chimneys start to smoke, the rooster's up and about
 *   36–45     the whole village is up, the windmill whirring, the rooster crowing
 *
 * While the draw rolls the windmill spins like a loading wheel and the rooster looks
 * nervously left and right. A snooze puts the village back to bed (lights off one by one,
 * the windmill winds down, the rooster nods off); a late result is chaos (every light on,
 * the rooster crowing, a flock bursting out of the trees); right on time, a rainbow.
 *
 * Drawn on a 3200 × 300 strip, cropped (not squashed) to the screen, sitting on the rail, with
 * headroom above it for the rainbow and the startled birds. The hills dip in the middle, so the
 * tier label and the Set alarm button always sit over open ground. Static art is one <Svg>;
 * what moves (sails, smoke, rooster, flock) is laid over it as Views in the same coordinates,
 * and only what's on screen is drawn.
 */
import { memo, useEffect, useMemo, type ComponentType } from 'react';
import { StyleSheet, View, type StyleProp } from 'react-native';
import Animated, {
  css as rcss,
  cubicBezier,
  FadeOut,
  useAnimatedStyle,
  useFrameCallback,
  useSharedValue,
} from 'react-native-reanimated';
import Svg, {
  Circle,
  Ellipse,
  G,
  Path,
  Rect,
  type CircleProps,
  type PathProps,
  type RectProps,
} from 'react-native-svg';

import { frac } from '@/lib/rand';
import { sans } from '@/themes/fonts';
import { css, rampN } from '@/themes/themes';

import { loop } from '../anim';
import { bezier, Gull, GULL_PIVOT } from './bits';
import { FLAP, ROOSTER_BREATHE, ROOSTER_LOOK, villageFor } from './keyframes';
import { renderSvg, type Paint } from './svg-tree';
import { PALETTE, villageArt, type CottageArt, type TreeKind } from './village-art';

const W = 3200;
const H = 300;
/** Sky above the strip, for the rainbow and the flock. */
const SKY = 540;
const MID = W / 2;

type Bump = [cx: number, rx: number, ry: number];
type Layer = { base: number; bumps: Bump[] };

/** Three rows of hills, back to front: overlapping domes, lowest in the middle. */
const FAR: Layer = {
  base: 252,
  bumps: [
    [90, 380, 118],
    [540, 420, 132],
    [960, 360, 122],
    [1290, 300, 62],
    [1600, 380, 30],
    [1910, 300, 60],
    [2240, 380, 128],
    [2650, 420, 138],
    [3090, 380, 112],
  ],
};
const MIDDLE: Layer = {
  base: 286,
  bumps: [
    [300, 360, 96],
    [760, 380, 101],
    [1150, 320, 86],
    [1450, 260, 44],
    [1760, 260, 42],
    [2060, 340, 89],
    [2460, 360, 101],
    [2900, 380, 92],
  ],
};
const NEAR: Layer = {
  base: 310,
  bumps: [
    [150, 300, 50],
    [560, 320, 58],
    [960, 300, 48],
    [1320, 260, 34],
    [1600, 300, 20],
    [1880, 260, 34],
    [2250, 300, 50],
    [2640, 320, 58],
    [3050, 300, 50],
  ],
};

/** Where a layer's ground is at x: the top of whichever dome is highest there. */
function ridge(layer: Layer, x: number) {
  let top = layer.base;
  for (const [cx, rx, ry] of layer.bumps) {
    const d = (x - cx) / rx;
    if (Math.abs(d) < 1) top = Math.min(top, layer.base - ry * Math.sqrt(1 - d * d));
  }
  return top;
}

const r1 = (n: number) => Math.round(n * 10) / 10;

/* ---- Houses ---- */

/** The art's bottom 20 units sit behind the hill in front. */
const HIDDEN = 20;

type HouseSpec = {
  x: number;
  /** Which cottage art. */
  art: number;
  /** 1: swap the roof and chimney colours, for variety. */
  roof: 0 | 1;
  flip?: boolean;
  s?: number;
};

const HOUSE_SPECS: HouseSpec[] = [
  { x: 300, art: 2, roof: 1 },
  { x: 790, art: 1, roof: 1 },
  { x: 985, art: 0, roof: 0 },
  { x: 1905, art: 3, roof: 1 },
  { x: 2115, art: 1, roof: 0, flip: true },
  { x: 2525, art: 2, roof: 0, flip: true },
  { x: 2960, art: 3, roof: 1, flip: true },
];

function house(spec: HouseSpec, i: number, art: CottageArt) {
  const s = spec.s ?? 1;
  const ox = spec.x - (art.w * s) / 2;
  const oy = ridge(MIDDLE, spec.x) - (art.h - HIDDEN) * s;
  const at = (x: number) => (spec.flip ? ox + (art.w - x) * s : ox + x * s);
  return {
    i,
    art,
    roof: spec.roof,
    /** Left and right edges on the strip. */
    span: [ox, ox + art.w * s] as const,
    transform: spec.flip
      ? `translate(${r1(ox + art.w * s)} ${r1(oy)}) scale(${-s} ${s})`
      : `translate(${r1(ox)} ${r1(oy)}) scale(${s})`,
    /** When (as a share of "awake") each window's light comes on. */
    on: art.windows.map((_, n) => frac(i * 7 + n, 301)),
    smoke: art.smoke ? ([r1(at(art.smoke[0])), r1(oy + art.smoke[1] * s - 2)] as const) : null,
    /** Whether its chimney smokes, as a share of "awake". */
    smokeAt: 0.12 + frac(i, 302) * 0.6,
  };
}

/* ---- Trees ---- */

type Tree = { x: number; s: number; kind: TreeKind; front: boolean; flip?: boolean };

const TREES: Tree[] = [
  { x: 430, s: 30, kind: 'round', front: false },
  { x: 560, s: 26, kind: 'poplar', front: false },
  { x: 690, s: 24, kind: 'poplar', front: false },
  { x: 885, s: 34, kind: 'apple', front: false },
  { x: 1290, s: 30, kind: 'round', front: true },
  { x: 1840, s: 22, kind: 'round', front: true, flip: true },
  { x: 2225, s: 38, kind: 'apple', front: true, flip: true },
  { x: 2425, s: 26, kind: 'poplar', front: false },
  { x: 2700, s: 32, kind: 'round', front: false, flip: true },
  { x: 2830, s: 24, kind: 'poplar', front: false },
  { x: 3100, s: 30, kind: 'round', front: true },
];

function treeFoot(t: Tree) {
  return t.front ? ridge(NEAR, t.x) + 4 : ridge(MIDDLE, t.x) + 16;
}

/** The art's scale for a tree of size `s` (poplars are narrow, so they run a little larger). */
const treeScale = (t: Tree) => t.s / (t.kind === 'poplar' ? 28 : 36);

function TreeShape({ t, paint }: { t: Tree; paint: Paint }) {
  const sc = treeScale(t);
  const x = t.flip ? t.x + 40 * sc : t.x - 40 * sc;
  return (
    <G
      transform={`translate(${r1(x)} ${r1(treeFoot(t) - 110 * sc)}) scale(${(t.flip ? -sc : sc).toFixed(3)} ${sc.toFixed(3)})`}
    >
      {renderSvg(villageArt().trees[t.kind], paint)}
    </G>
  );
}

/* ---- Windmill ---- */

const MILL_X = 1150;
const MILL_S = 1.1;

/* ---- Fence and rooster ---- */

const FENCE = [1945, 1978, 2011, 2044, 2077].map((x) => [x, ridge(NEAR, x) + 5] as const);
const POST_H = 36;
/** The rooster stands on the third post. */
const PERCH: [number, number] = [FENCE[2][0], FENCE[2][1] - POST_H];
const ROOSTER_S = 0.95;
/** Middle of his feet on the art's 64 grid. */
const ROOSTER_FEET_X = 35.5;
/** His crow: marks pulsing out of his beak, on his 64 grid (they run past it, to 82). */
const CROW = ['M 64 13 Q 68 19 64 25', 'M 69 9 Q 75 19 69 29', 'M 74 5 Q 82 19 74 33'];

export type RoosterPose = 'asleep' | 'stand' | 'look' | 'crow' | 'proud';

/* ---- Rainbow and the startled flock ---- */

/** Outside in. Pastels from the theme: dawn rose, apricot, butter, mint, sky, lilac. */
const RAINBOW = ['#F59AB5', '#FFB98A', '#FFE07A', '#B5E3A1', '#9FD3F0', '#BFA6EC'].map((c, k) => {
  const r = 760 - k * 17;
  const len = Math.PI * r;
  return {
    c,
    d: `M ${MID - r} ${H} A ${r} ${r} 0 0 1 ${MID + r} ${H}`,
    len,
    // Each band draws itself in from the left, like the web's pathLength 0 → 1
    draw: rcss.keyframes({ from: { strokeDashoffset: len }, to: { strokeDashoffset: 0 } }),
  };
});
const BAND = 17;

/** Birds that burst out of the trees on a late result, and where they're headed. */
const FLOCK = Array.from({ length: 12 }, (_, i) => {
  const from = [1290, 1840, 2225, 885][i % 4];
  const t = TREES.find((tr) => tr.x === from)!;
  return {
    x: from + (frac(i, 311) - 0.5) * 50,
    y: treeFoot(t) - 62 * treeScale(t),
    dx: (from < MID ? -1 : 1) * (160 + frac(i, 312) * 320),
    dy: -(440 + frac(i, 313) * 140),
    delay: i * 0.06,
    size: 1.6 + frac(i, 314) * 0.7,
    beat: 0.26 + frac(i, 315) * 0.1,
  };
});
/** The flock's flight: eased out like the web's cubic-bezier, fading in fast and out late. */
const FLIGHT_EASE = bezier(0.25, 0.6, 0.4, 1);
const FLIGHT_STOPS = [0, 0.06, 0.2, 0.4, 0.6, 0.8, 1];
const flightOpacity = (t: number) => (t < 0.06 ? t / 0.06 : t <= 0.8 ? 1 : (1 - t) / 0.2);

/* ---- Layout, read from the art once ---- */

let built: ReturnType<typeof build> | undefined;
function build() {
  const { cottages, mill } = villageArt();
  const ox = MILL_X - (mill.w / 2) * MILL_S;
  const oy = ridge(MIDDLE, MILL_X) - (mill.h - HIDDEN) * MILL_S;
  return {
    houses: HOUSE_SPECS.map((spec, i) => house(spec, i, cottages[spec.art])),
    mill: {
      transform: `translate(${r1(ox)} ${r1(oy)}) scale(${MILL_S})`,
      hub: [r1(ox + mill.hub[0] * MILL_S), r1(oy + mill.hub[1] * MILL_S)] as const,
    },
  };
}
const layout = () => (built ??= build());

/* ---- The scene ---- */

type Props = {
  /** How far the sun's up, 0..1: the light on everything. */
  sun: number;
  /** Share of the village that's up: lit windows, smoking chimneys. */
  awake: number;
  /** Lights change one after another (a result), rather than straight away (dragging the bet). */
  cascade: boolean;
  /** Windmill speed, degrees per second. It eases towards it, so it winds up and down. */
  spin: number;
  pose: RoosterPose;
  rainbow: boolean;
  /** Birds burst out of the trees. */
  flush: boolean;
  /** The scene's size: the village sits on its bottom edge (the rail). */
  width: number;
  height: number;
};

const LAMP = '#FFC24A';

/**
 * react-native-svg merges an element's `style` into its props, and that's where Reanimated's CSS
 * animations and transitions go (the lamps fade, the rainbow draws itself); its types just
 * don't list `style`.
 */
type SvgStyle = { style?: StyleProp<{ opacity?: number; strokeDashoffset?: number }> };
const ARect = Animated.createAnimatedComponent(Rect as ComponentType<RectProps & SvgStyle>);
const ACircle = Animated.createAnimatedComponent(Circle as ComponentType<CircleProps & SvgStyle>);
const APath = Animated.createAnimatedComponent(Path as ComponentType<PathProps & SvgStyle>);

export const Village = memo(function Village({
  sun,
  awake,
  cascade,
  spin,
  pose,
  rainbow,
  flush,
  width,
  height,
}: Props) {
  // The strip's height on screen, as on the web: 104 on phones, 200 from its sm breakpoint
  const S = (width >= 640 ? 200 : 104) / H;
  const viewW = width / S;
  const x0 = MID - viewW / 2;
  const boxH = (H + SKY) * S;
  /** Whether a stretch of the strip is on screen (with a little slack for overhangs). */
  const seen = (a: number, b: number) => b >= x0 - 30 && a <= x0 + viewW + 30;
  /** A strip point, in the box's pt. */
  const at = (x: number, y: number) => ({ left: (x - x0) * S, top: (y + SKY) * S });
  const viewBox = `${r1(x0)} ${-SKY} ${r1(viewW)} ${H + SKY}`;
  const { houses, mill } = layout();
  const art = villageArt();

  // Pre-dawn blue-lilac shade → first light → green and gold morning → blazing
  const far = css(rampN(['#C4BEE4', '#D3BEDD', '#E4BDC6', '#EBB4A4'], sun));
  const mid = css(rampN(['#A9B0DA', '#AEBFCB', '#B3CCA6', '#BFCB8C'], sun));
  const near = css(rampN(['#8F9ACA', '#93B2AE', '#97BF8D', '#A3BE73'], sun));
  const backTree = css(rampN(['#9BA2D2', '#9DB5B6', '#9CBE92', '#A6BC78'], sun));
  const frontTree = css(rampN(['#7883BA', '#7CA19D', '#80AD78', '#8DAD5E'], sun));
  const backLight = css(rampN(['#B0B6DD', '#B4C8C5', '#B4D0A9', '#BCCD93'], sun));
  const frontLight = css(rampN(['#959FCB', '#97B8B2', '#9CBE92', '#A8C27E'], sun));
  const trunk = css(rampN(['#8E7BA6', '#9A7684', '#9B705E'], sun));
  const wall = css(rampN(['#E6E1F5', '#F5EDF1', '#FFF6EC', '#FFF0DC'], sun));
  const roofs = [
    css(rampN(['#A08DC6', '#C98AA8', '#E98A7B', '#EC7A5E'], sun)),
    css(rampN(['#8D93C8', '#A68CB8', '#B985A6', '#C27A92'], sun)),
  ];
  const glass = css(rampN(['#8D86B9', '#9C8FB5', '#A794AF', '#AE90A2'], sun));
  const wood = css(rampN(['#6E6496', '#6F5476', '#704C68'], sun));
  const fence = css(rampN(['#CBC1E2', '#E7D2D2', '#F2D7BE'], sun));

  // The art's palette fills, recoloured with the sunrise
  const paint: Paint = {
    [PALETTE.wall]: wall,
    [PALETTE.roof]: roofs[0],
    [PALETTE.roof2]: roofs[1],
    [PALETTE.glass]: glass,
    [PALETTE.wood]: wood,
    [PALETTE.trunk]: trunk,
  };
  const swapped: Paint = { ...paint, [PALETTE.roof]: roofs[1], [PALETTE.roof2]: roofs[0] };
  const backPaint: Paint = { ...paint, [PALETTE.canopy]: backTree, [PALETTE.light]: backLight };
  const frontPaint: Paint = { ...paint, [PALETTE.canopy]: frontTree, [PALETTE.light]: frontLight };

  const lightDelay = (on: boolean, t: number) => (cascade ? Math.round((on ? t : 1 - t) * 900) : 0);
  const shown = houses.filter((h) => seen(...h.span));
  const trees = TREES.filter((t) => seen(t.x - 40 * treeScale(t), t.x + 40 * treeScale(t)));

  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: 0, top: height - boxH, width, height: boxH }}>
      {/* Right on time: a rainbow over the valley */}
      {rainbow && (
        <Animated.View exiting={FadeOut.duration(400)} style={StyleSheet.absoluteFill}>
          <Svg width={width} height={boxH} viewBox={viewBox}>
            {RAINBOW.map((b, k) => (
              <APath
                key={b.c}
                d={b.d}
                fill="none"
                stroke={b.c}
                strokeWidth={BAND + 1}
                opacity={0.55}
                strokeDasharray={[b.len, b.len]}
                style={{
                  animationName: b.draw,
                  animationDuration: '1.1s',
                  animationDelay: `${0.2 + k * 0.06}s`,
                  animationTimingFunction: cubicBezier(0.3, 0.7, 0.3, 1),
                  animationFillMode: 'both',
                }}
              />
            ))}
          </Svg>
        </Animated.View>
      )}

      <Svg width={width} height={boxH} viewBox={viewBox} style={StyleSheet.absoluteFill}>
        {/* Far hills, hazy with the sunrise */}
        <Hills layer={FAR} fill={far} />

        {/* Behind the middle row: trees, houses and the windmill, their feet hidden by the hill */}
        {trees
          .filter((t) => !t.front)
          .map((t) => (
            <TreeShape key={t.x} t={t} paint={backPaint} />
          ))}

        <G transform={mill.transform}>
          {renderSvg(art.mill.tower, paint)}
          <ACircle
            cx={art.mill.window[0]}
            cy={art.mill.window[1]}
            r={art.mill.window[2]}
            fill={LAMP}
            style={{ opacity: awake > 0.3 ? 1 : 0, transitionProperty: 'opacity', transitionDuration: 400 }}
          />
        </G>

        {shown.map((h) => (
          <G key={h.i} transform={h.transform}>
            {renderSvg(h.art.under, h.roof ? swapped : paint)}
            {renderSvg(h.art.over, h.roof ? swapped : paint)}
            {h.art.windows.map(([wx, wy, ww, wh], n) => {
              const on = h.on[n] < awake;
              return (
                <G key={n}>
                  <Rect x={wx} y={wy} width={ww} height={wh} rx={2} fill={glass} />
                  <ARect
                    x={wx}
                    y={wy}
                    width={ww}
                    height={wh}
                    rx={2}
                    fill={LAMP}
                    style={{
                      opacity: on ? 1 : 0,
                      transitionProperty: 'opacity',
                      transitionDuration: 260,
                      transitionDelay: lightDelay(on, h.on[n]),
                    }}
                  />
                </G>
              );
            })}
          </G>
        ))}

        <Hills layer={MIDDLE} fill={mid} />

        {/* The near row: a few trees, the fence and the rooster */}
        {trees
          .filter((t) => t.front)
          .map((t) => (
            <TreeShape key={t.x} t={t} paint={frontPaint} />
          ))}

        <Hills layer={NEAR} fill={near} />

        {/* Fence: rails follow the slope post to post */}
        {[24, 12].map((up) => (
          <Path
            key={up}
            d={
              FENCE.map(([x, y], k) => `${k ? 'L' : 'M'} ${x - (k === 0 ? 8 : 0)} ${r1(y - up)}`).join(' ') +
              ` L ${FENCE[FENCE.length - 1][0] + 8} ${r1(FENCE[FENCE.length - 1][1] - up)}`
            }
            fill="none"
            stroke={fence}
            strokeWidth={5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
        {FENCE.map(([x, y]) => (
          <Rect key={x} x={x - 4} y={y - POST_H} width={8} height={POST_H + 6} rx={2.5} fill={fence} />
        ))}
      </Svg>

      {/* The windmill's sails: a loading wheel while the draw rolls */}
      {seen(MILL_X - 110, MILL_X + 110) && <Sails spin={spin} paint={paint} hub={at(...mill.hub)} scale={S} />}

      {/* Chimney smoke, once someone's up to light the stove */}
      {shown.map((h) => h.smoke && <Smoke key={h.i} k={h.i} on={awake > h.smokeAt} at={at(...h.smoke)} scale={S} />)}

      {/* The rooster on his post, facing the valley */}
      <Rooster pose={pose} at={at} scale={S} />

      {/* Late: a flock bursts out of the trees (mounted fresh each time, so it always takes off) */}
      {flush && <Flock at={at} scale={S} from={x0} span={viewW} />}
    </View>
  );
});

function Hills({ layer, fill }: { layer: Layer; fill: string }) {
  return (
    <G fill={fill}>
      <Rect x={-10} y={layer.base - 1} width={W + 20} height={H - layer.base + 12} />
      {layer.bumps.map(([cx, rx, ry]) => (
        <Ellipse key={cx} cx={cx} cy={layer.base} rx={rx} ry={ry} />
      ))}
    </G>
  );
}

type At = (x: number, y: number) => { left: number; top: number };

/**
 * The sails, turning about the hub. The speed eases towards its target every frame (so the
 * mill winds up and down rather than jumping), and the angle accumulates on the UI thread.
 */
function Sails({ spin, paint, hub, scale }: { spin: number; paint: Paint; hub: { left: number; top: number }; scale: number }) {
  const { sails, sailsSize } = villageArt().mill;
  const size = sailsSize * scale;
  const target = useSharedValue(spin);
  const speed = useSharedValue(spin);
  const angle = useSharedValue(20);
  useEffect(() => {
    target.set(spin);
  }, [spin, target]);
  useFrameCallback((frame) => {
    const dt = Math.min(0.1, (frame.timeSincePreviousFrame ?? 0) / 1000);
    const v = speed.get() + (target.get() - speed.get()) * (1 - Math.exp(-dt * 1.4));
    speed.set(v);
    angle.set((angle.get() + dt * v) % 360);
  });
  const turn = useAnimatedStyle(() => ({ transform: [{ rotate: `${angle.get()}deg` }] }));
  return (
    <Animated.View
      style={[{ position: 'absolute', left: hub.left - size / 2, top: hub.top - size / 2, width: size, height: size }, turn]}
    >
      <Svg width={size} height={size} viewBox={`0 0 ${sailsSize} ${sailsSize}`}>
        {renderSvg(sails, paint)}
      </Svg>
    </Animated.View>
  );
}

/** Three puffs rising from a chimney, staggered; fades in and out as the house wakes or sleeps. */
function Smoke({ k, on, at, scale }: { k: number; on: boolean; at: { left: number; top: number }; scale: number }) {
  const { puff } = villageFor(scale);
  const d = 12 * scale;
  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: at.left - d / 2,
        top: at.top - d / 2,
        opacity: on ? 1 : 0,
        transitionProperty: 'opacity',
        transitionDuration: 900,
      }}
    >
      {[0, 1, 2].map((n) => (
        <Animated.View
          key={n}
          style={{
            position: 'absolute',
            width: d,
            height: d,
            borderRadius: d / 2,
            backgroundColor: '#FFFFFF',
            opacity: 0,
            ...loop(puff, 2.7, { delay: n * 0.9 + k * 0.37, ease: 'ease-out' }),
          }}
        />
      ))}
    </Animated.View>
  );
}

/**
 * The rooster (./art/classic/village/rooster-*.svg), facing the valley. Asleep and crowing have
 * their own art; the rest stand. "look" turns him left and right while the draw rolls, "proud"
 * struts gently, crowing adds marks pulsing out of his beak, and asleep, Zs drift up.
 */
function Rooster({ pose, at, scale }: { pose: RoosterPose; at: At; scale: number }) {
  const { rooster } = villageArt();
  const kf = villageFor(scale);
  const crowing = pose === 'crow';
  const art = pose === 'asleep' ? rooster.asleep : crowing ? rooster.crowing : rooster.standing;
  const unit = ROOSTER_S * scale;
  const size = 64 * unit;
  // The art is mirrored about its right edge, which sits just past his feet on the post
  const box = at(PERCH[0] + (ROOSTER_FEET_X - 64) * ROOSTER_S, PERCH[1] - 64 * ROOSTER_S);
  const body =
    pose === 'look'
      ? loop(ROOSTER_LOOK, 3, { ease: 'linear' })
      : pose === 'proud'
        ? loop(kf.strut, 1.8)
        : pose === 'asleep'
          ? loop(ROOSTER_BREATHE, 4.5)
          : null;
  return (
    <>
      <View style={{ position: 'absolute', ...box, width: size, height: size, transform: [{ scaleX: -1 }] }}>
        <Animated.View style={[{ width: size, height: size, transformOrigin: '50% 100%' }, body]}>
          <Svg width={size} height={size} viewBox="0 0 64 64">
            {renderSvg(art)}
          </Svg>
          {crowing &&
            CROW.map((d, k) => (
              <Animated.View
                key={k}
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  ...loop(kf.ringMark, 1.1, { delay: k * 0.15, ease: 'ease-out' }),
                }}
              >
                <Svg width={84 * unit} height={size} viewBox="0 0 84 64">
                  <Path d={d} fill="none" stroke="#432344" strokeWidth={2.2} strokeLinecap="round" />
                </Svg>
              </Animated.View>
            ))}
        </Animated.View>
      </View>
      {pose === 'asleep' &&
        [0, 1, 2].map((k) => {
          const font = (15 + k * 6) * scale;
          // The web's <text> sits on its baseline; a Text box hangs from its top
          const p = at(PERCH[0] - 20 + k * 10, PERCH[1] - 46 - k * 10);
          return (
            <Animated.Text
              key={k}
              style={{
                position: 'absolute',
                left: p.left,
                top: p.top - font,
                fontSize: font,
                lineHeight: font * 1.2,
                fontFamily: sans(800),
                color: '#B583A8',
                opacity: 0,
                ...loop(kf.zzz, 2.7, { delay: k * 0.9, ease: 'ease-out' }),
              }}
            >
              z
            </Animated.Text>
          );
        })}
    </>
  );
}

/** Late: a dozen gulls burst out of the trees and scatter up out of the valley. */
function Flock({ at, scale, from, span }: { at: At; scale: number; from: number; span: number }) {
  // Each bird's flight as keyframes, sampled from the web's easing (only those that cross the screen)
  const birds = useMemo(
    () =>
      FLOCK.filter((b) => {
        const [a, z] = [Math.min(b.x, b.x + b.dx) - 50, Math.max(b.x, b.x + b.dx) + 50];
        return z >= from && a <= from + span;
      }).map((b) => ({
        ...b,
        flight: rcss.keyframes(
          Object.fromEntries(
            FLIGHT_STOPS.map((t) => [
              `${Math.round(t * 100)}%`,
              {
                opacity: flightOpacity(t),
                transform: [{ translateX: FLIGHT_EASE(t) * b.dx * scale }, { translateY: FLIGHT_EASE(t) * b.dy * scale }],
              },
            ]),
          ),
        ),
      })),
    [from, span, scale],
  );
  return (
    <>
      {birds.map((b, i) => {
        const w = 24 * b.size * scale;
        const p = at(b.dx < 0 ? b.x - 24 * b.size : b.x, b.y - b.size);
        return (
          <Animated.View
            key={i}
            style={{
              position: 'absolute',
              ...p,
              opacity: 0,
              animationName: b.flight,
              animationDuration: '3s',
              animationDelay: `${b.delay}s`,
              animationTimingFunction: 'linear',
              animationFillMode: 'both',
            }}
          >
            <Animated.View
              style={{ transformOrigin: GULL_PIVOT, ...loop(FLAP, b.beat) }}
            >
              <Gull width={w} weight={2.4} drop={1.2} shade="#96465A" />
            </Animated.View>
          </Animated.View>
        );
      })}
    </>
  );
}
