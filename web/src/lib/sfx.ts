/**
 * Tiny synthesized sound effects (Web Audio, no files). Only ever called from
 * user-initiated interactions, so browsers allow the AudioContext to start.
 */

let ctx: AudioContext | null = null;
let muted = false;

export function setMuted(value: boolean) {
  muted = value;
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
  /** One minute of bet on the dial. Pitch climbs with risk (p = 0..1). */
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
  roll: () =>
    blip({ freq: 1100 + Math.random() * 700, dur: 0.018, type: "square", gain: 0.02 }),
  /** Final time lands; the result sting follows. */
  land: (offset: number) => {
    blip({ freq: 160, endFreq: 60, dur: 0.16, gain: 0.18 });
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
