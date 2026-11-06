import { useAppState } from '@/lib/store';

import { THEMES, type Theme } from './themes';

/** The chosen theme and its index in THEMES. */
export function useTheme(): { theme: Theme; index: number } {
  const { settings } = useAppState();
  const i = Math.max(0, THEMES.findIndex((t) => t.id === settings.themeId));
  return { theme: THEMES[i], index: i };
}
