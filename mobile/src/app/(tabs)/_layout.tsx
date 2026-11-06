import { NativeTabs } from 'expo-router/native-tabs';

import { useTheme } from '@/themes/use-theme';

/**
 * Icons only (Lucide: clock-fading, chart-no-axes-column, settings-2, as template PNGs the tab
 * bar tints); the labels are hidden, but VoiceOver still reads them.
 */
export default function TabsLayout() {
  const { theme: t } = useTheme();
  return (
    <NativeTabs tintColor={t.rail}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label hidden>Play</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon src={require('../../../assets/images/tabs/play.png')} renderingMode="template" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="history">
        <NativeTabs.Trigger.Label hidden>History</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon src={require('../../../assets/images/tabs/history.png')} renderingMode="template" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings">
        <NativeTabs.Trigger.Label hidden>Settings</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon src={require('../../../assets/images/tabs/settings.png')} renderingMode="template" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
