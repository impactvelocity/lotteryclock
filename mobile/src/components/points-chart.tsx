/**
 * The last two weeks of mornings: minutes of snooze won rise above the line, minutes late hang
 * below it, and a right-on-time morning is a dot on the line. Each day sits in a faint track.
 */
import { useState } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, Line, LinearGradient, Rect, Stop, Text as SvgText } from 'react-native-svg';

import { fmtWeekdayLetter } from '@/lib/format';
import { offsetMinutes } from '@/lib/lottery';
import type { HistoryEntry } from '@/lib/points';
import { fontFor } from '@/themes/fonts';
import { css, mixHex, type Theme } from '@/themes/themes';

/** The theme's colours for a morning: snooze (early), late, and right on time. */
export function outcomeColor(t: Theme, outcome: HistoryEntry['plan']['outcome']): string {
  if (outcome === 'early') return t.win;
  if (outcome === 'late') return t.loss;
  return t.jackpotBadge?.bg ?? t.button.face;
}

/**
 * The chart's own palette: it always sits on a dark card, so it uses bright, saturated colours
 * that glow there (rather than the theme's softer snooze / late tones).
 */
export const CHART = {
  /** Snooze won: electric mint */
  early: { top: '#6CFFD0', bottom: '#14C9A0' },
  /** Late: vivid red */
  late: { top: '#FF4560', bottom: '#FF7A6B' },
  /** Right on time: bright gold */
  onTime: '#FFD43B',
};
export const chartColor = (outcome: HistoryEntry['plan']['outcome']) =>
  outcome === 'early' ? CHART.early.top : outcome === 'late' ? CHART.late.top : CHART.onTime;

const HEIGHT = 170;
const LABEL_H = 22;

/** Drawn on a dark card (see chartCard), so the bars pop: light tracks, labels and line. */
const TRACK = 'rgba(255,255,255,0.07)';
const LINE = 'rgba(255,255,255,0.16)';
const LABEL = 'rgba(255,255,255,0.5)';

/** A dark card in the theme's own hue: its ink (light themes) or its sheet (dark ones), deepened. */
export function chartCard(t: Theme, light: boolean): string {
  return css(mixHex(light ? t.ink : t.sheet, '#000000', light ? 0.35 : 0.45));
}

/** @param entries newest first */
export function PointsChart({ theme: t, entries, days = 14 }: { theme: Theme; entries: HistoryEntry[]; days?: number }) {
  const [width, setWidth] = useState(0);
  const data = entries.slice(0, days).reverse();

  const chartH = HEIGHT - LABEL_H;
  const mid = chartH / 2;
  const signed = (e: HistoryEntry) =>
    e.plan.outcome === 'onTime' ? 0 : (e.plan.outcome === 'early' ? 1 : -1) * offsetMinutes(e.plan);
  const maxAbs = Math.max(10, ...data.map((e) => Math.abs(signed(e))));
  const slot = width / days;
  const barW = Math.min(14, Math.max(6, slot * 0.5));
  // Right-align, so the latest morning is always at the right edge
  const x0 = (days - data.length) * slot;

  return (
    <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)} style={{ height: HEIGHT }}>
      {width > 0 && (
        <Svg width={width} height={HEIGHT}>
          <Defs>
            {/* Brightest at the tips, away from the line */}
            <LinearGradient id="up" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={CHART.early.top} />
              <Stop offset="1" stopColor={CHART.early.bottom} />
            </LinearGradient>
            <LinearGradient id="down" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={CHART.late.bottom} />
              <Stop offset="1" stopColor={CHART.late.top} />
            </LinearGradient>
          </Defs>

          {/* A faint track for every day, so empty days still read as days */}
          {Array.from({ length: days }, (_, i) => (
            <Rect
              key={`track-${i}`}
              x={i * slot + (slot - barW) / 2}
              y={4}
              width={barW}
              height={chartH - 8}
              rx={barW / 2}
              fill={TRACK}
            />
          ))}

          <Line x1={0} x2={width} y1={mid} y2={mid} stroke={LINE} strokeWidth={1} />

          {data.map((e, i) => {
            const v = signed(e);
            const cx = x0 + i * slot + slot / 2;
            if (v === 0) {
              return <Circle key={e.id} cx={cx} cy={mid} r={barW / 2 + 1} fill={CHART.onTime} />;
            }
            const h = Math.max(barW, (Math.abs(v) / maxAbs) * (mid - 8));
            return (
              <Rect
                key={e.id}
                x={cx - barW / 2}
                y={v > 0 ? mid - h : mid}
                width={barW}
                height={h}
                rx={barW / 2}
                fill={v > 0 ? 'url(#up)' : 'url(#down)'}
              />
            );
          })}

          {data.map((e, i) => (
            <SvgText
              key={`l-${e.id}`}
              x={x0 + i * slot + slot / 2}
              y={HEIGHT - 5}
              fontSize={11}
              fontFamily={fontFor('sans', i === data.length - 1 ? 700 : 500)}
              fill={i === data.length - 1 ? '#FFFFFF' : LABEL}
              textAnchor="middle"
            >
              {fmtWeekdayLetter(e.plan.targetMs)}
            </SvgText>
          ))}
        </Svg>
      )}
    </View>
  );
}
