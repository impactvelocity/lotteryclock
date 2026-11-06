"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useId, useState, type CSSProperties } from "react";
import { CardBackArt } from "@/components/scenes/poker-art";
import type { SceneMood } from "@/components/scenes/types";
import { frac } from "@/lib/rand";
import { css, cssA, MAX_RANGE, mixHex, rampN } from "@/lib/themes";

/**
 * Poker's background: a card table under a lamp that gets hotter as the bet grows.
 *
 *   0 min     check: a quiet table, a couple of short stacks, cards face down
 *   1–11      small blind: the first chips go in
 *   12–23     call: more stacks, chips scattered across the felt
 *   24–35     raise: the stacks grow tall, the lamp warms
 *   36–44     re-raise: chips start flipping, the edges of the room go dark
 *   45        all in: every stack at full height, chips in the air
 *
 * Setting the alarm pushes the bets on the felt into the pot while you peek at your cards; the
 * draw deals the board (PokerRoll). A snooze bursts the pot back out at you (a fountain of chips
 * from behind the dial, gold stacks, pocket aces); a late result busts you (the lamp dims a
 * touch, your stacks topple, 7-2 offsuit); right on time splits the pot (the burst flies both ways
 * evenly, pocket kings). Purely decorative and pointer-transparent.
 */

type Props = {
  /** Bet as a fraction of the maximum, 0..1. */
  p: number;
  /** Bet tier, 0 (no gamble) to 5 (the full 45). */
  tier: number;
  mood: SceneMood;
};

const clamp = (n: number) => Math.max(0, Math.min(1, n));

/* ---------------- The table: felt, betting line, padded rail ---------------- */

/**
 * Felt fibres: fine noise turned into dark and light specks (plain alpha, no blend modes,
 * so it reads the same over any shade of green). Tiles seamlessly.
 */
const noise = (
  size: number,
  freq: string,
  octaves: number,
  k: number,
  seed: number,
  light = true,
) =>
  `url("data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}'>` +
      // The filter region must be exactly the tile, or stitchTiles seams at the wrong size
      `<filter id='f' x='0' y='0' width='100%' height='100%'><feTurbulence type='fractalNoise' baseFrequency='${freq}' numOctaves='${octaves}' seed='${seed}' stitchTiles='stitch' result='n'/>` +
      `<feColorMatrix in='n' result='d' values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  ${k} 0 0 0 ${(-0.56 * k).toFixed(2)}'/>` +
      (light
        ? `<feColorMatrix in='n' result='l' values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  ${-k} 0 0 0 ${(0.44 * k).toFixed(2)}'/>` +
          `<feMerge><feMergeNode in='d'/><feMergeNode in='l'/></feMerge>`
        : "") +
      `</filter><rect width='100%' height='100%' filter='url(#f)'/></svg>`,
  )}")`;

/** Fine nap of the cloth, slightly stretched sideways like brushed felt. */
const FELT_FIBRES = noise(180, "0.75 0.95", 2, 2.6, 7);
/** Broad, soft mottling: the felt is never one perfectly even colour. */
const FELT_MOTTLE = noise(520, "0.008", 2, 1.1, 3);
/** The wood's open pores: fine dark flecks only (light ones read as dust on a dark finish). */
const WOOD_PORES = noise(150, "0.85 0.55", 2, 2.4, 11, false);

/**
 * The table's edge, as an ellipse in hero percentages. The wooden rail shows in the bottom
 * corners; the printed betting line runs parallel inside it.
 */
const TABLE = { cx: 50, cy: 36, rx: 57, ry: 82 };
const LINE = { rx: 46, ry: 66 };
/** How far out the rail's shading runs, as a multiple of the felt ellipse (the hero's far corners sit at about 1.17). */
const RAIL_OUT = 1.2;

/** The rail's region alone, for masking HTML layers onto it. */
const RAIL_MASK = `radial-gradient(${TABLE.rx}% ${TABLE.ry}% at ${TABLE.cx}% ${TABLE.cy}%, transparent 99.6%, #000 100%)`;

/**
 * Grain running round the rail: near-concentric rings, each a little off-centre and squashed so
 * neighbouring lines drift together and apart, broken into long streaks. A few are pale figure.
 */
const GRAIN = Array.from({ length: 50 }, (_, i) => {
  const f = (s: number) => frac(i, s);
  const roll = f(23);
  // Mostly fine dark lines; some pale figure; a few broad, faint growth bands
  const kind = roll < 0.18 ? "light" : roll > 0.86 ? "band" : "line";
  const squash = 0.01 * Math.sin(i * 0.41 + 0.8);
  return {
    k: 1.006 + (i / 49) * 0.19 + (f(21) - 0.5) * 0.003,
    dx: 0.4 * Math.sin(i * 0.29),
    dy: 0.5 * Math.sin(i * 0.21 + 1.7),
    sx: 1 + squash,
    sy: 1 - squash,
    light: kind === "light",
    width:
      kind === "band"
        ? 5 + f(24) * 6
        : kind === "light"
          ? 1.2 + f(24) * 1.6
          : 0.5 + f(24) * 1.1,
    opacity:
      kind === "band"
        ? 0.06 + f(25) * 0.06
        : kind === "light"
          ? 0.05 + f(25) * 0.07
          : 0.14 + f(25) * 0.26,
    // Long streaks with the odd break, in hundredths of the ring (pathLength 100): a corner
    // shows roughly 10 of them
    dash:
      kind === "band"
        ? undefined
        : `${(9 + f(26) * 26).toFixed(2)} ${(0.2 + f(27) * 0.7).toFixed(2)} ${(4 + f(28) * 14).toFixed(2)} ${(0.15 + f(29) * 0.5).toFixed(2)}`,
    offset: f(30) * 100,
  };
});

function TableEdge({
  heat,
  lamp,
}: {
  heat: number;
  lamp: ReturnType<typeof rampN>;
}) {
  const id = useId().replace(/:/g, "");
  const { cx, cy, rx, ry } = TABLE;
  const R = rx * RAIL_OUT;
  const at = (k: number) => k / RAIL_OUT;
  const ring = (k: number) => ({ cx, cy, rx: rx * k, ry: ry * k });
  const railPath = `M-10 -10H110V110H-10Z M${cx - rx} ${cy}a${rx} ${ry} 0 1 0 ${rx * 2} 0a${rx} ${ry} 0 1 0 ${-rx * 2} 0Z`;
  return (
    <>
      <svg
        aria-hidden
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
      >
        <defs>
          {/* The rail's rounded profile: a dark groove, the lip catching the lamp, the crown, then
            falling away into shadow toward the room */}
          <radialGradient
            id={`${id}-rail`}
            gradientUnits="userSpaceOnUse"
            cx={cx}
            cy={cy}
            r={R}
            gradientTransform={`translate(${cx} ${cy}) scale(1 ${ry / rx}) translate(${-cx} ${-cy})`}
          >
            <stop offset={at(1)} stopColor="#120703" />
            <stop offset={at(1.005)} stopColor="#9A5129" />
            <stop offset={at(1.014)} stopColor="#6A2F14" />
            <stop offset={at(1.036)} stopColor="#8E4721" />
            <stop offset={at(1.062)} stopColor="#62290F" />
            <stop offset={at(1.1)} stopColor="#4A1E0B" />
            <stop offset={at(1.15)} stopColor="#321307" />
            <stop offset={1} stopColor="#1F0B04" />
          </radialGradient>
          <clipPath id={`${id}-railclip`}>
            <path clipRule="evenodd" d={railPath} />
          </clipPath>
        </defs>

        {/* The printed betting line, glowing a little brighter under a hot lamp */}
        <ellipse
          cx={cx}
          cy={cy}
          rx={LINE.rx}
          ry={LINE.ry}
          fill="none"
          stroke="#E8C872"
          strokeOpacity={0.22 + heat * 0.12}
          strokeWidth={2}
          vectorEffect="non-scaling-stroke"
        />
        <ellipse
          cx={cx}
          cy={cy}
          rx={LINE.rx - 0.9}
          ry={LINE.ry - 1.2}
          fill="none"
          stroke="#E8C872"
          strokeOpacity={0.1 + heat * 0.06}
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
        />

        {/* The rail's shadow falling across the felt, soft at its far edge */}
        <ellipse
          {...ring(1)}
          fill="none"
          stroke="#000"
          strokeOpacity={0.14}
          strokeWidth={30}
          vectorEffect="non-scaling-stroke"
        />
        <ellipse
          {...ring(1)}
          fill="none"
          stroke="#000"
          strokeOpacity={0.2}
          strokeWidth={12}
          vectorEffect="non-scaling-stroke"
        />

        {/* The wooden rail */}
        <path fillRule="evenodd" fill={`url(#${id}-rail)`} d={railPath} />
        <g clipPath={`url(#${id}-railclip)`} fill="none">
          {GRAIN.map((g, i) => (
            <ellipse
              key={i}
              cx={cx + g.dx}
              cy={cy + g.dy}
              rx={rx * g.k * g.sx}
              ry={ry * g.k * g.sy}
              stroke={g.light ? "#F0B47A" : "#1A0803"}
              strokeOpacity={g.opacity}
              strokeWidth={g.width}
              pathLength={100}
              strokeDasharray={g.dash}
              strokeDashoffset={g.offset}
              vectorEffect="non-scaling-stroke"
            />
          ))}
          {/* The lamp's reflection in the lacquer along the crown, warming with the bet */}
          <ellipse
            {...ring(1.034)}
            stroke={css(lamp)}
            strokeOpacity={0.07 + heat * 0.07}
            strokeWidth={18}
            vectorEffect="non-scaling-stroke"
          />
          <ellipse
            {...ring(1.032)}
            stroke="#FFE7C2"
            strokeOpacity={0.1 + heat * 0.06}
            strokeWidth={2.5}
            vectorEffect="non-scaling-stroke"
          />
          {/* A brass inlay set into the wood, in a dark channel */}
          <ellipse
            {...ring(1.088)}
            stroke="#120602"
            strokeOpacity={0.55}
            strokeWidth={4}
            vectorEffect="non-scaling-stroke"
          />
          <ellipse
            {...ring(1.088)}
            stroke="#D6AE62"
            strokeOpacity={0.62}
            strokeWidth={1.3}
            vectorEffect="non-scaling-stroke"
          />
        </g>
        {/* The groove where the felt tucks under, and the polished lip just outside it */}
        <ellipse
          {...ring(1)}
          fill="none"
          stroke="#0B0402"
          strokeOpacity={0.9}
          strokeWidth={2.5}
          vectorEffect="non-scaling-stroke"
        />
        <ellipse
          {...ring(1.0045)}
          fill="none"
          stroke="#FFD9A8"
          strokeOpacity={0.32}
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      {/* Open pores in the wood */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: WOOD_PORES,
          backgroundSize: "150px 150px",
          opacity: 0.45,
          maskImage: RAIL_MASK,
          WebkitMaskImage: RAIL_MASK,
        }}
      />
    </>
  );
}

/* ---------------- Chips ---------------- */

/** Chip colours: face, side (the edge, in shadow), and the edge inserts. */
const CHIPS = {
  red: { face: "#D3343C", side: "#A5242B", spot: "#F6F0E4" },
  black: { face: "#2C2C33", side: "#18181D", spot: "#F6F0E4" },
  blue: { face: "#2F63C6", side: "#1F4592", spot: "#F6F0E4" },
  white: { face: "#F2EDE3", side: "#CCC4B5", spot: "#D3343C" },
  purple: { face: "#7B3FA6", side: "#572A7A", spot: "#FFD966" },
  gold: { face: "#EDC151", side: "#B88A24", spot: "#FFF7DD" },
} as const;
type ChipColor = keyof typeof CHIPS;

/** A chip in the stack view: 100 units wide, seen from a little above. */
const RX = 44;
const RY = 19;
const TH = 8;
/** y of the bottom chip's lower edge centre (the stack grows up into negative y). */
const Y0 = -RY - 2;

const shade = (hex: string, toward: string, t: number) =>
  css(mixHex(hex, toward, t));

/**
 * A stack of `n` chips, its bottom centre at the anchor. New chips drop on from above, and
 * leave the same way, unless `topple` is set: then the stack tips over, the higher chips
 * sliding furthest. Each chip's edge inserts are turned a little, like a real messy stack.
 */
function ChipStack({
  n,
  color,
  width,
  seed,
  topple = false,
}: {
  n: number;
  color: ChipColor;
  width: number;
  seed: number;
  topple?: boolean;
}) {
  const id = useId().replace(/:/g, "");
  const c = CHIPS[color];
  const top = Math.max(n, 1) * TH + 2 * RY + 4;
  // Which way this stack falls
  const dir = frac(seed, 77) < 0.5 ? -1 : 1;
  return (
    <svg
      aria-hidden
      viewBox={`0 ${-top} 100 ${top}`}
      width={width}
      height={(top * width) / 100}
      className="block overflow-visible"
      style={{ filter: "drop-shadow(0 5px 4px rgba(0,0,0,0.35))" }}
    >
      <defs>
        <linearGradient id={`${id}-side`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor={shade(c.side, "#FFFFFF", 0.18)} />
          <stop offset="0.32" stopColor={c.side} />
          <stop offset="0.78" stopColor={c.side} />
          <stop offset="1" stopColor={shade(c.side, "#000000", 0.4)} />
        </linearGradient>
      </defs>
      {/* Contact shadow on the felt (gone once a toppled stack has slid away) */}
      <motion.ellipse
        cx={50}
        cy={Y0 + 3}
        rx={RX + 4}
        ry={RY + 2}
        fill="rgba(0,0,0,0.28)"
        initial={false}
        animate={{ opacity: n > 0 ? 1 : 0 }}
        transition={{ duration: 0.4, delay: n > 0 ? 0 : 0.9 }}
      />
      {/* `custom` reaches chips already on their way out, which keep their old props */}
      <AnimatePresence initial={false} custom={topple}>
        {Array.from({ length: n }, (_, i) => (
          <motion.g
            key={i}
            custom={topple}
            initial="drop"
            animate="sit"
            exit="out"
            variants={{
              drop: { y: -16, opacity: 0 },
              sit: {
                x: 0,
                y: 0,
                rotate: 0,
                opacity: 1,
                transition: {
                  type: "spring",
                  stiffness: 520,
                  damping: 26,
                  delay: Math.min(i, 6) * 0.015,
                },
              },
              out: (toppling: boolean) => {
                if (!toppling)
                  return { y: -10, opacity: 0, transition: { duration: 0.18 } };
                // Lean, then fall to the felt, tilted, and skid out flat, spilling the
                // stack in a line: the higher the chip, the further it goes. A beat lying
                // there, then gone.
                const k = (s: number) => frac(i, seed + s);
                const dist = dir * (14 + i * 10 + k(5) * 10);
                const fall = i * TH + i * 1.2 + (k(6) - 0.3) * 14;
                const tilt = dir * (20 + k(7) * 25);
                const flat = (k(10) - 0.5) * 8;
                return {
                  x: [0, dir * 3, dist * 0.75, dist * 0.9, dist, dist, dist],
                  y: [0, -4, fall, fall - 4, fall, fall, fall],
                  rotate: [0, dir * 8, tilt, flat, flat, flat, flat],
                  opacity: [1, 1, 1, 1, 1, 1, 0],
                  transition: {
                    duration: 1.5 + k(8) * 0.2,
                    delay: 0.55 + k(9) * 0.08,
                    times: [0, 0.14, 0.42, 0.5, 0.58, 0.82, 1],
                    ease: [
                      "easeOut",
                      "easeIn",
                      "easeOut",
                      "easeIn",
                      "linear",
                      "linear",
                    ],
                  },
                };
              },
            }}
          >
            <ChipShape
              c={c}
              sideFill={`url(#${id}-side)`}
              cx={50 + (frac(i, seed) - 0.5) * 3.2}
              yB={Y0 - i * TH}
              turn={frac(i, seed + 1) * 45}
            />
          </motion.g>
        ))}
      </AnimatePresence>
    </svg>
  );
}

/** One chip: its edge band (yB is the lower edge's centre) and its face on top. */
function ChipShape({
  c,
  sideFill,
  cx,
  yB,
  turn,
}: {
  c: (typeof CHIPS)[ChipColor];
  sideFill: string;
  cx: number;
  yB: number;
  /** Rotation of the edge inserts, in degrees. */
  turn: number;
}) {
  const yT = yB - TH;
  const l = cx - RX;
  const r = cx + RX;
  const band = `M${l} ${yT}V${yB}A${RX} ${RY} 0 0 0 ${r} ${yB}V${yT}A${RX} ${RY} 0 0 1 ${l} ${yT}Z`;
  // Inserts on the visible (front) half of the edge, narrowing as they turn away
  const spots = Array.from({ length: 8 }, (_, k) => {
    const a = ((turn + k * 45) * Math.PI) / 180;
    const s = Math.sin(a);
    if (s < 0.15) return null;
    const x = cx + RX * Math.cos(a);
    const hw = 4.8 * s;
    return (
      <rect
        key={k}
        x={x - hw}
        y={yT + RY * s + 1.2}
        width={hw * 2}
        height={TH - 2.4}
        fill={c.spot}
        opacity={0.55 + s * 0.4}
      />
    );
  });
  return (
    <>
      <path d={band} fill={sideFill} />
      {spots}
      <path
        d={`M${l} ${yB}A${RX} ${RY} 0 0 0 ${r} ${yB}`}
        fill="none"
        stroke="rgba(0,0,0,0.3)"
        strokeWidth={0.9}
      />
      <ellipse cx={cx} cy={yT} rx={RX} ry={RY} fill={c.face} />
      {/* Inserts round the rim of the face, lined up with the ones on the edge */}
      <ellipse
        cx={cx}
        cy={yT}
        rx={RX * 0.84}
        ry={RY * 0.84}
        fill="none"
        stroke={c.spot}
        strokeWidth={5}
        pathLength={64}
        strokeDasharray="4 4"
        strokeDashoffset={2 - turn / 5.625}
      />
      <ellipse
        cx={cx}
        cy={yT}
        rx={RX * 0.6}
        ry={RY * 0.6}
        fill={shade(c.face, "#FFFFFF", 0.1)}
      />
      <ellipse
        cx={cx}
        cy={yT}
        rx={RX * 0.6}
        ry={RY * 0.6}
        fill="none"
        stroke={c.spot}
        strokeOpacity={0.6}
        strokeWidth={1}
        strokeDasharray="2.2 2.4"
      />
      {/* Light catching the front lip */}
      <path
        d={`M${l + 1} ${yT + 1}A${RX} ${RY} 0 0 0 ${r - 1} ${yT + 1}`}
        fill="none"
        stroke="rgba(255,255,255,0.22)"
        strokeWidth={1}
      />
    </>
  );
}

/**
 * Stacks round the bottom corners, anchored by their bottom centre (hero %). Each one comes out
 * at tier `from`, and runs from `min` to `max` chips as the bet grows. `bust` stacks keep one chip
 * on a late result; the rest are gone.
 */
const STACKS: {
  x: number;
  y: number;
  color: ChipColor;
  from: number;
  min: number;
  max: number;
  bust?: boolean;
  /** Only shown on a win: the pot you just raked in. */
  pot?: boolean;
  /**
   * Where it sits on phones, where the labels fill the hero's width: tucked against the screen
   * edge beside the dial. Stacks without one are left off phones.
   */
  phone?: [number, number];
}[] = [
  // Bottom left
  {
    x: 11,
    y: 83,
    color: "red",
    from: 0,
    min: 4,
    max: 13,
    bust: true,
    phone: [3.5, 70],
  },
  { x: 16.5, y: 87, color: "black", from: 0, min: 3, max: 10 },
  { x: 7.5, y: 75, color: "white", from: 2, min: 3, max: 9 },
  { x: 14, y: 94, color: "blue", from: 1, min: 2, max: 8 },
  { x: 21, y: 92, color: "purple", from: 4, min: 3, max: 7 },
  { x: 22, y: 82, color: "gold", from: 6, min: 6, max: 6, pot: true },
  // Bottom right
  {
    x: 87,
    y: 85,
    color: "black",
    from: 0,
    min: 3,
    max: 12,
    bust: true,
    phone: [96.5, 73],
  },
  { x: 82, y: 90, color: "red", from: 1, min: 2, max: 9 },
  { x: 92, y: 77, color: "blue", from: 2, min: 3, max: 10 },
  { x: 88, y: 95, color: "white", from: 3, min: 2, max: 7 },
  { x: 78, y: 81, color: "gold", from: 6, min: 5, max: 5, pot: true },
];

/**
 * Single chips thrown across the felt; `order` is when (as a share of the bet) each lands.
 * Kept out of the band the side labels sit in (about 58–72% down, 9–35% in from each side,
 * depending on the width), so nothing lands on the text.
 */
const LOOSE = [
  { x: 5, y: 60, color: "red" },
  { x: 95, y: 63, color: "black" },
  { x: 19, y: 77, color: "blue" },
  { x: 81, y: 76, color: "red" },
  { x: 5, y: 33, color: "black" },
  { x: 91, y: 35, color: "white" },
  { x: 22, y: 50, color: "white" },
  { x: 77, y: 50, color: "blue" },
  { x: 4, y: 48, color: "purple" },
  { x: 96, y: 51, color: "red" },
  { x: 12, y: 22, color: "red" },
  { x: 88, y: 22, color: "purple" },
].map((c, i) => ({
  ...c,
  color: c.color as ChipColor,
  order: (i + 0.5) / 12,
  seed: 60 + i,
}));

/** Chips flicked up and spinning, from "Re-raise" up (hero %, where each one lands). */
const FLIPPERS = [
  { x: 26, y: 81, color: "red", dur: 2.4, delay: 0, from: 4 },
  { x: 73, y: 80, color: "black", dur: 2.8, delay: 1.1, from: 4 },
  { x: 4.5, y: 69, color: "purple", dur: 2.6, delay: 0.5, from: 5 },
  { x: 95.5, y: 72, color: "blue", dur: 2.2, delay: 1.6, from: 5 },
] as const;

/* ---------------- Cards ---------------- */

const SUIT_RED = "#C8262E";
const SUIT_BLACK = "#1E1E24";
const CARD_W = 56;
const CARD_H = 80;

type Hand = [string, string];

/** Your hole cards: pocket aces for a snooze, the dreaded 7-2 for a late one. */
function handFor(mood: SceneMood): Hand | null {
  if (mood === "win") return ["A♠", "A♥"];
  if (mood === "loss") return ["7♣", "2♦"];
  if (mood === "jackpot") return ["K♠", "K♥"];
  return null;
}

/** A card's back: the printed panel (poker-art.tsx) inside a cream border. */
function CardBack() {
  return (
    <div
      className="absolute inset-0 rounded-[6px] bg-[#F8F3E8] p-[3.5px]"
      style={{ backfaceVisibility: "hidden" }}
    >
      <CardBackArt />
    </div>
  );
}

function CardFace({ card }: { card: string }) {
  const rank = card.slice(0, -1);
  const suit = card.slice(-1);
  const color = suit === "♥" || suit === "♦" ? SUIT_RED : SUIT_BLACK;
  const corner = (
    <span className="flex flex-col items-center leading-[0.9] font-bold">
      <span style={{ fontSize: 15 }}>{rank}</span>
      <span style={{ fontSize: 12 }}>{suit}</span>
    </span>
  );
  return (
    <div
      className="absolute inset-0 rounded-[6px] bg-[#FBF8F1]"
      style={{
        color,
        backfaceVisibility: "hidden",
        transform: "rotateY(180deg)",
        boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.12)",
        fontFamily: "var(--font-geist-sans), sans-serif",
      }}
    >
      <span className="absolute top-[4px] left-[5px]">{corner}</span>
      <span className="absolute right-[5px] bottom-[4px] rotate-180">
        {corner}
      </span>
      <span
        className="absolute inset-0 grid place-items-center leading-none"
        style={{ fontSize: 30 }}
      >
        {suit}
      </span>
    </div>
  );
}

/**
 * A card lying on the felt; flips over when `card` is set. `peek`: the near edge keeps lifting
 * off the felt and dropping back (checking your cards while the draw runs). `pop`: it jumps up
 * as it turns over (a winning hand, slapped down).
 */
function TableCard({
  card,
  x,
  rot,
  delay = 0,
  peek = false,
  pop = false,
}: {
  card: string | null;
  x: number;
  rot: number;
  delay?: number;
  peek?: boolean;
  pop?: boolean;
}) {
  // Keep the last face drawn while it flips back down, so it doesn't vanish mid-turn
  const [shown, setShown] = useState(card);
  if (card && card !== shown) setShown(card);
  return (
    <div
      className="absolute"
      style={{
        left: x,
        top: 0,
        width: CARD_W,
        height: CARD_H,
        transform: `rotate(${rot}deg)`,
        transformStyle: "preserve-3d",
      }}
    >
      {/* Hinged on the far edge, so the near one lifts */}
      <motion.div
        className="absolute inset-0"
        style={{ originY: 0, transformStyle: "preserve-3d" }}
        animate={{ rotateX: peek ? [0, 20, 20, 0] : 0 }}
        transition={
          peek
            ? {
                duration: 1,
                times: [0, 0.3, 0.7, 1],
                ease: "easeInOut",
                repeat: Infinity,
                repeatDelay: 0.45,
                delay: 0.25 + delay * 3,
              }
            : { duration: 0.25 }
        }
      >
        <motion.div
          className="absolute inset-0"
          style={{
            transformStyle: "preserve-3d",
            boxShadow: "0 6px 10px rgba(0,0,0,0.35)",
            borderRadius: 6,
          }}
          animate={{ rotateY: card ? 180 : 0, scale: pop ? [1, 1.25, 1] : 1 }}
          transition={{
            rotateY: { type: "spring", stiffness: 140, damping: 16, delay },
            scale: { duration: 0.55, delay: delay + 0.05, ease: "easeOut" },
          }}
        >
          <CardBack />
          {shown && <CardFace card={shown} />}
        </motion.div>
      </motion.div>
    </div>
  );
}

/**
 * Your two hole cards, slightly fanned on the felt: peeked at while the draw runs, glowing
 * gold under a winning hand, shaken in disgust at a losing one.
 */
function HoleCards({ hand, mood }: { hand: Hand | null; mood: SceneMood }) {
  const loss = mood === "loss";
  return (
    <motion.div
      className="relative"
      style={{ perspective: 700 }}
      animate={{ x: loss ? [0, -7, 6, -5, 4, -2, 0] : 0 }}
      transition={loss ? { duration: 0.55, delay: 0.85 } : { duration: 0.2 }}
    >
      <AnimatePresence>
        {mood === "win" && (
          <motion.div
            key="glow"
            className="absolute -inset-12 rounded-full"
            style={{
              background:
                "radial-gradient(closest-side, rgba(255,217,102,0.5), rgba(255,217,102,0.18) 55%, rgba(255,217,102,0))",
            }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: [0, 1, 0.6], scale: [0.5, 1.2, 1] }}
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
            transition={{ duration: 0.9, delay: 0.3, ease: "easeOut" }}
          />
        )}
      </AnimatePresence>
      <div
        className="relative"
        style={{
          width: CARD_W * 1.7,
          height: CARD_H,
          transform: "rotateX(48deg)",
          transformStyle: "preserve-3d",
        }}
      >
        <TableCard
          card={hand?.[0] ?? null}
          x={0}
          rot={-9}
          peek={mood === "set"}
          pop={mood === "win"}
        />
        <TableCard
          card={hand?.[1] ?? null}
          x={CARD_W * 0.62}
          rot={7}
          delay={0.12}
          peek={mood === "set"}
          pop={mood === "win"}
        />
      </div>
    </motion.div>
  );
}

/** The dealer's deck, squared up and face down. */
function Deck() {
  return (
    <div style={{ perspective: 700 }}>
      <div
        className="relative"
        style={{
          width: CARD_W,
          height: CARD_H,
          transform: "rotateX(48deg) rotateZ(-14deg)",
        }}
      >
        <div
          className="absolute inset-0 rounded-[6px] bg-[#F8F3E8] p-[3.5px]"
          style={{
            // The deck's thickness: card edges peeking out below
            boxShadow:
              "0 1.5px 0 #E2DCCF, 0 3px 0 #D6CFC0, 0 4.5px 0 #E2DCCF, 0 6px 0 #CFC7B7, 0 7.5px 0 #DCD5C7, 0 9px 0 #C4BBA9, 0 16px 14px rgba(0,0,0,0.4)",
          }}
        >
          <CardBackArt />
        </div>
      </div>
    </div>
  );
}

/** The dealer button: a thick white puck. */
function DealerButton({ width }: { width: number }) {
  const bandH = 13;
  const cy = -RY - bandH - 2;
  const top = 2 * RY + bandH + 4;
  return (
    <svg
      aria-hidden
      viewBox={`0 ${-top} 100 ${top}`}
      width={width}
      height={(top * width) / 100}
      className="block overflow-visible"
      style={{ filter: "drop-shadow(0 6px 5px rgba(0,0,0,0.4))" }}
    >
      <defs>
        <linearGradient id="lc-dealer-side" x1="0" x2="1">
          <stop offset="0" stopColor="#F1ECE2" />
          <stop offset="0.4" stopColor="#D5CDBE" />
          <stop offset="1" stopColor="#9E9584" />
        </linearGradient>
      </defs>
      <path
        d={`M${50 - RX} ${cy}V${cy + bandH}A${RX} ${RY} 0 0 0 ${50 + RX} ${cy + bandH}V${cy}Z`}
        fill="url(#lc-dealer-side)"
      />
      <ellipse cx={50} cy={cy} rx={RX} ry={RY} fill="#FAF7F0" />
      <ellipse
        cx={50}
        cy={cy}
        rx={RX * 0.8}
        ry={RY * 0.8}
        fill="none"
        stroke="#1E1E24"
        strokeOpacity={0.7}
        strokeWidth={1.2}
      />
      <text
        x={50}
        y={cy}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={15}
        fontWeight={800}
        letterSpacing="0.12em"
        fill="#1E1E24"
        transform={`matrix(1 0 0 ${RY / RX} 0 ${cy * (1 - RY / RX)})`}
        style={{ fontFamily: "var(--font-geist-sans), sans-serif" }}
      >
        DEALER
      </text>
    </svg>
  );
}

/** A four-point sparkle on a 24-unit grid. */
const SPARKLE =
  "M12 0C12.8 7 17 11.2 24 12 17 12.8 12.8 17 12 24 11.2 17 7 12.8 0 12 7 11.2 11.2 7 12 0z";

/** Glints winking off the gold chips after a snooze. */
const GLINTS = [
  { x: 21, y: 70, s: 16, d: 0 },
  { x: 24, y: 78, s: 11, d: 0.6 },
  { x: 77, y: 70, s: 14, d: 0.3 },
  { x: 80, y: 77, s: 10, d: 1 },
  { x: 18, y: 76, s: 9, d: 1.3 },
];

/* ---------------- The scene ---------------- */

/** Bottom-centre anchor at (x%, y%): scaled down on smaller screens, from that anchor. */
const ANCHOR =
  "absolute -translate-x-1/2 -translate-y-full origin-bottom scale-[0.62] md:scale-[0.85] xl:scale-100";

export function PokerScene({ p, tier, mood }: Props) {
  const win = mood === "win";
  const loss = mood === "loss";
  // How hot the table is: a snooze rakes in the whole pot, a late result busts you.
  const heat = win ? 1 : loss ? 0 : p;
  const lamp = rampN(["#FFF3D2", "#FFE6A8", "#FFD08A"], heat);
  const vignette = 0.32 + p * 0.2 + (loss ? 0.2 : 0);
  const hand = handFor(mood);
  // The bets on the felt go into the pot once the alarm is set, and come back for the next hand
  const looseOut = mood === "idle" ? clamp(p * 1.15) : 0;
  const flipping = !loss;

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Felt: fine fibres and broad, soft mottling */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: FELT_MOTTLE,
          backgroundSize: "520px 520px",
          opacity: 0.2,
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: FELT_FIBRES,
          backgroundSize: "180px 180px",
          opacity: 0.32,
        }}
      />

      {/* The lamp over the table: a pool of light that warms with the bet */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 55% 50% at 50% 48%, ${cssA(lamp, 0.07 + heat * 0.07)} 0%, ${cssA(lamp, 0.02)} 60%, transparent 80%)`,
          transition: "background 600ms ease-out",
        }}
      />
      {/* The room beyond the lamp, closing in as the stakes rise */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 80% 75% at 50% 46%, transparent 50%, rgba(0,0,0,${vignette.toFixed(2)}) 100%)`,
          transition: "background 600ms ease-out",
        }}
      />

      <TableEdge heat={heat} lamp={lamp} />

      {/* Dealer's deck, top left */}
      <div className="absolute top-[40%] left-[11%] -translate-1/2 max-md:hidden">
        <Deck />
      </div>

      {/* Dealer button, right */}
      <div className={`${ANCHOR} top-[44%] left-[91%] max-md:hidden`}>
        <DealerButton width={54} />
      </div>

      {/* Your hole cards, face down until the draw lands */}
      <div className="absolute top-[57%] left-[86%] -translate-1/2 max-md:hidden">
        <HoleCards hand={hand} mood={mood} />
      </div>

      {/* Chips thrown in across the felt as the bet grows. Setting the alarm pushes them all
          into the pot, under the dial. */}
      <AnimatePresence custom={mood}>
        {LOOSE.filter((c) => c.order < looseOut).map((c, i) => (
          <motion.div
            key={`${c.x}-${c.y}`}
            className={`${ANCHOR} max-md:hidden`}
            style={{ left: `${c.x}%`, top: `${c.y}%` }}
            custom={mood}
            initial={{ opacity: 0, y: -26 }}
            animate={{ opacity: 1, y: 0 }}
            exit="out"
            variants={{
              out: (m: SceneMood) =>
                m === "set"
                  ? {
                      left: "50%",
                      top: "46%",
                      scale: 0.7,
                      opacity: [1, 1, 0],
                      transition: {
                        duration: 0.6,
                        delay: i * 0.035,
                        ease: [0.45, 0, 0.8, 0.4],
                      },
                    }
                  : { opacity: 0, y: -12, transition: { duration: 0.2 } },
            }}
            transition={{ type: "spring", stiffness: 420, damping: 18 }}
          >
            <ChipStack n={1} color={c.color} width={40} seed={c.seed} />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Stacks in the bottom corners: taller and more of them as the bet grows */}
      <AnimatePresence>
        {STACKS.map((s, i) => {
          if (s.pot ? !win : tier < s.from) return null;
          let n = Math.round(s.min + (s.max - s.min) * heat);
          if (loss) n = s.bust ? 1 : 0;
          // Busted, the emptied stacks stay a moment so their chips can topple over
          if (n === 0 && !loss) return null;
          const [px, py] = s.phone ?? [s.x, s.y];
          return (
            <motion.div
              key={i}
              className={`${ANCHOR} top-(--py) left-(--px) md:top-(--y) md:left-(--x) ${s.phone ? "" : "max-md:hidden"}`}
              style={
                {
                  "--x": `${s.x}%`,
                  "--y": `${s.y}%`,
                  "--px": `${px}%`,
                  "--py": `${py}%`,
                } as CSSProperties
              }
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.25 } }}
            >
              <ChipStack
                n={n}
                color={s.color}
                width={62}
                seed={i * 7 + 3}
                topple={loss}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Chips flicked up and spinning, from "Re-raise" up */}
      {flipping &&
        FLIPPERS.filter((f) => tier >= f.from).map((f, i) => (
          <div
            key={i}
            className={`${ANCHOR} max-md:hidden`}
            style={{ left: `${f.x}%`, top: `${f.y}%`, perspective: 300 }}
          >
            <div
              style={{
                animation: `lc-chip-flip ${f.dur}s ${f.delay}s infinite`,
              }}
            >
              <ChipStack n={1} color={f.color} width={38} seed={90 + i} />
            </div>
          </div>
        ))}

      {/* A snooze: the pot glints */}
      {win &&
        GLINTS.map((g, i) => (
          <svg
            key={i}
            aria-hidden
            viewBox="0 0 24 24"
            className="absolute max-md:hidden"
            style={{
              left: `${g.x}%`,
              top: `${g.y}%`,
              width: g.s,
              height: g.s,
              animation: `lc-glint 1.8s ease-in-out ${g.d}s infinite`,
            }}
          >
            <path d={SPARKLE} fill="#FFF3C4" />
          </svg>
        ))}

    </div>
  );
}

/* ---------------- The pot bursting open ---------------- */

/** A chip seen face on (for chips in flight). */
function ChipFace({ color, size }: { color: ChipColor; size: number }) {
  const c = CHIPS[color];
  return (
    <svg
      aria-hidden
      viewBox="-50 -50 100 100"
      width={size}
      height={size}
      className="block"
    >
      <circle r={49} fill={c.side} />
      <circle r={45} fill={c.face} />
      <circle
        r={38}
        fill="none"
        stroke={c.spot}
        strokeWidth={11}
        pathLength={48}
        strokeDasharray="4 4"
        strokeDashoffset={2}
      />
      <circle r={26} fill={shade(c.face, "#FFFFFF", 0.12)} />
      <circle
        r={26}
        fill="none"
        stroke={c.spot}
        strokeOpacity={0.6}
        strokeWidth={2}
        strokeDasharray="4 4.5"
      />
    </svg>
  );
}

const FOUNTAIN_COLORS: ChipColor[] = [
  "gold",
  "gold",
  "gold",
  "gold",
  "red",
  "black",
  "purple",
  "blue",
  "white",
  "red",
];

/**
 * Chips bursting out of the pot, in shares of the dial's size: thrown out to either side from
 * behind the dial in wide, low arcs, so they clear the time and the verdict quickly and land on
 * the felt out by your stacks (`side`, `out` and `land`: where each comes down, from the
 * dial's centre).
 */
const FOUNTAIN = Array.from({ length: 28 }, (_, i) => {
  const f = (s: number) => frac(i, s);
  // Alternate sides, so each side gets its share
  const side = i % 2 ? 1 : -1;
  return {
    color: FOUNTAIN_COLORS[Math.floor(f(41) * FOUNTAIN_COLORS.length)],
    side,
    out: 0.7 + f(42) * 0.95,
    land: 0.3 + f(43) * 0.5,
    lift: 0.2 + f(44) * 0.35,
    flight: 0.85 + f(45) * 0.45,
    delay: f(46) * 0.55,
    size: 24 + f(47) * 14,
    turns: 1 + Math.floor(f(48) * 3),
    tilt: (f(49) - 0.5) * 60,
  };
});

/** A split pot: half the chips, each with a twin flying exactly the other way. */
const SPLIT = FOUNTAIN.slice(0, 12)
  .filter((c) => c.side === 1)
  .flatMap((c) => [c, { ...c, side: -1, tilt: -c.tilt }]);

/** Quadratic ease-out and ease-in: a thrown chip slowing to the top of its arc, then falling. */
const RISE_EASE = [0.25, 0.46, 0.45, 0.94] as const;
const FALL_EASE = [0.55, 0.085, 0.68, 0.53] as const;
/**
 * How far over a chip ends up when it lands: lying flat on the table, seen from the same angle
 * as the stacks (cos 64° ≈ RY / RX).
 */
const LIE_FLAT = 64;
/** How long a chip lies on the felt, then how long it takes to fade. */
const REST = 0.55;
const FADE = 0.35;

/**
 * The pot bursting: chips thrown out from behind the dial, spinning through wide arcs, landing
 * flat on the felt by your stacks, then fading. Played once, as the result lands.
 */
function ChipFountain({ size, split }: { size: number; split: boolean }) {
  const reduce = useReducedMotion();
  if (reduce) return null;
  // How far out a chip can be thrown: the dial's size on wide screens, less on a phone so
  // most land on screen. (Only ever drawn after a draw, so never on the server.)
  const reach = Math.min(size, window.innerWidth / 3);
  return (
    <div aria-hidden className="pointer-events-none absolute top-0 left-0">
      {(split ? SPLIT : FOUNTAIN).map((c, i) => {
        const delay = 0.15 + c.delay;
        const total = c.flight + REST + FADE;
        // When it tops out, so the rise and fall feel like one arc under gravity
        const apex = 1 / (1 + Math.sqrt((c.lift + c.land) / c.lift));
        const spin = c.side * (c.turns * 360 + LIE_FLAT);
        return (
          <motion.div
            key={i}
            className="absolute"
            style={{
              // From the edge of the time, not its middle
              left: c.side * size * 0.12 - c.size / 2,
              top: -c.size / 2,
              perspective: 220,
            }}
            initial={{ x: 0, y: 0, opacity: 0, scale: 0.5 }}
            animate={{
              x: c.side * c.out * reach,
              y: [0, -c.lift * size, c.land * size],
              opacity: [0, 1, 1, 0],
              scale: 1,
            }}
            transition={{
              x: { delay, duration: c.flight, ease: "linear" },
              y: {
                delay,
                duration: c.flight,
                times: [0, apex, 1],
                ease: [RISE_EASE, FALL_EASE],
              },
              opacity: {
                delay,
                duration: total,
                times: [0, 0.04, (c.flight + REST) / total, 1],
              },
              scale: { delay, duration: 0.3, ease: "easeOut" },
            }}
          >
            <motion.div
              initial={{ rotate: c.tilt, rotateX: 0 }}
              // Square to the table by the time it lands
              animate={{ rotateX: spin, rotate: 0 }}
              transition={{ delay, duration: c.flight, ease: "linear" }}
            >
              <ChipFace color={c.color} size={c.size} />
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
}

/**
 * Poker's counterpart to the sun rays: the lamp's pool of light on the pot, warming and
 * brightening with the bet, and a printed pot circle on the felt. At all in, the circle
 * breathes. Fades out while the alarm is set. A snooze bursts the pot open (chips flying out
 * from behind the dial); right on time splits it, half flying each way.
 */
export function PotLight({
  p,
  range,
  visible,
  size,
  mood,
}: {
  p: number;
  range: number;
  visible: boolean;
  /** Diameter of the dial it sits behind, in px. */
  size: number;
  mood?: SceneMood;
}) {
  const glow = rampN(["#FFF1C9", "#FFE09A", "#FFBF6A"], p);
  const allIn = range === MAX_RANGE;
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none absolute -translate-1/2"
        style={{
          width: size * 1.9,
          height: size * 1.9,
          opacity: visible ? 1 : 0,
          transition: "opacity 400ms ease-out",
        }}
      >
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle, ${cssA(glow, 0.2 + p * 0.14)} 0%, ${cssA(glow, 0.07)} 36%, ${cssA(glow, 0)} 62%)`,
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            inset: "18%",
            border: "1.5px solid rgba(232,200,114,0.26)",
            boxShadow: "0 0 0 5px rgba(232,200,114,0.06)",
            animation: allIn ? "lc-pulse 1.2s ease-in-out infinite" : "none",
          }}
        />
      </div>
      {(mood === "win" || mood === "jackpot") && (
        <ChipFountain size={size} split={mood === "jackpot"} />
      )}
    </>
  );
}

/* ---------------- The draw: dealing the board ---------------- */

const RANKS = [
  "A",
  "K",
  "Q",
  "J",
  "10",
  "9",
  "8",
  "7",
  "6",
  "5",
  "4",
  "3",
  "2",
];
const SUITS = ["♠", "♥", "♦", "♣"];

/** Five different cards off a fresh deck. */
function dealBoard() {
  const deck = RANKS.flatMap((r) => SUITS.map((s) => r + s));
  return Array.from(
    { length: 5 },
    () => deck.splice(Math.floor(Math.random() * deck.length), 1)[0],
  );
}

const MINI_W = 22;
const MINI_H = 31;
const MINI_GAP = 4;
/** Room between the deck and the first card of the board. */
const DECK_GAP = 10;

/**
 * When each card is dealt and turned over, in seconds from the start of the draw: the flop
 * goes out in a burst and turns over in a ripple, then the turn, then the river, turned
 * slowest, landing as the progress bar fills.
 */
const STREETS = [
  { deal: 0, flip: 0.34 },
  { deal: 0.08, flip: 0.4 },
  { deal: 0.16, flip: 0.46 },
  { deal: 0.62, flip: 0.78 },
  { deal: 0.95, flip: 1.12 },
];

function MiniFace({ card }: { card: string }) {
  const rank = card.slice(0, -1);
  const suit = card.slice(-1);
  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center rounded-[3px] bg-[#FBF8F1] leading-none font-bold"
      style={{
        color: suit === "♥" || suit === "♦" ? SUIT_RED : SUIT_BLACK,
        backfaceVisibility: "hidden",
        transform: "rotateY(180deg)",
        boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.12)",
        fontFamily: "var(--font-geist-sans), sans-serif",
      }}
    >
      <span
        style={{
          fontSize: 11,
          letterSpacing: rank === "10" ? "-0.06em" : undefined,
        }}
      >
        {rank}
      </span>
      <span style={{ fontSize: 12, marginTop: 1 }}>{suit}</span>
    </div>
  );
}

/**
 * Shown above the progress bar while the draw rolls ("Dealing the river"): the dealer's deck,
 * and the board dealt off it card by card (flop, turn, river), each one turning over.
 */
export function PokerRoll() {
  // A fresh board every draw (this remounts with each one)
  const [board] = useState(dealBoard);
  return (
    <div
      aria-hidden
      className="relative mb-3"
      style={{
        width: MINI_W * 6 + DECK_GAP + MINI_GAP * 4,
        height: MINI_H + 8,
        perspective: 400,
      }}
    >
      <div
        className="absolute bottom-0 left-0 rounded-[3px] bg-[#F8F3E8] p-[1.5px]"
        style={{
          width: MINI_W,
          height: MINI_H,
          boxShadow:
            "0 1px 0 #D6CFC0, 0 2px 0 #E2DCCF, 0 3px 0 #C4BBA9, 0 6px 6px rgba(0,0,0,0.35)",
        }}
      >
        <CardBackArt />
      </div>
      {board.map((card, i) => {
        const left = MINI_W + DECK_GAP + i * (MINI_W + MINI_GAP);
        const river = i === 4;
        const { deal, flip } = STREETS[i];
        return (
          <motion.div
            key={i}
            className="absolute bottom-0"
            style={{
              left,
              width: MINI_W,
              height: MINI_H,
              borderRadius: 3,
              transformStyle: "preserve-3d",
              boxShadow: "0 3px 5px rgba(0,0,0,0.35)",
            }}
            initial={{ x: -left, y: 0, rotate: -24, rotateY: 0, opacity: 0 }}
            animate={{
              x: 0,
              y: river ? [0, -8, 0] : 0,
              rotate: 0,
              rotateY: 180,
              opacity: 1,
            }}
            transition={{
              x: { delay: deal, duration: 0.26, ease: [0.15, 0.8, 0.3, 1] },
              rotate: { delay: deal, duration: 0.26, ease: "easeOut" },
              opacity: { delay: deal, duration: 0.04 },
              rotateY: {
                delay: flip,
                duration: river ? 0.36 : 0.26,
                ease: "easeInOut",
              },
              y: { delay: flip, duration: 0.36, ease: "easeOut" },
            }}
          >
            <div
              className="absolute inset-0 rounded-[3px] bg-[#F8F3E8] p-[1.5px]"
              style={{ backfaceVisibility: "hidden" }}
            >
              <CardBackArt />
            </div>
            <MiniFace card={card} />
          </motion.div>
        );
      })}
    </div>
  );
}
