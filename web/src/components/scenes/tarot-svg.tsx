/**
 * Tarot art, generated from the SVGs in ./art/tarot (attributes camelCased for React, ids and
 * classes dropped because the scene repeats these pieces). Edit those files, then run
 * `node scripts/inline-tarot-svgs.mjs` (from web/) rather than editing this by hand.
 * tarot-art.tsx places the pieces. The prompts that made the art: docs/tarot-theme-svg-prompts.md.
 */

/** The sun's 32 engraved rays (180 × 180, centred on 90, 90), the same for every face. */
export const SUN_RAYS = <>
  <path d="M 90 38 L 90 4" fill="none" stroke="#17383A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  <path d="M 100.1 39 L 104 19.4" fill="none" stroke="#17383A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  <path d="M 109.9 42 L 122.9 10.5" fill="none" stroke="#17383A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  <path d="M 118.9 46.8 L 130 30.1" fill="none" stroke="#17383A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  <path d="M 126.8 53.2 L 150.8 29.2" fill="none" stroke="#17383A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  <path d="M 133.2 61.1 L 149.9 50" fill="none" stroke="#17383A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  <path d="M 138 70.1 L 169.5 57.1" fill="none" stroke="#17383A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  <path d="M 141 79.9 L 160.6 76" fill="none" stroke="#17383A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  <path d="M 142 90 L 176 90" fill="none" stroke="#17383A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  <path d="M 141 100.1 L 160.6 104" fill="none" stroke="#17383A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  <path d="M 138 109.9 L 169.5 122.9" fill="none" stroke="#17383A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  <path d="M 133.2 118.9 L 149.9 130" fill="none" stroke="#17383A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  <path d="M 126.8 126.8 L 150.8 150.8" fill="none" stroke="#17383A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  <path d="M 118.9 133.2 L 130 149.9" fill="none" stroke="#17383A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  <path d="M 109.9 138 L 122.9 169.5" fill="none" stroke="#17383A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  <path d="M 100.1 141 L 104 160.6" fill="none" stroke="#17383A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  <path d="M 90 142 L 90 176" fill="none" stroke="#17383A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  <path d="M 79.9 141 L 76 160.6" fill="none" stroke="#17383A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  <path d="M 70.1 138 L 57.1 169.5" fill="none" stroke="#17383A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  <path d="M 61.1 133.2 L 50 149.9" fill="none" stroke="#17383A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  <path d="M 53.2 126.8 L 29.2 150.8" fill="none" stroke="#17383A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  <path d="M 46.8 118.9 L 30.1 130" fill="none" stroke="#17383A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  <path d="M 42 109.9 L 10.5 122.9" fill="none" stroke="#17383A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  <path d="M 39 100.1 L 19.4 104" fill="none" stroke="#17383A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  <path d="M 38 90 L 4 90" fill="none" stroke="#17383A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  <path d="M 39 79.9 L 19.4 76" fill="none" stroke="#17383A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  <path d="M 42 70.1 L 10.5 57.1" fill="none" stroke="#17383A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  <path d="M 46.8 61.1 L 30.1 50" fill="none" stroke="#17383A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  <path d="M 53.2 53.2 L 29.2 29.2" fill="none" stroke="#17383A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  <path d="M 61.1 46.8 L 50 30.1" fill="none" stroke="#17383A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  <path d="M 70.1 42 L 57.1 10.5" fill="none" stroke="#17383A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  <path d="M 79.9 39 L 76 19.4" fill="none" stroke="#17383A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
</>;

/** The sun's face (r 46 at 90, 90), one per bet tier: temperance, star, fortune, devil, tower, fool. */
export const SUN_FACES = [
  // temperance
  <>
    <circle cx="90" cy="90" r="46" fill="#D7EA7B" stroke="#17383A" strokeWidth="3" />
    <path d="M 52 88 l 4 -4 M 128 88 l -4 -4" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 54 95 l 4 -4 M 126 95 l -4 -4" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 57 102 l 4 -4 M 123 102 l -4 -4" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 61 110 l 4 -4 M 119 110 l -4 -4" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 66 116 l 4 -4 M 114 116 l -4 -4" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 72 121 l 4 -4 M 108 121 l -4 -4" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 91 77 L 88 99 Q 91 103 96 100" fill="none" stroke="#17383A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <ellipse cx="65" cy="99" rx="7" ry="3" fill="#F5B3A3" stroke="#17383A" strokeWidth="0" />
    <ellipse cx="115" cy="99" rx="7" ry="3" fill="#F5B3A3" stroke="#17383A" strokeWidth="0" />
    <path d="M 60 80 Q 69 91 79 81 M 101 81 Q 111 91 120 80" fill="none" stroke="#17383A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 60 71 Q 70 66 79 71 M 101 71 Q 110 66 120 71" fill="none" stroke="#17383A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 80 112 Q 86 109 90 111 Q 94 109 100 112 Q 90 120 80 112 Z" fill="#F07F68" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 81 113 Q 90 116 99 113" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </>,
  // star
  <>
    <circle cx="90" cy="90" r="46" fill="#D7EA7B" stroke="#17383A" strokeWidth="3" />
    <path d="M 52 88 l 4 -4 M 128 88 l -4 -4" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 54 95 l 4 -4 M 126 95 l -4 -4" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 57 102 l 4 -4 M 123 102 l -4 -4" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 61 110 l 4 -4 M 119 110 l -4 -4" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 66 116 l 4 -4 M 114 116 l -4 -4" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 72 121 l 4 -4 M 108 121 l -4 -4" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 91 77 L 88 99 Q 91 103 96 100" fill="none" stroke="#17383A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <ellipse cx="65" cy="99" rx="7" ry="3" fill="#F5B3A3" stroke="#17383A" strokeWidth="0" />
    <ellipse cx="115" cy="99" rx="7" ry="3" fill="#F5B3A3" stroke="#17383A" strokeWidth="0" />
    <path d="M 59 81 Q 69 74 80 81 Q 70 91 59 81 Z" fill="#FBF4E6" stroke="#17383A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 100 81 Q 111 74 121 81 Q 111 91 100 81 Z" fill="#FBF4E6" stroke="#17383A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="71" cy="80" r="3.8" fill="#17383A" stroke="#17383A" strokeWidth="0" />
    <circle cx="112" cy="80" r="3.8" fill="#17383A" stroke="#17383A" strokeWidth="0" />
    <path d="M 112 75.5 L 112.7 78.3 L 115.5 79 L 112.7 79.7 L 112 82.5 L 111.3 79.7 L 108.5 79 L 111.3 78.3 Z" fill="#FBF4E6" stroke="#17383A" strokeWidth="0" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 60 70 Q 70 64 80 70 M 100 70 Q 111 64 121 70" fill="none" stroke="#17383A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 81 113 Q 89 109 99 112 Q 90 119 81 113 Z" fill="#F07F68" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </>,
  // fortune
  <>
    <circle cx="90" cy="90" r="46" fill="#D7EA7B" stroke="#17383A" strokeWidth="3" />
    <path d="M 52 88 l 4 -4 M 128 88 l -4 -4" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 54 95 l 4 -4 M 126 95 l -4 -4" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 57 102 l 4 -4 M 123 102 l -4 -4" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 61 110 l 4 -4 M 119 110 l -4 -4" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 66 116 l 4 -4 M 114 116 l -4 -4" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 72 121 l 4 -4 M 108 121 l -4 -4" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 91 77 L 88 99 Q 91 103 96 100" fill="none" stroke="#17383A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <ellipse cx="65" cy="99" rx="7" ry="3" fill="#F5B3A3" stroke="#17383A" strokeWidth="0" />
    <ellipse cx="115" cy="99" rx="7" ry="3" fill="#F5B3A3" stroke="#17383A" strokeWidth="0" />
    <path d="M 59 81 Q 70 72 81 81 Q 70 91 59 81 Z" fill="#FBF4E6" stroke="#17383A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 100 81 Q 111 72 122 81 Q 111 91 100 81 Z" fill="#FBF4E6" stroke="#17383A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="74" cy="82" r="4" fill="#17383A" stroke="#17383A" strokeWidth="0" />
    <circle cx="115" cy="82" r="4" fill="#17383A" stroke="#17383A" strokeWidth="0" />
    <path d="M 60 68 Q 71 60 81 66 M 100 70 Q 111 66 121 71" fill="none" stroke="#17383A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 80 114 Q 90 116 101 109 Q 96 122 80 114 Z" fill="#F07F68" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </>,
  // devil
  <>
    <path d="M 58 57 C 43 50 46 34 51 30 C 50 42 61 44 67 48 Z" fill="#F07F68" stroke="#17383A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 122 57 C 137 50 134 34 129 30 C 130 42 119 44 113 48 Z" fill="#F07F68" stroke="#17383A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="90" cy="90" r="46" fill="#D7EA7B" stroke="#17383A" strokeWidth="3" />
    <path d="M 52 88 l 4 -4 M 128 88 l -4 -4" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 54 95 l 4 -4 M 126 95 l -4 -4" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 57 102 l 4 -4 M 123 102 l -4 -4" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 61 110 l 4 -4 M 119 110 l -4 -4" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 66 116 l 4 -4 M 114 116 l -4 -4" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 72 121 l 4 -4 M 108 121 l -4 -4" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 91 77 L 88 99 Q 91 103 96 100" fill="none" stroke="#17383A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <ellipse cx="65" cy="99" rx="7" ry="3" fill="#F5B3A3" stroke="#17383A" strokeWidth="0" />
    <ellipse cx="115" cy="99" rx="7" ry="3" fill="#F5B3A3" stroke="#17383A" strokeWidth="0" />
    <path d="M 60 79 L 81 83 Q 70 91 60 79 Z" fill="#FBF4E6" stroke="#17383A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 99 83 L 120 79 Q 110 91 99 83 Z" fill="#FBF4E6" stroke="#17383A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="72" cy="83" r="3" fill="#17383A" stroke="#17383A" strokeWidth="0" />
    <circle cx="108" cy="83" r="3" fill="#17383A" stroke="#17383A" strokeWidth="0" />
    <path d="M 60 67 L 81 75 M 99 75 L 120 67" fill="none" stroke="#17383A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 80 114 Q 92 117 102 108 Q 97 124 80 114 Z" fill="#F07F68" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </>,
  // tower
  <>
    <circle cx="90" cy="90" r="46" fill="#D7EA7B" stroke="#17383A" strokeWidth="3" />
    <path d="M 52 88 l 4 -4 M 128 88 l -4 -4" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 54 95 l 4 -4 M 126 95 l -4 -4" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 57 102 l 4 -4 M 123 102 l -4 -4" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 61 110 l 4 -4 M 119 110 l -4 -4" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 66 116 l 4 -4 M 114 116 l -4 -4" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 72 121 l 4 -4 M 108 121 l -4 -4" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 91 77 L 88 99 Q 91 103 96 100" fill="none" stroke="#17383A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <ellipse cx="65" cy="99" rx="7" ry="3" fill="#F5B3A3" stroke="#17383A" strokeWidth="0" />
    <ellipse cx="115" cy="99" rx="7" ry="3" fill="#F5B3A3" stroke="#17383A" strokeWidth="0" />
    <ellipse cx="70" cy="81" rx="10" ry="11" fill="#FBF4E6" stroke="#17383A" strokeWidth="2" />
    <ellipse cx="111" cy="81" rx="10" ry="11" fill="#FBF4E6" stroke="#17383A" strokeWidth="2" />
    <circle cx="70" cy="81" r="2.4" fill="#17383A" stroke="#17383A" strokeWidth="0" />
    <circle cx="111" cy="81" r="2.4" fill="#17383A" stroke="#17383A" strokeWidth="0" />
    <path d="M 59 62 Q 69 53 80 61 M 100 61 Q 111 53 122 62" fill="none" stroke="#17383A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <ellipse cx="91" cy="115" rx="6" ry="9" fill="#F07F68" stroke="#17383A" strokeWidth="2" />
    <ellipse cx="91" cy="115" rx="2.7" ry="5" fill="#17383A" stroke="#17383A" strokeWidth="0" />
    <path d="M 126 83 C 124 90 120 92 121 97 C 122 103 130 103 131 97 C 132 92 128 88 126 83 Z" fill="#FBF4E6" stroke="#17383A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </>,
  // fool
  <>
    <circle cx="90" cy="90" r="46" fill="#D7EA7B" stroke="#17383A" strokeWidth="3" />
    <path d="M 52 88 l 4 -4 M 128 88 l -4 -4" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 54 95 l 4 -4 M 126 95 l -4 -4" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 57 102 l 4 -4 M 123 102 l -4 -4" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 61 110 l 4 -4 M 119 110 l -4 -4" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 66 116 l 4 -4 M 114 116 l -4 -4" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 72 121 l 4 -4 M 108 121 l -4 -4" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 91 77 L 88 99 Q 91 103 96 100" fill="none" stroke="#17383A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <ellipse cx="65" cy="99" rx="7" ry="3" fill="#F5B3A3" stroke="#17383A" strokeWidth="0" />
    <ellipse cx="115" cy="99" rx="7" ry="3" fill="#F5B3A3" stroke="#17383A" strokeWidth="0" />
    <path d="M 59 85 Q 70 72 81 85 M 100 85 Q 111 72 122 85" fill="none" stroke="#17383A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 60 70 Q 70 64 80 70 M 101 70 Q 111 64 121 70" fill="none" stroke="#17383A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 72 108 Q 90 115 108 108 C 106 140 74 140 72 108 Z" fill="#17383A" stroke="#17383A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 78 112 Q 90 116 102 112 L 101 118 H 79 Z" fill="#FBF4E6" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 81 129 Q 90 118 100 129 Q 90 135 81 129 Z" fill="#F07F68" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 44 41 L 45.6 45.4 L 50 47 L 45.6 48.6 L 44 53 L 42.4 48.6 L 38 47 L 42.4 45.4 Z" fill="#E2AE4A" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 133 38 L 134.4 41.6 L 138 43 L 134.4 44.4 L 133 48 L 131.6 44.4 L 128 43 L 131.6 41.6 Z" fill="#F07F68" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 139 117 L 140.3 120.7 L 144 122 L 140.3 123.3 L 139 127 L 137.7 123.3 L 134 122 L 137.7 120.7 Z" fill="#FBF4E6" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </>,
];

/** The moon's 40 fine rays (180 × 180, centred on 90, 90), the same for every mood. */
export const MOON_RAYS = <>
  <path d="M 90 34 L 90 6" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  <path d="M 98.8 34.7 L 103.1 7" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  <path d="M 107.3 36.7 L 116 10.1" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  <path d="M 115.4 40.1 L 128.1 15.2" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  <path d="M 122.9 44.7 L 139.4 22" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  <path d="M 129.6 50.4 L 149.4 30.6" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  <path d="M 135.3 57.1 L 158 40.6" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  <path d="M 139.9 64.6 L 164.8 51.9" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  <path d="M 143.3 72.7 L 169.9 64" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  <path d="M 145.3 81.2 L 173 76.9" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  <path d="M 146 90 L 174 90" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  <path d="M 145.3 98.8 L 173 103.1" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  <path d="M 143.3 107.3 L 169.9 116" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  <path d="M 139.9 115.4 L 164.8 128.1" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  <path d="M 135.3 122.9 L 158 139.4" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  <path d="M 129.6 129.6 L 149.4 149.4" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  <path d="M 122.9 135.3 L 139.4 158" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  <path d="M 115.4 139.9 L 128.1 164.8" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  <path d="M 107.3 143.3 L 116 169.9" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  <path d="M 98.8 145.3 L 103.1 173" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  <path d="M 90 146 L 90 174" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  <path d="M 81.2 145.3 L 76.9 173" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  <path d="M 72.7 143.3 L 64 169.9" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  <path d="M 64.6 139.9 L 51.9 164.8" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  <path d="M 57.1 135.3 L 40.6 158" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  <path d="M 50.4 129.6 L 30.6 149.4" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  <path d="M 44.7 122.9 L 22 139.4" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  <path d="M 40.1 115.4 L 15.2 128.1" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  <path d="M 36.7 107.3 L 10.1 116" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  <path d="M 34.7 98.8 L 7 103.1" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  <path d="M 34 90 L 6 90" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  <path d="M 34.7 81.2 L 7 76.9" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  <path d="M 36.7 72.7 L 10.1 64" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  <path d="M 40.1 64.6 L 15.2 51.9" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  <path d="M 44.7 57.1 L 22 40.6" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  <path d="M 50.4 50.4 L 30.6 30.6" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  <path d="M 57.1 44.7 L 40.6 22" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  <path d="M 64.6 40.1 L 51.9 15.2" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  <path d="M 72.7 36.7 L 64 10.1" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  <path d="M 81.2 34.7 L 76.9 7" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
</>;

/** The crescent moon's profile face, one per mood: idle, set, win, loss, jackpot. */
export const MOON_FACES = [
  // idle
  <>
    <path d="M 108 45 C 76 27 42 48 42 84 C 42 119 69 144 104 137 C 80 128 76 116 79 109 C 81 106 88 109 90 105 L 85 102 Q 92 100 88 97 L 82 95 L 94 90 Q 84 85 83 80 C 78 67 89 49 108 45 Z" fill="#FBF4E6" stroke="#17383A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 49 71 l 6 -3" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 48 79 l 6 -3" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 49 88 l 6 -3" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 51 97 l 6 -3" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 55 106 l 6 -3" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 61 115 l 6 -3" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 68 122 l 6 -3" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <ellipse cx="73" cy="96" rx="6" ry="4" fill="#F5B3A3" stroke="#17383A" strokeWidth="0" />
    <path d="M 66 81 Q 73 87 81 81 M 67 83 L 64 85 M 71 85 L 69 88" fill="none" stroke="#17383A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 82 103 L 87 103" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </>,
  // set
  <>
    <path d="M 108 45 C 76 27 42 48 42 84 C 42 119 69 144 104 137 C 80 128 76 116 79 109 C 81 106 88 109 90 105 L 85 102 Q 92 100 88 97 L 82 95 L 94 90 Q 84 85 83 80 C 78 67 89 49 108 45 Z" fill="#FBF4E6" stroke="#17383A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 49 71 l 6 -3" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 48 79 l 6 -3" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 49 88 l 6 -3" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 51 97 l 6 -3" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 55 106 l 6 -3" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 61 115 l 6 -3" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 68 122 l 6 -3" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <ellipse cx="73" cy="96" rx="6" ry="4" fill="#F5B3A3" stroke="#17383A" strokeWidth="0" />
    <path d="M 65 82 Q 74 79 82 81 Q 76 89 65 82 Z" fill="#FBF4E6" stroke="#17383A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="77" cy="83" r="2" fill="#17383A" stroke="#17383A" strokeWidth="0" />
    <path d="M 66 73 Q 74 69 81 74 M 82 103 L 88 103" fill="none" stroke="#17383A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </>,
  // win
  <>
    <path d="M 108 45 C 76 27 42 48 42 84 C 42 119 69 144 104 137 C 80 128 76 116 79 109 C 81 106 88 109 90 105 L 85 102 Q 92 100 88 97 L 82 95 L 94 90 Q 84 85 83 80 C 78 67 89 49 108 45 Z" fill="#FBF4E6" stroke="#17383A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 49 71 l 6 -3" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 48 79 l 6 -3" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 49 88 l 6 -3" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 51 97 l 6 -3" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 55 106 l 6 -3" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 61 115 l 6 -3" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 68 122 l 6 -3" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <ellipse cx="73" cy="96" rx="6" ry="4" fill="#F5B3A3" stroke="#17383A" strokeWidth="0" />
    <path d="M 64 81 Q 74 90 82 80 M 65 84 L 62 86 M 70 86 L 68 89" fill="none" stroke="#17383A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 80 103 Q 84 107 88 103" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 106 40 L 107.8 44.2 L 112 46 L 107.8 47.8 L 106 52 L 104.2 47.8 L 100 46 L 104.2 44.2 Z" fill="#D7EA7B" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </>,
  // loss
  <>
    <path d="M 108 45 C 76 27 42 48 42 84 C 42 119 69 144 104 137 C 80 128 76 116 79 109 C 81 106 88 109 90 105 L 85 102 Q 92 100 88 97 L 82 95 L 94 90 Q 84 85 83 80 C 78 67 89 49 108 45 Z" fill="#FBF4E6" stroke="#17383A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 49 71 l 6 -3" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 48 79 l 6 -3" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 49 88 l 6 -3" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 51 97 l 6 -3" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 55 106 l 6 -3" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 61 115 l 6 -3" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 68 122 l 6 -3" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <ellipse cx="73" cy="96" rx="6" ry="4" fill="#F5B3A3" stroke="#17383A" strokeWidth="0" />
    <ellipse cx="73" cy="81" rx="7" ry="8" fill="#FBF4E6" stroke="#17383A" strokeWidth="2" />
    <circle cx="75" cy="81" r="2" fill="#17383A" stroke="#17383A" strokeWidth="0" />
    <path d="M 65 66 Q 72 60 81 66" fill="none" stroke="#17383A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <ellipse cx="84" cy="104" rx="3" ry="4.5" fill="#17383A" stroke="#17383A" strokeWidth="1.5" />
  </>,
  // jackpot
  <>
    <path d="M 108 45 C 76 27 42 48 42 84 C 42 119 69 144 104 137 C 80 128 76 116 79 109 C 81 106 88 109 90 105 L 85 102 Q 92 100 88 97 L 82 95 L 94 90 Q 84 85 83 80 C 78 67 89 49 108 45 Z" fill="#FBF4E6" stroke="#17383A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 49 71 l 6 -3" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 48 79 l 6 -3" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 49 88 l 6 -3" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 51 97 l 6 -3" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 55 106 l 6 -3" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 61 115 l 6 -3" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 68 122 l 6 -3" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <ellipse cx="73" cy="96" rx="6" ry="4" fill="#F5B3A3" stroke="#17383A" strokeWidth="0" />
    <path d="M 64 81 Q 72 88 81 80 M 65 83 Q 59 82 60 78 M 68 86 L 65 89" fill="none" stroke="#17383A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 80 103 Q 85 107 89 101" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </>,
];

/**
 * The wheel of fortune (400 × 400, centred on 200, 200): its band (r 136 to 176), split into 12
 * segments, with a glyph in each. (The minute ticks inside it would sit under the dial.)
 */
export const WHEEL_BAND = <>
  <g>
    <path d="M 164.8 68.6 L 154.4 30 A 176 176 0 0 1 245.6 30 L 235.2 68.6 A 136 136 0 0 0 164.8 68.6 Z" fill="#FBF4E6" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 235.2 68.6 L 245.6 30 A 176 176 0 0 1 324.5 75.5 L 296.2 103.8 A 136 136 0 0 0 235.2 68.6 Z" fill="#9CD3C7" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 296.2 103.8 L 324.5 75.5 A 176 176 0 0 1 370 154.4 L 331.4 164.8 A 136 136 0 0 0 296.2 103.8 Z" fill="#FBF4E6" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 331.4 164.8 L 370 154.4 A 176 176 0 0 1 370 245.6 L 331.4 235.2 A 136 136 0 0 0 331.4 164.8 Z" fill="#9CD3C7" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 331.4 235.2 L 370 245.6 A 176 176 0 0 1 324.5 324.5 L 296.2 296.2 A 136 136 0 0 0 331.4 235.2 Z" fill="#FBF4E6" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 296.2 296.2 L 324.5 324.5 A 176 176 0 0 1 245.6 370 L 235.2 331.4 A 136 136 0 0 0 296.2 296.2 Z" fill="#9CD3C7" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 235.2 331.4 L 245.6 370 A 176 176 0 0 1 154.4 370 L 164.8 331.4 A 136 136 0 0 0 235.2 331.4 Z" fill="#FBF4E6" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 164.8 331.4 L 154.4 370 A 176 176 0 0 1 75.5 324.5 L 103.8 296.2 A 136 136 0 0 0 164.8 331.4 Z" fill="#9CD3C7" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 103.8 296.2 L 75.5 324.5 A 176 176 0 0 1 30 245.6 L 68.6 235.2 A 136 136 0 0 0 103.8 296.2 Z" fill="#FBF4E6" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 68.6 235.2 L 30 245.6 A 176 176 0 0 1 30 154.4 L 68.6 164.8 A 136 136 0 0 0 68.6 235.2 Z" fill="#9CD3C7" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 68.6 164.8 L 30 154.4 A 176 176 0 0 1 75.5 75.5 L 103.8 103.8 A 136 136 0 0 0 68.6 164.8 Z" fill="#FBF4E6" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 103.8 103.8 L 75.5 75.5 A 176 176 0 0 1 154.4 30 L 164.8 68.6 A 136 136 0 0 0 103.8 103.8 Z" fill="#9CD3C7" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="200" cy="200" r="136" fill="none" stroke="#17383A" strokeWidth="3" />
    <circle cx="200" cy="200" r="176" fill="none" stroke="#17383A" strokeWidth="3" />
  </g>
  <g>
    <g transform="translate(200 44) rotate(0)">
      <circle cx="0" cy="0" r="5" fill="#D7EA7B" stroke="#17383A" strokeWidth="2" />
      <path d="M 7 0 L 10 0" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M 4.9 4.9 L 7.1 7.1" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M 0 7 L 0 10" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M -4.9 4.9 L -7.1 7.1" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M -7 0 L -10 0" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M -4.9 -4.9 L -7.1 -7.1" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M 0 -7 L 0 -10" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M 4.9 -4.9 L 7.1 -7.1" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </g>
    <g transform="translate(278 64.9) rotate(30)">
      <path d="M 5 -10 C -13 -13 -14 13 5 10 C -5 6 -5 -6 5 -10 Z" fill="#F07F68" stroke="#17383A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </g>
    <g transform="translate(335.1 122) rotate(60)">
      <path d="M 0 -11 L 1.5 -3.7 L 7.8 -7.8 L 3.7 -1.5 L 11 0 L 3.7 1.5 L 7.8 7.8 L 1.5 3.7 L 0 11 L -1.5 3.7 L -7.8 7.8 L -3.7 1.5 L -11 0 L -3.7 -1.5 L -7.8 -7.8 L -1.5 -3.7 Z" fill="#D7EA7B" stroke="#17383A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </g>
    <g transform="translate(356 200) rotate(90)">
      <path d="M -11 0 Q 0 -13 11 0 Q 0 13 -11 0 Z" fill="#FBF4E6" stroke="#17383A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="0" cy="0" r="4" fill="#F07F68" stroke="#17383A" strokeWidth="2" />
      <circle cx="0" cy="0" r="1.5" fill="#17383A" stroke="#17383A" strokeWidth="0" />
    </g>
    <g transform="translate(335.1 278) rotate(120)">
      <circle cx="0" cy="0" r="6" fill="#F07F68" stroke="#17383A" strokeWidth="2" />
      <path d="M -11 4 Q -13 -1 -4 -5 M 11 -4 Q 13 1 4 5 Q -5 9 -11 4" fill="none" stroke="#17383A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </g>
    <g transform="translate(278 335.1) rotate(150)">
      <circle cx="0" cy="-5" r="4" fill="#D7EA7B" stroke="#17383A" strokeWidth="2" />
      <path d="M 0 -1 V 11 H 5 M 0 6 H 4" fill="none" stroke="#17383A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </g>
    <g transform="translate(200 356) rotate(180)">
      <path d="M -7 -10 H 7 L 2 0 L 7 10 H -7 L -2 0 Z" fill="#F07F68" stroke="#17383A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M -4 -7 H 4 L 0 -2 Z M 0 3 L 4 8 H -4 Z" fill="#D7EA7B" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </g>
    <g transform="translate(122 335.1) rotate(210)">
      <path d="M 0 -11 C 0 -4 10 -3 8 5 C 5 14 -9 11 -8 3 C -9 -2 -3 -5 -3 -8 C 0 -6 1 -3 0 -11 Z" fill="#F07F68" stroke="#17383A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M 0 0 C 8 8 -6 12 -4 5 Z" fill="#D7EA7B" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </g>
    <g transform="translate(64.9 278) rotate(240)">
      <path d="M -9 -9 H 9 C 9 0 5 3 0 3 C -5 3 -9 0 -9 -9 Z" fill="#D7EA7B" stroke="#17383A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M 0 3 V 10 M -6 10 H 6" fill="none" stroke="#17383A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </g>
    <g transform="translate(44 200) rotate(270)">
      <path d="M 0 -12 L 4 -6 L 2 5 H -2 L -4 -6 Z" fill="#D7EA7B" stroke="#17383A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M -7 5 H 7 M 0 5 V 11" fill="none" stroke="#17383A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </g>
    <g transform="translate(64.9 122) rotate(300)">
      <path d="M -5 10 L 5 -10" fill="none" stroke="#17383A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M 0 0 Q -8 -1 -6 -7 Q 0 -6 0 0 Z M 2 -4 Q 9 -4 9 -10 Q 3 -10 2 -4 Z" fill="#F07F68" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </g>
    <g transform="translate(122 64.9) rotate(330)">
      <circle cx="0" cy="0" r="10" fill="#D7EA7B" stroke="#17383A" strokeWidth="2" />
      <path d="M 0 -7 L 1.6 -2.3 L 6.7 -2.2 L 2.7 0.9 L 4.1 5.7 L 0 2.8 L -4.1 5.7 L -2.7 0.9 L -6.7 -2.2 L -1.6 -2.3 Z" fill="#F07F68" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  </g>
</>;

/** The wheel's gold rim at r 184, with eight ball finials. */
export const WHEEL_RIM = <>
  <circle cx="200" cy="200" r="184" fill="none" stroke="#E2AE4A" strokeWidth="2" />
  <circle cx="200" cy="16" r="6" fill="#E2AE4A" stroke="#17383A" strokeWidth="2" />
  <circle cx="330.1" cy="69.9" r="6" fill="#E2AE4A" stroke="#17383A" strokeWidth="2" />
  <circle cx="384" cy="200" r="6" fill="#E2AE4A" stroke="#17383A" strokeWidth="2" />
  <circle cx="330.1" cy="330.1" r="6" fill="#E2AE4A" stroke="#17383A" strokeWidth="2" />
  <circle cx="200" cy="384" r="6" fill="#E2AE4A" stroke="#17383A" strokeWidth="2" />
  <circle cx="69.9" cy="330.1" r="6" fill="#E2AE4A" stroke="#17383A" strokeWidth="2" />
  <circle cx="16" cy="200" r="6" fill="#E2AE4A" stroke="#17383A" strokeWidth="2" />
  <circle cx="69.9" cy="69.9" r="6" fill="#E2AE4A" stroke="#17383A" strokeWidth="2" />
</>;

/** The World's laurel wreath (400 × 400, centred on 200, 200; clear inside r 114). */
export const WREATH_LEAVES = [<>
    <path d="M 187.4 344.4 A 145 145 0 0 1 187.4 55.6" fill="none" stroke="#17383A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 195.1 338.9 Q 179.2 346.9 174 364 Q 189.9 355.9 195.1 338.9 Z" fill="#D7EA7B" stroke="#17383A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 195.1 338.9 L 174 364" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 168.6 347.7 Q 170.8 330.5 159.6 317.2 Q 157.4 334.5 168.6 347.7 Z" fill="#D7EA7B" stroke="#17383A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 168.6 347.7 L 159.6 317.2" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 147.9 328.9 Q 130.2 331 119.5 345.2 Q 137.2 343.1 147.9 328.9 Z" fill="#D7EA7B" stroke="#17383A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 147.9 328.9 L 119.5 345.2" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 120 328.1 Q 128 312.6 122 296.4 Q 114 311.8 120 328.1 Z" fill="#D7EA7B" stroke="#17383A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 120 328.1 L 122 296.4" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 107 303.3 Q 89.7 299.2 74.7 308.9 Q 92.1 313 107 303.3 Z" fill="#D7EA7B" stroke="#17383A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 107 303.3 L 74.7 308.9" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 81 293 Q 93.8 281.2 93.7 263.9 Q 80.9 275.6 81 293 Z" fill="#D7EA7B" stroke="#17383A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 81 293 L 93.7 263.9" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 77.3 265.3 Q 62.4 255.5 45 259.5 Q 59.9 269.3 77.3 265.3 Z" fill="#D7EA7B" stroke="#17383A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 77.3 265.3 L 45 259.5" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 56.4 246.7 Q 72.4 240 78.3 223.7 Q 62.3 230.3 56.4 246.7 Z" fill="#D7EA7B" stroke="#17383A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 56.4 246.7 L 78.3 223.7" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 62.4 219.3 Q 51.7 205.1 34 202.9 Q 44.7 217.2 62.4 219.3 Z" fill="#D7EA7B" stroke="#17383A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 62.4 219.3 L 34 202.9" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 49.1 194.7 Q 66.4 193.9 77.5 180.6 Q 60.2 181.4 49.1 194.7 Z" fill="#D7EA7B" stroke="#17383A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 49.1 194.7 L 77.5 180.6" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 64 171.1 Q 58.9 154 43 146 Q 48.2 163 64 171.1 Z" fill="#D7EA7B" stroke="#17383A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 64 171.1 L 43 146" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 60 143.4 Q 76.6 148.6 91.5 139.9 Q 75 134.7 60 143.4 Z" fill="#D7EA7B" stroke="#17383A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 60 143.4 L 91.5 139.9" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 82.1 126.3 Q 83.1 108.6 71 95.5 Q 70 113.3 82.1 126.3 Z" fill="#D7EA7B" stroke="#17383A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 82.1 126.3 L 71 95.5" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 87.8 99 Q 101.6 109.5 118.6 106.4 Q 104.9 95.9 87.8 99 Z" fill="#D7EA7B" stroke="#17383A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 87.8 99 L 118.6 106.4" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 114.4 90.5 Q 121.5 74.1 114.5 57.7 Q 107.5 74.1 114.4 90.5 Z" fill="#D7EA7B" stroke="#17383A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 114.4 90.5 L 114.5 57.7" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 129.1 66.7 Q 138.5 81.3 155.6 84.2 Q 146.2 69.6 129.1 66.7 Z" fill="#D7EA7B" stroke="#17383A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 129.1 66.7 L 155.6 84.2" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 157 67.8 Q 169.3 54.8 168.3 37 Q 156.1 50 157 67.8 Z" fill="#D7EA7B" stroke="#17383A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 157 67.8 L 168.3 37" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 179 50.5 Q 182.8 67.4 197.8 76 Q 194 59.1 179 50.5 Z" fill="#D7EA7B" stroke="#17383A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 179 50.5 L 197.8 76" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </>, <>
    <path d="M 212.6 55.6 A 145 145 0 0 1 212.6 344.4" fill="none" stroke="#17383A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 204.9 61.1 Q 220.8 53.1 226 36 Q 210.1 44.1 204.9 61.1 Z" fill="#D7EA7B" stroke="#17383A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 204.9 61.1 L 226 36" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 231.4 52.3 Q 229.2 69.5 240.4 82.8 Q 242.6 65.5 231.4 52.3 Z" fill="#D7EA7B" stroke="#17383A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 231.4 52.3 L 240.4 82.8" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 252.1 71.1 Q 269.8 69 280.5 54.8 Q 262.8 56.9 252.1 71.1 Z" fill="#D7EA7B" stroke="#17383A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 252.1 71.1 L 280.5 54.8" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 280 71.9 Q 272 87.4 278 103.6 Q 286 88.2 280 71.9 Z" fill="#D7EA7B" stroke="#17383A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 280 71.9 L 278 103.6" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 293 96.7 Q 310.3 100.8 325.3 91.1 Q 307.9 87 293 96.7 Z" fill="#D7EA7B" stroke="#17383A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 293 96.7 L 325.3 91.1" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 319 107 Q 306.2 118.8 306.3 136.1 Q 319.1 124.4 319 107 Z" fill="#D7EA7B" stroke="#17383A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 319 107 L 306.3 136.1" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 322.7 134.7 Q 337.6 144.5 355 140.5 Q 340.1 130.7 322.7 134.7 Z" fill="#D7EA7B" stroke="#17383A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 322.7 134.7 L 355 140.5" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 343.6 153.3 Q 327.6 160 321.7 176.3 Q 337.7 169.7 343.6 153.3 Z" fill="#D7EA7B" stroke="#17383A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 343.6 153.3 L 321.7 176.3" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 337.6 180.7 Q 348.3 194.9 366 197.1 Q 355.3 182.8 337.6 180.7 Z" fill="#D7EA7B" stroke="#17383A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 337.6 180.7 L 366 197.1" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 350.9 205.3 Q 333.6 206.1 322.5 219.4 Q 339.8 218.6 350.9 205.3 Z" fill="#D7EA7B" stroke="#17383A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 350.9 205.3 L 322.5 219.4" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 336 228.9 Q 341.1 246 357 254 Q 351.8 237 336 228.9 Z" fill="#D7EA7B" stroke="#17383A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 336 228.9 L 357 254" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 340 256.6 Q 323.4 251.4 308.5 260.1 Q 325 265.3 340 256.6 Z" fill="#D7EA7B" stroke="#17383A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 340 256.6 L 308.5 260.1" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 317.9 273.7 Q 316.9 291.4 329 304.5 Q 330 286.7 317.9 273.7 Z" fill="#D7EA7B" stroke="#17383A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 317.9 273.7 L 329 304.5" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 312.2 301 Q 298.4 290.5 281.4 293.6 Q 295.1 304.1 312.2 301 Z" fill="#D7EA7B" stroke="#17383A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 312.2 301 L 281.4 293.6" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 285.6 309.5 Q 278.5 325.9 285.5 342.3 Q 292.5 325.9 285.6 309.5 Z" fill="#D7EA7B" stroke="#17383A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 285.6 309.5 L 285.5 342.3" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 270.9 333.3 Q 261.5 318.7 244.4 315.8 Q 253.8 330.4 270.9 333.3 Z" fill="#D7EA7B" stroke="#17383A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 270.9 333.3 L 244.4 315.8" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 243 332.2 Q 230.7 345.2 231.7 363 Q 243.9 350 243 332.2 Z" fill="#D7EA7B" stroke="#17383A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 243 332.2 L 231.7 363" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 221 349.5 Q 217.2 332.6 202.2 324 Q 206 340.9 221 349.5 Z" fill="#D7EA7B" stroke="#17383A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 221 349.5 L 202.2 324" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </>];

export const WREATH_RIBBONS = [<>
    <path d="M 200 44 C 160 19 160 69 200 44 C 240 19 240 69 200 44 Z" fill="#F07F68" stroke="#17383A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 195 46 L 181 66 L 190 63 L 192 69 L 203 49 Z" fill="#F07F68" stroke="#17383A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 205 46 L 219 66 L 210 63 L 208 69 L 197 49 Z" fill="#F07F68" stroke="#17383A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    <ellipse cx="200" cy="44" rx="6" ry="5" fill="#F07F68" stroke="#17383A" strokeWidth="2" />
    <path d="M 175 41 l 7 4 M 175 46 l 7 4 M 225 41 l -7 4 M 225 46 l -7 4" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </>, <>
    <path d="M 200 356 C 160 331 160 381 200 356 C 240 331 240 381 200 356 Z" fill="#F07F68" stroke="#17383A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 195 358 L 181 378 L 190 375 L 192 381 L 203 361 Z" fill="#F07F68" stroke="#17383A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 205 358 L 219 378 L 210 375 L 208 381 L 197 361 Z" fill="#F07F68" stroke="#17383A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    <ellipse cx="200" cy="356" rx="6" ry="5" fill="#F07F68" stroke="#17383A" strokeWidth="2" />
    <path d="M 175 353 l 7 4 M 175 358 l 7 4 M 225 353 l -7 4 M 225 358 l -7 4" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </>];

/**
 * The mountain strip (1600 × 220, flat bottom). The two ridges have no fill of their own,
 * so the scene can colour them; the hatching is ink.
 */
export const MOUNTAIN_BACK = <>
  <path d="M 0 150 L 90 105 L 150 138 L 260 80 L 310 107 L 430 40 L 550 146 L 620 174 L 700 191 L 800 181 L 900 192 L 980 174 L 1050 143 L 1170 40 L 1290 107 L 1340 80 L 1450 138 L 1510 105 L 1600 150 L 1600 220 H 0 Z" stroke="#17383A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
</>;

export const MOUNTAIN_FRONT = <>
  <path d="M 0 183 L 100 161 L 190 179 L 280 139 L 350 166 L 430 120 L 520 177 L 620 191 L 720 207 L 800 200 L 880 207 L 980 191 L 1080 177 L 1170 120 L 1250 166 L 1320 139 L 1410 179 L 1500 161 L 1600 183 L 1600 220 H 0 Z" stroke="#17383A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
</>;

export const MOUNTAIN_HATCHING = <>
  <g>
    <path d="M 0 159.1 L 90 120 L 150 148.7 L 260 98.2 L 310 121.7 L 430 63.4 L 550 155.6 L 620 180 L 700 194.8 L 800 186.1 L 900 195.6 L 980 180 L 1050 153 L 1170 63.4 L 1290 121.7 L 1340 98.2 L 1450 148.7 L 1510 120 L 1600 159.1" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 0 168.2 L 90 134.9 L 150 159.3 L 260 116.4 L 310 136.4 L 430 86.8 L 550 165.2 L 620 186 L 700 198.5 L 800 191.1 L 900 199.3 L 980 186 L 1050 163 L 1170 86.8 L 1290 136.4 L 1340 116.4 L 1450 159.3 L 1510 134.9 L 1600 168.2" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 0 178 L 90 151 L 150 170.8 L 260 136 L 275.5 141" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 312.3 151.4 L 430 112 L 550 175.6 L 606 189" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 663.1 197.9 L 700 202.6 L 800 196.6 L 900 203.2 L 924 200" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 991.1 189.4 L 1050 173.8 L 1170 112 L 1287.7 151.4" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 1324.5 141 L 1340 136 L 1450 170.8 L 1510 151 L 1600 178" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 173.4 175.7 L 227.9 162.2" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 335.2 160.3 L 380.7 148.3" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 500.6 164.7 L 535.4 179.2" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 712.4 205.8 L 758.8 203.6" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 846.6 204.1 L 885.6 206.1" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 1059.9 179.8 L 1103 162.4" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 1219.3 148.3 L 1264.8 160.3" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 1372.1 162.2 L 1426.6 175.7" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </g>
  <g>
    <path d="M 0 188.9 L 100 170.4 L 190 185.6 L 280 152 L 350 174.6 L 430 136 L 520 183.9 L 620 195.6 L 720 209.1 L 800 203.2 L 880 209.1 L 980 195.6 L 1080 183.9 L 1170 136 L 1250 174.6 L 1320 152 L 1410 185.6 L 1500 170.4 L 1600 188.9" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 0 195.2 L 100 180.5 L 190 192.5 L 280 165.7 L 350 183.8 L 430 153 L 520 191.2 L 620 200.6 L 720 211.3 L 800 206.6 L 880 211.3 L 980 200.6 L 1080 191.2 L 1170 153 L 1250 183.8 L 1320 165.7 L 1410 192.5 L 1500 180.5 L 1600 195.2" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 0 201.5 L 100 190.5 L 190 199.5 L 280 179.5 L 350 193 L 430 170 L 520 198.5 L 620 205.5 L 720 213.5 L 800 210 L 880 213.5 L 980 205.5 L 1080 198.5 L 1170 170 L 1250 193 L 1320 179.5 L 1410 199.5 L 1500 190.5 L 1600 201.5" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 0 206.7 L 100 198.8 L 190 205.2 L 280 190.8 L 350 200.6 L 430 184 L 520 204.5 L 620 209.6 L 720 215.3 L 800 212.8 L 880 215.3 L 980 209.6 L 1080 204.5 L 1170 184 L 1250 200.6 L 1320 190.8 L 1410 205.2 L 1500 198.8 L 1600 206.7" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 0 211.1 L 100 205.8 L 190 210.2 L 280 200.6 L 350 207 L 430 196 L 520 209.7 L 620 213 L 720 216.9 L 800 215.2 L 880 216.9 L 980 213 L 1080 209.7 L 1170 196 L 1250 207 L 1320 200.6 L 1410 210.2 L 1500 205.8 L 1600 211.1" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 0 214.8 L 100 211.7 L 190 214.3 L 280 208.7 L 350 212.4 L 430 206 L 520 214 L 620 215.9 L 720 218.2 L 800 217.2 L 880 218.2 L 980 215.9 L 1080 214 L 1170 206 L 1250 212.4 L 1320 208.7 L 1410 214.3 L 1500 211.7 L 1600 214.8" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 0 217.8 L 100 216.5 L 190 217.5 L 280 215.1 L 350 216.8 L 430 214 L 520 217.4 L 620 218.3 L 720 219.2 L 800 218.8 L 880 219.2 L 980 218.3 L 1080 217.4 L 1170 214 L 1250 216.8 L 1320 215.1 L 1410 217.5 L 1500 216.5 L 1600 217.8" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </g>
</>;

/** Four planets, each in a 64 × 64 cell of a 286 × 64 sheet (cells at x = 0, 74, 148, 222). */
export const PLANETS = [
  <>
    <path d="M 6.6 41.2 C 2.5 30 53.3 11.5 57.4 22.8 L 52.7 24.5 C 50.6 18.8 9.3 33.9 11.3 39.5 Z" fill="#FBF4E6" stroke="#17383A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="32" cy="32" r="16" fill="#F07F68" stroke="#17383A" strokeWidth="2.5" />
    <path d="M 20.8 30.4 Q 32 40 43.2 30.4" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 6.6 41.2 C 10.7 52.5 61.5 34 57.4 22.8 L 52.7 24.5 C 54.7 30.1 13.4 45.2 11.3 39.5 Z" fill="#FBF4E6" stroke="#17383A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </>,
  <>
    <path d="M 88.6 38.3 C 85.7 30.6 120.6 17.9 123.4 25.7 L 120.2 26.8 C 118.8 23 90.4 33.3 91.8 37.2 Z" fill="#FBF4E6" stroke="#17383A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="106" cy="32" r="11" fill="#F5B3A3" stroke="#17383A" strokeWidth="2.5" />
    <path d="M 98.3 30.9 Q 106 37.5 113.7 30.9" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 88.6 38.3 C 91.4 46.1 126.3 33.4 123.4 25.7 L 120.2 26.8 C 121.6 30.7 93.2 41 91.8 37.2 Z" fill="#FBF4E6" stroke="#17383A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="126" cy="13" r="3" fill="#D7EA7B" stroke="#17383A" strokeWidth="2.5" />
  </>,
  <>
    <circle cx="180" cy="32" r="14" fill="#F07F68" stroke="#17383A" strokeWidth="2.5" />
    <path d="M 169.4 26 Q 180 30 190.6 26" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 168.3 29 Q 180 33 191.7 29" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 168.3 35 Q 180 39 191.7 35" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 169.4 38 Q 180 42 190.6 38" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </>,
  <>
    <path d="M 233 43 Q 229 24 260 22 M 263 22 L 267 22" fill="none" stroke="#17383A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="254" cy="32" r="6" fill="#F07F68" stroke="#17383A" strokeWidth="2.5" />
    <circle cx="273" cy="22" r="2" fill="#D7EA7B" stroke="#17383A" strokeWidth="2.5" />
  </>,
];

/** Lightning (200 × 240 sheet): a tall bolt in x 0–90 and a short one in x 110–200. */
export const BOLT_TALL = <>
  <path d="M 85 1.5 L 40 63 L 62 61 L 25 119 L 45 115 L 15 176 L 31 168 L 5 238.5 L 61 153 L 44 160 L 76 101 L 56 105 L 88 48 L 67 51 Z" fill="#D7EA7B" stroke="#17383A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  <path d="M 76 25 L 48 67 L 66 63 L 35 121 L 51 116 L 23 181" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
</>;

export const BOLT_SHORT = <>
  <path d="M 191 41.5 L 145 97 L 163 94 L 122 151 L 142 145 L 116 198.5 L 176 130 L 157 134 L 197 77 L 175 82 Z" fill="#D7EA7B" stroke="#17383A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  <path d="M 182 62 L 153 100 L 169 95 L 135 150" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
</>;

/** Three flames (70 × 110 cells at x = 0, 80, 160, bases on y = 110), each in three layers. */
export const FLAMES = [
  {
    outer: <>
      <path d="M 5 110 C -1 89 9 72.2 15 59.6 C 12 80.6 28 73.2 24 49.1 C 20 30.2 39 17.6 35 5 C 57 21.8 41 44.9 48 52.2 C 58 57.5 60 42.8 59 35.5 C 76 61.7 60 76.4 63 89 Q 69 102.7 64 110 Z" fill="#F07F68" stroke="#17383A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </>,
    middle: <>
      <path d="M 18 110 C 9 94.2 23 81.6 26 70.1 C 26 86.9 38 70.1 36 43.9 C 52 65.9 43 79.5 48 86.9 C 54 79.5 54 76.4 54 73.2 C 65 94.2 54 105.8 54 110 Z" fill="#E2AE4A" stroke="#17383A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </>,
    inner: <>
      <path d="M 28 110 C 20 99.5 36 93.2 35 75.4 C 51 94.2 49 104.8 45 110 Z" fill="#D7EA7B" stroke="#17383A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </>,
  },
  {
    outer: <>
      <path d="M 85 110 C 79 94 89 81.2 95 71.6 C 92 87.6 108 82 104 63.6 C 100 49.2 119 39.6 115 30 C 137 42.8 121 60.4 128 66 C 138 70 140 58.8 139 53.2 C 156 73.2 140 84.4 143 94 Q 149 104.4 144 110 Z" fill="#F07F68" stroke="#17383A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </>,
    middle: <>
      <path d="M 98 110 C 89 98 103 88.4 106 79.6 C 106 92.4 118 79.6 116 59.6 C 132 76.4 123 86.8 128 92.4 C 134 86.8 134 84.4 134 82 C 145 98 134 106.8 134 110 Z" fill="#E2AE4A" stroke="#17383A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </>,
    inner: <>
      <path d="M 108 110 C 100 102 116 97.2 115 83.6 C 131 98 129 106 125 110 Z" fill="#D7EA7B" stroke="#17383A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </>,
  },
  {
    outer: <>
      <path d="M 165 110 C 159 98 169 88.4 175 81.2 C 172 93.2 188 89 184 75.2 C 180 64.4 199 57.2 195 50 C 217 59.6 201 72.8 208 77 C 218 80 220 71.6 219 67.4 C 236 82.4 220 90.8 223 98 Q 229 105.8 224 110 Z" fill="#F07F68" stroke="#17383A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </>,
    middle: <>
      <path d="M 178 110 C 169 101 183 93.8 186 87.2 C 186 96.8 198 87.2 196 72.2 C 212 84.8 203 92.6 208 96.8 C 214 92.6 214 90.8 214 89 C 225 101 214 107.6 214 110 Z" fill="#E2AE4A" stroke="#17383A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </>,
    inner: <>
      <path d="M 188 110 C 180 104 196 100.4 195 90.2 C 211 101 209 107 205 110 Z" fill="#D7EA7B" stroke="#17383A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </>,
  },
];

/** Minor arcana suits on a 24 × 24 grid: one evenodd path each, drawn in currentColor. */
export const SUIT_PATHS = {
  wands: "M 5 20 L 16 3 Q 17 1 19 3 Q 20 4 19 6 L 8 22 Z M 11 12 C 4 12 3 8 4 5 C 10 5 12 8 11 12 Z M 14 9 C 15 3 20 3 22 5 C 21 10 17 12 14 9 Z",
  cups: "M 2 2 H 22 V 7 C 22 12 18 15 14 15 V 19 H 20 V 22 H 4 V 19 H 10 V 15 C 6 15 2 12 2 7 Z",
  swords: "M 12 1 L 17 7 L 14 15 H 21 V 18 H 14 V 19 A 3 3 0 1 1 10 19 V 18 H 3 V 15 H 10 L 7 7 Z",
  pentacles: "M 23 12 A 11 11 0 1 1 1 12 A 11 11 0 1 1 23 12 Z M 12 4 L 14.2 9 L 19.6 9.5 L 15.5 13.1 L 16.7 18.5 L 12 15.7 L 7.3 18.5 L 8.5 13.1 L 4.4 9.5 L 9.8 9 Z",
} as const;

/** Three scalloped clouds on a 280 × 160 grid, flat bottoms on y = 132. */
export const CLOUDS = [
  {
    outline: <>
      <path d="M 21 132 C 13 112 23 92 47 92 C 43 69 61 55 83 60 C 88 28 126 23 145 48 C 163 38 193 48 195 73 C 220 67 243 85 239 107 C 253 107 263 119 259 132 Z" fill="#FBF4E6" stroke="#17383A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </>,
    creases: <>
      <path d="M 46 94 Q 57 91 65 99 M 83 61 Q 88 70 84 78 M 195 75 Q 187 82 188 91" fill="none" stroke="#17383A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </>,
  },
  {
    outline: <>
      <path d="M 21 132 C 15 111 28 95 48 96 C 48 73 71 61 90 71 C 101 43 132 39 151 59 C 174 47 199 64 200 87 C 227 79 245 98 241 112 C 253 111 262 121 259 132 Z" fill="#FBF4E6" stroke="#17383A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </>,
    creases: <>
      <path d="M 48 97 Q 59 92 67 102 M 91 73 Q 101 77 102 87 M 200 89 Q 190 94 194 104" fill="none" stroke="#17383A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </>,
  },
  {
    outline: <>
      <path d="M 21 132 C 13 113 26 95 47 97 C 40 72 60 53 83 60 C 86 31 120 20 141 42 C 166 26 194 42 193 67 C 216 63 237 81 235 102 C 252 101 265 118 259 132 Z" fill="#FBF4E6" stroke="#17383A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </>,
    creases: <>
      <path d="M 47 98 Q 59 94 65 103 M 83 62 Q 92 69 88 78 M 194 69 Q 186 79 192 88" fill="none" stroke="#17383A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </>,
  },
];

/** The all-seeing eye (160 × 110, eye centred on 80, 70): rays and crown, the white, the iris, the lid. */
export const EYE_TOP = <>
  <g>
    <path d="M 46.7 59.2 L 31.5 54.2" fill="none" stroke="#17383A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 51.7 49.4 L 38.7 40" fill="none" stroke="#17383A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 59.4 41.7 L 50 28.7" fill="none" stroke="#17383A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 69.2 36.7 L 64.2 21.5" fill="none" stroke="#17383A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 80 35 L 80 19" fill="none" stroke="#17383A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 90.8 36.7 L 95.8 21.5" fill="none" stroke="#17383A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 100.6 41.7 L 110 28.7" fill="none" stroke="#17383A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 108.3 49.4 L 121.3 40" fill="none" stroke="#17383A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 113.3 59.2 L 128.5 54.2" fill="none" stroke="#17383A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </g>
  <g>
    <path d="M 60 31 C 51 43 56 47 60 47 C 64 47 69 43 60 31 Z" fill="#F07F68" stroke="#17383A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 80 21 C 71 33 76 37 80 37 C 84 37 89 33 80 21 Z" fill="#F07F68" stroke="#17383A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 100 31 C 91 43 96 47 100 47 C 104 47 109 43 100 31 Z" fill="#F07F68" stroke="#17383A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </g>
</>;

export const EYE_WHITE = <>
  <path d="M 25 70 Q 80 24 135 70 Q 80 116 25 70 Z" fill="#FBF4E6" stroke="#17383A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
</>;

export const EYE_IRIS = <>
  <circle cx="80" cy="70" r="16" fill="#2E6E6A" stroke="#17383A" strokeWidth="3" />
  <circle cx="80" cy="70" r="7" fill="#17383A" stroke="#17383A" strokeWidth="0" />
  <circle cx="75" cy="65" r="3.5" fill="#FBF4E6" stroke="#17383A" strokeWidth="0" />
</>;

export const EYE_LID = <>
  <path d="M 25 70 Q 80 17 135 70 Q 80 38 25 70 Z" fill="#F07F68" stroke="#17383A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  <path d="M 32 62 Q 80 22 128 62" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
</>;

/** A memento mori for the bottom-left corner (260 × 140, flat bottom on y = 140). */
export const BONES = <>
  <g>
    <path d="M 1.5 139 V 80 C 1.5 46 23 28 54 30 C 88 30 107 55 105 84 C 104 100 94 109 84 114 L 83 134 L 65 139 Z" fill="#D7EA7B" stroke="#17383A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 17 80 C 16 61 41 58 42 78 C 43 97 18 99 17 80 Z" fill="#17383A" stroke="#17383A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 77 64 C 55 63 53 92 76 96 C 65 86 66 74 77 64 Z" fill="#17383A" stroke="#17383A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 51 93 L 44 106 H 57 Z" fill="#17383A" stroke="#17383A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 24 119 Q 53 131 82 119 M 35 122 V 134 M 48 125 V 137 M 61 125 V 137 M 74 122 V 134" fill="none" stroke="#17383A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 12 57 l 8 5" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 17 48 l 8 5" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 24 41 l 8 5" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 33 38 l 8 5" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 44 36 l 8 5" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </g>
  <g>
    <path d="M 115 116 C 108 116 108 106 114 105 C 113 98 124 99 124 105 L 173 127 C 180 122 185 131 180 135 C 181 142 170 142 170 135 Z" fill="#FBF4E6" stroke="#17383A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 120 131 C 113 127 109 135 114 138 C 116 145 124 140 124 136 L 169 110 C 169 103 180 101 180 108 C 188 111 182 119 176 116 Z" fill="#FBF4E6" stroke="#17383A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 136 98 C 125 95 126 81 140 79 C 150 78 156 85 156 91 L 177 99 L 153 101 L 144 105 Z" fill="#FBF4E6" stroke="#17383A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="141" cy="89" r="4" fill="#17383A" stroke="#17383A" strokeWidth="1.5" />
    <path d="M 153 95 L 166 98" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </g>
  <g>
    <path d="M 196 139 Q 203 108 236 91" fill="none" stroke="#17383A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 201 122 Q 186 105 193 96 Q 209 101 201 122 Z" fill="#D7EA7B" stroke="#17383A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 211 111 Q 208 88 220 85 Q 229 101 211 111 Z" fill="#D7EA7B" stroke="#17383A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 223 102 Q 229 82 246 85 Q 245 100 223 102 Z" fill="#D7EA7B" stroke="#17383A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 201 122 L 195 103 M 211 111 L 219 92 M 223 102 L 240 89" fill="none" stroke="#17383A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </g>
</>;
