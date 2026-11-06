# Poker theme: SVG prompts

The Poker dial theme is a card table under a lamp: green felt, a polished mahogany rail in the bottom corners, chip stacks that grow with the bet, the dealer's deck, a dealer button, and your two hole cards lying face down until the draw lands. The dial itself is drawn as a giant chip.

The theme already works with art drawn in code (`web/src/components/scenes/poker-scene.tsx`). Only one piece would clearly look better hand-drawn: the **card back**. It's currently a plain red lattice made with CSS gradients. Everything else has to stay in code, for the reasons in the list below.

Save the generated file as `web/src/components/scenes/art/poker/card-back.svg`. It gets inlined as React the same way `wheel-art.tsx` inlines Prize wheel's art (see **Wiring it in** at the end). Generators often add a background rect, a `<text>` or a `<defs>` block, so delete those, and check the file against its **Must** line.

## The theme in brief

| Tier | Name | What changes in the scene |
|---|---|---|
| 0 min | Check | A quiet table: two short stacks each side, cards face down. |
| 1–11 | Small blind | The first chips go in. |
| 12–23 | Call | More stacks, chips scattered across the felt. |
| 24–35 | Raise | The stacks grow tall, the lamp warms. |
| 36–44 | Re-raise | Chips start flipping in the air, the room darkens. |
| 45 | All in | Every stack at full height, chips in the air. |

Results: a snooze ("Pot's yours") flips your cards to pocket aces and adds gold pot stacks. A late result ("Busted") knocks the stacks down to one chip and flips up 7-2 offsuit. Right on time ("Split pot") flips up a pair of kings.

**No prompt needed** (drawn in code): the felt texture, the wooden rail and the betting line have to fill any screen size; the chip stacks change height with the bet; the card faces flip over in 3D. Also drawn in code: the dealer button, the pot circle and lamp glow behind the dial, the chip-style dial, the sparkles and the six tier icons.

---

## Style block (paste this before the prompt)

```text
STYLE: the printed back of a playing card from a classic casino deck, as a flat vector. Flat colour fills only: no gradients, no drop shadows, blurs, filters, textures, raster images or <text>. Crisp, symmetric, engraved-looking linework built from filled shapes and simple strokes. Transparent background outside the card.

Palette (use only these):
  card red   #A3222C  the main field
  deep red   #7E1820  darker panels, the medallion's ground
  cream      #F8F3E8  lattice lines, frame lines, pips, the clock face
  gold       #E8C872  a few accents only (the medallion ring)
  ink        #1E1E24  the clock hands

SVG hygiene: use exactly the viewBox given; put every part in a named <g id="…">; no <defs>, <pattern>, <use>, <clipPath>, <mask> or <style>; close every shape; round coordinates to 1 decimal; keep it under about 20 paths.
Original artwork. Don't copy any existing playing-card brand's back design.
```

## Asset

### Card back → `card-back.svg`

Replaces: the `CARD_BACK` gradients (`poker-scene.tsx`), used by `CardBack` (your two hole cards) and `Deck` (the dealer's deck).

The code already draws the card itself: a cream card 56 × 80 px with rounded corners and a 3.5 px cream border. This SVG fills only the printed panel inside that border, which is 49 × 73 px on screen. The canvas below is that panel at twice the size. The cards lie tilted back on the table, so the whole design is seen small and foreshortened. Keep it bold.

```text
[STYLE]
The printed back panel of a playing card, portrait.
Canvas: viewBox="0 0 98 146". The panel fills the whole canvas edge to edge.
  <g id="field">: a card red rounded rectangle covering the whole canvas, x=0 y=0 width=98 height=146, rx=6.
  <g id="frame">: a cream frame line 2 units wide, inset 6 units from the edge, with rx=3. Small cream fleur-like corner ornaments inside its four corners, each fitting in a 10×10 box, identical but rotated for each corner. The 6-unit band outside the frame stays plain card red.
  <g id="lattice">: a fine diamond lattice inside the frame only: cream diagonal lines 2 units wide, spaced 9 units apart, in both directions. Draw them as ONE path of straight segments that end exactly at the frame line, not past it.
  <g id="medallion">: centred on (49, 73). A deep red oval panel, 52 wide and 66 tall, that hides the lattice behind it, with a gold ring 2.5 units wide round it. Inside it: a cream round clock face r=12 at the centre, with 4 deep red tick marks at 12, 3, 6 and 9 and two ink hands showing 7:30 (hour hand pointing between 7 and 8, minute hand straight down). Round the clock, four cream suit pips: a spade centred on (49, 50) and a heart on (49, 96), each about 9 units tall; a club on (31, 73) and a diamond on (67, 73), each about 7 units tall.
The field, lattice and frame must look the same when the card is turned upside down (180° point symmetry); only the medallion's contents may break that.
Nothing thinner than 2 units except the lattice joints; the whole panel is shown at only about 49×73 px.
```

Must: the field covers the whole 98 × 146 canvas with rx=6 (the code wraps it in the cream border and rounds the outer corners); no `<defs>`, ids or patterns, because three copies of the card are on screen at once and duplicate ids would clash; ink is used only for the two clock hands.

---

## Wiring it in

1. Inline the SVG as a component in a new `web/src/components/scenes/poker-art.tsx`, the way `wheel-art.tsx` does it:

   ```tsx
   export function CardBackArt() {
     return (
       <svg aria-hidden viewBox="0 0 98 146" className="block h-full w-full" preserveAspectRatio="none">
         {/* paths from art/poker/card-back.svg */}
       </svg>
     );
   }
   ```

   Keep a comment at the top saying it's inlined from `./art/poker/card-back.svg`, like the other `*-art.tsx` files.

2. In `poker-scene.tsx`, render `<CardBackArt />` inside the inner `div` of both `CardBack` and `Deck`. Then remove `CARD_BACK` from those divs' styles and delete the `CARD_BACK` constant:
   - In `Deck`, drop `style={CARD_BACK}`.
   - In `CardBack`, drop the whole `style` prop. Its inset shadow would be painted under the SVG, so it does nothing once the art is in.

3. Check the result in the browser:
   - The two hole cards (desktop only, right of the dial). They should flip to their faces cleanly on a snooze or a late result.
   - The deck (top left).
   - The rounded corners should still line up with the cream border.
