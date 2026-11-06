/**
 * The moka pot (web: MokaPot, MokaFace, MokaVerdict and CafeRoll in cafe-art.tsx). One face per
 * bet tier (the mascot beside the tier name), plus a few for the draw and the result. Drawn on a
 * 48-unit grid: chunky boiler (where the face is), a small collector on top, the spout to the
 * left and a bakelite handle to the right.
 */
import { memo } from 'react';
import { View } from 'react-native';
import Animated, { cubicBezier } from 'react-native-reanimated';
import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';

import { KF, loop } from '../anim';
import type { SceneMood } from '../types';
import { DOZE, FLICKER, POP, puffFor, RATTLE } from './keyframes';
import { CA, HEART } from './palette';

export type MokaMood = 'sleepy' | 'calm' | 'happy' | 'excited' | 'jittery' | 'boiling' | 'love' | 'eager';

/** Decaf → the whole moka: dozing, sipping, grinning, wide awake, jittery, boiling over. */
const TIER_MOODS: MokaMood[] = ['sleepy', 'calm', 'happy', 'excited', 'jittery', 'boiling'];

const W1 = 'M9.4 7.4c-1.8-1.6 1.4-2.9-.2-4.9';
const W2 = 'M16.4 5.4c-1.6-1.4 1.2-2.4-.2-4.3';
const W3 = 'M31.8 5.4c1.6-1.4-1.2-2.4.2-4.3';
const STEAM: Record<MokaMood, string[]> = {
  sleepy: [],
  calm: [W1],
  happy: [W1, W3],
  excited: [W1, W2, W3],
  jittery: [W1, W2, W3],
  boiling: [],
  love: [],
  eager: [W1, W3],
};

/** The pot itself, as SVG elements on its 48-unit grid (the café table draws it faceless). */
export function MokaBody() {
  return (
    <G stroke={CA.ink} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round">
      {/* Handle and spout, behind the collector */}
      <Path
        d="M32.2 11.2 39.8 11.8Q41 12 40.7 13.2L38.4 20.6Q38 21.6 37 21.2L34.6 20.2 36.2 14.6 31.8 14.4Z"
        fill={CA.bakelite}
      />
      <Path d="M16 10.8 10.2 9.2Q9.3 9.1 9.8 9.9L16.6 14.4Z" fill={CA.steel} />
      {/* Collector, with a lit facet and a shaded one */}
      <Path d="M15.2 10.4H32.8L29.6 19.6H18.4Z" fill={CA.steel} stroke="none" />
      <Path d="M15.2 10.4H19.8L20.8 19.6H18.4Z" fill={CA.steelLight} stroke="none" />
      <Path d="M28.2 10.4H32.8L29.6 19.6H27.2Z" fill={CA.steelMid} stroke="none" />
      <Path d="M15.2 10.4H32.8L29.6 19.6H18.4Z" fill="none" />
      {/* Lid and knob */}
      <Path d="M14.6 10.6Q24 4.8 33.4 10.6Z" fill={CA.steel} />
      <Rect x={21.6} y={3.6} width={4.8} height={4.2} rx={1.6} fill={CA.bakelite} />
      {/* Waist */}
      <Rect x={17.6} y={19.6} width={12.8} height={2.4} rx={0.6} fill={CA.steelDark} />
      {/* Boiler: where the face lives */}
      <Path d="M17.8 22H30.2L37.8 42.6H10.2Z" fill={CA.steel} stroke="none" />
      <Path d="M17.8 22H19.8L14.6 42.6H10.2Z" fill={CA.steelLight} stroke="none" />
      <Path d="M28.2 22H30.2L37.8 42.6H33.4Z" fill={CA.steelMid} stroke="none" />
      <Path d="M17.8 22H30.2L37.8 42.6H10.2Z" fill="none" />
      <Rect x={9.4} y={42.4} width={29.2} height={2.9} rx={1.4} fill={CA.steelDark} />
      {/* Glints */}
      <Path d="M17 12.4 17.8 17.6M15.8 26 13.6 38.6" stroke="#FFFFFF" strokeWidth={1.1} opacity={0.9} />
    </G>
  );
}

function Dot({ x, y, r = 1.6 }: { x: number; y: number; r?: number }) {
  return (
    <>
      <Circle cx={x} cy={y} r={r} fill={CA.ink} />
      <Circle cx={x + r * 0.35} cy={y - r * 0.35} r={r * 0.32} fill="#FFFFFF" />
    </>
  );
}

function Cheeks({ hot }: { hot?: boolean }) {
  return (
    <G fill={hot ? '#E5654E' : CA.blush} opacity={hot ? 0.8 : 0.75}>
      <Ellipse cx={17.8} cy={34.6} rx={1.7} ry={1.1} />
      <Ellipse cx={30.2} cy={34.6} rx={1.7} ry={1.1} />
    </G>
  );
}

/** Motion marks either side of the boiler: it's rattling on the stove. */
function Rattle() {
  return (
    <Path
      d="M7.4 27.4 5.2 26.4M6.8 32H4.2M7.4 36.6 5.2 37.6M40.6 27.4 42.8 26.4M41.2 32H43.8M40.6 36.6 42.8 37.6"
      fill="none"
      stroke={CA.ink}
      strokeWidth={1.2}
      strokeLinecap="round"
    />
  );
}

const LINE = { fill: 'none', stroke: CA.ink, strokeWidth: 1.4, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

function BigSmile() {
  return (
    <>
      <Path
        d="M20.8 34.6H27.2Q26.8 38.6 24 38.6T20.8 34.6Z"
        fill={CA.mouth}
        stroke={CA.ink}
        strokeWidth={1.2}
        strokeLinejoin="round"
      />
      <Path d="M22.4 37.4Q24 36.4 25.6 37.4 25 38.3 24 38.3T22.4 37.4Z" fill={CA.tongue} />
    </>
  );
}

function Face({ mood }: { mood: MokaMood }) {
  switch (mood) {
    case 'sleepy':
      return (
        <>
          <Path d="M18.9 31.6q1.9 1.5 3.8 0M25.3 31.6q1.9 1.5 3.8 0" {...LINE} />
          <Path d="M22.9 36.2q1.1.8 2.2 0" {...LINE} />
          <Cheeks />
          <Path d="M36.2 2.6h3l-3 3.2h3M41.4.2h2l-2 2.1h2" {...LINE} strokeWidth={1.1} />
        </>
      );
    case 'calm':
      return (
        <>
          <Dot x={20.8} y={31.6} />
          <Dot x={27.2} y={31.6} />
          <Path d="M21.8 35.4q2.2 1.9 4.4 0" {...LINE} />
          <Cheeks />
        </>
      );
    case 'happy':
      return (
        <>
          <Path d="M19 32.4q1.8-2.2 3.6 0M25.4 32.4q1.8-2.2 3.6 0" {...LINE} />
          <BigSmile />
          <Cheeks />
        </>
      );
    case 'excited':
      return (
        <>
          <Path d="M18.8 27.6q1.6-1.2 3.2-.3M29.2 27.6q-1.6-1.2-3.2-.3" {...LINE} strokeWidth={1.1} />
          {[20.6, 27.4].map((x) => (
            <G key={x}>
              <Circle cx={x} cy={31.4} r={2.4} fill="#FFFFFF" stroke={CA.ink} strokeWidth={1.1} />
              <Dot x={x + 0.2} y={31.7} r={1.25} />
            </G>
          ))}
          <BigSmile />
          <Cheeks />
          {/* A sparkle off the lid */}
          <Path
            d="M40.6 3.4c.3 1.5.8 2 2.3 2.3-1.5.3-2 .8-2.3 2.3-.3-1.5-.8-2-2.3-2.3 1.5-.3 2-.8 2.3-2.3Z"
            fill={CA.ochre}
            stroke={CA.ink}
            strokeWidth={0.8}
            strokeLinejoin="round"
          />
        </>
      );
    case 'jittery':
      return (
        <>
          {[20.4, 27.6].map((x) => (
            <Circle key={x} cx={x} cy={31.2} r={2.6} fill="#FFFFFF" stroke={CA.ink} strokeWidth={1.1} />
          ))}
          <Circle cx={19.6} cy={30.6} r={0.8} fill={CA.ink} />
          <Circle cx={28.4} cy={31.9} r={0.8} fill={CA.ink} />
          <Path d="M20.4 36.4l1.2-1.1 1.2 1.1 1.2-1.1 1.2 1.1 1.2-1.1 1.2 1.1" {...LINE} strokeWidth={1.2} />
          <Path d="M13.4 21.4q-1.6 2.4 0 3.4 1.6-1 0-3.4Z" fill="#9BD0EA" stroke={CA.ink} strokeWidth={0.9} />
          <Rattle />
        </>
      );
    case 'boiling':
      return (
        <>
          <Path d="M19 29.8l3.2 1.8-3.2 1.8M29 29.8l-3.2 1.8 3.2 1.8" {...LINE} strokeWidth={1.5} />
          <Ellipse cx={24} cy={36.8} rx={2.7} ry={2.4} fill={CA.mouth} stroke={CA.ink} strokeWidth={1.2} />
          <Cheeks hot />
          <Rattle />
          {/* Coffee boiling out of the spout, under a blast of steam */}
          <Path d="M10.4 9.6q-1.6 2.6-.4 4.4 1.3-.9.9-2.8" fill={CA.espresso} stroke={CA.ink} strokeWidth={0.9} />
          <G fill="#FFF8EE" stroke={CA.ink} strokeWidth={1.1}>
            <Circle cx={5.6} cy={4.4} r={2.6} />
            <Circle cx={9.4} cy={2.6} r={3.2} />
            <Circle cx={13.8} cy={3.4} r={2.4} />
            <Circle cx={36} cy={3.2} r={2.2} />
            <Circle cx={39.6} cy={1.6} r={2.8} />
          </G>
        </>
      );
    case 'love':
      return (
        <>
          {[20.6, 27.4].map((x) => (
            <Path
              key={x}
              d={HEART}
              transform={`translate(${x} 31.6) scale(0.34)`}
              fill={CA.terracotta}
              stroke={CA.ink}
              strokeWidth={2.6}
            />
          ))}
          <BigSmile />
          <Cheeks />
          <Path d={HEART} transform="translate(9 3.6) scale(0.32)" fill={CA.terracotta} />
          <Path d={HEART} transform="translate(38.4 2.6) scale(0.26)" fill={CA.pink} />
        </>
      );
    case 'eager':
      return (
        <>
          <Dot x={20.8} y={30.8} />
          <Dot x={27.2} y={30.8} />
          <Path d="M19 28q1.6-1.1 3.2-.4M29 28q-1.6-1.1-3.2-.4" {...LINE} strokeWidth={1.1} />
          <Circle cx={24} cy={36} r={1.3} fill={CA.mouth} stroke={CA.ink} strokeWidth={1.1} />
          <Cheeks />
        </>
      );
  }
}

/** Where the puffs rise from (spout, lid, spout, lid) and their delays, in moka units and s. */
const PUFFS = [
  [9.6, 7.6, 0],
  [16, 5, 0.45],
  [9.6, 7.6, 0.9],
  [31.6, 5, 1.2],
];

/**
 * Little steam puffs rising off the spout and the lid, one after another, as round Views laid
 * over a moka drawn at `unit` pt per grid unit whose box starts at (left, top).
 */
export function Puffs({ unit, left = 0, top = 0 }: { unit: number; left?: number; top?: number }) {
  const puff = puffFor(Math.round(unit * 100) / 100);
  const d = 4 * unit;
  return (
    <>
      {PUFFS.map(([x, y, delay], i) => (
        <Animated.View
          key={i}
          style={{
            position: 'absolute',
            left: left + (x - 2) * unit,
            top: top + (y - 2) * unit,
            width: d,
            height: d,
            borderRadius: d / 2,
            backgroundColor: '#FFF8EE',
            borderWidth: 0.9 * unit,
            borderColor: CA.ink,
            opacity: 0,
            ...loop(puff, 1.6, { delay, ease: 'ease-out' }),
          }}
        />
      ))}
    </>
  );
}

/** Room round the moka's grid, in its units, for steam and sparkles drawn past its edges. */
const PAD = 4;

/**
 * A moka pot with a face, `size` pt square. `puffing`: the steam rises in puffs instead of being
 * drawn on.
 */
export const MokaPot = memo(function MokaPot({
  mood,
  size,
  puffing,
}: {
  mood: MokaMood;
  size: number;
  puffing?: boolean;
}) {
  const k = (48 + PAD * 2) / 48;
  return (
    <View style={{ width: size, height: size }}>
      {/* The puffs rise from behind the pot */}
      {puffing && <Puffs unit={size / 48} />}
      {/* Drawn with a margin round the 48-unit box: the boiling steam pokes out past the lid */}
      <Svg
        viewBox={`${-PAD} ${-PAD} ${48 + PAD * 2} ${48 + PAD * 2}`}
        width={size * k}
        height={size * k}
        style={{ position: 'absolute', left: (-PAD * size) / 48, top: (-PAD * size) / 48 }}
      >
        {!puffing &&
          STEAM[mood].map((d) => (
            <Path key={d} d={d} fill="none" stroke={CA.ink} strokeWidth={1.3} strokeLinecap="round" opacity={0.7} />
          ))}
        <MokaBody />
        <Face mood={mood} />
      </Svg>
    </View>
  );
});

/** The mascot beside the tier name: a moka pot more wired at every tier. */
export function MokaFace({ tier, size }: { tier: number; size: number }) {
  return <MokaPot mood={TIER_MOODS[Math.max(0, Math.min(TIER_MOODS.length - 1, tier))]} size={size} />;
}

/** Beside the result badge: dozes off (snooze), boils over (late), or falls in love (on the dot). */
export function MokaVerdict({ mood }: { mood: SceneMood }) {
  if (mood !== 'win' && mood !== 'loss' && mood !== 'jackpot') return null;
  const face: MokaMood = mood === 'win' ? 'sleepy' : mood === 'loss' ? 'boiling' : 'love';
  const move =
    mood === 'loss'
      ? loop(RATTLE, 0.18, { delay: 0.45, ease: 'linear' })
      : mood === 'jackpot'
        ? loop(KF.bob, 0.9, { delay: 0.45 })
        : loop(DOZE, 3, { delay: 0.45 });
  return (
    <Animated.View
      key={mood}
      pointerEvents="none"
      style={{
        width: 48,
        height: 48,
        animationName: POP,
        animationDuration: '0.45s',
        animationTimingFunction: cubicBezier(0.2, 0.9, 0.3, 1.2),
        animationFillMode: 'both',
      }}
    >
      <Animated.View style={{ transformOrigin: '50% 100%', ...move }}>
        <MokaPot mood={face} size={48} />
      </Animated.View>
    </Animated.View>
  );
}

/** The gas ring's flames, on its 58 × 10 grid (one pt per unit). */
const FLAMES = [17, 23, 29, 35, 41];
const flame = (x: number) => `M${x} 6c-1.6-1.4-1.2-3.2 0-4.6 1.2 1.4 1.6 3.2 0 4.6Z`;

/** Shown above the progress bar while the draw rolls: the moka on the stove, about to gurgle. */
export function CafeRoll() {
  return (
    <View pointerEvents="none" style={{ width: 58, height: 58, marginBottom: 8 }}>
      <Animated.View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          height: 50,
          alignItems: 'center',
          transformOrigin: '50% 100%',
          ...loop(RATTLE, 0.22, { ease: 'linear' }),
        }}
      >
        <MokaPot mood="eager" puffing size={50} />
      </Animated.View>
      {/* A gas ring underneath, its little blue flames flickering */}
      <View style={{ position: 'absolute', left: 0, bottom: 0, width: 58, height: 10 }}>
        {FLAMES.map((x, i) => (
          <Animated.View
            key={x}
            style={{
              position: 'absolute',
              left: x - 2.5,
              top: 0,
              width: 5,
              height: 7,
              // The flame's foot, like the web's fill-box 50% 100%
              transformOrigin: [2.5, 6, 0],
              ...loop(FLICKER, 0.4, { delay: -i * 0.13 }),
            }}
          >
            <Svg viewBox={`${x - 2.5} 0 5 7`} width={5} height={7}>
              <Path d={flame(x)} fill="#6FA8DC" stroke={CA.ink} strokeWidth={0.6} />
            </Svg>
          </Animated.View>
        ))}
        <Svg viewBox="0 0 58 10" width={58} height={10} style={{ position: 'absolute', left: 0, top: 0 }}>
          <Rect x={12} y={6} width={34} height={2.6} rx={1.3} fill={CA.bakelite} />
        </Svg>
      </View>
    </View>
  );
}
