/**
 * Sound effects and music. UI sounds (clicks, beeps) are tiny synthesized blips. On top of
 * those, the recorded sounds in /sfx/classic/:
 * - stingers: the draw, the result and "Alarm set… or is it?";
 * - a dial instrument: single recorded notes, re-pitched in code so dragging the bet plays
 *   a melody up the scale;
 * - a looping background song, in the same key as the dial.
 * Every theme plays this same set, win and lose included. What a theme has of its own is a
 * draw song (DRAW_SONGS): a few seconds of music that runs from "Alarm set" through the roll,
 * in place of set.mp3 and roll.mp3; and a dial instrument in its key (THEME_SOUNDS), mostly
 * synthesized: a music box for Good Night, a mandolin for Caffè, a chip blip for Digital.
 * Anything not loaded yet falls back to the blips. Sound only starts after the first user
 * interaction, as browsers require.
 * See docs/sound-prompts.md for how the files were made.
 */

import { MAX_RANGE } from "@/lib/themes";

let ctx: AudioContext | null = null;
/** Sound effects off (the speaker button). The song has its own switch. */
let muted = false;
/** Background song on (the music button). Off for now: the button is hidden too (hero.tsx). */
let musicOn = false;

/**
 * The theme on screen. Every theme shares the win/lose sounds; Prize wheel adds its own
 * synthesized peg clacks while it spins and a thunk as it stops (`wheel` below), and Digital
 * rolls to a chiptune arpeggio and lands with a coin bling (`chip` below).
 */
let soundTheme = "";
export function setSoundTheme(id: string) {
  if (id !== soundTheme) {
    stopDraw();
    // A new instrument and scale: start its melody afresh.
    walk = -1;
    lastTake = -1;
  }
  soundTheme = id;
  loadDraw(id);
  load(id); // a recorded dial instrument of its own (Día de Muertos)
}

export function setMuted(value: boolean) {
  muted = value;
  if (value) {
    stopRoll();
    stopDraw();
  }
}

/** Start or stop the background song. Called from a click, so it can start audio too. */
export function setMusicOn(value: boolean) {
  musicOn = value;
  if (value) audio();
  syncMusic();
}

const STINGERS = ["roll", "win", "loss", "jackpot", "set"] as const;
type Stinger = (typeof STINGERS)[number];

type DialKit = {
  /**
   * Measured pitch (MIDI) of each recorded note: note-1.mp3 first. Several takes near the
   * same pitch are deliberate: they alternate, so repeated notes don't sound identical.
   */
  notes?: number[];
  /** Or, in place of recordings, a synthesized instrument (nothing to load). */
  synth?: Synth;
  /** The notes the dial plays, as MIDI, lowest first. 0 min is the bottom, 45 the top. */
  scale: number[];
  /** Loudness against the recorded marimba (1). */
  gain?: number;
};

type ThemeSounds = {
  /** Draw and result stingers. rollHit: when roll.mp3's final hit lands, in seconds. */
  stingers?: { rollHit: number };
  /** Pitched dial notes. */
  dial?: DialKit;
  /**
   * A seamlessly looping background song, loop.mp3, and its exact loop length in seconds
   * (the file was cut and crossfaded to loop at precisely this length).
   */
  loop?: number;
};

/** The file each stinger plays, in /sfx/<SOUND_SET>/. */
const STINGER_FILES: Record<Stinger, string> = {
  roll: "roll",
  set: "set",
  // Rang early: a bright, sunny marimba phrase. Rang late: an annoying digital alarm.
  win: "sunny",
  loss: "buzz",
  jackpot: "jackpot",
};

/**
 * Themes with their own draw song, /sfx/<theme>/draw.mp3: a piece that starts as the
 * target blinks ("Alarm set… or is it?") and plays on through the roll, in place of
 * set.mp3 and roll.mp3. When the clock lands (BLINK_S + the roll, in) the win/lose sound
 * plays over it and the song fades out over DRAW_FADE, so a file needs to run at least
 * that long plus DRAW_FADE to fade out rather than stop.
 */
const DRAW_SONGS = ["classic", "night", "muertos", "wheel", "poker", "ouija", "tarot", "digital"];
/**
 * Themes whose draw song is a full song (about a minute) rather than a short cut: it starts
 * the first time the alarm is set and keeps playing, under the win/lose sounds and through
 * "Roll again", until it ends or the alarm is reset. Once it has ended, rolls fall back to
 * the shared roll sound.
 */
const FULL_SONGS = ["classic", "night", "muertos", "wheel", "poker", "ouija", "tarot", "digital"];
/** Full songs sit a little under the win/lose sounds that play over them. */
const FULL_SONG_GAIN = 0.3;
const fullSong = () => FULL_SONGS.includes(soundTheme);
/**
 * Seconds the target blinks before the roll starts (the blink step, NEXT in hero.tsx). The
 * clock lands this long plus the roll (ROLL_MS) after the draw song starts.
 */
const BLINK_S = 1.4;
/** Seconds the draw song takes to fade out on Reset Alarm. */
const RESET_FADE = 0.6;
/** Seconds the draw song takes to fade out under the win/lose sound. */
const DRAW_FADE = 1.8;

/** The one sound set every theme plays, in /sfx/<SOUND_SET>/. */
const SOUND_SET = "classic";

/** Every note of a scale (semitone steps above `root`) from MIDI `from` to `to`. */
function scale(root: number, steps: number[], from: number, to: number): number[] {
  const out: number[] = [];
  for (let m = from; m <= to; m++) if (steps.includes((((m - root) % 12) + 12) % 12)) out.push(m);
  return out;
}

const MAJOR_PENTATONIC = [0, 2, 4, 7, 9];
const MINOR_PENTATONIC = [0, 3, 5, 7, 10];
const MAJOR = [0, 2, 4, 5, 7, 9, 11];
const MAJOR_TRIAD = [0, 4, 7];
const BLUES = [0, 3, 5, 6, 7, 10];
const HARMONIC_MINOR = [0, 2, 3, 5, 7, 8, 11];
const PHRYGIAN = [0, 1, 3, 5, 7, 8, 10];
const WHOLE_TONE = [0, 2, 4, 6, 8, 10];

/* ---------------- Synthesized dial instruments ---------------- */

/** One synthesized note being scheduled: everything it starts lands in `nodes`, so it can be cut short. */
type Note = {
  c: BaseAudioContext;
  out: AudioNode;
  /** Start time and pitch (Hz). */
  t0: number;
  f: number;
  /** Scales every partial: an echo is the same strike, quieter and later. */
  level: number;
  nodes: AudioScheduledSourceNode[];
  /** The node that stops last, and when (shared with the note's echoes). */
  tail: { node?: AudioScheduledSourceNode; end: number };
};

/**
 * A synthesized dial instrument: schedules one note into `n.out`, peaking around 1. Each
 * one is built from a few struck partials, so it costs nothing to load.
 */
type Synth = (n: Note) => void;

function track(n: Note, src: AudioScheduledSourceNode, start: number, stop: number) {
  src.start(start);
  src.stop(stop);
  n.nodes.push(src);
  if (stop >= n.tail.end) Object.assign(n.tail, { node: src, end: stop });
}

/**
 * One partial: an oscillator at `ratio` × the note, struck up to `peak` over `attack` and
 * dying away to silence over `decay` seconds. `glide` starts it at another ratio and slides
 * it home over `time`.
 */
function partial(
  n: Note,
  {
    ratio = 1,
    type = "sine" as OscillatorType,
    peak = 1,
    attack = 0.003,
    decay = 1,
    detune = 0,
    glide,
    into,
  }: {
    ratio?: number;
    type?: OscillatorType;
    peak?: number;
    attack?: number;
    decay?: number;
    detune?: number;
    glide?: { from: number; time: number };
    into?: AudioNode;
  } = {},
): OscillatorNode {
  const { c, t0 } = n;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.detune.value = detune;
  o.frequency.setValueAtTime(n.f * (glide?.from ?? ratio), t0);
  if (glide) o.frequency.exponentialRampToValueAtTime(n.f * ratio, t0 + glide.time);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(Math.max(peak * n.level, 0.0002), t0 + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + attack + decay);
  o.connect(g).connect(into ?? n.out);
  track(n, o, t0, t0 + attack + decay + 0.03);
  return o;
}

/** Wobble `params` (vibrato on a frequency, tremolo on a gain) by ±`depth` at `rate` Hz. */
function lfo(n: Note, rate: number, depth: number, params: AudioParam[], length: number) {
  const o = n.c.createOscillator();
  const g = n.c.createGain();
  o.frequency.value = rate;
  g.gain.value = depth;
  o.connect(g);
  for (const p of params) g.connect(p);
  track(n, o, n.t0, n.t0 + length);
}

/** FM: a sine at `ratio` × the note bending `carrier`, by `from` × the note fading to `to` over `time`. */
function modulate(n: Note, carrier: OscillatorNode, ratio: number, from: number, to: number, time: number) {
  const o = n.c.createOscillator();
  const g = n.c.createGain();
  o.frequency.value = n.f * ratio;
  g.gain.setValueAtTime(n.f * from, n.t0);
  g.gain.exponentialRampToValueAtTime(Math.max(n.f * to, 0.01), n.t0 + time);
  o.connect(g).connect(carrier.frequency);
  track(n, o, n.t0, n.t0 + time + 0.05);
}

/** The same note again `dt` seconds later at `level` of the strength: an echo. */
const later = (n: Note, dt: number, level: number): Note => ({ ...n, t0: n.t0 + dt, level: n.level * level });

/** Karplus–Strong strings, by period in samples (cached: the dial plays the same few pitches). */
const strings = new Map<number, AudioBuffer>();

/** A plucked string: a burst of noise going round a loop that softens it a little each time. */
function stringBuffer(c: BaseAudioContext, period: number): AudioBuffer {
  const key = period * 1e6 + c.sampleRate;
  const hit = strings.get(key);
  if (hit) return hit;
  const len = Math.round(c.sampleRate * 1.1);
  const buf = c.createBuffer(1, len, c.sampleRate);
  const d = buf.getChannelData(0);
  const ring = new Float32Array(period);
  for (let i = 0; i < period; i++) ring[i] = Math.random() * 2 - 1;
  let peak = 0;
  for (let i = 0, j = 0; i < len; i++, j = (j + 1) % period) {
    const v = ring[j];
    ring[j] = (v + ring[(j + 1) % period]) * 0.4985;
    d[i] = v;
    peak = Math.max(peak, Math.abs(v));
  }
  for (let i = 0; i < len; i++) d[i] /= peak;
  strings.set(key, buf);
  return buf;
}

/** One pluck of a string at the note's pitch, `detune` cents off. */
function pluck(n: Note, detune: number, gain: number) {
  const { c, t0 } = n;
  const exact = c.sampleRate / n.f;
  const period = Math.max(2, Math.round(exact));
  const src = c.createBufferSource();
  const g = c.createGain();
  src.buffer = stringBuffer(c, period);
  // The loop rounds to whole samples; the playback rate puts it back in tune.
  src.playbackRate.value = (period / exact) * 2 ** (detune / 1200);
  g.gain.value = gain * n.level;
  src.connect(g).connect(n.out);
  track(n, src, t0, t0 + 1.1);
}

const SYNTHS = {
  /** Good Night: a music box tine, a soft octave and a glint, with a faint echo across the nursery. */
  musicBox: (n: Note) => {
    const tine = (m: Note) => {
      partial(m, { decay: 1.6, peak: 0.8 });
      partial(m, { ratio: 2, peak: 0.22, decay: 0.6 });
      partial(m, { ratio: 4.2, peak: 0.12, decay: 0.08 });
    };
    tine(n);
    tine(later(n, 0.24, 0.22));
  },
  /** Prize wheel: a game-show vibraphone, its motor's tremolo spinning under the bar. */
  vibes: (n: Note) => {
    const trem = n.c.createGain();
    trem.connect(n.out);
    lfo(n, 5.6, 0.3, [trem.gain], 2);
    partial(n, { decay: 1.8, peak: 0.75, into: trem });
    partial(n, { ratio: 4, peak: 0.2, decay: 0.3, into: trem });
    partial(n, { ratio: 10, peak: 0.05, decay: 0.04 });
  },
  /** Slot machine: a bright casino bell, ding. */
  bell: (n: Note) => {
    const body = partial(n, { decay: 1.3, peak: 0.6 });
    modulate(n, body, 3.5, 2.2, 0.05, 0.5);
    partial(n, { ratio: 2, peak: 0.25, decay: 0.45 });
    partial(n, { ratio: 5.4, peak: 0.08, decay: 0.12 });
  },
  /** Poker: a mellow electric piano with a little bark on the attack, for the lounge. */
  epiano: (n: Note) => {
    const tine = partial(n, { decay: 1.4, peak: 0.75 });
    modulate(n, tine, 1, 1.3, 0.05, 0.45);
    partial(n, { ratio: 2, peak: 0.12, decay: 0.5 });
    partial(n, { ratio: 7, peak: 0.04, decay: 0.05 });
  },
  /** Ouija: a ghostly glass tone that swells in, wavers and sags into pitch, two voices out of tune. */
  ghost: (n: Note) => {
    const a = partial(n, { attack: 0.06, decay: 1.5, peak: 0.55, glide: { from: 1.035, time: 0.22 } });
    const b = partial(n, { attack: 0.08, decay: 1.4, peak: 0.4, detune: 16, glide: { from: 1.035, time: 0.3 } });
    partial(n, { ratio: 0.5, type: "triangle", attack: 0.05, decay: 0.9, peak: 0.12 });
    lfo(n, 5.2, n.f * 0.009, [a.frequency, b.frequency], 1.6);
  },
  /** Tarot: a hang drum, warm and round, with its octave and fifth ringing above. */
  hang: (n: Note) => {
    partial(n, { attack: 0.006, decay: 1.9, peak: 0.75 });
    partial(n, { ratio: 2, peak: 0.28, decay: 1.1 });
    partial(n, { ratio: 2.98, peak: 0.12, decay: 0.55 });
    partial(n, { ratio: 0.5, peak: 0.18, decay: 0.07, glide: { from: 0.75, time: 0.05 } });
  },
  /** Digital: a square-wave chip blip, flicking down from the octave, with an 8-bit echo. */
  chip: (n: Note) => {
    const blipAt = (m: Note) => {
      const o = partial(m, { type: "square", decay: 0.2, peak: 0.3 });
      o.frequency.setValueAtTime(m.f * 2, m.t0);
      o.frequency.setValueAtTime(m.f, m.t0 + 0.025);
    };
    blipAt(n);
    blipAt(later(n, 0.11, 0.35));
  },
  /** Magic 8 Ball: a bubble rising through the blue liquid, bloop, and a little one after it. */
  bubble: (n: Note) => {
    partial(n, { decay: 0.4, peak: 0.85, glide: { from: 0.55, time: 0.06 } });
    partial(n, { ratio: 2, peak: 0.12, decay: 0.15, glide: { from: 1.2, time: 0.06 } });
    partial({ ...later(n, 0.08, 0.3), f: n.f * 2 }, { decay: 0.16, glide: { from: 0.6, time: 0.04 } });
  },
  /** Caffè: a mandolin, two strings to a course, picked twice the way it trembles in a café band. */
  mandolin: (n: Note) => {
    pluck(n, -5, 0.5);
    pluck(n, 5, 0.5);
    const again = later(n, 0.075, 0.45);
    pluck(again, -5, 0.5);
    pluck(again, 5, 0.5);
  },
} satisfies Record<string, Synth>;

/**
 * Every theme's bet dial has an instrument in its key, so turning it fits the theme: the
 * Classic marimba and Día de Muertos guitar are recorded, the rest synthesized.
 */
const THEME_SOUNDS: Record<string, ThemeSounds> = {
  classic: {
    stingers: { rollHit: 1.38 },
    dial: {
      // Marimba. C major pentatonic, G3 to G5 (11 notes): the recordings sit between C4
      // and C#5, so no note is shifted more than about 6 semitones.
      notes: [60.1, 60.1, 60.13, 65.07, 65.16, 66.05, 67.05, 67.05, 73.04],
      scale: scale(0, MAJOR_PENTATONIC, 55, 79),
    },
    // Marimba, kalimba and guitar in C major, 92 BPM: 20 bars.
    loop: 52.189,
  },
  // Lullaby music box, C major pentatonic, C5 to C7, like its draw song.
  night: { dial: { synth: SYNTHS.musicBox, scale: scale(0, MAJOR_PENTATONIC, 72, 96), gain: 0.85 } },
  muertos: {
    dial: {
      // Nylon-string flamenco guitar. E Phrygian, E3 to E5 (15 notes): the same notes as the
      // A minor draw song, with the Spanish F-to-E.
      notes: [47.99, 52.2, 56.33, 56.95, 57.2, 59.18, 60.16, 66.27, 71.1, 74.05, 74.12, 77.05],
      scale: scale(4, PHRYGIAN, 52, 76),
    },
  },
  // Game-show vibraphone, F major pentatonic, F4 to F6, like its draw song.
  wheel: { dial: { synth: SYNTHS.vibes, scale: scale(5, MAJOR_PENTATONIC, 65, 89), gain: 0.9 } },
  // Casino bell, up a C major chord, C5 to C7.
  slot: { dial: { synth: SYNTHS.bell, scale: scale(0, MAJOR_TRIAD, 72, 96), gain: 1.2 } },
  // Lounge electric piano, D blues, D3 to D5, over the D minor draw song.
  poker: { dial: { synth: SYNTHS.epiano, scale: scale(2, BLUES, 50, 74), gain: 1 } },
  // Ghostly glass, D harmonic minor, D4 to D6.
  ouija: { dial: { synth: SYNTHS.ghost, scale: scale(2, HARMONIC_MINOR, 62, 86), gain: 1.5 } },
  // Hang drum, D minor pentatonic, D3 to D5, like its draw song.
  tarot: { dial: { synth: SYNTHS.hang, scale: scale(2, MINOR_PENTATONIC, 50, 74), gain: 0.85 } },
  // Chiptune square wave, E minor pentatonic, E4 to E6, over the E minor draw song.
  digital: { dial: { synth: SYNTHS.chip, scale: scale(4, MINOR_PENTATONIC, 64, 88), gain: 1.6 } },
  // Bubbles, whole-tone (dreamy, undecided), C5 to C7.
  eightball: { dial: { synth: SYNTHS.bubble, scale: scale(0, WHOLE_TONE, 72, 96), gain: 1.5 } },
  // Mandolin, G major, G3 to G5.
  cafe: { dial: { synth: SYNTHS.mandolin, scale: scale(7, MAJOR, 55, 79), gain: 1.2 } },
};

/**
 * The stingers are levelled to -18 LUFS; this brings them down to sit with the synthesized
 * blips instead of jumping out over them.
 */
const SAMPLE_GAIN = 0.4;
/** Dial notes are peak-normalized and play often, so they sit lower still. */
const DIAL_GAIN = 0.25;
/**
 * Seconds to leave between dial notes, by how fast the dial is turning (minutes per
 * second). Turned slowly, every minute plays; faster, notes are skipped so a quick sweep
 * stays musical: from about 6 minutes a second notes start thinning out, and a full
 * 0→45 sweep in one second plays about 7 notes rather than 45.
 */
function noteGap(speed: number) {
  return clamp(0.025 + (speed - 6) * 0.0035, 0.025, 0.14);
}
/** Above this speed (minutes per second), no grace notes: the run is busy enough. */
const GRACE_MAX_SPEED = 20;
/** Background songs are levelled to -20 LUFS; this sits them well under everything else. */
const MUSIC_GAIN = 0.25;
/** Seconds to fade a song in or out (starting, muting, changing theme). */
const MUSIC_FADE = 1.2;
/** How far the song dips while the draw rolls and the result plays. */
const MUSIC_DUCK = 0.35;

let theme = "";
/** Decoded files, per theme. A missing entry means still loading or failed: use the blips. */
const buffers: Record<string, Record<string, AudioBuffer>> = {};

/** Bedside-clock sounds every theme shares, in /sfx/common/. */
const COMMON = "common";
const COMMON_FILES = ["latch", "beep"];
/** The shared clock sounds sit under the stingers. */
const LATCH_GAIN = 0.45;
const BEEP_GAIN = 0.15;

function filesFor(id: string): string[] {
  if (id === COMMON) return COMMON_FILES;
  const s = THEME_SOUNDS[id];
  if (!s) return [];
  return [
    ...(s.stingers ? STINGERS.map((n) => STINGER_FILES[n]) : []),
    ...(s.dial?.notes ?? []).map((_, i) => noteFile(i)),
  ];
}

/** Themes whose song has been requested (songs are large, so only fetched once music is on). */
const songsRequested = new Set<string>();

function loadSong(id: string) {
  if (songsRequested.has(id) || !THEME_SOUNDS[id]?.loop || typeof window === "undefined") return;
  songsRequested.add(id);
  const bank = (buffers[id] ??= {});
  fetch(`/sfx/${id}/loop.mp3`)
    .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(r.status)))
    .then((data) => new OfflineAudioContext(2, 1, 44100).decodeAudioData(data))
    .then((buf) => {
      bank.loop = buf;
      syncMusic();
    })
    .catch(() => songsRequested.delete(id));
}

/** Start loading a theme's files, once. */
const themesRequested = new Set<string>();

function load(id: string) {
  const files = filesFor(id);
  if (!files.length || themesRequested.has(id) || typeof window === "undefined") return;
  themesRequested.add(id);
  const bank = (buffers[id] ??= {});
  // Decode offline, so files are ready before the first tap creates the real context.
  // AudioBuffers aren't tied to the context that decoded them.
  const decoder = new OfflineAudioContext(2, 1, 44100);
  for (const name of files) {
    fetch(`/sfx/${id}/${name}.mp3`)
      .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(r.status)))
      .then((data) => decoder.decodeAudioData(data))
      .then((buf) => (bank[name] = buf))
      .catch(() => {});
  }
}

/** Decoded draw songs, by theme. */
const drawSongs: Record<string, AudioBuffer> = {};
const drawsRequested = new Set<string>();

/** Start loading a theme's draw song, if it has one, once. */
function loadDraw(id: string) {
  if (!DRAW_SONGS.includes(id) || drawsRequested.has(id) || typeof window === "undefined") return;
  drawsRequested.add(id);
  fetch(`/sfx/${id}/draw.mp3`)
    .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(r.status)))
    .then((data) => new OfflineAudioContext(2, 1, 44100).decodeAudioData(data))
    .then((buf) => (drawSongs[id] = buf))
    .catch(() => drawsRequested.delete(id));
}

/** Start loading the sounds (the same for every theme). Safe to call more than once. */
export function loadSounds() {
  theme = SOUND_SET;
  load(COMMON);
  load(SOUND_SET);
  syncMusic();
}

/** The song playing now, and which theme it belongs to. */
let music: { theme: string; src: AudioBufferSourceNode; amp: GainNode } | null = null;

/**
 * Start, change or stop the background song to match the theme and the music button,
 * fading between them. Nothing plays until the first interaction has created the context.
 */
function syncMusic() {
  const c = ctx;
  if (!c) return;
  const length = THEME_SOUNDS[theme]?.loop;
  if (musicOn && length) loadSong(theme);
  const want = !musicOn || !length ? undefined : buffers[theme]?.loop;
  if (music && music.theme === theme && want) return;
  const now = c.currentTime;
  if (music) {
    const { src, amp } = music;
    amp.gain.cancelScheduledValues(now);
    amp.gain.setValueAtTime(amp.gain.value, now);
    amp.gain.linearRampToValueAtTime(0, now + MUSIC_FADE);
    src.stop(now + MUSIC_FADE + 0.05);
    music = null;
  }
  if (!want || !length) return;
  const src = c.createBufferSource();
  const amp = c.createGain();
  src.buffer = want;
  // Loop exactly the cut length, skipping any silence the MP3 decoder added up front.
  const lead = leadIn(want, length);
  src.loop = true;
  src.loopStart = lead;
  src.loopEnd = lead + length;
  amp.gain.setValueAtTime(0, now);
  amp.gain.linearRampToValueAtTime(MUSIC_GAIN, now + MUSIC_FADE);
  src.connect(amp).connect(c.destination);
  src.start(now, lead);
  music = { theme, src, amp };
}

/**
 * Seconds of padding at the start of a decoded song. MP3 encoders add a little silence,
 * and browsers differ on whether they strip it: if the buffer is longer than the cut
 * length, skip to the first audible sample.
 */
function leadIn(buf: AudioBuffer, length: number): number {
  if (buf.length - Math.round(length * buf.sampleRate) < 8) return 0;
  const data = buf.getChannelData(0);
  const limit = Math.min(data.length, Math.round(buf.sampleRate * 0.2));
  for (let i = 0; i < limit; i++) if (Math.abs(data[i]) > 1e-4) return i / buf.sampleRate;
  return 0;
}

/** Dip the song to `level` (of its normal volume) over `time` seconds. */
function duckMusic(level: number, time: number) {
  if (!music || !ctx) return;
  const g = music.amp.gain;
  const now = ctx.currentTime;
  g.cancelScheduledValues(now);
  g.setValueAtTime(g.value, now);
  g.linearRampToValueAtTime(MUSIC_GAIN * level, now + time);
}

function stinger(name: Stinger): AudioBuffer | undefined {
  return buffers[theme]?.[STINGER_FILES[name]];
}

type Voice = { src: AudioBufferSourceNode; amp: GainNode };

/**
 * Play a decoded file `delay` seconds from now, at `rate` (2 is an octave up). Returns the
 * voice so it can be stopped.
 */
function play(buf: AudioBuffer, { delay = 0, rate = 1, gain = SAMPLE_GAIN, offset = 0 } = {}): Voice | null {
  if (muted) return null;
  const c = audio();
  if (!c) return null;
  const src = c.createBufferSource();
  const amp = c.createGain();
  src.buffer = buf;
  src.playbackRate.value = rate;
  amp.gain.value = gain;
  src.connect(amp).connect(c.destination);
  src.start(c.currentTime + delay, offset);
  return { src, amp };
}

function noteFile(i: number) {
  return `note-${i + 1}`;
}

const pick = <T,>(xs: readonly T[]): T => xs[Math.floor(Math.random() * xs.length)];
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/** A dial note, recorded or synthesized: its level, and how to cut it off. */
type DialVoice = { amp: GainNode; stop: (at: number) => void };

/** The dial note still ringing; the next one fades it out so a drag stays clean. */
let dialVoice: DialVoice | null = null;
let lastDialAt = -1;
/** Index into the scale of the last dial note: the melody walks on from here. */
let walk = -1;
/** The recording used last, so the next note prefers a different take. */
let lastTake = -1;

/**
 * The next scale index for the dial. Rather than one fixed note per minute, the melody
 * wanders: mostly a step or two in the direction the dial is moving, sometimes a leap or
 * a turn back, but always kept within a few notes of where the bet sits. So it still
 * climbs as the bet grows, and the ends always land on the bottom and top notes.
 */
function nextStep(kit: DialKit, range: number, prev: number): number {
  const top = kit.scale.length - 1;
  if (range === 0) return (walk = 0);
  if (range === MAX_RANGE) return (walk = top);
  const centre = (range / MAX_RANGE) * top;
  const up = range >= prev;
  if (walk < 0 || Math.abs(walk - centre) > 4) walk = Math.round(centre);
  let next = walk + pick(up ? [1, 1, 2, 2, 3, -1, -2] : [-1, -1, -2, -2, -3, 1, 2]);
  if (next > centre + 2.5) next = walk - 1;
  else if (next < centre - 2.5) next = walk + 1;
  // Bounce off either end rather than repeating the end note.
  if (next > top) next = top - 1 - (next - top - 1);
  if (next < 0) next = -next;
  next = clamp(next, 0, top);
  if (next === walk) next = walk === top ? top - 1 : walk === 0 ? 1 : walk + (up ? 1 : -1);
  return (walk = next);
}

/** Play MIDI note `midi` on a synthesized instrument, `delay` seconds from now. */
function synthNote(c: AudioContext, synth: Synth, midi: number, delay: number, gain: number): DialVoice {
  const out = c.createGain();
  out.gain.value = gain;
  out.connect(c.destination);
  const note: Note = {
    c,
    out,
    t0: c.currentTime + delay,
    f: 440 * 2 ** ((midi - 69) / 12),
    level: 1,
    nodes: [],
    tail: { end: 0 },
  };
  synth(note);
  if (note.tail.node) note.tail.node.onended = () => out.disconnect();
  return {
    amp: out,
    stop: (at) =>
      note.nodes.forEach((s) => {
        try {
          s.stop(at);
        } catch {}
      }),
  };
}

/**
 * Play MIDI note `target` at a slightly varied strength (`gain` of the dial's level): on the
 * theme's synthesized instrument, or from a recording within 5 semitones (a different take
 * from last time where there's a choice), re-pitched.
 */
function playNote({ kit, bank }: Dial, target: number, { delay = 0, gain = 1, steal = true } = {}) {
  const c = audio();
  if (!c || muted) return;
  const level = DIAL_GAIN * (kit.gain ?? 1) * gain * (0.75 + Math.random() * 0.4);
  let voice: DialVoice | null;
  if (kit.synth) {
    voice = synthNote(c, kit.synth, target, delay, level);
  } else {
    const notes = kit.notes ?? [];
    const near = notes.map((_, i) => i).filter((i) => Math.abs(notes[i] - target) <= 5);
    let take = near.length ? pick(near.length > 1 ? near.filter((i) => i !== lastTake) : near) : -1;
    if (take < 0) take = notes.reduce((b, m, i) => (Math.abs(m - target) < Math.abs(notes[b] - target) ? i : b), 0);
    const buf = bank[noteFile(take)];
    if (!buf) return;
    const v = play(buf, { delay, rate: 2 ** ((target - notes[take]) / 12), gain: level });
    voice = v && { amp: v.amp, stop: (at) => v.src.stop(at) };
    lastTake = take;
  }
  if (steal && dialVoice) {
    dialVoice.amp.gain.setTargetAtTime(0, c.currentTime, 0.015);
    dialVoice.stop(c.currentTime + 0.1);
  }
  if (steal) dialVoice = voice;
}

/** How fast the dial is turning, in minutes per second, smoothed over recent moves. */
let dialSpeed = 0;
let lastMoveAt = -Infinity;
/** A skipped note waiting to play if the dial comes to rest on it. */
let pendingNote: ReturnType<typeof setTimeout> | undefined;

/** Play the dial's next melody note for `range`, with the odd grace note when `grace`. */
function dialNote(dial: Dial, range: number, prev: number, grace: boolean) {
  const c = audio();
  if (!c) return;
  const { kit } = dial;
  lastDialAt = c.currentTime;
  const i = nextStep(kit, range, prev);
  playNote(dial, kit.scale[i]);
  const p = range / MAX_RANGE;
  if (grace && range > 0 && range < MAX_RANGE && Math.random() < 0.12 + 0.25 * p) {
    // A grace note just after: the next note up or a skip of two (down, at the very top).
    const step = pick([1, 1, 2]);
    const g = i + step < kit.scale.length ? i + step : i - step;
    playNote(dial, kit.scale[g], { delay: 0.06 + Math.random() * 0.03, gain: 0.7, steal: false });
  }
}

/** A dial instrument and the decoded files it plays from. */
type Dial = { kit: DialKit; bank: Record<string, AudioBuffer> };

/**
 * The theme's own dial instrument: synthesized ones are always ready, recorded ones once all
 * their notes have loaded. Until then, Classic's marimba.
 */
function currentDial(): Dial | null {
  for (const id of [soundTheme, SOUND_SET]) {
    const kit = THEME_SOUNDS[id]?.dial;
    if (!kit) continue;
    if (kit.synth) return { kit, bank: {} };
    const bank = buffers[id];
    if (bank && kit.notes?.every((_, i) => bank[noteFile(i)])) return { kit, bank };
  }
  return null;
}

/** The draw's recorded roll, if one is playing or scheduled. */
let rollSource: AudioBufferSourceNode | null = null;
/** Context time the recorded roll starts at; the synthesized ticks hand over to it then. */
let rollFrom = Infinity;

/** A draw is under way (between startRoll and land), with the song ducked. */
let rolling = false;

/** The theme's draw song, while it plays (from the blink until the clock lands). */
let draw: Voice | null = null;

/**
 * Fade out the draw song, if one is playing, over `fade` seconds: quickly when the bet or
 * theme changes, slowly under the win/lose sound.
 */
function stopDraw(fade = 0.12) {
  if (!draw || !ctx) return (draw = null);
  const { src, amp } = draw;
  const now = ctx.currentTime;
  amp.gain.cancelScheduledValues(now);
  amp.gain.setValueAtTime(amp.gain.value, now);
  amp.gain.linearRampToValueAtTime(0, now + fade);
  try {
    src.stop(now + fade + 0.05);
  } catch {}
  draw = null;
}

/** Stop the recorded roll and the synthesized ticks' hand-over. */
function clearRoll() {
  try {
    rollSource?.stop();
  } catch {}
  rollSource = null;
  rollFrom = Infinity;
}

/** The draw was abandoned (Change bet mid-roll, muting): stop its sounds. */
function stopRoll() {
  // Bring the background song back up.
  if (rolling) duckMusic(1, 0.8);
  rolling = false;
  clearRoll();
  // A full song carries on (only Reset alarm, the theme or muting stops it).
  if (!fullSong()) stopDraw();
}

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    // The first interaction: the song can start now.
    queueMicrotask(syncMusic);
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

type Blip = {
  freq: number;
  endFreq?: number;
  dur: number;
  type?: OscillatorType;
  gain?: number;
  delay?: number;
};

function blip({ freq, endFreq, dur, type = "sine", gain = 0.06, delay = 0 }: Blip) {
  if (muted) return;
  const c = audio();
  if (!c) return;
  const t0 = c.currentTime + delay;
  const osc = c.createOscillator();
  const amp = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (endFreq) osc.frequency.exponentialRampToValueAtTime(endFreq, t0 + dur);
  amp.gain.setValueAtTime(0.0001, t0);
  amp.gain.exponentialRampToValueAtTime(gain, t0 + 0.004);
  amp.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(amp).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

/* ---------------- Prize wheel: synthesized peg clacks and stop ---------------- */

let noiseBuf: AudioBuffer | null = null;

/** A short burst of band-passed noise: the body of a click or clack. */
function burst({ delay = 0, dur = 0.035, freq = 2600, q = 5, gain = 0.2 }) {
  if (muted) return;
  const c = audio();
  if (!c) return;
  if (!noiseBuf) {
    noiseBuf = c.createBuffer(1, Math.round(c.sampleRate * 0.4), c.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const t0 = c.currentTime + delay;
  const src = c.createBufferSource();
  const band = c.createBiquadFilter();
  const amp = c.createGain();
  src.buffer = noiseBuf;
  band.type = "bandpass";
  band.frequency.value = freq;
  band.Q.value = q;
  amp.gain.setValueAtTime(gain, t0);
  amp.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(band).connect(amp).connect(c.destination);
  src.start(t0, Math.random() * 0.3);
  src.stop(t0 + dur + 0.02);
}

const wheel = {
  /** The flapper clacking off a peg (the little wheel calls this as each peg passes). */
  peg: () => {
    burst({ dur: 0.03, freq: 2300 + Math.random() * 600, q: 4, gain: 0.22 });
    blip({ freq: 1150, endFreq: 520, dur: 0.025, type: "triangle", gain: 0.035 });
  },
  /** The wheel thunking to a stop; the shared win/lose sound follows. */
  stop: () => {
    burst({ dur: 0.08, freq: 900, q: 2, gain: 0.25 });
    blip({ freq: 150, endFreq: 70, dur: 0.14, gain: 0.14 });
  },
};

/* ---------------- Digital: chiptune blips ---------------- */

/** C major arpeggio over two octaves: the roll climbs through it, one note per scrambled time. */
const CHIP_NOTES = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98, 2093];
let chipStep = 0;

const chip = {
  /** One scrambled time: the next square-wave note up the arpeggio (it slows as the roll does). */
  roll: () => {
    blip({ freq: CHIP_NOTES[chipStep++ % CHIP_NOTES.length], dur: 0.045, type: "square", gain: 0.022 });
  },
  /** The clock landing: a coin bling, two quick notes a fourth apart. The shared win/lose follows. */
  land: () => {
    blip({ freq: 987.77, dur: 0.06, type: "square", gain: 0.032 });
    blip({ freq: 1318.51, dur: 0.24, type: "square", gain: 0.032, delay: 0.06 });
  },
};

export const sfx = {
  /**
   * The bet dial moved from `prev` to `range` minutes. With a dial instrument, play the
   * next note of a wandering melody; otherwise the synthesized tick (or detent at either end).
   * (Tier-change chords were dropped: they landed at odd moments mid-drag.)
   * How fast the dial is turning sets how many notes play: every minute when slow, fewer
   * (and no grace notes) when quick, always landing on wherever it comes to rest.
   */
  dial: (range: number, prev: number) => {
    const dial = currentDial();
    if (!dial) {
      if (range === 0 || range === MAX_RANGE) sfx.detent();
      else sfx.tick(range / MAX_RANGE);
      return;
    }
    const c = audio();
    if (!c || muted) return;

    const now = performance.now() / 1000;
    const dt = now - lastMoveAt;
    lastMoveAt = now;
    const speed = Math.abs(range - prev) / Math.max(dt, 0.008);
    // A fresh gesture starts from its own speed; mid-drag, smooth out the jitter.
    dialSpeed = dt > 0.25 ? speed : dialSpeed * 0.5 + speed * 0.5;

    clearTimeout(pendingNote);
    const wait = noteGap(dialSpeed) - (c.currentTime - lastDialAt);
    if (wait > 0 && range !== 0 && range !== MAX_RANGE) {
      // Too soon after the last note: skip this one, but if the dial stops here, land on it.
      pendingNote = setTimeout(() => dialNote(dial, range, prev, false), wait * 1000 + 40);
      return;
    }
    dialNote(dial, range, prev, dialSpeed < GRACE_MAX_SPEED);
  },
  /** A plain tick, pitch climbing with p = 0..1 (the time picker, and the dial's fallback). */
  tick: (p: number) => blip({ freq: 700 + p * 1100, dur: 0.025, type: "triangle", gain: 0.05 }),
  /** Hitting either end of the dial. */
  detent: () => blip({ freq: 240, endFreq: 110, dur: 0.09, gain: 0.14 }),
  click: () => blip({ freq: 640, endFreq: 420, dur: 0.05, type: "triangle", gain: 0.06 }),
  swap: () => {
    blip({ freq: 520, endFreq: 880, dur: 0.08, gain: 0.05 });
    blip({ freq: 1320, dur: 0.04, type: "triangle", gain: 0.03, delay: 0.05 });
  },
  /** The Set alarm button clicking down and locking. */
  latch: () => {
    // A recorded plastic alarm-clock button clicking down, with a soft thump under it.
    const buf = buffers[COMMON]?.latch;
    if (buf) {
      play(buf, { gain: LATCH_GAIN });
      blip({ freq: 150, endFreq: 70, dur: 0.12, gain: 0.08 });
      return;
    }
    blip({ freq: 190, endFreq: 70, dur: 0.14, gain: 0.2 });
    blip({ freq: 1500, dur: 0.02, type: "square", gain: 0.025 });
  },
  /** Reset Alarm: the button releases and the theme's song fades out. */
  unlatch: () => {
    stopDraw(RESET_FADE);
    blip({ freq: 90, endFreq: 220, dur: 0.1, gain: 0.12 });
  },
  /** Alarm-clock beep-beep while the target time blinks: a recorded bedside-clock tone. */
  beep: () => {
    const buf = buffers[COMMON]?.beep;
    if (buf) {
      play(buf, { gain: BEEP_GAIN });
      return;
    }
    blip({ freq: 1975, dur: 0.07, type: "square", gain: 0.022 });
    blip({ freq: 1975, dur: 0.07, type: "square", gain: 0.022, delay: 0.11 });
  },
  /**
   * Once, as the target starts blinking: the theme's draw song if it has one, otherwise
   * the shared "Alarm set… or is it?". Recorded only.
   */
  set: () => {
    const song = drawSongs[soundTheme];
    if (song && fullSong()) {
      if (draw) return; // already playing
      const voice = play(song, { gain: FULL_SONG_GAIN });
      if (voice) voice.src.onended = () => draw?.src === voice.src && (draw = null);
      draw = voice;
      return;
    }
    stopDraw();
    if (song) {
      draw = play(song);
      return;
    }
    const buf = stinger("set");
    if (buf) play(buf);
  },
  /**
   * The draw begins and will land in `ms`. With a recorded roll, schedule it so its final
   * hit lands with the clock; the synthesized ticks fill the gap until it starts.
   */
  startRoll: (ms: number) => {
    clearRoll();
    duckMusic(MUSIC_DUCK, 0.4);
    rolling = true;
    // Prize wheel's roll is the little wheel clacking over its pegs (see `peg`); Digital's is
    // its chiptune arpeggio (see `roll`)
    chipStep = 0;
    if (soundTheme === "wheel" || soundTheme === "digital") return;
    const song = drawSongs[soundTheme];
    if (song && fullSong()) {
      // The full song carries the roll while it plays; once it has ended, the shared roll.
      if (draw && ctx) return void (rollFrom = ctx.currentTime);
    } else if (song) {
      const c = muted ? null : audio();
      if (!c) return;
      // The draw song started at the blink and carries the roll. "Roll again" skips the
      // blink, so start it part-way in, still landing its accent with the clock.
      if (!draw) draw = play(song, { offset: BLINK_S });
      rollFrom = c.currentTime; // no synthesized ticks over the song
      return;
    }
    const buf = stinger("roll");
    const c = buf && !muted ? audio() : null;
    if (!buf || !c) return;
    const delay = Math.max(0, ms / 1000 - (THEME_SOUNDS[theme]?.stingers?.rollHit ?? 0));
    rollSource = play(buf, { delay })?.src ?? null;
    rollFrom = c.currentTime + delay;
  },
  /** The draw was interrupted (Change bet mid-roll). */
  stopRoll,
  /** A peg passing the pointer on Prize wheel's little wheel, while the draw rolls. */
  peg: () => wheel.peg(),
  /** One scrambled time during the draw. */
  roll: () => {
    if (soundTheme === "wheel") return; // the wheel's pegs keep time instead
    if (soundTheme === "digital") return chip.roll();
    if (ctx && ctx.currentTime >= rollFrom) return; // the recorded roll has taken over
    blip({ freq: 1100 + Math.random() * 700, dur: 0.018, type: "square", gain: 0.02 });
  },
  /** Final time lands; the result sting follows. */
  land: (offset: number) => {
    // Let the result sting play out, then bring the song back up.
    rolling = false;
    if (music && ctx) {
      const g = music.amp.gain;
      const now = ctx.currentTime;
      g.cancelScheduledValues(now);
      g.setValueAtTime(g.value, now);
      g.setValueAtTime(g.value, now + 2.5);
      g.linearRampToValueAtTime(MUSIC_GAIN, now + 4);
    }
    // A recorded roll or short draw song carries its own final hit; a short song fades out
    // under the win/lose sound, a full song plays on beneath it.
    const recorded =
      rollSource !== null || (draw !== null && !fullSong()) || soundTheme === "wheel" || soundTheme === "digital";
    if (!fullSong()) stopDraw(DRAW_FADE);
    rollSource = null;
    rollFrom = Infinity;
    // Prize wheel: its own thunk as the wheel stops, then the same win/lose as every theme.
    if (soundTheme === "wheel") wheel.stop();
    // Digital: a coin bling, then the shared win/lose.
    if (soundTheme === "digital") chip.land();
    const sting = stinger(offset < 0 ? "win" : offset > 0 ? "loss" : "jackpot");
    if (sting) {
      // Without a recorded final hit, add the synthesized thunk.
      if (!recorded) blip({ freq: 160, endFreq: 60, dur: 0.16, gain: 0.18 });
      play(sting, { delay: 0.1 });
      return;
    }
    if (!recorded) blip({ freq: 160, endFreq: 60, dur: 0.16, gain: 0.18 });
    if (offset < 0) {
      [784, 988, 1319].forEach((f, i) =>
        blip({ freq: f, dur: 0.2, type: "triangle", gain: 0.07, delay: 0.12 + i * 0.08 }),
      );
    } else if (offset > 0) {
      blip({ freq: 233, endFreq: 110, dur: 0.38, type: "sawtooth", gain: 0.035, delay: 0.12 });
      blip({ freq: 220, endFreq: 104, dur: 0.38, type: "sawtooth", gain: 0.035, delay: 0.12 });
    } else {
      [1047, 1319, 1568, 2093].forEach((f, i) =>
        blip({ freq: f, dur: 0.16, type: "triangle", gain: 0.06, delay: 0.12 + i * 0.06 }),
      );
    }
  },
};
