# Día de Muertos theme: SVG prompts

The Día de Muertos dial theme is an ofrenda by candlelight on a midnight-navy sky: papel picado strung across the top corners, candles, cempasúchil (marigolds), calaveritas and headstones along the bottom, marigold petals falling, monarch butterflies (the souls coming home) drifting across, and a giant marigold blooming behind the dial. The look comes from Mexican folk art: flat colour, scalloped petals, dot patterns, small hearts.

The art made from these prompts is in `web/src/components/scenes/art/muertos/`. It is inlined as React in `muertos-svg.tsx` (generated: attributes camelCased, ids dropped), and `muertos-art.tsx` places, colours and animates it. To redo a piece, regenerate it with its prompt, keep the same file name and grid, then run `node scripts/inline-muertos-svgs.mjs` from `web/` to rebuild `muertos-svg.tsx`. Generators often add a background rect or a `<text>`, so delete those, and check each file against its **Must** line.

## The theme in brief

| Tier | Name | What changes in the scene |
|---|---|---|
| 0 min | Rest in peace | One candle lit each side, a few flags, a quiet sky. The marigold behind the dial is a bud. |
| 1–11 | Light a candle | More candles catch. The first petals drift down. |
| 12–23 | Follow the marigolds | Petals fall steadily and the first monarch arrives. |
| 24–35 | Dance with the dead | A second string of papel picado (desktop), more monarchs. |
| 36–44 | Raise the spirits | The flags flap in the wind, most candles burn. |
| 45 | Back from the dead | Every candle blazes, a petal storm, seven monarchs, the marigold in full bloom and pulsing. |

A snooze ("Rest in peace till 7:30") puts the candles out and sends the petals and monarchs away. A late result ("Rise from the dead. Now") flares every candle.

**No prompt needed** (drawn in code): the stars and sparkles, the strings and pins, the candle glow, the dot ring and flowers on the dial, and the six tier icons.

---

## Style block (paste this before every prompt)

```text
Flat vector illustration for a Day of the Dead (Día de Muertos) themed alarm-clock app.
Mexican folk-art style: bold simple shapes, scalloped petal edges, dot patterns, small hearts,
like a sugar skull or papel picado. Fills only, no outlines, except thin interior detail lines.
No gradients, no shadows, no texture or grain, no text, no background: transparent canvas.
Use only this palette:
  navy #141A33, bone #F6EBD3, wax #F3E6CC, rosa #F0306E, orange #FF7A1F, red-orange #E8461E,
  marigold #FFC23D, gold #FFD45A, teal #2FB8A6, leaf #2E9C8A, purple #9A5BE0, sky #5BC0F0.
Clean, minimal SVG: few paths, coordinates rounded to 1 decimal, no embedded images, no
<style>, no filters, no clipPath unless asked. It will be shown small (20–120 px) on a dark
navy-to-plum night sky, so shapes must read at small sizes.
```

## Assets

### 1. Papel picado flags (×4)

Files: `papel-picado-skull.svg`, `papel-picado-flower.svg`, `papel-picado-heart.svg`, `papel-picado-star.svg`
Replaces: `PapelFlag` and the masks in `PapelPicadoDefs` (`muertos-art.tsx`). A single evenodd path per design means the masks can go.

```text
A single papel picado (cut tissue-paper) flag, viewBox="0 0 40 50", width 40 height 50.
Straight top edge (it hangs from a string), straight sides, bottom hem of 5 scallops that end
at y=46. ONE path with fill="currentColor" and fill-rule="evenodd". Every design is a hole cut
through the paper: a row of 5 tiny diamond holes under the top edge at y≈7, a row of 5 small
round holes just above the hem at y≈39.5, and a central cut-out motif centred on (20, 22)
about 18 units across.
Motif: [SKULL: a calavera cut-out with the eyes, heart nose and teeth left as paper islands]
       [FLOWER: a six-petal flower with a paper centre and dots between the petals]
       [HEART: a heart with a small paper circle inside and a diamond hole either side]
       [STAR: a six-point star with a paper centre and six small dots round it]
Keep paper bridges at least 1 unit wide so it reads as cut paper.
```

Must: one `currentColor` path (the code colours each flag), evenodd holes, nothing outside 40 × 50.

### 2. Pillar candle body

File: `candle-body.svg`
Replaces: the body, drips and top ellipses in `Candle` (`muertos-art.tsx`)

```text
A cream pillar candle with no flame, viewBox="0 0 18 60". Body fills x 0–18, top rim
ellipse centred at y=2.6 (rx 9, ry 2.6) with a shallow wax well, bottom edge rounded like
the base of a cylinder at y=60. Two or three wax drips run down from the rim on the left
and one short drip on the right, in a lighter cream (#FFF9EE) than the body (#F3E6CC).
A flat shade band down the right quarter of the body in #E4D3B4.
Group the rim as id="rim" and the drips as id="drips".
```

Must: the code stretches the body to different heights, so keep drips within the top 12 units and leave y 12–58 plain.

### 3. Candle flame

File: `candle-flame.svg`
Replaces: the flame paths in `Candle`

```text
A candle flame, viewBox="0 0 12 24", base centred at (6, 24), tip at (6, 0). Three nested
teardrops: outer red-orange #F2542D, middle orange #FF9A2E, inner gold #FFD45A, and a tiny
pale core #FFF3CF near the base. Slight folk-art wobble on the outer edge, symmetric overall.
Group everything as id="flame".
```

Must: base at the bottom centre. The flicker animation scales it from `50% 100%`.

### 4. Cempasúchil (marigold)

File: `marigold.svg`
Replaces: `Marigold` (`muertos-art.tsx`, drawn centred on 0,0 about 44 × 34)

```text
A round cempasúchil (Mexican marigold) pom-pom seen from the front, viewBox="-22 -18 44 36",
flower centred on (0, 0), radius 15. Three stacked rings of ruffled, scalloped petals:
outer red-orange #E8461E, middle orange #FF8A1F, inner #FFB53A, with a small gold #FFD45A
centre. Two teal leaves (#2E9C8A) peek out at the lower left and lower right.
```

### 5. Calaverita (sugar skull)

File: `calaverita.svg`
Replaces: `Calaverita` (`muertos-art.tsx`, centred on 0,0, 30 × 34)

```text
A small cute sugar skull (calaverita), viewBox="-15 -17 30 34", centred on (0, 0). Bone
#F6EBD3 cranium with a narrower jaw. Big round navy eye sockets ringed with scalloped flower
petals (left orange #FF7A1F, right rosa #F0306E) and a tiny bone glint in each eye. Upside-down
heart nose in navy. A stitched smile: a thin navy curve crossed by five short stitches. A
small rosa flower on the forehead, teal dots on the cheeks, marigold dots at the temples.
Friendly, not scary.
```

### 6. Headstone

File: `headstone.svg`
Replaces: `Headstone` (`muertos-art.tsx`, standing on 0,0)

```text
A simple rounded-top headstone, viewBox="-14 -44 28 44", standing on (0, 0). Navy-blue stone
#1D2752 with a carved cross in a slightly lighter #2B3768. Flat, no cracks, no text. Make a
second version with two carved lines instead of the cross.
```

### 7. Monarch butterfly

File: `monarch.svg`
Replaces: `Monarch` (`muertos-art.tsx`)

```text
A monarch butterfly seen from directly above, wings fully open, head pointing up,
viewBox="0 0 40 30", body centred on x=20. Orange wings (#FF8A1F fore, #FF9F2E hind) with
black (#1B1020) veins and thick black borders dotted with small cream (#FFF4E0) spots. Slim
black body, round head at (20, 9.6), two curled antennae. Put the left wings in
<g id="wing-left">, the right wings in <g id="wing-right">, the body and antennae in
<g id="body">. The wings must meet the body exactly at x=20.
```

Must: the flap animation scales the wings on X around `20px 15px`, so the hinge has to be at x = 20.

### 8. Marigold petal

File: `petal.svg`
Replaces: `Petal` (`muertos-art.tsx`)

```text
A single falling marigold petal, viewBox="0 0 10 14": a rounded teardrop, tip at the top,
fill="currentColor", with one faint darker midrib line. Slightly ruffled outer edge.
```

Must: `currentColor` fill. When you inline it, set the fill to the component's `color` prop (the scene tints petals marigold, orange and rosa).

### 9. Marigold bloom behind the dial

File: `marigold-bloom.svg`
Replaces: the `BLOOM` rings in `MarigoldBloom` (`muertos-scene.tsx`)

```text
A giant flat cempasúchil flower made of three concentric rings of scalloped petals,
viewBox="0 0 200 200", centred on (100, 100). Ring 1 (back): 24 rosa #F0306E petals reaching
radius 66. Ring 2: 18 orange #FF7A1F petals reaching radius 63. Ring 3 (front): 13 marigold
#FFC23D petals reaching radius 63. Everything inside radius 50 is hidden behind the clock,
so keep detail in the 52–66 band: a darker petal crease or a small dot on each petal tip.
Each ring is its own group: id="ring-outer", id="ring-mid", id="ring-inner".
```

Must: the three ring groups stay separate and centred, because the code spins them against each other.

## Calavera mascot

One face per bet tier, shown beside the tier name in place of a line icon (`CalaveraFace` in `muertos-art.tsx`, switched on by `mascot: "calavera"` in the theme).

```text
A round sugar-skull mascot in the folk-art style above, viewBox="0 0 180 180", centred.
Bone face, scalloped flower eyes, stitched smile. Make six versions, one per expression, same
outline and size so they can swap in place:
  calavera-rest.svg      eyes closed, a little "RIP" heart on the forehead, peaceful
  calavera-candle.svg    sleepy, one eye half open, a candle reflected in it
  calavera-marigold.svg  smiling, marigold flowers for eyes
  calavera-dance.svg     grinning wide, tilted, a maraca beside it
  calavera-spirits.svg   wide-eyed, small monarchs circling it
  calavera-back.svg      wild grin, flames over the head, back from the dead
```
