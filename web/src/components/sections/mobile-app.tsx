import { SectionHeading } from "@/components/sections/section-heading";

export const REPO_URL = "https://github.com/impactvelocity/lotteryclock/";

/** Real screenshots from the iPhone app (iPhone 17 Pro simulator), in web/public/app. */
const SCREENS = {
  morning: {
    src: "/app/play-morning.webp",
    alt: "The Play screen in the Good Morning theme: a 7:30 AM alarm with 17 minutes of doubt",
  },
  night: {
    src: "/app/play-night.webp",
    alt: "The Play screen in the Good Night theme: the same 7:30 AM alarm over a night-time city",
  },
  history: {
    src: "/app/history.webp",
    alt: "The History screen: a chart of the last 14 mornings and a list of when each alarm rang",
  },
};

export function MobileApp() {
  return (
    <section
      id="app"
      className="relative scroll-mt-6 overflow-hidden px-6 py-24 text-white sm:px-10"
      style={{ background: "#12081A" }}
    >
      {/* Soft neon glow behind the phones */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-[38%] left-1/2 h-[520px] w-[820px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40 blur-3xl"
        style={{
          background:
            "radial-gradient(ellipse, #FF6B35 0%, #9B5DE5 40%, transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-6xl">
        <SectionHeading tone="dark" title="LotteryClock Mobile App">
          Built with React Native and Expo, it sets real alarms with
          Apple&apos;s AlarmKit, so the doubt follows you to bed. It&apos;s open
          source: run it yourself or see how it works.
        </SectionHeading>

        {/* Three real screens, fanned out like they've been dealt */}
        <div className="mt-16 flex items-center justify-center">
          <Phone
            screen={SCREENS.morning}
            className="z-0 hidden w-[230px] translate-x-24 -rotate-[10deg] opacity-90 md:block"
          />
          <Phone
            screen={SCREENS.night}
            className="z-10 w-[260px] sm:w-[290px]"
            priority
          />
          <Phone
            screen={SCREENS.history}
            className="z-0 hidden w-[230px] -translate-x-24 rotate-[10deg] opacity-90 md:block"
          />
        </div>

        <div className="mt-16 flex justify-center">
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(180deg,#FFC93C,#FF9F1C)] px-6 py-3 font-semibold text-[#2a1600] shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_12px_24px_-12px_rgba(255,159,28,0.8)] transition-[filter] hover:brightness-105"
          >
            <GitHubIcon />
            Try it or see the source on GitHub
          </a>
        </div>
      </div>
    </section>
  );
}

/** A real app screenshot in a simple iPhone frame. */
function Phone({
  screen,
  className = "",
  priority = false,
}: {
  screen: { src: string; alt: string };
  className?: string;
  priority?: boolean;
}) {
  return (
    <div className={`relative shrink-0 ${className}`}>
      <div className="relative rounded-[2.9rem] bg-[#1d1d22] p-[9px] shadow-[0_0_0_1.5px_#3a3a42,inset_0_0_0_1px_rgba(255,255,255,0.08),0_40px_80px_-24px_rgba(0,0,0,0.85)]">
        {/* Side buttons */}
        <span
          aria-hidden
          className="absolute top-[22%] -left-[3px] h-[6%] w-[3px] rounded-l bg-[#3a3a42]"
        />
        <span
          aria-hidden
          className="absolute top-[30%] -left-[3px] h-[9%] w-[3px] rounded-l bg-[#3a3a42]"
        />
        <span
          aria-hidden
          className="absolute top-[28%] -right-[3px] h-[13%] w-[3px] rounded-r bg-[#3a3a42]"
        />
        {/* eslint-disable-next-line @next/next/no-img-element -- small pre-sized webp screenshots */}
        <img
          src={screen.src}
          alt={screen.alt}
          width={720}
          height={1566}
          loading={priority ? "eager" : "lazy"}
          className="block h-auto w-full rounded-[2.3rem]"
        />
      </div>
    </div>
  );
}

export function GitHubIcon({
  className = "h-[18px] w-[18px]",
}: {
  className?: string;
}) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
    >
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}
