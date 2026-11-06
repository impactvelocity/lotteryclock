"use client";

/**
 * Magic 8 Ball: a studio product shot rather than an illustrated scene. Monochrome (ink black,
 * one cobalt blue and white), glossy and mostly still, set in Geist Mono.
 *
 * - EightBallScene: the studio. A near-black sweep, a key light from the upper left with dust
 *   drifting through it, out-of-focus bokeh, and the ball's blue glow pooling on the floor.
 * - EightBall (behind the dial): a giant glossy 8 ball whose window is the dial. Setting the
 *   alarm shakes it, then it leans in so the clock sits in its window, and the die floats up
 *   behind the drawn time.
 * - EightBallDie (on the dial): the die in the window, framing the time. Crisp with no bet
 *   ("It is certain"), sinking into the murk as the bet grows, with more and more bubbles.
 * - EightBallRoll / EightBallVerdict: a die rising out of the dark over the progress bar, and
 *   a die that says YES or NO beside the result.
 *
 * Purely decorative and pointer-transparent.
 */

import { motion } from "motion/react";
import { useId, useState, type CSSProperties, type ReactNode } from "react";
import { ROLL_MS } from "@/components/alarm-reveal";
import type { SceneMood } from "@/components/scenes/types";
import { frac } from "@/lib/rand";

const MONO = "var(--font-geist-mono), monospace";
const SANS = "var(--font-geist-sans), sans-serif";

/** The ball's diameter, in dial widths. */
const BALL = 1.6;
/** The ball is drawn in a 1000-unit square; one dial width is this many units. */
const PER_DIAL = 1000 / BALL;
/** The window's opening (just outside the dial's disc) and the bezel round it, in ball units. */
const WIN_R = Math.round(0.49 * PER_DIAL);
const BEZEL_R = Math.round(0.535 * PER_DIAL);
/**
 * Once the alarm is set the ball leans in: up a little and bigger, so the clock and the result
 * below it sit inside the window (the clock's centre is 0.35 dial widths above the dial's).
 */
const LEAN_SHIFT = -0.13;
const LEAN_SCALE = 1.32;
/** Where the clock's digits sit in the window while it leans in, in ball units from the centre. */
const CLOCK_DY = Math.round(((-0.35 - LEAN_SHIFT) / LEAN_SCALE) * PER_DIAL);
const LEAN_EASE = "0.75s cubic-bezier(0.2, 0.8, 0.2, 1)";

const S3 = Math.sqrt(3);
const r2 = (n: number) => Math.round(n * 100) / 100;
const cleanId = (id: string) => id.replace(/[^a-zA-Z0-9_-]/g, "");

/** A die face: an upside-down triangle with circumradius r, centred on (cx, cy). */
function tri(cx: number, cy: number, r: number) {
  const hw = (r * S3) / 2;
  return `M${r2(cx - hw)} ${r2(cy - r / 2)}H${r2(cx + hw)}L${r2(cx)} ${r2(cy + r)}Z`;
}

/**
 * The three neighbouring faces of the icosahedron, tilted away beyond each edge of the face
 * pressed to the window. `depth`: how far out their tips reach, in circumradii.
 */
function neighbours(cx: number, cy: number, r: number, depth: number) {
  const hw = (r * S3) / 2;
  const a: [number, number] = [cx - hw, cy - r / 2];
  const b: [number, number] = [cx + hw, cy - r / 2];
  const c: [number, number] = [cx, cy + r];
  const edges: [[number, number], [number, number], [number, number]][] = [
    [a, b, [0, -1]],
    [b, c, [S3 / 2, 0.5]],
    [c, a, [-S3 / 2, 0.5]],
  ];
  return edges.map(([p, q, n]) => {
    const tip = [(p[0] + q[0]) / 2 + n[0] * depth * r, (p[1] + q[1]) / 2 + n[1] * depth * r];
    return `M${r2(p[0])} ${r2(p[1])}L${r2(q[0])} ${r2(q[1])}L${r2(tip[0])} ${r2(tip[1])}Z`;
  });
}

/** Ring segment between radii r1 and r2 from angle a1 to a2 (degrees, 0 = up, clockwise). */
function sector(cx: number, cy: number, r1: number, rr: number, a1: number, a2: number) {
  const at = (a: number, r: number) => {
    const t = (a * Math.PI) / 180;
    return `${r2(cx + r * Math.sin(t))} ${r2(cy - r * Math.cos(t))}`;
  };
  const large = a2 - a1 > 180 ? 1 : 0;
  return `M${at(a1, rr)}A${rr} ${rr} 0 ${large} 1 ${at(a2, rr)}L${at(a2, r1)}A${r1} ${r1} 0 ${large} 0 ${at(a1, r1)}Z`;
}

/** Gradients a die needs, under `id`. */
function DieDefs({ id }: { id: string }) {
  return (
    <>
      <linearGradient id={`${id}-face`} x1="0" y1="0" x2="0.35" y2="1">
        <stop offset="0" stopColor="#4A60FF" />
        <stop offset="0.55" stopColor="#2F45EC" />
        <stop offset="1" stopColor="#1C2CBC" />
      </linearGradient>
      <linearGradient id={`${id}-side`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#1A278F" />
        <stop offset="1" stopColor="#0A1150" />
      </linearGradient>
    </>
  );
}

/** The die: the face against the window, its bevel, and (optionally) its neighbours tilting away. */
function Die({
  id,
  cx,
  cy,
  r,
  sides = true,
  children,
}: {
  id: string;
  cx: number;
  cy: number;
  r: number;
  sides?: boolean;
  children?: ReactNode;
}) {
  // Rounded corners: the face is stroked in its own colour with round joins
  const round = r2(r * 0.14);
  return (
    <g>
      {sides &&
        neighbours(cx, cy, r, 0.6).map((d, i) => (
          <path
            key={i}
            d={d}
            fill={`url(#${id}-side)`}
            stroke={`url(#${id}-side)`}
            strokeWidth={round}
            strokeLinejoin="round"
            opacity={0.8}
          />
        ))}
      <path
        d={tri(cx, cy, r)}
        fill={`url(#${id}-face)`}
        stroke={`url(#${id}-face)`}
        strokeWidth={round}
        strokeLinejoin="round"
      />
      {/* A bevel just inside the edge: the moulded rim of the face */}
      <path
        d={tri(cx, cy + r * 0.04, r * 0.84)}
        fill="none"
        stroke="rgba(185,200,255,0.3)"
        strokeWidth={r2(Math.max(0.6, r * 0.016))}
        strokeLinejoin="round"
      />
      {children}
    </g>
  );
}

/* ------------------------------------------------------------------------------------------ */
/* On the dial                                                                                 */
/* ------------------------------------------------------------------------------------------ */

/** The dial's 358-unit square (bet-dial.tsx). */
const DC = 179;
/** Inside the minute ticks. */
const DIAL_WIN = 130;

const DIAL_BUBBLES = Array.from({ length: 18 }, (_, i) => ({
  x: Math.round(-74 + frac(i, 81) * 148),
  r: r2(1.3 + frac(i, 82) * 2.6),
  dur: r2(4.5 + frac(i, 83) * 4.5),
  delay: r2(-frac(i, 84) * 9),
  wob: r2(1.5 + frac(i, 85) * 3.5),
  wobDur: r2(0.9 + frac(i, 86) * 1.2),
}));

/**
 * The die in the dial's window, framing the time. With no bet it's pressed right up to the
 * glass, crisp and bright ("It is certain"). As the bet grows it sinks into the murk: blurred,
 * dimmer, rocking more, the ink clouding over it and more bubbles rising.
 */
export function EightBallDie({ p }: { p: number }) {
  const id = `e8d-${cleanId(useId())}`;
  const blur = r2(p * 2.6);
  const bubbles = DIAL_BUBBLES.slice(0, 3 + Math.round(p * 15));
  return (
    <g>
      <defs>
        <DieDefs id={id} />
        <clipPath id={`${id}-win`}>
          <circle cx={DC} cy={DC} r={DIAL_WIN} />
        </clipPath>
        <filter id={`${id}-blur`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation={blur} />
        </filter>
        <filter id={`${id}-murk`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={16} />
        </filter>
        <radialGradient id={`${id}-glow`}>
          <stop offset="0" stopColor="#4A66FF" stopOpacity={0.55} />
          <stop offset="1" stopColor="#4A66FF" stopOpacity={0} />
        </radialGradient>
      </defs>
      <g clipPath={`url(#${id}-win)`}>
        {/* Light coming up through the liquid behind the die */}
        <circle cx={DC} cy={DC + 10} r={120} fill={`url(#${id}-glow)`} opacity={0.75 - p * 0.45} />
        <g filter={blur > 0.05 ? `url(#${id}-blur)` : undefined} opacity={r2(1 - p * 0.42)}>
          <g
            style={{
              transformOrigin: `${DC}px ${DC + 6}px`,
              // Rocks faster as the bet grows (the duration only steps per tier, so it never jumps mid-drag)
              animation: `lc-e8-bob ${(7 - Math.round(p * 5) * 0.8).toFixed(1)}s ease-in-out infinite`,
            }}
          >
            <Die id={id} cx={DC} cy={DC + 6} r={110} />
          </g>
        </g>
        {/* Ink clouding over the die as the bet grows */}
        <g
          filter={`url(#${id}-murk)`}
          opacity={r2(0.08 + p * 0.62)}
          style={{ transformOrigin: `${DC}px ${DC}px`, animation: "lc-spin 18s linear infinite" }}
        >
          <ellipse cx={DC - 48} cy={DC - 30} rx={62} ry={40} fill="#02040F" />
          <ellipse cx={DC + 56} cy={DC + 18} rx={54} ry={44} fill="#030617" />
          <ellipse cx={DC - 6} cy={DC + 74} rx={70} ry={30} fill="#02040F" />
        </g>
        {/* Bubbles rising through the window */}
        {bubbles.map((b, i) => (
          <g
            key={i}
            style={
              {
                "--rise": "-270px",
                animation: `lc-e8-rise ${b.dur}s linear ${b.delay}s infinite`,
              } as CSSProperties
            }
          >
            <g
              style={
                {
                  "--wob": `${b.wob}px`,
                  animation: `lc-e8-wobble ${b.wobDur}s ease-in-out infinite alternate`,
                } as CSSProperties
              }
            >
              <circle
                cx={DC + b.x}
                cy={DC + 138}
                r={b.r}
                fill="rgba(170,195,255,0.1)"
                stroke="rgba(205,220,255,0.55)"
                strokeWidth={0.7}
              />
              <circle cx={r2(DC + b.x - b.r * 0.35)} cy={r2(DC + 138 - b.r * 0.35)} r={r2(b.r * 0.3)} fill="rgba(255,255,255,0.8)" />
            </g>
          </g>
        ))}
      </g>
    </g>
  );
}

/* ------------------------------------------------------------------------------------------ */
/* Behind the dial                                                                             */
/* ------------------------------------------------------------------------------------------ */

/** Bubbles shaken loose in the window, as % of the ball. */
const WINDOW_BUBBLES = Array.from({ length: 26 }, (_, i) => ({
  x: r2(50 + (frac(i, 91) - 0.5) * 46),
  size: r2(0.5 + frac(i, 92) * 1.2),
  dur: r2(1.6 + frac(i, 93) * 2.2),
  delay: r2(frac(i, 94) * 2.4),
  wob: r2(2 + frac(i, 95) * 6),
  wobDur: r2(0.6 + frac(i, 96) * 0.9),
}));

/** The "8" peeking round the upper right, foreshortened as the ball curves away. */
const DECAL = (() => {
  // Round to the right of the theme picker, even once the ball leans in
  const a = 56;
  const t = (a * Math.PI) / 180;
  return { x: r2(500 + 408 * Math.sin(t)), y: r2(500 - 408 * Math.cos(t)), a };
})();

/** Highlight shapes, in ball units: a softbox's reflection, a hot spot, a bounce and the window's glare. */
const HL = {
  softbox: sector(500, 500, 348, 474, 280, 342),
  streak: sector(500, 500, 436, 456, 290, 334),
  bounce: sector(500, 500, 450, 488, 198, 242),
  glare: sector(500, 500, WIN_R - 52, WIN_R - 16, 296, 338),
  glareSmall: sector(500, 500, WIN_R - 40, WIN_R - 30, 118, 140),
  hot: (() => {
    const t = (311 * Math.PI) / 180;
    return { x: r2(500 + 398 * Math.sin(t)), y: r2(500 - 398 * Math.cos(t)) };
  })(),
};

/**
 * A giant glossy 8 ball behind the dial, the dial set into it as its window. Rim light and the
 * blue glow behind it grow with the bet. Setting the alarm shakes it; it then leans in so the
 * clock sits in the window, and the die floats up behind the drawn time.
 */
export function EightBall({
  p,
  visible,
  size,
  mood = "idle",
}: {
  p: number;
  range: number;
  /** False once the alarm is set: the dial has gone, so the ball leans in to frame the clock. */
  visible: boolean;
  /** Diameter of the dial it sits behind, in px. */
  size: number;
  mood?: SceneMood;
}) {
  const id = `e8b-${cleanId(useId())}`;
  const d = Math.round(size * BALL);
  const leaning = !visible;

  // Each new shake (Set alarm, Roll again) restarts the bubbles and sends the die back down
  const [shakes, setShakes] = useState({ mood, n: 0 });
  if (shakes.mood !== mood) setShakes({ mood, n: shakes.n + (mood === "set" ? 1 : 0) });

  const lean = leaning
    ? `translateY(${r2(LEAN_SHIFT * size)}px) scale(${LEAN_SCALE})`
    : "none";
  const dieY = 50 + (CLOCK_DY / 1000) * 100;

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute"
      style={{ left: -d / 2, top: -d / 2, width: d, height: d }}
    >
      {/* Backlight: lifts the black ball off the black studio, and brightens with the bet */}
      <div
        className="absolute rounded-full"
        style={{
          inset: -d * 0.42,
          background:
            "radial-gradient(circle, rgba(58,84,255,0.34) 0%, rgba(44,64,230,0.14) 36%, rgba(40,60,220,0) 64%)",
          opacity: leaning ? 1 : r2(0.3 + p * 0.6),
          transform: lean,
          transition: `opacity 0.4s, transform ${LEAN_EASE}`,
          animation: leaning ? "lc-e8-pulse 2.4s ease-in-out infinite" : "none",
        }}
      />

      <div className="absolute inset-0" style={{ transform: lean, transition: `transform ${LEAN_EASE}` }}>
        <div
          className="absolute inset-0"
          // Shaken hard while the alarm is being set, then left to settle
          style={{ animation: mood === "set" ? "lc-e8-shake 0.26s ease-in-out 0.1s 6" : "none" }}
        >
          <svg viewBox="0 0 1000 1000" className="absolute inset-0 h-full w-full overflow-visible">
            <defs>
              <radialGradient id={`${id}-body`} cx="0.36" cy="0.3" r="0.78">
                <stop offset="0" stopColor="#363A4D" />
                <stop offset="0.17" stopColor="#1B1D27" />
                <stop offset="0.45" stopColor="#0A0B10" />
                <stop offset="0.8" stopColor="#030304" />
                <stop offset="1" stopColor="#000000" />
              </radialGradient>
              <linearGradient id={`${id}-rim`} gradientUnits="userSpaceOnUse" x1="180" y1="160" x2="840" y2="860">
                <stop offset="0" stopColor="#5A78FF" stopOpacity={0} />
                <stop offset="0.6" stopColor="#5A78FF" stopOpacity={0} />
                <stop offset="1" stopColor="#7C9BFF" stopOpacity={0.95} />
              </linearGradient>
              <radialGradient id={`${id}-decal`} cx="0.38" cy="0.32" r="0.75">
                <stop offset="0" stopColor="#FFFFFF" />
                <stop offset="0.6" stopColor="#E9EBF2" />
                <stop offset="1" stopColor="#A9AEBE" />
              </radialGradient>
              <linearGradient id={`${id}-bezel`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#000000" />
                <stop offset="0.55" stopColor="#07080D" />
                <stop offset="1" stopColor="#22263C" />
              </linearGradient>
              <linearGradient id={`${id}-lip`} x1="0.15" y1="0.1" x2="0.85" y2="0.9">
                <stop offset="0" stopColor="#FFFFFF" stopOpacity={0.4} />
                <stop offset="0.45" stopColor="#FFFFFF" stopOpacity={0.04} />
                <stop offset="1" stopColor="#8EA6FF" stopOpacity={0.3} />
              </linearGradient>
              <radialGradient id={`${id}-liquid`} cx="0.5" cy="0.44" r="0.58">
                <stop offset="0" stopColor="#16247A" />
                <stop offset="0.45" stopColor="#0C164C" />
                <stop offset="0.82" stopColor="#050A26" />
                <stop offset="1" stopColor="#02040E" />
              </radialGradient>
              <filter id={`${id}-soft`} x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation={7} />
              </filter>
              <filter id={`${id}-fine`} x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation={2.5} />
              </filter>
            </defs>

            {/* The ball */}
            <circle cx={500} cy={500} r={500} fill={`url(#${id}-body)`} />
            {/* Rim light, lower right: cobalt, stronger as the bet grows */}
            <circle
              cx={500}
              cy={500}
              r={493}
              fill="none"
              stroke={`url(#${id}-rim)`}
              strokeWidth={14}
              filter={`url(#${id}-soft)`}
              opacity={leaning ? 1 : r2(0.5 + p * 0.5)}
            />
            <circle cx={500} cy={500} r={497} fill="none" stroke="rgba(150,170,255,0.12)" strokeWidth={3} />

            {/* The 8 */}
            <g transform={`translate(${DECAL.x} ${DECAL.y}) rotate(${DECAL.a}) scale(1 0.58)`}>
              <circle r={82} fill={`url(#${id}-decal)`} />
              <text
                y={4}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={118}
                fontWeight={800}
                fill="#07080C"
                style={{ fontFamily: SANS }}
              >
                8
              </text>
            </g>

            {/* The window: a recessed bezel, then the dark liquid (only seen once the dial lifts away) */}
            <circle cx={500} cy={500} r={BEZEL_R} fill={`url(#${id}-bezel)`} />
            <circle cx={500} cy={500} r={BEZEL_R - 2} fill="none" stroke={`url(#${id}-lip)`} strokeWidth={3.5} />
            <circle cx={500} cy={500} r={WIN_R} fill={`url(#${id}-liquid)`} />
          </svg>

          {/* What floats in the window while the alarm is set */}
          {leaning && (
            <div className="absolute inset-0" style={{ clipPath: `circle(${WIN_R / 10}% at 50% 50%)` }}>
              {/* Ink swirling after the shake */}
              <div className="absolute inset-0" style={{ animation: "lc-spin 16s linear infinite", opacity: 0.55 }}>
                {[
                  [36, 40, 30],
                  [64, 56, 34],
                  [46, 70, 28],
                ].map(([x, y, s]) => (
                  <div
                    key={`${x}-${y}`}
                    className="absolute rounded-full"
                    style={{
                      left: `${x - s / 2}%`,
                      top: `${y - s / 2}%`,
                      width: `${s}%`,
                      height: `${s}%`,
                      background: "radial-gradient(circle, rgba(2,4,16,0.9) 0%, rgba(2,4,16,0) 70%)",
                    }}
                  />
                ))}
              </div>
              {/* The die, floating up out of the murk once the shaking stops */}
              <svg
                key={`die-${shakes.n}`}
                viewBox="0 0 1000 1000"
                className="absolute inset-0 h-full w-full"
                style={{
                  transformOrigin: `50% ${r2(dieY)}%`,
                  animation:
                    "lc-e8-surface 2.4s cubic-bezier(0.2, 0.7, 0.2, 1) 1.1s both, lc-e8-bob 5.5s ease-in-out 3.5s infinite",
                  filter: mood === "jackpot" ? "drop-shadow(0 0 18px rgba(110,150,255,0.85))" : undefined,
                }}
              >
                <defs>
                  <DieDefs id={id} />
                </defs>
                <Die id={id} cx={500} cy={500 + CLOCK_DY} r={Math.round((0.39 / LEAN_SCALE) * PER_DIAL)} />
              </svg>
              {/* Bubbles shaken loose */}
              {WINDOW_BUBBLES.map((b, i) => (
                <div
                  key={`${shakes.n}-${i}`}
                  className="absolute"
                  style={
                    {
                      left: `${b.x}%`,
                      top: "78%",
                      "--rise": `${-Math.round(d * 0.56)}px`,
                      animation: `lc-e8-rise ${b.dur}s linear ${b.delay}s infinite both`,
                    } as CSSProperties
                  }
                >
                  <div
                    className="rounded-full"
                    style={
                      {
                        width: `${r2((b.size / 100) * d)}px`,
                        height: `${r2((b.size / 100) * d)}px`,
                        border: "1px solid rgba(205,220,255,0.5)",
                        background:
                          "radial-gradient(circle at 34% 30%, rgba(255,255,255,0.85) 0 12%, rgba(160,185,255,0.14) 32%, rgba(160,185,255,0.04) 72%)",
                        "--wob": `${b.wob}px`,
                        animation: `lc-e8-wobble ${b.wobDur}s ease-in-out infinite alternate`,
                      } as CSSProperties
                    }
                  />
                </div>
              ))}
            </div>
          )}

          {/* Gloss over everything: a softbox's reflection, a hot spot, a bounce, and glare on the glass */}
          <svg viewBox="0 0 1000 1000" className="absolute inset-0 h-full w-full overflow-visible">
            <defs>
              <filter id={`${id}-hl`} x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation={10} />
              </filter>
              <filter id={`${id}-hl2`} x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation={3} />
              </filter>
              {/* The reflection is brightest at the hot spot and fades out along the curve */}
              <radialGradient id={`${id}-sheen`} gradientUnits="userSpaceOnUse" cx={HL.hot.x} cy={HL.hot.y} r={240}>
                <stop offset="0" stopColor="#FFFFFF" stopOpacity={0.5} />
                <stop offset="0.45" stopColor="#FFFFFF" stopOpacity={0.16} />
                <stop offset="1" stopColor="#FFFFFF" stopOpacity={0} />
              </radialGradient>
            </defs>
            <path d={HL.softbox} fill={`url(#${id}-sheen)`} filter={`url(#${id}-hl)`} />
            <path d={HL.streak} fill={`url(#${id}-sheen)`} filter={`url(#${id}-hl2)`} />
            <circle cx={HL.hot.x} cy={HL.hot.y} r={13} fill="#FFFFFF" opacity={0.75} filter={`url(#${id}-hl2)`} />
            <path d={HL.bounce} fill="#8EA6FF" opacity={0.14} filter={`url(#${id}-hl)`} />
            <path d={HL.glare} fill="#FFFFFF" opacity={0.07} filter={`url(#${id}-hl2)`} />
            <path d={HL.glareSmall} fill="#FFFFFF" opacity={0.05} filter={`url(#${id}-hl2)`} />
          </svg>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------------------------------ */
/* The studio                                                                                  */
/* ------------------------------------------------------------------------------------------ */

/** Dust in the key light, coming out in a fixed order as the bet grows. */
const MOTES = Array.from({ length: 34 }, (_, i) => ({
  x: r2(3 + frac(i, 61) * 50),
  y: r2(3 + frac(i, 62) * 72),
  s: r2(1 + frac(i, 63) * 2),
  o: r2(0.2 + frac(i, 64) * 0.5),
  dur: r2(16 + frac(i, 65) * 16),
  delay: r2(-frac(i, 66) * 24),
  order: frac(i, 67),
}));

/** Out-of-focus highlights round the edges of the frame; one more per tier. */
const BOKEH = [
  { x: 7, y: 24, s: 64 },
  { x: 91, y: 18, s: 52 },
  { x: 13, y: 66, s: 40 },
  { x: 94, y: 58, s: 84 },
  { x: 80, y: 82, s: 34 },
  { x: 22, y: 88, s: 48 },
  { x: 70, y: 7, s: 26 },
  { x: 33, y: 10, s: 22 },
  { x: 97, y: 90, s: 42 },
  { x: 3, y: 92, s: 58 },
].map((b, i) => ({ ...b, dur: r2(26 + frac(i, 71) * 20), dx: Math.round((frac(i, 72) - 0.5) * 40), dy: Math.round((frac(i, 73) - 0.5) * 30) }));

export function EightBallScene({ p, tier, mood }: { p: number; tier: number; mood: SceneMood }) {
  const motes = MOTES.filter((m) => m.order < 0.35 + p * 0.65);
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Key light from the upper left */}
      <div
        className="absolute"
        style={{
          left: "-18%",
          top: "-30%",
          width: "85%",
          height: "140%",
          background:
            "radial-gradient(ellipse 44% 58% at 32% 0%, rgba(160,178,255,0.15) 0%, rgba(150,170,255,0.05) 46%, rgba(150,170,255,0) 72%)",
          transform: "rotate(-16deg)",
          opacity: r2(0.75 + p * 0.25),
          transition: "opacity 0.3s",
        }}
      />
      {/* The ball's glow pooling on the floor */}
      <div
        className="absolute inset-x-0 bottom-0 h-1/2"
        style={{
          background: `radial-gradient(ellipse 42% 62% at 50% 100%, rgba(52,80,255,${r2(0.07 + p * 0.17)}) 0%, rgba(52,80,255,0) 72%)`,
        }}
      />
      {/* A faint horizon where the sweep meets the floor */}
      <div
        className="absolute inset-x-0 h-px"
        style={{
          bottom: "16%",
          background: "linear-gradient(90deg, transparent, rgba(150,170,255,0.08) 30%, rgba(150,170,255,0.08) 70%, transparent)",
        }}
      />

      {BOKEH.slice(0, 4 + tier).map((b) => (
        <div
          key={`${b.x}-${b.y}`}
          className="absolute rounded-full"
          style={
            {
              left: `${b.x}%`,
              top: `${b.y}%`,
              width: b.s,
              height: b.s,
              marginLeft: -b.s / 2,
              marginTop: -b.s / 2,
              border: "1px solid rgba(150,172,255,0.1)",
              background: "radial-gradient(circle, rgba(120,145,255,0.03) 0%, rgba(120,145,255,0.08) 100%)",
              filter: "blur(1.5px)",
              "--dx": `${b.dx}px`,
              "--dy": `${b.dy}px`,
              animation: `lc-e8-drift ${b.dur}s ease-in-out infinite alternate, lc-e8-fade 0.8s ease-out both`,
            } as CSSProperties
          }
        />
      ))}

      {motes.map((m, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            left: `${m.x}%`,
            top: `${m.y}%`,
            width: m.s,
            height: m.s,
            opacity: m.o,
            animation: `lc-e8-mote ${m.dur}s ease-in-out ${m.delay}s infinite`,
          }}
        />
      ))}

      {/* On the dot: a flash of cobalt light, as if the window lit up */}
      {mood === "jackpot" && (
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(circle at 50% 45%, rgba(90,125,255,0.35) 0%, rgba(90,125,255,0) 55%)",
            animation: "lc-e8-flash 1.4s ease-out both",
          }}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------------------------------ */
/* Roll and result                                                                             */
/* ------------------------------------------------------------------------------------------ */

const ROLL_BUBBLES = Array.from({ length: 12 }, (_, i) => ({
  x: Math.round(8 + frac(i, 101) * 84),
  size: r2(3 + frac(i, 102) * 4),
  dur: r2(1.1 + frac(i, 103) * 1.1),
  delay: r2(frac(i, 104) * 1.6),
}));

/** Over the progress bar while the draw rolls: the die floating up out of the dark, bubbles streaming past. */
export function EightBallRoll() {
  const id = `e8r-${cleanId(useId())}`;
  return (
    // Clipped along the bottom (the bar), so the die rises out of it
    <div aria-hidden className="relative h-12 w-40" style={{ clipPath: "inset(-90px -70px 0 -70px)" }}>
      {ROLL_BUBBLES.map((b, i) => (
        <span
          key={i}
          className="absolute bottom-0 rounded-full"
          style={
            {
              left: `${b.x}%`,
              width: b.size,
              height: b.size,
              border: "1px solid color-mix(in srgb, currentColor 55%, transparent)",
              "--rise": "-58px",
              animation: `lc-e8-rise ${b.dur}s linear ${b.delay}s infinite both`,
            } as CSSProperties
          }
        />
      ))}
      <motion.svg
        viewBox="0 0 48 48"
        className="absolute bottom-0 left-1/2 -ml-6 h-12 w-12 overflow-visible"
        initial={{ y: 46, rotate: -50, opacity: 0.3 }}
        animate={{ y: 4, rotate: 0, opacity: 1 }}
        transition={{ duration: ROLL_MS / 1000, ease: [0.2, 0.7, 0.2, 1] }}
      >
        <defs>
          <DieDefs id={id} />
        </defs>
        <Die id={id} cx={24} cy={20} r={19} sides={false}>
          <text
            x={24}
            y={17}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={13}
            fontWeight={700}
            fill="#FFFFFF"
            style={{ fontFamily: MONO }}
          >
            ?
          </text>
        </Die>
      </motion.svg>
    </div>
  );
}

/** Beside the result badge: the die, answering YES (a snooze), NO (late) or a sparkle (on the dot). */
export function EightBallVerdict({ mood, className }: { mood: SceneMood; className?: string }) {
  const id = `e8v-${cleanId(useId())}`;
  if (mood !== "win" && mood !== "loss" && mood !== "jackpot") return null;
  const word = mood === "win" ? "YES" : mood === "loss" ? "NO" : null;
  return (
    <span
      aria-hidden
      className={`pointer-events-none absolute block max-sm:hidden ${className ?? ""}`}
      style={{ marginRight: 10 }}
    >
      <span className="block" style={{ animation: "lc-mu-pop 0.45s cubic-bezier(0.2, 0.9, 0.3, 1.2) both" }}>
        <span className="block" style={{ animation: "lc-e8-bob 3.2s ease-in-out 0.45s infinite" }}>
          <svg viewBox="0 0 48 48" className="block h-12 w-12 overflow-visible">
            <defs>
              <DieDefs id={id} />
            </defs>
            <Die id={id} cx={24} cy={21} r={20} sides={false}>
              {word ? (
                <text
                  x={24}
                  y={17.5}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={word.length > 2 ? 9 : 10.5}
                  fontWeight={800}
                  letterSpacing="0.04em"
                  fill="#FFFFFF"
                  style={{ fontFamily: MONO }}
                >
                  {word}
                </text>
              ) : (
                <path
                  d="M24 9.5c.5 4 2 5.5 6 6-4 .5-5.5 2-6 6-.5-4-2-5.5-6-6 4-.5 5.5-2 6-6z"
                  fill="#FFFFFF"
                />
              )}
            </Die>
          </svg>
        </span>
      </span>
    </span>
  );
}
