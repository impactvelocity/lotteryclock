/** Generates believable past mornings so History and the chart can be tested. */
import { createPlan, RISK_OPTIONS } from './lottery';
import { scoreMorning, type HistoryEntry, type Resolution } from './points';

export function makeDemoHistory(days = 21, wakeHour = 7, wakeMinute = 30): HistoryEntry[] {
  const entries: HistoryEntry[] = [];
  const today = new Date();
  today.setHours(wakeHour, wakeMinute, 0, 0);

  for (let i = 1; i <= days; i++) {
    const target = new Date(today);
    target.setDate(today.getDate() - i);
    const risk = RISK_OPTIONS[1 + Math.floor(Math.random() * (RISK_OPTIONS.length - 1))];
    // Plan "placed" the night before so the past-time clamp never kicks in.
    const plan = createPlan(target.getTime(), risk, target.getTime() - 8 * 3600_000);

    let resolution: Resolution;
    if (plan.outcome === 'early') {
      const bust = Math.random() < 0.1;
      resolution = {
        action: 'snoozed',
        respondedAtMs: plan.ringAtMs + (5 + Math.random() * 40) * 1000,
        snoozeCount: bust ? 2 : 1,
      };
    } else {
      const fast = Math.random() < 0.6;
      resolution = {
        action: 'stopped',
        respondedAtMs: plan.ringAtMs + (fast ? 5 + Math.random() * 40 : 90 + Math.random() * 300) * 1000,
        snoozeCount: 0,
      };
    }

    entries.push({
      id: `demo-${target.getTime()}`,
      plan,
      resolution,
      score: scoreMorning(plan, resolution),
    });
  }
  return entries; // newest first
}
