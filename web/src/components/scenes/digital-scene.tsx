"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef, type CSSProperties } from "react";
import {
  HORIZON_SIZE,
  HorizonTile,
  PixelSunset,
  PixelWord,
  PowerUp,
  PX,
  type PowerUpKind,
} from "@/components/scenes/digital-art";
import type { SceneMood } from "@/components/scenes/types";
import { frac } from "@/lib/rand";
import { css, cssA, MAX_RANGE, ramp, rampN, rgbOf } from "@/lib/themes";

/**
 * Digital's background: an 8-bit arcade screen that gets more unstable as the bet grows.
 *
 *   0 min     insert coin: a quiet starfield, the grid floor barely crawling
 *   1–11      easy mode: the grid starts to roll, the first power-ups float in
 *   12–23     level up: more stars and power-ups, the grid speeds up
 *   24–35     hard mode: the screen warms towards magenta, the first glitches
 *   36–44     boss fight: glitches tear across the screen, the grid races
 *   45        final boss: everything at full tilt, and the screen jolts
 *
 * While the draw rolls the stars streak past at warp speed. A snooze is an extra life (hearts and
 * 1UPs float up); a late result is game over (the picture collapses like a switched-off CRT and
 * everything drops); on the dot is a high score (a striped sun rises over the hills, PERFECT!s
 * float up through pixel confetti, the grid cycles colours).
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

/** Where the grid floor starts, as a fraction of the hero's height. */
const HORIZON = 0.66;

/** Pixel stars, above the horizon. Each comes out at its `order` of the bet, so the same ones are always first. */
const STAR_COLORS = [PX.white, PX.white, PX.cyan, PX.pinkLight, PX.yellow];
const STARS = Array.from({ length: 72 }, (_, i) => ({
  x: frac(i, 81) * 100,
  y: 2 + frac(i, 82) * (HORIZON * 100 - 8),
  s: [2, 2, 3, 3, 4][Math.floor(frac(i, 83) * 5)],
  color: STAR_COLORS[Math.floor(frac(i, 84) * STAR_COLORS.length)],
  dur: (1.2 + frac(i, 85) * 2.6).toFixed(2),
  delay: (-frac(i, 86) * 3).toFixed(2),
  order: frac(i, 87),
}));

/** Warp streaks, fanning out from the middle of the screen during the draw. */
const WARP = Array.from({ length: 44 }, (_, i) => ({
  angle: Math.round(frac(i, 91) * 360),
  dur: (0.5 + frac(i, 92) * 0.6).toFixed(2),
  delay: (-frac(i, 93) * 1.1).toFixed(2),
  len: Math.round(40 + frac(i, 94) * 90),
  color: [PX.white, PX.cyan, PX.lime, PX.pinkLight][i % 4],
}));

/** Glitch bars: thin slices of the screen that tear sideways, more of them as the bet climbs. */
const GLITCHES = Array.from({ length: 9 }, (_, i) => ({
  y: 6 + frac(i, 101) * 84,
  h: 2 + Math.round(frac(i, 102) * 7),
  dur: (1.6 + frac(i, 103) * 2.4).toFixed(2),
  delay: (-frac(i, 104) * 3).toFixed(2),
  color: i % 2 ? PX.cyan : PX.magenta,
}));
/** How many glitch bars each tier shows. */
const GLITCHES_AT = [0, 0, 0, 2, 5, 9];

type Token = { x: number; y: number; size: number; kind: PowerUpKind; dur: number; delay: number; inner?: boolean };

/** Power-ups at the edges, in the order they come out (clear of the middle column). */
const TOKENS: Token[] = [
  { x: 6, y: 34, size: 34, kind: "coin", dur: 2.4, delay: -0.4 },
  { x: 93, y: 28, size: 38, kind: "heart", dur: 2.8, delay: -1.6 },
  { x: 4, y: 62, size: 36, kind: "star", dur: 3.2, delay: -1 },
  { x: 95, y: 58, size: 26, kind: "bolt", dur: 2.6, delay: -2 },
  { x: 16, y: 20, size: 30, kind: "gem", dur: 3, delay: -0.8, inner: true },
  { x: 84, y: 76, size: 30, kind: "potion", dur: 2.2, delay: -1.3, inner: true },
  { x: 3, y: 84, size: 32, kind: "key", dur: 2.9, delay: -2.4 },
  { x: 90, y: 14, size: 32, kind: "clock", dur: 3.4, delay: -0.2 },
  { x: 18, y: 76, size: 26, kind: "heart", dur: 2.5, delay: -1.8, inner: true },
  { x: 82, y: 44, size: 28, kind: "gem", dur: 2.7, delay: -2.2, inner: true },
  { x: 12, y: 48, size: 26, kind: "coin", dur: 2.3, delay: -1.1, inner: true },
  { x: 96, y: 88, size: 34, kind: "star", dur: 3.1, delay: -2.8 },
];
const TOKENS_AT = [0, 2, 4, 6, 9, 12];

/** Extra life: hearts and 1UPs rising from the bottom of the screen. */
const RISERS = Array.from({ length: 16 }, (_, i) => ({
  x: 4 + frac(i, 111) * 92,
  delay: (frac(i, 112) * 1.8).toFixed(2),
  dur: (2.2 + frac(i, 113) * 1.4).toFixed(2),
  kind: i % 3 === 0 ? ("1up" as const) : i % 3 === 1 ? ("heart" as const) : ("coin" as const),
  size: Math.round(20 + frac(i, 114) * 14),
}));

/** High score: PERFECT!s floating up through the confetti. */
const PERFECTS = [4, 20, 36, 52, 68, 84].map((x, i) => ({
  // Spread across the screen, each nudged a little, so no two words overlap
  x: x + frac(i, 141) * 4,
  delay: (0.3 + frac(i, 142) * 1.6).toFixed(2),
  dur: (2.6 + frac(i, 143) * 1.2).toFixed(2),
}));

/** High score: pixel confetti tumbling down in quarter turns. */
const CONFETTI_COLORS = [PX.lime, PX.yellow, PX.cyan, PX.magenta, PX.red, PX.white];
const CONFETTI = Array.from({ length: 48 }, (_, i) => ({
  x: frac(i, 121) * 100,
  s: 5 + Math.round(frac(i, 122) * 6),
  dur: (2 + frac(i, 123) * 1.6).toFixed(2),
  delay: (frac(i, 124) * 1.6).toFixed(2),
  spin: frac(i, 125) > 0.5 ? 720 : -720,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
}));

/** Horizon tiles, side by side and centred, so the low middle of the middle one sits behind the text. */
const HORIZON_TILES = [0, 1, 2, 3, 4];

const GRID_MASK =
  "linear-gradient(to bottom, transparent 0%, #000 45%), radial-gradient(ellipse 26% 42% at 50% 78%, transparent 35%, #000 100%)";

export function DigitalScene({ p, tier, mood }: Props) {
  const won = mood === "win" || mood === "jackpot";
  const over = mood === "loss";
  const warp = mood === "set";
  // A snooze lights the screen up; a jackpot runs it at full tilt.
  const hot = clamp(mood === "jackpot" ? 1 : mood === "win" ? 0.7 : p);
  const starsOut = over ? 0.15 : warp ? 0.35 : 0.25 + hot * 0.75;
  const tokens = TOKENS_AT[mood === "jackpot" ? 5 : tier];
  const glitches = over ? 0 : GLITCHES_AT[mood === "jackpot" ? 3 : tier];

  // The grid: phosphor green → cyan → magenta with the bet; cyan for an extra life, red at game over.
  const gridRGB =
    mood === "win" ? rgbOf(PX.cyan) : over ? rgbOf(PX.red) : rampN(["#3DFF7E", "#3DE0FF", "#FF3DCB"], p);
  const grid = css(gridRGB);

  // Grid speed in px a second: crawling at rest, racing at the full 45, frozen at game over.
  const speed = over ? 0 : warp ? 420 : mood === "jackpot" ? 200 : mood === "win" ? 90 : 14 + p * p * 160;
  const planeRef = useRef<HTMLDivElement>(null);
  const speedRef = useRef(speed);
  speedRef.current = speed;
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let y = 0;
    let last = performance.now();
    let id = requestAnimationFrame(function frame(now) {
      y = (y + ((now - last) / 1000) * speedRef.current) % 48;
      last = now;
      if (planeRef.current) planeRef.current.style.backgroundPosition = `0 ${y.toFixed(1)}px`;
      id = requestAnimationFrame(frame);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const lines = cssA(gridRGB, 0.55);
  const gridBg = `linear-gradient(to right, ${lines} 0 2px, transparent 2px), linear-gradient(to bottom, ${lines} 0 2px, transparent 2px)`;

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      // Final boss: every few seconds the whole screen jolts
      style={{ animation: tier === 5 && mood === "idle" ? "lc-px-jolt 3.2s steps(1) infinite" : "none" }}
    >
      {/* Pixel starfield */}
      {STARS.map((s, i) => (
        <span
          key={i}
          className="absolute block"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.s,
            height: s.s,
            background: s.color,
            boxShadow: s.s > 2 ? `0 0 6px ${s.color}` : "none",
            opacity: s.order < starsOut ? 1 : 0,
            transition: "opacity 400ms",
            animation: `lc-px-twinkle ${s.dur}s steps(1) ${s.delay}s infinite`,
          }}
        />
      ))}

      {/* Warp speed while the draw rolls: streaks fanning out from the middle */}
      <AnimatePresence>
        {warp && (
          <motion.div
            key="warp"
            className="absolute top-[42%] left-1/2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
            transition={{ duration: 0.4 }}
          >
            {WARP.map((w, i) => (
              <span
                key={i}
                className="absolute top-0 left-0 block h-[2px]"
                style={
                  {
                    width: w.len,
                    background: `linear-gradient(to right, transparent, ${w.color})`,
                    transformOrigin: "0 50%",
                    "--a": `${w.angle}deg`,
                    opacity: 0,
                    animation: `lc-warp ${w.dur}s linear ${w.delay}s infinite`,
                  } as CSSProperties
                }
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* The horizon: a glow, pixel hills and buildings, and the grid floor rolling towards you */}
      <div className="absolute inset-x-0 bottom-0" style={{ top: `${HORIZON * 100}%` }}>
        <div
          className="absolute inset-x-0 -top-24 h-48"
          style={{
            background: `radial-gradient(ellipse 60% 50% at 50% 50%, ${cssA(gridRGB, 0.16 + hot * 0.16)} 0%, transparent 70%)`,
            transition: "background 500ms",
          }}
        />
        {/* High score: a striped sun rises from behind the hills. Off to the right, where the screen
            is clear: centred, it would sit behind the clock's digits and the theme picker. */}
        <AnimatePresence>
          {mood === "jackpot" && (
            <motion.div
              key="sun"
              className="absolute bottom-full left-[80%] aspect-[48/34] w-[min(190px,34vw)] -translate-x-1/2"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.4 } }}
            >
              <div
                className="absolute -inset-1/2"
                style={{ background: "radial-gradient(circle at 50% 70%, rgba(255,61,203,0.35) 0%, rgba(255,225,53,0.12) 35%, transparent 62%)", animation: "lc-fade-in 1.2s ease-out 0.4s both" }}
              />
              <div className="absolute inset-0 overflow-hidden">
                <motion.div
                  className="absolute inset-x-0 top-0"
                  initial={{ y: "100%" }}
                  animate={{ y: "0%" }}
                  transition={{ duration: 1.6, delay: 0.3, ease: [0.2, 0.7, 0.3, 1] }}
                >
                  <PixelSunset className="block h-auto w-full" />
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="absolute inset-x-0 bottom-full flex h-[48px] justify-center overflow-hidden sm:h-[72px]">
          {HORIZON_TILES.map((i) => (
            <HorizonTile
              key={i}
              edge={grid}
              className="h-full w-auto shrink-0"
              style={{ aspectRatio: `${HORIZON_SIZE.w} / ${HORIZON_SIZE.h}` }}
            />
          ))}
        </div>
        <div className="absolute inset-x-0 top-0 h-[2px]" style={{ background: grid, boxShadow: `0 0 12px ${grid}`, opacity: 0.8 }} />
        <div
          className="absolute inset-0 overflow-hidden"
          style={{
            perspective: 240,
            perspectiveOrigin: "50% 0%",
            // Fades in from the horizon, and clears round the bottom middle so the tier name and
            // the result read cleanly over it
            maskImage: GRID_MASK,
            WebkitMaskImage: GRID_MASK,
            maskComposite: "intersect",
            WebkitMaskComposite: "source-in",
          }}
        >
          <div
            ref={planeRef}
            className="absolute top-0 -left-1/2 h-[220%] w-[200%]"
            style={{
              transform: "rotateX(64deg)",
              transformOrigin: "50% 0%",
              backgroundImage: gridBg,
              backgroundSize: "48px 48px",
              opacity: over ? 0.45 : 0.55 + hot * 0.35,
              transition: "opacity 500ms",
              // High score: the grid cycles through every colour
              animation: mood === "jackpot" ? "lc-hue 1.6s linear infinite" : "none",
            }}
          />
        </div>
      </div>

      {/* Power-ups floating at the edges, from "Easy mode" up */}
      <AnimatePresence>
        {TOKENS.slice(0, tokens).map((tk, i) => (
          <motion.div
            key={i}
            className={`absolute -translate-1/2 max-sm:scale-[0.65] ${tk.inner ? "max-sm:hidden" : ""}`}
            style={{ left: `${tk.x}%`, top: `${tk.y}%` }}
            initial={{ opacity: 0, y: 20 }}
            animate={
              over
                ? // Game over: each one drops off the bottom of the screen
                  {
                    opacity: 1,
                    y: 1400,
                    transition: { duration: 1.1, ease: [0.5, 0, 0.9, 0.5], delay: 0.5 + (i % 5) * 0.08 },
                  }
                : { opacity: 0.95, y: 0 }
            }
            exit={{ opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 180, damping: 18 }}
          >
            <div
              style={{
                animation: `lc-px-bob ${won ? (tk.dur * 0.35).toFixed(2) : tk.dur}s steps(3, jump-none) ${tk.delay}s infinite`,
                filter: `drop-shadow(0 0 8px ${cssA(gridRGB, 0.35)})`,
              }}
            >
              <PowerUp
                kind={tk.kind}
                size={tk.size}
                style={tk.kind === "coin" ? { animation: `lc-coin-flip ${(tk.dur * 0.6).toFixed(2)}s steps(4) ${tk.delay}s infinite` } : undefined}
              />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Glitches tearing across the screen as the bet climbs */}
      {GLITCHES.slice(0, glitches).map((g, i) => (
        <span
          key={i}
          className="absolute inset-x-0 block"
          style={{
            top: `${g.y}%`,
            height: g.h,
            background: `linear-gradient(to right, transparent, ${cssA(rgbOf(g.color), 0.5)} 20%, ${cssA(rgbOf(g.color), 0.35)} 80%, transparent)`,
            mixBlendMode: "screen",
            opacity: 0,
            animation: `lc-glitch-bar ${g.dur}s steps(1) ${g.delay}s infinite`,
          }}
        />
      ))}

      {/* Extra life: hearts, coins and 1UPs floating up (twice through, then it settles) */}
      <AnimatePresence>
        {mood === "win" && (
          <motion.div key="rise" className="absolute inset-0" exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
            {RISERS.map((r, i) => (
              <span
                key={i}
                className="absolute bottom-0 block"
                style={{
                  left: `${r.x}%`,
                  opacity: 0,
                  animation: `lc-px-rise ${r.dur}s steps(18) ${r.delay}s 2 both`,
                }}
              >
                {r.kind === "1up" ? (
                  <PixelWord word="oneUp" height={18} className="block" style={{ filter: `drop-shadow(0 0 6px ${PX.lime})` }} />
                ) : (
                  <PowerUp kind={r.kind} size={r.size} />
                )}
              </span>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* High score: pixel confetti */}
      <AnimatePresence>
        {mood === "jackpot" && (
          <motion.div key="confetti" className="absolute inset-0" exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
            {CONFETTI.map((c, i) => (
              <span
                key={i}
                className="absolute -top-4 block"
                style={
                  {
                    left: `${c.x}%`,
                    width: c.s,
                    height: c.s,
                    background: c.color,
                    "--spin": `${c.spin}deg`,
                    opacity: 0,
                    animation: `lc-coin-fall ${c.dur}s steps(24) ${c.delay}s 2 both`,
                  } as CSSProperties
                }
              />
            ))}
            {PERFECTS.map((w, i) => (
              <span
                key={`w${i}`}
                className="absolute bottom-0 block max-sm:scale-75"
                style={{ left: `${w.x}%`, opacity: 0, animation: `lc-px-rise ${w.dur}s steps(18) ${w.delay}s 2 both` }}
              >
                <PixelWord word="perfect" height={20} className="block" style={{ filter: `drop-shadow(0 0 6px ${PX.yellow})` }} />
              </span>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* CRT scanlines over everything, and a faint refresh band rolling down */}
      <div
        className="absolute inset-0"
        style={{
          background: "repeating-linear-gradient(to bottom, rgba(0,0,0,0.22) 0 1px, transparent 1px 4px)",
          opacity: over ? 0.9 : 0.55,
          transition: "opacity 600ms",
        }}
      />
      <div
        className="absolute inset-x-0 -top-40 h-40"
        style={{
          background: `linear-gradient(to bottom, transparent, ${cssA(gridRGB, 0.05)}, transparent)`,
          animation: "lc-scanroll 7s linear infinite",
        }}
      />
      {/* The tube's dark corners */}
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse 90% 80% at 50% 45%, transparent 55%, rgba(0,0,0,0.45) 100%)" }}
      />

      {/* Game over: the picture collapses to a line, then a dot, like a switched-off CRT; the screen goes dim and red */}
      <AnimatePresence>
        {over && (
          <motion.div key="over" className="absolute inset-0" initial={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.3 } }}>
            <div
              className="absolute inset-0"
              style={{ background: "radial-gradient(ellipse 80% 70% at 50% 45%, rgba(60,0,16,0.25) 30%, rgba(14,2,6,0.7) 100%)", animation: "lc-fade-in 0.8s ease-out 0.35s both" }}
            />
            <div
              className="absolute inset-x-0 top-[45%] h-[3px]"
              style={{ background: PX.white, boxShadow: `0 0 18px ${PX.white}, 0 0 40px ${PX.cyan}`, opacity: 0, animation: "lc-crt-off 0.9s ease-in both" }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Digital's counterpart to Classic's sun rays: pixelated rings round the dial (whole cells of a
 * square grid, so they read as low-res circles). More rings light up as the bet grows, each in
 * the arc colour for its distance, and a ripple runs outward through them, faster the bigger the
 * bet. Fades out while the alarm is set.
 */
export function PixelHalo({
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
  const box = Math.round(size * 1.9);
  const cell = Math.max(8, Math.round(size / 34));
  const RINGS = 5;
  const rings = useMemo(() => {
    const half = box / 2;
    const out: { k: number; cells: [number, number][] }[] = Array.from({ length: RINGS }, (_, k) => ({ k, cells: [] }));
    const radii = Array.from({ length: RINGS }, (_, k) => size * (0.585 + k * 0.085));
    const n = Math.floor(box / cell);
    const off = (box - n * cell) / 2;
    for (let gy = 0; gy < n; gy++) {
      for (let gx = 0; gx < n; gx++) {
        const cx = off + gx * cell + cell / 2 - half;
        const cy = off + gy * cell + cell / 2 - half;
        const d = Math.hypot(cx, cy);
        radii.forEach((r, k) => {
          if (Math.abs(d - r) < cell * 0.5) out[k].cells.push([off + gx * cell, off + gy * cell]);
        });
      }
    }
    return out;
  }, [box, cell, size]);

  // The first ring is always faintly there; the rest come on with the bet
  const lit = range === 0 ? 1 : 1 + Math.ceil(p * (RINGS - 1));
  const pulse = (1.8 - p * 1.1).toFixed(2);
  const allIn = range === MAX_RANGE;
  const glow = rampN(["#3DFF7E", "#3DE0FF", "#FF3DCB"], p);

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute -translate-1/2"
      style={{ width: box, height: box, opacity: visible ? 1 : 0, transition: "opacity 400ms ease-out" }}
    >
      <div
        className="absolute inset-0 rounded-full"
        style={{ background: `radial-gradient(circle, ${cssA(glow, 0.22)} 0%, ${cssA(glow, 0.08)} 34%, transparent 60%)`, opacity: 0.5 + p * 0.5 }}
      />
      <svg viewBox={`0 0 ${box} ${box}`} className="absolute inset-0 h-full w-full" shapeRendering="crispEdges">
        {rings.map(({ k, cells }) => {
          const on = k < lit;
          const color = css(ramp(["#3DFF7E", "#FFE135", "#FF3D8B"], (k / (RINGS - 1)) * Math.max(p, 0.15)));
          return (
            <g
              key={k}
              fill={color}
              style={{
                // Fainter the further out, so the outer rings fade into the screen
                opacity: on ? 0.46 - k * 0.07 : 0,
                transition: "opacity 300ms, fill 300ms",
                animation: on && range > 0 ? `lc-px-ripple ${pulse}s steps(1) ${(k * Number(pulse)) / (RINGS + 1)}s infinite` : "none",
              }}
            >
              {cells.map(([x, y], i) => (
                // Every seventh cell is a brighter pixel, so the ring sparkles a little
                <rect key={i} x={x + 1} y={y + 1} width={cell - 2} height={cell - 2} opacity={i % 7 === 0 ? 1 : 0.5} />
              ))}
            </g>
          );
        })}
      </svg>
      {allIn && (
        <div className="absolute inset-0 rounded-full" style={{ boxShadow: `inset 0 0 60px ${cssA(glow, 0.25)}`, animation: "lc-pulse 0.9s ease-in-out infinite" }} />
      )}
    </div>
  );
}
