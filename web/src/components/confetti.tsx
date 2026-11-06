"use client";

import { motion } from "motion/react";

/** Deterministic pseudo-random in [0, 1) (render must stay pure), varied per burst via salt. */
function rand(i: number, salt: number) {
  let x = Math.imul((i * 7919 + salt * 104729) ^ 0x9e3779b9, 0x85ebca6b);
  x ^= x >>> 13;
  x = Math.imul(x, 0xc2b2ae35);
  x ^= x >>> 16;
  return (x >>> 0) / 4294967296;
}

type Props = {
  colors: string[];
  /** Where the burst starts, as Tailwind position classes on the (relative) parent. */
  origin?: string;
  /** Changes on every burst, so each one is different. */
  burstId: number;
  count?: number;
};

/**
 * A burst of confetti from a point on its (relative) parent (the centre by default): shoots up and
 * out, then falls and fades. Render it with a fresh `key` to fire again.
 */
export function Confetti({ colors, burstId, count = 44, origin = "top-1/2 left-1/2" }: Props) {
  return (
    <div aria-hidden className={`pointer-events-none absolute z-30 ${origin}`}>
      {Array.from({ length: count }, (_, i) => {
        const r = (k: number) => rand(i, burstId * 31 + k);
        const vx = (r(1) - 0.5) * 560;
        const up = -(200 + r(2) * 260);
        const fall = -40 + r(3) * 180;
        const w = 6 + r(4) * 5;
        const round = r(5) > 0.7;
        return (
          <motion.span
            key={i}
            className="absolute block"
            style={{
              width: w,
              height: round ? w : w * 1.7,
              marginLeft: -w / 2,
              borderRadius: round ? "50%" : 2,
              background: colors[i % colors.length],
            }}
            initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
            animate={{
              x: [0, vx * 0.7, vx],
              y: [0, up, fall],
              rotate: [0, (r(6) - 0.5) * 900],
              opacity: [1, 1, 0],
            }}
            transition={{
              duration: 1.5 + r(7) * 0.7,
              delay: r(8) * 0.1,
              times: [0, 0.32, 1],
              ease: ["easeOut", "easeIn"],
            }}
          />
        );
      })}
    </div>
  );
}
