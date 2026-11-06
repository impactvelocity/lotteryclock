// The master timeline: every caption line from docs/demo-video-script.md, timed for a
// voiceover at ~165 words a minute. Visual beats key off these line ids.
import { writeFileSync } from 'node:fs';

const WPS = 2.9; // words per second
// [id, text, extra hold after the line (s)]
const SECTIONS = [
  { id: 'cold', lead: 1.6, tail: 0.9, lines: [
    ['c1', "Gather round. I've got a scary story.", 0.2],
    ['c2', "It's about a kid, his snooze button, and an alarm clock that came back from the dead.", 0],
  ]},
  { id: 'story', lead: 0.4, tail: 0.8, lines: [
    ['s1', 'Dylan was always late for school.', 0],
    ['s2', 'Not because he overslept. Because he snoozed. Professionally.', 0.3],
    ['s3', 'One day he cleaned his room, which is honestly the scariest part of this story.', 0.2],
    ['s4', 'He tripped over the cord, the alarm clock went dark,', 0.3],
    ['s5', 'and he plugged it back in like nothing happened.', 0.2],
    ['s6', "It blinked back to life. But it wasn't the same clock.", 0.5],
    ['s7', 'The next morning it went off, and his hand stopped halfway to snooze.', 0.2],
    ['s8', 'Is that the real time? How long was it dead?', 0.1],
    ['s9', 'Five minutes? Twenty?', 0.4],
    ['s10', 'He had no idea. So he got up.', 0.5],
    ['s11', 'He was on time for days.', 0.2],
    ['s12', 'Then he worked out the offset, fixed the clock, and was late again by Monday.', 0],
  ]},
  { id: 'resurrection', lead: 0.3, tail: 0.6, lines: [
    ['r1', 'Dylan grew up, but he never forgot that clock.', 0],
    ['r2', 'In 2012 he built it as an iPhone app that looked like a slot machine.', 0.2],
    ['r3', 'He tried to buy LotteryClock.com. The owner said no.', 0.5],
    ['r4', 'The app never shipped. The idea died.', 0.5],
    ['r5', "But some things don't stay dead.", 0.3],
    ['r6', 'This Kiroween, Dylan dug it back up.', 0],
  ]},
  { id: 'how', lead: 1.0, tail: 0.4, lines: [
    ['h1', 'This is LotteryClock.', 0.6],
    ['h2', 'Pick when you want to wake up.', 0.9],
    ['h3', "Then drag the dial to pick how much you're willing to gamble:", 0],
    ['h4', "five minutes, ten, or forty-five if you're truly unwell.", 0.6],
    ['h5', 'LotteryClock hides the real alarm somewhere in that window.', 0.2],
    ['h6', "Could be early. Could be late. You don't get to know.", 0.4],
    ['h7', 'Rings early? You win. Snooze guilt-free until your target time.', 1.2],
    ['h8', "Rings late? You lose. Get up. You're already late.", 0.8],
    ['h9', "And because you can't tell which one it is, you get up anyway.", 0.2],
    ['h10', "That's the trick.", 0.3],
    ['h11', "Once your clock can't be trusted, your brain can't snooze on autopilot.", 0],
  ]},
  { id: 'themes', lead: 0.5, tail: 0.6, lines: [
    ['t1', "Every theme has its own way of telling you you're late.", 0.3],
    ['t2', 'Good Night. It counts sheep while it decides your fate.', 1.6],
    ['t3', 'Día de Muertos. Win, and you rest in peace.', 2.2],
    ['t4', 'Lose, and you rise from the dead. Which is basically every Monday.', 0.6],
    ['t5', 'Ouija. Let the spirits pick. The spirits say: rise.', 0.8],
    ['t6', 'Tarot. Push your luck and the card catches fire.', 2.2],
    ['t7', "Upright, you sleep. Reversed, you're up.", 1.0],
    ['t8', 'And for the high rollers: a prize wheel and a poker table.', 0.3],
    ['t9', 'Two ways to go bust before breakfast.', 0],
  ]},
  { id: 'app', lead: 0.8, tail: 0.6, lines: [
    ['a1', 'One more thing.', 0.3],
    ['a2', 'The website is the game. The iPhone app is the real thing.', 0.3],
    ['a3', 'Same themes, same dial.', 0.2],
    ['a4', "But tap Set Alarm, and it schedules a real alarm with Apple's AlarmKit,", 0],
    ['a5', 'at a random moment inside your window.', 0.2],
    ['a6', "The phone knows when. You don't.", 0.6],
    ['a7', 'When it rings, the alarm tells you how it went.', 0.3],
    ['a8', 'Rang early? Hit snooze, and you get exactly the minutes you won,', 0],
    ['a9', 'then it rings again at your target time.', 0.4],
    ['a10', 'Rang late? No snooze. Up you get.', 0.6],
    ['a11', 'Open the app and the clock rolls to reveal when it really went off.', 0.3],
    ['a12', 'Every morning lands in your history,', 0],
    ['a13', "so you can see exactly how many minutes of sleep you've gambled away.", 0],
  ]},
  { id: 'close', lead: 0.6, tail: 2.6, lines: [
    ['x1', 'Try it at LotteryClock.app.', 0.6],
    ['x2', 'Sweet dreams. Maybe.', 0],
  ]},
];

const words = (s) => s.replace(/[—–]/g, ' ').split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
const breaks = (s) => (s.trim().replace(/[.?!:]+$/, '').match(/[.?!:](\s|$)/g) || []).length;

let t = 0;
const lines = {};
const sections = [];
for (const sec of SECTIONS) {
  const start = t;
  t += sec.lead;
  for (const [id, text, hold] of sec.lines) {
    const dur = Math.max(1.3, words(text) / WPS + 0.2 * breaks(text) + 0.15);
    lines[id] = { id, text, start: +t.toFixed(3), end: +(t + dur).toFixed(3), section: sec.id };
    t += dur + 0.08 + hold;
  }
  t += sec.tail;
  sections.push({ id: sec.id, start: +start.toFixed(3), end: +t.toFixed(3) });
}
const total = +t.toFixed(3);
const out = { fps: 30, total, sections, lines };
writeFileSync(new URL('./timeline.json', import.meta.url), JSON.stringify(out, null, 1));

const ts = (s) => {
  const ms = Math.round(s * 1000);
  const h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, sec = Math.floor(ms / 1000) % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')},${String(ms % 1000).padStart(3, '0')}`;
};
const srt = Object.values(lines).map((l, i) => `${i + 1}\n${ts(l.start)} --> ${ts(l.end)}\n${l.text}\n`).join('\n');
writeFileSync(new URL('./captions.srt', import.meta.url), srt);
console.log('total', total.toFixed(1), 's');
for (const s of sections) console.log(s.id.padEnd(13), s.start.toFixed(1), '→', s.end.toFixed(1), `(${(s.end - s.start).toFixed(1)}s)`);
