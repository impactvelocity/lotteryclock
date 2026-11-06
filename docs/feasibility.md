# Feasibility: can the core mechanic work on mobile?

Research date: November 2026.

## Question

Can an Expo / React Native app (preferred, for cross-platform reach) or a SwiftUI app schedule alarms at a random time, with a snooze that ends at the true target time?

## Short answer

Yes. Both can do it, and the mechanic needs no unusual capabilities.

- The random offset is picked once, when the user saves. The app then schedules a normal one-time alarm.
- No code needs to run at 3 AM, so the app doesn't have to be alive when the alarm fires.
- The hard part is making the alarm reliable (rings through silent mode and Focus, survives app kill and reboot). Each platform has a real API for that.

## iOS: AlarmKit (iOS 26+)

Apple added the AlarmKit framework in iOS 26 ([WWDC25 session 230](https://developer.apple.com/videos/play/wwdc2025/230/)). Third-party apps can now schedule real alarms that appear on the Lock Screen, Dynamic Island and Apple Watch, and can break through Silent mode and Focus.

Before iOS 26, third-party apps could only use local notifications. Those can't override the silent switch, have capped sound length and have a limit on pending requests, so they are not good enough for a wake-up alarm. Treat iOS 25 and earlier as unsupported or "best effort."

### Snooze that ends at the target time

This is the key part, and it fits AlarmKit's model:

- Pre-compute the offset when the user saves.
- Schedule the alarm at `target + offset`.
- If the alarm is early (offset is negative), configure the snooze duration as `abs(offset)`. Pressing snooze then re-rings at exactly the target time.
- If the alarm is late, don't offer snooze, or make it a plain dismiss.

This is my reading of the AlarmKit API (alarm countdown durations and the secondary snooze button). It needs a quick prototype to confirm. The `expo-alarm-kit` module exposes a per-alarm `snoozeDuration`, which suggests it works.

Caveat: if the user snoozes a second time, the alarm should not keep re-ringing at the same interval. A custom snooze intent that schedules the next alarm or dismisses is the likely fix.

## Expo / React Native

Expo has no built-in alarm API. `expo-notifications` is not enough (see above). Community native modules fill the gap. All of these are small, young projects, so check their maintenance before relying on one.

| Module | Platforms | Notes |
|---|---|---|
| [`expo-alarm-kit`](https://github.com/nickdeupree/expo-alarm-kit) | iOS 26+ | Per-alarm snooze duration, dismiss/snooze intents that can launch the app, payloads, App Group state sharing. |
| [`react-native-alarm-scheduler`](https://github.com/rajmauryafr/react-native-alarm-scheduler) | iOS + Android | AlarmKit on iOS. On Android it builds an alarm from `AlarmManager.setAlarmClock`, a foreground service and a full-screen lock-screen UI. Needs Expo SDK 57/58. |
| [`react-native-nitro-ios-alarm-kit`](https://github.com/Gautham495/react-native-nitro-ios-alarm-kit) | iOS | Nitro module bindings. |
| [`react-native-ios-alarmkit`](https://github.com/sauravhiremath/react-native-ios-alarmkit) | iOS | Also supports timers and Live Activities. |

Constraints:

- These modules need a development build or prebuild. They do not run in Expo Go.
- iOS needs the iOS 26 SDK, an `NSAlarmKitUsageDescription` string, and (for snooze/dismiss intents that talk to the app) an App Group.
- Custom alarm logic that must run when the alarm fires (not just when it is scheduled) has to be native or handled by AlarmKit intents. JavaScript is not running at that point, especially after a cold launch.
- Fallback: if no module covers a need, write a small custom Expo module in Swift. This is a contained task.

## Android

- `AlarmManager.setAlarmClock` is the standard way to schedule a real alarm. It works through Doze.
- Exact alarms are denied by default on newer Android versions ([Android docs](https://developer.android.com/about/versions/14/changes/schedule-exact-alarms)). An alarm-clock app can declare `USE_EXACT_ALARM`, which is auto-granted but restricted by Google Play policy to apps whose core function is alarms or calendars. LotteryClock qualifies, but the policy declaration is part of the Play submission.
- The alarm UI, sound and snooze logic are the app's own responsibility (no system framework like AlarmKit). `react-native-alarm-scheduler` provides this already; `react-native-alarmageddon` is another option.

## SwiftUI (native iOS)

- Direct access to AlarmKit with no wrapper layer: full API, intents, Live Activities and Watch support.
- Fastest and lowest-risk path for iOS alone.
- iOS only. Android would be a separate codebase.

## Recommendation

**Use Expo / React Native with a development build.**

- The core mechanic is feasible on both platforms.
- The one risk is dependence on young community modules. Mitigation: prototype first, and fall back to a small custom Swift module (iOS) or Kotlin module (Android) if a library falls short.
- If the iOS prototype fails and time is short, SwiftUI is the safe fallback for the hackathon.

## Design decision: the phone shows the real time

Decided: this is fine. The user has to look at the real time to learn whether they won (early), are on time, or are late. The point is that they react to what they see, and trust the time, instead of reflexively snoozing.

## Per-outcome alarm UI and sound (iOS)

AlarmKit fixes the alarm's look and sound when you schedule it, not when it rings. That works here, because the app already knows the offset at schedule time and can pick a configuration per outcome:

| Outcome | Title | Buttons | Sound |
|---|---|---|---|
| Early (win) | for example "You won 14 min" | Stop plus Snooze, with the snooze set to `abs(offset)` | "win" sound |
| On time | "Right on time" | Stop only | "on time" sound |
| Late (loss) | "You're late" | Stop only, no snooze | "late" sound |

What AlarmKit allows:
- Title, button labels, icons and colors are customizable.
- The system always provides the Stop button. The secondary button (snooze) is optional, so a late alarm can omit it.
- Sound can be the default or a named file bundled in the app, set per alarm.

What it doesn't allow: changing the alarm after it is scheduled, except by canceling and rescheduling. Nothing needs to change after scheduling, so this is fine.

Spoiler tradeoff: a different sound per outcome tells the user the result before they look at the phone. The title and the presence of the snooze button only show up on the screen. Make "outcome-specific sound" a setting. Default to one neutral sound so the reveal happens when the user looks.

Library support: `expo-alarm-kit` exposes a snooze on/off flag and a sound name. `react-native-alarm-scheduler` supports custom sounds. I haven't confirmed that either exposes custom button labels or per-outcome titles. If not, a small custom Swift Expo module around `AlarmManager.AlarmConfiguration` gives full control.

## Next step: prototype checklist

1. Expo dev build on a physical iPhone running iOS 26 or later (AlarmKit doesn't fully work in the Simulator).
2. Schedule an alarm 2 minutes out with a 1-minute snooze. Confirm it rings with the phone locked, on silent, in Focus, and after force-quitting the app.
3. Confirm the snooze re-rings at the intended time.
4. Repeat on an Android device with `setAlarmClock`.
