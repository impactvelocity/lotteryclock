import type { ReactNode } from "react";

/** Big title (and optional intro line) used at the top of each section below the hero. */
export function SectionHeading({
  title,
  children,
  align = "center",
  tone = "light",
}: {
  title: ReactNode;
  children?: ReactNode;
  align?: "center" | "left";
  tone?: "light" | "dark";
}) {
  const centered = align === "center";
  return (
    // Centred titles get the full width so they stay on one line; the intro under them stays narrow
    <div className={centered ? "mx-auto max-w-4xl text-center" : "max-w-xl"}>
      <h2 className="text-3xl leading-[1.1] font-extrabold tracking-tight text-balance sm:text-5xl">{title}</h2>
      {children && (
        <p
          className={`mt-4 text-lg text-pretty ${centered ? "mx-auto max-w-2xl" : ""} ${
            tone === "dark" ? "text-white/70" : "text-foreground/70"
          }`}
        >
          {children}
        </p>
      )}
    </div>
  );
}
