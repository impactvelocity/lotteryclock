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

### Setting the alarm and the snooze (second pass)

Recorded replacements for the synthesized setting sounds, shared by every theme in `web/public/sfx/common/`, plus a new Classic snooze (`classic/win.mp3`). ElevenLabs Sound Effects v2, flow "LotteryClock · Setting & snooze".

| File | Prompt | Pick | Edit |
|---|---|---|---|
| `common/latch.mp3` (Set Alarm locking down) | Chunky plastic bedside alarm clock button pressed down firmly and clicking into place, satisfying mechanical click-clack, close-mic, dry, nothing else | Take 4: the tightest click-clack, two transients 60 ms apart | First 220 ms, peak −3 dB. A soft synthesized thump plays under it |
| `common/beep.mp3` (while the set time blinks) | Modern digital bedside alarm clock beeping twice, two short bright electronic beeps, clean pure tone, close-mic, dry, nothing else | Take 3: the cleanest steady tone (~2.8 kHz). No take was a clean double beep | One 85 ms beep cut from it, repeated after a 70 ms gap: beep-beep |
| `classic/win.mp3` (snooze) | Happy snooze reward sound: a soft rising marimba arpeggio, then a gentle descending slide whistle settling down, cozy, sleepy and playful, close-mic, dry | Take 1: rises (B D F G A C), then slides down, settled by about 1.2 s | First 1.6 s, levelled to −18.5 LUFS like the other stingers |

Also tried for the snooze: three 4 s Music v2.5 jingles. One (a single warm C major chord, decaying over 2.4 s) is a calmer alternative; the others ran 4–6 s, too long for a result sound.

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
- **Speed sets the density.** The dial's turning speed (minutes per second, smoothed) sets a minimum gap between notes (`noteGap` in `sfx.ts`). A slow turn plays every minute. From about 6 minutes a second notes thin out, and grace notes stop above 20 a second. A one-second full sweep plays about 8 notes, and a half-second flick about 5. Wherever the dial comes to rest, it still plays that note, about 150 ms later. Chords crossed within 0.3 s of each other play once, except All in.

| Theme | Instrument | Scale | Recorded notes (MIDI) | Tier chords (tiers 1–5) |
|---|---|---|---|---|
| Classic | Marimba | C major pentatonic, G3–G5 (11 notes) | 9 takes: 60.1, 60.1, 60.13, 65.07, 65.16, 66.05, 67.05, 67.05, 73.04 | Marimba C major chord as C, F, G, low G, C (I–IV–V–V–I) |
| Día de Muertos | Nylon-string flamenco guitar | E Phrygian, E3–E5 (15 notes) | 12 takes: 47.99, 52.2, 56.33, 56.95, 57.2, 59.18, 60.16, 66.27, 71.1, 74.05, 74.12, 77.05 | Rasgueado strum (7 strokes, F and E strongest) as A, G, F, E, E: the Andalusian cadence |

Prompts used:

- Marimba: "Single marimba note in the low / middle / high register, struck once with a soft (high: hard) mallet, warm (high: bright) wooden tone, close-mic, dry, nothing else". Even the "high" prompts came back between F4 and C#5, which is why the Classic scale tops out at G5.
- Marimba chord: "Quick upward rolled major chord on a marimba, four notes, soft mallets, warm and bright, close-mic, dry"
- Guitar: "Single plucked note on a low / middle string (high: high on the top string) of a nylon-string flamenco guitar, clean, close-mic, dry, no strum, nothing else"
- Guitar strum: "One fast flamenco guitar rasgueado strum flourish on nylon strings, bright and percussive, close-mic, dry"

Every other theme's dial plays a synthesized instrument (`SYNTHS` in `sfx.ts`), built from a few struck partials so there's nothing to load. Each sits in its theme's key, mostly matching the draw song, and plays through the same wandering melody, take-free:

| Theme | Instrument | Scale |
|---|---|---|
| Good Night | Music box: a tine, a soft octave and a glint, with a faint echo | C major pentatonic, C5–C7 |
| Prize wheel | Game-show vibraphone with motor tremolo | F major pentatonic, F4–F6 |
| Slot machine | Casino bell (FM, inharmonic) | C major arpeggio, C5–C7 |
| Poker | Lounge electric piano (FM, a little bark on the attack) | D blues, D3–D5 |
| Ouija | Ghostly glass: two detuned voices that swell in, waver and sag into pitch | D harmonic minor, D4–D6 |
| Tarot | Hang drum: fundamental, octave and fifth | D minor pentatonic, D3–D5 |
| Digital | Square-wave chip blip flicking down from the octave, with an 8-bit echo | E minor pentatonic, E4–E6 |
| Magic 8 Ball | Rising bubble, with a smaller one after | Whole tone, C5–C7 |
| Caffè | Mandolin (Karplus–Strong, two strings to a course), picked twice | G major, G3–G5 |

Each has a `gain` levelling it against the recorded marimba. Until Día de Muertos's recorded notes have loaded, its dial borrows Classic's marimba. The time picker keeps the plain synthesized tick.

---

## Theme songs

Each theme can have a looping background song, `web/public/sfx/<theme>/loop.mp3`, in the same key as its dial so the dial notes play in tune over it. It starts on the first interaction (browsers block sound before that), crossfades over 1.2 s when the theme changes, stops when sound is muted, and dips to 35% while the draw rolls and the result plays.

How a loop is made:

1. Generate about 75 s with ElevenLabs Music v2.5 (instrumental, 2 takes, about 1,125 credits each). Ask for one key and chord cycle, a steady tempo, and "no intro, no build-up, no breakdown, no ending".
2. Pick the take whose level stays even with no fade, and check its key against the dial scale by measuring its pitch-class profile.
3. Search every loop length for the point where the music best matches its own start, then fine-tune by waveform correlation. Good seams land on whole bars.
4. Cut [start, start + length], crossfade the 1.5 s after the end into the first 1.5 s (equal power), level to −20 LUFS, and save as MP3. The exact length goes in `THEME_SOUNDS` (`loop`): the code loops exactly that, skipping any silence the MP3 decoder adds at the start.

| Theme | Prompt (short) | Take | Loop |
|---|---|---|---|
| Classic | Gentle, sunny loop in C major, 92 BPM, C–F–G–C; marimba, kalimba, fingerpicked guitar, upright bass, brushes and shaker | 2 (even level, 94% in C major pentatonic) | 52.19 s from 4.23 s = 20 bars |
| Día de Muertos | Warm, candlelit Spanish and Mexican folk loop, 96 BPM, Am–G–F–E; nylon guitar arpeggios, requinto, guitarrón, cajón, distant muted trumpet | 1 (95% in A minor; take 2 came out in D major) | 59.99 s from 4.96 s = 24 bars, ending before the take's fade-out |

The Día de Muertos song came out in A minor rather than the E Phrygian dominant asked for, so the guitar dial now uses E Phrygian (the same notes as A minor, still with the Spanish F-to-E) instead of Phrygian dominant.

---

## Other themes

To do, using the same file list: Night, Día de Muertos, Prize wheel, Slot machine, Poker, Ouija, Digital. Each gets its own motif, key and instruments, for example celesta and soft synth for Night, marimba, guitarrón and trumpet for Día de Muertos, organ and theremin for Ouija, and square-wave chiptune for Digital.

## Shared win and lose, per-theme draw songs (ElevenLabs)

Every theme plays the same win and lose: `sunny.mp3` (rang early) and `buzz.mp3` (rang late) in `web/public/sfx/classic/`, made with ElevenLabs text-to-sound:

- `sunny.mp3`: Bright sunny morning music stinger, cheerful marimba and glockenspiel phrase rising up, ending on a warm sparkling major chord, happy and hopeful, C major, dry close mix
- `buzz.mp3`: Annoying digital alarm clock going off, harsh shrill rapid beep-beep-beep-beep, insistent and grating, close-mic, dry (levelled to -20 LUFS, since it's shrill)

The one sound a theme has of its own is its **draw song**, `web/public/sfx/<theme id>/draw.mp3`, listed in `DRAW_SONGS` in `web/src/lib/sfx.ts`. It starts when the target time starts blinking and plays through the roll, in place of `set.mp3` and `roll.mp3`. The latch click and the blinking beeps still play over it.

**Timing**, from pressing Set alarm: latch at 0 s, blink (and the draw song) at 0.38 s, roll at 1.78 s, clock lands at 3.65 s. So the song has **3.27 s** (`DRAW_HIT`) from its start to the landing. When the clock lands, the win/lose sound plays over the song and the song fades out over 1.8 s (`DRAW_FADE`). All three draw songs are full songs (`FULL_SONGS`), about a minute long. A song starts the first time the alarm is set, plays on under the win/lose sounds and through Roll again, and stops only when it ends or the alarm is reset (or the theme changes, or sound is muted). After it has ended, rolls use the shared roll sound. The roll itself is 2.8 s (`ROLL_MS`), so the result lands 4.2 s into the song.

Made with ElevenLabs Music (`eleven_music_v2_5`), one generation each, then cut with ffmpeg:

| Theme | Prompt |
|---|---|
| Good Morning (`classic`) | One-minute instrumental morning song: soft, gentle, upbeat, bright and happy. Warm marimba melody, glockenspiel sparkles, light acoustic guitar strums and a gentle shaker, 100 BPM, C major. Starts straight away with no long intro, stays soft and relaxed throughout, and ends with a gentle resolved final chord. No vocals. |
| Good Night (`night`) | Short instrumental nursery lullaby in the style of Twinkle Twinkle Little Star: celesta and music box melody, soft glockenspiel twinkles, warm gentle pads, slow 80 BPM, C major. Starts hushed and builds with a rising shimmer of twinkling notes into one soft bright chord. No vocals, no drums. |
| Día de Muertos (`muertos`) | One-minute instrumental Mexican flamenco song with a warm night-time mood: nylon-string flamenco guitar with soft rasgueado strums and melodic picking, gentle cajón and palmas, a distant muted trumpet, candlelit and mysterious but soft, 96 BPM, A minor. Starts straight away with no long intro, stays relaxed and intimate throughout, and ends on a gentle resolved chord. No vocals. |
| Prize wheel (`wheel`) | One-minute instrumental retro game-show song: playful and upbeat but soft, bouncy walking bass, light brushed swing drums, bright vibraphone and organ melody with a little brass stab now and then, 112 BPM, F major. Starts straight away with no long intro, stays friendly and relaxed throughout, and ends on a gentle resolved chord. No vocals. |
| Poker (`poker`) | One-minute instrumental smoky jazz lounge song for a late-night card table: soft brushed drums, upright bass, mellow jazz piano chords and a breathy muted trumpet melody, cool and relaxed, 92 BPM, swing feel, D minor. Starts straight away with no long intro, stays soft throughout, and ends on a gentle resolved chord. No vocals. |
| Ouija (`ouija`) | One-minute instrumental haunting séance song: a slow, detuned music box melody over a cold low drone, ghostly wordless-sounding theremin lead, distant reversed piano swells, soft creaking strings and faint whispery wind, dark and unsettling but quiet, 68 BPM, D minor. Starts straight away with no long intro, stays hushed and eerie throughout, and fades out on an unresolved dissonant chord. No vocals. |
| Tarot (`tarot`) | One-minute hippy meditative song: warm hang drum melody as the lead, soft frame drum and shaker groove, tanpura drone, gentle singing bowl and chimes, with soft wordless chanting voices humming low in the background like a circle around a campfire. Earthy, mellow and hypnotic, 84 BPM, D minor pentatonic. Starts straight away with no long intro, stays calm throughout, and ends on a gentle ringing hang drum note. No lyrics, no words. |
| Digital (`digital`) | One-minute instrumental old-school cyberpunk hacker song with late-90s digital-rain vibes: dark pulsing analog synth bassline, crisp breakbeat drums kept low, glitchy arpeggiated square-wave leads, bit-crushed bleeps and data-stream blips, cold and mysterious but steady, 110 BPM, E minor. Starts straight away with no long intro, stays moody and restrained throughout, and ends on a clean synth stab. No vocals. |

Themes without a draw song (Slot machine) play the shared `set.mp3` and `roll.mp3`. Prize wheel's song plays under its own peg clacks; when the wheel stops it adds a thunk, then plays the same win/lose sounds as every theme.
