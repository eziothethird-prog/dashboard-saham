import { num } from "@/lib/format";

// 10 indikator fundamental proposal (Tabel 3.7). naik = makin tinggi makin baik.
export const INDIKATOR = [
  { key: "roe", label: "ROE", nama: "Return on Equity", unit: "%", naik: true, kelompok: "Profitabilitas" },
  { key: "roa", label: "ROA", nama: "Return on Assets", unit: "%", naik: true, kelompok: "Profitabilitas" },
  { key: "eps", label: "EPS", nama: "Earnings per Share", unit: "Rp", naik: true, kelompok: "Profitabilitas" },
  { key: "npm", label: "NPM", nama: "Net Profit Margin", unit: "%", naik: true, kelompok: "Profitabilitas" },
  { key: "der", label: "DER", nama: "Debt to Equity Ratio", unit: "%", naik: false, kelompok: "Solvabilitas" },
  { key: "pbv", label: "PBV", nama: "Price to Book Value", unit: "x", naik: false, kelompok: "Valuasi" },
  { key: "per", label: "PER", nama: "Price to Earnings Ratio", unit: "x", naik: false, kelompok: "Valuasi" },
  { key: "dividend_yield", label: "Dividend Yield", pendek: "Div. Yield", nama: "Dividen / harga", unit: "%", naik: true, kelompok: "Return investor" },
  { key: "revenue_growth", label: "Revenue Growth", pendek: "Rev. Growth", nama: "Pertumbuhan pendapatan", unit: "%", naik: true, kelompok: "Pertumbuhan" },
  { key: "net_income_growth", label: "Net Income Growth", pendek: "NI Growth", nama: "Pertumbuhan laba bersih", unit: "%", naik: true, kelompok: "Pertumbuhan" },
];

export const KELOMPOK = ["Profitabilitas", "Solvabilitas", "Valuasi", "Return investor", "Pertumbuhan"];

export function fmtInd(ind, v) {
  if (v == null) return "–";
  if (ind.unit === "%") return `${num(v, 2)}%`;
  if (ind.unit === "x") return `${num(v, 2)}×`;
  return `Rp${num(v, 2)}`;
}

// Selisih terhadap tahun lalu dalam satuan indikator (poin persen untuk %).
export function fmtDelta(ind, d) {
  if (d == null) return null;
  const s = d > 0 ? "+" : d < 0 ? "−" : "";
  const a = Math.abs(d);
  if (ind.unit === "%") return `${s}${num(a, 2)} poin`;
  if (ind.unit === "x") return `${s}${num(a, 2)}×`;
  return `${s}Rp${num(a, 2)}`;
}

// Warna ikut baik/buruk, bukan naik/turun: DER, PBV, PER lebih baik kalau turun.
export const deltaTone = (ind, d) => (d == null || d === 0 ? "text-muted" : (d > 0) === ind.naik ? "text-positive" : "text-negative");

// Satu warna per emiten di seluruh layar (kategori, bukan status).
export const WARNA_EMITEN = ["#4a8ad6", "#e0a43a", "#5fc39c", "#d46a9a", "#b8a1e3", "#8a8c92"];
