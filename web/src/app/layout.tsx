import type { Metadata } from "next";
import { GeistMono } from "geist/font/mono";
import { GeistPixelSquare } from "geist/font/pixel";
import { GeistSans } from "geist/font/sans";
import { GeistSerif, GeistSerifHeart, GeistSerifTriangle } from "geist/font/serif";
import "./globals.css";

export const metadata: Metadata = {
  title: "LotteryClock — the alarm clock you can't quite trust",
  description:
    "Set a wake-up time and choose how far off it's allowed to be. The alarm rings at a random moment inside that window. Early or late? You'll have to look before you snooze.",
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
