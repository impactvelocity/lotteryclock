"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { SceneMood } from "@/components/scenes/types";
import { frac } from "@/lib/rand";
import { cssA, rampN, tierIndex } from "@/lib/themes";

/**
 * Ouija's background: a candlelit spirit board, engraved in antique gold on charcoal, seen
 * through old film (grain, dust, scratches). It gets more haunted as the bet grows.
 *
 *   0 min     the spirits rest: every candle out, smoke curling off the wicks
 *   1–11      a faint whisper: the first candle catches
 *   12–23     something stirs: more candles, a moth finds the flames
 *   24–35     the planchette moves: half the candles lit, embers drifting up
 *   36–45     possessed → the spirits decide: every candle burning, the board smouldering
 *
 * A snooze lights YES (under the sun) and snuffs the candles; a late result lights NO (under the
 * moon) and the flames flare. Purely decorative and pointer-transparent.
 */

type Props = {
  /** Bet as a fraction of the maximum, 0..1. */
  p: number;
  /** Bet tier, 0 (no gamble) to 5 (the full 45). */
  tier: number;
  mood: SceneMood;
};

/** Antique gold, for the engraved line work. */
const GOLD = "#C9A55A";
const BONE = "#ECE3CF";
const EMBER = "#FF6A2B";
const SERIF = "var(--font-geist-serif-triangle), var(--font-geist-serif), serif";

const clamp = (n: number) => Math.max(0, Math.min(1, n));
const svgUrl = (svg: string) => `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;

/** A four-point star on a 24-unit grid, pinched thin like an engraving. */
const STAR =
  "M12 0C12.6 8.2 15.8 11.4 24 12 15.8 12.6 12.6 15.8 12 24 11.4 15.8 8.2 12.6 0 12 8.2 11.4 11.4 8.2 12 0z";

/** Film grain: fine warm specks, tiled across the scene and jittered a few times a second. */
const GRAIN = svgUrl(
  "<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='g' x='0' y='0' width='100%' height='100%'><feTurbulence type='fractalNoise' baseFrequency='0.92' numOctaves='2' seed='4' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.93  0 0 0 0 0.89  0 0 0 0 0.8  7 0 0 0 -3.9'/></filter><rect width='100%' height='100%' filter='url(#g)'/></svg>",
);

/** Blotchy, uneven darkness, like a print that's been handled for a century. */
const MOTTLE = svgUrl(
  "<svg xmlns='http://www.w3.org/2000/svg' width='520' height='520'><filter id='m' x='0' y='0' width='100%' height='100%'><feTurbulence type='fractalNoise' baseFrequency='0.012' numOctaves='4' seed='9' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  2.6 0 0 0 -1.15'/></filter><rect width='100%' height='100%' filter='url(#m)'/></svg>",
);

const STARS = Array.from({ length: 34 }, (_, i) => ({
  x: 3 + frac(i, 71) * 94,
  y: 6 + frac(i, 72) * 78,
  r: 0.6 + frac(i, 73) * 1.1,
  sparkle: frac(i, 74) > 0.7,
  order: frac(i, 75),
  dur: (2.4 + frac(i, 76) * 3).toFixed(1),
  delay: (frac(i, 77) * 4).toFixed(1),
}));

const DUST = Array.from({ length: 46 }, (_, i) => ({
  x: frac(i, 61) * 100,
  y: frac(i, 62) * 100,
  s: 1 + frac(i, 63) * 2.4,
  o: 0.1 + frac(i, 64) * 0.3,
  // Irregular blobs, not perfect dots
  shape: `${40 + frac(i, 65) * 60}% ${30 + frac(i, 66) * 70}% ${40 + frac(i, 67) * 60}% ${35 + frac(i, 68) * 65}%`,
}));

/** Stray hairs caught in the gate. */
const HAIRS = [
  { x: 13, y: 64, rot: 20, d: "M0 0c6-3 10 2 16-1s9-7 14-4" },
  { x: 82, y: 33, rot: -35, d: "M0 0c4 5 9 4 12 1s8-2 9 4" },
  { x: 61, y: 91, rot: 70, d: "M0 0c3-4 7-3 9 0s6 3 8-1 5-5 9-2" },
];

/** Long vertical scratches (left %, top %, height %, tilt), plus one diagonal gouge. */
const SCRATCHES = [
  { x: 9, top: 0, h: 74, rot: 0.6, o: 0.08, dur: 3.1 },
  { x: 23.5, top: 30, h: 70, rot: -0.4, o: 0.05, dur: 4.3 },
  { x: 67, top: 4, h: 40, rot: 0.3, o: 0.06, dur: 2.7 },
  { x: 88.5, top: 16, h: 84, rot: -0.8, o: 0.09, dur: 3.7 },
  { x: 41, top: 56, h: 44, rot: 0.2, o: 0.045, dur: 5.2 },
  { x: 74, top: 2, h: 20, rot: 58, o: 0.07, dur: 6.1 },
];

/** Candles per side, on a 100 × 124 strip whose floor is y = 116. */
type CandleSpec = { cx: number; w: number; h: number; order: number };
const CANDLES: Record<"left" | "right", CandleSpec[]> = {
  left: [
    { cx: 22, w: 12, h: 72, order: 0 },
    { cx: 47, w: 15, h: 46, order: 2 },
    { cx: 72, w: 10, h: 28, order: 4 },
  ],
  right: [
    { cx: 78, w: 12, h: 62, order: 1 },
    { cx: 53, w: 14, h: 82, order: 3 },
    { cx: 29, w: 11, h: 36, order: 5 },
  ],
};
const FLOOR = 116;
/** How many candles burn at each tier. */
const LIT_AT = [0, 1, 2, 3, 4, 6];

/** Moths circling the flames: which side, where they start, their own rhythm. */
const MOTHS = [
  { side: "left", x: 50, y: 70, size: 18, dur: 6.5, delay: 0 },
  { side: "right", x: 40, y: 60, size: 16, dur: 7.4, delay: -2.5 },
  { side: "left", x: 20, y: 40, size: 14, dur: 5.6, delay: -4 },
  { side: "right", x: 70, y: 80, size: 15, dur: 8.2, delay: -1.2 },
] as const;
const MOTHS_AT = [0, 0, 1, 2, 3, 4];

/** Sparks drifting up off the board. */
const EMBERS = Array.from({ length: 18 }, (_, i) => ({
  x: 4 + frac(i, 81) * 92,
  size: 1.5 + frac(i, 82) * 2.5,
  dur: (5 + frac(i, 83) * 6).toFixed(1),
  delay: (-frac(i, 84) * 10).toFixed(1),
  drift: Math.round((frac(i, 85) - 0.5) * 80),
}));
const EMBERS_AT = [0, 0, 0, 6, 12, 18];

export function OuijaScene({ p, tier, mood }: Props) {
  // A snooze settles the spirits; a late result riles them up.
  const stir = clamp(mood === "win" ? p * 0.3 : mood === "loss" ? 0.6 + p * 0.4 : p);
  const lit = mood === "win" ? 0 : mood === "loss" || mood === "jackpot" ? 6 : LIT_AT[tier];
  const flare = mood === "loss";
  const moths = mood === "win" ? 0 : MOTHS_AT[tier];
  const embers = mood === "win" ? 0 : mood === "loss" ? EMBERS.length : EMBERS_AT[tier];
  const starsOut = 0.3 + stir * 0.7;
  const smoulder = rampN(["#9A6A30", "#B5502A", "#C2361F"], stir);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* The board smoulders from below as the spirits stir */}
      <div
        className="absolute inset-x-0 bottom-0 h-[70%]"
        style={{
          background: `radial-gradient(ellipse 75% 65% at 50% 100%, ${cssA(smoulder, 0.06 + stir * 0.3)} 0%, ${cssA(smoulder, 0.02 + stir * 0.09)} 45%, transparent 75%)`,
          transition: "background 600ms ease-out",
        }}
      />

      {/* Engraved stars */}
      {STARS.map((s, i) => (
        <span
          key={i}
          className="absolute"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            opacity: s.order < starsOut ? 0.75 : 0,
            transition: "opacity 500ms",
          }}
        >
          {s.sparkle ? (
            <svg
              viewBox="0 0 24 24"
              className="block"
              style={{
                width: s.r * 9,
                height: s.r * 9,
                animation: `lc-twinkle ${s.dur}s ease-in-out ${s.delay}s infinite`,
              }}
            >
              <path d={STAR} fill={GOLD} />
            </svg>
          ) : (
            <span
              className="block rounded-full"
              style={{
                width: s.r * 1.8,
                height: s.r * 1.8,
                background: GOLD,
                animation: `lc-twinkle ${s.dur}s ease-in-out ${s.delay}s infinite`,
              }}
            />
          )}
        </span>
      ))}

      <Frame />

      {/* YES under the sun, NO under the moon (wide screens only: there's no room beside the
          headline on a phone) */}
      <Celestial side="left" lit={mood === "win" || mood === "jackpot"} stir={stir} />
      <Celestial side="right" lit={mood === "loss" || mood === "jackpot"} stir={stir} />

      <Candles side="left" lit={lit} flare={flare} />
      <Candles side="right" lit={lit} flare={flare} />

      {MOTHS.map((m, i) => (
        <div
          key={i}
          className={`absolute bottom-[110px] max-sm:hidden ${m.side === "left" ? "left-[56px]" : "right-[56px]"}`}
          style={{
            opacity: i < moths ? 1 : 0,
            transition: "opacity 700ms",
            marginLeft: m.side === "left" ? m.x - 50 : undefined,
            marginRight: m.side === "right" ? m.x - 50 : undefined,
            marginBottom: m.y - 60,
          }}
        >
          <div style={{ animation: `lc-moth ${m.dur}s ease-in-out ${m.delay}s infinite` }}>
            <svg
              viewBox="0 0 24 24"
              width={m.size}
              height={m.size}
              fill="none"
              stroke={BONE}
              strokeWidth={1.3}
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                animation: `lc-moth-flap ${(0.18 + i * 0.03).toFixed(2)}s ease-in-out infinite`,
                opacity: 0.8,
              }}
            >
              {MOTH.map((d) => (
                <path key={d} d={d} />
              ))}
            </svg>
          </div>
        </div>
      ))}

      {/* Embers rising */}
      {EMBERS.map((e, i) => (
        <span
          key={i}
          className="absolute bottom-0 block rounded-full"
          style={
            {
              left: `${e.x}%`,
              width: e.size,
              height: e.size,
              background: "#FFB46B",
              boxShadow: `0 0 ${e.size * 3}px ${EMBER}`,
              opacity: 0,
              visibility: i < embers ? "visible" : "hidden",
              animation: `lc-ember ${e.dur}s ease-out ${e.delay}s infinite`,
              "--drift": `${e.drift}px`,
            } as CSSProperties
          }
        />
      ))}

      <Grunge stir={stir} />
    </div>
  );
}

/** A line-art moth on a 24-unit grid (the "Something stirs" icon). */
const MOTH = [
  "M12 7.5v10",
  "M12 9C10 5.5 5.5 4.2 4 6.6c-1.5 2.5 2.2 5.6 8 5",
  "M12 9c2-3.5 6.5-4.8 8-2.4 1.5 2.5-2.2 5.6-8 5",
  "M12 12.5c-2.8.2-6 2-5.3 4.2.6 2 3.8.8 5.3-1.5",
  "M12 12.5c2.8.2 6 2 5.3 4.2-.6 2-3.8.8-5.3-1.5",
  "M11.6 7.6c-.6-1.8-1.8-3-3.3-3.3",
  "M12.4 7.6c.6-1.8 1.8-3 3.3-3.3",
];

/**
 * The board's border: two gold rules with a concave notch cut into each corner, a star sitting
 * in the notch. Lines are plain divs so they stretch with the hero; the corners stay crisp.
 */
function Frame() {
  const R = 26; // notch radius on the outer rule
  const G = 5; // gap between the rules
  const RI = Math.sqrt((R + G) ** 2 - G * G); // where the inner rule meets its notch
  const line = (style: CSSProperties) => (
    <span className="absolute block" style={{ background: GOLD, ...style }} />
  );
  const corners = [
    { left: 0, top: 0, transform: "none" },
    { right: 0, top: 0, transform: "scaleX(-1)" },
    { left: 0, bottom: 0, transform: "scaleY(-1)" },
    { right: 0, bottom: 0, transform: "scale(-1)" },
  ];
  return (
    <div
      className="absolute inset-x-3 top-3 bottom-4 opacity-45 sm:inset-x-5 sm:top-5 sm:bottom-6"
      style={{ mixBlendMode: "screen" }}
    >
      {line({ left: R, right: R, top: 0, height: 1 })}
      {line({ left: R, right: R, bottom: 0, height: 1 })}
      {line({ top: R, bottom: R, left: 0, width: 1 })}
      {line({ top: R, bottom: R, right: 0, width: 1 })}
      {line({ left: RI, right: RI, top: G, height: 0.6, opacity: 0.7 })}
      {line({ left: RI, right: RI, bottom: G, height: 0.6, opacity: 0.7 })}
      {line({ top: RI, bottom: RI, left: G, width: 0.6, opacity: 0.7 })}
      {line({ top: RI, bottom: RI, right: G, width: 0.6, opacity: 0.7 })}
      {corners.map((c, i) => (
        <svg
          key={i}
          viewBox="0 0 40 40"
          className="absolute h-10 w-10 overflow-visible"
          style={c}
          fill="none"
          stroke={GOLD}
        >
          <path d={`M0.5 ${R}A${R} ${R} 0 0 0 ${R} 0.5`} strokeWidth={1} />
          <path d={`M${G} ${RI}A${R + G} ${R + G} 0 0 0 ${RI} ${G}`} strokeWidth={0.6} />
          <path d={STAR} fill={GOLD} stroke="none" transform="translate(4.5 4.5) scale(0.42)" />
        </svg>
      ))}
    </div>
  );
}

/** Sun rays: alternating long and short, with every sixth reaching furthest. */
const SUN_RAYS = Array.from({ length: 72 }, (_, i) => {
  const a = (i / 72) * Math.PI * 2;
  const len = i % 6 === 0 ? 22 : i % 2 === 0 ? 15 : 9;
  const r1 = 25;
  const r2 = r1 + len;
  const f = (n: number) => Math.round(n * 100) / 100;
  return `M${f(Math.sin(a) * r1)} ${f(-Math.cos(a) * r1)}L${f(Math.sin(a) * r2)} ${f(-Math.cos(a) * r2)}`;
}).join("");

/**
 * The crescent: a 26-radius moon with a 23-radius bite taken out from the upper right
 * (the two circles cross at the path's endpoints).
 */
const CRESCENT = "M-2.09 -25.91A26 26 0 1 0 22.59 12.87A23 23 0 0 1 -2.09 -25.91Z";

/** The sun (left, over YES) or the crescent moon (right, over NO), with the word in a bracket. */
function Celestial({ side, lit, stir }: { side: "left" | "right"; lit: boolean; stir: number }) {
  const sun = side === "left";
  const glow = lit ? 1 : 0;
  return (
    <div
      className={`absolute top-[104px] hidden w-[84px] flex-col items-center gap-3 md:flex lg:top-[112px] lg:w-[108px] ${sun ? "left-[max(4%,40px)]" : "right-[max(4%,40px)]"}`}
    >
      <svg
        viewBox="-60 -60 120 120"
        className="aspect-square w-full overflow-visible"
        fill="none"
        stroke={GOLD}
        strokeLinecap="round"
        style={{
          opacity: 0.55 + stir * 0.25 + glow * 0.2,
          filter: `drop-shadow(0 0 ${lit ? 10 : 0}px rgba(255,106,43,${0.7 * glow}))`,
          transition: "opacity 500ms, filter 500ms",
        }}
      >
        {sun ? (
          <>
            <g style={{ animation: "lc-spin 160s linear infinite" }}>
              <path d={SUN_RAYS} strokeWidth={0.7} />
            </g>
            <circle r={21} strokeWidth={1.2} />
            <circle r={17.5} strokeWidth={0.6} strokeDasharray="0.1 2.6" />
            {/* Φ */}
            <circle r={6.5} strokeWidth={1.1} />
            <path d="M0 -12V12" strokeWidth={1.1} />
          </>
        ) : (
          <>
            <path d={CRESCENT} strokeWidth={1.2} />
            <path
              d={CRESCENT}
              strokeWidth={0.6}
              transform="translate(-14 6) scale(0.8) translate(14 -6)"
              strokeDasharray="0.1 2.6"
            />
            {(
              [
                [26, -30, 0.5],
                [38, -12, 0.32],
                [30, 22, 0.26],
                [-34, -26, 0.22],
              ] as const
            ).map(([x, y, k], i) => (
              <path
                key={i}
                d={STAR}
                fill={GOLD}
                stroke="none"
                transform={`translate(${x - 12 * k} ${y - 12 * k}) scale(${k})`}
                style={{ animation: `lc-twinkle ${2.6 + i * 0.7}s ease-in-out ${i * 0.6}s infinite` }}
              />
            ))}
            {[
              [42, 4],
              [18, -40],
              [-26, 34],
            ].map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r={0.9} fill={GOLD} stroke="none" />
            ))}
          </>
        )}
      </svg>
      <Bracketed word={sun ? "YES" : "NO"} lit={lit} />
    </div>
  );
}

/** A board word in a squared bracket, like the YES and NO on a spirit board. */
function Bracketed({ word, lit }: { word: string; lit: boolean }) {
  const corner = (pos: CSSProperties, borders: CSSProperties) => (
    <span className="absolute block h-2.5 w-2.5" style={{ ...pos, ...borders, borderColor: "currentColor" }} />
  );
  return (
    <span
      className="relative px-4 py-1.5 text-[19px] leading-none lg:text-[22px]"
      style={{
        fontFamily: SERIF,
        letterSpacing: "0.18em",
        paddingLeft: "calc(1rem + 0.18em)",
        color: lit ? "#FFB06B" : GOLD,
        opacity: lit ? 1 : 0.75,
        textShadow: lit ? `0 0 12px ${EMBER}, 0 0 2px ${EMBER}` : "none",
        transition: "color 400ms, opacity 400ms, text-shadow 400ms",
      }}
    >
      {corner({ left: 0, top: 0 }, { borderLeftWidth: 1, borderTopWidth: 1 })}
      {corner({ right: 0, top: 0 }, { borderRightWidth: 1, borderTopWidth: 1 })}
      {corner({ left: 0, bottom: 0 }, { borderLeftWidth: 1, borderBottomWidth: 1 })}
      {corner({ right: 0, bottom: 0 }, { borderRightWidth: 1, borderBottomWidth: 1 })}
      {word}
    </span>
  );
}

/** Three candles on saucers, in a bottom corner. They catch one at a time as the bet grows. */
function Candles({ side, lit, flare }: { side: "left" | "right"; lit: number; flare: boolean }) {
  return (
    <svg
      viewBox="0 0 100 124"
      // Small and tucked into the corner on phones, clear of the centred tier text
      className={`absolute bottom-3 h-[52px] w-[42px] overflow-visible sm:bottom-8 sm:h-[124px] sm:w-[100px] ${side === "left" ? "left-1.5 sm:left-10" : "right-1.5 sm:right-10"}`}
      fill="none"
      stroke={GOLD}
      strokeWidth={1}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <defs>
        <radialGradient id={`lc-ouija-halo-${side}`}>
          <stop offset="0%" stopColor="#FFB45E" stopOpacity={0.55} />
          <stop offset="45%" stopColor={EMBER} stopOpacity={0.18} />
          <stop offset="100%" stopColor={EMBER} stopOpacity={0} />
        </radialGradient>
        <linearGradient id={`lc-ouija-flame-${side}`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor={EMBER} />
          <stop offset="55%" stopColor="#FFB14E" />
          <stop offset="100%" stopColor="#FFF0C9" />
        </linearGradient>
      </defs>
      {CANDLES[side].map((c, i) => (
        <Candle key={i} {...c} side={side} on={c.order < lit} flare={flare} i={i} />
      ))}
    </svg>
  );
}

function Candle({
  cx,
  w,
  h,
  side,
  on,
  flare,
  i,
}: CandleSpec & { side: string; on: boolean; flare: boolean; i: number }) {
  const top = FLOOR - h;
  const l = cx - w / 2;
  const f = (n: number) => Math.round(n * 100) / 100;
  // Body with a melted lip, and one drip running down the front
  const body = `M${f(l)} ${FLOOR}V${f(top + 2.5)}c${f(w * 0.2)} 1.6 ${f(w * 0.35)} -1.2 ${f(w * 0.5)} -.4s${f(w * 0.3)} 1.4 ${f(w * 0.5)} .4V${FLOOR}`;
  const dripLen = Math.min(14, h * 0.24);
  const drip = `M${f(l + w * 0.26)} ${f(top + 2.4)}v${f(dripLen)}a1.3 1.3 0 0 0 2.6 0v${f(-dripLen * 0.6)}`;
  const wickTop = top - 4;
  const flameH = flare ? 19 : 13;
  return (
    <g>
      {/* Warm pool of light round the flame (lit state on the group, flicker on the circle, so
          the animation's opacity doesn't override it) */}
      <g style={{ opacity: on ? 1 : 0, transition: "opacity 500ms" }}>
        <circle
          cx={cx}
          cy={wickTop - 6}
          r={flare ? 34 : 26}
          fill={`url(#lc-ouija-halo-${side})`}
          stroke="none"
          style={{
            animation: `lc-candle-glow ${(2.1 + i * 0.4).toFixed(1)}s ease-in-out ${(i * 0.3).toFixed(1)}s infinite`,
          }}
        />
      </g>
      {/* Saucer */}
      <path d={`M${f(l - 6)} ${FLOOR}h${f(w + 12)}`} />
      <path d={`M${f(l - 4)} ${FLOOR}q${f(w / 2 + 4)} 6 ${f(w + 8)} 0`} strokeWidth={0.7} />
      <path d={body} fill="#110E0C" />
      <path d={drip} strokeWidth={0.8} />
      {/* Wick */}
      <path d={`M${cx} ${top + 1}V${wickTop}`} stroke={on ? "#3A2A1C" : GOLD} strokeWidth={1.2} />
      {/* Flame: catches with a pop, then flickers */}
      <g
        style={{
          transformBox: "fill-box",
          transformOrigin: "50% 100%",
          transform: on ? "scale(1)" : "scale(0.2)",
          opacity: on ? 1 : 0,
          transition: "transform 450ms cubic-bezier(0.3, 1.6, 0.5, 1), opacity 300ms",
        }}
      >
        <g
          className="lc-flame"
          style={{ animationDuration: `${(1.3 + i * 0.37).toFixed(2)}s`, animationDelay: `${(-i * 0.5).toFixed(1)}s` }}
        >
          <path
            d={`M${cx} ${wickTop + 1}c-4 -3 -4.2 ${f(-flameH * 0.55)} 0 ${-flameH}c4.2 ${f(flameH * 0.45)} 4 ${f(flameH - 3)} 0 ${flameH}z`}
            fill={`url(#lc-ouija-flame-${side})`}
            stroke="none"
            style={{ filter: `drop-shadow(0 0 4px ${EMBER})` }}
          />
          <path
            d={`M${cx} ${wickTop + 0.5}c-1.6 -1.4 -1.8 -3.6 0 -6.5c1.8 2.9 1.6 5.1 0 6.5z`}
            fill="#FFF6DD"
            stroke="none"
          />
        </g>
      </g>
      {/* Smoke from a snuffed wick */}
      <g style={{ opacity: on ? 0 : 1, transition: "opacity 600ms" }}>
        <path
          d={`M${cx} ${wickTop - 1}c-3 -4 3 -7 0 -11s3 -7 0 -11 2.5 -6 0 -9`}
          stroke={BONE}
          strokeWidth={0.8}
          style={{
            animation: `lc-smoke ${(3.2 + i * 0.6).toFixed(1)}s ease-out ${(i * 0.9).toFixed(1)}s infinite`,
          }}
        />
      </g>
    </g>
  );
}

/** Old-film texture on top of the scene: mottling, grain, dust, hairs, scratches, a vignette. */
function Grunge({ stir }: { stir: number }) {
  return (
    <>
      <div
        className="absolute inset-0"
        style={{ backgroundImage: MOTTLE, opacity: 0.55, mixBlendMode: "multiply" }}
      />
      <div
        className="absolute -inset-10"
        style={{
          backgroundImage: GRAIN,
          opacity: 0.09,
          animation: "lc-grain 0.7s steps(1, end) infinite",
        }}
      />
      {DUST.map((d, i) => (
        <span
          key={i}
          className="absolute block"
          style={{
            left: `${d.x}%`,
            top: `${d.y}%`,
            width: d.s,
            height: d.s * 0.8,
            borderRadius: d.shape,
            background: BONE,
            opacity: d.o,
          }}
        />
      ))}
      {HAIRS.map((hr, i) => (
        <svg
          key={i}
          viewBox="-2 -10 36 20"
          className="absolute h-5 w-9 overflow-visible"
          style={{ left: `${hr.x}%`, top: `${hr.y}%`, transform: `rotate(${hr.rot}deg)`, opacity: 0.22 }}
        >
          <path d={hr.d} fill="none" stroke={BONE} strokeWidth={0.6} />
        </svg>
      ))}
      {SCRATCHES.map((s, i) => (
        <span
          key={i}
          className="absolute block w-px origin-top"
          style={{
            left: `${s.x}%`,
            top: `${s.top}%`,
            height: `${s.h}%`,
            transform: `rotate(${s.rot}deg)`,
            opacity: s.o,
          }}
        >
          <span
            className="block h-full w-full"
            style={{
              background: `linear-gradient(180deg, transparent, ${BONE} 15%, ${BONE} 80%, transparent)`,
              animation: `lc-scratch ${s.dur}s steps(1, end) ${(-i * 0.7).toFixed(1)}s infinite`,
            }}
          />
        </span>
      ))}
      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 85% 75% at 50% 42%, transparent 45%, rgba(0,0,0,0.38) 80%, rgba(0,0,0,0.62) 100%)",
        }}
      />
      {/* Candlelight wavering over everything, more as the spirits stir */}
      <div
        className="absolute inset-0 bg-black"
        style={{
          opacity: 0,
          ["--flicker" as string]: (0.04 + stir * 0.08).toFixed(3),
          animation: "lc-candlelight 5.3s linear infinite",
        }}
      />
    </>
  );
}

/* ------------------------------------------------------------------------------------------ */

/**
 * Ouija's counterpart to Classic's sun rays: a spirit-board ring round the dial. A–Z then 1–0 run
 * round it, and from "A faint whisper" up a glass planchette slides from letter to letter
 * spelling the spirits' message, faster the bigger the bet. Engravings (dotted ring, rays, a
 * great triangle) come up behind it as the bet grows. Fades out while the alarm is set.
 */

const MESSAGES = ["", "HUSH", "SOON", "WAKE UP", "NO REST", "GOODBYE"];
/** Milliseconds per letter at each tier: half travelling, half resting on it. */
const PACE = [0, 1500, 1200, 950, 720, 540];

/** Slot 0 (the top) and 27 are stars; A–Z fill 1–26 clockwise, then 1–9 and 0. */
const SLOTS = ["*", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ", "*", ..."1234567890"];
const STEP = 360 / SLOTS.length;
const slotOf = (ch: string) => SLOTS.indexOf(ch);

/** Radii, in dial units (the dial is 358 across). */
const R_IN = 182;
const R_LETTER = 194;
const R_OUT = 207;
const R_DOTS = 224;
const R_RAYS = 234;
const R_TRI = 286;

const RING_DOTS = Array.from({ length: 96 }, (_, i) => {
  const a = (i / 96) * Math.PI * 2;
  return [Math.sin(a) * R_DOTS, -Math.cos(a) * R_DOTS] as const;
});

/** Shortest way round from one angle to another, in degrees. */
function nearest(from: number, to: number) {
  const d = ((((to - from) % 360) + 540) % 360) - 180;
  return from + d;
}

export function SpiritRing({
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
  const tier = tierIndex(range);
  const reduce = useReducedMotion();
  const active = visible && !reduce && tier > 0;

  // Where the planchette is heading (a running angle, so it always takes the short way round),
  // and which letter it's resting on.
  const [turn, setTurn] = useState(0);
  const [lit, setLit] = useState<number | null>(null);
  const pace = PACE[tier];

  useEffect(() => {
    if (!active) return;
    const word = [...MESSAGES[tier]].map((ch) => (ch === " " ? null : slotOf(ch)));
    // Spell the word, rest at the top, repeat
    const seq = [...word, 0, null];
    let k = 0;
    let id = 0;
    const next = () => {
      const s = seq[k++ % seq.length];
      setLit(null);
      if (s === null) {
        id = window.setTimeout(next, pace);
        return;
      }
      setTurn((t) => nearest(t, s * STEP));
      id = window.setTimeout(() => {
        if (s !== 0) setLit(s);
        id = window.setTimeout(next, pace * 0.5);
      }, pace * 0.55);
    };
    id = window.setTimeout(next, 300);
    return () => window.clearTimeout(id);
  }, [active, tier, pace]);

  // At rest the glass waits at the top star
  const shownTurn = active ? turn : Math.round(turn / 360) * 360;
  const shownLit = active ? lit : null;

  // Engravings turn slowly, quicker as the spirits stir
  const spinRef = useRef<SVGGElement>(null);
  const speed = useRef(0);
  speed.current = 1.5 + p * p * 10;
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let angle = 0;
    let last = performance.now();
    let id = requestAnimationFrame(function frame(now) {
      angle = (angle + ((now - last) / 1000) * speed.current) % 360;
      last = now;
      spinRef.current?.setAttribute("transform", `rotate(${angle.toFixed(2)})`);
      id = requestAnimationFrame(frame);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const glow = rampN(["#C9A55A", "#F08A3C", "#E5432E"], p);
  const rays = clamp((p - 0.15) / 0.6);
  const triangle = clamp((p - 0.45) / 0.4);
  const half = 340;

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
          background: `radial-gradient(circle, ${cssA(glow, 0.3)} 0%, ${cssA(glow, 0.1)} 34%, ${cssA(glow, 0)} 60%)`,
          opacity: 0.25 + p * 0.75,
          animation: `lc-pulse ${(3.4 - p * 2).toFixed(2)}s ease-in-out infinite`,
        }}
      />
      <svg
        viewBox={`${-half} ${-half} ${half * 2} ${half * 2}`}
        className="absolute inset-0 h-full w-full overflow-visible"
        fill="none"
        stroke={GOLD}
      >
        <defs>
          <filter id="lc-ouija-letter-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="3.5" />
          </filter>
          {/* The triangle only shows outside the letter ring */}
          <mask id="lc-ouija-tri-mask" maskUnits="userSpaceOnUse" x={-half * 1.5} y={-half * 1.5} width={half * 3} height={half * 3}>
            <rect x={-half * 1.5} y={-half * 1.5} width={half * 3} height={half * 3} fill="#fff" />
            <circle r={R_DOTS - 8} fill="#000" />
          </mask>
        </defs>

        {/* The great triangle, rising with the bet */}
        <g
          mask="url(#lc-ouija-tri-mask)"
          style={{ opacity: triangle * 0.45, transition: "opacity 400ms" }}
          strokeWidth={1}
        >
          <path
            d={[0, 120, 240]
              .map((deg, i) => {
                const a = (deg * Math.PI) / 180;
                return `${i ? "L" : "M"}${(Math.sin(a) * R_TRI).toFixed(1)} ${(-Math.cos(a) * R_TRI).toFixed(1)}`;
              })
              .join("") + "Z"}
          />
          {[0, 120, 240].map((deg) => {
            const a = (deg * Math.PI) / 180;
            const x = Math.sin(a) * R_TRI;
            const y = -Math.cos(a) * R_TRI;
            return (
              <g key={deg} transform={`translate(${x.toFixed(1)} ${y.toFixed(1)})`}>
                <circle r={9} strokeWidth={0.8} />
                <path d={STAR} fill={GOLD} stroke="none" transform="translate(-6 -6) scale(0.5)" />
              </g>
            );
          })}
        </g>

        {/* Turning engravings: dotted ring and sunburst */}
        <g ref={spinRef}>
          <g style={{ opacity: 0.25 + p * 0.45, transition: "opacity 300ms" }}>
            {RING_DOTS.map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r={i % 8 === 0 ? 2 : 1} fill={GOLD} stroke="none" />
            ))}
          </g>
          <g style={{ opacity: rays * 0.5, transition: "opacity 300ms" }} strokeWidth={0.8} strokeLinecap="round">
            {Array.from({ length: 120 }, (_, i) => {
              const a = (i / 120) * Math.PI * 2;
              const len = (i % 10 === 0 ? 44 : i % 2 === 0 ? 22 : 12) * (0.5 + rays * 0.5);
              const s = Math.sin(a);
              const c = -Math.cos(a);
              return (
                <path
                  key={i}
                  d={`M${(s * R_RAYS).toFixed(1)} ${(c * R_RAYS).toFixed(1)}L${(s * (R_RAYS + len)).toFixed(1)} ${(c * (R_RAYS + len)).toFixed(1)}`}
                />
              );
            })}
          </g>
        </g>

        {/* Rules either side of the letters */}
        <g style={{ opacity: 0.45 + p * 0.3 }}>
          <circle r={R_IN} strokeWidth={0.8} />
          <circle r={R_OUT} strokeWidth={1} />
          <circle r={R_OUT + 4} strokeWidth={0.5} />
        </g>

        {/* The letters */}
        {SLOTS.map((ch, i) => {
          const on = shownLit === i;
          const at = `rotate(${(i * STEP).toFixed(2)}) translate(0 ${-R_LETTER})`;
          if (ch === "*")
            return (
              <path
                key={i}
                d={STAR}
                fill={GOLD}
                stroke="none"
                transform={`${at} translate(-6 -6) scale(0.5)`}
                opacity={0.8}
              />
            );
          return (
            <g key={i} transform={at} style={{ fontFamily: SERIF }}>
              <text
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={15}
                fill={EMBER}
                stroke="none"
                filter="url(#lc-ouija-letter-glow)"
                style={{ opacity: on ? 1 : 0, transition: `opacity ${on ? 200 : 1400}ms` }}
              >
                {ch}
              </text>
              <text
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={15}
                stroke="none"
                fill={on ? "#FFE2B8" : GOLD}
                style={{
                  opacity: on ? 1 : 0.6 + p * 0.25,
                  transition: `fill ${on ? 200 : 1400}ms, opacity 300ms`,
                }}
              >
                {ch}
              </text>
            </g>
          );
        })}
      </svg>

      {/* The planchette's glass, gliding round the ring */}
      <motion.div
        className="absolute inset-0"
        initial={false}
        animate={{ rotate: shownTurn }}
        transition={{ duration: active ? (pace * 0.5) / 1000 : 0.8, ease: [0.5, 0, 0.25, 1] }}
      >
        <svg
          viewBox={`${-half} ${-half} ${half * 2} ${half * 2}`}
          className="h-full w-full overflow-visible"
          fill="none"
        >
          <g
            transform={`translate(0 ${-R_LETTER})`}
            style={{
              opacity: active ? 1 : 0.55,
              transition: "opacity 400ms",
            }}
          >
            <g style={{ animation: tier >= 4 && active ? "lc-shake 0.28s linear infinite" : "none" }}>
              <circle r={16.5} fill="rgba(255,226,184,0.07)" stroke={BONE} strokeWidth={1.4} />
              <circle r={12.5} stroke={GOLD} strokeWidth={0.7} strokeDasharray="0.1 3" strokeLinecap="round" />
              <path
                d="M0 -16.5v-5M0 16.5v5M-16.5 0h-5M16.5 0h5"
                stroke={BONE}
                strokeWidth={1.2}
                strokeLinecap="round"
              />
            </g>
          </g>
        </svg>
      </motion.div>
    </div>
  );
}
