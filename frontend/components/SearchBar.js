"use client";
import { useState } from "react";

// Lima emiten sampel penelitian; saham BEI lain tetap bisa dicari lewat kotak pencarian.
export const SAMPEL = [
  { kode: "CMRY", nama: "Cisarua Mountain Dairy" },
  { kode: "ICBP", nama: "Indofood CBP Sukses Makmur" },
  { kode: "JPFA", nama: "Japfa Comfeed Indonesia" },
  { kode: "GGRM", nama: "Gudang Garam" },
  { kode: "MYOR", nama: "Mayora Indah" },
];

export default function SearchBar({ onSearch, loading, current }) {
  const [input, setInput] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!input.trim()) return;
    const ticker = input.trim().toUpperCase();
    onSearch(ticker.includes(".") ? ticker : `${ticker}.JK`);
    setInput("");
  }

  const currentKode = current?.replace(".JK", "");

  return (
    <div className="flex items-center gap-5 min-w-0 flex-1">
      <a href="#" className="md:hidden shrink-0" aria-label="Dashboard Saham"><Mark /></a>
      <form onSubmit={handleSubmit} role="search" className="relative w-full max-w-xs min-w-[150px] shrink">
        <label htmlFor="cari" className="sr-only">Kode saham</label>
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
        </svg>
        <input id="cari" value={input} onChange={e => setInput(e.target.value)} disabled={loading}
          placeholder="Cari saham BEI lain, mis. UNVR" autoComplete="off" spellCheck={false}
          className="w-full h-[34px] bg-surface border border-line rounded-full pl-9 pr-4 outline-none placeholder:text-faint focus:border-control transition-colors disabled:opacity-60" />
      </form>
      <div className="flex items-center gap-1 overflow-x-auto min-w-0" aria-label="Emiten sampel">
        {SAMPEL.map(({ kode, nama }) => (
          <button key={kode} onClick={() => onSearch(`${kode}.JK`)} disabled={loading} title={nama}
            className={`num px-2 h-8 border-b transition-colors disabled:opacity-50
              ${kode === currentKode ? "border-accent text-ink" : "border-transparent text-muted hover:text-ink"}`}>
            {kode}
          </button>
        ))}
      </div>
    </div>
  );
}

// Brand mark: two candles, the product's own object.
export function Mark({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 3v4M7 17v4M17 6v3M17 15v4" stroke="#8a8c92" strokeWidth="1.5" />
      <rect x="4.5" y="7" width="5" height="10" fill="#4a8ad6" />
      <rect x="14.5" y="9" width="5" height="6" fill="none" stroke="#ffffff" strokeWidth="1.5" />
    </svg>
  );
}
