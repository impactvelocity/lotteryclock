/**
 * Tiny persisted app store (AsyncStorage + useSyncExternalStore).
 * Holds settings, the currently armed bet, and history (newest first).
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';

import type { AlarmPlan } from './lottery';
import type { HistoryEntry } from './points';

const STORAGE_KEY = 'lotteryclock/v1';

export type Settings = {
  wakeHour: number;
  wakeMinute: number;
  /** Default bet in minutes. */
  riskMinutes: number;
  /** Play a different sound per outcome (spoils the reveal). */
  outcomeSounds: boolean;
  haptics: boolean;
  /** Show the hidden ring time on the armed ticket. Developer option. */
  showDebug: boolean;
  /** The chosen theme's id (see src/themes/themes.ts). */
  themeId: string;
  /** Sound effects in the app (the alarm itself always rings). */
  sound: boolean;
};

export type ArmedBet = {
  alarmId: string;
  plan: AlarmPlan;
  placedAtMs: number;
  /** Which alarm system rings it. */
  kind?: 'alarmkit' | 'notification';
};

export type AppState = {
  hydrated: boolean;
  settings: Settings;
  armed: ArmedBet | null;
  history: HistoryEntry[];
};

const DEFAULT_SETTINGS: Settings = {
  wakeHour: 7,
  wakeMinute: 30,
  riskMinutes: 10,
  outcomeSounds: false,
  haptics: true,
  showDebug: false,
  themeId: 'classic',
  sound: true,
};

let state: AppState = {
  hydrated: false,
  settings: DEFAULT_SETTINGS,
  armed: null,
  history: [],
};

const listeners = new Set<() => void>();

function setState(patch: Partial<AppState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
  if (state.hydrated) {
    const { settings, armed, history } = state;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ settings, armed, history })).catch((e) =>
      console.warn('[store] persist failed', e),
    );
  }
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
const getSnapshot = () => state;

export function useAppState(): AppState {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export const getState = () => state;

let hydrating: Promise<void> | null = null;
export function hydrate(): Promise<void> {
  hydrating ??= (async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const saved = raw ? (JSON.parse(raw) as Partial<AppState>) : {};
      setState({
        hydrated: true,
        settings: { ...DEFAULT_SETTINGS, ...saved.settings },
        armed: saved.armed ?? null,
        history: saved.history ?? [],
      });
    } catch (e) {
      console.warn('[store] hydrate failed', e);
      setState({ hydrated: true });
    }
  })();
  return hydrating;
}

export const actions = {
  updateSettings(patch: Partial<Settings>) {
    setState({ settings: { ...state.settings, ...patch } });
  },
  arm(bet: ArmedBet) {
    setState({ armed: bet });
  },
  disarm() {
    setState({ armed: null });
  },
  /** Record a finished morning and clear the armed bet. */
  settle(entry: HistoryEntry) {
    setState({ history: [entry, ...state.history], armed: null });
  },
  setHistory(history: HistoryEntry[]) {
    setState({ history });
  },
};
