"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { baseColor, type Theme } from "@/lib/themes";

/** A tiny dial: the theme's background, ring and disc. */
export function Swatch({ theme, size = 22 }: { theme: Theme; size?: number }) {
  const [a, b, c] = theme.arcStops;
  return (
    <span
      aria-hidden
      className="relative inline-flex shrink-0 rounded-full"
      style={{
        width: size,
        height: size,
        padding: Math.max(2, size * 0.12),
        background: baseColor(theme),
        boxShadow: "0 0 0 1px rgba(0,0,0,0.1)",
      }}
    >
      <span
        className="relative h-full w-full rounded-full"
        style={{ background: `conic-gradient(${a}, ${b} 30%, ${c} 62%, ${theme.track} 62%)` }}
      >
        <span className="absolute inset-[24%] rounded-full" style={{ background: theme.disc }} />
      </span>
    </span>
  );
}

type Props = {
  themes: Theme[];
  index: number;
  onSelect: (index: number) => void;
  /** Opens the share sheet for the current theme. */
  onShare: () => void;
};

const spring = { type: "spring", stiffness: 500, damping: 26 } as const;

/**
 * See-through backgrounds so the controls sit well as the hero background shifts
 * with the bet. Text and icons stay solid.
 */
/** Frosted glass: the background blurs through. */
export const SEE_THROUGH =
  "bg-(--chip)/50 backdrop-blur-sm transition-colors duration-200 hover:bg-(--chip)/75";

/**
 * A 1px see-through ring instead of a solid border, so whatever the background is doing
 * shows through the edge: black/6 on light themes, white/10 on dark ones. Plus a soft
 * shadow so the controls lift off the background.
 */
export const chipStyle = (t: Theme) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(t.ink.slice(i, i + 2), 16));
  const lightTheme = 0.299 * r + 0.587 * g + 0.114 * b < 128; // dark ink means a light theme
  const ring = lightTheme ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.1)";
  return {
    "--chip": t.chip,
    color: t.chipInk,
    boxShadow: `0 0 0 1px ${ring}, 0 1px 2px rgba(0,0,0,0.06), 0 6px 16px -4px rgba(0,0,0,0.14)`,
  } as CSSProperties;
};

export function ThemePicker({ themes, index, onSelect, onShare }: Props) {
  const t = themes[index];
  const n = themes.length;
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(index);
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listId = useId();

  // The menu is portalled to <body> (so the hero's overflow clipping can't cut it off) and
  // positioned fixed under the theme button; keep it pinned there on scroll and resize.
  const [anchor, setAnchor] = useState<{ top: number; left: number } | null>(null);
  const placeMenu = () => {
    const r = buttonRef.current?.getBoundingClientRect();
    if (r) setAnchor({ top: r.bottom + 12, left: r.left + r.width / 2 });
  };

  useEffect(() => {
    if (!open) return;
    listRef.current?.focus();
    const onDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (!rootRef.current?.contains(target) && !listRef.current?.contains(target)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    window.addEventListener("scroll", placeMenu, { passive: true });
    window.addEventListener("resize", placeMenu);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      window.removeEventListener("scroll", placeMenu);
      window.removeEventListener("resize", placeMenu);
    };
  }, [open]);

  const openMenu = () => {
    setActive(index);
    placeMenu();
    setOpen(true);
  };
  const close = () => {
    setOpen(false);
    buttonRef.current?.focus();
  };
  const choose = (i: number) => {
    if (i !== index) onSelect(i);
    close();
  };

  const onListKey = (e: KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        setActive((a) => (a + 1) % n);
        break;
      case "ArrowUp":
        setActive((a) => (a - 1 + n) % n);
        break;
      case "Home":
        setActive(0);
        break;
      case "End":
        setActive(n - 1);
        break;
      case "Enter":
      case " ":
        choose(active);
        break;
      case "Escape":
        close();
        break;
      case "Tab":
        setOpen(false);
        return;
      default:
        return;
    }
    e.preventDefault();
  };

  const stepButton = (dir: -1 | 1) => (
    <motion.button
      type="button"
      onClick={() => onSelect((index + dir + n) % n)}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.88, x: dir * 3 }}
      transition={spring}
      aria-label={dir < 0 ? "Previous theme" : "Next theme"}
      className={`grid h-10 w-10 shrink-0 sm:h-11 sm:w-11 cursor-pointer place-items-center rounded-full ${SEE_THROUGH}`}
      style={chipStyle(t)}
    >
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Nudged 1 unit towards the point: optically centred, since a chevron's point pulls the eye */}
        <path d={dir < 0 ? "M14 6l-6 6 6 6" : "M10 6l6 6-6 6"} />
      </svg>
    </motion.button>
  );

  return (
    <div ref={rootRef} className="relative flex items-center gap-1.5 sm:gap-2">
      {stepButton(-1)}

      <motion.button
        ref={buttonRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={`Theme: ${t.name}, ${index + 1} of ${n}`}
        onClick={() => (open ? close() : openMenu())}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            openMenu();
          }
        }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.96 }}
        transition={spring}
        className={`flex h-11 cursor-pointer items-center gap-2.5 rounded-full pr-4 pl-2 text-base font-semibold ${open ? "bg-(--chip)" : SEE_THROUGH}`}
        style={chipStyle(t)}
      >
        <Swatch theme={t} size={28} />
        <span className="relative h-6 w-[7.5rem] overflow-hidden text-left">
          <AnimatePresence initial={false} mode="popLayout">
            <motion.span
              key={t.id}
              className="absolute inset-0 truncate leading-6"
              initial={{ y: 18, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -18, opacity: 0 }}
              transition={spring}
            >
              {t.name}
            </motion.span>
          </AnimatePresence>
        </span>
        <span className="text-sm tabular-nums opacity-60 max-sm:hidden">
          {index + 1}/{n}
        </span>
        <motion.svg
          aria-hidden
          viewBox="0 0 24 24"
          className="h-4 w-4 opacity-70 max-sm:hidden"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.4}
          strokeLinecap="round"
          strokeLinejoin="round"
          animate={{ rotate: open ? 180 : 0 }}
          transition={spring}
        >
          <path d="M6 9l6 6 6-6" />
        </motion.svg>
      </motion.button>

      <motion.button
        type="button"
        onClick={onShare}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.88 }}
        transition={spring}
        aria-label={`Share the ${t.name} theme`}
        aria-haspopup="dialog"
        className={`grid h-10 w-10 shrink-0 sm:h-11 sm:w-11 cursor-pointer place-items-center rounded-full ${SEE_THROUGH}`}
        style={chipStyle(t)}
      >
        {/* Arrow rising out of a tray */}
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          className="h-[19px] w-[19px]"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.4}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 3.5v11M7.5 8 12 3.5 16.5 8" />
          <path d="M5 12.5v5.5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5.5" />
        </svg>
      </motion.button>

      {stepButton(1)}

      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {open && anchor && (
              <motion.ul
                ref={listRef}
                id={listId}
                role="listbox"
                tabIndex={-1}
                aria-label="Themes"
                aria-activedescendant={`${listId}-${active}`}
                onKeyDown={onListKey}
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97, transition: { duration: 0.12 } }}
                transition={spring}
                className="fixed z-50 w-[min(16rem,calc(100vw-2rem))] -translate-x-1/2 origin-top rounded-3xl p-2 text-left outline-none"
                style={{
                  top: anchor.top,
                  left: anchor.left,
                  background: t.sheet,
                  color: t.ink,
                  fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
                  boxShadow: "0 24px 60px rgba(0,0,0,0.25)",
                }}
              >
                {themes.map((theme, i) => {
                  const selected = i === index;
                  return (
                    <motion.li
                      key={theme.id}
                      id={`${listId}-${i}`}
                      role="option"
                      aria-selected={selected}
                      onClick={() => choose(i)}
                      onPointerEnter={() => setActive(i)}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ ...spring, delay: i * 0.025 }}
                      className="flex cursor-pointer items-center gap-3 rounded-2xl px-3 py-2.5"
                      style={{ background: i === active ? t.chip : "transparent" }}
                    >
                      <Swatch theme={theme} size={28} />
                      <span className="min-w-0 flex-1 truncate font-semibold">{theme.name}</span>
                      {selected && (
                        <svg
                          aria-hidden
                          viewBox="0 0 24 24"
                          className="h-5 w-5 shrink-0"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2.6}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M5 12.5l4.5 4.5L19 7.5" />
                        </svg>
                      )}
                    </motion.li>
                  );
                })}
              </motion.ul>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </div>
  );
}
