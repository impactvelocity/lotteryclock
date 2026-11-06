# Footer graveyard: SVG prompts

The footer is a moonlit graveyard. The Kiroween card floats in the sky, and under it a strip of hills runs edge to edge with headstones, jack-o'-lanterns, fog and a couple of sheet ghosts. In the middle is LotteryClock's own headstone, "Here lay LotteryClock, 2012 – 2026", and the Kiro ghost rising out of it.

Right now the headstones and the tree are simple shapes drawn in code. These prompts replace them with proper illustrations, so the footer looks as finished as the hero.

The art goes in `web/src/components/sections/art/graveyard/`. Everything is small enough to inline by hand into `web/src/components/sections/graveyard.tsx`:

| Art | File | Replaces in `graveyard.tsx` | How the code uses it |
|---|---|---|---|
| LotteryClock's headstone | `headstone-main.svg` | The `translate(720 292)` group (stone, plinth, carving, crack, earth) | Lays the epitaph over the blank face in code, and floats the Kiro ghost above it |
| Small headstones | `stone-round.svg`, `stone-cross.svg`, `stone-ornate.svg`, `stone-slab.svg` | `SHAPES` and `Stone` | Places 10 of them, tilts and scales each one, and darkens the back row |
| Tree | `tree.svg` | The bare-tree `<g>` on the far hill | Sets it on the far hill on the left, and blinks the owl's eyes |

To redo a piece, generate it with its prompt, keep the file name and `viewBox`, and check it against its **Must** line. Generators often add a background rect, a `<text>` or a `<style>` block, so delete those. Then ask Claude to inline it.

**No prompt needed** (drawn in code): the sky, stars, moon and bats; the hills and grass; the fog; the jack-o'-lanterns; the sheet ghosts; the iron fence; the Kiro ghost and its glow; the epitaph text.

---

## Style block (paste this before every prompt)

```text
Flat vector illustration for a spooky-but-friendly Halloween graveyard, shown at night in a
website footer. Storybook, slightly cartoony, chunky shapes with soft rounded corners, crisp
silhouettes. Fills only, no outlines or strokes. Shading is done with 2 or 3 flat tones per
object (a lit left side, a base, a shadowed right side), never with gradients.
No gradients, no shadows, no glow, no blur, no texture or grain, no text, no letters, no
numbers, no background: transparent canvas.
Use only this palette:
  stone light #8A6F96, stone #5B4266, stone shadow #3D2846, carving #2F1A35,
  moss #5C7A2E, moss dark #3F5A26, earth #3A1C30, earth dark #2A1424,
  bark #1D0D24, bark light #2C1533, eye yellow #FFD45C.
The scene behind it is dark plum (#2A1530 sky, #25112C hill, #170A1B ground), so every
shape must stay readable against that.
Clean, minimal SVG: few paths, coordinates rounded to 1 decimal, absolute commands only,
no embedded images, no <style>, no filters, no masks, no clipPath, no <text>.
The object stands on the bottom edge of the viewBox, centred left to right, with no empty
space below it.
```

## Assets

### 1. LotteryClock's headstone

File: `headstone-main.svg`
`viewBox="0 0 160 180"`, shown at about 150 × 170 px

```text
One large, old, arched headstone standing on a low stone plinth: the hero of the graveyard.
A rounded arch top, straight sides, slightly weathered: a chipped top-left corner, a few
small nicks along the edges, two patches of moss creeping up from the base on the left
and a little on the top of the arch. A jagged crack runs down from the right edge, ending
low on the right side of the face.

Leave a smooth, blank, flat area on the face for an epitaph that is added in code: from
y=45 to y=105 and from x=40 to x=120, with no cracks, moss or carving inside it.

Below that blank area, carve a small classic twin-bell alarm clock into the stone (a round
face with two hands at about 7:30, two bells on top, two little feet), in the carving
colour, about 30 px wide, centred at x=80, y=128.

In front of the plinth, a low mound of freshly dug earth, wider than the stone, with a
few clods scattered on top, as if something has just climbed out. Put the mound in
<g id="earth">, and everything else in <g id="stone">.
```

**Must:** blank face from x 40–120, y 45–105; no text or numbers; the alarm clock is carved, not raised; earth in `<g id="earth">`, the rest in `<g id="stone">`; the mound touches the bottom edge.

### 2. Small headstones (a set of four)

Generate all four in one session so they match. Each one is a separate file.
`viewBox="0 0 60 80"`, shown from about 25 × 35 px (back row) to 50 × 65 px (front row)

Shared prompt (paste it before each of the four below):

```text
A single small headstone for a cartoon graveyard, part of a matching set of four. Old and a
little weathered: one or two chipped corners, a small patch of moss at the base, a simple
carved decoration (no letters). It must read clearly as a silhouette at 25 px tall, so keep
the outline bold and the details few and large.
```

#### `stone-round.svg`

```text
The classic shape: a rounded top, straight sides, a little taller than it is wide. A small
carved cross in the upper middle, and a carved line framing the face just inside the edge.
```

#### `stone-cross.svg`

```text
A standing stone cross on a small square base. Chunky arms, slightly flared ends, one
arm tip chipped off. A ring around the crossing, like a Celtic cross, kept simple.
```

#### `stone-ornate.svg`

```text
A taller headstone with stepped shoulders and a pointed, gothic-arch top, on a two-step
base. A carved flower or a small skull in the top section, kept to a few bold shapes.
```

#### `stone-slab.svg`

```text
A plain rectangular slab broken in two: the top third has snapped off and rests leaning
against the bottom piece on the right. A clean crack line, a little rubble at the base.
```

**Must (all four):** same palette, light direction and level of wear across the set; no letters (no "RIP"); stands on the bottom edge; reads as a silhouette at 25 px tall.

### 3. The tree

File: `tree.svg`
`viewBox="0 0 240 220"`, shown at about 230 × 210 px on the far-left hill

```text
A bare, twisted, leafless graveyard tree: a short gnarled trunk that leans slightly right,
splitting into crooked branches that reach up and out, with long curling twig tips like
fingers. A wider root flare at the base gripping the ground. Mostly a silhouette in bark,
with a few flat bark-light streaks along the left side of the trunk and the bigger branches.

Sitting on the lowest branch on the right, a small round owl in silhouette (bark colour),
with two big round eyes in eye yellow. Put the two eyes in <g id="owl-eyes"> so the code
can blink them. Put a hollow knothole in the trunk, in carving colour.

Keep it open and airy: the branches shouldn't make a solid mass, and the sky should show
through between them.
```

**Must:** trunk base centred on the bottom edge; eyes in `<g id="owl-eyes">`; no leaves; branches stay inside the `viewBox`.

---

## Placement notes for inlining

- The graveyard `viewBox` is `0 0 1440 320` and uses `preserveAspectRatio="xMidYMax slice"`. On phones only about x 440–1000 shows, so the main headstone (x 720) stays in view while the tree (x 150) is cropped off. That's fine.
- The main headstone's base sits on the front ground at y 292, centred on x 720. Scale it so the stone (without the mound) is about 125 wide.
- The back-row small stones sit on the middle hill (y 236–250). The code darkens them by about 20% so they look further away, so generate them at front-row brightness.
- The tree's base sits on the far hill at about (150, 212).
