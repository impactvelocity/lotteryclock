/**
 * The floating tab bar: a copy of the iOS 26 Liquid Glass tab bar (icons only, a pill behind the
 * current tab), drawn by us so its light or dark always comes from the theme. The system bar
 * picks its own appearance and would sometimes turn dark over the light Good Morning theme.
 */
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import { useTabTrigger } from 'expo-router/ui';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import Animated, { cubicBezier } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { isLightTheme } from '@/components/theme-picker';
import { useTheme } from '@/themes/use-theme';

const GLASS = isLiquidGlassAvailable();

const TABS = [
  { name: 'index', label: 'Play', icon: require('../../assets/images/tabs/play.png') },
  { name: 'history', label: 'History', icon: require('../../assets/images/tabs/history.png') },
  { name: 'settings', label: 'Settings', icon: require('../../assets/images/tabs/settings.png') },
] as const;

/** Measured from the system bar on an iPhone 17 Pro. */
const SLOT = 86;
const PILL_W = 94;
const PILL_H = 54;
const PAD = 4;
const BAR_W = PAD * 2 + PILL_W + SLOT * (TABS.length - 1);
const BAR_H = PILL_H + PAD * 2;

export function TabBar() {
  const { theme: t } = useTheme();
  const insets = useSafeAreaInsets();
  const light = isLightTheme(t);
  const play = useTabTrigger({ name: 'index' });
  const history = useTabTrigger({ name: 'history' });
  const settings = useTabTrigger({ name: 'settings' });
  const triggers = [play, history, settings];
  const current = Math.max(0, triggers.findIndex((tr) => tr.trigger?.isFocused));

  const ring = light ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)';
  const shadow = `0 0 0 0.5px ${ring}, 0 8px 24px -6px rgba(0,0,0,${light ? 0.16 : 0.4})`;
  const barStyle = [styles.bar, { bottom: Math.max(insets.bottom - 12, 12), boxShadow: shadow }];

  const content = (
    <>
      <Animated.View
        style={[
          styles.pill,
          {
            backgroundColor: light ? 'rgba(0,0,0,0.065)' : 'rgba(255,255,255,0.13)',
            transform: [{ translateX: current * SLOT }],
            transitionProperty: 'transform',
            transitionDuration: 320,
            transitionTimingFunction: cubicBezier(0.25, 1, 0.35, 1),
          },
        ]}
      />
      {TABS.map((tab, i) => {
        const focused = i === current;
        return (
          <Pressable
            key={tab.name}
            onPress={(e) => triggers[i].triggerProps.onPress?.(e)}
            accessibilityRole="tab"
            accessibilityLabel={tab.label}
            accessibilityState={{ selected: focused }}
            style={[styles.slot, { left: PAD + (PILL_W - SLOT) / 2 + i * SLOT }]}
          >
            {({ pressed }) => (
              <Image
                source={tab.icon}
                style={{
                  width: 24,
                  height: 24,
                  tintColor: focused ? t.rail : t.ink,
                  transform: [{ scale: pressed ? 0.86 : 1 }],
                }}
              />
            )}
          </Pressable>
        );
      })}
    </>
  );

  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      {GLASS ? (
        <GlassView glassEffectStyle="regular" colorScheme={light ? 'light' : 'dark'} style={barStyle}>
          {content}
        </GlassView>
      ) : (
        <View style={[barStyle, { backgroundColor: light ? 'rgba(255,252,246,0.94)' : 'rgba(28,26,40,0.94)' }]}>{content}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    alignSelf: 'center',
    width: BAR_W,
    height: BAR_H,
    borderRadius: BAR_H / 2,
    overflow: 'hidden',
  },
  pill: { position: 'absolute', left: PAD, top: PAD, width: PILL_W, height: PILL_H, borderRadius: PILL_H / 2 },
  slot: { position: 'absolute', top: PAD, width: SLOT, height: PILL_H, alignItems: 'center', justifyContent: 'center' },
});
