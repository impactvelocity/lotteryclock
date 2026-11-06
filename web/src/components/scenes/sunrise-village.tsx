"use client";

import { AnimatePresence, motion } from "motion/react";
import { memo, useEffect, useRef, type CSSProperties } from "react";
import { COTTAGE_ART, MILL_ART, ROOSTER_ART, TREE_ART } from "@/components/scenes/sunrise-village-art";
import { frac } from "@/lib/rand";
import { css, rampN } from "@/lib/themes";

/**
 * Good Morning's lower area: a village on rolling hills that wakes up with the bet.
 *
 *   0 min     everyone's asleep: dark windows, the rooster dozing on his fence post
 *   1–11      the first bedroom lights, a lazy turn of the windmill
 *   12–35     more lights, chimneys start to smoke, the rooster's up and about
 *   36–45     the whole village is up, the windmill whirring, the rooster crowing
 *
 * While the draw rolls the windmill spins like a loading wheel and the rooster looks
 * nervously left and right. A snooze puts the village back to bed (lights off one by one,
 * the windmill winds down, the rooster nods off); a late result is chaos (every light on,
 * the rooster crowing, a flock bursting out of the trees); right on time, a rainbow.
 *
 * Drawn on a 3200 × 300 strip, cropped (not squashed) to the hero like Night's skyline, with
 * headroom above it for the rainbow and the startled birds. The hills dip in the middle, so the
 * tier label and the Set alarm button always sit over open ground.
 */

const W = 3200;
const H = 300;
/** Sky above the strip, for the rainbow and the flock. */
const SKY = 540;
const MID = W / 2;

type Bump = [cx: number, rx: number, ry: number];
type Layer = { base: number; bumps: Bump[] };

/** Three rows of hills, back to front: overlapping domes, lowest in the middle. */
const FAR: Layer = {
  base: 252,
  bumps: [
    [90, 380, 118],
    [540, 420, 132],
    [960, 360, 122],
    [1290, 300, 62],
    [1600, 380, 30],
    [1910, 300, 60],
    [2240, 380, 128],
    [2650, 420, 138],
    [3090, 380, 112],
  ],
};
const MIDDLE: Layer = {
  base: 286,
  bumps: [
    [300, 360, 96],
    [760, 380, 101],
    [1150, 320, 86],
    [1450, 260, 44],
    [1760, 260, 42],
    [2060, 340, 89],
    [2460, 360, 101],
    [2900, 380, 92],
  ],
};
const NEAR: Layer = {
  base: 310,
  bumps: [
    [150, 300, 50],
    [560, 320, 58],
    [960, 300, 48],
    [1320, 260, 34],
    [1600, 300, 20],
    [1880, 260, 34],
    [2250, 300, 50],
    [2640, 320, 58],
    [3050, 300, 50],
  ],
};

/** Where a layer's ground is at x: the top of whichever dome is highest there. */
function ridge(layer: Layer, x: number) {
  let top = layer.base;
  for (const [cx, rx, ry] of layer.bumps) {
    const d = (x - cx) / rx;
    if (Math.abs(d) < 1) top = Math.min(top, layer.base - ry * Math.sqrt(1 - d * d));
  }
  return top;
}

const r1 = (n: number) => Math.round(n * 10) / 10;

/* ---- Houses ---- */

/** The art's bottom 20 units sit behind the hill in front. */
const HIDDEN = 20;

type HouseSpec = {
  x: number;
  /** Which cottage in COTTAGE_ART. */
  art: number;
  /** 1: swap the roof and chimney colours, for variety. */
  roof: 0 | 1;
  flip?: boolean;
  s?: number;
};

function house(spec: HouseSpec, i: number) {
  const art = COTTAGE_ART[spec.art];
  const s = spec.s ?? 1;
  const ox = spec.x - (art.w * s) / 2;
  const oy = ridge(MIDDLE, spec.x) - (art.h - HIDDEN) * s;
  const at = (x: number) => (spec.flip ? ox + (art.w - x) * s : ox + x * s);
  return {
    art,
    roof: spec.roof,
    transform: spec.flip
      ? `translate(${r1(ox + art.w * s)} ${r1(oy)}) scale(${-s} ${s})`
      : `translate(${r1(ox)} ${r1(oy)}) scale(${s})`,
    /** When (as a share of "awake") each window's light comes on. */
    on: art.windows.map((_, n) => frac(i * 7 + n, 301)),
    smoke: art.smoke ? ([r1(at(art.smoke[0])), r1(oy + art.smoke[1] * s - 2)] as [number, number]) : null,
    /** Whether its chimney smokes, as a share of "awake". */
    smokeAt: 0.12 + frac(i, 302) * 0.6,
  };
}

const HOUSES = (
  [
    { x: 300, art: 2, roof: 1 },
    { x: 790, art: 1, roof: 1 },
    { x: 985, art: 0, roof: 0 },
    { x: 1905, art: 3, roof: 1 },
    { x: 2115, art: 1, roof: 0, flip: true },
    { x: 2525, art: 2, roof: 0, flip: true },
    { x: 2960, art: 3, roof: 1, flip: true },
  ] as HouseSpec[]
).map(house);

/* ---- Trees ---- */

type Tree = { x: number; s: number; kind: "round" | "poplar" | "apple"; front: boolean; flip?: boolean };

const TREES: Tree[] = [
  { x: 430, s: 30, kind: "round", front: false },
  { x: 560, s: 26, kind: "poplar", front: false },
  { x: 690, s: 24, kind: "poplar", front: false },
  { x: 885, s: 34, kind: "apple", front: false },
  { x: 1290, s: 30, kind: "round", front: true },
  { x: 1840, s: 22, kind: "round", front: true, flip: true },
  { x: 2225, s: 38, kind: "apple", front: true, flip: true },
  { x: 2425, s: 26, kind: "poplar", front: false },
  { x: 2700, s: 32, kind: "round", front: false, flip: true },
  { x: 2830, s: 24, kind: "poplar", front: false },
  { x: 3100, s: 30, kind: "round", front: true },
];

function treeFoot(t: Tree) {
  return t.front ? ridge(NEAR, t.x) + 4 : ridge(MIDDLE, t.x) + 16;
}

/** The art's scale for a tree of size `s` (poplars are narrow, so they run a little larger). */
const treeScale = (t: Tree) => t.s / (t.kind === "poplar" ? 28 : 36);

function TreeShape({ t }: { t: Tree }) {
  const sc = treeScale(t);
  const foot = treeFoot(t);
  const x = t.flip ? t.x + 40 * sc : t.x - 40 * sc;
  return (
    <g
      transform={`translate(${r1(x)} ${r1(foot - 110 * sc)}) scale(${(t.flip ? -sc : sc).toFixed(3)} ${sc.toFixed(3)})`}
      dangerouslySetInnerHTML={{ __html: TREE_ART[t.kind] }}
    />
  );
}

/* ---- Windmill ---- */

const MILL_X = 1150;
const MILL_S = 1.1;
const MILL_OX = MILL_X - (MILL_ART.w / 2) * MILL_S;
const MILL_OY = ridge(MIDDLE, MILL_X) - (MILL_ART.h - HIDDEN) * MILL_S;
const HUB: [number, number] = [r1(MILL_OX + MILL_ART.hub[0] * MILL_S), r1(MILL_OY + MILL_ART.hub[1] * MILL_S)];
const SAILS_HALF = MILL_ART.sailsSize / 2;

/* ---- Fence and rooster ---- */

const FENCE = [1945, 1978, 2011, 2044, 2077].map((x) => [x, ridge(NEAR, x) + 5] as const);
const POST_H = 36;
/** The rooster stands on the third post. */
const PERCH: [number, number] = [FENCE[2][0], FENCE[2][1] - POST_H];
const ROOSTER_S = 0.95;
/** Middle of his feet on the art's 64 grid. */
const ROOSTER_FEET_X = 35.5;

export type RoosterPose = "asleep" | "stand" | "look" | "crow" | "proud";

/**
 * The rooster (./art/classic/village/rooster-*.svg), facing right on a 64 grid. Asleep and
 * crowing have their own art; the rest stand. "look" turns him left and right while the draw
 * rolls, "proud" struts gently, and crowing adds marks pulsing out of his beak.
 */
function Rooster({ pose }: { pose: RoosterPose }) {
  const crowing = pose === "crow";
  const art = pose === "asleep" ? ROOSTER_ART.asleep : crowing ? ROOSTER_ART.crowing : ROOSTER_ART.standing;
  const body =
    pose === "look"
      ? "lc-rooster-look 3s steps(1) infinite"
      : pose === "proud"
        ? "lc-rooster-strut 1.8s ease-in-out infinite"
        : pose === "asleep"
          ? "lc-rooster-breathe 4.5s ease-in-out infinite"
          : undefined;
  return (
    <g style={{ transformBox: "fill-box", transformOrigin: "50% 100%", animation: body }}>
      <g dangerouslySetInnerHTML={{ __html: art }} />
      {crowing &&
        ["M 64 13 Q 68 19 64 25", "M 69 9 Q 75 19 69 29", "M 74 5 Q 82 19 74 33"].map((d, k) => (
          <path
            key={k}
            d={d}
            fill="none"
            stroke="#432344"
            strokeWidth={2.2}
            strokeLinecap="round"
            style={{ animation: `lc-ring-mark 1.1s ease-out ${k * 0.15}s infinite` }}
          />
        ))}
    </g>
  );
}

/* ---- Rainbow and the startled flock ---- */

/** Outside in. Pastels from the theme: dawn rose, apricot, butter, mint, sky, lilac. */
const RAINBOW = ["#F59AB5", "#FFB98A", "#FFE07A", "#B5E3A1", "#9FD3F0", "#BFA6EC"];
const RAINBOW_R = 760;
const BAND = 17;

/** Birds that burst out of the trees on a late result, and where they're headed. */
const FLOCK = Array.from({ length: 12 }, (_, i) => {
  const from = [1290, 1840, 2225, 885][i % 4];
  const t = TREES.find((tr) => tr.x === from)!;
  return {
    x: from + (frac(i, 311) - 0.5) * 50,
    y: treeFoot(t) - 62 * treeScale(t),
    dx: (from < MID ? -1 : 1) * (160 + frac(i, 312) * 320),
    dy: -(440 + frac(i, 313) * 140),
    delay: i * 0.06,
    size: 1.6 + frac(i, 314) * 0.7,
    beat: (0.26 + frac(i, 315) * 0.1).toFixed(2),
  };
});
const BIRD = "M 1 7 Q 6.5 0 12 8 Q 17.5 0 23 7";

/* ---- The scene ---- */

type Props = {
  /** How far the sun's up, 0..1: the light on everything. */
  sun: number;
  /** Share of the village that's up: lit windows, smoking chimneys. */
  awake: number;
  /** Lights change one after another (a result), rather than straight away (dragging the bet). */
  cascade: boolean;
  /** Windmill speed, degrees per second. It eases towards it, so it winds up and down. */
  spin: number;
  pose: RoosterPose;
  rainbow: boolean;
  /** Birds burst out of the trees. */
  flush: boolean;
};

export const Village = memo(function Village({ sun, awake, cascade, spin, pose, rainbow, flush }: Props) {
  const sailsRef = useRef<SVGGElement>(null);
  const target = useRef(spin);
  target.current = spin;

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let angle = 20;
    let speed = target.current;
    let last = performance.now();
    let id = requestAnimationFrame(function frame(now) {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      speed += (target.current - speed) * (1 - Math.exp(-dt * 1.4));
      angle = (angle + dt * speed) % 360;
      sailsRef.current?.setAttribute("transform", `rotate(${angle.toFixed(2)} ${HUB[0]} ${HUB[1]})`);
      id = requestAnimationFrame(frame);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  // Pre-dawn blue-lilac shade → first light → green and gold morning → blazing
  const far = css(rampN(["#C4BEE4", "#D3BEDD", "#E4BDC6", "#EBB4A4"], sun));
  const mid = css(rampN(["#A9B0DA", "#AEBFCB", "#B3CCA6", "#BFCB8C"], sun));
  const near = css(rampN(["#8F9ACA", "#93B2AE", "#97BF8D", "#A3BE73"], sun));
  const backTree = css(rampN(["#9BA2D2", "#9DB5B6", "#9CBE92", "#A6BC78"], sun));
  const frontTree = css(rampN(["#7883BA", "#7CA19D", "#80AD78", "#8DAD5E"], sun));
  const backLight = css(rampN(["#B0B6DD", "#B4C8C5", "#B4D0A9", "#BCCD93"], sun));
  const frontLight = css(rampN(["#959FCB", "#97B8B2", "#9CBE92", "#A8C27E"], sun));
  const trunk = css(rampN(["#8E7BA6", "#9A7684", "#9B705E"], sun));
  const wall = css(rampN(["#E6E1F5", "#F5EDF1", "#FFF6EC", "#FFF0DC"], sun));
  const roofs = [
    css(rampN(["#A08DC6", "#C98AA8", "#E98A7B", "#EC7A5E"], sun)),
    css(rampN(["#8D93C8", "#A68CB8", "#B985A6", "#C27A92"], sun)),
  ];
  const glass = css(rampN(["#8D86B9", "#9C8FB5", "#A794AF", "#AE90A2"], sun));
  const wood = css(rampN(["#6E6496", "#6F5476", "#704C68"], sun));
  const fence = css(rampN(["#CBC1E2", "#E7D2D2", "#F2D7BE"], sun));
  const lamp = "#FFC24A";

  const smoke = (on: boolean, at: [number, number], k: number) => (
    <g key={k} style={{ opacity: on ? 1 : 0, transition: "opacity 900ms" }}>
      {[0, 1, 2].map((n) => (
        <circle
          key={n}
          cx={at[0]}
          cy={at[1]}
          r={6}
          fill="#FFFFFF"
          style={{
            opacity: 0,
            transformBox: "fill-box",
            transformOrigin: "center",
            animation: `lc-puff 2.7s ease-out ${(n * 0.9 + k * 0.37).toFixed(2)}s infinite`,
          }}
        />
      ))}
    </g>
  );

  const lightDelay = (on: boolean, t: number) => (cascade ? `${Math.round((on ? t : 1 - t) * 900)}ms` : "0ms");

  return (
    <div aria-hidden className="absolute inset-x-0 bottom-0 h-[104px] sm:h-[200px]">
      <svg
        viewBox={`0 ${-SKY} ${W} ${H + SKY}`}
        preserveAspectRatio="xMidYMax slice"
        className="absolute inset-x-0 bottom-0 block w-full"
        style={
          {
            height: `${((H + SKY) / H) * 100}%`,
            overflow: "hidden",
            // The art's palette fills, recoloured with the sunrise (see sunrise-village-art.ts)
            "--lc-wall": wall,
            "--lc-roof": roofs[0],
            "--lc-roof2": roofs[1],
            "--lc-glass": glass,
            "--lc-wood": wood,
            "--lc-trunk": trunk,
          } as CSSProperties
        }
      >
        {/* Right on time: a rainbow over the valley */}
        <AnimatePresence>
          {rainbow && (
            <motion.g
              key="rainbow"
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.4 } }}
            >
              {RAINBOW.map((c, k) => {
                const r = RAINBOW_R - k * BAND;
                return (
                  <motion.path
                    key={c}
                    d={`M ${MID - r} ${H} A ${r} ${r} 0 0 1 ${MID + r} ${H}`}
                    fill="none"
                    stroke={c}
                    strokeWidth={BAND + 1}
                    opacity={0.55}
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.1, delay: 0.2 + k * 0.06, ease: [0.3, 0.7, 0.3, 1] }}
                  />
                );
              })}
            </motion.g>
          )}
        </AnimatePresence>

        {/* Far hills, hazy with the sunrise */}
        <Hills layer={FAR} fill={far} />

        {/* Behind the middle row: trees, houses and the windmill, their feet hidden by the hill */}
        <g style={{ "--lc-canopy": backTree, "--lc-light": backLight } as CSSProperties}>
          {TREES.filter((t) => !t.front).map((t) => (
            <TreeShape key={t.x} t={t} />
          ))}
        </g>

        {/* The windmill: a loading wheel while the draw rolls */}
        <g transform={`translate(${r1(MILL_OX)} ${r1(MILL_OY)}) scale(${MILL_S})`}>
          <g dangerouslySetInnerHTML={{ __html: MILL_ART.markup }} />
          <circle
            cx={MILL_ART.window[0]}
            cy={MILL_ART.window[1]}
            r={MILL_ART.window[2]}
            fill={lamp}
            style={{ opacity: awake > 0.3 ? 1 : 0, transition: "opacity 400ms" }}
          />
        </g>
        <g ref={sailsRef} transform={`rotate(20 ${HUB[0]} ${HUB[1]})`}>
          <g
            transform={`translate(${HUB[0] - SAILS_HALF} ${HUB[1] - SAILS_HALF})`}
            dangerouslySetInnerHTML={{ __html: MILL_ART.sails }}
          />
        </g>

        {HOUSES.map((h, i) => (
          <g
            key={i}
            transform={h.transform}
            style={h.roof ? ({ "--lc-roof": roofs[1], "--lc-roof2": roofs[0] } as CSSProperties) : undefined}
          >
            <g dangerouslySetInnerHTML={{ __html: h.art.under }} />
            <g dangerouslySetInnerHTML={{ __html: h.art.over }} />
            {h.art.windows.map(([wx, wy, ww, wh], n) => {
              const on = h.on[n] < awake;
              return (
                <g key={n}>
                  <rect x={wx} y={wy} width={ww} height={wh} rx={2} fill={glass} />
                  <rect
                    x={wx}
                    y={wy}
                    width={ww}
                    height={wh}
                    rx={2}
                    fill={lamp}
                    style={{ opacity: on ? 1 : 0, transition: "opacity 260ms", transitionDelay: lightDelay(on, h.on[n]) }}
                  />
                </g>
              );
            })}
          </g>
        ))}

        {/* Chimney smoke, once someone's up to light the stove */}
        {HOUSES.map((h, i) => h.smoke && smoke(awake > h.smokeAt, h.smoke, i))}

        <Hills layer={MIDDLE} fill={mid} />

        {/* The near row: a few trees, the fence and the rooster */}
        <g style={{ "--lc-canopy": frontTree, "--lc-light": frontLight } as CSSProperties}>
          {TREES.filter((t) => t.front).map((t) => (
            <TreeShape key={t.x} t={t} />
          ))}
        </g>

        <Hills layer={NEAR} fill={near} />

        {/* Fence: rails follow the slope post to post */}
        <g>
          {[24, 12].map((up) => (
            <path
              key={up}
              d={FENCE.map(([x, y], k) => `${k ? "L" : "M"} ${x - (k === 0 ? 8 : 0)} ${r1(y - up)}`).join(" ") + ` L ${FENCE[FENCE.length - 1][0] + 8} ${r1(FENCE[FENCE.length - 1][1] - up)}`}
              fill="none"
              stroke={fence}
              strokeWidth={5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
          {FENCE.map(([x, y]) => (
            <rect key={x} x={x - 4} y={y - POST_H} width={8} height={POST_H + 6} rx={2.5} fill={fence} />
          ))}
        </g>

        {/* The rooster on his post, facing the valley */}
        <g
          transform={`translate(${r1(PERCH[0] + ROOSTER_FEET_X * ROOSTER_S)} ${r1(PERCH[1] - 64 * ROOSTER_S)}) scale(${-ROOSTER_S} ${ROOSTER_S})`}
        >
          <Rooster pose={pose} />
        </g>
        {pose === "asleep" &&
          [0, 1, 2].map((k) => (
            <text
              key={k}
              x={PERCH[0] - 20 + k * 10}
              y={PERCH[1] - 46 - k * 10}
              fontSize={15 + k * 6}
              fontWeight={800}
              fill="#B583A8"
              style={{
                opacity: 0,
                transformBox: "fill-box",
                transformOrigin: "center",
                animation: `lc-zzz 2.7s ease-out ${(k * 0.9).toFixed(1)}s infinite`,
              }}
            >
              z
            </text>
          ))}

        {/* Late: a flock bursts out of the trees (mounted fresh each time, so it always takes off) */}
        {flush && <Flock />}
      </svg>
    </div>
  );
});

function Flock() {
  return (
    <g>
      {FLOCK.map((b, i) => (
        <motion.g
          key={i}
          initial={{ x: 0, y: 0, opacity: 0 }}
          animate={{ x: b.dx, y: b.dy, opacity: [0, 1, 1, 0] }}
          transition={{
            duration: 3,
            delay: b.delay,
            ease: [0.25, 0.6, 0.4, 1],
            opacity: { duration: 3, delay: b.delay, times: [0, 0.06, 0.8, 1] },
          }}
        >
          <g transform={`translate(${r1(b.x)} ${r1(b.y)}) scale(${(b.dx < 0 ? -1 : 1) * b.size} ${b.size})`}>
            <g style={{ transformBox: "fill-box", transformOrigin: "50% 80%", animation: `lc-flap ${b.beat}s ease-in-out infinite` }}>
              {/* A soft plum shadow under the white, like the gulls' drop shadow */}
              <path d={BIRD} transform="translate(0 1.2)" fill="none" stroke="#96465A" strokeOpacity={0.35} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
              <path d={BIRD} fill="none" stroke="#FFFFFF" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
            </g>
          </g>
        </motion.g>
      ))}
    </g>
  );
}

function Hills({ layer, fill }: { layer: Layer; fill: string }) {
  return (
    <g fill={fill} style={{ transition: "fill 600ms" }}>
      <rect x={-10} y={layer.base - 1} width={W + 20} height={H - layer.base + 12} />
      {layer.bumps.map(([cx, rx, ry]) => (
        <ellipse key={cx} cx={cx} cy={layer.base} rx={rx} ry={ry} />
      ))}
    </g>
  );
}
