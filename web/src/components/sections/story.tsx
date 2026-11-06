import { MAKER_AVATAR, MAKER_NAME } from "@/components/maker";
import { SectionHeading } from "@/components/sections/section-heading";

/**
 * The 2012 email to the owner of lotteryclock.com.
 * TODO(Dylan): swap in the real wording, date and subject from your Sent folder.
 */
const EMAIL = {
  from: "Dylan Jones",
  to: "Owner of lotteryclock.com",
  date: "2012",
  subject: "Is lotteryclock.com for sale?",
  body: [
    "Hi,",
    "I'm building an iPhone alarm clock app called LotteryClock and saw that you own lotteryclock.com.",
    "Would you consider selling it? I'm a solo developer, so I can't offer a fortune, but I'd make a fair offer.",
    "Thanks,\nDylan",
  ],
};

export function Story() {
  return (
    <section id="story" className="scroll-mt-6 px-6 pt-16 pb-24 sm:px-10">
      <div className="mx-auto max-w-6xl">
        <SectionHeading title="An idea that wouldn't stay dead" />

        <div className="mt-16 grid items-start gap-14 lg:grid-cols-[1.15fr_1fr] lg:gap-12">
          <Letter />
          <div className="lg:pt-16">
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
          Sometime in the early 2000s I was cleaning my room, which was rare, and tripped over the cord of my alarm
          clock. It went dark. I plugged it back in and forgot about it.
        </p>
        <p>
          The next morning it went off and my hand stopped halfway to snooze. Was that the real time? Had the clock been
          off for five minutes or twenty? Was I already late?
        </p>
        <p>
          I had no idea, so I got up. I was on time for school that day, and the next few. Then I worked out the offset,
          fixed the clock, and went straight back to being late.
        </p>
        <p>
          That little bit of doubt stuck with me. In 2012 I built an iPhone version that looked like a slot machine and
          emailed the owner of lotteryclock.com to ask if they&apos;d sell. They said no. The app never shipped.
        </p>
        <p>
          Kiroween&apos;s Resurrection track asks for something dead, brought back with today&apos;s tools. This idea
          has been in the ground for fourteen years. So here it is, dug back up.
        </p>
      </div>

      <div className="mt-8 flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element -- small avatar, no need for the optimiser */}
        <img src={MAKER_AVATAR} alt="" width={44} height={44} className="h-11 w-11 rounded-full object-cover" />
        <div>
          <p className="text-2xl italic leading-none">Dylan</p>
          <p className="mt-1 font-sans text-sm text-foreground/55">{MAKER_NAME}, maker of LotteryClock</p>
        </div>
      </div>
    </article>
  );
}

function Email() {
  return (
    <figure className="relative">

      <div className="relative overflow-hidden rounded-xl border border-foreground/15 bg-white shadow-[0_20px_40px_-20px_rgba(67,35,68,0.4)] lg:rotate-[1deg]">
        {/* Window chrome, 2012 desktop style */}
        <div className="flex items-center gap-2 border-b border-foreground/10 bg-gradient-to-b from-[#f4f1f4] to-[#e4dee4] px-4 py-2.5">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
          <span className="flex-1 text-center text-xs font-medium text-foreground/60">{EMAIL.subject}</span>
          <span className="w-[52px]" />
        </div>

        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 border-b border-foreground/10 px-5 py-4 font-mono text-[13px]">
          <dt className="text-foreground/45">From</dt>
          <dd>{EMAIL.from}</dd>
          <dt className="text-foreground/45">To</dt>
          <dd>{EMAIL.to}</dd>
          <dt className="text-foreground/45">Date</dt>
          <dd>{EMAIL.date}</dd>
          <dt className="text-foreground/45">Subject</dt>
          <dd className="font-semibold">{EMAIL.subject}</dd>
        </dl>

        <div className="space-y-3 px-5 py-5 text-[15px] leading-relaxed whitespace-pre-line text-foreground/85">
          {EMAIL.body.map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>

        {/* The answer */}
        <span
          aria-label="Reply: no"
          className="pointer-events-none absolute right-5 bottom-8 rotate-[-12deg] rounded-md border-[3px] border-[#FF2E4D] px-3 py-1 font-mono text-lg font-bold tracking-[0.15em] text-[#FF2E4D] uppercase opacity-85 mix-blend-multiply sm:text-xl"
        >
          Not for sale
        </span>
      </div>

      <figcaption className="mt-4 text-sm text-foreground/60">
        The reply was short. The domain stayed theirs, the app stayed on my laptop, and the idea went in a drawer.
      </figcaption>
    </figure>
  );
}
