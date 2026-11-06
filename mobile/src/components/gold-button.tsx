import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, type PressableProps } from 'react-native';

import { DisplayText } from '@/components/display-text';
import { colors } from '@/theme';

type Props = Omit<PressableProps, 'children'> & {
  label: string;
  tone?: 'gold' | 'win' | 'loss';
};

const GRADIENTS = {
  gold: [colors.gold, colors.goldDeep],
  win: ['#5CFFB8', '#1FBF7A'],
  loss: ['#FF7A90', '#E0344F'],
} as const;

/** Big glossy call-to-action, like a slot machine's spin button. */
export function GoldButton({ label, tone = 'gold', style, ...props }: Props) {
  return (
    <Pressable
      {...props}
      style={(state) => [
        styles.shadow,
        { shadowColor: GRADIENTS[tone][0], opacity: props.disabled ? 0.5 : 1 },
        state.pressed && { transform: [{ scale: 0.97 }] },
        typeof style === 'function' ? style(state) : style,
      ]}
    >
      <LinearGradient colors={GRADIENTS[tone]} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={styles.btn}>
        <DisplayText className="text-lg" style={{ color: '#1A1200', letterSpacing: 1 }}>
          {label}
        </DisplayText>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  shadow: {
    borderRadius: 18,
    shadowOpacity: 0.45,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
  },
  btn: {
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
});
