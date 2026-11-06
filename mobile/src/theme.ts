/** Hex values for places Tailwind classes can't reach (gradients, SVG, native props). Keep in sync with global.css. */
export const colors = {
  bg: '#0B0816',
  bgTop: '#1C1038',
  card: '#17112A',
  border: '#342958',
  fg: '#F5F0FF',
  muted: '#A79FC4',
  gold: '#FFC93C',
  goldDeep: '#FF9F1C',
  neon: '#FF3D9A',
  win: '#34E39A',
  loss: '#FF4D6D',
  hustle: '#5EC8FF',
} as const;

export const fonts = {
  /** Marquee display font. Don't combine with font-bold. */
  display: 'Bungee_400Regular',
} as const;

/** Casino chip colors per bet size. */
export const chipColors: Record<number, string> = {
  5: '#E63946',
  10: '#3A86FF',
  15: '#2BB673',
  20: '#9B5DE5',
  30: '#FF8C42',
  45: '#1F1A2E',
};
