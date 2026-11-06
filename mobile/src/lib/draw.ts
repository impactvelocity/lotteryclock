/**
 * The alarm's draw, rigged a little for the demo: pure chance can hand out ten snoozes in a
 * row, so nobody would ever see the other outcome. Here the same result (early or late) never
 * comes up more than MAX_STREAK times running; the next draw lands on the other side instead.
 */

/** Which side the last draws landed on (-1 early, 1 late, 0 on time) and how many in a row. */
export type Streak = { side: number; count: number };

export const NO_STREAK: Streak = { side: 0, count: 0 };
const MAX_STREAK = 2;

/** A minute offset in -range..range, plus the streak it leaves behind. */
export function drawOffset(range: number, streak: Streak, rand = Math.random) {
  let offset = Math.floor(rand() * (2 * range + 1)) - range;
  if (offset !== 0 && streak.count >= MAX_STREAK && Math.sign(offset) === streak.side) {
    // Mirror it: same distance, the other side, so it's still uniform over that side
    offset = -offset;
  }
  const side = Math.sign(offset);
  const next: Streak = side === streak.side ? { side, count: streak.count + 1 } : { side, count: 1 };
  return { offset, streak: next };
}
