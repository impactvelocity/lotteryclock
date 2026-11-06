/**
 * Art for the four snooze-loop panels in the Why section, 160 × 120 each.
 * Inlined from art/why/*.svg (prompts: docs/why-steps-svg-prompts.md). To redo one, regenerate the
 * SVG, keep its viewBox, and re-inline it here. The ringing clock shakes and the question mark
 * wobbles via wrapper groups, so the art's own transforms stay untouched.
 */

type ArtProps = { className?: string };

export function RingingArt({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 160 120" className={className} aria-hidden>
      <g data-part="motion">
        <path
          d="M 29.7 52.7 L 20.7 47.7 A 1.5 1.5 0 0 0 19.3 50.3 L 28.3 55.3 A 1.5 1.5 0 0 0 29.7 52.7 Z"
          fill="#FF6B35"
        />
        <path
          d="M 27.1 64.5 L 16.1 63.5 A 1.5 1.5 0 0 0 15.9 66.5 L 26.9 67.5 A 1.5 1.5 0 0 0 27.1 64.5 Z"
          fill="#FF6B35"
        />
        <path
          d="M 29.4 76.6 L 20.4 80.6 A 1.5 1.5 0 0 0 21.6 83.4 L 30.6 79.4 A 1.5 1.5 0 0 0 29.4 76.6 Z"
          fill="#FF6B35"
        />
        <path
          d="M 128.8 50.2 L 137.8 44.2 A 1.5 1.5 0 0 0 136.2 41.8 L 127.2 47.8 A 1.5 1.5 0 0 0 128.8 50.2 Z"
          fill="#FF6B35"
        />
        <path
          d="M 132.2 62.5 L 144.2 60.5 A 1.5 1.5 0 0 0 143.8 57.5 L 131.8 59.5 A 1.5 1.5 0 0 0 132.2 62.5 Z"
          fill="#FF6B35"
        />
        <path
          d="M 129.4 75.4 L 139.4 79.4 A 1.5 1.5 0 0 0 140.6 76.6 L 130.6 72.6 A 1.5 1.5 0 0 0 129.4 75.4 Z"
          fill="#FF6B35"
        />
        <path
          d="M 36 20 Q 37 24 41 25 Q 37 26 36 30 Q 35 26 31 25 Q 35 24 36 20 Z"
          fill="#FFC03D"
        />
        <path
          d="M 119 18 Q 119.8 21.2 123 22 Q 119.8 22.8 119 26 Q 118.2 22.8 115 22 Q 118.2 21.2 119 18 Z"
          fill="#FFC03D"
        />
      </g>
      <g className="origin-center [transform-box:fill-box] motion-safe:animate-[lc-shake_0.25s_linear_infinite]">
        <g id="clock" transform="translate(80 75) rotate(-6) scale(1 1)">
          <g data-part="clock-case">
            <path
              d="M -18 22 L -23 31 Q -24 34 -20 34 H -14 L -10 26 Z M 18 22 L 23 31 Q 24 34 20 34 H 14 L 10 26 Z"
              fill="#432344"
            />
            <path
              d="M -20 -25 L -14 -31 L -10 -26 L -15 -20 Z M 20 -25 L 14 -31 L 10 -26 L 15 -20 Z"
              fill="#432344"
            />
            <path
              d="M -32 -29 C -34 -36 -24 -43 -17 -41 C -10 -40 -7 -36 -7 -32 Q -20 -24 -32 -29 Z M 32 -29 C 34 -36 24 -43 17 -41 C 10 -40 7 -36 7 -32 Q 20 -24 32 -29 Z"
              fill="#432344"
            />
            <rect x="-2" y="-39" width="4" height="12" rx="2" fill="#432344" />
            <rect x="-7" y="-41" width="14" height="4" rx="2" fill="#432344" />
            <circle cx="0" cy="0" r="28" fill="#432344" />
            <circle cx="0" cy="0" r="22" fill="#FFF6EA" />
          </g>
          <g data-part="clock-face">
            <rect
              x="-1.5"
              y="-18"
              width="3"
              height="5"
              rx="1.5"
              fill="#432344"
            />
            <rect
              x="-1.5"
              y="13"
              width="3"
              height="5"
              rx="1.5"
              fill="#432344"
            />
            <rect
              x="-18"
              y="-1.5"
              width="5"
              height="3"
              rx="1.5"
              fill="#432344"
            />
            <rect
              x="13"
              y="-1.5"
              width="5"
              height="3"
              rx="1.5"
              fill="#432344"
            />
            <path
              d="M -1.1 -1.1 L -8.8 6.7 A 1.5 1.5 0 0 0 -6.7 8.8 L 1.1 1.1 A 1.5 1.5 0 0 0 -1.1 -1.1 Z"
              fill="#432344"
            />
            <path
              d="M -1.5 0 L -1.5 15 A 1.5 1.5 0 0 0 1.5 15 L 1.5 0 A 1.5 1.5 0 0 0 -1.5 0 Z"
              fill="#432344"
            />
            <circle cx="0" cy="0" r="2.3" fill="#432344" />
          </g>
        </g>
      </g>
    </svg>
  );
}

export function SnoozeArt({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 160 120" className={className} aria-hidden>
      <g id="snooze-clock" transform="translate(67 86) rotate(0) scale(1 0.8)">
        <g data-part="clock-case">
          <path
            d="M -18 22 L -23 31 Q -24 34 -20 34 H -14 L -10 26 Z M 18 22 L 23 31 Q 24 34 20 34 H 14 L 10 26 Z"
            fill="#432344"
          />
          <path
            d="M -20 -25 L -14 -31 L -10 -26 L -15 -20 Z M 20 -25 L 14 -31 L 10 -26 L 15 -20 Z"
            fill="#432344"
          />
          <path
            d="M -32 -29 C -34 -36 -24 -43 -17 -41 C -10 -40 -7 -36 -7 -32 Q -20 -24 -32 -29 Z M 32 -29 C 34 -36 24 -43 17 -41 C 10 -40 7 -36 7 -32 Q 20 -24 32 -29 Z"
            fill="#432344"
          />
          <rect x="-2" y="-39" width="4" height="12" rx="2" fill="#432344" />
          <rect x="-7" y="-41" width="14" height="4" rx="2" fill="#432344" />
          <circle cx="0" cy="0" r="28" fill="#432344" />
          <circle cx="0" cy="0" r="22" fill="#FFF6EA" />
        </g>
        <g data-part="clock-face">
          <rect x="-1.5" y="-18" width="3" height="5" rx="1.5" fill="#432344" />
          <rect x="-1.5" y="13" width="3" height="5" rx="1.5" fill="#432344" />
          <rect x="-18" y="-1.5" width="5" height="3" rx="1.5" fill="#432344" />
          <rect x="13" y="-1.5" width="5" height="3" rx="1.5" fill="#432344" />
          <path
            d="M -1.1 -1.1 L -8.8 6.7 A 1.5 1.5 0 0 0 -6.7 8.8 L 1.1 1.1 A 1.5 1.5 0 0 0 -1.1 -1.1 Z"
            fill="#432344"
          />
          <path
            d="M -1.5 0 L -1.5 15 A 1.5 1.5 0 0 0 1.5 15 L 1.5 0 A 1.5 1.5 0 0 0 -1.5 0 Z"
            fill="#432344"
          />
          <circle cx="0" cy="0" r="2.3" fill="#432344" />
        </g>
      </g>
      <g data-part="impact">
        <path
          d="M 42.9 44.8 L 34.9 38.8 A 1.5 1.5 0 0 0 33.1 41.2 L 41.1 47.2 A 1.5 1.5 0 0 0 42.9 44.8 Z"
          fill="#FF6B35"
        />
        <path
          d="M 100.7 49.3 L 109.7 44.3 A 1.5 1.5 0 0 0 108.3 41.7 L 99.3 46.7 A 1.5 1.5 0 0 0 100.7 49.3 Z"
          fill="#FF6B35"
        />
        <path
          d="M 103.9 58.5 L 114.9 59.5 A 1.5 1.5 0 0 0 115.1 56.5 L 104.1 55.5 A 1.5 1.5 0 0 0 103.9 58.5 Z"
          fill="#FF6B35"
        />
      </g>
      <g data-part="sleep-marks">
        <path
          d="M 116 29 H 133 V 33 L 122 42 H 133 V 46 H 116 V 42 L 127 33 H 116 Z M 139 15 H 150 V 18 L 143 24 H 150 V 27 H 139 V 24 L 146 18 H 139 Z M 123 7 H 131 V 9 L 126 13 H 131 V 15 H 123 V 13 L 128 9 H 123 Z"
          fill="#432344"
        />
      </g>
      <g data-part="hand">
        <path
          d="M 65 0 H 84 V 24 C 91 27 98 30 102 35 C 107 41 102 46 97 43 L 88 40 C 92 47 86 54 80 52 L 57 48 C 48 48 44 43 48 39 C 52 34 57 37 63 38 C 59 31 61 26 65 23 Z"
          fill="#FFC03D"
          stroke="#432344"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}

export function DoubtArt({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 160 120" className={className} aria-hidden>
      <g id="startled-clock" transform="translate(55 76) rotate(0) scale(1 1)">
        <g data-part="clock-case">
          <path
            d="M -18 22 L -23 31 Q -24 34 -20 34 H -14 L -10 26 Z M 18 22 L 23 31 Q 24 34 20 34 H 14 L 10 26 Z"
            fill="#432344"
          />
          <path
            d="M -20 -25 L -14 -31 L -10 -26 L -15 -20 Z M 20 -25 L 14 -31 L 10 -26 L 15 -20 Z"
            fill="#432344"
          />
          <path
            d="M -32 -29 C -34 -36 -24 -43 -17 -41 C -10 -40 -7 -36 -7 -32 Q -20 -24 -32 -29 Z M 32 -29 C 34 -36 24 -43 17 -41 C 10 -40 7 -36 7 -32 Q 20 -24 32 -29 Z"
            fill="#432344"
          />
          <rect x="-2" y="-39" width="4" height="12" rx="2" fill="#432344" />
          <rect x="-7" y="-41" width="14" height="4" rx="2" fill="#432344" />
          <circle cx="0" cy="0" r="28" fill="#432344" />
          <circle cx="0" cy="0" r="22" fill="#FFF6EA" />
        </g>
        <g data-part="clock-face">
          <circle
            cx="-9"
            cy="-3"
            r="8"
            fill="#FFFFFF"
            stroke="#432344"
            strokeWidth="3"
          />
          <circle
            cx="9"
            cy="-3"
            r="8"
            fill="#FFFFFF"
            stroke="#432344"
            strokeWidth="3"
          />
          <circle cx="-6" cy="-2" r="3.4" fill="#432344" />
          <circle cx="12" cy="-2" r="3.4" fill="#432344" />
          <path
            d="M -18 -16 Q -11 -22 -4 -17 Q -3 -14 -6 -15 Q -12 -18 -17 -14 Q -20 -13 -18 -16 Z M 3 -17 Q 10 -22 17 -17 Q 19 -14 16 -14 Q 10 -18 5 -15 Q 2 -14 3 -17 Z"
            fill="#432344"
          />
          <ellipse cx="1" cy="12" rx="4.4" ry="5.7" fill="#432344" />
        </g>
      </g>
      <g className="origin-bottom [transform-box:fill-box] motion-safe:animate-[lc-ring_1.6s_ease-in-out_infinite]">
        <g id="question" transform="rotate(8 126 54)">
          <path
            d="M 111 40 C 110 25 139 23 144 36 C 150 50 135 55 131 61 V 68 Q 131 71 128 71 H 122 Q 119 71 119 68 V 59 C 119 50 132 49 132 42 C 133 35 122 34 122 41 V 43 H 111 Z"
            fill="#FFFFFF"
          />
          <circle cx="125" cy="82" r="6" fill="#FFFFFF" />
        </g>
      </g>
      <g data-part="sparkles">
        <path
          d="M 107 15 Q 108 19 112 20 Q 108 21 107 25 Q 106 21 102 20 Q 106 19 107 15 Z"
          fill="#FFFFFF"
        />
        <path
          d="M 148 89 Q 148.8 92.2 152 93 Q 148.8 93.8 148 97 Q 147.2 93.8 144 93 Q 147.2 92.2 148 89 Z"
          fill="#FFFFFF"
        />
      </g>
    </svg>
  );
}

export function UpArt({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 160 120" className={className} aria-hidden>
      <g data-part="sunrise">
        <path d="M 48 80 A 32 32 0 0 1 112 80 Z" fill="#FFC03D" />
        <path
          d="M 42.7 68.5 L 36.9 66.9 A 1.5 1.5 0 0 0 36.1 69.8 L 41.9 71.4 A 1.5 1.5 0 0 0 42.7 68.5 Z"
          fill="#FFC03D"
        />
        <path
          d="M 51.1 53.8 L 46.5 49.9 A 1.5 1.5 0 0 0 44.6 52.2 L 49.2 56.1 A 1.5 1.5 0 0 0 51.1 53.8 Z"
          fill="#FFC03D"
        />
        <path
          d="M 64.9 44 L 62.3 38.6 A 1.5 1.5 0 0 0 59.6 39.9 L 62.2 45.3 A 1.5 1.5 0 0 0 64.9 44 Z"
          fill="#FFC03D"
        />
        <path
          d="M 81.5 41 L 81.5 35 A 1.5 1.5 0 0 0 78.5 35 L 78.5 41 A 1.5 1.5 0 0 0 81.5 41 Z"
          fill="#FFC03D"
        />
        <path
          d="M 97.8 45.3 L 100.4 39.9 A 1.5 1.5 0 0 0 97.7 38.6 L 95.1 44 A 1.5 1.5 0 0 0 97.8 45.3 Z"
          fill="#FFC03D"
        />
        <path
          d="M 110.8 56.1 L 115.4 52.2 A 1.5 1.5 0 0 0 113.5 49.9 L 108.9 53.8 A 1.5 1.5 0 0 0 110.8 56.1 Z"
          fill="#FFC03D"
        />
        <path
          d="M 118.1 71.4 L 123.9 69.8 A 1.5 1.5 0 0 0 123.1 66.9 L 117.3 68.5 A 1.5 1.5 0 0 0 118.1 71.4 Z"
          fill="#FFC03D"
        />
      </g>
      <g data-part="person">
        <path
          d="M 63 71 C 53 61 47 46 39 32 L 31 18 Q 28 13 32 10 Q 36 8 39 13 L 49 28 L 72 55 Z M 97 71 C 107 61 113 46 121 32 L 129 18 Q 132 13 128 10 Q 124 8 121 13 L 111 28 L 88 55 Z"
          fill="#FF6B35"
        />
        <path
          d="M 32 20 L 27 13 Q 24 9 27 7 Q 30 5 33 9 L 38 15 Q 40 12 42 15 Q 44 18 40 23 Z M 128 20 L 133 13 Q 136 9 133 7 Q 130 5 127 9 L 122 15 Q 120 12 118 15 Q 116 18 120 23 Z"
          fill="#432344"
        />
        <rect x="75" y="56" width="10" height="12" rx="3" fill="#432344" />
        <circle cx="80" cy="46" r="14" fill="#432344" />
        <ellipse cx="75" cy="45" rx="1.6" ry="2.3" fill="#FFFFFF" />
        <ellipse cx="85" cy="45" rx="1.6" ry="2.3" fill="#FFFFFF" />
        <path
          d="M 75 52 Q 80 57 85 52 Q 86 52 86 53 Q 80 61 74 53 Q 74 52 75 52 Z"
          fill="#FFFFFF"
        />
        <path d="M 64 64 Q 80 59 96 64 L 103 92 H 57 Z" fill="#FF6B35" />
        <path
          d="M 73 62 L 80 69 L 87 62 L 84 62 L 80 65 L 76 62 Z"
          fill="#432344"
        />
        <circle cx="80" cy="75" r="1.8" fill="#FFC03D" />
        <circle cx="80" cy="83" r="1.8" fill="#FFC03D" />
      </g>
      <g data-part="bed">
        <path
          d="M 36 90 Q 80 79 121 90 L 124 114 H 33 Z"
          fill="#FFF6EA"
          stroke="#432344"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <path
          d="M 58 91 Q 54 99 56 105 Q 53 102 55 94 Z M 100 92 Q 105 99 103 106 Q 107 102 103 94 Z"
          fill="#432344"
        />
        <rect x="33" y="111" width="91" height="5" rx="2" fill="#432344" />
      </g>
      <g data-part="table">
        <rect x="125" y="92" width="31" height="4" rx="2" fill="#432344" />
        <rect x="128" y="95" width="4" height="21" rx="1" fill="#432344" />
        <rect x="149" y="95" width="4" height="21" rx="1" fill="#432344" />
      </g>
      <g
        id="quiet-clock"
        transform="translate(140 78) rotate(0) scale(0.4 0.4)"
      >
        <g data-part="clock-case">
          <path
            d="M -18 22 L -23 31 Q -24 34 -20 34 H -14 L -10 26 Z M 18 22 L 23 31 Q 24 34 20 34 H 14 L 10 26 Z"
            fill="#432344"
          />
          <path
            d="M -20 -25 L -14 -31 L -10 -26 L -15 -20 Z M 20 -25 L 14 -31 L 10 -26 L 15 -20 Z"
            fill="#432344"
          />
          <path
            d="M -32 -29 C -34 -36 -24 -43 -17 -41 C -10 -40 -7 -36 -7 -32 Q -20 -24 -32 -29 Z M 32 -29 C 34 -36 24 -43 17 -41 C 10 -40 7 -36 7 -32 Q 20 -24 32 -29 Z"
            fill="#432344"
          />
          <rect x="-2" y="-39" width="4" height="12" rx="2" fill="#432344" />
          <rect x="-7" y="-41" width="14" height="4" rx="2" fill="#432344" />
          <circle cx="0" cy="0" r="28" fill="#432344" />
          <circle cx="0" cy="0" r="22" fill="#FFF6EA" />
        </g>
        <g data-part="clock-face">
          <rect x="-1.5" y="-18" width="3" height="5" rx="1.5" fill="#432344" />
          <rect x="-1.5" y="13" width="3" height="5" rx="1.5" fill="#432344" />
          <rect x="-18" y="-1.5" width="5" height="3" rx="1.5" fill="#432344" />
          <rect x="13" y="-1.5" width="5" height="3" rx="1.5" fill="#432344" />
          <path
            d="M -1.1 -1 L -8.7 6.9 A 1.5 1.5 0 0 0 -6.6 9 L 1.1 1 A 1.5 1.5 0 0 0 -1.1 -1 Z"
            fill="#432344"
          />
          <path
            d="M -1.5 0.3 L 1.7 15 A 1.5 1.5 0 0 0 4.6 14.4 L 1.5 -0.3 A 1.5 1.5 0 0 0 -1.5 0.3 Z"
            fill="#432344"
          />
          <circle cx="0" cy="0" r="2.3" fill="#432344" />
        </g>
      </g>
    </svg>
  );
}
