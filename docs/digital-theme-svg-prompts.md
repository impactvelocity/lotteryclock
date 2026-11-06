# Digital theme: SVG prompts

The Digital theme is an 8-bit arcade screen: phosphor green that overheats to magenta as the bet climbs, a pixel starfield, a neon grid floor rolling towards you, power-ups at the edges, CRT scanlines, and Bit, a pocket LCD clock with a face for every tier.

All of its art is already drawn in code. `web/src/components/scenes/digital-art.tsx` holds every sprite as a grid of characters, one per pixel. These prompts are for upgrading that art. Save the generated files in `web/src/components/scenes/art/digital/` (a new folder, next to `art/tarot/`) and send them over. I'll turn them back into sprite grids, so pixel-exact grids and the ids below matter more than anything else.

## The theme in brief

| Tier | Name | What changes in the scene | Bit's face |
|---|---|---|---|
| 0 min | Insert coin | A quiet starfield, the grid barely crawling, one faint pixel ring behind the dial. | Asleep, a Z floating up |
| 1–11 | Easy mode | The grid starts to roll, the first power-ups float in. | Calm smile |
| 12–23 | Level up | More stars and power-ups, more rings light up, the grid speeds up. | Big happy grin, a sparkle |
| 24–35 | Hard mode | The screen warms towards magenta, the first glitches tear across it. | Determined, brows down |
| 36–44 | Boss fight | Glitches everywhere, the grid races. | Nervous, wobbly mouth, sweating |
| 45 | Final boss · full 45 | Everything at full tilt, and the whole screen jolts every few seconds. | Wild `> <` eyes in yellow, temper marks |

The dial is a CRT screen: its track is an LED level meter (one segment per minute, lime → yellow → pink), with PLAYER 1 above the time and three pixel hearts below it that drain as the bet grows (3, 3, 2, 2, 1, then none at the full 45, the last one blinking).

- **Setting:** "Player one ready…"
- **Rolling:** "Now loading". The stars streak past at warp speed while Bit hops on the spot, eyes darting left and right, to a chiptune arpeggio.
- **Snooze:** "1UP! Snooze till {time}" / "Extra life: {mins} more sleep". Hearts, coins and 1UPs float up, and Bit dozes off.
- **Late:** "Game over. Up you get" / "{mins} late. Continue?". The picture collapses like a switched-off CRT, the screen goes dim and red, the power-ups drop off the bottom, and Bit gets knocked out (X eyes).
- **On the dot:** "Perfect! Right on time" / "Flawless. Not a minute off". Pixel confetti, the grid cycles through every colour, and Bit sees stars.

**No prompt needed** (drawn in code): the background, the grid floor and horizon glow, the starfield, warp streaks, glitch bars, scanlines, the CRT switch-off, the pixel rings behind the dial, the LED track and the confetti.

---

## Style block (paste this before every prompt)

```text
STYLE: original 8-bit pixel art, delivered as SVG. Every pixel is a 1×1 square on an integer grid: draw only <rect> elements with integer x, y, width and height (a horizontal run of same-coloured pixels may be one rect, height 1). No <path>, <circle>, curves, strokes, gradients, opacity, filters, transforms, masks or <text>. Put shape-rendering="crispEdges" on the <svg>. Transparent background.

Chunky, readable silhouettes: a 1-pixel dark outline round every character and object, flat colour fills, a lighter highlight pixel or row for shine on the top left, and a darker shade colour along the bottom and right edges. Cute, not gritty.

Palette (use only these):
  outline      #1A0B24  outlines, facial details on light fills
  pink         #FF4FA3  Bit's casing, main warm fill
  pink-shade   #C22E7A  shading on pink
  pink-light   #FFB3D6  highlights on pink
  yellow       #FFE135  Bit's snooze button, coins, stars
  yellow-shade #E0A800  shading on yellow
  gold         #C98A00  details on coins
  screen       #0B2018  Bit's LCD screen
  lime         #5CFF95  Bit's face pixels, accents
  cyan         #3DE0FF  Zs, sweat, lightning, accents
  magenta      #FF3DCB  gems, accents
  magenta-dark #B5208F  shading on magenta
  red          #FF3D6E  hearts, temper marks
  white        #FFFFFF  shine pixels

SVG hygiene: use exactly the viewBox given; put each part in a named <g id="…">; nothing outside its cell.
Original artwork. Don't copy any existing video game's characters, sprites, power-ups, fonts or lettering.
```

---

## Core assets

### 1. Bit: six tier faces → `bit-expressions.svg`

Bit sits beside the tier name under the dial, about 40 px tall, so the face has to read at that size. Its face swaps when the tier changes.

```text
[STYLE]
A sprite sheet of one character in six moods: "Bit", a cute pocket LCD alarm clock, front-facing. Bit is a chunky rounded box in pink with a 1-pixel outline, a small yellow snooze button on top, two short stubby feet, and a dark screen set into the front. The face is drawn only in lime pixels on the screen, like an LCD display.

Canvas: viewBox="0 0 132 22". Six 22×22 cells with left edges at x = 0, 22, 44, 66, 88, 110.
In every cell, Bit's body fills x 2–19 and y 4–19 of the cell (18 wide, 16 tall); the screen is 10 × 6 pixels inside the casing, centred left to right, in its upper half.
The casing, button, feet and screen must be pixel-for-pixel identical in all six cells: only the lime face pixels and the little extras change. Extras may use the empty rows above Bit (y 0–3) and the 2-pixel margins at the sides.
Each cell is a group: bit-insert-coin, bit-easy, bit-level-up, bit-hard, bit-boss, bit-final-boss. Inside each: <g id="body">, <g id="face"> and, where there is one, <g id="extras">.
Faces, left to right:
  1 insert-coin: asleep. Eyes are flat 3-pixel lines, a tiny 2-pixel mouth. Extra: a cyan pixel "Z" above the top right.
  2 easy: calm. 1×2 pixel eyes, a small U-shaped smile.
  3 level-up: thrilled. 2×2 eyes, a wide open grin. Extra: a small yellow plus-shaped sparkle by the top left.
  4 hard: determined. 2×2 eyes with a single brow pixel slanting down towards the middle above each one, a flat mouth.
  5 boss: nervous. 2×2 eyes, a wobbly zigzag mouth. Extra: a cyan sweat drop at the top right of the casing.
  6 final-boss: gone wild. Eyes are ">" and "<" shapes in yellow (not lime), a huge open grin in yellow. Extras: two small red X-shaped temper marks above either top corner.
```

### 2. Bit: reactions → `bit-reactions.svg`

Bit pops up beside the result badge (about 48 px), and hops above the progress bar while the draw rolls.

```text
[STYLE]
Five more frames of "Bit" from the same sprite sheet (the pocket LCD alarm clock), with a body identical to the six-mood sheet: same 22×22 cells, body at x 2–19, y 4–19, 10×6 screen.

Canvas: viewBox="0 0 110 22". Five 22×22 cells with left edges at x = 0, 22, 44, 66, 88. Groups: bit-snooze, bit-game-over, bit-perfect, bit-look-left, bit-look-right.
  1 snooze: dozing happily. Flat 2-pixel eyes, a soft smile. Extras: a small and a larger cyan pixel "Z" rising from the top right.
  2 game-over: knocked out. Each eye is a 3×3 pixel "X", a flat mouth, all in red instead of lime. Extra: a cyan sweat drop.
  3 perfect: seeing stars. Each eye is a 3×3 plus-shaped star, a wide smile, in yellow instead of lime. Extras: three tiny plus-shaped sparkles round the casing in yellow, cyan and magenta.
  4 look-left: eyes (2×2) and mouth shifted to the left edge of the screen, as if glancing left.
  5 look-right: the mirror of look-left.
```

### 3. Power-ups → `power-ups.svg`

These float at the edges of the screen (24–38 px wide), more of them as the bet grows, and rise up the screen on a snooze. Coins flip as they go.

```text
[STYLE]
Eight small arcade power-up sprites, each in its own cell, for floating around a web page.
Canvas: viewBox="0 0 120 12". Eight 12×12 cells with left edges at x = 0, 15, 30, 45, 60, 75, 90, 105 (3-pixel gaps between them). Each sprite is centred in its cell and fits within about 10×10 pixels.
  1 id="heart": a red heart with a 1-pixel outline and one white shine pixel top left.
  2 id="coin": a yellow coin seen face-on, taller than wide, with a gold vertical slot line down the middle, yellow-shade on its right edge and a white shine column on the left.
  3 id="star": a chunky yellow five-point star, a white shine pixel near the top, yellow-shade on the lower points.
  4 id="bolt": a cyan lightning bolt, zigzagging from top right to bottom left, with a white tip pixel.
  5 id="gem": a magenta cut gem, flat top and pointed bottom, magenta-dark on the right facets, a white shine pixel.
  6 id="key": a yellow key lying diagonally, a round bow with a hole, two teeth.
  7 id="potion": a round-bottomed flask with a cork, filled with lime liquid, a white shine pixel.
  8 id="clock": a tiny round alarm clock with two bells on top, pink casing, a white face and outline-coloured hands.
No faces on these.
```

### 4. Horizon strip → `horizon.svg`

A low pixel skyline along the horizon, behind the side labels. It's drawn dark against the screen with a thin neon top edge (the edge colour is set in code, so draw it in lime and it gets recoloured).

```text
[STYLE]
A wide, low horizon silhouette for a retro arcade screen: a stepped pixel landscape of blocky hills and a few small pixel buildings (flat roofs, antennas, a water tower, the odd lit window), designed to tile left to right.
Canvas: viewBox="0 0 200 24". Two groups:
  <g id="silhouette">: one dark fill (#06150F) covering everything from the skyline down to y = 24, made of rects.
  <g id="edge">: a 1-pixel lime (#5CFF95) line tracing the top of the silhouette, following every step, plus a few lime window pixels.
Keep the middle third (x 67–133) low, no taller than 8 pixels, so it doesn't crowd the text in front of it. The far left and far right edges must be the same height so the strip tiles.
```

### 5. Dial pieces → `dial-pieces.svg`

The handle you drag round the dial, and the three lives under the time.

```text
[STYLE]
Three tiny UI sprites in one sheet.
Canvas: viewBox="0 0 40 12". Cells with left edges at x = 0, 14, 28, each 12×12.
  1 id="bell": a solid alarm bell, symmetric, 10 wide × 9 tall, in a single colour (#FFFFFF): rounded dome, flared rim, a 2-pixel clapper below with a 1-pixel gap. No outline (it's recoloured in code).
  2 id="heart-full": a 7×6 heart in red with one white shine pixel, no outline.
  3 id="heart-empty": the same 7×6 heart as a 1-pixel outline only, in #FFFFFF (recoloured in code), hollow inside.
```

### 6. Tier icons → path strings for `themes.ts`

Only used if the mascot is switched off; the current ones are hand-written (coin slot, joystick, arrow, sword, horned skull, crown). These are line icons, not pixel art, so skip the style block.

```text
Six small line icons for a UI on a 24×24 grid, in a blocky, pixel-game spirit: straight lines and right angles where possible, corners only lightly rounded. They're rendered with fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round". So: strokes only, no fills, no <circle> or <rect> (draw them as paths), no transforms, every coordinate between 2 and 22 on whole or half units, at most 5 paths per icon.
Return only a JSON array of six arrays of path "d" strings, in this order:
  1 Insert coin: a coin slot with a coin dropping into it.
  2 Easy mode: an arcade joystick on its base.
  3 Level up: a chunky up arrow with two bars under it.
  4 Hard mode: a sword, point up and to the right.
  5 Boss fight: a horned skull.
  6 Final boss: a three-point crown with a gem in the middle.
```

---

## Optional extras

### 7. Pixel lettering → `pixel-words.svg`

Words that could float up or flash on the screen with a result (they're currently set in Geist Pixel, the theme's font).

```text
[STYLE]
Four short words in chunky original pixel lettering (draw every letter yourself from rects; don't use or copy any existing font). Capital letters 5 pixels tall, 1-pixel gaps between letters, a 1-pixel outline (#1A0B24) round each word so it reads on any background.
Canvas: viewBox="0 0 120 40", one word per row, each left-aligned at x = 0:
  id="one-up": "1UP" in lime, at y 0–7.
  id="game-over": "GAME OVER" in red, at y 10–17.
  id="perfect": "PERFECT!" in yellow, at y 20–27.
  id="continue": "CONTINUE?" in cyan, at y 30–37.
```

### 8. Pixel sunset → `sunset.svg`

A big striped pixel sun that could rise behind the horizon on a perfect result.

```text
[STYLE]
A large retro pixel sun, a pixel-perfect circle 48 pixels across, filled in horizontal bands from yellow at the top through pink to magenta at the bottom (flat bands, no gradients). Its lower half is cut by horizontal gaps that get thicker towards the bottom (1, 1, 2, 2, 3 pixels), like slats.
Canvas: viewBox="0 0 48 48". <g id="sun"> only; no outline.
```
