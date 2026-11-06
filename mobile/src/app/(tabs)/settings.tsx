import type { ReactNode } from 'react';
import { Alert, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { Panel, SectionLabel } from '@/components/panel';
import { Screen } from '@/components/screen';
import { PillButton } from '@/components/status';
import { ThemeList } from '@/components/theme-picker';
import { router } from 'expo-router';

import { alarmCopy } from '@/lib/alarm-copy';
import { alarmService } from '@/lib/alarm-service';
import { createPlan } from '@/lib/lottery';
import { makeDemoHistory } from '@/lib/demo';
import { actions, useAppState } from '@/lib/store';
import { fontFor, sans } from '@/themes/fonts';
import { useTheme } from '@/themes/use-theme';
import { THEMES, type Theme } from '@/themes/themes';

import { LotteryAlarm } from '../../../modules/lottery-alarm';

export default function SettingsScreen() {
  const { settings, history, armed } = useAppState();
  const { theme: t, index } = useTheme();

  const alarmKit = alarmService.kind === 'alarmkit';
  const auth = LotteryAlarm?.authorizationState() ?? 'unsupported';
  const alarmStatus = alarmKit
    ? auth === 'authorized'
      ? 'Real iOS alarms (AlarmKit). They ring through Silent mode and Focus, even if the app is closed.'
      : auth === 'denied'
        ? 'Alarms are turned off for LotteryClock. Turn them on in Settings so it can ring.'
        : "LotteryClock will ask to schedule alarms the first time you set one."
    : 'Alarm notifications. For real alarms that ring through Silent mode, use iOS 26 or later.';

  /** A real alarm about a minute from now, with a minute of doubt: proof it rings. */
  const testAlarm = async (early = false) => {
    if (armed) return Alert.alert('An alarm is already set', 'Cancel it on the Play tab first.');
    if (!(await alarmService.requestPermission())) return Alert.alert('Alarms are off', 'Allow alarms for LotteryClock in Settings.');
    // Random within a minute either side of 90 s from now; or rigged to ring early, a minute
    // from now, with a two-minute snooze that ends on the target
    const target = Date.now() + (early ? 180_000 : 90_000);
    const plan = early ? createPlan(target, 2, Date.now(), () => 0) : createPlan(target, 1);
    const alarmId = await alarmService.schedule(plan, alarmCopy(t, plan));
    actions.arm({ alarmId, plan, placedAtMs: Date.now(), kind: alarmService.kind });
    router.navigate('/');
  };

  const resetHistory = () =>
    Alert.alert('Reset history?', `This deletes ${history.length} mornings and your bankroll.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: () => actions.setHistory([]) },
    ]);

  return (
    <Screen title="Settings">
      <Panel>
        <SectionLabel>Theme</SectionLabel>
        <ThemeList themes={THEMES} index={index} current={t} onSelect={(i) => actions.updateSettings({ themeId: THEMES[i].id })} />
      </Panel>

      <Panel>
        <SectionLabel>Alarm</SectionLabel>
        <View style={{ gap: 6 }}>
          <Text style={{ color: t.ink, fontFamily: sans(500), fontSize: 14, lineHeight: 20 }}>{alarmStatus}</Text>
          {alarmKit && auth === 'denied' && (
            <View style={{ alignSelf: 'flex-start' }}>
              <PillButton ink={t.ink} onPress={() => Linking.openSettings()}>
                Open Settings
              </PillButton>
            </View>
          )}
          {armed && (
            <Text style={{ color: t.muted, fontFamily: sans(500), fontSize: 13 }}>
              One alarm is set. Cancel it on the Play tab.
            </Text>
          )}
        </View>
        <SettingRow theme={t} title="Sound effects" description="The clicks, beeps and draw music in the app. The alarm always rings.">
          <Toggle theme={t} value={settings.sound} onChange={(v) => actions.updateSettings({ sound: v })} />
        </SettingRow>
        <SettingRow theme={t} title="Haptics" description="A tick for every minute on the dial, a thump when you set it.">
          <Toggle theme={t} value={settings.haptics} onChange={(v) => actions.updateSettings({ haptics: v })} />
        </SettingRow>
      </Panel>

      <Panel>
        <SectionLabel>Developer</SectionLabel>
        <SettingRow theme={t} title="Show hidden ring time" description="Reveals when the armed alarm will really ring.">
          <Toggle theme={t} value={settings.showDebug} onChange={(v) => actions.updateSettings({ showDebug: v })} />
        </SettingRow>
        <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
          <PillButton ink={t.ink} onPress={() => testAlarm()}>
            ⏰ Real alarm in ~1 min
          </PillButton>
          <PillButton ink={t.ink} onPress={() => testAlarm(true)}>
            💤 Early ring + snooze
          </PillButton>
          <PillButton ink={t.ink} onPress={() => actions.setHistory(makeDemoHistory(21, settings.wakeHour, settings.wakeMinute))}>
            Load demo history
          </PillButton>
          {history.length > 0 && (
            <PillButton ink={t.ink} onPress={resetHistory}>
              Reset history
            </PillButton>
          )}
        </View>
      </Panel>

      <Text style={{ color: t.muted, fontFamily: fontFor(t.titleFont, 600), fontSize: 13, textAlign: 'center' }}>
        Built by Dylan Jones for the Kiroween hackathon
      </Text>
    </Screen>
  );
}

function SettingRow({ theme: t, title, description, children }: { theme: Theme; title: string; description: string; children: ReactNode }) {
  return (
    <View style={styles.settingRow}>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={{ color: t.ink, fontFamily: sans(600), fontSize: 16 }}>{title}</Text>
        <Text style={{ color: t.muted, fontFamily: sans(500), fontSize: 12.5 }}>{description}</Text>
      </View>
      {children}
    </View>
  );
}

/**
 * A compact switch: the iOS 26 system one is long and flat, and can't be resized without
 * squashing its knob. Same behaviour, in the theme's colours.
 */
function Toggle({ theme: t, value, onChange }: { theme: Theme; value: boolean; onChange: (v: boolean) => void }) {
  const W = 46;
  const H = 28;
  const KNOB = 22;
  return (
    <Pressable
      onPress={() => onChange(!value)}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      hitSlop={8}
    >
      <Animated.View
        style={{
          width: W,
          height: H,
          borderRadius: H,
          backgroundColor: value ? t.arcStops[1] : t.faint,
          transitionProperty: 'backgroundColor',
          transitionDuration: 180,
        }}
      >
        <Animated.View
          style={{
            position: 'absolute',
            top: (H - KNOB) / 2,
            left: (H - KNOB) / 2,
            width: KNOB,
            height: KNOB,
            borderRadius: KNOB,
            backgroundColor: '#FFFFFF',
            boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
            transform: [{ translateX: value ? W - H : 0 }],
            transitionProperty: 'transform',
            transitionDuration: 200,
            transitionTimingFunction: 'ease-out',
          }}
        />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  settingRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
});
