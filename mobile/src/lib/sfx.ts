/**
 * Sound effects: the web app's recordings (web/public/sfx), played with expo-audio.
 * A simpler cut of web/src/lib/sfx.ts: a latch when the alarm is set, beeps while the target
 * blinks, the theme's draw song (or the shared roll) during the draw, and a win / lose /
 * jackpot sting when it lands. `alarm` loops while the alarm rings with the app open.
 *
 * Also, like the website: each theme has a background song that plays while it's chosen (unless
 * the music button on Play turns it off) and fades out when the alarm is set.
 */
import { type AudioPlayer, createAudioPlayer, setAudioModeAsync } from 'expo-audio';

const FILES = {
  latch: require('../../assets/sfx/latch.mp3'),
  beep: require('../../assets/sfx/beep.mp3'),
  set: require('../../assets/sfx/set.mp3'),
  roll: require('../../assets/sfx/roll.mp3'),
  win: require('../../assets/sfx/win.mp3'),
  loss: require('../../assets/sfx/loss.mp3'),
  jackpot: require('../../assets/sfx/jackpot.mp3'),
  tier: require('../../assets/sfx/tier.mp3'),
  alarm: require('../../assets/sfx/alarm.mp3'),
} as const;

/** Themes with their own draw song: it plays from the blink right through the roll. */
const DRAW: Record<string, number> = {
  classic: require('../../assets/sfx/draw-classic.mp3'),
  night: require('../../assets/sfx/draw-night.mp3'),
  muertos: require('../../assets/sfx/draw-muertos.mp3'),
  ouija: require('../../assets/sfx/draw-ouija.mp3'),
  poker: require('../../assets/sfx/draw-poker.mp3'),
  tarot: require('../../assets/sfx/draw-tarot.mp3'),
  wheel: require('../../assets/sfx/draw-wheel.mp3'),
  digital: require('../../assets/sfx/draw-digital.mp3'),
};

/**
 * Each theme's background song: a seamless loop where the website has one, otherwise the
 * theme's own song (its draw song) on repeat.
 */
const SONGS: Record<string, number> = {
  ...DRAW,
  classic: require('../../assets/sfx/loop-classic.mp3'),
  muertos: require('../../assets/sfx/loop-muertos.mp3'),
};
/** The songs sit well under everything else, as on the website. */
const MUSIC_VOLUME = 0.45;
/** Seconds to fade a song in, or out when the theme changes. */
const MUSIC_FADE = 1.2;
/** Seconds to fade the song out when the alarm is set. */
const MUSIC_FADE_OUT = 1.6;

type Name = keyof typeof FILES;

let muted = false;
let ready = false;
const players = new Map<string, AudioPlayer>();
let drawPlayer: AudioPlayer | null = null;
let alarmPlayer: AudioPlayer | null = null;

function init() {
  if (ready) return;
  ready = true;
  // Plays even with the ring/silent switch on silent, like the website does in a browser tab
  setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
}

function player(key: string, source: number) {
  let p = players.get(key);
  if (!p) {
    p = createAudioPlayer(source);
    players.set(key, p);
  }
  return p;
}

function play(name: Name, volume = 1) {
  if (muted) return;
  init();
  const p = player(name, FILES[name]);
  p.volume = volume;
  p.seekTo(0).catch(() => {});
  p.play();
}

/** Volume fades in progress, per player, so a new fade replaces the old one. */
const fades = new Map<AudioPlayer, ReturnType<typeof setInterval>>();

/** Fade `p` to `to` over `seconds`; at silence, pause it. */
function fade(p: AudioPlayer, to: number, seconds: number) {
  clearInterval(fades.get(p));
  const from = p.volume;
  const steps = Math.max(1, Math.round(seconds * 30));
  let i = 0;
  fades.set(
    p,
    setInterval(() => {
      i++;
      p.volume = from + (to - from) * Math.min(1, i / steps);
      if (i < steps) return;
      clearInterval(fades.get(p));
      fades.delete(p);
      if (to === 0) p.pause();
    }, (seconds * 1000) / steps),
  );
}

/** The background song playing (or fading in), and its theme. */
let song: { theme: string; player: AudioPlayer } | null = null;

/** Start, change or stop the background song; null fades it out. */
function music(themeId: string | null, fadeOut = MUSIC_FADE) {
  const want = !muted && themeId && SONGS[themeId] ? themeId : null;
  if (song && song.theme === want) {
    // Same song: carry on (and pick up again if iOS paused it while the app was away)
    if (!song.player.playing) song.player.play();
    fade(song.player, MUSIC_VOLUME, MUSIC_FADE);
    return;
  }
  if (song) fade(song.player, 0, fadeOut);
  song = null;
  if (!want) return;
  init();
  const p = player(`song-${want}`, SONGS[want]);
  p.loop = true;
  p.volume = 0;
  p.seekTo(0).catch(() => {});
  p.play();
  fade(p, MUSIC_VOLUME, MUSIC_FADE);
  song = { theme: want, player: p };
}

function stopDraw() {
  drawPlayer?.pause();
  drawPlayer = null;
}

export const sfx = {
  setMuted(m: boolean) {
    muted = m;
    if (m) {
      stopDraw();
      sfx.stopAlarm();
      music(null, 0.3);
    }
  },
  /** Load the short sounds ahead of time, so the first press isn't silent. */
  preload() {
    init();
    (['latch', 'beep', 'win', 'loss', 'jackpot'] as Name[]).forEach((n) => player(n, FILES[n]));
  },
  latch: () => play('latch', 0.8),
  unlatch: () => play('latch', 0.5),
  beep: () => play('beep', 0.6),
  tier: () => play('tier', 0.35),
  /** The alarm is set ("Alarm set… or is it?"). */
  set: () => play('set', 0.8),
  /** The draw starts rolling: the theme's draw song, or the shared roll. */
  roll(themeId: string) {
    if (muted) return;
    init();
    stopDraw();
    const song = DRAW[themeId];
    if (song) {
      drawPlayer = player(`draw-${themeId}`, song);
      drawPlayer.volume = 0.8;
      // The song's opening covers the web's blink; start where its roll begins
      drawPlayer.seekTo(1.4).catch(() => {});
      drawPlayer.play();
      return;
    }
    play('roll');
  },
  /** The clock lands: early is a win, late a loss, on the dot the jackpot. */
  land(outcome: 'early' | 'late' | 'onTime') {
    stopDraw();
    play(outcome === 'early' ? 'win' : outcome === 'late' ? 'loss' : 'jackpot');
  },
  stopDraw,
  /**
   * The theme's background song: pass the theme while it should play (it carries on, or
   * crossfades to a new theme's song), or null to fade it out (the alarm was set).
   */
  music: (themeId: string | null) => music(themeId, themeId ? MUSIC_FADE : MUSIC_FADE_OUT),
  /** Rings in the app when the alarm goes off with it open. */
  startAlarm() {
    if (muted) return;
    init();
    alarmPlayer = player('alarm', FILES.alarm);
    alarmPlayer.loop = true;
    alarmPlayer.volume = 1;
    alarmPlayer.seekTo(0).catch(() => {});
    alarmPlayer.play();
  },
  stopAlarm() {
    alarmPlayer?.pause();
    alarmPlayer = null;
  },
};

