import { router } from 'expo-router';
import { Text, View } from 'react-native';

import { HistoryRow } from '@/components/history-row';
import { Panel } from '@/components/panel';
import { chartCard, chartColor, PointsChart } from '@/components/points-chart';
import { Screen } from '@/components/screen';
import { PillButton } from '@/components/status';
import { isLightTheme, Swatch } from '@/components/theme-picker';
import { useAppState } from '@/lib/store';
import { sans } from '@/themes/fonts';
import { useTheme } from '@/themes/use-theme';

export default function HistoryScreen() {
  const { history } = useAppState();
  const { theme: t } = useTheme();

  return (
    <Screen title="History">
      {history.length === 0 ? (
        <Panel style={{ alignItems: 'center', paddingVertical: 28 }}>
          <Swatch theme={t} size={64} />
          <Text style={{ color: t.ink, fontFamily: sans(700), fontSize: 19, textAlign: 'center' }}>No mornings yet</Text>
          <Text style={{ color: t.muted, fontFamily: sans(500), fontSize: 14, textAlign: 'center', lineHeight: 20 }}>
            Set an alarm on the Play tab. Every morning you play lands here: snoozed or late.
          </Text>
          <PillButton ink={t.ink} onPress={() => router.navigate('/')}>
            Set an alarm
          </PillButton>
        </Panel>
      ) : (
        <>
          {/* A dark card, whatever the theme, so the bars pop */}
          <View style={{ backgroundColor: chartCard(t, isLightTheme(t)), borderRadius: 26, padding: 18, gap: 14 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontFamily: sans(700), fontSize: 12, letterSpacing: 1.6, textTransform: 'uppercase' }}>
                Last 14 mornings
              </Text>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                {(
                  [
                    ['early', 'Snooze'],
                    ['late', 'Late'],
                  ] as const
                ).map(([outcome, label]) => (
                  <View key={outcome} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: chartColor(outcome) }} />
                    <Text style={{ color: 'rgba(255,255,255,0.7)', fontFamily: sans(600), fontSize: 12 }}>{label}</Text>
                  </View>
                ))}
              </View>
            </View>
            <PointsChart theme={t} entries={history} />
          </View>

          <Panel style={{ gap: 0, paddingVertical: 4 }}>
            {history.map((e, i) => (
              <HistoryRow key={e.id} theme={t} entry={e} last={i === history.length - 1} />
            ))}
          </Panel>
        </>
      )}
    </Screen>
  );
}
