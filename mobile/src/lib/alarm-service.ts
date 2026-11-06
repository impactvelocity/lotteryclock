/**
 * Boundary between app logic and the OS alarm system.
 *
 *  - AlarmKit (iOS 26+, via modules/lottery-alarm): a real alarm. Rings through Silent mode and
 *    Focus, shows on the Lock Screen and Dynamic Island, survives the app being killed. An early
 *    ring gets a Snooze button whose countdown ends exactly at the target time.
 *  - Local notifications (expo-notifications): the fallback where AlarmKit isn't available
 *    (older iOS, Android, or alarms not allowed). Time-sensitive, with sound; an early ring also
 *    schedules a second "snooze's over" notification at the target time.
 *
 * Either way the random offset was picked when the bet was placed and stays hidden: only the
 * alarm's own title gives the result away, and only once it rings.
 */
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { LotteryAlarm } from '../../modules/lottery-alarm';
import type { AlarmPlan } from './lottery';
import { offsetMinutes } from './lottery';

export type AlarmCopy = {
  /** Shown while it rings. */
  title: string;
  /** Under the title (notifications only). */
  body: string;
  /** Early rings: the snooze button. */
  snoozeLabel: string;
  /** Early rings: while snoozing. */
  countdownTitle: string;
  /** The theme colour, "#RRGGBB". */
  tint: string;
};

export type AlarmKind = 'alarmkit' | 'notification';

export interface AlarmService {
  readonly kind: AlarmKind;
  /** Ask the OS for permission. Resolves true if alarms can be scheduled. */
  requestPermission(): Promise<boolean>;
  /** Schedule the alarm described by `plan`. Resolves to an id for cancel(). */
  schedule(plan: AlarmPlan, copy: AlarmCopy): Promise<string>;
  /** Cancel it (and any follow-up). Already rung or unknown ids are fine. */
  cancel(id: string): Promise<void>;
  /** A plain alarm at a fixed time: the end of an in-app snooze. */
  scheduleAt(atMs: number, copy: Pick<AlarmCopy, 'title' | 'body' | 'tint'>): Promise<string>;
}

const uuid = () =>
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });

class AlarmKitService implements AlarmService {
  readonly kind = 'alarmkit' as const;

  async requestPermission() {
    const mod = LotteryAlarm!;
    const state = mod.authorizationState();
    if (state === 'authorized') return true;
    if (state === 'denied') return false;
    return (await mod.requestAuthorization()) === 'authorized';
  }

  async schedule(plan: AlarmPlan, copy: AlarmCopy) {
    return LotteryAlarm!.schedule({
      id: uuid(),
      fireDateMs: plan.ringAtMs,
      title: copy.title,
      snoozeSeconds: plan.snoozeSeconds,
      snoozeLabel: copy.snoozeLabel,
      countdownTitle: copy.countdownTitle,
      tintHex: copy.tint,
    });
  }

  async scheduleAt(atMs: number, copy: Pick<AlarmCopy, 'title' | 'body' | 'tint'>) {
    return LotteryAlarm!.schedule({ id: uuid(), fireDateMs: atMs, title: copy.title, tintHex: copy.tint });
  }

  async cancel(id: string) {
    await LotteryAlarm!.cancel(id);
  }
}

class NotificationService implements AlarmService {
  readonly kind = 'notification' as const;

  async requestPermission() {
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return true;
    const asked = await Notifications.requestPermissionsAsync({
      ios: { allowAlert: true, allowSound: true, allowBadge: false },
    });
    return asked.granted;
  }

  private notify(atMs: number, title: string, body: string, data: Record<string, unknown>) {
    return Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: 'default',
        interruptionLevel: 'timeSensitive',
        data,
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: new Date(atMs) },
    });
  }

  async schedule(plan: AlarmPlan, copy: AlarmCopy) {
    const ring = await this.notify(plan.ringAtMs, copy.title, copy.body, { kind: 'ring' });
    // Rang early: the snooze ends exactly at the target time
    if (plan.snoozeSeconds) {
      const end = await this.notify(plan.targetMs, "Snooze over. Up you get", 'Right on your target time.', {
        kind: 'snooze-end',
      });
      return `${ring}|${end}`;
    }
    return ring;
  }

  async scheduleAt(atMs: number, copy: Pick<AlarmCopy, 'title' | 'body' | 'tint'>) {
    return this.notify(atMs, copy.title, copy.body, { kind: 'snooze-end' });
  }

  async cancel(id: string) {
    await Promise.all(id.split('|').map((n) => Notifications.cancelScheduledNotificationAsync(n).catch(() => {})));
  }
}

const useAlarmKit = Platform.OS === 'ios' && !!LotteryAlarm?.isSupported();

export const alarmService: AlarmService = useAlarmKit ? new AlarmKitService() : new NotificationService();

/** Plain notifications still show while the app is open (AlarmKit alarms always do). */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/** Default wording on the alarm itself, per outcome (themes override it). */
export function defaultAlarmCopy(plan: AlarmPlan, tint: string): AlarmCopy {
  const m = offsetMinutes(plan);
  const title =
    plan.outcome === 'early' ? `You won ${m} min. Snooze?` : plan.outcome === 'late' ? `${m} min late. Up you get!` : 'Jackpot. Right on time';
  return {
    title,
    body: 'Open LotteryClock to see how you did.',
    snoozeLabel: 'Snooze',
    countdownTitle: 'Snoozing till your target',
    tint,
  };
}
