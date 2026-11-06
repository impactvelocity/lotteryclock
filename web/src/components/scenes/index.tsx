"use client";

import { CafeRoll, MokaVerdict } from "@/components/scenes/cafe-art";
import { CafeSaucer, CafeScene } from "@/components/scenes/cafe-scene";
import {
  CalaveraDance,
  CalaveraVerdict,
  MarigoldBloom,
  MuertosScene,
} from "@/components/scenes/muertos-scene";
import { BitVerdict, DigitalRoll } from "@/components/scenes/digital-art";
import { DigitalScene, PixelHalo } from "@/components/scenes/digital-scene";
import {
  EightBall,
  EightBallRoll,
  EightBallScene,
  EightBallVerdict,
} from "@/components/scenes/eightball-scene";
import { CountingSheep } from "@/components/scenes/night-art";
import { MoonHalo, NightScene } from "@/components/scenes/night-scene";
import { FilmFX, OuijaRoll, OuijaScene, SpiritRing } from "@/components/scenes/ouija-scene";
import { PokerRoll, PokerScene, PotLight } from "@/components/scenes/poker-scene";
import { SunRays, SunRoll, SunriseScene, SunVerdict } from "@/components/scenes/sunrise-scene";
import { FortuneWheel, TarotRoll, TarotScene } from "@/components/scenes/tarot-scene";
import type { SceneMood } from "@/components/scenes/types";
import { WheelRoll } from "@/components/scenes/wheel-art";
import { WheelBurst, WheelScene } from "@/components/scenes/wheel-scene";
import type { Theme } from "@/lib/themes";

export type { SceneMood };

/** The theme's background scene (sky, creatures, horizon), drawn behind everything. */
export function ThemeScene({
  theme,
  p,
  tier,
  mood,
}: {
  theme: Theme;
  p: number;
  tier: number;
  mood: SceneMood;
}) {
  if (theme.decor === "sun")
    return <SunriseScene p={p} tier={tier} mood={mood} />;
  if (theme.decor === "night")
    return <NightScene p={p} tier={tier} mood={mood} />;
  if (theme.decor === "muertos")
    return <MuertosScene p={p} tier={tier} mood={mood} />;
  if (theme.decor === "ouija")
    return <OuijaScene p={p} tier={tier} mood={mood} />;
  if (theme.decor === "wheel")
    return <WheelScene p={p} tier={tier} mood={mood} />;
  if (theme.decor === "poker")
    return <PokerScene p={p} tier={tier} mood={mood} />;
  if (theme.decor === "tarot")
    return <TarotScene p={p} tier={tier} mood={mood} />;
  if (theme.decor === "digital")
    return <DigitalScene p={p} tier={tier} mood={mood} />;
  if (theme.decor === "eightball")
    return <EightBallScene p={p} tier={tier} mood={mood} />;
  if (theme.decor === "cafe")
    return <CafeScene p={p} tier={tier} mood={mood} />;
  return null;
}

/** Effects laid over the whole hero, above the text (Ouija: old-film grain, dust and flicker). */
export function ThemeOverlay({ theme }: { theme: Theme }) {
  if (theme.decor === "ouija") return <FilmFX />;
  return null;
}

/** A little scene shown above the progress bar while the draw rolls (Night: counting sheep). */
export function RollFlourish({ theme }: { theme: Theme }) {
  if (theme.decor === "night")
    return <CountingSheep ink={theme.ink} fence="#8C6BA6" />;
  if (theme.decor === "tarot") return <TarotRoll />;
  if (theme.decor === "wheel") return <WheelRoll />;
  if (theme.decor === "muertos") return <CalaveraDance />;
  if (theme.decor === "sun") return <SunRoll />;
  if (theme.decor === "poker") return <PokerRoll />;
  if (theme.decor === "ouija") return <OuijaRoll />;
  if (theme.decor === "digital") return <DigitalRoll />;
  if (theme.decor === "eightball") return <EightBallRoll />;
  if (theme.decor === "cafe") return <CafeRoll />;
  return null;
}

/**
 * A little reaction beside the result badge (Día de Muertos: the calavera dozes off, rises in
 * flames or bobs with the souls). Positioned by `className`, relative to the badge.
 */
export function ResultFlourish({
  theme,
  mood,
  className,
}: {
  theme: Theme;
  mood: SceneMood;
  className?: string;
}) {
  if (theme.decor === "muertos") return <CalaveraVerdict mood={mood} className={className} />;
  if (theme.decor === "sun") return <SunVerdict mood={mood} className={className} />;
  if (theme.decor === "digital") return <BitVerdict mood={mood} className={className} />;
  if (theme.decor === "eightball") return <EightBallVerdict mood={mood} className={className} />;
  if (theme.decor === "cafe") return <MokaVerdict mood={mood} className={className} />;
  return null;
}

/** The effect centred behind the dial (sun rays, moon halo, spirit ring), still behind every control. */
export function DialBackdrop(props: {
  theme: Theme;
  p: number;
  range: number;
  visible: boolean;
  size: number;
  /** For effects that react to the result (Tarot's jackpot wreath). */
  mood?: SceneMood;
}) {
  const { theme, mood, ...rest } = props;
  if (theme.decor === "tarot") return <FortuneWheel {...rest} mood={mood} />;
  if (theme.decor === "sun") return <SunRays {...rest} />;
  if (theme.decor === "night") return <MoonHalo {...rest} />;
  if (theme.decor === "muertos") return <MarigoldBloom {...rest} />;
  if (theme.decor === "ouija") return <SpiritRing {...rest} />;
  if (theme.decor === "wheel") return <WheelBurst {...rest} />;
  if (theme.decor === "poker") return <PotLight {...rest} mood={mood} />;
  if (theme.decor === "digital") return <PixelHalo {...rest} />;
  if (theme.decor === "eightball") return <EightBall {...rest} mood={mood} />;
  if (theme.decor === "cafe") return <CafeSaucer {...rest} mood={mood} />;
  return null;
}
