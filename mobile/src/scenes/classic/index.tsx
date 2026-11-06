/**
 * Classic ("Good Morning"): a sunrise over a waking village, the sun behind the dial, and the
 * sun mascot rising over the progress bar. Mirrors the web's SunriseScene, SunRays, SunRoll and
 * SunVerdict (web/src/components/scenes/sunrise-scene.tsx). No dial ornament and no mascot:
 * its tier icons are drawn by the core.
 */
import type { ThemeKit } from '../types';
import { SunRays } from './rays';
import { SunriseScene } from './sky';
import { SunRoll, SunVerdict } from './sun';

export const kit: ThemeKit = {
  Scene: SunriseScene,
  DialBackdrop: SunRays,
  RollFlourish: SunRoll,
  ResultFlourish: SunVerdict,
};
