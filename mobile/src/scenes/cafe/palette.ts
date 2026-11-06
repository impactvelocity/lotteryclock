/**
 * Caffè's palette and shared shapes (web/src/components/scenes/cafe-art.tsx): flat colour with
 * an espresso-brown ink line, like a vintage Italian travel poster.
 */

export const CA = {
  ink: '#3A2418',
  espresso: '#5A3522',
  crema: '#B98252',
  foam: '#FBF1E0',
  cream: '#FBF3E4',
  porcelain: '#FFFCF6',
  terracotta: '#C4512F',
  ochre: '#E2A23B',
  gold: '#F3D68A',
  shutter: '#2F5D46',
  cypress: '#3C4A2A',
  geranium: '#D9473A',
  pink: '#EE7A6E',
  steel: '#CDD2D5',
  steelLight: '#E9ECEE',
  steelMid: '#A9B0B5',
  steelDark: '#7E868C',
  bakelite: '#2E1D15',
  blush: '#EE9A86',
  mouth: '#8E3B2A',
  tongue: '#E07A6A',
  swallow: '#2C3546',
  vespa: '#9FD0BE',
  vespaShade: '#7FB8A3',
  skin: '#F1C7A5',
};

/** A heart, about 16 × 11 around (0, 0). */
export const HEART = 'M0 6C-3 3.6-8 1-8-2.8A4 4 0 0 1 0-4.4 4 4 0 0 1 8-2.8C8 1 3 3.6 0 6Z';

export const clamp = (n: number) => Math.max(0, Math.min(1, n));
