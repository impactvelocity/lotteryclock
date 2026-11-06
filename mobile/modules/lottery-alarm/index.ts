import { requireOptionalNativeModule } from 'expo-modules-core';

export type AlarmAuthorization = 'authorized' | 'denied' | 'notDetermined' | 'unsupported';

export type AlarmOptions = {
  /** UUID string. */
  id: string;
  /** When it rings, epoch ms. */
  fireDateMs: number;
  title: string;
  /** Rang early: snooze length in seconds, ending exactly at the target time. */
  snoozeSeconds?: number | null;
  snoozeLabel?: string;
  countdownTitle?: string;
  /** "#RRGGBB" */
  tintHex?: string;
};

type NativeModule = {
  isSupported(): boolean;
  authorizationState(): AlarmAuthorization;
  requestAuthorization(): Promise<AlarmAuthorization>;
  schedule(options: AlarmOptions): Promise<string>;
  cancel(id: string): Promise<void>;
  list(): { id: string; state: string }[];
};

/** Null in Expo Go, on Android and on web: callers fall back to notifications. */
export const LotteryAlarm = requireOptionalNativeModule<NativeModule>('LotteryAlarm');
