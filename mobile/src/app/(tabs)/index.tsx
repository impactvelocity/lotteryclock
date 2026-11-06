import DateTimePicker from '@react-native-community/datetimepicker';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { ChipPicker } from '@/components/chip-picker';
import { DisplayText } from '@/components/display-text';
import { GoldButton } from '@/components/gold-button';
import { Panel, SectionLabel } from '@/components/panel';
import { ReelTime } from '@/components/reel-time';
import { Screen } from '@/components/screen';
import { Button, ButtonText } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { alarmService } from '@/lib/alarm-service';
import { fmtCountdown, fmtPoints, fmtTime, fmtTimeSeconds } from '@/lib/format';
import { createPlan, jackpotOdds, nextOccurrence, offsetMinutes } from '@/lib/lottery';
import { computeStats, JACKPOT_MULTIPLIER } from '@/lib/points';
import { actions, useAppState } from '@/lib/store';
import { colors } from '@/theme';

export default function PlayScreen() {
  const { settings, armed, history } = useAppState();
  const bankroll = useMemo(() => computeStats(history).bankroll, [history]);
  const [error, setError] = useState<string | null>(null);

  const placeBet = async () => {
    setError(null);
    if (!(await alarmService.requestPermission())) {
      setError('Alarm permission was denied. Enable it in Settings.');
      return;
    }
    const plan = createPlan(nextOccurrence(settings.wakeHour, settings.wakeMinute), settings.riskMinutes);
    const alarmId = await alarmService.schedule(plan);
    actions.arm({ alarmId, plan, placedAtMs: Date.now() });
    if (settings.haptics) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <Screen>
      <View style={styles.header}>
        <View>
          <DisplayText style={{ color: colors.gold, fontSize: 30, lineHeight: 32 }} glow={colors.goldDeep}>
            Lottery
          </DisplayText>
          <DisplayText style={{ color: colors.neon, fontSize: 30, lineHeight: 32 }} glow={colors.neon}>
            Clock
          </DisplayText>
        </View>
        <View style={styles.bankroll}>
          <Text style={{ fontSize: 16 }}>🪙</Text>
          <DisplayText style={{ color: colors.fg, fontSize: 16 }}>{fmtPoints(bankroll)}</DisplayText>
        </View>
      </View>

      {armed ? <Ticket /> : <BetSlip onPlace={placeBet} />}

      {error && <Text className="text-destructive">{error}</Text>}
    </Screen>
  );
}

function BetSlip({ onPlace }: { onPlace: () => void }) {
  const { settings } = useAppState();
  const [showPicker, setShowPicker] = useState(false);
  const risk = settings.riskMinutes;

  const pickerValue = new Date();
  pickerValue.setHours(settings.wakeHour, settings.wakeMinute, 0, 0);
  const target = pickerValue.getTime();

  const onRisk = (m: number) => {
    if (settings.haptics) Haptics.selectionAsync();
    actions.updateSettings({ riskMinutes: m });
  };

  return (
    <>
      <Panel>
        <SectionLabel>Target time</SectionLabel>
        <Pressable onPress={() => setShowPicker((v) => !v)} accessibilityRole="button" accessibilityHint="Change the target time">
          <ReelTime hour={settings.wakeHour} minute={settings.wakeMinute} />
          <Text className="mt-2 text-center text-xs text-muted-foreground">
            {showPicker ? 'Done' : 'Tap to change'}
          </Text>
        </Pressable>
        {showPicker && (
          <DateTimePicker
            value={pickerValue}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            themeVariant="dark"
            textColor={colors.fg}
            onChange={(e, d) => {
              if (Platform.OS !== 'ios') setShowPicker(false);
              if (d && e.type !== 'dismissed') actions.updateSettings({ wakeHour: d.getHours(), wakeMinute: d.getMinutes() });
            }}
          />
        )}
      </Panel>

      <Panel>
        <View style={styles.between}>
          <SectionLabel>Add some doubt</SectionLabel>
          <DisplayText style={{ color: colors.gold, fontSize: 16 }}>±{risk} min</DisplayText>
        </View>
        <ChipPicker value={risk} onChange={onRisk} />
        <View style={styles.odds}>
          <Odd label="Window" value={`${fmtTime(target - risk * 60_000)}–${fmtTime(target + risk * 60_000)}`} />
          <Odd label="Max win" value={`+${risk}`} color={colors.win} />
          <Odd label={`Jackpot 1 in ${jackpotOdds(risk)}`} value={`+${JACKPOT_MULTIPLIER * risk}`} color={colors.gold} />
        </View>
      </Panel>

      <GoldButton label="Set alarm" onPress={onPlace} />
      <Text className="px-4 text-center text-sm text-muted-foreground">
        It rings somewhere in your window. Early? Snooze until your target. Late? Get up.
      </Text>
    </>
  );
}

function Odd({ label, value, color = colors.fg }: { label: string; value: string; color?: string }) {
  return (
    <View style={{ flex: 1, gap: 4 }}>
      <Text className="text-[10px] uppercase text-muted-foreground" style={{ letterSpacing: 1 }} numberOfLines={1}>
        {label}
      </Text>
      <Text className="text-sm font-semibold" style={{ color }} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
    </View>
  );
}

function Ticket() {
  const { armed, settings } = useAppState();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);

  if (!armed) return null;
  const { plan } = armed;
  const target = new Date(plan.targetMs);
  const windowMs = plan.riskMinutes * 60_000;

  const cancel = async () => {
    await alarmService.cancel(armed.alarmId);
    actions.disarm();
  };

  return (
    <>
      <Panel glow={colors.gold}>
        <View style={styles.between}>
          <DisplayText style={{ color: colors.neon, fontSize: 18 }} glow={colors.neon}>
            Alarm set
          </DisplayText>
          <Text className="text-xs text-muted-foreground">#{armed.alarmId.slice(-5)}</Text>
        </View>

        <ReelTime hour={target.getHours()} minute={target.getMinutes()} size="md" />

        <View style={styles.ticketRow}>
          <TicketStat label="Doubt" value={`±${plan.riskMinutes} min`} />
          <TicketStat
            label="Window"
            value={`${fmtTime(plan.targetMs - windowMs)}–${fmtTime(plan.targetMs + windowMs)}`}
          />
          <TicketStat label="Target in" value={fmtCountdown(plan.targetMs - now)} />
        </View>

        {/* Perforation */}
        <View style={styles.perforation} />

        <Text className="text-center text-sm text-muted-foreground">
          Good luck. You’ll find out when it rings.
        </Text>

        {settings.showDebug && (
          <View style={styles.debug}>
            <Text className="text-[10px] font-semibold uppercase text-muted-foreground" style={{ letterSpacing: 1 }}>
              Debug · hidden from players
            </Text>
            <Text className="text-xs text-muted-foreground">
              Rings at {fmtTimeSeconds(plan.ringAtMs)} · {plan.outcome} by {offsetMinutes(plan)} min ·{' '}
              {plan.snoozeSeconds ? `snooze ${Math.round(plan.snoozeSeconds / 60)} min` : 'no snooze'}
            </Text>
          </View>
        )}
      </Panel>

      <GoldButton label="Test: ring now" onPress={() => router.push('/reveal')} />
      <Button variant="outline" size="lg" onPress={cancel}>
        <ButtonText>Cancel alarm</ButtonText>
      </Button>
    </>
  );
}

function TicketStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', gap: 4 }}>
      <Text className="text-[10px] uppercase text-muted-foreground" style={{ letterSpacing: 1 }}>
        {label}
      </Text>
      <Text className="text-sm font-semibold text-foreground" numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bankroll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,201,60,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,201,60,0.45)',
  },
  between: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  odds: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  ticketRow: { flexDirection: 'row', gap: 8 },
  perforation: {
    borderTopWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.border,
    marginHorizontal: -20,
  },
  debug: {
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
    padding: 10,
    gap: 4,
  },
});
