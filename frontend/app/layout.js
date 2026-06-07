import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-gray-950 text-white">{children}</body>
    </html>
  );
}
