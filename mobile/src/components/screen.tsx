import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/theme';

/** Gradient background plus a scroll container padded for the status bar and tab bar. */
export function Screen({ children, scroll = true }: { children: ReactNode; scroll?: boolean }) {
  const insets = useSafeAreaInsets();
  const padding = { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 96, paddingHorizontal: 20 };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.bgTop, colors.bg, colors.bg]}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />
      {scroll ? (
        <ScrollView
          contentInsetAdjustmentBehavior="never"
          contentContainerStyle={[padding, { gap: 20 }]}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.root, padding]}>{children}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
});
