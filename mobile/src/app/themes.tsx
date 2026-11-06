/**
 * Every theme, in a native sheet that slides up from the bottom (presented as a form sheet by the
 * root stack), opened from the theme pill on the Play tab. Picking one closes it.
 */
import * as Haptics from 'expo-haptics';
import { router, Stack } from 'expo-router';
import { Text, View } from 'react-native';

import { ThemeList } from '@/components/theme-picker';
import { actions, useAppState } from '@/lib/store';
import { sans } from '@/themes/fonts';
import { THEMES } from '@/themes/themes';
import { useTheme } from '@/themes/use-theme';

export default function ThemesSheet() {
  const { settings } = useAppState();
  const { theme: t, index } = useTheme();

  return (
    <View style={{ backgroundColor: t.sheet, paddingHorizontal: 12, paddingTop: 22, paddingBottom: 12 }}>
      <Stack.Screen options={{ contentStyle: { backgroundColor: t.sheet } }} />
      <Text style={{ color: t.ink, fontFamily: sans(800), fontSize: 22, marginLeft: 10, marginBottom: 10 }}>Theme</Text>
      <ThemeList
        themes={THEMES}
        index={index}
        current={t}
        onSelect={(i) => {
          if (i !== index) {
            if (settings.haptics) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            actions.updateSettings({ themeId: THEMES[i].id });
          }
          router.back();
        }}
      />
    </View>
  );
}
