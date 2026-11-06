"use client";

import { AnimatePresence, animate, motion, useInView, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useId, useRef, useState } from "react";

import { splitClock } from "@/lib/time";

/** The alarm is set for 7:30 and can ring up to SPREAD minutes either side. */
const SET = 7 * 60 + 30;
const SPREAD = 15;
/** One LED per minute of the window. */
const N = SPREAD * 2 + 1;
/** The chase light bounces end to end, so one lap is out and back. */
const LAP = 2 * (N - 1);
/** The chase always runs at least this many steps, so every draw feels like a spin. */
const MIN_STEPS = 18;
/** How long a result stays up before the next draw. */
const HOLD_MS = 2800;
/** Phosphor afterglow: how long a segment or LED takes to fade once it goes dark. */
const DECAY_MS = 380;

const AMBER = "#FFC03D";

type Tone = { hex: string; dim: string; rgb: string };
const TONES = {
  early: { hex: "#34F5B0", dim: "#174A3E", rgb: "52,245,176" },
  late: { hex: "#FF3D6E", dim: "#5A1D36", rgb: "255,61,110" },
  center: { hex: "#FFFFFF", dim: "rgba(255,255,255,0.3)", rgb: "255,255,255" },
  rolling: { hex: AMBER, dim: AMBER, rgb: "255,192,61" },
} satisfies Record<string, Tone>;

const sideOf = (m: number) => (m < 0 ? TONES.early : m > 0 ? TONES.late : TONES.center);

/** Where the chase light is (0..N-1) at step `c` of its out-and-back lap. */
const lapPos = (c: number) => (c <= N - 1 ? c : LAP - c);

/** A new offset in [-SPREAD, SPREAD] at least 4 minutes from the last one. */
function nextOffset(prev: number) {
  let next = prev;
  while (Math.abs(next - prev) < 4) next = Math.round(Math.random() * SPREAD * 2) - SPREAD;
  return next;
}

/**
 * The bedside clock, take two: every few seconds it draws a new ring time. A chase light
 * runs along the LED meter, slowing like a prize wheel, with the digits following it, then
 * lands and rings.
 */
export function ShiftingClockV2() {
  const ref = useRef<HTMLDivElement>(null);
  const clockRef = useRef<HTMLDivElement>(null);
  const displayRef = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.4 });
  const reduce = useReducedMotion();

  // Index into the meter; SPREAD is 7:30. Starts there so server and client match.
  const [pos, setPos] = useState(SPREAD);
  const [rolling, setRolling] = useState(false);
  const [drawId, setDrawId] = useState(0);

  const lapRef = useRef(SPREAD);
  const rafRef = useRef(0);

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  /** The draw has landed: ring. */
  const land = useCallback(() => {
    setRolling(false);
    setDrawId((d) => d + 1);
    if (reduce) return;
    if (clockRef.current)
      animate(
        clockRef.current,
        { x: [0, -2, 2, -1, 1, 0], rotate: [0, -0.3, 0.3, -0.15, 0.15, 0] },
        { duration: 0.4, ease: "easeInOut" },
      );
    if (displayRef.current)
      animate(displayRef.current, { filter: ["brightness(1.8)", "brightness(1)"] }, { duration: 0.5, ease: "easeOut" });
  }, [reduce]);

  /** Spin the chase light to a new random time. */
  const draw = useCallback(() => {
    const c0 = lapRef.current;
    const target = nextOffset(lapPos(c0) - SPREAD) + SPREAD;

    if (reduce) {
      lapRef.current = target;
      setPos(target);
      land();
      return;
    }

    // Enough steps to feel like a spin, then on to wherever the target sits on the lap
    let steps = MIN_STEPS;
    while (lapPos((c0 + steps) % LAP) !== target) steps++;
    const duration = 650 + steps * 14;

    setRolling(true);
    const start = performance.now();
    let shown = 0;
    const frame = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      // Ease-out cubic: fast at first, then a long, teasing last step or two
      const step = Math.floor((1 - (1 - p) ** 3) * steps);
      if (step !== shown) {
        shown = step;
        setPos(lapPos((c0 + step) % LAP));
      }
      if (p < 1) {
        rafRef.current = requestAnimationFrame(frame);
      } else {
        lapRef.current = (c0 + steps) % LAP;
        land();
      }
    };
    rafRef.current = requestAnimationFrame(frame);
  }, [reduce, land]);

  // While on screen, draw again a few seconds after each landing
  useEffect(() => {
    if (!inView || rolling) return;
    const id = setTimeout(draw, drawId === 0 ? 1400 : HOLD_MS);
    return () => clearTimeout(id);
  }, [inView, rolling, drawId, draw]);

  const offset = pos - SPREAD;
  const tone = rolling ? TONES.rolling : sideOf(offset);
  const verdict = rolling ? "Rolling" : offset < 0 ? "Free snooze" : offset > 0 ? "Get up" : "On the dot";
  const status = rolling
    ? null
    : offset === 0
      ? "Right on time"
      : `${Math.abs(offset)} min ${offset < 0 ? "early" : "late"}`;

  return (
    <div ref={ref} className="relative mx-auto w-full max-w-xl">
      {/* Contact shadow where the clock sits on the table */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-[8%] -bottom-3 h-8 rounded-[50%] bg-[#432344]/30 blur-xl"
      />

      {/* Clock body: a plain white shell around the screen */}
      <div
        ref={clockRef}
        className="relative rounded-[2.25rem] bg-white p-3 ring-1 ring-foreground/10"
        style={{ boxShadow: "inset 0 -2px 0 rgba(67,35,68,0.05), 0 20px 34px -22px rgba(67,35,68,0.5)" }}
      >
        {/* Screen, recessed into the body */}
        <div
          className="relative overflow-hidden rounded-[1.5rem] px-5 pt-4 pb-4 text-white sm:px-9 sm:pt-5 sm:pb-5"
          style={{
            background: "radial-gradient(120% 100% at 50% 30%, #35193c 0%, #1f0d24 55%, #12061a 100%)",
            boxShadow: "inset 0 2px 12px rgba(0,0,0,0.75), inset 0 0 0 1px rgba(0,0,0,0.5)",
          }}
        >
          {/* The meter lighting the bottom of the glass, in the result's colour */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 transition-[background] duration-700"
            style={{
              background: `radial-gradient(55% 60% at 50% 100%, rgba(${tone.rgb},0.12), transparent 70%)`,
            }}
          />

          <p className="sr-only">
            The alarm is set for 7:30 AM and could ring any time from 7:15 to 7:45.
          </p>

          {/* Top annunciators: the alarm on the left, the verdict on the right */}
          <div
            aria-hidden
            className="relative flex items-center justify-between font-pixel text-[11px] tracking-[0.14em] uppercase sm:text-xs"
          >
            <span className="flex items-center gap-2 text-white/45">
              <motion.svg
                key={drawId}
                viewBox="0 0 7 7"
                className="h-3 w-3 origin-top"
                fill="currentColor"
                shapeRendering="crispEdges"
                initial={false}
                animate={drawId > 0 && !reduce ? { rotate: [0, -22, 18, -12, 7, -3, 0] } : undefined}
                transition={{ duration: 0.7, ease: "easeOut" }}
              >
                <path d="M3 0h1v1H3zM2 1h3v1H2zM1 2h5v3H1zM0 5h7v1H0zM3 6h1v1H3z" />
              </motion.svg>
              Alarm 7:30 AM
            </span>
            <span
              className="flex items-center gap-2 transition-colors duration-300"
              style={{ color: tone.hex, textShadow: `0 0 10px rgba(${tone.rgb},0.6)` }}
            >
              <span
                className={`size-1.5 rounded-[1px] ${rolling ? "lc-clock-blink" : ""}`}
                style={{ background: tone.hex, boxShadow: `0 0 8px rgba(${tone.rgb},0.9)` }}
              />
              {verdict}
            </span>
          </div>

          {/* Digits */}
          <div aria-hidden ref={displayRef} className="relative mt-3 flex justify-center sm:mt-4">
            <VfdDigits minutes={SET + offset} rolling={rolling} height="clamp(4.5rem, 20vw, 7rem)" />
          </div>

          {/* Where in the window it landed */}
          <div aria-hidden className="relative mt-3 sm:mt-4">
            <Meter pos={pos} rolling={rolling} drawId={drawId} reduce={!!reduce} />

            <div className="mt-3 flex items-center justify-between font-pixel text-sm">
              <span className="text-[#34F5B0]/80 [text-shadow:0_0_10px_rgba(52,245,176,0.45)]">7:15</span>
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={status ?? "rolling"}
                  className="text-base uppercase"
                  style={
                    status
                      ? { color: tone.hex, textShadow: `0 0 12px rgba(${tone.rgb},0.65)` }
                      : { color: "rgba(255,255,255,0.55)" }
                  }
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.16 }}
                >
                  {status ?? (
                    <>
                      Drawing
                      <span className="inline-block w-[1.6em] text-left">
                        {[0, 1, 2].map((i) => (
                          <span
                            key={i}
                            className="animate-[lc-blink_0.9s_ease-in-out_infinite]"
                            style={{ animationDelay: `${i * 0.15}s` }}
                          >
                            .
                          </span>
                        ))}
                      </span>
                    </>
                  )}
                </motion.span>
              </AnimatePresence>
              <span className="text-[#FF3D6E]/80 [text-shadow:0_0_10px_rgba(255,61,110,0.45)]">7:45</span>
            </div>
          </div>

          {/* Scanlines and a diagonal glare across the glass */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(to_bottom,rgba(255,255,255,0.025)_0_1px,transparent_1px_4px)]"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(112deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.025) 34%, transparent 34.3%)",
            }}
          />
        </div>
      </div>
    </div>
  );
}

/* ---------------- The LED meter ---------------- */

function Meter({ pos, rolling, drawId, reduce }: { pos: number; rolling: boolean; drawId: number; reduce: boolean }) {
  const offset = pos - SPREAD;
  const side = sideOf(offset);
  const at = `${((pos + 0.5) / N) * 100}%`;

  return (
    <div className="relative">
      {/* A pointer drops onto the result */}
      <div className="relative h-2.5">
        <AnimatePresence>
          {!rolling && drawId > 0 && (
            <motion.span
              key={drawId}
              className="absolute top-0 -ml-[5px] block"
              style={{ left: at }}
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.1 } }}
              transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 600, damping: 16 }}
            >
              <svg
                viewBox="0 0 10 6"
                className="block h-1.5 w-2.5"
                fill={side.hex}
                style={{ filter: `drop-shadow(0 0 4px rgba(${side.rgb},0.9))` }}
              >
                <path d="M0 0h10L5 6z" />
              </svg>
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-1 flex h-6 items-end gap-[3px]">
        {Array.from({ length: N }, (_, i) => {
          const m = i - SPREAD;
          const t = sideOf(m);
          const lit = i === pos;
          // After it lands, the LEDs between 7:30 and the result fill in, outward from the centre
          const trail = !rolling && offset !== 0 && (offset < 0 ? m > offset && m < 0 : m < offset && m > 0);
          const height = m === 0 ? "h-6" : m % 5 === 0 ? "h-[1.15rem]" : "h-3.5";

          const style = lit
            ? {
                backgroundColor: t.hex,
                boxShadow: `0 0 14px 2px rgba(${t.rgb},0.85), inset 0 1px 0 rgba(255,255,255,0.6)`,
                transition: "none",
              }
            : trail
              ? {
                  backgroundColor: `rgba(${t.rgb},0.6)`,
                  boxShadow: `0 0 6px 0 rgba(${t.rgb},0.4), inset 0 1px 0 rgba(255,255,255,0.18)`,
                  transition: `background-color 220ms ease-out ${Math.abs(m) * 26}ms, box-shadow 220ms ease-out ${Math.abs(m) * 26}ms`,
                }
              : {
                  backgroundColor: t.dim,
                  boxShadow: `0 0 0 0 rgba(${t.rgb},0), inset 0 1px 0 rgba(255,255,255,0.06)`,
                  // Lights fade rather than snap off, so the chase leaves a comet tail
                  transition: `background-color ${DECAY_MS}ms ease-out, box-shadow ${DECAY_MS}ms ease-out`,
                };

          return <span key={m} className={`relative flex-1 rounded-[2px] ${height}`} style={style} />;
        })}
      </div>
    </div>
  );
}

/* ---------------- Vacuum-fluorescent digits ---------------- */

/** Digit cell in SVG units. */
const W = 50;
const H = 92;
const T = 10; // segment thickness
const G = 1.5; // gap between segments
const h = T / 2;

const hSeg = (x1: number, x2: number, y: number) =>
  `${x1},${y} ${x1 + h},${y - h} ${x2 - h},${y - h} ${x2},${y} ${x2 - h},${y + h} ${x1 + h},${y + h}`;
const vSeg = (x: number, y1: number, y2: number) =>
  `${x},${y1} ${x + h},${y1 + h} ${x + h},${y2 - h} ${x},${y2} ${x - h},${y2 - h} ${x - h},${y1 + h}`;

const SEG = {
  a: hSeg(h + G, W - h - G, h),
  b: vSeg(W - h, h + G, H / 2 - G),
  c: vSeg(W - h, H / 2 + G, H - h - G),
  d: hSeg(h + G, W - h - G, H - h),
  e: vSeg(h, H / 2 + G, H - h - G),
  f: vSeg(h, h + G, H / 2 - G),
  g: hSeg(h + G, W - h - G, H / 2),
} as const;
type SegName = keyof typeof SEG;
const ALL = Object.keys(SEG) as SegName[];
const DIGITS = ["abcdef", "bc", "abdeg", "abcdg", "bcfg", "acdfg", "acdefg", "abc", "abcdefg", "abcdfg"];

const GAP = 13;
const COLON_W = 20;
const SLOTS = [0, W + GAP, 2 * W + 2 * GAP + COLON_W, 3 * W + 3 * GAP + COLON_W];
const COLON_X = (SLOTS[1] + W + SLOTS[2]) / 2;
const AMPM_X = SLOTS[3] + W + 15;

/** Lit instantly, fading slowly when switched off, like phosphor. */
const phosphor = (on: boolean) => ({
  opacity: on ? 1 : 0,
  transition: on ? "opacity 40ms linear" : `opacity ${DECAY_MS}ms cubic-bezier(0.2, 0.7, 0.3, 1)`,
});

/**
 * A seven-segment display drawn like a vacuum-fluorescent tube: amber phosphor with a soft
 * bloom, a fine mesh over it, and segments that glow on briefly after they switch off, so a
 * fast roll smears into a blur of light.
 */
function VfdDigits({ minutes, rolling, height }: { minutes: number; rolling: boolean; height: string }) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const { h12, minute, pm } = splitClock(minutes);
  const digits = [h12 >= 10 ? 1 : null, h12 % 10, Math.floor(minute / 10), minute % 10];
  // Drop the empty leading digit so "7:30" sits centred
  const first = digits[0] === null ? 1 : 0;
  const minX = SLOTS[first] - 18;
  const maxX = AMPM_X + 32;

  const lit = (fill: string) => (
    <g fill={fill}>
      {SLOTS.map((x, i) =>
        i < first ? null : (
          <g key={i} transform={`translate(${x} 0)`}>
            {ALL.map((s) => {
              const d = digits[i];
              return <polygon key={s} points={SEG[s]} style={phosphor(d !== null && DIGITS[d].includes(s))} />;
            })}
          </g>
        ),
      )}
      <g className={rolling ? undefined : "lc-clock-blink"}>
        <rect x={COLON_X - 5} y={23} width={10} height={10} rx={2.5} />
        <rect x={COLON_X - 5} y={55} width={10} height={10} rx={2.5} />
      </g>
      <text x={AMPM_X} y={30} fontSize={15} fontWeight={700} style={{ ...phosphor(!pm), fontFamily: "var(--font-geist-sans)" }}>
        AM
      </text>
      <text x={AMPM_X} y={56} fontSize={15} fontWeight={700} style={{ ...phosphor(pm), fontFamily: "var(--font-geist-sans)" }}>
        PM
      </text>
    </g>
  );

  return (
    <div className="relative">
      <svg
        viewBox={`${minX} -8 ${maxX - minX} 104`}
        className="block overflow-visible"
        style={{ height, width: "auto" }}
      >
        <defs>
          <linearGradient id={`${id}-lit`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FFE9A8" />
            <stop offset="0.45" stopColor="#FFC03D" />
            <stop offset="1" stopColor="#FF9E1F" />
          </linearGradient>
          <filter id={`${id}-bloom`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="near" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="11" result="far" />
            <feMerge>
              <feMergeNode in="far" />
              <feMergeNode in="near" />
            </feMerge>
          </filter>
          {/* The fine wire mesh in front of a VFD's phosphor */}
          <pattern id={`${id}-mesh`} width="3" height="3" patternUnits="userSpaceOnUse">
            <circle cx="1.5" cy="1.5" r="0.5" fill="rgba(40,12,30,0.28)" />
          </pattern>
        </defs>
        <g transform="skewX(-7)">
          {/* Unlit segments, faintly visible through the glass */}
          <g fill="rgba(255,255,255,0.055)">
            {SLOTS.slice(first).map((x) => (
              <g key={x} transform={`translate(${x} 0)`}>
                {ALL.map((s) => (
                  <polygon key={s} points={SEG[s]} />
                ))}
              </g>
            ))}
            <text x={AMPM_X} y={30} fontSize={15} fontWeight={700} style={{ fontFamily: "var(--font-geist-sans)" }}>
              AM
            </text>
            <text x={AMPM_X} y={56} fontSize={15} fontWeight={700} style={{ fontFamily: "var(--font-geist-sans)" }}>
              PM
            </text>
          </g>
          {/* Bloom underneath, then the crisp phosphor on top */}
          <g filter={`url(#${id}-bloom)`} opacity={0.75}>
            {lit(AMBER)}
          </g>
          {lit(`url(#${id}-lit)`)}
          {lit(`url(#${id}-mesh)`)}
        </g>
      </svg>
    </div>
  );
}
