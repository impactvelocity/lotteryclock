import type { ComponentProps } from 'react';
import { StyleSheet, View, type TextStyle } from 'react-native';

import { Text } from '@/components/ui/text';
import { fonts } from '@/theme';

type Props = ComponentProps<typeof Text> & { glow?: string };

/**
 * Marquee-style text in the Bungee display font, with optional neon glow.
 * The glow is a shadow on a transparent wrapper View (iOS shadows follow the
 * glyph shapes). textShadow on Text draws a box artifact here.
 */
export function DisplayText({ style, glow, ...props }: Props) {
  const flat = (StyleSheet.flatten(style) ?? {}) as TextStyle;
  // Bungee's tall caps clip under the default line height.
  const lineHeight = flat.lineHeight ?? (flat.fontSize ? Math.round(flat.fontSize * 1.25) : undefined);
  const text = (
    <Text {...props} style={[{ fontFamily: fonts.display, fontWeight: 'normal' }, flat, lineHeight ? { lineHeight } : null]} />
  );
  if (!glow) return text;
  return (
    <View style={{ shadowColor: glow, shadowOpacity: 0.9, shadowRadius: 10, shadowOffset: { width: 0, height: 0 } }}>
      {text}
    </View>
  );
}
