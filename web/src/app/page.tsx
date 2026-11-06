import { Hero } from "@/components/hero";

const steps = [
  {
    title: "Set a target",
    body: "Pick the time you actually need to be up. Say, 7:30.",
  },
  {
    title: "Choose your risk",
    body: "Set a window from 5 to 45 minutes on either side of your target.",
  },
  {
    title: "Roll the dice",
    body: "The alarm rings at a random moment in that window. The offset stays hidden.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <main className="flex flex-1 flex-col">
        <Hero />

        <section
          id="how"
          className="pt-8"
        >
          <div className="mx-auto w-full max-w-5xl px-6 py-20">
            <h2 className="font-display text-3xl sm:text-4xl">How it works</h2>
            <ol className="mt-10 grid gap-6 sm:grid-cols-3">
              {steps.map((step, i) => (
                <li
                  key={step.title}
                  className="rounded-2xl border border-foreground/10 p-6"
                >
                  <span className="font-display text-2xl text-[#FF6B35]">
                    {i + 1}
                  </span>
                  <h3 className="mt-3 text-lg font-semibold">{step.title}</h3>
                  <p className="mt-2 text-foreground/70">{step.body}</p>
                </li>
              ))}
            </ol>

            <div className="mt-12 grid gap-6 sm:grid-cols-2">
              <div className="rounded-2xl border border-emerald-400/30 bg-emerald-400/5 p-6">
                <h3 className="font-display text-xl text-emerald-700">
                  Rang early? You win.
                </h3>
                <p className="mt-2 text-foreground/70">
                  Snooze, and it ends exactly at your target time. Those
                  minutes are yours.
                </p>
              </div>
              <div className="rounded-2xl border border-rose-400/30 bg-rose-400/5 p-6">
                <h3 className="font-display text-xl text-rose-700">
                  Rang late? You lose.
                </h3>
                <p className="mt-2 text-foreground/70">
                  You&apos;re already behind. Get up now.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="mx-auto w-full max-w-5xl px-6 py-8 text-sm text-foreground/50">
        LotteryClock. Built for the Kiroween hackathon.
      </footer>
    </div>
  );
}
