import { splitClock } from "@/lib/time";

/** Digit cell in SVG units. */
const W = 48;
const H = 88;
const T = 9; // segment thickness
const G = 1.6; // gap between segments
const h = T / 2;

function hSeg(x1: number, x2: number, y: number) {
  return `${x1},${y} ${x1 + h},${y - h} ${x2 - h},${y - h} ${x2},${y} ${x2 - h},${y + h} ${x1 + h},${y + h}`;
}
function vSeg(x: number, y1: number, y2: number) {
  return `${x},${y1} ${x + h},${y1 + h} ${x + h},${y2 - h} ${x},${y2} ${x - h},${y2 - h} ${x - h},${y1 + h}`;
}

const SEG = {
  a: hSeg(h + G, W - h - G, h),
  b: vSeg(W - h, h + G, H / 2 - G),
  c: vSeg(W - h, H / 2 + G, H - h - G),
  d: hSeg(h + G, W - h - G, H - h),
  e: vSeg(h, H / 2 + G, H - h - G),
  f: vSeg(h, h + G, H / 2 - G),
  g: hSeg(h + G, W - h - G, H / 2),
} as const;

type SegName = keyof typeof SEG;
const ALL = Object.keys(SEG) as SegName[];
const DIGITS = ["abcdef", "bc", "abdeg", "abcdg", "bcfg", "acdfg", "acdefg", "abc", "abcdefg", "abcdfg"];

/** x of each digit cell; the colon sits between the 2nd and 3rd. */
const GAP = 12;
const COLON = 18;
const SLOTS = [0, W + GAP, 2 * W + 2 * GAP + COLON, 3 * W + 3 * GAP + COLON];
const COLON_X = (SLOTS[1] + W + SLOTS[2]) / 2;
const AMPM_X = SLOTS[3] + W + 14;

type Props = {
  /** Minutes from midnight. */
  minutes: number;
  on: string;
  off: string;
  glow: string | null;
  font: string;
  /** Whole display blinks, like a clock that's just been set. */
  blink?: boolean;
  /** Colon ticks once a second, like a running clock. */
  running?: boolean;
  /** Rendered height; width follows the digits. */
  height: string;
};

export function SevenSegment({ minutes, on, off, glow, font, blink, running, height }: Props) {
  const { h12, minute, pm } = splitClock(minutes);
  const digits = [h12 >= 10 ? 1 : null, h12 % 10, Math.floor(minute / 10), minute % 10];
  // Drop the empty leading digit so "7:30" sits centred, not shifted right.
  const firstSlot = digits[0] === null ? 1 : 0;
  const minX = SLOTS[firstSlot] - 16;
  const maxX = AMPM_X + 30;

  return (
    <svg
      viewBox={`${minX} -8 ${maxX - minX} 104`}
      className="block overflow-visible"
      style={{ height, width: "auto" }}
      role="img"
      aria-label={`${h12}:${String(minute).padStart(2, "0")} ${pm ? "PM" : "AM"}`}
    >
      <g transform="skewX(-6)">
        {/* Unlit segments, so it reads as a real display */}
        {SLOTS.slice(firstSlot).map((x) => (
          <g key={x} transform={`translate(${x} 0)`}>
            {ALL.map((s) => (
              <polygon key={s} points={SEG[s]} fill={off} />
            ))}
          </g>
        ))}
        <text x={AMPM_X} y={30} fontSize={15} fontWeight={700} fill={off} style={{ fontFamily: font }}>
          AM
        </text>
        <text x={AMPM_X} y={56} fontSize={15} fontWeight={700} fill={off} style={{ fontFamily: font }}>
          PM
        </text>

        <g
          className={blink ? "lc-clock-blink" : undefined}
          style={{ filter: glow ? `drop-shadow(0 0 5px ${glow})` : undefined }}
        >
          {SLOTS.map((x, i) => {
            const d = digits[i];
            if (d === null) return null;
            return (
              <g key={i} transform={`translate(${x} 0)`}>
                {DIGITS[d].split("").map((s) => (
                  <polygon
                    key={s}
                    points={SEG[s as SegName]}
                    fill={on}
                    style={{ transition: "fill 300ms ease" }}
                  />
                ))}
              </g>
            );
          })}
          <g className={running ? "lc-clock-blink" : undefined}>
            <circle cx={COLON_X} cy={28} r={4.8} fill={on} />
            <circle cx={COLON_X} cy={60} r={4.8} fill={on} />
          </g>
          <text
            x={AMPM_X}
            y={pm ? 56 : 30}
            fontSize={15}
            fontWeight={700}
            fill={on}
            style={{ fontFamily: font }}
          >
            {pm ? "PM" : "AM"}
          </text>
        </g>
      </g>
    </svg>
  );
}
