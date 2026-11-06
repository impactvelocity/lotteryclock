# "Why would anyone want this?" steps: SVG prompts

The Why section shows the snooze habit as a four-panel comic strip: the alarm rings, your hand slaps snooze, LotteryClock's doubt cuts in ("Wait. Is it early?"), and you're up. Each panel has a small illustration above its caption and a sound-effect sticker ("BRRRING!", "*slap*", "…huh?", "I'm up!") drawn in code.

The art goes in `web/src/components/sections/art/why/`. It's small enough to inline by hand: replace the matching placeholder function in `web/src/components/sections/why-art.tsx` (`RingingArt`, `SnoozeArt`, `DoubtArt`, `UpArt`), keeping the `viewBox` and the function name. Generators often add a background rect, a `<text>` or a `<style>` block, so delete those before inlining.

Panels 1, 2 and 4 sit on a cream tile (`#FFF6EA`). Panel 3 sits on an orange-to-red gradient (`#FFC03D` → `#FF6B35` → `#FF2E4D`) with a faint white tile over it, so its art must read on orange.

**No prompt needed** (drawn in code): the sound-effect stickers, the arrows between panels, the shake animation on panel 1 and the wobble on panel 3's question mark.

---

## Style block (paste this before every prompt)

```text
Flat vector spot illustration for a playful alarm-clock app. Friendly, slightly cartoony,
chunky shapes, soft rounded corners, like a sticker or a comic panel. Fills only, with an
optional single outline weight of 3 px in plum #432344 where it helps shapes read.
No gradients, no shadows, no glow, no texture or grain, no text, no letters, no background:
transparent canvas.
Use only this palette:
  plum #432344, orange #FF6B35, yellow #FFC03D, red #FF2E4D, pink #D9547F,
  cream #FFF6EA, white #FFFFFF.
The recurring character is a classic twin-bell wind-up alarm clock: round plum body, cream
face, two plum bells on top, two little feet. Keep it the same clock in every panel.
Clean, minimal SVG: viewBox="0 0 160 120", few paths, coordinates rounded to 1 decimal,
absolute commands only, no embedded images, no <style>, no filters, no masks, no clipPath.
It will be shown at about 180 × 135 px, so shapes must read at that size.
```

## Assets

### 1. Alarm rings

File: `ringing.svg`
Replaces: `RingingArt` in `why-art.tsx`

```text
The alarm clock mid-ring, centred, tilted a few degrees, both bells visibly vibrating:
short orange motion strokes fanning out from each side and a couple of small yellow sparks
near the bells. The clock face shows hands at about 7:30. Wrap the clock (bells, body and
feet, not the motion strokes) in <g id="clock"> so the code can shake it on its own.
```

**Must:** clock inside `<g id="clock">`; motion strokes outside it; nothing touches the canvas edge.

### 2. Hand reaches (snooze)

File: `snooze.svg`
Replaces: `SnoozeArt` in `why-art.tsx`

```text
A sleepy hand coming down from the top edge and slapping the snooze button on top of the
alarm clock. The hand is a simple yellow mitten-like shape with a plum outline, flat palm
down, a little "boop" of three short orange impact lines where it hits. The clock sits in the
lower half, slightly squashed from the slap. Two or three small plum "z" shapes drawn as
zig-zag paths (not text) float up and to the right, getting smaller.
```

**Must:** the "z"s are paths, not `<text>`; the hand enters from the top edge.

### 3. Wait. Is it early? (the interrupt)

File: `doubt.svg`
Replaces: `DoubtArt` in `why-art.tsx`

```text
The alarm clock, front-on, with a startled face instead of hands: two big round white eyes
with plum pupils looking sideways, raised eyebrows, a small "o" mouth. To its right, a big
chunky white question mark leaning slightly, as if it just popped out. A couple of small
white sparkle stars around it. This panel sits on a bright orange background, so use white
and plum for contrast, and avoid orange and yellow as large fills.
Put the question mark in <g id="question"> so the code can wobble it.
```

**Must:** reads on orange `#FF6B35`; question mark inside `<g id="question">`.

### 4. You look, and you're up

File: `up.svg`
Replaces: `UpArt` in `why-art.tsx`

```text
A person seen from the front, sitting up in bed with both arms stretched high in a big
morning stretch, eyes open and a small smile. Simple character: plum head, orange pyjama top,
cream duvet across the lower body. Behind them a yellow half-sun rising with short yellow
rays. The alarm clock sits on a small plum bedside table to one side, quiet now, with its
face showing a time just before 7:30.
```

**Must:** the person is the focus and centred; the clock is small and to one side.
