/** Rounded so server and browser trig agree (avoids hydration mismatches). */
const r2 = (n: number) => Math.round(n * 100) / 100;

/**
 * A scalloped circle: `n` round bumps around a circle of radius `r`, like a marigold's
 * outline or the petal ring on a sugar skull. `bulge` 1 makes each bump a half circle;
 * more pushes the bumps out further. `rot` turns it, in degrees.
 */
export function scallop(
  cx: number,
  cy: number,
  r: number,
  n: number,
  bulge = 1.02,
  rot = 0,
): string {
  const pts = Array.from({ length: n }, (_, k) => {
    const a = ((rot + (k * 360) / n - 90) * Math.PI) / 180;
    return [r2(cx + r * Math.cos(a)), r2(cy + r * Math.sin(a))];
  });
  const bump = r2(r * Math.sin(Math.PI / n) * bulge);
  const [x0, y0] = pts[0];
  // Clockwise round the circle, each arc bulging outwards.
  const arcs = pts
    .map((_, k) => {
      const [x, y] = pts[(k + 1) % n];
      return `A${bump} ${bump} 0 0 1 ${x} ${y}`;
    })
    .join("");
  return `M${x0} ${y0}${arcs}Z`;
}
