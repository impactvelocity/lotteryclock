/**
 * Digital: an 8-bit arcade screen (web: digital-scene.tsx, digital-art.tsx, and the "pixel"
 * ornament and pixel handle in bet-dial.tsx). The scene, the pixel rings behind the dial, the
 * arcade-screen dial ornament, and Bit, the pocket LCD clock mascot.
 */
import type { ThemeKit } from '../types';
import { BitFace, BitVerdict, DigitalRoll } from './bit';
import { PixelOrnament } from './dial';
import { PixelHalo } from './halo';
import { DigitalScene } from './scene';

/** The pixel bell for Digital's square dial handle (used by the core dial). */
export { PixelBell } from './dial';

export const kit: ThemeKit = {
  Scene: DigitalScene,
  DialBackdrop: PixelHalo,
  DialOver: PixelOrnament,
  RollFlourish: DigitalRoll,
  ResultFlourish: BitVerdict,
  MascotFace: BitFace,
};
