import { TabList, TabSlot, Tabs, TabTrigger } from 'expo-router/ui';

import { TabBar } from '@/components/tab-bar';

/**
 * Headless tabs with our own bar (components/tab-bar.tsx), which looks like the system one but
 * takes its light or dark from the theme. The hidden list only declares the routes.
 */
export default function TabsLayout() {
  return (
    <Tabs>
      <TabSlot />
      <TabList style={{ display: 'none' }}>
        <TabTrigger name="index" href="/" />
        <TabTrigger name="history" href="/history" />
        <TabTrigger name="settings" href="/settings" />
      </TabList>
      <TabBar />
    </Tabs>
  );
}
