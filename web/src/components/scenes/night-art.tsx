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
  "M16 6C14.8 6 14.3 5.3 13.8 3.9Q13.1 1.8 12.5 2.7Q11.9 3.8 12.6 6C8.8 5.4 4.4 .1 0 0Q1.7 3.7 1.9 6.9Q4.8 5.4 6.2 9.2Q9.2 7.6 10.8 11.6Q13.4 10.1 14.4 13Q16 14 17.6 13Q18.6 10.1 21.2 11.6Q22.8 7.6 25.8 9.2Q27.2 5.4 30.1 6.9Q30.3 3.7 32 0C27.6 .1 23.2 5.4 19.4 6Q20.1 3.8 19.5 2.7Q18.9 1.8 18.2 3.9C17.7 5.3 17.2 6 16 6Z";
const BAT_LEVEL =
  "M16 5.5C14.8 5.5 14.3 4.8 13.8 3.4Q13.1 1.3 12.5 2.2Q11.9 3.3 12.6 5.5C9.1 4.8 4.2 1.6 0 2.3Q2.1 5.3 2.2 8.4Q5.3 6.4 6.4 10Q9.4 7.9 10.8 11.6Q13.4 9.7 14.4 12.6Q16 14 17.6 12.6Q18.6 9.7 21.2 11.6Q22.6 7.9 25.6 10Q26.7 6.4 29.8 8.4Q29.9 5.3 32 2.3C27.8 1.6 22.9 4.8 19.4 5.5Q20.1 3.3 19.5 2.2Q18.9 1.3 18.2 3.4C17.7 4.8 17.2 5.5 16 5.5Z";
const BAT_LOWERED =
  "M16 4.8C14.8 4.8 14.3 4.1 13.8 2.7Q13.1 .6 12.5 1.5Q11.9 2.6 12.6 4.8C8.8 4.4 3.8 4.5 0 7.4Q2.6 8.5 3.7 12.8Q5.7 9.5 8.1 13.4Q10.1 10.1 12.4 13Q13.6 10.5 14.4 12Q16 13.8 17.6 12Q18.4 10.5 19.6 13Q21.9 10.1 23.9 13.4Q26.3 9.5 28.3 12.8Q29.4 8.5 32 7.4C28.2 4.5 23.2 4.4 19.4 4.8Q20.1 2.6 19.5 1.5Q18.9 .6 18.2 2.7C17.7 4.1 17.2 4.8 16 4.8Z";
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

/** The full moon's craters (80 × 80 grid, disc r 30 at 40,40). Drawn as shading over any fill. */
export const MOON_CRATERS = [
  { cx: 29, cy: 26, r: 6, deep: false },
  { cx: 51, cy: 23, r: 3.5, deep: true },
  { cx: 55, cy: 42, r: 7, deep: false },
  { cx: 24, cy: 45, r: 3.5, deep: true },
  { cx: 37, cy: 56, r: 5, deep: false },
  { cx: 42, cy: 35, r: 2.5, deep: true },
];

/* ---------------------------------------------------------------- sheep */

const WOOL = "#F4EEF8";
const FACE = "#432344";

/** The fluffy body, shared by both poses (120 × 90 grid). */
function SheepBody() {
  return (
    <>
      <g fill={WOOL}>
        <circle cx="23" cy="39" r="9" />
        <circle cx="34" cy="31" r="14" />
        <circle cx="51" cy="25" r="15" />
        <circle cx="69" cy="29" r="15" />
        <circle cx="79" cy="42" r="15" />
        <circle cx="68" cy="55" r="15" />
        <circle cx="49" cy="57" r="15" />
        <circle cx="32" cy="51" r="15" />
        <ellipse cx="52" cy="43" rx="29" ry="22" />
      </g>
      <ellipse cx="93" cy="43" rx="12" ry="16" fill={FACE} />
      <path d="M89 32C81 32 77 27 80 24 83 21 90 25 93 30Z" fill={FACE} />
      <circle cx="98" cy="40" r="1.7" fill={WOOL} />
    </>
  );
}

function SheepStanding({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 120 90" className={className} style={style}>
      <g fill={FACE}>
        <rect x="35" y="59" width="7" height="23" rx="3.5" />
        <rect x="46" y="62" width="7" height="20" rx="3.5" />
        <rect x="66" y="61" width="7" height="21" rx="3.5" />
        <rect x="77" y="56" width="7" height="26" rx="3.5" />
      </g>
      <SheepBody />
    </svg>
  );
}

function SheepJumping({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 120 90" className={className} style={style}>
      <g fill={FACE}>
        <path d="M34 54Q31 54 31 58L31 70Q31 74 35 74L47 74Q51 74 51 70 51 67 47 67L39 67 39 58Q39 54 34 54Z" />
        <path d="M47 57Q43 57 43 61L43 76Q43 80 47 80L58 80Q62 80 62 76 62 73 58 73L51 73 51 61Q51 57 47 57Z" />
        <path d="M69 55Q65 55 65 59L65 71Q65 75 69 75L81 75Q85 75 85 71 85 68 81 68L73 68 73 59Q73 55 69 55Z" />
        <path d="M80 52Q76 52 76 56L76 64Q76 68 80 68L91 68Q95 68 95 64 95 61 91 61L84 61 84 56Q84 52 80 52Z" />
      </g>
      <SheepBody />
    </svg>
  );
}

function Fence({ color, className }: { color: string; className?: string }) {
  return (
    <svg viewBox="0 0 120 60" className={className} fill={color}>
      <rect x="5" y="20" width="110" height="8" rx="2" />
      <rect x="5" y="39" width="110" height="8" rx="2" />
      <rect x="10" y="7" width="10" height="50" rx="3" />
      <rect x="55" y="3" width="10" height="54" rx="3" />
      <rect x="100" y="7" width="10" height="50" rx="3" />
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
