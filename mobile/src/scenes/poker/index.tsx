/**
 * Poker (decor "poker"): a card table. Mirrors the web's PokerScene, PotLight, PokerRoll and
 * the dial's "chip" ornament.
 */
import type { ThemeKit } from '../types';

import { PokerRoll } from './cards';
import { ChipOrnament } from './dial';
import { PokerScene, PotLight } from './scene';

export const kit: ThemeKit = {
  Scene: PokerScene,
  DialBackdrop: PotLight,
  DialOver: ChipOrnament,
  RollFlourish: PokerRoll,
};
