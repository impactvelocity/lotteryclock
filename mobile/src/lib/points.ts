/**
 * Scoring. See docs/points.md for the reasoning.
 *
 * Points are "chips". Your bet is the risk window in minutes.
 *   Win      rang early            +minutes early
 *   Jackpot  within 1 min of target +2 x bet
 *   Late     rang late             -minutes late
 *   Hustle   late, stopped < 60s   -half the minutes late (rounded up)
 *   Bust     snoozed past target   -bet
 */
import { offsetMinutes, type AlarmPlan } from './lottery';

export const HUSTLE_SECONDS = 60;
export const JACKPOT_MULTIPLIER = 2;

export type Resolution = {
  /** What the user did when the alarm rang. */
  action: 'stopped' | 'snoozed';
  /** When the user first reacted to the ring. */
  respondedAtMs: number;
  /** Number of snoozes. More than 1 means they snoozed past the target. */
  snoozeCount: number;
};

export type ScoreKind = 'jackpot' | 'win' | 'late' | 'hustle' | 'bust';

export type Score = {
  kind: ScoreKind;
  points: number;
};

export function scoreMorning(plan: AlarmPlan, res: Resolution): Score {
  const minutes = offsetMinutes(plan);
  switch (plan.outcome) {
    case 'onTime':
      return { kind: 'jackpot', points: JACKPOT_MULTIPLIER * plan.riskMinutes };
    case 'early':
      if (res.snoozeCount > 1) return { kind: 'bust', points: -plan.riskMinutes };
      return { kind: 'win', points: minutes };
    case 'late': {
      const reactionSeconds = (res.respondedAtMs - plan.ringAtMs) / 1000;
      if (reactionSeconds <= HUSTLE_SECONDS) {
        return { kind: 'hustle', points: -Math.ceil(minutes / 2) };
      }
      return { kind: 'late', points: -minutes };
    }
  }
}

export const KIND_META: Record<ScoreKind, { label: string; symbol: string }> = {
  jackpot: { label: 'Jackpot', symbol: '7️⃣' },
  win: { label: 'Win', symbol: '🍒' },
  late: { label: 'Late', symbol: '⏰' },
  hustle: { label: 'Hustle', symbol: '⚡' },
  bust: { label: 'Bust', symbol: '💀' },
};

export type HistoryEntry = {
  id: string;
  plan: AlarmPlan;
  resolution: Resolution;
  score: Score;
};

export type Stats = {
  mornings: number;
  bankroll: number;
  /** Total snooze minutes won on early rings. */
  minutesWon: number;
  /** Share of mornings that were a win or jackpot, 0..1. */
  winRate: number;
  jackpots: number;
  /** Consecutive most recent mornings with positive points. */
  streak: number;
  bestStreak: number;
};

/** @param history newest first */
export function computeStats(history: HistoryEntry[]): Stats {
  let bankroll = 0;
  let minutesWon = 0;
  let wins = 0;
  let jackpots = 0;
  let bestStreak = 0;
  let run = 0;

  // Oldest to newest so streaks are computed in time order.
  for (let i = history.length - 1; i >= 0; i--) {
    const { plan, score } = history[i];
    bankroll += score.points;
    if (score.kind === 'win') minutesWon += offsetMinutes(plan);
    if (score.kind === 'win' || score.kind === 'jackpot') wins++;
    if (score.kind === 'jackpot') jackpots++;
    run = score.points > 0 ? run + 1 : 0;
    bestStreak = Math.max(bestStreak, run);
  }

  return {
    mornings: history.length,
    bankroll,
    minutesWon,
    winRate: history.length ? wins / history.length : 0,
    jackpots,
    streak: run,
    bestStreak,
  };
}
