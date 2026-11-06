"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef } from "react";
import { Bat, MOON_CRATERS } from "@/components/scenes/night-art";
import { Skyline } from "@/components/scenes/night-skyline";
import { Cloud } from "@/components/scenes/sunrise-art";
import type { SceneMood } from "@/components/scenes/types";
import { frac } from "@/lib/rand";
import { css, cssA, MAX_RANGE, rampN } from "@/lib/themes";

/**
 * Night's background: a city night that gets more restless as the bet grows.
 *
 *   0 min     lights out: a thin crescent, a few stars, the city asleep
 *   1–11      restless: more stars, the odd window flicks on
 *   12–23     night owl: the moon fills out, bats come out
 *   24–35     midnight gamble: half the city's awake, the first shooting star
 *   36–45     insomnia → full moon madness: a full moon, a sky full of stars and streaks
 *
 * A snooze puts the city back to bed (lights off, moon wanes); a late result brings
 * the dawn up behind the skyline. Purely decorative and pointer-transparent.
 */

type Props = {
  /** Bet as a fraction of the maximum, 0..1. */
  p: number;
  /** Bet tier, 0 (no gamble) to 5 (the full 45). */
  tier: number;
  mood: SceneMood;
};

const clamp = (n: number) => Math.max(0, Math.min(1, n));

/** A four-point sparkle on a 24-unit grid. */
const SPARKLE =
  "M12 0C12.8 7 17 11.2 24 12 17 12.8 12.8 17 12 24 11.2 17 7 12.8 0 12 7 11.2 11.2 7 12 0z";

/** Stars come out in a fixed order (`order`), so the same ones are always first. */
const STARS = Array.from({ length: 72 }, (_, i) => ({
  x: frac(i, 21) * 100,
  y: frac(i, 22) * 70,
  r: 0.7 + frac(i, 23) * 1.5,
  delay: (frac(i, 24) * 4).toFixed(1),
  dur: (2.2 + frac(i, 25) * 3).toFixed(1),
  order: frac(i, 26),
  sparkle: frac(i, 27) > 0.88,
}));

/** Shooting stars: start points (as % of the hero) and their own rhythm. */
const SHOOTERS = [
  { left: 78, top: 8, dur: 7, delay: 1 },
  { left: 40, top: 4, dur: 9, delay: 4.5 },
  { left: 95, top: 22, dur: 8, delay: 2.8 },
  { left: 62, top: 14, dur: 11, delay: 7 },
  { left: 25, top: 10, dur: 10, delay: 5.6 },
];
const SHOOTERS_AT = [0, 0, 0, 1, 3, 5];

const BATS = [
  { top: 16, dur: 17, delay: -3, size: 30 },
  { top: 21, dur: 17, delay: -3.7, size: 22 },
  { top: 30, dur: 22, delay: -12, size: 26 },
  { top: 12, dur: 15, delay: -9, size: 18 },
  { top: 34, dur: 22, delay: -12.6, size: 18 },
  { top: 25, dur: 19, delay: -16, size: 24 },
  { top: 9, dur: 16, delay: -1, size: 16 },
];
const BATS_AT = [0, 0, 2, 3, 5, 7];

const CLOUDS = [
  { top: 12, w: 260, dur: 190, delay: -40, shape: 1 },
  { top: 30, w: 180, dur: 150, delay: -110, shape: 3 },
  { top: 52, w: 300, dur: 220, delay: -160, shape: 0 },
  { top: 22, w: 140, dur: 130, delay: -70, shape: 4 },
];

export function NightScene({ p, tier, mood }: Props) {
  // A snooze sends everyone back to bed; a late result is the sun coming up.
  const restless = clamp(mood === "win" ? p * 0.35 : p);
  const dawn = mood === "loss" ? 0.45 + p * 0.55 : 0;
  const starsOut = 0.18 + restless * 0.82;
  const windowsOn = 0.03 + restless * 0.6;
  const bats = mood === "win" ? 0 : BATS_AT[tier];
  const shooters = mood === "win" ? 0 : SHOOTERS_AT[tier];

  const cityGlow = rampN(["#6B3A7A", "#A2456E", "#E0705A"], restless);
  const dawnGlow = "255,150,90";

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Glow over the city: violet when it's quiet, hot amber when nobody's sleeping */}
      <div
        className="absolute inset-x-0 bottom-0 h-[60%]"
        style={{
          background: `radial-gradient(ellipse 70% 60% at 50% 100%, ${cssA(cityGlow, 0.18 + restless * 0.3)} 0%, ${cssA(cityGlow, 0.06 + restless * 0.1)} 50%, transparent 78%)`,
          transition: "background 600ms ease-out",
        }}
      />
      {/* Dawn creeping up behind the skyline (late results only) */}
      <div
        className="absolute inset-x-0 bottom-0 h-[55%]"
        style={{
          background: `radial-gradient(ellipse 80% 70% at 50% 100%, rgba(${dawnGlow},0.55) 0%, rgba(${dawnGlow},0.18) 45%, transparent 75%)`,
          opacity: dawn,
          transition: "opacity 900ms ease-out",
        }}
      />

      {/* Stars come out as the bet grows */}
      {STARS.map((s, i) => (
        <span
          key={i}
          className="absolute"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            opacity: s.order < starsOut ? 1 - dawn * 0.6 : 0,
            transition: "opacity 500ms",
          }}
        >
          {s.sparkle ? (
            <svg
              viewBox="0 0 24 24"
              className="block"
              style={{
                width: s.r * 8,
                height: s.r * 8,
                animation: `lc-twinkle ${s.dur}s ease-in-out ${s.delay}s infinite`,
              }}
            >
              <path d={SPARKLE} fill="#FFF1D6" />
            </svg>
          ) : (
            <span
              className="block rounded-full"
              style={{
                width: s.r * 2,
                height: s.r * 2,
                background: "#FFF4DE",
                boxShadow: "0 0 5px rgba(255,236,200,0.75)",
                animation: `lc-twinkle ${s.dur}s ease-in-out ${s.delay}s infinite`,
              }}
            />
          )}
        </span>
      ))}

      {/* Shooting stars, more of them the higher the bet */}
      {SHOOTERS.slice(0, shooters).map((s, i) => (
        <span
          key={i}
          className="absolute block h-[1.5px] w-[130px] rounded-full"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            background:
              "linear-gradient(90deg, #FFF6E2 0%, rgba(255,240,210,0.6) 25%, rgba(255,240,210,0) 100%)",
            boxShadow: "0 0 6px rgba(255,236,200,0.6)",
            opacity: 0,
            animation: `lc-shoot ${s.dur}s ease-out ${s.delay}s infinite`,
          }}
        />
      ))}

      <Moon phase={restless} dawn={dawn} />

      {/* Thin night clouds, drifting across the moon */}
      {CLOUDS.map((c, i) => (
        <div
          key={i}
          className="lc-drifter absolute left-0"
          style={{
            top: `${c.top}%`,
            ["--x" as string]: `${(i * 29 + 8) % 85}%`,
            animation: `lc-drift ${c.dur}s linear ${c.delay}s infinite`,
            opacity: 0.32,
          }}
        >
          <Cloud
            shape={c.shape}
            width={c.w}
            top="#3E2556"
            bellyLight="#4A2B60"
            belly="#57326A"
            id={`lc-night-cloud-${i}`}
          />
        </div>
      ))}

      {/* Bats from "Night owl" up */}
      <AnimatePresence>
        {BATS.slice(0, bats).map((b, i) => (
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
                animation: `lc-bob ${(1.8 + i * 0.25).toFixed(2)}s ease-in-out infinite`,
              }}
            >
              <Bat
                width={b.size}
                beat={0.34 + (i % 3) * 0.06}
                style={{ filter: "drop-shadow(0 0 3px rgba(255,214,170,0.25))" }}
              />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* The city: windows light up as the bet (and the insomnia) grows */}
      <Skyline lit={Math.round(windowsOn * 50) / 50} />
    </div>
  );
}


/** The moon waxes from a thin crescent to full as the bet grows, and glows warmer. */
function Moon({ phase, dawn }: { phase: number; dawn: number }) {
  // The shadow disc slides off the moon: at 2r apart, it's full.
  const r = 30;
  const shift = r * (0.42 + phase * 1.75);
  const fill = css(rampN(["#F4F0FF", "#FFF3DA", "#FFE7BC", "#FFD9A8"], phase));
  const glow = 0.35 + phase * 0.5;
  return (
    <div
      className="absolute top-[9%] right-[9%] max-sm:top-[7%] max-sm:right-[5%]"
      style={{ opacity: 1 - dawn * 0.7, transition: "opacity 900ms" }}
    >
      <svg
        viewBox="0 0 80 80"
        className="h-11 w-11 sm:h-24 sm:w-24"
        style={{ overflow: "visible" }}
      >
        <defs>
          <mask id="lc-night-moon">
            <circle cx="40" cy="40" r={r} fill="#fff" />
            {shift < r * 2 && (
              <circle
                cx={40 - shift}
                cy={40 - shift * 0.12}
                r={r}
                fill="#000"
              />
            )}
          </mask>
        </defs>
        <g
          mask="url(#lc-night-moon)"
          style={{
            filter: `drop-shadow(0 0 ${Math.round(8 + phase * 18)}px rgba(255,220,160,${glow.toFixed(2)}))`,
          }}
        >
          <circle cx="40" cy="40" r={r} fill={fill} />
          {/* Craters, as shading so they follow the moon's colour as it warms */}
          {MOON_CRATERS.map((c, i) => (
            <circle
              key={i}
              cx={c.cx}
              cy={c.cy}
              r={c.r}
              fill={c.deep ? "rgba(150,105,60,0.2)" : "rgba(150,105,60,0.15)"}
            />
          ))}
        </g>
      </svg>
    </div>
  );
}

/**
 * Constellations round the dial, on a 200-unit box (the dial's edge is at ~53 from the
 * centre): twelve stars in a ring, in three constellations of four, each with a branch star.
 */
const HALO = (() => {
  const ring = Array.from({ length: 12 }, (_, i) => {
    const a = ((i * 30 + (frac(i, 61) - 0.5) * 14 - 75) * Math.PI) / 180;
    const r = 58 + frac(i, 62) * 9;
    return { x: 100 + Math.cos(a) * r, y: 100 + Math.sin(a) * r, s: 2.6 + frac(i, 63) * 2.4 };
  });
  const branch = [0, 1, 2].map((g) => {
    const base = ring[g * 4 + 1];
    const a = Math.atan2(base.y - 100, base.x - 100) + 0.14;
    return { x: 100 + Math.cos(a) * 75, y: 100 + Math.sin(a) * 75, s: 2.2 };
  });
  const stars = [...ring, ...branch];
  const links: [number, number][] = [];
  for (let g = 0; g < 3; g++) {
    for (let k = 0; k < 3; k++) links.push([g * 4 + k, g * 4 + k + 1]);
    links.push([g * 4 + 1, 12 + g]);
  }
  // Stars come out a constellation at a time-ish, from ~8 min; the branch stars last, just before 45
  const reveal = stars.map((_, i) =>
    i < 12 ? 0.18 + ((i % 4) * 3 + Math.floor(i / 4)) * 0.055 : 0.86 + (i - 12) * 0.045,
  );
  return { stars, links, reveal };
})();

/**
 * Night's counterpart to Classic's sun rays: moonlight on the dial. A soft glow that warms from
 * lavender to amber; stars that gather round the dial and join up into constellations as the bet
 * grows, slowly wheeling (faster the bigger the bet); and from about halfway, a pastel lunar
 * corona. At 45 the stars align: every line is drawn, the stars twinkle and the corona breathes.
 * Fades out while the alarm is set.
 */
export function MoonHalo({
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
  const spinRef = useRef<HTMLDivElement>(null);
  const speed = useRef(0);
  speed.current = 1.5 + p * p * 7; // degrees per second

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let angle = 0;
    let last = performance.now();
    let id = requestAnimationFrame(function frame(now) {
      angle = (angle + ((now - last) / 1000) * speed.current) % 360;
      last = now;
      if (spinRef.current) spinRef.current.style.transform = `rotate(${angle.toFixed(2)}deg)`;
      id = requestAnimationFrame(frame);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const glow = rampN(["#9E8CFF", "#C7A8FF", "#FFC9A0", "#FFB07A"], p);
  const corona = clamp((p - 0.4) / 0.5);
  const allIn = range === MAX_RANGE;

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
      {/* Moonlight */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle, ${cssA(glow, 0.3)} 0%, ${cssA(glow, 0.1)} 36%, ${cssA(glow, 0)} 60%)`,
          opacity: 0.5 + p * 0.5,
        }}
      />
      {/* Lunar corona: soft pastel bands, violet inside to peach and rose outside */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          opacity: corona,
          filter: "blur(6px)",
          background:
            "radial-gradient(circle, transparent 51%, rgba(176,160,255,0.26) 55%, rgba(255,218,176,0.22) 59.5%, rgba(255,150,170,0.14) 64%, transparent 70%)",
          animation: allIn ? "lc-pulse 2.6s ease-in-out infinite" : "none",
          transition: "opacity 400ms",
        }}
      />
      {/* The constellations, slowly wheeling round the dial */}
      <div ref={spinRef} className="absolute inset-0">
        <svg viewBox="0 0 200 200" className="h-full w-full" style={{ overflow: "visible" }}>
          {HALO.links.map(([a, b], i) => {
            const on = p >= Math.max(HALO.reveal[a], HALO.reveal[b]);
            const s = HALO.stars;
            return (
              <line
                key={i}
                x1={s[a].x}
                y1={s[a].y}
                x2={s[b].x}
                y2={s[b].y}
                stroke="#FFE9C8"
                strokeWidth={0.5}
                strokeLinecap="round"
                opacity={on ? (allIn ? 0.48 : 0.28) : 0}
                style={{ transition: "opacity 500ms" }}
              />
            );
          })}
          {HALO.stars.map((s, i) => (
            <g
              key={i}
              transform={`translate(${(s.x - s.s).toFixed(2)} ${(s.y - s.s).toFixed(2)}) scale(${(s.s / 12).toFixed(3)})`}
              opacity={p >= HALO.reveal[i] ? 1 : 0}
              style={{ transition: "opacity 500ms" }}
            >
              <path
                d={SPARKLE}
                fill="#FFF3DC"
                style={{
                  transformBox: "fill-box",
                  transformOrigin: "center",
                  filter: "drop-shadow(0 0 3px rgba(255,226,180,0.9))",
                  animation: allIn
                    ? `lc-halo-twinkle ${(1.1 + frac(i, 65)).toFixed(2)}s ease-in-out ${(frac(i, 64) * 1.5).toFixed(2)}s infinite`
                    : "none",
                }}
              />
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
