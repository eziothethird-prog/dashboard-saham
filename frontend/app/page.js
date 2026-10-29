"use client";

import { useState, useEffect } from "react";
import SearchBar, { POPULER } from "@/components/SearchBar";
import StockChart from "@/components/StockChart";
import Indicators from "@/components/Indicators";
import ForecastChart from "@/components/ForecastChart";
import FundamentalCard from "@/components/FundamentalCard";
import PeerComparison from "@/components/PeerComparison";
import PortfolioSimulator from "@/components/PortfolioSimulator";
import ChatAI from "@/components/ChatAI";
import Rail from "@/components/Rail";
import { num, rp, signed, signedPct, tone, tanggal } from "@/lib/format";

const PERIODS = [
  { id: "1mo", label: "1B" },
  { id: "3mo", label: "3B" },
  { id: "6mo", label: "6B" },
  { id: "1y", label: "1T" },
  { id: "2y", label: "2T" },
];

const SINYAL = {
  green: "bg-pos-bg text-pos-ink",
  red: "bg-neg-bg text-neg-ink",
  yellow: "bg-warn-bg text-warn-ink",
};

// One sentence that says why the system signal is what it is, built from the same figures shown below.
function alasan(d) {
  const parts = [];
  parts.push(`RSI ${num(d.rsi, 1)} ${d.rsi > 70 ? "overbought" : d.rsi < 30 ? "oversold" : "netral"}`);
  parts.push(`MACD ${d.macd > d.macd_signal ? "di atas" : "di bawah"} signal`);
  if (d.ma20 != null && d.ma50 != null) parts.push(`MA20 ${d.ma20 > d.ma50 ? "di atas" : "di bawah"} MA50`);
  return parts.join(" · ");
}

export default function Home() {
  const [stockData, setStockData] = useState(null);
  const [infoData, setInfoData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState("6mo");
  const [chatOpen, setChatOpen] = useState(false);
  const [lastTicker, setLastTicker] = useState(null);

  const API = process.env.NEXT_PUBLIC_API_URL ?? ""; // kosong = backend satu domain (Vercel Services, /stock/*)

  async function fetchStock(ticker, p = period) {
    setLoading(true);
    setError(null);
    setLastTicker(ticker);
    try {
      const [stockRes, infoRes] = await Promise.all([
        fetch(`${API}/stock/${ticker}?period=${p}`),
        fetch(`${API}/stock/${ticker}/info`),
      ]);
      if (!stockRes.ok) throw new Error(`Kode ${ticker.replace(".JK", "")} tidak ditemukan di Yahoo Finance.`);
      setStockData(await stockRes.json());
      setInfoData(infoRes.ok ? await infoRes.json() : null);
    } catch (e) {
      setError(e.message === "Failed to fetch" ? "Server data tidak bisa dihubungi. Pastikan backend berjalan." : e.message);
    } finally {
      setLoading(false);
    }
  }

  // ?t=BBCA opens a stock directly, so a view can be shared as a link.
  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("t");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing from the URL, an external system, once on mount
    if (t) fetchStock(t.toUpperCase().includes(".") ? t.toUpperCase() : `${t.toUpperCase()}.JK`);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (stockData) window.history.replaceState(null, "", `?t=${stockData.ticker.replace(".JK", "")}`);
  }, [stockData]);

  function handlePeriod(p) {
    setPeriod(p);
    if (stockData) fetchStock(stockData.ticker, p);
  }

  const d = stockData;
  const lastDate = d?.historis?.at(-1)?.date;

  return (
    <div className="min-h-screen md:pl-14 pb-16 md:pb-0">
      <Rail hasData={!!d} onChat={() => setChatOpen(true)} />

      {/* Top bar: the search is the screen's most frequent job */}
      <header className="sticky top-0 z-20 bg-ground border-b border-line">
        <div className="px-4 md:px-8 h-14 flex items-center gap-4">
          <SearchBar onSearch={t => fetchStock(t)} loading={loading} current={d?.ticker} />
          <span className="hidden lg:block ml-auto text-xs text-muted whitespace-nowrap">Data Yahoo Finance · tertunda ±15 menit</span>
        </div>
      </header>

      <main className="px-4 md:px-8 py-6 md:py-8">
        {error && (
          <div className="card px-5 py-4 mb-6 flex items-center justify-between gap-4" role="alert">
            <p className="text-neg-ink">{error}</p>
            {lastTicker && (
              <button onClick={() => fetchStock(lastTicker)}
                className="h-8 px-4 rounded-full border border-control text-ink hover:bg-raised transition-colors shrink-0">
                Coba lagi
              </button>
            )}
          </div>
        )}

        {loading && <Skeleton />}

        {d && !loading && (
          <>
            {/* Title row: who, the price, and the system's reading of it */}
            <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
              <div className="min-w-0">
                <p className="text-muted mb-1">
                  <span className="num text-ink">{d.ticker.replace(".JK", "")}</span>
                  {infoData?.sektor && infoData.sektor !== "-" && <> · {infoData.sektor}</>}
                  {infoData?.industri && infoData.industri !== "-" && <> · {infoData.industri}</>}
                </p>
                <h1 className="text-[26px] leading-tight font-semibold tracking-tight truncate">
                  {infoData?.nama || d.ticker}
                </h1>
                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 mt-3">
                  <span className="num text-[36px] leading-none font-medium">{rp(d.harga)}</span>
                  {d.perubahan != null && (
                    <span className={`num text-[15px] ${tone(d.perubahan)}`}>
                      {signed(d.perubahan)} ({signedPct(d.perubahan_pct)})
                    </span>
                  )}
                  <span className="text-muted">penutupan {tanggal(lastDate)}</span>
                </div>
                <p className="mt-3 flex flex-wrap items-center gap-2 text-[14px]">
                  <span className={`px-2.5 py-0.5 rounded-full font-semibold ${SINYAL[d.warna] ?? SINYAL.yellow}`}>
                    Sinyal: {d.rekomendasi}
                  </span>
                  <span className="text-muted">{alasan(d)}</span>
                </p>
              </div>

              <div className="flex items-center gap-6 shrink-0">
                <nav aria-label="Periode grafik" className="flex border-b border-line">
                  {PERIODS.map(p => (
                    <button key={p.id} onClick={() => handlePeriod(p.id)} aria-pressed={period === p.id}
                      className={`num px-3 h-9 -mb-px border-b transition-colors
                        ${period === p.id ? "border-accent text-ink" : "border-transparent text-muted hover:text-ink"}`}>
                      {p.label}
                    </button>
                  ))}
                </nav>
                <button onClick={() => setChatOpen(true)}
                  className="h-9 px-4 rounded-full bg-ink text-ground font-semibold hover:bg-white/85 active:scale-[0.98] transition">
                  Tanya AI
                </button>
              </div>
            </section>

            {/* Grid: 12 columns, one 24px gap. 8 + 4, 7 + 5, 7 + 5. */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div id="grafik" className="lg:col-span-8"><StockChart data={d.historis} period={period} /></div>
              <div id="teknikal" className="lg:col-span-4"><Indicators data={d} /></div>
              <div id="peers" className="lg:col-span-7"><PeerComparison ticker={d.ticker} onSelect={t => fetchStock(t)}
                self={{
                  ticker: d.ticker.replace(".JK", ""), nama: infoData?.nama, harga: d.harga,
                  pe_ratio: infoData?.pe_ratio, pb_ratio: infoData?.pb_ratio, roe: infoData?.roe, npm: infoData?.npm, market_cap: infoData?.market_cap,
                }} /></div>
              <div id="fundamental" className="lg:col-span-5">
                {infoData ? <FundamentalCard data={infoData} harga={d.harga} /> : <Empty title="Fundamental" text="Data fundamental tidak tersedia untuk kode ini." />}
              </div>
              <div id="prediksi" className="lg:col-span-7"><ForecastChart ticker={d.ticker} historis={d.historis} /></div>
              <div id="simulasi" className="lg:col-span-5"><PortfolioSimulator key={d.ticker} harga={d.harga} ticker={d.ticker} /></div>
            </div>

            <ChatAI open={chatOpen} onClose={() => setChatOpen(false)} stockData={d} infoData={infoData} />
          </>
        )}

        {!d && !loading && <Welcome onPick={t => fetchStock(t)} />}
      </main>

      <footer className="px-4 md:px-8 py-6 border-t border-line text-muted text-xs flex flex-col sm:flex-row justify-between gap-2">
        <span>Data dari Yahoo Finance. Harga bisa tertunda.</span>
        <span>Bukan saran investasi. Lakukan riset mandiri sebelum membeli.</span>
      </footer>
    </div>
  );
}

function Empty({ title, text }) {
  return (
    <div className="card p-5 h-full">
      <h2 className="text-base font-semibold mb-2">{title}</h2>
      <p className="text-muted">{text}</p>
    </div>
  );
}

function Welcome({ onPick }) {
  return (
    <section className="max-w-3xl">
      <h1 className="text-[26px] leading-tight font-semibold tracking-tight">Analisa saham BEI</h1>
      <p className="text-muted text-[15px] mt-2 max-w-xl">
        Ketik kode emiten di atas, atau buka salah satu saham consumer goods di bawah.
        Grafik, RSI, MACD, fundamental, peers dan prediksi muncul di satu layar.
      </p>
      <ul className="card mt-6 divide-y divide-rule">
        {POPULER.map(p => (
          <li key={p.kode}>
            <button onClick={() => onPick(`${p.kode}.JK`)}
              className="w-full flex items-center gap-4 px-5 h-[42px] text-left hover:bg-raised transition-colors group">
              <span className="num w-14 text-ink">{p.kode}</span>
              <span className="text-muted flex-1 truncate">{p.nama}</span>
              <span className="text-muted group-hover:text-ink transition-colors">Buka</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Skeleton() {
  return (
    <div aria-busy="true" aria-label="Memuat data saham">
      <div className="mb-8 space-y-3">
        <div className="skeleton h-4 w-48" />
        <div className="skeleton h-7 w-80" />
        <div className="skeleton h-9 w-56" />
        <div className="skeleton h-5 w-96 max-w-full" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="card lg:col-span-8 h-[440px] p-5"><div className="skeleton h-full" /></div>
        <div className="card lg:col-span-4 h-[440px] p-5 space-y-4">
          {Array.from({ length: 7 }).map((_, i) => <div key={i} className="skeleton h-5" />)}
        </div>
      </div>
    </div>
  );
}
