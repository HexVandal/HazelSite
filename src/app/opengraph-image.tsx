import { ImageResponse } from "next/og";

export const alt = "Gloom — a personal corner of the internet";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "62px 72px",
          background: "linear-gradient(135deg, #080808 0%, #171717 60%, #300b0b 100%)",
          color: "#f5f5f5",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 30, fontWeight: 700 }}>
          gloom<span style={{ color: "#a3a3a3" }}>.</span>
          <span style={{ marginLeft: 16, fontSize: 15, fontWeight: 400, letterSpacing: 5, color: "#a3a3a3" }}>PERSONAL SITE</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 22, maxWidth: 950 }}>
          <div style={{ fontSize: 78, lineHeight: 1.04, fontWeight: 700, letterSpacing: -3 }}>
            Pixels, thoughts &amp; late-night detours.
          </div>
          <div style={{ fontSize: 27, color: "#b5b5b5" }}>
            A little corner for writing, making, and being a work in progress.
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "monospace", fontSize: 15, color: "#858585" }}>
          <span>HEXVANDAL</span>
          <span>thesonofnyx.vercel.app</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
