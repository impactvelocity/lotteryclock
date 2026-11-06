/** Who built LotteryClock, and where to find them. */

/** Brand marks (Simple Icons, CC0), drawn filled at 24 × 24. */
export const X_LOGO =
  "M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z";
const LINKEDIN_LOGO =
  "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z";

const BRAND_ICON = "h-[18px] w-[18px]";
export const LINE_ICON = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2.2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

export const MAKER_NAME = "Dylan Jones";
export const MAKER_SITE = "https://hidylanjones.com";
export const MAKER_AVATAR = "/dylan.webp";

/** Where the maker can be found. */
export const MAKER_LINKS = [
  {
    id: "site",
    label: "Dylan Jones's website",
    href: MAKER_SITE,
    icon: (
      <svg aria-hidden viewBox="0 0 24 24" className={BRAND_ICON} {...LINE_ICON}>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9s1.3-6.4 3.8-9z" />
      </svg>
    ),
  },
  {
    id: "x",
    label: "Dylan Jones on X",
    href: "https://twitter.com/hidylanjones",
    icon: (
      <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
        <path d={X_LOGO} />
      </svg>
    ),
  },
  {
    id: "linkedin",
    label: "Dylan Jones on LinkedIn",
    href: "https://www.linkedin.com/in/hidylanjones",
    icon: (
      <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
        <path d={LINKEDIN_LOGO} />
      </svg>
    ),
  },
];
