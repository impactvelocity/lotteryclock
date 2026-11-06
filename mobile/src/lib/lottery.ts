/**
 * Core LotteryClock logic. Pure functions, no native or UI dependencies.
 *
 * The user sets a target time and a risk (their "bet", in minutes). The alarm
 * rings at a random moment within +/- risk of the target. If it rings early,
 * the snooze lasts until the target time. If it rings late, there is no snooze.
 *
 * Times are epoch milliseconds so plans serialize to storage as-is.
 */

/** Bet sizes offered as chips, in minutes. */
export const RISK_OPTIONS = [5, 10, 15, 20, 30, 45] as const;
export const MIN_RISK_MINUTES = RISK_OPTIONS[0];
export const MAX_RISK_MINUTES = RISK_OPTIONS[RISK_OPTIONS.length - 1];
/** Rings within this many seconds of the target count as "on time" (jackpot). */
export const ON_TIME_WINDOW_SECONDS = 60;

export type Outcome = 'early' | 'onTime' | 'late';

export type AlarmPlan = {
  /** The time the user chose. */
  targetMs: number;
  /** When the alarm will actually ring. Hidden from the user until it rings. */
  ringAtMs: number;
  riskMinutes: number;
  /** Signed offset in seconds from target. Negative means early. */
  offsetSeconds: number;
  outcome: Outcome;
  /** Snooze length in seconds (ends exactly at target), or null when snooze is not allowed. */
  snoozeSeconds: number | null;
};

export function clampRisk(minutes: number): number {
  return Math.min(MAX_RISK_MINUTES, Math.max(MIN_RISK_MINUTES, Math.round(minutes)));
}

/** Next occurrence of hour:minute strictly after `nowMs`. */
export function nextOccurrence(hour: number, minute: number, nowMs: number = Date.now()): number {
  const d = new Date(nowMs);
  d.setHours(hour, minute, 0, 0);
  if (d.getTime() <= nowMs) d.setDate(d.getDate() + 1);
  return d.getTime();
}

export function classify(offsetSeconds: number): Outcome {
  if (Math.abs(offsetSeconds) <= ON_TIME_WINDOW_SECONDS) return 'onTime';
  return offsetSeconds < 0 ? 'early' : 'late';
}

/**
 * Build the plan for one alarm.
 * @param random injectable for tests and demo data; must return a value in [0, 1).
 */
export function createPlan(
  targetMs: number,
  riskMinutes: number,
  nowMs: number = Date.now(),
  random: () => number = Math.random,
): AlarmPlan {
  const risk = clampRisk(riskMinutes);
  const riskSeconds = risk * 60;
  // Whole-second offset, uniform over [-riskSeconds, +riskSeconds].
  let offsetSeconds = Math.floor(random() * (2 * riskSeconds + 1)) - riskSeconds;

  // Never schedule in the past. If an early ring would land before now,
  // ring in 5 seconds instead.
  const minOffset = Math.ceil((nowMs + 5_000 - targetMs) / 1000);
  if (offsetSeconds < minOffset) offsetSeconds = minOffset;

  const outcome = classify(offsetSeconds);
  return {
    targetMs,
    ringAtMs: targetMs + offsetSeconds * 1000,
    riskMinutes: risk,
    offsetSeconds,
    outcome,
    snoozeSeconds: outcome === 'early' ? Math.abs(offsetSeconds) : null,
  };
}

/** Whole minutes off target, at least 1 for early/late rings. */
export function offsetMinutes(plan: Pick<AlarmPlan, 'offsetSeconds' | 'outcome'>): number {
  if (plan.outcome === 'onTime') return 0;
  return Math.max(1, Math.round(Math.abs(plan.offsetSeconds) / 60));
}

/** Approximate jackpot odds as "1 in N" for a given bet. */
export function jackpotOdds(riskMinutes: number): number {
  const windowSeconds = 2 * ON_TIME_WINDOW_SECONDS + 1;
  return Math.max(1, Math.round((2 * riskMinutes * 60 + 1) / windowSeconds));
}

/** Copy shown on the alarm itself, per outcome. */
export function alarmCopy(plan: AlarmPlan): { title: string; snoozeLabel?: string } {
  const m = offsetMinutes(plan);
  switch (plan.outcome) {
    case 'early':
      return { title: `You won ${m} min`, snoozeLabel: `Snooze ${m} min` };
    case 'onTime':
      return { title: 'Jackpot. Right on time' };
    case 'late':
      return { title: `You're ${m} min late` };
  }
}
