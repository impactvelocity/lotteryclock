# Sound prompts (Suno)

Every theme gets its own set of sounds. The events are the same in every theme, so this doc starts with the shared sound list, then gives one section of Suno prompts per theme. Classic, the main theme, is first.

## How the sounds work today

Every sound is synthesized in [`web/src/lib/sfx.ts`](../web/src/lib/sfx.ts) with Web Audio: short oscillator blips, no audio files. That's a good fit for the tiny UI sounds and a poor fit for anything musical. The plan is to keep the UI sounds synthesized and swap the musical moments for files from Suno.

## The sound list

### Keep synthesized (no prompt)

Suno makes music, and the shortest thing it produces is several seconds long. It can't make a crisp 25 ms click. These sounds also change in code: the dial tick climbs in pitch as the bet grows, which a fixed file can't do.

| Sound | `sfx.ts` | When it plays |
|---|---|---|
| Dial tick | `tick(p)` | Each minute of bet on the dial. Pitch rises with the bet. The time picker uses it too. |
| Detent | `detent()` | The dial hits 0 or 45. |
| Click | `click()` | Buttons, the sound toggle. |
| Theme swap | `swap()` | Changing theme. |
| Latch / unlatch | `latch()`, `unlatch()` | Set alarm locks down; Change bet releases it. |
| Setting beep | `beep()` | Double beep every second while the target time blinks. |

If a theme wants its own character here, change the oscillator type and pitch in code rather than making files. For example, Ouija could use a low wooden knock for the tick.

### Make with Suno (one per theme)

| File | Moment | Length | Notes |
|---|---|---|---|
| `roll` | The draw: "Rolling the dice" | ~1.9 s | Replaces `roll()` and the thunk at the start of `land()`. The scramble runs 1,865 ms (`ROLL_MS` in `alarm-reveal.tsx`), slowing like a reel, so the sound should slow down too and end on a hit. |
| `win` | Rang early, you can snooze | 2–3 s | Happy but sleepy. This is the "go back to bed" sound. |
| `loss` | Rang late, get up | 1.5–2.5 s | A comic deflate, not a punishment. It plays first thing in the morning. |
| `jackpot` | Rang exactly on time | 3–4 s | The rare one, so the biggest of the three. |
| `alarm` | The real alarm going off (mobile app) | ≤ 30 s, loops | The most important file. iOS caps notification sounds at 30 seconds, so make it 20–30 s and loopable. It should start soft and get more insistent each time round. |
| `set` *(optional)* | "Alarm set… or is it?" | ~2 s | A sly, unresolved question. Plays once over the blinking beeps. |
| `ambient` *(optional)* | Background on the dial screen | 45–60 s loop | Low priority. Off by default if you add it: ambient loops get annoying fast. |

**One shared motif per theme.** Each theme picks a short motif and every file uses it: it rises for `win`, falls for `loss`, plays in full for `jackpot`, and repeats as the `alarm`. That's what makes the five files sound like one set instead of five random clips. Keep the key and tempo the same across a theme's prompts too.

## Using Suno

1. **Custom** mode, **Instrumental** on.
2. Paste the **Style** text into *Style of Music* and the **Structure** into the *Lyrics* box. With Instrumental on, the bracketed tags steer the arrangement and nothing is sung.
3. Put the **Exclude** text into *Exclude styles*, if your version has it.
4. Generate two or three batches and pick the best take. Suno will still return a track much longer than you asked for. That's expected: you're mining it for the best few seconds.
5. Crop in Suno's editor or in Audacity. Start on the transient with no silence before it, add a 5–10 ms fade-in and a short fade-out, and match loudness across the set so no sound jumps out. For the `alarm`, cut on a bar line so the loop is seamless.
6. Export:
   - Web: `.mp3` to `web/public/sfx/<theme>/<file>.mp3`, for example `web/public/sfx/classic/win.mp3`.
   - Mobile alarm: `.wav` or `.caf` for iOS (30 s max), `.mp3` or `.wav` for Android.

**Rights:** on Suno's free plan the output is for non-commercial use only. Generate the final files on a paid plan if the app will ship commercially.

---

## Classic

Sunrise, one minute at a time. A pastel morning sky of lavender, peach and apricot, with the arc ramping from gold through orange to red as the bet grows. The sound is a bright, hopeful morning with a game-show wink: glockenspiel, marimba, music box, warm Rhodes. Light and friendly, never brash.

- **Motif:** C–E–G, the sun coming up.
- **Key:** C major. **Tempo:** 100 BPM.

### Exclude (all Classic prompts)

```text
vocals, singing, choir, spoken word, rap, lo-fi hiss, vinyl crackle, long intro, heavy distortion, dubstep, EDM drop
```

### roll — "Rolling the dice"

**Style**
```text
instrumental sound effect stinger, 2 seconds, game show drumroll on brushed snare, rapid marimba notes that start fast and slow down like a spinning prize reel, rising tension, ends on one soft wooden thunk, bright sunrise morning mood, C major, dry close mix, nothing after the final hit
```

**Structure**
```text
[Instrumental]
[Drumroll, fast]
[Slowing down]
[Final hit]
[End]
```

### win — "Snooze until 7:30"

**Style**
```text
short instrumental victory stinger, 3 seconds, sleepy happy reward, rising three-note glockenspiel and celesta arpeggio C E G, warm Rhodes chord swell underneath, soft harp glissando drifting down like sinking into a pillow, gentle sunrise, lullaby sweetness, C major, 100 BPM, no drums, soft ring-out ending
```

**Structure**
```text
[Instrumental]
[Rising chime C E G]
[Warm chord swell]
[Harp settles down]
[End]
```

### loss — "No snooze. Up you get"

**Style**
```text
short instrumental fail stinger, 2 seconds, comic sad trombone with two descending wah-wah notes, muted brass, one cheeky woodblock knock at the end, playful and light, morning cartoon, not harsh, C minor, quick tail, no drums
```

**Structure**
```text
[Instrumental]
[Wah wah, falling]
[Woodblock knock]
[End]
```

### jackpot — "Jackpot. Right on time"

**Style**
```text
short instrumental jackpot fanfare, 4 seconds, bright brass and glockenspiel fanfare climbing C E G C, sparkling coin-shower chimes, cymbal swell, triumphant golden sunrise, game show grand prize, C major, 100 BPM, big final major chord that rings out
```

**Structure**
```text
[Instrumental]
[Fanfare C E G C]
[Coin shower sparkle]
[Big final chord]
[End]
```

### alarm — the morning alarm

**Style**
```text
instrumental alarm clock ringtone, 30 seconds, loopable, sunrise wake-up, a bright marimba and music box motif C E G repeating every bar, starts soft and each repeat gets louder and brighter, adds glockenspiel, light claps and a warm synth pad, steady 100 BPM, insistent but friendly, C major, no long intro, no fade out, no breakdown
```

**Structure**
```text
[Instrumental]
[Intro: soft marimba motif, 1 bar]
[Motif repeats, add music box]
[Motif repeats, add glockenspiel and claps]
[Motif repeats, full and bright]
[Loop]
```

### set *(optional)* — "Alarm set… or is it?"

**Style**
```text
short instrumental suspense stinger, 2 seconds, music box plays a sly four-note questioning phrase, tiptoeing pizzicato strings, a playful wink, ends on an unresolved suspended chord, morning light, C major, no drums
```

**Structure**
```text
[Instrumental]
[Sly question phrase]
[Unresolved ending]
[End]
```

### ambient *(optional)* — dial screen

**Style**
```text
instrumental ambient loop, 60 seconds, calm early sunrise, warm soft synth pad, distant gentle marimba notes from a C E G motif, light shaker, slowly brightening, unobtrusive background music, C major, 80 BPM, no drum hits, seamless loop, no ending
```

**Structure**
```text
[Instrumental]
[Ambient pad]
[Soft marimba notes]
[Loop]
```

### ElevenLabs version (what's in the repo)

Suno's MCP wouldn't connect, so the Classic set was made in ElevenLabs instead: the flow is "LotteryClock · Classic sounds". The stingers use Sound Effects v2 (prompt influence 0.6) and the alarm uses Music v2.5 (instrumental). ElevenLabs wants short, concrete descriptions, so the prompts are shorter than the Suno ones above:

| File | Prompt | Length |
|---|---|---|
| `roll` | Game show drumroll on a brushed snare with rapid ticking marimba notes that slow down like a spinning prize reel, ending on one soft wooden thunk, close-mic, dry | 2 s |
| `win` | Cheerful glockenspiel and celesta chime rising three notes C E G over a warm soft Rhodes chord, sweet lullaby reward, gentle ring-out | 2.5 s |
| `loss` | Comic sad trombone, two descending wah-wah notes, muted brass, playful and light, ending with a single woodblock knock | 2 s |
| `jackpot` | Triumphant game show jackpot fanfare, bright brass and glockenspiel climbing C E G C, sparkling coin shower chimes, cymbal swell, big final major chord ringing out | 4 s |
| `set` | Sly music box phrase of four plucked notes ending on an unresolved questioning note, tiptoeing pizzicato strings, playful and sneaky | 2 s |
| `alarm` | Bright, friendly instrumental wake-up ringtone in C major at a steady 100 BPM. A short marimba and music box motif (C, E, G) repeats every bar. It starts soft with marimba alone, then each repeat gets louder and brighter, adding glockenspiel, light hand claps and a warm synth pad, ending at full energy. Clean modern production, insistent but cheerful, no intro, no breakdown, no fade-out, so it loops cleanly. | 30 s |

Each sound got four takes. The picks in `web/public/sfx/classic/` were chosen by measurement, not by ear, so they're a first pass:

| File | Take | Why |
|---|---|---|
| `roll` | 1 | The clearest slow-down (14 hits in the first second, 5 in the second), then a clean stop. Its last hit lands at about 1.38 s, earlier than the 1.87 s draw, so delay it by ~0.5 s in code to line the thunk up with the result. |
| `win` | 3 | The only take whose pitch actually rises (G→B); the others hold one chord. It was very quiet and has been raised 19 dB. |
| `loss` | 3 | The cleanest falling slide, C down to G. |
| `jackpot` | 4 | Spells out C–E–G; take 1 drifts to F. All four takes are mostly one hit and a ring-out rather than a long fanfare. |
| `set` | 1 | Four distinct notes, as asked. |
| `alarm` | 3 | The only take that builds (−18.6 → −14.1 LUFS across the 30 s) without fading out at the end. Takes 1 and 2 fade out, take 4 stays flat. |

Processing: silence trimmed from both ends, a 60 ms fade-out, and every stinger levelled to −18.5 LUFS with peaks below −1 dB. The alarm is left at its full 30 s and levelled to −14.4 LUFS, so it's louder than the stingers on purpose.

---

## Dial instruments

Instead of a fixed tick, a theme can give the bet dial an instrument: a few recorded single notes that the code re-pitches, so dragging from 0 to 45 plays up the theme's scale. Crossing into a riskier tier (at 1, 12, 24, 36 and 45 minutes) adds a chord or strum. Recording one clean note and pitching it keeps every step in tune, which slicing up a recorded run wouldn't.

How to add one for a theme:

1. Generate single notes in ElevenLabs Sound Effects (1 s, prompt influence 0.7, 4 takes each), asking for low, middle and high registers. The model doesn't hit exact pitches, so ask for a spread and measure what you get.
2. Measure each take's pitch and keep clean single notes spread across the range. No scale note should end up more than ~6 semitones from a recording, or it starts to sound chipmunky (or sluggish, going down).
3. Generate the tier chord (1.5 s) and check its root against the scale's key.
4. Trim leading silence, peak-normalize to −3 dB, cap the length (0.7 s for marimba, 1 s for guitar), fade out, and save as `web/public/sfx/<theme>/dial-*.mp3` and `tier.mp3`.
5. Save them as `note-1.mp3`, `note-2.mp3`… (lowest first), and add their measured pitches, the scale and the tier chord progression to `THEME_SOUNDS` in `web/src/lib/sfx.ts`.

To keep it playful rather than a plain ramp:

- **The melody wanders.** Each tick moves a step or two in the direction the dial is turning, sometimes leaps or turns back, but stays within a few notes of where the bet sits. It still climbs with the bet, never repeats the note it just played, and 0 and 45 always land on the bottom and top notes.
- **Takes alternate.** Each note plays from a random recording within 5 semitones, never the same take twice in a row, at a slightly varied strength, so even a repeated pitch sounds hand-played.
- **Grace notes.** Sometimes a quick second note follows, a step or two up. The chance rises from about 1 in 8 at low bets to about 1 in 3 near 45.
- **Tier chords walk a progression** by pitch-shifting `tier.mp3`, and "All in" at 45 strums twice.

| Theme | Instrument | Scale | Recorded notes (MIDI) | Tier chords (tiers 1–5) |
|---|---|---|---|---|
| Classic | Marimba | C major pentatonic, G3–G5 (11 notes) | 9 takes: 60.1, 60.1, 60.13, 65.07, 65.16, 66.05, 67.05, 67.05, 73.04 | Marimba C major chord as C, F, G, low G, C (I–IV–V–V–I) |
| Día de Muertos | Nylon-string flamenco guitar | E Phrygian dominant, E3–E5 (15 notes) | 12 takes: 47.99, 52.2, 56.33, 56.95, 57.2, 59.18, 60.16, 66.27, 71.1, 74.05, 74.12, 77.05 | Rasgueado strum (7 strokes, F and E strongest) as A, G, F, E, E: the Andalusian cadence |

Prompts used:

- Marimba: "Single marimba note in the low / middle / high register, struck once with a soft (high: hard) mallet, warm (high: bright) wooden tone, close-mic, dry, nothing else". Even the "high" prompts came back between F4 and C#5, which is why the Classic scale tops out at G5.
- Marimba chord: "Quick upward rolled major chord on a marimba, four notes, soft mallets, warm and bright, close-mic, dry"
- Guitar: "Single plucked note on a low / middle string (high: high on the top string) of a nylon-string flamenco guitar, clean, close-mic, dry, no strum, nothing else"
- Guitar strum: "One fast flamenco guitar rasgueado strum flourish on nylon strings, bright and percussive, close-mic, dry"

The time picker keeps the plain synthesized tick.

---

## Other themes

To do, using the same file list: Night, Día de Muertos, Prize wheel, Slot machine, Poker, Ouija, Digital. Each gets its own motif, key and instruments, for example celesta and soft synth for Night, marimba, guitarrón and trumpet for Día de Muertos, organ and theremin for Ouija, and square-wave chiptune for Digital.
