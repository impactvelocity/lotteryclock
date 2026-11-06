"use client";

import { motion } from "motion/react";
import { useEffect, useEffectEvent, useState } from "react";
import { SevenSegment } from "@/components/seven-segment";
import { sfx } from "@/lib/sfx";
import type { Theme } from "@/lib/themes";

export type RevealPhase = "dropping" | "blink" | "rolling" | "result";

/** Height of the digits; the hero sizes the stage around it. */
export const CLOCK_HEIGHT = "calc(min(380px, 82vw) * 0.3)";

/** Gaps between scrambled draws; slowing down like a reel. ~1.7s in all. */
const ROLL_DELAYS = [60, 60, 65, 70, 80, 90, 105, 125, 150, 180, 220, 270, 330];
/** Total length of the roll, so the hero's progress bar can match it. */
export const ROLL_MS = ROLL_DELAYS.reduce((a, b) => a + b, 60);

export function outcomeOf(offset: number) {
  return offset < 0 ? "early" : offset > 0 ? "late" : "onTime";
}


type Props = {
  theme: Theme;
  phase: RevealPhase;
  /** Target time, minutes from midnight. */
  target: number;
  /** Drawn offset in minutes; negative is early. */
  offset: number;
  range: number;
  /** Changes on every draw, so replays re-run their effects. */
  rollId: number;
  onLanded: () => void;
};

export function AlarmReveal({ theme: t, phase, target, offset, range, rollId, onLanded }: Props) {
  const [rolled, setRolled] = useState(target);
  const landed = useEffectEvent(() => onLanded());
  const isResult = phase === "result";

  // Beep while the target blinks, like a freshly set clock.
  useEffect(() => {
    if (phase !== "blink") return;
    sfx.set();
    sfx.beep();
    const id = setInterval(sfx.beep, 1000);
    return () => clearInterval(id);
  }, [phase]);

  // Scramble through times inside the window, then land on the real one.
  useEffect(() => {
    if (phase !== "rolling") return;
    let i = 0;
    let id: ReturnType<typeof setTimeout>;
    const step = () => {
      if (i === ROLL_DELAYS.length) {
        sfx.land(offset);
        landed();
        return;
      }
      setRolled(target - range + Math.floor(Math.random() * (2 * range + 1)));
      sfx.roll();
      id = setTimeout(step, ROLL_DELAYS[i++]);
    };
    id = setTimeout(step, 60);
    sfx.startRoll(ROLL_MS);
    return () => {
      clearTimeout(id);
      // Cut a recorded roll short if the draw is abandoned; after landing this is a no-op.
      sfx.stopRoll();
    };
  }, [phase, target, range, offset, rollId]);

  const shown = isResult ? target + offset : phase === "rolling" ? rolled : target;

  // Digits always use the theme's text colour; the status badge carries the win/lose colour.
  const digitColor = t.ink;

  // The real time lands with a small bump; no shake, so it stays easy to read.
  const clockAnim = isResult
    ? { scale: [1.08, 0.98, 1] }
    : { scale: 1 };


  return (
    <div className="relative flex w-full flex-col items-center">
      <motion.div
        className="relative"
        animate={clockAnim}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <SevenSegment
          minutes={shown}
          on={digitColor}
          off={`color-mix(in srgb, ${t.ink} 8%, transparent)`}
          glow={t.clock.glow ? `color-mix(in srgb, ${digitColor} 70%, transparent)` : null}
          font={t.timeFont}
          height={CLOCK_HEIGHT}
          blink={phase === "blink" || phase === "dropping"}
          running={isResult}
        />

      </motion.div>


    </div>
  );
}
