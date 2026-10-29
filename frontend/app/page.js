"use client";

import { useState, useEffect } from "react";
import SearchBar, { SAMPEL } from "@/components/SearchBar";
import Overview from "@/components/Overview";
import Technical from "@/components/Technical";
import Fundamental from "@/components/Fundamental";
import Comparison from "@/components/Comparison";
import Rail from "@/components/Rail";

const API = process.env.NEXT_PUBLIC_API_URL ?? ""; // kosong = backend satu domain (Vercel Services, /stock/*)
const SAMPEL_JK = SAMPEL.map(s => `${s.kode}.JK`);

const normal = t => {
  const u = t.trim().toUpperCase();
  return u.includes(".") ? u : `${u}.JK`;
};

export default function Home() {
  const [ticker, setTicker] = useState(null);
  const [period, setPeriod] = useState("1y");
  const [stock, setStock] = useState(null);
  const [info, setInfo] = useState(null);
  const [compare, setCompare] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function load(t, p = period) {
    setLoading(true);
    setError(null);
    try {
      const [sRes, iRes] = await Promise.all([
        fetch(`${API}/stock/${t}?period=${p}`),
        fetch(`${API}/stock/${t}/info`),
      ]);
      if (!sRes.ok) throw new Error(`Kode ${t.replace(".JK", "")} tidak ditemukan di Yahoo Finance.`);
      setStock(await sRes.json());
      setInfo(iRes.ok ? await iRes.json() : null);
      setTicker(t);
    } catch (e) {
      setError(e.message === "Failed to fetch" ? "Server data tidak bisa dihubungi. Coba lagi sebentar." : e.message);
    } finally {
      setLoading(false);
    }
  }

  // ?t=GGRM membuka emiten langsung; tanpa parameter dibuka CMRY (emiten pertama sampel).
  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("t");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sinkron dari URL sekali saat mount
    load(normal(t || SAMPEL[0].kode));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (ticker) window.history.replaceState(null, "", `?t=${ticker.replace(".JK", "")}`);
  }, [ticker]);

  // Komparasi: 5 emiten sampel, ditambah emiten yang sedang dibuka bila di luar sampel.
  const daftarKomparasi = ticker && !SAMPEL_JK.includes(ticker) ? [...SAMPEL_JK, ticker] : SAMPEL_JK;
  const kunciKomparasi = daftarKomparasi.join(",");
  useEffect(() => {
    let alive = true;
    fetch(`${API}/stock/compare?tickers=${kunciKomparasi}`)
      .then(r => r.json())
      .then(d => alive && setCompare(d))
      .catch(() => alive && setCompare({ emiten: [], skor: {} }));
    return () => { alive = false; };
  }, [kunciKomparasi]);

  function handlePeriod(p) {
    setPeriod(p);
    if (ticker) load(ticker, p);
  }

  const tahunSkor = info?.tahunan?.at(-1)?.tahun;
  const skorIni = ticker && tahunSkor && compare?.skor?.[ticker]?.[tahunSkor];
  const skor = skorIni ? { ...skorIni, tahun: tahunSkor } : null;

  return (
    <div className="min-h-screen md:pl-14 pb-16 md:pb-0">
      <Rail />

      <header className="sticky top-0 z-20 bg-ground border-b border-line">
        <div className="px-4 md:px-8 h-14 flex items-center gap-4">
          <SearchBar onSearch={t => load(normal(t))} loading={loading} current={ticker} />
          <span className="hidden xl:block ml-auto text-xs text-muted whitespace-nowrap">Data Yahoo Finance · tertunda ±15 menit</span>
        </div>
      </header>

      <main className="px-4 md:px-8 py-6 md:py-8 space-y-6">
        {error && (
          <div className="card px-5 py-4 flex items-center justify-between gap-4" role="alert">
            <p className="text-neg-ink">{error}</p>
            <button onClick={() => load(ticker ?? normal(SAMPEL[0].kode))}
              className="h-8 px-4 rounded-full border border-control text-ink hover:bg-raised transition-colors shrink-0">
              Coba lagi
            </button>
          </div>
        )}

        {stock && (
          <section aria-labelledby="judul" className={loading ? "opacity-60 transition-opacity" : "transition-opacity"}>
            <p className="text-muted mb-1">
              <span className="num text-ink">{stock.ticker.replace(".JK", "")}</span>
              {info?.sektor && info.sektor !== "-" && <> · {info.sektor}</>}
              {info?.industri && info.industri !== "-" && <> · {info.industri}</>}
            </p>
            <h1 id="judul" className="text-[26px] leading-tight font-semibold tracking-tight">{info?.nama || stock.ticker}</h1>
            <p className="text-muted mt-1">Dashboard analitik kinerja emiten consumer goods BEI</p>
          </section>
        )}

        {!stock && loading && <Skeleton />}

        {stock && (
          <div className={`space-y-6 ${loading ? "opacity-60 pointer-events-none transition-opacity" : "transition-opacity"}`} aria-busy={loading}>
            <Overview stock={stock} info={info} skor={skor} />
            <Technical key={stock.ticker} data={stock.historis} period={period} onPeriod={handlePeriod} />
            <Fundamental key={`f-${stock.ticker}`} info={info} />
            <Comparison compare={compare} current={ticker} onSelect={t => { load(t); window.scrollTo({ top: 0 }); }} />
          </div>
        )}
      </main>

      <footer className="px-4 md:px-8 py-6 border-t border-line text-muted text-xs flex flex-col sm:flex-row justify-between gap-2">
        <span>Data harga dan laporan keuangan dari Yahoo Finance. Harga bisa tertunda.</span>
        <span>Bukan saran investasi. Lakukan riset mandiri sebelum membeli.</span>
      </footer>
    </div>
  );
}

function Skeleton() {
  return (
    <div aria-busy="true" aria-label="Memuat data saham" className="space-y-6">
      <div className="space-y-3">
        <div className="skeleton h-4 w-48" />
        <div className="skeleton h-7 w-80 max-w-full" />
      </div>
      <div className="card h-[96px] p-5"><div className="skeleton h-full" /></div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="card lg:col-span-8 h-[290px] p-5"><div className="skeleton h-full" /></div>
        <div className="card lg:col-span-4 h-[290px] p-5 space-y-4">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-5" />)}
        </div>
      </div>
    </div>
  );
}
