import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { DisplayText } from '@/components/display-text';
import { timeParts } from '@/lib/format';
import { colors } from '@/theme';

/** A time shown as slot-machine reel windows: [0][7] : [3][0] AM */
export function ReelTime({ hour, minute, size = 'lg' }: { hour: number; minute: number; size?: 'lg' | 'md' }) {
  const { hh, mm, ampm } = timeParts(hour, minute);
  const digits = hh.padStart(2, '0');
  const w = size === 'lg' ? 56 : 40;
  const h = size === 'lg' ? 78 : 56;
  const fontSize = size === 'lg' ? 44 : 30;

  return (
    <View style={styles.row}>
      {[...digits].map((d, i) => (
        <Window key={`h${i}`} char={d} w={w} h={h} fontSize={fontSize} />
      ))}
      <View style={{ gap: h * 0.18, marginHorizontal: 4 }}>
        <View style={[styles.dot, { width: h * 0.1, height: h * 0.1 }]} />
        <View style={[styles.dot, { width: h * 0.1, height: h * 0.1 }]} />
      </View>
      {[...mm].map((d, i) => (
        <Window key={`m${i}`} char={d} w={w} h={h} fontSize={fontSize} />
      ))}
      {ampm ? (
        <DisplayText style={{ color: colors.muted, fontSize: fontSize * 0.4, marginLeft: 8, alignSelf: 'flex-end', marginBottom: 6 }}>
          {ampm}
        </DisplayText>
      ) : null}
    </View>
  );
}

function Window({ char, w, h, fontSize }: { char: string; w: number; h: number; fontSize: number }) {
  return (
    <View style={[styles.window, { width: w, height: h }]}>
      <LinearGradient
        // Curved-reel shading: dark at top and bottom, bright in the middle.
        colors={['#0A0714', '#2A2048', '#3A2D63', '#2A2048', '#0A0714']}
        locations={[0, 0.25, 0.5, 0.75, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.payline} />
      <DisplayText style={{ color: colors.fg, fontSize, lineHeight: h }}>{char}</DisplayText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  window: {
    borderRadius: 12,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  dot: { backgroundColor: colors.gold, borderRadius: 2 },
  payline: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    height: 1,
    backgroundColor: 'rgba(255,201,60,0.18)',
  },
});
