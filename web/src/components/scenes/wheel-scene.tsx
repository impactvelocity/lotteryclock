"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, type CSSProperties } from "react";
import {
  Charm,
  Chip,
  CHIP_COLORS,
  Coin,
  SPARKLE,
  type CharmKind,
  type ChipColor,
} from "@/components/scenes/wheel-art";
import type { SceneMood } from "@/components/scenes/types";
import { frac } from "@/lib/rand";
import { cssA, MAX_RANGE, rampN } from "@/lib/themes";

/**
 * Prize wheel's background: a game-show floor that gets louder as the bet grows.
 *
 *   0 min     no spin: house lights low, two idle spotlights
 *   1–11      free spin: the first chips float up at the edges
 *   12–23     round and round: more chips, the sparkle comes on
 *   24–35     bonus round: a third spotlight, coins join the chips
 *   36–44     high stakes: four spotlights, sparkle everywhere
 *   45        mega jackpot: everything at full tilt
 *
 * A snooze is a payout (coins rain down); a late result is "bankrupt" (the lights drop).
 * Purely decorative and pointer-transparent.
 */

type Props = {
  /** Bet as a fraction of the maximum, 0..1. */
  p: number;
  /** Bet tier, 0 (no gamble) to 5 (the full 45). */
  tier: number;
  mood: SceneMood;
};

const clamp = (n: number) => Math.max(0, Math.min(1, n));

/** Spotlights sweeping up from the floor: where they stand (% across), their swing, their colour. */
const BEAMS = [
  { x: 4, from: 12, to: 34, dur: 7, delay: 0, rgb: "255,205,90" },
  { x: 96, from: -12, to: -34, dur: 8, delay: -3, rgb: "255,100,180" },
  { x: 24, from: -8, to: 18, dur: 6, delay: -1.5, rgb: "175,125,255" },
  { x: 76, from: 8, to: -18, dur: 6.5, delay: -4.2, rgb: "255,205,90" },
];
const BEAMS_AT = [2, 2, 2, 3, 4, 4];

type TokenKind = ChipColor | CharmKind | "coin";

type Token = {
  x: number;
  y: number;
  size: number;
  kind: TokenKind;
  dur: number;
  delay: number;
  tilt: number;
  /** Nearer the middle: left out on phones, where it would sit behind the text. */
  inner?: boolean;
};

/**
 * Chips, coins and lucky charms floating at the edges, in the order they come out. Kept clear
 * of the middle column, and hugging the very edge level with the dial, where the side labels sit.
 */
const TOKENS: Token[] = [
  { x: 5, y: 36, size: 46, kind: "pink", dur: 5.4, delay: -1, tilt: -16 },
  { x: 92, y: 30, size: 40, kind: "coin", dur: 4.6, delay: -2.5, tilt: 0 },
  { x: 3, y: 64, size: 32, kind: "violet", dur: 6.2, delay: -3, tilt: 20 },
  { x: 96, y: 70, size: 44, kind: "mint", dur: 5.8, delay: -0.5, tilt: -10 },
  { x: 3, y: 18, size: 36, kind: "cherries", dur: 4.2, delay: -1.8, tilt: -8 },
  { x: 95, y: 48, size: 30, kind: "pink", dur: 5, delay: -4, tilt: 14 },
  { x: 18, y: 24, size: 32, kind: "die", dur: 4.8, delay: -3.4, tilt: 12, inner: true },
  { x: 82, y: 80, size: 36, kind: "clover", dur: 6.6, delay: -2, tilt: -14, inner: true },
  { x: 3, y: 86, size: 38, kind: "mint", dur: 5.2, delay: -4.6, tilt: -22 },
  { x: 90, y: 16, size: 34, kind: "star", dur: 4.4, delay: -0.8, tilt: 10 },
  { x: 20, y: 80, size: 32, kind: "horseshoe", dur: 5.6, delay: -1.2, tilt: 8, inner: true },
  { x: 80, y: 22, size: 22, kind: "coin", dur: 4, delay: -2.2, tilt: 0, inner: true },
  { x: 14, y: 52, size: 40, kind: "ticket", dur: 6, delay: -2.8, tilt: 6, inner: true },
  { x: 86, y: 58, size: 26, kind: "coin", dur: 4.6, delay: -3.6, tilt: 0, inner: true },
];
const TOKENS_AT = [0, 2, 4, 6, 9, 14];

const isChip = (k: TokenKind): k is ChipColor => k in CHIP_COLORS;

/** One floating token. Coins flip as they go (`flip`); chips and charms just bob. */
function TokenArt({ kind, size, flip }: { kind: TokenKind; size: number; flip?: string }) {
  if (kind === "coin") return <Coin size={size} style={flip ? { animation: flip } : undefined} />;
  if (isChip(kind)) return <Chip color={kind} size={size} />;
  return <Charm kind={kind} size={size} />;
}

/** Sparkles come out in a fixed order (`order`), so the same ones are always first. */
const SPARK_COLORS = ["#FFE08A", "#FF8CC6", "#FFFFFF", "#C9A6FF"];
const SPARKS = Array.from({ length: 44 }, (_, i) => ({
  x: frac(i, 51) * 100,
  y: 4 + frac(i, 52) * 80,
  s: Math.round(6 + frac(i, 53) * 12),
  delay: (frac(i, 54) * 4).toFixed(1),
  dur: (1.8 + frac(i, 55) * 2.4).toFixed(1),
  order: frac(i, 56),
  color: SPARK_COLORS[Math.floor(frac(i, 57) * SPARK_COLORS.length)],
}));

/** The payout: coins (with the odd chip or charm) raining down on a snooze or a jackpot. */
const RAIN_CHIPS = ["pink", "violet", "mint"] as const;
const RAIN_CHARMS = ["star", "cherries", "clover", "horseshoe"] as const;
const RAIN = Array.from({ length: 26 }, (_, i) => ({
  x: frac(i, 71) * 100,
  size: Math.round(16 + frac(i, 72) * 18),
  dur: (2.2 + frac(i, 73) * 1.6).toFixed(2),
  delay: (frac(i, 74) * 1.6).toFixed(2),
  spin: frac(i, 75) > 0.5 ? 540 : -540,
  kind: (frac(i, 76) > 0.86 ? RAIN_CHARMS[i % 4] : frac(i, 76) > 0.7 ? RAIN_CHIPS[i % 3] : "coin") as TokenKind,
}));

export function WheelScene({ p, tier, mood }: Props) {
  // A snooze takes the heat out of the room; jackpot runs it at full tilt.
  const hot = clamp(mood === "jackpot" ? 1 : mood === "win" ? p * 0.5 : p);
  // Bankrupt: the house lights drop.
  const lights = mood === "loss" ? 0.18 : 1;
  const beams = BEAMS_AT[mood === "jackpot" ? 5 : tier];
  const tokens = mood === "loss" ? 0 : TOKENS_AT[mood === "jackpot" ? 5 : tier];
  const sparksOut = (0.08 + hot * 0.92) * (mood === "loss" ? 0.2 : 1);
  const payout = mood === "win" || mood === "jackpot";

  const floor = rampN(["#7A3DCC", "#C24FC0", "#FF8A4D"], hot);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Floor glow under the stage: violet when it's quiet, gold-orange at full tilt */}
      <div
        className="absolute inset-x-0 bottom-0 h-[65%]"
        style={{
          background: `radial-gradient(ellipse 70% 60% at 50% 100%, ${cssA(floor, 0.2 + hot * 0.3)} 0%, ${cssA(floor, 0.06 + hot * 0.1)} 50%, transparent 78%)`,
          opacity: lights,
          transition: "background 600ms ease-out, opacity 700ms ease-out",
        }}
      />

      {/* Spotlights sweeping up from the floor */}
      <AnimatePresence>
        {BEAMS.slice(0, beams).map((b, i) => (
          <motion.div
            key={i}
            className="absolute bottom-0 h-[135%] w-[240px] -translate-x-1/2"
            style={{ left: `${b.x}%` }}
            initial={{ opacity: 0 }}
            animate={{ opacity: (0.28 + hot * 0.6) * lights }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div
              className="h-full w-full"
              style={
                {
                  "--from": `${b.from}deg`,
                  "--to": `${b.to}deg`,
                  transform: `rotate(${b.from}deg)`,
                  transformOrigin: "50% 100%",
                  willChange: "transform",
                  animation: `lc-sweep ${b.dur}s ease-in-out ${b.delay}s infinite`,
                  background: `linear-gradient(0deg, rgba(${b.rgb},0.5) 0%, rgba(${b.rgb},0.16) 45%, rgba(${b.rgb},0) 92%)`,
                  clipPath: "polygon(46% 100%, 54% 100%, 100% 0, 0 0)",
                  filter: "blur(6px)",
                  mixBlendMode: "screen",
                } as CSSProperties
              }
            />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Sparkle, more of it the higher the bet */}
      {SPARKS.map((s, i) => (
        <svg
          key={i}
          viewBox="0 0 24 24"
          className="absolute"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.s,
            height: s.s,
            opacity: s.order < sparksOut ? 1 : 0,
            transition: "opacity 400ms",
          }}
        >
          <path
            d={SPARKLE}
            fill={s.color}
            style={{
              transformOrigin: "50% 50%",
              filter: `drop-shadow(0 0 3px ${s.color})`,
              animation: `lc-glint ${s.dur}s ease-in-out ${s.delay}s infinite`,
            }}
          />
        </svg>
      ))}

      {/* Chips and coins drifting at the edges, from "Free spin" up */}
      <AnimatePresence>
        {TOKENS.slice(0, tokens).map((tk, i) => (
          <motion.div
            key={i}
            className={`absolute -translate-1/2 max-sm:scale-[0.6] ${tk.inner ? "max-sm:hidden" : ""}`}
            style={{ left: `${tk.x}%`, top: `${tk.y}%` }}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 0.92, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ type: "spring", stiffness: 160, damping: 18 }}
          >
            <div
              style={
                {
                  "--tilt": `${tk.tilt}deg`,
                  transform: `rotate(${tk.tilt}deg)`,
                  animation: `lc-float-spin ${tk.dur}s ease-in-out ${tk.delay}s infinite`,
                  filter: "drop-shadow(0 8px 10px rgba(10,2,20,0.45))",
                } as CSSProperties
              }
            >
              <TokenArt
                kind={tk.kind}
                size={tk.size}
                flip={`lc-coin-flip ${(tk.dur * 0.7).toFixed(2)}s ease-in-out ${tk.delay}s infinite`}
              />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Payout: a shower of coins on a snooze or a jackpot (twice through, then it settles) */}
      <AnimatePresence>
        {payout && (
          <motion.div
            key="rain"
            className="absolute inset-0"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            {RAIN.map((c, i) => (
              <span
                key={i}
                className="absolute -top-10 block"
                style={
                  {
                    left: `${c.x}%`,
                    "--spin": `${c.spin}deg`,
                    opacity: 0,
                    animation: `lc-coin-fall ${c.dur}s cubic-bezier(0.45, 0, 0.8, 0.6) ${c.delay}s 2 both`,
                  } as CSSProperties
                }
              >
                <TokenArt
                  kind={c.kind}
                  size={c.size}
                  flip={`lc-coin-flip ${(0.5 + (i % 4) * 0.12).toFixed(2)}s linear infinite`}
                />
              </span>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bankrupt: the room goes dark round the edges */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 80% 70% at 50% 45%, transparent 30%, rgba(8,2,14,0.55) 100%)",
          opacity: mood === "loss" ? 1 : 0,
          transition: "opacity 700ms ease-out",
        }}
      />
    </div>
  );
}

/**
 * Prize wheel's counterpart to Classic's sun rays: a game-show sunburst behind the dial. Its
 * wedges turn violet → pink → gold and spin faster the bigger the bet, so dragging the bell
 * winds the wheel up. The rotation is accumulated per frame (not a CSS animation), so changing
 * speed never jumps. Fades out while the alarm is set.
 */
export function WheelBurst({
  p,
  range,
  visible,
  size,
}: {
  p: number;
  range: number;
  visible: boolean;
  /** Diameter of the dial it sits behind, in px. */
  size: number;
}) {
  const burstRef = useRef<HTMLDivElement>(null);
  const speed = useRef(0);
  speed.current = 5 + p * p * 70; // degrees per second

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let angle = 0;
    let last = performance.now();
    let id = requestAnimationFrame(function frame(now) {
      angle = (angle + ((now - last) / 1000) * speed.current) % 360;
      last = now;
      if (burstRef.current) burstRef.current.style.transform = `rotate(${angle.toFixed(2)}deg)`;
      id = requestAnimationFrame(frame);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const core = rampN(["#8C4DFF", "#D94FC8", "#FF9F3D"], p);
  const tone = rampN(["#B48CFF", "#FF7FD0", "#FFC860"], p);
  const allIn = range === MAX_RANGE;
  const mask =
    "radial-gradient(circle closest-side, transparent 50%, #000 57%, rgba(0,0,0,0.45) 80%, transparent 100%)";

  return (
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
          background: `radial-gradient(circle, ${cssA(core, 0.4)} 0%, ${cssA(core, 0.14)} 36%, ${cssA(core, 0)} 62%)`,
          opacity: 0.55 + p * 0.45,
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          opacity: 0.45 + p * 0.55,
          transition: "opacity 300ms",
          animation: allIn ? "lc-pulse 1.2s ease-in-out infinite" : "none",
        }}
      >
        <div
          ref={burstRef}
          className="h-full w-full rounded-full"
          style={{
            background: `repeating-conic-gradient(from 0deg, ${cssA(tone, 0.22)} 0deg 7.5deg, ${cssA(tone, 0.04)} 7.5deg 15deg)`,
            maskImage: mask,
            WebkitMaskImage: mask,
          }}
        />
      </div>
    </div>
  );
}
