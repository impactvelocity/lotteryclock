/**
 * Sound effects: the web app's recordings (web/public/sfx), played with expo-audio.
 * A simpler cut of web/src/lib/sfx.ts: a latch when the alarm is set, beeps while the target
 * blinks, the theme's draw song (or the shared roll) during the draw, and a win / lose /
 * jackpot sting when it lands. `alarm` loops while the alarm rings with the app open.
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
