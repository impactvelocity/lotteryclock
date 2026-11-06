# Good Morning theme: SVG prompts

The Good Morning (classic) theme is a sunrise over a little village. The sky warms from pre-dawn lilac to blazing gold as the bet grows, and the village below wakes up with it: bedroom lights come on, chimneys start to smoke, the windmill turns faster, and the rooster on the fence post goes from asleep to crowing. While the draw rolls, the windmill spins like a loading wheel, the rooster looks nervously left and right, and the sun mascot rolls along the progress bar. A snooze puts the village back to bed. A late result sets it off: every light on, the rooster crowing, a flock bursting out of the trees. Right on time, a rainbow comes up over the valley.

The rooster, cottages, windmill and trees are illustrations in `web/src/components/scenes/art/classic/village/`, made from these prompts. A script inlines them: run `node scripts/inline-classic-svgs.mjs` from `web/` to rebuild `sunrise-village-art.ts`, which `sunrise-village.tsx` places and animates. The script turns the palette fills into CSS variables so the village can recolour them with the sunrise. It also pulls the cottage windows out as data so they can light up one by one, and splits a dormer out of a roof so it layers correctly. Hills, fence, smoke and the rest are still drawn in code.

| Art | Replaces (in `sunrise-village.tsx`) | How the code uses it |
|---|---|---|
| Rooster, three poses | `Rooster` | Swaps pose by mood; flips him to "look", bobs him to strut, shakes him when you're late; adds the crow marks and Zzz itself |
| Cottages | `HOUSES` / `house()` | Places them behind the middle hill, recolours walls and roofs with the sunrise, lights windows one by one, puffs smoke from the chimney |
| Windmill tower and sails | the windmill `<g>` | Spins the sails about their hub at a speed set by the bet and the mood |
| Trees | `TreeShape` | Places and recolours them; four of them are where the startled flock takes off from |

To redo a piece, generate it with its prompt, keep the file name and grid, and check it against its **Must** line. Generators often add a background rect, a `<text>` or a `<style>` block, so delete those.

**No prompt needed** (drawn in code): the hills, the fence, chimney smoke, the rainbow, the startled flock (the sky's gull shape), the rooster's crow marks and Zzz, and the sun mascot (already in `art/classic/sun-*.svg`).

## The theme in brief

| Tier | Name | Village |
|---|---|---|
| 0 min | Play it safe | Asleep: dark windows, still windmill, the rooster dozing. Pre-dawn lilac light. |
| 1–11 | A little spice | The first bedroom lights; the windmill starts to turn. |
| 12–23 | Feeling lucky | More lights, chimneys smoking, the rooster up on his post. |
| 24–35 | Risky business | Most of the village up, the windmill turning briskly, green and gold light. |
| 36–44 | Pure chaos | Every light on, the windmill whirring, the rooster crowing. |
| 45 | All in | The same, in full blaze. |

| Moment | Village | Sun mascot |
|---|---|---|
| Rolling | Windmill spins like a loading wheel, rooster looks left and right | Rolls along the progress bar, sleepy-eyed |
| Snooze (win) | Lights go off one by one, windmill winds down, rooster nods off | Asleep, dozing beside the badge |
| Late (loss) | Every light on, rooster crowing in a flap, a flock bursts out of the trees | On fire, shaking |
| Right on time | A rainbow draws in over the valley, the rooster struts | Excited, bouncing |

---

## Style block (paste this before every prompt)

```text
Flat vector illustration for a sunny, cheerful "good morning" alarm-clock app.
Soft, friendly, a little storybook: simple rounded shapes, soft corners (radius 3–6),
gentle curves, crisp silhouettes. Fills only, no outlines or strokes. No gradients,
no shadows, no glow, no texture or grain, no text, no background: transparent canvas.
Use only this palette:
  wall cream #FFF6EC, roof coral #E98A7B, roof rose #B985A6, window glass #A794AF,
  lamplight #FFC24A, door plum #704C68, leaf green #80AD78, light leaf #9CBE92,
  trunk brown #9B705E, rooster orange #EE8A55, hackle #F39A5A, wing rust #D96D3E,
  tail plum #4E2C5A, tail violet #6D3F78, comb red #E5484D, beak gold #F5B53F,
  eye #2E1530, plum ink #432344, white #FFFFFF.
Clean, minimal SVG: few paths, coordinates rounded to 1 decimal, absolute commands only,
no embedded images, no <style>, no filters, no masks, no clipPath.
It will be shown small (20–140 px) on a pale lilac-to-peach sky, so shapes must read at
small sizes.
```

## Assets

### 1. Rooster, three poses

Files: `rooster-asleep.svg`, `rooster-standing.svg`, `rooster-crowing.svg`
Replaces: `Rooster` (`sunrise-village.tsx`)

```text
A plump cartoon rooster standing side-on on a fence post, facing RIGHT,
viewBox="0 0 64 64", his two feet together on the bottom edge at about x=28–38, y=64.
A round orange body (#EE8A55) with a rust wing (#D96D3E), a golden hackle of neck feathers
(#F39A5A), a big arching sickle tail of three or four long curved feathers sweeping up and
back to the left (#4E2C5A and #6D3F78), a red three-lobed comb and wattle (#E5484D), a small
gold beak and gold legs (#F5B53F), a dot eye (#2E1530). Cheerful and a little pompous.
Make three versions, same body, tail, legs and size; only the head changes:
  rooster-standing.svg  head up, beak closed, eye open, alert
  rooster-asleep.svg    head tucked down towards his chest, eye a closed curved line
  rooster-crowing.svg   head thrown back, beak wide open, chest puffed out
Group the head (comb, head, beak, wattle, eye) as id="head" and everything else as id="body".
```

Must: facing right with feet on the bottom edge (the code mirrors him to face the valley and stands him on the post); body and tail identical across the three files so swapping poses doesn't jump. No sound lines, notes or Zs: the code draws those.

### 2. Cottages (×4)

Files: `cottage-01.svg` … `cottage-04.svg`
Replaces: `HOUSES` and `house()` (`sunrise-village.tsx`)

```text
One small village house, front-on, viewBox="0 0 [W] 130" where W is 70–110.
Its walls run straight down to a flat ground line at y=130 (the bottom 20 units will be
hidden behind a hill, so keep doors and windows above y=110).
Structure, exactly:
  <path id="wall"    fill="#FFF6EC" .../>   the walls as ONE path
  <path id="roof"    fill="#E98A7B" .../>   the roof as ONE path, with eaves overhanging
  <rect id="chimney" fill="#B985A6" .../>   optional, sticking up out of the roof
  <path id="door"    fill="#704C68" .../>   the door, plus any shutters or a step
  <g id="windows" fill="#A794AF"> <rect .../> ... </g>
                                            plain rects only, rx 2, about 14×17
Two or three windows per storey, in clear rows; a door on the ground floor.
Cottage: [01: a single-storey cottage with a steep gable roof and a chimney, 90 wide]
         [02: a narrow two-storey house with a pitched roof, 70 wide]
         [03: a long low farmhouse with a chimney at one end, 110 wide]
         [04: a two-storey house with a little dormer window in the roof, 80 wide]
```

Must: the five ids above, windows as plain `rect`s (the code lights them one by one), and flat walls to y=130. The code recolours `wall`, `roof` and `chimney` with the sunrise, so exact fills don't matter. It puts the smoke at the top of the chimney rect.

### 3. Windmill: tower and sails

Files: `windmill-tower.svg`, `windmill-sails.svg`
Replaces: the windmill `<g>` (`sunrise-village.tsx`)

```text
A traditional countryside windmill, front-on, in two separate files.
windmill-tower.svg: viewBox="0 0 70 150". A tapered round tower (wider at the bottom),
  walls #FFF6EC, a rounded cap roof on top (#E98A7B), a small arched door (#704C68) at the
  bottom and one round window (#A794AF) halfway up. Flat bottom at y=150 (the bottom
  20 units will be hidden behind a hill). Mark the hub, where the sails attach just below
  the cap, with <circle id="hub" cx="35" cy="..." r="5" fill="#704C68"/>.
windmill-sails.svg: viewBox="0 0 200 200", the hub at the exact centre (100, 100).
  Four sails in an X, each a long wooden spar (#704C68) from the hub nearly to the edge,
  with a lattice blade on ONE side of the spar (a cream #FFF6EC panel crossed by 3–4 plum
  slats), all four blades on the same rotational side so it looks like it would turn.
  Plus a small hub circle in the centre.
```

Must: the sails file centred exactly on (100, 100) (the code spins it about that point); the tower's `hub` circle marks where the sails go.

### 4. Trees (×3)

Files: `tree-round.svg`, `tree-poplar.svg`, `tree-apple.svg`
Replaces: `TreeShape` (`sunrise-village.tsx`)

```text
One small storybook tree, viewBox="0 0 80 110", trunk standing on a flat ground line at
y=110, centred on x=40.
Structure:
  <path id="canopy" fill="#80AD78" .../>   the leafy crown as ONE path
  <path id="light"  fill="#9CBE92" .../>   a few soft highlight blobs on the upper left
  <path id="trunk"  fill="#9B705E" .../>
Tree: [ROUND: a fluffy round crown made of three or four overlapping bumps]
      [POPLAR: a tall slim flame-shaped crown, about 30 wide]
      [APPLE: a round crown with five or six little red (#E5484D) apples, as id="fruit"]
```

Must: trunk on y=110 at x=40, and the three ids (the code recolours `canopy`, `light` and `trunk` with the sunrise and uses the canopy top as the flock's launch point).
