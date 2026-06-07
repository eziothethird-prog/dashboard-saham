import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Dashboard Analisa Saham Indonesia";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          background: "linear-gradient(135deg, #030712 0%, #0f172a 50%, #0c1a2e 100%)",
          padding: "80px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Grid lines decoration */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: "linear-gradient(rgba(59,130,246,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.05) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          display: "flex",
        }} />

        {/* Chart bars decoration */}
        <div style={{ position: "absolute", right: "80px", bottom: "80px", display: "flex", alignItems: "flex-end", gap: "12px", opacity: 0.15 }}>
          {[120, 180, 140, 220, 160, 260, 200, 300, 240, 280].map((h, i) => (
            <div key={i} style={{ width: "28px", height: `${h}px`, background: "#3b82f6", borderRadius: "4px 4px 0 0" }} />
          ))}
        </div>

        {/* Badge */}
        <div style={{
          display: "flex", alignItems: "center", gap: "8px",
          background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)",
          borderRadius: "999px", padding: "6px 16px", marginBottom: "32px",
        }}>
          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#22c55e" }} />
          <span style={{ color: "#93c5fd", fontSize: "18px", fontWeight: 600 }}>Bursa Efek Indonesia · Real-time</span>
        </div>

        {/* Title */}
        <div style={{ fontSize: "72px", fontWeight: 800, color: "#ffffff", lineHeight: 1.1, marginBottom: "24px" }}>
          Dashboard<br />
          <span style={{ color: "#3b82f6" }}>Analisa Saham</span>
        </div>

        {/* Description */}
        <div style={{ fontSize: "26px", color: "#94a3b8", marginBottom: "48px", maxWidth: "700px" }}>
          Indikator teknikal · Data fundamental · Prediksi harga · Chat AI
        </div>

        {/* Tags */}
        <div style={{ display: "flex", gap: "12px" }}>
          {["RSI & MACD", "P/E & ROE", "Peer Comparison", "AI Analysis"].map(tag => (
            <div key={tag} style={{
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px", padding: "8px 18px",
              color: "#cbd5e1", fontSize: "18px",
            }}>
              {tag}
            </div>
          ))}
        </div>

        {/* URL */}
        <div style={{ position: "absolute", bottom: "48px", right: "80px", color: "#475569", fontSize: "20px" }}>
          dashboard-saham.vercel.app
        </div>
      </div>
    ),
    { ...size }
  );
}
