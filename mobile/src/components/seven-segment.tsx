/**
 * The bedside clock shown once the alarm is set, ported from web/src/components/seven-segment.tsx:
 * seven-segment digits with the unlit segments faintly visible, like a real display.
 */
import { StyleSheet, View } from 'react-native';
import Animated, { steps } from 'react-native-reanimated';
import Svg, { Circle, G, Polygon, Text as SvgText } from 'react-native-svg';

import { KF } from '@/scenes/anim';
import { fontFor, type FontKey } from '@/themes/fonts';
import { splitClock } from '@/lib/time';

/** Digit cell in SVG units. */
const W = 48;
const H = 88;
const T = 9; // segment thickness
const G_ = 1.6; // gap between segments
const h = T / 2;

function hSeg(x1: number, x2: number, y: number) {
  return `${x1},${y} ${x1 + h},${y - h} ${x2 - h},${y - h} ${x2},${y} ${x2 - h},${y + h} ${x1 + h},${y + h}`;
}
function vSeg(x: number, y1: number, y2: number) {
  return `${x},${y1} ${x + h},${y1 + h} ${x + h},${y2 - h} ${x},${y2} ${x - h},${y2 - h} ${x - h},${y1 + h}`;
}

const SEG = {
  a: hSeg(h + G_, W - h - G_, h),
  b: vSeg(W - h, h + G_, H / 2 - G_),
  c: vSeg(W - h, H / 2 + G_, H - h - G_),
  d: hSeg(h + G_, W - h - G_, H - h),
  e: vSeg(h, H / 2 + G_, H - h - G_),
  f: vSeg(h, h + G_, H / 2 - G_),
  g: hSeg(h + G_, W - h - G_, H / 2),
} as const;

type SegName = keyof typeof SEG;
const ALL = Object.keys(SEG) as SegName[];
const DIGITS = ['abcdef', 'bc', 'abdeg', 'abcdg', 'bcfg', 'acdfg', 'acdefg', 'abc', 'abcdefg', 'abcdfg'];

const GAP = 12;
const COLON = 18;
const SLOTS = [0, W + GAP, 2 * W + 2 * GAP + COLON, 3 * W + 3 * GAP + COLON];
const COLON_X = (SLOTS[1] + W + SLOTS[2]) / 2;
const AMPM_X = SLOTS[3] + W + 14;
const VB_Y = -8;
const VB_H = 104;

type Props = {
  /** Minutes from midnight. */
  minutes: number;
  on: string;
  off: string;
  glow: string | null;
  font: FontKey;
  /** Whole display blinks, like a clock that's just been set. */
  blink?: boolean;
  /** Colon ticks once a second, like a running clock. */
  running?: boolean;
  /** Rendered height; width follows the digits. */
  height: number;
};

/** Width the clock takes at a given height, for `minutes` (one- or two-digit hour). */
export function sevenSegmentWidth(minutes: number, height: number) {
  const { minX, maxX } = bounds(minutes);
  return ((maxX - minX) / VB_H) * height;
}

function bounds(minutes: number) {
  const { h12 } = splitClock(minutes);
  const firstSlot = h12 >= 10 ? 0 : 1;
  return { firstSlot, minX: SLOTS[firstSlot] - 16, maxX: AMPM_X + 30 };
}

const blinkStyle = {
  animationName: KF.stepBlink,
  animationDuration: '1s',
  animationIterationCount: 'infinite',
  animationTimingFunction: steps(1),
} as const;

export function SevenSegment({ minutes, on, off, glow, font, blink, running, height }: Props) {
  const { h12, minute, pm } = splitClock(minutes);
  const digits = [h12 >= 10 ? 1 : null, h12 % 10, Math.floor(minute / 10), minute % 10];
  const { firstSlot, minX, maxX } = bounds(minutes);
  const vb = `${minX} ${VB_Y} ${maxX - minX} ${VB_H}`;
  const width = ((maxX - minX) / VB_H) * height;
  const fam = fontFor(font, 700);

  const lit = (glowLayer: boolean) => (
    <G transform="skewX(-6)">
      {SLOTS.map((x, i) => {
        const d = digits[i];
        if (d === null) return null;
        return (
          <G key={i} transform={`translate(${x} 0)`}>
            {DIGITS[d].split('').map((s) => (
              <Polygon
                key={s}
                points={SEG[s as SegName]}
                fill={glowLayer ? 'none' : on}
                stroke={glowLayer ? glow! : 'none'}
                strokeWidth={glowLayer ? 7 : 0}
                strokeOpacity={glowLayer ? 0.45 : 1}
                strokeLinejoin="round"
              />
            ))}
          </G>
        );
      })}
      <SvgText x={AMPM_X} y={pm ? 56 : 30} fontSize={15} fontFamily={fam} fill={glowLayer ? 'none' : on}>
        {pm ? 'PM' : 'AM'}
      </SvgText>
    </G>
  );

  const colon = (
    <G transform="skewX(-6)">
      <Circle cx={COLON_X} cy={28} r={4.8} fill={on} />
      <Circle cx={COLON_X} cy={60} r={4.8} fill={on} />
    </G>
  );

  return (
    <View
      style={{ width, height }}
      accessible
      accessibilityRole="image"
      accessibilityLabel={`${h12}:${String(minute).padStart(2, '0')} ${pm ? 'PM' : 'AM'}`}
    >
      {/* Unlit segments, so it reads as a real display */}
      <Svg width={width} height={height} viewBox={vb} style={StyleSheet.absoluteFill}>
        <G transform="skewX(-6)">
          {SLOTS.slice(firstSlot).map((x) => (
            <G key={x} transform={`translate(${x} 0)`}>
              {ALL.map((s) => (
                <Polygon key={s} points={SEG[s]} fill={off} />
              ))}
            </G>
          ))}
          <SvgText x={AMPM_X} y={30} fontSize={15} fontFamily={fam} fill={off}>
            AM
          </SvgText>
          <SvgText x={AMPM_X} y={56} fontSize={15} fontFamily={fam} fill={off}>
            PM
          </SvgText>
        </G>
      </Svg>

      <Animated.View style={[StyleSheet.absoluteFill, blink ? blinkStyle : null]}>
        {glow && (
          <Svg width={width} height={height} viewBox={vb} style={StyleSheet.absoluteFill}>
            {lit(true)}
          </Svg>
        )}
        <Svg width={width} height={height} viewBox={vb} style={StyleSheet.absoluteFill}>
          {lit(false)}
        </Svg>
        <Animated.View style={[StyleSheet.absoluteFill, running ? blinkStyle : null]}>
          <Svg width={width} height={height} viewBox={vb}>
            {colon}
          </Svg>
        </Animated.View>
      </Animated.View>
    </View>
  );
}
