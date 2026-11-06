"use client";

import { motion } from "motion/react";
import { useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from "react";
import { PIXEL_BELL, PIXEL_HEART, PIXEL_HEART_EMPTY, Pixels } from "@/components/scenes/digital-art";
import { EightBallDie } from "@/components/scenes/eightball-scene";
import { LatteArt } from "@/components/scenes/cafe-art";
import { SUIT_PATHS } from "@/components/scenes/tarot-svg";
import { WheelFace, WheelPointer } from "@/components/scenes/wheel-art";
import { scallop } from "@/lib/scallop";
import { sfx } from "@/lib/sfx";
import { css, cssA, MAX_RANGE, ramp, tierIndex, type Theme } from "@/lib/themes";

/** Everything is laid out in a 358-unit square (the size in the mobile design) and scaled. */
const SIZE = 358;
const C = SIZE / 2;
const TRACK_R = 148;
/** Degrees of sweep per minute of risk: 45 min = 360°. */
const DEG_PER_MIN = 360 / MAX_RANGE;

const pct = (n: number) => `${(n / SIZE) * 100}%`;
/** Font size in container units, so text scales with the dial. */
const cq = (px: number) => `${(px / SIZE) * 100}cqw`;

/** Rounded so server and browser trig agree (avoids hydration mismatches). */
const r3 = (n: number) => Math.round(n * 1000) / 1000;

function pt(deg: number, r: number): [number, number] {
  const a = (deg * Math.PI) / 180;
  return [r3(C + r * Math.sin(a)), r3(C - r * Math.cos(a))];
}

function arc(a1: number, a2: number, r: number) {
  if (a2 - a1 <= 0) return "";
  const [x1, y1] = pt(a1, r);
  const [x2, y2] = pt(a2, r);
  const large = a2 - a1 > 180 ? 1 : 0;
  return `M${x1.toFixed(2)} ${y1.toFixed(2)} A${r} ${r} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
}

/** The "calavera" ornament: a ring of dots in marigold, rose, teal and orange, and two flowers. */
const CALAVERA_COLORS = ["#FFC23D", "#F0306E", "#2FB8A6", "#FF7A1F"];
const CALAVERA_DOTS = Array.from({ length: 40 }, (_, i) => {
  const [x, y] = pt(i * 9, 106);
  return { x, y, r: i % 2 ? 1.4 : 2, fill: CALAVERA_COLORS[i % 4] };
});
const CALAVERA_FLOWERS = [112, 246].map((x) => ({ x, y: 118, d: scallop(x, 118, 5, 7, 1.05) }));

/** LED segments (themes with `segments`): one per minute, with a small gap either side. */
const SEG_GAP = 1.1;
const SEGMENTS = Array.from({ length: MAX_RANGE }, (_, i) =>
  arc(i * DEG_PER_MIN + SEG_GAP, (i + 1) * DEG_PER_MIN - SEG_GAP, TRACK_R),
);
/** The "pixel" ornament's lives, per tier: three at first, draining to none at the full 45. */
const LIVES = [3, 3, 2, 2, 1, 0];
/** A life heart's pixel size, in dial units. */
const HEART_PX = 1.7;

type Props = {
  theme: Theme;
  range: number;
  onRangeChange: (range: number) => void;
  timeLabel: string;
  ampm: string;
  onTimeClick: () => void;
};

export function BetDial({
  theme: t,
  range,
  onRangeChange,
  timeLabel,
  ampm,
  onTimeClick,
}: Props) {
  const dragging = useRef(false);
  const [grabbing, setGrabbing] = useState(false);
  const p = range / MAX_RANGE;
  const arcRGB = ramp(t.arcStops, p);
  const arcColor = css(arcRGB);

  const sweep = range * DEG_PER_MIN;
  const [hx, hy] = pt(sweep, TRACK_R);
  const glowPx = Math.round(p * 22 * t.glow);
  /** "- 45 mins +" under the time: the same colour as the tier label below the dial. */
  const rangeInk = t.tierInk ? css(ramp(t.tierInk, p)) : arcColor;
  /** Darker shades of the arc colour, for the handle's inner edge and its shadow. */
  const shade = (k: number) =>
    arcRGB.map((v) => Math.round(v * k)) as typeof arcRGB;
  const edgeArc = shade(0.72);
  const deepArc = shade(0.5);
  const half = t.trackWidth / 2;

  const change = (next: number) => {
    const r = Math.max(0, Math.min(MAX_RANGE, next));
    if (r === range) return;
    sfx.dial(r, range);
    onRangeChange(r);
  };

  const setFromAngle = (ang: number) => {
    let r = Math.max(0, Math.min(MAX_RANGE, Math.round(ang / DEG_PER_MIN)));
    // Don't jump across 12 o'clock while dragging past the top.
    if (range >= 36 && r <= 9) r = MAX_RANGE;
    else if (range <= 9 && r >= 36) r = 0;
    change(r);
  };

  const angleFrom = (ev: PointerEvent<HTMLDivElement>) => {
    const rect = ev.currentTarget.getBoundingClientRect();
    const dx = ev.clientX - (rect.left + rect.width / 2);
    const dy = ev.clientY - (rect.top + rect.height / 2);
    let ang = (Math.atan2(dx, -dy) * 180) / Math.PI;
    if (ang < 0) ang += 360;
    return { dist: Math.hypot(dx, dy) / (rect.width / 2), ang };
  };

  const onPointerDown = (ev: PointerEvent<HTMLDivElement>) => {
    const pos = angleFrom(ev);
    if (pos.dist < 0.6) return; // the centre belongs to the time button
    ev.currentTarget.setPointerCapture(ev.pointerId);
    dragging.current = true;
    setGrabbing(true);
    setFromAngle(pos.ang);
  };

  const release = () => {
    dragging.current = false;
    setGrabbing(false);
  };

  const onKeyDown = (ev: KeyboardEvent) => {
    const step: Record<string, number> = {
      ArrowRight: 1,
      ArrowUp: 1,
      ArrowLeft: -1,
      ArrowDown: -1,
      PageUp: 5,
      PageDown: -5,
    };
    let next: number | undefined;
    if (ev.key in step) next = range + step[ev.key];
    else if (ev.key === "Home") next = 0;
    else if (ev.key === "End") next = MAX_RANGE;
    if (next === undefined) return;
    ev.preventDefault();
    change(next);
  };

  // Gradient arc: a conic gradient (from calm to hot) masked to the ring.
  const conicStops = [0, 0.25, 0.5, 0.75, 1]
    .map((f) => `${css(ramp(t.arcStops, p * f))} ${(sweep * f).toFixed(2)}deg`)
    .join(", ");
  const ringIn = ((TRACK_R - half) / C) * 100;
  const ringOut = ((TRACK_R + half) / C) * 100;
  const ringMask = `radial-gradient(circle closest-side, transparent ${ringIn}%, #000 ${ringIn + 0.3}%, #000 ${ringOut - 0.3}%, transparent ${ringOut}%)`;

  const tickInner = TRACK_R - half - 8;

  const bulbs = t.bulbs
    ? Array.from({ length: 22 }, (_, i) => {
        const ang = i * (360 / 22);
        const [x, y] = pt(ang, 171);
        return { x, y, lit: range > 0 && ang <= sweep + 0.01, i };
      })
    : [];

  return (
    <div
      className="relative aspect-square w-full touch-none select-none"
      style={{ containerType: "inline-size" }}
      onPointerDown={onPointerDown}
      onPointerMove={(ev) =>
        dragging.current && setFromAngle(angleFrom(ev).ang)
      }
      onPointerUp={release}
      onPointerCancel={release}
    >
      {/* Halo that grows with the bet */}
      <div
        aria-hidden
        className="pointer-events-none absolute rounded-full"
        style={{ inset: pct(-16), opacity: p * 0.85 * t.glow }}
      >
        <div
          className="h-full w-full rounded-full"
          style={{
            background: `radial-gradient(circle, ${cssA(arcRGB, 0.5)} 0%, transparent 70%)`,
            animation: `lc-pulse ${(2.6 - p * 1.4).toFixed(2)}s ease-in-out infinite`,
          }}
        />
      </div>

      {/* Disc */}
      <div
        aria-hidden
        className="absolute rounded-full transition-[background,box-shadow] duration-300"
        style={{ inset: pct(3), background: t.disc, boxShadow: t.discShadow }}
      />

      <svg
        aria-hidden
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="absolute inset-0 h-full w-full overflow-visible"
      >
        {t.segments ? (
          // An LED bar graph: every minute its own segment, the lit ones in the colour for their
          // place on the ramp (calm at the start, hot at the end), glowing together
          <>
            {SEGMENTS.map((d, i) => (
              <path key={i} d={d} fill="none" stroke={t.track} strokeWidth={t.trackWidth} />
            ))}
            <g style={{ filter: glowPx > 0 ? `drop-shadow(0 0 ${glowPx}px ${cssA(arcRGB, 0.85)})` : "none" }}>
              {SEGMENTS.slice(0, range).map((d, i) => (
                <path
                  key={i}
                  d={d}
                  fill="none"
                  stroke={css(ramp(t.arcStops, (i + 0.5) / MAX_RANGE))}
                  strokeWidth={t.trackWidth}
                />
              ))}
            </g>
          </>
        ) : (
          <circle
            cx={C}
            cy={C}
            r={TRACK_R}
            fill="none"
            stroke={t.track}
            strokeWidth={t.trackWidth}
            strokeDasharray={t.dash}
          />
        )}
        {t.dash !== "none" && !t.segments && (
          <path
            d={
              sweep >= 360
                ? `${arc(0, 180, TRACK_R)} ${arc(180, 360, TRACK_R)}`
                : arc(0, sweep, TRACK_R)
            }
            fill="none"
            stroke={arcColor}
            strokeWidth={t.trackWidth}
            strokeDasharray={t.dash}
            style={{
              filter:
                glowPx > 0
                  ? `drop-shadow(0 0 ${glowPx}px ${arcColor})`
                  : "none",
            }}
          />
        )}
      </svg>

      {t.dash === "none" && !t.segments && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            filter:
              glowPx > 0
                ? `drop-shadow(0 0 ${glowPx}px ${cssA(arcRGB, 0.9)})`
                : "none",
          }}
        >
          <div
            className="h-full w-full"
            style={{
              background: `conic-gradient(from 0deg, ${conicStops}, transparent ${sweep.toFixed(2)}deg)`,
              maskImage: ringMask,
              WebkitMaskImage: ringMask,
            }}
          />
        </div>
      )}

      {/* Hairlines just inside the ring's inner and outer edges. Multiplied, so they come out as
          a deeper shade of whatever is under them: the arc's colour, or the empty track. */}
      {t.trackEdge && (
        <svg
          aria-hidden
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
          style={{ mixBlendMode: t.trackEdgeBlend ?? "multiply" }}
        >
          {[TRACK_R - half + 1, TRACK_R + half - 1].map((r) => (
            <circle
              key={r}
              cx={C}
              cy={C}
              r={r}
              fill="none"
              stroke={t.trackEdge}
              strokeWidth={1.25}
            />
          ))}
        </svg>
      )}

      <svg
        aria-hidden
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
      >
        {/* Prize wheel: wedges, pegs and the hub, under the ticks */}
        {t.ornament === "wheel" && <WheelFace range={range} />}
        {/* Magic 8 Ball: the die in the window, framing the time, under the ticks */}
        {t.ornament === "eightball" && <EightBallDie p={p} />}
        {/* Caffè: latte art in the foam, under the ticks */}
        {t.ornament === "latte" && <LatteArt tier={tierIndex(range)} />}

        {/* Minute ticks; the ones inside the bet light up */}
        {Array.from({ length: MAX_RANGE - 1 }, (_, k) => k + 1).map((i) => {
          const long = i % 5 === 0;
          const [x1, y1] = pt(i * DEG_PER_MIN, tickInner - (long ? 10 : 5));
          const [x2, y2] = pt(i * DEG_PER_MIN, tickInner);
          const lit = i <= range;
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={lit ? css(ramp(t.arcStops, i / MAX_RANGE)) : t.faint}
              strokeWidth={long ? 2.6 : 1.6}
              strokeLinecap="round"
              style={{ transition: "stroke 120ms" }}
            />
          );
        })}

        {/* 12 o'clock notch: the target time */}
        <rect
          x={C - 2}
          y={C - TRACK_R - half - 4}
          width={4}
          height={t.trackWidth + 8}
          rx={2}
          fill={t.notch}
        />

        {bulbs.map((b) => {
          const bc = t.bulbColors;
          const on = bc?.on ?? "#FFE28A";
          const off = bc?.off ?? "rgba(255,226,138,0.16)";
          // Marquee themes alternate two bulb colours and run a chase round the lit ones
          const alt = bc?.chase && bc.alt && b.i % 2 === 1;
          const chaseS = p > 0.85 ? 0.5 : 1.1;
          return (
            <circle
              key={b.i}
              cx={b.x}
              cy={b.y}
              r={4.5}
              fill={b.lit ? (alt ? bc.alt : on) : off}
              style={
                {
                  "--bulb-on": on,
                  "--bulb-off": off,
                  filter: b.lit
                    ? `drop-shadow(0 0 5px ${(alt && bc.altGlow) || bc?.glow || "rgba(255,210,100,0.9)"})`
                    : "none",
                  animation: bc?.chase
                    ? b.lit
                      ? // Three-phase chase, running clockwise: every third bulb at full brightness
                        `lc-bulb-chase ${chaseS}s linear ${(-(((3 - (b.i % 3)) % 3) * chaseS) / 3).toFixed(2)}s infinite`
                      : // Unlit bulbs: one dim glint travelling round, like a sign waiting for players
                        `lc-bulb-attract 2.4s linear ${((b.i * 2.4) / 22).toFixed(2)}s infinite`
                    : b.lit && p > 0.85
                      ? `lc-blink 0.7s linear ${(b.i * 0.07).toFixed(2)}s infinite`
                      : "none",
                } as CSSProperties
              }
            />
          );
        })}
        {t.ornament === "wheel" && <WheelPointer range={range} />}
        {t.ornament === "chip" && (
          // A giant poker chip: eight edge inserts round the rim (clear of the 12 o'clock notch)
          // and a dashed inlay ring between the time and the minute ticks
          <g>
            {Array.from({ length: 8 }, (_, k) => 22.5 + k * 45).map((a) => (
              <path
                key={a}
                d={arc(a - 7, a + 7, 169.5)}
                fill="none"
                stroke={t.ink}
                strokeOpacity={0.5}
                strokeWidth={9}
              />
            ))}
            <circle
              cx={C}
              cy={C}
              r={103}
              fill="none"
              stroke={t.faint}
              strokeWidth={1.5}
              strokeDasharray="3 5"
              strokeLinecap="round"
            />
          </g>
        )}
        {(t.ornament === "suits" || t.ornament === "chip") &&
          (
            [
              ["♠", 112, 118],
              ["♥", 249, 118],
              ["♣", 112, 254],
              ["♦", 249, 254],
            ] as const
          ).map(([g, x, y]) => (
            <text
              key={g}
              x={x}
              y={y}
              fontSize={16}
              textAnchor="middle"
              fill={t.faint}
            >
              {g}
            </text>
          ))}
        {t.ornament === "ouija" && (
          // Engraved like a spirit board: YES and NO either side of the time, an eye above it,
          // GOODBYE below, inside a dotted ring
          <g fill={t.faint} style={{ fontFamily: t.titleFont }}>
            <circle
              cx={C}
              cy={C}
              r={108}
              fill="none"
              stroke={t.faint}
              strokeWidth={1.6}
              strokeLinecap="round"
              strokeDasharray="0 5.65"
            />
            {(
              [
                ["YES", 93],
                ["NO", 265],
              ] as const
            ).map(([w, x]) => (
              <text key={w} x={x} y={184} fontSize={13} textAnchor="middle" letterSpacing="0.14em">
                {w}
              </text>
            ))}
            <g
              transform={`translate(${C} 117)`}
              fill="none"
              stroke={t.faint}
              strokeWidth={1.2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M-13 0s5.5-7 13-7 13 7 13 7-5.5 7-13 7-13-7-13-7z" />
              <circle r={3.3} />
              <path d="M0-11.5v-3.5M-7.5-9.5l-1.8-2.6M7.5-9.5l1.8-2.6" />
            </g>
            <text x={C} y={262} fontSize={9.5} textAnchor="middle" letterSpacing="0.32em">
              GOODBYE
            </text>
          </g>
        )}
        {t.ornament === "calavera" && (
          <g opacity={0.75}>
            {/* A sugar skull's ring of dots */}
            {CALAVERA_DOTS.map((d, i) => (
              <circle key={i} cx={d.x} cy={d.y} r={d.r} fill={d.fill} />
            ))}
            {/* Marigolds up top, hearts below */}
            {CALAVERA_FLOWERS.map((f) => (
              <g key={f.x}>
                <path d={f.d} fill="#FF7A1F" />
                <circle cx={f.x} cy={f.y} r={2.2} fill="#FFC23D" />
              </g>
            ))}
            {[112, 246].map((x) => (
              <path
                key={x}
                d={`M${x} 254.5c-.9-.8-5.2-3.6-5.2-6.6a2.7 2.7 0 0 1 5.2-1 2.7 2.7 0 0 1 5.2 1c0 3-4.3 5.8-5.2 6.6z`}
                fill="#F0306E"
              />
            ))}
          </g>
        )}
        {t.ornament === "tarot" && (
          // Engraved like a tarot card's face: a fine ring with a sparkle at each quarter, and the
          // four minor arcana suits on the diagonals
          <g fill={t.faint}>
            <circle cx={C} cy={C} r={112} fill="none" stroke={t.faint} strokeWidth={1.3} />
            {[0, 90, 180, 270].map((a) => {
              const [x, y] = pt(a, 112);
              return (
                <path
                  key={a}
                  transform={`translate(${x} ${y})`}
                  d="M0-5.5C.4-1.9 1.9-.4 5.5 0 1.9.4.4 1.9 0 5.5-.4 1.9-1.9.4-5.5 0-1.9-.4-.4-1.9 0-5.5z"
                  // Knocks the ring out round each sparkle (the disc's cream)
                  stroke="#FBF4E6"
                  strokeWidth={2.5}
                  paintOrder="stroke"
                />
              );
            })}
            {(
              [
                ["wands", C - 64, C - 64],
                ["cups", C + 64, C - 64],
                ["swords", C - 64, C + 64],
                ["pentacles", C + 64, C + 64],
              ] as const
            ).map(([suit, x, y]) => (
              <path key={suit} d={SUIT_PATHS[suit]} fillRule="evenodd" transform={`translate(${x - 8} ${y - 8}) scale(${16 / 24})`} />
            ))}
          </g>
        )}
        {t.ornament === "pixel" && (
          // An arcade screen: a ring of square pixels, PLAYER 1 above the time, and three lives
          // below it that drain as the bet grows (the last one blinks)
          <g>
            <circle
              cx={C}
              cy={C}
              r={108}
              fill="none"
              stroke={t.faint}
              strokeWidth={3}
              strokeDasharray={`3 ${((2 * Math.PI * 108) / 84 - 3).toFixed(3)}`}
            />
            <text
              x={C}
              y={126}
              fontSize={11}
              textAnchor="middle"
              letterSpacing="0.16em"
              fill={t.muted}
              opacity={0.75}
              style={{ fontFamily: t.titleFont }}
            >
              PLAYER 1
            </text>
            {[-1, 0, 1].map((k) => {
              const lives = LIVES[tierIndex(range)];
              const full = k + 1 < lives;
              const last = lives === 1 && k === -1;
              const x = C + k * 17 - (7 * HEART_PX) / 2;
              return (
                <g
                  key={k}
                  transform={`translate(${x} 236) scale(${HEART_PX})`}
                  shapeRendering="crispEdges"
                  style={{ animation: last ? "lc-blink 0.8s steps(1) infinite" : "none" }}
                >
                  {full ? <Pixels s={PIXEL_HEART} /> : <Pixels s={PIXEL_HEART_EMPTY} pal={{ w: t.faint }} />}
                </g>
              );
            })}
          </g>
        )}
      </svg>

      {/* Centre: the target time */}
      <motion.button
        type="button"
        onClick={onTimeClick}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 500, damping: 22 }}
        aria-label={`Alarm time ${timeLabel} ${ampm}. Change time`}
        className="absolute flex cursor-pointer flex-col items-center justify-center rounded-full outline-offset-4"
        style={{
          left: pct(84),
          top: pct(84),
          width: pct(190),
          height: pct(190),
          color: t.timeColor,
          fontFamily: t.timeFont,
          textShadow:
            p > 0 && t.glow > 0.5 && t.timeGlow !== false
              ? `0 0 ${Math.round(p * 20)}px ${cssA(arcRGB, 0.55)}`
              : t.timeShadow,
        }}
      >
        <span className="flex items-baseline" style={{ gap: cq(4) }}>
          <span
            className="leading-none font-bold tabular-nums"
            style={{ fontSize: cq(52), letterSpacing: "-0.03em" }}
          >
            {timeLabel}
          </span>
          <span className="font-bold" style={{ fontSize: cq(15) }}>
            {ampm}
          </span>
        </span>
        <span
          className="absolute inset-x-0 flex justify-center font-semibold tabular-nums"
          style={{
            top: `${(124 / 190) * 100}%`,
            fontSize: cq(15),
            gap: cq(8),
            color: t.muted,
            fontFamily: "var(--font-geist-sans), sans-serif",
            textShadow: "none",
          }}
        >
          {range > 0 ? (
            <>
              <motion.span
                key={range}
                initial={{ scale: 1.45, color: arcColor }}
                animate={{ scale: 1, color: rangeInk }}
                transition={{ type: "spring", stiffness: 600, damping: 18 }}
                className="inline-flex items-center"
                aria-label={`plus or minus ${range} ${range === 1 ? "minute" : "minutes"}`}
              >
                {/* Minus and plus either side of the minutes: it can ring this early, or this late */}
                <SignIcon d="M5 12h14" className="mr-[0.35em]" />
                {range} {range === 1 ? "min" : "mins"}
                <SignIcon d="M12 5v14M5 12h14" className="ml-[0.35em]" />
              </motion.span>
            </>
          ) : null}
        </span>
      </motion.button>

      {/* Bell handle: drag around the ring to place the bet */}
      <div
        role="slider"
        tabIndex={0}
        aria-label="Gamble window"
        aria-valuemin={0}
        aria-valuemax={MAX_RANGE}
        aria-valuenow={range}
        aria-valuetext={`${range} minutes either side`}
        onKeyDown={onKeyDown}
        className={`absolute flex cursor-grab items-center justify-center outline-offset-4 transition-transform duration-150 ease-out hover:scale-110 active:cursor-grabbing ${t.pixelHandle ? "rounded-[22%]" : "rounded-full"}`}
        style={{
          left: pct(hx - 22),
          top: pct(hy - 22),
          width: pct(44),
          height: pct(44),
          background: t.handleRamp ? css(ramp(t.handleRamp, p)) : t.handle,
          color: t.handleInk,
          // Ringed in the arc's current colour, unless the theme has its own handle border
          border:
            t.handleBorder === "none"
              ? `2.5px solid ${arcColor}`
              : t.handleBorder,
          transform: grabbing ? "scale(1.22)" : undefined,
          boxShadow: [
            // Drop shadow: neutral, or for tinted handles a deep shade of the current arc colour
            `0 ${grabbing ? 10 : 6}px ${grabbing ? 24 : 16}px ${
              t.tintedHandle
                ? cssA(deepArc, grabbing ? 0.5 : 0.42)
                : `rgba(0,0,0,${grabbing ? 0.35 : 0.28})`
            }`,
            `0 0 ${Math.round(p * 24 * t.glow)}px ${cssA(arcRGB, 0.8)}`,
            // Tinted handles: a hairline just inside the border, in a deeper shade of its colour
            ...(t.tintedHandle ? [`inset 0 0 0 1.25px ${css(edgeArc)}`] : []),
          ].join(", "),
        }}
      >
        {t.pixelHandle ? (
          // A pixel bell, in square pixels
          <svg
            aria-hidden
            viewBox="-1 -1 12 11"
            className="h-[48%] w-[48%]"
            shapeRendering="crispEdges"
            style={{ animation: grabbing ? "lc-ring 0.35s steps(2) infinite" : "none" }}
          >
            <Pixels s={PIXEL_BELL} pal={{ w: "currentColor" }} />
          </svg>
        ) : (
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            className="h-[45%] w-[45%]"
            style={{
              animation: grabbing ? "lc-ring 0.35s ease-in-out infinite" : "none",
            }}
            fill="none"
            stroke="currentColor"
            strokeWidth={2.2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
            <path d="M10.3 21a1.9 1.9 0 0 0 3.4 0" />
          </svg>
        )}
      </div>
    </div>
  );
}

/** A small stroked plus or minus sign, sized to the text around it. */
function SignIcon({ d, className = "" }: { d: string; className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className={`h-[0.8em] w-[0.8em] ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
    >
      <path d={d} />
    </svg>
  );
}
