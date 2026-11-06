# Ouija theme: SVG prompts

The Ouija dial theme looks like a candlelit spirit board: fine antique-gold engraving on a charcoal board, seen through old film (grain, dust, scratches). The type is Geist Serif's Triangle cut, where every dot is a small triangle, and the headline is distressed like worn letterpress.

The theme already works with art drawn in code. These prompts are for hand-drawn replacements (sun, moon, candles, moth, planchette, corners) and for two new pieces that aren't in the scene yet (pointing hands and nightshade sprigs).

Save the generated files in `web/src/components/scenes/art/ouija/`, next to `art/classic/`. They get inlined as React the same way `sunrise-art.tsx` inlines Classic's art. While wiring them in I'll swap the gold for `currentColor`, so the pieces can glow ember when lit. Exact ids and viewBoxes help but don't have to be perfect.

## The theme in brief

| Tier | Name | What changes in the scene |
|---|---|---|
| 0 min | The spirits rest | Every candle is out, with smoke curling off the wicks. The planchette glass waits at the top of the letter ring. |
| 1–11 | A faint whisper | The first candle catches. The glass starts spelling HUSH. |
| 12–23 | Something stirs | More candles burn and a moth finds the flames. It spells SOON. |
| 24–35 | The planchette moves | Half the candles are lit and embers drift up. It spells WAKE UP. |
| 36–44 | Possessed | A great triangle and a sunburst appear round the dial. It spells NO REST. |
| 45 | The spirits decide | Every candle burns and the board smoulders red. It spells GOODBYE. |

A snooze lights **YES** under the sun and snuffs the candles. A late result lights **NO** under the moon and makes the flames flare.

**No prompt needed** (drawn in code): the A–Z / 1–0 letter ring, the dotted ring, the sunburst and great triangle round the dial, the frame's straight rules, the stars, the YES/NO brackets, the embers, the film grain, mottling, dust, hairs, scratches and vignette, and the six tier icons.

---

## Style block (paste this before every prompt)

```text
STYLE — antique occult engraving. Single-colour line art, like gold foil stamped on a black Victorian spirit board or an 1890s esoteric bookplate: fine, even strokes; shading only through engraved hatching, cross-hatching or sparse stipple dots; ornamental and calm, slightly art nouveau. No gradients, drop shadows, blurs, filters, textures, raster images or <text>. Transparent background (the art sits on near-black #14110F).

Colour: every stroke and fill is #C9A55A (antique gold). Strokes only, unless a prompt says a part is filled.

Line weight at the viewBox sizes given: main outlines 2, inner detail 1.2, hatching and stipple 0.8; round caps and joins.
SVG hygiene: use exactly the viewBox given; put every part in a named <g id="…">; avoid transforms on paths; no clipPaths or masks; close every shape. Keep stipple under about 1,500 dots per file (prefer hatching), so files stay under ~150 KB.
Original artwork. Do not copy any existing spirit board, tarot deck or brand's artwork.
```

---

## Replacements for the code-drawn art

### 1. Sun → `sun.svg`

**viewBox `0 0 240 240`.** Sits above YES in the top-left corner (wide screens). The rays turn slowly, and it glows ember when the result is a snooze.

```text
An engraved sun seen face-on, centred at (120,120). A disc of radius about 44 holding a serene, sleeping face in fine lines: closed crescent eyelids with short lashes, a long straight nose, small closed lips. Androgynous and calm, like an alchemical sun. A ring of small dots just outside the disc. Then 48 straight rays alternating long and short, with 8 longer wavy flame rays evenly between them, reaching almost to the viewBox edge.
Groups: <g id="face"> (disc, dots and face), <g id="rays"> (every ray). The rays must be centred on (120,120) so they can spin on their own.
```

### 2. Moon → `moon.svg`

**viewBox `0 0 240 240`.** Sits above NO in the top-right corner. It glows ember on a late result.

```text
An engraved crescent moon opening to the right, about 150 tall, centred in the viewBox. Along the inner curve, a serene profile face looking right: closed eye with lashes, a long nose, closed lips. The outer edge is shaded with fine curved hatching that follows the crescent. Around it, five small four-point stars (thin, pinched points) and a few single dots.
Groups: <g id="moon"> (crescent and face), <g id="stars"> (stars and dots, so they can twinkle separately).
```

### 3. Candles → `candles.svg`

**viewBox `0 0 200 240`, floor at y = 228.** One cluster per bottom corner (mirrored for the right). Code lights the candles one by one as the bet grows, so the flames are not part of the drawing.

```text
Three church candles of different heights (about 150, 105 and 70 tall) standing on one shallow ornate tray with a scalloped rim, resting on y = 228. Melted lips at the tops, two or three wax drips down the fronts, short wicks. The candle bodies are filled solid #14110F (so they hide what's behind them) and outlined in gold. Do NOT draw flames or smoke.
Groups: <g id="tray">, <g id="candle-1">, <g id="candle-2">, <g id="candle-3"> (tallest to shortest). Mark the tip of each wick with a circle of radius 1 in <g id="wick-1">, <g id="wick-2"> and <g id="wick-3">, so the animated flames can be placed exactly.
```

### 4. Moth → `moth.svg`

**viewBox `0 0 120 100`.** One to four moths circle the candle flames from "Something stirs" up. Code flaps the wings.

```text
A death's-head hawkmoth seen from directly above, wings spread flat and symmetrical about x = 60. A small skull marking on the thorax, a banded abdomen, feathery antennae. Wing veins and patterning in fine engraved line, with a little hatching on the wing edges.
Groups: <g id="wing-left">, <g id="wing-right">, <g id="body"> (body and antennae). The wings must meet the body along x = 60, which is the flap hinge.
```

### 5. Planchette → `planchette.svg`

**viewBox `0 0 160 200`.** This replaces the round reticle that slides around the letter ring. The window sits over the letter being spelled, and the pointed tip faces the dial's centre.

```text
A planchette seen from directly above: a rounded heart or teardrop shape with its point at the top (80, 8) and the wide end at the bottom. A circular window of radius 26 centred at (80, 128); leave the inside of the window completely empty, because it must stay see-through. A double outline round the body, delicate filigree scrolls in the space between the point and the window, a small crescent moon above the window, and three small round feet near the edge.
Groups: <g id="body">, <g id="window"> (the window rings only), <g id="ornament">.
```

### 6. Frame corner → `corner.svg`

**viewBox `0 0 96 96`, top-left orientation.** Mirrored into all four corners of the hero, joining the straight rules that code draws.

```text
An ornamental corner for a spirit board's border. Two parallel rules run along the top and left edges: the outer rule on y = 0.5 / x = 0.5 and the inner rule on y = 6 / x = 6. They meet the corner through a concave quarter-circle notch (radius 26, centred on the corner) with a matching inner notch. Inside the notch, a small eight-ray sun. Along both rules, a few filigree curls that taper away by x = 96 and y = 96. Both rules must leave the viewBox exactly at its right and bottom edges, so code-drawn straight lines can continue them seamlessly.
Groups: <g id="rules">, <g id="ornament">.
```

---

## New pieces (not in the scene yet)

### 7. Pointing hand → `hand-pointing.svg`

**viewBox `0 0 320 200`.** For wide screens (1280 px and up): a pair of hands (this one mirrored for the right) reaching in from the sides toward YES and NO, or toward the letter ring.

```text
A slender left hand reaching in from the left edge, palm down, index finger extended and pointing toward the upper right, other fingers loosely curled. Long almond-shaped nails, and a thin ring on the index finger. Shaded with fine stipple and hatching, like an engraving. The wrist fades out at the left edge into sparse dots, with no hard cut-off line.
Groups: <g id="hand">, plus <g id="nails"> with the nails as filled shapes (the only fills), so they can be gilded or lit separately.
```

### 8. Nightshade sprig → `nightshade.svg`

**viewBox `0 0 300 220`, anchored at the bottom-left corner (0, 220).** For the bottom corners on wide screens, framing the candles (mirrored for the right).

```text
A botanical engraving of deadly nightshade (belladonna): one curving stem growing from the bottom-left corner (0, 220) toward the upper right, with five or six pointed oval leaves (midrib and side veins, light hatching on one half), three drooping bell-shaped flowers with fine petal lines, and two round berries with a small highlight left unhatched. Leave the area x 120–200 near the bottom fairly open, where the candles stand.
Groups: <g id="stem">, <g id="leaves">, <g id="flowers">, <g id="berries">.
```
