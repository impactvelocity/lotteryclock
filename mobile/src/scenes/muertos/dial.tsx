/**
 * The "calavera" dial ornament (web: the `t.ornament === "calavera"` block in bet-dial.tsx),
 * drawn over the minute ticks: a sugar skull's ring of dots in marigold, rose, teal and orange,
 * marigolds up top and hearts below. In the dial's 358-unit space.
 */
import { G, Circle, Path } from 'react-native-svg';

import type { DialLayerProps } from '../types';
import { scallop } from '@/lib/scallop';

const C = 179;
const r3 = (n: number) => Math.round(n * 1000) / 1000;
function pt(deg: number, r: number): [number, number] {
  const a = (deg * Math.PI) / 180;
  return [r3(C + r * Math.sin(a)), r3(C - r * Math.cos(a))];
}

const COLORS = ['#FFC23D', '#F0306E', '#2FB8A6', '#FF7A1F'];
const DOTS = Array.from({ length: 40 }, (_, i) => {
  const [x, y] = pt(i * 9, 106);
  return { x, y, r: i % 2 ? 1.4 : 2, fill: COLORS[i % 4] };
});
const FLOWERS = [112, 246].map((x) => ({ x, y: 118, d: scallop(x, 118, 5, 7, 1.05) }));

export function CalaveraDial(_: DialLayerProps) {
  return (
    <G opacity={0.75}>
      {/* A sugar skull's ring of dots */}
      {DOTS.map((d, i) => (
        <Circle key={i} cx={d.x} cy={d.y} r={d.r} fill={d.fill} />
      ))}
      {/* Marigolds up top, hearts below */}
      {FLOWERS.map((f) => (
        <G key={f.x}>
          <Path d={f.d} fill="#FF7A1F" />
          <Circle cx={f.x} cy={f.y} r={2.2} fill="#FFC23D" />
        </G>
      ))}
      {[112, 246].map((x) => (
        <Path
          key={x}
          d={`M${x} 254.5c-.9-.8-5.2-3.6-5.2-6.6a2.7 2.7 0 0 1 5.2-1 2.7 2.7 0 0 1 5.2 1c0 3-4.3 5.8-5.2 6.6z`}
          fill="#F0306E"
        />
      ))}
    </G>
  );
}
