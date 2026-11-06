/**
 * Developer harness for theme scenes: every part of a theme kit at a chosen bet and mood.
 * Open with:  xcrun simctl openurl <udid> "lotteryclock://preview?theme=night&range=30&mood=idle"
 * Optional: &parts=roll,result,mascot (default all) and &clean=1 (scene only, no labels).
 */
import { Stack, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';

import { playLayout } from '@/components/play-layout';
import { SceneOverlay, ScenePlate } from '@/components/scene-plate';
import { kitFor, type SceneMood } from '@/scenes';
import { sans } from '@/themes/fonts';
import { MAX_RANGE, THEMES } from '@/themes/themes';

export default function PreviewScreen() {
  const q = useLocalSearchParams<{ theme?: string; range?: string; mood?: string; parts?: string; clean?: string }>();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const t = THEMES.find((x) => x.id === q.theme) ?? THEMES[0];
  const range = Math.max(0, Math.min(MAX_RANGE, Number(q.range ?? 10)));
  const mood = (q.mood ?? 'idle') as SceneMood;
  const parts = (q.parts ?? 'roll,result,mascot').split(',');
  const clean = q.clean === '1';
  const L = playLayout(width, height, insets.top);
  const kit = kitFor(t);
  const { MascotFace, RollFlourish, ResultFlourish, DialUnder, DialOver } = kit;
  const p = range / MAX_RANGE;
  const dialVisible = mood === 'idle';

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScenePlate theme={t} range={range} mood={mood} layout={L} dialVisible={dialVisible} />

      {/* A stand-in dial: the disc and ring, with the theme's dial layers */}
      {dialVisible && (
        <View
          style={{
            position: 'absolute',
            left: L.dialX - L.dialSize / 2,
            top: L.dialY - L.dialSize / 2,
            width: L.dialSize,
            height: L.dialSize,
          }}
        >
          <View
            style={{
              position: 'absolute',
              inset: L.dialSize * (3 / 358),
              borderRadius: L.dialSize,
              backgroundImage: t.disc,
              boxShadow: t.discShadow,
            }}
          />
          <Svg viewBox="0 0 358 358" width={L.dialSize} height={L.dialSize} style={StyleSheet.absoluteFill}>
            <Circle cx={179} cy={179} r={148} fill="none" stroke={t.track} strokeWidth={t.trackWidth} />
            {DialUnder && <DialUnder range={range} p={p} theme={t} />}
            {DialOver && <DialOver range={range} p={p} theme={t} />}
          </Svg>
        </View>
      )}

      {/* The rail line */}
      <View style={{ position: 'absolute', left: 0, right: 0, top: L.railY - 2, height: 4, backgroundColor: t.rail }} />

      {!clean && (
        <View style={{ position: 'absolute', left: 12, right: 12, top: L.headerTop, gap: 4 }}>
          <Text style={{ color: t.ink, fontFamily: sans(700), fontSize: 16 }}>
            {t.name} · {range} min · {mood}
          </Text>
        </View>
      )}

      {!clean && (
        <View style={[styles.parts, { top: L.railY + 14 }]}>
          {parts.includes('mascot') && MascotFace && (
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {[0, 1, 2, 3, 4, 5].map((tier) => (
                <MascotFace key={tier} tier={tier} size={34} />
              ))}
            </View>
          )}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            {parts.includes('roll') && RollFlourish && (
              <View style={{ width: 200, height: 80, alignItems: 'center', justifyContent: 'flex-end' }}>
                <RollFlourish />
              </View>
            )}
            {parts.includes('result') && ResultFlourish && (
              <View style={{ width: 56, height: 56, alignItems: 'center', justifyContent: 'center' }}>
                <ResultFlourish mood={mood === 'idle' || mood === 'set' ? 'win' : mood} />
              </View>
            )}
          </View>
        </View>
      )}

      <SceneOverlay theme={t} layout={L} />
    </View>
  );
}

const styles = StyleSheet.create({
  parts: { position: 'absolute', left: 12, right: 12, gap: 8, alignItems: 'center' },
});
