import { ImageResponse } from "next/og";

export const alt = "Dashboard Analitik Saham Consumer Goods";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Same tokens as the app: flat ground, white ink, one blue on the price line.
const LINE = [62, 58, 60, 52, 55, 47, 50, 41, 44, 36, 39, 30, 34, 26, 29, 22];

export default function Image() {
  const pts = LINE.map((y, i) => `${i * 40},${y * 4}`).join(" ");
  return new ImageResponse(
    (
      <div style={{
        width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between",
        background: "#171719", padding: "72px 80px", fontFamily: "sans-serif", color: "#ffffff",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px", fontSize: "26px", color: "#8a8c92" }}>
          <svg width="44" height="44" viewBox="0 0 24 24">
            <path d="M7 3v4M7 17v4M17 6v3M17 15v4" stroke="#8a8c92" strokeWidth="1.5" />
            <rect x="4.5" y="7" width="5" height="10" fill="#4a8ad6" />
            <rect x="14.5" y="9" width="5" height="6" fill="none" stroke="#ffffff" strokeWidth="1.5" />
          </svg>
          Dashboard Saham
        </div>

        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <div style={{ display: "flex", flexDirection: "column", maxWidth: "560px" }}>
            <div style={{ fontSize: "76px", fontWeight: 700, lineHeight: 1.02, letterSpacing: "-0.03em" }}>
              Kinerja emiten consumer goods BEI
            </div>
            <div style={{ fontSize: "26px", color: "#8a8c92", marginTop: "28px" }}>
              CMRY, ICBP, JPFA, GGRM, MYOR: teknikal, 10 indikator fundamental, komparasi.
            </div>
          </div>
          <svg width="600" height="260" viewBox="0 0 600 260">
            <polyline points={pts} fill="none" stroke="#4a8ad6" strokeWidth="5" strokeLinejoin="round" />
          </svg>
        </div>

        <div style={{ fontSize: "20px", color: "#8a8c92" }}>dashboard-saham.vercel.app</div>
      </div>
    ),
    { ...size }
  );
}
