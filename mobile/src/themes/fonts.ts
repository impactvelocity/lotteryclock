/**
 * The Geist fonts, bundled at build time by the expo-font config plugin (app.json).
 * On iOS a bundled font is addressed by its PostScript name, one name per weight, so
 * components ask fontFor(family, weight) instead of combining fontFamily with fontWeight.
 */

export type FontKey = 'sans' | 'serif' | 'serifTriangle' | 'serifHeart' | 'mono' | 'pixel';
export type Weight = 400 | 500 | 600 | 700 | 800 | 900;

const SANS: Record<Weight, string> = {
  400: 'Geist-Regular',
  500: 'Geist-Medium',
  600: 'Geist-SemiBold',
  700: 'Geist-Bold',
  800: 'Geist-ExtraBold',
  900: 'Geist-Black',
};

const MONO: Record<Weight, string> = {
  400: 'GeistMono-Regular',
  500: 'GeistMono-Medium',
  600: 'GeistMono-Medium',
  700: 'GeistMono-Bold',
  800: 'GeistMono-Bold',
  900: 'GeistMono-Bold',
};

/** The font file for a family at a weight. Serif and Pixel come in one weight only. */
export function fontFor(key: FontKey, weight: Weight = 400): string {
  switch (key) {
    case 'sans':
      return SANS[weight];
    case 'mono':
      return MONO[weight];
    case 'serif':
      return 'GeistSerif-Regular';
    case 'serifTriangle':
      return 'GeistSerif-Triangle';
    case 'serifHeart':
      return 'GeistSerif-Heart';
    case 'pixel':
      return 'GeistPixel-Square';
  }
}

/** Shorthand for the body face. */
export const sans = (weight: Weight = 400) => SANS[weight];

/** Every bundled font file, for the expo-font config plugin and useFonts. */
export const FONT_FILES = [
  'Geist-Regular',
  'Geist-Medium',
  'Geist-SemiBold',
  'Geist-Bold',
  'Geist-ExtraBold',
  'Geist-Black',
  'GeistMono-Regular',
  'GeistMono-Medium',
  'GeistMono-Bold',
  'GeistSerif-Regular',
  'GeistSerif-Triangle',
  'GeistSerif-Heart',
  'GeistPixel-Square',
] as const;
