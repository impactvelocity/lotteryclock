/**
 * Caffè's creatures and things (web: Swallow, Vespa and Cloud in cafe-art.tsx, CafeTable in
 * cafe-scene.tsx). The SVG art is the web's; what moves (wings, wheels, the scarf, the moka's
 * puffs) is split into its own layer so a View can animate it.
 */
import { memo, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';

import { sans } from '@/themes/fonts';

import { KF, loop } from '../anim';
import { bumpFor, FLAP, rideFor, SCARF } from './keyframes';
import { MokaBody, Puffs } from './moka';
import { CA } from './palette';

/* ---------------------------------------------------------------------------------------------
 * A swallow in flight, facing right, on a 40 × 24 grid
 * ------------------------------------------------------------------------------------------- */

const FAR_WING = 'M26.6 10.4C22 7 16 3.6 7.4 2.2 13.6 5.8 18.4 9.2 22.4 12Z';
const NEAR_WING = 'M27.2 10.6C22.4 6 17 2 7 0 13.4 4.2 18.6 8.6 22.8 12Z';

/** Wings beat at `flap` seconds a beat, about the shoulder at (24, 11); the far one a touch behind. */
export const Swallow = memo(function Swallow({ size, flap }: { size: number; flap: number }) {
  const h = (size * 24) / 40;
  const wing = (far: boolean) =>
    ({
      position: 'absolute',
      left: 0,
      top: 0,
      width: size,
      height: h,
      transformOrigin: '60% 45.83%',
      ...loop(FLAP, Number(flap.toFixed(2)), { delay: far ? -flap / 6 : 0 }),
    }) as const;
  const art = (kids: ReactNode) => (
    <Svg viewBox="0 0 40 24" width={size} height={h}>
      {kids}
    </Svg>
  );
  return (
    <View style={{ width: size, height: h }}>
      <Animated.View style={wing(true)}>{art(<Path d={FAR_WING} fill="#46526A" />)}</Animated.View>
      <View style={StyleSheet.absoluteFill}>
        {art(
          <>
            <Path
              d="M38.6 11 34.6 9.6C31 8.6 27 9.2 23 10.4 19 11.4 15 11.6 11 11L2 6.4 8.6 12.4 2.4 17.8 11.6 13.6C15.6 14.2 20 14.4 24 13.8 28.4 13.2 32.4 12.8 34.6 12.4Z"
              fill={CA.swallow}
            />
            <Path d="M24 13.8C20 14.4 15.6 14.2 12 13.4 16 15.6 21 15.8 24 13.8Z" fill="#F3E6D3" />
            <Circle cx={35} cy={11.6} r={1} fill="#B8552F" />
          </>,
        )}
      </View>
      <Animated.View style={wing(false)}>{art(<Path d={NEAR_WING} fill={CA.swallow} />)}</Animated.View>
    </View>
  );
});

/** A puffy cream cumulus, flat-bottomed, `w` wide. */
export const Cloud = memo(function Cloud({ w }: { w: number }) {
  return (
    <Svg viewBox="0 0 120 52" width={w} height={(w * 52) / 120}>
      <Path
        d="M10 50C2 50 0 40 8 37 6 27 18 22 26 27 28 14 44 9 52 18 58 6 78 6 82 20 90 13 104 18 102 30 114 29 120 40 112 47 110 50 106 50 104 50Z"
        fill="#FFF7EA"
      />
      <Path d="M8 46C24 48 70 49 112 46 110 50 106 50 104 50H10C6 50 6.6 47.6 8 46Z" fill="#F4E2CA" />
    </Svg>
  );
});

/* ---------------------------------------------------------------------------------------------
 * The Vespa, with a rider in a headscarf, riding right (on an 80 × 70 grid from y = -16)
 * ------------------------------------------------------------------------------------------- */

/** The Vespa's width on screen (the web's clamp(54px, 5.4vw, 76px), at phone size). */
const VESPA_W = 54;
const VU = VESPA_W / 80;
const VESPA_H = 70 * VU;
/** Grid → pt, inside the Vespa's box. */
const vx = (x: number) => x * VU;
const vy = (y: number) => (y + 16) * VU;

/** The scarf's box on the grid; it streams from its knot at (29.4, -1.3). */
const SCARF_BOX = { x: 13, y: -4.5, w: 17.5, h: 6 };

function Tires() {
  return (
    <Svg viewBox="0 -16 80 70" width={VESPA_W} height={VESPA_H} style={StyleSheet.absoluteFill}>
      <Circle cx={18} cy={46} r={7.4} fill={CA.bakelite} />
      <Circle cx={64} cy={46} r={7.4} fill={CA.bakelite} />
    </Svg>
  );
}

/** A wheel's hub and spokes, spinning. */
function Hub({ x, fast }: { x: number; fast: boolean }) {
  const r = 4.2;
  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: vx(x - r),
        top: vy(46 - r),
        width: vx(r * 2),
        height: vx(r * 2),
        ...loop(KF.spin, fast ? 0.25 : 0.45, { ease: 'linear' }),
      }}
    >
      <Svg viewBox={`${x - r} ${46 - r} ${r * 2} ${r * 2}`} width={vx(r * 2)} height={vx(r * 2)}>
        <Circle cx={x} cy={46} r={3.6} fill={CA.steel} stroke={CA.ink} strokeWidth={0.8} />
        <Path d={`M${x - 3.4} 46H${x + 3.4}M${x} 42.6V49.4`} stroke={CA.ink} strokeWidth={0.8} />
      </Svg>
    </Animated.View>
  );
}

/** The rider and the scooter's bodywork, over the wheels. */
const VespaBody = memo(function VespaBody() {
  return (
    <Svg viewBox="0 -16 80 70" width={VESPA_W} height={VESPA_H} style={StyleSheet.absoluteFill}>
      <G stroke={CA.ink} strokeWidth={1.3} strokeLinejoin="round">
        {/* Rider: legs, jacket, arm, head */}
        <Path d="M27.6 21.8 40.6 24.2 43 38.4" fill="none" stroke="#3E4A5A" strokeWidth={5} strokeLinecap="round" />
        <Ellipse cx={45} cy={39.4} rx={3.2} ry={1.8} fill={CA.espresso} />
        <Path d="M23.4 22.2C22.6 14 25 6.2 30.2 3.2 34.2 1 37.4 3.4 37.6 7.4L35.8 21.4Z" fill={CA.ochre} />
        <Path d="M33.6 6.4 51.6 11.2" fill="none" stroke={CA.ochre} strokeWidth={4.2} strokeLinecap="round" />
        <Circle cx={52.2} cy={11.6} r={1.9} fill={CA.skin} strokeWidth={1} />
        <Circle cx={33.4} cy={-4.4} r={5.4} fill={CA.skin} />
        <Path
          d="M27.8-4.2C27.6-9.6 31.6-11.4 34.6-10.8 37.6-10.2 39.2-7.8 38.6-5.6 35.4-7.6 31-7.4 28.6-2.4Z"
          fill={CA.geranium}
        />
        <Path d="M35.2-5.2H39.2V-3.4H35.2Z" fill={CA.ink} strokeWidth={0} />
      </G>
      <G stroke={CA.ink} strokeWidth={1.3} strokeLinejoin="round">
        {/* Rear cowl over the back wheel, the seat on top */}
        <Path
          d="M7 42C5 32 11 25 21 24.5H33C37 24.5 39 27.5 38.6 31L37.6 38.6C37.4 40.6 36 41.6 34 41.6H26C25 37.6 21.6 35.4 18 35.4 14 35.4 11 38 10.4 42Z"
          fill={CA.vespa}
        />
        <Path d="M14 24.6C14 21.4 17 20.4 22 20.4H33C35.4 20.4 36.4 21.8 36 24.6Z" fill={CA.espresso} />
        <Path d="M36 38.6H52L54 42.6H36Z" fill={CA.vespaShade} />
        {/* Leg shield, front mudguard, handlebar and headlight */}
        <Path
          d="M50.6 41.8C52.8 33 53.6 26 54 18H58.6C58.8 26 58.2 33 57 38 56.6 40 55.6 41.6 54 42.4Z"
          fill={CA.vespa}
        />
        <Path
          d="M56 42C57 37.6 61 35.6 65 35.8 69 36 71.6 38.6 72 42.4H68.6C68 40 66.4 38.8 64 38.8 61.6 38.8 60 40.4 59.6 42.4Z"
          fill={CA.vespa}
        />
        <Path d="M56.4 18V11.6M50 12.2 60.6 10.8" fill="none" strokeWidth={2} strokeLinecap="round" />
        <Circle cx={59.8} cy={14.6} r={3.2} fill={CA.cream} />
        <Circle cx={6.6} cy={34.4} r={1.4} fill={CA.geranium} strokeWidth={0.8} />
      </G>
    </Svg>
  );
});

/** A Vespa with a rider in a headscarf, riding right. */
function Vespa({ fast }: { fast: boolean }) {
  return (
    <View style={{ width: VESPA_W, height: VESPA_H }}>
      {/* Scarf streaming out behind */}
      <Animated.View
        style={{
          position: 'absolute',
          left: vx(SCARF_BOX.x),
          top: vy(SCARF_BOX.y),
          width: vx(SCARF_BOX.w),
          height: vx(SCARF_BOX.h),
          transformOrigin: [vx(29.4 - SCARF_BOX.x), vx(-1.3 - SCARF_BOX.y), 0],
          ...loop(SCARF, fast ? 0.18 : 0.3),
        }}
      >
        <Svg
          viewBox={`${SCARF_BOX.x} ${SCARF_BOX.y} ${SCARF_BOX.w} ${SCARF_BOX.h}`}
          width={vx(SCARF_BOX.w)}
          height={vx(SCARF_BOX.h)}
        >
          <Path
            d="M29.4-1.6C24-3.4 19-1.6 13.6-3.4 17.4-.6 22.4.8 28.4.6Z"
            fill={CA.geranium}
            stroke={CA.ink}
            strokeWidth={1}
            strokeLinejoin="round"
          />
        </Svg>
      </Animated.View>
      {/* ...bumping over the cobbles */}
      <Animated.View style={[StyleSheet.absoluteFill, loop(bumpFor(VU), fast ? 0.2 : 0.34)]}>
        <Tires />
        <Hub x={18} fast={fast} />
        <Hub x={64} fast={fast} />
        <VespaBody />
      </Animated.View>
    </View>
  );
}

/**
 * The Vespa crossing the street every `ride` seconds (then a pause before it's back); on a late
 * result it tears past, beeping.
 */
export function Rider({ ride, beep, width }: { ride: number; beep: boolean; width: number }) {
  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: 0,
        bottom: 4,
        animationName: rideFor(width),
        animationDuration: `${ride}s`,
        animationIterationCount: 'infinite',
        animationTimingFunction: 'linear',
      }}
    >
      <Vespa fast={ride < 5} />
      {beep && (
        <View style={styles.beepAt}>
          <View style={styles.beep}>
            <Text style={styles.beepText}>beep beep!</Text>
          </View>
        </View>
      )}
    </Animated.View>
  );
}

/* ---------------------------------------------------------------------------------------------
 * A table outside the café, two chairs and a moka on it (on a 130 × 96 grid)
 * ------------------------------------------------------------------------------------------- */

function Chair({ flip }: { flip?: boolean }) {
  return (
    <G
      transform={flip ? 'translate(130 0) scale(-1 1)' : undefined}
      stroke="#2B2420"
      strokeWidth={2.4}
      strokeLinecap="round"
      fill="none"
    >
      <Path d="M12 62C8 48 8 36 13 31 17 27 22 30 21.6 36L21 62" />
      <Path d="M13.6 42H20.6M14 50H21" strokeWidth={1.6} />
      <Ellipse cx={25} cy={62} rx={13} ry={3} fill="#3A2E28" />
      <Path d="M14 64 11 92M36 64 38 92M21 65 20 90M29 65 31 90" />
    </G>
  );
}

/** Where the moka stands on the table, and its size, in table units. */
const MOKA = { x: 40, y: 28, s: 26 };

/** The table, `width` pt wide; the moka on it steams in puffs when `puffing`. */
export const CafeTable = memo(function CafeTable({ width, puffing }: { width: number; puffing: boolean }) {
  const k = width / 130;
  return (
    <View style={{ width, height: 96 * k }}>
      {puffing && <Puffs unit={(k * MOKA.s) / 48} left={MOKA.x * k} top={MOKA.y * k} />}
      <Svg viewBox="0 0 130 96" width={width} height={96 * k} style={StyleSheet.absoluteFill}>
        <Chair />
        <Chair flip />
        <Path d="M65 56V86M52 93Q65 84 78 93" stroke="#2B2420" strokeWidth={3} fill="none" strokeLinecap="round" />
        <Rect x={38} y={52} width={54} height={5} rx={2.5} fill="#F2EEE6" stroke={CA.ink} strokeWidth={1.2} />
        <G transform={`translate(${MOKA.x} ${MOKA.y}) scale(${MOKA.s / 48})`}>
          <MokaBody />
        </G>
        {[70, 81].map((x) => (
          <G key={x} stroke={CA.ink} strokeWidth={1}>
            <Ellipse cx={x + 4} cy={51.6} rx={6} ry={1.4} fill={CA.porcelain} />
            <Path d={`M${x} 45H${x + 8}V48A4 3 0 0 1 ${x} 48Z`} fill={CA.porcelain} />
            <Path d={`M${x + 8} 46A1.8 1.8 0 1 1 ${x + 8} 49`} fill="none" />
          </G>
        ))}
      </Svg>
    </View>
  );
});

const styles = StyleSheet.create({
  /** A wide box to hang the bubble in, so it never wraps inside the narrow Vespa. */
  beepAt: { position: 'absolute', top: -20, left: VESPA_W * 0.7, width: 120, alignItems: 'flex-start' },
  beep: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: CA.cream,
    boxShadow: `0 0 0 1.5px ${CA.ink}`,
  },
  beepText: { fontFamily: sans(700), fontSize: 11, color: CA.ink },
});
