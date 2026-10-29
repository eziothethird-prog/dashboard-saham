import { num, rp, rpShort, pct, signedPct, tone } from "@/lib/format";

const times = v => (v != null ? `${num(v, 2)}×` : "–");
const ratio = (v, d = 1) => (v != null ? pct(v * 100, d) : "–");

export default function FundamentalCard({ data, harga }) {
  const hi = data["52w_high"];
  const lo = data["52w_low"];
  const pos = hi && lo && hi > lo ? Math.min(100, Math.max(0, ((harga - lo) / (hi - lo)) * 100)) : null;
  const [fyNow, fyPrev] = data.tahun_buku ?? [];

  // Grouped by the question each answers; growth carries its fiscal years as the baseline.
  const groups = [
    ["Profitabilitas", [
      ["ROE", ratio(data.roe)],
      ["ROA", ratio(data.roa)],
      ["NPM", ratio(data.npm)],
      ["EPS", data.eps != null ? rp(data.eps, 2) : "–"],
    ]],
    ["Valuasi", [
      ["PER", times(data.pe_ratio)],
      ["PBV", times(data.pb_ratio)],
      // yfinance 1.x returns dividendYield already in percent (2.85 = 2,85%)
      ["Dividend yield", pct(data.dividend_yield, 2)],
      ["Kap. pasar", rpShort(data.market_cap)],
    ]],
    ["Kesehatan & pertumbuhan", [
      ["DER", times(data.der)],
      ["Revenue growth", <span key="r" className={tone(data.revenue_growth)}>{data.revenue_growth != null ? signedPct(data.revenue_growth * 100, 1) : "–"}</span>],
      ["Net income growth", <span key="n" className={tone(data.net_income_growth)}>{data.net_income_growth != null ? signedPct(data.net_income_growth * 100, 1) : "–"}</span>],
    ]],
  ];

  return (
    <section className="card p-5 h-full flex flex-col" aria-labelledby="fund-judul">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 mb-2">
        <h2 id="fund-judul" className="text-base font-semibold">Fundamental</h2>
        {fyNow && fyPrev && <span className="text-xs text-muted">growth FY{fyNow} vs FY{fyPrev}</span>}
      </div>

      <div className="flex flex-col gap-4">
        {groups.map(([title, rows]) => (
          <div key={title}>
            <h3 className="text-xs text-muted mt-2 mb-1">{title}</h3>
            <dl className="grid grid-cols-2 gap-x-6">
              {rows.map(([label, value]) => (
                <div key={label} className="flex items-baseline justify-between gap-3 py-1.5 border-b border-rule">
                  <dt className="text-muted">{label}</dt>
                  <dd className="num text-ink text-right">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>

      {pos != null && (
        <div className="mt-5">
          <div className="flex items-baseline justify-between mb-3">
            <span className="text-muted">Rentang 52 minggu</span>
            <span className="text-xs text-muted">harga di <span className="num text-ink">{num(pos, 0)}%</span> rentang</span>
          </div>
          <div className="relative h-1.5 rounded-full bg-raised">
            <span className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-accent border-2 border-surface" style={{ left: `${pos}%` }} />
          </div>
          <div className="flex justify-between text-xs text-muted mt-1.5 num">
            <span>{num(lo)}</span><span>{num(hi)}</span>
          </div>
        </div>
      )}
    </section>
  );
}
