/**
 * The sun mascot's two turns (web/src/components/scenes/sunrise-scene.tsx): rising over the
 * progress bar while the draw rolls, and bouncing beside the result when it's right on time.
 */
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { cubicBezier } from 'react-native-reanimated';

import type { SceneMood } from '../types';
import { ROLL_BAR_MS } from '@/lib/roll';

import { KF, loop } from '../anim';
import { SunFace } from './bits';
import { POP, SUN_RISE, SUN_WAKE } from './keyframes';

/** How long the progress bar takes to fill, so the sun clears the bar as it lands. */
const BAR_S = ROLL_BAR_MS / 1000;

/** The sun's box, its disc's radius (r 49 of 180) and the upright face's cut (57%, clear of the rays). */
const SUN = 72;
const FACE_R = SUN * 0.5 * 0.57;
/** How far the clip reaches past the 160 × 48 box: the sun rises up out of it, clipped only below. */
const ROOM_X = 70;
const ROOM_TOP = 90;

/**
 * "Rolling the dice", as a sunrise: the progress bar is the horizon, and the sun comes up from
 * behind it as the bar fills. It starts out asleep, blinks awake halfway up and is smiling by
 * the time it clears the horizon; a warm glow spreads along the bar as it rises. Its rays turn
 * slowly the whole time, its face stays upright.
 */
export function SunRoll() {
  const [face, setFace] = useState(0);
  useEffect(() => {
    const wake = setTimeout(() => setFace(1), BAR_S * 450);
    const smile = setTimeout(() => setFace(2), BAR_S * 850);
    return () => {
      clearTimeout(wake);
      clearTimeout(smile);
    };
  }, []);
  const rise = {
    animationDuration: `${BAR_S}s`,
    animationTimingFunction: 'ease-in-out',
    animationFillMode: 'both',
  } as const;
  return (
    <View pointerEvents="none" style={{ width: 160, height: 48 }}>
      {/* Clipped only along the bottom (the horizon), so the sun can rise up past the box */}
      <View
        style={{ position: 'absolute', left: -ROOM_X, right: -ROOM_X, top: -ROOM_TOP, bottom: 0, overflow: 'hidden' }}
      >
        {/* First light along the horizon */}
        <Animated.View
          style={{
            position: 'absolute',
            left: ROOM_X - 40,
            right: ROOM_X - 40,
            bottom: 0,
            height: 72,
            backgroundImage:
              'radial-gradient(ellipse 50% 75% at 50% 100%, rgba(255,150,70,0.6), rgba(255,180,105,0.25) 55%, transparent 80%)',
            animationName: KF.fadeIn,
            ...rise,
          }}
        />
        <Animated.View
          style={{
            position: 'absolute',
            bottom: 0,
            left: ROOM_X + 80 - SUN / 2,
            width: SUN,
            height: SUN,
            // Starts below the horizon; ends with its disc just clear of the bar
            animationName: SUN_RISE,
            ...rise,
          }}
        >
          {/* A warm shadow, so the pale sun stands out from the peach sky */}
          <View
            style={{
              position: 'absolute',
              left: SUN / 2 - FACE_R,
              top: SUN / 2 - FACE_R,
              width: FACE_R * 2,
              height: FACE_R * 2,
              borderRadius: FACE_R,
              boxShadow: '0 2px 6px rgba(214,96,40,0.35)',
            }}
          />
          {/* Rays: the whole sun, slowly turning (its face is hidden under the still one) */}
          <Animated.View style={[StyleSheet.absoluteFill, loop(KF.spin, 9, { ease: 'linear' })]}>
            <SunFace tier={face} size={SUN} />
          </Animated.View>
          {/* Face: the same sun cut down to its disc, kept upright; pops a little as it wakes */}
          <Animated.View
            key={face}
            style={{
              position: 'absolute',
              left: SUN / 2 - FACE_R,
              top: SUN / 2 - FACE_R,
              width: FACE_R * 2,
              height: FACE_R * 2,
              borderRadius: FACE_R,
              overflow: 'hidden',
              ...(face
                ? { animationName: SUN_WAKE, animationDuration: '0.35s', animationTimingFunction: 'ease-out' }
                : null),
            }}
          >
            <View style={{ position: 'absolute', left: FACE_R - SUN / 2, top: FACE_R - SUN / 2 }}>
              <SunFace tier={face} size={SUN} />
            </View>
          </Animated.View>
        </Animated.View>
      </View>
    </View>
  );
}

/**
 * The sun mascot beside the result badge, right on time only: it bounces with glee. (A snooze
 * and a late result get the shared Zs and ring marks, and the village's reaction.)
 */
export function SunVerdict({ mood }: { mood: SceneMood }) {
  if (mood !== 'jackpot') return null;
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        width: 56,
        height: 56,
        animationName: POP,
        animationDuration: '0.45s',
        animationTimingFunction: cubicBezier(0.2, 0.9, 0.3, 1.2),
        animationFillMode: 'both',
      }}
    >
      <Animated.View style={{ transformOrigin: '50% 75%', ...loop(KF.bob, 0.9, { delay: 0.45 }) }}>
        <SunFace tier={3} size={56} />
      </Animated.View>
    </Animated.View>
  );
}
