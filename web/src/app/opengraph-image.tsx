import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { cacheLife } from "next/cache";
import { ImageResponse } from "next/og";
import { nightBackdrop } from "@/lib/og-night";

export const alt =
  "LotteryClock: the alarm clock you can't trust. It rings at a random moment around your wake-up time. Three iPhone screens of the app over a moonlit city.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const WHITE = "#FFFFFF";
/** Lighter than the site's lilac (#C9B8E8), so the subtitle holds up small. */
const LILAC = "#E2D8F3";
const AMBER = "#FFC03D";

/** Fonts, app screenshots (assets/og, from public/app) and the night backdrop, cached so the card is built once. */
async function loadAssets() {
  "use cache";
  cacheLife("max");
  const root = join(process.cwd(), "assets");
  const read = (path: string) => readFile(join(root, path), "base64");
  const [medium, bold, extraBold, night, morning, history, backdrop] = await Promise.all([
    read("fonts/Geist-Medium.ttf"),
    read("fonts/Geist-Bold.ttf"),
    read("fonts/Geist-ExtraBold.ttf"),
    read("og/play-night.jpg"),
    read("og/play-morning.jpg"),
    read("og/history.jpg"),
    nightBackdrop(),
  ]);
  return { medium, bold, extraBold, night, morning, history, backdrop };
}

/** The share card, laid out like an ad: the pitch on the left, the app fanned out on the right, a moonlit city behind. */
export default async function Image() {
  const a = await loadAssets();
  const jpg = (b64: string) => `data:image/jpeg;base64,${b64}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: "#140B2A",
          fontFamily: "Geist",
          color: WHITE,
        }}
      >
        <img
          src={`data:image/svg+xml;base64,${a.backdrop}`}
          width={size.width}
          height={size.height}
          alt=""
          style={{ position: "absolute", left: 0, top: 0 }}
        />

        {/* The pitch, centred top to bottom */}
        <div
          style={{
            position: "absolute",
            left: 68,
            top: 0,
            height: 630,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 23, fontWeight: 700, letterSpacing: "-0.01em" }}>
            <svg width="24" height="24" viewBox="0 0 15 15" fill="none" stroke={WHITE} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="7.5" cy="7.5" r="6.2" />
              <path d="M7.5 4.4V7.5L9.5 9.5" />
            </svg>
            LotteryClock
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginTop: 30,
              fontSize: 66,
              fontWeight: 800,
              lineHeight: 1.04,
              letterSpacing: "-0.035em",
            }}
          >
            <span>The alarm clock</span>
            <span>
              you&nbsp;<span style={{ color: AMBER }}>can’t trust</span>
            </span>
          </div>
          <div style={{ marginTop: 22, fontSize: 25, fontWeight: 500, lineHeight: 1.4, color: LILAC, width: 500 }}>
            It rings at a random moment around your wake-up time. Dare you hit snooze?
          </div>
        </div>

        {/* The app: the night screen up front, morning and history tucked in behind */}
        <Phone src={jpg(a.morning)} width={186} left={677} top={156} rotate={-5} back />
        <Phone src={jpg(a.history)} width={186} left={977} top={156} rotate={5} back />
        <Phone src={jpg(a.night)} width={252} left={794} top={38} />
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Geist", data: Buffer.from(a.medium, "base64"), weight: 500, style: "normal" },
        { name: "Geist", data: Buffer.from(a.bold, "base64"), weight: 700, style: "normal" },
        { name: "Geist", data: Buffer.from(a.extraBold, "base64"), weight: 800, style: "normal" },
      ],
    },
  );
}

/** A real app screenshot in a plain iPhone frame (as in the site's app section). `back` phones get a lighter shadow. */
function Phone({
  src,
  width,
  left,
  top,
  rotate = 0,
  back = false,
}: {
  src: string;
  width: number;
  left: number;
  top: number;
  rotate?: number;
  back?: boolean;
}) {
  const pad = Math.round(width * 0.033);
  const screenW = width - pad * 2;
  const screenH = Math.round((screenW * 1566) / 720);
  const radius = Math.round(width * 0.155);
  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        display: "flex",
        padding: pad,
        borderRadius: radius,
        background: "#1d1d22",
        boxShadow: back
          ? "0 0 0 1px #34343c, 0 30px 50px -18px rgba(0,0,0,0.8)"
          : "0 0 0 1.5px #3a3a42, 0 0 0 3px rgba(201,184,232,0.12), 0 44px 80px -20px rgba(0,0,0,0.9)",
        transform: `rotate(${rotate}deg)`,
      }}
    >
      <img src={src} width={screenW} height={screenH} alt="" style={{ borderRadius: radius - pad }} />
    </div>
  );
}
