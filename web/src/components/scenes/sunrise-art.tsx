"use client";

/**
 * Classic's illustrations, inlined from the SVGs in ./art/classic (so nothing loads late
 * and the clouds can be recoloured live). Edit those files, then regenerate these.
 */

import type { CSSProperties } from "react";

/** The sun mascot, one face per bet tier: asleep, sleepy, smiling, excited, sweating, on fire. */
const FACES = [
  // asleep
  <>
    <rect
      x="85"
      y="13"
      width="10"
      height="21"
      rx="5"
      fill="#F8BB65"
      transform="rotate(0 90 90)"
    />
    <rect
      x="85"
      y="13"
      width="10"
      height="21"
      rx="5"
      fill="#F8BB65"
      transform="rotate(45 90 90)"
    />
    <rect
      x="85"
      y="13"
      width="10"
      height="21"
      rx="5"
      fill="#F8BB65"
      transform="rotate(90 90 90)"
    />
    <rect
      x="85"
      y="13"
      width="10"
      height="21"
      rx="5"
      fill="#F8BB65"
      transform="rotate(135 90 90)"
    />
    <rect
      x="85"
      y="13"
      width="10"
      height="21"
      rx="5"
      fill="#F8BB65"
      transform="rotate(180 90 90)"
    />
    <rect
      x="85"
      y="13"
      width="10"
      height="21"
      rx="5"
      fill="#F8BB65"
      transform="rotate(225 90 90)"
    />
    <rect
      x="85"
      y="13"
      width="10"
      height="21"
      rx="5"
      fill="#F8BB65"
      transform="rotate(270 90 90)"
    />
    <rect
      x="85"
      y="13"
      width="10"
      height="21"
      rx="5"
      fill="#F8BB65"
      transform="rotate(315 90 90)"
    />
    <circle cx="90" cy="90" r="49" fill="#F8BC69" />
    <path
      d="M 41 86 A 49 49 0 0 1 139 86 C 125 99 56 99 41 86"
      fill="#FFD989"
    />
    <ellipse cx="60" cy="101" rx="8" ry="5" fill="#F4A98B" />
    <ellipse cx="120" cy="101" rx="8" ry="5" fill="#F4A98B" />
    <path
      d="M 66 87 Q 72 93 78 87 M 102 87 Q 108 93 114 87"
      fill="none"
      stroke="#80543F"
      strokeWidth="5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <ellipse cx="90" cy="106" rx="5" ry="6" fill="#80543F" />
    <path
      d="M 132 49 H 144 L 132 61 H 144"
      fill="none"
      stroke="#BA9C89"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M 147 30 H 155 L 147 38 H 155"
      fill="none"
      stroke="#BA9C89"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </>,
  // sleepy
  <>
    <rect
      x="85"
      y="13"
      width="10"
      height="21"
      rx="5"
      fill="#F8BB65"
      transform="rotate(0 90 90)"
    />
    <rect
      x="85"
      y="13"
      width="10"
      height="21"
      rx="5"
      fill="#F8BB65"
      transform="rotate(45 90 90)"
    />
    <rect
      x="85"
      y="13"
      width="10"
      height="21"
      rx="5"
      fill="#F8BB65"
      transform="rotate(90 90 90)"
    />
    <rect
      x="85"
      y="13"
      width="10"
      height="21"
      rx="5"
      fill="#F8BB65"
      transform="rotate(135 90 90)"
    />
    <rect
      x="85"
      y="13"
      width="10"
      height="21"
      rx="5"
      fill="#F8BB65"
      transform="rotate(180 90 90)"
    />
    <rect
      x="85"
      y="13"
      width="10"
      height="21"
      rx="5"
      fill="#F8BB65"
      transform="rotate(225 90 90)"
    />
    <rect
      x="85"
      y="13"
      width="10"
      height="21"
      rx="5"
      fill="#F8BB65"
      transform="rotate(270 90 90)"
    />
    <rect
      x="85"
      y="13"
      width="10"
      height="21"
      rx="5"
      fill="#F8BB65"
      transform="rotate(315 90 90)"
    />
    <circle cx="90" cy="90" r="49" fill="#F8BC69" />
    <path
      d="M 41 86 A 49 49 0 0 1 139 86 C 125 99 56 99 41 86"
      fill="#FFD989"
    />
    <ellipse cx="60" cy="101" rx="8" ry="5" fill="#F4A98B" />
    <ellipse cx="120" cy="101" rx="8" ry="5" fill="#F4A98B" />
    <path
      d="M 65 88 H 79 M 101 88 H 115"
      fill="none"
      stroke="#80543F"
      strokeWidth="5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="73" cy="91" r="2.8" fill="#80543F" />
    <circle cx="107" cy="91" r="2.8" fill="#80543F" />
    <ellipse cx="90" cy="107" rx="5.5" ry="7" fill="#80543F" />
  </>,
  // smiling
  <>
    <rect
      x="85"
      y="13"
      width="10"
      height="21"
      rx="5"
      fill="#F8BB65"
      transform="rotate(0 90 90)"
    />
    <rect
      x="85"
      y="13"
      width="10"
      height="21"
      rx="5"
      fill="#F8BB65"
      transform="rotate(45 90 90)"
    />
    <rect
      x="85"
      y="13"
      width="10"
      height="21"
      rx="5"
      fill="#F8BB65"
      transform="rotate(90 90 90)"
    />
    <rect
      x="85"
      y="13"
      width="10"
      height="21"
      rx="5"
      fill="#F8BB65"
      transform="rotate(135 90 90)"
    />
    <rect
      x="85"
      y="13"
      width="10"
      height="21"
      rx="5"
      fill="#F8BB65"
      transform="rotate(180 90 90)"
    />
    <rect
      x="85"
      y="13"
      width="10"
      height="21"
      rx="5"
      fill="#F8BB65"
      transform="rotate(225 90 90)"
    />
    <rect
      x="85"
      y="13"
      width="10"
      height="21"
      rx="5"
      fill="#F8BB65"
      transform="rotate(270 90 90)"
    />
    <rect
      x="85"
      y="13"
      width="10"
      height="21"
      rx="5"
      fill="#F8BB65"
      transform="rotate(315 90 90)"
    />
    <circle cx="90" cy="90" r="49" fill="#F8BC69" />
    <path
      d="M 41 86 A 49 49 0 0 1 139 86 C 125 99 56 99 41 86"
      fill="#FFD989"
    />
    <ellipse cx="60" cy="101" rx="8" ry="5" fill="#F4A98B" />
    <ellipse cx="120" cy="101" rx="8" ry="5" fill="#F4A98B" />
    <circle cx="72" cy="87" r="4" fill="#80543F" />
    <circle cx="108" cy="87" r="4" fill="#80543F" />
    <path
      d="M 79 102 Q 90 114 101 102"
      fill="none"
      stroke="#80543F"
      strokeWidth="5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </>,
  // excited
  <>
    <rect
      x="85"
      y="13"
      width="10"
      height="21"
      rx="5"
      fill="#F8BB65"
      transform="rotate(0 90 90)"
    />
    <rect
      x="85"
      y="13"
      width="10"
      height="21"
      rx="5"
      fill="#F8BB65"
      transform="rotate(45 90 90)"
    />
    <rect
      x="85"
      y="13"
      width="10"
      height="21"
      rx="5"
      fill="#F8BB65"
      transform="rotate(90 90 90)"
    />
    <rect
      x="85"
      y="13"
      width="10"
      height="21"
      rx="5"
      fill="#F8BB65"
      transform="rotate(135 90 90)"
    />
    <rect
      x="85"
      y="13"
      width="10"
      height="21"
      rx="5"
      fill="#F8BB65"
      transform="rotate(180 90 90)"
    />
    <rect
      x="85"
      y="13"
      width="10"
      height="21"
      rx="5"
      fill="#F8BB65"
      transform="rotate(225 90 90)"
    />
    <rect
      x="85"
      y="13"
      width="10"
      height="21"
      rx="5"
      fill="#F8BB65"
      transform="rotate(270 90 90)"
    />
    <rect
      x="85"
      y="13"
      width="10"
      height="21"
      rx="5"
      fill="#F8BB65"
      transform="rotate(315 90 90)"
    />
    <circle cx="90" cy="90" r="49" fill="#F8BC69" />
    <path
      d="M 41 86 A 49 49 0 0 1 139 86 C 125 99 56 99 41 86"
      fill="#FFD989"
    />
    <ellipse cx="60" cy="101" rx="8" ry="5" fill="#F4A98B" />
    <ellipse cx="120" cy="101" rx="8" ry="5" fill="#F4A98B" />
    <path
      d="M 64 89 Q 72 76 80 89 M 100 89 Q 108 76 116 89"
      fill="none"
      stroke="#80543F"
      strokeWidth="5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M 76 101 Q 90 98 104 101 C 103 124 77 124 76 101 Z"
      fill="#80543F"
    />
    <path d="M 81 114 Q 90 107 99 114 Q 90 122 81 114" fill="#F69D8D" />
  </>,
  // sweating
  <>
    <rect
      x="85"
      y="13"
      width="10"
      height="21"
      rx="5"
      fill="#F8BB65"
      transform="rotate(0 90 90)"
    />
    <rect
      x="85"
      y="13"
      width="10"
      height="21"
      rx="5"
      fill="#F8BB65"
      transform="rotate(45 90 90)"
    />
    <rect
      x="85"
      y="13"
      width="10"
      height="21"
      rx="5"
      fill="#F8BB65"
      transform="rotate(90 90 90)"
    />
    <rect
      x="85"
      y="13"
      width="10"
      height="21"
      rx="5"
      fill="#F8BB65"
      transform="rotate(135 90 90)"
    />
    <rect
      x="85"
      y="13"
      width="10"
      height="21"
      rx="5"
      fill="#F8BB65"
      transform="rotate(180 90 90)"
    />
    <rect
      x="85"
      y="13"
      width="10"
      height="21"
      rx="5"
      fill="#F8BB65"
      transform="rotate(225 90 90)"
    />
    <rect
      x="85"
      y="13"
      width="10"
      height="21"
      rx="5"
      fill="#F8BB65"
      transform="rotate(270 90 90)"
    />
    <rect
      x="85"
      y="13"
      width="10"
      height="21"
      rx="5"
      fill="#F8BB65"
      transform="rotate(315 90 90)"
    />
    <circle cx="90" cy="90" r="49" fill="#F8BC69" />
    <path
      d="M 41 86 A 49 49 0 0 1 139 86 C 125 99 56 99 41 86"
      fill="#FFD989"
    />
    <ellipse cx="60" cy="101" rx="8" ry="5" fill="#F4A98B" />
    <ellipse cx="120" cy="101" rx="8" ry="5" fill="#F4A98B" />
    <path
      d="M 64 87 Q 71 80 78 87 M 102 87 Q 109 80 116 87"
      fill="none"
      stroke="#80543F"
      strokeWidth="5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M 82 108 Q 91 103 100 108"
      fill="none"
      stroke="#80543F"
      strokeWidth="5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M 128 65 C 127 74 118 80 121 86 C 125 94 136 90 136 83 C 136 77 130 72 128 65 Z"
      fill="#A4D8E4"
    />
  </>,
  // on-fire
  <>
    <path
      fill="#F6A06A"
      d="M 45 132 C 17 112 29 80 40 65 C 39 83 49 88 52 77 C 55 59 65 50 61 34 C 80 42 84 56 87 64 C 100 47 105 31 100 14 C 129 34 130 57 125 69 C 138 64 145 53 144 42 C 165 66 150 85 155 97 C 159 105 165 108 167 100 C 171 126 151 147 128 151 L 61 151 Z"
    />
    <path
      fill="#FFD37D"
      d="M 53 124 C 40 105 51 88 60 79 C 57 93 68 94 74 82 C 83 70 89 60 89 48 C 107 64 110 76 108 87 C 125 81 132 72 133 65 C 145 91 131 99 141 114 L 133 140 L 61 140 Z"
    />
    <rect
      x="85"
      y="13"
      width="10"
      height="21"
      rx="5"
      fill="#F8BB65"
      transform="rotate(90 90 90)"
    />
    <rect
      x="85"
      y="13"
      width="10"
      height="21"
      rx="5"
      fill="#F8BB65"
      transform="rotate(135 90 90)"
    />
    <rect
      x="85"
      y="13"
      width="10"
      height="21"
      rx="5"
      fill="#F8BB65"
      transform="rotate(180 90 90)"
    />
    <rect
      x="85"
      y="13"
      width="10"
      height="21"
      rx="5"
      fill="#F8BB65"
      transform="rotate(225 90 90)"
    />
    <rect
      x="85"
      y="13"
      width="10"
      height="21"
      rx="5"
      fill="#F8BB65"
      transform="rotate(270 90 90)"
    />
    <circle cx="90" cy="90" r="49" fill="#F8BC69" />
    <path
      d="M 41 86 A 49 49 0 0 1 139 86 C 125 99 56 99 41 86"
      fill="#FFD989"
    />
    <ellipse cx="60" cy="101" rx="8" ry="5" fill="#F4A98B" />
    <ellipse cx="120" cy="101" rx="8" ry="5" fill="#F4A98B" />
    <path
      d="M 64 89 L 76 83 M 104 83 L 116 89"
      fill="none"
      stroke="#80543F"
      strokeWidth="5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="73" cy="91" r="3.3" fill="#80543F" />
    <circle cx="107" cy="91" r="3.3" fill="#80543F" />
    <path
      d="M 78 103 Q 90 98 102 103 C 101 121 79 121 78 103 Z"
      fill="#80543F"
    />
    <path d="M 83 114 Q 90 109 97 114 Q 90 120 83 114" fill="#F69D8D" />
  </>,
];

export function SunFace({
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
      {FACES[Math.max(0, Math.min(FACES.length - 1, tier))]}
    </svg>
  );
}

/** Outlines of the five clouds, on a 280 × 160 grid with flat bottoms at y = 132. */
const CLOUD_SHAPES = [
  "M 44 132 C 22 132 18 118 22 104 C 25 91 37 83 52 84 C 50 62 67 47 88 50 C 96 22 135 19 151 45 C 171 35 196 46 199 67 C 224 61 244 79 241 98 C 264 101 269 132 244 132 Z",
  "M 37 132 C 15 132 14 105 34 100 C 30 78 49 62 68 68 C 74 39 111 34 128 57 C 145 44 174 48 182 73 C 203 63 226 77 225 99 C 248 94 264 111 254 124 C 250 130 244 132 235 132 Z",
  "M 47 132 C 22 132 19 102 42 96 C 39 75 57 62 76 67 C 72 35 104 16 128 34 C 149 19 180 33 179 61 C 203 53 226 68 224 90 C 244 85 261 104 253 120 C 250 128 242 132 232 132 Z",
  "M 31 132 C 12 132 11 110 27 103 C 28 83 47 73 65 80 C 73 57 100 53 116 69 C 129 43 165 40 182 65 C 201 56 223 70 222 91 C 245 90 261 107 253 122 C 249 130 242 132 231 132 Z",
  "M 49 132 C 26 132 21 107 39 97 C 34 76 51 58 73 62 C 78 34 111 24 132 44 C 155 32 183 47 185 72 C 204 65 225 78 225 97 C 247 96 260 113 250 125 C 246 130 240 132 230 132 Z",
];

/**
 * A cloud: cream on top, with two belly bands underneath. The bands take the sky's
 * current sunrise colour, so the clouds warm up with the bet.
 */
export function Cloud({
  shape,
  width,
  belly,
  bellyLight,
  id,
}: {
  shape: number;
  width: number;
  belly: string;
  bellyLight: string;
  id: string;
}) {
  const d = CLOUD_SHAPES[shape % CLOUD_SHAPES.length];
  return (
    <svg
      aria-hidden
      viewBox="0 0 280 160"
      width={width}
      height={(width * 160) / 280}
    >
      <defs>
        <clipPath id={id}>
          <path d={d} />
        </clipPath>
      </defs>
      <path fill="#FFFDF8" d={d} />
      <g clipPath={`url(#${id})`}>
        <path
          fill={bellyLight}
          style={{ transition: "fill 600ms" }}
          d="M 8 107 C 60 117 92 101 142 111 C 192 121 222 106 274 109 L 274 145 L 8 145 Z"
        />
        <path
          fill={belly}
          style={{ transition: "fill 600ms" }}
          d="M 8 125 C 62 119 104 126 151 123 C 198 120 234 125 274 121 L 274 145 L 8 145 Z"
        />
      </g>
    </svg>
  );
}
