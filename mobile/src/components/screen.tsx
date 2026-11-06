import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { isLightTheme } from '@/components/theme-picker';
import { fontFor } from '@/themes/fonts';
import { useTheme } from '@/themes/use-theme';
import { background, css, cssA, rampN, type Theme } from '@/themes/themes';

/** The theme's sky behind a scrolling page, padded for the status bar and the tab bar. */
export function Screen({ title, children }: { title: string; children: ReactNode }) {
  const insets = useSafeAreaInsets();
  const { theme: t } = useTheme();
  // The sky's top colour, for the fade under the status bar
  const top = t.bg.kind === 'flat' ? t.bg.from : css(rampN(t.bg.a, 0.15));
  return (
    <View style={[styles.root, { backgroundImage: background(t, 0.15) }]}>
      <StatusBar style={isLightTheme(t) ? 'dark' : 'light'} />
      <Glow theme={t} />
      <ScrollView
        contentInsetAdjustmentBehavior="never"
        contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: insets.bottom + 110, paddingHorizontal: 18, gap: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <Text accessibilityRole="header" style={{ color: t.ink, fontFamily: fontFor(t.titleFont, 800), fontSize: 34, letterSpacing: -0.6, marginBottom: 2 }}>
          {title}
        </Text>
        {children}
      </ScrollView>
      {/* Content fades out under the status bar instead of colliding with it */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: insets.top + 16,
          backgroundImage: `linear-gradient(180deg, ${top} 0%, ${top} 55%, rgba(0,0,0,0) 100%)`,
        }}
      />
    </View>
  );
}

/** A soft wash of the arc's colour at the top, like the dial's halo. */
function Glow({ theme: t }: { theme: Theme }) {
  const a = rampN(t.arcStops, 0.35);
  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: `radial-gradient(circle at 85% 0%, ${cssA(a, 0.22)} 0%, rgba(0,0,0,0) 55%)`,
      }}
    />
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});

