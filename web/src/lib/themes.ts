/**
 * Dial themes, ported from the "v2 · Radial dial" design (SetAlarm.dc.html).
 * Colors ramp with the bet: p = range / 45.
 */

const SANS = "var(--font-geist-sans), sans-serif";
const SERIF = "var(--font-geist-serif), serif";
const MONO = "var(--font-geist-mono), monospace";


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
  /** The bedside clock shown after "Set alarm". */
  clock: {
    panel: string;
    panelShadow: string;
    on: string;
    off: string;
    glow: string | null;
  };
  /** Background decoration. "sun" is the full sunrise scene (moon, clouds, birds, rays). */
  decor: "sun" | "stars" | "none";
  /**
   * One small line icon per bet tier, shown beside the tier name. Each is a list of
   * SVG path strings on a 24-unit grid, stroked in the tier colour.
   */
  tierIcons?: [string[], string[], string[], string[], string[], string[]];
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
   * face: the button colour; with ramp, it moves through those stops as the bet grows instead.
   * ink is the label colour, swapped for white or near-black whenever that reads better on the face.
   */
  button: {
    face: string;
    ink: string;
    ramp?: [string, string, string];
    /** Bet (minutes) from which the label turns white, overriding the automatic contrast pick. */
    whiteFrom?: number;
  };
  sparkGlyphs: string[];
  /** All the theme's wording: its personality. */
  copy: ThemeCopy;
  /** Decorations drawn on the disc. */
  ornament?: "suits" | "ouija";
  /** Marquee bulbs around the rim. */
  bulbs?: boolean;
};

export const THEMES: Theme[] = [
  {
    id: "classic",
    name: "Classic",
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
    // Taller, deeper, barely faded: the window reads clearly on the light sky
    railTicks: { lit: 2.6, ink: ["#C97A00", "#C2410C", "#B3153F"], tip: 0.7 },
    rail: "#432344",
    // Warms from gold through orange to crimson as the bet grows (text turns white once it's dark)
    button: {
      face: "#FFC03D",
      ink: "#432344",
      ramp: ["#FFC03D", "#FF8A3D", "#E5304F"],
      whiteFrom: 25,
    },
    // The sunrise scene brings its own sparkle; no generic floating glyphs.
    sparkGlyphs: [],
    // Golden amber → rust → deep crimson: same direction as the arc, but deep enough to read on
    // the sky (3.4:1 or better at every bet, past the 3:1 bar for large bold text)
    tierInk: ["#B86E00", "#B23A0A", "#A8123A"],
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
    name: "Night",
    tagline: "Plum and amber, after dark",
    ink: "#E7EEFB",
    muted: "#C3B4C8",
    faint: "rgba(231,238,251,0.2)",
    bg: { kind: "radial", a: ["#34183D", "#6B1430"], b: ["#120716", "#2A0612"] },
    arcStops: ["#FFC03D", "#FF7A3D", "#FF3D5A"],
    disc: "#2B1430",
    discShadow:
      "0 24px 60px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.08), inset 0 0 40px rgba(255,192,61,0.06)",
    track: "#4A2A4F",
    trackWidth: 26,
    glow: 1,
    dash: "none",
    notch: "#E7EEFB",
    handle: "#E7EEFB",
    handleInk: "#432344",
    handleBorder: "none",
    titleFont: SANS,
    timeFont: SANS,
    timeColor: "#E7EEFB",
    timeShadow: "none",
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
    decor: "stars",
    rail: "#FFC03D",
    button: { face: "#F5F0FF", ink: "#432344" },
    sparkGlyphs: ["✦"],
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
    id: "slot",
    name: "Slot machine",
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
    id: "casino",
    name: "Casino felt",
    tagline: "Green felt and card suits",
    ink: "#F2EAD3",
    muted: "#A9C3A8",
    faint: "rgba(242,234,211,0.3)",
    bg: { kind: "radial", a: ["#237440", "#36A05C"], b: ["#0B2A17", "#1B5A2F"] },
    arcStops: ["#FFD966", "#FFAE42", "#FF4D4D"],
    disc: "#174D2B",
    discShadow:
      "0 24px 50px rgba(0,0,0,0.5), inset 0 0 0 2px rgba(242,234,211,0.14)",
    track: "#1F6136",
    trackWidth: 26,
    glow: 0.8,
    dash: "none",
    notch: "#F2EAD3",
    handle: "#E03A3A",
    handleInk: "#FFFFFF",
    handleBorder: "3px dashed #FFFFFF",
    titleFont: SANS,
    timeFont: SANS,
    timeColor: "#F2EAD3",
    timeShadow: "none",
    scrim: "rgba(4,16,9,0.65)",
    sheet: "#174D2B",
    chip: "#1F6136",
    chipInk: "#F2EAD3",
    chipOn: "#FFD966",
    chipOnInk: "#174D2B",
    btnOnBg: "#FFD966",
    btnOnInk: "#174D2B",
    btnOnShadow: "0 10px 24px rgba(255,217,102,0.35)",
    btnOffBg: "#F2EAD3",
    btnOffInk: "#174D2B",
    btnOffShadow: "0 10px 24px rgba(0,0,0,0.35)",
    win: "#FFD966",
    winInk: "#174D2B",
    loss: "#1B1B1B",
    lossInk: "#F2EAD3",
    clock: {
      panel: "#0B2A17",
      panelShadow: "0 24px 50px rgba(0,0,0,0.5), inset 0 0 0 2px rgba(242,234,211,0.14)",
      on: "#F2EAD3",
      off: "rgba(242,234,211,0.07)",
      glow: "rgba(242,234,211,0.3)",
    },
    decor: "none",
    rail: "#FFD966",
    button: { face: "#E03A3A", ink: "#FFFFFF" },
    sparkGlyphs: ["♠", "♥", "♦", "♣"],
    copy: {
      tiers: [
        "Fold",
        "Small blind",
        "Call",
        "Raise",
        "Double down",
        "All in",
      ],
      setting: "Cards dealt…",
      rolling: "Shuffling the deck",
      win: "Dealer busts. Snooze till {time}",
      loss: "House wins. Up you get",
      jackpot: "Blackjack",
      winLine: "You took {mins} off the table",
      lossLine: "You're down {mins}",
      jackpotLine: "Dead even with the house",
    },
    ornament: "suits",
  },
  {
    id: "ouija",
    name: "Ouija",
    tagline: "Let the spirits pick",
    ink: "#E9DFC8",
    muted: "#9C8FB0",
    faint: "rgba(233,223,200,0.35)",
    bg: { kind: "radial", a: ["#2C2244", "#1E5243"], b: ["#0B0714", "#041A10"] },
    arcStops: ["#A7F3C7", "#7CF5B2", "#3DF08D"],
    disc: "#1D1430",
    discShadow: "0 24px 60px rgba(0,0,0,0.6)",
    track: "#2E2348",
    trackWidth: 22,
    glow: 1,
    dash: "none",
    notch: "#E9DFC8",
    handle: "#E9DFC8",
    handleInk: "#1D1430",
    handleBorder: "none",
    titleFont: SERIF,
    timeFont: SERIF,
    timeColor: "#E9DFC8",
    timeShadow: "0 0 16px rgba(124,245,178,0.35)",
    scrim: "rgba(5,2,10,0.7)",
    sheet: "#241A3C",
    chip: "#2E2348",
    chipInk: "#E9DFC8",
    chipOn: "#A7F3C7",
    chipOnInk: "#1D1430",
    btnOnBg: "#A7F3C7",
    btnOnInk: "#1D1430",
    btnOnShadow: "0 10px 24px rgba(124,245,178,0.3)",
    btnOffBg: "#E9DFC8",
    btnOffInk: "#1D1430",
    btnOffShadow: "0 10px 24px rgba(0,0,0,0.4)",
    win: "#A7F3C7",
    winInk: "#1D1430",
    loss: "#9C7CF0",
    lossInk: "#1D1430",
    clock: {
      panel: "#0B0714",
      panelShadow: "0 24px 60px rgba(0,0,0,0.6)",
      on: "#A7F3C7",
      off: "rgba(167,243,199,0.07)",
      glow: "rgba(124,245,178,0.6)",
    },
    decor: "none",
    rail: "#A7F3C7",
    button: { face: "#1D1430", ink: "#A7F3C7" },
    sparkGlyphs: ["✦", "✧"],
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
    id: "digital",
    name: "Digital",
    tagline: "LED bedside clock",
    ink: "#B7FFC9",
    muted: "#5E8F6B",
    faint: "rgba(61,255,126,0.25)",
    bg: { kind: "flat", from: "#060A06", to: "#1E0505" },
    arcStops: ["#3DFF7E", "#FFD23D", "#FF3D3D"],
    disc: "#0A120B",
    discShadow:
      "0 0 0 1px rgba(61,255,126,0.18), 0 20px 40px rgba(0,0,0,0.6)",
    track: "#122A1A",
    trackWidth: 26,
    glow: 1,
    dash: "4 6",
    notch: "#3DFF7E",
    handle: "#0A120B",
    handleInk: "#3DFF7E",
    handleBorder: "2px solid #3DFF7E",
    titleFont: MONO,
    timeFont: MONO,
    timeColor: "#3DFF7E",
    timeShadow: "0 0 12px rgba(61,255,126,0.6)",
    scrim: "rgba(0,0,0,0.7)",
    sheet: "#0C140D",
    chip: "#122A1A",
    chipInk: "#B7FFC9",
    chipOn: "#3DFF7E",
    chipOnInk: "#062812",
    btnOnBg: "#3DFF7E",
    btnOnInk: "#062812",
    btnOnShadow: "0 10px 24px rgba(61,255,126,0.35)",
    btnOffBg: "#122A1A",
    btnOffInk: "#B7FFC9",
    btnOffShadow: "0 0 0 1px rgba(61,255,126,0.3)",
    win: "#3DFF7E",
    winInk: "#062812",
    loss: "#FFB020",
    lossInk: "#1A1000",
    clock: {
      panel: "#040704",
      panelShadow: "0 0 0 1px rgba(61,255,126,0.18), 0 20px 40px rgba(0,0,0,0.6)",
      on: "#3DFF7E",
      off: "rgba(61,255,126,0.07)",
      glow: "rgba(61,255,126,0.7)",
    },
    decor: "none",
    rail: "#3DFF7E",
    button: { face: "#0A120B", ink: "#3DFF7E" },
    sparkGlyphs: ["▮", "▯"],
    copy: {
      tiers: [
        "Standby",
        "Low risk",
        "Nominal",
        "Elevated",
        "Overclocked",
        "Max risk",
      ],
      setting: "Alarm armed… pending",
      rolling: "Computing offset",
      win: "Snooze extended to {time}",
      loss: "Snooze disabled. Wake now",
      jackpot: "Sync perfect",
      winLine: "+{mins} sleep acquired",
      lossLine: "−{mins} time deficit",
      jackpotLine: "Zero offset detected",
    },
  },
];

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
