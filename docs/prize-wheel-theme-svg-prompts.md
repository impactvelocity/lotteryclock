# Prize wheel theme: SVG prompts

The Prize wheel dial theme is a game-show prize wheel on a violet casino floor: gold rims, marquee bulbs, candy-coloured wedges, chips and coins.

The theme already works with hand-drawn art: `web/src/components/scenes/art/wheel/` holds the chips, coin, pointer and a static `prize-wheel.svg`, and `wheel-art.tsx` inlines them. These prompts are for upgrading or adding art. Save the generated files in that same folder and they'll get inlined the same way `sunrise-art.tsx` inlines Classic's art.

## The theme in brief

| Tier | Name | What changes in the scene |
|---|---|---|
| 0 min | No spin | House lights low, two idle spotlights. Wedges dim. |
| 1–11 | Free spin | The first chips float in at the edges. |
| 12–23 | Round and round | More chips, sparkle starts. |
| 24–35 | Bonus round | A third spotlight, coins join the chips. |
| 36–44 | High stakes | Four spotlights, sparkle everywhere, bulbs blink. |
| 45 | Mega jackpot | Every wedge lit, the gold jackpot wedge too, the sunburst spinning fast. |

Results: a snooze is a payout (coins rain down). A late result is "Bankrupt" (the house lights drop and the chips leave). A jackpot runs everything at full tilt.

**No prompt needed** (drawn in code): the background gradient, spotlights, the sunburst behind the dial, the wheel's wedges, numbers, pegs and hub, the marquee bulbs, and the sparkles.

---

## Style block (paste this before every prompt)

```text
STYLE: tiny kawaii flat vector, matching a set that already has a cute sun mascot. Flat colour fills only, no outlines, no gradients, no drop shadows, blurs, filters, textures, raster images or <text>. Volume comes from one lighter "shine" band across the top of each round shape (a dome-shaped path in a lighter tint) and simple darker shade shapes. Faces, where asked: small solid dot eyes, a simple rounded mouth, soft blush ovals on the cheeks. Transparent background.

Palette (use only these):
  plum       #2A0C40  deep fills, facial features
  violet     #8E4BE6  wedges, chips
  orchid     #C957D9  wedges, accents
  pink       #F0478A  chips, cheeks
  mint       #2FD39A  chips, accents
  gold       #FFC93D  coins, rims, pointer
  gold-deep  #E3921A  coin rims, gold shading
  gold-light #FFE38A  shine on gold
  cream      #FFF4E0  chip inserts, highlights, bulbs
  blush      #F4A98B  cheeks

SVG hygiene: use exactly the viewBox given; put every part in a named <g id="…">; round caps and joins; close every shape; no clipPaths or masks unless asked.
Original artwork. Don't copy any existing game show, casino brand or slot game's art.
```

---

## Core assets

### 1. Mascot: Lucky, a coin with six faces, one per tier → `lucky-expressions.svg`

An optional host for the scene (top right, like Classic's sun). The face swaps when the tier changes.

```text
[STYLE]
A sprite sheet of six versions of one character: "Lucky", a chunky gold coin with a cute face, front-facing.

Canvas: viewBox="0 0 1130 180". Six 180×180 cells with left edges at x = 0, 190, 380, 570, 760, 950. In each cell the coin is centred on (90, 90).
Each cell is a group with its own id (lucky-no-spin, lucky-free-spin, lucky-round, lucky-bonus, lucky-high-stakes, lucky-jackpot) containing:
  <g id="coin">: a gold-deep disc r=52, a gold face disc r=45 on top, a gold-light shine dome across the top third of the face, and a thin gold-deep inner ring at r=38. Identical in every cell.
  <g id="face">: plum features and blush cheeks, centred a little below the middle.
Expressions, left to right:
  1 no-spin: asleep. Eyes closed as small downward arcs, a tiny relaxed mouth.
  2 free-spin: just woken and curious. Dot eyes, a small "o" mouth.
  3 round: happy. Dot eyes, a wide closed smile.
  4 bonus: excited. Sparkly eyes (a tiny cream four-point star in each), an open smile.
  5 high-stakes: nervous. Dot eyes looking sideways, a wobbly zigzag mouth, one cream sweat drop.
  6 jackpot: ecstatic. Eyes squeezed shut as happy upward arcs, a huge open grin with a pink tongue, three small gold four-point sparkles round the coin.
Keep the coin, shine and proportions identical in every cell. Only the face (plus the sweat drop and sparkles) changes.
```

### 2. Floating tokens → `tokens.svg`

Drift at the edges of the hero, more of them as the bet grows. These add variety alongside the chips and coin that already exist.

```text
[STYLE]
Six small casino-night tokens, each in its own cell, for floating around a web page.
Canvas: viewBox="0 0 454 64". 64×64 cells with left edges at x = 0, 78, 156, 234, 312, 390, each token centred in its cell and filling about 56 units.
  1 id="die": a cream die seen slightly from above (top face and one side face in a darker cream), five plum pips on the top face, rounded corners.
  2 id="cherries": two pink cherries on curved mint stems joined by a mint leaf, a cream shine dot on each cherry.
  3 id="horseshoe": a gold horseshoe, open end up, gold-deep nail holes, a gold-light shine along the top curve.
  4 id="clover": a mint four-leaf clover with a short stem, each leaf with a lighter shine.
  5 id="star": a chunky gold five-point star with rounded points and a gold-light shine on the upper points.
  6 id="ticket": a pink admission ticket at a slight tilt, with scalloped notches on both short ends and a row of cream dots across it (no text).
No faces on these. No background.
```

### 3. Prize wheel pointer → `pointer.svg`

Sits at 12 o'clock on the dial, over the rim, and flicks as the bet changes. The pivot has to be at the given point.

```text
[STYLE]
A prize-wheel pointer (the flapper at the top of a game-show wheel), pointing straight down.
Canvas: viewBox="0 0 40 52". The pivot is a round cap centred on (20, 17), r=13. The pointer tapers from the cap to a sharp tip at (20, 49).
  <g id="pointer">: gold body; the right half in gold-deep as a shade; a cream rivet circle r=5 on the pivot with a small gold-deep centre dot r=2.2.
Nothing may extend outside x 6–34.
```

### 4. Tier icons → path strings for `themes.ts`

These are the small icons beside the tier name. The current ones were written by hand (ticket, coin, wheel, star, chip, crown), so only use these if they come out cleaner.

```text
Six small line icons for a UI on a 24×24 grid. They are rendered with fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round". So: strokes only, no fills, no <circle> or <rect> (draw those as path arcs), no transforms, all coordinates between 2 and 22, and at most 5 paths per icon.
Return only a JSON array of six arrays of path "d" strings, in this order:
  1 No spin: an unused admission ticket with a dashed tear line.
  2 Free spin: a coin with a small four-point star in the middle.
  3 Round and round: a prize wheel (rim, four spokes) with a small pointer at the top.
  4 Bonus round: a five-point star.
  5 High stakes: a casino chip (rim, inner ring, four edge notches).
  6 Mega jackpot: a three-point crown on a base line.
```
