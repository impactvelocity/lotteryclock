"use client";

import type { CSSProperties } from "react";

/* Small result flourishes, shared by every theme that sets `flourish` colours. */

/** Three Zs drifting up and away: someone's back asleep. */
export function Zzz({
  color,
  className,
  style,
}: {
  color: string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute ${className ?? ""}`}
      style={style}
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="absolute font-extrabold leading-none"
          style={{
            left: i * 10,
            bottom: i * 10,
            fontSize: 14 + i * 6,
            color,
            opacity: 0,
            animation: `lc-zzz 2.7s ease-out ${(i * 0.9).toFixed(1)}s infinite`,
          }}
        >
          z
        </span>
      ))}
    </div>
  );
}

/** Classic alarm-clock ringing marks: little arcs that pulse out on either side. */
export function RingMarks({
  color,
  className,
}: {
  color: string;
  className?: string;
}) {
  const side = (flip: boolean) => (
    <svg
      viewBox="0 0 24 40"
      className="h-8 w-5"
      fill="none"
      stroke={color}
      strokeWidth={3}
      strokeLinecap="round"
      style={{
        transform: flip ? "scaleX(-1)" : undefined,
        overflow: "visible",
      }}
    >
      {[0, 1].map((i) => (
        <path
          key={i}
          d={i === 0 ? "M6 10 Q12 20 6 30" : "M14 4 Q24 20 14 36"}
          style={{
            animation: `lc-ring-mark 0.6s ease-out ${i * 0.12}s infinite`,
          }}
        />
      ))}
    </svg>
  );
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute flex items-center justify-between ${className ?? ""}`}
    >
      {side(true)}
      {side(false)}
    </div>
  );
}
