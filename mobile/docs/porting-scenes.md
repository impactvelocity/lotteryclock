# Porting a web theme scene to the app

The web app (`web/`, Next.js) has themed scenes in `web/src/components/scenes/`. The app
(`mobile/`, Expo SDK 58, React Native 0.88 new architecture, React Compiler on) draws the same
themes natively. Each theme lives in `mobile/src/scenes/<theme>/` and exports
`export const kit: ThemeKit` from `index.tsx` (contract: `mobile/src/scenes/types.ts`).

## Web export → kit field

| Web (scenes/index.tsx)                | Kit field       |
|---------------------------------------|-----------------|
| `ThemeScene` branch (e.g. NightScene) | `Scene`         |
| `DialBackdrop` branch (e.g. MoonHalo) | `DialBackdrop`  |
| `RollFlourish` branch                 | `RollFlourish`  |
| `ResultFlourish` branch               | `ResultFlourish`|
| Mascot face (CalaveraFace/LuckyFace/BitFace in hero.tsx) | `MascotFace` |
| `ThemeOverlay` (Ouija FilmFX)         | `Overlay`       |
| Theme ornament in `web/src/components/bet-dial.tsx` (`t.ornament === ...`) | `DialUnder` (under the minute ticks) / `DialOver` (over them) |

The app's core dial (not yours) already draws: halo, disc, track, arc / LED segments, ring
hairlines, minute ticks, the 12 o'clock notch, marquee bulbs, the centre time and the bell
handle. Draw only the theme ornament layers, in the dial's 358-unit space
(`C = 179`, `TRACK_R = 148`, `pt(deg, r) = [C + r·sin, C − r·cos]`), as react-native-svg
elements (`G`, `Path`, `Circle`, `Line`, `Rect`, `Text`…), never Views.

## Where things sit (iPhone 17 Pro, 402 × 874 pt)

The scene fills the screen from the top down to the rail line (`height` ≈ 742). The dial centre
is around (201, 355), diameter ≈ 330 (always use the `dial` / `size` props, never hard-code).
The web hero on a phone is taller (≈ 390 × 1010, with the headline above the dial), so don't
copy its percentages blindly: keep the composition — sky things up top, ground / horizon art
sitting on the bottom edge (the rail), things that frame the dial placed relative to `dial`.

## Tools

- `@/scenes/art`: `<Art name="night/moon-full" width height color? />` draws any SVG from
  `web/src/components/scenes/art/**` (strings in `art.generated.ts`), `artViewBox(name)`.
  Memoise; don't remount hundreds of them.
- `@/scenes/anim`: shared Reanimated CSS keyframes `KF` (float, spin, pulse, blink, shake,
  twinkle, ring, sway, bob, fadeIn) and `loop(KF.x, seconds, { delay, ease, alternate })`.
  Port other web `@keyframes lc-*` (web/src/app/globals.css) next to your scene with
  `css.keyframes({...})` from `react-native-reanimated`.
- Reanimated 4 CSS animations on `Animated.View`: `animationName`, `animationDuration: '3s'`,
  `animationDelay: '-1.2s'`, `animationIterationCount: 'infinite'`,
  `animationTimingFunction: 'ease-in-out' | 'linear' | steps(n) | cubicBezier(...)`,
  `animationDirection`. CSS transitions for prop changes (e.g. opacity as the bet grows):
  `transitionProperty: 'opacity', transitionDuration: 500`. Keyframe transforms are arrays:
  `{ transform: [{ translateY: -12 }, { rotate: '10deg' }] }`.
- Views accept CSS strings: `backgroundImage: 'radial-gradient(circle at 50% 20%, #fff 0%, transparent 70%)'`
  (linear-gradient and radial-gradient), `boxShadow: '0 0 12px rgba(…)'` (multiple, inset),
  `mixBlendMode`. iOS has no CSS `filter` blur / drop-shadow: use boxShadow on round Views, or
  react-native-svg `RadialGradient` fills, for glows. If a gradient string doesn't render, fall
  back to an `Svg` with `LinearGradient` / `RadialGradient`.
- `@/lib/rand` `frac(i, salt)` (deterministic), `@/lib/scallop`, `@/themes/themes`
  (`THEMES`, `ramp`, `rampN`, `css`, `cssA`, `mixHex`, `MAX_RANGE`, `tierIndex`),
  `@/themes/fonts` (`fontFor(key, weight)`; fonts are Geist, addressed by PostScript name).
- Everything is decorative: `pointerEvents="none"` on scene roots.
- Performance: keep it under ~60 animated nodes per scene; animate transforms / opacity of
  Views, not SVG path data; static art stays static.

## Check your work

- Typecheck: `cd mobile && npx tsc --noEmit 2>&1 | grep src/scenes/<theme>` (other folders may
  be mid-edit by someone else; ignore their errors).
- See it: `cd mobile && ./scripts/preview-scene.sh <your-simulator-udid> "theme=<id>&range=30&mood=idle" /tmp/…/shot.png 8`
  then Read the PNG. Moods: idle, set, win, loss, jackpot. Try ranges 0, 10, 20, 30, 45.
  `&clean=1` hides the labels; `&parts=roll,result,mascot` picks which kit parts show under the rail.
  Metro (port 8082) fast-refreshes every simulator on save; if a screenshot shows a red error
  box, read it and fix it. Only use your own simulator UDID.
