// Shared number formatting: id-ID separators, fixed decimals per metric, a sign on every change.
const nf = (d) => new Intl.NumberFormat("id-ID", { minimumFractionDigits: d, maximumFractionDigits: d });

export const num = (v, d = 0) => (v == null || Number.isNaN(v) ? "–" : nf(d).format(v));
export const rp = (v, d = 0) => (v == null ? "–" : `Rp${num(v, d)}`);
export const signed = (v, d = 0) => (v == null ? "–" : `${v > 0 ? "+" : v < 0 ? "−" : ""}${num(Math.abs(v), d)}`);
export const pct = (v, d = 2) => (v == null ? "–" : `${num(v, d)}%`);
export const signedPct = (v, d = 2) => (v == null ? "–" : `${signed(v, d)}%`);

export function rpShort(v) {
  if (v == null) return "–";
  if (v >= 1e12) return `Rp${num(v / 1e12, 1)} T`;
  if (v >= 1e9) return `Rp${num(v / 1e9, 1)} M`;
  return rp(v);
}

// Axis ticks: 9.250 → "9.250", 125.000 → "125rb"
export const axisRp = (v) => (Math.abs(v) >= 100000 ? `${num(v / 1000)}rb` : num(v));

export const tone = (v) => (v > 0 ? "text-positive" : v < 0 ? "text-negative" : "text-muted");

export function tanggal(iso) {
  if (!iso) return "–";
  return new Date(iso + "T00:00:00").toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}
