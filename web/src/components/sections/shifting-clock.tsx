"use client";

import { AnimatePresence, motion, useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";

import { SevenSegment } from "@/components/seven-segment";

/** The alarm is set for 7:30 and can ring up to this many minutes either side. */
const SET_HOUR = 7;
const SET_MINUTE = 30;
const SPREAD = 15;
/** How long each time stays on screen, long enough to read it. */
const TICK_MS = 2600;

/** LED colours: the early (minus) side is green, the late (plus) side red, the middle white. */
const SIDES = {
  early: {
    idle: "bg-[#174A3E]",
    trail: "bg-[#34F5B0]/85 shadow-[0_0_6px_rgba(52,245,176,0.5)]",
    lit: "bg-[#34F5B0] shadow-[0_0_16px_3px_rgba(52,245,176,0.85)]",
  },
  late: {
    idle: "bg-[#5A1D36]",
    trail: "bg-[#FF3D6E]/85 shadow-[0_0_6px_rgba(255,61,110,0.5)]",
    lit: "bg-[#FF3D6E] shadow-[0_0_16px_3px_rgba(255,61,110,0.85)]",
  },
  center: {
    idle: "bg-white/40",
    trail: "bg-white/40",
    lit: "bg-white shadow-[0_0_14px_2px_rgba(255,255,255,0.6)]",
  },
};

/** Pick a new offset in [-SPREAD, SPREAD] that's at least 4 minutes away from the last one. */
function nextOffset(prev: number) {
  let next = prev;
  while (Math.abs(next - prev) < 4)
    next = Math.round(Math.random() * SPREAD * 2) - SPREAD;
  return next;
}

/**
 * A bedside clock set for 7:30 that keeps shifting to a random time within ±15 minutes,
 * drawn on the hero's seven-segment display.
 */
export function ShiftingClock() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.4 });
  // Starts on 7:30 exactly, so the server and first client render match
  const [offset, setOffset] = useState(0);
  const offsetRef = useRef(0);

  // Only shuffle while the clock is on screen
  useEffect(() => {
    if (!inView) return;
    const id = setInterval(() => {
      const prev = offsetRef.current;
      const next = nextOffset(prev);
      offsetRef.current = next;
      setOffset(next);
    }, TICK_MS);
    return () => clearInterval(id);
  }, [inView]);

  const status =
    offset === 0
      ? { text: "Right on time", tone: "text-white/80" }
      : offset < 0
        ? {
            text: `${-offset} min early`,
            tone: "text-[#34F5B0] [text-shadow:0_0_12px_rgba(52,245,176,0.7)]",
          }
        : {
            text: `${offset} min late`,
            tone: "text-[#FF3D6E] [text-shadow:0_0_12px_rgba(255,61,110,0.7)]",
          };

  return (
    <div ref={ref} className="relative mx-auto w-full max-w-xl">
      {/* Contact shadow where the clock sits on the table */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-[8%] -bottom-3 h-8 rounded-[50%] bg-[#432344]/30 blur-xl"
      />

      {/* Clock body */}
      <div className="relative rounded-[2.25rem] bg-white p-3 shadow-[0_18px_30px_-20px_rgba(67,35,68,0.5)] ring-1 ring-foreground/10">
        {/* Screen */}
        <div className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-b from-[#2a1530] to-[#140916] px-6 pt-5 pb-5 text-white sm:px-10 sm:pt-6 sm:pb-6">
          {/* LCD scanlines and a soft glare across the glass */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(to_bottom,rgba(255,255,255,0.035)_0_1px,transparent_1px_4px)]"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/[0.06] to-transparent"
          />

          <p className="relative flex items-center justify-center gap-2 font-pixel text-sm tracking-[0.12em] text-white/50 uppercase">
            <svg
              aria-hidden
              viewBox="0 0 7 7"
              className="h-3 w-3"
              fill="currentColor"
              shapeRendering="crispEdges"
            >
              {/* A pixel bell */}
              <path d="M3 0h1v1H3zM2 1h3v1H2zM1 2h5v3H1zM0 5h7v1H0zM3 6h1v1H3z" />
            </svg>
            Alarm 7:30 AM
          </p>

          <p className="sr-only">
            The alarm is set for 7:30 AM and could ring any time from 7:15 to
            7:45.
          </p>
          {/* The same seven-segment display as the hero, lit amber with the unlit segments showing */}
          <div
            aria-hidden
            className="relative mt-3 flex justify-center sm:mt-4"
          >
            <SevenSegment
              minutes={SET_HOUR * 60 + SET_MINUTE + offset}
              on="#FFC03D"
              off="rgba(255,255,255,0.07)"
              glow="rgba(255,192,61,0.6)"
              font="var(--font-geist-sans), sans-serif"
              height="clamp(4.5rem, 20vw, 7rem)"
              running
            />
          </div>

          {/* Where in the window it landed, as a row of LED segments: one per minute,
              early (minus) side green, late (plus) side red */}
          <div className="relative mt-4 sm:mt-5">
            <div className="flex gap-[3px]">
              {Array.from({ length: SPREAD * 2 + 1 }, (_, i) => {
                const m = i - SPREAD;
                const side =
                  m < 0 ? SIDES.early : m > 0 ? SIDES.late : SIDES.center;
                const lit = m === offset;
                const between =
                  offset !== 0 &&
                  (offset < 0 ? m > offset && m < 0 : m < offset && m > 0);
                return (
                  <span
                    key={m}
                    className={`h-3.5 flex-1 rounded-[2px] transition-[background-color,box-shadow] duration-300 ${
                      lit ? side.lit : between ? side.trail : side.idle
                    }`}
                  />
                );
              })}
            </div>
            <div className="mt-3 flex items-center justify-between font-pixel text-sm">
              <span className="text-[#34F5B0] [text-shadow:0_0_10px_rgba(52,245,176,0.5)]">
                7:15
              </span>
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={status.text}
                  className={`text-base uppercase ${status.tone}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  {status.text}
                </motion.span>
              </AnimatePresence>
              <span className="text-[#FF3D6E] [text-shadow:0_0_10px_rgba(255,61,110,0.5)]">
                7:45
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
