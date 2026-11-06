/**
 * Bit, Digital's mascot: a pocket LCD clock (web: digital-art.tsx, BitFace, BitVerdict and
 * DigitalRoll). A face per bet tier beside the tier name, a reaction beside the result, and a
 * little hop while the draw rolls.
 */
import { StyleSheet, View } from 'react-native';
import Animated, { cubicBezier, steps } from 'react-native-reanimated';

import type { SceneMood } from '../types';
import { DKF } from './keyframes';
import { BitSprite, LOOK_LEFT, LOOK_RIGHT, RESULT_BITS, TIER_BITS } from './pixels';

/** Bit, beside the tier name: one face per tier (in place of the line icon). */
export function BitFace({ tier, size }: { tier: number; size: number }) {
  return <BitSprite s={TIER_BITS[Math.max(0, Math.min(TIER_BITS.length - 1, tier))]} size={size} />;
}

/** Bit's size beside the result badge (the web's 48px). */
const VERDICT = 48;

/** Bit reacts beside the result badge: dozes off, gets knocked out, or sees stars. */
export function BitVerdict({ mood }: { mood: SceneMood }) {
  const s = RESULT_BITS[mood];
  if (!s) return null;
  const move =
    mood === 'loss'
      ? ({
          animationName: DKF.shake,
          animationDuration: '0.5s',
          animationDelay: '0.5s',
          animationIterationCount: 3,
          animationTimingFunction: steps(2),
        } as const)
      : mood === 'jackpot'
        ? ({
            animationName: DKF.bitHop,
            animationDuration: '0.5s',
            animationDelay: '0.45s',
            animationIterationCount: 'infinite',
            animationTimingFunction: 'ease-in-out',
          } as const)
        : ({
            animationName: DKF.bob,
            animationDuration: '2.4s',
            animationDelay: '0.45s',
            animationIterationCount: 'infinite',
            animationTimingFunction: steps(3, 'jump-none'),
          } as const);
  return (
    <Animated.View
      key={mood}
      pointerEvents="none"
      style={{
        width: VERDICT,
        height: VERDICT,
        animationName: DKF.pop,
        animationDuration: '0.45s',
        animationTimingFunction: cubicBezier(0.2, 0.9, 0.3, 1.2),
        animationFillMode: 'both',
      }}
    >
      <Animated.View style={{ transformOrigin: '50% 100%', ...move }}>
        <BitSprite s={s} size={VERDICT} />
      </Animated.View>
    </Animated.View>
  );
}

/**
 * Digital's show while the draw rolls: Bit hopping on the spot, eyes darting left and right,
 * a pixel shadow squashing under each landing.
 */
export function DigitalRoll() {
  const swap = (first: boolean) =>
    ({
      position: 'absolute',
      left: 4,
      top: 0,
      animationName: DKF.swap,
      animationDuration: '0.5s',
      animationDelay: first ? '0s' : '-0.25s',
      animationIterationCount: 'infinite',
      animationTimingFunction: 'step-end', // steps(1)
    }) as const;
  return (
    <View pointerEvents="none" style={styles.box}>
      <Animated.View
        style={[
          styles.shadow,
          {
            animationName: DKF.bitShadow,
            animationDuration: '0.5s',
            animationIterationCount: 'infinite',
            animationTimingFunction: 'ease-in-out',
          },
        ]}
      />
      <Animated.View
        style={[
          styles.hop,
          {
            animationName: DKF.bitHop,
            animationDuration: '0.5s',
            animationIterationCount: 'infinite',
            animationTimingFunction: 'ease-in-out',
          },
        ]}
      >
        <Animated.View style={swap(true)}>
          <BitSprite s={LOOK_LEFT} size={52} />
        </Animated.View>
        <Animated.View style={swap(false)}>
          <BitSprite s={LOOK_RIGHT} size={52} />
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { width: 60, height: 60, marginBottom: 8 },
  shadow: { position: 'absolute', bottom: 0, left: 13, width: 34, height: 4, backgroundColor: 'rgba(0,0,0,0.45)' },
  hop: { position: 'absolute', left: 0, right: 0, bottom: 3, height: 52, transformOrigin: '50% 100%' },
});
