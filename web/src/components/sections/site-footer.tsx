import { KiroGhost } from "@/components/kiro-ghost";
import { MAKER_LINKS, MAKER_NAME, MAKER_SITE } from "@/components/maker";
import { GitHubIcon, REPO_URL } from "@/components/sections/mobile-app";

const KIROWEEN_URL = "https://kiroween.devpost.com/";

const linkClass =
  "text-white/80 underline underline-offset-4 decoration-white/25 transition-colors hover:text-white hover:decoration-white";

export function SiteFooter() {
  return (
    <footer className="bg-[#2a1530] px-6 pt-16 pb-10 text-white sm:px-10">
      <div className="mx-auto max-w-6xl">
        {/* Hackathon banner, with the Kiro ghost bobbing in a glassy tile */}
        <a
          href={KIROWEEN_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative isolate flex flex-col gap-6 overflow-hidden rounded-3xl bg-[linear-gradient(115deg,#FFC03D,#FF6B35_45%,#FF2E4D)] p-6 text-[#2a1530] shadow-[inset_0_1px_0_rgba(255,255,255,0.4),inset_0_-2px_0_rgba(42,21,48,0.12),0_0_0_1px_rgba(255,255,255,0.06),0_28px_60px_-24px_rgba(255,107,53,0.7)] ring-1 ring-white/20 ring-inset transition-shadow duration-300 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.45),inset_0_-2px_0_rgba(42,21,48,0.12),0_0_0_1px_rgba(255,255,255,0.08),0_28px_60px_-24px_rgba(255,107,53,0.85)] sm:flex-row sm:items-center sm:justify-between sm:p-8"
        >
          {/* Gloss on the top half, and a shine that sweeps across on hover */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-1/2 bg-gradient-to-b from-white/15 to-transparent"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute -inset-y-6 left-0 -z-10 w-1/4 -translate-x-[150%] skew-x-[-20deg] bg-white/15 blur-lg transition-transform duration-700 ease-out group-hover:translate-x-[500%]"
          />

          <span className="flex items-center gap-5">
            <span
              aria-hidden
              className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_8px_18px_-8px_rgba(42,21,48,0.45)] ring-1 ring-white/35 backdrop-blur-sm"
            >
              <KiroGhost className="h-10 w-auto text-white drop-shadow-[0_4px_6px_rgba(42,21,48,0.35)] motion-safe:animate-[lc-ghost-bob_2.4s_ease-in-out_infinite]" />
            </span>
            <span>
              <span className="block font-mono text-xs font-semibold tracking-[0.18em] text-[#2a1530]/70 uppercase">
                Kiroween hackathon · Resurrection track
              </span>
              <span className="mt-1 block text-xl font-extrabold tracking-tight sm:text-2xl">
                A dead idea from 2012, brought back to life.
              </span>
            </span>
          </span>
          <span className="inline-flex shrink-0 items-center gap-2 self-start rounded-full bg-[#2a1530] px-5 py-3 font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_10px_20px_-10px_rgba(42,21,48,0.8)] ring-1 ring-white/10 transition-colors group-hover:bg-black sm:self-auto">
            View on Devpost
            <span aria-hidden>→</span>
          </span>
        </a>

        <div className="mt-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <a
              href="#"
              className="flex items-center gap-2 text-xl font-bold tracking-tight"
            >
              <svg
                aria-hidden
                viewBox="0 0 15 15"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.6}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="7.5" cy="7.5" r="6.2" />
                <path d="M7.5 4.4V7.5L9.5 9.5" />
              </svg>
              LotteryClock
            </a>
            <p className="mt-2 text-sm text-white/60">
              Built with{" "}
              <a
                href="https://kiro.dev"
                target="_blank"
                rel="noopener noreferrer"
                className={linkClass}
              >
                Kiro IDE
              </a>{" "}
              and{" "}
              <a
                href="https://www.anthropic.com/claude/opus"
                target="_blank"
                rel="noopener noreferrer"
                className={linkClass}
              >
                Claude Opus
              </a>
              .
            </p>
          </div>

          {/* Source code, then my own links */}
          <div className="flex gap-2">
            {[
              {
                id: "github-repo",
                href: REPO_URL,
                label: "Source on GitHub",
                icon: <GitHubIcon className="h-4 w-4" />,
              },
              ...MAKER_LINKS.filter((l) => l.id === "linkedin"),
            ].map((l) => (
              <a
                key={l.id}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={l.label}
                title={l.label}
                className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
              >
                {l.icon}
              </a>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-white/45 sm:flex-row sm:justify-between">
          <span>
            © 2026{" "}
            <a
              href={MAKER_SITE}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white hover:underline"
            >
              {MAKER_NAME}
            </a>
            . Started in 2012, finished in 2026.
          </span>
          <span>No real money is gambled. Only minutes of sleep.</span>
        </div>
      </div>
    </footer>
  );
}
