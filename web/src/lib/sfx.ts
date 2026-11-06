/**
 * Sound effects. UI sounds (clicks, beeps) are tiny synthesized blips. Themes with recorded
 * sounds in /sfx/<theme>/ also get:
 * - stingers: the draw, the result and "Alarm set… or is it?";
 * - a dial instrument: single recorded notes, re-pitched in code so dragging the bet plays
 *   up the theme's scale, plus a chord or strum on crossing into a riskier tier.
 * Anything a theme lacks (or that hasn't loaded yet) falls back to the blips. Only ever
 * called from user-initiated interactions, so browsers allow the AudioContext to start.
 * See docs/sound-prompts.md for how the files were made.
 */

import { MAX_RANGE, tierIndex } from "@/lib/themes";

let ctx: AudioContext | null = null;
let muted = false;

export function setMuted(value: boolean) {
  muted = value;
  if (value) stopRoll();
}

const STINGERS = ["roll", "win", "loss", "jackpot", "set"] as const;
type Stinger = (typeof STINGERS)[number];

type DialKit = {
  /**
   * Measured pitch (MIDI) of each recorded note: note-1.mp3 first. Several takes near the
   * same pitch are deliberate: they alternate, so repeated notes don't sound identical.
   */
  notes: number[];
  /** The notes the dial plays, as MIDI, lowest first. 0 min is the bottom, 45 the top. */
  scale: number[];
  /**
   * Pitch shift (semitones) of tier.mp3 on crossing into tiers 1–5, so raising the bet
   * walks through a chord progression.
   */
  chords: [number, number, number, number, number];
};

type ThemeSounds = {
  /** Draw and result stingers. rollHit: when roll.mp3's final hit lands, in seconds. */
  stingers?: { rollHit: number };
  /** Pitched dial notes; tier.mp3 plays on crossing into a riskier tier. */
  dial?: DialKit;
};

/** Every note of a scale (semitone steps above `root`) from MIDI `from` to `to`. */
function scale(root: number, steps: number[], from: number, to: number): number[] {
  const out: number[] = [];
  for (let m = from; m <= to; m++) if (steps.includes((((m - root) % 12) + 12) % 12)) out.push(m);
  return out;
}

const MAJOR_PENTATONIC = [0, 2, 4, 7, 9];
/** The flamenco scale: a minor-sounding scale with a major third and a flat second. */
const PHRYGIAN_DOMINANT = [0, 1, 4, 5, 7, 8, 10];

const THEME_SOUNDS: Record<string, ThemeSounds> = {
  classic: {
    stingers: { rollHit: 1.38 },
    dial: {
      // Marimba. C major pentatonic, G3 to G5 (11 notes): the recordings sit between C4
      // and C#5, so no note is shifted more than about 6 semitones.
      notes: [60.1, 60.1, 60.13, 65.07, 65.16, 66.05, 67.05, 67.05, 73.04],
      scale: scale(0, MAJOR_PENTATONIC, 55, 79),
      // C, F, G, low G, then home to C at "All in": I–IV–V–V–I.
      chords: [0, 5, 7, -5, 0],
    },
  },
  muertos: {
    dial: {
      // Nylon-string guitar. E Phrygian dominant (the flamenco scale), E3 to E5 (15 notes).
      notes: [47.99, 52.2, 56.33, 56.95, 57.2, 59.18, 60.16, 66.27, 71.1, 74.05, 74.12, 77.05],
      scale: scale(4, PHRYGIAN_DOMINANT, 52, 76),
      // The strum's strongest notes are F and E, so treat it as E and step down the
      // Andalusian cadence as the bet climbs: A, G, F, then E at 36 and again at 45.
      chords: [5, 3, 1, 0, 0],
    },
  },
};

/**
 * The stingers are levelled to -18 LUFS; this brings them down to sit with the synthesized
 * blips instead of jumping out over them.
 */
const SAMPLE_GAIN = 0.4;
/** Dial notes and tier chords are peak-normalized and play often, so they sit lower still. */
const DIAL_GAIN = 0.25;
const TIER_GAIN = 0.35;
/** Notes closer together than this (a fast drag) are skipped so the run doesn't turn to mush. */
const DIAL_MIN_GAP = 0.025;

let theme = "";
/** Decoded files, per theme. A missing entry means still loading or failed: use the blips. */
const buffers: Record<string, Record<string, AudioBuffer>> = {};

function filesFor(id: string): string[] {
  const s = THEME_SOUNDS[id];
  if (!s) return [];
  return [
    ...(s.stingers ? STINGERS : []),
    ...(s.dial ? [...s.dial.notes.map((_, i) => noteFile(i)), "tier"] : []),
  ];
}

/** Pick the theme whose sounds play, and start loading its files if it has any. */
export function setSoundTheme(id: string) {
  theme = id;
  const files = filesFor(id);
  if (!files.length || buffers[id] || typeof window === "undefined") return;
  const bank: Record<string, AudioBuffer> = (buffers[id] = {});
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

function sample(name: Stinger | (string & {})): AudioBuffer | undefined {
  return buffers[theme]?.[name];
}

type Voice = { src: AudioBufferSourceNode; amp: GainNode };

/**
 * Play a decoded file `delay` seconds from now, at `rate` (2 is an octave up). Returns the
 * voice so it can be stopped.
 */
function play(buf: AudioBuffer, { delay = 0, rate = 1, gain = SAMPLE_GAIN } = {}): Voice | null {
  if (muted) return null;
  const c = audio();
  if (!c) return null;
  const src = c.createBufferSource();
  const amp = c.createGain();
  src.buffer = buf;
  src.playbackRate.value = rate;
  amp.gain.value = gain;
  src.connect(amp).connect(c.destination);
  src.start(c.currentTime + delay);
  return { src, amp };
}

function noteFile(i: number) {
  return `note-${i + 1}`;
}

const pick = <T,>(xs: readonly T[]): T => xs[Math.floor(Math.random() * xs.length)];
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/** The dial note still ringing; the next one fades it out so a drag stays clean. */
let dialVoice: Voice | null = null;
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

/**
 * Play MIDI note `target` from a recording within 5 semitones (a different take from last
 * time where there's a choice), re-pitched, at a slightly varied strength.
 */
function playNote(kit: DialKit, target: number, { delay = 0, gain = DIAL_GAIN, steal = true } = {}) {
  const c = audio();
  if (!c || muted) return;
  const near = kit.notes.map((_, i) => i).filter((i) => Math.abs(kit.notes[i] - target) <= 5);
  let take = near.length ? pick(near.length > 1 ? near.filter((i) => i !== lastTake) : near) : -1;
  if (take < 0)
    take = kit.notes.reduce((b, m, i) => (Math.abs(m - target) < Math.abs(kit.notes[b] - target) ? i : b), 0);
  const buf = sample(noteFile(take));
  if (!buf) return;
  if (steal && dialVoice) {
    const { src, amp } = dialVoice;
    amp.gain.setTargetAtTime(0, c.currentTime, 0.015);
    src.stop(c.currentTime + 0.1);
  }
  const voice = play(buf, {
    delay,
    rate: 2 ** ((target - kit.notes[take]) / 12),
    gain: gain * (0.75 + Math.random() * 0.4),
  });
  if (steal) dialVoice = voice;
  lastTake = take;
}

/** Whether every file the theme's dial needs has loaded. */
function dialReady(kit: DialKit | undefined): kit is DialKit {
  return !!kit && kit.notes.every((_, i) => sample(noteFile(i)));
}

/** The draw's recorded roll, if one is playing or scheduled. */
let rollSource: AudioBufferSourceNode | null = null;
/** Context time the recorded roll starts at; the synthesized ticks hand over to it then. */
let rollFrom = Infinity;

function stopRoll() {
  try {
    rollSource?.stop();
  } catch {}
  rollSource = null;
  rollFrom = Infinity;
}

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
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

export const sfx = {
  /**
   * The bet dial moved from `prev` to `range` minutes. With a dial instrument, play the
   * next note of a wandering melody (sometimes with a quick grace note, more often as the
   * bet grows) and, on crossing into a riskier tier, the next chord of the progression;
   * otherwise the synthesized tick (or detent at either end).
   */
  dial: (range: number, prev: number) => {
    const kit = THEME_SOUNDS[theme]?.dial;
    if (!dialReady(kit)) {
      if (range === 0 || range === MAX_RANGE) sfx.detent();
      else sfx.tick(range / MAX_RANGE);
      return;
    }
    const c = audio();
    if (!c || muted) return;
    const tier = tierIndex(range);
    const chord = sample("tier");
    if (chord && tier > tierIndex(prev)) {
      const rate = 2 ** (kit.chords[tier - 1] / 12);
      play(chord, { rate, gain: TIER_GAIN });
      // All in: strum it twice.
      if (range === MAX_RANGE) play(chord, { rate, gain: TIER_GAIN * 0.8, delay: 0.13 });
    }
    // A fast drag: skip notes rather than smear them together.
    if (c.currentTime - lastDialAt < DIAL_MIN_GAP) return;
    lastDialAt = c.currentTime;
    const i = nextStep(kit, range, prev);
    playNote(kit, kit.scale[i]);
    const p = range / MAX_RANGE;
    if (range > 0 && range < MAX_RANGE && Math.random() < 0.12 + 0.25 * p) {
      // A grace note just after: the next note up or a skip of two (down, at the very top).
      const step = pick([1, 1, 2]);
      const g = i + step < kit.scale.length ? i + step : i - step;
      playNote(kit, kit.scale[g], { delay: 0.06 + Math.random() * 0.03, gain: DIAL_GAIN * 0.7, steal: false });
    }
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
    blip({ freq: 190, endFreq: 70, dur: 0.14, gain: 0.2 });
    blip({ freq: 1500, dur: 0.02, type: "square", gain: 0.025 });
  },
  unlatch: () => blip({ freq: 90, endFreq: 220, dur: 0.1, gain: 0.12 }),
  /** Alarm-clock beep while the target time blinks. */
  beep: () => {
    blip({ freq: 1975, dur: 0.07, type: "square", gain: 0.022 });
    blip({ freq: 1975, dur: 0.07, type: "square", gain: 0.022, delay: 0.11 });
  },
  /** Once, as the target starts blinking: "Alarm set… or is it?". Recorded only. */
  set: () => {
    const buf = sample("set");
    if (buf) play(buf);
  },
  /**
   * The draw begins and will land in `ms`. With a recorded roll, schedule it so its final
   * hit lands with the clock; the synthesized ticks fill the gap until it starts.
   */
  startRoll: (ms: number) => {
    stopRoll();
    const buf = sample("roll");
    const c = buf && !muted ? audio() : null;
    if (!buf || !c) return;
    const delay = Math.max(0, ms / 1000 - (THEME_SOUNDS[theme]?.stingers?.rollHit ?? 0));
    rollSource = play(buf, { delay })?.src ?? null;
    rollFrom = c.currentTime + delay;
  },
  /** The draw was interrupted (Change bet mid-roll). */
  stopRoll,
  /** One scrambled time during the draw. */
  roll: () => {
    if (ctx && ctx.currentTime >= rollFrom) return; // the recorded roll has taken over
    blip({ freq: 1100 + Math.random() * 700, dur: 0.018, type: "square", gain: 0.02 });
  },
  /** Final time lands; the result sting follows. */
  land: (offset: number) => {
    const recorded = rollSource !== null;
    rollSource = null;
    rollFrom = Infinity;
    const sting = sample(offset < 0 ? "win" : offset > 0 ? "loss" : "jackpot");
    if (sting) {
      // A recorded roll carries its own final hit; otherwise add the synthesized thunk.
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
