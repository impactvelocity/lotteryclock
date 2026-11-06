/**
 * Tarot's background: a vintage tarot card that comes to life as the bet climbs the Major Arcana.
 * Ported from web/src/components/scenes/tarot-scene.tsx.
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
 * cards, reversed; a jackpot crowns the dial with The World's laurel wreath.
 *
 * The web hero has a headline and paragraph to keep clear of; here the sky things sit in the
 * corners round the dial instead (placed by angle and distance from its centre, so they clear the
 * Wheel of Fortune at any dial size), and the cloud bank and card fans sit on the rail.
 */
import { useMemo, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { css, cubicBezier, FadeOut } from 'react-native-reanimated';
import Svg, { Circle, G, Line, Path } from 'react-native-svg';

import { frac } from '@/lib/rand';
import { css as rgb, cssA, rampN } from '@/themes/themes';

import { KF, loop } from '../anim';
import type { BackdropProps, DialLayerProps, DialSpot, SceneMood, SceneProps, ThemeKit } from '../types';
import {
  Bolt,
  MOON_MOODS,
  Planet,
  POP_KF,
  SeeingEye,
  Sparkle,
  STRIKE_KF,
  TA,
  TarotCard,
  TarotCloud,
  TarotMoon,
  TarotSun,
  useTurning,
} from './art';
import { MOON_FACES, MOON_RAYS, SUIT_PATHS, SUN_FACES, SUN_RAYS, WHEEL_BAND, WREATH_LEAVES, WREATH_RIBBONS } from './svg';

const clamp = (n: number) => Math.max(0, Math.min(1, n));
/** A point `r` from the dial's centre at `deg` (0 = up, clockwise), in scene pt. */
const around = (dial: DialSpot, deg: number, r: number) => {
  const a = (deg * Math.PI) / 180;
  return { x: dial.x + r * dial.size * Math.sin(a), y: dial.y - r * dial.size * Math.cos(a) };
};

const STAR_FILLS = [TA.chartreuse, TA.cream, TA.gold, TA.cream];
/**
 * Stars come out in a fixed order (`order`), so the same ones are always first. They keep to the
 * open sky in the corners round the dial (fewer than the web's 30: a phone has less of it); where
 * exactly is worked out per screen by placeStars().
 */
const STARS = Array.from({ length: 20 }, (_, i) => ({
  size: Math.round(9 + frac(i, 93) * 9),
  eight: frac(i, 94) > 0.62,
  fill: STAR_FILLS[i % STAR_FILLS.length],
  delay: -frac(i, 95) * 4,
  dur: 2.4 + frac(i, 96) * 2.6,
  order: frac(i, 97),
}));

type Spot = { x: number; y: number; r: number };

/**
 * A spot for each star, from the picker down to the dial's foot: either side, clear of the
 * Wheel of Fortune (as it rests: a big bet's wheel rises out over the nearest), of the sun, moon
 * and planets, and of each other. Deterministic: each star tries a fixed run of candidates and
 * keeps the first that fits (or stays in, if none does).
 */
function placeStars(width: number, dial: DialSpot) {
  const { orb, moon, sun, planets } = sky(dial);
  const keepOut: Spot[] = [{ ...moon, r: orb / 2 }, { ...sun, r: orb / 2 }, ...planets];
  const wheel = dial.size * 0.575 + 2;
  const top = dial.y - dial.size / 2 - 40;
  const bottom = dial.y + dial.size / 2;
  const placed: Spot[] = [];
  return STARS.map((s, i) => {
    const r = s.size / 2;
    for (let k = 0; k < 20; k++) {
      const m = 4 + r + frac(i, 91 + k * 11) * width * 0.34;
      const x = i % 2 ? width - m : m;
      const y = top + frac(i, 92 + k * 11) * (bottom - top);
      const clear = (o: Spot) => Math.hypot(x - o.x, y - o.y) > o.r + r + 2;
      if (Math.hypot(x - dial.x, y - dial.y) > wheel + r && keepOut.every(clear) && placed.every(clear)) {
        placed.push({ x, y, r });
        return { x, y };
      }
    }
    return null;
  });
}

/** Cloud tracks (% of the scene's height): one past the picker, two that pass behind the dial. */
const CLOUDS = [
  { top: 15, w: 160, dur: 150, delay: -30, kind: 0 },
  { top: 42, w: 118, dur: 115, delay: -82, kind: 1 },
  { top: 57, w: 200, dur: 185, delay: -140, kind: 2 },
];

/**
 * Planets hang in the corners round the dial (angle, distance in dial widths), out past the
 * Wheel of Fortune: the first two below the dial, the next two up by the picker.
 */
const PLANETS = [
  { deg: -132, r: 0.66, kind: 0, size: 40, bob: 4.2 },
  { deg: 128, r: 0.65, kind: 1, size: 36, bob: 3.6 },
  { deg: -33, r: 0.66, kind: 2, size: 28, bob: 5 },
  { deg: 31, r: 0.65, kind: 3, size: 28, bob: 4.6 },
];
const PLANETS_AT = [0, 0, 2, 3, 4, 4];

/** The sun and moon sit in the top corners, beside the dial and below the picker; the planets round it. */
function sky(dial: DialSpot) {
  return {
    orb: Math.round(Math.max(44, Math.min(60, dial.size * 0.16))),
    moon: around(dial, -46, 0.68),
    sun: around(dial, 46, 0.68),
    planets: PLANETS.map((pl) => ({ ...around(dial, pl.deg, pl.r), r: pl.size / 2 })),
  };
}

/**
 * Lightning, per side: a tall bolt under the moon / sun, hugging the wheel. (The web's short
 * second bolt is desktop-only: like a phone's web page, there's no room for it here.)
 */
const BOLTS = [{ tall: true, deg: -63, r: 0.63, w: 26, dur: 4.2, delay: 0.3 }];

function TarotScene({ p, tier, mood, width, height, dial }: SceneProps) {
  // A snooze settles the cards down; a late result brings the whole storm.
  const lively = clamp(mood === 'win' ? p * 0.25 : mood === 'loss' ? Math.max(p, 0.8) : p);
  const sunFace = mood === 'win' ? 0 : mood === 'loss' ? 4 : mood === 'jackpot' ? 5 : tier;
  const starsOut =
    mood === 'win' ? 0.85 : mood === 'jackpot' ? 1 : mood === 'loss' ? 0.2 : tier === 0 ? 0.14 : 0.3 + p * 0.7;
  const planets = mood === 'jackpot' ? PLANETS.length : mood === 'win' ? 1 : PLANETS_AT[tier];
  const storm = mood === 'loss' || (mood !== 'win' && mood !== 'jackpot' && tier >= 4);
  const fast = mood === 'loss' || tier === 5;
  // The front cards turn over at The Fool, and for every result
  const reading = mood === 'win' || mood === 'loss' || mood === 'jackpot' || tier === 5;
  const aura = rampN([TA.gold, TA.coral, '#D2445A'], lively);
  const glow = 0.12 + lively * 0.26 + (mood === 'loss' ? 0.12 : 0);

  const { orb, moon, sun, planets: planetAt } = sky(dial);
  // Clouds drift right across, starting just off the left edge
  const drift = useMemo(
    () =>
      css.keyframes({
        from: { transform: [{ translateX: -320 }] },
        to: { transform: [{ translateX: width + 40 }] },
      }),
    [width],
  );
  const { x, y, size } = dial;
  const stars = useMemo(() => placeStars(width, { x, y, size }), [width, x, y, size]);

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { overflow: 'hidden' }]}>
      {/* Warm light rising off the horizon */}
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: height * 0.5,
          backgroundImage: `radial-gradient(ellipse 80% 75% at 50% 100%, ${cssA(aura, glow)} 0%, ${cssA(aura, glow * 0.35)} 45%, ${cssA(aura, 0)} 78%)`,
        }}
      />

      {/* Stars come out as the bet grows */}
      {STARS.map((s, i) => {
        const at = stars[i];
        if (!at) return null;
        return (
          <Animated.View
            key={i}
            style={{
              position: 'absolute',
              left: at.x - s.size / 2,
              top: at.y - s.size / 2,
              opacity: s.order < starsOut ? 1 : 0,
              transitionProperty: 'opacity',
              transitionDuration: 500,
            }}
          >
            <Animated.View style={loop(KF.twinkle, s.dur, { delay: s.delay })}>
              <Sparkle eight={s.eight} size={s.size} fill={s.fill} />
            </Animated.View>
          </Animated.View>
        );
      })}

      {/* Clouds drift across; they clear once the alarm's set, so they never cross the clock */}
      {CLOUDS.map((c, i) => (
        <Animated.View
          key={i}
          style={{
            position: 'absolute',
            left: 0,
            top: (c.top / 100) * height,
            opacity: mood === 'idle' ? 1 : 0,
            transitionProperty: 'opacity',
            transitionDuration: 600,
            transitionTimingFunction: 'ease-out',
          }}
        >
          <Animated.View
            style={{
              animationName: drift,
              animationDuration: `${c.dur}s`,
              animationDelay: `${c.delay}s`,
              animationIterationCount: 'infinite',
              animationTimingFunction: 'linear',
            }}
          >
            <TarotCloud kind={c.kind} width={c.w} />
          </Animated.View>
        </Animated.View>
      ))}

      {/* The moon (top left) watches the draw; the sun (top right) feels the bet */}
      <View style={{ position: 'absolute', left: moon.x - orb / 2, top: moon.y - orb / 2 }}>
        <TarotMoon mood={mood} size={orb} />
      </View>
      <View style={{ position: 'absolute', left: sun.x - orb / 2, top: sun.y - orb / 2 }}>
        <TarotSun face={sunFace} speed={4 + lively * lively * 40} size={orb} />
      </View>

      {/* Planets, from the Wheel of Fortune up */}
      {PLANETS.map((pl, i) => {
        const at = planetAt[i];
        return (
          <Animated.View
            key={i}
            style={{
              position: 'absolute',
              left: at.x - pl.size / 2,
              top: at.y - pl.size / 2,
              opacity: i < planets ? 1 : 0,
              transform: [{ scale: i < planets ? 1 : 0.4 }],
              transitionProperty: ['opacity', 'transform'],
              transitionDuration: 500,
              transitionTimingFunction: ['ease-out', cubicBezier(0.2, 0.9, 0.3, 1.3)],
            }}
          >
            <Animated.View style={loop(KF.bob, pl.bob, { delay: -i * 1.3 })}>
              <Planet kind={pl.kind} size={pl.size} />
            </Animated.View>
          </Animated.View>
        );
      })}

      {/* Lightning either side of the dial, from The Tower up (the right side mirrors the left) */}
      {storm &&
        [0, 1].map((side) =>
          BOLTS.map((b, i) => {
            const at = around(dial, b.deg, b.r);
            const h = (b.w * 240) / 90;
            return (
              <Animated.View
                key={`${side}-${i}`}
                style={{
                  position: 'absolute',
                  left: side ? width - at.x - b.w / 2 : at.x - b.w / 2,
                  top: at.y - h / 2,
                  opacity: 0,
                  transform: side ? [{ scaleX: -1 }] : undefined,
                  animationName: STRIKE_KF,
                  animationDuration: `${(fast ? b.dur * 0.6 : b.dur).toFixed(2)}s`,
                  animationDelay: `${(b.delay + side * 1.4).toFixed(2)}s`,
                  animationIterationCount: 'infinite',
                  animationTimingFunction: 'linear',
                }}
              >
                <Bolt tall={b.tall} width={b.w} />
              </Animated.View>
            );
          }),
        )}

      {/* Along the bottom: a bank of clouds, with a fan of tarot cards rising out of it in each
          corner. The back row of clouds sits behind the cards, the front row in front. */}
      <CloudRow row={BANK_BACK} width={width} fill={rgb(rampN(BANK_BACK_FILL, lively))} raise />
      {[0, 1].map((side) => (
        <CardFan
          key={side}
          side={side}
          card={Math.round(Math.max(36, Math.min(46, width * 0.1)))}
          inset={Math.max(10, Math.min(110, width * 0.09 - 20))}
          count={mood === 'idle' || mood === 'set' ? FAN_AT[tier] : Math.max(3, FAN_AT[tier])}
          spread={mood === 'win' ? 2.5 : 6 + p * 10}
          scatter={mood === 'loss'}
          flipped={reading}
          reversed={mood === 'loss'}
          face={side ? <SunCard face={sunFace} /> : <MoonCard mood={mood} />}
        />
      ))}
      <CloudRow row={BANK_FRONT} width={width} fill={rgb(rampN(BANK_FRONT_FILL, lively))} />
    </View>
  );
}

/**
 * The cloud bank, on % of the scene's width: `x` is the left edge, `w` the width (at least
 * 5.5 pt per %, so the clouds stay plump on a phone).
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
const BANK_FRONT_FILL = [TA.cream, '#FBEBDF', '#F8DACB', '#F5C7B7'];
const BANK_BACK_FILL = ['#F3E5D3', '#F6D5C5', '#F2BEAD', '#EEA898'];

function CloudRow({
  row,
  width,
  fill,
  raise,
}: {
  row: typeof BANK_FRONT;
  width: number;
  fill: string;
  raise?: boolean;
}) {
  return (
    <>
      {row.map((c, i) => {
        const w = Math.max((c.w / 100) * width, c.w * 5.5);
        return (
          <View
            key={i}
            style={{
              position: 'absolute',
              left: (c.x / 100) * width,
              bottom: raise ? 12 : 0,
              // The art's flat bottom is at 132 of 160: tuck the rest (and the bob) below the edge
              transform: [{ translateY: ((w * 160) / 280) * 0.175 + 8 }],
            }}
          >
            <Animated.View style={loop(KF.bob, 5 + frac(i, 140 + c.kind) * 3, { delay: -i * 1.7 })}>
              <TarotCloud kind={c.kind} width={w} fill={fill} />
            </Animated.View>
          </View>
        );
      })}
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
  card,
  inset,
  count,
  spread,
  scatter,
  flipped,
  reversed,
  face,
}: {
  side: number;
  /** Card width, pt. */
  card: number;
  /** From the screen edge, pt. */
  inset: number;
  count: number;
  /** Degrees between cards. */
  spread: number;
  scatter: boolean;
  flipped: boolean;
  reversed: boolean;
  face: ReactNode;
}) {
  const dir = side ? -1 : 1;
  const height = (card * 240) / 140;
  return (
    <View style={{ position: 'absolute', bottom: 10, [side ? 'right' : 'left']: inset, width: card, height }}>
      {Array.from({ length: FAN_MAX }, (_, i) => {
        const on = i < count;
        const front = i === count - 1;
        const k = i - (count - 1) / 2;
        const rot =
          (on ? k * spread * dir : 0) + (scatter ? (frac(i, 150 + side) - 0.5) * 46 : 0) + dir * 4;
        // The web's 50 px scatter, for its 44 px card
        const dx = scatter ? (frac(i, 160 + side) - 0.5) * 50 * (card / 44) : 0;
        return (
          <Animated.View
            key={i}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              zIndex: i,
              transformOrigin: '50% 130%',
              transform: [{ translateX: dx }, { translateY: on ? 0 : height * 0.6 }, { rotate: `${rot.toFixed(1)}deg` }],
              opacity: on ? 1 : 0,
              transitionProperty: ['transform', 'opacity'],
              transitionDuration: [550, 350],
              transitionTimingFunction: [cubicBezier(0.2, 0.9, 0.3, 1.2), 'ease-out'],
            }}
          >
            <TarotCard width={card} flipped={front && flipped} face={front ? face : undefined} reversed={reversed} />
          </Animated.View>
        );
      })}
    </View>
  );
}

/**
 * The moon and the sun, as the faces of the two front cards (on the card's 140 × 240 grid), set
 * high on the card since the clouds cover its foot.
 */
function MoonCard({ mood }: { mood: SceneMood }) {
  const i = Math.max(0, MOON_MOODS.indexOf(mood));
  return (
    <G transform="translate(15 38) scale(0.611)">
      {MOON_RAYS}
      {MOON_FACES[i]}
    </G>
  );
}
function SunCard({ face }: { face: number }) {
  return (
    <G transform="translate(15 38) scale(0.611)">
      {SUN_RAYS}
      {SUN_FACES[Math.max(0, Math.min(SUN_FACES.length - 1, face))]}
    </G>
  );
}

/* ------------------------------------------------------------------------------------------ */
/* Behind the dial                                                                             */
/* ------------------------------------------------------------------------------------------ */

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

/** Rays and band are static art; only their views turn. */
function RayBurst({ size }: { size: number }) {
  return (
    <Svg viewBox="0 0 400 400" width={size} height={size}>
      <G stroke={TA.teal} strokeWidth={1.1} strokeLinecap="round">
        {RAYS.map((r, i) => (
          <Line key={i} {...r} />
        ))}
      </G>
    </Svg>
  );
}
function Band({ size }: { size: number }) {
  return (
    <Svg viewBox="0 0 400 400" width={size} height={size}>
      {WHEEL_BAND}
    </Svg>
  );
}

const SCALE = {
  transitionProperty: 'transform',
  transitionDuration: 300,
  transitionTimingFunction: 'ease-out',
} as const;

/**
 * Tarot's counterpart to Classic's sun rays: the Wheel of Fortune turning behind the dial. It
 * rises out from behind the dial and turns faster the bigger the bet, over a burst of engraved
 * rays; at 45 it really spins. Fades out while the alarm is set. On a jackpot, The World's laurel
 * wreath grows in around the clock.
 */
function FortuneWheel({ p, visible, size, mood }: BackdropProps) {
  // Spins up with the bet, to a steady 24°/s all in
  const wheel = useTurning(2 + p * p * 22);
  const rays = useTurning(-(1 + p * 6));
  // The band rises out from behind the dial as the bet grows: its glyphs start half hidden under
  // the dial's edge, and by 45 the whole band is out. Sized from the dial's own radius so it works
  // at any size.
  const box = size * 1.9;
  const unit = box / 400; // pt per wheel unit
  const disc = size * (176 / 358); // the dial's disc radius, pt
  const from = (disc + 4) / 156 / unit; // glyph centres (r 156) just past the edge
  const to = (disc * 1.24) / 176 / unit; // the band's outer edge (r 176) a quarter out past the dial
  const scale = from + (to - from) * p;
  // The rays reach a little further out as the bet grows
  const reach = 0.86 + p * 0.14;
  const glow = rampN([TA.gold, TA.coral, '#D2445A'], p);
  const wreath = size * 1.22;

  return (
    <>
      <Animated.View
        style={{
          position: 'absolute',
          left: size / 2 - box / 2,
          top: size / 2 - box / 2,
          width: box,
          height: box,
          opacity: visible ? 1 : 0,
          transitionProperty: 'opacity',
          transitionDuration: 400,
          transitionTimingFunction: 'ease-out',
        }}
      >
        <View
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: box / 2,
            backgroundImage: `radial-gradient(circle, ${cssA(glow, 0.32)} 0%, ${cssA(glow, 0.12)} 36%, ${cssA(glow, 0)} 60%)`,
            opacity: 0.4 + p * 0.6,
          }}
        />
        {/* Faint teal engraving */}
        <Animated.View style={[StyleSheet.absoluteFill, SCALE, { transform: [{ scale: reach }] }]}>
          <Animated.View style={[StyleSheet.absoluteFill, { opacity: 0.1 + p * 0.06 }, rays]}>
            <RayBurst size={box} />
          </Animated.View>
        </Animated.View>
        <Animated.View style={[StyleSheet.absoluteFill, SCALE, { transform: [{ scale }] }]}>
          <Animated.View style={[StyleSheet.absoluteFill, wheel]}>
            <Band size={box} />
          </Animated.View>
        </Animated.View>
      </Animated.View>

      {/* The World: a laurel wreath round the clock on a jackpot */}
      {mood === 'jackpot' && (
        <Animated.View
          exiting={FadeOut.duration(250)}
          style={{
            position: 'absolute',
            // Frames the result (clock, verdict, Roll again), centred a little above the dial's centre
            left: size / 2 - wreath / 2,
            top: size / 2 - size * 0.15 - wreath / 2,
            width: wreath,
            height: wreath,
          }}
        >
          <Animated.View
            style={{
              position: 'absolute',
            inset: 0,
              animationName: WREATH_IN,
              animationDuration: '0.7s',
              animationDelay: '0.15s',
              animationFillMode: 'both',
              animationTimingFunction: cubicBezier(0.2, 0.9, 0.3, 1.25),
            }}
          >
            <Svg viewBox="0 0 400 400" width={wreath} height={wreath}>
              {WREATH_LEAVES.map((leaves, i) => (
                <G key={i}>{leaves}</G>
              ))}
            </Svg>
            {WREATH_RIBBONS.map((ribbon, i) => (
              <Animated.View
                key={i}
                style={{
                  position: 'absolute',
            inset: 0,
                  // Each bow pops about its own centre (top at y 50, bottom at y 362 of 400)
                  transformOrigin: i ? '50% 90.5%' : '50% 12.5%',
                  animationName: POP_KF,
                  animationDuration: '0.5s',
                  animationDelay: `${0.45 + i * 0.12}s`,
                  animationFillMode: 'both',
                  animationTimingFunction: cubicBezier(0.2, 0.9, 0.3, 1.2),
                }}
              >
                <Svg viewBox="0 0 400 400" width={wreath} height={wreath}>
                  {ribbon}
                </Svg>
              </Animated.View>
            ))}
          </Animated.View>
        </Animated.View>
      )}
    </>
  );
}

/** The wreath springs in: the web's spring (stiffness 160, damping 14), as an overshooting ease. */
const WREATH_IN = css.keyframes({
  from: { opacity: 0, transform: [{ scale: 0.7 }, { rotate: '-25deg' }] },
  to: { opacity: 1, transform: [{ scale: 1 }, { rotate: '0deg' }] },
});

/* ------------------------------------------------------------------------------------------ */
/* On the dial, the draw                                                                       */
/* ------------------------------------------------------------------------------------------ */

/** The dial's 358-unit square (bet-dial.tsx). */
const C = 179;
const pt = (deg: number, r: number): [number, number] => {
  const a = (deg * Math.PI) / 180;
  return [C + r * Math.sin(a), C - r * Math.cos(a)];
};
const SUITS = [
  ['wands', C - 64, C - 64],
  ['cups', C + 64, C - 64],
  ['swords', C - 64, C + 64],
  ['pentacles', C + 64, C + 64],
] as const;
const QUARTER_SPARKLE = 'M0-5.5C.4-1.9 1.9-.4 5.5 0 1.9.4.4 1.9 0 5.5-.4 1.9-1.9.4-5.5 0-1.9-.4-.4-1.9 0-5.5z';

/**
 * Engraved like a tarot card's face: a fine ring with a sparkle at each quarter, and the four
 * minor arcana suits on the diagonals. Over the minute ticks.
 */
function TarotOrnament({ theme: t }: DialLayerProps) {
  return (
    <G fill={t.faint}>
      <Circle cx={C} cy={C} r={112} fill="none" stroke={t.faint} strokeWidth={1.3} />
      {[0, 90, 180, 270].map((a) => {
        const [x, y] = pt(a, 112);
        return (
          <G key={a} transform={`translate(${x} ${y})`}>
            {/* Knocks the ring out round each sparkle (the disc's cream); the web paints this as
                the sparkle's own stroke, under its fill */}
            <Path d={QUARTER_SPARKLE} fill="#FBF4E6" stroke="#FBF4E6" strokeWidth={2.5} />
            <Path d={QUARTER_SPARKLE} />
          </G>
        );
      })}
      {SUITS.map(([suit, x, y]) => (
        <Path key={suit} d={SUIT_PATHS[suit]} fillRule="evenodd" transform={`translate(${x - 8} ${y - 8}) scale(${16 / 24})`} />
      ))}
    </G>
  );
}

/** Shown above the progress bar while the draw rolls: the all-seeing eye reads the cards. */
function TarotRoll() {
  return (
    <View style={{ marginBottom: 12 }}>
      <SeeingEye width={64} />
    </View>
  );
}

export const kit: ThemeKit = {
  Scene: TarotScene,
  DialBackdrop: FortuneWheel,
  DialOver: TarotOrnament,
  RollFlourish: TarotRoll,
};
