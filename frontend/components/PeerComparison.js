"use client";
import { useState, useEffect } from "react";
import { num, rp, rpShort, pct } from "@/lib/format";

export default function PeerComparison({ ticker, self: selfRow, onSelect }) {
  // Result is keyed by ticker; loading is simply "no result for this ticker yet".
  const [result, setResult] = useState(null);

  const API = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    let alive = true;
    fetch(`${API}/stock/${ticker}/peers`)
      .then(r => r.json())
      .then(d => alive && setResult({ ticker, data: d }))
      .catch(() => alive && setResult({ ticker, data: null }));
    return () => { alive = false; };
  }, [ticker, API]);

  const loading = result?.ticker !== ticker;
  const data = loading ? null : result.data;

  const currentKode = ticker.replace(".JK", "");
  const others = data?.peers ?? [];
  // The backend lists only the others; the viewed stock goes first so the comparison has its anchor.
  const peers = others.length && selfRow ? [selfRow, ...others.filter(p => p.ticker !== currentKode)] : others;
  // Lowest P/E among the peers that have one: the finding this table exists for.
  const pes = peers.filter(p => p.pe_ratio != null);
  const cheapest = pes.length ? pes.reduce((a, b) => (a.pe_ratio < b.pe_ratio ? a : b)) : null;

  // Median of the group (viewed stock included), so the viewed stock reads against its sector.
  const median = key => {
    const v = peers.map(p => p[key]).filter(x => x != null).sort((a, b) => a - b);
    if (!v.length) return null;
    const m = Math.floor(v.length / 2);
    return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2;
  };
  const med = { pe_ratio: median("pe_ratio"), pb_ratio: median("pb_ratio"), roe: median("roe"), npm: median("npm") };
  const me = peers.find(p => p.ticker === currentKode);

  return (
    <section className="card p-5 h-full flex flex-col" aria-labelledby="peers-judul">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 mb-3">
        <h2 id="peers-judul" className="text-base font-semibold">Peers sektor</h2>
        {cheapest && !loading && (
          <p className="text-muted">
            PER terendah: <span className="num text-ink">{cheapest.ticker}</span> <span className="num">{num(cheapest.pe_ratio, 1)}×</span>
          </p>
        )}
      </div>

      {loading && (
        <div className="space-y-3 pt-2">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-7" />)}</div>
      )}

      {!loading && peers.length === 0 && (
        <p className="text-muted py-6">
          Belum ada daftar peers untuk {currentKode}. Daftar sektor tersedia untuk bank besar, telko, otomotif, consumer, tambang, properti dan teknologi.
        </p>
      )}

      {!loading && peers.length > 0 && (
        <div className="overflow-x-auto -mx-5 px-5">
          <table className="w-full min-w-[580px]">
            <thead>
              <tr className="text-xs text-muted text-right">
                <th className="text-left font-normal h-9">Saham</th>
                <th className="font-normal">Harga</th>
                <th className="font-normal">PER</th>
                <th className="font-normal">PBV</th>
                <th className="font-normal">ROE</th>
                <th className="font-normal">NPM</th>
                <th className="font-normal">Kap. pasar</th>
              </tr>
            </thead>
            <tbody className="num text-right">
              {peers.map(p => {
                const self = p.ticker === currentKode;
                return (
                  <tr key={p.ticker} className={`border-t border-rule h-[42px] ${self ? "" : "hover:bg-raised cursor-pointer"} transition-colors`}
                    onClick={self ? undefined : () => onSelect(`${p.ticker}.JK`)}>
                    <td className="text-left font-sans">
                      {self ? (
                        <span className="text-ink border-b border-accent pb-0.5">{p.ticker}</span>
                      ) : (
                        <button className="text-ink hover:underline underline-offset-4" onClick={e => { e.stopPropagation(); onSelect(`${p.ticker}.JK`); }}>
                          {p.ticker}
                        </button>
                      )}
                      <span className="ml-2 text-muted text-xs hidden sm:inline">{p.nama}</span>
                    </td>
                    <td>{rp(p.harga)}</td>
                    <td className="text-muted">{p.pe_ratio != null ? `${num(p.pe_ratio, 1)}×` : "–"}</td>
                    <td className="text-muted">{p.pb_ratio != null ? `${num(p.pb_ratio, 1)}×` : "–"}</td>
                    <td className="text-muted">{p.roe != null ? pct(p.roe * 100, 1) : "–"}</td>
                    <td className="text-muted">{p.npm != null ? pct(p.npm * 100, 1) : "–"}</td>
                    <td className="text-muted">{rpShort(p.market_cap)}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="num text-right">
              <tr className="border-t border-control h-[42px]">
                <td className="text-left font-sans text-muted">Median grup</td>
                <td />
                <td>{med.pe_ratio != null ? `${num(med.pe_ratio, 1)}×` : "–"}</td>
                <td>{med.pb_ratio != null ? `${num(med.pb_ratio, 1)}×` : "–"}</td>
                <td>{med.roe != null ? pct(med.roe * 100, 1) : "–"}</td>
                <td>{med.npm != null ? pct(med.npm * 100, 1) : "–"}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {!loading && me?.pe_ratio != null && med.pe_ratio != null && (
        <p className="mt-auto pt-4 text-muted">
          {currentKode} diperdagangkan di PER <span className="num text-ink">{num(me.pe_ratio, 1)}×</span>,{" "}
          {me.pe_ratio < med.pe_ratio ? "lebih murah" : "lebih mahal"} dari median grup{" "}
          <span className="num text-ink">{num(med.pe_ratio, 1)}×</span>
          {me.roe != null && med.roe != null && (
            <>, dengan ROE {me.roe >= med.roe ? "di atas" : "di bawah"} median (<span className="num text-ink">{pct(me.roe * 100, 1)}</span> vs <span className="num">{pct(med.roe * 100, 1)}</span>)</>
          )}.
        </p>
      )}
    </section>
  );
}
