"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import {
  BOLT_SHORT,
  BOLT_TALL,
  CARD_BACK,
  CLOUDS,
  EYE_IRIS,
  EYE_LID,
  EYE_TOP,
  EYE_WHITE,
  MOON_FACES,
  MOON_RAYS,
  PLANETS,
  SUN_FACES,
  SUN_RAYS,
} from "@/components/scenes/tarot-svg";
import type { SceneMood } from "@/components/scenes/types";

/**
 * Tarot illustrations. The art itself comes from the SVGs in ./art/tarot (inlined in
 * tarot-svg.tsx so nothing loads late); these components place it and animate it.
 * The prompts that made that art are in docs/tarot-theme-svg-prompts.md.
 */

export const TA = {
  ink: "#17383A",
  mint: "#9CD3C7",
  teal: "#2E6E6A",
  coral: "#F07F68",
  blush: "#F5B3A3",
  chartreuse: "#D7EA7B",
  cream: "#FBF4E6",
  gold: "#E2AE4A",
};

/** Turns an SVG group about (cx, cy) at `speed` degrees a second, which can change smoothly. */
export function useTurning(speed: number, cx: number, cy: number) {
  const ref = useRef<SVGGElement>(null);
  const rate = useRef(speed);
  rate.current = speed;
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let angle = 0;
    let last = performance.now();
    let id = requestAnimationFrame(function frame(now) {
      angle = (angle + ((now - last) / 1000) * rate.current) % 360;
      last = now;
      ref.current?.setAttribute("transform", `rotate(${angle.toFixed(2)} ${cx} ${cy})`);
      id = requestAnimationFrame(frame);
    });
    return () => cancelAnimationFrame(id);
  }, [cx, cy]);
  return ref;
}

/** A new face pops in, like the tier icons do. */
const POP: CSSProperties = {
  transformBox: "fill-box",
  transformOrigin: "center",
  animation: "lc-icon-pop 0.45s cubic-bezier(0.2, 0.9, 0.3, 1.2) both",
};

/**
 * The sun (180 × 180 grid), one face per bet tier: serene, dreamy, knowing, devilish, alarmed,
 * wild with joy. Its rays turn, faster the bigger the bet.
 */
export function TarotSun({
  face,
  speed,
  className,
  style,
}: {
  /** 0 temperance, 1 star, 2 fortune, 3 devil, 4 tower, 5 fool. */
  face: number;
  /** How fast the rays turn, degrees a second. */
  speed: number;
  className?: string;
  style?: CSSProperties;
}) {
  const rays = useTurning(speed, 90, 90);
  const i = Math.max(0, Math.min(SUN_FACES.length - 1, face));
  return (
    <svg aria-hidden viewBox="0 0 180 180" className={className} style={{ overflow: "visible", ...style }}>
      <g ref={rays}>{SUN_RAYS}</g>
      <g key={i} style={POP}>
        {SUN_FACES[i]}
      </g>
    </svg>
  );
}

const MOON_MOODS: SceneMood[] = ["idle", "set", "win", "loss", "jackpot"];

/** The crescent moon (180 × 180 grid), whose face follows the draw: asleep, peeking, blissful, aghast, winking. */
export function TarotMoon({ mood, className, style }: { mood: SceneMood; className?: string; style?: CSSProperties }) {
  const i = Math.max(0, MOON_MOODS.indexOf(mood));
  return (
    <svg aria-hidden viewBox="0 0 180 180" className={className} style={{ overflow: "visible", ...style }}>
      <g style={{ transformOrigin: "90px 90px", animation: "lc-spin 140s linear infinite reverse" }}>{MOON_RAYS}</g>
      <g key={i} style={POP}>
        {MOON_FACES[i]}
      </g>
    </svg>
  );
}

/** One of the four planets (64 × 64 cells): ringed, small ringed, banded, a comet tick. */
export function Planet({ kind, size }: { kind: number; size: number }) {
  return (
    <svg aria-hidden viewBox={`${(kind % 4) * 74} 0 64 64`} width={size} height={size} className="block">
      {PLANETS[kind % 4]}
    </svg>
  );
}

/** A lightning bolt (90 × 240), from top right down to a point at bottom left. Size it by width. */
export function Bolt({ tall, className }: { tall: boolean; className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox={tall ? "0 0 90 240" : "110 0 90 240"}
      className={`block h-auto ${className ?? ""}`}
      style={{ overflow: "visible" }}
    >
      {tall ? BOLT_TALL : BOLT_SHORT}
    </svg>
  );
}

/**
 * A scalloped tattoo cloud (280 × 160 grid, flat bottom at y = 132). Give it a pixel `width`, or
 * size it with `className`.
 */
export function TarotCloud({
  kind,
  width,
  fill = TA.cream,
  className = "block",
}: {
  kind: number;
  width?: number;
  fill?: string;
  className?: string;
}) {
  const c = CLOUDS[kind % 3];
  return (
    <svg
      aria-hidden
      viewBox="0 0 280 160"
      width={width}
      height={width ? (width * 160) / 280 : undefined}
      className={className}
    >
      <g fill={fill} style={{ transition: "fill 600ms" }}>
        {c.outline}
      </g>
      {c.creases}
    </svg>
  );
}

const FACE: CSSProperties = { backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" };

/**
 * A tarot card (140 × 240), as wide as its container. Face down it shows the card back; `flipped`
 * turns it over to show `face` (drawn on the same grid) on cream card stock.
 */
export function TarotCard({
  flipped,
  face,
  reversed = false,
}: {
  flipped: boolean;
  face?: ReactNode;
  /** Turns the face upside down: a reversed card. */
  reversed?: boolean;
}) {
  return (
    <div className="relative aspect-[140/240] w-full" style={{ perspective: 700 }}>
      <div
        className="absolute inset-0"
        style={{
          transformStyle: "preserve-3d",
          transform: `rotateY(${flipped ? 180 : 0}deg)`,
          transition: "transform 700ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <svg aria-hidden viewBox="0 0 140 240" className="absolute inset-0 h-full w-full" style={FACE}>
          {CARD_BACK}
        </svg>
        <svg
          aria-hidden
          viewBox="0 0 140 240"
          className="absolute inset-0 h-full w-full"
          style={{ ...FACE, transform: "rotateY(180deg)" }}
        >
          <rect x="1.5" y="1.5" width="137" height="237" rx="10" fill={TA.cream} stroke={TA.ink} strokeWidth="3" />
          <rect x="9" y="9" width="122" height="222" rx="5" fill="none" stroke={TA.ink} strokeWidth="1.5" />
          <g transform={reversed ? "rotate(180 70 120)" : undefined}>{face}</g>
        </svg>
      </div>
    </div>
  );
}

/** The all-seeing eye (160 × 110), glancing about and blinking now and then. */
export function SeeingEye({ width }: { width: number }) {
  return (
    <svg aria-hidden viewBox="20 14 120 82" width={width} height={(width * 82) / 120} className="block">
      <g style={{ transformOrigin: "80px 70px", animation: "lc-eye-rays 2.4s ease-in-out infinite" }}>
        {EYE_TOP}
      </g>
      <g style={{ transformOrigin: "80px 70px", animation: "lc-eye-blink 3.2s ease-in-out infinite" }}>
        {EYE_WHITE}
        <g style={{ animation: "lc-eye-glance 3.2s ease-in-out infinite" }}>{EYE_IRIS}</g>
        {EYE_LID}
      </g>
    </svg>
  );
}

/** An engraved four-point sparkle or eight-point star, on a 24-unit grid. */
const SPARKLE =
  "M12 1.5C12.7 7.6 16.4 11.3 22.5 12 16.4 12.7 12.7 16.4 12 22.5 11.3 16.4 7.6 12.7 1.5 12 7.6 11.3 11.3 7.6 12 1.5z";
const STAR8 =
  "M12 1.5 13.5 8.4 18.7 5.3 15.6 10.5 22.5 12 15.6 13.5 18.7 18.7 13.5 15.6 12 22.5 10.5 15.6 5.3 18.7 8.4 13.5 1.5 12 8.4 10.5 5.3 5.3 10.5 8.4z";

export function Sparkle({ eight, size, fill }: { eight: boolean; size: number; fill: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" width={size} height={size} className="block" style={{ overflow: "visible" }}>
      <path
        d={eight ? STAR8 : SPARKLE}
        fill={fill}
        stroke={TA.ink}
        strokeWidth={size < 14 ? 2.2 : 1.6}
        strokeLinejoin="round"
      />
    </svg>
  );
}
