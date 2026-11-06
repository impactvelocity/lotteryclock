# LotteryClock mobile app

Expo (SDK 58) + React Native + Expo Router, UI with [gluestack-ui](https://gluestack.io/) (UniWind / Tailwind) plus custom casino-style components.

```bash
npm install
npx expo start      # press i for the iOS simulator. Expo Go works (alarms are mocked)
npx tsc --noEmit    # typecheck
npx eslint src      # lint
```

## Screens

- **Play** (`src/app/(tabs)/index.tsx`): target time shown as reel windows, bet chips (±5 to ±45 min), odds, and "Place bet". After betting it shows a ticket with the window and a countdown.
- **Reveal** (`src/app/reveal.tsx`): the alarm moment. Three slot reels spin and land on the result. Early gives you Snooze; late gives you "I'm up!" with a 60-second hustle timer.
- **History** (`src/app/(tabs)/history.tsx`): stats, a 14-morning bar chart, and a list of every morning.
- **Settings** (`src/app/(tabs)/settings.tsx`): outcome sounds, haptics, the scoring rules, and developer tools (show the hidden ring time, load demo history, reset).

## Code

- `src/lib/lottery.ts` alarm plan: random offset, outcome, snooze length.
- `src/lib/points.ts` scoring and stats. See `../docs/points.md`.
- `src/lib/store.ts` persisted state (AsyncStorage): settings, the armed bet, history.
- `src/lib/alarm-service.ts` `AlarmService` interface plus a mock. Real AlarmKit / AlarmManager code plugs in here.
- `src/lib/demo.ts` fake history for testing.
- `src/components/` chips, reel time, slot reels, chart, panels. `src/components/ui/` holds gluestack components.
- `src/theme.ts` hex colors and fonts. Tailwind tokens are in `src/global.css`.

## Testing without real alarms

1. Settings → Load demo history, to fill the History tab.
2. Play → Place bet → "Test: ring now", to simulate the ring and score it.
3. Settings → Show hidden ring time, to see which outcome is coming.

## Status

Alarms are mocked. Nothing rings yet. See `../docs/feasibility.md` for the AlarmKit plan.
