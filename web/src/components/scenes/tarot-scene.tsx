"use client";

import { AnimatePresence, motion } from "motion/react";
import {
  Bolt,
  Bones,
  Flame,
  Planet,
  SeeingEye,
  Sparkle,
  TA,
  TarotCloud,
  TarotMoon,
  TarotSun,
  useTurning,
} from "@/components/scenes/tarot-art";
import {
  MOUNTAIN_BACK,
  MOUNTAIN_FRONT,
  MOUNTAIN_HATCHING,
  WHEEL_BAND,
  WHEEL_RIM,
  WREATH_LEAVES,
  WREATH_RIBBONS,
} from "@/components/scenes/tarot-svg";
import type { SceneMood } from "@/components/scenes/types";
import { frac } from "@/lib/rand";
import { css, cssA, MAX_RANGE, rampN } from "@/lib/themes";

/**
 * Tarot's background: a vintage tarot card that comes to life as the bet climbs the Major Arcana.
 *
 *   0 min     Temperance: a calm mint sky, the sun asleep, a few stars, clouds drifting by
 *   1–11      The Star: stars come out and twinkle
 *   12–23     Wheel of Fortune: planets drift in, the wheel behind the dial turns faster
 *   24–35     The Devil: the horizon warms to coral and flames rise at the foot of the mountains
 *   36–44     The Tower: lightning strikes either side of the dial
 *   45        The Fool: all of it at once, and skulls in the corners
 *
 * The sun's face follows the tier; the moon's follows the draw. A snooze calms everything down
 * (the sun drifts back to sleep, the moon's blissful); a late result brings the storm and the
 * bones; a jackpot crowns the dial with The World's laurel wreath. Purely decorative and
 * pointer-transparent.
 */

type Props = {
  /** Bet as a fraction of the maximum, 0..1. */
  p: number;
  /** Bet tier, 0 (no gamble) to 5 (the full 45). */
  tier: number;
  mood: SceneMood;
};

const clamp = (n: number) => Math.max(0, Math.min(1, n));

const STAR_FILLS = [TA.chartreuse, TA.cream, TA.gold, TA.cream];
/**
 * Stars come out in a fixed order (`order`), so the same ones are always first. They keep to the
 * margins either side of the headline and its paragraph: ink-outlined, they'd fight the text.
 */
const STARS = Array.from({ length: 30 }, (_, i) => ({
  x: i % 2 ? 87 + frac(i, 91) * 11.5 : 1.5 + frac(i, 91) * 11.5,
  y: 12 + frac(i, 92) * 46,
  size: Math.round(9 + frac(i, 93) * 10),
  eight: frac(i, 94) > 0.62,
  fill: STAR_FILLS[i % STAR_FILLS.length],
  delay: (frac(i, 95) * 4).toFixed(1),
  dur: (2.4 + frac(i, 96) * 2.6).toFixed(1),
  order: frac(i, 97),
}));

/** Cloud tracks: past the headline, then two that pass behind the picker and the dial. */
const CLOUDS = [
  { top: 15, w: 160, dur: 150, delay: -30, kind: 0 },
  { top: 42, w: 118, dur: 115, delay: -82, kind: 1 },
  { top: 57, w: 200, dur: 185, delay: -140, kind: 2 },
];

/**
 * Planets hang either side of the paragraph and the picker. Phones keep two, smaller, in the
 * strip between the paragraph and the picker (`m`: left / top there, %).
 */
const PLANETS = [
  { left: 6, top: 28, m: [7, 33.4], kind: 0, size: 56, bob: 4.2 },
  { left: 89, top: 30, m: [83, 34], kind: 1, size: 46, bob: 3.6 },
  { left: 16, top: 41, m: null, kind: 2, size: 38, bob: 5 },
  { left: 81, top: 42, m: null, kind: 3, size: 34, bob: 4.6 },
];
const PLANETS_AT = [0, 0, 2, 3, 4, 4];

/** Flames along the foot of the mountains, per side, from the edge in (phones keep the outer two). */
const FLAMES = [
  { left: 3.5, h: 1, kind: 0 },
  { left: 10, h: 0.72, kind: 2 },
  { left: 16, h: 0.86, kind: 1 },
  { left: 22.5, h: 0.62, kind: 2 },
].map((f, i) => ({ ...f, dur: +(1 + frac(i, 98) * 0.7).toFixed(2), delay: +(-frac(i, 99) * 1.5).toFixed(2) }));
const FLAMES_AT = [0, 0, 0, 2, 3, 4];

/** Lightning, per side: a tall bolt and a short one, striking on their own rhythms. */
const BOLTS = [
  { tall: true, left: 1.5, top: 21, dur: 4.2, delay: 0.3 },
  { tall: false, left: 8.5, top: 29, dur: 5.3, delay: 2.1 },
];

/** Colours of the two ridges, ramping with how lively things are. */
const BACK_RIDGE = [TA.blush, "#F3A794", "#EE9886", "#E9897A"];
const FRONT_RIDGE = [TA.coral, "#EC725F", "#E36556", "#D8564F"];

export function TarotScene({ p, tier, mood }: Props) {
  // A snooze settles the cards down; a late result brings the whole storm.
  const lively = clamp(mood === "win" ? p * 0.25 : mood === "loss" ? Math.max(p, 0.8) : p);
  const sunFace = mood === "win" ? 0 : mood === "loss" ? 4 : mood === "jackpot" ? 5 : tier;
  const starsOut =
    mood === "win" ? 0.85 : mood === "jackpot" ? 1 : mood === "loss" ? 0.2 : tier === 0 ? 0.14 : 0.3 + p * 0.7;
  const planets = mood === "jackpot" ? PLANETS.length : mood === "win" ? 1 : PLANETS_AT[tier];
  const flames = mood === "win" || mood === "jackpot" ? 0 : mood === "loss" ? 4 : FLAMES_AT[tier];
  const storm = mood === "loss" || (mood !== "win" && mood !== "jackpot" && tier >= 4);
  const fast = mood === "loss" || tier === 5;
  const bones = mood === "loss" || (mood !== "win" && mood !== "jackpot" && tier === 5);
  const aura = rampN([TA.gold, TA.coral, "#D2445A"], lively);
  const glow = 0.12 + lively * 0.26 + (mood === "loss" ? 0.12 : 0);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Warm light rising off the horizon */}
      <div
        className="absolute inset-x-0 bottom-0 h-[50%]"
        style={{
          background: `radial-gradient(ellipse 80% 75% at 50% 100%, ${cssA(aura, glow)} 0%, ${cssA(aura, glow * 0.35)} 45%, transparent 78%)`,
          transition: "background 600ms ease-out",
        }}
      />

      {/* A flash across the sky as the first bolt strikes */}
      {storm && (
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse 70% 60% at 50% 30%, rgba(255,255,240,0.55), transparent 70%)",
            opacity: 0,
            animation: `lc-sky-flash ${fast ? BOLTS[0].dur * 0.6 : BOLTS[0].dur}s linear ${BOLTS[0].delay}s infinite`,
          }}
        />
      )}

      {/* Stars come out as the bet grows */}
      {STARS.map((s, i) => (
        <span
          key={i}
          className="absolute"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            opacity: s.order < starsOut ? 1 : 0,
            transition: "opacity 500ms",
          }}
        >
          <span
            className="block"
            style={{ animation: `lc-twinkle ${s.dur}s ease-in-out ${s.delay}s infinite` }}
          >
            <Sparkle eight={s.eight} size={s.size} fill={s.fill} />
          </span>
        </span>
      ))}

      {/* Clouds drift across; they clear once the alarm's set, so they never cross the clock */}
      {CLOUDS.map((c, i) => (
        <div
          key={i}
          className="lc-drifter absolute left-0"
          style={{
            top: `${c.top}%`,
            ["--x" as string]: `${(i * 37 + 6) % 85}%`,
            animation: `lc-drift ${c.dur}s linear ${c.delay}s infinite`,
            opacity: mood === "idle" ? 1 : 0,
            transition: "opacity 600ms ease-out",
          }}
        >
          <TarotCloud kind={c.kind} width={c.w} />
        </div>
      ))}

      {/* The moon (top left) watches the draw; the sun (top right) feels the bet */}
      {/* (On phones they tuck in between the header and the headline.) */}
      <TarotMoon
        mood={mood}
        className="absolute top-[66px] left-[2%] h-12 w-12 sm:top-[8%] sm:left-[4%] sm:h-28 sm:w-28"
      />
      <TarotSun
        face={sunFace}
        speed={4 + lively * lively * 40}
        className="absolute top-[66px] right-[2%] h-12 w-12 sm:top-[8%] sm:right-[4%] sm:h-28 sm:w-28"
      />

      {/* Planets, from the Wheel of Fortune up */}
      {PLANETS.map((pl, i) => (
        <div
          key={i}
          className={`absolute top-(--t) left-(--l) max-sm:top-(--mt) max-sm:left-(--ml) origin-top-left max-sm:scale-[0.62] ${pl.m ? "" : "max-sm:hidden"}`}
          style={{
            ["--l" as string]: `${pl.left}%`,
            ["--t" as string]: `${pl.top}%`,
            ["--ml" as string]: `${pl.m?.[0] ?? pl.left}%`,
            ["--mt" as string]: `${pl.m?.[1] ?? pl.top}%`,
            opacity: i < planets ? 1 : 0,
            transform: i < planets ? "scale(1)" : "scale(0.4)",
            transition: "opacity 500ms ease-out, transform 500ms cubic-bezier(0.2, 0.9, 0.3, 1.3)",
          }}
        >
          <div style={{ animation: `lc-bob ${pl.bob}s ease-in-out ${(-i * 1.3).toFixed(1)}s infinite` }}>
            <Planet kind={pl.kind} size={pl.size} />
          </div>
        </div>
      ))}

      {/* Lightning either side of the dial, from The Tower up */}
      {[0, 1].map((side) => (
        <div
          key={side}
          className="absolute inset-0"
          style={{
            transform: side ? "scaleX(-1)" : undefined,
            opacity: storm ? 1 : 0,
            transition: "opacity 400ms",
          }}
        >
          {storm &&
            BOLTS.map((b, i) => (
              <div
                key={i}
                // Phones only have room beside the paragraph for the tall one
                className={`absolute ${b.tall ? "" : "max-sm:hidden"}`}
                style={{
                  left: `${b.left}%`,
                  top: `${b.top}%`,
                  opacity: 0,
                  animation: `lc-strike ${(fast ? b.dur * 0.6 : b.dur).toFixed(2)}s linear ${(b.delay + side * 1.4).toFixed(2)}s infinite`,
                }}
              >
                <Bolt tall={b.tall} className={b.tall ? "w-[clamp(20px,5.5vw,58px)]" : "w-[clamp(24px,4vw,42px)]"} />
              </div>
            ))}
        </div>
      ))}

      {/* Engraved mountains along the horizon, warming with the bet */}
      <Mountains back={css(rampN(BACK_RIDGE, lively))} front={css(rampN(FRONT_RIDGE, lively))} />

      {/* A memento mori in each corner: The Fool, or a late result */}
      {[0, 1].map((side) => (
        <div
          key={side}
          className="absolute bottom-0 w-[clamp(60px,12vw,170px)]"
          style={{
            ...(side ? { right: 0, transform: "scaleX(-1)" } : { left: 0 }),
            opacity: bones ? 1 : 0,
            translate: bones ? "0 0" : "0 30%",
            transition: "opacity 450ms ease-out, translate 450ms cubic-bezier(0.2, 0.9, 0.3, 1.2)",
          }}
        >
          <Bones className="block h-auto w-full" />
        </div>
      ))}

      {/* Flames at the foot of the mountains, from The Devil up */}
      {[0, 1].map((side) =>
        FLAMES.map((f, i) => {
          const on = i < flames;
          return (
            <div
              key={`${side}-${i}`}
              className={`absolute bottom-0 ${i >= 2 ? "max-sm:hidden" : ""}`}
              style={{
                [side ? "right" : "left"]: `${f.left}%`,
                transformOrigin: "50% 100%",
                transform: `scale(${on ? 1 : 0.2})${side ? " scaleX(-1)" : ""}`,
                opacity: on ? 1 : 0,
                transition: "opacity 350ms ease-out, transform 450ms cubic-bezier(0.2, 0.9, 0.3, 1.3)",
              }}
            >
              <Flame
                kind={f.kind}
                dur={f.dur}
                delay={f.delay}
                className="block"
                style={{ height: `calc(clamp(36px, 7.5vw, 96px) * ${f.h * (fast ? 1.15 : 1)})`, width: "auto" }}
              />
            </div>
          );
        }),
      )}
    </div>
  );
}

/** The mountain strip, cropped (not squashed) to the hero's width. */
function Mountains({ back, front }: { back: string; front: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 1600 220"
      preserveAspectRatio="xMidYMax slice"
      className="absolute inset-x-0 bottom-0 h-[max(84px,13.75vw)] w-full"
    >
      <g fill={back} style={{ transition: "fill 600ms" }}>
        {MOUNTAIN_BACK}
      </g>
      <g fill={front} style={{ transition: "fill 600ms" }}>
        {MOUNTAIN_FRONT}
      </g>
      {MOUNTAIN_HATCHING}
    </svg>
  );
}

/**
 * The fine engraved rays behind the wheel, on its 400-unit grid: long and short in turn, with a
 * gap at the bottom (they turn, so the gap is a mask) to keep them out from behind the tier label.
 */
const RAYS = Array.from({ length: 72 }, (_, i) => {
  const a = (i * 5 * Math.PI) / 180;
  const r2 = i % 2 ? 152 : 174;
  const r = (n: number) => Math.round(n * 100) / 100;
  return {
    x1: r(200 + 116 * Math.sin(a)),
    y1: r(200 - 116 * Math.cos(a)),
    x2: r(200 + r2 * Math.sin(a)),
    y2: r(200 - r2 * Math.cos(a)),
  };
});
const RAY_MASK =
  "conic-gradient(from 180deg at 50% 50%, transparent 0deg 32deg, #000 50deg 310deg, transparent 328deg 360deg)";

/** Fades the rays out where the side labels sit, so the labels never read over them. */
const SIDE_MASK = "linear-gradient(90deg, transparent 20%, #000 25%, #000 75%, transparent 80%)";

/**
 * Tarot's counterpart to Classic's sun rays: the Wheel of Fortune turning behind the dial. It
 * rises out from behind the dial and turns faster the bigger the bet, over a burst of engraved
 * rays; at 45 it really spins. Fades out while the alarm is set. On a jackpot, The World's laurel
 * wreath grows in around the clock.
 */
export function FortuneWheel({
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
  // Spins up with the bet; all in, a little faster again.
  const wheel = useTurning(range === MAX_RANGE ? 50 : 2 + p * p * 34, 200, 200);
  const rays = useTurning(-(1 + p * 8), 200, 200);
  // The band rises out from behind the dial as the bet grows: its glyphs start half hidden under
  // the dial's edge, and by 45 the whole band is out with its gold rim round it. Sized from the
  // dial's own radius so it works at any size. The labels sit ~32px off the dial, so at the
  // biggest bets the wheel runs under them (on purpose: it's the climax); the rim only fades in
  // from ~15 min, so at small bets they stay clear.
  const unit = (size * 1.9) / 400; // px per wheel unit
  const disc = size * (176 / 358); // the dial's disc radius, px
  const from = (disc + 4) / 156 / unit; // glyph centres (r 156) just past the edge
  const to = (disc * 1.24) / 176 / unit; // the band's outer edge (r 176) a quarter out past the dial
  const scale = from + (to - from) * p;
  const rim = clamp((p - 0.3) / 0.5);
  // The rays reach further out as the bet grows
  const reach = 0.86 + p * 0.29;
  const glow = rampN([TA.gold, TA.coral, "#D2445A"], p);

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
            background: `radial-gradient(circle, ${cssA(glow, 0.32)} 0%, ${cssA(glow, 0.12)} 36%, ${cssA(glow, 0)} 60%)`,
            opacity: 0.4 + p * 0.6,
          }}
        />
        <svg
          viewBox="0 0 400 400"
          className="absolute inset-0 h-full w-full"
          style={{
            maskImage: `${SIDE_MASK}, ${RAY_MASK}`,
            WebkitMaskImage: `${SIDE_MASK}, ${RAY_MASK}`,
            maskComposite: "intersect",
            WebkitMaskComposite: "source-in",
          }}
        >
          <g
            style={{
              transformOrigin: "200px 200px",
              transform: `scale(${reach.toFixed(3)})`,
              transition: "transform 300ms ease-out",
            }}
          >
            <g
              ref={rays}
              stroke={TA.ink}
              strokeWidth={1.1}
              strokeLinecap="round"
              opacity={0.18 + p * 0.27}
              style={{ transition: "opacity 300ms" }}
            >
              {RAYS.map((r, i) => (
                <line key={i} {...r} />
              ))}
            </g>
          </g>
        </svg>
        <svg viewBox="0 0 400 400" className="absolute inset-0 h-full w-full" style={{ overflow: "visible" }}>
          <g
            style={{
              transformOrigin: "200px 200px",
              transform: `scale(${scale.toFixed(3)})`,
              transition: "transform 300ms ease-out",
            }}
          >
            <g ref={wheel}>
              <g opacity={rim} style={{ transition: "opacity 300ms" }}>
                {WHEEL_RIM}
              </g>
              {WHEEL_BAND}
            </g>
          </g>
        </svg>
      </div>

      {/* The World: a laurel wreath round the clock on a jackpot */}
      <AnimatePresence>
        {mood === "jackpot" && (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -translate-1/2"
            // Frames the result (clock, verdict, Roll again), centred a little above the dial's centre
            style={{ width: size * 1.22, height: size * 1.22, top: -size * 0.15 }}
            initial={{ opacity: 0, scale: 0.7, rotate: -25 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.25 } }}
            transition={{ type: "spring", stiffness: 160, damping: 14, delay: 0.15 }}
          >
            <svg viewBox="0 0 400 400" className="h-full w-full" style={{ overflow: "visible" }}>
              {WREATH_LEAVES.map((leaves, i) => (
                <g key={i}>{leaves}</g>
              ))}
              {WREATH_RIBBONS.map((ribbon, i) => (
                <g
                  key={i}
                  style={{
                    transformBox: "fill-box",
                    transformOrigin: "center",
                    animation: `lc-icon-pop 0.5s cubic-bezier(0.2, 0.9, 0.3, 1.2) ${0.45 + i * 0.12}s both`,
                  }}
                >
                  {ribbon}
                </g>
              ))}
            </svg>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/** Shown above the progress bar while the draw rolls: the all-seeing eye reads the cards. */
export function TarotRoll() {
  return (
    <div className="mb-3">
      <SeeingEye width={64} />
    </div>
  );
}
