/**
 * Caffè ("Espresso in the Tuscan sun"): a vintage Italian travel poster. A Tuscan street café
 * under rolling cypress hills, the dial a cappuccino on its saucer, latte art in the foam and a
 * moka pot for a mascot. Mirrors the web's CafeScene and CafeSaucer
 * (web/src/components/scenes/cafe-scene.tsx) and CafeRoll, MokaVerdict, MokaFace and LatteArt
 * (cafe-art.tsx).
 */
import type { ThemeKit } from '../types';
import { LatteArt } from './latte';
import { CafeRoll, MokaFace, MokaVerdict } from './moka';
import { CafeSaucer } from './saucer';
import { CafeScene } from './scene';

export const kit: ThemeKit = {
  Scene: CafeScene,
  DialBackdrop: CafeSaucer,
  DialUnder: LatteArt,
  RollFlourish: CafeRoll,
  ResultFlourish: MokaVerdict,
  MascotFace: MokaFace,
};
