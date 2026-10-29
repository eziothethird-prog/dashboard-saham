"use client";
import { useState, useEffect } from "react";
import { ComposedChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, ReferenceLine } from "recharts";
import { CHART, ChartTooltip, tickDate } from "@/components/StockChart";
import { rp, signedPct, tone, axisRp } from "@/lib/format";

const HORIZON = [7, 14, 30];

export default function ForecastChart({ ticker, historis }) {
  const [days, setDays] = useState(14);
  // Result is keyed by ticker and horizon; loading is "no result for this key yet".
  const [result, setResult] = useState(null);
  const key = `${ticker}|${days}`;

  const API = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    let alive = true;
    fetch(`${API}/stock/${ticker}/forecast?days=${days}`)
      .then(r => (r.ok ? r.json() : Promise.reject()))
      .then(j => alive && setResult({ key, data: j }))
      .catch(() => alive && setResult({ key, data: null }));
    return () => { alive = false; };
  }, [ticker, days, key, API]);

  const loading = result?.key !== key;
  const data = loading ? null : result.data;
  const error = !loading && !data;

  // Last 30 closes as fact, then the projection; they meet at today's close so the dashed line starts there.
  const past = historis.slice(-30);
  const today = past.at(-1);
  const rows = data
    ? [
        ...past.map(h => ({ date: h.date, harga: h.close, prediksi: h.date === today.date ? h.close : null })),
        ...data.forecast.map(f => ({ date: f.date, prediksi: f.harga })),
      ]
    : [];
  const end = data?.forecast.at(-1)?.harga;
  const delta = end && today ? ((end - today.close) / today.close) * 100 : null;

  return (
    <section className="card p-5 h-full flex flex-col" aria-labelledby="prediksi-judul">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 mb-4">
        <h2 id="prediksi-judul" className="text-base font-semibold">
          Proyeksi {days} hari{" "}
          {end != null && !loading && (
            <span className="font-normal text-muted">
              ke <span className="num text-ink">{rp(end)}</span>, <span className={`num ${tone(delta)}`}>{signedPct(delta)}</span>
            </span>
          )}
        </h2>
        <div className="flex border-b border-line" role="group" aria-label="Horizon proyeksi">
          {HORIZON.map(h => (
            <button key={h} onClick={() => setDays(h)} aria-pressed={days === h}
              className={`num px-2.5 h-8 -mb-px border-b transition-colors
                ${days === h ? "border-accent text-ink" : "border-transparent text-muted hover:text-ink"}`}>
              {h}H
            </button>
          ))}
        </div>
      </div>

      <div className="h-[220px] -mx-1">
        {loading && <div className="skeleton h-full mx-1" />}
        {error && !loading && (
          <p className="h-full grid place-items-center text-muted">Proyeksi gagal dihitung untuk kode ini.</p>
        )}
        {data && !loading && !error && (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={rows} margin={{ top: 16, right: 0, bottom: 0, left: 0 }}>
              <CartesianGrid vertical={false} stroke={CHART.grid} />
              <XAxis dataKey="date" tickFormatter={tickDate} tick={{ fontSize: 11, fill: CHART.tick }}
                tickLine={false} axisLine={{ stroke: "#3a3a3e" }} minTickGap={40} />
              <YAxis orientation="right" domain={["auto", "auto"]} tickCount={4} tickFormatter={axisRp}
                tick={{ fontSize: 11, fill: CHART.tick, fontFamily: "var(--font-mono)" }} axisLine={false} tickLine={false} width={56} />
              <Tooltip content={<ChartTooltip />} cursor={{ stroke: "#3a3a3e" }} />
              <ReferenceLine x={today.date} stroke="#3a3a3e"
                label={{ value: "Hari ini", position: "insideTopLeft", fill: CHART.tick, fontSize: 11, dy: -14 }} />
              <Line dataKey="harga" name="Harga" stroke={CHART.price} strokeWidth={2} dot={false} isAnimationActive={false} />
              <Line dataKey="prediksi" name="Proyeksi" stroke={CHART.ma20} strokeWidth={1.5} strokeDasharray="4 3"
                dot={false} connectNulls isAnimationActive={false} />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>

      <p className="text-xs text-muted mt-4">
        Garis putus-putus dihitung dari rata-rata perubahan harian setahun terakhir. Bukan prediksi pasti.
      </p>
    </section>
  );
}
