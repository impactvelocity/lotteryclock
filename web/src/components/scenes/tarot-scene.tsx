"use client";

import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";
import {
  Bolt,
  Planet,
  SeeingEye,
  Sparkle,
  TA,
  TarotCard,
  TarotCloud,
  TarotMoon,
  TarotSun,
  useTurning,
} from "@/components/scenes/tarot-art";
import {
  MOON_FACES,
  MOON_RAYS,
  SUN_FACES,
  SUN_RAYS,
  WHEEL_BAND,
  WREATH_LEAVES,
  WREATH_RIBBONS,
} from "@/components/scenes/tarot-svg";
import type { SceneMood } from "@/components/scenes/types";
import { frac } from "@/lib/rand";
import { css, cssA, rampN } from "@/lib/themes";

/**
 * Tarot's background: a vintage tarot card that comes to life as the bet climbs the Major Arcana.
 *
 *   0 min     Temperance: a calm mint sky, the sun asleep, a few stars, clouds drifting by
 *   1–11      The Star: stars come out and twinkle
 *   12–23     Wheel of Fortune: planets drift in, the wheel behind the dial turns faster
 *   24–35     The Devil: the horizon and the cloud bank along the bottom warm to coral
 *   36–44     The Tower: lightning strikes either side of the dial
 *   45        The Fool: all of it at once, and the front cards turn over
 *
 * All the way up, the fans of cards in the bottom corners grow and spread. The sun's face follows
 * the tier; the moon's follows the draw. A snooze calms everything down (the sun drifts back to
 * sleep, the moon's blissful, the cards stack up); a late result brings the storm and scatters the
 * cards, reversed; a jackpot crowns the dial with The World's laurel wreath. Purely decorative
 * and pointer-transparent.
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

/** Lightning, per side: a tall bolt and a short one, striking on their own rhythms. */
const BOLTS = [
  { tall: true, left: 1.5, top: 21, dur: 4.2, delay: 0.3 },
  { tall: false, left: 8.5, top: 29, dur: 5.3, delay: 2.1 },
];

export function TarotScene({ p, tier, mood }: Props) {
  // A snooze settles the cards down; a late result brings the whole storm.
  const lively = clamp(mood === "win" ? p * 0.25 : mood === "loss" ? Math.max(p, 0.8) : p);
  const sunFace = mood === "win" ? 0 : mood === "loss" ? 4 : mood === "jackpot" ? 5 : tier;
  const starsOut =
    mood === "win" ? 0.85 : mood === "jackpot" ? 1 : mood === "loss" ? 0.2 : tier === 0 ? 0.14 : 0.3 + p * 0.7;
  const planets = mood === "jackpot" ? PLANETS.length : mood === "win" ? 1 : PLANETS_AT[tier];
  const storm = mood === "loss" || (mood !== "win" && mood !== "jackpot" && tier >= 4);
  const fast = mood === "loss" || tier === 5;
  // The front cards turn over at The Fool, and for every result
  const reading = mood === "win" || mood === "loss" || mood === "jackpot" || tier === 5;
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

      {/* Along the bottom: a bank of clouds, with a fan of tarot cards rising out of it in each
          corner. The back row of clouds sits behind the cards, the front row in front. */}
      <CloudRow row={BANK_BACK} fill={css(rampN(BANK_BACK_FILL, lively))} raise />
      {[0, 1].map((side) => (
        <CardFan
          key={side}
          side={side}
          count={mood === "idle" || mood === "set" ? FAN_AT[tier] : Math.max(3, FAN_AT[tier])}
          spread={mood === "win" ? 2.5 : 6 + p * 10}
          scatter={mood === "loss"}
          flipped={reading}
          reversed={mood === "loss"}
          face={side ? <SunCard face={sunFace} /> : <MoonCard mood={mood} />}
        />
      ))}
      <CloudRow row={BANK_FRONT} fill={css(rampN(BANK_FRONT_FILL, lively))} />
    </div>
  );
}

/**
 * The cloud bank, on % of the hero's width: lower in the middle so it stays under the tier name
 * and the Set Alarm button. `x` is the left edge, `w` the width.
 */
const BANK_FRONT = [
  { x: -6, w: 20, kind: 0 },
  { x: 9, w: 17, kind: 2 },
  { x: 23, w: 15, kind: 1 },
  { x: 36, w: 13, kind: 0 },
  { x: 50, w: 13, kind: 2 },
  { x: 62, w: 15, kind: 1 },
  { x: 74, w: 17, kind: 0 },
  { x: 87, w: 20, kind: 2 },
];
const BANK_BACK = [
  { x: 1, w: 17, kind: 1 },
  { x: 15, w: 14, kind: 0 },
  { x: 71, w: 14, kind: 2 },
  { x: 83, w: 17, kind: 1 },
];
/** Cream at rest, blushing coral as the bet climbs; the back row a shade deeper. */
const BANK_FRONT_FILL = [TA.cream, "#FBEBDF", "#F8DACB", "#F5C7B7"];
const BANK_BACK_FILL = ["#F3E5D3", "#F6D5C5", "#F2BEAD", "#EEA898"];

function CloudRow({ row, fill, raise }: { row: typeof BANK_FRONT; fill: string; raise?: boolean }) {
  return (
    <>
      {row.map((c, i) => (
        <div
          key={i}
          className={`absolute ${raise ? "bottom-[clamp(12px,2.6vw,36px)]" : "bottom-0"}`}
          style={{
            left: `${c.x}%`,
            width: `max(${c.w}%, ${Math.round(c.w * 5.5)}px)`,
            // The art's flat bottom is at 132 of 160: tuck the rest (and the bob) below the edge
            translate: "0 calc(17.5% + 8px)",
          }}
        >
          <div style={{ animation: `lc-bob ${(5 + frac(i, 140 + c.kind) * 3).toFixed(1)}s ease-in-out ${(-i * 1.7).toFixed(1)}s infinite` }}>
            <TarotCloud kind={c.kind} fill={fill} className="block h-auto w-full" />
          </div>
        </div>
      ))}
    </>
  );
}

/** How many cards are in each fan, by tier. */
const FAN_AT = [1, 2, 3, 4, 5, 5];
const FAN_MAX = 5;

/**
 * A fan of tarot cards in a bottom corner, rising out of the clouds: more of them, and fanned
 * wider, as the bet grows. When the cards are read (The Fool, or any result) the front one turns
 * over: upright for a snooze or a jackpot, reversed (upside down) for a late result, when the fan
 * also scatters. A snooze stacks them back up neatly.
 */
function CardFan({
  side,
  count,
  spread,
  scatter,
  flipped,
  reversed,
  face,
}: {
  side: number;
  count: number;
  /** Degrees between cards. */
  spread: number;
  scatter: boolean;
  flipped: boolean;
  reversed: boolean;
  face: ReactNode;
}) {
  const dir = side ? -1 : 1;
  return (
    <div
      // Smaller and nearer the edge on phones, so a full fan stays clear of the tier name
      className={`absolute bottom-[clamp(10px,2.4vw,34px)] w-[clamp(44px,7vw,92px)] max-sm:scale-[0.78] ${side ? "origin-bottom-right" : "origin-bottom-left"}`}
      // Isolated, so the cards' stacking order stays inside the fan (the front clouds stay in front)
      style={{ [side ? "right" : "left"]: "clamp(10px, 9vw - 20px, 110px)", isolation: "isolate" }}
    >
      {/* Sized by an invisible card, so the fan has the card's shape to pivot in */}
      <div className="invisible aspect-[140/240] w-full" />
      {Array.from({ length: FAN_MAX }, (_, i) => {
        const on = i < count;
        const front = i === count - 1;
        const k = i - (count - 1) / 2;
        const rot =
          (on ? k * spread * dir : 0) + (scatter ? (frac(i, 150 + side) - 0.5) * 46 : 0) + dir * 4;
        const dx = scatter ? (frac(i, 160 + side) - 0.5) * 50 : 0;
        return (
          <div
            key={i}
            className="absolute inset-0"
            style={{
              zIndex: i,
              transformOrigin: "50% 130%",
              transform: `translate(${dx.toFixed(1)}px, ${on ? 0 : 60}%) rotate(${rot.toFixed(1)}deg)`,
              opacity: on ? 1 : 0,
              filter: "drop-shadow(3px 4px 0 rgba(23,56,58,0.18))",
              transition:
                "transform 550ms cubic-bezier(0.2, 0.9, 0.3, 1.2), opacity 350ms ease-out",
            }}
          >
            <TarotCard flipped={front && flipped} face={front ? face : undefined} reversed={reversed} />
          </div>
        );
      })}
    </div>
  );
}

/**
 * The moon and the sun, as the faces of the two front cards (on the card's 140 × 240 grid), set
 * high on the card since the clouds cover its foot.
 */
function MoonCard({ mood }: { mood: SceneMood }) {
  const i = Math.max(0, MOON_MOODS.indexOf(mood));
  return (
    <g transform="translate(15 38) scale(0.611)">
      {MOON_RAYS}
      {MOON_FACES[i]}
    </g>
  );
}
function SunCard({ face }: { face: number }) {
  return (
    <g transform="translate(15 38) scale(0.611)">
      {SUN_RAYS}
      {SUN_FACES[Math.max(0, Math.min(SUN_FACES.length - 1, face))]}
    </g>
  );
}
const MOON_MOODS: SceneMood[] = ["idle", "set", "win", "loss", "jackpot"];

/** The fine engraved rays behind the wheel, on its 400-unit grid: long and short in turn. */
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

/**
 * Tarot's counterpart to Classic's sun rays: the Wheel of Fortune turning behind the dial. It
 * rises out from behind the dial and turns faster the bigger the bet, over a burst of engraved
 * rays; at 45 it really spins. Fades out while the alarm is set. On a jackpot, The World's laurel
 * wreath grows in around the clock.
 */
export function FortuneWheel({
  p,
  visible,
  size,
  mood,
}: {
  p: number;
  /** Bet in minutes (passed to every backdrop; the wheel goes by `p`). */
  range?: number;
  visible: boolean;
  /** Diameter of the dial it sits behind, in px. */
  size: number;
  mood?: SceneMood;
}) {
  // Spins up with the bet, to a steady 24°/s all in
  const wheel = useTurning(2 + p * p * 22, 200, 200);
  const rays = useTurning(-(1 + p * 6), 200, 200);
  // The band rises out from behind the dial as the bet grows: its glyphs start half hidden under
  // the dial's edge, and by 45 the whole band is out. Sized from the dial's own radius so it works
  // at any size. The labels sit ~32px off the dial, so at the biggest bets the wheel runs under
  // them (on purpose: it's the climax).
  const unit = (size * 1.9) / 400; // px per wheel unit
  const disc = size * (176 / 358); // the dial's disc radius, px
  const from = (disc + 4) / 156 / unit; // glyph centres (r 156) just past the edge
  const to = (disc * 1.24) / 176 / unit; // the band's outer edge (r 176) a quarter out past the dial
  const scale = from + (to - from) * p;
  // The rays reach a little further out as the bet grows
  const reach = 0.86 + p * 0.14;
  const glow = rampN([TA.gold, TA.coral, "#D2445A"], p);

  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none absolute"
        style={{
          width: size * 1.9,
          height: size * 1.9,
          // Centred with margins, not a transform: a transform would isolate the rays' blend
          // from the sky behind them
          marginLeft: -size * 0.95,
          marginTop: -size * 0.95,
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
        {/* Faint teal engraving. (Not mix-blend-mode: re-blending every frame over the drifting
            clouds made the sky flicker in Chrome.) */}
        <svg viewBox="0 0 400 400" className="absolute inset-0 h-full w-full" style={{ overflow: "visible" }}>
          <g
            style={{
              transformOrigin: "200px 200px",
              transform: `scale(${reach.toFixed(3)})`,
              transition: "transform 300ms ease-out",
            }}
          >
            <g
              ref={rays}
              stroke={TA.teal}
              strokeWidth={1.1}
              strokeLinecap="round"
              opacity={0.1 + p * 0.06}
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
            <g ref={wheel}>{WHEEL_BAND}</g>
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
