"use client";

import { memo } from "react";
import { BUILDING_ART, type BuildingArt } from "@/components/scenes/night-buildings";
import { frac } from "@/lib/rand";

/**
 * Night's city, built from the eight building illustrations in ./art/night/buildings: two rows
 * (a hazy row behind, a dark row in front) across a 3200 × 170 strip, each building picked,
 * sized and sometimes mirrored deterministically. Windows stay separate so they light up one by
 * one as the bet grows; a few glow TV-blue, and antenna tips carry blinking red beacons.
 *
 * The strip is cropped (not squashed) to the hero; it's wide enough that the height decides
 * the scale up to ~1700px wide, so rooftops are never cut off.
 */

const SKY_W = 3200;
const SKY_H = 170;

type Placed = {
  art: BuildingArt;
  transform: string;
  /** When (as a share of the bet) each window's light comes on. */
  on: number[];
  tv: boolean[];
  beaconDelay: number;
};

/** How often each building turns up, in BUILDING_ART order: the tall towers are rarer. */
const WEIGHTS = [0.8, 0.8, 1.2, 0.9, 0.7, 1.2, 1.3, 1.2];
const TOTAL = WEIGHTS.reduce((a, b) => a + b, 0);

function pick(r: number) {
  let acc = 0;
  for (let k = 0; k < WEIGHTS.length; k++) {
    acc += WEIGHTS[k] / TOTAL;
    if (r < acc) return k;
  }
  return WEIGHTS.length - 1;
}

function city(salt: number, minScale: number, maxScale: number): Placed[] {
  const out: Placed[] = [];
  let x = -30;
  let prev = -1;
  for (let i = 0; x < SKY_W; i++) {
    let k = pick(frac(i, salt));
    if (k === prev) k = (k + 1 + Math.floor(frac(i, salt + 1) * 6)) % BUILDING_ART.length;
    prev = k;
    const art = BUILDING_ART[k];
    // Never taller than the strip, so antennas aren't clipped
    const fit = (SKY_H - 2) / (SKY_H - art.top);
    const s = Math.min(fit, minScale + frac(i, salt + 2) * (maxScale - minScale));
    const flip = frac(i, salt + 3) > 0.5;
    const w = art.w * s;
    const ty = (SKY_H * (1 - s)).toFixed(2);
    out.push({
      art,
      transform: flip
        ? `translate(${(x + w).toFixed(2)} ${ty}) scale(${(-s).toFixed(3)} ${s.toFixed(3)})`
        : `translate(${x.toFixed(2)} ${ty}) scale(${s.toFixed(3)})`,
      on: art.windows.map((_, n) => frac(i * 53 + n, salt + 4)),
      tv: art.windows.map((_, n) => frac(i * 53 + n, salt + 5) > 0.92),
      beaconDelay: Math.round(frac(i, salt + 6) * 24) / 10,
    });
    // The art has a little air at each side, so neighbours tuck in close
    x += w * (0.9 + frac(i, salt + 7) * 0.14);
  }
  return out;
}

const BACK = city(70, 1, 1.35);
const FRONT = city(30, 0.78, 1.08);

const MASK =
  "linear-gradient(90deg, #000 0%, #000 26%, rgba(0,0,0,0.25) 40%, rgba(0,0,0,0.25) 60%, #000 74%, #000 100%)";

function Row({ row, fill, lit, glow, dim }: { row: Placed[]; fill: string; lit: number; glow: string; dim: number }) {
  return (
    <>
      {row.map((b, i) => (
        <g key={i} transform={b.transform}>
          <path d={b.art.d} fill={fill} />
          {b.art.windows.map(([x, y, w, h], n) => {
            const on = b.on[n] < lit;
            return (
              <rect
                key={n}
                x={x}
                y={y}
                width={w}
                height={h}
                rx={1.5}
                fill={b.tv[n] ? "#A9C2FF" : glow}
                opacity={on ? dim : 0}
                style={{
                  transition: "opacity 300ms",
                  animation: on && b.tv[n] ? `lc-tv ${(1.4 + (n % 5) * 0.3).toFixed(1)}s steps(1) infinite` : undefined,
                }}
              />
            );
          })}
          {b.art.beacon && (
            <circle
              cx={b.art.beacon[0]}
              cy={b.art.beacon[1]}
              r={3.2}
              fill="#FF4D5E"
              style={{
                filter: "drop-shadow(0 0 4px rgba(255,77,94,0.9))",
                animation: `lc-beacon 2.4s ease-in-out ${b.beaconDelay}s infinite`,
              }}
            />
          )}
        </g>
      ))}
    </>
  );
}

/** `lit` is the share of windows with the lights on, 0..1. */
export const Skyline = memo(function Skyline({ lit }: { lit: number }) {
  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${SKY_W} ${SKY_H}`}
      preserveAspectRatio="xMidYMax slice"
      className="absolute inset-x-0 bottom-0 h-[72px] w-full sm:h-[108px]"
      // Thins out in the middle, so it never sits behind the tier label or the Set Alarm button
      style={{ maskImage: MASK, WebkitMaskImage: MASK }}
    >
      <Row row={BACK} fill="#1F0F2E" lit={lit * 0.8} glow="#FFB060" dim={0.45} />
      <Row row={FRONT} fill="#0D0716" lit={lit} glow="#FFC870" dim={0.9} />
    </svg>
  );
});
