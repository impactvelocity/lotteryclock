/**
 * Digital's counterpart to Classic's sun rays (web: digital-scene.tsx, PixelHalo): pixelated
 * rings round the dial (whole cells of a square grid, so they read as low-res circles). More
 * rings light up as the bet grows, each in the arc colour for its distance, and a ripple runs
 * outward through them, faster the bigger the bet. Fades out while the alarm is set.
 */
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import Svg, { G, Path } from 'react-native-svg';

import { css, cssA, MAX_RANGE, ramp, rampN } from '@/themes/themes';

import { KF } from '../anim';
import type { BackdropProps } from '../types';
import { DKF, RIPPLE_REST } from './keyframes';

const RINGS = 5;

export function PixelHalo({ p, range, visible, size }: BackdropProps) {
  const box = Math.round(size * 1.9);
  const cell = Math.max(8, Math.round(size / 34));
  // Each ring's cells as two paths: every seventh cell a brighter pixel, so the ring sparkles a little
  const rings = useMemo(() => {
    const half = box / 2;
    const out = Array.from({ length: RINGS }, (_, k) => ({ k, bright: '', dim: '', n: 0 }));
    const radii = Array.from({ length: RINGS }, (_, k) => size * (0.585 + k * 0.085));
    const n = Math.floor(box / cell);
    const off = (box - n * cell) / 2;
    const s = cell - 2;
    for (let gy = 0; gy < n; gy++) {
      for (let gx = 0; gx < n; gx++) {
        const cx = off + gx * cell + cell / 2 - half;
        const cy = off + gy * cell + cell / 2 - half;
        const d = Math.hypot(cx, cy);
        radii.forEach((r, k) => {
          if (Math.abs(d - r) >= cell * 0.5) return;
          const ring = out[k];
          const rect = `M${off + gx * cell + 1} ${off + gy * cell + 1}h${s}v${s}h${-s}z`;
          if (ring.n++ % 7 === 0) ring.bright += rect;
          else ring.dim += rect;
        });
      }
    }
    return out;
  }, [box, cell, size]);

  // The first ring is always faintly there; the rest come on with the bet
  const lit = range === 0 ? 1 : 1 + Math.ceil(p * (RINGS - 1));
  const pulse = 1.8 - p * 1.1;
  const allIn = range === MAX_RANGE;
  const glow = rampN(['#3DFF7E', '#3DE0FF', '#FF3DCB'], p);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: (size - box) / 2,
        top: (size - box) / 2,
        width: box,
        height: box,
        opacity: visible ? 1 : 0,
        transitionProperty: 'opacity',
        transitionDuration: 400,
        transitionTimingFunction: 'ease-out',
      }}
    >
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            borderRadius: box / 2,
            backgroundImage: `radial-gradient(circle, ${cssA(glow, 0.22)} 0%, ${cssA(glow, 0.08)} 34%, ${cssA(glow, 0)} 60%)`,
            opacity: 0.5 + p * 0.5,
          },
        ]}
      />
      {rings.map(({ k, bright, dim }) => {
        const on = k < lit;
        const color = css(ramp(['#3DFF7E', '#FFE135', '#FF3D8B'], (k / (RINGS - 1)) * Math.max(p, 0.15)));
        // Fainter the further out, so the outer rings fade into the screen. Drawn at their flared
        // strength, and held at the web's own between flares.
        const flare = Math.min(1, (0.46 - k * 0.07) / RIPPLE_REST);
        return (
          <Animated.View
            key={k}
            style={[StyleSheet.absoluteFill, { opacity: on ? 1 : 0, transitionProperty: 'opacity', transitionDuration: 300 }]}
          >
            <Animated.View
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: box,
                height: box,
                opacity: RIPPLE_REST,
                ...(on && range > 0
                  ? {
                      animationName: DKF.ripple,
                      animationDuration: `${Math.round(pulse * 100) / 100}s`,
                      animationDelay: `${Math.round(((k * pulse) / (RINGS + 1)) * 100) / 100}s`,
                      animationIterationCount: 'infinite',
                      animationTimingFunction: 'step-end', // steps(1)
                    }
                  : null),
              }}
            >
              <Svg width={box} height={box} viewBox={`0 0 ${box} ${box}`}>
                <G fill={color} opacity={flare}>
                  <Path d={dim} opacity={0.5} />
                  <Path d={bright} />
                </G>
              </Svg>
            </Animated.View>
          </Animated.View>
        );
      })}
      {allIn && (
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              borderRadius: box / 2,
              boxShadow: `inset 0 0 60px ${cssA(glow, 0.25)}`,
              animationName: KF.pulse,
              animationDuration: '0.9s',
              animationIterationCount: 'infinite',
              animationTimingFunction: 'ease-in-out',
            },
          ]}
        />
      )}
    </Animated.View>
  );
}
