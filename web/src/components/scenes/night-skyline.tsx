"use client";

import { memo } from "react";
import { BUILDING_ART, type BuildingArt } from "@/components/scenes/night-buildings";
import { frac } from "@/lib/rand";

/**
 * Night's city, built from the twelve building illustrations in ./art/night/buildings: two rows
 * (a hazy row behind, a dark row in front) across a 3200 × 300 strip, each building picked,
 * sized and sometimes mirrored deterministically. Most buildings get extra storeys stacked into
 * their bodies, so the skyline climbs into proper towers either side of the dial (the middle
 * stays low, behind the tier label and the Set Alarm button). Windows stay separate so they
 * light up one by one as the bet grows; a few glow TV-blue, and antenna tips carry blinking
 * red beacons.
 *
 * The strip is cropped (not squashed) to the hero; it's wide enough that the height decides
 * the scale up to ~2100px wide, so rooftops are never cut off. Its foot fades out, so the
 * rail's minute ticks still read in front of it.
 */

const SKY_W = 3200;
const SKY_H = 300;
/** The art's own grid: every building is drawn 170 high with a flat bottom. */
const ART_H = 170;

type Win = [number, number, number, number];

/** How each building grows taller: repeat a storey (row `ref` of windows) `pitch` apart. */
type Stretch = {
  /** The body's footprint at the bottom, x0..x1: plain walls from `cut` down. */
  x0: number;
  x1: number;
  /** Everything above this line moves up when storeys are added. */
  cut: number;
  pitch: number;
  ref: Win[];
};

function stretchOf(art: BuildingArt): Stretch | null {
  // A house doesn't grow storeys
  if (art.name === "gabled-house") return null;
  const ys = [...new Set(art.windows.map((w) => w[1]))].sort((a, b) => a - b);
  if (ys.length < 3) return null;
  // The second row up: the bottom row can be a door or shopfront
  const refY = ys[ys.length - 2];
  const ref = art.windows.filter((w) => w[1] === refY);
  const pitch = ys[ys.length - 1] - refY;
  const x0 = Number(art.d.match(/^M\s*([\d.]+)/)?.[1] ?? 0);
  // Every silhouette is symmetric at its foot
  return { x0, x1: art.w - x0, cut: refY - (pitch - ref[0][3]) / 2, pitch, ref };
}

const STRETCH = BUILDING_ART.map(stretchOf);

type Placed = {
  art: BuildingArt;
  transform: string;
  /** Extra height added to the body, in art units. */
  ext: number;
  windows: Win[];
  /** When (as a share of the bet) each window's light comes on. */
  on: number[];
  tv: boolean[];
  beaconDelay: number;
};

/**
 * How often each building turns up, in BUILDING_ART order: the tall towers are rarer, and the
 * landmarks (clock tower, radio mast) rarest.
 */
const WEIGHTS = [0.8, 0.7, 1, 0.6, 0.6, 1, 1.1, 1, 0.45, 0.8, 1, 0.5];
const TOTAL = WEIGHTS.reduce((a, b) => a + b, 0);

function pick(r: number) {
  let acc = 0;
  for (let k = 0; k < WEIGHTS.length; k++) {
    acc += WEIGHTS[k] / TOTAL;
    if (r < acc) return k;
  }
  return WEIGHTS.length - 1;
}

/** `rise` is how many storeys a building may gain, at most; fewer towards the middle. */
function city(salt: number, minScale: number, maxScale: number, rise: number): Placed[] {
  const out: Placed[] = [];
  let x = -30;
  let prev = -1;
  for (let i = 0; x < SKY_W; i++) {
    let k = pick(frac(i, salt));
    if (k === prev) k = (k + 1 + Math.floor(frac(i, salt + 1) * 6)) % BUILDING_ART.length;
    prev = k;
    const art = BUILDING_ART[k];
    const st = STRETCH[k];
    let s = minScale + frac(i, salt + 2) * (maxScale - minScale);

    // Low in the middle (behind the label and button), climbing towards the edges
    const fromMid = Math.min(1, Math.abs(x + (art.w * s) / 2 - SKY_W / 2) / 900);
    const headroom = fromMid < 0.35 ? 0 : (fromMid - 0.35) / 0.65;
    let floors = st ? Math.round(frac(i, salt + 8) ** 1.2 * rise * (0.25 + headroom * 0.75)) : 0;
    // Never taller than the strip, so antennas aren't clipped
    const tall = () => (ART_H - art.top + floors * (st?.pitch ?? 0)) * s;
    while (floors > 0 && tall() > SKY_H - 2) floors--;
    if (tall() > SKY_H - 2) s = (SKY_H - 2) / (ART_H - art.top);
    const ext = st ? floors * st.pitch : 0;
    const w = art.w * s;

    // Windows above the cut move up with the roof; new storeys copy the reference row
    const windows: Win[] = art.windows.map(([wx, wy, ww, wh]) =>
      st && wy < st.cut ? [wx, wy - ext, ww, wh] : [wx, wy, ww, wh],
    );
    if (st)
      for (let f = 1; f <= floors; f++)
        for (const [wx, wy, ww, wh] of st.ref) windows.push([wx, wy - f * st.pitch, ww, wh]);

    const flip = frac(i, salt + 3) > 0.5;
    const ty = (SKY_H - ART_H * s).toFixed(2);
    out.push({
      art,
      ext,
      transform: flip
        ? `translate(${(x + w).toFixed(2)} ${ty}) scale(${(-s).toFixed(3)} ${s.toFixed(3)})`
        : `translate(${x.toFixed(2)} ${ty}) scale(${s.toFixed(3)})`,
      windows,
      on: windows.map((_, n) => frac(i * 53 + n, salt + 4)),
      tv: windows.map((_, n) => frac(i * 53 + n, salt + 5) > 0.93),
      beaconDelay: Math.round(frac(i, salt + 6) * 24) / 10,
    });
    // The art has a little air at each side, so neighbours tuck in close
    x += w * (0.9 + frac(i, salt + 7) * 0.14);
  }
  return out;
}

const BACK = city(70, 1, 1.3, 10);
const FRONT = city(30, 0.8, 1.06, 7);

/** Thins out in the middle, so it never sits behind the tier label or the Set Alarm button. */
const MASK_X =
  "linear-gradient(90deg, #000 0%, #000 26%, rgba(0,0,0,0.22) 40%, rgba(0,0,0,0.22) 60%, #000 74%, #000 100%)";
/** And fades out at its foot, so the rail's minute ticks read in front of it. */
const MASK_Y =
  "linear-gradient(0deg, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.45) 10%, rgba(0,0,0,0.85) 22%, #000 32%)";

function Row({ row, fill, lit, glow, dim }: { row: Placed[]; fill: string; lit: number; glow: string; dim: number }) {
  return (
    <>
      {row.map((b, i) => {
        const st = STRETCH[BUILDING_ART.indexOf(b.art)];
        return (
          <g key={i} transform={b.transform}>
            {/* The roof and upper floors, lifted; the stretched body fills in underneath */}
            <path
              d={b.art.d}
              fill={fill}
              fillRule={b.art.evenodd ? "evenodd" : undefined}
              transform={b.ext ? `translate(0 ${-b.ext})` : undefined}
            />
            {st && b.ext > 0 && (
              <rect x={st.x0} y={st.cut - b.ext - 0.5} width={st.x1 - st.x0} height={ART_H - st.cut + b.ext + 0.5} fill={fill} />
            )}
            {b.windows.map(([x, y, w, h], n) => {
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
                cy={b.art.beacon[1] - b.ext}
                r={3.2}
                fill="#FF4D5E"
                style={{
                  filter: "drop-shadow(0 0 4px rgba(255,77,94,0.9))",
                  animation: `lc-beacon 2.4s ease-in-out ${b.beaconDelay}s infinite`,
                }}
              />
            )}
          </g>
        );
      })}
    </>
  );
}

/** `lit` is the share of windows with the lights on, 0..1. */
export const Skyline = memo(function Skyline({ lit }: { lit: number }) {
  return (
    <div
      aria-hidden
      className="absolute inset-x-0 bottom-0 h-[120px] sm:h-[210px]"
      style={{ maskImage: MASK_Y, WebkitMaskImage: MASK_Y }}
    >
      <svg
        viewBox={`0 0 ${SKY_W} ${SKY_H}`}
        preserveAspectRatio="xMidYMax slice"
        className="block h-full w-full"
        style={{ maskImage: MASK_X, WebkitMaskImage: MASK_X }}
      >
        <Row row={BACK} fill="#22102F" lit={lit * 0.8} glow="#FFB060" dim={0.4} />
        <Row row={FRONT} fill="#0C0614" lit={lit} glow="#FFC870" dim={0.9} />
      </svg>
    </div>
  );
});
