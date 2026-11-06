"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { ROLL_MS } from "@/components/alarm-reveal";
import { Cloud, SunFace } from "@/components/scenes/sunrise-art";
import { Village, type RoosterPose } from "@/components/scenes/sunrise-village";
import type { SceneMood } from "@/components/scenes/types";
import { css, cssA, MAX_RANGE, rampN } from "@/lib/themes";

/**
 * Classic's background: a sunrise that plays out across the bet, over a village that wakes
 * up with it (see sunrise-village.tsx).
 *
 *   0 min     pre-dawn: a few stars, pale clouds, the village asleep
 *   1–11      first light: the stars fade, the horizon starts to glow, the first lights on
 *   12–23     golden morning: clouds catch the light, the first birds, chimneys smoking
 *   24–35     warm: more birds, the horizon burns brighter
 *   36–45     blazing: glints across the sky, a full flock, the rooster crowing
 *
 * Purely decorative and pointer-transparent; the hero draws the sky gradient itself.
 */

type Props = {
  /** Bet as a fraction of the maximum, 0..1. */
  p: number;
  /** Bet tier, 0 (no gamble) to 5 (the full 45). */
  tier: number;
  mood: SceneMood;
};

/** Deterministic layout, so server and browser render the same sky. */
const CLOUDS = [
  { top: 9, w: 230, dur: 140, delay: -20, depth: 1 },
  { top: 24, w: 140, dur: 95, delay: -70, depth: 0.6 },
  { top: 47, w: 280, dur: 170, delay: -120, depth: 1 },
  { top: 17, w: 110, dur: 85, delay: -10, depth: 0.5 },
  { top: 64, w: 190, dur: 150, delay: -45, depth: 0.8 },
  { top: 36, w: 160, dur: 120, delay: -95, depth: 0.7 },
];

const BIRDS = [
  { top: 15, dur: 21, delay: -4, size: 26 },
  { top: 19, dur: 21, delay: -4.6, size: 18 },
  { top: 30, dur: 26, delay: -15, size: 22 },
  { top: 11, dur: 18, delay: -11, size: 16 },
  { top: 33, dur: 26, delay: -15.5, size: 15 },
  { top: 24, dur: 23, delay: -19, size: 20 },
  { top: 8, dur: 19, delay: -1, size: 14 },
];
/** How many birds are up at each tier. */
const BIRDS_AT = [0, 0, 2, 3, 5, 7];

const STARS = [
  { x: 6, y: 10, r: 1.6, d: 0 },
  { x: 15, y: 6, r: 1.1, d: 1.2 },
  { x: 19, y: 22, r: 1.3, d: 0.5 },
  { x: 4, y: 28, r: 1, d: 2.1 },
  { x: 84, y: 9, r: 1.4, d: 0.8 },
  { x: 92, y: 20, r: 1.1, d: 1.7 },
  { x: 77, y: 15, r: 0.9, d: 2.6 },
];

/** Four-point glints that wink across the sky once the bet gets hot. */
const GLINTS = [
  { x: 12, y: 40, s: 16, d: 0 },
  { x: 86, y: 34, s: 20, d: 0.7 },
  { x: 24, y: 62, s: 12, d: 1.4 },
  { x: 74, y: 58, s: 14, d: 0.3 },
  { x: 8, y: 74, s: 18, d: 1.1 },
  { x: 93, y: 70, s: 12, d: 1.8 },
  { x: 33, y: 18, s: 11, d: 2.2 },
  { x: 66, y: 12, s: 13, d: 0.9 },
];

/** A four-point sparkle on a 24-unit grid. */
const SPARKLE =
  "M12 0C12.8 7 17 11.2 24 12 17 12.8 12.8 17 12 24 11.2 17 7 12.8 0 12 7 11.2 11.2 7 12 0z";

const clamp = (n: number) => Math.max(0, Math.min(1, n));

export function SunriseScene({ p, tier, mood }: Props) {
  // A snooze puts the sky back to sleep a little; a late result burns hotter.
  const sun = clamp(mood === "win" ? p * 0.5 : mood === "loss" ? 0.35 + p : p);
  const night = clamp(1 - sun * 2.4);

  const bellyRGB = rampN(
    ["#ECEEFA", "#F8E2EA", "#FFD8C4", "#FFCBAE", "#FFBD9A"],
    sun,
  );
  const cloudBelly = css(bellyRGB);
  // The upper band sits halfway between the belly and the cloud's cream top
  const cream = [255, 253, 248];
  const cloudBellyLight = `rgb(${bellyRGB.map((v, k) => Math.round((v + cream[k]) / 2)).join(",")})`;
  const horizon = rampN(["#FFD9C2", "#FFC79A", "#FFB070", "#FF9450"], sun);
  const birds =
    mood === "idle" ? BIRDS_AT[tier] : mood === "win" ? 0 : BIRDS_AT[tier];
  const glints =
    mood === "jackpot"
      ? GLINTS.length
      : tier >= 4 && mood !== "win"
        ? tier === 5
          ? GLINTS.length
          : 5
        : 0;

  // The village: asleep at no bet, up and about as it grows. While the draw rolls the windmill
  // spins like a loading wheel; a snooze sends everyone back to bed, a late result wakes the lot.
  const awake =
    mood === "win" ? 0 : mood === "loss" ? 1 : mood === "jackpot" ? Math.max(0.65, p) : p;
  const spin =
    mood === "win"
      ? 0
      : mood === "loss"
        ? 110
        : mood === "set"
          ? 85
          : mood === "jackpot"
            ? 40
            : 4 + p * p * 50;
  const pose: RoosterPose =
    mood === "win"
      ? "asleep"
      : mood === "loss"
        ? "crow"
        : mood === "jackpot"
          ? "proud"
          : mood === "set"
            ? "look"
            : tier === 0
              ? "asleep"
              : tier >= 4
                ? "crow"
                : "stand";

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Horizon glow: the sun about to break over the rail */}
      <div
        className="absolute inset-x-0 bottom-0 h-[70%]"
        style={{
          background: `radial-gradient(ellipse 65% 60% at 50% 100%, ${cssA(horizon, 0.18 + sun * 0.55)} 0%, ${cssA(horizon, 0.08 + sun * 0.2)} 45%, transparent 75%)`,
          transition: "background 600ms ease-out",
        }}
      />

      {/* Drifting clouds; their bellies catch the sunrise colour */}
      {CLOUDS.map((c, i) => (
        <div
          key={i}
          className="lc-drifter absolute left-0"
          style={{
            top: `${c.top}%`,
            ["--x" as string]: `${(i * 17 + 5) % 90}%`,
            animation: `lc-drift ${c.dur}s linear ${c.delay}s infinite`,
            opacity: 0.22 + c.depth * 0.2,
          }}
        >
          <Cloud
            shape={i}
            width={c.w}
            belly={cloudBelly}
            bellyLight={cloudBellyLight}
            id={`lc-cloud-${i}`}
          />
        </div>
      ))}

      {/* Pre-dawn stars, gone by first light */}
      <div
        className="absolute inset-0"
        style={{ opacity: night, transition: "opacity 500ms" }}
      >
        {STARS.map((s, i) => (
          <svg
            key={i}
            viewBox="0 0 24 24"
            className="absolute"
            style={{
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: s.r * 9,
              height: s.r * 9,
              animation: `lc-twinkle 3s ease-in-out ${s.d}s infinite`,
            }}
          >
            <path d={SPARKLE} fill="#C9A6D8" />
          </svg>
        ))}
      </div>

      {/* Morning birds: a pair at "Feeling lucky", a flock by the top tier */}
      <AnimatePresence>
        {BIRDS.slice(0, birds).map((b, i) => (
          <motion.div
            key={i}
            className="lc-drifter absolute left-0"
            style={{
              top: `${b.top}%`,
              ["--x" as string]: `${(i * 23 + 12) % 85}%`,
              animation: `lc-drift ${b.dur}s linear ${b.delay}s infinite`,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div
              style={{
                animation: `lc-bob ${(2.4 + i * 0.3).toFixed(1)}s ease-in-out infinite`,
              }}
            >
              <svg
                viewBox="0 0 24 10"
                width={b.size}
                height={(b.size * 10) / 24}
                fill="none"
                // White gulls: they read as sky, never as stray marks in the headline
                stroke="#FFFFFF"
                strokeWidth={2.2}
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  overflow: "visible",
                  transformOrigin: "50% 80%",
                  filter: "drop-shadow(0 1px 1.5px rgba(150,70,60,0.35))",
                  animation: `lc-flap ${(0.5 + (i % 3) * 0.08).toFixed(2)}s ease-in-out infinite`,
                }}
              >
                <path d="M1 7 Q6.5 0 12 8 Q17.5 0 23 7" />
              </svg>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Sun glints when things get hot */}
      <AnimatePresence>
        {GLINTS.slice(0, glints).map((g, i) => (
          <motion.svg
            key={i}
            viewBox="0 0 24 24"
            className="absolute"
            style={{ left: `${g.x}%`, top: `${g.y}%`, width: g.s, height: g.s }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            <path
              d={SPARKLE}
              fill="#FFFFFF"
              style={{
                transformOrigin: "50% 50%",
                filter: "drop-shadow(0 0 4px rgba(255,170,90,0.9))",
                animation: `lc-glint 2.4s ease-in-out ${g.d}s infinite`,
              }}
            />
          </motion.svg>
        ))}
      </AnimatePresence>

      <Village
        sun={sun}
        awake={Math.round(awake * 50) / 50}
        cascade={mood === "win" || mood === "loss" || mood === "jackpot"}
        spin={Math.round(spin)}
        pose={pose}
        rainbow={mood === "jackpot"}
        flush={mood === "loss"}
      />
    </div>
  );
}

/** How long the progress bar takes to fill (the hero starts it after the last group fades). */
const BAR_S = (ROLL_MS - 250) / 1000;

/**
 * "Rolling the dice", as a sunrise: the progress bar is the horizon, and the sun mascot comes up
 * from behind it as the bar fills. It starts out asleep, blinks awake halfway up and is smiling
 * by the time it clears the horizon; a warm glow spreads along the bar as it rises. Its rays turn
 * slowly the whole time, its face stays upright.
 */
export function SunRoll() {
  const [face, setFace] = useState(0);
  useEffect(() => {
    const wake = setTimeout(() => setFace(1), BAR_S * 450);
    const smile = setTimeout(() => setFace(2), BAR_S * 850);
    return () => {
      clearTimeout(wake);
      clearTimeout(smile);
    };
  }, []);
  const rise = { duration: BAR_S, ease: "easeInOut" } as const;
  return (
    // Clipped only along the bottom (the horizon), so the sun can rise up past the box
    <div aria-hidden className="relative h-12 w-40" style={{ clipPath: "inset(-90px -70px 0 -70px)" }}>
      {/* First light along the horizon */}
      <motion.div
        className="absolute -inset-x-10 bottom-0 h-[72px]"
        style={{ background: "radial-gradient(ellipse 50% 75% at 50% 100%, rgba(255,150,70,0.6), rgba(255,180,105,0.25) 55%, transparent 80%)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={rise}
      />
      <motion.div
        className="absolute bottom-0 left-1/2 -ml-9 h-[72px] w-[72px]"
        // Starts below the horizon; ends with its disc just clear of the bar
        initial={{ y: 76 }}
        animate={{ y: 14 }}
        transition={rise}
        // A warm shadow, so the pale sun stands out from the peach sky
        style={{ filter: "drop-shadow(0 2px 6px rgba(214,96,40,0.35))" }}
      >
        {/* Rays: the whole sun, slowly turning (its face is hidden under the still one) */}
        <div className="absolute inset-0" style={{ animation: "lc-spin 9s linear infinite" }}>
          <SunFace tier={face} className="block h-full w-full" />
        </div>
        {/* Face: the same sun cut down to its disc, kept upright; pops a little as it wakes */}
        <SunFace
          key={face}
          tier={face}
          className="absolute inset-0 block h-full w-full"
          style={{
            maskImage: SUN_DISC,
            WebkitMaskImage: SUN_DISC,
            animation: face ? "lc-sun-wake 0.35s ease-out" : undefined,
          }}
        />
      </motion.div>
    </div>
  );
}

/** The sun's disc (r 49 of a 180 box), clear of its rays (which start at r 56). */
const SUN_DISC = "radial-gradient(circle closest-side, #000 57%, transparent 58%)";

/**
 * The sun mascot beside the result badge, right on time only: it bounces with glee. (A snooze
 * and a late result get the shared Zs and ring marks, and the village's reaction.)
 */
export function SunVerdict({ mood, className }: { mood: SceneMood; className?: string }) {
  if (mood !== "jackpot") return null;
  const face = 3;
  const move = "lc-bob 0.9s ease-in-out 0.45s infinite";
  return (
    <span
      aria-hidden
      className={`pointer-events-none absolute block max-sm:hidden ${className ?? ""}`}
      style={{ marginRight: 4 }}
    >
      <span
        className="block"
        style={{ animation: "lc-mu-pop 0.45s cubic-bezier(0.2, 0.9, 0.3, 1.2) both" }}
      >
        <span className="block" style={{ transformOrigin: "50% 75%", animation: move }}>
          <SunFace tier={face} className="block h-14 w-14" />
        </span>
      </span>
    </span>
  );
}

/**
 * Classic's sun: a warm glow centred on the dial, drawn in the background layer so it sits
 * behind every control. From "Feeling lucky" up, a ring of soft rays fades in and turns faster
 * the bigger the bet. The rotation is accumulated per frame (not a CSS animation), so changing
 * speed never jumps. Fades out while the alarm is set.
 */
export function SunRays({
  p,
  range,
  visible,
  size,
}: {
  p: number;
  range: number;
  visible: boolean;
  /** Diameter of the dial it sits behind, in px. */
  size: number;
}) {
  const raysRef = useRef<HTMLDivElement>(null);
  const speed = useRef(0);
  speed.current = 3 + p * p * 42; // degrees per second

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let angle = 0;
    let last = performance.now();
    let id = requestAnimationFrame(function frame(now) {
      angle = (angle + ((now - last) / 1000) * speed.current) % 360;
      last = now;
      if (raysRef.current)
        raysRef.current.style.transform = `rotate(${angle.toFixed(2)}deg)`;
      id = requestAnimationFrame(frame);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const core = rampN(["#FFD9A8", "#FFC48A", "#FFA866", "#FF8A4A"], p);
  const rayColor = cssA(rampN(["#FFFFFF", "#FFF8EC", "#FFF1DC"], p), 0.5);
  const rays = Math.max(0, Math.min(1, (p - 0.25) / 0.6)) * 0.8;
  const allIn = range === MAX_RANGE;
  const rayMask =
    "radial-gradient(circle closest-side, transparent 52%, #000 60%, rgba(0,0,0,0.6) 78%, transparent 100%)";

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute -translate-1/2"
      style={{
        width: size * 1.9,
        height: size * 1.9,
        opacity: visible ? 1 : 0,
        transition: "opacity 400ms ease-out",
      }}
    >
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle, ${cssA(core, 0.45)} 0%, ${cssA(core, 0.14)} 36%, ${cssA(core, 0)} 62%)`,
          opacity: 0.55 + p * 0.45,
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          opacity: rays,
          transition: "opacity 300ms",
          animation: allIn ? "lc-pulse 1.4s ease-in-out infinite" : "none",
        }}
      >
        <div
          ref={raysRef}
          className="h-full w-full rounded-full"
          style={{
            background: `repeating-conic-gradient(from 0deg, ${rayColor} 0deg 6deg, transparent 6deg 20deg)`,
            maskImage: rayMask,
            WebkitMaskImage: rayMask,
          }}
        />
      </div>
    </div>
  );
}
