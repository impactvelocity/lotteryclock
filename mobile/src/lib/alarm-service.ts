import { alarmCopy, type AlarmPlan } from './lottery';

/**
 * Boundary between app logic and the native alarm system.
 *
 * Real implementations (iOS AlarmKit, Android AlarmManager) will live behind
 * this interface. Until one is wired in, MockAlarmService lets the UI run in
 * Expo Go. The "Test: ring now" button opens the reveal screen to stand in
 * for the alarm going off.
 */
export interface AlarmService {
  /** Ask the OS for permission. Resolves true if alarms can be scheduled. */
  requestPermission(): Promise<boolean>;
  /** Schedule the alarm described by `plan`. Resolves to an alarm id. */
  schedule(plan: AlarmPlan): Promise<string>;
  cancel(id: string): Promise<void>;
}

export class MockAlarmService implements AlarmService {
  async requestPermission() {
    return true;
  }

  async schedule(plan: AlarmPlan) {
    const id = `mock-${Date.now()}`;
    console.log('[MockAlarmService] schedule', {
      id,
      ringAt: new Date(plan.ringAtMs).toISOString(),
      outcome: plan.outcome,
      snoozeSeconds: plan.snoozeSeconds,
      copy: alarmCopy(plan),
    });
    return id;
  }

  async cancel(id: string) {
    console.log('[MockAlarmService] cancel', id);
  }
}

export const alarmService: AlarmService = new MockAlarmService();
