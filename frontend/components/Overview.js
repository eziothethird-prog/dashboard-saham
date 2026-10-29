"use client";
import { AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import { CHART, ChartTooltip, tickDate } from "@/components/Technical";
import { num, rp, rpShort, signed, signedPct, tone, tanggal, axisRp } from "@/lib/format";
import { INDIKATOR, fmtInd } from "@/lib/indikator";

const IND = Object.fromEntries(INDIKATOR.map(i => [i.key, i]));

function Kpi({ label, children, sub }) {
  return (
    <div className="px-5 py-4">
      <p className="text-muted mb-1">{label}</p>
      <p className="num text-[22px] leading-tight">{children}</p>
      {sub && <p className="text-xs mt-1">{sub}</p>}
    </div>
  );
}

export default function Overview({ stock, info, skor }) {
  const last = stock.historis.at(-1);
  // Grafik ringkas: 30 hari kalender terakhir
  const batas = new Date(new Date(last.date).getTime() - 30 * 864e5).toISOString().slice(0, 10);
  const ringkas = stock.historis.filter(h => h.date >= batas);
  const terbaru = info?.tahunan?.at(-1);

  return (
    <section id="overview" aria-labelledby="overview-judul" className="space-y-6">
      <h2 id="overview-judul" className="sr-only">Overview</h2>

      {/* KPI: satu panel dibagi garis, bukan empat kartu */}
      <div className="card grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-line">
        <Kpi label="Harga terakhir" sub={stock.perubahan != null && (
          <span className={`num ${tone(stock.perubahan)}`}>{signed(stock.perubahan)} ({signedPct(stock.perubahan_pct)})</span>
        )}>{rp(stock.harga)}</Kpi>
        <Kpi label="Volume harian" sub={<span className="text-muted">{tanggal(last.date)}</span>}>
          {num(stock.volume)} <span className="text-sm text-muted">lbr</span>
        </Kpi>
        <Kpi label="Market cap">{rpShort(info?.market_cap)}</Kpi>
        <Kpi label="Skor fundamental" sub={<span className="text-muted">{skor ? `FY${skor.tahun}, relatif ke emiten pembanding` : "data fundamental belum ada"}</span>}>
          {skor ? <>{num(skor.total, 0)}<span className="text-sm text-muted"> / 100</span></> : "–"}
        </Kpi>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="card p-5 lg:col-span-8">
          <h3 className="text-base font-semibold mb-4">Harga 30 hari terakhir</h3>
          <div className="h-[220px] -mx-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ringkas} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
                <CartesianGrid vertical={false} stroke={CHART.grid} />
                <XAxis dataKey="date" tickFormatter={tickDate} tick={{ fontSize: 11, fill: CHART.tick }}
                  tickLine={false} axisLine={{ stroke: "#3a3a3e" }} minTickGap={40} />
                <YAxis orientation="right" domain={["auto", "auto"]} tickCount={4} tickFormatter={axisRp}
                  tick={{ fontSize: 11, fill: CHART.tick, fontFamily: "var(--font-mono)" }} axisLine={false} tickLine={false} width={56} />
                <Tooltip content={<ChartTooltip />} cursor={{ stroke: "#3a3a3e" }} />
                <Area dataKey="close" name="Close" stroke={CHART.price} strokeWidth={2} fill={CHART.price} fillOpacity={0.12} isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-5 lg:col-span-4">
          <h3 className="text-base font-semibold mb-2">Info emiten</h3>
          <dl>
            {[
              ["Nama emiten", info?.nama ?? stock.ticker],
              ["Sektor", info?.sektor ?? "–"],
              ["Industri", info?.industri ?? "–"],
              [`ROE FY${terbaru?.tahun ?? ""}`, terbaru ? fmtInd(IND.roe, terbaru.roe) : "–"],
              [`PER FY${terbaru?.tahun ?? ""}`, terbaru ? fmtInd(IND.per, terbaru.per) : "–"],
              [`Dividend yield FY${terbaru?.tahun ?? ""}`, terbaru ? fmtInd(IND.dividend_yield, terbaru.dividend_yield) : "–"],
              ["Update terakhir", tanggal(last.date)],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 py-2 border-b border-rule last:border-0">
                <dt className="text-muted shrink-0">{k}</dt>
                <dd className="text-right truncate">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
