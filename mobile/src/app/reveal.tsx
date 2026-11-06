/**
 * The moment the alarm rings: slot reels spin, land on the outcome, and the
 * player reacts. In the mock build "Test: ring now" opens this. With real
 * alarms, AlarmKit's stop/snooze intents will open it and pass their timestamps.
 */
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';

import { DisplayText } from '@/components/display-text';
import { GoldButton } from '@/components/gold-button';
import { Screen } from '@/components/screen';
import { reelStopMs, SlotReels } from '@/components/slot-reels';
import { Button, ButtonText } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { fmtPoints, fmtTime } from '@/lib/format';
import { offsetMinutes, type AlarmPlan } from '@/lib/lottery';
import { HUSTLE_SECONDS, KIND_META, scoreMorning, type Resolution, type Score } from '@/lib/points';
import { actions, useAppState, type ArmedBet } from '@/lib/store';
import { colors } from '@/theme';

type Phase = 'spinning' | 'result' | 'settled';

function reelFinals(plan: AlarmPlan): [string, string, string] {
  if (plan.outcome === 'onTime') return ['7️⃣', '7️⃣', '7️⃣'];
  if (plan.outcome === 'early') {
    const big = offsetMinutes(plan) >= (plan.riskMinutes * 2) / 3;
    return big ? ['💎', '💎', '💎'] : ['🍒', '🍒', '🍒'];
  }
  return ['🍋', '⏰', '🔔'];
}

export default function RevealScreen() {
  const { armed } = useAppState();
  // Freeze the bet: settling clears `armed` from the store.
  const [bet] = useState<ArmedBet | null>(armed);

  if (!bet) {
    return (
      <Screen>
        <View style={{ gap: 16, paddingTop: 80 }}>
          <Text className="text-center text-lg text-foreground">No alarm set.</Text>
          <Button variant="outline" onPress={() => router.back()}>
            <ButtonText>Back</ButtonText>
          </Button>
        </View>
      </Screen>
    );
  }
  return <Reveal bet={bet} />;
}

function Reveal({ bet }: { bet: ArmedBet }) {
  const { settings } = useAppState();
  const { plan } = bet;
  const [ringStartedAt] = useState(() => Date.now());
  const [phase, setPhase] = useState<Phase>('spinning');
  const [score, setScore] = useState<Score | null>(null);
  const [snoozed, setSnoozed] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  const m = offsetMinutes(plan);
  const won = plan.outcome !== 'late';

  // Reel stop haptics, then reveal.
  useEffect(() => {
    const timers = [0, 1, 2].map((i) =>
      setTimeout(() => settings.haptics && Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), reelStopMs(i)),
    );
    timers.push(
      setTimeout(() => {
        setPhase('result');
        if (settings.haptics) {
          Haptics.notificationAsync(
            won ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error,
          );
        }
      }, reelStopMs(2) + 250),
    );
    return () => timers.forEach(clearTimeout);
  }, [settings.haptics, won]);

  // Hustle countdown for late rings.
  useEffect(() => {
    if (phase !== 'result' || plan.outcome !== 'late') return;
    const t = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(t);
  }, [phase, plan.outcome]);

  const hustleLeft = Math.max(0, HUSTLE_SECONDS - Math.floor((now - ringStartedAt) / 1000));

  const respond = (action: Resolution['action']) => {
    // Map the real reaction delay onto the planned ring time.
    const resolution: Resolution = {
      action,
      respondedAtMs: plan.ringAtMs + (Date.now() - ringStartedAt),
      snoozeCount: action === 'snoozed' ? 1 : 0,
    };
    const s = scoreMorning(plan, resolution);
    actions.settle({ id: bet.alarmId, plan, resolution, score: s });
    setSnoozed(action === 'snoozed');
    setScore(s);
    setPhase('settled');
    if (settings.haptics) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const headline =
    plan.outcome === 'onTime'
      ? { text: 'Jackpot!', color: colors.gold }
      : plan.outcome === 'early'
        ? { text: `You won ${m} min`, color: colors.win }
        : { text: `${m} min late`, color: colors.loss };

  return (
    <Screen scroll={false}>
      <View style={styles.center}>
        <Text className="text-xs uppercase text-muted-foreground" style={{ letterSpacing: 3 }}>
          {fmtTime(plan.ringAtMs)} · bet ±{plan.riskMinutes} min
        </Text>

        <SlotReels finals={reelFinals(plan)} />

        {phase === 'spinning' && (
          <DisplayText style={{ color: colors.muted, fontSize: 20 }}>Spinning…</DisplayText>
        )}

        {phase === 'result' && (
          <Animated.View entering={ZoomIn.springify()} style={styles.block}>
            <DisplayText style={{ color: headline.color, fontSize: 34, textAlign: 'center' }} glow={headline.color}>
              {headline.text}
            </DisplayText>

            {plan.outcome === 'early' && (
              <>
                <Text className="text-center text-base text-muted-foreground">
                  Snooze ends at your target, {fmtTime(plan.targetMs)}.
                </Text>
                <GoldButton tone="win" label={`Snooze ${m} min`} onPress={() => respond('snoozed')} />
                <Button variant="ghost" onPress={() => respond('stopped')}>
                  <ButtonText>I’m up anyway</ButtonText>
                </Button>
              </>
            )}

            {plan.outcome === 'onTime' && (
              <>
                <Text className="text-center text-base text-muted-foreground">
                  Right on time. That’s {fmtPoints(2 * plan.riskMinutes)} chips.
                </Text>
                <GoldButton label="Claim jackpot" onPress={() => respond('stopped')} />
              </>
            )}

            {plan.outcome === 'late' && (
              <>
                <Text className="text-center text-base text-muted-foreground">
                  No snooze. Get up now. Stop within {HUSTLE_SECONDS}s to halve the loss.
                </Text>
                <DisplayText
                  style={{ color: hustleLeft > 0 ? colors.hustle : colors.muted, fontSize: 28, textAlign: 'center' }}
                >
                  ⚡ 0:{String(hustleLeft).padStart(2, '0')}
                </DisplayText>
                <GoldButton tone="loss" label="I'm up!" onPress={() => respond('stopped')} />
              </>
            )}
          </Animated.View>
        )}

        {phase === 'settled' && score && (
          <Animated.View entering={FadeInDown} style={styles.block}>
            <Text style={{ fontSize: 44, textAlign: 'center' }}>{KIND_META[score.kind].symbol}</Text>
            <DisplayText
              style={{ color: score.points >= 0 ? colors.gold : colors.loss, fontSize: 56, textAlign: 'center' }}
              glow={score.points >= 0 ? colors.goldDeep : colors.loss}
            >
              {fmtPoints(score.points)}
            </DisplayText>
            <Text className="text-center text-base text-muted-foreground">
              {KIND_META[score.kind].label}
              {snoozed ? ` · snoozing until ${fmtTime(plan.targetMs)}` : ''}
            </Text>
            <GoldButton label="Done" onPress={() => router.back()} />
          </Animated.View>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 28 },
  block: { alignSelf: 'stretch', gap: 16 },
});
