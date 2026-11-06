import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { RISK_OPTIONS } from '@/lib/lottery';
import { chipColors, colors, fonts } from '@/theme';

type Props = {
  value: number;
  onChange: (minutes: number) => void;
  size?: number;
};

/** Bet selector drawn as casino chips. */
export function ChipPicker({ value, onChange, size = 46 }: Props) {
  return (
    <View style={styles.row}>
      {RISK_OPTIONS.map((m) => (
        <Chip key={m} minutes={m} selected={m === value} size={size} onPress={() => onChange(m)} />
      ))}
    </View>
  );
}

function Chip({
  minutes,
  selected,
  size,
  onPress,
}: {
  minutes: number;
  selected: boolean;
  size: number;
  onPress: () => void;
}) {
  const color = chipColors[minutes] ?? colors.border;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={`Bet ${minutes} minutes`}
      style={({ pressed }) => [
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          transform: [{ translateY: selected ? -6 : 0 }, { scale: pressed ? 0.94 : 1 }],
          shadowColor: selected ? colors.gold : '#000',
          shadowOpacity: selected ? 0.9 : 0.4,
          shadowRadius: selected ? 12 : 4,
          shadowOffset: { width: 0, height: selected ? 0 : 3 },
          borderWidth: 2,
          borderColor: selected ? colors.gold : 'rgba(0,0,0,0.25)',
        },
        styles.center,
      ]}
    >
      {/* Dashed edge ring, the classic chip look */}
      <View
        style={[
          styles.center,
          {
            position: 'absolute',
            width: size - 8,
            height: size - 8,
            borderRadius: (size - 8) / 2,
            borderWidth: 3,
            borderStyle: 'dashed',
            borderColor: 'rgba(255,255,255,0.85)',
          },
        ]}
      />
      <View
        style={[
          styles.center,
          {
            width: size - 20,
            height: size - 20,
            borderRadius: (size - 20) / 2,
            backgroundColor: 'rgba(255,255,255,0.14)',
          },
        ]}
      >
        <Text style={{ fontFamily: fonts.display, fontSize: 13, color: '#fff' }}>{minutes}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 8 },
  center: { alignItems: 'center', justifyContent: 'center' },
});
