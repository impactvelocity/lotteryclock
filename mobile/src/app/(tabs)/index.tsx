/**
 * Play: the website's hero, as the app's main screen. Pick a theme, set the target time, drag
 * the bell to add doubt, and Set Alarm schedules a real alarm at a hidden random moment in the
 * window. When it rings, the bedside clock rolls and lands on the truth.
 */
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, AppState, Text, View, useWindowDimensions } from 'react-native';
import Animated, { css } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';

import { AlarmRail, type RailPhase } from '@/components/alarm-rail';
import { BetDial } from '@/components/bet-dial';
import { HEADER_H, PICKER_H, playLayout } from '@/components/play-layout';
import { SceneOverlay, ScenePlate } from '@/components/scene-plate';
import { SevenSegment } from '@/components/seven-segment';
import { Letters, PillButton, ResultBadge, RollBar, TierLabel } from '@/components/status';
import { isLightTheme, ThemePicker, ThemeSheet } from '@/components/theme-picker';
import { alarmCopy, minutesOf, plural } from '@/lib/alarm-copy';
import { alarmService } from '@/lib/alarm-service';
import { createPlan, nextOccurrence, offsetMinutes, type AlarmPlan } from '@/lib/lottery';
import { scoreMorning, type Resolution } from '@/lib/points';
import { ROLL_BAR_MS, ROLL_DELAYS } from '@/lib/roll';
import { sfx } from '@/lib/sfx';
import { actions, getState, useAppState } from '@/lib/store';
import { formatClock } from '@/lib/time';
import { kitFor, type SceneMood } from '@/scenes';
import { fontFor, sans } from '@/themes/fonts';
import { useTheme } from '@/themes/use-theme';
import { css as rgb, edgeColor, fillCopy, isDark, MAX_RANGE, mixHex, THEMES } from '@/themes/themes';

type Phase = RailPhase;


export default function PlayScreen() {
  const { settings, armed } = useAppState();
  const { theme: t, index: themeIndex } = useTheme();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const L = playLayout(width, height, insets.top);

  const [rawPhase, setPhase] = useState<Phase>(armed ? 'armed' : 'idle');
  // Armed or disarmed elsewhere (Settings' test alarm, a reset): follow the store
  const phase: Phase = !armed && rawPhase === 'armed' ? 'idle' : armed && rawPhase === 'idle' ? 'armed' : rawPhase;
  const [rollId, setRollId] = useState(0);
  /** The plan being revealed (the armed one, or a practice re-roll). */
  const [reveal, setReveal] = useState<AlarmPlan | null>(null);
  const [demo, setDemo] = useState(false);
  const [rolled, setRolled] = useState(0);
  /** Rang early with time left before the target: offer the snooze. Decided as it lands. */
  const [snoozable, setSnoozable] = useState(false);
  const [choosing, setChoosing] = useState(false);
  const busyRef = useRef(false);

  const latched = phase !== 'idle';
  const plan = reveal ?? armed?.plan ?? null;
  const range = latched && plan ? plan.riskMinutes : settings.riskMinutes;
  const p = range / MAX_RANGE;
  const targetMin = latched && plan ? minutesOf(plan.targetMs) : settings.wakeHour * 60 + settings.wakeMinute;
  const outcome = plan?.outcome ?? 'onTime';
  const offsetMin = plan ? Math.sign(plan.offsetSeconds) * offsetMinutes(plan) : 0;
  const mood: SceneMood =
    phase === 'idle' ? 'idle' : phase !== 'result' ? 'set' : outcome === 'early' ? 'win' : outcome === 'late' ? 'loss' : 'jackpot';
  const kit = kitFor(t);
  const light = isLightTheme(t);

  useEffect(() => {
    sfx.setMuted(!settings.sound);
  }, [settings.sound]);
  useEffect(() => sfx.preload(), []);

  const buzz = (type: 'light' | 'success' | 'error' | 'heavy') => {
    if (!settings.haptics) return;
    if (type === 'success') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    else if (type === 'error') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    else Haptics.impactAsync(type === 'heavy' ? Haptics.ImpactFeedbackStyle.Heavy : Haptics.ImpactFeedbackStyle.Light);
  };

  // The Set Alarm sequence: drop the clock in, blink the target, then armed. Quietly: the
  // button's latch is the only sound (no alarm-clock beeps when you're setting one at night).
  useEffect(() => {
    if (phase === 'dropping') {
      const id = setTimeout(() => setPhase('blink'), 380);
      return () => clearTimeout(id);
    }
    if (phase === 'blink') {
      const id = setTimeout(() => setPhase('armed'), 1400);
      return () => clearTimeout(id);
    }
  }, [phase]);

  /** The alarm went off: roll the clock and land on the truth. */
  const startReveal = useCallback(
    (p: AlarmPlan, isDemo: boolean) => {
      setReveal(p);
      setDemo(isDemo);
      setRollId((r) => r + 1);
      setPhase('rolling');
      sfx.roll(t.id);
    },
    [t.id],
  );

  // While armed: tick the countdown, and start the reveal once the ring time has passed
  // (with the app open, or as soon as it comes back to the foreground).
  useEffect(() => {
    if (phase !== 'armed') return;
    const check = () => {
      const a = getState().armed;
      if (a && Date.now() >= a.plan.ringAtMs) startReveal(a.plan, false);
    };
    check();
    const id = setInterval(check, 1000);
    const sub = AppState.addEventListener('change', (s) => s === 'active' && check());
    return () => {
      clearInterval(id);
      sub.remove();
    };
  }, [phase, startReveal]);

  // Scramble through times inside the window, then land on the real one.
  useEffect(() => {
    if (phase !== 'rolling' || !reveal) return;
    const target = minutesOf(reveal.targetMs);
    const r = reveal.riskMinutes;
    let i = 0;
    let id: ReturnType<typeof setTimeout>;
    const step = () => {
      if (i === ROLL_DELAYS.length) {
        setSnoozable(reveal.outcome === 'early' && (demo || reveal.targetMs > Date.now() + 5000));
        setPhase('result');
        sfx.land(reveal.outcome);
        buzz(reveal.outcome === 'late' ? 'error' : 'success');
        return;
      }
      setRolled(target - r + Math.floor(Math.random() * (2 * r + 1)));
      if (i % 3 === 0) buzz('light');
      id = setTimeout(step, ROLL_DELAYS[i++]);
    };
    id = setTimeout(step, 60);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, reveal, rollId]);

  const goTheme = (i: number) => {
    const next = THEMES[(i + THEMES.length) % THEMES.length];
    if (next.id === t.id) return;
    buzz('light');
    actions.updateSettings({ themeId: next.id });
  };

  const setAlarm = async () => {
    if (busyRef.current || phase !== 'idle') return;
    busyRef.current = true;
    try {
      sfx.latch();
      buzz('heavy');
      if (!(await alarmService.requestPermission())) {
        Alert.alert(
          'Alarms are off',
          alarmService.kind === 'alarmkit'
            ? 'Allow LotteryClock to schedule alarms in Settings → LotteryClock → Alarms.'
            : 'Allow notifications for LotteryClock in Settings so the alarm can ring.',
        );
        return;
      }
      const next = createPlan(nextOccurrence(settings.wakeHour, settings.wakeMinute), settings.riskMinutes);
      const alarmId = await alarmService.schedule(next, alarmCopy(t, next));
      actions.arm({ alarmId, plan: next, placedAtMs: Date.now(), kind: alarmService.kind });
      setReveal(null);
      setRollId((r) => r + 1);
      setPhase('dropping');
    } catch (e) {
      Alert.alert("Couldn't set the alarm", e instanceof Error ? e.message : String(e));
    } finally {
      busyRef.current = false;
    }
  };

  /** Straight back to the dial: the bet is off and nothing will ring. */
  const cancelAlarm = async () => {
    const a = getState().armed;
    actions.disarm();
    sfx.unlatch();
    buzz('light');
    setPhase('idle');
    if (a) await alarmService.cancel(a.alarmId).catch(() => {});
  };

  /** Practice only: draw again for the same target and doubt. */
  const rollAgain = () => {
    if (!reveal) return;
    const again = createPlan(reveal.targetMs, reveal.riskMinutes, reveal.targetMs - 8 * 3600_000);
    startReveal(again, true);
  };

  const settle = async (action: Resolution['action']) => {
    const a = getState().armed;
    const p0 = reveal ?? a?.plan;
    if (!p0) return setPhase('idle');
    const res: Resolution = { action, respondedAtMs: demo ? p0.ringAtMs + 5000 : Date.now(), snoozeCount: action === 'snoozed' ? 1 : 0 };
    actions.settle({ id: `${p0.targetMs}-${Date.now()}`, plan: p0, resolution: res, score: scoreMorning(p0, res) });
    if (action === 'snoozed' && !demo && p0.targetMs > Date.now() + 5000) {
      // Back to sleep until the target, exactly
      await alarmService
        .scheduleAt(p0.targetMs, { title: "Snooze over. Up you get", body: 'Right on your target time.', tint: t.button.face })
        .catch(() => {});
    } else if (a && !demo) {
      await alarmService.cancel(a.alarmId).catch(() => {});
    }
    sfx.stopDraw();
    sfx.unlatch();
    setReveal(null);
    setPhase('idle');
  };

  const onRail = () => {
    if (phase === 'idle') setAlarm();
    else if (phase === 'armed') cancelAlarm();
    else if (phase === 'result') settle('stopped');
  };
  const railLabel =
    phase === 'idle' ? 'Set Alarm' : phase === 'armed' ? 'Cancel Alarm' : phase === 'result' ? "I'm Up" : 'Locked In';
  const busy = phase === 'dropping' || phase === 'blink' || phase === 'rolling';

  // Footer under the rail: a shade of the scene's bottom edge
  const edge = edgeColor(t, p);
  const edgeHex = rgbToHex(edge);
  const footer = isDark(edgeHex) ? rgb(mixHex(edgeHex, '#000000', 0.28)) : rgb(mixHex(edgeHex, '#FFFFFF', 0.55));

  // The bedside clock once set
  const clockH = Math.min(L.width * 0.3, 118);
  // Armed: the clock and Target / Doubt sit centred between the picker and the rail.
  // Rolling and the result: they move up to make room for the status underneath.
  const waiting = phase === 'dropping' || phase === 'blink' || phase === 'armed';
  const roomTop = L.pickerTop + PICKER_H;
  const roomBottom = L.railY - 70;
  const blockH = clockH + 30 + 44;
  const clockTop = waiting ? Math.round(roomTop + (roomBottom - roomTop - blockH) / 2) : L.dialTop + 34;
  const shownMin =
    phase === 'result' && plan ? minutesOf(plan.ringAtMs) : phase === 'rolling' ? rolled : targetMin;

  const labelsTop = clockTop + clockH + 30;
  // Picking a bet: the tier name sits just above the Set Alarm button
  const statusTop = latched ? labelsTop + 74 : L.railY - 92;
  const sideLabels = { left: ['Target', formatClock(targetMin)], right: ['Doubt', range ? `± ${range} min` : 'None'] };

  const resultTitle =
    outcome === 'early'
      ? fillCopy(t.copy.win, { time: formatClock(targetMin) })
      : outcome === 'late'
        ? fillCopy(t.copy.loss)
        : fillCopy(t.copy.jackpot);
  const resultLine = fillCopy(
    outcome === 'early' ? t.copy.winLine : outcome === 'late' ? t.copy.lossLine : t.copy.jackpotLine,
    { mins: plural(Math.abs(offsetMin)) },
  );

  return (
    <View style={{ flex: 1, backgroundColor: footer }}>
      <StatusBar style={light ? 'dark' : 'light'} />
      <ScenePlate theme={t} range={range} mood={mood} layout={L} dialVisible={phase === 'idle'} />

      {/* Header: the logo, centred (sound effects are switched in Settings) */}
      <View style={{ position: 'absolute', top: L.headerTop, left: 16, right: 16, height: HEADER_H, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }} accessibilityRole="header">
          <Svg width={20} height={20} viewBox="0 0 15 15">
            <Circle cx={7.5} cy={7.5} r={6.2} fill="none" stroke={t.ink} strokeWidth={1.6} />
            <Path d="M7.5 4.4V7.5L9.5 9.5" fill="none" stroke={t.ink} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
          <Text style={{ color: t.ink, fontFamily: fontFor(t.titleFont, 700), fontSize: 21, letterSpacing: -0.3 }}>LotteryClock</Text>
        </View>
      </View>

      {/* Theme switcher */}
      <View style={{ position: 'absolute', top: L.pickerTop, left: 0, right: 0 }}>
        <ThemePicker themes={THEMES} index={themeIndex} onSelect={goTheme} onOpen={() => setChoosing(true)} />
      </View>

      {/* Stage: the dial, or the bedside clock once the alarm is set */}
      {phase === 'idle' ? (
        <Animated.View
          key={`dial-${t.id}`}
          style={{
            position: 'absolute',
            top: L.dialTop,
            left: L.dialX - L.dialSize / 2,
            animationName: DIAL_IN,
            animationDuration: '620ms',
            animationTimingFunction: 'ease-out',
          }}
        >
          <BetDial
            theme={t}
            range={range}
            size={L.dialSize}
            haptics={settings.haptics}
            onRangeChange={(r) => actions.updateSettings({ riskMinutes: r })}
            timeLabel={formatClock(targetMin, false)}
            ampm={settings.wakeHour >= 12 ? 'PM' : 'AM'}
            onTimePress={() => router.push('/time')}
          />
        </Animated.View>
      ) : (
        <Animated.View
          key="clock"
          style={{
            position: 'absolute',
            top: clockTop,
            left: 0,
            right: 0,
            alignItems: 'center',
            transitionProperty: 'top',
            transitionDuration: 450,
            animationName: CLOCK_IN,
            animationDuration: '560ms',
            animationDelay: '180ms',
            animationFillMode: 'both',
            animationTimingFunction: 'ease-out',
          }}
        >
          <SevenSegment
            minutes={shownMin}
            on={t.ink}
            off={rgba(t.ink, 0.08)}
            glow={t.clock.glow ? rgba(t.ink, 0.7) : null}
            font={t.timeFont}
            height={clockH}
            blink={phase === 'blink' || phase === 'dropping'}
            running={phase === 'result' || phase === 'armed'}
          />
        </Animated.View>
      )}

      {/* Once set: what you bet */}
      {latched && (
      <Animated.View
        style={{ position: 'absolute', top: labelsTop, left: 16, right: 16, flexDirection: 'row', transitionProperty: 'top', transitionDuration: 450 }}
      >
        {[sideLabels.left, sideLabels.right].map(([title, sub]) => (
          <Animated.View
            key={title}
            style={{ flex: 1, alignItems: 'center', animationName: KF_FADE_UP, animationDuration: '300ms' }}
          >
            <Text style={{ color: t.ink, fontFamily: sans(600), fontSize: 17 }}>{title}</Text>
            <Text style={{ color: t.muted, fontFamily: sans(500), fontSize: 13.5, marginTop: 2 }}>{sub}</Text>
          </Animated.View>
        ))}
      </Animated.View>
      )}

      {/* Armed: the window, quietly, just above the button */}
      {phase === 'armed' && plan && (
        <Animated.View
          style={{ position: 'absolute', top: L.railY - 78, left: 16, right: 16, alignItems: 'center', animationName: KF_FADE_UP, animationDuration: '400ms' }}
        >
          <Text style={{ color: t.muted, opacity: 0.85, fontFamily: sans(500), fontSize: 13 }}>
            Rings between {formatClock(targetMin - range)} and {formatClock(targetMin + range)}
          </Text>
          {settings.showDebug && (
            <Text style={{ color: t.muted, fontFamily: sans(500), fontSize: 11, marginTop: 2 }}>
              Debug: rings {formatClock(minutesOf(plan.ringAtMs))} ({plan.outcome}, {offsetMinutes(plan)} min)
            </Text>
          )}
        </Animated.View>
      )}

      {/* Status */}
      <View style={{ position: 'absolute', top: statusTop, left: 12, right: 12, alignItems: 'center' }}>
        {phase === 'idle' && <TierLabel theme={t} range={range} />}

        {phase === 'rolling' && (
          <View style={{ alignItems: 'center', gap: 14 }}>
            <Letters key={`roll-${rollId}`} text={t.copy.rolling} wave={false} color={t.ink} />
            {kit.RollFlourish && (
              <View style={{ alignItems: 'center', justifyContent: 'flex-end', minHeight: 20 }}>
                <kit.RollFlourish />
              </View>
            )}
            <RollBar key={rollId} color={t.ink} ms={ROLL_BAR_MS} />
          </View>
        )}

        {phase === 'result' && (
          <View key={`result-${rollId}`} style={{ alignItems: 'center', gap: 10 }}>
            <ResultBadge theme={t} mood={mood} title={resultTitle} />
            <Animated.View
              style={{
                opacity: 0,
                animationName: KF_FADE_UP,
                animationDuration: '400ms',
                animationDelay: '250ms',
                animationFillMode: 'both',
              }}
            >
              <Text style={{ color: t.ink, fontFamily: sans(500), fontSize: 16 }}>{resultLine}</Text>
            </Animated.View>
            <Animated.View
              style={{
                flexDirection: 'row',
                gap: 10,
                marginTop: 6,
                opacity: 0,
                animationName: KF_FADE_UP,
                animationDuration: '400ms',
                animationDelay: '400ms',
                animationFillMode: 'both',
              }}
            >
              {/* Only while there's still sleep to be had before the target */}
              {snoozable && (
                <PillButton ink={t.ink} onPress={() => settle('snoozed')}>
                  💤 Snooze till {formatClock(targetMin)}
                </PillButton>
              )}
              {demo && (
                <PillButton ink={t.ink} onPress={rollAgain}>
                  ↻ Roll Again
                </PillButton>
              )}
            </Animated.View>
          </View>
        )}
      </View>

      {/* Timeline divider with the button mounted on it */}
      <AlarmRail
        theme={t}
        phase={phase}
        range={range}
        offset={offsetMin}
        rollId={rollId}
        y={L.railY}
        width={L.width}
        label={railLabel}
        busy={busy}
        onPress={onRail}
      />

      <SceneOverlay theme={t} layout={L} />

      <ThemeSheet themes={THEMES} index={themeIndex} open={choosing} onClose={() => setChoosing(false)} onSelect={goTheme} />
    </View>
  );
}

/** The dial springs in from above (on load, theme swaps and back from a result). */
const DIAL_IN = css.keyframes({
  '0%': { opacity: 0, transform: [{ translateY: -70 }, { scale: 0.85 }, { rotate: '-10deg' }] },
  '55%': { opacity: 1, transform: [{ translateY: 6 }, { scale: 1.02 }, { rotate: '2deg' }] },
  '78%': { transform: [{ translateY: -2 }, { scale: 0.995 }, { rotate: '-0.5deg' }] },
  '100%': { opacity: 1, transform: [{ translateY: 0 }, { scale: 1 }, { rotate: '0deg' }] },
});

/** The bedside clock drops in with the same soft spring. */
const CLOCK_IN = css.keyframes({
  '0%': { opacity: 0, transform: [{ translateY: -50 }, { scale: 0.88 }, { rotate: '-6deg' }] },
  '60%': { opacity: 1, transform: [{ translateY: 4 }, { scale: 1.01 }, { rotate: '1deg' }] },
  '100%': { opacity: 1, transform: [{ translateY: 0 }, { scale: 1 }, { rotate: '0deg' }] },
});

const KF_FADE_UP = css.keyframes({
  from: { opacity: 0, transform: [{ translateY: 8 }] },
  to: { opacity: 1, transform: [{ translateY: 0 }] },
});

/** "#RRGGBB" at an alpha. */
function rgba(hex: string, a: number) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return `rgba(${r},${g},${b},${a})`;
}

/** "rgb(1,2,3)" → "#010203" */
function rgbToHex(c: string) {
  if (c.startsWith('#')) return c;
  const n = c.match(/\d+/g)?.map(Number) ?? [0, 0, 0];
  return `#${n
    .slice(0, 3)
    .map((v) => v.toString(16).padStart(2, '0'))
    .join('')}`;
}
