import { ImageResponse } from "next/og";
import fs from "fs";
import path from "path";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const alt = "MyLink Profile";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Node.js 런타임을 명시하여 fs.readFileSync 및 Firebase 원활한 연동 보장
export const runtime = "nodejs";

export default async function Image(props: { params: Promise<{ nickname: string }> | { nickname: string } }) {
  const params = await props.params;
  const nickname = params.nickname;
  
  let username = nickname;
  let avatarUrl: string | null = null;

  try {
    // 1. 닉네임으로 UID 조회
    const nicknameDoc = await getDoc(doc(db, "nicknames", nickname));
    if (nicknameDoc.exists()) {
      const uid = nicknameDoc.data().uid as string;
      // 2. UID로 사용자 정보(프로필 이미지, 이름) 조회
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        username = userData.username || nickname;
        avatarUrl = userData.avatarUrl || null;
      }
    }
  } catch (error) {
    console.error("Failed to fetch user data for OG image:", error);
  }

  // 폰트 파일 로드
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
        {/* SVG Background Glow - /[nickname]/page.tsx 디자인과 통일감 유지 */}
        <svg
          width="1200"
          height="630"
          style={{ position: "absolute", top: 0, left: 0 }}
        >
          <defs>
            <radialGradient id="purpleGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(126, 34, 206, 0.4)" />
              <stop offset="100%" stopColor="rgba(126, 34, 206, 0)" />
            </radialGradient>
            <radialGradient id="fuchsiaGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(192, 38, 211, 0.3)" />
              <stop offset="100%" stopColor="rgba(192, 38, 211, 0)" />
            </radialGradient>
          </defs>
          {/* 보라색 및 자홍색 글로우 위치 조정 */}
          <circle cx="300" cy="150" r="550" fill="url(#purpleGlow)" />
          <circle cx="900" cy="450" r="600" fill="url(#fuchsiaGlow)" />
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
          {/* 아바타 컨테이너 */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "200px",
              height: "200px",
              borderRadius: "100px",
              background: "#18181b", // zinc-900
              border: "4px solid #27272a", // zinc-800
              overflow: "hidden",
              marginBottom: "40px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
            }}
          >
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt={username}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            ) : (
              <span
                style={{
                  fontSize: "80px",
                  fontWeight: 700,
                  fontFamily: "Geist",
                  color: "#71717a", // zinc-500
                }}
              >
                {username.charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          {/* 유저명 */}
          <h1
            style={{
              fontSize: "64px",
              fontWeight: 700,
              fontFamily: "Geist",
              margin: 0,
              color: "white",
              letterSpacing: "-0.02em",
            }}
          >
            {username}
          </h1>

          {/* 프로필 URL */}
          <p
            style={{
              fontSize: "32px",
              fontWeight: 400,
              fontFamily: "Geist",
              color: "#a1a1aa", // zinc-400
              marginTop: "20px",
            }}
          >
            mylink.com/{nickname}
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
