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
}) {
  const on = { opacity: lit ? 1 : 0, transition: "opacity 450ms ease-out" };
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
        style={{ ...on, transition: "opacity 450ms ease-out, r 400ms" }}
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
      {/* Flame, its base just over the wick */}
      <g
        transform={`translate(0 ${-h - 4}) scale(${flare})`}
        style={{ ...on, transition: "opacity 450ms ease-out, transform 400ms" }}
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

/** A headstone, 28 wide and 44 tall, standing on (x, y); `cross` carves a cross in it. */
export function Headstone({ x, y, s = 1, cross = false }: { x: number; y: number; s?: number; cross?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>{cross ? HEADSTONE_CROSS : HEADSTONE_LINES}</g>
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
