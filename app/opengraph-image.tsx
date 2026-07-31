import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { SITE_NAME, SITE_DESCRIPTION } from "@/lib/seo";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const logoBuffer = await readFile(path.join(process.cwd(), "public", "logo-icon.png"));
  const logoSrc = `data:image/png;base64,${logoBuffer.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#ffffff",
          padding: "80px",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} width={140} height={140} style={{ marginBottom: 24 }} />
        <div style={{ fontSize: 76, color: "#1a1a1a", fontWeight: 700, letterSpacing: 2 }}>
          {SITE_NAME}
        </div>
        <div
          style={{
            marginTop: 24,
            fontSize: 30,
            color: "#1a1a1aaa",
            textAlign: "center",
            maxWidth: 900,
          }}
        >
          {SITE_DESCRIPTION}
        </div>
      </div>
    ),
    { ...size }
  );
}
