/**
 * The 8 ball's die, ported from web/src/components/scenes/eightball-scene.tsx: the blue
 * icosahedron face that answers. Drawn in the dial's window (EightBallDie), rising out of the
 * dark while the draw rolls (EightBallRoll) and answering YES or NO beside the result
 * (EightBallVerdict). The ball itself (the dial's backdrop) and the studio are in ./index.tsx.
 */
import { useId, type ReactNode } from 'react';
import { View } from 'react-native';
import Animated, { css, cubicBezier } from 'react-native-reanimated';
import Svg, {
  Circle,
  ClipPath,
  Defs,
  Ellipse,
  G,
  LinearGradient,
  Path,
  RadialGradient,
  Stop,
  Text,
} from 'react-native-svg';

import { frac } from '@/lib/rand';
import { ROLL_MS } from '@/lib/roll';
import { fontFor } from '@/themes/fonts';

import type { DialLayerProps, SceneMood } from '../types';

const S3 = Math.sqrt(3);
export const r2 = (n: number) => Math.round(n * 100) / 100;
/** useId() for SVG ids: letters, digits, - and _ only. */
export const cleanId = (id: string) => id.replace(/[^a-zA-Z0-9_-]/g, '');

/** A die face: an upside-down triangle with circumradius r, centred on (cx, cy). */
export function tri(cx: number, cy: number, r: number) {
  const hw = (r * S3) / 2;
  return `M${r2(cx - hw)} ${r2(cy - r / 2)}H${r2(cx + hw)}L${r2(cx)} ${r2(cy + r)}Z`;
}

/**
 * The three neighbouring faces of the icosahedron, tilted away beyond each edge of the face
 * pressed to the window. `depth`: how far out their tips reach, in circumradii.
 */
function neighbours(cx: number, cy: number, r: number, depth: number) {
  const hw = (r * S3) / 2;
  const a: [number, number] = [cx - hw, cy - r / 2];
  const b: [number, number] = [cx + hw, cy - r / 2];
  const c: [number, number] = [cx, cy + r];
  const edges: [[number, number], [number, number], [number, number]][] = [
    [a, b, [0, -1]],
    [b, c, [S3 / 2, 0.5]],
    [c, a, [-S3 / 2, 0.5]],
  ];
  return edges.map(([p, q, n]) => {
    const tip = [(p[0] + q[0]) / 2 + n[0] * depth * r, (p[1] + q[1]) / 2 + n[1] * depth * r];
    return `M${r2(p[0])} ${r2(p[1])}L${r2(q[0])} ${r2(q[1])}L${r2(tip[0])} ${r2(tip[1])}Z`;
  });
}

/** Gradients a die needs, under `id` (put them in a <Defs>). */
export function DieDefs({ id }: { id: string }) {
  return (
    <>
      <LinearGradient id={`${id}-face`} x1="0" y1="0" x2="0.35" y2="1">
        <Stop offset="0" stopColor="#4A60FF" />
        <Stop offset="0.55" stopColor="#2F45EC" />
        <Stop offset="1" stopColor="#1C2CBC" />
      </LinearGradient>
      <LinearGradient id={`${id}-side`} x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0" stopColor="#1A278F" />
        <Stop offset="1" stopColor="#0A1150" />
      </LinearGradient>
    </>
  );
}

/** The die: the face against the window, its bevel, and (optionally) its neighbours tilting away. */
export function Die({
  id,
  cx,
  cy,
  r,
  sides = true,
  children,
}: {
  id: string;
  cx: number;
  cy: number;
  r: number;
  sides?: boolean;
  children?: ReactNode;
}) {
  // Rounded corners: the face is stroked in its own colour with round joins
  const round = r2(r * 0.14);
  return (
    <G>
      {sides &&
        neighbours(cx, cy, r, 0.6).map((d, i) => (
          <Path
            key={i}
            d={d}
            fill={`url(#${id}-side)`}
            stroke={`url(#${id}-side)`}
            strokeWidth={round}
            strokeLinejoin="round"
            opacity={0.8}
          />
        ))}
      <Path
        d={tri(cx, cy, r)}
        fill={`url(#${id}-face)`}
        stroke={`url(#${id}-face)`}
        strokeWidth={round}
        strokeLinejoin="round"
      />
      {/* A bevel just inside the edge: the moulded rim of the face */}
      <Path
        d={tri(cx, cy + r * 0.04, r * 0.84)}
        fill="none"
        stroke="rgba(185,200,255,0.3)"
        strokeWidth={r2(Math.max(0.6, r * 0.016))}
        strokeLinejoin="round"
      />
      {children}
    </G>
  );
}

/* ------------------------------------------------------------------------------------------ */
/* On the dial                                                                                 */
/* ------------------------------------------------------------------------------------------ */

/** The dial's 358-unit square (bet-dial.tsx). */
const DC = 179;
/** Inside the minute ticks. */
const DIAL_WIN = 130;

/**
 * Bubbles in the window. The web's rise through it; the dial's layers are SVG drawn in one canvas
 * (moving them would redraw the whole dial every frame), so here each is caught part-way up its
 * run (`at`, 0 at the bottom of the window, 1 at the top), faded as it would be there.
 */
const DIAL_BUBBLES = Array.from({ length: 18 }, (_, i) => {
  const at = frac(i, 84);
  return {
    x: Math.round(-74 + frac(i, 81) * 148 + (frac(i, 85) - 0.5) * 7),
    y: r2(DC + 138 - at * 270),
    r: r2(1.3 + frac(i, 82) * 2.6),
    // lc-e8-rise: in over the first 12%, out over the last 20%
    o: r2(Math.min(1, at / 0.12, (1 - at) / 0.2)),
  };
});

/** Ink clouds drifting over the die (the web's blurred ellipses, as soft radial blots). */
const MURK = [
  { cx: DC - 48, cy: DC - 30, rx: 62, ry: 40, fill: '#02040F' },
  { cx: DC + 56, cy: DC + 18, rx: 54, ry: 44, fill: '#030617' },
  { cx: DC - 6, cy: DC + 74, rx: 70, ry: 30, fill: '#02040F' },
];

/**
 * The die in the dial's window, framing the time. With no bet it's pressed right up to the
 * glass, crisp and bright ("It is certain"). As the bet grows it sinks into the murk: blurred,
 * dimmer, the ink clouding over it and more bubbles rising. Under the minute ticks.
 *
 * Held still: the web's die rocks, its ink turns and its bubbles rise, but this layer shares the
 * dial's one SVG canvas, where any motion would redraw the whole dial every frame.
 */
export function EightBallDie({ p }: DialLayerProps) {
  const id = `e8d-${cleanId(useId())}`;
  const blur = r2(p * 2.6);
  const bubbles = DIAL_BUBBLES.slice(0, 3 + Math.round(p * 15));
  return (
    <G>
      <Defs>
        <DieDefs id={id} />
        <ClipPath id={`${id}-win`}>
          <Circle cx={DC} cy={DC} r={DIAL_WIN} />
        </ClipPath>
        <RadialGradient id={`${id}-glow`}>
          <Stop offset="0" stopColor="#4A66FF" stopOpacity={0.55} />
          <Stop offset="1" stopColor="#4A66FF" stopOpacity={0} />
        </RadialGradient>
        {MURK.map((m, i) => (
          <RadialGradient key={i} id={`${id}-murk${i}`}>
            <Stop offset="0" stopColor={m.fill} stopOpacity={1} />
            <Stop offset="0.5" stopColor={m.fill} stopOpacity={0.75} />
            <Stop offset="1" stopColor={m.fill} stopOpacity={0} />
          </RadialGradient>
        ))}
      </Defs>
      <G clipPath={`url(#${id}-win)`}>
        {/* Light coming up through the liquid behind the die */}
        <Circle cx={DC} cy={DC + 10} r={120} fill={`url(#${id}-glow)`} opacity={0.75 - p * 0.45} />
        <G opacity={r2(1 - p * 0.42)}>
          {/* Out of focus: its edges spread into the liquid. (The web blurs it with a filter; here
              that would re-run every time the dial redraws, every frame of a drag, so wider,
              fainter copies of its outline soften it instead.) */}
          {blur > 0.05 &&
            [2, 4, 6].map((k) => (
              <Path
                key={k}
                d={tri(DC, DC + 6, 110)}
                fill="none"
                stroke={`url(#${id}-face)`}
                // The face's own rounding stroke (Die), spread wider
                strokeWidth={110 * 0.14 + blur * k}
                strokeLinejoin="round"
                strokeOpacity={0.22}
              />
            ))}
          <Die id={id} cx={DC} cy={DC + 6} r={110} />
        </G>
        {/* Ink clouding over the die as the bet grows (grown by the web's blur radius) */}
        <G opacity={r2(0.08 + p * 0.62)}>
          {MURK.map((m, i) => (
            <Ellipse key={i} cx={m.cx} cy={m.cy} rx={m.rx + 26} ry={m.ry + 26} fill={`url(#${id}-murk${i})`} />
          ))}
        </G>
        {/* Bubbles on their way up */}
        {bubbles.map((b, i) => (
          <G key={i} opacity={b.o}>
            <Circle
              cx={DC + b.x}
              cy={b.y}
              r={b.r}
              fill="rgba(170,195,255,0.1)"
              stroke="rgba(205,220,255,0.55)"
              strokeWidth={0.7}
            />
            <Circle cx={r2(DC + b.x - b.r * 0.35)} cy={r2(b.y - b.r * 0.35)} r={r2(b.r * 0.3)} fill="rgba(255,255,255,0.8)" />
          </G>
        ))}
      </G>
    </G>
  );
}

/* ------------------------------------------------------------------------------------------ */
/* Roll and result                                                                             */
/* ------------------------------------------------------------------------------------------ */

/** lc-e8-bob: the die rocking gently in the liquid */
export const BOB_KF = css.keyframes({
  '0%, 100%': { transform: [{ translateY: 0 }, { rotate: '-1.4deg' }] },
  '50%': { transform: [{ translateY: -4 }, { rotate: '1.4deg' }] },
});

/** lc-e8-rise: a bubble rising 58 pt over the progress bar, fading in and out */
const RISE_KF = css.keyframes({
  '0%': { opacity: 0, transform: [{ translateY: 0 }] },
  '12%': { opacity: 1 },
  '80%': { opacity: 1 },
  '100%': { opacity: 0, transform: [{ translateY: -58 }] },
});

/** The die rising out of the dark: up from below the bar, turning upright, over the whole roll. */
const SURFACE_KF = css.keyframes({
  from: { opacity: 0.3, transform: [{ translateY: 46 }, { rotate: '-50deg' }] },
  to: { opacity: 1, transform: [{ translateY: 4 }, { rotate: '0deg' }] },
});

const ROLL_BUBBLES = Array.from({ length: 12 }, (_, i) => ({
  x: Math.round(8 + frac(i, 101) * 84),
  size: r2(3 + frac(i, 102) * 4),
  dur: r2(1.1 + frac(i, 103) * 1.1),
  delay: r2(frac(i, 104) * 1.6),
}));

/** Room above the bar for the bubbles to rise into; everything below the bar is clipped. */
const ROLL_HEADROOM = 30;

/**
 * Over the progress bar while the draw rolls: the die floating up out of the dark, bubbles
 * streaming past. (The web tints the bubbles with the text colour; this is the theme's ink.)
 */
export function EightBallRoll() {
  const id = `e8r-${cleanId(useId())}`;
  return (
    // Clipped along the bottom (the bar), so the die rises out of it
    <View style={{ width: 200, height: 48 + ROLL_HEADROOM, overflow: 'hidden' }}>
      <View style={{ position: 'absolute', left: 20, bottom: 0, width: 160, height: 48 }}>
        {ROLL_BUBBLES.map((b, i) => (
          <Animated.View
            key={i}
            style={{
              position: 'absolute',
              bottom: 0,
              left: `${b.x}%`,
              width: b.size,
              height: b.size,
              borderRadius: b.size,
              borderWidth: 1,
              borderColor: 'rgba(238,241,255,0.55)',
              animationName: RISE_KF,
              animationDuration: `${b.dur}s`,
              animationDelay: `${b.delay}s`,
              animationIterationCount: 'infinite',
              animationTimingFunction: 'linear',
              animationFillMode: 'both',
            }}
          />
        ))}
        <Animated.View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 80 - 24,
            width: 48,
            height: 48,
            animationName: SURFACE_KF,
            animationDuration: `${ROLL_MS}ms`,
            animationFillMode: 'both',
            animationTimingFunction: cubicBezier(0.2, 0.7, 0.2, 1),
          }}
        >
          <Svg viewBox="0 0 48 48" width={48} height={48}>
            <Defs>
              <DieDefs id={id} />
            </Defs>
            <Die id={id} cx={24} cy={20} r={19} sides={false}>
              <Text
                x={24}
                y={17}
                textAnchor="middle"
                alignmentBaseline="central"
                fontSize={13}
                fontFamily={fontFor('mono', 700)}
                fill="#FFFFFF"
              >
                ?
              </Text>
            </Die>
          </Svg>
        </Animated.View>
      </View>
    </View>
  );
}

/** lc-mu-pop: popping up beside the result */
const POP_KF = css.keyframes({
  '0%': { transform: [{ scale: 0 }, { rotate: '-40deg' }] },
  '60%': { transform: [{ scale: 1.18 }, { rotate: '8deg' }] },
  '100%': { transform: [{ scale: 1 }, { rotate: '0deg' }] },
});

/** Beside the result badge: the die, answering YES (a snooze), NO (late) or a sparkle (on the dot). */
export function EightBallVerdict({ mood }: { mood: SceneMood }) {
  const id = `e8v-${cleanId(useId())}`;
  if (mood !== 'win' && mood !== 'loss' && mood !== 'jackpot') return null;
  const word = mood === 'win' ? 'YES' : mood === 'loss' ? 'NO' : null;
  return (
    <Animated.View
      key={mood}
      style={{
        animationName: POP_KF,
        animationDuration: '0.45s',
        animationFillMode: 'both',
        animationTimingFunction: cubicBezier(0.2, 0.9, 0.3, 1.2),
      }}
    >
      <Animated.View
        style={{
          animationName: BOB_KF,
          animationDuration: '3.2s',
          animationDelay: '0.45s',
          animationIterationCount: 'infinite',
          animationTimingFunction: 'ease-in-out',
        }}
      >
        <Svg viewBox="0 0 48 48" width={48} height={48}>
          <Defs>
            <DieDefs id={id} />
          </Defs>
          <Die id={id} cx={24} cy={21} r={20} sides={false}>
            {word ? (
              <Text
                x={24}
                y={17.5}
                textAnchor="middle"
                alignmentBaseline="central"
                fontSize={word.length > 2 ? 9 : 10.5}
                fontFamily={fontFor('mono', 800)}
                letterSpacing={word.length > 2 ? 0.36 : 0.42}
                fill="#FFFFFF"
              >
                {word}
              </Text>
            ) : (
              <Path d="M24 9.5c.5 4 2 5.5 6 6-4 .5-5.5 2-6 6-.5-4-2-5.5-6-6 4-.5 5.5-2 6-6z" fill="#FFFFFF" />
            )}
          </Die>
        </Svg>
      </Animated.View>
    </Animated.View>
  );
}
