import { MAKER_LINKS, MAKER_NAME, MAKER_SITE } from "@/components/maker";
import { Graveyard, GROUND, NightSky } from "@/components/sections/graveyard";
import { GitHubIcon, REPO_URL } from "@/components/sections/mobile-app";

const KIROWEEN_URL = "https://kiroween.devpost.com/";

const linkClass =
  "text-white/80 underline underline-offset-4 decoration-white/25 transition-colors hover:text-white hover:decoration-white";

export function SiteFooter() {
  return (
    <footer
      className="relative isolate overflow-hidden text-white"
      style={{ background: GROUND }}
    >
      <NightSky />
      <div className="mx-auto max-w-6xl px-6 pt-24 pb-14 sm:px-10 sm:pt-32 sm:pb-24">
        {/* The hackathon line: a headline in the night sky and a simple link to the entry */}
        <div className="text-center">
          <h2 className="mx-auto max-w-3xl text-4xl leading-[1.2] font-extrabold tracking-tight text-balance sm:text-5xl sm:leading-[1.15]">
            A dead idea from 2012, brought back to life
          </h2>
          <p className="mt-5 text-lg text-white/70">
            Built for the{" "}
            <a
              href={KIROWEEN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[#FF9A4D] underline decoration-[#FF9A4D]/40 underline-offset-4 transition-colors hover:decoration-[#FF9A4D]"
            >
              Kiroween hackathon
            </a>
            , Resurrection track.
          </p>
        </div>
      </div>

      <Graveyard />

      {/* The ground the graveyard stands on, over the sky */}
      <div className="px-6 pb-10 sm:px-10" style={{ background: GROUND }}>
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
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
      </div>
    </footer>
  );
}
