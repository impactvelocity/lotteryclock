"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef } from "react";
import {
  Calaverita,
  Candle,
  CandleDefs,
  FLAG_DESIGNS,
  Headstone,
  Marigold,
  Monarch,
  MU,
  PapelFlag,
  Petal,
} from "@/components/scenes/muertos-art";
import { BLOOM_RINGS } from "@/components/scenes/muertos-svg";
import type { SceneMood } from "@/components/scenes/types";
import { frac } from "@/lib/rand";
import { cssA, MAX_RANGE, rampN } from "@/lib/themes";

/**
 * Día de Muertos' background: an ofrenda by candlelight that comes alive as the bet grows.
 *
 *   0 min     rest in peace: one candle each side, a few flags, a quiet sky
 *   1–11      light a candle: more candles, the first petals drift down
 *   12–23     follow the marigolds: petals fall steadily, a monarch arrives
 *   24–35     dance with the dead: a second string of papel picado, more monarchs
 *   36–45     raise the spirits → back from the dead: every candle blazing, a petal storm,
 *             a flight of monarchs, the flags flapping in the wind
 *
 * A snooze lets everyone rest (candles out, souls gone); a late result flares every candle.
 * Purely decorative and pointer-transparent.
 */

type Props = {
  /** Bet as a fraction of the maximum, 0..1. */
  p: number;
  /** Bet tier, 0 (no gamble) to 5 (the full 45). */
  tier: number;
  mood: SceneMood;
};

const clamp = (n: number) => Math.max(0, Math.min(1, n));

const SPARKLE =
  "M12 0C12.8 7 17 11.2 24 12 17 12.8 12.8 17 12 24 11.2 17 7 12.8 0 12 7 11.2 11.2 7 12 0z";

const STARS = Array.from({ length: 44 }, (_, i) => ({
  x: frac(i, 51) * 100,
  y: 6 + frac(i, 52) * 60,
  r: 0.7 + frac(i, 53) * 1.4,
  delay: (frac(i, 54) * 4).toFixed(1),
  dur: (2.4 + frac(i, 55) * 3).toFixed(1),
  order: frac(i, 56),
  sparkle: frac(i, 57) > 0.8,
}));

const FLAG_COLORS = [MU.rose, MU.orange, MU.teal, MU.marigold, MU.purple, MU.sky];

/**
 * Two strings of papel picado per side. y values are on a 220-unit tall box (px on desktop);
 * below `lg` the box squashes to fit the gap between the header and the heading.
 */
const SWAG_H = 220;
const STRINGS = [
  { y0: 0, yc: 90, y1: 0, x1: 100, flags: 7, scale: 1, from: 0 },
  { y0: 104, yc: 158, y1: 76, x1: 80, flags: 6, scale: 0.82, from: 3 },
];

function bezier(a: number, c: number, b: number, t: number) {
  return (1 - t) * (1 - t) * a + 2 * t * (1 - t) * c + t * t * b;
}

const PETAL_COLORS = [MU.marigold, MU.orange, "#FFB53A", MU.rose, MU.orange];
const PETALS = Array.from({ length: 28 }, (_, i) => ({
  left: frac(i, 61) * 100,
  size: Math.round(7 + frac(i, 62) * 7),
  dur: (9 + frac(i, 63) * 8).toFixed(1),
  // Negative delays, so the sky's already mid-fall when the theme opens
  delay: (-frac(i, 64) * 17).toFixed(1),
  spin: (2.5 + frac(i, 65) * 3).toFixed(1),
  dx: Math.round(-40 + frac(i, 66) * 120),
  color: PETAL_COLORS[i % PETAL_COLORS.length],
  order: frac(i, 67),
}));

const MONARCHS = [
  { top: 34, dur: 24, delay: -5, size: 42, flap: 0.34 },
  { top: 46, dur: 28, delay: -14, size: 34, flap: 0.3 },
  { top: 24, dur: 21, delay: -9, size: 30, flap: 0.28 },
  { top: 55, dur: 30, delay: -20, size: 40, flap: 0.36 },
  { top: 40, dur: 26, delay: -2, size: 28, flap: 0.26 },
  { top: 30, dur: 23, delay: -17, size: 36, flap: 0.32 },
  { top: 62, dur: 27, delay: -11, size: 30, flap: 0.29 },
];
const MONARCHS_AT = [0, 0, 1, 3, 5, 7];

/**
 * One side of the ofrenda, on a 420 × 130 grid with the ground at y = 126. The right side
 * is the same altar mirrored (ofrendas are symmetric); `on` is when each candle lights, as a
 * share of the bet, so the two sides light up in a different order.
 */
const GROUND = 126;
const CANDLES = [
  { x: 24, h: 40, s: 1, on: [0.05, 0.33] },
  { x: 92, h: 62, s: 1.15, on: [0.5, 0.1] },
  { x: 130, h: 34, s: 0.9, on: [0.75, 0.85] },
  { x: 214, h: 50, s: 1.05, on: [0.25, 0.55] },
  { x: 300, h: 30, s: 0.85, on: [0.9, 0.7] },
  { x: 346, h: 54, s: 1, on: [0.4, 0.2] },
  { x: 398, h: 26, s: 0.8, on: [0.62, 0.95] },
].map((c, i) => ({
  ...c,
  dur: +(1.1 + frac(i, 71) * 0.9).toFixed(2),
  delay: +(-frac(i, 72) * 2).toFixed(2),
}));

function Ofrenda({ side, lit, flare }: { side: 0 | 1; lit: number; flare: number }) {
  const defs = `lc-mu-candle-${side}`;
  return (
    <svg
      aria-hidden
      viewBox="0 0 420 130"
      className="block h-auto w-full"
      style={{ overflow: "visible" }}
    >
      <defs>
        <CandleDefs id={defs} />
      </defs>
      {/* Back row: headstones */}
      <Headstone x={52} y={GROUND} s={1.45} cross />
      <Headstone x={262} y={GROUND} s={1.05} />
      {/* Candles */}
      {CANDLES.map((c, i) => (
        <Candle
          key={i}
          x={c.x}
          y={GROUND}
          h={c.h}
          s={c.s}
          lit={c.on[side] < lit}
          flare={flare}
          dur={c.dur}
          delay={c.delay}
          defs={defs}
        />
      ))}
      <Calaverita x={168} y={GROUND - 17 * 1.25} s={1.25} />
      {/* Front row: marigolds */}
      <Marigold x={56} y={118} s={0.9} />
      <Marigold x={118} y={121} s={0.6} />
      <Marigold x={184} y={121} s={0.72} />
      <Marigold x={252} y={117} s={1} />
      <Marigold x={320} y={120} s={0.7} />
      <Marigold x={376} y={119} s={0.82} />
    </svg>
  );
}

/** One side's papel picado: up to two strings of flags, hung under the header. */
function PapelPicado({ side, p, tier, windy }: { side: 0 | 1; p: number; tier: number; windy: boolean }) {
  const shown = 0.62 + p * 0.38;
  return (
    <div
      className="absolute top-[62px] h-[56px] w-[clamp(150px,21vw,340px)] lg:top-[84px] lg:h-[220px]"
      style={side === 0 ? { left: 0 } : { right: 0, transform: "scaleX(-1)" }}
    >
      {STRINGS.map((str, si) => {
        const on = tier >= str.from;
        return (
          <div
            key={si}
            // Phones and tablets only have room for the first string
            className={`absolute inset-0 ${si > 0 ? "max-lg:hidden" : ""}`}
            style={{ opacity: on ? 1 : 0, transition: "opacity 500ms ease-out" }}
          >
            {/* The string, drawn in % across and box units down */}
            <svg
              viewBox={`0 0 100 ${SWAG_H}`}
              preserveAspectRatio="none"
              className="absolute inset-0 h-full w-full"
              style={{ overflow: "visible" }}
            >
              <path
                d={`M-2 ${str.y0} Q${(str.x1 - 2) / 2} ${str.yc} ${str.x1} ${str.y1}`}
                fill="none"
                stroke="rgba(246,235,211,0.5)"
                strokeWidth={1.2}
                vectorEffect="non-scaling-stroke"
              />
            </svg>
            {/* The pin it hangs from */}
            <span
              className="absolute block h-[5px] w-[5px] -translate-1/2 rounded-full"
              style={{ left: `${str.x1}%`, top: `${(str.y1 / SWAG_H) * 100}%`, background: "rgba(246,235,211,0.7)" }}
            />
            {Array.from({ length: str.flags }, (_, i) => {
              const t = (i + 0.5) / str.flags;
              const x = -2 + (str.x1 + 2) * t;
              const y = bezier(str.y0, str.yc, str.y1, t);
              // Lean with the string's slope (assuming a ~300px wide swag)
              const slope = 2 * (1 - t) * (str.yc - str.y0) + 2 * t * (str.y1 - str.yc);
              const lean = (Math.atan2(slope, 3 * (str.x1 + 2)) * 180) / Math.PI;
              const k = i + si * 3 + side * 2;
              const visible = frac(i + si * 11, 81 + side) < shown;
              return (
                <div
                  key={i}
                  className="absolute"
                  style={{
                    left: `${x.toFixed(2)}%`,
                    top: `calc(${((y / SWAG_H) * 100).toFixed(2)}% - 1px)`,
                    width: `calc(clamp(18px, 2.7vw, 36px) * ${str.scale})`,
                    transform: `translateX(-50%) rotate(${lean.toFixed(1)}deg)`,
                    transformOrigin: "50% 0",
                    opacity: visible ? 0.93 : 0,
                    transition: "opacity 400ms ease-out",
                  }}
                >
                  <div
                    style={{
                      transformOrigin: "50% 0",
                      animation: `lc-sway ${(2.6 + frac(k, 83) * 1.6).toFixed(2)}s ease-in-out ${(-frac(k, 84) * 3).toFixed(2)}s infinite`,
                    }}
                  >
                    <div
                      style={{
                        transformOrigin: "50% 0",
                        animation: windy
                          ? `lc-flutter ${(0.5 + frac(k, 85) * 0.3).toFixed(2)}s ease-in-out infinite`
                          : "none",
                      }}
                    >
                      <PapelFlag
                        design={FLAG_DESIGNS[k % FLAG_DESIGNS.length]}
                        color={FLAG_COLORS[(i + si * 2 + side * 3) % FLAG_COLORS.length]}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

export function MuertosScene({ p, tier, mood }: Props) {
  // A snooze lets the dead rest; a late result wakes every candle at once.
  const lively = clamp(mood === "win" ? p * 0.25 : p);
  const lit = mood === "loss" ? 1.01 : mood === "win" ? 0.08 : 0.15 + lively * 0.86;
  const flare = mood === "loss" ? 1.3 : 0.85 + lively * 0.3;
  const starsOut = 0.3 + lively * 0.7;
  const petals = mood === "win" ? 0 : mood === "loss" ? 1 : p === 0 ? 0 : 0.15 + p * 0.85;
  const monarchs =
    mood === "win" ? 0 : mood === "jackpot" ? MONARCHS.length : MONARCHS_AT[tier];
  const glow = 0.1 + lively * 0.22 + (mood === "loss" ? 0.2 : 0);
  const glowRGB = rampN(["#FF9A3D", "#FF7A2E", "#F0446E"], lively);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Candlelight warming the bottom of the sky */}
      <div
        className="absolute inset-x-0 bottom-0 h-[55%]"
        style={{
          background: `radial-gradient(ellipse 75% 70% at 50% 100%, ${cssA(glowRGB, glow)} 0%, ${cssA(glowRGB, glow * 0.35)} 45%, transparent 78%)`,
          transition: "background 600ms ease-out",
        }}
      />

      {/* Stars and sparkles */}
      {STARS.map((s, i) => (
        <span
          key={i}
          className="absolute"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            opacity: s.order < starsOut ? 0.9 : 0,
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
                boxShadow: "0 0 5px rgba(255,236,200,0.6)",
                animation: `lc-twinkle ${s.dur}s ease-in-out ${s.delay}s infinite`,
              }}
            />
          )}
        </span>
      ))}

      {/* Papel picado, strung across both top corners */}
      <PapelPicado side={0} p={p} tier={tier} windy={tier >= 4 || mood === "loss"} />
      <PapelPicado side={1} p={p} tier={tier} windy={tier >= 4 || mood === "loss"} />

      {/* Marigold petals drifting down: the path that guides the souls home */}
      {PETALS.map((pt, i) => (
        <div
          key={i}
          className="lc-petal absolute top-0"
          style={{
            left: `${pt.left}%`,
            opacity: pt.order < petals ? 1 : 0,
            transition: "opacity 700ms",
          }}
        >
          <div
            style={{
              ["--dx" as string]: `${pt.dx}px`,
              animation: `lc-petal-fall ${pt.dur}s linear ${pt.delay}s infinite`,
            }}
          >
            <div style={{ animation: `lc-tumble ${pt.spin}s linear infinite` }}>
              <Petal size={pt.size} color={pt.color} />
            </div>
          </div>
        </div>
      ))}

      {/* Monarchs: the souls coming home */}
      <AnimatePresence>
        {MONARCHS.slice(0, monarchs).map((m, i) => (
          <motion.div
            key={i}
            className="lc-drifter absolute left-0"
            style={{
              top: `${m.top}%`,
              ["--x" as string]: `${(i * 31 + 9) % 85}%`,
              animation: `lc-drift ${m.dur}s linear ${m.delay}s infinite`,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div
              style={{
                animation: `lc-flit ${(2.4 + i * 0.3).toFixed(2)}s ease-in-out infinite`,
              }}
            >
              <div
                style={{
                  transform: "rotate(62deg)",
                  filter: "drop-shadow(0 0 4px rgba(255,170,80,0.35))",
                }}
              >
                <Monarch size={m.size} flap={m.flap} />
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* The ofrenda: candles, marigolds and calaveras on both sides, the middle left clear
          for the tier label and the Set alarm button */}
      <div
        className="absolute bottom-0 left-0 w-[38%] max-w-[440px]"
        style={{ maskImage: OFRENDA_MASK, WebkitMaskImage: OFRENDA_MASK }}
      >
        <Ofrenda side={0} lit={lit} flare={flare} />
      </div>
      <div
        className="absolute right-0 bottom-0 w-[38%] max-w-[440px]"
        style={{
          transform: "scaleX(-1)",
          maskImage: OFRENDA_MASK,
          WebkitMaskImage: OFRENDA_MASK,
        }}
      >
        <Ofrenda side={1} lit={lit} flare={flare} />
      </div>
    </div>
  );
}

const OFRENDA_MASK = "linear-gradient(90deg, #000 0%, #000 82%, transparent 100%)";

/** The petal rings of marigold-bloom.svg, back to front, and how fast and which way each turns. */
const BLOOM = [
  { art: BLOOM_RINGS[0], dir: 1 },
  { art: BLOOM_RINGS[1], dir: -0.7 },
  { art: BLOOM_RINGS[2], dir: 0.45 },
];
const BLOOM_DOTS = Array.from({ length: 30 }, (_, i) => {
  const a = (i * 12 * Math.PI) / 180;
  return {
    x: Math.round((100 + 64 * Math.sin(a)) * 100) / 100,
    y: Math.round((100 - 64 * Math.cos(a)) * 100) / 100,
    fill: i % 2 ? MU.bone : MU.marigold,
    delay: ((i % 5) * 0.4).toFixed(1),
  };
});

/**
 * Día de Muertos' counterpart to Classic's sun rays: the dial becomes the heart of a giant
 * cempasúchil, like the scalloped flower round a sugar skull's eye. Three rings of petals peek
 * out round the dial, turning against each other, faster and brighter the bigger the bet,
 * with a ring of dots beyond. Fades out while the alarm is set.
 */
export function MarigoldBloom({
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
  const rings = useRef<(SVGGElement | null)[]>([]);
  const speed = useRef(0);
  speed.current = 2 + p * p * 28; // degrees per second

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let angle = 0;
    let last = performance.now();
    let id = requestAnimationFrame(function frame(now) {
      angle = (angle + ((now - last) / 1000) * speed.current) % 3600;
      last = now;
      BLOOM.forEach((b, i) => {
        rings.current[i]?.setAttribute("transform", `rotate(${(angle * b.dir).toFixed(2)} 100 100)`);
      });
      id = requestAnimationFrame(frame);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const allIn = range === MAX_RANGE;
  const warm = rampN(["#FFB347", "#FF8A3D", "#F0446E"], p);
  // Opens up with the bet: a bud peeking out round the dial at 0, in full bloom at 45. Capped
  // at 0.94 so the petals and dots stay clear of the labels either side and below. All in, it
  // beats: the pulse (up to × 1.07) starts small enough to peak at that same cap.
  const scale = allIn ? 0.94 / 1.07 : 0.84 + p * 0.1;
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
      {/* Warm candle glow */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle, ${cssA(warm, 0.3)} 0%, ${cssA(warm, 0.1)} 36%, ${cssA(warm, 0)} 62%)`,
          opacity: 0.5 + p * 0.5,
        }}
      />
      <svg
        viewBox="0 0 200 200"
        className="absolute inset-0 h-full w-full"
        // (Kept opaque: see-through orange on the navy sky turns muddy brown.)
        style={{
          transform: `scale(${scale.toFixed(3)})`,
          transition: "transform 300ms ease-out",
        }}
      >
        <g
          style={{
            transformOrigin: "100px 100px",
            animation: allIn ? "lc-pulse 1.3s ease-in-out infinite" : "none",
          }}
        >
          {BLOOM.map((b, i) => (
            <g
              key={i}
              ref={(el) => {
                rings.current[i] = el;
              }}
            >
              {b.art}
            </g>
          ))}
          {BLOOM_DOTS.map((d, i) => (
            <circle
              key={i}
              cx={d.x}
              cy={d.y}
              r={1.5}
              fill={d.fill}
              style={{
                transformBox: "fill-box",
                transformOrigin: "center",
                animation: `lc-twinkle 2.4s ease-in-out ${d.delay}s infinite`,
              }}
            />
          ))}
        </g>
      </svg>
    </div>
  );
}
