"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef } from "react";
import { Bat, MOON_SURFACE, StarArt } from "@/components/scenes/night-art";
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

  const cityGlow = rampN(["#5A3470", "#86396A", "#B4505E"], restless);
  const dawnGlow = "255,150,90";

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Glow over the city: violet when it's quiet, hot amber when nobody's sleeping */}
      <div
        className="absolute inset-x-0 bottom-0 h-[50%]"
        style={{
          background: `radial-gradient(ellipse 75% 55% at 50% 100%, ${cssA(cityGlow, 0.14 + restless * 0.14)} 0%, ${cssA(cityGlow, 0.04 + restless * 0.05)} 50%, transparent 78%)`,
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
                width: s.r * 11,
                height: s.r * 11,
                animation: `lc-twinkle ${s.dur}s ease-in-out ${s.delay}s infinite`,
              }}
            >
              <StarArt tint="#FFF1D6" />
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
              <Bat width={b.size} beat={0.34 + (i % 3) * 0.06} />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* The city: windows light up as the bet (and the insomnia) grows */}
      <Skyline lit={Math.round(windowsOn * 50) / 50} />
    </div>
  );
}

/**
 * The moon waxes from a thin crescent to full as the bet grows, and glows warmer. The unlit
 * part still shows, faintly (earthshine), and the lit face shades off towards its edge.
 */
function Moon({ phase, dawn }: { phase: number; dawn: number }) {
  // The shadow disc slides off the moon: at 2r apart, it's full.
  const r = 30;
  const shift = r * (0.42 + phase * 1.75);
  const fill = rampN(["#F4F0FF", "#FFF3DA", "#FFE7BC", "#FFD9A8"], phase);
  const limb = rampN(["#D9CFEA", "#EBD9BC", "#E8C9A0", "#E2B88E"], phase);
  const glow = 0.18 + phase * 0.3;
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
          {/* Lit from the upper right; darker towards the limb */}
          <radialGradient id="lc-night-moon-face" cx="0.58" cy="0.4" r="0.62">
            <stop offset="0" stopColor={css(fill)} />
            <stop offset="0.75" stopColor={css(fill)} />
            <stop offset="1" stopColor={css(limb)} />
          </radialGradient>
        </defs>
        {/* Earthshine: the dark side, only just there */}
        <circle
          cx="40"
          cy="40"
          r={r}
          fill="#C9B8FF"
          opacity={0.035 * (1 - phase)}
        />
        {/* The glow follows the lit part, two layers: a tight rim and a wide, faint bloom */}
        {/* (Filter on the outside: on the same element, the mask would clip the glow off) */}
        <g
          style={{
            filter: `drop-shadow(0 0 3px rgba(255,226,180,${(glow * 0.9).toFixed(2)})) drop-shadow(0 0 ${Math.round(10 + phase * 14)}px rgba(255,214,160,${glow.toFixed(2)}))`,
          }}
        >
          <g mask="url(#lc-night-moon)">
            <circle cx="40" cy="40" r={r} fill="url(#lc-night-moon-face)" />
            {/* Seas, crater rims and craters, as warm shading so they follow the moon's colour */}
            <g fill="#6E4A2C">
              <g opacity={MOON_SURFACE.maria.opacity}>
                {MOON_SURFACE.maria.d.map((d, i) => (
                  <path key={i} d={d} />
                ))}
              </g>
              {[MOON_SURFACE.rims, MOON_SURFACE.craters].map((set, k) => (
                <g key={k} opacity={set.opacity}>
                  {set.circles.map(([cx, cy, r], i) => (
                    <circle key={i} cx={cx} cy={cy} r={r} />
                  ))}
                </g>
              ))}
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
}

/**
 * The moon-phase ring round the dial, on a 200-unit box (the dial's edge is at ~53 from the
 * centre): eight little moons through one lunar cycle, the new moon at the bottom, waxing up
 * the left, full at the top, waning down the right.
 */
const PHASE_R = 4.2;
const PHASE_ORBIT = 61;
const PHASES = Array.from({ length: 8 }, (_, k) => {
  const a = ((90 + k * 45) * Math.PI) / 180;
  // They light up a step per bet tier, outward from the new moon in pairs, so the full moon
  // only comes on at the full 45 (12, 24, 36 and 45 minutes are the tier lines).
  const step = Math.min(k, 8 - k);
  const reveal = [0.001, 12 / 45, 24 / 45, 36 / 45, 1][step];
  return { k, x: 100 + Math.cos(a) * PHASE_ORBIT, y: 100 + Math.sin(a) * PHASE_ORBIT, reveal };
});

/**
 * The lit part of a moon at `f` through its cycle (0 new, 0.5 full), centred on (0, 0): the
 * bright limb is a half circle, closed by the terminator, a half ellipse that bulges out for a
 * crescent and in for a gibbous moon. Waxing moons are lit on the right; waning, the left.
 */
function litPath(f: number, r: number) {
  const waxing = f <= 0.5;
  const rx = Math.abs(Math.cos(2 * Math.PI * f)) * r;
  const gibbous = f > 0.25 && f < 0.75;
  const side = waxing ? 1 : 0;
  const term = gibbous === waxing ? 1 : 0;
  return `M0 ${-r}A${r} ${r} 0 0 ${side} 0 ${r}A${rx.toFixed(2)} ${r} 0 0 ${term} 0 ${-r}Z`;
}

/**
 * Night's counterpart to Classic's sun rays: moonlight on the dial. A soft glow that warms from
 * lavender to amber; a ring of moon phases that light up a step per bet tier, outward from the
 * new moon, until the full moon comes on at 45; the ring drifts slowly round (each moon stays
 * upright); and from about halfway, a pastel lunar corona. At 45 the full moon glows and the
 * corona breathes. Fades out while the alarm is set.
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
  speed.current = 1.2 + p * p * 3; // degrees per second

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let angle = 0;
    let last = performance.now();
    let id = requestAnimationFrame(function frame(now) {
      angle = (angle + ((now - last) / 1000) * speed.current) % 360;
      last = now;
      // The ring turns one way; each moon turns back, so its lit side stays put
      spinRef.current?.style.setProperty("--spin", `${angle.toFixed(2)}deg`);
      id = requestAnimationFrame(frame);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const glow = rampN(["#9E8CFF", "#C7A8FF", "#FFC9A0", "#FFB07A"], p);
  const corona = clamp((p - 0.4) / 0.5);
  const allIn = range === MAX_RANGE;
  // Moonlight warms with the bet, like the moon in the sky
  const lit = css(rampN(["#F4F0FF", "#FFF3DA", "#FFE7BC", "#FFD9A8"], p));

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
          background: `radial-gradient(circle, ${cssA(glow, 0.16)} 0%, ${cssA(glow, 0.05)} 36%, ${cssA(glow, 0)} 58%)`,
          opacity: 0.45 + p * 0.4,
        }}
      />
      {/* Lunar corona: soft pastel bands, violet inside to peach and rose outside */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          opacity: corona * 0.8,
          filter: "blur(10px)",
          background:
            "radial-gradient(circle, transparent 52%, rgba(176,160,255,0.11) 55.5%, rgba(255,218,176,0.09) 59.5%, rgba(255,150,170,0.05) 63.5%, transparent 69%)",
          animation: allIn ? "lc-corona 5s ease-in-out infinite" : "none",
          transition: "opacity 400ms",
        }}
      />
      {/* The phases, slowly drifting round the dial */}
      <div
        ref={spinRef}
        className="absolute inset-0"
        style={{ transform: "rotate(var(--spin, 0deg))" }}
      >
        <svg viewBox="0 0 200 200" className="h-full w-full" style={{ overflow: "visible" }}>
          {/* The orbit: a faint dotted track the moons ride on */}
          <circle
            cx="100"
            cy="100"
            r={PHASE_ORBIT}
            fill="none"
            stroke="#C9B8FF"
            strokeWidth={0.4}
            strokeLinecap="round"
            strokeDasharray="0.01 2.6"
            opacity={0.22 + p * 0.18}
          />
          {PHASES.map((m) => {
            const on = p >= m.reveal;
            const f = m.k / 8;
            const full = m.k === 4;
            return (
              <g key={m.k} transform={`translate(${m.x.toFixed(2)} ${m.y.toFixed(2)})`}>
                <g
                  style={{
                    transform: "rotate(calc(var(--spin, 0deg) * -1))",
                    transformBox: "fill-box",
                    transformOrigin: "center",
                  }}
                >
                  {/* Unlit: a faint shadow of the moon, waiting (the dark side, once it's lit) */}
                  <circle
                    r={PHASE_R}
                    fill="#C9B8FF"
                    fillOpacity={on ? 0.12 : 0.07}
                    style={{ transition: "fill-opacity 500ms" }}
                  />
                  {/* Lit: the bright part, popping in with a soft glow (bigger for the full moon) */}
                  <g
                    style={{
                      opacity: on ? 1 : 0,
                      transform: on ? "scale(1)" : "scale(0.6)",
                      transformBox: "fill-box",
                      transformOrigin: "center",
                      transition:
                        "opacity 450ms ease-out, transform 550ms cubic-bezier(0.3, 1.5, 0.5, 1)",
                      filter: `drop-shadow(0 0 ${full ? 4 : 2}px ${cssA(glow, full ? 0.85 : 0.5)})`,
                      animation: full && allIn ? "lc-corona 2.6s ease-in-out infinite" : undefined,
                    }}
                  >
                    {m.k === 0 ? (
                      // The new moon: no light, only a thin bright rim
                      <circle r={PHASE_R - 0.2} fill="none" stroke={lit} strokeWidth={0.45} strokeOpacity={0.75} />
                    ) : (
                      <path d={litPath(f, PHASE_R)} fill={lit} />
                    )}
                  </g>
                </g>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
