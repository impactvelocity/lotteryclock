import type { ReactNode } from 'react';
import { View, type ViewStyle } from 'react-native';

import { Text } from '@/components/ui/text';
import { colors } from '@/theme';

/** Rounded glass-ish card used across screens. */
export function Panel({ children, style, glow }: { children: ReactNode; style?: ViewStyle; glow?: string }) {
  return (
    <View
      style={[
        {
          backgroundColor: 'rgba(23,17,42,0.85)',
          borderRadius: 24,
          borderWidth: 1,
          borderColor: glow ?? colors.border,
          padding: 20,
          gap: 16,
        },
        glow ? { shadowColor: glow, shadowOpacity: 0.35, shadowRadius: 20, shadowOffset: { width: 0, height: 0 } } : null,
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <Text className="text-xs font-semibold uppercase text-muted-foreground" style={{ letterSpacing: 2 }}>
      {children}
    </Text>
  );
}
