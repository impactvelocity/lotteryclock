/**
 * The calavera's turns under the dial (web: CalaveraDance and CalaveraVerdict in
 * muertos-scene.tsx): it dances while the draw rolls, and reacts beside the result badge.
 */
import { View } from 'react-native';
import Animated, { cubicBezier } from 'react-native-reanimated';

import { KF } from '../anim';
import type { SceneMood } from '../types';
import { CalaveraFace, MK, MU, Maraca, flung } from './art';

/** Seeds rattling out of the maracas while the calavera dances: where each starts and flies. */
const SEEDS = [
  { left: 42, top: 12, dx: -10, dy: -8, delay: 0 },
  { left: 46, top: 8, dx: -3, dy: -12, delay: 0.17 },
  { left: 39, top: 18, dx: -12, dy: -2, delay: 0.35 },
  { left: 112, top: 14, dx: 9, dy: -9, delay: 0.09 },
  { left: 116, top: 20, dx: 12, dy: -3, delay: 0.26 },
  { left: 109, top: 10, dx: 3, dy: -12, delay: 0.44 },
].map((s) => ({ ...s, kf: flung(s.dx, s.dy) }));
const SEED_COLORS = [MU.gold, MU.rose, MU.teal];

/**
 * Shown above the progress bar while the draw rolls ("Rattling the bones"): the calavera
 * dances, hopping and rocking, a maraca in each hand, seeds rattling out on the beat.
 */
export function CalaveraDance() {
  return (
    <View style={{ width: 160, height: 60, marginBottom: 8 }}>
      {SEEDS.map((s, i) => (
        <Animated.View
          key={i}
          style={{
            position: 'absolute',
            left: s.left,
            top: s.top,
            width: 3,
            height: 3,
            borderRadius: 1.5,
            backgroundColor: SEED_COLORS[i % SEED_COLORS.length],
            opacity: 0,
            animationName: s.kf,
            animationDuration: '0.7s',
            animationDelay: `${s.delay}s`,
            animationIterationCount: 'infinite',
            animationTimingFunction: 'ease-out',
          }}
        />
      ))}
      {/* The calavera holds its own maraca on the right; this is the one in its left hand */}
      <Animated.View
        style={{
          position: 'absolute',
          top: 12,
          left: 40,
          width: 14,
          height: 30,
          transformOrigin: '50% 95%',
          animationName: MK.maraca,
          animationDuration: '0.35s',
          animationIterationCount: 'infinite',
          animationTimingFunction: 'ease-in-out',
        }}
      >
        <Maraca width={14} height={30} />
      </Animated.View>
      <Animated.View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 46,
          width: 58,
          height: 58,
          transformOrigin: '50% 90%',
          animationName: MK.dance,
          animationDuration: '0.7s',
          animationIterationCount: 'infinite',
          animationTimingFunction: 'ease-in-out',
        }}
      >
        <CalaveraFace tier={3} size={58} />
      </Animated.View>
    </View>
  );
}

/**
 * The calavera beside the result badge: dozing off on a snooze, back from the dead (in flames)
 * and shaking when late, bobbing among the souls when it's right on time. It pops up as the
 * result lands.
 */
export function CalaveraVerdict({ mood }: { mood: SceneMood }) {
  if (mood !== 'win' && mood !== 'loss' && mood !== 'jackpot') return null;
  const face = mood === 'win' ? 0 : mood === 'loss' ? 5 : 4;
  const move =
    mood === 'win'
      ? { animationName: MK.doze, animationDuration: '2.8s', animationTimingFunction: 'ease-in-out' as const }
      : mood === 'loss'
        ? { animationName: KF.shake, animationDuration: '0.2s', animationTimingFunction: 'linear' as const }
        : { animationName: KF.bob, animationDuration: '0.9s', animationTimingFunction: 'ease-in-out' as const };
  return (
    <Animated.View
      key={mood}
      style={{
        width: 44,
        height: 44,
        animationName: MK.pop,
        animationDuration: '0.45s',
        animationTimingFunction: cubicBezier(0.2, 0.9, 0.3, 1.2),
        animationFillMode: 'both',
      }}
    >
      <Animated.View
        style={{
          transformOrigin: '50% 80%',
          ...move,
          animationDelay: '0.45s',
          animationIterationCount: 'infinite',
        }}
      >
        <CalaveraFace tier={face} size={44} />
      </Animated.View>
    </Animated.View>
  );
}
