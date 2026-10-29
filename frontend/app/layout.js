import { Public_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const publicSans = Public_Sans({
  variable: "--font-public-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// Figures only: prices, ratios and dates stack digit for digit.
const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata = {
  title: "Dashboard Analisa Saham Indonesia",
  description: "Analisis saham Indonesia real-time — indikator teknikal, data fundamental, prediksi harga, dan chat AI.",
  openGraph: {
    title: "Dashboard Analisa Saham Indonesia",
    description: "Analisis saham BEI real-time dengan RSI, MACD, fundamental, dan AI.",
    url: "https://dashboard-saham.vercel.app",
    siteName: "Dashboard Saham",
    locale: "id_ID",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`${publicSans.variable} ${plexMono.variable} antialiased`}>
      <body className="min-h-screen bg-ground text-ink font-sans">{children}</body>
    </html>
  );
}
