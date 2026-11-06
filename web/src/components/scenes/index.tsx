"use client";

import { MarigoldBloom, MuertosScene } from "@/components/scenes/muertos-scene";
import { CountingSheep } from "@/components/scenes/night-art";
import { MoonHalo, NightScene } from "@/components/scenes/night-scene";
import { OuijaScene, SpiritRing } from "@/components/scenes/ouija-scene";
import { PokerScene, PotLight } from "@/components/scenes/poker-scene";
import { SunRays, SunriseScene } from "@/components/scenes/sunrise-scene";
import { FortuneWheel, TarotRoll, TarotScene } from "@/components/scenes/tarot-scene";
import type { SceneMood } from "@/components/scenes/types";
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
  return null;
}

/** A little scene shown above the progress bar while the draw rolls (Night: counting sheep). */
export function RollFlourish({ theme }: { theme: Theme }) {
  if (theme.decor === "night")
    return <CountingSheep ink={theme.ink} fence="#8C6BA6" />;
  if (theme.decor === "tarot") return <TarotRoll />;
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
  if (theme.decor === "poker") return <PotLight {...rest} />;
  return null;
}
