/**
 * The status line under the dial (ported from web/src/components/hero.tsx): the bet tier while
 * picking, the theme's tumbling-letter titles once set, the draw's progress bar, and the verdict
 * badge with its little flourishes.
 */
import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { css, FadeInDown } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { KF, loop } from '@/scenes/anim';
import { kitFor, type SceneMood } from '@/scenes';
import { sans } from '@/themes/fonts';
import { css as rgb, cssA, MAX_RANGE, ramp, tierIndex, tierLabel, type Theme } from '@/themes/themes';

/** Title case ("Pure Chaos"), like the web's CSS capitalize. */
const titleCase = (s: string) => s.replace(/(^|\s)(\S)/g, (_, a, b) => a + b.toUpperCase());

/** The bet tier, with its icon or the theme's mascot. */
export function TierLabel({ theme: t, range }: { theme: Theme; range: number }) {
  const p = range / MAX_RANGE;
  const tier = tierIndex(range);
  const arcRGB = ramp(t.arcStops, p);
  const color = range === 0 ? t.muted : t.tierInk ? rgb(ramp(t.tierInk, p)) : rgb(arcRGB);
  const { MascotFace } = kitFor(t);
  const label = titleCase(tierLabel(range, t));
  return (
    <Animated.View
      key={`${t.id}-${tier}`}
      // A layout animation, not CSS keyframes: those can stall part-way when the screen mounts at launch
      entering={FadeInDown.springify().damping(16).stiffness(220).mass(0.8)}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 9, height: 34 }}
    >
      <Animated.View style={[{ flexDirection: 'row', alignItems: 'center', gap: 9 }, range === MAX_RANGE ? loop(KF.shake, 0.4, { ease: 'linear' }) : null]}>
        {MascotFace ? (
          <View>
            <MascotFace tier={tier} size={34} />
          </View>
        ) : (
          t.tierIcons && (
            <View>
              <Svg width={22} height={22} viewBox="0 0 24 24">
                {t.tierIcons[tier].map((d, i) => (
                  <Path key={i} d={d} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                ))}
              </Svg>
            </View>
          )
        )}
        <Text
          style={{
            color,
            fontFamily: sans(800),
            fontSize: 21,
            textShadowColor: p > 0.6 && t.glow > 0.5 && !t.tierInk ? cssA(arcRGB, 0.6) : 'transparent',
            textShadowRadius: 12,
          }}
        >
          {label}
        </Text>
      </Animated.View>
    </Animated.View>
  );
}

/**
 * A status title whose letters tumble in one at a time; with `wave`, they keep bobbing in a
 * wave after that, like the clock's waiting for something.
 */
export function Letters({ text, wave, color, size = 16 }: { text: string; wave: boolean; color: string; size?: number }) {
  return (
    <View accessible accessibilityLabel={text} style={{ flexDirection: 'row', flexWrap: 'nowrap' }}>
      {Array.from(text.toUpperCase()).map((ch, i) => (
        <Animated.View
          key={`${text}-${i}`}
          style={{
            opacity: 0,
            animationName: i % 2 ? TUMBLE_R : TUMBLE_L,
            animationDuration: '420ms',
            animationDelay: `${0.05 + i * 0.025}s`,
            animationFillMode: 'both',
            animationTimingFunction: 'ease-out',
          }}
        >
          <Animated.View style={wave ? loop(KF.letterWave, 1.3, { delay: 0.6 + i * 0.05 }) : undefined}>
            <Text style={{ color, fontFamily: sans(800), fontSize: size, letterSpacing: size * 0.14 }}>
            {ch === ' ' ?' ' : ch}
            </Text>
          </Animated.View>
        </Animated.View>
      ))}
    </View>
  );
}

const tumble = (deg: number) =>
  css.keyframes({
    '0%': { opacity: 0, transform: [{ translateY: 14 }, { scale: 0.5 }, { rotate: `${deg}deg` }] },
    '60%': { opacity: 1, transform: [{ translateY: -2 }, { scale: 1.08 }, { rotate: `${-deg * 0.2}deg` }] },
    '100%': { opacity: 1, transform: [{ translateY: 0 }, { scale: 1 }, { rotate: '0deg' }] },
  });
const TUMBLE_L = tumble(-14);
const TUMBLE_R = tumble(14);

/** The draw's progress, filling over `ms`. */
export function RollBar({ color, ms }: { color: string; ms: number }) {
  return (
    <View style={{ width: 160, height: 8, borderRadius: 4, overflow: 'hidden', backgroundColor: cssA(hexRGB(color), 0.12) }}>
      <Animated.View
        style={{
          height: '100%',
          borderRadius: 4,
          backgroundColor: color,
          width: '100%',
          transformOrigin: 'left',
          animationName: FILL,
          animationDuration: `${ms}ms`,
          animationTimingFunction: 'ease-in-out',
          animationFillMode: 'both',
        }}
      />
    </View>
  );
}

const FILL = css.keyframes({
  from: { transform: [{ scaleX: 0 }] },
  to: { transform: [{ scaleX: 1 }] },
});

function hexRGB(hex: string): [number, number, number] {
  if (!hex.startsWith('#')) return [128, 128, 128];
  return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)) as [number, number, number];
}

/** How the verdict badge arrives: a burst, then a hop (snooze), a head shake (late) or a spin (on the dot). */
const BADGE = {
  win: css.keyframes({
    '0%': { opacity: 0, transform: [{ translateY: 0 }, { scale: 0.2 }, { rotate: '-12deg' }] },
    '35%': { opacity: 1, transform: [{ translateY: -10 }, { scale: 1.2 }, { rotate: '4deg' }] },
    '60%': { transform: [{ translateY: 0 }, { scale: 0.94 }, { rotate: '-2deg' }] },
    '80%': { transform: [{ translateY: -4 }, { scale: 1.05 }, { rotate: '0deg' }] },
    '100%': { opacity: 1, transform: [{ translateY: 0 }, { scale: 1 }, { rotate: '0deg' }] },
  }),
  loss: css.keyframes({
    '0%': { opacity: 0, transform: [{ translateX: 0 }, { scale: 0.2 }, { rotate: '12deg' }] },
    '30%': { opacity: 1, transform: [{ translateX: 0 }, { scale: 1.15 }, { rotate: '-3deg' }] },
    '42%': { transform: [{ translateX: 0 }, { scale: 1 }, { rotate: '0deg' }] },
    '58%': { transform: [{ translateX: -9 }, { scale: 1 }, { rotate: '0deg' }] },
    '72%': { transform: [{ translateX: 8 }, { scale: 1 }, { rotate: '0deg' }] },
    '86%': { transform: [{ translateX: -5 }, { scale: 1 }, { rotate: '0deg' }] },
    '100%': { opacity: 1, transform: [{ translateX: 0 }, { scale: 1 }, { rotate: '0deg' }] },
  }),
  jackpot: css.keyframes({
    '0%': { opacity: 0, transform: [{ scale: 0.2 }, { rotate: '-180deg' }] },
    '40%': { opacity: 1, transform: [{ scale: 1.25 }, { rotate: '12deg' }] },
    '62%': { transform: [{ scale: 0.95 }, { rotate: '-5deg' }] },
    '82%': { transform: [{ scale: 1.04 }, { rotate: '0deg' }] },
    '100%': { opacity: 1, transform: [{ scale: 1 }, { rotate: '0deg' }] },
  }),
};

/** The verdict, as a badge in the theme's snooze / late colours, with its flourishes. */
export function ResultBadge({ theme: t, mood, title }: { theme: Theme; mood: SceneMood; title: string }) {
  const outcome = mood === 'win' || mood === 'loss' ? mood : 'jackpot';
  const verdict =
    outcome === 'win'
      ? { bg: t.win, ink: t.winInk }
      : outcome === 'loss'
        ? { bg: t.loss, ink: t.lossInk }
        : (t.jackpotBadge ?? { bg: t.button.face, ink: t.button.ink });
  const { ResultFlourish } = kitFor(t);
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View
        style={{
          paddingHorizontal: 16,
          paddingVertical: 9,
          borderRadius: 999,
          backgroundColor: verdict.bg,
          opacity: 0,
          animationName: BADGE[outcome],
          animationDuration: outcome === 'loss' ? '800ms' : '780ms',
          animationTimingFunction: 'ease-out',
          animationFillMode: 'both',
        }}
      >
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          style={{ color: verdict.ink, fontFamily: sans(800), fontSize: 15, letterSpacing: 15 * 0.12, maxWidth: 320 }}
        >
          {title.toUpperCase()}
        </Text>
        {/* Zs drift off a snooze, alarm marks ring either side of a late one */}
        {t.flourish && outcome === 'win' && <Zzz color={t.flourish.zzz} />}
        {t.flourish && outcome === 'loss' && <RingMarks color={t.flourish.ring} />}
        {/* Some themes' mascots react beside it */}
        {ResultFlourish && (
          <View pointerEvents="none" style={{ position: 'absolute', right: '100%', top: '50%', marginTop: -28, width: 56, height: 56, marginRight: 4, alignItems: 'center', justifyContent: 'center' }}>
            <ResultFlourish mood={mood} />
          </View>
        )}
      </Animated.View>
    </View>
  );
}

/** Three Zs drifting up and away: someone's back asleep. */
function Zzz({ color }: { color: string }) {
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: '100%', top: '50%', marginLeft: 6 }}>
      {[0, 1, 2].map((i) => (
        <Animated.View
          key={i}
          style={{
            position: 'absolute',
            left: i * 10,
            bottom: i * 10,
            opacity: 0,
            ...loop(KF.zzz, 2.7, { delay: i * 0.9, ease: 'ease-out' }),
          }}
        >
          <Text style={{ fontSize: 14 + i * 6, fontFamily: sans(800), color }}>z</Text>
        </Animated.View>
      ))}
    </View>
  );
}

/** Classic alarm-clock ringing marks: little arcs that pulse out on either side. */
function RingMarks({ color }: { color: string }) {
  const side = (flip: boolean) => (
    <View style={{ width: 20, height: 32, transform: flip ? [{ scaleX: -1 }] : undefined }}>
      {[0, 1].map((i) => (
        <Animated.View
          key={i}
          style={[{ position: 'absolute', inset: 0, opacity: 0 }, loop(KF.ringMark, 0.6, { delay: i * 0.12, ease: 'ease-out' })]}
        >
          <Svg width={20} height={32} viewBox="0 0 24 40">
            <Path d={i === 0 ? 'M6 10 Q12 20 6 30' : 'M14 4 Q24 20 14 36'} fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" />
          </Svg>
        </Animated.View>
      ))}
    </View>
  );
  return (
    <View
      pointerEvents="none"
      style={{ position: 'absolute', left: -32, right: -32, top: '50%', marginTop: -16, flexDirection: 'row', justifyContent: 'space-between' }}
    >
      {side(true)}
      {side(false)}
    </View>
  );
}

/** Tinted in its own text colour, so it suits any theme background. */
export function PillButton({ onPress, ink, children, label }: { onPress: () => void; ink: string; children: ReactNode; label?: string }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} hitSlop={6}>
      {({ pressed }) => (
        <View
          style={{
            borderRadius: 999,
            paddingHorizontal: 16,
            paddingVertical: 9,
            backgroundColor: cssA(hexRGB(ink), pressed ? 0.2 : 0.1),
            transform: [{ scale: pressed ? 0.94 : 1 }],
          }}
        >
          <Text style={{ color: ink, fontFamily: sans(600), fontSize: 14 }}>{children}</Text>
        </View>
      )}
    </Pressable>
  );
}
