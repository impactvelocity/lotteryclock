import { Hero } from "@/components/hero";
import { DemoVideo } from "@/components/sections/demo-video";
import { MobileApp } from "@/components/sections/mobile-app";
import { SiteFooter } from "@/components/sections/site-footer";
import { Story } from "@/components/sections/story";
import { Why } from "@/components/sections/why";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <main className="flex flex-1 flex-col">
        <Hero />
        <DemoVideo />
        <Story />
        <Why />
        <MobileApp />
      </main>

      <SiteFooter />
    </div>
  );
}
