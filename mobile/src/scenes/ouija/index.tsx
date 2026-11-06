/**
 * Ouija, ported from web/src/components/scenes/ouija-scene.tsx (+ the "ouija" ornament in
 * bet-dial.tsx): a candlelit spirit board seen through old film, a letter ring round the dial
 * with a planchette spelling out the spirits' message.
 */
import type { ThemeKit } from '../types';
import { OuijaDial } from './dial';
import { FilmFX } from './film';
import { SpiritRing } from './ring';
import { OuijaRoll } from './roll';
import { OuijaScene } from './scene';

export const kit: ThemeKit = {
  Scene: OuijaScene,
  DialBackdrop: SpiritRing,
  DialOver: OuijaDial,
  RollFlourish: OuijaRoll,
  Overlay: FilmFX,
};
