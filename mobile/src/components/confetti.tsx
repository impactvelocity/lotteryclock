/**
 * A burst of confetti from a point (ported from web/src/components/confetti.tsx): shoots up and
 * out, then falls and fades. Render it with a fresh `key` to fire again.
 */
import { View } from 'react-native';
import Animated, { css } from 'react-native-reanimated';

/** Deterministic pseudo-random in [0, 1), varied per burst via salt. */
function rand(i: number, salt: number) {
  let x = Math.imul((i * 7919 + salt * 104729) ^ 0x9e3779b9, 0x85ebca6b);
  x ^= x >>> 13;
  x = Math.imul(x, 0xc2b2ae35);
  x ^= x >>> 16;
  return (x >>> 0) / 4294967296;
}

export function Confetti({ colors, burstId, count = 44 }: { colors: string[]; burstId: number; count?: number }) {
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: '50%', top: 0, width: 0, height: 0, zIndex: 30 }}>
      {Array.from({ length: count }, (_, i) => {
        const r = (k: number) => rand(i, burstId * 31 + k);
        const vx = (r(1) - 0.5) * 420;
        const up = -(200 + r(2) * 260);
        const fall = -40 + r(3) * 180;
        const w = 6 + r(4) * 5;
        const round = r(5) > 0.7;
        const spin = (r(6) - 0.5) * 900;
        const flight = css.keyframes({
          '0%': { transform: [{ translateX: 0 }, { translateY: 0 }, { rotate: '0deg' }], opacity: 1 },
          '32%': {
            transform: [{ translateX: vx * 0.7 }, { translateY: up }, { rotate: `${spin * 0.32}deg` }],
            opacity: 1,
            animationTimingFunction: 'ease-in',
          },
          '100%': { transform: [{ translateX: vx }, { translateY: fall }, { rotate: `${spin}deg` }], opacity: 0 },
        });
        return (
          <Animated.View
            key={i}
            style={{
              position: 'absolute',
              left: -w / 2,
              width: w,
              height: round ? w : w * 1.7,
              borderRadius: round ? w : 2,
              backgroundColor: colors[i % colors.length],
              opacity: 0,
              animationName: flight,
              animationDuration: `${1.5 + r(7) * 0.7}s`,
              animationDelay: `${r(8) * 0.1}s`,
              animationTimingFunction: 'ease-out',
              animationFillMode: 'both',
            }}
          />
        );
      })}
    </View>
  );
}
