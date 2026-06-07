"use client";

import { useState } from "react";
import SearchBar from "@/components/SearchBar";
import StockChart from "@/components/StockChart";
import Indicators from "@/components/Indicators";
import ForecastChart from "@/components/ForecastChart";
import FundamentalCard from "@/components/FundamentalCard";
import PeerComparison from "@/components/PeerComparison";
import PortfolioSimulator from "@/components/PortfolioSimulator";
import ChatAI from "@/components/ChatAI";

export default function Home() {
  const [stockData, setStockData]   = useState(null);
  const [infoData, setInfoData]     = useState(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState(null);
  const [period, setPeriod]         = useState("6mo");

  const API = process.env.NEXT_PUBLIC_API_URL;

  async function fetchStock(ticker, p = period) {
    setLoading(true);
    setError(null);
    try {
      const [stockRes, infoRes] = await Promise.all([
        fetch(`${API}/stock/${ticker}?period=${p}`),
        fetch(`${API}/stock/${ticker}/info`),
      ]);
      if (!stockRes.ok) throw new Error("Ticker tidak ditemukan");
      setStockData(await stockRes.json());
      setInfoData(await infoRes.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function handlePeriod(p) {
    setPeriod(p);
    if (stockData) fetchStock(stockData.ticker, p);
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold">📈 Dashboard Analisa Saham</h1>
          <p className="text-gray-400 text-sm mt-1">Real-time data · Indikator teknikal · AI Analysis</p>
        </div>

        {/* Search */}
        <SearchBar onSearch={fetchStock} loading={loading} />

        {/* Error */}
        {error && (
          <div className="bg-red-900/40 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-20 text-gray-400">Mengambil data saham...</div>
        )}

        {/* Dashboard */}
        {stockData && !loading && (
          <>
            {/* Nama + rekomendasi */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">{infoData?.nama || stockData.ticker}</h2>
                <p className="text-gray-400 text-sm">{stockData.ticker} · {infoData?.sektor || "-"}</p>
              </div>
              <div className={`px-4 py-2 rounded-full text-sm font-semibold
                ${stockData.warna === "green" ? "bg-green-900/50 text-green-300 border border-green-700" :
                  stockData.warna === "red"   ? "bg-red-900/50 text-red-300 border border-red-700" :
                                                "bg-yellow-900/50 text-yellow-300 border border-yellow-700"}`}>
                {stockData.rekomendasi}
              </div>
            </div>

            {/* Harga + perubahan */}
            <div className="flex items-end gap-3">
              <div className="text-4xl font-bold">
                Rp {stockData.harga.toLocaleString("id-ID")}
              </div>
              {stockData.perubahan != null && (
                <div className={`text-sm font-medium pb-1 ${stockData.perubahan >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {stockData.perubahan >= 0 ? "+" : ""}{stockData.perubahan.toLocaleString("id-ID")}
                  {" "}({stockData.perubahan_pct >= 0 ? "+" : ""}{stockData.perubahan_pct}%)
                </div>
              )}
            </div>

            {/* Filter periode */}
            <div className="flex gap-2">
              {["1mo","3mo","6mo","1y","2y"].map(p => (
                <button key={p} onClick={() => handlePeriod(p)}
                  className={`px-3 py-1 rounded text-sm transition
                    ${period === p
                      ? "bg-blue-600 text-white"
                      : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}>
                  {p}
                </button>
              ))}
            </div>

            {/* Grafik */}
            <StockChart data={stockData.historis} />

            {/* Indikator */}
            <Indicators data={stockData} />
            
            {/* Forecast */}
            <ForecastChart ticker={stockData.ticker} />

            {/* Fundamental */}
            {infoData && <FundamentalCard data={infoData} />}

            {/* Peer Comparison */}
            <PeerComparison ticker={stockData.ticker} />

            {/* Portfolio Simulator */}
            <PortfolioSimulator harga={stockData.harga} ticker={stockData.ticker} />

            {/* Chat AI */}
            <ChatAI stockData={stockData} infoData={infoData} />
          </>
        )}

        {/* Empty state */}
        {!stockData && !loading && !error && (
          <div className="text-center py-24 text-gray-500">
            <p className="text-5xl mb-4">📊</p>
            <p>Masukkan kode saham untuk mulai analisis</p>
            <p className="text-sm mt-2">Contoh: BBCA.JK · TLKM.JK · ASII.JK</p>
          </div>
        )}

      </div>
    </main>
  );
}