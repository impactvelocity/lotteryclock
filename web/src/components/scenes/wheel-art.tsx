"use client";

/**
 * Prize wheel's illustrations, inlined from the SVGs in ./art/wheel (so nothing loads late and
 * the wedges can light up live). Edit those files, then mirror the changes here.
 */

import type { CSSProperties } from "react";
import { MAX_RANGE } from "@/lib/themes";

/** A four-point sparkle on a 24-unit grid. */
export const SPARKLE =
  "M12 0C12.8 7 17 11.2 24 12 17 12.8 12.8 17 12 24 11.2 17 7 12.8 0 12 7 11.2 11.2 7 12 0z";

/** A five-point star centred on a 64-unit grid. */
const STAR =
  "M32 22L34.47 28.6 41.51 28.91 35.99 33.3 37.88 40.09 32 36.2 26.12 40.09 28.01 33.3 22.49 28.91 29.53 28.6z";

/* ---------------- Tokens: chips and coins that float round the hero ---------------- */

export const CHIP_COLORS = {
  pink: { face: "#F0478A", ring: "#C22E6A", centre: "#FF66A1" },
  violet: { face: "#8A4DFF", ring: "#6631D6", centre: "#A06BFF" },
  mint: { face: "#2FD39A", ring: "#1A9E72", centre: "#5BE3B2" },
} as const;

export type ChipColor = keyof typeof CHIP_COLORS;

type ArtProps = { size: number; className?: string; style?: CSSProperties };

/** A casino chip: six edge inserts, a dashed inlay and a sparkle in the middle (art/wheel/chip-*.svg). */
export function Chip({ color, size, className, style }: ArtProps & { color: ChipColor }) {
  const c = CHIP_COLORS[color];
  return (
    <svg aria-hidden viewBox="0 0 64 64" width={size} height={size} className={className} style={style}>
      <circle cx="32" cy="32" r="30" fill={c.face} />
      {/* Edge inserts: six dashes round the rim */}
      <circle
        cx="32"
        cy="32"
        r="26"
        fill="none"
        stroke="#FFF4E0"
        strokeWidth="8"
        strokeDasharray="9 18.23"
        transform="rotate(-100 32 32)"
      />
      <path d="M2 30A30 30 0 0 1 62 30C50 36 14 36 2 30z" fill="#FFFFFF" opacity="0.14" />
      <circle cx="32" cy="32" r="19" fill={c.ring} />
      <circle
        cx="32"
        cy="32"
        r="19"
        fill="none"
        stroke="#FFF4E0"
        strokeWidth="1.6"
        strokeDasharray="3 3.25"
        opacity="0.85"
      />
      <circle cx="32" cy="32" r="14" fill={c.centre} />
      <path d={SPARKLE} fill="#FFF4E0" transform="translate(23 23) scale(0.75)" />
    </svg>
  );
}

/** A gold coin with a star (art/wheel/coin.svg). */
export function Coin({ size, className, style }: ArtProps) {
  return (
    <svg aria-hidden viewBox="0 0 64 64" width={size} height={size} className={className} style={style}>
      <circle cx="32" cy="32" r="29" fill="#E3921A" />
      <circle cx="32" cy="32" r="25" fill="#FFC93D" />
      <path d="M7 31A25 25 0 0 1 57 31C46 36 18 36 7 31z" fill="#FFE38A" />
      <circle cx="32" cy="32" r="19" fill="none" stroke="#EBA22B" strokeWidth="2" />
      <path d={STAR} fill="#EBA22B" />
    </svg>
  );
}

/** Lucky charms that float with the chips (art/wheel/token-*.svg), each on a 64-unit grid. */
const CLOVER_LEAF = (
  <>
    <path
      d="M 32 30 C 24 27 14 22 18 13 C 21 6 29 8 32 13 C 35 8 43 6 46 13 C 50 22 40 27 32 30 Z"
      fill="#2FD39A"
    />
    <path d="M 20 16 C 20 10 27 10 29 14 Q 24 12 22 18 Q 21 20 20 16 Z" fill="#FFF4E0" />
  </>
);

const CHARMS = {
  die: (
    <>
      <path
        d="M 9 18 Q 9 12 15 11 L 45 7 Q 49 7 53 12 L 57 17 V 48 Q 57 53 52 54 L 20 59 Q 16 59 12 55 L 9 51 Z"
        fill="#FFE38A"
      />
      <path d="M 9 17 Q 9 12 15 11 L 45 7 Q 49 7 52 11 L 56 16 Q 58 20 53 21 L 21 26 Q 17 27 14 24 Z" fill="#FFF4E0" />
      <path
        d="M 14 24 Q 17 27 21 26 L 53 21 Q 56 21 57 19 V 48 Q 57 53 52 54 L 21 59 V 31 Q 21 28 18 27 Z"
        fill="#FFF4E0"
      />
      <path d="M 9 21 L 15 26 Q 18 29 18 32 V 57 Q 14 57 12 54 L 9 51 Z" fill="#FFE38A" />
      <ellipse cx="20" cy="14" rx="2.6" ry="1.7" fill="#2A0C40" />
      <ellipse cx="43" cy="11" rx="2.6" ry="1.7" fill="#2A0C40" />
      <ellipse cx="32" cy="17" rx="2.6" ry="1.7" fill="#2A0C40" />
      <ellipse cx="22" cy="22" rx="2.6" ry="1.7" fill="#2A0C40" />
      <ellipse cx="47" cy="19" rx="2.6" ry="1.7" fill="#2A0C40" />
    </>
  ),
  cherries: (
    <>
      <path
        d="M 20 35 C 18 23 30 16 34 10 C 32 24 45 24 45 40 L 41 40 C 40 28 31 26 31 20 C 25 25 22 28 24 35 Z"
        fill="#2FD39A"
      />
      <path d="M 32 14 C 33 1 48 4 54 7 C 49 17 40 20 32 14 Z" fill="#2FD39A" />
      <path d="M 36 11 Q 43 7 49 8 Q 42 13 36 11 Z" fill="#FFF4E0" />
      <circle cx="19" cy="43" r="14" fill="#F0478A" />
      <circle cx="44" cy="45" r="14" fill="#F0478A" />
      <path d="M 6.5 37 Q 17 24 30 35 Q 18 32 6.5 37 Z" fill="#F4A98B" />
      <path d="M 31.5 39 Q 42 26 55 37 Q 43 34 31.5 39 Z" fill="#F4A98B" />
      <circle cx="14" cy="39" r="2.5" fill="#FFF4E0" />
      <circle cx="39" cy="41" r="2.5" fill="#FFF4E0" />
    </>
  ),
  horseshoe: (
    <>
      <path
        d="M 9 10 Q 9 7 12 7 H 21 Q 24 7 24 10 V 34 C 24 47 40 47 40 34 V 10 Q 40 7 43 7 H 52 Q 55 7 55 10 V 34 C 55 68 9 68 9 34 Z"
        fill="#FFC93D"
      />
      <path d="M 13 35 C 13 62 51 62 51 35 H 55 C 55 68 9 68 9 35 Z" fill="#E3921A" />
      <path
        d="M 11 12 Q 11 9 14 9 H 21 V 13 H 15 V 32 Q 15 40 18 43 C 13 40 11 36 11 31 Z M 43 9 H 50 Q 53 9 53 12 V 31 Q 53 36 50 39 V 14 H 43 Z"
        fill="#FFE38A"
      />
      {[
        [15, 17],
        [15, 27],
        [45, 17],
        [45, 27],
        [20, 44],
        [40, 44],
      ].map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="4" height="4" rx="1" fill="#E3921A" />
      ))}
    </>
  ),
  clover: (
    <>
      <path d="M 29 29 C 34 41 37 49 31 58 H 38 C 43 46 36 35 34 29 Z" fill="#2FD39A" />
      {[0, 90, 180, 270].map((a) => (
        <g key={a} transform={`rotate(${a} 32 30)`}>
          {CLOVER_LEAF}
        </g>
      ))}
    </>
  ),
  star: (
    <>
      <path
        d="M 30.8 5.5 Q 32 3 33.2 5.5 L 39 18.1 Q 40.2 20.7 43 21 L 56.8 22.7 Q 59.6 23 57.5 24.9 L 47.4 34.4 Q 45.3 36.3 45.9 39.1 L 48.5 52.7 Q 49 55.5 46.6 54.1 L 34.4 47.4 Q 32 46 29.6 47.4 L 17.4 54.1 Q 15 55.5 15.5 52.7 L 18.1 39.1 Q 18.7 36.3 16.6 34.4 L 6.5 24.9 Q 4.4 23 7.2 22.7 L 21 21 Q 23.8 20.7 25 18.1 L 30.8 5.5 Z"
        fill="#FFC93D"
      />
      <path
        d="M 32 9 Q 33 9 34 12 L 39 23 L 51 25 Q 51 27 48 28 L 37 27 L 32 17 L 27 27 L 14 29 Q 12 29 13 27 L 25 23 L 30 12 Q 31 9 32 9 Z"
        fill="#FFE38A"
      />
      <path d="M 16 48 L 21 44 L 32 38 L 45 45 L 49 52 Q 50 54 47 53 L 32 45 L 17 53 Q 14 54 16 48 Z" fill="#E3921A" />
    </>
  ),
  ticket: (
    <g transform="rotate(-12 32 32)">
      <path
        d="M 10 14 H 54 Q 58 14 58 18 V 23 C 50 23 50 35 58 35 V 42 Q 58 46 54 46 H 10 Q 6 46 6 42 V 35 C 14 35 14 23 6 23 V 18 Q 6 14 10 14 Z"
        fill="#F0478A"
      />
      <path d="M 10 14 H 54 Q 58 14 58 18 V 20 H 6 V 18 Q 6 14 10 14 Z" fill="#F4A98B" />
      {[18, 25, 32, 39, 46].map((x) => (
        <circle key={x} cx={x} cy="30" r="1.8" fill="#FFF4E0" />
      ))}
    </g>
  ),
};

export type CharmKind = keyof typeof CHARMS;

/** A lucky charm: die, cherries, horseshoe, clover, star or ticket. */
export function Charm({ kind, size, className, style }: ArtProps & { kind: CharmKind }) {
  return (
    <svg aria-hidden viewBox="0 0 64 64" width={size} height={size} className={className} style={style}>
      {CHARMS[kind]}
    </svg>
  );
}

/* ---------------- Lucky, the mascot ---------------- */

/** Lucky's coin and cheeks: the same in every face (art/wheel/lucky-*.svg, 180-unit grid). */
const LUCKY_COIN = (
  <>
    <circle cx="90" cy="90" r="52" fill="#E3921A" />
    <circle cx="90" cy="90" r="45" fill="#FFC93D" />
    <path d="M 49.8 69.8 A 45 45 0 0 1 130.2 69.8 Q 90 80 49.8 69.8 Z" fill="#FFE38A" />
    <path
      d="M 128 90 A 38 38 0 1 1 52 90 A 38 38 0 1 1 128 90 Z M 126 90 A 36 36 0 1 0 54 90 A 36 36 0 1 0 126 90 Z"
      fill="#E3921A"
      fillRule="evenodd"
    />
    <ellipse cx="64" cy="105" rx="7" ry="4" fill="#F4A98B" />
    <ellipse cx="116" cy="105" rx="7" ry="4" fill="#F4A98B" />
  </>
);

const LUCKY_EYES = (
  <>
    <circle cx="74" cy="95" r="4.2" fill="#2A0C40" />
    <circle cx="106" cy="95" r="4.2" fill="#2A0C40" />
  </>
);

/** One face per bet tier: asleep, curious, happy, excited, nervous, ecstatic. */
const LUCKY_FACES = [
  // No spin: asleep
  <>
    <path
      d="M 66 92 Q 74 100 82 92 Q 83 91 84 93 Q 75 106 65 94 Q 64 92 66 92 Z M 98 92 Q 106 100 114 92 Q 116 91 116 94 Q 106 106 97 94 Q 96 92 98 92 Z"
      fill="#2A0C40"
    />
    <ellipse cx="90" cy="113" rx="2.8" ry="3.3" fill="#2A0C40" />
  </>,
  // Free spin: just woken, curious
  <>
    {LUCKY_EYES}
    <ellipse cx="90" cy="113" rx="4" ry="5" fill="#2A0C40" />
  </>,
  // Round and round: happy
  <>
    {LUCKY_EYES}
    <path d="M 79 109 Q 90 120 101 109 Q 103 108 103 111 Q 90 127 77 111 Q 77 108 79 109 Z" fill="#2A0C40" />
  </>,
  // Bonus round: sparkly-eyed
  <>
    <ellipse cx="74" cy="95" rx="6.5" ry="7" fill="#2A0C40" />
    <ellipse cx="106" cy="95" rx="6.5" ry="7" fill="#2A0C40" />
    <path d="M 73 90 Q 73.6 92.4 76 93 Q 73.6 93.6 73 96 Q 72.4 93.6 70 93 Q 72.4 92.4 73 90 Z" fill="#FFF4E0" />
    <path
      d="M 105 90 Q 105.6 92.4 108 93 Q 105.6 93.6 105 96 Q 104.4 93.6 102 93 Q 104.4 92.4 105 90 Z"
      fill="#FFF4E0"
    />
    <path d="M 77 109 Q 90 114 103 109 C 102 132 78 132 77 109 Z" fill="#2A0C40" />
    <path d="M 83 121 Q 90 115 97 121 Q 90 129 83 121 Z" fill="#F0478A" />
  </>,
  // High stakes: nervous, glancing sideways, sweating
  <>
    <circle cx="71" cy="95" r="4.2" fill="#2A0C40" />
    <circle cx="103" cy="95" r="4.2" fill="#2A0C40" />
    <path
      d="M 78 113 Q 77 111 79 111 L 85 115 L 91 111 L 97 115 L 102 112 Q 104 111 104 113 L 98 119 Q 97 120 96 119 L 91 115 L 86 119 Q 85 120 84 119 Z"
      fill="#2A0C40"
    />
    <path d="M 124 82 C 123 88 117 93 118 98 C 119 106 130 106 131 98 C 132 93 126 88 124 82 Z" fill="#FFF4E0" />
  </>,
  // Mega jackpot: ecstatic, with sparkles
  <>
    <path
      d="M 65 96 Q 74 81 83 96 Q 84 99 81 99 Q 74 88 67 99 Q 64 99 65 96 Z M 97 96 Q 106 81 115 96 Q 116 99 113 99 Q 106 88 99 99 Q 96 99 97 96 Z"
      fill="#2A0C40"
    />
    <path d="M 74 108 Q 90 115 106 108 C 105 138 75 138 74 108 Z" fill="#2A0C40" />
    <path d="M 80 124 Q 90 113 100 124 Q 90 135 80 124 Z" fill="#F0478A" />
    <path d="M 40 39 Q 41.2 43.8 46 45 Q 41.2 46.2 40 51 Q 38.8 46.2 34 45 Q 38.8 43.8 40 39 Z" fill="#FFC93D" />
    <path d="M 143 47 Q 144.6 53.4 151 55 Q 144.6 56.6 143 63 Q 141.4 56.6 135 55 Q 141.4 53.4 143 47 Z" fill="#FFC93D" />
    <path d="M 142 127 Q 143 131 147 132 Q 143 133 142 137 Q 141 133 137 132 Q 141 131 142 127 Z" fill="#FFC93D" />
  </>,
];

/**
 * Lucky, Prize wheel's mascot: a gold coin whose face changes with the bet tier. Shown beside
 * the tier name in place of the line icon. The view is cropped to the coin (the jackpot
 * sparkles spill past it), so it reads at the same size as the other mascots.
 */
export function LuckyFace({
  tier,
  className,
  style,
}: {
  tier: number;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <svg aria-hidden viewBox="26 26 128 128" className={className} style={{ overflow: "visible", ...style }}>
      {LUCKY_COIN}
      {LUCKY_FACES[Math.max(0, Math.min(LUCKY_FACES.length - 1, tier))]}
    </svg>
  );
}

/* ---------------- The dial's wheel face ---------------- */

/** The dial's own grid (bet-dial.tsx lays everything out in a 358-unit square). */
const C = 358 / 2;
/** One wedge per five minutes: nine of them, so every wedge edge sits on a long minute tick. */
const WEDGE_MIN = 5;
const WEDGES = MAX_RANGE / WEDGE_MIN;
const WEDGE_DEG = (360 / MAX_RANGE) * WEDGE_MIN;
/** The hub the time sits on (the time button is 95 across from the centre). */
const HUB_R = 97;
const IN_R = 99;
/** Just inside the bet track (148 ± 13). */
const OUT_R = 134;
const LABEL_R = 107;
/** The gold rim the marquee bulbs sit on (bulbs are at 171), kept clear of the track's outer edge (161). */
const RIM_R = 172;
const RIM_W = 11;

/** Rounded so server and browser trig agree (avoids hydration mismatches). */
const r3 = (n: number) => Math.round(n * 1000) / 1000;

function pt(deg: number, r: number): [number, number] {
  const a = (deg * Math.PI) / 180;
  return [r3(C + r * Math.sin(a)), r3(C - r * Math.cos(a))];
}

function wedgePath(a1: number, a2: number, r1: number, r2: number) {
  const [x1, y1] = pt(a1, r2);
  const [x2, y2] = pt(a2, r2);
  const [x3, y3] = pt(a2, r1);
  const [x4, y4] = pt(a1, r1);
  return `M${x1} ${y1}A${r2} ${r2} 0 0 1 ${x2} ${y2}L${x3} ${y3}A${r1} ${r1} 0 0 0 ${x4} ${y4}z`;
}

/** Wedge colours, dim until the bet reaches them. The last wedge (40–45 min) is the jackpot. */
const WEDGE = {
  a: { on: "#8E4BE6", off: "#3A1858", ink: "#FFFFFF", dimInk: "rgba(255,244,224,0.4)" },
  b: { on: "#C957D9", off: "#4C1C66", ink: "#FFFFFF", dimInk: "rgba(255,244,224,0.4)" },
  // Unlit, it stays in the plum family with a gold number, so it doesn't go muddy
  jackpot: { on: "#FFC93D", off: "#46183F", ink: "#4A1A06", dimInk: "rgba(255,201,61,0.8)" },
} as const;

const WEDGE_LIST = Array.from({ length: WEDGES }, (_, k) => {
  const a1 = k * WEDGE_DEG;
  const mid = a1 + WEDGE_DEG / 2;
  const [lx, ly] = pt(mid, LABEL_R);
  return {
    k,
    kind: k === WEDGES - 1 ? "jackpot" : k % 2 ? "b" : "a",
    d: wedgePath(a1, a1 + WEDGE_DEG, IN_R, OUT_R),
    label: String((k + 1) * WEDGE_MIN),
    lx,
    ly,
    // Labels lean with their wedge, but the bottom ones turn round so nothing reads upside down
    rot: mid > 90 && mid < 270 ? mid + 180 : mid,
    edge: [pt(a1, IN_R), pt(a1, OUT_R)] as const,
    peg: pt(a1, OUT_R - 3.5),
  } as const;
});

/**
 * Prize wheel's dial face, drawn under the minute ticks: a gold rim for the marquee bulbs,
 * nine wedges that light up as the bet reaches them (a white flash as each one comes on),
 * gold pegs on the wedge edges, and a hub for the time to sit on.
 */
export function WheelFace({ range }: { range: number }) {
  return (
    <g>
      <defs>
        <linearGradient id="lc-wheel-rim" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFE38A" />
          <stop offset="0.5" stopColor="#F7B33B" />
          <stop offset="1" stopColor="#C9761A" />
        </linearGradient>
        <radialGradient id="lc-wheel-hub" cx="50%" cy="36%" r="70%">
          <stop offset="0" stopColor="#4A1868" />
          <stop offset="1" stopColor="#22083A" />
        </radialGradient>
      </defs>

      {/* A dark channel between the track and the rim, so a gold arc never runs into the gold rim */}
      <circle cx={C} cy={C} r={(161 + RIM_R - RIM_W / 2) / 2} fill="none" stroke="#16052A" strokeWidth={RIM_R - RIM_W / 2 - 161} />
      <circle cx={C} cy={C} r={RIM_R} fill="none" stroke="url(#lc-wheel-rim)" strokeWidth={RIM_W} />
      {[RIM_R - RIM_W / 2, RIM_R + RIM_W / 2].map((r) => (
        <circle key={r} cx={C} cy={C} r={r} fill="none" stroke="rgba(90,36,0,0.45)" strokeWidth={1} />
      ))}

      {WEDGE_LIST.map((w) => {
        const lit = range > w.k * WEDGE_MIN;
        const tone = WEDGE[w.kind];
        return (
          <g key={w.k}>
            <path d={w.d} fill={lit ? tone.on : tone.off} style={{ transition: "fill 180ms" }} />
            {lit && (
              <path
                d={w.d}
                fill="#FFFFFF"
                style={{ opacity: 0, animation: "lc-wedge-flash 0.45s ease-out" }}
              />
            )}
            <text
              x={w.lx}
              y={w.ly}
              textAnchor="middle"
              dominantBaseline="central"
              transform={`rotate(${r3(w.rot)} ${w.lx} ${w.ly})`}
              fontSize={12}
              fontWeight={800}
              letterSpacing="-0.02em"
              fill={lit ? tone.ink : tone.dimInk}
              style={{ transition: "fill 180ms" }}
            >
              {w.label}
            </text>
          </g>
        );
      })}

      {WEDGE_LIST.map(({ k, edge: [[x1, y1], [x2, y2]] }) => (
        <line key={k} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(22,5,36,0.6)" strokeWidth={1.5} />
      ))}
      {WEDGE_LIST.map(({ k, peg: [x, y] }) => (
        <circle key={k} cx={x} cy={y} r={2.4} fill="#FFE38A" stroke="#B8741A" strokeWidth={0.8} />
      ))}

      <circle cx={C} cy={C} r={HUB_R} fill="url(#lc-wheel-hub)" stroke="#FFC93D" strokeWidth={3} />
      <circle cx={C} cy={C} r={HUB_R - 6} fill="none" stroke="rgba(255,201,61,0.18)" strokeWidth={1} />
    </g>
  );
}

/**
 * The gold pointer at 12 o'clock (art/wheel/pointer.svg). It flicks on every minute of the
 * bet, like the flapper on a prize wheel clacking over the pegs, back and forth.
 */
export function WheelPointer({ range }: { range: number }) {
  return (
    <g
      transform={`translate(${C - 20} -19)`}
      style={{ filter: "drop-shadow(0 3px 3px rgba(20,4,30,0.45))" }}
    >
      <g
        key={range}
        style={{
          transformBox: "fill-box",
          transformOrigin: "50% 29%",
          animation: "lc-flick 0.28s ease-out",
          ["--flick" as string]: range % 2 ? "-12deg" : "12deg",
        }}
      >
        <circle cx="20" cy="17" r="13" fill="#FFC93D" />
        <path d="M 8.3 22.6 H 31.7 L 20 49 Z" fill="#FFC93D" />
        <path d="M 20 4 A 13 13 0 0 1 20 30 Z M 20 17 L 31.7 22.6 L 20 49 Z" fill="#E3921A" />
        <path d="M 9.2 15.5 C 10.2 9.5 14.8 6 20 6 V 9 C 16 9 12.7 11.8 11.8 15.8 Z" fill="#FFE38A" />
        <circle cx="20" cy="17" r="5" fill="#FFF4E0" />
        <circle cx="20" cy="17" r="2.2" fill="#E3921A" />
      </g>
    </g>
  );
}
