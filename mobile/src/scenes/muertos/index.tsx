/**
 * Día de Muertos, ported from web/src/components/scenes/muertos-scene.tsx (+ muertos-art.tsx and
 * the "calavera" ornament in bet-dial.tsx): an ofrenda by candlelight under papel picado,
 * a marigold blooming round the dial, and the calavera mascot.
 */
import type { ThemeKit } from '../types';
import { CalaveraFace } from './art';
import { MarigoldBloom } from './bloom';
import { CalaveraDial } from './dial';
import { CalaveraDance, CalaveraVerdict } from './flourish';
import { MuertosScene } from './scene';

export const kit: ThemeKit = {
  Scene: MuertosScene,
  DialBackdrop: MarigoldBloom,
  DialOver: CalaveraDial,
  RollFlourish: CalaveraDance,
  ResultFlourish: CalaveraVerdict,
  MascotFace: CalaveraFace,
};
