"use client";

import type { CSSProperties } from "react";
import type { SceneMood } from "@/components/scenes/types";
import { frac } from "@/lib/rand";

/**
 * Caffè illustrations: a moka pot with a face, latte art for the dial, swallows, a Vespa and a
 * ginger street cat. Flat colour with an espresso-brown ink line, like a vintage Italian
 * travel poster. Everything is hand-drawn SVG here, so nothing loads late.
 */

export const CA = {
  ink: "#3A2418",
  espresso: "#5A3522",
  crema: "#B98252",
  foam: "#FBF1E0",
  cream: "#FBF3E4",
  porcelain: "#FFFCF6",
  terracotta: "#C4512F",
  roof: "#B9502E",
  roofDark: "#8F3A22",
  ochre: "#E2A23B",
  gold: "#F3D68A",
  wall: "#EBAE6C",
  wallShade: "#D9955A",
  rose: "#EFB8A4",
  roseShade: "#E19F89",
  shutter: "#2F5D46",
  shutterLight: "#3F7458",
  olive: "#8E9F5C",
  sage: "#A8BC7E",
  leaf: "#5E7A3A",
  leafDark: "#46602B",
  cypress: "#3C4A2A",
  geranium: "#D9473A",
  pink: "#EE7A6E",
  lemon: "#F2C83A",
  window: "#4B2E20",
  windowLight: "#6B4430",
  stone: "#E6D3B3",
  steel: "#CDD2D5",
  steelLight: "#E9ECEE",
  steelMid: "#A9B0B5",
  steelDark: "#7E868C",
  bakelite: "#2E1D15",
  blush: "#EE9A86",
  mouth: "#8E3B2A",
  tongue: "#E07A6A",
  swallow: "#2C3546",
  vespa: "#9FD0BE",
  vespaShade: "#7FB8A3",
  ginger: "#E59448",
  gingerDark: "#B9652A",
  skin: "#F1C7A5",
};

/** A heart, about 16 × 11 around (0, 0). */
export const HEART = "M0 6C-3 3.6-8 1-8-2.8A4 4 0 0 1 0-4.4 4 4 0 0 1 8-2.8C8 1 3 3.6 0 6Z";

/* ---------------------------------------------------------------------------------------------
 * The moka pot. One face per bet tier (the mascot beside the tier name), plus a few for the
 * draw and the result. Drawn on a 48-unit grid: chunky boiler (where the face is), a small
 * collector on top, the spout to the left and a bakelite handle to the right.
 * ------------------------------------------------------------------------------------------- */

export type MokaMood =
  | "sleepy"
  | "calm"
  | "happy"
  | "excited"
  | "jittery"
  | "boiling"
  | "love"
  | "eager";

/** Decaf → the whole moka: dozing, sipping, grinning, wide awake, jittery, boiling over. */
const TIER_MOODS: MokaMood[] = ["sleepy", "calm", "happy", "excited", "jittery", "boiling"];

const W1 = "M9.4 7.4c-1.8-1.6 1.4-2.9-.2-4.9";
const W2 = "M16.4 5.4c-1.6-1.4 1.2-2.4-.2-4.3";
const W3 = "M31.8 5.4c1.6-1.4-1.2-2.4.2-4.3";
const STEAM: Record<MokaMood, string[]> = {
  sleepy: [],
  calm: [W1],
  happy: [W1, W3],
  excited: [W1, W2, W3],
  jittery: [W1, W2, W3],
  boiling: [],
  love: [],
  eager: [W1, W3],
};

function MokaBody() {
  return (
    <g stroke={CA.ink} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round">
      {/* Handle and spout, behind the collector */}
      <path d="M32.2 11.2 39.8 11.8Q41 12 40.7 13.2L38.4 20.6Q38 21.6 37 21.2L34.6 20.2 36.2 14.6 31.8 14.4Z" fill={CA.bakelite} />
      <path d="M16 10.8 10.2 9.2Q9.3 9.1 9.8 9.9L16.6 14.4Z" fill={CA.steel} />
      {/* Collector, with a lit facet and a shaded one */}
      <path d="M15.2 10.4H32.8L29.6 19.6H18.4Z" fill={CA.steel} stroke="none" />
      <path d="M15.2 10.4H19.8L20.8 19.6H18.4Z" fill={CA.steelLight} stroke="none" />
      <path d="M28.2 10.4H32.8L29.6 19.6H27.2Z" fill={CA.steelMid} stroke="none" />
      <path d="M15.2 10.4H32.8L29.6 19.6H18.4Z" fill="none" />
      {/* Lid and knob */}
      <path d="M14.6 10.6Q24 4.8 33.4 10.6Z" fill={CA.steel} />
      <rect x={21.6} y={3.6} width={4.8} height={4.2} rx={1.6} fill={CA.bakelite} />
      {/* Waist */}
      <rect x={17.6} y={19.6} width={12.8} height={2.4} rx={0.6} fill={CA.steelDark} />
      {/* Boiler: where the face lives */}
      <path d="M17.8 22H30.2L37.8 42.6H10.2Z" fill={CA.steel} stroke="none" />
      <path d="M17.8 22H19.8L14.6 42.6H10.2Z" fill={CA.steelLight} stroke="none" />
      <path d="M28.2 22H30.2L37.8 42.6H33.4Z" fill={CA.steelMid} stroke="none" />
      <path d="M17.8 22H30.2L37.8 42.6H10.2Z" fill="none" />
      <rect x={9.4} y={42.4} width={29.2} height={2.9} rx={1.4} fill={CA.steelDark} />
      {/* Glints */}
      <path d="M17 12.4 17.8 17.6M15.8 26 13.6 38.6" stroke="#FFFFFF" strokeWidth={1.1} opacity={0.9} />
    </g>
  );
}

function Dot({ x, y, r = 1.6 }: { x: number; y: number; r?: number }) {
  return (
    <>
      <circle cx={x} cy={y} r={r} fill={CA.ink} />
      <circle cx={x + r * 0.35} cy={y - r * 0.35} r={r * 0.32} fill="#FFFFFF" />
    </>
  );
}

function Cheeks({ hot }: { hot?: boolean }) {
  return (
    <g fill={hot ? "#E5654E" : CA.blush} opacity={hot ? 0.8 : 0.75}>
      <ellipse cx={17.8} cy={34.6} rx={1.7} ry={1.1} />
      <ellipse cx={30.2} cy={34.6} rx={1.7} ry={1.1} />
    </g>
  );
}

/** Motion marks either side of the boiler: it's rattling on the stove. */
function Rattle() {
  return (
    <path
      d="M7.4 27.4 5.2 26.4M6.8 32H4.2M7.4 36.6 5.2 37.6M40.6 27.4 42.8 26.4M41.2 32H43.8M40.6 36.6 42.8 37.6"
      fill="none"
      stroke={CA.ink}
      strokeWidth={1.2}
      strokeLinecap="round"
    />
  );
}

function Face({ mood }: { mood: MokaMood }) {
  const line = { fill: "none", stroke: CA.ink, strokeWidth: 1.4, strokeLinecap: "round", strokeLinejoin: "round" } as const;
  const bigSmile = (
    <>
      <path d="M20.8 34.6H27.2Q26.8 38.6 24 38.6T20.8 34.6Z" fill={CA.mouth} stroke={CA.ink} strokeWidth={1.2} strokeLinejoin="round" />
      <path d="M22.4 37.4Q24 36.4 25.6 37.4 25 38.3 24 38.3T22.4 37.4Z" fill={CA.tongue} />
    </>
  );
  switch (mood) {
    case "sleepy":
      return (
        <>
          <path d="M18.9 31.6q1.9 1.5 3.8 0M25.3 31.6q1.9 1.5 3.8 0" {...line} />
          <path d="M22.9 36.2q1.1.8 2.2 0" {...line} />
          <Cheeks />
          <path d="M36.2 2.6h3l-3 3.2h3M41.4.2h2l-2 2.1h2" {...line} strokeWidth={1.1} />
        </>
      );
    case "calm":
      return (
        <>
          <Dot x={20.8} y={31.6} />
          <Dot x={27.2} y={31.6} />
          <path d="M21.8 35.4q2.2 1.9 4.4 0" {...line} />
          <Cheeks />
        </>
      );
    case "happy":
      return (
        <>
          <path d="M19 32.4q1.8-2.2 3.6 0M25.4 32.4q1.8-2.2 3.6 0" {...line} />
          {bigSmile}
          <Cheeks />
        </>
      );
    case "excited":
      return (
        <>
          <path d="M18.8 27.6q1.6-1.2 3.2-.3M29.2 27.6q-1.6-1.2-3.2-.3" {...line} strokeWidth={1.1} />
          {[20.6, 27.4].map((x) => (
            <g key={x}>
              <circle cx={x} cy={31.4} r={2.4} fill="#FFFFFF" stroke={CA.ink} strokeWidth={1.1} />
              <Dot x={x + 0.2} y={31.7} r={1.25} />
            </g>
          ))}
          {bigSmile}
          <Cheeks />
          {/* A sparkle off the lid */}
          <path d="M40.6 3.4c.3 1.5.8 2 2.3 2.3-1.5.3-2 .8-2.3 2.3-.3-1.5-.8-2-2.3-2.3 1.5-.3 2-.8 2.3-2.3Z" fill={CA.ochre} stroke={CA.ink} strokeWidth={0.8} strokeLinejoin="round" />
        </>
      );
    case "jittery":
      return (
        <>
          {[20.4, 27.6].map((x) => (
            <circle key={x} cx={x} cy={31.2} r={2.6} fill="#FFFFFF" stroke={CA.ink} strokeWidth={1.1} />
          ))}
          <circle cx={19.6} cy={30.6} r={0.8} fill={CA.ink} />
          <circle cx={28.4} cy={31.9} r={0.8} fill={CA.ink} />
          <path d="M20.4 36.4l1.2-1.1 1.2 1.1 1.2-1.1 1.2 1.1 1.2-1.1 1.2 1.1" {...line} strokeWidth={1.2} />
          <path d="M13.4 21.4q-1.6 2.4 0 3.4 1.6-1 0-3.4Z" fill="#9BD0EA" stroke={CA.ink} strokeWidth={0.9} />
          <Rattle />
        </>
      );
    case "boiling":
      return (
        <>
          <path d="M19 29.8l3.2 1.8-3.2 1.8M29 29.8l-3.2 1.8 3.2 1.8" {...line} strokeWidth={1.5} />
          <ellipse cx={24} cy={36.8} rx={2.7} ry={2.4} fill={CA.mouth} stroke={CA.ink} strokeWidth={1.2} />
          <Cheeks hot />
          <Rattle />
          {/* Coffee boiling out of the spout, under a blast of steam */}
          <path d="M10.4 9.6q-1.6 2.6-.4 4.4 1.3-.9.9-2.8" fill={CA.espresso} stroke={CA.ink} strokeWidth={0.9} />
          <g fill="#FFF8EE" stroke={CA.ink} strokeWidth={1.1}>
            <circle cx={5.6} cy={4.4} r={2.6} />
            <circle cx={9.4} cy={2.6} r={3.2} />
            <circle cx={13.8} cy={3.4} r={2.4} />
            <circle cx={36} cy={3.2} r={2.2} />
            <circle cx={39.6} cy={1.6} r={2.8} />
          </g>
        </>
      );
    case "love":
      return (
        <>
          {[20.6, 27.4].map((x) => (
            <path key={x} d={HEART} transform={`translate(${x} 31.6) scale(0.34)`} fill={CA.terracotta} stroke={CA.ink} strokeWidth={2.6} />
          ))}
          {bigSmile}
          <Cheeks />
          <path d={HEART} transform="translate(9 3.6) scale(0.32)" fill={CA.terracotta} />
          <path d={HEART} transform="translate(38.4 2.6) scale(0.26)" fill={CA.pink} />
        </>
      );
    case "eager":
      return (
        <>
          <Dot x={20.8} y={30.8} />
          <Dot x={27.2} y={30.8} />
          <path d="M19 28q1.6-1.1 3.2-.4M29 28q-1.6-1.1-3.2-.4" {...line} strokeWidth={1.1} />
          <circle cx={24} cy={36} r={1.3} fill={CA.mouth} stroke={CA.ink} strokeWidth={1.1} />
          <Cheeks />
        </>
      );
  }
}

/**
 * A moka pot with a face. `puffing`: the steam rises in puffs instead of being drawn on.
 * `faceless`: just a moka pot (the one on the café table).
 */
export function MokaPot({
  mood,
  puffing,
  faceless,
  className,
  style,
}: {
  mood: MokaMood;
  puffing?: boolean;
  faceless?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <svg aria-hidden viewBox="0 0 48 48" className={className} style={{ overflow: "visible", ...style }}>
      {!puffing &&
        !faceless &&
        STEAM[mood].map((d) => (
          <path key={d} d={d} fill="none" stroke={CA.ink} strokeWidth={1.3} strokeLinecap="round" opacity={0.7} />
        ))}
      {puffing && <Puffs />}
      <MokaBody />
      {!faceless && <Face mood={mood} />}
    </svg>
  );
}

/** Little steam puffs rising off the spout and the lid, one after another. */
function Puffs() {
  return (
    <g fill="#FFF8EE" stroke={CA.ink} strokeWidth={0.9}>
      {[
        [9.6, 7.6, 0],
        [16, 5, 0.45],
        [9.6, 7.6, 0.9],
        [31.6, 5, 1.2],
      ].map(([x, y, d], i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r={2}
          style={{
            transformBox: "fill-box",
            transformOrigin: "center",
            opacity: 0,
            animation: `lc-cafe-puff 1.6s ease-out ${d}s infinite`,
          }}
        />
      ))}
    </g>
  );
}

/** The mascot beside the tier name: a moka pot more wired at every tier. */
export function MokaFace({ tier, className, style }: { tier: number; className?: string; style?: CSSProperties }) {
  return <MokaPot mood={TIER_MOODS[Math.max(0, Math.min(TIER_MOODS.length - 1, tier))]} className={className} style={style} />;
}

/** Beside the result badge: dozes off (snooze), boils over (late), or falls in love (on the dot). */
export function MokaVerdict({ mood, className }: { mood: SceneMood; className?: string }) {
  if (mood !== "win" && mood !== "loss" && mood !== "jackpot") return null;
  const face: MokaMood = mood === "win" ? "sleepy" : mood === "loss" ? "boiling" : "love";
  const move =
    mood === "loss"
      ? "lc-cafe-rattle 0.18s linear 0.45s infinite"
      : mood === "jackpot"
        ? "lc-bob 0.9s ease-in-out 0.45s infinite"
        : "lc-cafe-doze 3s ease-in-out 0.45s infinite";
  return (
    <span aria-hidden className={`pointer-events-none absolute block max-sm:hidden ${className ?? ""}`} style={{ marginRight: 6 }}>
      <span className="block" style={{ animation: "lc-mu-pop 0.45s cubic-bezier(0.2, 0.9, 0.3, 1.2) both" }}>
        <span className="block" style={{ transformOrigin: "50% 100%", animation: move }}>
          <MokaPot mood={face} className="block h-12 w-12" />
        </span>
      </span>
    </span>
  );
}

/** Shown above the progress bar while the draw rolls: the moka on the stove, about to gurgle. */
export function CafeRoll() {
  return (
    <div aria-hidden className="relative mb-2 h-[58px] w-[58px]">
      <div className="absolute inset-x-0 top-0 h-[50px]" style={{ transformOrigin: "50% 100%", animation: "lc-cafe-rattle 0.22s linear infinite" }}>
        <MokaPot mood="eager" puffing className="h-full w-full" />
      </div>
      {/* A gas ring underneath, its little blue flames flickering */}
      <svg viewBox="0 0 58 10" className="absolute inset-x-0 bottom-0 h-[10px] w-full" style={{ overflow: "visible" }}>
        {[17, 23, 29, 35, 41].map((x, i) => (
          <path
            key={x}
            d={`M${x} 6c-1.6-1.4-1.2-3.2 0-4.6 1.2 1.4 1.6 3.2 0 4.6Z`}
            fill="#6FA8DC"
            stroke={CA.ink}
            strokeWidth={0.6}
            style={{
              transformBox: "fill-box",
              transformOrigin: "50% 100%",
              animation: `lc-flicker 0.4s ease-in-out ${(-i * 0.13).toFixed(2)}s infinite`,
            }}
          />
        ))}
        <rect x={12} y={6} width={34} height={2.6} rx={1.3} fill={CA.bakelite} />
      </svg>
    </div>
  );
}

/* ---------------------------------------------------------------------------------------------
 * Latte art for the dial (the "latte" ornament), on the dial's 358-unit grid. The dial is a
 * cappuccino seen from above; above the time, the barista's pour gets fancier with the bet
 * (a little heart, a heart, a tulip, a rosetta), and from Doppio up the cup's being stirred:
 * the crema swirls round, faster at the full 45. A green band round the cup's lip matches the
 * saucer behind it.
 * ------------------------------------------------------------------------------------------- */

const C = 179;
const POUR = "#B98252";
const r2 = (n: number) => Math.round(n * 100) / 100;

/** A latte-art heart with its pour line, about 30 wide, centred on (0, 0). */
function PourHeart({ s = 1 }: { s?: number }) {
  return (
    <g transform={`scale(${s})`}>
      <path d="M0 11C-6 6.6-15 2-15-5A7.6 7.6 0 0 1 0-8 7.6 7.6 0 0 1 15-5C15 2 6 6.6 0 11Z" />
      <path d="M0-6.6V14" fill="none" stroke={POUR} strokeWidth={1.6} strokeLinecap="round" />
    </g>
  );
}

function Tulip() {
  return (
    <g>
      <g transform="translate(0 6)">
        <PourHeart s={0.95} />
      </g>
      <path d="M-10-6.4C-10-11.6-5.6-14.4 0-12.2 5.6-14.4 10-11.6 10-6.4 6-9 -6-9-10-6.4Z" />
      <path d="M-6.4-15.6C-6.4-19-3.4-20.6 0-19.2 3.4-20.6 6.4-19 6.4-15.6 3.6-17.4-3.6-17.4-6.4-15.6Z" />
    </g>
  );
}

/** A rosetta: stacked waves of milk with the pour drawn up through them. */
const ROSETTA = Array.from({ length: 7 }, (_, k) => {
  const y = 13 - k * 4.6;
  const w = 15 - k * 1.7;
  return `M${r2(-w)} ${r2(y - 3)}Q0 ${r2(y + 4.4)} ${r2(w)} ${r2(y - 3)}`;
}).join("");

function Rosetta() {
  return (
    <g fill="none" stroke={POUR} strokeLinecap="round">
      <path d={ROSETTA} strokeWidth={3.2} />
      <path d="M0-20V18" strokeWidth={1.6} />
    </g>
  );
}

/** The crema swirling round the cup once it's stirred. */
const SWIRL = Array.from({ length: 7 }, (_, k) => {
  const r = 86 + (k % 3) * 9;
  const a1 = ((k * 360) / 7) * (Math.PI / 180);
  const a2 = a1 + 0.9 + (k % 2) * 0.35;
  const pt = (a: number, rr: number) => `${r2(C + rr * Math.sin(a))} ${r2(C - rr * Math.cos(a))}`;
  return `M${pt(a1, r)}A${r} ${r} 0 0 1 ${pt(a2, r - 4)}`;
}).join("");

/** Bubbles in the foam, near the crema. */
const BUBBLES = Array.from({ length: 14 }, (_, i) => {
  const a = frac(i, 401) * Math.PI * 2;
  const r = 92 + frac(i, 402) * 16;
  return { x: r2(C + r * Math.sin(a)), y: r2(C - r * Math.cos(a)), r: r2(1 + frac(i, 403) * 1.4) };
});

export function LatteArt({ tier }: { tier: number }) {
  const stirred = tier >= 4;
  const motif =
    tier === 0 ? <PourHeart s={0.62} /> : tier === 1 ? <PourHeart /> : tier === 2 ? <Tulip /> : <Rosetta />;
  return (
    <g>
      {/* The cup's green band, round the lip */}
      <circle cx={C} cy={C} r={169.5} fill="none" stroke={CA.shutter} strokeWidth={2.6} opacity={0.85} />
      <g fill="none" stroke={POUR} strokeWidth={0.9} opacity={0.4}>
        {BUBBLES.map((b, i) => (
          <circle key={i} cx={b.x} cy={b.y} r={b.r} />
        ))}
      </g>
      <g
        style={{
          transformOrigin: `${C}px ${C}px`,
          animation: stirred ? `lc-spin ${tier === 5 ? 2.2 : 7}s linear infinite` : "none",
        }}
      >
        {stirred && <path d={SWIRL} fill="none" stroke={POUR} strokeWidth={3} strokeLinecap="round" opacity={0.42} />}
        {/* (Positioned by the outer group: the pop's CSS transform would replace the attribute) */}
        <g transform={`translate(${C} 121)`}>
          <g
            key={tier}
            fill={POUR}
            opacity={0.55}
            style={{ animation: "lc-icon-pop 0.45s cubic-bezier(0.2, 0.9, 0.3, 1.2) both", transformBox: "fill-box", transformOrigin: "center" }}
          >
            {motif}
          </g>
        </g>
      </g>
      {/* "Good morning", dusted on in cocoa through a stencil */}
      <text
        x={C}
        y={252}
        fontSize={9.5}
        textAnchor="middle"
        letterSpacing="0.3em"
        fill={POUR}
        opacity={0.75}
        style={{ fontFamily: "var(--font-geist-serif), serif" }}
      >
        BUONGIORNO
      </text>
    </g>
  );
}

/* ---------------------------------------------------------------------------------------------
 * Creatures and things
 * ------------------------------------------------------------------------------------------- */

/** A swallow in flight, facing right, wings beating at `flap` seconds a beat. */
export function Swallow({ flap, className, style }: { flap: number; className?: string; style?: CSSProperties }) {
  const wing = (far: boolean): CSSProperties => ({
    transformBox: "view-box",
    transformOrigin: "24px 11px",
    animation: `lc-flap ${flap.toFixed(2)}s ease-in-out ${far ? (-flap / 6).toFixed(2) : "0"}s infinite`,
  });
  return (
    <svg aria-hidden viewBox="0 0 40 24" className={className} style={{ overflow: "visible", ...style }}>
      <path d="M26.6 10.4C22 7 16 3.6 7.4 2.2 13.6 5.8 18.4 9.2 22.4 12Z" fill="#46526A" style={wing(true)} />
      <path d="M38.6 11 34.6 9.6C31 8.6 27 9.2 23 10.4 19 11.4 15 11.6 11 11L2 6.4 8.6 12.4 2.4 17.8 11.6 13.6C15.6 14.2 20 14.4 24 13.8 28.4 13.2 32.4 12.8 34.6 12.4Z" fill={CA.swallow} />
      <path d="M24 13.8C20 14.4 15.6 14.2 12 13.4 16 15.6 21 15.8 24 13.8Z" fill="#F3E6D3" />
      <circle cx={35} cy={11.6} r={1} fill="#B8552F" />
      <path d="M27.2 10.6C22.4 6 17 2 7 0 13.4 4.2 18.6 8.6 22.8 12Z" fill={CA.swallow} style={wing(false)} />
    </svg>
  );
}

/** A Vespa with a rider in a headscarf, riding right. */
export function Vespa({ fast, className, style }: { fast?: boolean; className?: string; style?: CSSProperties }) {
  const spin: CSSProperties = {
    transformBox: "fill-box",
    transformOrigin: "center",
    animation: `lc-spin ${fast ? 0.25 : 0.45}s linear infinite`,
  };
  const wheel = (x: number) => (
    <g>
      <circle cx={x} cy={46} r={7.4} fill={CA.bakelite} />
      <g style={spin}>
        <circle cx={x} cy={46} r={3.6} fill={CA.steel} stroke={CA.ink} strokeWidth={0.8} />
        <path d={`M${x - 3.4} 46H${x + 3.4}M${x} 42.6V49.4`} stroke={CA.ink} strokeWidth={0.8} />
      </g>
    </g>
  );
  return (
    <svg aria-hidden viewBox="0 -16 80 70" className={className} style={{ overflow: "visible", ...style }}>
      {/* Scarf streaming out behind */}
      <path
        d="M29.4-1.6C24-3.4 19-1.6 13.6-3.4 17.4-.6 22.4.8 28.4.6Z"
        fill={CA.geranium}
        stroke={CA.ink}
        strokeWidth={1}
        strokeLinejoin="round"
        style={{ transformBox: "fill-box", transformOrigin: "100% 50%", animation: `lc-cafe-scarf ${fast ? 0.18 : 0.3}s ease-in-out infinite` }}
      />
      <g style={{ animation: `lc-cafe-bump ${fast ? 0.2 : 0.34}s ease-in-out infinite` }}>
        {wheel(18)}
        {wheel(64)}
        <g stroke={CA.ink} strokeWidth={1.3} strokeLinejoin="round">
          {/* Rider: legs, jacket, arm, head */}
          <path d="M27.6 21.8 40.6 24.2 43 38.4" fill="none" stroke="#3E4A5A" strokeWidth={5} strokeLinecap="round" />
          <ellipse cx={45} cy={39.4} rx={3.2} ry={1.8} fill={CA.espresso} />
          <path d="M23.4 22.2C22.6 14 25 6.2 30.2 3.2 34.2 1 37.4 3.4 37.6 7.4L35.8 21.4Z" fill={CA.ochre} />
          <path d="M33.6 6.4 51.6 11.2" fill="none" stroke={CA.ochre} strokeWidth={4.2} strokeLinecap="round" />
          <circle cx={52.2} cy={11.6} r={1.9} fill={CA.skin} strokeWidth={1} />
          <circle cx={33.4} cy={-4.4} r={5.4} fill={CA.skin} />
          <path d="M27.8-4.2C27.6-9.6 31.6-11.4 34.6-10.8 37.6-10.2 39.2-7.8 38.6-5.6 35.4-7.6 31-7.4 28.6-2.4Z" fill={CA.geranium} />
          <path d="M35.2-5.2H39.2V-3.4H35.2Z" fill={CA.ink} strokeWidth={0} />
        </g>
        <g stroke={CA.ink} strokeWidth={1.3} strokeLinejoin="round">
          {/* Rear cowl over the back wheel, the seat on top */}
          <path d="M7 42C5 32 11 25 21 24.5H33C37 24.5 39 27.5 38.6 31L37.6 38.6C37.4 40.6 36 41.6 34 41.6H26C25 37.6 21.6 35.4 18 35.4 14 35.4 11 38 10.4 42Z" fill={CA.vespa} />
          <path d="M14 24.6C14 21.4 17 20.4 22 20.4H33C35.4 20.4 36.4 21.8 36 24.6Z" fill={CA.espresso} />
          <path d="M36 38.6H52L54 42.6H36Z" fill={CA.vespaShade} />
          {/* Leg shield, front mudguard, handlebar and headlight */}
          <path d="M50.6 41.8C52.8 33 53.6 26 54 18H58.6C58.8 26 58.2 33 57 38 56.6 40 55.6 41.6 54 42.4Z" fill={CA.vespa} />
          <path d="M56 42C57 37.6 61 35.6 65 35.8 69 36 71.6 38.6 72 42.4H68.6C68 40 66.4 38.8 64 38.8 61.6 38.8 60 40.4 59.6 42.4Z" fill={CA.vespa} />
          <path d="M56.4 18V11.6M50 12.2 60.6 10.8" fill="none" strokeWidth={2} strokeLinecap="round" />
          <circle cx={59.8} cy={14.6} r={3.2} fill={CA.cream} />
          <circle cx={6.6} cy={34.4} r={1.4} fill={CA.geranium} strokeWidth={0.8} />
        </g>
      </g>
    </svg>
  );
}

export type CatMood = "asleep" | "awake" | "alert" | "love";

/**
 * A ginger cat sitting on a windowsill, about 30 wide and 52 tall, its paws at (0, 0): asleep,
 * awake (tail swishing), alert (wide eyes, ears up, tail bristling) or smitten.
 */
export function Cat({ mood, swish }: { mood: CatMood; swish: number }) {
  const line = { fill: "none", stroke: CA.ink, strokeWidth: 1.2, strokeLinecap: "round" } as const;
  const alert = mood === "alert";
  return (
    <g strokeLinejoin="round">
      {/* Tail hanging over the sill, swishing */}
      <path
        d="M9 -3C16 0 19 8 16 15"
        fill="none"
        stroke={CA.ink}
        strokeWidth={alert ? 8.6 : 6.6}
        strokeLinecap="round"
        style={{ transformBox: "view-box", transformOrigin: "9px -3px", animation: mood === "asleep" ? "none" : `lc-cafe-swish ${swish.toFixed(2)}s ease-in-out infinite` }}
      />
      <path
        d="M9 -3C16 0 19 8 16 15"
        fill="none"
        stroke={CA.ginger}
        strokeWidth={alert ? 6.2 : 4.2}
        strokeLinecap="round"
        style={{ transformBox: "view-box", transformOrigin: "9px -3px", animation: mood === "asleep" ? "none" : `lc-cafe-swish ${swish.toFixed(2)}s ease-in-out infinite` }}
      />
      {/* Body and bib */}
      <path d="M-12 0C-14-12-10-24 0-26 10-24 14-12 12 0Z" fill={CA.ginger} stroke={CA.ink} strokeWidth={1.3} />
      <path d="M-5 0C-6-10-3-18 0-19 3-18 6-10 5 0Z" fill="#F8E3C2" />
      <path d="M-11-10q3 .6 4.6 2.6M11-10q-3 .6-4.6 2.6" {...line} stroke={CA.gingerDark} strokeWidth={1.4} />
      <ellipse cx={-4.4} cy={-0.6} rx={3.2} ry={1.8} fill="#F8E3C2" stroke={CA.ink} strokeWidth={1} />
      <ellipse cx={4.4} cy={-0.6} rx={3.2} ry={1.8} fill="#F8E3C2" stroke={CA.ink} strokeWidth={1} />
      {/* Head */}
      <g transform={`translate(0 ${alert ? -36 : -34})`}>
        <path
          d={alert ? "M-9.6-4-8.4-15.4-2.2-7.4ZM9.6-4 8.4-15.4 2.2-7.4Z" : "M-9.8-3-8.6-13.4-2.6-6.6ZM9.8-3 8.6-13.4 2.6-6.6Z"}
          fill={CA.ginger}
          stroke={CA.ink}
          strokeWidth={1.3}
        />
        <path d={alert ? "M-7.8-6.2-7.6-11.8-4.6-8ZM7.8-6.2 7.6-11.8 4.6-8Z" : "M-7.8-5.2-7.6-10.2-4.8-7ZM7.8-5.2 7.6-10.2 4.8-7Z"} fill="#F2A7A0" />
        <ellipse cx={0} cy={0} rx={11.4} ry={9.6} fill={CA.ginger} stroke={CA.ink} strokeWidth={1.3} />
        <path d="M-3-8.4l.8 2.6M0-8.8v2.8M3-8.4l-.8 2.6" {...line} stroke={CA.gingerDark} strokeWidth={1.3} />
        {mood === "asleep" && <path d="M-6.4-.2q2.2 1.8 4.4 0M2-.2q2.2 1.8 4.4 0" {...line} />}
        {mood === "awake" && (
          <>
            <ellipse cx={-4.2} cy={-0.6} rx={1.7} ry={2.2} fill={CA.ink} />
            <ellipse cx={4.2} cy={-0.6} rx={1.7} ry={2.2} fill={CA.ink} />
            <circle cx={-3.6} cy={-1.4} r={0.6} fill="#FFFFFF" />
            <circle cx={4.8} cy={-1.4} r={0.6} fill="#FFFFFF" />
          </>
        )}
        {alert && (
          <>
            <circle cx={-4.4} cy={-0.8} r={3} fill="#E9E27A" stroke={CA.ink} strokeWidth={1} />
            <circle cx={4.4} cy={-0.8} r={3} fill="#E9E27A" stroke={CA.ink} strokeWidth={1} />
            <path d="M-4.4-3V1.4M4.4-3V1.4" stroke={CA.ink} strokeWidth={1.4} strokeLinecap="round" />
          </>
        )}
        {mood === "love" &&
          [-4.3, 4.3].map((x) => <path key={x} d={HEART} transform={`translate(${x} -0.8) scale(0.36)`} fill={CA.terracotta} stroke={CA.ink} strokeWidth={2.4} />)}
        <path d="M-1.2 2.6h2.4L0 4Z" fill="#E98C8C" />
        <path d="M0 4q-1.2 1.6-2.6.8M0 4q1.2 1.6 2.6.8" {...line} strokeWidth={1} />
        <path d="M-6 3.4-14.6 2.2M-6 4.8-14 6.2M6 3.4 14.6 2.2M6 4.8 14 6.2" {...line} strokeWidth={0.7} opacity={0.7} />
        {mood === "love" && <ellipse cx={-7} cy={3} rx={1.8} ry={1.1} fill={CA.blush} opacity={0.8} />}
        {mood === "love" && <ellipse cx={7} cy={3} rx={1.8} ry={1.1} fill={CA.blush} opacity={0.8} />}
      </g>
    </g>
  );
}

/** A puffy cream cumulus, flat-bottomed, `w` wide. */
export function Cloud({ w, className, style }: { w: number; className?: string; style?: CSSProperties }) {
  return (
    <svg aria-hidden viewBox="0 0 120 52" width={w} className={className} style={style}>
      <path
        d="M10 50C2 50 0 40 8 37 6 27 18 22 26 27 28 14 44 9 52 18 58 6 78 6 82 20 90 13 104 18 102 30 114 29 120 40 112 47 110 50 106 50 104 50Z"
        fill="#FFF7EA"
      />
      <path d="M8 46C24 48 70 49 112 46 110 50 106 50 104 50H10C6 50 6.6 47.6 8 46Z" fill="#F4E2CA" />
    </svg>
  );
}
