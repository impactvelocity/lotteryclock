/**
 * Good Night: moonrise over a sleepless city (web: night-scene.tsx, night-art.tsx,
 * night-skyline.tsx). The scene, the moon-phase halo behind the dial, and counting sheep while
 * the draw rolls. No dial ornament and no mascot.
 */
import { ALL_THEMES } from '@/themes/themes';

import type { ThemeKit } from '../types';
import { CountingSheep } from './art';
import { MoonHalo } from './halo';
import { NightScene } from './scene';

/** The sheep's count is in the theme's ink; the fence a dusky lilac (as on the web). */
const INK = ALL_THEMES.find((t) => t.id === 'night')?.ink ?? '#E7EEFB';

function NightRoll() {
  return <CountingSheep ink={INK} fence="#8C6BA6" />;
}

export const kit: ThemeKit = {
  Scene: NightScene,
  DialBackdrop: MoonHalo,
  RollFlourish: NightRoll,
};
