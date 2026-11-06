"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { sfx } from "@/lib/sfx";
import type { Theme } from "@/lib/themes";

type Props = {
  theme: Theme;
  hour: number;
  minute: number;
  pm: boolean;
  onChange: (next: { hour?: number; minute?: number; pm?: boolean }) => void;
  onClose: () => void;
};

const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));
const PERIODS = ["AM", "PM"];

/** Height of one wheel row, and how many rows show (odd, so one sits in the middle). */
const ROW = 44;
const VISIBLE = 5;
const PAD = ((VISIBLE - 1) / 2) * ROW;

/** A typical scroll-wheel time picker: hour, minute and AM/PM columns that snap to the middle row. */
export function TimePicker({ theme: t, hour, minute, pm, onChange, onClose }: Props) {
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // The page behind stays put while the wheels scroll
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const timeFont = { fontFamily: t.timeFont } as const;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="Close time picker"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
        style={{ background: t.scrim }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Set alarm time"
        className="relative w-full max-w-sm rounded-t-[36px] px-6 pt-6 pb-8 shadow-2xl sm:rounded-[36px]"
        style={{ background: t.sheet, color: t.ink }}
      >
        {/* Wheels, with a highlight band behind the middle row */}
        <div className="relative" style={{ height: ROW * VISIBLE }}>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 rounded-2xl"
            style={{ top: PAD, height: ROW, background: t.chip }}
          />
          <div className="relative flex h-full items-stretch justify-center gap-1" style={timeFont}>
            <Wheel
              label="Hour"
              items={HOURS}
              index={hour - 1}
              onChange={(i) => onChange({ hour: i + 1 })}
              ink={t.ink}
              align="flex-end"
              className="w-20"
            />
            <div className="flex items-center text-2xl font-bold" aria-hidden>
              :
            </div>
            <Wheel
              label="Minute"
              items={MINUTES}
              index={minute}
              onChange={(i) => onChange({ minute: i })}
              ink={t.ink}
              align="flex-start"
              className="w-20"
            />
            <Wheel
              label="AM or PM"
              items={PERIODS}
              index={pm ? 1 : 0}
              onChange={(i) => onChange({ pm: i === 1 })}
              ink={t.ink}
              align="center"
              className="ml-3 w-16"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-6 h-14 w-full cursor-pointer rounded-full text-[15px] font-bold tracking-wide"
          style={{
            fontFamily: "var(--font-geist-sans)",
            background: t.chipOn,
            color: t.chipOnInk,
          }}
        >
          DONE
        </button>
      </div>
    </div>
  );
}

function Wheel({
  label,
  items,
  index,
  onChange,
  ink,
  align,
  className = "",
}: {
  label: string;
  items: string[];
  index: number;
  onChange: (index: number) => void;
  ink: string;
  align: "flex-start" | "center" | "flex-end";
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const settle = useRef<ReturnType<typeof setTimeout>>(undefined);
  const live = useRef(index);
  const [scrollTop, setScrollTop] = useState(index * ROW);

  // Keep the wheel on the selected row when the value changes from outside (and on open).
  useEffect(() => {
    const el = ref.current;
    if (!el || Math.round(el.scrollTop / ROW) === index) return;
    el.scrollTo({ top: index * ROW, behavior: el.dataset.ready ? "smooth" : "instant" });
    el.dataset.ready = "1";
  }, [index]);

  useEffect(() => {
    if (ref.current) ref.current.dataset.ready = "1";
    return () => clearTimeout(settle.current);
  }, []);

  const onScroll = () => {
    const el = ref.current;
    if (!el) return;
    setScrollTop(el.scrollTop);
    const i = Math.max(0, Math.min(items.length - 1, Math.round(el.scrollTop / ROW)));
    if (i !== live.current) {
      live.current = i;
      sfx.tick(0.35);
    }
    // Commit once the wheel comes to rest on a row
    clearTimeout(settle.current);
    settle.current = setTimeout(() => {
      if (i !== index) onChange(i);
    }, 120);
  };

  // Mouse drag-to-scroll (touch and trackpads scroll natively). Snap is off while dragging,
  // then the wheel settles on the nearest row.
  const drag = useRef<{ y: number; top: number; moved: boolean } | null>(null);
  const [dragging, setDragging] = useState(false);
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || !ref.current) return;
    drag.current = { y: e.clientY, top: ref.current.scrollTop, moved: false };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || !ref.current) return;
    const dy = e.clientY - d.y;
    if (!d.moved) {
      // Only becomes a drag once it actually moves, so a plain tap still picks its row
      if (Math.abs(dy) <= 4) return;
      d.moved = true;
      ref.current.setPointerCapture(e.pointerId);
      setDragging(true);
    }
    ref.current.scrollTop = d.top - dy;
  };
  const onPointerUp = () => {
    const el = ref.current;
    if (!drag.current || !el) return;
    if (!drag.current.moved) {
      drag.current = null;
      return;
    }
    setDragging(false);
    const i = Math.max(0, Math.min(items.length - 1, Math.round(el.scrollTop / ROW)));
    el.scrollTo({ top: i * ROW, behavior: "smooth" });
    // Keep the flag a tick longer so the click that ends a drag doesn't also pick a row
    setTimeout(() => (drag.current = null), 0);
  };

  const step = (delta: number) => {
    const i = Math.max(0, Math.min(items.length - 1, index + delta));
    ref.current?.scrollTo({ top: i * ROW, behavior: "smooth" });
  };

  const onKeyDown = (e: KeyboardEvent) => {
    const keys: Record<string, number> = { ArrowUp: -1, ArrowDown: 1, PageUp: -5, PageDown: 5 };
    if (e.key in keys) {
      e.preventDefault();
      step(keys[e.key]);
    }
  };

  const fade = "linear-gradient(180deg, transparent, #000 30%, #000 70%, transparent)";

  return (
    <div
      ref={ref}
      role="spinbutton"
      tabIndex={0}
      aria-label={label}
      aria-valuenow={index}
      aria-valuetext={items[index]}
      onScroll={onScroll}
      onKeyDown={onKeyDown}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      className={`h-full overflow-y-auto overscroll-contain rounded-2xl outline-offset-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${dragging ? "cursor-grabbing" : "cursor-grab snap-y snap-mandatory"} ${className}`}
      style={{ paddingBlock: PAD, maskImage: fade, WebkitMaskImage: fade }}
    >
      {items.map((item, i) => {
        // Rows shrink and fade the further they sit from the middle
        const dist = Math.min(2.5, Math.abs(i * ROW - scrollTop) / ROW);
        return (
          <div
            key={item}
            onClick={() => {
              if (!drag.current?.moved) step(i - index);
            }}
            className="flex snap-center items-center px-3 text-2xl font-bold tabular-nums select-none"
            style={{
              height: ROW,
              color: ink,
              opacity: 1 - dist * 0.32,
              transform: `scale(${1 - dist * 0.08})`,
              justifyContent: align,
            }}
          >
            {item}
          </div>
        );
      })}
    </div>
  );
}
