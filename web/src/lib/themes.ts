/**
 * Dial themes, ported from the "v2 · Radial dial" design (SetAlarm.dc.html).
 * Colors ramp with the bet: p = range / 45.
 */

import { scallop } from "@/lib/scallop";

const SANS = "var(--font-geist-sans), sans-serif";
const SERIF = "var(--font-geist-serif), serif";
/** Geist Mono: Magic 8 Ball's terse oracle readout. */
const MONO = "var(--font-geist-mono), monospace";
/** Geist Serif's Triangle cut: every dot (i, j, colon, full stop) is a little triangle. */
const SERIF_TRIANGLE = "var(--font-geist-serif-triangle), var(--font-geist-serif), serif";
/** Geist Pixel's Square cut: every letter built from square pixels, like an arcade screen. */
const PIXEL = "var(--font-geist-pixel-square), var(--font-geist-mono), monospace";
/** Geist Serif's Heart cut: every dot (the colon in the time, the i in "quite") is a little heart. */
const SERIF_HEART = "var(--font-geist-serif-heart), var(--font-geist-serif), serif";

/**
 * A theme's wording. Templates can use {time} (the target time, e.g. "7:30 AM")
 * and {mins} (e.g. "8 minutes"); fill them with fillCopy().
 */
export type ThemeCopy = {
  /** Bet tiers, from no gamble to the full 45: 0, 1–11, 12–23, 24–35, 36–44, 45 min. */
  tiers: [string, string, string, string, string, string];
  /** While the target time blinks, just after Set Alarm. */
  setting: string;
  /** While the draw rolls. */
  rolling: string;
  /** Result title (shown as the badge). */
  win: string;
  loss: string;
  jackpot: string;
  /** Result line under the badge: time won or lost. */
  winLine: string;
  lossLine: string;
  jackpotLine: string;
};

export type Theme = {
  id: string;
  name: string;
  /** Left out of the theme picker and cycling (kept in code so it can come back). */
  hidden?: boolean;
  tagline: string;
  ink: string;
  muted: string;
  faint: string;
  /** a / b each ramp with the bet through two or more evenly spaced stops (0 → 45 min). */
  bg:
    | { kind: "flat"; from: string; to: string }
    | { kind: "radial"; a: string[]; b: string[] }
    /** Vertical sky: top colour a, bottom colour b. */
    | { kind: "linear"; a: string[]; b: string[] };
  arcStops: [string, string, string];
  disc: string;
  discShadow: string;
  track: string;
  /** A hairline drawn along both edges of the ring, over the arc. */
  trackEdge?: string;
  /** How the ring hairlines blend: multiply (darker, light themes) or screen (lighter, dark themes). */
  trackEdgeBlend?: "multiply" | "screen";
  /** The handle's inner edge and drop shadow take on deeper shades of the current arc colour. */
  tintedHandle?: boolean;
  /** Ring thickness in dial units (the dial is 358 wide). */
  trackWidth: number;
  /** How much the arc glows at full bet, 0..1. */
  glow: number;
  dash: string;
  notch: string;
  handle: string;
  /** If set, the handle's fill ramps through these with the bet instead of staying `handle`. */
  handleRamp?: [string, string, string];
  handleInk: string;
  handleBorder: string;
  titleFont: string;
  timeFont: string;
  timeColor: string;
  timeShadow: string;
  /** Whether the centre time glows in the arc colour as the bet grows (default true). */
  timeGlow?: boolean;
  scrim: string;
  sheet: string;
  chip: string;
  chipInk: string;
  chipOn: string;
  chipOnInk: string;
  btnOnBg: string;
  btnOnInk: string;
  btnOnShadow: string;
  btnOffBg: string;
  btnOffInk: string;
  btnOffShadow: string;
  /** Snooze (rang early) colour, and text on it. */
  win: string;
  winInk: string;
  /** Late colour, and text on it. */
  loss: string;
  lossInk: string;
  /** Right-on-time colour, and text on it (default: the Set alarm button's). */
  jackpotBadge?: { bg: string; ink: string };
  /** The bedside clock shown after "Set alarm". */
  clock: {
    panel: string;
    panelShadow: string;
    on: string;
    off: string;
    glow: string | null;
  };
  /**
   * Background scene. "sun": Classic's sunrise (clouds, birds, rays behind the dial).
   * "night": Night's city (moon, stars, bats, skyline, a halo behind the dial).
   * "muertos": Day of the Dead (papel picado, candles, marigolds, monarchs, a marigold
   * bloom behind the dial).
   * "ouija": a candlelit spirit board (sun, moon, candles, film grain, a letter ring round the dial).
   * "wheel": Prize wheel's game-show floor (spotlights, chips, coin rain, a sunburst behind the dial).
   * "poker": a card table (felt, padded rail, chip stacks, hole cards, lamplight on the dial).
   * "tarot": a tarot card come to life (sun and moon with faces, planets, engraved mountains,
   * flames and lightning as the bet climbs, a wheel of fortune behind the dial).
   * "digital": an 8-bit arcade screen (pixel starfield, a neon grid floor, power-ups, glitches as
   * the bet climbs, warp speed during the draw, pixel rings behind the dial).
   */
  /**
   * "eightball": a studio product shot (a near-black sweep, a key light with dust drifting through
   * it, bokeh, a giant glossy 8 ball behind the dial with the dial as its window).
   * "cafe": a Tuscan street café (an awning, swallows, a Vespa, a cat on the sill, cypress hills),
   * the dial a cappuccino on its saucer, steaming harder as the bet climbs.
   */
  decor:
    | "sun"
    | "night"
    | "muertos"
    | "ouija"
    | "wheel"
    | "poker"
    | "tarot"
    | "digital"
    | "eightball"
    | "cafe"
    | "none";
  /** Colours for the result flourishes: Zs drifting off a snooze, ring marks round a late one. */
  flourish?: { zzz: string; ring: string };
  /**
   * One small line icon per bet tier, shown beside the tier name. Each is a list of
   * SVG path strings on a 24-unit grid, stroked in the tier colour.
   */
  tierIcons?: [string[], string[], string[], string[], string[], string[]];
  /** A mascot with one face per bet tier, shown beside the tier name in place of the icon. */
  mascot?: "calavera" | "lucky" | "bit" | "moka";
  /** Tier name colour, ramping with the bet (defaults to the arc colour). */
  tierInk?: [string, string, string];
  /**
   * Minute ticks on the timeline: lit (inside the bet) ticks grow to `lit` × their height
   * (default 2), take colours from `ink` (default the arc), and fade towards their tips down
   * to `tip` opacity (default 0.15).
   */
  railTicks?: { lit?: number; ink?: [string, string, string]; tip?: number };
  /** The divider line under the hero, and the housing the Set alarm button sits in. */
  rail: string;
  /** The Set alarm push button. */
  /**
   * face: the button colour, the same whatever the bet.
   * ink is the label colour, swapped for white or near-black whenever that reads better on the face.
   */
  button: { face: string; ink: string };
  sparkGlyphs: string[];
  /** All the theme's wording: its personality. */
  copy: ThemeCopy;
  /** Decorations drawn on the disc. "calavera": a sugar skull's dot ring, flowers and hearts. */
  /** "wheel": prize-wheel wedges that light up with the bet, pegs, a hub and a pointer. */
  /** "chip": the dial as a giant poker chip (edge inserts round the rim, a dashed inlay, suits). */
  /** "tarot": the four minor arcana suits (wands, cups, swords, pentacles) inside a fine ring. */
  /** "pixel": an arcade screen (a square-pixel ring, PLAYER 1, three lives that drain as the bet grows). */
  /** "eightball": the 8 ball's die in the window, framing the time; it sinks into the murk as the bet grows. */
  /** "latte": latte art poured above the time (fancier with the bet, then stirred), a green band round the lip. */
  ornament?: "suits" | "ouija" | "calavera" | "wheel" | "chip" | "tarot" | "pixel" | "eightball" | "latte";
  /**
   * Draw the track as an LED bar graph: one segment per minute, each lit segment in the arc
   * colour for its own position (calm at the start, hot at the end), like a level meter.
   */
  segments?: boolean;
  /** A square, pixel-drawn handle and bell in place of the round one. */
  pixelHandle?: boolean;
  /** Marquee bulbs around the rim. */
  bulbs?: boolean;
  /** Bulb colours, lit and unlit, and the lit glow (default: gold bulbs). */
  bulbColors?: {
    on: string;
    off: string;
    glow: string;
    /** Every other lit bulb in this colour (with `chase`). */
    alt?: string;
    altGlow?: string;
    /** A marquee chase round the lit bulbs, and a glint travelling round the unlit ones. */
    chase?: boolean;
  };
};

const ALL_THEMES: Theme[] = [
  {
    id: "classic",
    name: "Good Morning",
    tagline: "Sunrise, one minute at a time",
    ink: "#432344",
    muted: "#5E4861",
    faint: "rgba(67,35,68,0.2)",
    // Pre-dawn lilac → first light → golden morning → full blaze
    bg: {
      kind: "linear",
      a: ["#CDD4F4", "#E6D9F1", "#FFDCD2", "#FFCDB4", "#FFBFA4"],
      b: ["#F6EEF4", "#FFEFE6", "#FFE6C2", "#FFD89C", "#FFC978"],
    },
    arcStops: ["#FFC03D", "#FF6B35", "#FF2E4D"],
    disc: "radial-gradient(circle at 38% 30%, #FFFFFF 0%, #FFFFFF 45%, #FFF6EE 100%)",
    discShadow:
      "14px 18px 40px rgba(67,35,68,0.14), -12px -12px 30px rgba(255,255,255,0.9), inset 0 -6px 18px rgba(255,170,120,0.12)",
    track: "#EEF1FB",
    trackEdge: "rgba(67,35,68,0.15)",
    tintedHandle: true,
    trackWidth: 26,
    glow: 1,
    dash: "none",
    notch: "#432344",
    handle: "#FFFFFF",
    // White → pale apricot → pale rose, a soft echo of the arc
    handleRamp: ["#FFFFFF", "#FFEFD9", "#FFDDE0"],
    handleInk: "#432344",
    handleBorder: "none",
    titleFont: SANS,
    timeFont: SANS,
    timeColor: "#432344",
    timeShadow: "none",
    // Crisp plum digits, no coloured glow behind them
    timeGlow: false,
    scrim: "rgba(67,35,68,0.45)",
    sheet: "#FFFFFF",
    chip: "#FFFFFF",
    chipInk: "#432344",
    chipOn: "#432344",
    chipOnInk: "#FFFFFF",
    btnOnBg: "#FFC03D",
    btnOnInk: "#432344",
    btnOnShadow: "0 10px 24px rgba(255,192,61,0.45)",
    btnOffBg: "#432344",
    btnOffInk: "#FFFFFF",
    btnOffShadow: "0 10px 24px rgba(67,35,68,0.25)",
    // Snooze: dawn rose. Late: hot orange.
    win: "#F59AB5",
    winInk: "#432344",
    loss: "#FF6B35",
    lossInk: "#2E1530",
    clock: {
      panel: "#FFFFFF",
      panelShadow: "0 18px 40px rgba(67,35,68,0.16), inset 0 -3px 0 rgba(67,35,68,0.06)",
      on: "#432344",
      off: "rgba(67,35,68,0.07)",
      glow: null,
    },
    decor: "sun",
    flourish: { zzz: "#D9547F", ring: "#FF6B35" },
    // Taller, barely faded, in the village's palette: lilac shade → rose roof → dawn rose
    railTicks: { lit: 2.6, ink: ["#8F82C4", "#A86F9E", "#C46A80"], tip: 0.7 },
    rail: "#432344",
    button: { face: "#FFC03D", ink: "#432344" },
    // The sunrise scene brings its own sparkle; no generic floating glyphs.
    sparkGlyphs: [],
    // Dusk violet → plum → deep plum rose, the village's own tones (its pre-dawn shade, doors and
    // rose roofs), getting darker as the bet grows: 4.8:1 or better on the sky at every bet
    tierInk: ["#6B5FA6", "#6A447A", "#58284C"],
    tierIcons: [
      // Play it safe: crescent moon
      ["M20.5 14.2A8.5 8.5 0 1 1 9.8 3.5a6.8 6.8 0 0 0 10.7 10.7z"],
      // A little spice: chilli
      [
        "M16.5 7.5c-3.5-.5-5.5 1.5-6.5 5S7 18.5 3.5 20c4.5 1.5 10-.5 12.5-4.5 1.8-2.9 1.6-6.4.5-8z",
        "M16.5 7.5c0-2 1-3.3 3-3.5",
      ],
      // Feeling lucky: four-leaf clover
      [
        "M12 12C9 12 6.5 10.5 6.5 8.2a2.3 2.3 0 0 1 4.6 0A2.3 2.3 0 0 1 12 12z",
        "M12 12c0-3 1.5-5.5 3.8-5.5a2.3 2.3 0 0 1 0 4.6A2.3 2.3 0 0 1 12 12z",
        "M12 12c3 0 5.5 1.5 5.5 3.8a2.3 2.3 0 0 1-4.6 0A2.3 2.3 0 0 1 12 12z",
        "M12 12c0 3-1.5 5.5-3.8 5.5a2.3 2.3 0 0 1 0-4.6A2.3 2.3 0 0 1 12 12z",
        "M12 12c1.5 2.5 2 5.5 1.5 9",
      ],
      // Risky business: a die
      [
        "M6 3.5h12A2.5 2.5 0 0 1 20.5 6v12a2.5 2.5 0 0 1-2.5 2.5H6A2.5 2.5 0 0 1 3.5 18V6A2.5 2.5 0 0 1 6 3.5z",
        "M8.5 8.5h.01M15.5 8.5h.01M12 12h.01M8.5 15.5h.01M15.5 15.5h.01",
      ],
      // Pure chaos: tornado
      ["M21 4H3", "M18.5 8h-13", "M19 12H9", "M16 16h-5.5", "M12.5 20H10"],
      // All in: flame
      [
        "M12 21.5c3.9 0 7-2.8 7-6.8 0-4.6-4.2-6.6-4.8-11.2-2.8 1.6-4.6 4.5-4.4 7.7-1.2-.6-2-1.8-2.2-3.2C6 9.6 5 11.9 5 14.7c0 4 3.1 6.8 7 6.8z",
        "M12 21.5c-1.7 0-3-1.2-3-3 0-2.2 3-4.5 3-4.5s3 2.3 3 4.5c0 1.8-1.3 3-3 3z",
      ],
    ],
    copy: {
      tiers: [
        "Play it safe",
        "A little spice",
        "Feeling lucky",
        "Risky business",
        "Pure chaos",
        "All in · full 45",
      ],
      setting: "Alarm set… or is it?",
      rolling: "Rolling the dice",
      win: "Snooze until {time}",
      loss: "No snooze. Up you get",
      jackpot: "Jackpot. Right on time",
      winLine: "You won {mins} of extra sleep",
      lossLine: "You lost {mins}",
      jackpotLine: "Not a minute won or lost",
    },
  },
  {
    id: "night",
    name: "Good Night",
    tagline: "Moonrise over a sleepless city",
    ink: "#E7EEFB",
    muted: "#C3B4C8",
    faint: "rgba(231,238,251,0.2)",
    // Quiet indigo → deep plum as the city gets more restless; it gets darker, not brighter,
    // so the full moon, the windows and the arc carry the heat
    bg: {
      kind: "radial",
      a: ["#241B45", "#261A47", "#2A1946", "#2F1843", "#33163E"],
      b: ["#0B0919", "#0B0918", "#0C0817", "#0D0715", "#0E0613"],
    },
    arcStops: ["#FFC03D", "#FF7A3D", "#FF3D5A"],
    disc: "radial-gradient(circle at 38% 30%, #34193B 0%, #2B1430 55%, #23102A 100%)",
    discShadow:
      "0 24px 60px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.08), inset 0 0 40px rgba(255,192,61,0.06)",
    track: "#43284E",
    // Light hairlines (screened) read on the dark ring
    trackEdge: "rgba(255,226,190,0.16)",
    trackEdgeBlend: "screen",
    tintedHandle: true,
    trackWidth: 26,
    glow: 1,
    dash: "none",
    notch: "#E7EEFB",
    handle: "#E7EEFB",
    // Moonlight → lamplight → neon pink
    handleRamp: ["#E7EEFB", "#FFE7B8", "#FFD0DA"],
    handleInk: "#432344",
    handleBorder: "none",
    titleFont: SANS,
    timeFont: SANS,
    timeColor: "#E7EEFB",
    timeShadow: "none",
    timeGlow: false,
    scrim: "rgba(10,3,12,0.6)",
    sheet: "#341A3A",
    chip: "#4A2A4F",
    chipInk: "#E7EEFB",
    chipOn: "#FFC03D",
    chipOnInk: "#432344",
    btnOnBg: "#FFC03D",
    btnOnInk: "#432344",
    btnOnShadow: "0 10px 24px rgba(255,192,61,0.35)",
    btnOffBg: "#E7EEFB",
    btnOffInk: "#432344",
    btnOffShadow: "0 10px 24px rgba(0,0,0,0.35)",
    // Snooze: lavender moonlight. Late: amber sunrise.
    win: "#C9B8FF",
    winInk: "#2E1535",
    loss: "#FFC03D",
    lossInk: "#2E1535",
    clock: {
      panel: "#140810",
      panelShadow: "0 24px 50px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.06)",
      on: "#FF4A3D",
      off: "rgba(255,74,61,0.08)",
      glow: "rgba(255,74,61,0.75)",
    },
    decor: "night",
    flourish: { zzz: "#C9B8FF", ring: "#FFC03D" },
    railTicks: { lit: 2.6, ink: ["#FFC03D", "#FF8A4D", "#FF5C7A"], tip: 0.7 },
    rail: "#FFC03D",
    // Deep night purple, set in the amber housing; moonlight text
    button: { face: "#3D1F5E", ink: "#F3EAFF" },
    // The night scene brings its own stars; no generic floating glyphs.
    sparkGlyphs: [],
    // Vivid on the dark sky: sodium-lamp gold → neon orange → neon pink
    tierInk: ["#FFD43B", "#FF9A3D", "#FF5FA2"],
    tierIcons: [
      // Lights out: a switched-off bulb
      [
        "M9 18h6",
        "M10 21h4",
        "M8.5 14.5a6 6 0 1 1 7 0c-.6.6-1 1.4-1 2.5h-5c0-1.1-.4-1.9-1-2.5z",
        "M3.5 3.5l17 17",
      ],
      // Restless: a bed, and someone tossing
      ["M3 19v-8", "M3 15h18v4", "M21 15v-2a3 3 0 0 0-3-3h-7v5", "M6.5 12.5h.01", "M13 5.5c1-1 2 1 3 0s2 1 3 0"],
      // Night owl: an owl
      [
        "M7 9.5a5 5 0 0 1 10 0V15a5 5 0 0 1-10 0z",
        "M7 9.5 6 4.5l3.5 2",
        "M17 9.5l1-5-3.5 2",
        "M10 11h.01",
        "M14 11h.01",
        "M11.2 13.5h1.6L12 14.7z",
      ],
      // Midnight gamble: a clock at twelve
      ["M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18z", "M12 12.5V7", "M12 12.5h.01"],
      // Insomnia: wide awake
      [
        "M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z",
        "M12 9.2a2.8 2.8 0 1 1 0 5.6 2.8 2.8 0 0 1 0-5.6z",
        "M12 1.8v1.6",
        "M5.6 3.6l.9 1.2",
        "M18.4 3.6l-.9 1.2",
      ],
      // Full moon madness: a full moon
      [
        "M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18z",
        "M9 6.9a1.6 1.6 0 1 1 0 3.2 1.6 1.6 0 0 1 0-3.2z",
        "M15 11.5a2 2 0 1 1 0 4 2 2 0 0 1 0-4z",
        "M9.5 16h.01",
      ],
    ],
    copy: {
      tiers: [
        "Lights out",
        "Restless",
        "Night owl",
        "Midnight gamble",
        "Insomnia",
        "Full moon madness",
      ],
      setting: "Tucked in… or are you?",
      rolling: "Counting sheep",
      win: "Back to sleep till {time}",
      loss: "Rise and shine. Now",
      jackpot: "Perfectly rested",
      winLine: "{mins} more under the covers",
      lossLine: "{mins} of sleep stolen",
      jackpotLine: "Not a minute stolen",
    },
  },
  {
    id: "muertos",
    name: "Día de Muertos",
    tagline: "Candles, marigolds and a little luck from the ancestors",
    ink: "#F6EBD3",
    muted: "#C9B9D6",
    faint: "rgba(246,235,211,0.22)",
    // Midnight navy → indigo → plum → rose as the fiesta heats up
    bg: {
      kind: "radial",
      a: ["#16244C", "#1C2152", "#2A1D55", "#3D1A52", "#55174A"],
      b: ["#060C1C", "#080C20", "#0C0A22", "#140A22", "#1E081E"],
    },
    // Marigold → candle orange → rosa mexicano
    arcStops: ["#FFC23D", "#FF7A1F", "#F0306E"],
    disc: "radial-gradient(circle at 38% 30%, #1E2A52 0%, #172146 55%, #111A38 100%)",
    discShadow:
      "0 24px 60px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.07), inset 0 0 40px rgba(255,140,40,0.08)",
    track: "#26305A",
    trackEdge: "rgba(255,226,190,0.14)",
    trackEdgeBlend: "screen",
    tintedHandle: true,
    trackWidth: 26,
    glow: 1,
    dash: "none",
    notch: "#F6EBD3",
    handle: "#F6EBD3",
    // Bone → marigold cream → rose
    handleRamp: ["#F6EBD3", "#FFE2A8", "#FFC9D6"],
    handleInk: "#1A1F3D",
    handleBorder: "none",
    titleFont: SANS,
    timeFont: SANS,
    timeColor: "#F6EBD3",
    timeShadow: "none",
    timeGlow: false,
    scrim: "rgba(4,6,16,0.65)",
    sheet: "#18224A",
    chip: "#26305A",
    chipInk: "#F6EBD3",
    chipOn: "#FFC23D",
    chipOnInk: "#1A1F3D",
    btnOnBg: "#FFC23D",
    btnOnInk: "#1A1F3D",
    btnOnShadow: "0 10px 24px rgba(255,194,61,0.35)",
    btnOffBg: "#F6EBD3",
    btnOffInk: "#1A1F3D",
    btnOffShadow: "0 10px 24px rgba(0,0,0,0.35)",
    // Snooze: sugar-skull teal. Late: rosa mexicano.
    win: "#3CC6B4",
    winInk: "#08202A",
    loss: "#F23C74",
    lossInk: "#1A0A14",
    // Right on time: marigold, as the navy button would vanish into the night sky
    jackpotBadge: { bg: "#FFC23D", ink: "#12193C" },
    clock: {
      panel: "#0A1024",
      panelShadow: "0 24px 50px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,194,61,0.12)",
      // Candlelight digits
      on: "#FF9A2E",
      off: "rgba(255,154,46,0.08)",
      glow: "rgba(255,140,40,0.7)",
    },
    decor: "muertos",
    flourish: { zzz: "#7FE3D3", ring: "#FF7A1F" },
    railTicks: { lit: 2.6, ink: ["#FFC23D", "#FF8A3D", "#FF5C8A"], tip: 0.7 },
    rail: "#FFC23D",
    // Midnight navy, like the sky at the top of the hero, set in the marigold housing so it
    // stands out from the rail, the candles and the white below. (Not teal or rosa: those are
    // the snooze and late results, and this face is also the on-time one.) White text, 17:1.
    button: { face: "#12193C", ink: "#FFFFFF" },
    // The scene brings its own petals and sparkles; no generic floating glyphs.
    sparkGlyphs: [],
    // Full-strength, not pastel, but kept light enough to read on the dark sky and the navy dial
    // (5:1 or better on both): sunflower → marigold → hot rosa
    tierInk: ["#FFE135", "#FFA21F", "#FF5CAB"],
    // The calavera's face changes with the tier, in place of the line icons below
    mascot: "calavera",
    tierIcons: [
      // Rest in peace: a headstone
      ["M6 21V9.5a6 6 0 0 1 12 0V21", "M3.5 21h17", "M12 8.5v7", "M9.5 11h5"],
      // Light a candle
      [
        "M8.5 11.5h7V21h-7z",
        "M12 11.5V9",
        "M12 9c-1.4 0-2.2-1-2.2-2.2C9.8 5 12 3 12 3s2.2 2 2.2 3.8C14.2 8 13.4 9 12 9z",
      ],
      // Follow the marigolds: a cempasúchil
      [scallop(12, 12, 6.4, 8, 1.05), "M12 9.8a2.2 2.2 0 1 1 0 4.4 2.2 2.2 0 0 1 0-4.4z"],
      // Dance with the dead: a skull
      [
        "M12 3a7.5 7.5 0 0 0-7.5 7.5c0 2.6 1.3 4.6 3 5.7V20h9v-3.8c1.7-1.1 3-3.1 3-5.7A7.5 7.5 0 0 0 12 3z",
        "M9 9.4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z",
        "M15 9.4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z",
        "M12 13.6l-.9 1.5h1.8z",
        "M10.3 20v-2.2M13.7 20v-2.2",
      ],
      // Raise the spirits: a monarch (the souls coming home)
      [
        "M12 8C10.5 4.5 4 3 4 7c0 2.4 2.4 4 5 4.5C6.6 12.5 6.2 17 9 17c1.6 0 2.5-2 3-4",
        "M12 8c1.5-3.5 8-5 8-1 0 2.4-2.4 4-5 4.5 2.4 1 2.8 5.5 0 5.5-1.6 0-2.5-2-3-4",
        "M12 8v10",
        "M12 8l-1.6-3.2M12 8l1.6-3.2",
      ],
      // Back from the dead: a bony hand out of the ground
      [
        "M3.5 21h17",
        "M12 21v-3.5",
        "M8.8 17.5h6.4",
        "M9.4 17.5l-.6-4.2M11 17.5V6M13 17.5V5.2M14.6 17.5l.4-9.5M15.4 15.5l2.6-3.2",
        "M8.8 13.3 7.2 10.5",
      ],
    ],
    copy: {
      tiers: [
        "Rest in peace",
        "Light a candle",
        "Follow the marigolds",
        "Dance with the dead",
        "Raise the spirits",
        "Back from the dead",
      ],
      setting: "The ofrenda is set…",
      rolling: "Rattling the bones",
      win: "Rest in peace till {time}",
      loss: "Rise from the dead. Now",
      jackpot: "The ancestors approve",
      winLine: "{mins} more six feet under",
      lossLine: "{mins} late to the fiesta",
      jackpotLine: "Right on time for the fiesta",
    },
    ornament: "calavera",
  },
  {
    id: "wheel",
    name: "Prize wheel",
    tagline: "Spin it to win it",
    ink: "#FFF4E0",
    muted: "#D9BCEB",
    faint: "rgba(255,244,224,0.22)",
    // Game-show violet → hot magenta as the room gets louder (muted text keeps 4.5:1 throughout)
    bg: {
      kind: "radial",
      a: ["#4A1A6E", "#5A1B77", "#6C1C7C", "#7F1D7C", "#931E76"],
      b: ["#14072A", "#1A072C", "#22072E", "#2B072D", "#35082B"],
    },
    // The wheel's lights: gold → orange → hot pink
    arcStops: ["#FFD23D", "#FF8A1F", "#FF3D8B"],
    disc: "radial-gradient(circle at 50% 38%, #3A1354 0%, #2A0C40 60%, #1F0832 100%)",
    discShadow: "0 24px 60px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,201,61,0.2)",
    track: "#3B1656",
    // Gold hairlines either side of the track, like the edge of a rim
    trackEdge: "rgba(255,214,120,0.24)",
    trackEdgeBlend: "screen",
    tintedHandle: true,
    trackWidth: 26,
    glow: 1,
    dash: "none",
    notch: "#FFD23D",
    handle: "#FFF4E0",
    // Cream → gold → candy pink
    handleRamp: ["#FFF4E0", "#FFE08A", "#FFC2DA"],
    handleInk: "#3A0F4A",
    handleBorder: "none",
    titleFont: SANS,
    timeFont: SANS,
    timeColor: "#FFF4E0",
    timeShadow: "none",
    scrim: "rgba(12,3,20,0.65)",
    sheet: "#2E1042",
    chip: "#4A1D66",
    chipInk: "#FFF4E0",
    chipOn: "#FFD23D",
    chipOnInk: "#3A0F4A",
    btnOnBg: "#FFD23D",
    btnOnInk: "#3A0F4A",
    btnOnShadow: "0 10px 24px rgba(255,210,61,0.4)",
    btnOffBg: "#FFF4E0",
    btnOffInk: "#3A0F4A",
    btnOffShadow: "0 10px 24px rgba(0,0,0,0.35)",
    // Snooze: a gold prize. Late: bankrupt pink.
    win: "#FFD23D",
    winInk: "#3A0F4A",
    // Bankrupt is black on the wheel
    loss: "#0E0316",
    lossInk: "#FFFFFF",
    clock: {
      panel: "#1A0828",
      panelShadow: "0 24px 50px rgba(0,0,0,0.5), inset 0 0 0 2px rgba(255,210,61,0.25)",
      on: "#FFD23D",
      off: "rgba(255,210,61,0.08)",
      glow: "rgba(255,190,60,0.7)",
    },
    decor: "wheel",
    flourish: { zzz: "#FFD23D", ring: "#FF5C8A" },
    railTicks: { lit: 2.6, ink: ["#FFD23D", "#FF8A3D", "#FF4D97"], tip: 0.7 },
    rail: "#FFD23D",
    // Gold → orange → hot pink, like the arc
    // A hot-pink buzzer, so it stands out from the gold rail it sits on
    button: { face: "#E0177A", ink: "#FFFFFF" },
    // The scene brings its own sparkle and chips; no generic floating glyphs.
    sparkGlyphs: [],
    // Vivid hot pink → orange → jackpot gold for the tier name and "+ 45 mins". Pink while the
    // room is dark violet, gold once it turns magenta, so each stays readable (4:1+ on the room)
    tierInk: ["#FF5CC8", "#FF9A2E", "#FFD93D"],
    // Shown only if the mascot is turned off (art/wheel/tier-icons.json)
    tierIcons: [
      // No spin: an unused ticket
      [
        "M 4 5 H 20 Q 22 5 22 7 V 9 Q 18 9 18 12 Q 18 15 22 15 V 17 Q 22 19 20 19 H 4 Q 2 19 2 17 V 15 Q 6 15 6 12 Q 6 9 2 9 V 7 Q 2 5 4 5 Z",
        "M 15 7 V 9 M 15 11 V 13 M 15 15 V 17",
      ],
      // Free spin: a coin with a sparkle
      [
        "M 22 12 A 10 10 0 1 1 2 12 A 10 10 0 1 1 22 12 Z",
        "M 12 6 L 14 10 L 18 12 L 14 14 L 12 18 L 10 14 L 6 12 L 10 10 Z",
      ],
      // Round and round: a prize wheel and its pointer
      [
        "M 12 6 L 9 2 H 15 Z",
        "M 21 13 A 9 9 0 1 1 3 13 A 9 9 0 1 1 21 13 Z",
        "M 12 4 V 11 M 14 13 H 21 M 12 15 V 22 M 3 13 H 10",
        "M 14 13 A 2 2 0 1 1 10 13 A 2 2 0 1 1 14 13 Z",
      ],
      // Bonus round: a star
      [
        "M 12 2 L 15.1 8.6 L 22 9.6 L 17 14.6 L 18.2 22 L 12 18.5 L 5.8 22 L 7 14.6 L 2 9.6 L 8.9 8.6 Z",
      ],
      // High stakes: a casino chip
      [
        "M 22 12 A 10 10 0 1 1 2 12 A 10 10 0 1 1 22 12 Z",
        "M 18 12 A 6 6 0 1 1 6 12 A 6 6 0 1 1 18 12 Z",
        "M 12 2 V 6 M 12 18 V 22 M 2 12 H 6 M 18 12 H 22",
      ],
      // Mega jackpot: a crown
      [
        "M 4 18 L 2 6 L 8 11 L 12 3 L 16 11 L 22 6 L 20 18 Z",
        "M 4 21 H 20",
      ],
    ],
    copy: {
      tiers: [
        "No spin",
        "Free spin",
        "Round and round",
        "Bonus round",
        "High stakes",
        "Mega jackpot",
      ],
      setting: "Place your bets…",
      rolling: "Round and round it goes",
      win: "You win! Snooze till {time}",
      loss: "Bankrupt. Up you get",
      jackpot: "Right on the pointer",
      winLine: "Prize: {mins} of extra sleep",
      lossLine: "The wheel took {mins}",
      jackpotLine: "No prize, no penalty",
    },
    ornament: "wheel",
    // Lucky the coin, one face per tier, beside the tier name
    mascot: "lucky",
    bulbs: true,
    // Cream bulbs on the gold rim; unlit ones are dark amber dimples
    bulbColors: {
      on: "#FFF8E1",
      off: "#B36A12",
      glow: "rgba(255,236,170,0.95)",
      alt: "#FF8FD2",
      altGlow: "rgba(255,120,200,0.95)",
      chase: true,
    },
  },
  {
    id: "slot",
    name: "Slot machine",
    hidden: true,
    tagline: "Marquee lights, jackpot at 45",
    ink: "#FFF3D6",
    muted: "#E0B48F",
    faint: "rgba(255,243,214,0.25)",
    bg: { kind: "radial", a: ["#9E1E1E", "#E03A2A"], b: ["#3A0606", "#8A1212"] },
    arcStops: ["#FFE28A", "#FFD23D", "#FFAE1F"],
    disc: "#5C0F0F",
    discShadow:
      "0 24px 50px rgba(0,0,0,0.5), inset 0 2px 0 rgba(255,217,102,0.3)",
    track: "#7A1A1A",
    trackWidth: 26,
    glow: 1,
    dash: "none",
    notch: "#FFD966",
    handle: "#FFD966",
    handleInk: "#7A1A1A",
    handleBorder: "none",
    titleFont: SANS,
    timeFont: SANS,
    timeColor: "#FFF3D6",
    timeShadow: "0 0 14px rgba(255,217,102,0.4)",
    scrim: "rgba(20,2,2,0.65)",
    sheet: "#5C0F0F",
    chip: "#7A1A1A",
    chipInk: "#FFF3D6",
    chipOn: "#FFD966",
    chipOnInk: "#5C0F0F",
    btnOnBg: "#FFD966",
    btnOnInk: "#5C0F0F",
    btnOnShadow: "0 10px 24px rgba(255,217,102,0.4)",
    btnOffBg: "#FFF3D6",
    btnOffInk: "#5C0F0F",
    btnOffShadow: "0 10px 24px rgba(0,0,0,0.35)",
    win: "#FFD966",
    winInk: "#5C0F0F",
    loss: "#2E0404",
    lossInk: "#FFD966",
    clock: {
      panel: "#2E0404",
      panelShadow: "0 24px 50px rgba(0,0,0,0.5), inset 0 0 0 2px rgba(255,217,102,0.25)",
      on: "#FFD966",
      off: "rgba(255,217,102,0.08)",
      glow: "rgba(255,217,102,0.6)",
    },
    decor: "none",
    rail: "#FFD966",
    button: { face: "#E03A2A", ink: "#FFF3D6" },
    sparkGlyphs: ["$"],
    copy: {
      tiers: [
        "Penny slots",
        "Pull the lever",
        "Hot streak",
        "High roller",
        "Tilt!",
        "Jackpot!",
      ],
      setting: "Coins in… here we go",
      rolling: "Reels spinning",
      win: "Winner! Snooze till {time}",
      loss: "Bust. Up you get",
      jackpot: "Triple sevens",
      winLine: "Payout: {mins} of sleep",
      lossLine: "The house takes {mins}",
      jackpotLine: "Right on the dot",
    },
    bulbs: true,
  },
  {
    id: "poker",
    name: "Poker",
    tagline: "Green felt, chips on the table",
    ink: "#F4EDD8",
    muted: "#C2D6C0",
    faint: "rgba(244,237,216,0.3)",
    // Club-room felt; as the stakes rise the lamp warms and the edges of the room go dark
    bg: {
      kind: "radial",
      a: ["#17683A", "#186A3A", "#1B6C3B", "#206E3C", "#28703D"],
      b: ["#0A341D", "#09301B", "#082A17", "#062313", "#051C0F"],
    },
    arcStops: ["#FFD966", "#FFAE42", "#FF4D4D"],
    // A deep green chip, lit from the lamp above
    disc: "radial-gradient(circle at 38% 30%, #1F6238 0%, #185030 55%, #134427 100%)",
    discShadow:
      "0 24px 50px rgba(0,0,0,0.5), inset 0 0 0 2px rgba(242,234,211,0.14), inset 0 -10px 24px rgba(0,0,0,0.25)",
    track: "#1D5C34",
    trackEdge: "rgba(255,236,190,0.12)",
    trackEdgeBlend: "screen",
    trackWidth: 26,
    glow: 0.8,
    dash: "none",
    notch: "#F4EDD8",
    // The handle is a red chip
    handle: "#D3343C",
    handleInk: "#FFFFFF",
    handleBorder: "3px dashed #FFFFFF",
    titleFont: SANS,
    timeFont: SANS,
    timeColor: "#F4EDD8",
    timeShadow: "none",
    scrim: "rgba(4,16,9,0.65)",
    sheet: "#174D2B",
    chip: "#1F6136",
    chipInk: "#F4EDD8",
    chipOn: "#FFD966",
    chipOnInk: "#174D2B",
    btnOnBg: "#FFD966",
    btnOnInk: "#174D2B",
    btnOnShadow: "0 10px 24px rgba(255,217,102,0.35)",
    btnOffBg: "#F4EDD8",
    btnOffInk: "#174D2B",
    btnOffShadow: "0 10px 24px rgba(0,0,0,0.35)",
    // Snooze: a gold chip. Late: a black one.
    win: "#FFD966",
    winInk: "#174D2B",
    loss: "#1B1B1F",
    lossInk: "#F4EDD8",
    clock: {
      panel: "#0B2A17",
      panelShadow: "0 24px 50px rgba(0,0,0,0.5), inset 0 0 0 2px rgba(242,234,211,0.14)",
      on: "#F4EDD8",
      off: "rgba(242,234,211,0.07)",
      glow: "rgba(242,234,211,0.3)",
    },
    decor: "poker",
    flourish: { zzz: "#FFD966", ring: "#FF6B5E" },
    railTicks: { lit: 2.6, ink: ["#FFD966", "#FFAE42", "#FF6B5E"], tip: 0.7 },
    rail: "#E2BC62",
    // A red chip of a button
    button: { face: "#D3343C", ink: "#FFFFFF" },
    // The table brings its own chips; no generic floating glyphs.
    sparkGlyphs: [],
    // Gold → amber → coral: light enough to read on the dark felt at the bottom of the hero
    tierInk: ["#FFE08A", "#FFB45C", "#FF8A7A"],
    tierIcons: [
      // Check: a tick
      ["M4.5 12.5l5 5L19.5 7"],
      // Small blind: one chip
      [
        "M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18z",
        "M12 7.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9z",
        "M12 3v3M12 18v3M3 12h3M18 12h3",
      ],
      // Call: two cards
      [
        "M8.5 6.5v-1a2 2 0 0 1 2-2H18a2 2 0 0 1 2 2V15a2 2 0 0 1-2 2h-2.5",
        "M6 6.5h7.5a2 2 0 0 1 2 2V19a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8.5a2 2 0 0 1 2-2z",
        "M9.75 11.2l1.9 2.55-1.9 2.55-1.9-2.55z",
      ],
      // Raise: a stack of chips going up
      [
        "M10 6.5c3.6 0 6.5 1.2 6.5 2.75S13.6 12 10 12 3.5 10.8 3.5 9.25 6.4 6.5 10 6.5z",
        "M3.5 9.25v8c0 1.5 2.9 2.75 6.5 2.75s6.5-1.25 6.5-2.75v-8",
        "M3.5 13.25c0 1.5 2.9 2.75 6.5 2.75s6.5-1.25 6.5-2.75",
        "M20.5 10V3.5M18 6l2.5-2.5L23 6",
      ],
      // Re-raise: up and up again
      ["M6 12.5l6-6 6 6", "M6 18.5l6-6 6 6"],
      // All in: the ace of spades
      [
        "M12 3C9 7 4 9.6 4 13.6a3.9 3.9 0 0 0 7 2.4L10 21h4l-1-5a3.9 3.9 0 0 0 7-2.4C20 9.6 15 7 12 3z",
      ],
    ],
    copy: {
      tiers: [
        "Check",
        "Small blind",
        "Call",
        "Raise",
        "Re-raise",
        "All in",
      ],
      setting: "Chips in… cards dealt",
      rolling: "Dealing the river",
      win: "Pot's yours. Snooze till {time}",
      loss: "Busted. Up you get",
      jackpot: "Split pot. Right on time",
      winLine: "You raked in {mins} of sleep",
      lossLine: "The river took {mins}",
      jackpotLine: "Not a minute won or lost",
    },
    ornament: "chip",
  },
  {
    id: "ouija",
    name: "Ouija",
    tagline: "Let the spirits pick",
    ink: "#ECE3CF",
    muted: "#A99C86",
    // Unlit ticks and the engravings on the disc: antique gold
    faint: "rgba(201,165,90,0.42)",
    // A candlelit board that smoulders: charcoal → smoke → embers as the spirits stir
    bg: {
      kind: "radial",
      a: ["#26221E", "#29221E", "#30211C", "#3A1E19", "#481A15"],
      b: ["#0D0B0A", "#0E0B0A", "#100B09", "#130A08", "#170907"],
    },
    // Antique gold → candle flame → ember
    arcStops: ["#D2AE62", "#F08A3C", "#E5432E"],
    disc: "radial-gradient(circle at 50% 32%, #221E1B 0%, #181512 58%, #110E0C 100%)",
    discShadow:
      "0 26px 60px rgba(0,0,0,0.7), inset 0 0 0 1px rgba(201,165,90,0.28), inset 0 0 0 7px rgba(17,14,12,1), inset 0 0 0 8px rgba(201,165,90,0.16), inset 0 0 48px rgba(0,0,0,0.55)",
    track: "#1F1B17",
    // Engraved gold hairlines along both edges of the ring
    trackEdge: "rgba(201,165,90,0.4)",
    trackEdgeBlend: "screen",
    tintedHandle: true,
    trackWidth: 22,
    glow: 1,
    dash: "none",
    notch: "#D2AE62",
    handle: "#ECE3CF",
    // Bone → parchment → scorched
    handleRamp: ["#ECE3CF", "#F3D9B0", "#F6C3A8"],
    handleInk: "#1A1410",
    handleBorder: "none",
    titleFont: SERIF_TRIANGLE,
    timeFont: SERIF_TRIANGLE,
    timeColor: "#ECE3CF",
    timeShadow: "0 0 18px rgba(240,138,60,0.18)",
    scrim: "rgba(6,4,3,0.74)",
    sheet: "#1A1613",
    chip: "#26201B",
    chipInk: "#ECE3CF",
    chipOn: "#D2AE62",
    chipOnInk: "#14100D",
    btnOnBg: "#D2AE62",
    btnOnInk: "#14100D",
    btnOnShadow: "0 10px 24px rgba(210,174,98,0.3)",
    btnOffBg: "#ECE3CF",
    btnOffInk: "#14100D",
    btnOffShadow: "0 10px 24px rgba(0,0,0,0.45)",
    // Snooze: the board says yes, in gold. Late: a blood-red no.
    win: "#E2C27E",
    winInk: "#14100D",
    loss: "#B8281F",
    lossInk: "#F6EBD9",
    clock: {
      panel: "#0E0B09",
      panelShadow: "0 24px 60px rgba(0,0,0,0.65), inset 0 0 0 1px rgba(201,165,90,0.3)",
      // Glowing like hot copper
      on: "#FF7A35",
      off: "rgba(255,122,53,0.08)",
      glow: "rgba(255,106,43,0.75)",
    },
    decor: "ouija",
    flourish: { zzz: "#E2C27E", ring: "#FF6A3D" },
    railTicks: { lit: 2.6, ink: ["#D2AE62", "#F08A3C", "#E5432E"], tip: 0.7 },
    rail: "#C9A55A",
    // Oxblood, set deep in the gold housing
    button: { face: "#5E140E", ink: "#F6EBD9" },
    // The board brings its own stars and candles; no generic floating glyphs.
    sparkGlyphs: [],
    // Bone white, warming to candlelit parchment and a pale ember blush
    tierInk: ["#F4EDDF", "#FBE3BF", "#FFCDB8"],
    tierIcons: [
      // The spirits rest: a closed eye
      [
        "M3 10.5c2.5 3.2 5.5 4.8 9 4.8s6.5-1.6 9-4.8",
        "M6 13.6 4.6 15.8",
        "M10 15.1l-.5 2.6",
        "M14 15.1l.5 2.6",
        "M18 13.6l1.4 2.2",
      ],
      // A faint whisper: a candle
      [
        "M9 11.5h6V21H9z",
        "M12 11.5V9.3",
        "M12 2.8c1.7 2 2.3 3.6 1.4 4.9a1.7 1.7 0 0 1-2.8 0c-.9-1.3-.3-2.9 1.4-4.9z",
        "M6.5 21h11",
      ],
      // Something stirs: a moth
      [
        "M12 7.5v10",
        "M12 9C10 5.5 5.5 4.2 4 6.6c-1.5 2.5 2.2 5.6 8 5",
        "M12 9c2-3.5 6.5-4.8 8-2.4 1.5 2.5-2.2 5.6-8 5",
        "M12 12.5c-2.8.2-6 2-5.3 4.2.6 2 3.8.8 5.3-1.5",
        "M12 12.5c2.8.2 6 2 5.3 4.2-.6 2-3.8.8-5.3-1.5",
        "M11.6 7.6c-.6-1.8-1.8-3-3.3-3.3",
        "M12.4 7.6c.6-1.8 1.8-3 3.3-3.3",
      ],
      // The planchette moves: a planchette
      [
        "M12 2.8 4.6 15a4.4 4.4 0 0 0 3.5 6.2c1.6.2 2.8-.4 3.9-1.4 1.1 1 2.3 1.6 3.9 1.4a4.4 4.4 0 0 0 3.5-6.2z",
        "M12 10.6a2.4 2.4 0 1 1 0 4.8 2.4 2.4 0 0 1 0-4.8z",
      ],
      // Possessed: the all-seeing eye
      [
        "M12 2.5 22 20H2z",
        "M7.2 14.6s1.9-2.9 4.8-2.9 4.8 2.9 4.8 2.9-1.9 2.9-4.8 2.9-4.8-2.9-4.8-2.9z",
        "M12 14.6h.01",
      ],
      // The spirits decide: a skull
      [
        "M12 2.8a7.6 7.6 0 0 0-7.6 7.6c0 2.6 1.3 4.4 3.1 5.5v3.3a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1v-3.3c1.8-1.1 3.1-2.9 3.1-5.5A7.6 7.6 0 0 0 12 2.8z",
        "M9.2 9.6a1.7 1.7 0 1 1 0 3.4 1.7 1.7 0 0 1 0-3.4z",
        "M14.8 9.6a1.7 1.7 0 1 1 0 3.4 1.7 1.7 0 0 1 0-3.4z",
        "M12 14.2l-.9 1.6h1.8z",
        "M10.5 20.2v-2.4M13.5 20.2v-2.4",
      ],
    ],
    copy: {
      tiers: [
        "The spirits rest",
        "A faint whisper",
        "Something stirs",
        "The planchette moves",
        "Possessed",
        "The spirits decide",
      ],
      setting: "The spirits are listening…",
      rolling: "Consulting the other side",
      win: "Sleep till {time}, say the spirits",
      loss: "The spirits say: rise",
      jackpot: "The spirits are pleased",
      winLine: "Granted {mins} of rest",
      lossLine: "Cursed with {mins} late",
      jackpotLine: "Not a minute disturbed",
    },
    ornament: "ouija",
  },
  {
    id: "tarot",
    name: "Tarot",
    tagline: "Let the cards decide",
    ink: "#17383A",
    muted: "#365A58",
    faint: "rgba(23,56,58,0.24)",
    // A vintage tarot print: mint sky over a cream horizon that blushes coral as the bet grows
    bg: {
      kind: "linear",
      a: ["#B4E0D6", "#A8DACE", "#9CD3C7", "#93CBBF", "#8AC2B7"],
      b: ["#EAF4EE", "#EEF2E4", "#F6EAD8", "#F8DCCB", "#F6C9B8"],
    },
    // Gold → coral → crimson
    arcStops: ["#E2AE4A", "#F07F68", "#D2445A"],
    // Cream card stock with a printed ink outline and a hard offset shadow
    disc: "radial-gradient(circle at 38% 30%, #FFFDF7 0%, #FBF4E6 55%, #F2E6CE 100%)",
    discShadow: "0 0 0 3px #17383A, 9px 11px 0 rgba(23,56,58,0.16)",
    track: "#ECE0C7",
    trackEdge: "rgba(23,56,58,0.55)",
    trackWidth: 24,
    glow: 0.3,
    dash: "none",
    notch: "#17383A",
    handle: "#FBF4E6",
    // Cream → pale gold → pale coral, a soft echo of the arc
    handleRamp: ["#FBF4E6", "#FCE9C4", "#FBD9CF"],
    handleInk: "#17383A",
    handleBorder: "2.5px solid #17383A",
    titleFont: SANS,
    timeFont: SERIF,
    timeColor: "#17383A",
    timeShadow: "none",
    timeGlow: false,
    scrim: "rgba(23,56,58,0.45)",
    sheet: "#FBF4E6",
    chip: "#EFE4CC",
    chipInk: "#17383A",
    chipOn: "#17383A",
    chipOnInk: "#FBF4E6",
    btnOnBg: "#E2AE4A",
    btnOnInk: "#17383A",
    btnOnShadow: "0 10px 24px rgba(226,174,74,0.4)",
    btnOffBg: "#17383A",
    btnOffInk: "#FBF4E6",
    btnOffShadow: "0 10px 24px rgba(23,56,58,0.25)",
    // Snooze: the sun's chartreuse. Late: coral.
    win: "#D7EA7B",
    winInk: "#17383A",
    loss: "#F07F68",
    lossInk: "#17383A",
    clock: {
      panel: "#FBF4E6",
      panelShadow: "0 0 0 3px #17383A, 8px 10px 0 rgba(23,56,58,0.16)",
      on: "#17383A",
      off: "rgba(23,56,58,0.07)",
      glow: null,
    },
    decor: "tarot",
    flourish: { zzz: "#2E6E6A", ring: "#D2445A" },
    railTicks: { lit: 2.6, ink: ["#B98318", "#D2553F", "#B32F45"], tip: 0.7 },
    rail: "#17383A",
    // The wheel's mint, with ink on it
    button: { face: "#9CD3C7", ink: "#17383A" },
    // The scene brings its own stars and planets; no generic floating glyphs.
    sparkGlyphs: [],
    // Teal deepening toward the ink, for the tier name and the "+ N mins" under the time. Not the
    // arc's colours (gold to crimson washes out on the blush horizon): dark enough to read on it.
    tierInk: ["#1D5A56", "#174A48", "#113A3A"],
    // One per card (the Devil's from art/tarot/tier-icons.json, the rest redrawn to read at 20px)
    tierIcons: [
      // Temperance: one cup pouring into another
      [
        "M3 4h7l-.8 3.6a2.7 2.7 0 0 1-5.4 0zM6.5 10.3V13M4.5 13h4",
        "M14 11h7l-.8 3.6a2.7 2.7 0 0 1-5.4 0zM17.5 17.3V20M15.5 20h4",
        "M10.5 4.2c3.6.4 5.9 2.6 6.4 5.6",
      ],
      // The Star: long and short points
      [
        "M12 2l.99 7.6 3.39-1.98-1.98 3.39L22 12l-7.6.99 1.98 3.39-3.39-1.98L12 22l-.99-7.6-3.39 1.98 1.98-3.39L2 12l7.6-.99-1.98-3.39 3.39 1.98z",
      ],
      // Wheel of Fortune
      [
        "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z",
        "M14.5 12a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z",
        "M12 3v6.5M12 14.5V21M3 12h6.5M14.5 12H21M5.6 5.6l4.6 4.6M13.8 13.8l4.6 4.6M5.6 18.4l4.6-4.6M13.8 10.2l4.6-4.6",
      ],
      // The Devil: a horned head
      [
        "M 6 10 C 3 9 2 5 4 2 C 4 6 8 5 9 8 M 18 10 C 21 9 22 5 20 2 C 20 6 16 5 15 8",
        "M 19 15 A 7 7 0 1 1 5 15 A 7 7 0 1 1 19 15 Z",
        "M 8 13 L 9 14 M 15 14 L 16 13 M 9 18 Q 12 20 15 18",
      ],
      // The Tower, struck by lightning
      [
        "M6 21.5 7 9V5h2.5v2h2V5h2v2h2V5H18v4l1 12.5z",
        "M10.5 21.5v-4a1.5 1.5 0 0 1 3 0v4",
        "M21.5 2 17 8.5h3.5L15.5 15",
      ],
      // The Fool: a jester's cap, bells on its points
      [
        "M6 19.5h12V22H6z",
        "M6.5 19.5C6.2 15.6 5.3 13.2 3 12.6c2.9-3 7-.6 7.6 6.9",
        "M17.5 19.5c.3-3.9 1.2-6.3 3.5-6.9-2.9-3-7-.6-7.6 6.9",
        "M10.2 19.5c-.3-6.5 1.3-12 5.6-15-1.1 4.8-1.6 9.6-1.6 15",
        "M3 15.2h.01M21 15.2h.01M17.6 4.2h.01",
      ],
    ],
    copy: {
      tiers: [
        "Temperance",
        "The Star",
        "Wheel of Fortune",
        "The Devil",
        "The Tower",
        "The Fool · full 45",
      ],
      setting: "Shuffling the deck…",
      rolling: "Drawing your card",
      win: "Upright. Sleep till {time}",
      loss: "Reversed. Rise now",
      jackpot: "The World",
      winLine: "The cards grant {mins} more sleep",
      lossLine: "Fate takes {mins}",
      jackpotLine: "Not a minute won or lost",
    },
    ornament: "tarot",
  },
  {
    id: "digital",
    name: "Digital",
    hidden: true,
    tagline: "Insert coin, press snooze",
    ink: "#E9FFF2",
    muted: "#9CCFB2",
    faint: "rgba(92,255,149,0.28)",
    // An arcade screen glowing phosphor green, overheating to magenta as the bet climbs
    // (muted text keeps 7:1 or better throughout)
    bg: {
      kind: "radial",
      a: ["#123A2C", "#123631", "#182A3A", "#2A1C40", "#3A1536"],
      b: ["#04120C", "#05110E", "#070E14", "#0C0816", "#120612"],
    },
    // A level meter: lime → yellow → hot pink
    arcStops: ["#3DFF7E", "#FFE135", "#FF3D8B"],
    // A dark CRT screen in a bezel: a phosphor hairline, a black gap and a fainter outer edge
    disc: "radial-gradient(circle at 50% 38%, #10291F 0%, #0C2219 55%, #07160F 100%)",
    discShadow:
      "0 0 0 2px rgba(92,255,149,0.38), 0 0 0 7px #06140E, 0 0 0 9px rgba(92,255,149,0.16), 0 26px 60px rgba(0,0,0,0.6), inset 0 0 44px rgba(61,255,126,0.1)",
    track: "#123A2A",
    trackWidth: 24,
    glow: 1,
    dash: "none",
    segments: true,
    pixelHandle: true,
    notch: "#E9FFF2",
    handle: "#0C2219",
    handleInk: "#E9FFF2",
    handleBorder: "none",
    titleFont: PIXEL,
    timeFont: PIXEL,
    timeColor: "#E9FFF2",
    timeShadow: "0 0 14px rgba(61,255,126,0.35)",
    timeGlow: true,
    scrim: "rgba(2,8,5,0.72)",
    sheet: "#0E271D",
    chip: "#163D2D",
    chipInk: "#E9FFF2",
    chipOn: "#3DFF7E",
    chipOnInk: "#06210F",
    btnOnBg: "#3DFF7E",
    btnOnInk: "#06210F",
    btnOnShadow: "0 10px 24px rgba(61,255,126,0.35)",
    btnOffBg: "#E9FFF2",
    btnOffInk: "#06210F",
    btnOffShadow: "0 10px 24px rgba(0,0,0,0.4)",
    // Snooze: an extra life in phosphor green. Late: game-over pink. On the dot: high-score gold.
    win: "#3DFF7E",
    winInk: "#06210F",
    loss: "#FF3D6E",
    lossInk: "#1A0610",
    jackpotBadge: { bg: "#FFE135", ink: "#1A1400" },
    clock: {
      panel: "#050F0A",
      panelShadow: "0 24px 50px rgba(0,0,0,0.55), inset 0 0 0 2px rgba(92,255,149,0.2)",
      on: "#3DFF7E",
      off: "rgba(61,255,126,0.07)",
      glow: "rgba(61,255,126,0.7)",
    },
    decor: "digital",
    flourish: { zzz: "#3DE0FF", ring: "#FF3D8B" },
    railTicks: { lit: 2.6, ink: ["#3DFF7E", "#FFE135", "#FF3D8B"], tip: 0.7 },
    rail: "#3DFF7E",
    // A candy-pink arcade button (Bit's own casing) in the phosphor-green housing: plum text, 6.2:1
    button: { face: "#FF4FA3", ink: "#1A0B24" },
    // The screen brings its own stars and power-ups; no generic floating glyphs.
    sparkGlyphs: [],
    // Phosphor green → coin yellow → hot pink, 4.9:1 or better on the screen at every bet
    tierInk: ["#5CFF95", "#FFE135", "#FF6FB5"],
    // Bit, a pocket LCD clock, pulls a face per tier in place of these
    mascot: "bit",
    // Shown only if the mascot is turned off (art/digital/tier-icons.json)
    tierIcons: [
      // Insert coin: a coin dropping into a slot
      [
        "M 4 15 H 20 V 21 H 4 Z",
        "M 8 18 H 16",
        "M 15 6 L 15 9 L 13 11 H 11 L 9 9 V 4 L 11 2 H 13 L 15 4 Z",
      ],
      // Easy mode: a joystick
      [
        "M 3 16 H 21 V 22 H 3 Z",
        "M 11 16 V 9 H 13 V 16",
        "M 8 3 H 16 V 9 H 8 Z",
        "M 16 19 H 18",
      ],
      // Level up: a chunky up arrow over two bars
      [
        "M 4 10 L 12 2 L 20 10 H 15 V 15 H 9 V 10 Z",
        "M 7 18 H 17 M 7 22 H 17",
      ],
      // Hard mode: a sword
      [
        "M 6 15 L 16 5 L 21 3 L 19 8 L 9 18 Z",
        "M 4 12 L 12 20 M 7 17 L 3 21 M 2 20 L 4 22",
      ],
      // Boss fight: a horned skull
      [
        "M 6 9 L 3 7 V 2 L 8 6 M 18 9 L 21 7 V 2 L 16 6",
        "M 6 8 H 18 L 20 10 V 16 L 17 18 V 22 H 7 V 18 L 4 16 V 10 Z",
        "M 8 12 H 10 V 14 H 8 Z M 14 12 H 16 V 14 H 14 Z",
        "M 11 17 H 13 M 10 19 V 22 M 14 19 V 22",
      ],
      // Final boss: a crown with a gem
      [
        "M 4 18 L 2 5 L 8 10 L 12 2 L 16 10 L 22 5 L 20 18 Z",
        "M 4 22 H 20",
        "M 12 11 L 15 14 L 12 17 L 9 14 Z",
      ],
    ],
    copy: {
      tiers: [
        "Insert coin",
        "Easy mode",
        "Level up",
        "Hard mode",
        "Boss fight",
        "Final boss · full 45",
      ],
      setting: "Player one ready…",
      rolling: "Now loading",
      win: "1UP! Snooze till {time}",
      loss: "Game over. Up you get",
      jackpot: "Perfect! Right on time",
      winLine: "Extra life: {mins} more sleep",
      lossLine: "{mins} late. Continue?",
      jackpotLine: "Flawless. Not a minute off",
    },
    ornament: "pixel",
  },
  {
    id: "eightball",
    name: "Magic 8 Ball",
    hidden: true,
    tagline: "Ask again in the morning",
    // Unlike the illustrated themes, a glossy studio product shot: one hue (cobalt) on black and
    // white, no warm colours anywhere, set in Geist Mono
    ink: "#EEF1FF",
    muted: "#9CA5C9",
    faint: "rgba(150,172,255,0.22)",
    // A black studio sweep, the ball's cobalt glow creeping into it as the bet grows
    bg: {
      kind: "radial",
      a: ["#14172A", "#141832", "#14193A", "#141A44", "#151B50"],
      b: ["#020205", "#020206", "#030308", "#03040B", "#04050F"],
    },
    // Cobalt → electric blue → ice: the window lighting up
    arcStops: ["#3A4DFF", "#4E8DFF", "#A6EEFF"],
    // The window: dark liquid behind glass, set into the ball (scenes/eightball-scene.tsx)
    disc: "radial-gradient(circle at 50% 42%, #17257C 0%, #0C164C 42%, #060B2A 78%, #02040F 100%)",
    discShadow:
      "inset 0 22px 44px rgba(0,0,0,0.75), inset 0 -10px 30px rgba(80,110,255,0.18), 0 0 0 2px #000000",
    track: "#0A1033",
    trackEdge: "rgba(150,175,255,0.2)",
    trackEdgeBlend: "screen",
    tintedHandle: true,
    // Thinner than the other themes' rings: finely machined
    trackWidth: 18,
    glow: 1,
    dash: "none",
    notch: "#EEF1FF",
    // A cue-ball white handle, cooling to ice
    handle: "#FFFFFF",
    handleRamp: ["#FFFFFF", "#E6EDFF", "#D2F4FF"],
    handleInk: "#06070D",
    handleBorder: "none",
    titleFont: MONO,
    timeFont: MONO,
    timeColor: "#FFFFFF",
    // Moulded into the die: a hard little shadow under the white
    timeShadow: "0 2px 0 rgba(2,4,20,0.45)",
    timeGlow: false,
    scrim: "rgba(2,3,9,0.74)",
    sheet: "#0D1024",
    chip: "#191D36",
    chipInk: "#EEF1FF",
    chipOn: "#3A4DFF",
    chipOnInk: "#FFFFFF",
    btnOnBg: "#3A4DFF",
    btnOnInk: "#FFFFFF",
    btnOnShadow: "0 10px 24px rgba(58,77,255,0.4)",
    btnOffBg: "#EEF1FF",
    btnOffInk: "#06070D",
    btnOffShadow: "0 10px 24px rgba(0,0,0,0.45)",
    // Snooze: the die's cobalt ("yes"). Late: stark white ("no"). On the dot: ice.
    win: "#3A4DFF",
    winInk: "#FFFFFF",
    loss: "#F2F4FF",
    lossInk: "#06070D",
    jackpotBadge: { bg: "#A6EEFF", ink: "#04121C" },
    clock: {
      panel: "#03050F",
      panelShadow: "0 24px 50px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(120,150,255,0.18)",
      on: "#EEF1FF",
      off: "rgba(238,241,255,0.06)",
      glow: "rgba(90,130,255,0.7)",
    },
    decor: "eightball",
    // No Zs or ring marks: the die beside the badge answers instead
    railTicks: { lit: 2.6, ink: ["#3A4DFF", "#2F7BEA", "#1AA6D6"], tip: 0.7 },
    rail: "#3A4DFF",
    // Glossy black, like the ball, set in the cobalt housing
    button: { face: "#0B0C12", ink: "#FFFFFF" },
    // The studio brings its own dust and bokeh; no generic floating glyphs.
    sparkGlyphs: [],
    // Pale ice blues: they read on the black studio and on the die behind the time (4:1 or better)
    tierInk: ["#BCC8FF", "#C8DBFF", "#D8F5FF"],
    // The die's face, answering; the full 45 is the ball itself
    tierIcons: [
      // It is certain: a tick
      ["M4 5.5h16a1 1 0 0 1 .86 1.5l-8 13.6a1 1 0 0 1-1.72 0L3.14 7A1 1 0 0 1 4 5.5z", "M9.3 10.3l1.9 1.9 3.6-3.8"],
      // Most likely: an arrow up
      ["M4 5.5h16a1 1 0 0 1 .86 1.5l-8 13.6a1 1 0 0 1-1.72 0L3.14 7A1 1 0 0 1 4 5.5z", "M12 13V8.6M9.9 10.7 12 8.6l2.1 2.1"],
      // Reply hazy: ripples
      [
        "M4 5.5h16a1 1 0 0 1 .86 1.5l-8 13.6a1 1 0 0 1-1.72 0L3.14 7A1 1 0 0 1 4 5.5z",
        "M8.7 9.3c1.1-.8 2.2.8 3.3 0s2.2.8 3.3 0",
        "M9.8 12.2c.75-.6 1.5.6 2.2 0s1.5.6 2.2 0",
      ],
      // Cannot predict now: a question mark
      [
        "M4 5.5h16a1 1 0 0 1 .86 1.5l-8 13.6a1 1 0 0 1-1.72 0L3.14 7A1 1 0 0 1 4 5.5z",
        "M10.3 9.2a1.75 1.75 0 1 1 2.4 1.6c-.45.2-.7.55-.7 1v.2",
        "M12 14.3h.01",
      ],
      // Very doubtful: a cross
      ["M4 5.5h16a1 1 0 0 1 .86 1.5l-8 13.6a1 1 0 0 1-1.72 0L3.14 7A1 1 0 0 1 4 5.5z", "M10.2 8.6l3.6 3.6M13.8 8.6l-3.6 3.6"],
      // The ball decides: the ball, with the die in its window
      ["M12 2.5a9.5 9.5 0 1 1 0 19 9.5 9.5 0 0 1 0-19z", "M8.6 9.4h6.8L12 15.3z"],
    ],
    copy: {
      tiers: [
        "It is certain",
        "Most likely",
        "Reply hazy",
        "Cannot predict now",
        "Very doubtful",
        "The ball decides · full 45",
      ],
      setting: "Give it a shake…",
      rolling: "The answer is rising",
      win: "Outlook good. Snooze till {time}",
      loss: "My sources say: get up",
      jackpot: "Without a doubt. On time",
      winLine: "You may rely on {mins} more sleep",
      lossLine: "{mins} late, as foretold",
      jackpotLine: "Not a minute either way",
    },
    ornament: "eightball",
  },
  {
    id: "cafe",
    name: "Caffè",
    hidden: true,
    tagline: "Espresso in the Tuscan sun",
    // A vintage Italian travel poster: espresso-brown ink on a morning sky that warms from pale
    // sage to apricot as the coffee gets stronger (ink 8:1 or better, muted 4.6:1 or better)
    ink: "#3A2418",
    muted: "#6A4632",
    faint: "rgba(58,36,24,0.22)",
    bg: {
      kind: "linear",
      a: ["#D6E4D8", "#E6E3CF", "#F5DCBE", "#F7CBA4", "#F2B486"],
      b: ["#FBF2E0", "#FCEDD5", "#FCE4C4", "#FAD7AE", "#F6C696"],
    },
    // Tuscany: olive → saffron → terracotta
    arcStops: ["#8E9F5C", "#E2A23B", "#C4512F"],
    // A cappuccino seen from above: foam, a ring of crema, then the cup's porcelain wall and lip
    disc: "radial-gradient(circle closest-side, #FFFBF2 0%, #FBF0DD 42%, #F5E2C3 62%, #EFD3AC 69%, #DDAE76 72%, #B97A44 74.6%, #8A5129 76.4%, #FFFDF8 76.7%, #FFFDF8 93%, #F1E7D7 100%)",
    discShadow: "0 0 0 1.5px rgba(58,36,24,0.32), 0 10px 22px rgba(58,36,24,0.2)",
    track: "#F1E7D7",
    trackEdge: "rgba(58,36,24,0.3)",
    tintedHandle: true,
    trackWidth: 26,
    glow: 0.35,
    dash: "none",
    notch: "#3A2418",
    handle: "#FFFBF2",
    // Porcelain → crema → a terracotta blush
    handleRamp: ["#FFFBF2", "#FBE8C6", "#F8D3C1"],
    handleInk: "#3A2418",
    handleBorder: "none",
    titleFont: SERIF_HEART,
    timeFont: SERIF_HEART,
    timeColor: "#3A2418",
    timeShadow: "none",
    timeGlow: false,
    scrim: "rgba(58,36,24,0.45)",
    sheet: "#FBF3E4",
    chip: "#FBF3E4",
    chipInk: "#3A2418",
    chipOn: "#3A2418",
    chipOnInk: "#FBF3E4",
    btnOnBg: "#E2A23B",
    btnOnInk: "#3A2418",
    btnOnShadow: "0 10px 24px rgba(226,162,59,0.4)",
    btnOffBg: "#3A2418",
    btnOffInk: "#FBF3E4",
    btnOffShadow: "0 10px 24px rgba(58,36,24,0.25)",
    // Snooze: sage, the café shut for riposo. Late: terracotta. On the dot: saffron.
    win: "#A8BC7E",
    winInk: "#3A2418",
    loss: "#B4462A",
    lossInk: "#FFF4E4",
    jackpotBadge: { bg: "#E8AE45", ink: "#3A2418" },
    clock: {
      panel: "#FBF3E4",
      panelShadow: "0 0 0 2.5px #3A2418, 7px 9px 0 rgba(58,36,24,0.14)",
      on: "#3A2418",
      off: "rgba(58,36,24,0.07)",
      glow: null,
    },
    decor: "cafe",
    flourish: { zzz: "#5E7A3A", ring: "#C4512F" },
    // On the white below the hero: olive → burnt saffron → terracotta (3.5:1 or better)
    railTicks: { lit: 2.6, ink: ["#6E7F41", "#B97A1C", "#B4462A"], tip: 0.7 },
    rail: "#3A2418",
    // Shutter green, set in the espresso housing
    button: { face: "#2F5D46", ink: "#FBF3E4" },
    // The street brings its own swallows and steam; no generic floating glyphs.
    sparkGlyphs: [],
    // Dark olive → burnt saffron → deep terracotta: 4:1 or better on the wheat field and the road
    tierInk: ["#55652F", "#8A4A12", "#9A3519"],
    // The moka pot pulls a face per tier in place of these
    mascot: "moka",
    tierIcons: [
      // Decaf: a cup, not a wisp of steam
      ["M5 9.5h12V14a6 6 0 0 1-12 0z", "M17 11h1.2a2.4 2.4 0 0 1 0 4.8H16.4", "M3 21h16"],
      // Latte: a tall glass in layers
      ["M7 3h10l-1.6 18H8.6z", "M7.9 10h8.2", "M8.4 15h7.2"],
      // Cappuccino: a heart in the foam
      ["M4 8h13v4.5a6.5 6.5 0 0 1-13 0z", "M17 9.5h1.3a2.5 2.5 0 0 1 0 5h-1.6", "M10.5 13.2c-.9-.7-2.2-1.5-2.2-2.5a1.1 1.1 0 0 1 2.2-.4 1.1 1.1 0 0 1 2.2.4c0 1-1.3 1.8-2.2 2.5z", "M2.5 21H18.5"],
      // Espresso: a demitasse, steaming
      ["M6.5 11h9v3a4.5 4.5 0 0 1-9 0z", "M15.5 12h1a2 2 0 0 1 0 4h-1.4", "M4 20h15", "M9.5 7.5c-1-1 1-2 0-3.5M12.5 7.5c-1-1 1-2 0-3.5"],
      // Doppio: two of them
      ["M2.5 12h7v2.5a3.5 3.5 0 0 1-7 0z", "M13 12h7v2.5a3.5 3.5 0 0 1-7 0z", "M1.5 20h9M12 20h9", "M6 8.5c-.8-.8.8-1.6 0-2.8M16.5 8.5c-.8-.8.8-1.6 0-2.8"],
      // The whole moka: a moka pot
      ["M9 2.5h6", "M6.5 5h11l-2 7h-7z", "M8.5 12h7", "M8.5 13.5h7l3 7.5H5.5z", "M17.5 6h3l-1.6 5.5", "M6.5 5 3.5 4"],
    ],
    copy: {
      tiers: [
        "Decaf",
        "Latte",
        "Cappuccino",
        "Espresso",
        "Doppio",
        "The whole moka · full 45",
      ],
      setting: "Putting the moka on…",
      rolling: "The moka's gurgling",
      win: "Dolce far niente till {time}",
      loss: "Andiamo! Up you get",
      jackpot: "Perfetto. Right on time",
      winLine: "{mins} more to sip slowly",
      lossLine: "{mins} late. Drink it standing",
      jackpotLine: "Not a drop spilled",
    },
    ornament: "latte",
  },
];

/** The themes on offer: everything not marked hidden. */
export const THEMES: Theme[] = ALL_THEMES.filter((t) => !t.hidden);

export const MAX_RANGE = 45;

type RGB = [number, number, number];

export function rgbOf(hex: string): RGB {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
}

export function mixHex(a: string, b: string, t: number): RGB {
  const A = rgbOf(a);
  const B = rgbOf(b);
  return [0, 1, 2].map((i) => Math.round(A[i] + (B[i] - A[i]) * t)) as RGB;
}

export const css = (c: RGB) => `rgb(${c[0]},${c[1]},${c[2]})`;
export const cssA = (c: RGB, a: number) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

/** WCAG relative luminance, 0 (black) to 1 (white). */
export function luminance(c: RGB | string): number {
  const [r, g, b] = (typeof c === "string" ? rgbOf(c) : c).map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio between two colours, 1 to 21. */
export function contrast(a: RGB | string, b: RGB | string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** Whether a colour is dark enough that light things read better on it than dark ones. */
export const isDark = (c: RGB | string) => luminance(c) < 0.179;

/** Evenly spaced stops, any count of two or more. */
export function rampN(stops: string[], t: number): RGB {
  const segs = stops.length - 1;
  const x = Math.max(0, Math.min(1, t)) * segs;
  const i = Math.min(segs - 1, Math.floor(x));
  return mixHex(stops[i], stops[i + 1], x - i);
}

export function ramp(stops: [string, string, string], t: number): RGB {
  return t <= 0.5
    ? mixHex(stops[0], stops[1], t * 2)
    : mixHex(stops[1], stops[2], (t - 0.5) * 2);
}

/** The solid colour at the bottom edge of the hero background (where the rail sits). */
export function edgeColor(theme: Theme, p: number): string {
  const { bg } = theme;
  if (bg.kind === "flat") return css(mixHex(bg.from, bg.to, p));
  return css(rampN(bg.b, p));
}

export function background(theme: Theme, p: number): string {
  const { bg } = theme;
  if (bg.kind === "flat") return css(mixHex(bg.from, bg.to, p));
  if (bg.kind === "linear")
    return `linear-gradient(180deg, ${css(rampN(bg.a, p))} 0%, ${css(rampN(bg.b, p))} 100%)`;
  return `radial-gradient(circle at 50% 20%, ${css(rampN(bg.a, p))} 0%, ${css(rampN(bg.b, p))} 100%)`;
}

/** Which bet tier a range falls in: 0 (no gamble) to 5 (the full 45). */
export function tierIndex(range: number): 0 | 1 | 2 | 3 | 4 | 5 {
  if (range === 0) return 0;
  if (range < 12) return 1;
  if (range < 24) return 2;
  if (range < 36) return 3;
  if (range < 45) return 4;
  return 5;
}

export function tierLabel(range: number, theme: Theme): string {
  return theme.copy.tiers[tierIndex(range)];
}

/** Fill a copy template's {time} and {mins} placeholders. */
export function fillCopy(template: string, vars: { time?: string; mins?: string } = {}): string {
  return template.replace(/\{(time|mins)\}/g, (_, key: "time" | "mins") => vars[key] ?? "");
}

/** A single representative background colour (for swatches). */
export function baseColor(theme: Theme): string {
  return theme.bg.kind === "flat" ? theme.bg.from : theme.bg.a[0];
}
