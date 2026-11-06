/**
 * Poker's cards, ported from web/src/components/scenes/poker-scene.tsx (PokerRoll) and
 * poker-art.tsx (the card back, drawn from art/poker/card-back.svg). Suits are drawn as paths
 * rather than text glyphs, so iOS never swaps in its emoji hearts.
 */
import { useState } from 'react';
import { Text, View } from 'react-native';
import Animated, { css, cubicBezier } from 'react-native-reanimated';
import Svg, { Circle, G, Path } from 'react-native-svg';

import { Art } from '@/scenes/art';
import { sans } from '@/themes/fonts';

export type Suit = '♠' | '♥' | '♦' | '♣';

export const SUIT_RED = '#C8262E';
export const SUIT_BLACK = '#1E1E24';

const suitColor = (s: Suit) => (s === '♥' || s === '♦' ? SUIT_RED : SUIT_BLACK);

/** A suit on a 24-unit grid, filling about 2..22 each way. */
export function SuitShape({ suit, fill }: { suit: Suit; fill: string }) {
  switch (suit) {
    case '♠':
      return (
        <Path
          d="M12 2C9.3 6.6 3.5 9.6 3.5 14.2a4.3 4.3 0 0 0 7.4 3L10 22h4l-0.9-4.8a4.3 4.3 0 0 0 7.4-3C20.5 9.6 14.7 6.6 12 2z"
          fill={fill}
        />
      );
    case '♥':
      return (
        <Path
          d="M12 21.5C9 18.6 2.5 14.5 2.5 8.6 2.5 5.5 4.8 3 7.7 3c1.9 0 3.4 1 4.3 2.6C12.9 4 14.4 3 16.3 3c2.9 0 5.2 2.5 5.2 5.6 0 5.9-6.5 10-9.5 12.9z"
          fill={fill}
        />
      );
    case '♦':
      return <Path d="M12 1.5l7.5 10.5L12 22.5 4.5 12z" fill={fill} />;
    case '♣':
      return (
        <G fill={fill}>
          <Circle cx={12} cy={7} r={4.6} />
          <Circle cx={7.2} cy={13.4} r={4.6} />
          <Circle cx={16.8} cy={13.4} r={4.6} />
          <Path d="M9 11.5h6L12 15z M12 12.5L10 21.5h4z" />
        </G>
      );
  }
}

/** A card's printed back (art/poker/card-back.svg) inside its cream border. */
function CardBack({ w, h, pad, radius }: { w: number; h: number; pad: number; radius: number }) {
  return (
    <View style={{ width: w, height: h, borderRadius: radius, backgroundColor: '#F8F3E8', padding: pad }}>
      <Art name="poker/card-back" width={w - pad * 2} height={h - pad * 2} />
    </View>
  );
}

/* ---------------- The draw: dealing the board ---------------- */

const RANKS = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2'];
const SUITS: Suit[] = ['♠', '♥', '♦', '♣'];

/** Five different cards off a fresh deck. */
function dealBoard() {
  const deck = RANKS.flatMap((r) => SUITS.map((s) => ({ rank: r, suit: s })));
  return Array.from({ length: 5 }, () => deck.splice(Math.floor(Math.random() * deck.length), 1)[0]);
}

const MINI_W = 22;
const MINI_H = 31;
const MINI_GAP = 4;
/** Room between the deck and the first card of the board. */
const DECK_GAP = 10;

/**
 * When each card is dealt and turned over, in seconds from the start of the draw: the flop
 * goes out in a burst and turns over in a ripple, then the turn, then the river, turned
 * slowest, landing as the progress bar fills.
 */
const STREETS = [
  { deal: 0, flip: 0.34 },
  { deal: 0.08, flip: 0.4 },
  { deal: 0.16, flip: 0.46 },
  { deal: 0.62, flip: 0.78 },
  { deal: 0.95, flip: 1.12 },
];

const leftOf = (i: number) => MINI_W + DECK_GAP + i * (MINI_W + MINI_GAP);

/** Each card slides off the deck, turning straight as it goes. */
const DEALS = STREETS.map((_, i) =>
  css.keyframes({
    '0%': { opacity: 0, transform: [{ translateX: -leftOf(i) }, { rotate: '-24deg' }] },
    // The web fades it in over the first 0.04 s of the 0.26 s slide
    '15%': { opacity: 1 },
    '100%': { opacity: 1, transform: [{ translateX: 0 }, { rotate: '0deg' }] },
  }),
);
const DEAL_EASE = cubicBezier(0.15, 0.8, 0.3, 1);

/** The turn over: the back swings away as the face swings round, each hidden once past edge on. */
const BACK_FLIP = css.keyframes({
  from: { transform: [{ perspective: 400 }, { rotateY: '0deg' }] },
  to: { transform: [{ perspective: 400 }, { rotateY: '180deg' }] },
});
const FACE_FLIP = css.keyframes({
  from: { transform: [{ perspective: 400 }, { rotateY: '-180deg' }] },
  to: { transform: [{ perspective: 400 }, { rotateY: '0deg' }] },
});

/** The river is slapped down: it hops as it turns. */
const HOP = css.keyframes({
  '0%, 100%': { transform: [{ translateY: 0 }] },
  '50%': { transform: [{ translateY: -8 }] },
});

function MiniFace({ rank, suit }: { rank: string; suit: Suit }) {
  const color = suitColor(suit);
  return (
    <View
      style={{
        flex: 1,
        borderRadius: 3,
        backgroundColor: '#FBF8F1',
        boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.12)',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text
        style={{
          color,
          fontFamily: sans(700),
          fontSize: 11,
          lineHeight: 12,
          letterSpacing: rank === '10' ? -0.66 : 0,
        }}
      >
        {rank}
      </Text>
      <Svg viewBox="0 0 24 24" width={10} height={10} style={{ marginTop: 1 }}>
        <SuitShape suit={suit} fill={color} />
      </Svg>
    </View>
  );
}

/**
 * Shown above the progress bar while the draw rolls ("Dealing the river"): the dealer's deck,
 * and the board dealt off it card by card (flop, turn, river), each one turning over.
 */
export function PokerRoll() {
  // A fresh board every draw (this remounts with each one)
  const [board] = useState(dealBoard);
  return (
    <View style={{ width: MINI_W * 6 + DECK_GAP + MINI_GAP * 4, height: MINI_H + 8, marginBottom: 12 }}>
      {/* The deck, its edges stepping down beneath it */}
      <View
        style={{
          position: 'absolute',
          left: 0,
          bottom: 0,
          borderRadius: 3,
          boxShadow: '0 1px 0 #D6CFC0, 0 2px 0 #E2DCCF, 0 3px 0 #C4BBA9, 0 6px 6px rgba(0,0,0,0.35)',
        }}
      >
        <CardBack w={MINI_W} h={MINI_H} pad={1.5} radius={3} />
      </View>
      {board.map((card, i) => {
        const river = i === 4;
        const { deal, flip } = STREETS[i];
        const flipS = river ? 0.36 : 0.26;
        const turn = (name: typeof BACK_FLIP) => ({
          animationName: name,
          animationDuration: `${flipS}s`,
          animationDelay: `${flip}s`,
          animationTimingFunction: 'ease-in-out' as const,
          animationFillMode: 'both' as const,
        });
        return (
          <Animated.View
            key={i}
            style={{
              position: 'absolute',
              bottom: 0,
              left: leftOf(i),
              width: MINI_W,
              height: MINI_H,
              opacity: 0,
              animationName: DEALS[i],
              animationDuration: '0.26s',
              animationDelay: `${deal}s`,
              animationTimingFunction: DEAL_EASE,
              animationFillMode: 'both',
            }}
          >
            <Animated.View
              style={[
                { flex: 1, borderRadius: 3, boxShadow: '0 3px 5px rgba(0,0,0,0.35)' },
                river && { animationName: HOP, animationDuration: '0.36s', animationDelay: `${flip}s`, animationTimingFunction: 'ease-out' },
              ]}
            >
              <Animated.View style={[{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden' }, turn(BACK_FLIP)]}>
                <CardBack w={MINI_W} h={MINI_H} pad={1.5} radius={3} />
              </Animated.View>
              <Animated.View style={[{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden' }, turn(FACE_FLIP)]}>
                <MiniFace rank={card.rank} suit={card.suit} />
              </Animated.View>
            </Animated.View>
          </Animated.View>
        );
      })}
    </View>
  );
}
