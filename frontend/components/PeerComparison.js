"use client";
import { useState, useEffect } from "react";

export default function PeerComparison({ ticker }) {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(false);

  const API = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    setData(null);
    setLoading(true);
    fetch(`${API}/stock/${ticker}/peers`)
      .then(r => r.json())
      .then(d => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [ticker]);

  if (loading) return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <h3 className="text-sm font-medium text-gray-400 mb-3">Perbandingan Peers</h3>
      <p className="text-sm text-gray-500 text-center py-6">Memuat data peers...</p>
    </div>
  );

  if (!data || data.peers.length === 0) return null;

  const currentKode = ticker.replace(".JK", "");

  const fmt = (v, prefix = "", suffix = "", digits = 2) =>
    v != null ? `${prefix}${typeof v === "number" ? v.toFixed(digits) : v}${suffix}` : "-";

  const fmtMarketCap = (v) => {
    if (!v) return "-";
    if (v >= 1e12) return `Rp ${(v / 1e12).toFixed(1)}T`;
    if (v >= 1e9)  return `Rp ${(v / 1e9).toFixed(1)}M`;
    return `Rp ${v.toLocaleString("id-ID")}`;
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <h3 className="text-sm font-medium text-gray-400 mb-4">Perbandingan Peers Sektor</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-gray-500 border-b border-gray-800">
              <th className="text-left pb-2 pr-4">Saham</th>
              <th className="text-right pb-2 pr-4">Harga</th>
              <th className="text-right pb-2 pr-4">P/E</th>
              <th className="text-right pb-2 pr-4">P/B</th>
              <th className="text-right pb-2 pr-4">ROE</th>
              <th className="text-right pb-2">Market Cap</th>
            </tr>
          </thead>
          <tbody>
            {data.peers.map(p => (
              <tr key={p.ticker}
                className={`border-b border-gray-800/50 ${p.ticker === currentKode ? "bg-blue-900/10" : ""}`}>
                <td className="py-2.5 pr-4">
                  <span className={`font-semibold ${p.ticker === currentKode ? "text-blue-400" : "text-white"}`}>
                    {p.ticker}
                  </span>
                  <span className="block text-xs text-gray-500 truncate max-w-[120px]">{p.nama}</span>
                </td>
                <td className="text-right pr-4 text-white">
                  {p.harga ? `Rp ${p.harga.toLocaleString("id-ID")}` : "-"}
                </td>
                <td className="text-right pr-4 text-gray-300">{fmt(p.pe_ratio)}</td>
                <td className="text-right pr-4 text-gray-300">{fmt(p.pb_ratio)}</td>
                <td className="text-right pr-4">
                  <span className={p.roe > 0.15 ? "text-green-400" : "text-gray-300"}>
                    {p.roe != null ? `${(p.roe * 100).toFixed(1)}%` : "-"}
                  </span>
                </td>
                <td className="text-right text-gray-300">{fmtMarketCap(p.market_cap)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-600 mt-3">* Baris biru = saham yang sedang dilihat</p>
    </div>
  );
}
