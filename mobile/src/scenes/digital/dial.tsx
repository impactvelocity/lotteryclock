/**
 * Digital's dial pieces (web: bet-dial.tsx, `t.ornament === "pixel"` and `t.pixelHandle`):
 * an arcade screen on the disc, and the pixel bell on the square handle.
 */
import type { ComponentType } from 'react';
import Animated from 'react-native-reanimated';
import Svg, { Circle, G, Text as SvgText, type GProps } from 'react-native-svg';

import { fontFor } from '@/themes/fonts';
import { tierIndex } from '@/themes/themes';

import { KF } from '../anim';
import type { DialLayerProps } from '../types';
import { PIXEL_BELL, PIXEL_HEART, PIXEL_HEART_EMPTY, Pixels } from './pixels';

/** The dial's centre, in its 358-unit space. */
const C = 179;
/** The lives, per tier: three at first, draining to none at the full 45. */
const LIVES = [3, 3, 2, 2, 1, 0];
/** A life heart's pixel size, in dial units. */
const HEART_PX = 1.7;

/**
 * A group that can run a CSS animation. Reanimated reads the animation from its style, which
 * react-native-svg's G takes at runtime but leaves out of its types.
 */
const AnimatedG = Animated.createAnimatedComponent(G) as unknown as ComponentType<GProps & { style?: object }>;

/**
 * An arcade screen: a ring of square pixels, PLAYER 1 above the time, and three lives below it
 * that drain as the bet grows (the last one blinks). Drawn over the minute ticks.
 */
export function PixelOrnament({ range, theme: t }: DialLayerProps) {
  const lives = LIVES[tierIndex(range)];
  return (
    <G>
      <Circle
        cx={C}
        cy={C}
        r={108}
        fill="none"
        stroke={t.faint}
        strokeWidth={3}
        strokeDasharray={`3 ${((2 * Math.PI * 108) / 84 - 3).toFixed(3)}`}
      />
      <SvgText
        x={C}
        y={126}
        fontSize={11}
        textAnchor="middle"
        letterSpacing={11 * 0.16}
        fill={t.muted}
        opacity={0.75}
        fontFamily={fontFor(t.titleFont)}
      >
        PLAYER 1
      </SvgText>
      {[-1, 0, 1].map((k) => {
        const full = k + 1 < lives;
        const last = lives === 1 && k === -1;
        const x = C + k * 17 - (7 * HEART_PX) / 2;
        return (
          <AnimatedG
            key={k}
            transform={`translate(${x} 236) scale(${HEART_PX})`}
            style={
              last
                ? {
                    animationName: KF.blink,
                    animationDuration: '0.8s',
                    animationIterationCount: 'infinite',
                    animationTimingFunction: 'step-end', // steps(1)
                  }
                : undefined
            }
          >
            {full ? <Pixels s={PIXEL_HEART} /> : <Pixels s={PIXEL_HEART_EMPTY} pal={{ w: t.faint }} />}
          </AnimatedG>
        );
      })}
    </G>
  );
}

/**
 * The pixel bell (PIXEL_BELL) in square pixels, `size` pt square with a pixel of room round it
 * (the web draws it at 48% of the handle), its pixels in `color`.
 */
export function PixelBell({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="-1 -1 12 11">
      <Pixels s={PIXEL_BELL} pal={{ w: color }} />
    </Svg>
  );
}
