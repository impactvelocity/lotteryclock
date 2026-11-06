/**
 * The radial bet dial, ported from web/src/components/bet-dial.tsx. Drag the bell round the
 * ring to set the doubt (0–45 min, 45 min = a full turn); tap the time to change it.
 * Everything is laid out in the web's 358-unit square and scaled to `size`.
 */
import * as Haptics from 'expo-haptics';
import { type ComponentRef, type ComponentType, useEffect, useRef, useState } from 'react';
import { type GestureResponderEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import Svg, { Circle, G, Line, Path, Rect } from 'react-native-svg';

import { KF, loop } from '@/scenes/anim';
import * as DigitalKit from '@/scenes/digital';
import { kitFor } from '@/scenes';
import { fontFor, sans } from '@/themes/fonts';
import { css, cssA, MAX_RANGE, ramp, type Theme } from '@/themes/themes';

const SIZE = 358;
const C = SIZE / 2;
const TRACK_R = 148;
/** How far ornament layers may reach outside the 358 box, in dial units. */
const OVERHANG = 24;
/** Degrees of sweep per minute of risk: 45 min = 360°. */
const DEG_PER_MIN = 360 / MAX_RANGE;

function pt(deg: number, r: number): [number, number] {
  const a = (deg * Math.PI) / 180;
  return [C + r * Math.sin(a), C - r * Math.cos(a)];
}

function arc(a1: number, a2: number, r: number): string {
  if (a2 - a1 <= 0) return '';
  if (a2 - a1 >= 359.99) return `${arc(a1, a1 + 180, r)} ${arc(a1 + 180, a2 - 0.01, r)}`;
  const [x1, y1] = pt(a1, r);
  const [x2, y2] = pt(a2, r);
  const large = a2 - a1 > 180 ? 1 : 0;
  return `M${x1.toFixed(2)} ${y1.toFixed(2)} A${r} ${r} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
}

/** LED segments (themes with `segments`): one per minute, with a small gap either side. */
const SEG_GAP = 1.1;
const SEGMENTS = Array.from({ length: MAX_RANGE }, (_, i) =>
  arc(i * DEG_PER_MIN + SEG_GAP, (i + 1) * DEG_PER_MIN - SEG_GAP, TRACK_R),
);

/** The gradient arc is drawn as short slices, each in the ramp colour for its place. */
const SLICE_DEG = 4;

/** "3px dashed #FFFFFF" → a View border. */
function parseBorder(b: string) {
  const m = b.match(/([\d.]+)px\s+(solid|dashed|dotted)\s+(.+)/);
  if (!m) return null;
  return { borderWidth: Number(m[1]), borderStyle: m[2] as 'solid' | 'dashed' | 'dotted', borderColor: m[3] };
}

/** "0 0 14px rgba(…)" → a text shadow. */
function parseTextShadow(s: string) {
  const m = s.match(/^\s*(-?[\d.]+)(?:px)?\s+(-?[\d.]+)(?:px)?\s+([\d.]+)px\s+(.+)$/);
  if (!m) return null;
  return {
    textShadowOffset: { width: Number(m[1]), height: Number(m[2]) },
    textShadowRadius: Number(m[3]),
    textShadowColor: m[4],
  };
}

type Props = {
  theme: Theme;
  range: number;
  onRangeChange: (range: number) => void;
  timeLabel: string;
  ampm: string;
  onTimePress: () => void;
  size: number;
  haptics?: boolean;
};

export function BetDial({ theme: t, range, onRangeChange, timeLabel, ampm, onTimePress, size, haptics = true }: Props) {
  const [grabbing, setGrabbing] = useState(false);
  const origin = useRef<{ x: number; y: number } | null>(null);
  // The latest range for the touch handlers (between renders a drag can move several minutes)
  const rangeRef = useRef(range);
  useEffect(() => {
    rangeRef.current = range;
  }, [range]);
  const viewRef = useRef<ComponentRef<typeof View>>(null);

  const k = size / SIZE;
  const u = (n: number) => n * k;
  const p = range / MAX_RANGE;
  const arcRGB = ramp(t.arcStops, p);
  const arcColor = css(arcRGB);
  const sweep = range * DEG_PER_MIN;
  const [hx, hy] = pt(sweep, TRACK_R);
  const glowPx = p * 22 * t.glow;
  const rangeInk = t.tierInk ? css(ramp(t.tierInk, p)) : arcColor;
  const shade = (f: number) => arcRGB.map((v) => Math.round(v * f)) as typeof arcRGB;
  const edgeArc = shade(0.72);
  const deepArc = shade(0.5);
  const half = t.trackWidth / 2;
  const tickInner = TRACK_R - half - 8;
  const { DialUnder, DialOver } = kitFor(t);
  const PixelBell = (DigitalKit as { PixelBell?: ComponentType<{ size: number; color: string }> }).PixelBell;

  const change = (next: number) => {
    const r = Math.max(0, Math.min(MAX_RANGE, next));
    if (r === rangeRef.current) return;
    rangeRef.current = r;
    if (haptics) Haptics.selectionAsync();
    onRangeChange(r);
  };

  const angleAt = (e: GestureResponderEvent) => {
    const o = origin.current;
    if (!o) return null;
    const dx = e.nativeEvent.pageX - (o.x + size / 2);
    const dy = e.nativeEvent.pageY - (o.y + size / 2);
    let ang = (Math.atan2(dx, -dy) * 180) / Math.PI;
    if (ang < 0) ang += 360;
    return { dist: Math.hypot(dx, dy) / (size / 2), ang };
  };

  const setFromAngle = (ang: number) => {
    const cur = rangeRef.current;
    let r = Math.max(0, Math.min(MAX_RANGE, Math.round(ang / DEG_PER_MIN)));
    // Don't jump across 12 o'clock while dragging past the top.
    if (cur >= 36 && r <= 9) r = MAX_RANGE;
    else if (cur <= 9 && r >= 36) r = 0;
    change(r);
  };

  // The segment ramp, in slices
  const slices: { d: string; color: string }[] = [];
  if (!t.segments && range > 0) {
    const n = Math.max(1, Math.ceil(sweep / SLICE_DEG));
    for (let i = 0; i < n; i++) {
      const a1 = (sweep * i) / n;
      const a2 = Math.min(sweep, (sweep * (i + 1)) / n + (i < n - 1 ? 0.6 : 0));
      slices.push({ d: arc(a1, a2, TRACK_R), color: css(ramp(t.arcStops, p * ((i + 0.5) / n))) });
    }
  }
  const fullArc = arc(0, sweep, TRACK_R);

  const bulbs = t.bulbs
    ? Array.from({ length: 22 }, (_, i) => {
        const ang = i * (360 / 22);
        const [x, y] = pt(ang, 171);
        return { x, y, lit: range > 0 && ang <= sweep + 0.01, i };
      })
    : [];

  const border = t.handleBorder === 'none' ? null : parseBorder(t.handleBorder);
  const timeShadow =
    p > 0 && t.glow > 0.5 && t.timeGlow !== false
      ? { textShadowColor: cssA(arcRGB, 0.55), textShadowRadius: Math.round(p * 20), textShadowOffset: { width: 0, height: 0 } }
      : t.timeShadow !== 'none'
        ? parseTextShadow(t.timeShadow)
        : null;

  return (
    <View
      ref={viewRef}
      style={{ width: size, height: size }}
      onLayout={() => viewRef.current?.measureInWindow((x, y) => (origin.current = { x, y }))}
      onStartShouldSetResponder={(e) => {
        const pos = angleAt(e);
        return !!pos && pos.dist >= 0.6; // the centre belongs to the time button
      }}
      onMoveShouldSetResponder={() => false}
      onResponderTerminationRequest={() => false}
      onResponderGrant={(e) => {
        viewRef.current?.measureInWindow((x, y) => (origin.current = { x, y }));
        setGrabbing(true);
        const pos = angleAt(e);
        if (pos) setFromAngle(pos.ang);
      }}
      onResponderMove={(e) => {
        const pos = angleAt(e);
        if (pos) setFromAngle(pos.ang);
      }}
      onResponderRelease={() => setGrabbing(false)}
      onResponderTerminate={() => setGrabbing(false)}
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel="Gamble window"
      accessibilityValue={{ min: 0, max: MAX_RANGE, now: range, text: `${range} minutes either side` }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={(e) => change(rangeRef.current + (e.nativeEvent.actionName === 'increment' ? 5 : -5))}
    >
      {/* Halo that grows with the bet */}
      <Animated.View
        pointerEvents="none"
        style={{
          position: 'absolute',
          inset: u(-16),
          borderRadius: size,
          opacity: p * 0.85 * t.glow,
          backgroundImage: `radial-gradient(circle, ${cssA(arcRGB, 0.5)} 0%, rgba(0,0,0,0) 70%)`,
          ...loop(KF.pulse, 2.6 - p * 1.4),
        }}
      />

      {/* Disc */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          inset: u(3),
          borderRadius: size,
          backgroundImage: t.disc,
          boxShadow: t.discShadow,
        }}
      />

      <Svg pointerEvents="none" width={size} height={size} viewBox={`0 0 ${SIZE} ${SIZE}`} style={StyleSheet.absoluteFill}>
        {t.segments ? (
          // An LED bar graph: every minute its own segment, lit ones in the colour for their place
          <G>
            {SEGMENTS.map((d, i) => (
              <Path key={i} d={d} fill="none" stroke={t.track} strokeWidth={t.trackWidth} />
            ))}
            {glowPx > 0 &&
              SEGMENTS.slice(0, range).map((d, i) => (
                <Path
                  key={`g${i}`}
                  d={d}
                  fill="none"
                  stroke={css(ramp(t.arcStops, (i + 0.5) / MAX_RANGE))}
                  strokeOpacity={0.22}
                  strokeWidth={t.trackWidth + glowPx * 0.8}
                />
              ))}
            {SEGMENTS.slice(0, range).map((d, i) => (
              <Path key={`l${i}`} d={d} fill="none" stroke={css(ramp(t.arcStops, (i + 0.5) / MAX_RANGE))} strokeWidth={t.trackWidth} />
            ))}
          </G>
        ) : (
          <G>
            <Circle cx={C} cy={C} r={TRACK_R} fill="none" stroke={t.track} strokeWidth={t.trackWidth} />
            {/* Soft glow under the arc, widening with the bet */}
            {glowPx > 0 &&
              [
                [2, 0.035],
                [1.5, 0.05],
                [1.05, 0.08],
                [0.65, 0.12],
                [0.3, 0.17],
              ].map(([w, o]) => (
                <Path
                  key={w}
                  d={fullArc}
                  fill="none"
                  stroke={arcColor}
                  strokeOpacity={o}
                  strokeWidth={t.trackWidth + glowPx * w}
                />
              ))}
            {slices.map((s, i) => (
              <Path key={i} d={s.d} fill="none" stroke={s.color} strokeWidth={t.trackWidth} />
            ))}
          </G>
        )}
      </Svg>

      {/* Hairlines just inside the ring's edges, blended so they read as a deeper (or lighter) shade */}
      {t.trackEdge && (
        <View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, { mixBlendMode: t.trackEdgeBlend ?? 'multiply' }]}
        >
          <Svg width={size} height={size} viewBox={`0 0 ${SIZE} ${SIZE}`}>
            {[TRACK_R - half + 1, TRACK_R + half - 1].map((r) => (
              <Circle key={r} cx={C} cy={C} r={r} fill="none" stroke={t.trackEdge} strokeWidth={1.25} />
            ))}
          </Svg>
        </View>
      )}

      {/* With a margin round the box: ornaments can reach past the rim (Prize wheel's pointer) */}
      <Svg
        pointerEvents="none"
        width={u(SIZE + OVERHANG * 2)}
        height={u(SIZE + OVERHANG * 2)}
        viewBox={`${-OVERHANG} ${-OVERHANG} ${SIZE + OVERHANG * 2} ${SIZE + OVERHANG * 2}`}
        style={{ position: 'absolute', left: u(-OVERHANG), top: u(-OVERHANG) }}
      >
        {DialUnder && <DialUnder range={range} p={p} theme={t} />}

        {/* Minute ticks; the ones inside the bet light up */}
        {Array.from({ length: MAX_RANGE - 1 }, (_, j) => j + 1).map((i) => {
          const long = i % 5 === 0;
          const [x1, y1] = pt(i * DEG_PER_MIN, tickInner - (long ? 10 : 5));
          const [x2, y2] = pt(i * DEG_PER_MIN, tickInner);
          const lit = i <= range;
          return (
            <Line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={lit ? css(ramp(t.arcStops, i / MAX_RANGE)) : t.faint}
              strokeWidth={long ? 2.6 : 1.6}
              strokeLinecap="round"
            />
          );
        })}

        {/* 12 o'clock notch: the target time */}
        <Rect x={C - 2} y={C - TRACK_R - half - 4} width={4} height={t.trackWidth + 8} rx={2} fill={t.notch} />

        {DialOver && <DialOver range={range} p={p} theme={t} />}
      </Svg>

      {/* Marquee bulbs round the rim */}
      {bulbs.map((b) => {
        const bc = t.bulbColors;
        const on = bc?.on ?? '#FFE28A';
        const off = bc?.off ?? 'rgba(255,226,138,0.16)';
        const alt = !!(bc?.chase && bc.alt && b.i % 2 === 1);
        const glow = (alt && bc?.altGlow) || bc?.glow || 'rgba(255,210,100,0.9)';
        const chaseS = p > 0.85 ? 0.5 : 1.1;
        const anim = bc?.chase
          ? b.lit
            ? { ...loop(KF.chase, chaseS, { ease: 'linear', delay: -(((3 - (b.i % 3)) % 3) * chaseS) / 3 }) }
            : { ...loop(KF.attract, 2.4, { ease: 'linear', delay: (b.i * 2.4) / 22 }) }
          : b.lit && p > 0.85
            ? loop(KF.blink, 0.7, { ease: 'linear', delay: b.i * 0.07 })
            : null;
        return (
          <Animated.View
            key={b.i}
            pointerEvents="none"
            style={{
              position: 'absolute',
              left: u(b.x - 4.5),
              top: u(b.y - 4.5),
              width: u(9),
              height: u(9),
              borderRadius: u(9),
              backgroundColor: b.lit ? (alt ? bc!.alt : on) : off,
              boxShadow: b.lit ? `0 0 ${u(6)}px ${glow}` : undefined,
              ...anim,
            }}
          />
        );
      })}

      {/* Centre: the target time */}
      <Pressable
        onPress={onTimePress}
        accessibilityRole="button"
        accessibilityLabel={`Alarm time ${timeLabel} ${ampm}. Change time`}
        style={({ pressed }) => ({
          position: 'absolute',
          left: u(84),
          top: u(84),
          width: u(190),
          height: u(190),
          borderRadius: size,
          alignItems: 'center',
          justifyContent: 'center',
          transform: [{ scale: pressed ? 0.95 : 1 }],
        })}
      >
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: u(4) }}>
          <Text
            style={{
              color: t.timeColor,
              fontFamily: fontFor(t.timeFont, 700),
              fontSize: u(52),
              letterSpacing: -u(52) * 0.03,
              fontVariant: ['tabular-nums'],
              ...timeShadow,
            }}
          >
            {timeLabel}
          </Text>
          <Text style={{ color: t.timeColor, fontFamily: fontFor(t.timeFont, 700), fontSize: u(15) }}>{ampm}</Text>
        </View>
        <View style={{ position: 'absolute', left: 0, right: 0, top: u(124), alignItems: 'center' }}>
          {range > 0 && (
            <Animated.View
              key={range}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                animationName: KF.popIn,
                animationDuration: '220ms',
                animationTimingFunction: 'ease-out',
              }}
            >
              <Svg width={u(13)} height={u(13)} viewBox="0 0 24 24" style={{ marginRight: u(2.5) }}>
                <Path d="M12 5v14M5 12h14" stroke={rangeInk} strokeWidth={3} strokeLinecap="round" fill="none" />
              </Svg>
              <Text style={{ color: rangeInk, fontFamily: sans(600), fontSize: u(15), fontVariant: ['tabular-nums'] }}>
                {range} {range === 1 ? 'min' : 'mins'}
              </Text>
            </Animated.View>
          )}
        </View>
      </Pressable>

      {/* Bell handle: drag round the ring to place the bet (touches go to the dial itself) */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: u(hx - 22),
          top: u(hy - 22),
          width: u(44),
          height: u(44),
          borderRadius: t.pixelHandle ? u(44) * 0.22 : u(44),
          backgroundColor: t.handleRamp ? css(ramp(t.handleRamp, p)) : t.handle,
          alignItems: 'center',
          justifyContent: 'center',
          transform: [{ scale: grabbing ? 1.22 : 1 }],
          ...(border ?? { borderWidth: 2.5, borderColor: arcColor }),
          boxShadow: [
            `0 ${grabbing ? 10 : 6}px ${grabbing ? 24 : 16}px ${
              t.tintedHandle ? cssA(deepArc, grabbing ? 0.5 : 0.42) : `rgba(0,0,0,${grabbing ? 0.35 : 0.28})`
            }`,
            `0 0 ${Math.round(p * 24 * t.glow)}px ${cssA(arcRGB, 0.8)}`,
            ...(t.tintedHandle ? [`inset 0 0 0 1.25px ${css(edgeArc)}`] : []),
          ].join(', '),
          transitionProperty: 'transform',
          transitionDuration: 150,
        }}
      >
        <Animated.View style={grabbing ? loop(KF.ring, 0.35) : undefined}>
          {t.pixelHandle && PixelBell ? (
            <PixelBell size={u(44) * 0.48} color={t.handleInk} />
          ) : (
            <Svg width={u(44) * 0.45} height={u(44) * 0.45} viewBox="0 0 24 24">
              <Path
                d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"
                fill="none"
                stroke={t.handleInk}
                strokeWidth={2.2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Path d="M10.3 21a1.9 1.9 0 0 0 3.4 0" fill="none" stroke={t.handleInk} strokeWidth={2.2} strokeLinecap="round" />
            </Svg>
          )}
        </Animated.View>
      </View>
    </View>
  );
}
