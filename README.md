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

## Themes

The iPhone app has seven themes. Each one is shown at a middle risk (22 min) and near the maximum (42 min). The scene and the risk name change as the bet grows.

| Theme | 22 min | 42 min |
|---|:---:|:---:|
| **Good Morning** | <img src="docs/screenshots/classic-mid.jpg" width="220" alt="Good Morning theme, 22 minute risk"> | <img src="docs/screenshots/classic-full.jpg" width="220" alt="Good Morning theme, 42 minute risk"> |
| **Good Night** | <img src="docs/screenshots/night-mid.jpg" width="220" alt="Good Night theme, 22 minute risk"> | <img src="docs/screenshots/night-full.jpg" width="220" alt="Good Night theme, 42 minute risk"> |
| **Día de Muertos** | <img src="docs/screenshots/muertos-mid.jpg" width="220" alt="Día de Muertos theme, 22 minute risk"> | <img src="docs/screenshots/muertos-full.jpg" width="220" alt="Día de Muertos theme, 42 minute risk"> |
| **Prize wheel** | <img src="docs/screenshots/wheel-mid.jpg" width="220" alt="Prize wheel theme, 22 minute risk"> | <img src="docs/screenshots/wheel-full.jpg" width="220" alt="Prize wheel theme, 42 minute risk"> |
| **Poker** | <img src="docs/screenshots/poker-mid.jpg" width="220" alt="Poker theme, 22 minute risk"> | <img src="docs/screenshots/poker-full.jpg" width="220" alt="Poker theme, 42 minute risk"> |
| **Ouija** | <img src="docs/screenshots/ouija-mid.jpg" width="220" alt="Ouija theme, 22 minute risk"> | <img src="docs/screenshots/ouija-full.jpg" width="220" alt="Ouija theme, 42 minute risk"> |
| **Tarot** | <img src="docs/screenshots/tarot-mid.jpg" width="220" alt="Tarot theme, 22 minute risk"> | <img src="docs/screenshots/tarot-full.jpg" width="220" alt="Tarot theme, 42 minute risk"> |

## Ideas for later

- Points, streaks and history (wins, losses, total minutes won)
- Slot-machine style UI and sound
- Risk levels with different payouts
- "Unplugged mode": an in-app bedside clock that shows a drifted time, so the phone's real clock doesn't give the game away (see the feasibility doc)
- Apple Watch and Android versions

## Running the app

There are two apps: the website (`web/`) and the iPhone app (`mobile/`).

### Website

Needs Node 20.9 or later.

```bash
cd web
npm install
npm run dev
```

Then open http://localhost:3000.

### iPhone app

You need:

- a Mac with Xcode 26 or later, with the iOS Simulator installed;
- Node 22.13 or later;
- CocoaPods (`brew install cocoapods`).

Real alarms use Apple's AlarmKit (iOS 26), so the app needs a development build. It won't run in Expo Go.

#### In the simulator

```bash
cd mobile
npm install
npx expo run:ios
```

The first build takes a few minutes. It creates the `ios/` folder, builds the app, installs it in the simulator and starts Metro (the JavaScript server). After that, if the app is already installed, `npx expo start` is enough.

#### On your iPhone

1. Turn on Developer Mode on the phone (Settings → Privacy & Security → Developer Mode) and connect it to the Mac with a cable.
2. In Xcode, sign in with your Apple Account (Xcode → Settings → Accounts). A free account works.
3. If you're not the original developer, change `ios.bundleIdentifier` in `mobile/app.json` to an ID of your own, for example `com.yourname.lotteryclock`.
4. Build and install:

   ```bash
   cd mobile
   npx expo run:ios --device
   ```

   Pick your phone from the list. The first time, Xcode may ask you to choose a signing team. Open `mobile/ios/LotteryClock.xcworkspace`, select the LotteryClock target, choose your team under Signing & Capabilities, then run the command again.

5. To run the app without the Mac (no Metro), build the Release version instead:

   ```bash
   npx expo run:ios --device --configuration Release
   ```

   The JavaScript is bundled into the app, so it keeps working after you unplug the phone.

The phone must be unlocked when the install finishes, or the app installs but doesn't open. If that happens, open it from the home screen.

#### If the build fails

- **CocoaPods fails with an encoding error:** run `export LANG=en_US.UTF-8` first.
- **"Sandbox: node deny file-read-data" in a Release build:** in Xcode, select the LotteryClock target, open Build Settings, and set **User Script Sandboxing** to **No**. Then build again.
- **"No device matching" your phone's name:** names with a curly apostrophe (such as "Dylan’s iPhone") don't match when typed. Use the phone's ID instead. `xcrun xctrace list devices` shows it in brackets after the iOS version, for example `00008150-…`. Then run `npx expo run:ios --device <id>`.
- **"database is locked":** another build is already running. Wait for it to finish, or close Xcode, and try again.

#### Trying an alarm

You don't have to wait until morning. Open Settings → Developer → "Real alarm in ~1 min" (or "Early ring + snooze") to schedule a real alarm about a minute out. See [mobile/README.md](mobile/README.md) for how the app plays and how the code is organised.

## Repo layout

- `mobile/` Expo / React Native app (see `mobile/README.md`)
- `docs/` research and design notes

## Docs

- [Feasibility research: Expo / React Native vs SwiftUI](docs/feasibility.md)
- [Points and scoring design](docs/points.md)
