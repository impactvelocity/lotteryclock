/**
 * The demo video. Set ONE of these when it's ready:
 *  - a YouTube id ("dQw4w9WgXcQ"), or
 *  - a file in web/public (src: "/demo.mp4", poster: "/demo-poster.jpg").
 * Leave both empty and the frame shows a "coming soon" card instead.
 */
const DEMO_YOUTUBE_ID = "";
const DEMO_FILE: { src: string; poster?: string } | null = null;

export function DemoVideo() {
  return (
    <section id="demo" aria-label="Demo video" className="scroll-mt-6 px-6 pt-28 pb-8 sm:px-10">
      <div className="mx-auto w-full max-w-6xl rounded-3xl bg-foreground/5 p-2 ring-1 ring-foreground/10 sm:p-3">
        <div className="relative aspect-video overflow-hidden rounded-2xl bg-[#1a0f1b] shadow-[0_24px_48px_-24px_rgba(67,35,68,0.5)]">
          <Screen />
        </div>
      </div>
    </section>
  );
}

function Screen() {
  if (DEMO_YOUTUBE_ID) {
    return (
      <iframe
        className="absolute inset-0 h-full w-full"
        src={`https://www.youtube-nocookie.com/embed/${DEMO_YOUTUBE_ID}?rel=0`}
        title="LotteryClock demo video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }
  if (DEMO_FILE) {
    return (
      <video
        className="absolute inset-0 h-full w-full object-cover"
        src={DEMO_FILE.src}
        poster={DEMO_FILE.poster}
        controls
        playsInline
        preload="metadata"
      />
    );
  }
  return (
    <div className="absolute inset-0 grid place-items-center text-white">
      <div className="flex flex-col items-center gap-3">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-white/10 ring-1 ring-white/20 sm:h-16 sm:w-16">
          <svg aria-hidden viewBox="0 0 24 24" className="ml-0.5 h-6 w-6" fill="currentColor">
            <path d="M7 4.5v15l12.5-7.5z" />
          </svg>
        </span>
        <p className="text-sm text-white/55">Demo video coming soon</p>
      </div>
    </div>
  );
}
