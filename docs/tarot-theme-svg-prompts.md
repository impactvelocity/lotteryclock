# Tarot theme: SVG prompts

A new dial theme in the style of a vintage tarot print: bold ink outlines, flat fills, engraved line hatching, a mint sky with coral and chartreuse, and gold filigree.

Save the generated files in `web/src/components/scenes/art/tarot/`, next to `art/classic/`. They get inlined as React the same way `sunrise-art.tsx` inlines Classic's art, so exact ids and viewBoxes help but don't have to be perfect. I'll normalise them when wiring them in.

## The theme in brief

Each bet tier is a Major Arcana card, and the scene builds up as the bet grows:

| Tier | Card | What changes in the scene |
|---|---|---|
| 0 min | Temperance | Calm mint sky. The sun is asleep. |
| 1–11 | The Star | Eight-point stars come out. |
| 12–23 | Wheel of Fortune | Planets drift in, and the wheel behind the dial starts turning. |
| 24–35 | The Devil | The sky warms to coral and flames rise along the mountains. |
| 36–44 | The Tower | Lightning bolts flank the dial. |
| 45 | The Fool · full 45 | All of it at once, with the wheel spinning fast. |

The **sun** changes its face with the tier. The **moon** reacts to the result: idle, setting, snooze, late or jackpot. A jackpot brings in The World's laurel wreath around the dial.

Draft copy:

- **Setting:** "Shuffling the deck…"
- **Rolling:** "Drawing your card"
- **Win:** "Upright. Sleep till {time}" / "The cards grant {mins} more sleep"
- **Loss:** "Reversed. Rise now" / "Fate takes {mins}"
- **Jackpot:** "The World" / "Not a minute won or lost"

**No prompt needed** (I'll draw these in code): the sky gradient, the fine ray burst, the sparkle stars (the night scene already has the path), and the infinity sign.

---

## Style block (paste this before every prompt)

```text
STYLE — vintage tarot print. Flat vector art like a hand-inked, screen-printed tarot card or flash tattoo: bold, even dark-ink outlines; flat colour fills; shading done only with engraved line hatching (parallel strokes, never gradients). No gradients, drop shadows, blurs, filters, textures, raster images or <text>. Transparent background.

Palette (use only these):
  ink        #17383A  outlines, hatching, facial features
  mint       #9CD3C7  sky tints, light fills
  teal       #2E6E6A  deep fills
  coral      #F07F68  main warm fill
  blush      #F5B3A3  secondary warm fill
  chartreuse #D7EA7B  sun, highlights, lightning
  cream      #FBF4E6  paper, light fills
  gold       #E2AE4A  filigree, accents

Line weight at the viewBox sizes given: outlines 3, inner details 2, hatching 1.5; round caps and joins.
SVG hygiene: use exactly the viewBox given; put every part in a named <g id="…">; avoid transforms on paths; no clipPaths or masks unless asked; close every shape.
Original artwork. Do not copy any existing tarot deck's card art.
```

---

## Core assets

### 1. Sun: six faces, one per tier → `sun-expressions.svg`

Sits in the top right of the scene. The face swaps when the tier changes, and the rays rotate slowly.

```text
[STYLE]
A sprite sheet of six versions of one character: an antique alchemical sun with a human face, front-facing and symmetrical, in a woodcut tarot style (almond eyes with heavy lids, a long straight nose drawn as one line, small full lips, a calm classical face).

Canvas: viewBox="0 0 1130 180". Six 180×180 cells with left edges at x = 0, 190, 380, 570, 760, 950. In each cell the sun is centred on (90, 90) of that cell.
Each cell is a group with its own id (sun-temperance, sun-star, sun-fortune, sun-devil, sun-tower, sun-fool) containing:
  <g id="rays">: 32 straight, thin engraved rays from r=52 out, alternating long (to r=86) and short (to r=72); ink stroke 2, round caps. The same in all six cells.
  <g id="face">: a chartreuse disc r=46 with an ink outline 3, then the features in ink.
Expressions, left to right:
  1 temperance: serene and asleep. Eyes closed as gentle downward arcs, a soft closed smile, small blush cheeks.
  2 star: waking and dreamy. Eyes half open and looking up, a tiny four-point sparkle in one eye, a faint smile.
  3 fortune: knowing. Eyes open and glancing to one side, a one-sided smile, one brow slightly raised.
  4 devil: sly. Narrowed eyes, both brows angled in, a smirk. Two small coral horns poke out of the top of the disc.
  5 tower: alarmed. Wide round eyes with tiny pupils, raised brows, an open "O" mouth, one cream sweat drop on the temple.
  6 fool: wild joy. Eyes squeezed shut in happy upward arcs, a huge open grin with a coral tongue, three tiny stars circling the head.
Keep the head shape, rays and line weight identical in every cell. Only the features (plus the horns, sweat drop and stars) change.
```

### 2. Moon: five moods → `moon-expressions.svg`

Sits in the top left of the scene and reacts to the result.

```text
[STYLE]
A sprite sheet of five versions of one character: a crescent moon with a woman's face in profile, in an antique tarot woodcut style. The crescent opens to the right. The profile face sits on the inner curve facing right, so the nose, lips and chin form the inner edge of the crescent.

Canvas: viewBox="0 0 940 180". Five 180×180 cells with left edges at x = 0, 190, 380, 570, 760. In each cell the moon fits inside a circle of r=48 centred on (90, 90).
Each cell is a group with its own id (moon-idle, moon-set, moon-win, moon-loss, moon-jackpot) containing:
  <g id="rays">: 40 fine engraved rays from r=56 to r=84, ink stroke 1.5. The same in every cell.
  <g id="face">: a cream crescent with an ink outline 3, a blush cheek and ink features.
Moods, left to right:
  1 idle: peacefully asleep. The eye is closed as a long lashed arc, lips relaxed.
  2 set: one eye cracked open and peeking sideways, lips pressed together (suspicious).
  3 win: deep, blissful sleep. Eye closed, a contented smile, a tiny chartreuse star resting on the tip of the crescent.
  4 loss: horrified. The eye is wide open with a small pupil, the brow shot up, the mouth open in a gasp.
  5 jackpot: a wink. The eye is closed with a curl of lashes, plus a satisfied smirk.
Keep the crescent shape, rays and line weight identical in every cell. Only the features change.
```

### 3. Wheel of Fortune: dial backdrop → `fortune-wheel.svg`

Sits centred behind the dial at about 1.9× the dial's size, and turns faster as the bet grows. The dial hides everything inside r≈110.

```text
[STYLE]
A circular engraved "wheel of fortune" ring, like the outer band of an antique astrolabe, seen flat and face-on.

Canvas: viewBox="0 0 400 400", centred on (200, 200). Leave everything inside r=112 completely empty: a clock dial covers it.
Layers, from the inside out:
  <g id="ticks">: 60 short ink ticks between r=118 and r=126, with every fifth one longer (out to r=132). Stroke 2.
  <g id="band">: a ring from r=136 to r=176, split into 12 equal segments by thin ink lines. Segments alternate cream and mint, with an ink outline 3 on both edges of the ring.
  <g id="glyphs">: one small symbol centred in each segment, upright relative to the centre, about 22 units tall, coral or chartreuse with an ink outline 2. Clockwise from the top: sun, crescent moon, eight-point star, open eye, ringed planet, key, hourglass, flame, cup, sword, wand, pentacle. No letters, numerals, or zodiac or Hebrew script.
  <g id="rim">: a thin gold ring at r=184 with 8 small gold ball finials (r=6, ink outline 2) spaced evenly around it.
Make it radially symmetric so it still looks right while it rotates.
```

### 4. Mountains: horizon strip → `mountains.svg`

Runs along the bottom of the scene at full width. Narrow screens crop it rather than squash it, and the ridge colours ramp with the bet.

```text
[STYLE]
A wide horizon strip of jagged tarot-style mountains, engraved like a woodcut.

Canvas: viewBox="0 0 1600 220". The bottom is flat: every shape runs down to y=220 and out to both side edges (x=0 and x=1600) with no gaps.
Composition: the strip is cropped from the centre at widths down to 380, so the centre has to work on its own.
  - A low, calm valley across the middle (x 620–980, nothing higher than y=170), where a clock dial sits.
  - Two tall, pyramid-like peaks on either side of the valley, with tops at about (430, 40) and (1170, 40), and smaller peaks stepping down towards each edge.
Layers:
  <g id="back">: the far ridge, a single blush fill with an ink outline 3.
  <g id="front">: a lower, nearer ridge in coral with an ink outline 3, overlapping the foot of the back ridge.
  <g id="hatch-back"> and <g id="hatch-front">: engraved contour lines on each ridge: stacked, jagged strata lines that follow the slopes, ink stroke 1.5, denser towards the bottom. Lines only, no fills, so the ridges can be recoloured underneath.
```

### 5. Planets → `planets.svg`

These drift across the sky from Wheel of Fortune onwards.

```text
[STYLE]
Four small celestial bodies in a tarot-print style, each in its own cell.
Canvas: viewBox="0 0 286 64". 64×64 cells with left edges at x = 0, 74, 148, 222, each body centred in its cell.
  1 id="planet-ringed": a coral planet (r=16) with a cream ring tilted at -20° and outlined in ink. The ring passes behind the planet at the top and in front of it at the bottom.
  2 id="planet-small-ringed": a blush planet (r=11) with a thin tilted ring and a tiny chartreuse moon dot.
  3 id="planet-banded": a coral planet (r=14) with two bands of ink hatching across it.
  4 id="planet-orbit": a tiny coral orb (r=6) with a short ink orbit stroke and a dot beside it, like a comet tick.
Ink outline 2.5 on everything. No stars and no background.
```

### 6. Lightning → `lightning.svg`

Flanks the dial at The Tower and above. The code mirrors it for the right side.

```text
[STYLE]
Two flash-tattoo lightning bolts. Canvas: viewBox="0 0 200 240".
  <g id="bolt-tall">, within x 0–90: one tall, jagged bolt running from the top right (85, 0) down to a point at the bottom left (5, 240), with 5 sharp zigzags. Chartreuse fill, ink outline 3, and one ink line running down its centre for an engraved look.
  <g id="bolt-short">, within x 110–200: a shorter bolt with 3 zigzags in the same style, spanning y 40–200.
Draw each bolt only once: code mirrors them for the other side of the screen.
```

### 7. Flames → `flames.svg`

Rise along the mountains from The Devil onwards, and flicker.

```text
[STYLE]
Three flash-tattoo flames for a row along the horizon. Canvas: viewBox="0 0 230 110", with 70×110 cells at x = 0, 80, 160.
Each flame (id="flame-1", "flame-2", "flame-3") has a flat base on y=110 and is centred in its cell. It has three nested layers, each its own group, so they can flicker independently:
  <g class="outer">: coral, tall, with 3–4 wavy, curling tongues and an ink outline 3.
  <g class="middle">: gold, about 65% of the outer size.
  <g class="inner">: a chartreuse core, about 35% of the outer size.
Vary the heights: flame 1 is tall (top at y≈5), flame 2 is medium (y≈30), flame 3 is short and wide (y≈50).
```

### 8. Suit glyphs: dial-face ornament → `suits.svg`

Faint glyphs drawn on the dial face at about 16px, like Casino's ♠♥♣♦.

```text
Four minor-arcana suit symbols as solid single-colour icons, to be displayed at 16px.
Canvas: viewBox="0 0 120 24", with 24×24 cells at x = 0, 32, 64, 96.
Every shape uses fill="currentColor" with no strokes or outlines. Knock details out with fill-rule="evenodd". Keep the silhouettes bold and simple, with nothing thinner than 2 units.
  id="wands": a short, straight staff on a diagonal with two small leaves budding from it.
  id="cups": a chalice with a round cup, a stem and a wide foot.
  id="swords": an upright sword, point up, with a crossguard and a round pommel.
  id="pentacles": a solid disc with a five-point star knocked out of it.
```

### 9. Tier icons → path strings for `themes.ts`

These are the small icons beside the tier name. The existing themes' icons were written by hand, and I can do the same if the generated ones come out messy.

```text
Six small line icons for a UI on a 24×24 grid, one per tarot card. They are rendered with fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round". So: strokes only, no fills, no <circle> or <rect> (draw those as path arcs), no transforms, all coordinates between 2 and 22, and at most 5 paths per icon.
Return only a JSON array of six arrays of path "d" strings, in this order:
  1 Temperance: two cups tilted towards each other, with a curved stream pouring between them.
  2 The Star: an eight-point star with long and short points.
  3 Wheel of Fortune: a wheel with a rim, a hub and eight spokes.
  4 The Devil: a round head outline with two curved horns.
  5 The Tower: a narrow tower with a crenellated top and a lightning bolt striking it.
  6 The Fool: a bundle tied to a stick, carried over the shoulder, stepping off a cliff edge.
```

---

## Optional extras

### 10. The World's wreath: jackpot → `wreath.svg`

Grows in around the dial on a jackpot.

```text
[STYLE]
A laurel wreath ring, like the one on The World tarot card, seen flat, to frame a round clock dial.
Canvas: viewBox="0 0 400 400", centred on (200, 200). Leave everything inside r=114 empty.
  <g id="leaves-left"> and <g id="leaves-right">: two laurel branches, each sweeping half a circle between r=124 and r=168. They start at the bottom and meet at the top. About 18 almond-shaped leaves each, chartreuse with an ink outline 2.5 and a centre vein.
  <g id="ribbon-top"> and <g id="ribbon-bottom">: a coral ribbon tied in a figure-eight (lemniscate) bow where the branches meet at the top and at the bottom. Ink outline 3, with hatching in the folds.
```

### 11. All-seeing eye: while the draw rolls → `eye.svg`

Opens above the dial during "Drawing your card" and blinks.

```text
[STYLE]
An all-seeing eye in a tarot or flash-tattoo style. Canvas: viewBox="0 0 160 110", with the eye centred on (80, 70).
  <g id="rays">: 9 short, straight rays fanning upwards above the eye, ink stroke 2.
  <g id="crown">: three small coral teardrop petals above the upper lid.
  <g id="eye">: an almond eye 110 wide and 46 tall, with a cream white, a teal iris (r=16), an ink pupil (r=7) and a cream catch-light.
  <g id="lid">: the upper eyelid as its own closed coral shape covering the top half of the eye, so code can lower it to blink.
Ink outline 3.
```

### 12. Card back: for a card-flip reveal → `card-back.svg`

Only needed if the result is revealed as a flipped card, which would be new code.

```text
[STYLE]
The back of a tarot card in an ornate Victorian style: symmetrical gilded filigree on a deep field.
Canvas: viewBox="0 0 140 240", with the card as a rect with corner radius 10.
  - Field: ink #17383A, with a cream border 4 units in and a thin gold rule inside it.
  - Centre: a round medallion (r=34) holding a chartreuse sun face joined with a cream crescent moon, paired like yin and yang. Ink outline 2.
  - Gold scrolling filigree and curled acanthus leaves, with small coral and mint accents, filling the rest of the card.
  - 180° rotational symmetry, so it looks the same upside down and a reversed card can't be told apart.
Groups: <g id="field">, <g id="filigree">, <g id="medallion">.
No text, numbers or letters.
```

### 13. Tattoo clouds → `clouds.svg`

Drifting clouds that match the existing `Cloud` component's grid.

```text
[STYLE]
Three flat flash-tattoo clouds with scalloped tops. Canvas: viewBox="0 0 860 160", with 280×160 cells at x = 0, 290, 580.
Each cloud (id="cloud-1", "cloud-2", "cloud-3") is one closed outline path with 4–6 round scallop bumps on top and a perfectly flat bottom at y=132, spanning roughly x 20–260 of its cell. Cream fill and an ink outline 3. Inside each, add 2–3 short, curved ink strokes for the creases between scallops, in a separate <g class="creases">.
```

### 14. Memento mori corners: The Fool tier or a late result → `bones.svg`

Friendly skulls in the bottom corners. Leave these out if they're too dark for the app.

```text
[STYLE]
A bottom-left corner vignette with a tarot memento-mori feel. Friendly, not gory. Canvas: viewBox="0 0 260 140", with a flat bottom at y=140, flush to the left edge (x=0).
  - A rounded chartreuse skull resting on the ground at the left, with large dark eye sockets (one of them crescent-shaped), an ink outline 3 and engraved hatching on the cranium.
  - A small bird skull and two crossed bones beside it, and a sprig of three chartreuse leaves.
Groups: <g id="skull">, <g id="bones">, <g id="sprig">. Code mirrors it for the bottom-right corner.
```
