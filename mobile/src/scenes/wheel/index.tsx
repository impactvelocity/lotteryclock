/**
 * Prize wheel (decor "wheel"): a game-show floor. Mirrors the web's WheelScene, WheelBurst,
 * WheelFace / WheelPointer (the dial's wedges and pointer), WheelRoll and LuckyFace.
 */
import type { ThemeKit } from '../types';

import { LuckyFace, WheelFace, WheelPointer, WheelRoll } from './art';
import { WheelBurst, WheelScene } from './scene';

export const kit: ThemeKit = {
  Scene: WheelScene,
  DialBackdrop: WheelBurst,
  DialUnder: WheelFace,
  DialOver: WheelPointer,
  RollFlourish: WheelRoll,
  MascotFace: LuckyFace,
};
