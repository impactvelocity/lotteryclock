"use client";

import { motion } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { KiroGhost } from "@/components/kiro-ghost";
import {
  LINE_ICON,
  MAKER_AVATAR,
  MAKER_LINKS,
  MAKER_NAME,
  MAKER_SITE,
  X_LOGO,
} from "@/components/maker";
import { Swatch } from "@/components/theme-picker";
import { sfx } from "@/lib/sfx";
import type { Theme } from "@/lib/themes";

const SANS = "var(--font-geist-sans), system-ui, sans-serif";
const spring = { type: "spring", stiffness: 500, damping: 32 } as const;

/** The page's address with this theme picked, so the link opens straight into it. */
export function themeLink(theme: Theme) {
  const url = new URL(window.location.href);
  url.hash = "";
  url.search = "";
  url.searchParams.set("theme", theme.id);
  return url.toString();
}

/** A sheet for sharing the page in the current theme: copy the link, or send it somewhere. */
export function ShareModal({
  theme: t,
  onClose,
}: {
  theme: Theme;
  onClose: () => void;
}) {
  const [link] = useState(() => themeLink(t));
  const [copied, setCopied] = useState(false);
  const [canShare] = useState(
    () => typeof navigator !== "undefined" && "share" in navigator,
  );
  const copyRef = useRef<HTMLButtonElement>(null);
  const text = `The alarm clock you can't quite trust, in ${t.name}`;

  useEffect(() => {
    // Focus moves in on open, and back to whatever opened it on close
    const opener = document.activeElement as HTMLElement | null;
    copyRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      opener?.focus();
    };
  }, [onClose]);

  useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(id);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      // Clipboard API blocked (some embedded browsers): copy from the selected field instead,
      // and if even that fails, leave the link selected so it can be copied by hand
      const field = document.getElementById(
        "lc-share-link",
      ) as HTMLInputElement | null;
      field?.select();
      if (!document.execCommand("copy")) return;
    }
    sfx.click();
    setCopied(true);
  };

  const nativeShare = async () => {
    try {
      await navigator.share({ title: "LotteryClock", text, url: link });
    } catch {
      // Dismissed: nothing to do
    }
  };

  const enc = encodeURIComponent;
  const targets: {
    label: string;
    href?: string;
    onClick?: () => void;
    icon: ReactNode;
  }[] = [
    {
      label: "Post on X",
      href: `https://x.com/intent/post?text=${enc(text)}&url=${enc(link)}`,
      icon: (
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="currentColor"
        >
          <path d={X_LOGO} />
        </svg>
      ),
    },
    {
      label: "Email",
      href: `mailto:?subject=${enc("LotteryClock")}&body=${enc(`${text}\n\n${link}`)}`,
      icon: (
        <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5" {...LINE_ICON}>
          <rect x="3" y="5" width="18" height="14" rx="2.5" />
          <path d="M3.5 6.5l8.5 6.5 8.5-6.5" />
        </svg>
      ),
    },
    ...(canShare
      ? [
          {
            label: "More",
            onClick: nativeShare,
            icon: (
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                className="h-5 w-5"
                {...LINE_ICON}
              >
                <circle cx="5.5" cy="12" r="1.4" />
                <circle cx="12" cy="12" r="1.4" />
                <circle cx="18.5" cy="12" r="1.4" />
              </svg>
            ),
          },
        ]
      : []),
  ];

  const tile = "bg-current/[0.06] transition-colors hover:bg-current/[0.12]";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6"
      style={{ fontFamily: SANS }}
    >
      <motion.button
        type="button"
        aria-label="Close share"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
        style={{ background: t.scrim }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="lc-share-title"
        className="relative w-full max-w-xl rounded-t-[36px] px-6 pt-7 pb-6 text-left shadow-2xl sm:rounded-[36px] sm:px-8 sm:pt-8 sm:pb-7"
        style={{ background: t.sheet, color: t.ink }}
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{
          opacity: 0,
          y: 16,
          scale: 0.98,
          transition: { duration: 0.15 },
        }}
        transition={spring}
      >
        <div className="flex items-start gap-4">
          <Swatch theme={t} size={48} />
          <div className="min-w-0 flex-1">
            <h2
              id="lc-share-title"
              className="text-xl leading-tight font-bold sm:text-2xl"
            >
              Share {t.name}
            </h2>
            <p className="mt-1 text-sm leading-snug opacity-70 sm:text-base">
              The link opens LotteryClock in this theme.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mt-1 -mr-2 grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-full transition-colors hover:bg-current/10"
          >
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.4}
              strokeLinecap="round"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        {/* The link, with its copy button */}
        {/* Tinted from the text colour (not the theme chip, which can match the sheet) */}
        <div className="mt-6 flex items-center gap-2 rounded-full bg-current/[0.06] p-1.5 pl-5">
          <input
            id="lc-share-link"
            readOnly
            value={link}
            aria-label="Share link"
            onFocus={(e) => e.currentTarget.select()}
            className="min-w-0 flex-1 truncate bg-transparent text-[15px] outline-none"
            style={{ color: t.ink }}
          />
          <button
            ref={copyRef}
            type="button"
            onClick={copy}
            className="h-11 shrink-0 cursor-pointer rounded-full px-6 text-sm font-bold"
            style={{ background: t.chipOn, color: t.chipOnInk }}
          >
            {copied ? "Copied!" : "Copy link"}
          </button>
        </div>

        {/* Elsewhere */}
        <div
          className={`mt-3 grid gap-2 ${targets.length === 3 ? "grid-cols-3" : "grid-cols-2"}`}
        >
          {targets.map((target) => {
            const cls = `flex h-12 cursor-pointer items-center justify-center gap-2 rounded-2xl text-sm font-semibold ${tile}`;
            const inner = (
              <>
                {target.icon}
                {target.label}
              </>
            );
            return target.href ? (
              <a
                key={target.label}
                href={target.href}
                target="_blank"
                rel="noopener noreferrer"
                className={cls}
              >
                {inner}
              </a>
            ) : (
              <button
                key={target.label}
                type="button"
                onClick={target.onClick}
                className={cls}
              >
                {inner}
              </button>
            );
          })}
        </div>

        {/* Who made it, and what for */}
        <div className="mt-7 flex flex-wrap items-center justify-between gap-x-6 gap-y-4 border-t border-current/10 pt-6">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element -- a 5KB avatar; no need for the image optimiser */}
            <img
              src={MAKER_AVATAR}
              alt=""
              width={44}
              height={44}
              className="h-11 w-11 shrink-0 rounded-full object-cover"
              style={{ boxShadow: "0 0 0 2px currentColor" }}
            />
            <div className="min-w-0">
              <div className="text-xs font-semibold tracking-wide uppercase opacity-60">
                Built by
              </div>
              <a
                href={MAKER_SITE}
                target="_blank"
                rel="noopener noreferrer"
                className="text-base leading-tight font-bold underline-offset-4 hover:underline"
              >
                {MAKER_NAME}
              </a>
            </div>
            <div className="ml-1 flex items-center gap-1.5">
              {MAKER_LINKS.filter((l) => l.id === "linkedin").map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={l.label}
                  title={l.label}
                  className={`grid h-9 w-9 place-items-center rounded-full ${tile}`}
                >
                  {l.icon}
                </a>
              ))}
            </div>
          </div>

          <a
            href="https://kiroween.devpost.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2.5"
          >
            <KiroGhost className="h-7 w-auto shrink-0" />
            <div>
              <div className="text-xs font-semibold tracking-wide uppercase opacity-60">
                Built for
              </div>
              <div className="text-base leading-tight font-bold underline-offset-4 group-hover:underline">
                Kiroween
              </div>
            </div>
          </a>
        </div>
      </motion.div>
    </div>
  );
}
