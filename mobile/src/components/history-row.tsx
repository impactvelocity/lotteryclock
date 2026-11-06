import { StyleSheet, Text, View } from 'react-native';

import { chartColor } from '@/components/points-chart';
import { fmtDate, fmtTime } from '@/lib/format';
import { offsetMinutes } from '@/lib/lottery';
import type { HistoryEntry } from '@/lib/points';
import { sans } from '@/themes/fonts';
import { contrast, css, mixHex, type Theme } from '@/themes/themes';

/** One morning: the day and times on the left, snooze / late / on time on the right. */
export function HistoryRow({ theme: t, entry, last }: { theme: Theme; entry: HistoryEntry; last?: boolean }) {
  const { plan } = entry;
  const m = offsetMinutes(plan);
  const verdict = plan.outcome === 'early' ? 'Snooze' : plan.outcome === 'late' ? 'Late' : 'On time';
  const amount = plan.outcome === 'early' ? `+${m} min` : plan.outcome === 'late' ? `${m} min` : '';

  return (
    <View style={[styles.row, { borderBottomColor: t.faint, borderBottomWidth: last ? 0 : StyleSheet.hairlineWidth }]}>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={{ color: t.ink, fontFamily: sans(600), fontSize: 16 }}>{fmtDate(plan.targetMs)}</Text>
        <Text style={{ color: t.muted, fontFamily: sans(500), fontSize: 13 }}>
          Target {fmtTime(plan.targetMs)} · rang {fmtTime(plan.ringAtMs)}
        </Text>
      </View>
      <View style={{ alignItems: 'flex-end', gap: 2 }}>
        <Text style={{ color: readable(t, chartColor(plan.outcome), plan.outcome === 'onTime' ? '#7A3A00' : '#000000'), fontFamily: sans(700), fontSize: 16 }}>{verdict}</Text>
        {amount ? (
          <Text style={{ color: t.muted, fontFamily: sans(500), fontSize: 13, fontVariant: ['tabular-nums'] }}>{amount}</Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13 },
});

/**
 * The chart's green / red / gold, so the list matches it. Bright as they are on dark themes;
 * deepened (towards black, or brown for the gold, so they keep their hue) until they read on a
 * light card.
 */
function readable(t: Theme, color: string, deep: string) {
  for (const k of [0, 0.2, 0.32, 0.45, 0.55]) {
    const c = mixHex(color, deep, k);
    if (contrast(c, t.sheet) >= 3.2) return css(c);
  }
  return t.ink;
}
