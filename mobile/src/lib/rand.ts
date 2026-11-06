/**
 * Deterministic pseudo-random in [0, 1) from integers only, so server and
 * browser always agree (Math.sin-based hashes can differ in the last bits).
 */
export function frac(i: number, salt: number) {
  let x = Math.imul((i * 1013 + salt) ^ 0x9e3779b9, 0x85ebca6b);
  x ^= x >>> 13;
  x = Math.imul(x, 0xc2b2ae35);
  x ^= x >>> 16;
  return Math.round(((x >>> 0) / 4294967296) * 1e4) / 1e4;
}
