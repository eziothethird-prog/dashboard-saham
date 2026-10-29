"use client";
import {
  ComposedChart, Line, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
} from "recharts";
import { num, axisRp, signedPct, tone } from "@/lib/format";

export const CHART = {
  price: "#4a8ad6",
  ma20: "#bdbdc0",
  ma50: "#6e7076",
  volume: "#2a2a2f",
  grid: "#222224",
  tick: "#8a8c92",
};

const BULAN = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
export const tickDate = iso => `${Number(iso.slice(8, 10))} ${BULAN[Number(iso.slice(5, 7)) - 1]}`;

export function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-raised border border-control rounded px-3 py-2 text-xs">
      <p className="text-muted mb-1">{label}</p>
      {payload.filter(p => p.value != null).map(p => (
        <p key={p.dataKey} className="flex justify-between gap-6">
          <span className="text-muted">{p.name}</span>
          <span className="num text-ink">{p.dataKey === "volume" ? `${num(p.value / 1e6, 1)} jt lbr` : num(p.value)}</span>
        </p>
      ))}
    </div>
  );
}

function Key({ color, label }) {
  return (
    <span className="flex items-center gap-1.5 text-muted">
      <span className="w-3 h-0.5" style={{ background: color }} />{label}
    </span>
  );
}

const PERIOD_LABEL = { "1mo": "1 bulan", "3mo": "3 bulan", "6mo": "6 bulan", "1y": "1 tahun", "2y": "2 tahun" };

export default function StockChart({ data, period }) {
  const first = data[0]?.close;
  const last = data.at(-1)?.close;
  const change = first ? ((last - first) / first) * 100 : null;
  const maxVol = Math.max(...data.map(d => d.volume));
  const hasMa50 = data.some(d => d.ma50 != null);

  return (
    <section className="card p-5 h-full" aria-labelledby="grafik-judul">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 mb-4">
        <h2 id="grafik-judul" className="text-base font-semibold">
          Harga penutupan{" "}
          <span className="font-normal text-muted">
            {PERIOD_LABEL[period]}, <span className={`num ${tone(change)}`}>{signedPct(change)}</span>
          </span>
        </h2>
        <div className="flex gap-4 text-xs">
          <Key color={CHART.price} label="Harga" />
          <Key color={CHART.ma20} label="MA20" />
          {hasMa50 && <Key color={CHART.ma50} label="MA50" />}
          <span className="flex items-center gap-1.5 text-muted"><span className="w-2 h-2.5" style={{ background: "#3a3a3f" }} />Volume</span>
        </div>
      </div>
      <div className="h-[300px] md:h-[360px] -mx-1">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
            <CartesianGrid vertical={false} stroke={CHART.grid} />
            <XAxis dataKey="date" tickFormatter={tickDate} tick={{ fontSize: 11, fill: CHART.tick }}
              tickLine={false} axisLine={{ stroke: "#3a3a3e" }} minTickGap={48} />
            <YAxis yAxisId="price" orientation="right" domain={["auto", "auto"]} tickCount={5}
              tick={{ fontSize: 11, fill: CHART.tick, fontFamily: "var(--font-mono)" }}
              tickFormatter={axisRp} axisLine={false} tickLine={false} width={56} />
            {/* Volume lives in the bottom fifth: its axis runs to five times the peak. */}
            <YAxis yAxisId="volume" hide domain={[0, maxVol * 5]} />
            <Tooltip content={<ChartTooltip />} cursor={{ stroke: "#3a3a3e" }} />
            <Bar yAxisId="volume" dataKey="volume" name="Volume" fill="#3a3a3f" isAnimationActive={false} />
            <Line yAxisId="price" dataKey="ma50" name="MA50" stroke={CHART.ma50} dot={false} strokeWidth={1} isAnimationActive={false} />
            <Line yAxisId="price" dataKey="ma20" name="MA20" stroke={CHART.ma20} dot={false} strokeWidth={1} isAnimationActive={false} />
            <Line yAxisId="price" dataKey="close" name="Harga" stroke={CHART.price} dot={false} strokeWidth={2}
              activeDot={{ r: 4, fill: CHART.price, stroke: "#131217", strokeWidth: 2 }} isAnimationActive={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
