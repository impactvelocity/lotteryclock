# Good Night theme: SVG prompts

The Good Night dial theme is a sleepless city under a moon: a skyline along the bottom whose windows light up one by one, a moon that waxes from a thin crescent to full, bats, thin clouds drifting across, and a ring of eight moon phases round the dial that light up, new moon first, until the full moon comes on at 45. While the draw rolls, a sheep jumps a fence ("Counting sheep"). The look is flat and quiet: deep plum silhouettes, warm lamplight windows, cream moonlight.

The art made from these prompts goes in `web/src/components/scenes/art/night/`. The buildings are inlined by a script: run `node scripts/inline-night-svgs.mjs` from `web/` to rebuild `night-buildings.ts` (to add a building, add its name to `NAMES` in the script and a weight to `WEIGHTS` in `night-skyline.tsx`). The rest is small enough to inline by hand:

| Art | Inlined in | How the code uses it |
|---|---|---|
| Buildings | `night-buildings.ts` (`BUILDING_ART`, generated) | `night-skyline.tsx` places, mirrors and recolours them, and stretches most of them taller |
| Bats | `night-art.tsx` (`BAT_RAISED`, `BAT_LEVEL`, `BAT_LOWERED`) | Morphs the path between the three poses to flap |
| Moon | `night-art.tsx` (`MOON_SURFACE`) and `Moon` in `night-scene.tsx` | Masks it into a crescent and warms its colour |
| Stars | `night-art.tsx` (`StarArt`) | The sparkly stars in the sky (`star-faint.svg` is spare) |
| Sheep, fence | `night-art.tsx` (`CountingSheep`, `Fence`) | The roll flourish |

To redo a piece, generate it with its prompt, keep the file name and grid, and check it against its **Must** line. Generators often add a background rect, a `<text>` or a `<style>` block, so delete those. Then re-run the script (buildings) or ask Claude to re-inline it.

## The theme in brief

| Tier | Name | What changes in the scene |
|---|---|---|
| 0 min | Lights out | A thin crescent, a few stars, the city asleep. |
| 1–11 | Restless | More stars, the odd window flicks on, the new moon on the phase ring gets its rim. |
| 12–23 | Night owl | The moon fills out, bats come out, the next two moons on the phase ring light. |
| 24–35 | Midnight gamble | Half the city's awake, the first shooting star, the half moons light. |
| 36–44 | Insomnia | Most windows lit, the gibbous moons light. |
| 45 | Full moon madness | A full moon in the sky, and the full moon on the ring lights and breathes. |

A snooze ("Back to sleep till 7:30") puts the city back to bed: lights off, the moon wanes. A late result ("Rise and shine. Now") brings the dawn up behind the skyline.

**No prompt needed** (drawn in code): the background stars and shooting stars, the moon-phase ring, the lunar corona, the window glow, the beacons' blink, the clouds (shared with Classic, recoloured), and the six tier icons.

---

## Style block (paste this before every prompt)

```text
Flat vector illustration for a night-time, "can't sleep" themed alarm-clock app.
Quiet, graphic, slightly storybook: simple geometric shapes, soft rounded corners (radius 3–5),
crisp silhouettes. Fills only, no outlines or strokes. No gradients, no shadows, no glow, no
texture or grain, no text, no background: transparent canvas.
Use only this palette:
  night ink #0C0614, far-city plum #22102F, lamplight #FFC870, warm window #FFB060,
  TV blue #A9C2FF, beacon red #FF4D5E, moon cream #FFF3DA, crater #EBD9BC, deep crater #E5CFAE,
  lavender #C9B8FF, wool #F4EEF8, plum #432344, fence plum #6B3A55, white #FFFFFF.
Clean, minimal SVG: few paths, coordinates rounded to 1 decimal, absolute commands only,
no embedded images, no <style>, no filters, no masks, no clipPath, no transforms on paths.
It will be shown small (16–180 px) on a dark indigo-to-plum night sky, so shapes must read
at small sizes.
```

## Assets

### 1. Buildings (×8, plus new ones)

Files (redo): `buildings/art-deco-tower.svg`, `thin-spire.svg`, `rooftop-water-tower.svg`, `gabled-house.svg`, `domed-building.svg`, `flat-roof-block.svg`, `apartment-block-01.svg`, `apartment-block-02.svg`
Suggested new ones: `clock-tower.svg`, `setback-skyscraper.svg`, `brownstone.svg`, `radio-mast-block.svg`
Replaces: an entry in `BUILDING_ART` (`night-buildings.ts`)

```text
One city building in silhouette, front-on, viewBox="0 0 [W] 170" where W is 60–130.
The building stands on a flat ground line at y=170 and its widest, lowest section is a plain
rectangle running straight down to y=170, with the same margin left and right (for example
x 6 to W−6). Everything above that can be as characterful as you like: setbacks, a roofline,
a spire, a water tower, a dome, an antenna.
Structure, exactly:
  <path id="silhouette" fill="#0C0614" d="..."/>   ONE path for the whole building, roof
                                                   details included (extra subpaths are fine)
  <g id="windows" fill="#FFC870"> <rect .../> ... </g>
                                                   plain rects only, rx 1.5, no other shapes
  <circle id="beacon" r="3" fill="#FF4D5E" .../>   only if it has an antenna: at the tip
Windows sit in clear horizontal rows. The rows in the bottom section must be evenly spaced
(same gap between rows, same window heights), with at least three rows in total. Leave a
few window slots empty so the rows look lived-in. A ground-floor door or shopfront is fine in
the bottom row only.
Building: [ART DECO: stepped tower with a needle spire, 100 wide]
          [THIN SPIRE: slender tower tapering to a point, 60 wide]
          [WATER TOWER: wide block with a barrel water tower on legs on the roof, 120 wide]
          [GABLED HOUSE: a small pitched-roof house with a chimney, 90 wide]
          [DOME: civic building with a shallow dome, 130 wide]
          [FLAT BLOCK: a plain low office block, 110 wide]
          [APARTMENTS 1: four-storey block with a raised central stair core, 90 wide]
          [APARTMENTS 2: wide block with a rooftop plant room, 118 wide]
          [CLOCK TOWER: square tower with a pyramid roof and a clock face cut into the
           silhouette as a round hole, with 12 tiny window rects round it for the hours, 70 wide]
          [SETBACK SKYSCRAPER: wedding-cake setbacks and a flat crown, 90 wide]
          [BROWNSTONE: a narrow terraced house with a cornice and stoop, 70 wide]
          [RADIO MAST: low block with a lattice radio mast, beacon at the top, 80 wide]
```

Must: flat bottom at y=170; plain, straight-sided walls from the second-lowest window row down to the ground, with equal left and right margins (the code cuts the building there and stacks extra storeys to make it taller); windows as plain `rect`s; at most one beacon. The code recolours the silhouette (front row `#0C0614`, back row `#22102F`), so its exact fill doesn't matter.

### 2. Bat, three wing poses

Files: `bat-raised.svg`, `bat-level.svg`, `bat-lowered.svg`
Replaces: `BAT_RAISED`, `BAT_LEVEL`, `BAT_LOWERED` (`night-art.tsx`)

```text
A small bat in flight seen from the front, viewBox="0 0 32 14", body centred at x=16,
symmetric left to right. Little pointed ears, a rounded body, and scalloped wings with three
finger points along each lower edge. ONE path, fill="#0C0614". Make three versions, same
size and position, that are three frames of one wingbeat:
  bat-raised.svg   wings swept up, tips at the top corners
  bat-level.svg    wings out level
  bat-lowered.svg  wings swept down, tips low
All three paths must use exactly the same commands in the same order (same number of
points, same letters: M, C, Q ... Z), only the coordinates change, so one can morph into
the next.
```

Must: identical command sequences across the three files (the code animates `d` between them). Image models rarely manage this. If they don't match, keep the best-looking set and ask Claude to redraw the other two poses on the same structure. No glow or rim: the bats are plain dark silhouettes.

### 3. Full moon

File: `moon-full.svg`
Replaces: `MOON_CRATERS` (`night-art.tsx`), used by `Moon` in `night-scene.tsx`

```text
A full moon, viewBox="0 0 80 80": a disc <circle cx="40" cy="40" r="30" fill="#FFF3DA"/>,
then its surface markings on top of it, all inside the disc:
  <g id="maria" fill="#000000" opacity="0.12">  3–4 large soft irregular blobs, the dark "seas"
  <g id="craters" fill="#000000" opacity="0.18"> 5–7 small round craters, some with a lighter
                                                 rim (a slightly larger circle at opacity 0.06)
Nothing outside the disc. No glow, no outline.
```

Must: the disc stays at (40, 40) r 30, and the markings are black at low opacity (the code draws them as shading, so they follow the moon's colour as it warms from lavender-white to amber).

### 4. Sky stars (bright and faint)

Files: `star-bright.svg`, `star-faint.svg`
Replaces: `StarArt` (`night-art.tsx`)

```text
A single twinkling star, viewBox="0 0 24 24", centred on (12, 12), symmetric.
  star-bright.svg: a soft round halo (two concentric circles, r 5 at opacity 0.12 and r 2.8
    at opacity 0.28), four long diffraction spikes up, down, left and right that taper to
    hairline points at the edges of the box, four shorter diagonal spikes at 45° about a third
    as long, and a small white core circle r 1.5.
  star-faint.svg: a smaller halo (r 3 at opacity 0.18), four short spikes reaching about
    7 units from the centre, and a white core r 1.4. No diagonals.
Halo and spikes fill="currentColor"; the core fill="#FFFFFF".
Spikes should be elegant and needle-thin, concave-sided, not a fat four-point sparkle.
```

Must: `currentColor` on the halo and spikes (the code tints them), white core, centred in the 24 box (the code scales it about the centre and swells it to twinkle).

### 5. Counting sheep

Files: `sheep-standing.svg`, `sheep-jumping.svg`
Replaces: `SheepBody` and the poses in `CountingSheep` (`night-art.tsx`)

```text
A round, fluffy cartoon sheep side-on, facing right, viewBox="0 0 120 90". A cloud-like
body of overlapping wool circles in #F4EEF8, an oval plum (#432344) face with a floppy ear,
two small closed sleepy eyes as short curved slits in #F4EEF8, four short rounded plum legs.
Make two versions, same body and size:
  sheep-standing.svg  standing, legs straight down to y≈82
  sheep-jumping.svg   mid-leap, front legs tucked forward, back legs kicked back, body tilted
                      up about 10°
Group the wool as id="wool", the face as id="face", the legs as id="legs".
```

Must: same wool body in both files, so the swap between poses doesn't jump; feet at the bottom of the box.

### 6. Fence

File: `fence.svg`
Replaces: `Fence` (`night-art.tsx`)

```text
A short wooden field fence the sheep jumps, viewBox="0 0 120 60": three rounded posts
(the middle one slightly taller) and two rails, all fill="currentColor". Slightly uneven,
hand-built, a little wood-grain notch or two cut into the rails. Feet flat at y=57.
```

Must: `currentColor` fill (the theme colours it), posts touching the bottom.
