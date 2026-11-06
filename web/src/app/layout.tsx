import type { Metadata, Viewport } from "next";
import { GeistMono } from "geist/font/mono";
import { GeistPixelSquare } from "geist/font/pixel";
import { GeistSans } from "geist/font/sans";
import { GeistSerif, GeistSerifHeart, GeistSerifTriangle } from "geist/font/serif";
import "./globals.css";

const TITLE = "LotteryClock: the alarm clock that gambles with your morning";
const DESCRIPTION =
  "Pick a wake-up time and a risk window. LotteryClock rings at a random moment inside it: early wins you a snooze, late means get up now. You never know which.";
/** Shorter, punchier copy for link previews (the card image carries the headline). */
const SHARE_TITLE = "LotteryClock: the alarm clock you can't quite trust";
const SHARE_DESCRIPTION =
  "It rings at a random moment around your wake-up time. Early? Free snooze. Late? Get up. Not knowing is what gets you out of bed.";

/**
 * Base for absolute share URLs (og:url, og:image). NEXT_PUBLIC_SITE_URL wins (set it once there's a
 * custom domain); otherwise the Vercel production domain; locally, Next uses localhost.
 */
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : undefined);

export const metadata: Metadata = {
  metadataBase: SITE_URL ? new URL(SITE_URL) : undefined,
  title: TITLE,
  description: DESCRIPTION,
  applicationName: "LotteryClock",
  keywords: ["alarm clock", "random alarm", "snooze", "wake up", "morning routine", "Kiroween"],
  authors: [{ name: "Dylan Jones" }],
  creator: "Dylan Jones",
  openGraph: {
    type: "website",
    siteName: "LotteryClock",
    title: SHARE_TITLE,
    description: SHARE_DESCRIPTION,
    url: "/",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: SHARE_TITLE,
    description: SHARE_DESCRIPTION,
  },
};

export const viewport: Viewport = {
  // The Good Morning sky's top colour, for mobile browser chrome
  themeColor: "#E6D9F1",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      // Smooth scrolling is for in-page links; Next keeps route changes instant
      data-scroll-behavior="smooth"
      className={`${GeistSans.variable} ${GeistMono.variable} ${GeistSerif.variable} ${GeistSerifTriangle.variable} ${GeistSerifHeart.variable} ${GeistPixelSquare.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
