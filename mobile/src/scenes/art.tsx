import { memo } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { ART, type ArtKey } from './art.generated';

export { ART, type ArtKey };

/**
 * One of the web app's SVG illustrations (web/src/components/scenes/art), drawn natively.
 * Sized like an <img>: give a width and height (the SVG keeps its aspect ratio inside the box).
 * `color` fills in for `currentColor` in the SVG.
 */
export const Art = memo(function Art({
  name,
  width,
  height,
  color,
  style,
}: {
  name: ArtKey;
  width: number;
  height: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}) {
  return <SvgXml xml={ART[name]} width={width} height={height} color={color} style={style} />;
});

/** The viewBox of an art file, for working out its aspect ratio. */
export function artViewBox(name: ArtKey): { w: number; h: number } {
  const m = ART[name].match(/viewBox="([^"]+)"/);
  if (!m) return { w: 100, h: 100 };
  const [, , w, h] = m[1].split(/[\s,]+/).map(Number);
  return { w, h };
}
