import type { ReactNode } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { DisplayText } from '@/components/display-text';
import { Panel, SectionLabel } from '@/components/panel';
import { Screen } from '@/components/screen';
import { Button, ButtonText } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Text } from '@/components/ui/text';
import { makeDemoHistory } from '@/lib/demo';
import { HUSTLE_SECONDS, JACKPOT_MULTIPLIER } from '@/lib/points';
import { actions, useAppState } from '@/lib/store';
import { colors } from '@/theme';

const RULES: { symbol: string; name: string; when: string; points: string; color: string }[] = [
  { symbol: '🍒', name: 'Win', when: 'Rang early. Snooze ends at your target.', points: '+min early', color: colors.win },
  { symbol: '7️⃣', name: 'Jackpot', when: 'Rang within 1 min of target.', points: `+${JACKPOT_MULTIPLIER}× window`, color: colors.gold },
  { symbol: '⏰', name: 'Late', when: 'Rang late. No snooze.', points: '−min late', color: colors.loss },
  { symbol: '⚡', name: 'Hustle', when: `Late, but you stopped it within ${HUSTLE_SECONDS}s.`, points: '−half', color: colors.hustle },
  { symbol: '💀', name: 'Bust', when: 'Snoozed again past your target.', points: '−window', color: colors.loss },
];

export default function SettingsScreen() {
  const { settings, history } = useAppState();

  const resetHistory = () =>
    Alert.alert('Reset history?', `This deletes ${history.length} mornings and your bankroll.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: () => actions.setHistory([]) },
    ]);

  return (
    <Screen>
      <DisplayText style={{ color: colors.fg, fontSize: 28 }}>Settings</DisplayText>

      <Panel>
        <SectionLabel>Alarm</SectionLabel>
        <SettingRow
          title="Outcome sounds"
          description="Different sound for win, jackpot and late. Spoils the surprise: you'll know before you look."
        >
          <Toggle value={settings.outcomeSounds} onChange={(v) => actions.updateSettings({ outcomeSounds: v })} />
        </SettingRow>
        <SettingRow title="Haptics" description="Buzz on chips, reel stops and setting alarms.">
          <Toggle value={settings.haptics} onChange={(v) => actions.updateSettings({ haptics: v })} />
        </SettingRow>
      </Panel>

      <Panel>
        <SectionLabel>How scoring works</SectionLabel>
        <Text className="text-sm text-muted-foreground">
          Your window is how far off the alarm can ring, in minutes. Points are chips. Get up fast when you’re late and the house can’t win.
        </Text>
        {RULES.map((r) => (
          <View key={r.name} style={styles.rule}>
            <Text style={{ fontSize: 22, width: 30 }}>{r.symbol}</Text>
            <View style={{ flex: 1 }}>
              <Text className="text-sm font-semibold text-foreground">{r.name}</Text>
              <Text className="text-xs text-muted-foreground">{r.when}</Text>
            </View>
            <Text className="text-sm font-semibold" style={{ color: r.color }}>
              {r.points}
            </Text>
          </View>
        ))}
      </Panel>

      <Panel>
        <SectionLabel>Developer</SectionLabel>
        <SettingRow title="Show hidden ring time" description="Reveals the secret ring time on the alarm ticket.">
          <Toggle value={settings.showDebug} onChange={(v) => actions.updateSettings({ showDebug: v })} />
        </SettingRow>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Button
            variant="secondary"
            className="flex-1"
            onPress={() => actions.setHistory(makeDemoHistory(21, settings.wakeHour, settings.wakeMinute))}
          >
            <ButtonText>Load demo history</ButtonText>
          </Button>
          <Button variant="destructive" className="flex-1" onPress={resetHistory} disabled={!history.length}>
            <ButtonText>Reset history</ButtonText>
          </Button>
        </View>
      </Panel>

      <Text className="text-center text-xs text-muted-foreground" style={{ letterSpacing: 1 }}>
        Idea 2002 · Built 2012 · Resurrected 2026
      </Text>
    </Screen>
  );
}

function SettingRow({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <View style={styles.settingRow}>
      <View style={{ flex: 1, gap: 2 }}>
        <Text className="text-base font-medium text-foreground">{title}</Text>
        <Text className="text-xs text-muted-foreground">{description}</Text>
      </View>
      {children}
    </View>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <Switch
      value={value}
      onValueChange={onChange}
      trackColor={{ false: colors.border, true: colors.gold }}
      thumbColor="#fff"
      ios_backgroundColor={colors.border}
    />
  );
}

const styles = StyleSheet.create({
  rule: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  settingRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
});
