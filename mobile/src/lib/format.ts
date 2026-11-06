export const fmtTime = (ms: number) =>
  new Date(ms).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

export const fmtTimeSeconds = (ms: number) =>
  new Date(ms).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit' });

export const fmtDate = (ms: number) =>
  new Date(ms).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });

export const fmtWeekdayLetter = (ms: number) =>
  new Date(ms).toLocaleDateString([], { weekday: 'narrow' });

/** "+14", "-7", "0" */
export const fmtPoints = (n: number) => (n > 0 ? `+${n}` : n < 0 ? `−${Math.abs(n)}` : '0');

/** "8h 12m", "12m", "<1m" */
export function fmtCountdown(ms: number): string {
  const totalMin = Math.floor(Math.max(0, ms) / 60_000);
  if (totalMin < 1) return '<1m';
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return h ? `${h}h ${m}m` : `${m}m`;
}

/** Split a time into display parts: { hh: "7", mm: "30", ampm: "AM" } (ampm empty for 24h locales). */
export function timeParts(hour: number, minute: number) {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  const parts = new Intl.DateTimeFormat([], { hour: 'numeric', minute: '2-digit' }).formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
  return { hh: get('hour'), mm: get('minute'), ampm: get('dayPeriod') };
}
