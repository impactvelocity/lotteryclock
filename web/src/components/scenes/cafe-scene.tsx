"use client";

import { AnimatePresence, motion } from "motion/react";
import { useId, type CSSProperties, type ReactNode } from "react";
import { CA, Cat, Cloud, HEART, MokaPot, Swallow, Vespa, type CatMood } from "@/components/scenes/cafe-art";
import type { SceneMood } from "@/components/scenes/types";
import { frac } from "@/lib/rand";
import { cssA, rampN } from "@/lib/themes";

/**
 * Caffè's background: a Tuscan street café on a summer morning, the hills rolling away behind.
 *
 *   0 min     Decaf: a quiet morning. One swallow, the cat asleep on the sill.
 *   1–11      Latte: the cat's up, a couple more swallows.
 *   12–23     Cappuccino: the sky warms, the laundry starts to flap.
 *   24–35     Espresso: a Vespa buzzes down the street every so often.
 *   36–44     Doppio: the cat's wired, the moka on the café table starts puffing.
 *   45        The whole moka: swallows everywhere, the Vespa flat out.
 *
 * Behind the dial (CafeSaucer), the dial is a cappuccino in its cup, on a saucer with a spoon
 * and a biscotto, steaming harder the bigger the bet. A snooze closes the café for riposo
 * (shutters shut, the sign flips over, the cat dozes off); a late result sends the street into
 * a flap; a jackpot floats hearts up round the clock. Purely decorative and pointer-transparent.
 */

type Props = {
  /** Bet as a fraction of the maximum, 0..1. */
  p: number;
  /** Bet tier, 0 (no gamble) to 5 (the full 45). */
  tier: number;
  mood: SceneMood;
};

const clamp = (n: number) => Math.max(0, Math.min(1, n));
const cleanId = (id: string) => id.replace(/[^a-zA-Z0-9_-]/g, "");

/** Swallow lanes across the sky; `dir` -1 flies right to left. They join in this order. */
const SWALLOWS = [
  { top: 11, dur: 16, delay: -2, size: 34, dir: 1, swoop: 4.2 },
  { top: 24, dur: 19, delay: -9, size: 28, dir: -1, swoop: 3.6 },
  { top: 16, dur: 14, delay: -6, size: 30, dir: 1, swoop: 5 },
  { top: 36, dur: 21, delay: -14, size: 24, dir: -1, swoop: 4.6 },
  { top: 7, dur: 17, delay: -12, size: 26, dir: -1, swoop: 3.8 },
  { top: 30, dur: 15, delay: -3, size: 32, dir: 1, swoop: 4.4 },
  { top: 44, dur: 18, delay: -7, size: 22, dir: 1, swoop: 5.4 },
  { top: 19, dur: 13, delay: -10, size: 26, dir: -1, swoop: 3.4 },
];
const SWALLOWS_AT = [1, 2, 3, 4, 6, 8];

const CLOUDS = [
  { top: 13, w: 150, dur: 170, delay: -40 },
  { top: 31, w: 104, dur: 130, delay: -95 },
];

/**
 * Building width: both houses, and where the café table sits. Narrows quickly below ~1200px,
 * so the houses stay clear of the side labels.
 */
const HOUSE_W = "clamp(72px, calc(22vw - 120px), 210px)";

export function CafeScene({ p, tier, mood }: Props) {
  // A snooze calms the street right down; a late result sets it all off.
  const lively = clamp(mood === "win" ? p * 0.2 : mood === "loss" ? Math.max(p, 0.85) : p);
  const closed = mood === "win";
  const sign: SignFace = mood === "win" ? "riposo" : mood === "jackpot" ? "perfetto" : "cup";
  const cat: CatMood =
    mood === "win"
      ? "asleep"
      : mood === "loss"
        ? "alert"
        : mood === "jackpot"
          ? "love"
          : tier === 0
            ? "asleep"
            : tier >= 4
              ? "alert"
              : "awake";
  const swallows =
    mood === "win"
      ? 0
      : mood === "loss"
        ? SWALLOWS.length
        : mood === "jackpot"
          ? 3
          : Math.min(SWALLOWS.length, SWALLOWS_AT[tier] + (mood === "set" ? 1 : 0));
  const flap = 0.5 - lively * 0.28;
  // The Vespa: from Espresso up, and tearing past on a late result. Keyed by speed, so a new
  // speed starts a fresh run from the left edge instead of jumping mid-street.
  const ride =
    mood === "loss" ? 3.2 : mood === "win" || mood === "jackpot" || tier < 3 ? 0 : tier === 5 ? 4.4 : tier === 4 ? 7 : 10;
  const puffing = mood === "set" || mood === "loss" || (mood === "idle" && tier >= 4);
  const glow = rampN(["#FFE6B8", "#FFCB92", "#FFA676"], lively);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Warm haze rising off the hills */}
      <div
        className="absolute inset-x-0 bottom-0 h-[60%]"
        style={{
          background: `radial-gradient(ellipse 85% 70% at 50% 100%, ${cssA(glow, 0.55 + lively * 0.25)} 0%, ${cssA(glow, 0.2)} 50%, transparent 80%)`,
          transition: "background 600ms ease-out",
        }}
      />

      {CLOUDS.map((c, i) => (
        <div
          key={i}
          className="lc-drifter absolute left-0"
          style={{
            top: `${c.top}%`,
            ["--x" as string]: `${i ? 72 : 8}%`,
            animation: `lc-drift ${c.dur}s linear ${c.delay}s infinite`,
          }}
        >
          <Cloud w={c.w} />
        </div>
      ))}

      {/* Swallows swooping across the sky, more and more of them */}
      {SWALLOWS.map((s, i) => (
        <div
          key={i}
          className="lc-drifter absolute left-0"
          style={{
            top: `${s.top}%`,
            ["--x" as string]: `${(i * 23 + 9) % 90}%`,
            animation: `lc-drift ${s.dur}s linear ${s.delay}s infinite ${s.dir < 0 ? "reverse" : "normal"}`,
            opacity: i < swallows ? 1 : 0,
            transition: "opacity 500ms",
          }}
        >
          <div style={{ animation: `lc-cafe-swoop ${s.swoop}s ease-in-out ${(-i * 0.7).toFixed(1)}s infinite` }}>
            <Swallow flap={flap} style={{ width: s.size, transform: s.dir < 0 ? "scaleX(-1)" : undefined }} />
          </div>
        </div>
      ))}

      <Landscape />

      {/* The café on the left, a pink house on the right (not on phones: no room) */}
      <div className="absolute bottom-0 left-0 max-md:hidden" style={{ width: HOUSE_W }}>
        <CafeFront closed={closed} sign={sign} lively={lively} loss={mood === "loss"} />
      </div>
      <div className="absolute right-0 bottom-0 max-md:hidden" style={{ width: HOUSE_W }}>
        <CasaRosa closed={closed} cat={cat} lively={lively} loss={mood === "loss"} />
      </div>

      <Street />

      {/* A table outside the café, the moka on it puffing away */}
      <div
        className="absolute bottom-[10px] max-md:left-[3%] max-md:w-[72px]"
        style={{ left: `calc(${HOUSE_W} - 22px)`, width: "clamp(72px, 7.5vw, 118px)" }}
      >
        <CafeTable puffing={puffing} />
      </div>

      {ride > 0 && (
        <div
          key={ride}
          className="lc-cafe-rider absolute bottom-[4px] left-0"
          style={{ animation: `lc-cafe-ride ${ride}s linear infinite` }}
        >
          <Vespa fast={ride < 5} className="block w-[clamp(54px,5.4vw,76px)]" />
          {mood === "loss" && (
            <span
              className="absolute -top-5 left-[70%] rounded-full px-2 py-0.5 text-[11px] font-bold whitespace-nowrap"
              style={{ background: CA.cream, color: CA.ink, boxShadow: `0 0 0 1.5px ${CA.ink}` }}
            >
              beep beep!
            </span>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------------------------------
 * The hills: a cloud bank on the horizon, hazy far hills, sage hills with farmhouses, a
 * cypress-lined road winding up from the street, olive groves and vines on the near slopes and
 * a wheat field in the valley. Sliced to the hero's width, so phones see the middle.
 * ------------------------------------------------------------------------------------------- */

function cypress(x: number, y: number, h: number, w: number) {
  const r = (n: number) => Math.round(n * 10) / 10;
  return {
    body: `M${x} ${y}C${r(x - w)} ${r(y - h * 0.35)} ${r(x - w * 0.7)} ${r(y - h * 0.8)} ${x} ${r(y - h)}C${r(x + w * 0.7)} ${r(y - h * 0.8)} ${r(x + w)} ${r(y - h * 0.35)} ${x} ${y}Z`,
    lit: `M${x} ${y}C${r(x - w)} ${r(y - h * 0.35)} ${r(x - w * 0.7)} ${r(y - h * 0.8)} ${x} ${r(y - h)}C${r(x - w * 0.15)} ${r(y - h * 0.6)} ${r(x - w * 0.2)} ${r(y - h * 0.3)} ${x} ${y}Z`,
  };
}

const CYPRESSES = [
  // Round the left farmhouse
  [246, 232, 46, 8],
  [259, 234, 56, 9],
  [348, 230, 40, 7],
  [360, 233, 50, 8],
  // Lining the road up to the big farmhouse on the right
  [1050, 258, 54, 9],
  [1092, 245, 48, 8],
  [1132, 234, 42, 7.5],
  [1170, 226, 36, 6.5],
  [1203, 219, 30, 6],
  [960, 334, 76, 13],
  [990, 326, 66, 11],
  // Far right
  [1446, 222, 40, 7],
  [1500, 226, 46, 8],
].map(([x, y, h, w]) => cypress(x, y, h, w));

/** Olive trees dotted over the left slope. */
const OLIVES = Array.from({ length: 16 }, (_, i) => ({
  x: Math.round(40 + frac(i, 301) * 470),
  y: Math.round(300 + frac(i, 302) * 70),
  r: Math.round(7 + frac(i, 303) * 5),
})).filter((o) => o.y > 296 + (o.x / 600) * 60);

/** Vine rows on the right slope, curving with the hill. */
const VINES = Array.from({ length: 7 }, (_, k) => {
  const y = 300 + k * 15;
  return `M${1600} ${y - 18}C${1440} ${y - 22} ${1300} ${y - 4} ${1080 + k * 18} ${y + 50 - k * 3}`;
});

function Farmhouse({ x, y, s = 1, tower }: { x: number; y: number; s?: number; tower?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} stroke={CA.ink} strokeWidth={1} strokeLinejoin="round" strokeOpacity={0.5}>
      {tower && (
        <>
          <rect x={18} y={-46} width={18} height={26} fill="#F2DDBA" />
          <path d="M15-46H39L34-54H20Z" fill="#C9694A" />
          <rect x={25} y={-40} width={4} height={6} fill="#7A5A44" stroke="none" />
        </>
      )}
      <rect x={-30} y={-24} width={64} height={26} fill="#F2DDBA" />
      <rect x={-30} y={-24} width={14} height={26} fill="#E3C79F" />
      <path d="M-35-24H39L30-33H-26Z" fill="#C9694A" />
      {[-22, -8, 6, 20].map((wx) => (
        <rect key={wx} x={wx} y={-16} width={4} height={6} fill="#7A5A44" stroke="none" />
      ))}
    </g>
  );
}

function Landscape() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 1600 400"
      preserveAspectRatio="xMidYMax slice"
      className="absolute inset-x-0 bottom-0 h-[clamp(230px,38%,420px)] w-full"
    >
      {/* Cloud bank on the horizon */}
      <g fill="#FFF6E8">
        {[
          [60, 182, 52],
          [140, 160, 64],
          [232, 172, 50],
          [304, 184, 40],
          [372, 190, 30],
          [720, 198, 24],
          [800, 192, 30],
          [880, 200, 22],
          [1250, 188, 34],
          [1322, 172, 50],
          [1412, 154, 66],
          [1504, 168, 54],
          [1574, 182, 44],
        ].map(([cx, cy, r], i) => (
          <circle key={i} cx={cx} cy={cy} r={r} />
        ))}
        <rect x={0} y={186} width={1600} height={40} />
      </g>
      <path d="M0 210C200 204 400 206 600 210S1000 212 1600 206V230H0Z" fill="#F4E2CA" />

      {/* Far hills, hazy */}
      <path
        d="M0 400V198C110 172 230 170 350 188 470 206 560 186 680 192 800 198 880 208 980 198 1100 184 1200 168 1320 180 1440 192 1530 178 1600 172V400Z"
        fill="#DCC4AE"
      />
      {/* Sage hills, with farmhouses and cypresses */}
      <path
        d="M0 400V238C130 214 250 216 370 232 490 248 590 240 700 248 800 256 900 252 1000 242 1110 230 1230 206 1360 214 1470 222 1550 218 1600 214V400Z"
        fill="#BCC28E"
      />
      <Farmhouse x={300} y={230} s={0.8} tower />
      <Farmhouse x={1246} y={212} tower />
      <Farmhouse x={1478} y={222} s={0.7} />

      {/* The wheat field in the valley */}
      <path d="M0 400V330C200 312 420 300 620 296 720 294 880 294 980 298 1180 306 1400 318 1600 326V400Z" fill="#F0D697" />
      <path d="M0 360C300 340 600 330 800 330S1300 340 1600 356" fill="none" stroke="#E6C77E" strokeWidth={3} strokeDasharray="1 10" strokeLinecap="round" />

      {/* The road, winding up to the big farmhouse */}
      <path
        d="M690 400C700 360 740 330 800 310 870 288 950 270 1010 252 1080 232 1150 222 1222 213L1228 216C1160 228 1100 242 1030 262 970 280 900 300 860 322 820 344 896 372 910 400Z"
        fill="#F7E9CD"
        stroke="#E3CFA8"
        strokeWidth={2}
      />

      {/* Near slopes: olive groves on the left, vines on the right */}
      <path d="M0 400V282C110 262 220 270 330 298 420 320 500 342 600 358V400Z" fill="#A9B573" />
      {OLIVES.map((o, i) => (
        <g key={i}>
          <path d={`M${o.x} ${o.y + o.r}v6`} stroke="#6E5A3E" strokeWidth={2} />
          <circle cx={o.x} cy={o.y} r={o.r} fill="#8C9C62" />
          <circle cx={o.x - o.r * 0.3} cy={o.y - o.r * 0.3} r={o.r * 0.5} fill="#A2B27A" />
        </g>
      ))}
      <path d="M1600 400V270C1490 254 1380 262 1280 288 1180 314 1100 340 1000 358V400Z" fill="#A3AF6C" />
      <g fill="none" stroke="#7F8F50" strokeWidth={3.4} strokeLinecap="round" strokeDasharray="2 8">
        {VINES.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>

      {CYPRESSES.map((c, i) => (
        <g key={i}>
          <path d={c.body} fill={CA.cypress} />
          <path d={c.lit} fill="#55663A" />
        </g>
      ))}
    </svg>
  );
}

/** A cobbled street along the bottom, the houses standing on it. */
function Street() {
  const id = cleanId(useId());
  return (
    <svg aria-hidden className="absolute inset-x-0 bottom-0 h-[24px] w-full">
      <defs>
        <pattern id={`${id}-sett`} width={28} height={12} patternUnits="userSpaceOnUse" y={4}>
          <rect width={28} height={12} fill="#CDB38E" />
          <rect x={1} y={1} width={12} height={4.6} rx={2} fill="#E6D2B0" />
          <rect x={15} y={1} width={12} height={4.6} rx={2} fill="#E0CAA6" />
          <rect x={-6} y={7} width={12} height={4.6} rx={2} fill="#E0CAA6" />
          <rect x={8} y={7} width={12} height={4.6} rx={2} fill="#E6D2B0" />
          <rect x={22} y={7} width={12} height={4.6} rx={2} fill="#E6D2B0" />
        </pattern>
      </defs>
      <rect y={4} width="100%" height={20} fill={`url(#${id}-sett)`} />
      <rect width="100%" height={4} fill="#EEDFC4" />
      <rect y={4} width="100%" height={1} fill={CA.ink} opacity={0.18} />
    </svg>
  );
}

/* ---------------------------------------------------------------------------------------------
 * The houses
 * ------------------------------------------------------------------------------------------- */

/**
 * A shutter, hung at `hinge`. Open, it lies flat against the wall; shut, it swings over half
 * the window (mirrored about the hinge).
 */
function Shutter({ x, y, w, h, hinge, closed }: { x: number; y: number; w: number; h: number; hinge: number; closed: boolean }) {
  const slats = Math.floor((h - 12) / 7);
  return (
    <g
      style={{
        transformBox: "view-box",
        transformOrigin: `${hinge}px 0px`,
        transform: closed ? "scaleX(-1)" : "scaleX(1)",
        transition: "transform 650ms cubic-bezier(0.3, 0.8, 0.3, 1)",
      }}
    >
      <rect x={x} y={y} width={w} height={h} fill={CA.shutter} stroke={CA.ink} strokeWidth={1.6} />
      <rect x={x + 3.5} y={y + 3.5} width={w - 7} height={h - 7} fill="none" stroke={CA.shutterLight} strokeWidth={1.2} />
      <path
        d={Array.from({ length: slats }, (_, k) => `M${x + 5} ${y + 9 + k * 7}H${x + w - 5}`).join("")}
        stroke="#24493A"
        strokeWidth={1.6}
      />
    </g>
  );
}

/** A window with a cream frame and green shutters either side; `french` runs down to a balcony. */
function Window({ x, y, w, h, closed, children }: { x: number; y: number; w: number; h: number; closed: boolean; children?: ReactNode }) {
  const sw = w / 2;
  return (
    <g>
      <rect x={x - 8} y={y - 10} width={w + 16} height={8} fill="#F4E4C8" stroke={CA.ink} strokeWidth={1.2} strokeOpacity={0.5} />
      <rect x={x} y={y} width={w} height={h} fill={CA.window} stroke="#F4E4C8" strokeWidth={5} />
      <path d={`M${x + 6} ${y + 4}H${x + w * 0.42}C${x + w * 0.3} ${y + h * 0.5} ${x + w * 0.36} ${y + h * 0.8} ${x + w * 0.42} ${y + h - 4}H${x + 6}Z`} fill={CA.windowLight} />
      <path d={`M${x + w / 2} ${y}V${y + h}M${x} ${y + h * 0.45}H${x + w}`} stroke="#F4E4C8" strokeWidth={2.4} />
      {children}
      <Shutter x={x - sw} y={y} w={sw} h={h} hinge={x} closed={closed} />
      <Shutter x={x + w} y={y} w={sw} h={h} hinge={x + w} closed={closed} />
    </g>
  );
}

function Sill({ x, w, y }: { x: number; w: number; y: number }) {
  return <rect x={x - 8} y={y} width={w + 16} height={8} fill="#F4E4C8" stroke={CA.ink} strokeWidth={1.2} strokeOpacity={0.5} />;
}

/** A box of red geraniums. */
function Geraniums({ x, y, w }: { x: number; y: number; w: number }) {
  const n = Math.round(w / 12);
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const cx = x + 6 + i * ((w - 12) / Math.max(1, n - 1));
        const cy = y - 10 - (i % 2) * 5;
        return (
          <g key={i}>
            <ellipse cx={cx - 4} cy={y - 4} rx={5} ry={3} fill={CA.leaf} />
            <ellipse cx={cx + 4} cy={y - 5} rx={5} ry={3} fill={CA.leafDark} />
            <circle cx={cx} cy={cy} r={4.6} fill={i % 3 === 1 ? CA.pink : CA.geranium} stroke={CA.ink} strokeWidth={0.8} />
            <circle cx={cx - 1.4} cy={cy - 1.4} r={1.4} fill="#FFFFFF" opacity={0.45} />
          </g>
        );
      })}
      <rect x={x} y={y} width={w} height={12} rx={1.5} fill={CA.terracotta} stroke={CA.ink} strokeWidth={1.2} />
    </g>
  );
}

/** Terracotta eaves: a row of tile ends, rafters under them. */
function Eaves({ x1, x2, y }: { x1: number; x2: number; y: number }) {
  const n = Math.ceil((x2 - x1) / 12);
  const scallops = Array.from({ length: n }, () => "a6 6 0 0 1-12 0").join("");
  return (
    <g>
      <rect x={x1} y={y + 18} width={x2 - x1} height={14} fill="#000000" opacity={0.12} />
      {Array.from({ length: Math.ceil((x2 - x1) / 20) }, (_, i) => (
        <rect key={i} x={x1 + 6 + i * 20} y={y + 18} width={6} height={8} fill={CA.roofDark} />
      ))}
      <path d={`M${x1} ${y}H${x1 + n * 12}V${y + 16}${scallops}Z`} fill={CA.roof} stroke={CA.ink} strokeWidth={1.4} strokeLinejoin="round" />
      <path d={`M${x1} ${y + 6}H${x1 + n * 12}`} stroke={CA.roofDark} strokeWidth={1.4} />
    </g>
  );
}

type SignFace = "cup" | "riposo" | "perfetto";

/** The café's hanging sign: a steaming cup, flipped to RIPOSO for a snooze or PERFETTO on the dot. */
function HangingSign({ face, lively, loss }: { face: SignFace; lively: number; loss: boolean }) {
  return (
    <g>
      {/* Iron bracket */}
      <path d="M208 756H272M210 790C232 788 250 774 254 758" fill="none" stroke={CA.bakelite} strokeWidth={3} strokeLinecap="round" />
      <circle cx={272} cy={756} r={2.6} fill={CA.bakelite} />
      <g
        style={{
          transformBox: "view-box",
          transformOrigin: "244px 756px",
          animation: loss ? "lc-cafe-swing 0.7s ease-in-out infinite" : `lc-sway ${(3.6 - lively * 2).toFixed(2)}s ease-in-out infinite`,
        }}
      >
        <path d="M222 756V772M266 756V772" stroke={CA.bakelite} strokeWidth={1.6} />
        <AnimatePresence mode="wait" initial={false}>
          <motion.g
            key={face}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            exit={{ scaleX: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            style={{ originX: 0.5, originY: 0.5 }}
          >
            <rect x={214} y={770} width={60} height={52} rx={10} fill={CA.cream} stroke={CA.ink} strokeWidth={1.8} />
            <rect x={219} y={775} width={50} height={42} rx={7} fill="none" stroke={CA.shutter} strokeWidth={1.6} />
            {face === "cup" && (
              <g stroke={CA.shutter} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <path d="M234 791H254V797A10 8 0 0 1 234 797Z" fill={CA.shutter} />
                <path d="M254 793.4A4 4 0 1 1 254 801" fill="none" />
                <path d="M229 810H259" fill="none" />
                <path d="M240 787c-2-2 2-3.4 0-5.6M248 787c-2-2 2-3.4 0-5.6" fill="none" strokeWidth={1.4} />
              </g>
            )}
            {face !== "cup" && (
              <>
                {face === "riposo" ? (
                  <path d="M248 780a6 6 0 1 0 5 8 5 5 0 1 1-5-8Z" fill={CA.ochre} stroke={CA.ink} strokeWidth={0.9} />
                ) : (
                  <path d={HEART} transform="translate(244 786) scale(0.6)" fill={CA.terracotta} stroke={CA.ink} strokeWidth={1.4} />
                )}
                <text
                  x={244}
                  y={808}
                  fontSize={face === "riposo" ? 11 : 9.4}
                  fontWeight={700}
                  textAnchor="middle"
                  letterSpacing="0.06em"
                  fill={CA.shutter}
                  style={{ fontFamily: "var(--font-geist-serif), serif" }}
                >
                  {face === "riposo" ? "RIPOSO" : "PERFETTO"}
                </text>
              </>
            )}
          </motion.g>
        </AnimatePresence>
      </g>
    </g>
  );
}

/** Striped awning stripes (green and cream), 16 wide each, across x1 → x2. */
function Stripes({ x1, x2, y, h }: { x1: number; x2: number; y: number; h: number }) {
  return (
    <>
      {Array.from({ length: Math.ceil((x2 - x1) / 16) }, (_, i) => (
        <rect key={i} x={x1 + i * 16} y={y} width={16} height={h} fill={i % 2 ? CA.cream : CA.shutter} />
      ))}
    </>
  );
}

/** The café: four storeys of ochre, green shutters, geraniums, a striped awning and the sign. */
function CafeFront({ closed, sign, lively, loss }: { closed: boolean; sign: SignFace; lively: number; loss: boolean }) {
  const id = cleanId(useId());
  const valance = `M14 932H206V940${Array.from({ length: 12 }, () => "a8 8 0 0 1-16 0").join("")}Z`;
  return (
    <svg aria-hidden viewBox="0 0 280 1300" className="block h-auto w-full" style={{ overflow: "visible" }}>
      <defs>
        <clipPath id={`${id}-valance`}>
          <path d={valance} />
        </clipPath>
        <linearGradient id={`${id}-slope`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#000000" stopOpacity={0.28} />
          <stop offset="1" stopColor="#000000" stopOpacity={0} />
        </linearGradient>
        <linearGradient id={`${id}-glass`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7A4A2C" />
          <stop offset="1" stopColor="#3E2418" />
        </linearGradient>
      </defs>

      {/* Wall, with its shaded edge and a drainpipe */}
      <rect x={-20} y={44} width={230} height={1256} fill={CA.wall} />
      <rect x={196} y={44} width={14} height={1256} fill={CA.wallShade} />
      <rect x={210} y={44} width={1.6} height={1256} fill={CA.ink} opacity={0.35} />
      <path d="M186 60V1262" stroke="#B9773F" strokeWidth={6} />
      {[200, 520, 840, 1140].map((y) => (
        <rect key={y} x={181} y={y} width={10} height={4} fill="#8F5A2E" />
      ))}
      <Eaves x1={-20} x2={232} y={28} />

      {/* Upper floors */}
      <Window x={76} y={110} w={58} h={120} closed={closed} />
      <Sill x={76} w={58} y={230} />
      <Window x={76} y={330} w={58} h={140} closed={closed} />
      <Sill x={76} w={58} y={470} />
      <Geraniums x={72} y={458} w={66} />
      <Window x={76} y={570} w={58} h={160} closed={closed} />
      {/* Balcony: slab, geraniums peeking over a wrought-iron railing */}
      <Geraniums x={44} y={676} w={40} />
      <Geraniums x={128} y={676} w={40} />
      <g stroke={CA.bakelite} strokeWidth={2}>
        <path d="M36 680H204M36 730H204" strokeWidth={3} />
        <path d={Array.from({ length: 17 }, (_, i) => `M${40 + i * 10} 680V730`).join("")} />
        <path d="M100 705c0-8 10-8 10 0s10 8 10 0" fill="none" />
      </g>
      <rect x={28} y={730} width={184} height={12} fill="#F4E4C8" stroke={CA.ink} strokeWidth={1.2} strokeOpacity={0.5} />

      {/* The café's signboard */}
      <rect x={18} y={800} width={180} height={56} rx={3} fill={CA.shutter} stroke={CA.ink} strokeWidth={1.6} />
      <rect x={23} y={805} width={170} height={46} rx={2} fill="none" stroke={CA.gold} strokeWidth={1.2} opacity={0.7} />
      <text
        x={108}
        y={840}
        fontSize={30}
        fontWeight={700}
        textAnchor="middle"
        letterSpacing="0.1em"
        fill={CA.gold}
        style={{ fontFamily: "var(--font-geist-serif), serif" }}
      >
        CAFFÈ
      </text>
      {[34, 182].map((x) => (
        <path key={x} d={`M${x} 822l1.6 3.4 3.6.4-2.7 2.5.8 3.6-3.3-1.9-3.3 1.9.8-3.6-2.7-2.5 3.6-.4Z`} fill={CA.gold} />
      ))}

      {/* Striped awning, its scalloped valance, and the shade it throws */}
      <rect x={10} y={862} width={200} height={5} rx={2} fill={CA.bakelite} />
      <Stripes x1={14} x2={206} y={867} h={65} />
      <rect x={14} y={867} width={192} height={65} fill={`url(#${id}-slope)`} />
      <g clipPath={`url(#${id}-valance)`}>
        <Stripes x1={14} x2={206} y={932} h={20} />
      </g>
      <path d={`M14 867H206V932H14Z${valance}`} fill="none" stroke={CA.ink} strokeWidth={1.4} strokeLinejoin="round" />
      <path d="M14 958H206V978H14Z" fill="#000000" opacity={0.12} />

      {/* Shop window: a warm bar inside, a lamp, an espresso machine on the counter */}
      <rect x={22} y={968} width={94} height={250} fill={CA.shutter} stroke={CA.ink} strokeWidth={1.6} />
      <rect x={30} y={976} width={78} height={234} fill={`url(#${id}-glass)`} />
      <circle cx={69} cy={1012} r={18} fill="#FFD27A" opacity={0.28} />
      <path d="M69 976V1004" stroke={CA.gold} strokeWidth={1} />
      <path d="M62 1004H76L72 1012H66Z" fill={CA.gold} />
      <rect x={30} y={1150} width={78} height={8} fill="#2E1D15" />
      <g stroke={CA.ink} strokeWidth={0.8}>
        <rect x={46} y={1118} width={32} height={32} rx={3} fill="#C9CED2" />
        <path d="M46 1118Q62 1100 78 1118Z" fill="#C9CED2" />
        <circle cx={62} cy={1104} r={2.6} fill={CA.gold} />
        <rect x={52} y={1134} width={20} height={4} fill="#2E1D15" />
      </g>
      <text x={69} y={1192} fontSize={11.5} textAnchor="middle" letterSpacing="0.16em" fill={CA.gold} style={{ fontFamily: "var(--font-geist-serif), serif" }}>
        ESPRESSO
      </text>

      {/* Door, arched, with its fanlight */}
      <path d="M126 1262V1010A35 35 0 0 1 196 1010V1262Z" fill={CA.shutter} stroke={CA.ink} strokeWidth={1.6} />
      <path d="M134 1132V1012A27 27 0 0 1 188 1012V1132Z" fill={`url(#${id}-glass)`} />
      <path d="M161 985V1132M134 1050H188" stroke={CA.shutter} strokeWidth={2.4} />
      <rect x={136} y={1146} width={50} height={100} rx={2} fill="none" stroke="#24493A" strokeWidth={2} />
      <circle cx={182} cy={1192} r={3.4} fill={CA.gold} stroke={CA.ink} strokeWidth={0.8} />

      {/* Stone plinth */}
      <rect x={-20} y={1254} width={230} height={46} fill={CA.stone} stroke={CA.ink} strokeWidth={1.2} strokeOpacity={0.4} />

      <HangingSign face={sign} lively={lively} loss={loss} />
    </svg>
  );
}

/** Laundry on the balcony line: a shirt, a towel, socks and a sundress. */
function Laundry({ lively, loss }: { lively: number; loss: boolean }) {
  const items: { x: number; y: number; node: ReactNode }[] = [
    {
      x: 138,
      y: 410,
      node: <path d="M-13 0H13L18 9 12 12V44H-12V12L-18 9Z" fill="#6F9CC9" stroke={CA.ink} strokeWidth={1.2} strokeLinejoin="round" />,
    },
    {
      x: 173,
      y: 414,
      node: (
        <>
          <rect x={-12} y={0} width={24} height={38} fill="#FFFCF6" stroke={CA.ink} strokeWidth={1.2} />
          <path d="M-12 30H12M-12 33H12" stroke={CA.terracotta} strokeWidth={1.4} />
        </>
      ),
    },
    {
      x: 203,
      y: 414,
      node: (
        <path d="M-6 0H0V14L4 18Q6 22 2 22H-6ZM4 0H10V14L14 18Q16 22 12 22H4Z" fill={CA.ochre} stroke={CA.ink} strokeWidth={1} strokeLinejoin="round" />
      ),
    },
    {
      x: 240,
      y: 410,
      node: <path d="M-8 0H8L10 12 18 42H-18L-10 12Z" fill="#F3D45E" stroke={CA.ink} strokeWidth={1.2} strokeLinejoin="round" />,
    },
  ];
  const sway = loss ? "lc-flutter 0.5s ease-in-out" : `lc-sway ${(3.4 - lively * 2.2).toFixed(2)}s ease-in-out`;
  return (
    <g>
      <path d="M110 402V540M266 402V540" stroke={CA.bakelite} strokeWidth={2.4} />
      <path d="M110 404Q188 424 266 404" fill="none" stroke={CA.bakelite} strokeWidth={1.2} />
      {items.map((it, i) => (
        <g key={i} transform={`translate(${it.x} ${it.y})`}>
          <g style={{ transformBox: "view-box", transformOrigin: "0px 0px", animation: `${sway} ${(-i * 0.6).toFixed(1)}s infinite` }}>
            {it.node}
            <path d="M-4-2V3M4-2V3" stroke={CA.espresso} strokeWidth={2} />
          </g>
        </g>
      ))}
    </g>
  );
}

/** A pink house: a cat on the top sill, laundry on the balcony, a lemon tree by the door. */
function CasaRosa({ closed, cat, lively, loss }: { closed: boolean; cat: CatMood; lively: number; loss: boolean }) {
  return (
    <svg aria-hidden viewBox="0 0 280 1150" className="block h-auto w-full" style={{ overflow: "visible" }}>
      <rect x={70} y={44} width={230} height={1106} fill={CA.rose} />
      <rect x={70} y={44} width={12} height={1106} fill={CA.roseShade} />
      <rect x={68.4} y={44} width={1.6} height={1106} fill={CA.ink} opacity={0.35} />
      <path d="M92 60V1110" stroke="#C98872" strokeWidth={6} />
      <Eaves x1={52} x2={300} y={28} />

      {/* Top floor: the cat's window */}
      <Window x={146} y={120} w={58} h={130} closed={closed} />
      <Sill x={146} w={58} y={250} />
      <g transform="translate(175 250) scale(1.4)">
        <Cat mood={cat} swish={2.6 - lively * 1.8} />
      </g>

      {/* Balcony with the washing out */}
      <Window x={146} y={360} w={58} h={180} closed={closed} />
      <Laundry lively={lively} loss={loss} />
      <g stroke={CA.bakelite} strokeWidth={2}>
        <path d="M104 490H272M104 540H272" strokeWidth={3} />
        <path d={Array.from({ length: 17 }, (_, i) => `M${108 + i * 10} 490V540`).join("")} />
      </g>
      <rect x={96} y={540} width={184} height={12} fill="#F4E4C8" stroke={CA.ink} strokeWidth={1.2} strokeOpacity={0.5} />

      {/* Wall lantern and a majolica house number */}
      <path d="M118 712H132V722" fill="none" stroke={CA.bakelite} strokeWidth={2.4} />
      <path d="M124 722H140L138 746H126Z" fill="#FFE29A" stroke={CA.bakelite} strokeWidth={2} />
      <path d="M122 722H142L132 714Z" fill={CA.bakelite} />
      <rect x={250} y={770} width={20} height={20} fill="#FFFCF6" stroke="#2E5E9E" strokeWidth={2} />
      <text x={260} y={785} fontSize={13} fontWeight={700} textAnchor="middle" fill="#2E5E9E" style={{ fontFamily: "var(--font-geist-serif), serif" }}>
        7
      </text>

      {/* Arched door in a stone surround, a step up to it */}
      <path d="M160 1110V846A40 40 0 0 1 240 846V1110Z" fill="#F4E4C8" stroke={CA.ink} strokeWidth={1.2} strokeOpacity={0.5} />
      <path d="M168 1110V848A32 32 0 0 1 232 848V1110Z" fill="#7A4A2E" stroke={CA.ink} strokeWidth={1.6} />
      <path d="M200 816V1110" stroke="#5E3822" strokeWidth={2} />
      <rect x={176} y={900} width={18} height={70} rx={2} fill="none" stroke="#5E3822" strokeWidth={2} />
      <rect x={206} y={900} width={18} height={70} rx={2} fill="none" stroke="#5E3822" strokeWidth={2} />
      <rect x={176} y={1000} width={18} height={90} rx={2} fill="none" stroke="#5E3822" strokeWidth={2} />
      <rect x={206} y={1000} width={18} height={90} rx={2} fill="none" stroke="#5E3822" strokeWidth={2} />
      <circle cx={210} cy={990} r={3} fill={CA.gold} stroke={CA.ink} strokeWidth={0.8} />
      <rect x={150} y={1110} width={100} height={40} fill={CA.stone} stroke={CA.ink} strokeWidth={1.2} strokeOpacity={0.4} />

      {/* Lemon tree in a terracotta pot */}
      <path d="M116 1056V962" stroke="#6E5A3E" strokeWidth={5} />
      <g stroke={CA.ink} strokeWidth={1.2}>
        <circle cx={116} cy={930} r={36} fill={CA.leaf} />
        <circle cx={92} cy={950} r={22} fill={CA.leaf} />
        <circle cx={140} cy={948} r={22} fill={CA.leafDark} />
        <circle cx={114} cy={904} r={22} fill={CA.leaf} />
      </g>
      <circle cx={104} cy={916} r={12} fill="#7A9A4C" />
      {[
        [100, 938],
        [128, 920],
        [136, 952],
        [110, 958],
        [120, 900],
        [88, 952],
      ].map(([x, y]) => (
        <ellipse key={`${x}-${y}`} cx={x} cy={y} rx={5} ry={3.8} fill={CA.lemon} stroke={CA.ink} strokeWidth={0.9} />
      ))}
      <path d="M88 1060H144L138 1140H94Z" fill={CA.terracotta} stroke={CA.ink} strokeWidth={1.4} strokeLinejoin="round" />
      <rect x={84} y={1052} width={64} height={12} rx={2} fill="#D2683F" stroke={CA.ink} strokeWidth={1.4} />
    </svg>
  );
}

/** A plain moka pot (no face) on the grid MokaPot uses, steaming in puffs when `puffing`. */
function CafeTable({ puffing }: { puffing: boolean }) {
  const chair = (flip: boolean) => (
    <g transform={flip ? "translate(130 0) scale(-1 1)" : undefined} stroke="#2B2420" strokeWidth={2.4} strokeLinecap="round" fill="none">
      <path d="M12 62C8 48 8 36 13 31 17 27 22 30 21.6 36L21 62" />
      <path d="M13.6 42H20.6M14 50H21" strokeWidth={1.6} />
      <ellipse cx={25} cy={62} rx={13} ry={3} fill="#3A2E28" />
      <path d="M14 64 11 92M36 64 38 92M21 65 20 90M29 65 31 90" />
    </g>
  );
  return (
    <svg aria-hidden viewBox="0 0 130 96" className="block h-auto w-full" style={{ overflow: "visible" }}>
      {chair(false)}
      {chair(true)}
      <path d="M65 56V86M52 93Q65 84 78 93" stroke="#2B2420" strokeWidth={3} fill="none" strokeLinecap="round" />
      <rect x={38} y={52} width={54} height={5} rx={2.5} fill="#F2EEE6" stroke={CA.ink} strokeWidth={1.2} />
      <svg x={40} y={28} width={26} height={26} viewBox="0 0 48 48" overflow="visible">
        <MokaPot mood="calm" puffing={puffing} faceless />
      </svg>
      {[70, 81].map((x) => (
        <g key={x} stroke={CA.ink} strokeWidth={1}>
          <ellipse cx={x + 4} cy={51.6} rx={6} ry={1.4} fill={CA.porcelain} />
          <path d={`M${x} 45H${x + 8}V48A4 3 0 0 1 ${x} 48Z`} fill={CA.porcelain} />
          <path d={`M${x + 8} 46A1.8 1.8 0 1 1 ${x + 8} 49`} fill="none" />
        </g>
      ))}
    </svg>
  );
}

/* ---------------------------------------------------------------------------------------------
 * Behind the dial: the saucer, steam and hearts
 * ------------------------------------------------------------------------------------------- */

/** Saucer units per dial width: the saucer's radius (200) is 0.62 of a dial. */
const UNIT = 200 / 0.62;

/** Steam wisps rising off the cup, in an engraved ink line over a soft white glow. */
const WISPS = [
  { x: 0, s: 1, d: 0 },
  { x: -0.13, s: 0.8, d: 0.9 },
  { x: 0.13, s: 0.85, d: 1.7 },
  { x: -0.25, s: 0.65, d: 0.4 },
  { x: 0.25, s: 0.7, d: 1.3 },
];
const WISP = "M0 0C-9-12 9-22 0-36S-9-58 0-72";

/** Hearts floating up round the clock on a jackpot. */
const HEARTS = Array.from({ length: 10 }, (_, i) => ({
  x: (i % 2 ? 1 : -1) * (0.3 + frac(i, 501) * 0.32),
  y: 0.05 + frac(i, 502) * 0.25,
  s: 0.9 + frac(i, 503) * 0.9,
  d: (i * 0.32).toFixed(2),
  dx: Math.round((frac(i, 504) - 0.5) * 50),
  fill: [CA.terracotta, CA.pink, CA.ochre][i % 3],
}));

/**
 * Caffè's counterpart to Classic's sun rays: the dial's cup sits on a saucer (with its handle,
 * a spoon and a biscotto), steaming harder the bigger the bet. Fades out while the alarm is
 * set. On a jackpot, hearts float up round the clock.
 */
export function CafeSaucer({
  p,
  visible,
  size,
  mood,
}: {
  p: number;
  range?: number;
  visible: boolean;
  /** Diameter of the dial it sits behind, in px. */
  size: number;
  mood?: SceneMood;
}) {
  const id = cleanId(useId());
  const wisps = 2 + Math.round(p * 3);
  const rise = (3.6 - p * 1.7).toFixed(2);
  const box = size * 1.6;
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none absolute"
        style={{
          width: box,
          height: box,
          marginLeft: -box / 2,
          marginTop: -box / 2,
          opacity: visible ? 1 : 0,
          transition: "opacity 400ms ease-out",
        }}
      >
        <svg viewBox={`${-UNIT * 0.8} ${-UNIT * 0.8} ${UNIT * 1.6} ${UNIT * 1.6}`} className="absolute inset-0 h-full w-full" style={{ overflow: "visible" }}>
          <defs>
            <filter id={`${id}-soft`} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation={7} />
            </filter>
            <linearGradient id={`${id}-steel`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={CA.steelLight} />
              <stop offset="1" stopColor={CA.steelMid} />
            </linearGradient>
          </defs>
          {/* Saucer, its shadow, rim and green band */}
          <circle cx={7} cy={14} r={200} fill={CA.ink} opacity={0.16} filter={`url(#${id}-soft)`} />
          <circle r={200} fill={CA.porcelain} stroke={CA.ink} strokeOpacity={0.3} strokeWidth={1.6} />
          <circle r={195} fill="none" stroke="#EFE5D6" strokeWidth={6} />
          <circle r={186} fill="none" stroke={CA.shutter} strokeWidth={4.5} />
          <circle r={179} fill="none" stroke={CA.shutter} strokeWidth={1.2} />
          <circle r={168} fill="#F5ECDE" stroke={CA.ink} strokeOpacity={0.12} strokeWidth={1.2} />

          {/* The cup's handle, out at three o'clock */}
          <g stroke={CA.ink} strokeWidth={1.6} strokeOpacity={0.4}>
            <path d="M150-18C182-24 210-14 210 0S182 24 150 18Z" fill={CA.porcelain} />
            <path d="M162-7.4C180-9.6 194-5.6 194 0S180 9.6 162 7.4Z" fill="#EDE2D0" />
            <path d="M160-13.6C184-17 203-10 203 0S184 17 160 13.6" fill="none" stroke={CA.shutter} strokeOpacity={0.85} strokeWidth={1.8} />
          </g>

          {/* A teaspoon, lower left */}
          <g transform="rotate(135)">
            <path d="M193-2.2C205-2.6 220-3.4 262-4.6 266-4.6 268-2.6 268 0S266 4.6 262 4.6C220 3.4 205 2.6 193 2.2Z" transform="translate(3 -4)" fill={CA.ink} opacity={0.14} />
            <ellipse cx={183} cy={-4} rx={16} ry={11} fill={CA.ink} opacity={0.14} />
            <ellipse cx={180} cy={0} rx={16} ry={11} fill={`url(#${id}-steel)`} stroke={CA.ink} strokeOpacity={0.5} strokeWidth={1.2} />
            <ellipse cx={178} cy={-2} rx={9} ry={5} fill={CA.steelLight} />
            <path d="M193-2.2C205-2.6 220-3.4 262-4.6 266-4.6 268-2.6 268 0S266 4.6 262 4.6C220 3.4 205 2.6 193 2.2Z" fill={`url(#${id}-steel)`} stroke={CA.ink} strokeOpacity={0.5} strokeWidth={1.2} />
            <path d="M206-1 258-2.2" stroke="#FFFFFF" strokeWidth={1.4} strokeLinecap="round" opacity={0.8} />
          </g>

          {/* A cantuccino, upper right */}
          <g transform="translate(118 -140) rotate(40)" stroke={CA.ink} strokeWidth={1.2} strokeOpacity={0.55}>
            <path d="M-21 7C-21-4-12-9.6 0-9.6S21-4 21 7Z" fill="#E7B46A" />
            <path d="M-19-1C-14-7-7-9 0-9S14-7 19-1" fill="none" stroke="#B9773F" strokeOpacity={1} strokeWidth={2.4} />
            {[
              [-10, 1, 4, 2.6, -20],
              [3, -2, 3.4, 2.2, 15],
              [11, 3, 3, 2, -5],
              [-2, 4, 2.4, 1.6, 30],
            ].map(([x, y, rx, ry, a], i) => (
              <ellipse key={i} cx={x} cy={y} rx={rx} ry={ry} transform={`rotate(${a} ${x} ${y})`} fill={i % 2 ? "#F6DFB2" : "#C98A52"} strokeWidth={0.6} />
            ))}
          </g>
        </svg>

        {/* Steam, rising off the top of the cup */}
        <svg
          viewBox="-120 -110 240 110"
          className="absolute left-1/2 -translate-x-1/2"
          style={{ width: size * 0.62, top: box / 2 - size * 0.49 - size * 0.27, height: size * 0.28, overflow: "visible" }}
        >
          {WISPS.slice(0, wisps).map((w, i) => (
            <g key={i} transform={`translate(${w.x * 240} 0) scale(${w.s})`}>
              <g
                style={{
                  opacity: 0,
                  animation: `lc-cafe-steam ${rise}s ease-in-out ${(-w.d * Number(rise) * 0.45).toFixed(2)}s infinite`,
                }}
              >
                <path d={WISP} fill="none" stroke="#FFFFFF" strokeWidth={9} strokeLinecap="round" opacity={0.55} />
                <path d={WISP} fill="none" stroke={CA.ink} strokeWidth={2.2} strokeLinecap="round" opacity={0.3 + p * 0.25} />
              </g>
            </g>
          ))}
        </svg>
      </div>

      {/* On the dot: hearts float up round the clock */}
      {mood === "jackpot" &&
        HEARTS.map((h, i) => (
          <svg
            key={i}
            aria-hidden
            viewBox="-9 -7 18 14"
            className="pointer-events-none absolute"
            style={{
              width: 18 * h.s,
              left: h.x * size - 9 * h.s,
              top: -size * 0.15 + h.y * size,
              opacity: 0,
              ["--dx" as string]: `${h.dx}px`,
              animation: `lc-cafe-heart 2.6s ease-out ${h.d}s infinite`,
            } as CSSProperties}
          >
            <path d={HEART} fill={h.fill} stroke={CA.ink} strokeWidth={1.1} />
          </svg>
        ))}
    </>
  );
}
