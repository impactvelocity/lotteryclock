import { SectionHeading } from "@/components/sections/section-heading";
import { DoubtArt, RingingArt, SnoozeArt, UpArt } from "@/components/sections/why-art";

/** The snooze habit as a four-panel strip, and where LotteryClock cuts in (the doubt panel). */
const LOOP = [
  { label: "Alarm rings", body: "Same sound, same time, every morning.", sfx: "BRRRING!", tilt: "-rotate-6", Art: RingingArt },
  { label: "Hand reaches", body: "Snooze before you're really awake. Pure habit.", sfx: "*slap*", tilt: "rotate-3", Art: SnoozeArt },
  {
    label: "Wait. Is it early?",
    body: "The alarm might be off by 20 minutes, either way.",
    sfx: "…huh?",
    tilt: "-rotate-3",
    Art: DoubtArt,
    interrupt: true,
  },
  { label: "You look, and you're up", body: "Checking the time means you're awake enough to decide.", sfx: "I'm up!", tilt: "rotate-6", Art: UpArt },
];

type Finding = {
  stat: string;
  title: string;
  body: string;
  source: string;
  href?: string;
};

const FINDINGS: Finding[] = [
  {
    stat: "69%",
    title: "Most of us snooze",
    body: "69% of 1,732 people surveyed snooze or set several alarms at least sometimes. A short snooze isn't harmful. Hitting it on autopilot is what makes you late.",
    source: "Sundelin, Landry & Axelsson, Journal of Sleep Research, 2023",
    href: "https://doi.org/10.1111/jsr.14054",
  },
  {
    stat: "43%",
    title: "Habits run on autopilot",
    body: "About 43% of what we do each day is habit, done while thinking about something else. Reaching for snooze is one of them.",
    source: "Wood, Quinn & Kashy, Journal of Personality and Social Psychology, 2002",
    href: "https://doi.org/10.1037/0022-3514.83.6.1281",
  },
  {
    stat: "Cue",
    title: "Change the cue, break the habit",
    body: "Habits fire from context. Change the context, even slightly, and your brain has to stop and think.",
    source: "Verplanken & Wood, Journal of Public Policy & Marketing, 2006",
    href: "https://doi.org/10.1509/jppm.25.1.90",
  },
  {
    stat: "?!",
    title: "Surprise gets noticed",
    body: "The brain's reward system reacts to the unexpected and tunes out the predictable. An uncertain alarm can't fade into the background.",
    source: "Schultz, Dayan & Montague, Science, 1997",
    href: "https://doi.org/10.1126/science.275.5306.1593",
  },
  {
    stat: "2×",
    title: "Losing stings more",
    body: "Losses feel about twice as strong as equal gains. So a late ring is a loss, not a delay, and you move to avoid it.",
    source: "Tversky & Kahneman, Journal of Risk and Uncertainty, 1992",
    href: "https://doi.org/10.1007/BF00122574",
  },
  {
    stat: "🎰",
    title: "Uncertainty keeps you playing",
    body: "Unpredictable rewards are what make slot machines sticky. Here they get you out of bed, and no money is involved.",
    source: "Ferster & Skinner, Schedules of Reinforcement, 1957",
  },
];

export function Why() {
  return (
    <section id="why" className="scroll-mt-6 px-6 py-24 sm:px-10">
      <div className="mx-auto max-w-6xl">
        <SectionHeading title="Why would anyone want this?">
          Because you can&apos;t snooze what you don&apos;t trust. Snoozing isn&apos;t a decision, it&apos;s a reflex. LotteryClock adds one moment of doubt right where the reflex
          fires, and that&apos;s usually enough to wake you up properly.
        </SectionHeading>

        {/* The snooze loop as a comic strip, with the interrupt panel popping out */}
        <ol className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {LOOP.map(({ label, body, sfx, tilt, Art, interrupt }, i) => (
            <li
              key={label}
              className={`group relative flex flex-col overflow-visible rounded-3xl p-4 transition-transform duration-300 hover:-translate-y-1 ${
                interrupt
                  ? "bg-gradient-to-br from-[#FFC03D] via-[#FF6B35] to-[#FF2E4D] text-white shadow-[0_22px_44px_-18px_rgba(255,107,53,0.85)] lg:-translate-y-3 lg:scale-[1.05] lg:hover:-translate-y-4"
                  : "border-2 border-foreground/10 bg-white"
              }`}
            >
              {/* Sound effect, like a comic panel */}
              <span
                className={`absolute -top-3 right-4 z-10 rounded-full px-3 py-1 text-sm font-black tracking-tight shadow-sm transition-transform group-hover:scale-110 ${tilt} ${
                  interrupt ? "bg-white text-[#FF2E4D]" : "bg-[#432344] text-[#FFC03D]"
                }`}
              >
                {sfx}
              </span>

              <div
                className={`grid aspect-[4/3] place-items-center rounded-2xl ${
                  interrupt ? "bg-white/15" : "bg-[#FFF6EA]"
                }`}
              >
                <Art className="h-[85%] w-[85%]" />
              </div>

              <h3 className="mt-4 px-1 text-lg font-extrabold">{label}</h3>
              <p className={`mt-1 px-1 pb-1 text-[15px] ${interrupt ? "text-white/90" : "text-foreground/65"}`}>{body}</p>

              {/* Arrow to the next panel */}
              {i < LOOP.length - 1 && (
                <svg
                  aria-hidden
                  viewBox="0 0 24 24"
                  className="absolute top-[38%] -right-[22px] z-10 hidden h-6 w-6 text-foreground/30 lg:block"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h13M13 6l6 6-6 6" />
                </svg>
              )}
            </li>
          ))}
        </ol>

        <h3 className="mt-24 text-center text-3xl font-extrabold tracking-tight sm:text-4xl">
          The research behind the doubt
        </h3>
        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FINDINGS.map((f) => (
            <li key={f.title} className="flex flex-col rounded-3xl border border-foreground/10 bg-white p-7">
              <span className="text-5xl font-extrabold tracking-tight text-[#FF6B35]">{f.stat}</span>
              <h4 className="mt-4 text-2xl leading-tight font-extrabold tracking-tight text-balance">{f.title}</h4>
              <p className="mt-3 flex-1 leading-relaxed text-foreground/70">{f.body}</p>
              <p className="mt-5 border-t border-foreground/10 pt-3 text-xs text-foreground/50">
                {f.href ? (
                  <a href={f.href} target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:underline">
                    {f.source} ↗
                  </a>
                ) : (
                  f.source
                )}
              </p>
            </li>
          ))}
        </ul>

        <p className="mx-auto mt-10 max-w-3xl text-center text-sm text-foreground/55">
          Note - this is a hackathon project, not a clinical trial. The research above explains why the idea
          works; nobody has tested LotteryClock itself yet. My own sample size is one teenager in the early 2000s.
        </p>
      </div>
    </section>
  );
}
