import { useState } from 'react';
import { View } from 'react-native';
import Svg, { Defs, Line, LinearGradient, Rect, Stop, Text as SvgText } from 'react-native-svg';

import { fmtWeekdayLetter } from '@/lib/format';
import type { HistoryEntry, ScoreKind } from '@/lib/points';
import { colors } from '@/theme';

const KIND_COLOR: Record<ScoreKind, string> = {
  jackpot: colors.gold,
  win: colors.win,
  hustle: colors.hustle,
  late: colors.loss,
  bust: colors.loss,
};

const HEIGHT = 150;
const LABEL_H = 18;

/** Bar chart of points per morning. Wins go up, losses go down. @param entries newest first */
export function PointsChart({ entries, days = 14 }: { entries: HistoryEntry[]; days?: number }) {
  const [width, setWidth] = useState(0);
  const data = entries.slice(0, days).reverse();

  const chartH = HEIGHT - LABEL_H;
  const mid = chartH / 2;
  const maxAbs = Math.max(5, ...data.map((e) => Math.abs(e.score.points)));
  const slot = data.length ? width / days : 0;
  const barW = Math.max(4, slot * 0.62);

  return (
    <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)} style={{ height: HEIGHT }}>
      {width > 0 && (
        <Svg width={width} height={HEIGHT}>
          <Defs>
            {Object.entries(KIND_COLOR).map(([kind, c]) => (
              <LinearGradient key={kind} id={`g-${kind}`} x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={c} stopOpacity="1" />
                <Stop offset="1" stopColor={c} stopOpacity="0.55" />
              </LinearGradient>
            ))}
          </Defs>

          {/* Guide lines */}
          <Line x1={0} x2={width} y1={mid} y2={mid} stroke={colors.border} strokeWidth={1} />
          <Line x1={0} x2={width} y1={4} y2={4} stroke={colors.border} strokeWidth={0.5} strokeDasharray="3 5" />
          <Line x1={0} x2={width} y1={chartH - 4} y2={chartH - 4} stroke={colors.border} strokeWidth={0.5} strokeDasharray="3 5" />

          {data.map((e, i) => {
            const h = Math.max(2, (Math.abs(e.score.points) / maxAbs) * (mid - 6));
            const x = i * slot + (slot - barW) / 2;
            const y = e.score.points >= 0 ? mid - h : mid;
            return (
              <Rect key={e.id} x={x} y={y} width={barW} height={h} rx={3} fill={`url(#g-${e.score.kind})`} />
            );
          })}

          {data.map((e, i) => (
            <SvgText
              key={`l-${e.id}`}
              x={i * slot + slot / 2}
              y={HEIGHT - 4}
              fontSize={10}
              fill={colors.muted}
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

export { KIND_COLOR };
