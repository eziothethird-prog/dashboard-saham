"use client";
import { useState } from "react";

export default function PortfolioSimulator({ harga, ticker }) {
  const [lot, setLot]         = useState(1);
  const [hargaBeli, setHargaBeli] = useState(harga);

  const saham       = lot * 100;
  const modal       = saham * hargaBeli;
  const nilaiKini   = saham * harga;
  const pl          = nilaiKini - modal;
  const plPct       = modal > 0 ? (pl / modal) * 100 : 0;
  const isProfit    = pl >= 0;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <h3 className="text-sm font-medium text-gray-400 mb-4">Simulasi Portofolio</h3>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="text-xs text-gray-500 block mb-1">Jumlah Lot (1 lot = 100 saham)</label>
          <input
            type="number" min="1" value={lot}
            onChange={e => setLot(Math.max(1, Number(e.target.value)))}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 transition"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Harga Beli per Lembar (Rp)</label>
          <input
            type="number" min="1" value={hargaBeli}
            onChange={e => setHargaBeli(Math.max(1, Number(e.target.value)))}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 transition"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-gray-800 rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-1">Jumlah Saham</p>
          <p className="text-base font-semibold text-white">{saham.toLocaleString("id-ID")} lembar</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-1">Modal Investasi</p>
          <p className="text-base font-semibold text-white">Rp {modal.toLocaleString("id-ID")}</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-1">Nilai Sekarang</p>
          <p className="text-base font-semibold text-white">Rp {nilaiKini.toLocaleString("id-ID")}</p>
        </div>
        <div className={`rounded-lg p-3 ${isProfit ? "bg-green-900/30 border border-green-800/50" : "bg-red-900/30 border border-red-800/50"}`}>
          <p className="text-xs text-gray-500 mb-1">Untung / Rugi</p>
          <p className={`text-base font-bold ${isProfit ? "text-green-400" : "text-red-400"}`}>
            {isProfit ? "+" : ""}Rp {pl.toLocaleString("id-ID")}
          </p>
          <p className={`text-xs mt-0.5 ${isProfit ? "text-green-500" : "text-red-500"}`}>
            {isProfit ? "+" : ""}{plPct.toFixed(2)}%
          </p>
        </div>
      </div>

      <p className="text-xs text-gray-600 mt-3">
        * Harga beli dapat diubah sesuai harga pembelian aktual. Tidak termasuk biaya broker & pajak.
      </p>
    </div>
  );
}
