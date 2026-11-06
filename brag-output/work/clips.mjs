// What happens on the real site in each captured clip, keyed to the caption timeline.
import { readFileSync } from 'node:fs';

const TL = JSON.parse(readFileSync(new URL('./timeline.json', import.meta.url), 'utf8'));
const L = TL.lines;
const SCROLL = 175; // frames the dial, status and rail with room for captions below

// Set Alarm → latch, blink 0.38 s, roll from 1.78 s, lands after ROLL_MS (2.825 s).
const SET_TO_LAND = 0.38 + 1.4 + 2.825 + 0.3;
const ROLL_TO_LAND = 2.825 + 0.22;

const SET_BTN = { sel: 'button', text: 'Set Alarm' };
const ROLL_BTN = { sel: 'button', text: 'Roll Again' };
const NEXT_BTN = { sel: 'button[aria-label="Next theme"]' };
const TIME_BTN = { sel: '[aria-label^="Alarm time"]' };
const REST = { x: 1190, y: 700 }; // clear of the caption band once the camera pushes in

/** A clip shows global time [g0, g1]; `pre` seconds of simulation run (unrecorded) before g0. */
function clip({ name, query, g0, g1, pre = 0, scroll = SCROLL, warm, build }) {
  const at = (g) => +(g - g0 + pre).toFixed(3);
  const actions = [];
  const A = (g, a) => actions.push({ t: at(g), ...a });
  build({ A, at });
  return { name, query, g0, g1, preroll: pre, duration: +(g1 - g0).toFixed(3), scroll: typeof scroll === 'function' ? scroll(at) : scroll, warm, actions };
}

/** Pre-roll: from the default ±10 drag the dial to `to`, then press Set Alarm so the draw lands at `land`. */
function setAndLand(A, { land, offset, from = 10, to, start }) {
  const click = land - SET_TO_LAND;
  const s = start ?? click - 2.6;
  A(s, { type: 'show', at: { dial: from } });
  A(s + 0.15, { type: 'press' });
  A(s + 0.2, { type: 'drag', to: { dial: to }, dur: 0.9 });
  A(s + 1.15, { type: 'release' });
  A(s + 1.3, { type: 'move', to: SET_BTN, dur: 0.8 });
  A(click - 0.05, { type: 'force', offset, range: to });
  A(click, { type: 'click' });
  A(click + 0.45, { type: 'move', to: REST, dur: 0.9 });
  return click;
}

const how = clip({
  name: 'how',
  g0: L.h1.start - 0.9,
  g1: L.t3.start - 0.08,
  scroll: (at) => [[0, 0], [at(L.h1.end), 0], [at(L.h1.end + 1.1), SCROLL]],
  build: ({ A }) => {
    // Pick when you want to wake up: tap the time, the wheel picker opens, Done.
    A(L.h1.end + 0.3, { type: 'show', at: { x: 1500, y: 1000 } });
    const tm = L.h1.end + 1.12;
    A(tm, { type: 'move', to: TIME_BTN, dur: 0.7 });
    A(tm + 0.85, { type: 'click' });
    A(tm + 1.45, { type: 'move', to: { sel: 'button', text: 'DONE' }, dur: 0.55 });
    A(Math.max(tm + 2.25, L.h2.end - 0.2), { type: 'click' });
    // Drag the bell: five, ten, forty-five, then back to fifteen.
    A(L.h3.start + 0.3, { type: 'move', to: { dial: 10 }, dur: 0.8 });
    A(L.h3.start + 1.3, { type: 'press' });
    A(L.h4.start - 0.15, { type: 'drag', to: { dial: 5 }, dur: 0.45 });
    A(L.h4.start + 0.75, { type: 'drag', to: { dial: 10 }, dur: 0.4 });
    A(L.h4.start + 1.35, { type: 'drag', to: { dial: 45 }, dur: 1.15 });
    A(L.h5.start + 0.2, { type: 'drag', to: { dial: 15 }, dur: 0.9 });
    A(L.h5.start + 1.25, { type: 'release' });
    // Set Alarm so the win lands as "Rings early?" starts.
    const land1 = L.h7.start + 0.2;
    A(land1 - SET_TO_LAND - 1.05, { type: 'move', to: SET_BTN, dur: 0.85 });
    A(land1 - SET_TO_LAND - 0.05, { type: 'force', offset: -9, range: 15 });
    A(land1 - SET_TO_LAND, { type: 'click' });
    A(land1 - SET_TO_LAND + 0.45, { type: 'move', to: REST, dur: 0.9 });
    // Roll Again: the loss lands on "Rings late?"
    const land2 = L.h8.start + 0.2;
    A(land1 + 0.9, { type: 'move', to: ROLL_BTN, dur: 0.7 });
    A(land2 - ROLL_TO_LAND - 0.05, { type: 'force', offset: 11, range: 15 });
    A(land2 - ROLL_TO_LAND, { type: 'click' });
    // One more, landing on "That's the trick."
    const land3 = L.h10.start + 0.1;
    A(land3 - ROLL_TO_LAND - 0.05, { type: 'force', offset: -4, range: 15 });
    A(land3 - ROLL_TO_LAND, { type: 'click' });
    // Every theme has its own way…: next theme → Good Night, add doubt, Set Alarm.
    A(L.h11.start + 1.5, { type: 'move', to: NEXT_BTN, dur: 1.0 });
    A(L.t1.start + 0.3, { type: 'click' });
    const land4 = L.t2.start + 3.75;
    const click4 = land4 - SET_TO_LAND;
    A(L.t1.start + 0.75, { type: 'move', to: { dial: 0 }, dur: 0.55 });
    A(L.t1.start + 1.35, { type: 'press' });
    A(L.t1.start + 1.4, { type: 'drag', to: { dial: 20 }, dur: 0.75 });
    A(L.t1.start + 2.2, { type: 'release' });
    A(L.t1.start + 2.3, { type: 'move', to: SET_BTN, dur: Math.max(0.5, click4 - 0.15 - (L.t1.start + 2.3)) });
    A(click4 - 0.05, { type: 'force', offset: -7, range: 20 });
    A(click4, { type: 'click' });
    A(click4 + 0.45, { type: 'move', to: REST, dur: 0.9 });
  },
});

const muertos = clip({
  name: 'muertos', query: '?theme=muertos',
  g0: L.t3.start - 0.1, g1: L.t5.start - 0.1, pre: 6.5,
  build: ({ A }) => {
    const land1 = L.t3.start + 1.5;
    setAndLand(A, { land: land1, offset: -8, to: 30 });
    const land2 = L.t4.start + 0.75;
    A(land1 + 0.8, { type: 'move', to: ROLL_BTN, dur: 0.7 });
    A(land2 - ROLL_TO_LAND - 0.05, { type: 'force', offset: 13, range: 30 });
    A(land2 - ROLL_TO_LAND, { type: 'click' });
    A(land2 + 0.7, { type: 'move', to: REST, dur: 1.0 });
  },
});

const ouija = clip({
  name: 'ouija', query: '?theme=ouija',
  g0: L.t5.start - 0.1, g1: L.t6.start - 0.1, pre: 6.5,
  build: ({ A }) => {
    const land = L.t5.start + 2.25;
    setAndLand(A, { land, offset: 12, to: 25 });
  },
});

const tarot = clip({
  name: 'tarot', query: '?theme=tarot',
  g0: L.t6.start - 0.1, g1: L.t8.start - 0.1, pre: 2.5,
  build: ({ A }) => {
    // Pre-roll: grab the bell at 15.
    A(L.t6.start - 2.0, { type: 'show', at: { dial: 10 } });
    A(L.t6.start - 1.8, { type: 'press' });
    A(L.t6.start - 1.75, { type: 'drag', to: { dial: 15 }, dur: 0.5 });
    // Push your luck: all the way to 45, the card catches fire.
    A(L.t6.start + 0.3, { type: 'drag', to: { dial: 45 }, dur: 1.3 });
    A(L.t6.start + 1.65, { type: 'release' });
    const land = L.t7.start + 1.65;
    const click = land - SET_TO_LAND;
    A(L.t6.start + 1.75, { type: 'move', to: SET_BTN, dur: Math.max(0.55, click - 0.15 - (L.t6.start + 1.75)) });
    A(click - 0.05, { type: 'force', offset: 21, range: 45 });
    A(click, { type: 'click' });
    A(click + 0.45, { type: 'move', to: REST, dur: 0.9 });
  },
});

const WHEEL_CUT = L.t8.start + 3.0;
const wheel = clip({
  name: 'wheel', query: '?theme=wheel',
  g0: L.t8.start - 0.1, g1: WHEEL_CUT, pre: 6.5,
  build: ({ A }) => {
    setAndLand(A, { land: L.t8.start + 2.1, offset: 9, to: 30 });
  },
});

const poker = clip({
  name: 'poker', query: '?theme=poker',
  g0: WHEEL_CUT, g1: TL.sections.find((s) => s.id === 'themes').end, pre: 6.5,
  build: ({ A }) => {
    const land = L.t8.start + 4.3;
    setAndLand(A, { land, offset: 14, to: 35 });
  },
});

export const CLIPS = Object.fromEntries([how, muertos, ouija, tarot, wheel, poker].map((c) => [c.name, c]));
export { SCROLL };
