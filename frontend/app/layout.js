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
  title: "Dashboard Analitik Saham Consumer Goods",
  description: "Evaluasi kinerja emiten consumer goods BEI: analisis teknikal, 10 indikator fundamental, dan komparasi emiten.",
  openGraph: {
    title: "Dashboard Analitik Saham Consumer Goods",
    description: "CMRY, ICBP, JPFA, GGRM, MYOR: teknikal, 10 indikator fundamental, dan komparasi.",
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
