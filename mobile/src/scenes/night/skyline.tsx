/**
 * Night's city (web: night-skyline.tsx), built from the twelve building illustrations in
 * web/src/components/scenes/art/night/buildings: two rows (a hazy row behind, a dark row in
 * front) across a 3200 × 300 strip, each building picked, sized and sometimes mirrored
 * deterministically. Most buildings get extra storeys stacked into their bodies, so the skyline
 * climbs into proper towers either side of the dial (the middle stays low, behind the tier label
 * and the Set Alarm button). Windows light up one by one as the bet grows; a few glow TV-blue,
 * and antenna tips carry blinking red beacons.
 *
 * The strip is cropped (not squashed) to the screen, height deciding the scale, and only the
 * buildings in view are drawn. Native views have no CSS masks, so the web's two masks (thin in
 * the middle, fading at the foot) are an SVG <Mask> in each layer; the beacons, drawn as views
 * of their own so they can blink, take the mask's value where they sit.
 */
import { memo, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import Svg, { Defs, G, LinearGradient, Mask, Path, Rect, Stop } from 'react-native-svg';

import { frac } from '@/lib/rand';

import { BUILDING_ART, type BuildingArt } from './buildings';
import { NKF } from './keyframes';

const SKY_W = 3200;
const SKY_H = 300;
/** The art's own grid: every building is drawn 170 high with a flat bottom. */
const ART_H = 170;

type Win = [number, number, number, number];

/** How each building grows taller: repeat a storey (row `ref` of windows) `pitch` apart. */
type Stretch = {
  /** The body's footprint at the bottom, x0..x1: plain walls from `cut` down. */
  x0: number;
  x1: number;
  /** Everything above this line moves up when storeys are added. */
  cut: number;
  pitch: number;
  ref: Win[];
};

function stretchOf(art: BuildingArt): Stretch | null {
  // A house doesn't grow storeys
  if (art.name === 'gabled-house') return null;
  const ys = [...new Set(art.windows.map((w) => w[1]))].sort((a, b) => a - b);
  if (ys.length < 3) return null;
  // The second row up: the bottom row can be a door or shopfront
  const refY = ys[ys.length - 2];
  const ref = art.windows.filter((w) => w[1] === refY);
  const pitch = ys[ys.length - 1] - refY;
  const x0 = Number(art.d.match(/^M\s*([\d.]+)/)?.[1] ?? 0);
  // Every silhouette is symmetric at its foot
  return { x0, x1: art.w - x0, cut: refY - (pitch - ref[0][3]) / 2, pitch, ref };
}

const STRETCH = BUILDING_ART.map(stretchOf);

type Placed = {
  art: BuildingArt;
  st: Stretch | null;
  /** Left edge and width on the strip, the building's scale, and whether it's mirrored. */
  x: number;
  w: number;
  s: number;
  flip: boolean;
  /** Top of the art's 170-high box on the strip. */
  ty: number;
  transform: string;
  /** Extra height added to the body, in art units. */
  ext: number;
  windows: Win[];
  /** When (as a share of the bet) each window's light comes on. */
  on: number[];
  tv: boolean[];
  beaconDelay: number;
};

/**
 * How often each building turns up, in BUILDING_ART order: the tall towers are rarer, and the
 * landmarks (clock tower, radio mast) rarest.
 */
const WEIGHTS = [0.8, 0.7, 1, 0.6, 0.6, 1, 1.1, 1, 0.45, 0.8, 1, 0.5];
const TOTAL = WEIGHTS.reduce((a, b) => a + b, 0);

function pick(r: number) {
  let acc = 0;
  for (let k = 0; k < WEIGHTS.length; k++) {
    acc += WEIGHTS[k] / TOTAL;
    if (r < acc) return k;
  }
  return WEIGHTS.length - 1;
}

/** `rise` is how many storeys a building may gain, at most; fewer towards the middle. */
function city(salt: number, minScale: number, maxScale: number, rise: number): Placed[] {
  const out: Placed[] = [];
  let x = -30;
  let prev = -1;
  for (let i = 0; x < SKY_W; i++) {
    let k = pick(frac(i, salt));
    if (k === prev) k = (k + 1 + Math.floor(frac(i, salt + 1) * 6)) % BUILDING_ART.length;
    prev = k;
    const art = BUILDING_ART[k];
    const st = STRETCH[k];
    let s = minScale + frac(i, salt + 2) * (maxScale - minScale);

    // Low in the middle (behind the label and button), climbing towards the edges
    const fromMid = Math.min(1, Math.abs(x + (art.w * s) / 2 - SKY_W / 2) / 900);
    const headroom = fromMid < 0.35 ? 0 : (fromMid - 0.35) / 0.65;
    let floors = st ? Math.round(frac(i, salt + 8) ** 1.2 * rise * (0.25 + headroom * 0.75)) : 0;
    // Never taller than the strip, so antennas aren't clipped
    const tall = () => (ART_H - art.top + floors * (st?.pitch ?? 0)) * s;
    while (floors > 0 && tall() > SKY_H - 2) floors--;
    if (tall() > SKY_H - 2) s = (SKY_H - 2) / (ART_H - art.top);
    const ext = st ? floors * st.pitch : 0;
    const w = art.w * s;

    // Windows above the cut move up with the roof; new storeys copy the reference row
    const windows: Win[] = art.windows.map(([wx, wy, ww, wh]) =>
      st && wy < st.cut ? [wx, wy - ext, ww, wh] : [wx, wy, ww, wh],
    );
    if (st)
      for (let f = 1; f <= floors; f++)
        for (const [wx, wy, ww, wh] of st.ref) windows.push([wx, wy - f * st.pitch, ww, wh]);

    const flip = frac(i, salt + 3) > 0.5;
    const ty = SKY_H - ART_H * s;
    out.push({
      art,
      st,
      x,
      w,
      s,
      flip,
      ty,
      ext,
      transform: flip
        ? `translate(${(x + w).toFixed(2)} ${ty.toFixed(2)}) scale(${(-s).toFixed(3)} ${s.toFixed(3)})`
        : `translate(${x.toFixed(2)} ${ty.toFixed(2)}) scale(${s.toFixed(3)})`,
      windows,
      on: windows.map((_, n) => frac(i * 53 + n, salt + 4)),
      tv: windows.map((_, n) => frac(i * 53 + n, salt + 5) > 0.93),
      beaconDelay: Math.round(frac(i, salt + 6) * 24) / 10,
    });
    // The art has a little air at each side, so neighbours tuck in close
    x += w * (0.9 + frac(i, salt + 7) * 0.14);
  }
  return out;
}

const BACK = city(70, 1, 1.3, 10);
const FRONT = city(30, 0.8, 1.06, 7);

/** The web's MASK_X: thins out in the middle, so it never sits behind the tier label or button. */
const MASK_X: [number, number][] = [
  [0, 1],
  [0.26, 1],
  [0.4, 0.22],
  [0.6, 0.22],
  [0.74, 1],
  [1, 1],
];
/** And MASK_Y, top down: fades out at its foot. */
const MASK_Y: [number, number][] = [
  [0, 1],
  [0.68, 1],
  [0.78, 0.85],
  [0.9, 0.45],
  [1, 0.08],
];

function lerpStops(stops: [number, number][], t: number) {
  for (let i = 1; i < stops.length; i++) {
    const [t1, v1] = stops[i];
    if (t <= t1) {
      const [t0, v0] = stops[i - 1];
      return v0 + ((v1 - v0) * (t - t0)) / (t1 - t0 || 1);
    }
  }
  return stops[stops.length - 1][1];
}

/** The part of the strip in view, in strip units: "xMidYMax slice". */
type Crop = { x: number; y: number; w: number; h: number; scale: number };

function cropFor(width: number, height: number): Crop {
  const scale = Math.max(width / SKY_W, height / SKY_H);
  const w = width / scale;
  const h = height / scale;
  return { x: (SKY_W - w) / 2, y: SKY_H - h, w, h, scale };
}

/** One masked layer of the strip, cropped to the screen. */
function Layer({ crop, id, children }: { crop: Crop; id: string; children: ReactNode }) {
  const { x, y, w, h } = crop;
  return (
    <Svg style={StyleSheet.absoluteFill} viewBox={`${x} ${y} ${w} ${h}`} preserveAspectRatio="none">
      <Defs>
        <LinearGradient id={`${id}-x`} x1="0" y1="0" x2="1" y2="0">
          {MASK_X.map(([o, a], i) => (
            <Stop key={i} offset={o} stopColor="#FFFFFF" stopOpacity={a} />
          ))}
        </LinearGradient>
        {/* Black laid over the white with alpha 1 − MASK_Y leaves their product */}
        <LinearGradient id={`${id}-y`} x1="0" y1="0" x2="0" y2="1">
          {MASK_Y.map(([o, a], i) => (
            <Stop key={i} offset={o} stopColor="#000000" stopOpacity={1 - a} />
          ))}
        </LinearGradient>
        <Mask id={id} maskUnits="userSpaceOnUse" x={x} y={y} width={w} height={h}>
          <Rect x={x} y={y} width={w} height={h} fill={`url(#${id}-x)`} />
          <Rect x={x} y={y} width={w} height={h} fill={`url(#${id}-y)`} />
        </Mask>
      </Defs>
      <G mask={`url(#${id})`}>{children}</G>
    </Svg>
  );
}

const inView = (row: Placed[], crop: Crop) => row.filter((b) => b.x + b.w > crop.x && b.x < crop.x + crop.w);

/** A row's silhouettes, and the windows that are lit (TV windows only if `tvs`). */
function Row({
  row,
  fill,
  lit,
  glow,
  dim,
  tvs,
}: {
  row: Placed[];
  fill: string;
  lit: number;
  glow: string;
  dim: number;
  /** Draw the lit TV windows here too, steady (else they're left to the flickering layers). */
  tvs: boolean;
}) {
  return (
    <>
      {row.map((b, i) => (
        <G key={i} transform={b.transform}>
          {/* The roof and upper floors, lifted; the stretched body fills in underneath */}
          <Path
            d={b.art.d}
            fill={fill}
            fillRule={b.art.evenodd ? 'evenodd' : 'nonzero'}
            transform={b.ext ? `translate(0 ${-b.ext})` : undefined}
          />
          {b.st && b.ext > 0 && (
            <Rect
              x={b.st.x0}
              y={b.st.cut - b.ext - 0.5}
              width={b.st.x1 - b.st.x0}
              height={ART_H - b.st.cut + b.ext + 0.5}
              fill={fill}
            />
          )}
          <G fill={glow} opacity={dim}>
            {b.windows.map(([x, y, w, h], n) =>
              b.on[n] < lit && !b.tv[n] ? <Rect key={n} x={x} y={y} width={w} height={h} rx={1.5} /> : null,
            )}
          </G>
          {tvs && (
            <G fill="#A9C2FF" opacity={0.75}>
              {b.windows.map(([x, y, w, h], n) =>
                b.on[n] < lit && b.tv[n] ? <Rect key={n} x={x} y={y} width={w} height={h} rx={1.5} /> : null,
              )}
            </G>
          )}
        </G>
      ))}
    </>
  );
}

/** The front row's lit TV windows whose index falls in group `g` (of TV_GROUPS). */
function TvWindows({ row, lit, g }: { row: Placed[]; lit: number; g: number }) {
  return (
    <>
      {row.map((b, i) => (
        <G key={i} transform={b.transform} fill="#A9C2FF">
          {b.windows.map(([x, y, w, h], n) =>
            b.on[n] < lit && b.tv[n] && n % TV_GROUPS === g ? (
              <Rect key={n} x={x} y={y} width={w} height={h} rx={1.5} />
            ) : null,
          )}
        </G>
      ))}
    </>
  );
}

/** The TV flicker runs in a few layers, each at its own pace (the web gives each window one of five). */
const TV_GROUPS = 3;

/** A row's red aircraft beacons, each blinking at its own moment, placed in screen points. */
function Beacons({ row, crop, width, height }: { row: Placed[]; crop: Crop; width: number; height: number }) {
  return (
    <>
      {row.map((b, i) => {
        if (!b.art.beacon) return null;
        const [bx, by] = b.art.beacon;
        const sx = b.flip ? b.x + b.w - bx * b.s : b.x + bx * b.s;
        const sy = b.ty + (by - b.ext) * b.s;
        const X = (sx - crop.x) * crop.scale;
        const Y = (sy - crop.y) * crop.scale;
        if (X < -6 || X > width + 6) return null;
        const r = Math.max(1.2, 3.2 * b.s * crop.scale);
        const mask = lerpStops(MASK_X, X / width) * lerpStops(MASK_Y, Y / height);
        return (
          <View key={i} style={{ position: 'absolute', left: X - r, top: Y - r, opacity: mask }}>
            <Animated.View
              style={{
                width: r * 2,
                height: r * 2,
                borderRadius: r,
                backgroundColor: '#FF4D5E',
                boxShadow: `0 0 ${(4 * b.s * crop.scale * 2).toFixed(1)}px rgba(255,77,94,0.9)`,
                opacity: 0.2,
                animationName: NKF.beacon,
                animationDuration: '2.4s',
                animationDelay: `${b.beaconDelay}s`,
                animationIterationCount: 'infinite',
                animationTimingFunction: 'ease-in-out',
              }}
            />
          </View>
        );
      })}
    </>
  );
}

/** `lit` is the share of windows with the lights on, 0..1. */
export const Skyline = memo(function Skyline({ lit, width, height }: { lit: number; width: number; height: number }) {
  const crop = cropFor(width, height);
  const back = inView(BACK, crop);
  const front = inView(FRONT, crop);

  return (
    <View pointerEvents="none" style={[styles.strip, { height }]}>
      <Layer crop={crop} id="lc-sky-back">
        <Row row={back} fill="#22102F" lit={lit * 0.8} glow="#FFB060" dim={0.4} tvs />
      </Layer>
      <Beacons row={back} crop={crop} width={width} height={height} />
      <Layer crop={crop} id="lc-sky-front">
        <Row row={front} fill="#0C0614" lit={lit} glow="#FFC870" dim={0.9} tvs={false} />
      </Layer>
      {Array.from({ length: TV_GROUPS }, (_, g) => (
        <Animated.View
          key={g}
          style={[
            StyleSheet.absoluteFill,
            {
              animationName: NKF.tv,
              animationDuration: `${Math.round((1.4 + g * 0.5) * 100) / 100}s`,
              animationIterationCount: 'infinite',
              animationTimingFunction: 'step-end', // steps(1)
            },
          ]}
        >
          <Layer crop={crop} id={`lc-sky-tv-${g}`}>
            <TvWindows row={front} lit={lit} g={g} />
          </Layer>
        </Animated.View>
      ))}
      <Beacons row={front} crop={crop} width={width} height={height} />
    </View>
  );
});

const styles = StyleSheet.create({
  strip: { position: 'absolute', left: 0, right: 0, bottom: 0 },
});
