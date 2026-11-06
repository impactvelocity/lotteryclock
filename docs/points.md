# Points: how the game scores a morning

Implemented in `mobile/src/lib/points.ts`.

## Goal

The alarm time is pure luck. If points came only from luck (+minutes early, −minutes late), the average would be zero and nothing you do would matter. The original 2002 idea was about behavior: you didn't know if you were late, so you got up. Points should reward that reaction, not just the dice roll.

## Rules

Points are chips. Your bet is the risk window in minutes (±5 to ±45).

| Result | When | Chips |
|---|---|---|
| 🍒 Win | Rang early | + minutes early. Snooze ends exactly at your target. |
| 7️⃣ Jackpot | Rang within 1 min of target | + 2 × bet |
| ⏰ Late | Rang late, slow to stop | − minutes late |
| ⚡ Hustle | Rang late, stopped within 60 s | − half the minutes late (rounded up) |
| 💀 Bust | Snoozed again after the snooze ended at target | − bet |

Minutes are rounded to whole minutes, minimum 1.

Example with a ±15 bet and a 7:30 target:
- Rings 7:16: win +14, snooze 14 min.
- Rings 7:30:20: jackpot +30.
- Rings 7:41, you stop it in 20 s: hustle −6. In 3 min: late −11.
- Rings 7:16, you snooze, then snooze again at 7:30: bust −15.

## Why these numbers

The ring offset is uniform over ±bet, so if `R` is the bet:

- Jackpot odds are about 1 in `R` and pay `2R`, so they add about +2 per morning at any bet size.
- Early half the time, averaging `R/2` minutes, which adds about `+R/4`.
- Late half the time, averaging `R/2` minutes. That costs `−R/4` if you're slow and `−R/8` if you hustle.

Expected chips per morning (checked with a 400,000-morning simulation of the scoring code's rules):

| Behavior | Expected chips | ±15 bet | ±45 bet |
|---|---|---|---|
| Slow when late | ≈ +2 | +2 | +2 |
| Always hustle | ≈ 2 + R/8 | ≈ +3.8 | ≈ +7.6 |
| Busting | strongly negative | | |

So:
- Getting up fast when late is what makes the game winnable.
- Bigger bets pay more only if you hustle, which rewards bravery plus discipline.
- Snoozing past your target is the one move that's always punished.

## Measuring it with real alarms

The app needs two facts per morning: when the user first reacted (stop or snooze) and how many times they snoozed.

- iOS: AlarmKit stop and snooze buttons can run App Intents. These write timestamps to the App Group, and the app reconciles on next launch.
- Android: the app owns the ring UI, so it records taps directly.
- The mock build simulates this. "Test: ring now" opens the reveal screen and uses your real tap delay.

Limitation: stopping the alarm isn't proof you got up. Later options are an "I'm up" check-in a few minutes after stopping, or a step count from HealthKit or Health Connect.

## Stats shown in History

- Bankroll: sum of all chips.
- Snooze won: total minutes won on early rings.
- Win rate: share of mornings that were a win or a jackpot.
- Streak: consecutive recent mornings with positive chips, plus the best streak.

## Ideas for later

- Streak multiplier, for example ×1.5 chips after 5 positive mornings.
- Weekly "house edge" report.
- Unlockable reel symbols and sounds bought with chips.
