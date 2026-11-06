import type { ReactNode } from 'react';
import { Text, type StyleProp, type ViewStyle } from 'react-native';

import { Glass } from '@/components/theme-picker';
import { sans } from '@/themes/fonts';
import { useTheme } from '@/themes/use-theme';

/** A glass card tinted with the theme. */
export function Panel({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const { theme } = useTheme();
  return <Glass theme={theme} style={[{ borderRadius: 26, padding: 18, gap: 14 }, style]}>{children}</Glass>;
}

export function SectionLabel({ children }: { children: ReactNode }) {
  const { theme: t } = useTheme();
  return (
    <Text style={{ color: t.muted, fontFamily: sans(700), fontSize: 12, letterSpacing: 1.6, textTransform: 'uppercase' }}>
      {children}
    </Text>
  );
}
