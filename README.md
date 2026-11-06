# LotteryClock

An alarm clock that gambles with your morning.

You pick a wake-up time and a risk window. The alarm rings at a random moment inside that window, before or after your target time. You never know which.

## Origin

**Early 2000s.** I tripped over my alarm clock while cleaning and unplugged it. Later I plugged it back in without knowing how long it had been off. I was always late for school and always hit snooze.

The next morning, just before I hit snooze, I stopped and wondered whether the time was right. Had it been unplugged for 5 minutes or 20? Was I late?

Not knowing got me out of bed. I was on time that day and the next few, until I worked out the offset and reset the clock.

**2012.** I built a first iPhone version designed like a slot machine. It never launched.

**Now.** This is a rebuild for the Kiroween hackathon, "Resurrection" category: an old idea brought back with current tech.

## Core mechanic

1. Set a target time, for example 7:30.
2. Set a risk, which is the width of the window on each side of the target. The range is 5 to 45 minutes.
3. When you save, the app picks a random offset between -risk and +risk and schedules the alarm at target + offset. The offset stays hidden.

Outcomes:

| Alarm rings | Result |
|---|---|
| Before target (for example 14 min early) | You win. You can snooze, and the snooze ends exactly at the target time, so you earned 14 minutes of sleep. |
| After target (for example 14 min late) | You lose. You are late and should get up now. |

The uncertainty is the point. Because you can't tell whether you're early or late, you tend to get up instead of snoozing.

## Ideas for later

- Points, streaks and history (wins, losses, total minutes won)
- Slot-machine style UI and sound
- Risk levels with different payouts
- "Unplugged mode": an in-app bedside clock that shows a drifted time, so the phone's real clock doesn't give the game away (see the feasibility doc)
- Apple Watch and Android versions

## Repo layout

- `mobile/` Expo / React Native app (see `mobile/README.md`)
- `docs/` research and design notes

## Docs

- [Feasibility research: Expo / React Native vs SwiftUI](docs/feasibility.md)
- [Points and scoring design](docs/points.md)
