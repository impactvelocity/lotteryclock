/**
 * The bottom of the scene as a timeline (ported from web/src/components/alarm-rail.tsx): the
 * Set Alarm button marks the target time, minute ticks hang down either side, and the ones
 * inside the bet light up. After a draw, a pin marks where the alarm really rang.
 */
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { css, FadeInDown } from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Line, Mask, Path, Rect, Stop } from 'react-native-svg';

import { Confetti } from '@/components/confetti';
import { KF, loop } from '@/scenes/anim';
import { sans } from '@/themes/fonts';
import { contrast, css as rgb, edgeColor, isDark, MAX_RANGE, mixHex, ramp, type Theme } from '@/themes/themes';

export type RailPhase = 'idle' | 'dropping' | 'blink' | 'armed' | 'rolling' | 'result';

/** Tick heights in pt (unlit short / long); lit ones grow by the theme's railTicks.lit. */
const BASE_SHORT = 6;
const BASE_LONG = 11;
/** Breathing room between the button housing and minute 1. */
const ZERO_GAP = 0;
/** The timeline starts this far under the button housing, so the ticks emerge from beneath it. */
const UNDER = 22;
/** Edge depth of the 3D button. */
const EDGE = 3;
const BUTTON_H = 56;
const HOUSING_PAD = 6;

export function tickHeight(t: Theme) {
  return Math.ceil(BASE_LONG * Math.min(1.8, t.railTicks?.lit ?? 2)) + 2;
}

type Props = {
  theme: Theme;
  phase: RailPhase;
  range: number;
  /** Drawn offset in minutes; negative is early. Only used once there's a result. */
  offset: number;
  rollId: number;
  /** y of the rail line. */
  y: number;
  width: number;
  label: string;
  /** The button can't be pressed (mid-draw). */
  busy: boolean;
  onPress: () => void;
};

export function AlarmRail({ theme: t, phase, range, offset, rollId, y, width, label, busy, onPress }: Props) {
  const [buttonW, setButtonW] = useState(200);
  const latched = phase !== 'idle';
  // Each half reaches under the housing; the button is drawn over it
  const sideW = (width - buttonW) / 2 + UNDER;
  const pinSide = phase === 'result' && offset !== 0 ? (offset < 0 ? 'left' : 'right') : null;

  return (
    <View pointerEvents="box-none" style={{ position: 'absolute', left: 0, top: y, width, height: 0 }}>
      {/* The rail line */}
      <View style={{ position: 'absolute', left: 0, right: 0, top: -2, height: 4, backgroundColor: t.rail }} />

      {/* Ticks hang down from the line, either side of the button */}
      <Ticks side="left" theme={t} range={range} x={0} w={sideW} wave={latched} rollId={rollId} />
      <Ticks side="right" theme={t} range={range} x={width - sideW} w={sideW} wave={latched} rollId={rollId} />
      {pinSide && (
        <Pin
          key={`pin-${rollId}`}
          theme={t}
          range={range}
          minute={Math.abs(offset)}
          x={pinSide === 'left' ? 0 : width - sideW}
          w={sideW}
          side={pinSide}
        />
      )}

      {/* The button, centred on the line */}
      <View
        pointerEvents="box-none"
        style={{ position: 'absolute', left: 0, right: 0, top: -(BUTTON_H + HOUSING_PAD * 2 + EDGE) / 2, alignItems: 'center' }}
      >
        <View onLayout={(e) => setButtonW(e.nativeEvent.layout.width)}>
          <Fillet side="left" color={t.rail} />
          <Fillet side="right" color={t.rail} />
          <PushButton theme={t} phase={phase} label={label} busy={busy} onPress={onPress} />
          {phase === 'result' && offset <= 0 && (
            <Confetti
              key={`confetti-${rollId}`}
              burstId={rollId}
              colors={[t.win, t.arcStops[0], t.arcStops[1], t.arcStops[2], t.button.face]}
            />
          )}
        </View>
      </View>
    </View>
  );
}

function Ticks({
  side,
  theme: t,
  range,
  x,
  w,
  wave,
  rollId,
}: {
  side: 'left' | 'right';
  theme: Theme;
  range: number;
  x: number;
  w: number;
  wave: boolean;
  rollId: number;
}) {
  // Lit ticks grow less than on the web: they hang under the button, so they stay quiet
  const litScale = Math.min(1.8, t.railTicks?.lit ?? 2);
  const tickH = tickHeight(t);
  const tip = t.railTicks?.tip ?? 0.15;
  // The 45 minutes run from just outside the button housing to the screen edge
  const span = Math.max(1, w - ZERO_GAP);
  const step = span / MAX_RANGE;
  const maskId = `rail-${side}`;
  const ticks = Array.from({ length: MAX_RANGE }, (_, k) => k + 1).filter((m) => m % 5 === 0 || step >= 4);

  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: x, top: 2, width: w, height: tickH }}>
      <Svg width={w} height={tickH}>
        <Defs>
          {/* Bars fade out towards their tips */}
          <LinearGradient id={`${maskId}-g`} x1="0" y1="0" x2="0" y2={tickH} gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor="#fff" stopOpacity={1} />
            <Stop offset="0.45" stopColor="#fff" stopOpacity={0.85} />
            <Stop offset="1" stopColor="#fff" stopOpacity={tip} />
          </LinearGradient>
          <Mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width={w} height={tickH}>
            <Rect x="0" y="0" width={w} height={tickH} fill={`url(#${maskId}-g)`} />
          </Mask>
        </Defs>
        {ticks.map((m) => {
          const pos = ZERO_GAP + (m - 0.5) * step;
          const tx = side === 'right' ? pos : w - pos;
          const long = m % 5 === 0;
          const lit = m <= range;
          // Lit bars grow, stepping down over the last few minutes of the window
          const taper = lit ? Math.min(1, (range - m + 1) / 4) : 0;
          // They also rise out of the button: shorter for the first few minutes
          const rise = Math.min(1, 0.45 + (0.55 * (m - 1)) / 4);
          const len = (long ? BASE_LONG : BASE_SHORT) * (1 + (litScale - 1) * taper) * rise;
          return (
            <Line
              key={m}
              x1={tx}
              x2={tx}
              y1={0}
              y2={len}
              mask={lit ? `url(#${maskId})` : undefined}
              strokeLinecap="round"
              strokeWidth={long ? 2 : 1.25}
              stroke={lit ? rgb(ramp(t.railTicks?.ink ?? t.arcStops, m / MAX_RANGE)) : t.rail}
              strokeOpacity={lit ? 0.75 : 0.2}
            />
          );
        })}
      </Svg>
      {/* A ripple runs out along the lit ticks when the alarm is set */}
      {wave && (
        <Animated.View
          key={rollId}
          style={{
            position: 'absolute',
            top: 0,
            width: 30,
            height: tickH,
            [side === 'right' ? 'left' : 'right']: 0,
            opacity: 0,
            backgroundImage: `linear-gradient(${side === 'right' ? 90 : 270}deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.35) 50%, rgba(255,255,255,0) 100%)`,
            animationName: css.keyframes({
              '0%': { opacity: 0, transform: [{ translateX: 0 }] },
              '15%': { opacity: 1 },
              '100%': { opacity: 0, transform: [{ translateX: (side === 'right' ? 1 : -1) * w }] },
            }),
            animationDuration: '700ms',
            animationTimingFunction: 'ease-out',
          }}
        />
      )}
    </View>
  );
}

/** Where it rang: a dot that slides out from under the button to its minute. */
function Pin({
  theme: t,
  range,
  minute,
  x,
  w,
  side,
}: {
  theme: Theme;
  range: number;
  minute: number;
  x: number;
  w: number;
  side: 'left' | 'right';
}) {
  const span = Math.max(1, w - ZERO_GAP);
  const pos = ZERO_GAP + (Math.min(minute, MAX_RANGE) - 0.5) * (span / MAX_RANGE);
  const target = side === 'right' ? x + pos : x + w - pos;
  const from = side === 'right' ? x - 30 : x + w + 30;
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: -8,
        left: target - 8,
        width: 16,
        height: 16,
        borderRadius: 8,
        borderWidth: 3,
        borderColor: t.rail,
        backgroundColor: edgeColor(t, range / MAX_RANGE),
        zIndex: 20,
        animationName: css.keyframes({
          '0%': { opacity: 0, transform: [{ translateX: from - target }] },
          '40%': { opacity: 1 },
          '100%': { opacity: 1, transform: [{ translateX: 0 }] },
        }),
        animationDuration: '700ms',
        animationDelay: '300ms',
        animationFillMode: 'both',
        animationTimingFunction: 'ease-out',
      }}
    />
  );
}

function PushButton({
  theme: t,
  phase,
  label,
  busy,
  onPress,
}: {
  theme: Theme;
  phase: RailPhase;
  label: string;
  busy: boolean;
  onPress: () => void;
}) {
  const latched = phase !== 'idle';
  const ringing = phase === 'dropping' || phase === 'blink';
  // Once pressed, the face takes the rail colour so it reads as part of the line
  const face = latched ? t.rail : t.button.face;
  const railLight = isLight(t.rail);
  const faceInk = !latched
    ? readableInk(t.button.face, t.button.ink)
    : busy
      ? railLight
        ? 'rgba(0,0,0,0.55)'
        : 'rgba(255,255,255,0.7)'
      : railLight
        ? '#1B1B1B'
        : '#FFFFFF';
  const edge = rgb(mixHex(face, '#000000', 0.35));

  return (
    <View
      style={{
        borderRadius: 999,
        padding: HOUSING_PAD,
        paddingBottom: HOUSING_PAD + EDGE,
        backgroundColor: t.rail,
      }}
    >
      <Pressable
        onPress={onPress}
        disabled={busy}
        accessibilityRole="button"
        accessibilityState={{ selected: latched, busy }}
        accessibilityLabel={label}
      >
        {({ pressed }) => (
          <Animated.View
            // Remounted as it latches, so the squash plays once
            key={latched ? 'latched' : 'rest'}
            style={{
              height: BUTTON_H,
              minWidth: 176,
              paddingHorizontal: 32,
              borderRadius: 999,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              backgroundColor: face,
              boxShadow: latched
                ? undefined
                : `inset 0 2px 0 rgba(255,255,255,0.35), 0 ${pressed ? 0 : EDGE}px 0 0 ${edge}`,
              transform: [{ translateY: !latched && pressed ? EDGE : 0 }],
              ...(latched
                ? {
                    animationName: KF_SQUASH,
                    animationDuration: '500ms',
                    animationTimingFunction: 'ease-out',
                  }
                : null),
            }}
          >
            {phase === 'result' ? (
              <Svg width={20} height={20} viewBox="0 0 24 24">
                <Path d="M3.5 12a8.5 8.5 0 1 0 2.5-6" fill="none" stroke={faceInk} strokeWidth={2.6} strokeLinecap="round" />
                <Path d="M3 3.5V8h4.5" fill="none" stroke={faceInk} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            ) : (
              <Animated.View
                style={{
                  transformOrigin: 'top',
                  ...(ringing ? loop(KF.ring, 0.3) : busy ? null : loop(KF.bellNudge, 4.5)),
                }}
              >
                <Svg width={20} height={20} viewBox="0 0 24 24">
                  <Path
                    d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"
                    fill="none"
                    stroke={faceInk}
                    strokeWidth={2.4}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <Path d="M10.3 21a1.9 1.9 0 0 0 3.4 0" fill="none" stroke={faceInk} strokeWidth={2.4} strokeLinecap="round" />
                </Svg>
              </Animated.View>
            )}
            <Animated.View key={label} entering={FadeInDown.duration(220)}>
              <Text style={{ color: faceInk, fontFamily: sans(700), fontSize: 16 }}>{label}</Text>
            </Animated.View>
          </Animated.View>
        )}
      </Pressable>
    </View>
  );
}

/** Pressed flat with a squash-and-stretch bounce as it latches. */
const KF_SQUASH = css.keyframes({
  '0%': { transform: [{ scaleX: 1 }, { scaleY: 1 }] },
  '22%': { transform: [{ scaleX: 1.09 }, { scaleY: 0.8 }] },
  '55%': { transform: [{ scaleX: 0.97 }, { scaleY: 1.06 }] },
  '80%': { transform: [{ scaleX: 1.01 }, { scaleY: 0.99 }] },
  '100%': { transform: [{ scaleX: 1 }, { scaleY: 1 }] },
});

/** A small concave flare joining the 4pt rail to the button housing. */
function Fillet({ side, color }: { side: 'left' | 'right'; color: string }) {
  const W = 22;
  const H = 30;
  const y1 = H / 2 - 2;
  const y2 = H / 2 + 2;
  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: '50%',
        // Centred on the rail line
        marginTop: -H / 2,
        width: W,
        height: H,
        [side === 'right' ? 'right' : 'left']: -W + 6,
        transform: side === 'left' ? [{ scaleX: -1 }] : undefined,
      }}
    >
      <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <Path d={`M0 0 C 5 ${y1 * 0.8}, 10 ${y1}, ${W} ${y1} L ${W} ${y2} C 10 ${y2}, 5 ${H - y1 * 0.8}, 0 ${H} Z`} fill={color} />
      </Svg>
    </View>
  );
}

/** Whether a hex colour is light enough to need dark text on it. */
function isLight(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return 0.299 * r + 0.587 * g + 0.114 * b > 150;
}

/** Keeps the button label readable as the face colour changes. */
function readableInk(face: string, ink: string) {
  if (isDark(ink)) return contrast(face, '#FFFFFF') >= 3 ? '#FFFFFF' : ink;
  if (contrast(face, ink) >= 4.5) return ink;
  return contrast(face, '#1B1B1B') > contrast(face, ink) ? '#1B1B1B' : ink;
}

