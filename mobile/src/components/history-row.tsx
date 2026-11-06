import { StyleSheet, View } from 'react-native';

import { DisplayText } from '@/components/display-text';
import { KIND_COLOR } from '@/components/points-chart';
import { Text } from '@/components/ui/text';
import { fmtDate, fmtPoints, fmtTime } from '@/lib/format';
import { offsetMinutes } from '@/lib/lottery';
import { KIND_META, type HistoryEntry } from '@/lib/points';
import { colors } from '@/theme';

export function HistoryRow({ entry }: { entry: HistoryEntry }) {
  const { plan, score } = entry;
  const meta = KIND_META[score.kind];
  const color = KIND_COLOR[score.kind];
  const m = offsetMinutes(plan);
  const offsetLabel =
    plan.outcome === 'onTime' ? 'on time' : `${m} min ${plan.outcome === 'early' ? 'early' : 'late'}`;

  return (
    <View style={styles.row}>
      <View style={[styles.symbol, { borderColor: color, backgroundColor: `${color}1F` }]}>
        <Text style={{ fontSize: 20 }}>{meta.symbol}</Text>
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text className="text-base font-semibold text-foreground">{fmtDate(plan.targetMs)}</Text>
        <Text className="text-xs text-muted-foreground">
          Target {fmtTime(plan.targetMs)} · rang {fmtTime(plan.ringAtMs)} · {offsetLabel}
        </Text>
      </View>
      <View style={{ alignItems: 'flex-end', gap: 2 }}>
        <DisplayText style={{ color, fontSize: 18 }}>{fmtPoints(score.points)}</DisplayText>
        <Text className="text-[10px] uppercase text-muted-foreground" style={{ letterSpacing: 1.5 }}>
          {meta.label} · ±{plan.riskMinutes}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  symbol: {
    width: 42,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
