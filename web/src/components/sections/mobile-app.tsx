import { SectionHeading } from "@/components/sections/section-heading";

export const REPO_URL = "https://github.com/impactvelocity/lotteryclock";
const MOBILE_URL = `${REPO_URL}/tree/main/mobile`;

/** Colours from the mobile app (mobile/src/theme.ts), so the mock matches the real thing. */
const M = {
  bg: "#0B0816",
  bgTop: "#1C1038",
  card: "#17112A",
  border: "#342958",
  fg: "#F5F0FF",
  muted: "#A79FC4",
  gold: "#FFC93C",
  goldDeep: "#FF9F1C",
  neon: "#FF3D9A",
  win: "#34E39A",
};
const CHIPS: [number, string][] = [
  [5, "#E63946"],
  [10, "#3A86FF"],
  [15, "#2BB673"],
  [20, "#9B5DE5"],
  [30, "#FF8C42"],
  [45, "#1F1A2E"],
];

const FEATURES = [
  { title: "Play", body: "Your target time on slot-machine reels, and casino chips for how much doubt you'll accept: ±5 to ±45 minutes." },
  { title: "Reveal", body: "When it rings, three reels spin to the verdict. Early gets Snooze. Late gets “I'm up!” and a 60-second hustle timer." },
  { title: "History", body: "Bankroll, minutes won, win rate and streaks, plus a chart of your last 14 mornings." },
  { title: "Scoring", body: "Chips reward getting up fast when you're late, and punish snoozing past your target. Every bet size is winnable if you hustle." },
];

export function MobileApp() {
  return (
    <section
      id="app"
      className="relative scroll-mt-6 overflow-hidden px-6 py-24 text-white sm:px-10"
      style={{ background: `radial-gradient(ellipse at 75% 20%, ${M.bgTop} 0%, ${M.bg} 60%)` }}
    >
      <div className="mx-auto grid max-w-6xl items-center gap-16 lg:grid-cols-[1fr_auto]">
        <div>
          <SectionHeading
            tone="dark"
            align="left"
            title="Bonus: the alarm that actually wakes you up"
          >
            The website is the toy. A real alarm has to live on your phone, so alongside it I started a React Native app
            with Expo. Same idea, more casino.
          </SectionHeading>

          <ul className="mt-10 grid gap-x-8 gap-y-6 sm:grid-cols-2">
            {FEATURES.map((f) => (
              <li key={f.title}>
                <h3 className="font-bold" style={{ color: M.gold }}>
                  {f.title}
                </h3>
                <p className="mt-1 text-[15px] leading-relaxed text-white/70">{f.body}</p>
              </li>
            ))}
          </ul>

          <p className="mt-10 max-w-xl rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/65">
            <strong className="font-semibold text-white">Status:</strong> alarms are mocked for now. The plan is AlarmKit
            on iOS 26 and AlarmManager on Android, so it rings through silent mode and Focus, and the snooze ends exactly
            at your target time.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href={MOBILE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full px-5 py-3 font-semibold text-[#2a1600] transition-transform hover:-translate-y-0.5"
              style={{ background: `linear-gradient(180deg, ${M.gold}, ${M.goldDeep})` }}
            >
              <GitHubIcon />
              View the app on GitHub
            </a>
            <span className="font-mono text-xs text-white/45">Expo SDK 58 · React Native · Expo Router</span>
          </div>
        </div>

        <IPhone />
      </div>
    </section>
  );
}

/** An iPhone frame with the app's Play screen drawn inside. */
function IPhone() {
  return (
    <div className="relative mx-auto w-[300px] shrink-0 lg:mr-6">
      <div
        aria-hidden
        className="absolute -inset-10 rounded-full opacity-50 blur-3xl"
        style={{ background: `radial-gradient(circle, ${M.neon}55, transparent 65%)` }}
      />
      <div
        role="img"
        aria-label="The LotteryClock iPhone app: target time 7:30 on slot reels, a ±15 minute bet, and a Set alarm button"
        className="relative aspect-[9/19.5] rounded-[3.2rem] bg-[#1d1d22] p-[10px] shadow-[0_0_0_2px_#3a3a42,0_40px_80px_-20px_rgba(0,0,0,0.8)]"
      >
        {/* Side buttons */}
        <span className="absolute top-[110px] -left-[3px] h-8 w-[3px] rounded-l bg-[#3a3a42]" />
        <span className="absolute top-[160px] -left-[3px] h-14 w-[3px] rounded-l bg-[#3a3a42]" />
        <span className="absolute top-[225px] -left-[3px] h-14 w-[3px] rounded-l bg-[#3a3a42]" />
        <span className="absolute top-[180px] -right-[3px] h-20 w-[3px] rounded-r bg-[#3a3a42]" />

        <div
          className="relative flex h-full flex-col overflow-hidden rounded-[2.6rem] px-4 text-[11px]"
          style={{ background: `linear-gradient(180deg, ${M.bgTop}, ${M.bg} 45%)`, color: M.fg }}
        >
          {/* Status bar + Dynamic Island */}
          <div className="relative flex h-11 shrink-0 items-center justify-between px-3 pt-1 text-[12px] font-semibold">
            <span>7:12</span>
            <span className="absolute top-2.5 left-1/2 h-[26px] w-[88px] -translate-x-1/2 rounded-full bg-black" />
            <span className="flex items-center gap-1">
              <svg viewBox="0 0 18 12" className="h-2.5 w-4" fill="currentColor" aria-hidden>
                <rect x="0" y="8" width="3" height="4" rx="1" />
                <rect x="5" y="5" width="3" height="7" rx="1" />
                <rect x="10" y="2.5" width="3" height="9.5" rx="1" />
                <rect x="15" y="0" width="3" height="12" rx="1" />
              </svg>
              <span className="inline-block h-[11px] w-[22px] rounded-[3px] border border-white/60 p-[1.5px]">
                <span className="block h-full w-3/4 rounded-[1.5px] bg-white" />
              </span>
            </span>
          </div>

          {/* Header */}
          <div className="mt-2 flex items-start justify-between">
            <div className="text-[22px] leading-[0.95] font-black tracking-tight uppercase">
              <div style={{ color: M.gold, textShadow: `0 0 12px ${M.goldDeep}` }}>Lottery</div>
              <div style={{ color: M.neon, textShadow: `0 0 12px ${M.neon}` }}>Clock</div>
            </div>
            <span
              className="mt-1 flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold"
              style={{ borderColor: M.border, background: M.card }}
            >
              🪙 +42
            </span>
          </div>

          {/* Target time on reels */}
          <Panel className="mt-4">
            <Label>Target time</Label>
            <div className="mt-2 flex items-center justify-center gap-1">
              <Reel>0</Reel>
              <Reel>7</Reel>
              <span className="mx-0.5 flex flex-col gap-1.5">
                <span className="h-1 w-1 rounded-full" style={{ background: M.muted }} />
                <span className="h-1 w-1 rounded-full" style={{ background: M.muted }} />
              </span>
              <Reel>3</Reel>
              <Reel>0</Reel>
              <span className="ml-1 self-end pb-1 text-[10px] font-bold" style={{ color: M.muted }}>
                AM
              </span>
            </div>
          </Panel>

          {/* Bet */}
          <Panel className="mt-3">
            <div className="flex items-center justify-between">
              <Label>Add some doubt</Label>
              <span className="text-[12px] font-black" style={{ color: M.gold }}>
                ±15 min
              </span>
            </div>
            <div className="mt-2.5 flex justify-between">
              {CHIPS.map(([n, c]) => (
                <span
                  key={n}
                  className="grid h-[30px] w-[30px] place-items-center rounded-full text-[10px] font-black"
                  style={{
                    background: c,
                    border: "2.5px dashed rgba(255,255,255,0.7)",
                    boxShadow: n === 15 ? `0 0 0 2px ${M.gold}, 0 0 12px ${M.gold}` : undefined,
                    transform: n === 15 ? "translateY(-3px)" : undefined,
                  }}
                >
                  {n}
                </span>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-3 gap-1">
              <Odd label="Window" value="7:15–7:45" />
              <Odd label="Max win" value="+15" color={M.win} />
              <Odd label="Jackpot 1/15" value="+30" color={M.gold} />
            </div>
          </Panel>

          <div
            className="mt-4 rounded-2xl py-3 text-center text-[14px] font-black tracking-wide text-[#2a1600] uppercase"
            style={{
              background: `linear-gradient(180deg, ${M.gold}, ${M.goldDeep})`,
              boxShadow: `0 0 18px ${M.goldDeep}88`,
            }}
          >
            Set alarm
          </div>
          <p className="mt-2 px-2 text-center text-[10px] leading-snug" style={{ color: M.muted }}>
            It rings somewhere in your window. Early? Snooze until your target. Late? Get up.
          </p>

          {/* Tab bar */}
          <div
            className="mt-auto mb-2 flex justify-around rounded-full border py-2 text-[9px] font-semibold"
            style={{ borderColor: M.border, background: `${M.card}cc` }}
          >
            <span style={{ color: M.gold }}>● Play</span>
            <span style={{ color: M.muted }}>History</span>
            <span style={{ color: M.muted }}>Settings</span>
          </div>
          <span className="mx-auto mb-2 h-1 w-24 shrink-0 rounded-full bg-white/70" />
        </div>
      </div>
    </div>
  );
}

function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border p-3 ${className}`} style={{ borderColor: M.border, background: M.card }}>
      {children}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[9px] font-bold tracking-[0.14em] uppercase" style={{ color: M.muted }}>
      {children}
    </span>
  );
}

function Reel({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="relative grid h-[52px] w-[38px] place-items-center overflow-hidden rounded-lg border-[1.5px] text-[28px] font-black"
      style={{
        borderColor: M.border,
        background: "linear-gradient(180deg,#0A0714,#2A2048 25%,#3A2D63 50%,#2A2048 75%,#0A0714)",
      }}
    >
      <span className="absolute inset-x-0 top-1/2 h-px" style={{ background: `${M.neon}66` }} />
      <span className="relative">{children}</span>
    </span>
  );
}

function Odd({ label, value, color = M.fg }: { label: string; value: string; color?: string }) {
  return (
    <div className="min-w-0">
      <div className="truncate text-[8px] tracking-wider uppercase" style={{ color: M.muted }}>
        {label}
      </div>
      <div className="mt-0.5 truncate text-[11px] font-bold" style={{ color }}>
        {value}
      </div>
    </div>
  );
}

export function GitHubIcon({ className = "h-[18px] w-[18px]" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}
