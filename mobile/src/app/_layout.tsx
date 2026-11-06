import * as Notifications from 'expo-notifications';
import { router, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { Appearance, LogBox, Platform, Settings } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaListener } from 'react-native-safe-area-context';
import { Uniwind } from 'uniwind';

import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import '@/global.css';
import { isLightTheme } from '@/components/theme-picker';
import { hydrate, useAppState } from '@/lib/store';
import { useTheme } from '@/themes/use-theme';

SplashScreen.preventAutoHideAsync();

// Known-harmless dev warnings from scene animations; keep the screen clear for demos
LogBox.ignoreLogs(['may be overwritten by a layout animation', 'Sending `onAnimatedValueUpdate`']);

/**
 * Developer hook: launching with `-lcPreview "theme=night&range=30&mood=idle"` (simctl launch
 * arguments land in NSUserDefaults) opens the scene preview instead of the app.
 */
function previewQuery(): string | null {
  if (Platform.OS !== 'ios' || !__DEV__) return null;
  const q = Settings.get('lcPreview');
  return typeof q === 'string' && q.length ? q : null;
}

export default function RootLayout() {
  const { hydrated } = useAppState();
  const { theme } = useTheme();
  const light = isLightTheme(theme);

  // The whole app (tab bar glass, sheets, pickers) follows the theme's light or dark, never the
  // phone's setting, so the bar doesn't flip between light and dark over the scenes
  useEffect(() => {
    Appearance.setColorScheme(light ? 'light' : 'dark');
  }, [light]);

  useEffect(() => {
    hydrate();
    // Tapping the alarm notification opens Play, which reveals the draw once it's due
    const sub = Notifications.addNotificationResponseReceivedListener(() => router.navigate('/'));
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    SplashScreen.hideAsync();
    const q = previewQuery();
    if (q) router.replace(`/preview?${q}`);
  }, [hydrated]);

  if (!hydrated) return null;

  return (
    <SafeAreaListener onChange={({ insets }) => Uniwind.updateInsets(insets)}>
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#000' }}>
        <GluestackUIProvider mode="dark">
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#000' } }}>
            <Stack.Screen name="(tabs)" options={{ statusBarStyle: isLightTheme(theme) ? 'dark' : 'light' }} />
            <Stack.Screen name="preview" options={{ animation: 'none' }} />
            <Stack.Screen
              name="themes"
              options={{
                presentation: 'formSheet',
                sheetAllowedDetents: 'fitToContents',
                sheetGrabberVisible: true,
                sheetCornerRadius: 28,
              }}
            />
            <Stack.Screen
              name="time"
              options={{
                presentation: 'formSheet',
                sheetAllowedDetents: 'fitToContents',
                sheetGrabberVisible: true,
                sheetCornerRadius: 28,
              }}
            />
          </Stack>
        </GluestackUIProvider>
      </GestureHandlerRootView>
    </SafeAreaListener>
  );
}
