import { SectionHeading } from "@/components/sections/section-heading";
import { ShiftingClock } from "@/components/sections/shifting-clock";

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
    source:
      "Wood, Quinn & Kashy, Journal of Personality and Social Psychology, 2002",
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
    stat: "Odds",
    title: "Uncertainty keeps you playing",
    body: "Unpredictable rewards are what make slot machines sticky. Here they get you out of bed, and no money is involved.",
    source: "Ferster & Skinner, Schedules of Reinforcement, 1957",
  },
];

export function Why() {
  return (
    <section id="why" className="scroll-mt-6 py-24">
      <div className="mx-auto max-w-6xl px-6 sm:px-10">
        <SectionHeading title="Why would anyone want this?">
          <span className="text-xl sm:text-2xl">
            This random variation is what makes it impossible to ignore
          </span>
        </SectionHeading>
      </div>

      {/* The clock sits on a tabletop: a faint surface across the page, starting partway up the clock */}
      <div className="relative mt-14 px-6 sm:px-10">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-[58%] h-56 border-t border-foreground/[0.08] bg-gradient-to-b from-[#432344]/[0.05] to-transparent shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] [mask-image:linear-gradient(to_right,transparent,black_20%,black_80%,transparent)]"
        />
        <ShiftingClock />
      </div>

      <div className="mx-auto max-w-6xl px-6 sm:px-10">
        <div className="mx-auto mt-14 max-w-3xl text-center">
          <p className="mx-auto max-w-2xl text-lg text-pretty text-foreground/70">
            Snoozing is a reflex, and reflexes need a predictable cue. When the
            alarm could be 15 minutes early or 15 minutes late, your hand stops
            halfway to snooze and you have to wake up enough to check.
          </p>
        </div>

        <h3 className="mt-24 text-center text-3xl font-extrabold tracking-tight sm:text-4xl">
          The research behind the doubt
        </h3>
        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FINDINGS.map((f) => (
            <li
              key={f.title}
              className="flex flex-col rounded-3xl border border-foreground/10 bg-white p-7"
            >
              <span className="text-5xl font-extrabold tracking-tight text-[#FF6B35]">
                {f.stat}
              </span>
              <h4 className="mt-4 text-2xl leading-tight font-extrabold tracking-tight text-balance">
                {f.title}
              </h4>
              <p className="mt-3 flex-1 leading-relaxed text-foreground/70">
                {f.body}
              </p>
              <p className="mt-5 border-t border-foreground/10 pt-3 text-xs text-foreground/50">
                {f.href ? (
                  <a
                    href={f.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline-offset-2 hover:underline"
                  >
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
          Note - this is a hackathon project, not a clinical trial. The research
          above explains why the idea works; nobody has tested LotteryClock
          itself yet. My own sample size is one teenager in the early 2000s.
        </p>
      </div>
    </section>
  );
}
