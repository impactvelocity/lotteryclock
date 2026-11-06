/**
 * Theme kits by decor, mirroring web/src/components/scenes/index.tsx. Each theme's
 * scene, dial backdrop, dial ornaments, flourishes and mascot live in ./<theme>/.
 */
import type { Theme } from '@/themes/themes';

import { kit as cafe } from './cafe';
import { kit as classic } from './classic';
import { kit as digital } from './digital';
import { kit as eightball } from './eightball';
import { kit as muertos } from './muertos';
import { kit as night } from './night';
import { kit as ouija } from './ouija';
import { kit as poker } from './poker';
import { kit as tarot } from './tarot';
import type { ThemeKit } from './types';
import { kit as wheel } from './wheel';

export type * from './types';

const NONE: ThemeKit = { Scene: () => null };

const KITS: Partial<Record<Theme['decor'], ThemeKit>> = {
  sun: classic,
  night,
  muertos,
  wheel,
  poker,
  ouija,
  tarot,
  digital,
  eightball,
  cafe,
  none: NONE,
};

export function kitFor(theme: Theme): ThemeKit {
  return KITS[theme.decor] ?? NONE;
}
