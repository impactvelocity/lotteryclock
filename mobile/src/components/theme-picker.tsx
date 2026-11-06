/**
 * Theme controls, ported from web/src/components/theme-picker.tsx: previous / next chips and a
 * pill with the theme's swatch and name, which opens a sheet listing every theme. Chips are
 * Liquid Glass (iOS 26), tinted with the theme, so they sit well on any scene.
 */
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import type { ReactNode } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';

import { sans } from '@/themes/fonts';
import { baseColor, css, ramp, type Theme } from '@/themes/themes';

const GLASS = isLiquidGlassAvailable();

/** Whether a theme is light (dark ink on a light background). */
export function isLightTheme(t: Theme) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(t.ink.slice(i, i + 2), 16));
  return 0.299 * r + 0.587 * g + 0.114 * b < 128;
}

/** A see-through, theme-tinted surface for controls. */
export function Glass({
  theme: t,
  style,
  children,
}: {
  theme: Theme;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
}) {
  const light = isLightTheme(t);
  const ring = light ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.1)';
  const shadow = `0 0 0 1px ${ring}, 0 1px 2px rgba(0,0,0,0.06), 0 6px 16px -4px rgba(0,0,0,0.14)`;
  if (GLASS) {
    return (
      <GlassView
        glassEffectStyle="regular"
        colorScheme={light ? 'light' : 'dark'}
        tintColor={`${t.chip}88`}
        style={[{ boxShadow: shadow, overflow: 'hidden' }, style]}
      >
        {children}
      </GlassView>
    );
  }
  return <View style={[{ backgroundColor: `${t.chip}CC`, boxShadow: shadow }, style]}>{children}</View>;
}

/** A round glass button with an icon. */
export function Chip({
  theme,
  onPress,
  label,
  size = 44,
  children,
}: {
  theme: Theme;
  onPress: () => void;
  label: string;
  size?: number;
  children: ReactNode;
}) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} hitSlop={6}>
      {({ pressed }) => (
        <Glass
          theme={theme}
          style={{
            width: size,
            height: size,
            borderRadius: size,
            alignItems: 'center',
            justifyContent: 'center',
            transform: [{ scale: pressed ? 0.88 : 1 }],
          }}
        >
          {children}
        </Glass>
      )}
    </Pressable>
  );
}

/** A tiny dial: the theme's background, ring and disc. */
export function Swatch({ theme: t, size = 22 }: { theme: Theme; size?: number }) {
  const pad = Math.max(2, size * 0.12);
  const inner = size - pad * 2;
  const r = inner / 2;
  // Approximates the web's conic gradient: arc colours over 62% of the turn, then the track
  const slices = 24;
  const arcs = Array.from({ length: slices }, (_, i) => {
    const f = i / slices;
    const a1 = f * 360;
    const a2 = ((i + 1) / slices) * 360 + 0.5;
    const color = f < 0.62 ? css(ramp(t.arcStops, f / 0.62)) : t.track;
    return { d: wedge(r, r, r, a1, a2), color };
  });
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size,
        padding: pad,
        backgroundColor: baseColor(t),
        boxShadow: '0 0 0 1px rgba(0,0,0,0.1)',
      }}
    >
      <Svg width={inner} height={inner}>
        {arcs.map((a, i) => (
          <Path key={i} d={a.d} fill={a.color} />
        ))}
      </Svg>
      <View
        style={{
          position: 'absolute',
          left: pad + inner * 0.24,
          top: pad + inner * 0.24,
          width: inner * 0.52,
          height: inner * 0.52,
          borderRadius: inner,
          backgroundImage: t.disc,
        }}
      />
    </View>
  );
}

function wedge(cx: number, cy: number, r: number, a1: number, a2: number) {
  const p = (a: number) => {
    const rad = (a * Math.PI) / 180;
    return `${(cx + r * Math.sin(rad)).toFixed(2)} ${(cy - r * Math.cos(rad)).toFixed(2)}`;
  };
  return `M${cx} ${cy} L${p(a1)} A${r} ${r} 0 0 1 ${p(a2)} Z`;
}

const Chevron = ({ dir, color }: { dir: 'left' | 'right'; color: string }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24">
    <Path
      d={dir === 'left' ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7'}
      fill="none"
      stroke={color}
      strokeWidth={2.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export function ThemePicker({
  themes,
  index,
  onSelect,
  onOpen,
}: {
  themes: Theme[];
  index: number;
  onSelect: (index: number) => void;
  onOpen: () => void;
}) {
  const t = themes[index];
  const n = themes.length;
  return (
    <View style={styles.row}>
      <Chip theme={t} label="Previous theme" onPress={() => onSelect((index - 1 + n) % n)}>
        <Chevron dir="left" color={t.chipInk} />
      </Chip>
      {/* A fixed width, so the arrows stay put whatever the theme is called */}
      <Pressable
        onPress={onOpen}
        accessibilityRole="button"
        accessibilityLabel={`Theme: ${t.name}, ${index + 1} of ${n}. Choose a theme`}
        style={{ flex: 1, maxWidth: 300 }}
      >
        {({ pressed }) => (
          <Glass
            theme={t}
            style={[styles.pill, { transform: [{ scale: pressed ? 0.96 : 1 }] }]}
          >
            <Swatch theme={t} size={30} />
            <Text numberOfLines={1} style={{ color: t.chipInk, fontFamily: sans(600), fontSize: 17, flex: 1 }}>
              {t.name}
            </Text>
            <Text style={{ color: t.chipInk, opacity: 0.55, fontFamily: sans(500), fontSize: 12, fontVariant: ['tabular-nums'] }}>
              {index + 1}/{n}
            </Text>
          </Glass>
        )}
      </Pressable>
      <Chip theme={t} label="Next theme" onPress={() => onSelect((index + 1) % n)}>
        <Chevron dir="right" color={t.chipInk} />
      </Chip>
    </View>
  );
}

/** Every theme in a sheet, each row drawn in its own colours. */
export function ThemeSheet({
  themes,
  index,
  open,
  onClose,
  onSelect,
}: {
  themes: Theme[];
  index: number;
  open: boolean;
  onClose: () => void;
  onSelect: (index: number) => void;
}) {
  const insets = useSafeAreaInsets();
  const t = themes[index];
  return (
    <Modal visible={open} transparent animationType="none" onRequestClose={onClose}>
      {open && (
        <View style={StyleSheet.absoluteFill}>
          <Animated.View entering={FadeIn} exiting={FadeOut} style={[StyleSheet.absoluteFill, { backgroundColor: t.scrim }]}>
            <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close" />
          </Animated.View>
          <Animated.View
            entering={SlideInDown.springify().damping(22)}
            exiting={SlideOutDown.duration(200)}
            style={[styles.sheet, { backgroundColor: t.sheet, paddingBottom: insets.bottom + 12 }]}
          >
            <View style={[styles.grabber, { backgroundColor: t.faint }]} />
            <Text style={{ color: t.ink, fontFamily: sans(800), fontSize: 22, marginBottom: 8, marginLeft: 4 }}>
              Pick a theme
            </Text>
            <ScrollView style={{ maxHeight: 520 }} contentContainerStyle={{ gap: 8 }}>
              {themes.map((th, i) => (
                <Pressable
                  key={th.id}
                  onPress={() => {
                    onSelect(i);
                    onClose();
                  }}
                  accessibilityRole="button"
                  accessibilityState={{ selected: i === index }}
                  accessibilityLabel={`${th.name}. ${th.tagline}`}
                >
                  {({ pressed }) => (
                    <View
                      style={[
                        styles.themeRow,
                        {
                          backgroundImage: `linear-gradient(90deg, ${baseColor(th)} 0%, ${th.bg.kind === 'flat' ? th.bg.to : th.bg.b[0]} 100%)`,
                          borderColor: i === index ? th.arcStops[1] : 'transparent',
                          transform: [{ scale: pressed ? 0.98 : 1 }],
                        },
                      ]}
                    >
                      <Swatch theme={th} size={40} />
                      <View style={{ flex: 1, gap: 2 }}>
                        <Text style={{ color: th.ink, fontFamily: sans(700), fontSize: 17 }}>{th.name}</Text>
                        <Text style={{ color: th.muted, fontFamily: sans(500), fontSize: 13 }} numberOfLines={1}>
                          {th.tagline}
                        </Text>
                      </View>
                      {i === index && (
                        <Svg width={22} height={22} viewBox="0 0 24 24">
                          <Circle cx={12} cy={12} r={11} fill={th.arcStops[1]} />
                          <Path d="M7 12.5l3.2 3.2L17 9" fill="none" stroke="#fff" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
                        </Svg>
                      )}
                    </View>
                  )}
                </Pressable>
              ))}
            </ScrollView>
          </Animated.View>
        </View>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingHorizontal: 16 },
  pill: {
    height: 52,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingLeft: 10,
    paddingRight: 18,
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  grabber: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3, marginBottom: 12 },
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 12,
    borderRadius: 18,
    borderWidth: 2,
  },
});
