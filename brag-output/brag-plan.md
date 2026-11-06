# LotteryClock demo video: first draft plan

**What it is:** an alarm clock that rings at a random moment inside a window around your wake-up time. Early wins you a snooze; late means get up now. You never know which, so you get up.

**Who it's for:** anyone who snoozes on autopilot. The Kiroween judges come first: this is the hackathon demo.

**Angle:** a ghost story. A dead alarm clock from the early 2000s, buried again in 2012, dug up for Kiroween. Then the real product in use, every theme, and the iPhone app that rings for real.

**Hook (0:00–0:02):** a bedside clock blinking 12:00 in the dark. Everyone has seen one, and everyone knows what it means.

**Highlights:**
1. The real dial: tap the time, drag the bell to ±5, ±10, ±45 ("Pure Chaos" sunburst), Set Alarm, the draw lands early (win), then late (loss).
2. Every theme has its own way of telling you you're late: Good Night's sheep, Día de Muertos, Ouija, Tarot on fire, Prize wheel, Poker.
3. The iPhone app sets a real AlarmKit alarm; the lock screen tells you how it went.

**Punchline:** "Sweet dreams. Maybe." over the lockup and lotteryclock.app.

**Tone:** storyteller, deadpan-spooky to playful. Narrated (your voiceover), with the script lines as on-screen captions.

**Visual identity:** everything comes from the repo.
- Real site captured frame by frame (production build, virtual clock, forced draws so each result lands on its line).
- Story art: the site's "why" comic panels (snooze, ringing, doubt, up), the ShiftingClock bedside clock and seven-segment display, the real 2012 email thread with its REJECTED stamp, the footer's Kiroween banner and Kiro ghost, the Good Night moon.
- iPhone: the three real app screenshots from `web/public/app/`.
- Type: Geist, Geist Mono, Geist Pixel, Geist Serif. Colours: plum #432344, amber #FFC03D, orange #FF6B35, red #FF2E4D, LED green #34F5B0.

**Sound:** only the site's own audio. Ouija's séance song for the cold open and the grave, the Good Morning loop for the story, each theme's draw song under its own clip, plus the latch, the blink beeps, the sunny win and buzz loss stingers, the marimba dial notes and the real alarm ringtone on the lock screen. Mixed to about −16 LUFS. Stems are in `work/` for re-balancing under the voiceover.

## Storyboard (voiceover pace about 170 wpm; timings in `work/timeline.json`)

| Time | Section | On screen |
|---|---|---|
| 0:00–0:11.6 | Cold open | Dark room, clock blinking 12:00, slow push-in; at "back from the dead" it glitches alive in ghost green |
| 0:11.6–0:59 | The story | "Early 2000s": snooze panel (*slap*), clock + cord: unplugged, goes dark, blinks 12:00, wakes on the wrong time; BRRRING → hand stops ("wait…"); ShiftingClock shuffles early/late ("5 minutes?" "Twenty?!"); …huh? → I'm up!; a week of ON TIME, then Monday LATE |
| 0:59–1:21.5 | Resurrection | 2002 → 2012 counter; 2012 slot-machine iPhone lands 7 3 0; the real email, REJECTED stamp; R.I.P. LotteryClock 2012–2012; lightning, Kiro ghost rises; Kiroween banner; white flash |
| 1:21.5–2:06 | How it works | Real hero, Good Morning: tap time (picker), drag 5 → 10 → 45 → 15, Set Alarm, camera pushes in; win lands on "Rings early?", loss on "Rings late?", another win on "That's the trick", pull back |
| 2:06–2:49 | Themes | Next theme → Good Night (sheep count during the roll, win); Día de Muertos win then loss; Ouija loss; Tarot dragged to 45 (fire), "Reversed. Rise now"; Prize wheel "Bankrupt"; Poker "Busted" |
| 2:49–3:37.7 | The app | "Bonus: now it rings for real", the three real screenshots dealt in; same themes, same dial; tap Set Alarm, the hidden window 7:13–7:47 locks; lock screen: "Snooze until 7:30 AM" → snooze countdown → rings at 7:30; "No snooze. Up you get"; the reveal clock rolls to 7:41; History |
| 3:37.7–3:44.5 | Close | LotteryClock lockup, lotteryclock.app; dusk to night, moon; "Sweet dreams. Maybe." |

## Placeholders to swap for real footage

- The lock-screen alarm cards (3:09–3:25) are a stylised mock-up built from the app's real alarm copy (`mobile/src/lib/alarm-copy.ts`). Replace with a screen recording of AlarmKit ringing on a device.
- The 2012 slot-machine phone is an illustration, not a screenshot of the 2012 app.
- The history and play screens are the real screenshots, shown still.

## Length

The full script reads at about 3:45 with the visual holds. If the submission needs ≤3:00, the easiest cuts are: the cord/plug beat (s3–s6, ~16 s), "He was on time for days…" (~6 s), the reveal-clock beat (a11, ~5 s), and one of Ouija/Tarot (~6 s).
