import { router } from 'expo-router';
import { useMemo } from 'react';
import { View } from 'react-native';

import { DisplayText } from '@/components/display-text';
import { HistoryRow } from '@/components/history-row';
import { Panel, SectionLabel } from '@/components/panel';
import { KIND_COLOR, PointsChart } from '@/components/points-chart';
import { Screen } from '@/components/screen';
import { StatTile } from '@/components/stat-tile';
import { Button, ButtonText } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { fmtPoints } from '@/lib/format';
import { computeStats } from '@/lib/points';
import { useAppState } from '@/lib/store';
import { colors } from '@/theme';

export default function HistoryScreen() {
  const { history } = useAppState();
  const stats = useMemo(() => computeStats(history), [history]);

  return (
    <Screen>
      <DisplayText style={{ color: colors.fg, fontSize: 28 }}>History</DisplayText>

      {history.length === 0 ? (
        <Panel>
          <Text style={{ fontSize: 40, textAlign: 'center' }}>🎰</Text>
          <Text className="text-center text-base font-semibold text-foreground">No spins yet</Text>
          <Text className="text-center text-sm text-muted-foreground">
            Place a bet on the Play tab. To preview this screen, load demo history in Settings.
          </Text>
          <Button variant="outline" onPress={() => router.navigate('/settings')}>
            <ButtonText>Open Settings</ButtonText>
          </Button>
        </Panel>
      ) : (
        <>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            <StatTile
              label="Bankroll"
              value={`🪙 ${fmtPoints(stats.bankroll)}`}
              color={stats.bankroll >= 0 ? colors.gold : colors.loss}
            />
            <StatTile label="Snooze won" value={`${stats.minutesWon} min`} color={colors.win} />
            <StatTile label="Win rate" value={`${Math.round(stats.winRate * 100)}%`} />
            <StatTile label={`Streak · best ${stats.bestStreak}`} value={`🔥 ${stats.streak}`} color={colors.neon} />
          </View>

          <Panel>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <SectionLabel>Last 14 mornings</SectionLabel>
              <Text className="text-xs text-muted-foreground">{stats.jackpots} jackpots</Text>
            </View>
            <PointsChart entries={history} />
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 14 }}>
              <Legend color={KIND_COLOR.win} label="Win" />
              <Legend color={KIND_COLOR.jackpot} label="Jackpot" />
              <Legend color={KIND_COLOR.hustle} label="Hustle" />
              <Legend color={KIND_COLOR.late} label="Late / bust" />
            </View>
          </Panel>

          <Panel style={{ gap: 0, paddingVertical: 8 }}>
            {history.map((e) => (
              <HistoryRow key={e.id} entry={e} />
            ))}
          </Panel>
        </>
      )}
    </Screen>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }} />
      <Text className="text-[11px] text-muted-foreground">{label}</Text>
    </View>
  );
}
