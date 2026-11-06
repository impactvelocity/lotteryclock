"use client";

import { useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

/*
 * Night's illustrations, from the SVGs in ./art/night (bats, full moon, sheep, fence).
 * Inlined as paths so the code can animate them: the bat's three poses share one path
 * structure, so the wings morph smoothly between them.
 */

/** The bat's wing poses on a 32 × 14 grid: raised, level, lowered. Same commands in each. */
const BAT_RAISED =
  "M 13 6.1 C 9 3.8 5 2 0.5 0.7 Q 2.8 4.7 4.8 6.1 Q 5.8 5.3 6.9 8.2 Q 8.9 6.9 8.2 8.3 Q 10.3 9.5 11.4 9.2 Q 11.5 8.1 13 9.8 C 13.3 14.2 18.7 14.2 19 9.8 Q 20.5 8.1 20.6 9.2 Q 21.7 9.5 23.8 8.3 Q 23.1 6.9 25.1 8.2 Q 26.2 5.3 27.2 6.1 Q 29.2 4.7 31.5 0.7 C 27 2 23 3.8 19 6.1 L 18.4 2.4 Q 18.2 1.8 17.6 2.4 L 16.6 4.1 Q 16 3.8 15.4 4.1 L 14.4 2.4 Q 13.8 1.8 13.6 2.4 Z";
const BAT_LEVEL =
  "M 13 6.1 C 9 3.6 5 2.6 0.5 5.4 Q 2.7 7.7 4.8 9.4 Q 5.8 7.4 6.9 10.7 Q 8.9 8.7 8.2 10.6 Q 10.3 11.5 11.4 10.4 Q 11.5 9 13 9.8 C 13.3 14.2 18.7 14.2 19 9.8 Q 20.5 9 20.6 10.4 Q 21.7 11.5 23.8 10.6 Q 23.1 8.7 25.1 10.7 Q 26.2 7.4 27.2 9.4 Q 29.3 7.7 31.5 5.4 C 27 2.6 23 3.6 19 6.1 L 18.4 2.4 Q 18.2 1.8 17.6 2.4 L 16.6 4.1 Q 16 3.8 15.4 4.1 L 14.4 2.4 Q 13.8 1.8 13.6 2.4 Z";
const BAT_LOWERED =
  "M 13 6.1 C 9 5.5 4 7.8 0.5 12.7 Q 2.7 10.7 4.8 12.3 Q 5.8 10.2 6.9 12.7 Q 8.9 9.7 8.2 11.7 Q 10.3 12.3 11.4 10.8 Q 11.5 9.5 13 9.8 C 13.3 14.2 18.7 14.2 19 9.8 Q 20.5 9.5 20.6 10.8 Q 21.7 12.3 23.8 11.7 Q 23.1 9.7 25.1 12.7 Q 26.2 10.2 27.2 12.3 Q 29.3 10.7 31.5 12.7 C 28 7.8 23 5.5 19 6.1 L 18.4 2.4 Q 18.2 1.8 17.6 2.4 L 16.6 4.1 Q 16 3.8 15.4 4.1 L 14.4 2.4 Q 13.8 1.8 13.6 2.4 Z";
/** One wingbeat: up, through level, down, and back. */
const BAT_BEAT = [BAT_RAISED, BAT_LEVEL, BAT_LOWERED, BAT_LEVEL, BAT_RAISED].join(";");

/** A bat in flight: the wings morph through the three poses. Holds level under reduced motion. */
export function Bat({
  width,
  beat,
  className,
  style,
}: {
  width: number;
  /** Seconds per wingbeat. */
  beat: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const still = useReducedMotion();
  return (
    <svg
      viewBox="0 0 32 14"
      width={width}
      height={(width * 14) / 32}
      className={className}
      style={{ overflow: "visible", ...style }}
    >
      <path d={BAT_LEVEL} fill="#0C0614">
        {!still && (
          <animate
            attributeName="d"
            dur={`${beat}s`}
            repeatCount="indefinite"
            values={BAT_BEAT}
            calcMode="spline"
            keyTimes="0;0.25;0.5;0.75;1"
            keySplines="0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1"
          />
        )}
      </path>
    </svg>
  );
}

/**
 * The full moon's surface (80 × 80 grid, disc r 30 at 40,40), from ./art/night/moon-full.svg:
 * the dark "seas" (maria), crater rims and craters, each drawn at its own opacity in one shade
 * over any fill, so they follow the moon's colour as it warms.
 */
export const MOON_SURFACE = {
  maria: {
    opacity: 0.12,
    d: [
      "M 24 20 C 29 15 39 15 42 21 C 44 25 39 27 38 31 C 36 35 30 34 27 30 C 24 27 20 26 24 20 Z",
      "M 46 28 C 53 23 63 30 63 37 C 62 43 55 46 51 43 C 47 41 50 37 46 35 C 43 33 43 30 46 28 Z",
      "M 30 41 C 34 37 43 39 45 44 C 48 47 46 50 49 54 C 50 60 43 64 38 61 C 34 58 35 54 31 53 C 26 51 26 45 30 41 Z",
      "M 19 39 C 22 37 26 39 26 42 C 27 46 22 49 19 46 C 17 44 17 41 19 39 Z",
    ],
  },
  rims: { opacity: 0.06, circles: [
    [24, 31, 3.7],
    [58, 47, 4.3],
    [52, 57, 3.4],
  ] as [number, number, number][] },
  craters: { opacity: 0.18, circles: [
    [24, 31, 2.5],
    [42, 22, 2],
    [58, 47, 3],
    [31, 58, 2],
    [52, 57, 2.4],
    [48, 41, 1.8],
    [36, 34, 1.5],
  ] as [number, number, number][] },
};

/* ---------------------------------------------------------------- stars */

const SPIKES =
  "M 12 0 C 12.2 9.8 12.6 11.4 24 12 C 12.6 12.6 12.2 14.2 12 24 C 11.8 14.2 11.4 12.6 0 12 C 11.4 11.4 11.8 9.8 12 0 Z";
const SPIKES_SHORT =
  "M 8.8 8.8 Q 11.5 11.1 12 11.2 Q 12.5 11.1 15.2 8.8 Q 12.9 11.5 12.8 12 Q 12.9 12.5 15.2 15.2 Q 12.5 12.9 12 12.8 Q 11.5 12.9 8.8 15.2 Q 11.1 12.5 11.2 12 Q 11.1 11.5 8.8 8.8 Z";
const SPIKES_FAINT =
  "M 12 5 C 12.2 10.7 12.7 11.8 19 12 C 12.7 12.2 12.2 13.3 12 19 C 11.8 13.3 11.3 12.2 5 12 C 11.3 11.8 11.8 10.7 12 5 Z";

/**
 * A star on a 24 × 24 grid, from ./art/night/star-bright.svg and star-faint.svg: a soft halo,
 * diffraction spikes tapering to hairlines and a white-hot core. `tint` colours the halo and
 * spikes (a star's own colour); the core stays white. Faint stars get a short cross and no
 * diagonals. Drop it in a `<g>` scaled to size.
 */
export function StarArt({ tint = "#FFF3DC", faint = false }: { tint?: string; faint?: boolean }) {
  if (faint)
    return (
      <>
        <circle cx="12" cy="12" r="3" fill={tint} opacity="0.18" />
        <path d={SPIKES_FAINT} fill={tint} opacity="0.7" />
        <circle cx="12" cy="12" r="1.4" fill="#FFFFFF" />
      </>
    );
  return (
    <>
      <circle cx="12" cy="12" r="5" fill={tint} opacity="0.12" />
      <circle cx="12" cy="12" r="2.8" fill={tint} opacity="0.28" />
      <path d={SPIKES} fill={tint} />
      <path d={SPIKES_SHORT} fill={tint} />
      <circle cx="12" cy="12" r="1.5" fill="#FFFFFF" />
    </>
  );
}

/* ---------------------------------------------------------------- sheep */

const WOOL = "#F4EEF8";
const FACE = "#432344";

/** The fluffy body and sleepy face, shared by both poses (120 × 90 grid, ./art/night/sheep-*.svg). */
function SheepBody() {
  return (
    <>
      <g fill={WOOL}>
        <ellipse cx="54" cy="48" rx="32" ry="23" />
        <circle cx="27" cy="46" r="13" />
        <circle cx="36" cy="33" r="14" />
        <circle cx="54" cy="28" r="14" />
        <circle cx="72" cy="33" r="14" />
        <circle cx="82" cy="47" r="13" />
        <circle cx="70" cy="61" r="14" />
        <circle cx="50" cy="65" r="14" />
        <circle cx="32" cy="59" r="13" />
        <circle cx="16" cy="45" r="7" />
      </g>
      <ellipse cx="96" cy="45" rx="12" ry="17" fill={FACE} />
      <path d="M 89 31 C 79 25 76 32 80 42 C 83 48 89 47 91 42 Z" fill={FACE} />
      <path d="M 89 44 Q 92 47 95 44 Q 96 44 96 45 Q 92 50 88 45 Q 88 44 89 44 Z M 99 44 Q 102 47 105 44 Q 106 44 106 45 Q 102 50 98 45 Q 98 44 99 44 Z" fill={WOOL} />
      <path d="M 97 54 Q 100 56 102 54 Q 103 54 102 55 Q 100 58 97 55 Z" fill={WOOL} />
    </>
  );
}

function SheepStanding({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 120 90" className={className} style={style}>
      <g fill={FACE}>
        <path d="M 28 61 H 35 V 79 Q 35 82 32 82 H 31 Q 28 82 28 79 Z" />
        <path d="M 42 61 H 49 V 79 Q 49 82 46 82 H 45 Q 42 82 42 79 Z" />
        <path d="M 64 61 H 71 V 79 Q 71 82 68 82 H 67 Q 64 82 64 79 Z" />
        <path d="M 77 61 H 84 V 79 Q 84 82 81 82 H 80 Q 77 82 77 79 Z" />
      </g>
      <SheepBody />
    </svg>
  );
}

function SheepJumping({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 120 90" className={className} style={style}>
      {/* Tipped up into the leap */}
      <g transform="rotate(-10 60 48)">
        <path
          fill={FACE}
          d="M 29 61 C 25 64 19 65 10 70 Q 7 72 10 75 Q 12 77 15 75 L 35 69 Z M 43 64 C 38 69 28 71 20 74 Q 16 75 18 79 Q 20 82 24 80 L 47 72 Z M 68 61 L 78 71 Q 81 74 84 72 L 99 64 Q 102 62 100 59 Q 98 57 95 59 L 82 65 L 75 57 Z M 81 57 L 91 65 Q 94 68 97 66 L 108 58 Q 111 55 108 53 Q 106 51 104 53 L 94 59 L 87 53 Z"
        />
        <SheepBody />
      </g>
    </svg>
  );
}

/** The fence the sheep jump (./art/night/fence.svg). */
function Fence({ color, className }: { color: string; className?: string }) {
  return (
    <svg viewBox="0 0 120 60" className={className} fill={color}>
      <path d="M 11 57 V 17 Q 11 12 16 12 H 18 Q 23 12 23 17 V 57 Z M 54 57 V 10 Q 54 5 59 5 H 61 Q 66 5 66 10 V 57 Z M 97 57 V 18 Q 97 13 102 13 H 104 Q 109 13 109 18 V 57 Z" />
      <path d="M 4 23 Q 3 20 7 20 L 39 21 L 41 24 L 43 21 L 115 19 Q 118 19 118 23 V 25 Q 118 28 114 28 L 7 29 Q 3 29 4 26 Z M 5 39 Q 3 36 7 36 L 76 37 L 78 40 L 81 37 L 113 35 Q 117 35 117 39 V 41 Q 117 44 113 44 L 7 45 Q 3 45 5 42 Z" />
    </svg>
  );
}

/** Seconds for one sheep to cross the lane; a new one sets off every half of that. */
const CROSS_S = 1.2;
const GAP_S = CROSS_S / 2;
/** The first sheep is already on its way in, so it clears the fence this soon. */
const FIRST_CLEAR_S = 0.3;

/**
 * "Counting sheep": while Night's draw rolls, sheep hop a little fence one after another and
 * the count pops up as each one clears it. Sits just above the progress bar, which is their ground.
 */
export function CountingSheep({ ink, fence }: { ink: string; fence: string }) {
  const still = useReducedMotion();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (still) return;
    let interval: ReturnType<typeof setInterval> | undefined;
    const first = setTimeout(() => {
      setCount(1);
      interval = setInterval(() => setCount((c) => c + 1), GAP_S * 1000);
    }, FIRST_CLEAR_S * 1000);
    return () => {
      clearTimeout(first);
      clearInterval(interval);
    };
  }, [still]);

  const sheepSize = "absolute bottom-0 left-0 h-[30px] w-10";
  const glow = { filter: "drop-shadow(0 0 1.5px rgba(244,238,248,0.45))" };

  return (
    <div aria-hidden className="relative h-11 w-40">
      {/* Fades the sheep in and out at the ends of the lane */}
      <div
        className="absolute inset-0"
        style={{
          maskImage: "linear-gradient(90deg, transparent, #000 18%, #000 82%, transparent)",
          WebkitMaskImage: "linear-gradient(90deg, transparent, #000 18%, #000 82%, transparent)",
        }}
      >
        <Fence color={fence} className="absolute bottom-0 left-1/2 h-[17px] w-[34px] -translate-x-1/2" />
        {still ? (
          <SheepStanding className={`${sheepSize} ml-3`} style={glow} />
        ) : (
          [0, 1].map((i) => {
            const timing = `${CROSS_S}s linear ${(i * GAP_S - (CROSS_S / 2 - FIRST_CLEAR_S)).toFixed(2)}s infinite backwards`;
            return (
              <div key={i} className="absolute inset-0" style={{ animation: `lc-sheep-run ${timing}` }}>
                <div className="absolute inset-0" style={{ animation: `lc-sheep-hop ${timing}` }}>
                  <SheepStanding
                    className={sheepSize}
                    style={{ ...glow, animation: `lc-sheep-ground ${timing}` }}
                  />
                  <SheepJumping
                    className={sheepSize}
                    style={{ ...glow, animation: `lc-sheep-air ${timing}` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
      {count > 0 && (
        <span
          key={count}
          className="absolute top-0 right-1 text-sm font-extrabold tabular-nums"
          style={{ color: ink, animation: "lc-count-pop 0.55s ease-out both" }}
        >
          {count}
        </span>
      )}
    </div>
  );
}
