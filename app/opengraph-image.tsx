import { ImageResponse } from "next/og";
import fs from "fs";
import path from "path";

export const alt = "MyLink - 당신의 모든 링크를 한 곳에";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Node.js 런타임 사용 (fs.readFileSync로 폰트를 안전하게 읽어오기 위함)
export const runtime = "nodejs";

export default async function Image() {
  const geistRegular = fs.readFileSync(
    path.join(process.cwd(), "public", "fonts", "Geist-Regular.ttf")
  );
  const geistBold = fs.readFileSync(
    path.join(process.cwd(), "public", "fonts", "Geist-Bold.ttf")
  );

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          backgroundColor: "#020617", // slate-950
          color: "white",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* SVG Background Glow */}
        <svg
          width="1200"
          height="630"
          style={{ position: "absolute", top: 0, left: 0 }}
        >
          <defs>
            <radialGradient id="purpleGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(126, 34, 206, 0.5)" />
              <stop offset="100%" stopColor="rgba(126, 34, 206, 0)" />
            </radialGradient>
            <radialGradient id="fuchsiaGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(192, 38, 211, 0.4)" />
              <stop offset="100%" stopColor="rgba(192, 38, 211, 0)" />
            </radialGradient>
          </defs>
          <circle cx="200" cy="100" r="500" fill="url(#purpleGlow)" />
          <circle cx="1000" cy="500" r="600" fill="url(#fuchsiaGlow)" />
        </svg>

        {/* Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "120px",
              height: "120px",
              borderRadius: "30px",
              background: "linear-gradient(135deg, #9333ea, #d946ef)",
              boxShadow: "0 20px 40px rgba(147, 51, 234, 0.3)",
              marginBottom: "40px",
            }}
          >
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
          </div>

          <h1
            style={{
              fontSize: 84,
              fontWeight: 700,
              fontFamily: "Geist",
              letterSpacing: "-0.05em",
              margin: 0,
              background: "linear-gradient(to right, #ffffff, #a1a1aa)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            MyLink
          </h1>

          <p
            style={{
              fontSize: 36,
              fontWeight: 400,
              fontFamily: "Geist",
              color: "#a1a1aa", // zinc-400
              marginTop: "20px",
              letterSpacing: "-0.02em",
            }}
          >
            당신의 모든 링크를 한 곳에
          </p>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Geist", data: geistRegular, weight: 400, style: "normal" },
        { name: "Geist", data: geistBold, weight: 700, style: "normal" },
      ],
    }
  );
}
