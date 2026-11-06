/**
 * Caffè's background (web: CafeScene in cafe-scene.tsx): a Tuscan street café on a summer
 * morning, the hills rolling away behind.
 *
 *   0 min     Decaf: a quiet morning. One swallow.
 *   1–11      Latte: a couple more swallows.
 *   12–23     Cappuccino: the sky warms.
 *   24–35     Espresso: a Vespa buzzes down the street every so often.
 *   36–44     Doppio: the moka on the café table starts puffing.
 *   45        The whole moka: swallows everywhere, the Vespa flat out.
 *
 * A snooze calms the street right down (the swallows go home, the Vespa's parked); a late
 * result sends it into a flap; a jackpot floats hearts up round the clock (./saucer.tsx).
 * The web's café front and pink house (with the cat and the laundry) only show on wide
 * screens, so like the web on a phone, the street here is just the table and the Vespa.
 * Purely decorative and never touchable; the screen draws the sky gradient itself.
 */
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut, useReducedMotion } from 'react-native-reanimated';

import { cssA, rampN } from '@/themes/themes';

import { loop } from '../anim';
import type { SceneProps } from '../types';
import { driftFor, SWOOP } from './keyframes';
import { Landscape, Street } from './landscape';
import { clamp } from './palette';
import { CafeTable, Cloud, Rider, Swallow } from './street-life';

/** Swallow lanes across the sky (tops as a share of the scene); `dir` -1 flies right to left. They join in this order. */
const SWALLOWS = [
  { top: 11, dur: 16, delay: -2, size: 34, dir: 1, swoop: 4.2 },
  { top: 24, dur: 19, delay: -9, size: 28, dir: -1, swoop: 3.6 },
  { top: 16, dur: 14, delay: -6, size: 30, dir: 1, swoop: 5 },
  { top: 36, dur: 21, delay: -14, size: 24, dir: -1, swoop: 4.6 },
  { top: 7, dur: 17, delay: -12, size: 26, dir: -1, swoop: 3.8 },
  { top: 30, dur: 15, delay: -3, size: 32, dir: 1, swoop: 4.4 },
  { top: 44, dur: 18, delay: -7, size: 22, dir: 1, swoop: 5.4 },
  { top: 19, dur: 13, delay: -10, size: 26, dir: -1, swoop: 3.4 },
];
/** How many swallows are up at each tier. */
const SWALLOWS_AT = [1, 2, 3, 4, 6, 8];

const CLOUDS = [
  { top: 13, w: 150, dur: 170, delay: -40 },
  { top: 31, w: 104, dur: 130, delay: -95 },
];

/** How far below the dial the hills' cloud bank starts, in pt. */
const HORIZON_GAP = 34;

/** The café table's width on a phone (the web's max-md:w-[72px]). */
const TABLE_W = 72;

export function CafeScene({ p, tier, mood, width, height, dial }: SceneProps) {
  // A snooze calms the street right down; a late result sets it all off.
  const lively = clamp(mood === 'win' ? p * 0.2 : mood === 'loss' ? Math.max(p, 0.85) : p);
  const swallows =
    mood === 'win'
      ? 0
      : mood === 'loss'
        ? SWALLOWS.length
        : mood === 'jackpot'
          ? 3
          : Math.min(SWALLOWS.length, SWALLOWS_AT[tier] + (mood === 'set' ? 1 : 0));
  const flap = Math.round((0.5 - lively * 0.28) * 100) / 100;
  // The Vespa: from Espresso up, and tearing past on a late result. Keyed by speed, so a new
  // speed starts a fresh run from the left edge instead of jumping mid-street.
  const ride =
    mood === 'loss'
      ? 3.2
      : mood === 'win' || mood === 'jackpot' || tier < 3
        ? 0
        : tier === 5
          ? 4.4
          : tier === 4
            ? 7
            : 10;
  const puffing = mood === 'set' || mood === 'loss' || (mood === 'idle' && tier >= 4);
  // A Vespa that can't move would just be parked at the edge (as on the web)
  const still = useReducedMotion();
  const glow = rampN(['#FFE6B8', '#FFCB92', '#FFA676'], lively);
  const drift = driftFor(width);
  // As on the web's phone hero, the horizon's cloud bank (the top 40% of the hills' art) lies
  // just under the dial, behind the saucer's rim: the hills are sized to put it there
  const hills = Math.max(230, Math.min((height - dial.y - dial.size / 2 - HORIZON_GAP) / 0.6, 420));

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { overflow: 'hidden' }]}>
      {/* Warm haze rising off the hills */}
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: '60%',
          backgroundImage: `radial-gradient(ellipse 85% 70% at 50% 100%, ${cssA(glow, 0.55 + lively * 0.25)} 0%, ${cssA(glow, 0.2)} 50%, transparent 80%)`,
        }}
      />

      {CLOUDS.map((c, i) => (
        <Animated.View
          key={i}
          style={{
            position: 'absolute',
            left: 0,
            top: (c.top / 100) * height,
            ...loop(drift, c.dur, { delay: c.delay, ease: 'linear' }),
          }}
        >
          <Cloud w={c.w} />
        </Animated.View>
      ))}

      {/* Swallows swooping across the sky, more and more of them */}
      {SWALLOWS.slice(0, swallows).map((s, i) => (
        <Animated.View
          key={i}
          entering={FadeIn.duration(500)}
          exiting={FadeOut.duration(500)}
          style={{ position: 'absolute', left: 0, top: (s.top / 100) * height }}
        >
          <Animated.View
            style={{
              animationName: drift,
              animationDuration: `${s.dur}s`,
              animationDelay: `${s.delay}s`,
              animationIterationCount: 'infinite',
              animationTimingFunction: 'linear',
              animationDirection: s.dir < 0 ? 'reverse' : 'normal',
            }}
          >
            <Animated.View style={loop(SWOOP, s.swoop, { delay: -i * 0.7 })}>
              <View style={s.dir < 0 ? { transform: [{ scaleX: -1 }] } : undefined}>
                <Swallow size={s.size} flap={flap} />
              </View>
            </Animated.View>
          </Animated.View>
        </Animated.View>
      ))}

      <Landscape width={width} height={hills} />
      <Street width={width} />

      {/* A table outside the café, the moka on it puffing away */}
      <View style={{ position: 'absolute', left: width * 0.03, bottom: 10 }}>
        <CafeTable width={TABLE_W} puffing={puffing} />
      </View>

      {ride > 0 && !still && <Rider key={ride} ride={ride} beep={mood === 'loss'} width={width} />}
    </View>
  );
}
