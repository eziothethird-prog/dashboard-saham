import { num, rp, signed, signedPct, tone } from "@/lib/format";

function Row({ label, children, sub }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2 border-b border-rule last:border-0">
      <span className="text-muted">{label}</span>
      <span className="text-right">
        <span className="num text-ink">{children}</span>
        {sub && <span className="block text-xs text-muted">{sub}</span>}
      </span>
    </div>
  );
}

// A track with labelled ends and one marker; the fill is the true position.
function Track({ left, right, pos, ticks = [] }) {
  const p = Math.min(100, Math.max(0, pos));
  return (
    <div>
      <div className="relative h-1.5 rounded-full bg-raised">
        {ticks.map(t => <span key={t} className="absolute top-[-3px] w-px h-3 bg-control" style={{ left: `${t}%` }} />)}
        <span className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-accent border-2 border-surface"
          style={{ left: `${p}%` }} />
      </div>
      <div className="flex justify-between text-xs text-muted mt-1.5 num">
        <span>{left}</span><span>{right}</span>
      </div>
    </div>
  );
}

export default function Indicators({ data }) {
  const { rsi, macd, macd_signal, ma20, ma50, harga, support, resistance } = data;
  const rsiState = rsi > 70 ? "overbought" : rsi < 30 ? "oversold" : "netral";
  const hist = macd - macd_signal;
  const vsMa = ma => (ma ? ((harga - ma) / ma) * 100 : null);
  const range = resistance - support;
  const posRange = range > 0 ? ((harga - support) / range) * 100 : 50;

  return (
    <section className="card p-5 h-full flex flex-col gap-5" aria-labelledby="teknikal-judul">
      <h2 id="teknikal-judul" className="text-base font-semibold">Teknikal</h2>

      <div>
        <div className="flex items-baseline justify-between mb-3">
          <span className="text-muted">RSI 14 hari</span>
          <span>
            <span className="num text-xl">{num(rsi, 1)}</span>{" "}
            <span className={rsi > 70 ? "text-negative" : rsi < 30 ? "text-positive" : "text-muted"}>{rsiState}</span>
          </span>
        </div>
        <Track left="0" right="100" pos={rsi} ticks={[30, 70]} />
      </div>

      <div>
        <Row label="MACD" sub={`signal ${num(macd_signal, 2)}`}>{num(macd, 2)}</Row>
        <Row label="Histogram">
          <span className={tone(hist)}>{signed(hist, 2)}</span>
        </Row>
        <Row label="MA20" sub={ma20 != null ? `harga ${signedPct(vsMa(ma20), 1)} dari MA20` : null}>{rp(ma20)}</Row>
        <Row label="MA50" sub={ma50 != null ? `harga ${signedPct(vsMa(ma50), 1)} dari MA50` : "butuh 50 hari data"}>{rp(ma50)}</Row>
      </div>

      {support != null && resistance != null && (
        <div className="mt-auto">
          <div className="flex items-baseline justify-between mb-3">
            <span className="text-muted">Rentang 20 hari</span>
            <span className="text-xs text-muted">harga di <span className="num text-ink">{num(posRange, 0)}%</span> rentang</span>
          </div>
          <Track left={`Support ${num(support)}`} right={`Resist. ${num(resistance)}`} pos={posRange} />
        </div>
      )}
    </section>
  );
}
