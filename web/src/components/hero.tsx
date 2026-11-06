"use client";

import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { AlarmRail } from "@/components/alarm-rail";
import {
  AlarmReveal,
  CLOCK_HEIGHT,
  outcomeOf,
  ROLL_MS,
  type RevealPhase,
} from "@/components/alarm-reveal";
import { BetDial } from "@/components/bet-dial";
import { RingMarks, Zzz } from "@/components/scenes/flourishes";
import { CalaveraFace } from "@/components/scenes/muertos-art";
import { LuckyFace } from "@/components/scenes/wheel-art";
import { DialBackdrop, RollFlourish, ThemeScene, type SceneMood } from "@/components/scenes";
import { frac } from "@/lib/rand";
import { chipStyle, SEE_THROUGH, ThemePicker } from "@/components/theme-picker";
import { TimePicker } from "@/components/time-picker";
import { setMuted, setSoundTheme, sfx } from "@/lib/sfx";
import { background, css, cssA, fillCopy, MAX_RANGE, ramp, THEMES, tierIndex, tierLabel } from "@/lib/themes";
import { formatClock, toMinutes } from "@/lib/time";

const BODY_FONT = "var(--font-geist-sans), system-ui, sans-serif";
/** Shared timing for everything that resizes when the alarm is set, so it all moves as one. */
const STAGE_EASE = "0.4s cubic-bezier(0.2, 0.8, 0.2, 1)";
/** Status box height once set: title + result line + Roll Again, plus breathing room below. */
const STATUS_SET_H = 125;
/** Every set-phase group is centred on this line, so they all share one centre. */
const STATUS_CENTER = 60;
const TITLE_BASE = "flex h-8 items-center justify-center leading-none font-extrabold whitespace-nowrap";
/** Status titles once the alarm is set: all caps, spaced out. */
const TITLE_CLASS = `${TITLE_BASE} tracking-[0.14em] uppercase`;
/** Each line of a status group fades and rises in, staggered. */
const RISE = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 320, damping: 30 } },
} as const;
/** Stage width; the dial is square, the clock stage is exactly the digits (so they line up with the side labels). */
const STAGE_W = "min(380px, 82vw)";
const SANS = "var(--font-geist-sans), sans-serif";

type Phase = "idle" | RevealPhase;

/** How long each automatic step of the Set alarm sequence lasts. */
const NEXT: Partial<Record<Phase, [Phase, number]>> = {
  dropping: ["blink", 380],
  // Two beeps (one a second, starting straight away): enough to register the target, short
  // enough that the draw follows quickly.
  blink: ["rolling", 1400],
  // rolling → result is triggered by the clock when it lands.
};

const spring = { type: "spring", stiffness: 500, damping: 24 } as const;

export function Hero() {
  const [themeIndex, setThemeIndex] = useState(0);
  const [themeSwaps, setThemeSwaps] = useState(0);
  const [fadeFrom, setFadeFrom] = useState<string | null>(null);
  const [hour, setHour] = useState(7);
  const [minute, setMinute] = useState(30);
  const [pm, setPm] = useState(false);
  const [range, setRange] = useState(10);
  const [phase, setPhase] = useState<Phase>("idle");
  const [offset, setOffset] = useState(0);
  const [rollId, setRollId] = useState(0);
  const [picking, setPicking] = useState(false);
  const [soundOn, setSoundOn] = useState(true);

  const t = THEMES[themeIndex];
  const MascotFace = t.mascot === "lucky" ? LuckyFace : CalaveraFace;

  // Recorded sounds follow the theme (themes without files keep the synthesized ones).
  useEffect(() => setSoundTheme(t.id), [t.id]);

  // Where the dial sits inside the hero, so the sun can be drawn behind everything (in the
  // background layer) yet still centred on the dial.
  const wrapRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [dialSpot, setDialSpot] = useState<{ x: number; y: number; size: number } | null>(null);
  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    const stage = stageRef.current;
    if (!wrap || !stage) return;
    const measure = () => {
      const w = wrap.getBoundingClientRect();
      const st = stage.getBoundingClientRect();
      // The dial is square, so its centre is half its width down from the stage top.
      setDialSpot({ x: st.left - w.left + st.width / 2, y: st.top - w.top + st.width / 2, size: st.width });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, []);
  const p = range / MAX_RANGE;
  const arcRGB = ramp(t.arcStops, p);
  const arcColor = css(arcRGB);
  const target = toMinutes(hour, minute, pm);
  const latched = phase !== "idle";

  useEffect(() => {
    const next = NEXT[phase];
    if (!next) return;
    const id = setTimeout(() => setPhase(next[0]), next[1]);
    return () => clearTimeout(id);
  }, [phase]);

  const goTheme = (i: number) => {
    const next = (i + THEMES.length) % THEMES.length;
    if (next === themeIndex) return;
    setFadeFrom(background(t, p)); // old background fades out over the new one
    setThemeIndex(next);
    // Each theme starts fresh: back on the dial, with no doubt
    setRange(0);
    setPhase("idle");
    setThemeSwaps((s) => s + 1);
    sfx.swap();
  };

  const draw = () => Math.floor(Math.random() * (2 * range + 1)) - range;
  const setAlarm = () => {
    sfx.latch();
    setOffset(draw());
    setRollId((r) => r + 1);
    setPhase("dropping");
  };
  const rollAgain = () => {
    sfx.click();
    setOffset(draw());
    setRollId((r) => r + 1);
    setPhase("rolling");
  };
  const changeBet = () => {
    sfx.unlatch();
    setPhase("idle");
  };

  const toggleSound = () => {
    setMuted(soundOn);
    setSoundOn(!soundOn);
    if (!soundOn) sfx.click();
  };

  const sparkCount = t.sparkGlyphs.length && phase === "idle" ? Math.round(p * 16) : 0;
  const sparks = Array.from({ length: sparkCount }, (_, i) => ({
    glyph: t.sparkGlyphs[i % t.sparkGlyphs.length],
    x: frac(i, 11) * 100,
    y: 8 + frac(i, 12) * 84,
    size: Math.round(12 + frac(i, 13) * 14),
    dur: (3 + frac(i, 14) * 3).toFixed(1),
    delay: (frac(i, 15) * 2).toFixed(1),
  }));

  const outcome = outcomeOf(offset);
  const tier = tierIndex(range);
  const mood: SceneMood =
    phase === "idle"
      ? "idle"
      : phase !== "result"
        ? "set"
        : outcome === "early"
          ? "win"
          : outcome === "late"
            ? "loss"
            : "jackpot";
  const mins = (m: number) => (m === 1 ? "1 minute" : `${m} minutes`);
  const verdict =
    outcome === "early"
      ? { bg: t.win, ink: t.winInk }
      : outcome === "late"
        ? { bg: t.loss, ink: t.lossInk }
        : { bg: t.button.face, ink: t.button.ink };
  // Once the draw lands, the line under the label says what you gained or lost instead of the window.
  const resultLine =
    outcome === "early"
      ? fillCopy(t.copy.winLine, { mins: mins(-offset) })
      : outcome === "late"
        ? fillCopy(t.copy.lossLine, { mins: mins(offset) })
        : fillCopy(t.copy.jackpotLine);

  // The tier name's colour: the theme's own ramp if it has one, else the arc colour.
  const tierColor = range === 0 ? t.muted : t.tierInk ? css(ramp(t.tierInk, p)) : arcColor;

  let status: { key: string; title: ReactNode; color?: string; shake?: boolean };
  if (phase === "idle") {
    status = {
      key: `tier-${tierLabel(range, t)}`,
      title: tierLabel(range, t),
      color: tierColor,
      shake: range === MAX_RANGE,
    };
  } else if (phase === "dropping" || phase === "blink") {
    status = { key: "set", title: t.copy.setting };
  } else if (phase === "rolling") {
    status = { key: `roll-${rollId}`, title: t.copy.rolling };
  } else {
    status = {
      key: `result-${rollId}`,
      title:
        outcome === "early"
          ? fillCopy(t.copy.win, { time: formatClock(target) })
          : outcome === "late"
            ? fillCopy(t.copy.loss)
            : fillCopy(t.copy.jackpot),
    };
  }

  const titleStyle = { fontFamily: SANS } as const;

  const sideLabels = latched
    ? {
        left: ["Target", formatClock(target)],
        right: ["Doubt", range ? `± ${range} min` : "None"],
      }
    : {
        left: ["Set your alarm", "Tap the time to change it"],
        right: ["Add some doubt", "Drag the bell to add more"],
      };

  return (
    <MotionConfig reducedMotion="user">
      <section
        className="relative transition-colors duration-500"
        style={{ background: background(t, p), color: t.ink, fontFamily: BODY_FONT }}
      >
        {/* Clipped, so the falling dial disappears at the edge; the rail sits outside this */}
        <div ref={wrapRef} className="relative overflow-hidden">
          <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
            {/* Previous theme's background fading out */}
            {fadeFrom && (
              <motion.div
                key={themeSwaps}
                className="absolute inset-0"
                style={{ background: fadeFrom }}
                initial={{ opacity: 1 }}
                animate={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            )}

            <AnimatePresence>
              {t.decor !== "none" && (
                <motion.div
                  key={t.decor}
                  className="absolute inset-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <ThemeScene theme={t} p={p} tier={tier} mood={mood} />
                  {dialSpot && (
                    <div className="absolute" style={{ left: dialSpot.x, top: dialSpot.y }}>
                      <DialBackdrop
                        theme={t}
                        p={p}
                        range={range}
                        visible={phase === "idle"}
                        size={dialSpot.size}
                        mood={mood}
                      />
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {sparks.map((s, i) => (
              <span
                key={i}
                className="absolute leading-none"
                style={{
                  left: `${s.x}%`,
                  top: `${s.y}%`,
                  fontSize: s.size,
                  color: arcColor,
                  opacity: 0.3 + p * 0.55,
                  animation: `lc-float ${s.dur}s ease-in-out ${s.delay}s infinite`,
                }}
              >
                {s.glyph}
              </span>
            ))}
          </div>

          {/* Full-width header: logo left, main nav centred, credit + sound toggle right */}
          <header className="relative grid w-full grid-cols-[1fr_auto_1fr] items-center gap-4 px-6 py-6 sm:px-10">
            <a
              href="#"
              className="flex items-center gap-2 justify-self-start text-xl font-bold tracking-tight"
              style={{ fontFamily: t.titleFont }}
            >
              <svg
                aria-hidden
                viewBox="0 0 15 15"
                className="h-5 w-5 shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.6}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="7.5" cy="7.5" r="6.2" />
                <path d="M7.5 4.4V7.5L9.5 9.5" />
              </svg>
              LotteryClock
            </a>

            <nav aria-label="Main" className="hidden justify-self-center md:block">
              <a
                href="#how"
                className="rounded-full px-4 py-2 text-base font-semibold transition-colors hover:bg-current/10"
              >
                Why Would Anyone Want This?
              </a>
            </nav>

            <span
              className="col-start-3 flex items-center gap-4 justify-self-end text-[15px]"
              style={{ color: t.muted }}
            >
              <span className="hidden items-center gap-2 sm:inline-flex">
                <KiroGhost className="h-[18px] w-auto" />
                Built for Kiroween
              </span>
              <motion.button
                type="button"
                onClick={toggleSound}
                whileTap={{ scale: 0.85 }}
                transition={spring}
                aria-pressed={soundOn}
                aria-label={soundOn ? "Mute sound effects" : "Turn on sound effects"}
                // Same see-through, theme-tinted chip as the theme controls
                className={`grid h-10 w-10 cursor-pointer place-items-center rounded-full ${SEE_THROUGH}`}
                style={chipStyle(t)}
              >
                <svg
                  aria-hidden
                  viewBox="0 0 24 24"
                  className="h-[18px] w-[18px]"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" />
                  {soundOn ? (
                    <path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" />
                  ) : (
                    <path d="M16 9.5l5 5M21 9.5l-5 5" />
                  )}
                </svg>
              </motion.button>
            </span>
          </header>

          <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center px-6 pt-8 pb-16 text-center sm:px-10 sm:pt-12">
            <h1
              className="max-w-3xl text-4xl leading-[1.05] font-extrabold tracking-tight sm:text-6xl md:text-balance"
              style={{
                fontFamily: t.titleFont,
                maskImage: t.titleTexture,
                WebkitMaskImage: t.titleTexture,
              }}
            >
              The alarm clock you can&apos;t quite trust
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed font-medium tracking-wide text-balance sm:text-xl sm:leading-relaxed" style={{ color: t.muted }}>
              Set a time and choose how far off it&apos;s allowed to be. If it rings
              early, you&apos;ve won a snooze. If it rings late, you&apos;re already late.
            </p>

            {/* Theme switcher */}
            <div className="relative mt-10">
              <ThemePicker themes={THEMES} index={themeIndex} onSelect={goTheme} />
            </div>

            {/* 25px extra under the controls once the clock replaces the dial */}
            <div
              className={`grid w-full grid-cols-1 items-center gap-8 md:grid-cols-[1fr_auto_1fr] md:gap-x-[52px] ${latched ? "mt-[65px] sm:mt-[73px]" : "mt-10 sm:mt-12"}`}
              style={{
                transition: `margin-top ${STAGE_EASE}`,
                transitionDelay: latched ? "0.08s" : "0s",
              }}
            >
              <SideLabel align="right" lines={sideLabels.left} muted={t.muted} />

              {/* Stage: the dial, or the bedside clock once the alarm is set */}
              <div
                ref={stageRef}
                className="relative mx-auto"
                style={{
                  width: STAGE_W,
                  height: latched ? CLOCK_HEIGHT : STAGE_W,
                  // Shrink once the dial has started falling; grow straight away for its return.
                  transition: `height ${STAGE_EASE}`,
                  transitionDelay: latched ? "0.08s" : "0s",
                }}
              >
                <AnimatePresence initial={false}>
                  {phase === "idle" ? (
                    <motion.div
                      key="dial"
                      className="absolute inset-x-0 top-0 aspect-square"
                      initial={{ y: -70, opacity: 0, scale: 0.85, rotate: -10 }}
                      animate={{ y: 0, opacity: 1, scale: 1, rotate: 0 }}
                      // Lifts up and away: the mirror of how it springs back in on Reset Alarm
                      exit={{
                        y: -50,
                        rotate: 8,
                        opacity: 0,
                        scale: 0.85,
                        transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
                      }}
                      transition={{ type: "spring", stiffness: 240, damping: 16 }}
                    >
                      <motion.div
                        key={t.id}
                        className="h-full w-full"
                        initial={themeSwaps ? { scale: 0.9, rotate: -10 } : false}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 420, damping: 13 }}
                      >
                        <BetDial
                          theme={t}
                          range={range}
                          onRangeChange={setRange}
                          timeLabel={`${hour}:${String(minute).padStart(2, "0")}`}
                          ampm={pm ? "PM" : "AM"}
                          onTimeClick={() => {
                            sfx.click();
                            setPicking(true);
                          }}
                        />
                      </motion.div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="clock"
                      className="absolute inset-x-0 top-0 flex justify-center"
                      // Drops in from above with the same soft spring the dial uses on Reset Alarm
                      initial={{ opacity: 0, y: -50, scale: 0.88, rotate: -6 }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        rotate: 0,
                        transition: { delay: 0.18, type: "spring", stiffness: 240, damping: 18 },
                      }}
                      exit={{ opacity: 0, y: 10, scale: 0.97, transition: { duration: 0.2 } }}
                    >
                      <AlarmReveal
                        theme={t}
                        phase={phase}
                        target={target}
                        offset={offset}
                        range={range}
                        rollId={rollId}
                        onLanded={() => setPhase("result")}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <SideLabel align="left" lines={sideLabels.right} muted={t.muted} />

              {/* Phones: labels under the stage */}
              <div className="grid grid-cols-2 gap-4 text-sm md:hidden" style={{ color: t.muted }}>
                {[sideLabels.left, sideLabels.right].map(([title, sub]) => (
                  <div key={title}>
                    <div className="text-base font-semibold" style={{ color: t.ink }}>
                      {title}
                    </div>
                    {sub}
                  </div>
                ))}
              </div>
            </div>

            {/* Status. A fixed-height box, so nothing here resizes the hero mid-animation.
                Picking a bet: just the tier, top-aligned. Once set, each phase is one group
                (title / title + bar / title + result + Roll Again) pinned to the same centre
                point, crossfading in place: nothing slides or jumps between phases. */}
            <div
              aria-live="polite"
              className={`relative w-full ${latched ? "mt-6 md:mt-10" : "mt-12"}`}
              style={{
                height: latched ? STATUS_SET_H : 32,
                transition: `height ${STAGE_EASE}, margin-top ${STAGE_EASE}`,
                transitionDelay: latched ? "0.08s" : "0s",
              }}
            >
              <AnimatePresence mode="wait" initial={false}>
                {phase === "idle" ? (
                  <motion.div
                    key="idle"
                    className="absolute inset-x-0 top-0 flex flex-col items-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, transition: { duration: 0.25 } }}
                    exit={{ opacity: 0, transition: { duration: 0.12 } }}
                  >
                    <div className="relative h-8 w-full">
                      <AnimatePresence mode="popLayout" initial={false}>
                        <motion.div
                          key={status.key}
                          initial={{ opacity: 0, y: 10, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -8, transition: { duration: 0.12 } }}
                          transition={{ type: "spring", stiffness: 520, damping: 22 }}
                          // One size for every tier (matching the "Set your alarm" / "Add some doubt"
                          // labels), so it doesn't jump about while dragging
                          // Title case ("Pure Chaos") rather than all caps
                          className={`absolute inset-0 text-xl capitalize sm:text-2xl ${TITLE_BASE}`}
                          style={{
                            ...titleStyle,
                            color: status.color ?? t.ink,
                            textShadow:
                              p > 0.6 && t.glow > 0.5 && !t.tierInk
                                ? `0 0 12px ${cssA(arcRGB, 0.6)}`
                                : "none",
                          }}
                        >
                          <span
                            className="inline-flex items-center gap-[0.45em]"
                            style={{ animation: status.shake ? "lc-shake 0.4s linear infinite" : "none" }}
                          >
                            {t.mascot ? (
                              // A face, not a line icon: drawn a little larger, without growing the line
                              <MascotFace
                                key={tier}
                                tier={tier}
                                className="-my-[0.3em] h-[1.7em] w-[1.7em] shrink-0"
                                style={{ animation: "lc-icon-pop 0.45s cubic-bezier(0.2, 0.9, 0.3, 1.2) both" }}
                              />
                            ) : (
                              t.tierIcons && <TierIcon key={tier} paths={t.tierIcons[tier]} />
                            )}
                            {status.title}
                          </span>
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key={status.key}
                    className="absolute inset-x-0 flex -translate-y-1/2 flex-col items-center"
                    style={{ top: STATUS_CENTER }}
                    initial="hidden"
                    animate="show"
                    exit={{ opacity: 0, transition: { duration: 0.15 } }}
                    variants={{
                      hidden: {},
                      show: { transition: { staggerChildren: 0.1 } },
                    }}
                  >
                    <motion.div
                      variants={RISE}
                      className={TITLE_CLASS}
                      style={{ ...titleStyle, fontSize: 17, color: t.ink }}
                    >
                      {phase === "result" ? (
                        // The verdict, as a badge in the theme's snooze / late colours
                        <span
                          className="relative rounded-full px-4 py-2 text-[15px] leading-none"
                          style={{ background: verdict.bg, color: verdict.ink }}
                        >
                          {status.title}
                          {/* Zs drift off a snooze, alarm marks ring either side of a late one */}
                          {t.flourish && mood === "win" && (
                            <Zzz color={t.flourish.zzz} className="top-1/2 left-full ml-2" />
                          )}
                          {t.flourish && mood === "loss" && (
                            <RingMarks color={t.flourish.ring} className="-inset-x-8 top-1/2 -translate-y-1/2" />
                          )}
                        </span>
                      ) : (
                        status.title
                      )}
                    </motion.div>

                    {phase === "rolling" && (
                      <motion.div
                        variants={RISE}
                        className="mt-4 flex flex-col items-center"
                        style={{ color: t.ink }}
                      >
                        {/* Some themes put on a little show above the bar (Night's sheep use it as the ground) */}
                        <RollFlourish theme={t} />
                        <div className="h-2 w-40 overflow-hidden rounded-full bg-current/10">
                          <motion.div
                            className="h-full rounded-full bg-current"
                            initial={{ width: "0%" }}
                            animate={{ width: "100%" }}
                            // Starts after the previous group fades out, so finish a touch early
                            transition={{ duration: (ROLL_MS - 250) / 1000, ease: "easeInOut" }}
                          />
                        </div>
                      </motion.div>
                    )}

                    {phase === "result" && (
                      <>
                        <motion.div
                          variants={RISE}
                          className="mt-2 h-6 text-base leading-6 font-medium whitespace-nowrap"
                          style={{ color: `color-mix(in srgb, ${t.ink} 85%, transparent)` }}
                        >
                          {resultLine}
                        </motion.div>
                        <motion.div variants={RISE} className="mt-5">
                          <PillButton onClick={rollAgain} ink={t.ink}>
                            ↻ Roll Again
                          </PillButton>
                        </motion.div>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>

        {/* Timeline divider with the Set alarm button mounted on it */}
        <AlarmRail
          theme={t}
          phase={phase}
          range={range}
          offset={offset}
          rollId={rollId}
          rangLabel={formatClock(target + offset)}
          onPress={phase === "idle" ? setAlarm : changeBet}
        />

        {picking && (
          <TimePicker
            theme={t}
            hour={hour}
            minute={minute}
            pm={pm}
            // The wheels tick as they scroll, so no extra sound here
            onChange={(next) => {
              if (next.hour !== undefined) setHour(next.hour);
              if (next.minute !== undefined) setMinute(next.minute);
              if (next.pm !== undefined) setPm(next.pm);
            }}
            onClose={() => setPicking(false)}
          />
        )}
      </section>
    </MotionConfig>
  );
}

function SideLabel({
  align,
  lines: [title, sub],
  muted,
}: {
  align: "left" | "right";
  lines: string[];
  muted: string;
}) {
  return (
    <div className={`hidden md:block ${align === "right" ? "text-right" : "text-left"}`}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={title}
          initial={{ opacity: 0, x: align === "right" ? 16 : -16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: align === "right" ? -10 : 10, transition: { duration: 0.12 } }}
          transition={spring}
        >
          <div className="text-xl font-semibold sm:text-2xl">{title}</div>
          <div className="mt-1 text-sm" style={{ color: muted }}>
            {sub}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/** Tinted in its own text colour, so it suits any theme background. */
function PillButton({
  onClick,
  ink,
  children,
}: {
  onClick: () => void;
  ink: string;
  children: ReactNode;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.92 }}
      transition={spring}
      className="cursor-pointer rounded-full bg-current/10 px-4 py-2 text-sm font-semibold transition-colors hover:bg-current/20"
      style={{ color: ink }}
    >
      {children}
    </motion.button>
  );
}

/** A tier's line icon, sized to the label and stroked in its colour. Pops in on each tier change. */
function TierIcon({ paths }: { paths: string[] }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="h-[1.25em] w-[1.25em] shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ animation: "lc-icon-pop 0.45s cubic-bezier(0.2, 0.9, 0.3, 1.2) both" }}
    >
      {paths.map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}

/** The Kiro ghost (from kiro.dev's icon), in the current text colour with see-through eyes. */
function KiroGhost({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="272 202 655 796" className={className} aria-hidden fill="currentColor">
      <mask id="kiro-ghost-eyes" maskUnits="userSpaceOnUse" x="272" y="202" width="655" height="796">
        <path
          fill="#fff"
          d="M398.554 818.914C316.315 1001.03 491.477 1046.74 620.672 940.156C658.687 1059.66 801.052 970.473 852.234 877.795C964.787 673.567 919.318 465.357 907.64 422.374C827.637 129.443 427.623 128.946 358.8 423.865C342.651 475.544 342.402 534.18 333.458 595.051C328.986 625.86 325.507 645.488 313.83 677.785C306.873 696.424 297.68 712.819 282.773 740.645C259.915 783.881 269.604 867.113 387.87 823.883L399.051 818.914H398.554Z"
        />
        <path
          fill="#000"
          d="M636.123 549.353C603.328 549.353 598.359 510.097 598.359 486.742C598.359 465.623 602.086 448.977 609.293 438.293C615.504 428.852 624.697 424.131 636.123 424.131C647.555 424.131 657.492 428.852 664.447 438.541C672.398 449.474 676.623 466.12 676.623 486.742C676.623 525.998 661.471 549.353 636.375 549.353H636.123Z"
        />
        <path
          fill="#000"
          d="M771.24 549.353C738.445 549.353 733.477 510.097 733.477 486.742C733.477 465.623 737.203 448.977 744.41 438.293C750.621 428.852 759.814 424.131 771.24 424.131C782.672 424.131 792.609 428.852 799.564 438.541C807.516 449.474 811.74 466.12 811.74 486.742C811.74 525.998 796.588 549.353 771.492 549.353H771.24Z"
        />
      </mask>
      <rect x="272" y="202" width="655" height="796" mask="url(#kiro-ghost-eyes)" />
    </svg>
  );
}
