# LotteryClock mobile app

The iPhone app: the website's themes, drawn natively, with real alarms.

Expo SDK 58, React Native 0.88 (new architecture), Expo Router, Reanimated 4 (CSS animations),
react-native-svg. Real alarms use Apple's AlarmKit (iOS 26+) through a small local Expo module,
so it needs a development build, not Expo Go.

```bash
npm install
npx expo run:ios      # builds the app and installs it on the simulator (or a device with -d)
npx expo start        # Metro, if the app is already installed
npx tsc --noEmit      # typecheck
npx eslint src        # lint
```

## How it plays

1. **Play**: pick a theme (arrows, or tap the name for the list), tap the time to change your
   target, drag the bell round the dial to add doubt (0 to 45 minutes either side).
2. **Set Alarm** schedules a real alarm at a random moment in that window. The offset stays
   hidden; the screen shows the bedside clock, your target and doubt, and the window it rings in.
3. When it rings, the system alarm says how it went ("Snooze until 7:30 AM", "No snooze. Up you
   get", "Jackpot. Right on time") in the theme's words. Rang early? Its Snooze button counts down
   the minutes you won (from when you press it) and rings again, so you're up at your target.
4. Open the app and the bedside clock rolls and lands on when it really rang, with the theme's
   verdict. **I'm Up** (or **Snooze**) scores the morning into History.

To try it without waiting until morning, Settings → Developer → "Real alarm in ~1 min" (or
"Early ring + snooze") schedules a real alarm a minute out.

## Themes

Each theme is the web theme (`web/src/lib/themes.ts`) ported natively: Good Morning, Good Night,
Día de Muertos, Prize wheel, Poker, Ouija and Tarot. Digital, Magic 8 Ball and Caffè are ported
too but hidden, because the web marks them `hidden`; un-hide one there, re-run the sync, and it
shows up in the app.

- `src/themes/themes.ts` is generated from the web file: `node scripts/sync-themes.mjs`.
- `src/scenes/art.generated.ts` holds the web's SVG art: `node scripts/sync-art.mjs`.
- `src/scenes/<theme>/` is each theme's kit: background scene, the effect behind the dial, dial
  ornaments, roll and result flourishes, mascot. The contract is `src/scenes/types.ts`, and
  `docs/porting-scenes.md` explains how to port one.
- Fonts are Geist (Sans, Mono, Serif, Serif Triangle, Serif Heart, Pixel Square), bundled from
  `assets/fonts` by the expo-font config plugin.
- Sounds are the web's recordings (`assets/sfx`): latch, beeps, each theme's draw song, and the
  win / lose / jackpot stings. Each theme's song also plays in the background while it's chosen
  (fading out when the alarm is set), using the web's seamless loop where there is one.

## Code

- `src/app/(tabs)/index.tsx` Play: the dial, Set Alarm, the armed clock and the reveal.
- `src/app/(tabs)/history.tsx`, `settings.tsx` themed History and Settings.
- `src/app/preview.tsx` developer harness for theme scenes
  (`scripts/preview-scene.sh <udid> "theme=night&range=30&mood=idle" out.png`).
- `src/components/` the dial, rail and push button, seven-segment clock, theme picker, status line.
- `src/lib/alarm-service.ts` AlarmKit (via `modules/lottery-alarm`) with a local-notification
  fallback where AlarmKit isn't available.
- `src/lib/lottery.ts` the plan: random offset, outcome, snooze length. `src/lib/points.ts` scoring.
- `src/lib/store.ts` persisted state: settings (theme, time, doubt), the armed bet, history.
- `modules/lottery-alarm/` the Swift AlarmKit bridge (`ios/LotteryAlarmModule.swift`).

## Before shipping to a phone

- AlarmKit needs iOS 26 or later; older phones fall back to notifications, which can't ring
  through Silent mode.
- Building for a device needs your Apple team in Xcode (or `eas build`), and the
  time-sensitive notifications capability for the fallback.
