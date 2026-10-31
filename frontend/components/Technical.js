"use client";
import { useState } from "react";
import {
  ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, ReferenceLine, Cell,
} from "recharts";
import DataTable from "@/components/DataTable";
import { num, axisRp, signedPct, tone } from "@/lib/format";

export const CHART = {
  price: "#4a8ad6",
  ma20: "#bdbdc0",
  ma50: "#6e7076",
  up: "#44a282",
  down: "#e5566f",
  volume: "#3a3a3f",
  grid: "#222224",
  tick: "#8a8c92",
};

const BULAN = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
export const tickDate = iso => `${Number(iso.slice(8, 10))} ${BULAN[Number(iso.slice(5, 7)) - 1]}`;
const tickMonth = iso => `${BULAN[Number(iso.slice(5, 7)) - 1]} ${iso.slice(2, 4)}`;

export function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const rows = d.open != null && payload.some(p => p.name === "Harga")
    ? [["Open", num(d.open)], ["High", num(d.high)], ["Low", num(d.low)], ["Close", num(d.close)]]
    : [];
  return (
    <div className="bg-raised border border-control rounded px-3 py-2 text-xs">
      <p className="text-muted mb-1">{label}</p>
      {rows.map(([k, v]) => (
        <p key={k} className="flex justify-between gap-6"><span className="text-muted">{k}</span><span className="num text-ink">{v}</span></p>
      ))}
      {payload.filter(p => p.value != null && p.name !== "Harga").map(p => (
        <p key={p.name} className="flex justify-between gap-6">
          <span className="text-muted">{p.name}</span>
          <span className="num text-ink">{p.name === "Volume" ? `${num(p.value / 1e6, 2)} jt lbr` : num(p.value, p.name === "MACD" || p.name === "Signal" ? 2 : 0)}</span>
        </p>
      ))}
    </div>
  );
}

// Candlestick dari Bar rentang [low, high]: sumbu tipis = high–low, badan = open–close.
function Candle({ x, y, width, height, payload }) {
  const { open, close, high, low } = payload;
  if (high == null || low == null) return null;
  const naik = close >= open;
  const color = naik ? CHART.up : CHART.down;
  const skala = high === low ? 0 : Math.abs(height) / (high - low);
  const top = Math.min(y, y + height);
  const bodyTop = top + (high - Math.max(open, close)) * skala;
  const bodyH = Math.max(1, Math.abs(open - close) * skala);
  const cx = x + width / 2;
  const w = Math.max(1, width * 0.7);
  return (
    <g>
      <line x1={cx} x2={cx} y1={top} y2={top + Math.abs(height)} stroke={color} strokeWidth={1} />
      {width >= 2 && <rect x={cx - w / 2} y={bodyTop} width={w} height={bodyH} fill={color} />}
    </g>
  );
}

const PERIODS = [
  { id: "1mo", label: "1B" },
  { id: "3mo", label: "3B" },
  { id: "1y", label: "1T" },
  { id: "5y", label: "5T" },
  { id: "riset", label: "2022–2025", title: "Periode penelitian: 1 Jan 2022 – 31 Des 2025" },
];

function Toggle({ checked, onChange, children }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none text-muted hover:text-ink transition-colors">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="accent-[#4a8ad6] w-3.5 h-3.5" />
      {children}
    </label>
  );
}

const axisX = (long) => ({
  dataKey: "date", tickFormatter: long ? tickMonth : tickDate, tick: { fontSize: 11, fill: CHART.tick },
  tickLine: false, axisLine: { stroke: "#3a3a3e" }, minTickGap: 48,
});
const axisY = { orientation: "right", tick: { fontSize: 11, fill: CHART.tick, fontFamily: "var(--font-mono)" }, axisLine: false, tickLine: false, width: 56 };

export default function Technical({ data, period, onPeriod }) {
  const [show, setShow] = useState({ ma: true, rsi: false, macd: false });
  const [dari, setDari] = useState("");
  const [sampai, setSampai] = useState("");
  const long = period === "5y" || period === "riset";
  const rows = data.map((d, i) => ({
    ...d,
    id: d.date,
    hist: d.macd != null && d.signal != null ? d.macd - d.signal : null,
    change: i > 0 ? ((d.close - data[i - 1].close) / data[i - 1].close) * 100 : null,
  }));
  const first = data[0]?.close, last = data.at(-1)?.close;
  const tableRows = rows.filter(r => (!dari || r.date >= dari) && (!sampai || r.date <= sampai));

  return (
    <section id="teknikal" aria-labelledby="teknikal-judul" className="card p-5 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <h2 id="teknikal-judul" className="text-base font-semibold">
          Analisis teknikal{" "}
          <span className="font-normal text-muted">
            {data[0]?.date.slice(0, 4)}–{data.at(-1)?.date.slice(0, 4)}, <span className={`num ${tone(last - first)}`}>{signedPct(first ? ((last - first) / first) * 100 : null)}</span>
          </span>
        </h2>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <nav aria-label="Periode" className="flex border-b border-line">
            {PERIODS.map(p => (
              <button key={p.id} onClick={() => onPeriod(p.id)} aria-pressed={period === p.id} title={p.title}
                className={`num px-3 h-8 -mb-px border-b transition-colors ${period === p.id ? "border-accent text-ink" : "border-transparent text-muted hover:text-ink"}`}>
                {p.label}
              </button>
            ))}
          </nav>
          <div className="flex gap-4">
            <Toggle checked={show.ma} onChange={v => setShow(s => ({ ...s, ma: v }))}>MA20/50</Toggle>
            <Toggle checked={show.rsi} onChange={v => setShow(s => ({ ...s, rsi: v }))}>RSI</Toggle>
            <Toggle checked={show.macd} onChange={v => setShow(s => ({ ...s, macd: v }))}>MACD</Toggle>
          </div>
        </div>
      </div>

      <div className="h-[300px] md:h-[340px] -mx-1">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={rows} syncId="teknikal" margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
            <CartesianGrid vertical={false} stroke={CHART.grid} />
            <XAxis {...axisX(long)} />
            <YAxis {...axisY} domain={["auto", "auto"]} tickCount={5} tickFormatter={axisRp} />
            <Tooltip content={<ChartTooltip />} cursor={{ stroke: "#3a3a3e" }} />
            <Bar dataKey={d => [d.low, d.high]} name="Harga" shape={<Candle />} isAnimationActive={false} />
            {show.ma && <Line dataKey="ma20" name="MA20" stroke={CHART.ma20} dot={false} strokeWidth={1} isAnimationActive={false} />}
            {show.ma && <Line dataKey="ma50" name="MA50" stroke={CHART.ma50} dot={false} strokeWidth={1} isAnimationActive={false} />}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div>
        <h3 className="text-muted mb-2">Volume perdagangan</h3>
        <div className="h-[110px] -mx-1">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={rows} syncId="teknikal" margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
              <CartesianGrid vertical={false} stroke={CHART.grid} />
              <XAxis {...axisX(long)} hide />
              <YAxis {...axisY} tickCount={3} tickFormatter={v => `${num(v / 1e6)}jt`} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "#ffffff08" }} />
              <Bar dataKey="volume" name="Volume" fill={CHART.volume} isAnimationActive={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {show.rsi && (
        <div>
          <h3 className="text-muted mb-2">RSI 14 hari <span className="text-xs">(garis 30 dan 70)</span></h3>
          <div className="h-[110px] -mx-1">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={rows} syncId="teknikal" margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
                <CartesianGrid vertical={false} stroke={CHART.grid} />
                <XAxis {...axisX(long)} hide />
                <YAxis {...axisY} domain={[0, 100]} ticks={[0, 30, 70, 100]} />
                <Tooltip content={<ChartTooltip />} cursor={{ stroke: "#3a3a3e" }} />
                <ReferenceLine y={70} stroke="#3a3a3e" strokeDasharray="3 3" />
                <ReferenceLine y={30} stroke="#3a3a3e" strokeDasharray="3 3" />
                <Line dataKey="rsi" name="RSI" stroke={CHART.price} dot={false} strokeWidth={1.5} isAnimationActive={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {show.macd && (
        <div>
          <h3 className="text-muted mb-2">MACD (12, 26, 9)</h3>
          <div className="h-[120px] -mx-1">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={rows} syncId="teknikal" margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
                <CartesianGrid vertical={false} stroke={CHART.grid} />
                <XAxis {...axisX(long)} hide />
                <YAxis {...axisY} tickCount={3} tickFormatter={v => num(v)} />
                <Tooltip content={<ChartTooltip />} cursor={{ stroke: "#3a3a3e" }} />
                <ReferenceLine y={0} stroke="#3a3a3e" />
                <Bar dataKey="hist" name="Histogram" isAnimationActive={false}>
                  {rows.map(r => <Cell key={r.date} fill={r.hist >= 0 ? CHART.up : CHART.down} fillOpacity={0.6} />)}
                </Bar>
                <Line dataKey="macd" name="MACD" stroke={CHART.price} dot={false} strokeWidth={1.5} isAnimationActive={false} />
                <Line dataKey="signal" name="Signal" stroke={CHART.ma20} dot={false} strokeWidth={1} isAnimationActive={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="pt-2">
        <div className="flex flex-wrap items-end justify-between gap-3 mb-2">
          <h3 className="text-base font-semibold">Data historis (OHLCV)</h3>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
            <label htmlFor="dari">Dari</label>
            <input id="dari" type="date" value={dari} min={data[0]?.date} max={data.at(-1)?.date} onChange={e => setDari(e.target.value)}
              className="num h-8 bg-ground border border-line rounded-md px-2 text-ink outline-none focus:border-control" />
            <label htmlFor="sampai">sampai</label>
            <input id="sampai" type="date" value={sampai} min={data[0]?.date} max={data.at(-1)?.date} onChange={e => setSampai(e.target.value)}
              className="num h-8 bg-ground border border-line rounded-md px-2 text-ink outline-none focus:border-control" />
            {(dari || sampai) && (
              <button onClick={() => { setDari(""); setSampai(""); }} className="h-8 px-3 rounded-full border border-line hover:border-control text-ink">Reset</button>
            )}
          </div>
        </div>
        <DataTable
          caption="Data harga harian"
          rows={tableRows}
          initialSort={{ key: "date", dir: "desc" }}
          columns={[
            { key: "date", label: "Tanggal" },
            { key: "open", label: "Open", align: "right", format: v => num(v) },
            { key: "high", label: "High", align: "right", format: v => num(v) },
            { key: "low", label: "Low", align: "right", format: v => num(v) },
            { key: "close", label: "Close", align: "right", format: v => num(v) },
            { key: "change", label: "Perubahan", align: "right", format: v => <span className={tone(v)}>{signedPct(v)}</span> },
            { key: "volume", label: "Volume", align: "right", format: v => num(v) },
          ]}
        />
      </div>
    </section>
  );
}
