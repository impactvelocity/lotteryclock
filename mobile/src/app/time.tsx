/**
 * The target time, in a native sheet that slides up from the bottom (presented as a form sheet
 * by the root stack). Changes save as the wheels turn.
 */
import DateTimePicker from '@react-native-community/datetimepicker';
import { router, Stack } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { isLightTheme } from '@/components/theme-picker';
import { actions, useAppState } from '@/lib/store';
import { sans } from '@/themes/fonts';
import { useTheme } from '@/themes/use-theme';

export default function TimeSheet() {
  const { settings } = useAppState();
  const { theme: t } = useTheme();
  const insets = useSafeAreaInsets();
  const value = new Date();
  value.setHours(settings.wakeHour, settings.wakeMinute, 0, 0);

  return (
    <View style={{ backgroundColor: t.sheet, paddingHorizontal: 20, paddingTop: 22, paddingBottom: insets.bottom + 12 }}>
      <Stack.Screen options={{ contentStyle: { backgroundColor: t.sheet } }} />
      <Text style={{ color: t.ink, fontFamily: sans(800), fontSize: 22 }}>Target time</Text>
      <Text style={{ color: t.muted, fontFamily: sans(500), fontSize: 14, marginTop: 4 }}>
        When you actually need to be up. The alarm rings somewhere around it.
      </Text>
      <DateTimePicker
        value={value}
        mode="time"
        display="spinner"
        themeVariant={isLightTheme(t) ? 'light' : 'dark'}
        textColor={t.ink}
        accentColor={t.arcStops[1]}
        onChange={(_, d) => d && actions.updateSettings({ wakeHour: d.getHours(), wakeMinute: d.getMinutes() })}
        style={{ alignSelf: 'stretch' }}
      />
      <Pressable onPress={() => router.back()} accessibilityRole="button">
        {({ pressed }) => (
          <View
            style={{
              height: 54,
              borderRadius: 999,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: t.btnOnBg,
              opacity: pressed ? 0.85 : 1,
            }}
          >
            <Text style={{ color: t.btnOnInk, fontFamily: sans(700), fontSize: 17 }}>Done</Text>
          </View>
        )}
      </Pressable>
    </View>
  );
}
