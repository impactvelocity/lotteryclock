/**
 * The "ouija" dial ornament (web: the `t.ornament === "ouija"` block in bet-dial.tsx), drawn
 * over the minute ticks and engraved like a spirit board: YES and NO either side of the time,
 * an eye above it, GOODBYE below, inside a dotted ring. In the dial's 358-unit space.
 */
import { Circle, G, Path, Text } from 'react-native-svg';

import type { DialLayerProps } from '../types';
import { fontFor } from '@/themes/fonts';

const C = 179;

export function OuijaDial({ theme: t }: DialLayerProps) {
  const font = fontFor(t.titleFont);
  return (
    <G fill={t.faint}>
      <Circle
        cx={C}
        cy={C}
        r={108}
        fill="none"
        stroke={t.faint}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeDasharray="0 5.65"
      />
      {(
        [
          ['YES', 93],
          ['NO', 265],
        ] as const
      ).map(([w, x]) => (
        // letterSpacing 0.14em
        <Text key={w} x={x} y={184} fontSize={13} fontFamily={font} textAnchor="middle" letterSpacing={1.82}>
          {w}
        </Text>
      ))}
      <G
        transform={`translate(${C} 117)`}
        fill="none"
        stroke={t.faint}
        strokeWidth={1.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Path d="M-13 0s5.5-7 13-7 13 7 13 7-5.5 7-13 7-13-7-13-7z" />
        <Circle r={3.3} />
        <Path d="M0-11.5v-3.5M-7.5-9.5l-1.8-2.6M7.5-9.5l1.8-2.6" />
      </G>
      {/* letterSpacing 0.32em */}
      <Text x={C} y={262} fontSize={9.5} fontFamily={font} textAnchor="middle" letterSpacing={3.04}>
        GOODBYE
      </Text>
    </G>
  );
}
