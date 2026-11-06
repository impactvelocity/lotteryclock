import { MAKER_AVATAR, MAKER_NAME } from "@/components/maker";
import { SectionHeading } from "@/components/sections/section-heading";

/**
 * The real 2012 thread, from Dylan's Gmail. Email addresses are left out and the
 * domain owner is shortened to "Russell S." for his privacy.
 */
const THREAD = {
  subject: "LotteryClock.com - Are you using it?",
  messages: [
    {
      from: "Dylan Jones",
      to: "Russell S.",
      date: "Thu, May 31, 2012",
      body: [
        "Hi Russell,",
        "I found your info with a WHOIS search.",
        "I was wondering if you were planning on using LotteryClock.com?",
        "If you don't have any plans for it, would it be possible if I buy it off you?",
        "Thanks!",
        "- Dylan",
      ],
    },
    {
      from: "Russell S.",
      to: "me",
      date: "Fri, Jun 8, 2012",
      body: [
        "Hi Dylan - I have always had plans for it but I don't know when I will get to it. Sorry, not for sale.",
      ],
    },
  ],
};

export function Story() {
  return (
    <section id="story" className="scroll-mt-6 px-6 pt-16 pb-24 sm:px-10">
      <div className="mx-auto max-w-6xl">
        <SectionHeading title="An idea that wouldn't stay dead" />

        <div className="mt-16 grid items-center gap-14 lg:grid-cols-[1.15fr_1fr] lg:gap-12">
          <Letter />
          <div>
            <Email />
          </div>
        </div>
      </div>
    </section>
  );
}

function Letter() {
  return (
    <article className="relative rounded-sm bg-white ring-1 ring-foreground/10 px-7 py-9 font-serif text-[17px] leading-relaxed text-foreground shadow-[0_1px_0_rgba(67,35,68,0.08),0_20px_40px_-18px_rgba(67,35,68,0.35)] sm:px-12 sm:py-12 lg:-rotate-[0.6deg]">
      {/* A strip of tape holding it to the page */}
      <span
        aria-hidden
        className="absolute -top-3 left-1/2 h-7 w-28 -translate-x-1/2 rotate-[-3deg] bg-[#FFC03D]/60"
      />
      <p className="text-xl">Hi,</p>
      <div className="mt-4 space-y-4 text-foreground/85">
        <p>
          Sometime in the early 2000s I was cleaning my room, which was rare,
          and tripped over the cord of my alarm clock. It went dark. I plugged
          it back in and forgot about it.
        </p>
        <p>
          The next morning it went off and my hand stopped halfway to snooze.
          Was that the real time? Had the clock been off for five minutes or
          twenty? Was I already late?
        </p>
        <p>
          I had no idea, so I got up. I was on time for school that day, and the
          next few. Then I worked out the offset, fixed the clock, and went
          straight back to being late.
        </p>
        <p>
          That little bit of doubt stuck with me. In 2012 I built an iPhone
          version that looked like a slot machine and emailed the owner of
          lotteryclock.com to ask if he&apos;d sell. He had plans for it. The
          app never shipped.
        </p>
        <p>
          Kiroween&apos;s Resurrection track asks for something dead, brought
          back with today&apos;s tools. This idea has been in the ground for
          fourteen years. So here it is, dug back up.
        </p>
      </div>

      <p className="mt-8 italic">{MAKER_NAME}</p>
    </article>
  );
}

function Email() {
  return (
    <figure className="relative">
      <div className="relative overflow-hidden rounded-xl border border-foreground/15 bg-white shadow-[0_20px_40px_-20px_rgba(67,35,68,0.4)] lg:rotate-[1deg]">
        {/* Window chrome */}
        <div className="flex items-center gap-2 border-b border-foreground/10 bg-gradient-to-b from-[#f4f1f4] to-[#e4dee4] px-4 py-2.5">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
          <span className="flex-1 text-center text-xs font-medium text-foreground/50">
            Inbox
          </span>
          <span className="w-[52px]" />
        </div>

        <h3 className="px-5 pt-5 text-xl font-semibold tracking-tight sm:px-6">
          {THREAD.subject}
        </h3>

        <ol className="divide-y divide-foreground/10">
          {THREAD.messages.map((m, i) => (
            <li key={m.date} className="flex gap-3 px-5 py-5 sm:px-6">
              {i === 0 ? (
                // eslint-disable-next-line @next/next/no-img-element -- small avatar, no need for the optimiser
                <img
                  src={MAKER_AVATAR}
                  alt=""
                  width={40}
                  height={40}
                  className="h-10 w-10 shrink-0 rounded-full object-cover"
                />
              ) : (
                <span
                  aria-hidden
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#432344] text-sm font-semibold text-white"
                >
                  RS
                </span>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                  <p className="font-semibold">{m.from}</p>
                  <time className="text-xs text-foreground/50">{m.date}</time>
                </div>
                <p className="text-xs text-foreground/50">to {m.to}</p>
                <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-foreground/85">
                  {m.body.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
                {/* The answer, stamped under the reply */}
                {i === THREAD.messages.length - 1 && (
                  <div className="mt-5 flex justify-end">
                    <span className="pointer-events-none rotate-[-8deg] rounded-md border-[3px] border-[#FF2E4D] px-3 py-1 font-mono text-base font-bold tracking-[0.12em] text-[#FF2E4D] uppercase opacity-85 mix-blend-multiply sm:text-lg">
                      Rejected
                    </span>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </figure>
  );
}
