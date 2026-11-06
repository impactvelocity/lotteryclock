import type { ComponentType } from 'react';

import type { Theme } from '@/themes/themes';

/** What the Play screen is doing, so a scene can react: picking a bet, armed / mid-draw, or a result. */
export type SceneMood = 'idle' | 'set' | 'win' | 'loss' | 'jackpot';

/** Where the dial sits inside the scene: its centre (scene coordinates, pt) and its diameter. */
export type DialSpot = { x: number; y: number; size: number };

export type SceneProps = {
  /** Bet as a fraction of the maximum (45 min), 0..1. */
  p: number;
  /** Bet tier, 0 (no gamble) to 5 (the full 45). */
  tier: number;
  mood: SceneMood;
  /** The scene's size in pt. It fills the screen from the very top down to the rail line. */
  width: number;
  height: number;
  /** The dial's position, so scenes can arrange things around it. */
  dial: DialSpot;
};

export type BackdropProps = {
  p: number;
  /** Bet in minutes, 0..45. */
  range: number;
  /** False once the alarm is set (the dial has been swapped for the bedside clock): fade out. */
  visible: boolean;
  /** The dial's diameter. The backdrop is drawn in a `size` × `size` box centred on the dial, overflow visible. */
  size: number;
  mood: SceneMood;
};

/** Props for SVG layers drawn inside the dial's own <Svg viewBox="0 0 358 358">. Return SVG elements only. */
export type DialLayerProps = {
  range: number;
  p: number;
  theme: Theme;
};

/**
 * Everything theme-specific that the Play screen draws, mirroring the web app's
 * web/src/components/scenes/index.tsx. Only `Scene` is required.
 */
export type ThemeKit = {
  /** The full background scene: sky, creatures, horizon. Drawn behind everything; never touchable. */
  Scene: ComponentType<SceneProps>;
  /** The effect centred behind the dial (sun rays, moon halo, spirit ring…), still behind every control. */
  DialBackdrop?: ComponentType<BackdropProps>;
  /** SVG drawn inside the dial under the minute ticks (prize wedges, the 8 ball's die…). */
  DialUnder?: ComponentType<DialLayerProps>;
  /** SVG drawn inside the dial over the ticks (wheel pointer, ornaments, suits, pixel lives…). */
  DialOver?: ComponentType<DialLayerProps>;
  /** A little show above the progress bar while the draw rolls (Night: counting sheep). Max ~200 × 80 pt. */
  RollFlourish?: ComponentType<object>;
  /** A small reaction to the left of the result badge, vertically centred on it. Max ~56 × 56 pt. */
  ResultFlourish?: ComponentType<{ mood: SceneMood }>;
  /** A face per bet tier, shown beside the tier name (themes with `mascot`). */
  MascotFace?: ComponentType<{ tier: number; size: number }>;
  /** Laid over the whole screen, text included (Ouija's old film). Never touchable. */
  Overlay?: ComponentType<{ width: number; height: number }>;
};
