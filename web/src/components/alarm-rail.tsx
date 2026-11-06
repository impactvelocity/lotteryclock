"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useId, useState } from "react";
import type { RevealPhase } from "@/components/alarm-reveal";
import { Confetti } from "@/components/confetti";
import { contrast, css, edgeColor, isDark, MAX_RANGE, mixHex, ramp, type Theme } from "@/lib/themes";

type Phase = "idle" | RevealPhase;

type Props = {
  theme: Theme;
  phase: Phase;
  range: number;
  /** Drawn offset in minutes; negative is early. */
  offset: number;
  rollId: number;
  /** e.g. "7:23 AM": when it actually rang, shown under the pin. */
  rangLabel: string;
  onPress: () => void;
};

/**
 * The hero's bottom edge as a timeline: the Set alarm button marks the target
 * time, ticks run out a minute at a time on each side, and the ones inside the
 * bet light up. After a draw, a pin drops where the alarm really rang.
 */
export function AlarmRail({ theme: t, phase, range, offset, rollId, rangLabel, onPress }: Props) {
  const pinSide = phase === "result" && offset !== 0 ? (offset < 0 ? "left" : "right") : null;

  const half = (side: "left" | "right") => (
    <Ticks
      side={side}
      theme={t}
      range={range}
      wave={phase !== "idle"}
      rollId={rollId}
      pin={
        pinSide === side ? (
          <Pin
            key={`pin-${rollId}`}
            minute={Math.abs(offset)}
            side={side}
            // Centre matches the hero background, so it reads as a hole in the rail ring
            color={edgeColor(t, range / MAX_RANGE)}
            rail={t.rail}
            label={`Rang ${rangLabel}`}
          />
        ) : null
      }
    />
  );

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-0">
      <div
        aria-hidden
        className="absolute inset-x-0 -top-0.5 h-1"
        style={{ background: t.rail, transition: "background 300ms" }}
      />
      {/* Full hero width: ticks run edge to edge */}
      <div className="absolute inset-x-0 top-0 flex h-20 -translate-y-1/2 items-center">
        {half("left")}
        {/* Drawn over the ticks, which start from underneath it */}
        <div className="pointer-events-auto relative z-10 shrink-0">
          <PushButton theme={t} phase={phase} range={range} onPress={onPress} />
          {/* Snooze or jackpot: confetti bursts up from just above the Reset Alarm button */}
          {phase === "result" && offset <= 0 && (
            <Confetti
              key={`confetti-${rollId}`}
              burstId={rollId}
              origin="-top-2 left-1/2"
              colors={[t.win, t.arcStops[0], t.arcStops[1], t.arcStops[2], t.button.face]}
            />
          )}
        </div>
        {half("right")}
      </div>
    </div>
  );
}

function Ticks({
  side,
  theme: t,
  range,
  wave,
  rollId,
  pin,
}: {
  side: "left" | "right";
  theme: Theme;
  range: number;
  wave: boolean;
  rollId: number;
  pin: React.ReactNode;
}) {
  const maskId = `lc-fade-${useId().replace(/:/g, "")}`;
  // Lit ticks grow to this multiple of their height; the SVG is tall enough for the tallest.
  const litScale = t.railTicks?.lit ?? 2;
  const tickH = Math.ceil(BASE_LONG * litScale) + 2;
  const tip = t.railTicks?.tip ?? 0.15;
  const tailColor = `color-mix(in srgb, ${t.rail} 28%, transparent)`;
  return (
    <div
      // --tail: outer strip past 45 min (10% of the screen each side, so 45 min spans ~80%).
      // Phones have no room for it, so the minutes use the full width there.
      className={`relative h-full min-w-0 flex-1 [--tail:0px] sm:[--tail:10vw] ${side === "left" ? "-mr-2" : "-ml-2"}`}
    >
      {/* Past the 45-minute mark: the same tick rhythm, shrinking and fading to the screen edge.
          The container (for cqw) lives on this inner layer, not the half itself: a container makes
          a stacking context, which would trap the pin underneath the button. */}
      <div className="pointer-events-none absolute inset-0" style={{ containerType: "inline-size" }}>
        <div
          aria-hidden
          className="absolute bottom-1/2 mb-0.5 max-sm:hidden"
          style={
            {
              [side === "right" ? "right" : "left"]: 0,
              width: "var(--tail)",
              height: BASE_LONG,
              "--step": `calc((100cqw - var(--tail) - ${ZERO_GAP}px) / ${MAX_RANGE})`,
              backgroundImage: `linear-gradient(90deg, ${tailColor} 0 1.5px, transparent 1.5px), linear-gradient(90deg, ${tailColor} 0 2.5px, transparent 2.5px)`,
              backgroundSize: `var(--step) ${BASE_SHORT}px, calc(var(--step) * 5) ${BASE_LONG}px`,
              backgroundPosition:
                "calc(var(--step) / 2 - 0.75px) 100%, calc(var(--step) * 4.5 - 1.25px) 100%",
              backgroundRepeat: "repeat-x",
              // Taper the heights down towards the edge, and fade them out
              clipPath: "polygon(0 0, 100% 75%, 100% 100%, 0 100%)",
              maskImage: "linear-gradient(90deg, #000 20%, transparent)",
              WebkitMaskImage: "linear-gradient(90deg, #000 20%, transparent)",
              transform: side === "left" ? "scaleX(-1)" : undefined,
            } as React.CSSProperties
          }
        />
      </div>
      {/* The 45 minutes themselves */}
      <div
        className="absolute inset-y-0"
        // Starts ZERO_GAP out from the button, so minute 1 (and its pin) clear the housing
        style={
          side === "right"
            ? { left: ZERO_GAP, right: "var(--tail)" }
            : { left: "var(--tail)", right: ZERO_GAP }
        }
      >
        <svg
          aria-hidden
          viewBox={`0 0 ${MAX_RANGE * 10} ${tickH}`}
          preserveAspectRatio="none"
          className="absolute inset-x-0 bottom-1/2 mb-0.5 w-full overflow-visible"
          style={{ height: tickH }}
        >
          {/* Bars fade out towards their tops */}
          <defs>
            <linearGradient id={`${maskId}-g`} x1="0" y1="1" x2="0" y2="0">
              <stop offset="0" stopColor="#fff" stopOpacity="1" />
              <stop offset="0.45" stopColor="#fff" stopOpacity="0.85" />
              <stop offset="1" stopColor="#fff" stopOpacity={tip} />
            </linearGradient>
            <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y={-tickH} width={MAX_RANGE * 10} height={tickH * 2}>
              <rect x="0" y={-tickH} width={MAX_RANGE * 10} height={tickH * 2} fill={`url(#${maskId}-g)`} />
            </mask>
          </defs>
          {/* Re-keyed per draw so the wave replays */}
          <g key={rollId} mask={`url(#${maskId})`}>
            {Array.from({ length: MAX_RANGE }, (_, k) => k + 1).map((m) => {
              const x = side === "right" ? (m - 0.5) * 10 : (MAX_RANGE - m + 0.5) * 10;
              const long = m % 5 === 0;
              const lit = m <= range;
              // Lit bars grow to litScale × their height, stepping down over the last few minutes
              // of the window so its edge reads as a soft slope.
              const taper = lit ? Math.min(1, (range - m + 1) / 4) : 0;
              // Ticks also rise out of the button: shorter for the first few minutes.
              const rise = Math.min(1, 0.45 + (0.55 * (m - 1)) / 4);
              const scale = (1 + (litScale - 1) * taper) * rise;
              return (
                <line
                  key={m}
                  x1={x}
                  x2={x}
                  y1={tickH}
                  y2={tickH - (long ? BASE_LONG : BASE_SHORT)}
                  vectorEffect="non-scaling-stroke"
                  strokeLinecap="round"
                  strokeWidth={long ? 2.5 : 1.5}
                  stroke={lit ? css(ramp(t.railTicks?.ink ?? t.arcStops, m / MAX_RANGE)) : t.rail}
                  strokeOpacity={lit ? 1 : 0.28}
                  className={long ? undefined : "max-sm:hidden"}
                  style={
                    {
                      "--k": scale,
                      transform: `scaleY(${scale})`,
                      transition:
                        "transform 220ms cubic-bezier(0.2, 0.9, 0.3, 1.2), stroke 150ms, stroke-opacity 150ms",
                      transformBox: "fill-box",
                      transformOrigin: "50% 100%",
                      animation:
                        wave && lit ? `lc-tick-wave 0.5s ease-out ${m * 14}ms both` : undefined,
                    } as React.CSSProperties
                  }
                />
              );
            })}
          </g>
        </svg>
        {pin}
      </div>
    </div>
  );
}

function Pin({
  minute,
  side,
  color,
  rail,
  label,
}: {
  minute: number;
  side: "left" | "right";
  color: string;
  rail: string;
  label: string;
}) {
  const pos = side === "right" ? minute - 0.5 : MAX_RANGE - minute + 0.5;
  // Near the button, run the label outward so it doesn't slide under the housing.
  const nearButton = minute / MAX_RANGE < 0.5;
  const labelShift = nearButton
    ? side === "left"
      ? "translateX(calc(-100% + 8px))"
      : "translateX(-8px)"
    : "translateX(-50%)";
  // Slides out from under the button: animate the edge that faces the button, starting
  // behind the housing (past ZERO_GAP and the overlap) and ending at the minute it rang.
  const pct = (pos / MAX_RANGE) * 100;
  const prop = side === "right" ? "left" : "right";
  const target = side === "right" ? `${pct}%` : `${100 - pct}%`;
  // A CSS transition (not motion) because it slides between px and %, which the browser handles natively.
  const [out, setOut] = useState(false);
  // The "Rang …" label only appears once the dot has arrived.
  const [arrived, setArrived] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setOut(true));
    return () => cancelAnimationFrame(id);
  }, []);
  return (
    <div
      // Above the button (z-20 vs its z-10), so a 1-2 minute result is never hidden behind it.
      // It starts invisible under the button and fades in as it slides out, so it still reads
      // as emerging from behind.
      className="absolute top-1/2 z-20"
      style={{
        [prop]: out ? target : `-${ZERO_GAP + 40}px`,
        opacity: out ? 1 : 0,
        // Eases to a stop: no overshoot
        transition: `${prop} 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.3s, opacity 0.35s ease-out 0.38s`,
      }}
      onTransitionEnd={(e) => {
        if (e.target === e.currentTarget && e.propertyName === prop) setArrived(true);
      }}
    >
      <span
        className="absolute block h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px]"
        style={{ background: color, borderColor: rail }}
      />
      {/* Phones: no room beside the button; the status line already says what happened */}
      <span
        className="absolute top-3.5 text-xs font-bold whitespace-nowrap tabular-nums transition-[opacity,margin] duration-300 ease-out max-sm:hidden"
        style={{
          color: "var(--foreground)",
          transform: labelShift,
          opacity: arrived ? 1 : 0,
          marginTop: arrived ? 0 : -4,
        }}
      >
        {label}
      </span>
    </div>
  );
}

/** Tick heights in px: unlit short/long, and room for lit bars at 2x. */
const BASE_SHORT = 9;
/** Breathing room between the button housing and minute 1, in px. */
const ZERO_GAP = 18;
const BASE_LONG = 17;


/** Edge depth of the 3D button, in px. */
const EDGE = 3;

function PushButton({
  theme: t,
  phase,
  range,
  onPress,
}: {
  theme: Theme;
  phase: Phase;
  range: number;
  onPress: () => void;
}) {
  const latched = phase !== "idle";
  const busy = phase === "dropping" || phase === "blink" || phase === "rolling";
  const ringing = phase === "dropping" || phase === "blink";
  // Once pressed, the face takes the rail colour so it reads as part of the line: faded text while
  // the draw runs, full-strength text once Reset Alarm is ready to press.
  // Some themes warm the button up with the bet
  const idleFace = t.button.ramp ? hexOf(ramp(t.button.ramp, range / MAX_RANGE)) : t.button.face;
  const face = latched ? t.rail : idleFace;
  const railLight = isLight(t.rail);
  const faceInk = !latched
    ? t.button.whiteFrom !== undefined
      ? range >= t.button.whiteFrom
        ? "#FFFFFF"
        : t.button.ink
      : readableInk(idleFace, t.button.ink)
    : busy
      ? railLight ? "rgba(0,0,0,0.55)" : "rgba(255,255,255,0.7)"
      : railLight ? "#1B1B1B" : "#FFFFFF";
  const edge = css(mixHex(face, "#000000", 0.35));
  const shine = "inset 0 2px 0 rgba(255,255,255,0.35)";

  const label = phase === "idle" ? "Set Alarm" : phase === "result" ? "Reset Alarm" : "Setting…";

  return (
    <div className="relative">
      {/* Curved joins where the rail flares into the housing, so they read as one piece */}
      <Fillet side="left" color={t.rail} />
      <Fillet side="right" color={t.rail} />
      {/* Housing: solid rail colour, so the button reads as mounted on the line */}
      <div
        className="relative rounded-full p-1.5"
        style={{
          paddingBottom: 6 + EDGE,
          background: t.rail,
          transition: "background 300ms",
        }}
      >
        <motion.button
          type="button"
          aria-pressed={latched}
          disabled={busy}
          onClick={onPress}
          className="group flex h-14 min-w-44 cursor-pointer items-center justify-center gap-2.5 rounded-full px-8 text-base font-bold disabled:cursor-wait"
          style={{
            background: face,
            color: faceInk,
            fontFamily: "var(--font-geist-sans), sans-serif",
            transition: "background 300ms, color 300ms",
          }}
          variants={{
            rest: { y: 0, scaleX: 1, scaleY: 1, boxShadow: `${shine}, 0 ${EDGE}px 0 0 ${edge}` },
            // Flat: no edge or shadow. The face doesn't move; only its colour and edge change.
            latched: {
              y: 0,
              scaleX: 1,
              scaleY: 1,
              boxShadow: `inset 0 0px 0 rgba(255,255,255,0), 0 0px 0 0 ${edge}`,
            },
          }}
          initial={false}
          animate={latched ? "latched" : "rest"}
          // No hover or press movement: only the icon animates (bell rings / reset arrow spins)
          transition={{ type: "spring", stiffness: 700, damping: 22 }}
        >
          {phase === "result" ? (
            <motion.svg
              key="reset"
              aria-hidden
              viewBox="0 0 24 24"
              // Spins backwards (a rewind) while hovered
              className="h-5 w-5 group-hover:animate-[lc-spin_0.9s_cubic-bezier(0.4,0,0.2,1)_infinite_reverse]"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.6}
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ scale: 0, rotate: -120 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 600, damping: 14 }}
            >
              <path d="M3.5 12a8.5 8.5 0 1 0 2.5-6" />
              <path d="M3 3.5V8h4.5" />
            </motion.svg>
          ) : (
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              className={`h-5 w-5 origin-top ${
                ringing
                  ? "animate-[lc-ring_0.3s_ease-in-out_infinite]"
                  : busy
                    ? ""
                    : "animate-[lc-bell-nudge_4.5s_ease-in-out_infinite] group-hover:animate-[lc-ring_0.3s_ease-in-out_infinite]"
              }`}
              fill="none"
              stroke="currentColor"
              strokeWidth={2.4}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
              <path d="M10.3 21a1.9 1.9 0 0 0 3.4 0" />
            </svg>
          )}
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={label}
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -12, opacity: 0 }}
              transition={{ type: "spring", stiffness: 600, damping: 26 }}
            >
              {label}
            </motion.span>
          </AnimatePresence>
        </motion.button>
      </div>
    </div>
  );
}

/** A small concave flare joining the 4px rail to the button housing. */
function Fillet({ side, color }: { side: "left" | "right"; color: string }) {
  const W = 22; // reaches this far out along the rail
  const H = 30; // height where it meets the housing
  const y1 = H / 2 - 2;
  const y2 = H / 2 + 2;
  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${W} ${H}`}
      width={W}
      height={H}
      className="pointer-events-none absolute top-1/2"
      style={{
        // Tuck the inner edge 6px into the rounded end of the housing
        [side === "right" ? "left" : "right"]: `calc(100% - 6px)`,
        transform: `translateY(-50%)${side === "left" ? " scaleX(-1)" : ""}`,
      }}
    >
      <path
        d={`M0 0 C 5 ${y1 * 0.8}, 10 ${y1}, ${W} ${y1} L ${W} ${y2} C 10 ${y2}, 5 ${H - y1 * 0.8}, 0 ${H} Z`}
        fill={color}
        style={{ transition: "fill 300ms" }}
      />
    </svg>
  );
}

/** Whether a hex colour is light enough to need dark text on it. */
function isLight(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return 0.299 * r + 0.587 * g + 0.114 * b > 150;
}

const hexOf = (c: [number, number, number]) => "#" + c.map((n) => n.toString(16).padStart(2, "0")).join("");

/**
 * Keeps the button label readable as the face colour changes.
 * Dark text goes white as soon as white reads well on the face (3:1, the bold-label threshold),
 * erring towards white. Light text only swaps to near-black once it stops reading well (4.5:1).
 */
function readableInk(face: string, ink: string) {
  if (isDark(ink)) return contrast(face, "#FFFFFF") >= 3 ? "#FFFFFF" : ink;
  if (contrast(face, ink) >= 4.5) return ink;
  return contrast(face, "#1B1B1B") > contrast(face, ink) ? "#1B1B1B" : ink;
}
