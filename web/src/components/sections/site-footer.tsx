import { KiroGhost } from "@/components/kiro-ghost";
import { MAKER_AVATAR, MAKER_LINKS, MAKER_NAME, MAKER_SITE } from "@/components/maker";
import { GitHubIcon, REPO_URL } from "@/components/sections/mobile-app";

const KIROWEEN_URL = "https://kiroween.devpost.com/";

const EXPLORE = [
  { label: "Demo video", href: "#demo" },
  { label: "The story", href: "#story" },
  { label: "Why would anyone want this?", href: "#why" },
  { label: "The iPhone app", href: "#app" },
];

const linkClass = "text-white/70 underline-offset-4 transition-colors hover:text-white hover:underline";

export function SiteFooter() {
  return (
    <footer className="bg-[#2a1530] px-6 pt-16 pb-10 text-white sm:px-10">
      <div className="mx-auto max-w-6xl">
        {/* Hackathon banner */}
        <a
          href={KIROWEEN_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex flex-col gap-4 rounded-3xl border border-white/10 bg-gradient-to-r from-[#3d1d44] to-[#2a1530] p-6 transition-colors hover:border-[#FF6B35]/60 sm:flex-row sm:items-center sm:justify-between sm:p-8"
        >
          <span className="flex items-center gap-4">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/10">
              <KiroGhost className="h-8 w-auto text-white" />
            </span>
            <span>
              <span className="block font-mono text-xs tracking-[0.18em] text-[#FFC03D] uppercase">
                Kiroween hackathon · Resurrection track
              </span>
              <span className="mt-1 block text-xl font-bold sm:text-2xl">
                A dead idea from 2012, brought back to life.
              </span>
            </span>
          </span>
          <span className="shrink-0 font-semibold text-white/80 group-hover:text-white">View on Devpost →</span>
        </a>

        <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          {/* Brand */}
          <div>
            <a href="#" className="flex items-center gap-2 text-xl font-bold tracking-tight">
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
            <p className="mt-3 max-w-xs text-sm text-white/60">
              The alarm clock you can&apos;t quite trust. Early? Snooze. Late? Get up.
            </p>
          </div>

          <FooterColumn title="Explore">
            {EXPLORE.map((l) => (
              <li key={l.href}>
                <a href={l.href} className={linkClass}>
                  {l.label}
                </a>
              </li>
            ))}
          </FooterColumn>

          <FooterColumn title="Built with">
            <li>
              <a href="https://www.anthropic.com/claude/opus" target="_blank" rel="noopener noreferrer" className={linkClass}>
                Claude Opus
              </a>
            </li>
            <li>
              <a href="https://kiro.dev" target="_blank" rel="noopener noreferrer" className={linkClass}>
                Kiro IDE
              </a>
            </li>
            <li>
              <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className={`${linkClass} inline-flex items-center gap-1.5`}>
                <GitHubIcon className="h-3.5 w-3.5" />
                Source on GitHub
              </a>
            </li>
          </FooterColumn>

          <FooterColumn title="About me">
            <li className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element -- small avatar */}
              <img src={MAKER_AVATAR} alt="" width={40} height={40} className="h-10 w-10 rounded-full object-cover" />
              <span>
                <a href={MAKER_SITE} target="_blank" rel="noopener noreferrer" className="font-semibold hover:underline">
                  {MAKER_NAME}
                </a>
                <span className="block text-xs text-white/55">Recovering snoozer</span>
              </span>
            </li>
            <li className="flex gap-2 pt-1">
              {MAKER_LINKS.map((l) => (
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
            </li>
          </FooterColumn>
        </div>

        <div className="mt-14 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-white/45 sm:flex-row sm:justify-between">
          <span>© 2026 {MAKER_NAME}. Started in 2012, finished in 2026.</span>
          <span>No real money is gambled. Only minutes of sleep.</span>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-mono text-xs font-semibold tracking-[0.18em] text-white/45 uppercase">{title}</h3>
      <ul className="mt-4 space-y-2.5 text-sm">{children}</ul>
    </div>
  );
}
