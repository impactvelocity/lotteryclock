/**
 * The dial as a giant poker chip (ornament "chip" in web/src/components/bet-dial.tsx), drawn
 * over the minute ticks: eight edge inserts round the rim (clear of the 12 o'clock notch), a
 * dashed inlay ring between the time and the minute ticks, and the four suits.
 */
import { G, Path, Circle } from 'react-native-svg';

import type { DialLayerProps } from '@/scenes/types';

import { SuitShape, type Suit } from './cards';

/** The dial's own grid: everything is laid out in a 358-unit square. */
const C = 358 / 2;

const r3 = (n: number) => Math.round(n * 1000) / 1000;

function pt(deg: number, r: number): [number, number] {
  const a = (deg * Math.PI) / 180;
  return [r3(C + r * Math.sin(a)), r3(C - r * Math.cos(a))];
}

function arc(a1: number, a2: number, r: number) {
  const [x1, y1] = pt(a1, r);
  const [x2, y2] = pt(a2, r);
  return `M${x1} ${y1} A${r} ${r} 0 0 1 ${x2} ${y2}`;
}

/** One insert every 45°, starting half a step round so none sits on the notch. */
const INSERTS = Array.from({ length: 8 }, (_, k) => 22.5 + k * 45).map((a) => arc(a - 7, a + 7, 169.5));

/**
 * The suits on the diagonals, where the web sets them as 16px text (baseline at y, so the glyph
 * centres about 5.5 units higher).
 */
const SUITS: [Suit, number, number][] = [
  ['♠', 112, 118],
  ['♥', 249, 118],
  ['♣', 112, 254],
  ['♦', 249, 254],
];
const SUIT_SIZE = 11.5;

export function ChipOrnament({ theme: t }: DialLayerProps) {
  return (
    <G>
      {INSERTS.map((d) => (
        <Path key={d} d={d} fill="none" stroke={t.ink} strokeOpacity={0.5} strokeWidth={9} />
      ))}
      <Circle
        cx={C}
        cy={C}
        r={103}
        fill="none"
        stroke={t.faint}
        strokeWidth={1.5}
        strokeDasharray={[3, 5]}
        strokeLinecap="round"
      />
      {SUITS.map(([s, x, y]) => (
        <G key={s} transform={`translate(${x - SUIT_SIZE / 2} ${y - 5.5 - SUIT_SIZE / 2}) scale(${SUIT_SIZE / 24})`}>
          <SuitShape suit={s} fill={t.faint} />
        </G>
      ))}
    </G>
  );
}
