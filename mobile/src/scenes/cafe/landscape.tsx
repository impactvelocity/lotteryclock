/**
 * The hills and the street (web: Landscape and Street in cafe-scene.tsx). A cloud bank on the
 * horizon, hazy far hills, sage hills with farmhouses, a cypress-lined road winding up from the
 * street, olive groves and vines on the near slopes and a wheat field in the valley; then a
 * cobbled street along the bottom. All static: drawn once, sliced to the screen's width, so a
 * phone sees the middle (the road and its cypresses).
 */
import { memo } from 'react';
import Svg, { Circle, G, Path, Rect } from 'react-native-svg';

import { frac } from '@/lib/rand';

import { CA } from './palette';

function cypress(x: number, y: number, h: number, w: number) {
  const r = (n: number) => Math.round(n * 10) / 10;
  return {
    body: `M${x} ${y}C${r(x - w)} ${r(y - h * 0.35)} ${r(x - w * 0.7)} ${r(y - h * 0.8)} ${x} ${r(y - h)}C${r(x + w * 0.7)} ${r(y - h * 0.8)} ${r(x + w)} ${r(y - h * 0.35)} ${x} ${y}Z`,
    lit: `M${x} ${y}C${r(x - w)} ${r(y - h * 0.35)} ${r(x - w * 0.7)} ${r(y - h * 0.8)} ${x} ${r(y - h)}C${r(x - w * 0.15)} ${r(y - h * 0.6)} ${r(x - w * 0.2)} ${r(y - h * 0.3)} ${x} ${y}Z`,
  };
}

const CYPRESSES = [
  // Round the left farmhouse
  [246, 232, 46, 8],
  [259, 234, 56, 9],
  [348, 230, 40, 7],
  [360, 233, 50, 8],
  // Lining the road up to the big farmhouse on the right
  [1050, 258, 54, 9],
  [1092, 245, 48, 8],
  [1132, 234, 42, 7.5],
  [1170, 226, 36, 6.5],
  [1203, 219, 30, 6],
  [960, 334, 76, 13],
  [990, 326, 66, 11],
  // Far right
  [1446, 222, 40, 7],
  [1500, 226, 46, 8],
].map(([x, y, h, w]) => cypress(x, y, h, w));

/** Olive trees dotted over the left slope. */
const OLIVES = Array.from({ length: 16 }, (_, i) => ({
  x: Math.round(40 + frac(i, 301) * 470),
  y: Math.round(300 + frac(i, 302) * 70),
  r: Math.round(7 + frac(i, 303) * 5),
})).filter((o) => o.y > 296 + (o.x / 600) * 60);

/** Vine rows on the right slope, curving with the hill. */
const VINES = Array.from({ length: 7 }, (_, k) => {
  const y = 300 + k * 15;
  return `M${1600} ${y - 18}C${1440} ${y - 22} ${1300} ${y - 4} ${1080 + k * 18} ${y + 50 - k * 3}`;
});

/** The cloud bank's puffs: cx, cy, r. */
const BANK = [
  [60, 182, 52],
  [140, 160, 64],
  [232, 172, 50],
  [304, 184, 40],
  [372, 190, 30],
  [720, 198, 24],
  [800, 192, 30],
  [880, 200, 22],
  [1250, 188, 34],
  [1322, 172, 50],
  [1412, 154, 66],
  [1504, 168, 54],
  [1574, 182, 44],
];

function Farmhouse({ x, y, s = 1, tower }: { x: number; y: number; s?: number; tower?: boolean }) {
  return (
    <G
      transform={`translate(${x} ${y}) scale(${s})`}
      stroke={CA.ink}
      strokeWidth={1}
      strokeLinejoin="round"
      strokeOpacity={0.5}
    >
      {tower && (
        <>
          <Rect x={18} y={-46} width={18} height={26} fill="#F2DDBA" />
          <Path d="M15-46H39L34-54H20Z" fill="#C9694A" />
          <Rect x={25} y={-40} width={4} height={6} fill="#7A5A44" stroke="none" />
        </>
      )}
      <Rect x={-30} y={-24} width={64} height={26} fill="#F2DDBA" />
      <Rect x={-30} y={-24} width={14} height={26} fill="#E3C79F" />
      <Path d="M-35-24H39L30-33H-26Z" fill="#C9694A" />
      {[-22, -8, 6, 20].map((wx) => (
        <Rect key={wx} x={wx} y={-16} width={4} height={6} fill="#7A5A44" stroke="none" />
      ))}
    </G>
  );
}

/** The hills, `width` × `height` pt, sitting on the scene's bottom edge. */
export const Landscape = memo(function Landscape({ width, height }: { width: number; height: number }) {
  return (
    <Svg
      viewBox="0 0 1600 400"
      preserveAspectRatio="xMidYMax slice"
      width={width}
      height={height}
      style={{ position: 'absolute', left: 0, bottom: 0 }}
    >
      {/* Cloud bank on the horizon */}
      <G fill="#FFF6E8">
        {BANK.map(([cx, cy, r], i) => (
          <Circle key={i} cx={cx} cy={cy} r={r} />
        ))}
        <Rect x={0} y={186} width={1600} height={40} />
      </G>
      <Path d="M0 210C200 204 400 206 600 210S1000 212 1600 206V230H0Z" fill="#F4E2CA" />

      {/* Far hills, hazy */}
      <Path
        d="M0 400V198C110 172 230 170 350 188 470 206 560 186 680 192 800 198 880 208 980 198 1100 184 1200 168 1320 180 1440 192 1530 178 1600 172V400Z"
        fill="#DCC4AE"
      />
      {/* Sage hills, with farmhouses and cypresses */}
      <Path
        d="M0 400V238C130 214 250 216 370 232 490 248 590 240 700 248 800 256 900 252 1000 242 1110 230 1230 206 1360 214 1470 222 1550 218 1600 214V400Z"
        fill="#BCC28E"
      />
      <Farmhouse x={300} y={230} s={0.8} tower />
      <Farmhouse x={1246} y={212} tower />
      <Farmhouse x={1478} y={222} s={0.7} />

      {/* The wheat field in the valley */}
      <Path
        d="M0 400V330C200 312 420 300 620 296 720 294 880 294 980 298 1180 306 1400 318 1600 326V400Z"
        fill="#F0D697"
      />
      <Path
        d="M0 360C300 340 600 330 800 330S1300 340 1600 356"
        fill="none"
        stroke="#E6C77E"
        strokeWidth={3}
        strokeDasharray={[1, 10]}
        strokeLinecap="round"
      />

      {/* The road, winding up to the big farmhouse */}
      <Path
        d="M690 400C700 360 740 330 800 310 870 288 950 270 1010 252 1080 232 1150 222 1222 213L1228 216C1160 228 1100 242 1030 262 970 280 900 300 860 322 820 344 896 372 910 400Z"
        fill="#F7E9CD"
        stroke="#E3CFA8"
        strokeWidth={2}
      />

      {/* Near slopes: olive groves on the left, vines on the right */}
      <Path d="M0 400V282C110 262 220 270 330 298 420 320 500 342 600 358V400Z" fill="#A9B573" />
      {OLIVES.map((o, i) => (
        <G key={i}>
          <Path d={`M${o.x} ${o.y + o.r}v6`} stroke="#6E5A3E" strokeWidth={2} />
          <Circle cx={o.x} cy={o.y} r={o.r} fill="#8C9C62" />
          <Circle cx={o.x - o.r * 0.3} cy={o.y - o.r * 0.3} r={o.r * 0.5} fill="#A2B27A" />
        </G>
      ))}
      <Path d="M1600 400V270C1490 254 1380 262 1280 288 1180 314 1100 340 1000 358V400Z" fill="#A3AF6C" />
      <G fill="none" stroke="#7F8F50" strokeWidth={3.4} strokeLinecap="round" strokeDasharray={[2, 8]}>
        {VINES.map((d) => (
          <Path key={d} d={d} />
        ))}
      </G>

      {CYPRESSES.map((c, i) => (
        <G key={i}>
          <Path d={c.body} fill={CA.cypress} />
          <Path d={c.lit} fill="#55663A" />
        </G>
      ))}
    </Svg>
  );
});

/** One row of setts (rounded 12 × 4.6 stones, one every 28 from `x0`), as one path. */
function setts(x0: number, y: number, count: number) {
  let d = '';
  for (let k = 0; k < count; k++) {
    const x = x0 + k * 28;
    d += `M${x + 2} ${y}h8a2 2 0 0 1 2 2v.6a2 2 0 0 1-2 2h-8a2 2 0 0 1-2-2v-.6a2 2 0 0 1 2-2Z`;
  }
  return d;
}

/**
 * A cobbled street along the bottom, 24 pt tall: the web's 28 × 12 sett pattern (from y = 4),
 * drawn out as two paths, one per stone colour.
 */
export const Street = memo(function Street({ width }: { width: number }) {
  const n = Math.ceil(width / 28) + 1;
  // Each tile row: two stones on top (x + 1, x + 15), three below (x - 6, x + 8, x + 22)
  let light = '';
  let dark = '';
  for (const ty of [4, 16]) {
    light += setts(1, ty + 1, n) + setts(8, ty + 7, n) + setts(22, ty + 7, n);
    dark += setts(15, ty + 1, n) + setts(-6, ty + 7, n);
  }
  return (
    <Svg width={width} height={24} style={{ position: 'absolute', left: 0, bottom: 0 }}>
      <Rect y={4} width={width} height={20} fill="#CDB38E" />
      <Path d={light} fill="#E6D2B0" />
      <Path d={dark} fill="#E0CAA6" />
      <Rect width={width} height={4} fill="#EEDFC4" />
      <Rect y={4} width={width} height={1} fill={CA.ink} opacity={0.18} />
    </Svg>
  );
});
