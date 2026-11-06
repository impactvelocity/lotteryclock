"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import {
  BOLT_SHORT,
  BOLT_TALL,
  BONES,
  CLOUDS,
  EYE_IRIS,
  EYE_LID,
  EYE_TOP,
  EYE_WHITE,
  FLAMES,
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
 * A flash-tattoo flame (70 × 110, base at the bottom middle). Its three layers flicker on
 * their own rhythms. Size it by height.
 */
export function Flame({
  kind,
  dur,
  delay,
  className,
  style,
}: {
  kind: number;
  dur: number;
  delay: number;
  className?: string;
  style?: CSSProperties;
}) {
  const f = FLAMES[kind % 3];
  const layer = (k: number): CSSProperties => ({
    transformBox: "fill-box",
    transformOrigin: "50% 100%",
    animation: `lc-flicker ${(dur * (1 - k * 0.18)).toFixed(2)}s ease-in-out ${(delay - k * 0.17).toFixed(2)}s infinite`,
  });
  return (
    <svg
      aria-hidden
      viewBox={`${(kind % 3) * 80} 0 70 110`}
      className={className}
      style={{ overflow: "visible", aspectRatio: "70 / 110", ...style }}
    >
      <g style={layer(0)}>{f.outer}</g>
      <g style={layer(1)}>{f.middle}</g>
      <g style={layer(2)}>{f.inner}</g>
    </svg>
  );
}

/** A scalloped tattoo cloud (280 × 160 grid, flat bottom at y = 132). */
export function TarotCloud({ kind, width }: { kind: number; width: number }) {
  const c = CLOUDS[kind % 3];
  return (
    <svg aria-hidden viewBox="0 0 280 160" width={width} height={(width * 160) / 280} className="block">
      {c.outline}
      {c.creases}
    </svg>
  );
}

/** A friendly memento mori for the bottom-left corner (260 × 140); mirror it for the right. */
export function Bones({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg aria-hidden viewBox="0 0 260 140" className={className} style={style}>
      {BONES}
    </svg>
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
