"use client";

import type { CSSProperties } from "react";
import {
  CALAVERA_FACES,
  CALAVERITA,
  CANDLE_DRIPS,
  CANDLE_FLAME,
  CANDLE_RIM,
  HEADSTONE_CROSS,
  HEADSTONE_LINES,
  MARIGOLD,
  MONARCH_BODY,
  MONARCH_WINGS,
  PAPEL_PICADO,
} from "@/components/scenes/muertos-svg";

/**
 * Día de Muertos illustrations. The art itself comes from the SVGs in ./art/muertos (inlined in
 * muertos-svg.tsx so nothing loads late); these components place it, colour it and animate it.
 * The prompts that made that art are in docs/muertos-theme-svg-prompts.md.
 */

export const MU = {
  bone: "#F6EBD3",
  wax: "#F3E6CC",
  navy: "#141A33",
  rose: "#F0306E",
  red: "#E8461E",
  orange: "#FF7A1F",
  marigold: "#FFC23D",
  gold: "#FFD45A",
  teal: "#2FB8A6",
  leaf: "#2E9C8A",
  purple: "#9A5BE0",
  sky: "#5BC0F0",
  stone: "#1D2752",
  stoneInk: "#2B3768",
};

/* ------------------------------------------------------------------ papel picado */

export const FLAG_DESIGNS = ["skull", "flower", "heart", "star"] as const;
export type FlagDesign = (typeof FLAG_DESIGNS)[number];

/** A papel picado flag (40 × 50 grid), as wide as its container. The cut-outs are holes. */
export function PapelFlag({ design, color }: { design: FlagDesign; color: string }) {
  return (
    <svg viewBox="0 0 40 50" className="block h-auto w-full" style={{ overflow: "visible" }}>
      <path d={PAPEL_PICADO[design]} fill={color} fillRule="evenodd" />
      {/* The fold over the string catches a little light */}
      <rect width="40" height="3" fill="rgba(255,255,255,0.28)" />
    </svg>
  );
}

/* ------------------------------------------------------------------ ofrenda pieces */
/* These draw inside an ofrenda <svg>, each placed by its bottom centre (or centre). */

/** Shared gradients for a strip of candles. */
export function CandleDefs({ id }: { id: string }) {
  return (
    <>
      <radialGradient id={`${id}-glow`}>
        <stop offset="0" stopColor="#FFB347" stopOpacity="0.6" />
        <stop offset="0.45" stopColor="#FF7A1F" stopOpacity="0.18" />
        <stop offset="1" stopColor="#FF7A1F" stopOpacity="0" />
      </radialGradient>
      <linearGradient id={`${id}-warm`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#FF7A1F" stopOpacity="0.85" />
        <stop offset="1" stopColor="#FF7A1F" stopOpacity="0" />
      </linearGradient>
    </>
  );
}

/**
 * A pillar candle, 18 wide and `h` tall, standing on (x, y). A lit one gets a flickering
 * flame, a glow, and wax warmed orange at the top (like candlelight on a real ofrenda).
 * The rim and drips come from candle-body.svg; the plain body between them stretches to `h`.
 */
export function Candle({
  x,
  y,
  h,
  s = 1,
  lit,
  flare = 1,
  dur,
  delay,
  defs,
  wait = 0,
  smoke = false,
}: {
  x: number;
  y: number;
  h: number;
  s?: number;
  lit: boolean;
  /** Flame size, 1 = normal. */
  flare?: number;
  /** Flicker rhythm, seconds. */
  dur: number;
  delay: number;
  /** Id prefix of the strip's <CandleDefs>. */
  defs: string;
  /** Seconds before the flame catches or goes out, so a row can light one after another. */
  wait?: number;
  /** Just snuffed: smoke curls up from the wick. */
  smoke?: boolean;
}) {
  const fade = `opacity 450ms ease-out ${wait}s`;
  const on = { opacity: lit ? 1 : 0, transition: fade };
  // candle-body.svg's top, moved so its rim (centred on y = 2.6 there) sits on y = -h.
  const top = `translate(-9 ${-h - 2.6})`;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* Glow round the flame */}
      <circle
        cx={0}
        cy={-h - 12}
        r={30 * flare}
        fill={`url(#${defs}-glow)`}
        style={{ ...on, transition: `${fade}, r 400ms` }}
      />
      {/* Body with a rounded foot, and its shade band */}
      <path d={`M-9 ${-h}H9V-2.6C9 .8-9 .8-9-2.6Z`} fill={MU.wax} />
      <path d={`M4.5 ${-h + 0.4}H9V-2.6Q9-.4 4.5-.1Z`} fill="#E4D3B4" />
      {/* Wax warmed by the flame */}
      <rect x={-9} y={-h} width={18} height={Math.min(18, h * 0.55)} fill={`url(#${defs}-warm)`} style={on} />
      <g transform={top}>{CANDLE_DRIPS}</g>
      <g transform={top}>{CANDLE_RIM}</g>
      {/* Wick */}
      <line x1={0} y1={-h} x2={0} y2={-h - 5.5} stroke="#3A2A20" strokeWidth={1.3} strokeLinecap="round" />
      {/* Smoke from a snuffed wick: two wisps, one after the other */}
      {smoke && !lit && (
        // (Placed by the group: the animation's transform would replace one on the path itself.)
        <g transform={`translate(0 ${-h - 6})`}>
          {[0, 1].map((i) => (
            <path
              key={i}
              d="M0 0C-2.4-3.5 2.4-6.5 0-10S2.2-16 0-19"
              fill="none"
              stroke="rgba(246,235,211,0.8)"
              strokeWidth={1.6}
              strokeLinecap="round"
              style={{
                opacity: 0,
                transformBox: "fill-box",
                transformOrigin: "50% 100%",
                animation: `lc-mu-smoke 2.6s ease-out ${(0.3 + i * 1.3 - delay * 0.4).toFixed(2)}s infinite`,
              }}
            />
          ))}
        </g>
      )}
      {/* Flame, its base just over the wick */}
      <g
        transform={`translate(0 ${-h - 4}) scale(${flare})`}
        style={{ ...on, transition: `${fade}, transform 400ms` }}
      >
        <g
          style={{
            transformBox: "fill-box",
            transformOrigin: "50% 100%",
            animation: `lc-flicker ${dur}s ease-in-out ${delay}s infinite`,
          }}
        >
          <g transform="translate(-6 -24)">{CANDLE_FLAME}</g>
        </g>
      </g>
    </g>
  );
}

/** A cempasúchil (marigold) pom-pom with two leaves, 44 × 36, centred on (x, y). */
export function Marigold({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return <g transform={`translate(${x} ${y}) scale(${s})`}>{MARIGOLD}</g>;
}

/** A calaverita (small sugar skull), 30 × 34, centred on (x, y). */
export function Calaverita({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return <g transform={`translate(${x} ${y}) scale(${s})`}>{CALAVERITA}</g>;
}

/**
 * A headstone, 28 wide and 44 tall, standing on (x, y); `cross` carves a cross in it.
 * `jolt` rattles it every couple of seconds, as whoever's under it gets up.
 */
export function Headstone({
  x,
  y,
  s = 1,
  cross = false,
  jolt = false,
}: {
  x: number;
  y: number;
  s?: number;
  cross?: boolean;
  jolt?: boolean;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <g
        style={{
          transformBox: "fill-box",
          transformOrigin: "50% 100%",
          animation: jolt ? "lc-mu-jolt 2.2s ease-in-out infinite" : "none",
        }}
      >
        {cross ? HEADSTONE_CROSS : HEADSTONE_LINES}
      </g>
    </g>
  );
}

const BONE_STROKE = { stroke: MU.bone, strokeLinecap: "round", fill: "none" } as const;
/** Clods of earth thrown up as a hand breaks through: where each flies to. */
const DIRT = [
  { dx: -14, dy: -16, r: 1.8 },
  { dx: -6, dy: -24, r: 1.3 },
  { dx: 5, dy: -21, r: 1.6 },
  { dx: 13, dy: -13, r: 1.4 },
  { dx: 1, dy: -28, r: 1.1 },
];

/**
 * A skeleton hand reaching up out of the ground at (x, y), about 28 wide and 50 tall: it
 * bursts up through the earth after `delay` seconds, throwing up clods, then waves about.
 * `clip` is the id of a clipPath that hides everything below y = 0 (in the hand's own units),
 * so it rises out of the ground rather than appearing whole.
 */
export function BonyHand({
  x,
  y,
  s = 1,
  delay = 0,
  flip = false,
  clip,
}: {
  x: number;
  y: number;
  s?: number;
  delay?: number;
  flip?: boolean;
  clip: string;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      <g clipPath={`url(#${clip})`}>
        <g style={{ animation: `lc-mu-rise 0.75s cubic-bezier(0.25, 0.9, 0.35, 1) ${delay}s both` }}>
          <g
            style={{
              transformBox: "fill-box",
              transformOrigin: "50% 100%",
              animation: `lc-mu-wave 1.1s ease-in-out ${(delay + 0.75).toFixed(2)}s infinite`,
            }}
          >
            {/* Forearm: radius and ulna, running on down into the ground */}
            <path d="M-2.6 10L-3-17M2.6 10L3.2-17" strokeWidth={3.6} {...BONE_STROKE} />
            {/* Wrist */}
            <ellipse cx={0} cy={-20.5} rx={6.8} ry={4.6} fill={MU.bone} />
            {/* Palm bones, splaying out to the knuckles */}
            <path
              d="M-4.6-22.5L-7.4-31.5M-1.6-23.5L-2.6-34M1.6-23.5L2.4-34M4.6-22.5L7-31"
              strokeWidth={2.5}
              {...BONE_STROKE}
            />
            {/* Fingers, two joints each */}
            <path
              d="M-7.9-33.8L-9.2-39.6M-9.6-41.6L-10.4-45.6M-2.8-36.4L-3.3-43M-3.5-45L-3.8-49.6M2.6-36.4L3.2-43M3.4-45L3.8-49.6M7.5-33.4L8.8-39M9.2-41L10-44.6"
              strokeWidth={2.3}
              {...BONE_STROKE}
            />
            {/* Thumb */}
            <path d="M-6-19.5L-10.5-24.5M-11.8-26.2L-13.6-29.6" strokeWidth={2.4} {...BONE_STROKE} />
          </g>
        </g>
      </g>
      {/* The earth heaving up where it breaks through */}
      <path d="M-13 1Q-6-4.5 0-5 6-4.5 13 1Z" fill={MU.stoneInk} />
      {DIRT.map((d, i) => (
        <circle
          key={i}
          cx={0}
          cy={-3}
          r={d.r}
          fill={i % 2 ? MU.stoneInk : "#4A3A5E"}
          style={{
            ["--dx" as string]: `${d.dx}px`,
            ["--dy" as string]: `${d.dy}px`,
            opacity: 0,
            animation: `lc-mu-dirt 0.7s cubic-bezier(0.2, 0.7, 0.4, 1) ${(delay + 0.1 + i * 0.03).toFixed(2)}s both`,
          }}
        />
      ))}
    </g>
  );
}

/* ------------------------------------------------------------------ in the air */

/**
 * A monarch butterfly (40 × 30 grid), seen from above. Monarchs arrive in Mexico around
 * the Day of the Dead and are said to carry the souls home. Wings beat every `flap` seconds,
 * folding in about the body at x = 20.
 */
export function Monarch({ size, flap }: { size: number; flap: number }) {
  return (
    <svg viewBox="0 0 40 30" width={size} height={size * 0.75} style={{ overflow: "visible" }}>
      <g
        style={{
          transformOrigin: "20px 15px",
          animation: `lc-wing ${flap}s ease-in-out infinite`,
        }}
      >
        {MONARCH_WINGS}
      </g>
      {MONARCH_BODY}
    </svg>
  );
}

/** A single marigold petal (10 × 14 grid), in the given colour. */
export function Petal({ size, color }: { size: number; color: string }) {
  return (
    <svg viewBox="0 0 10 14" width={size} height={size * 1.4} className="block">
      <path
        d="M 5 0 C 5.8 2.1 8.4 3.2 8.8 5.1 C 10.8 6.6 9.3 8 9.5 9.5 C 9.4 12.1 7.4 14 5 14 C 2.6 14 .6 12.1 .5 9.5 C .7 8 -.8 6.6 1.2 5.1 C 1.6 3.2 4.2 2.1 5 0 Z"
        fill={color}
      />
      <path
        d="M 5 3 C 4.2 6 5.9 9 5 11.8"
        fill="none"
        stroke="#141A33"
        strokeWidth="0.7"
        strokeLinecap="round"
        opacity="0.18"
      />
    </svg>
  );
}

/** A maraca (20 × 44 grid), painted like the one the dancing calavera holds. */
export function Maraca({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg aria-hidden viewBox="0 0 20 44" className={className} style={{ overflow: "visible", ...style }}>
      <rect x={8.4} y={18} width={3.2} height={25} rx={1.6} fill={MU.teal} />
      <ellipse cx={10} cy={11} rx={8.5} ry={10.5} fill={MU.orange} />
      <path d="M1.7 9.2Q10 14.6 18.3 9.2L18.5 12.8Q10 18.6 1.5 12.8Z" fill={MU.rose} />
      <circle cx={6.5} cy={5.4} r={1.3} fill={MU.gold} />
      <circle cx={11.8} cy={4.2} r={1.3} fill={MU.gold} />
      <circle cx={7.6} cy={17.4} r={1.1} fill={MU.gold} />
      <circle cx={12.6} cy={17} r={1.1} fill={MU.gold} />
    </svg>
  );
}

/* ------------------------------------------------------------------ the mascot */

/**
 * The calavera mascot (180 × 180 grid), one face per bet tier: resting in peace, a candle in
 * its eye, marigold eyes, dancing with a maraca, monarchs circling, flames over its head.
 */
export function CalaveraFace({
  tier,
  className,
  style,
}: {
  tier: number;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 180 180"
      className={className}
      style={{ overflow: "visible", ...style }}
    >
      {CALAVERA_FACES[Math.max(0, Math.min(CALAVERA_FACES.length - 1, tier))]}
    </svg>
  );
}
