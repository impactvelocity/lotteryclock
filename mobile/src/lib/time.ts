/** Times are minutes from midnight; anything outside 0..1439 wraps around the day. */

export function splitClock(totalMinutes: number) {
  const m = ((totalMinutes % 1440) + 1440) % 1440;
  const h24 = Math.floor(m / 60);
  return { h12: h24 % 12 === 0 ? 12 : h24 % 12, minute: m % 60, pm: h24 >= 12 };
}

export function formatClock(totalMinutes: number, withAmPm = true) {
  const { h12, minute, pm } = splitClock(totalMinutes);
  const time = `${h12}:${String(minute).padStart(2, "0")}`;
  return withAmPm ? `${time} ${pm ? "PM" : "AM"}` : time;
}

export function toMinutes(hour12: number, minute: number, pm: boolean) {
  return ((hour12 % 12) + (pm ? 12 : 0)) * 60 + minute;
}
