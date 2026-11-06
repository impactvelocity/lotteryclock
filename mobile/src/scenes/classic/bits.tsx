/**
 * Small pieces several parts of the Classic scene share: the gull, the sparkle, the sun mascot,
 * and a cubic-bezier for sampling eased motion into keyframes.
 */
import Svg, { Path } from 'react-native-svg';

import { Art, type ArtKey } from '../art';

/** A gull's wings, on a 24 × 10 grid. */
export const BIRD = 'M 1 7 Q 6.5 0 12 8 Q 17.5 0 23 7';

/**
 * A white gull with a soft shadow under it (the web uses a drop-shadow filter). Drawn on a
 * 24 × 12 box (a unit of room above and below the wings); its wings' pivot sits at 75% down.
 */
export function Gull({
  width,
  weight = 2.2,
  drop = 1,
  shade = '#96463C',
}: {
  width: number;
  /** Stroke width, in grid units. */
  weight?: number;
  /** How far the shadow sits under the wings, in grid units. */
  drop?: number;
  shade?: string;
}) {
  return (
    <Svg width={width} height={width / 2} viewBox="0 -1 24 12">
      <Path
        d={BIRD}
        transform={`translate(0 ${drop})`}
        fill="none"
        stroke={shade}
        strokeOpacity={0.35}
        strokeWidth={weight + 0.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d={BIRD} fill="none" stroke="#FFFFFF" strokeWidth={weight} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

/** Where a gull's wings pivot as they flap (the web's 50% 80% of the 10-unit grid). */
export const GULL_PIVOT = '50% 75%';

/** A four-point sparkle on a 24-unit grid. */
export const SPARKLE = 'M12 0C12.8 7 17 11.2 24 12 17 12.8 12.8 17 12 24 11.2 17 7 12.8 0 12 7 11.2 11.2 7 12 0z';

/** The sun mascot, one face per bet tier: asleep, sleepy, smiling, excited, sweating, on fire. */
const FACES: ArtKey[] = [
  'classic/sun-asleep',
  'classic/sun-sleepy',
  'classic/sun-smiling',
  'classic/sun-excited',
  'classic/sun-sweating',
  'classic/sun-on-fire',
];

export function SunFace({ tier, size }: { tier: number; size: number }) {
  return <Art name={FACES[Math.max(0, Math.min(FACES.length - 1, tier))]} width={size} height={size} />;
}

/** CSS's cubic-bezier(x1, y1, x2, y2) as a function of time, for sampling into keyframes. */
export function bezier(x1: number, y1: number, x2: number, y2: number) {
  const at = (a: number, b: number, u: number) => 3 * a * u * (1 - u) ** 2 + 3 * b * u * u * (1 - u) + u ** 3;
  return (t: number) => {
    let lo = 0;
    let hi = 1;
    for (let k = 0; k < 24; k++) {
      const mid = (lo + hi) / 2;
      if (at(x1, x2, mid) < t) lo = mid;
      else hi = mid;
    }
    return at(y1, y2, (lo + hi) / 2);
  };
}
