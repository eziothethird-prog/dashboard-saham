"use client";
import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

export default function ForecastChart({ ticker }) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [days, setDays]       = useState(14);

  useEffect(() => { setData(null); }, [ticker]);

  const API = process.env.NEXT_PUBLIC_API_URL;

  async function fetchForecast() {
    setLoading(true);
    try {
      const res = await fetch(`${API}/stock/${ticker}/forecast?days=${days}`);
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-400">Prediksi Harga ke Depan</h3>
        <div className="flex items-center gap-2">
          <select
            value={days}
            onChange={e => setDays(Number(e.target.value))}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-xs outline-none">
            <option value={7}>7 hari</option>
            <option value={14}>14 hari</option>
            <option value={30}>30 hari</option>
          </select>
          <button onClick={fetchForecast} disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-3 py-1.5 rounded-lg text-xs transition">
            {loading ? "Loading..." : "Lihat Prediksi"}
          </button>
        </div>
      </div>

      {!data && !loading && (
        <div className="text-center py-10 text-gray-600 text-sm">
          Klik "Lihat Prediksi" untuk melihat estimasi harga ke depan
        </div>
      )}

      {loading && (
        <div className="text-center py-10 text-gray-500 text-sm">Menghitung prediksi...</div>
      )}

      {data && !loading && (
        <>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data.forecast}>
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#6b7280" }}
                interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} width={70}
                tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: "#111827", border: "1px solid #374151", borderRadius: 8 }}
                formatter={v => [`Rp ${v.toLocaleString("id-ID")}`, "Prediksi"]}
              />
              <ReferenceLine x={data.forecast[0]?.date} stroke="#374151"
                label={{ value: "Hari ini", fill: "#6b7280", fontSize: 11 }} />
              <Line dataKey="harga" name="Prediksi" stroke="#10b981"
                dot={{ r: 3, fill: "#10b981" }} strokeWidth={2} strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
          <p className="text-xs text-gray-600 mt-3 text-center">
            * Prediksi berdasarkan rata-rata pergerakan historis. Bukan saran investasi.
          </p>
        </>
      )}
    </div>
  );
}