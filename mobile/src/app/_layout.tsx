import { router, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { Platform, Settings } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaListener } from 'react-native-safe-area-context';
import { Uniwind } from 'uniwind';

import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import '@/global.css';
import { hydrate, useAppState } from '@/lib/store';

SplashScreen.preventAutoHideAsync();

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

  useEffect(() => {
    hydrate();
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
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="preview" options={{ animation: 'none' }} />
            <Stack.Screen
              name="reveal"
              options={{ presentation: 'fullScreenModal', animation: 'fade', gestureEnabled: false }}
            />
          </Stack>
        </GluestackUIProvider>
      </GestureHandlerRootView>
    </SafeAreaListener>
  );
}
