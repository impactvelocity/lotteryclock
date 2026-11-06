// Shared bits for the submission images: the header, and dial crops from the iPhone screenshots.

const SHOTS = "../../screenshots/full/";

const CLOCK = `<svg viewBox="0 0 15 15" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="7.5" cy="7.5" r="6.2"/><path d="M7.5 4.4V7.5L9.5 9.5"/></svg>`;

// The Kiro ghost from web/src/components/kiro-ghost.tsx, with see-through eyes
const GHOST = `<svg viewBox="272 202 655 796" fill="currentColor"><mask id="kg" maskUnits="userSpaceOnUse" x="272" y="202" width="655" height="796"><path fill="#fff" d="M398.554 818.914C316.315 1001.03 491.477 1046.74 620.672 940.156C658.687 1059.66 801.052 970.473 852.234 877.795C964.787 673.567 919.318 465.357 907.64 422.374C827.637 129.443 427.623 128.946 358.8 423.865C342.651 475.544 342.402 534.18 333.458 595.051C328.986 625.86 325.507 645.488 313.83 677.785C306.873 696.424 297.68 712.819 282.773 740.645C259.915 783.881 269.604 867.113 387.87 823.883L399.051 818.914H398.554Z"/><path fill="#000" d="M636.123 549.353C603.328 549.353 598.359 510.097 598.359 486.742C598.359 465.623 602.086 448.977 609.293 438.293C615.504 428.852 624.697 424.131 636.123 424.131C647.555 424.131 657.492 428.852 664.447 438.541C672.398 449.474 676.623 466.12 676.623 486.742C676.623 525.998 661.471 549.353 636.375 549.353H636.123Z"/><path fill="#000" d="M771.24 549.353C738.445 549.353 733.477 510.097 733.477 486.742C733.477 465.623 737.203 448.977 744.41 438.293C750.621 428.852 759.814 424.131 771.24 424.131C782.672 424.131 792.609 428.852 799.564 438.541C807.516 449.474 811.74 466.12 811.74 486.742C811.74 525.998 796.588 549.353 771.492 549.353H771.24Z"/></mask><rect x="272" y="202" width="655" height="796" mask="url(#kg)"/></svg>`;

function header() {
  return `<div class="top">
    <div class="logo">${CLOCK}<span>LotteryClock<span class="tld">.app</span></span></div>
    <div class="kiro">${GHOST}Built for Kiroween</div>
  </div>`;
}

// Where the dial sits in a 1206 × 2622 iPhone screenshot
const DIAL = { cx: 603, cy: 1170, r: 500 };

/** Style for a round crop of the dial, `d` px across. */
function dialStyle(shot, d) {
  const s = d / (2 * DIAL.r);
  return `width:${d}px;height:${d}px;background-image:url(${SHOTS}${shot}.png);` +
    `background-size:${1206 * s}px auto;` +
    `background-position:${-(DIAL.cx - DIAL.r) * s}px ${-(DIAL.cy - DIAL.r) * s}px;`;
}

const THEMES = [
  { id: "night", name: "Good Night", tier: "Insomnia" },
  { id: "classic", name: "Good Morning", tier: "Pure chaos" },
  { id: "muertos", name: "Día de Muertos", tier: "Raise the spirits" },
  { id: "wheel", name: "Prize wheel", tier: "High stakes" },
  { id: "poker", name: "Poker", tier: "Re-raise" },
  { id: "ouija", name: "Ouija", tier: "Possessed" },
  { id: "tarot", name: "Tarot", tier: "The Tower" },
];

/** Night sky: seeded stars, the footer's moon, and the footer's graveyard along the bottom. */
function sky({ moon, graveyard = "graveyard-2000", stars = 70, graveyardStyle = "" } = {}) {
  let seed = 7;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const dots = Array.from({ length: stars }, () => {
    const size = rand() < 0.15 ? 2.6 : 1.4;
    return `<i style="left:${rand() * 100}%;top:${rand() * 70}%;width:${size}px;height:${size}px;opacity:${0.35 + rand() * 0.6}"></i>`;
  }).join("");
  const m = moon ? `<div class="moon" style="left:${moon.x}px;top:${moon.y}px;width:${moon.d}px;height:${moon.d}px"></div>` : "";
  const g = graveyard ? `<img class="graveyard" src="assets/${graveyard}.png" style="${graveyardStyle}">` : "";
  return `<div class="stars">${dots}</div>${m}${g}`;
}
