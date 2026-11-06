import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { Text } from '@/components/ui/text';
import { colors } from '@/theme';

export const REEL_SYMBOLS = ['🍒', '🍋', '🔔', '⭐️', '💎', '7️⃣', '⏰'];
const CELL_H = 96;
const SPINS = 18;

/** Total time until the last reel stops. */
export const reelStopMs = (index: number) => 1100 + index * 450;

/** Three slot reels that spin and land on `finals`. */
export function SlotReels({ finals }: { finals: [string, string, string] }) {
  return (
    <View style={styles.machine}>
      {finals.map((f, i) => (
        <Reel key={i} final={f} durationMs={reelStopMs(i)} seed={i * 3} />
      ))}
    </View>
  );
}

function Reel({ final, durationMs, seed }: { final: string; durationMs: number; seed: number }) {
  const strip = useMemo(() => {
    const s = Array.from({ length: SPINS }, (_, i) => REEL_SYMBOLS[(i + seed) % REEL_SYMBOLS.length]);
    s.push(final);
    return s;
  }, [final, seed]);

  const y = useSharedValue(0);
  useEffect(() => {
    y.set(
      withTiming(-(strip.length - 1) * CELL_H, {
        duration: durationMs,
        // Slight overshoot, like a reel catching on its stop.
        easing: Easing.bezier(0.15, 0.7, 0.3, 1.04),
      }),
    );
  }, [y, strip.length, durationMs]);

  const style = useAnimatedStyle(() => ({ transform: [{ translateY: y.get() }] }));

  return (
    <View style={styles.reel}>
      <Animated.View style={style}>
        {strip.map((sym, i) => (
          <View key={i} style={styles.cell}>
            <Text style={{ fontSize: 52, lineHeight: 64 }}>{sym}</Text>
          </View>
        ))}
      </Animated.View>
      <LinearGradient
        pointerEvents="none"
        colors={['rgba(5,3,12,0.95)', 'rgba(5,3,12,0)', 'rgba(5,3,12,0)', 'rgba(5,3,12,0.95)']}
        locations={[0, 0.3, 0.7, 1]}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  machine: {
    flexDirection: 'row',
    gap: 10,
    padding: 12,
    borderRadius: 28,
    backgroundColor: '#120B24',
    borderWidth: 2,
    borderColor: colors.gold,
    shadowColor: colors.gold,
    shadowOpacity: 0.5,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 0 },
  },
  reel: {
    width: 88,
    height: CELL_H,
    overflow: 'hidden',
    borderRadius: 16,
    backgroundColor: '#F4EEFF',
  },
  cell: { height: CELL_H, alignItems: 'center', justifyContent: 'center' },
});
