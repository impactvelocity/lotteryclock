/**
 * The themed backdrop behind the Play screen: the theme's sky (ramping with the bet), its scene,
 * and the effect centred behind the dial. Never touchable.
 */
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import type { PlayLayout } from '@/components/play-layout';
import { kitFor, type SceneMood } from '@/scenes';
import { background, MAX_RANGE, tierIndex, type Theme } from '@/themes/themes';

export function ScenePlate({
  theme: t,
  range,
  mood,
  layout: L,
  dialVisible,
}: {
  theme: Theme;
  range: number;
  mood: SceneMood;
  layout: PlayLayout;
  dialVisible: boolean;
}) {
  const p = range / MAX_RANGE;
  const kit = kitFor(t);
  const { Scene, DialBackdrop } = kit;
  const dial = { x: L.dialX, y: L.dialY, size: L.dialSize };

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { height: L.railY, overflow: 'hidden' }]}>
      {/* Keyed by theme, so swapping themes cross-fades the old sky and scene out */}
      <Animated.View
        key={t.id}
        entering={FadeIn.duration(500)}
        exiting={FadeOut.duration(500)}
        style={[StyleSheet.absoluteFill, { backgroundImage: background(t, p) }]}
      >
        <Scene p={p} tier={tierIndex(range)} mood={mood} width={L.width} height={L.railY} dial={dial} />
        {DialBackdrop && (
          <View
            style={{
              position: 'absolute',
              left: L.dialX - L.dialSize / 2,
              top: L.dialY - L.dialSize / 2,
              width: L.dialSize,
              height: L.dialSize,
              overflow: 'visible',
            }}
          >
            <DialBackdrop p={p} range={range} visible={dialVisible} size={L.dialSize} mood={mood} />
          </View>
        )}
      </Animated.View>
    </View>
  );
}

/** Effects laid over the whole screen, text included (Ouija's old film). */
export function SceneOverlay({ theme, layout }: { theme: Theme; layout: PlayLayout }) {
  const { Overlay } = kitFor(theme);
  if (!Overlay) return null;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Overlay width={layout.width} height={layout.height} />
    </View>
  );
}
