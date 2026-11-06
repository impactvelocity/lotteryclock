/**
 * The draw's timing, shared by the Play screen and theme roll flourishes (ported from
 * web/src/components/alarm-reveal.tsx): a long fast scramble, then slowing like a reel.
 */
export const ROLL_DELAYS = [...Array<number>(16).fill(60), 60, 60, 65, 70, 80, 90, 105, 125, 150, 180, 220, 270, 330];
/** Total length of the roll, ms. */
export const ROLL_MS = ROLL_DELAYS.reduce((a, b) => a + b, 60);
/** How long the progress bar takes to fill (it starts once the previous status has faded). */
export const ROLL_BAR_MS = ROLL_MS - 250;
