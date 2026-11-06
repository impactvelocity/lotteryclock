"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { chipStyle, SEE_THROUGH } from "@/components/theme-picker";
import type { Theme } from "@/lib/themes";

const spring = { type: "spring", stiffness: 500, damping: 32 } as const;

type Anchor = { top: number; right: number };

/** Just under the button, right edges lined up; null once the button is hidden (wider screens). */
function anchorFor(button: HTMLElement | null): Anchor | null {
  const r = button?.getBoundingClientRect();
  if (!r || !r.width) return null;
  return { top: r.bottom + 10, right: document.documentElement.clientWidth - r.right };
}

/**
 * The header's section links behind a menu button, for screens too narrow for the full nav.
 * Like the theme menu, the list is portalled to <body> (so the hero's overflow clipping can't cut
 * it off) and kept pinned under the button on scroll and resize.
 */
export function SectionMenu({
  theme: t,
  items,
  className = "",
}: {
  theme: Theme;
  items: { label: string; href: string }[];
  className?: string;
}) {
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const open = anchor !== null;
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    menuRef.current?.querySelector("a")?.focus({ preventScroll: true });
    const place = () => setAnchor(anchorFor(buttonRef.current));
    const onDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (!buttonRef.current?.contains(target) && !menuRef.current?.contains(target)) setAnchor(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setAnchor(null);
      buttonRef.current?.focus({ preventScroll: true });
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", place, { passive: true });
    window.addEventListener("resize", place);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", place);
      window.removeEventListener("resize", place);
    };
  }, [open]);

  return (
    <>
      <motion.button
        ref={buttonRef}
        type="button"
        onClick={() => setAnchor(open ? null : anchorFor(buttonRef.current))}
        whileTap={{ scale: 0.85 }}
        transition={spring}
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={open ? "Close menu" : "Menu"}
        className={`grid h-10 w-10 cursor-pointer place-items-center rounded-full ${open ? "bg-(--chip)" : SEE_THROUGH} ${className}`}
        style={chipStyle(t)}
      >
        {/* Three bars that fold into a cross */}
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          className="h-[18px] w-[18px]"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.2}
          strokeLinecap="round"
        >
          <motion.path
            initial={false}
            animate={{ d: open ? "M6 6L18 18" : "M4.5 7L19.5 7" }}
            transition={spring}
          />
          <motion.path
            d="M4.5 12L19.5 12"
            initial={false}
            animate={{ opacity: open ? 0 : 1, scaleX: open ? 0.2 : 1 }}
            transition={{ duration: 0.15 }}
            style={{ transformOrigin: "center" }}
          />
          <motion.path
            initial={false}
            animate={{ d: open ? "M6 18L18 6" : "M4.5 17L19.5 17" }}
            transition={spring}
          />
        </svg>
      </motion.button>

      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {anchor && (
              <motion.nav
                ref={menuRef}
                id={menuId}
                aria-label="Sections"
                // Tabbing out of the list closes it
                onBlur={(e) => {
                  const next = e.relatedTarget as Node | null;
                  if (next && !menuRef.current?.contains(next) && !buttonRef.current?.contains(next)) {
                    setAnchor(null);
                  }
                }}
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97, transition: { duration: 0.12 } }}
                transition={spring}
                className="fixed z-50 w-[min(18rem,calc(100vw-2rem))] origin-top-right rounded-3xl p-2 text-left"
                style={
                  {
                    top: anchor.top,
                    right: anchor.right,
                    background: t.sheet,
                    color: t.ink,
                    fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
                    boxShadow: "0 24px 60px rgba(0,0,0,0.25)",
                    "--focus": t.ink,
                  } as CSSProperties
                }
              >
                <ul>
                  {items.map((item, i) => (
                    <motion.li
                      key={item.href}
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ ...spring, delay: i * 0.03 }}
                    >
                      <a
                        href={item.href}
                        onClick={() => setAnchor(null)}
                        // Tinted from the text colour (the theme chip can match the sheet)
                        className="flex items-center gap-3 rounded-2xl px-4 py-3 text-base leading-snug font-semibold transition-colors hover:bg-current/[0.06] active:bg-current/10"
                      >
                        <span className="min-w-0 flex-1">{item.label}</span>
                        <svg
                          aria-hidden
                          viewBox="0 0 24 24"
                          className="h-4 w-4 shrink-0 opacity-50"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2.4}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M10 6l6 6-6 6" />
                        </svg>
                      </a>
                    </motion.li>
                  ))}
                </ul>
              </motion.nav>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}
