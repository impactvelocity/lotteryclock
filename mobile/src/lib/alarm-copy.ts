import type { AlarmCopy } from '@/lib/alarm-service';
import { offsetMinutes, type AlarmPlan } from '@/lib/lottery';
import { formatClock } from '@/lib/time';
import { fillCopy, type Theme } from '@/themes/themes';

/** Minutes from midnight, local time. */
export const minutesOf = (ms: number) => {
  const d = new Date(ms);
  return d.getHours() * 60 + d.getMinutes();
};

export const plural = (m: number) => (m === 1 ? '1 minute' : `${m} minutes`);

/** What the alarm itself says when it rings, in the theme's voice. */
export function alarmCopy(t: Theme, plan: AlarmPlan): AlarmCopy {
  const time = formatClock(minutesOf(plan.targetMs));
  const m = offsetMinutes(plan);
  const title =
    plan.outcome === 'early'
      ? fillCopy(t.copy.win, { time })
      : plan.outcome === 'late'
        ? fillCopy(t.copy.loss)
        : fillCopy(t.copy.jackpot);
  const body =
    plan.outcome === 'early'
      ? fillCopy(t.copy.winLine, { mins: plural(m) })
      : plan.outcome === 'late'
        ? fillCopy(t.copy.lossLine, { mins: plural(m) })
        : fillCopy(t.copy.jackpotLine);
  return { title, body, snoozeLabel: 'Snooze', countdownTitle: `Snoozing till ${time}`, tint: t.button.face };
}
