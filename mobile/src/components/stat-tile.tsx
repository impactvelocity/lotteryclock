import { View } from 'react-native';

import { DisplayText } from '@/components/display-text';
import { Text } from '@/components/ui/text';
import { colors } from '@/theme';

export function StatTile({ label, value, color = colors.fg }: { label: string; value: string; color?: string }) {
  return (
    <View
      style={{
        flex: 1,
        minWidth: '45%',
        backgroundColor: 'rgba(36,27,62,0.6)',
        borderRadius: 18,
        borderWidth: 1,
        borderColor: colors.border,
        paddingVertical: 14,
        paddingHorizontal: 16,
        gap: 4,
      }}
    >
      <Text className="text-[10px] uppercase text-muted-foreground" style={{ letterSpacing: 1.5 }}>
        {label}
      </Text>
      <DisplayText style={{ color, fontSize: 22 }}>{value}</DisplayText>
    </View>
  );
}
