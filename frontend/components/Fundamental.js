"use client";
import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, ReferenceLine, LabelList } from "recharts";
import { CHART } from "@/components/Technical";
import { INDIKATOR, fmtInd, fmtDelta, deltaTone } from "@/lib/indikator";
import { num } from "@/lib/format";

const KOMPONEN = [
  ["laba_bersih", "Laba bersih (ke induk)"],
  ["pendapatan", "Pendapatan"],
  ["total_aset", "Total aset"],
  ["total_utang", "Total utang (liabilitas)"],
  ["ekuitas", "Ekuitas"],
  ["saham_beredar", "Saham beredar (lembar)"],
  ["harga_akhir_tahun", "Harga penutupan akhir tahun"],
  ["dps", "Dividen per saham dibayar"],
];

export default function Fundamental({ info }) {
  const [pilih, setPilih] = useState("roe");
  const rows = info?.tahunan ?? [];

  if (!rows.length) {
    return (
      <section id="fundamental" aria-labelledby="fund-judul" className="card p-5">
        <h2 id="fund-judul" className="text-base font-semibold mb-2">Analisis fundamental</h2>
        <p className="text-muted">Laporan keuangan tahunan untuk kode ini tidak tersedia di Yahoo Finance.</p>
      </section>
    );
  }

  const now = rows.at(-1), prev = rows.at(-2);
  const ind = INDIKATOR.find(i => i.key === pilih);
  const tahun = rows.map(r => r.tahun);

  return (
    <section id="fundamental" aria-labelledby="fund-judul" className="card p-5 space-y-5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h2 id="fund-judul" className="text-base font-semibold">
          10 indikator fundamental <span className="font-normal text-muted">FY{tahun[0]}–FY{tahun.at(-1)}</span>
        </h2>
        <p className="text-xs text-muted">Kartu: FY{now.tahun} vs FY{prev?.tahun ?? "–"}. Klik kartu untuk melihat trennya.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-px bg-line border border-line rounded-md overflow-hidden">
        {INDIKATOR.map(i => {
          const d = now[i.key] != null && prev?.[i.key] != null ? now[i.key] - prev[i.key] : null;
          const aktif = pilih === i.key;
          return (
            <button key={i.key} onClick={() => setPilih(i.key)} aria-pressed={aktif}
              className={`text-left px-4 py-3 bg-surface hover:bg-raised transition-colors relative ${aktif ? "bg-raised" : ""}`}>
              {aktif && <span className="absolute left-4 right-4 bottom-0 h-px bg-accent" aria-hidden="true" />}
              <span className="block text-ink font-semibold">{i.label}</span>
              <span className="block text-xs text-muted truncate">{i.nama}</span>
              <span className="block num text-lg mt-1.5">{fmtInd(i, now[i.key])}</span>
              <span className={`block num text-xs ${deltaTone(i, d)}`}>{fmtDelta(i, d) ?? "–"}<span className="text-muted font-sans"> vs th. lalu</span></span>
            </button>
          );
        })}
      </div>

      <div>
        <h3 className="mb-3"><span className="font-semibold">Tren {ind.label}</span> <span className="text-muted">per tahun buku</span></h3>
        <div className="h-[220px] -mx-1">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={rows} margin={{ top: 24, right: 40, bottom: 0, left: 8 }}>
              <CartesianGrid vertical={false} stroke={CHART.grid} />
              <XAxis dataKey="tahun" padding={{ left: 24, right: 8 }} tickFormatter={t => `FY${t}`} tick={{ fontSize: 11, fill: CHART.tick }} tickLine={false} axisLine={{ stroke: "#3a3a3e" }} />
              <YAxis tickCount={4} tick={{ fontSize: 11, fill: CHART.tick, fontFamily: "var(--font-mono)" }}
                axisLine={false} tickLine={false} width={56} tickFormatter={v => num(v, ind.unit === "x" ? 1 : 0)} />
              {ind.unit === "%" && <ReferenceLine y={0} stroke="#3a3a3e" />}
              <Tooltip formatter={v => [fmtInd(ind, v), ind.label]} labelFormatter={t => `FY${t}`}
                contentStyle={{ background: "#212023", border: "1px solid #3a3a3e", borderRadius: 4, fontSize: 12 }} />
              <Line dataKey={ind.key} stroke={CHART.price} strokeWidth={2} dot={{ r: 3, fill: CHART.price }} connectNulls={false} isAnimationActive={false}>
                <LabelList dataKey={ind.key} position="top" formatter={v => (v == null ? "" : fmtInd(ind, v))}
                  style={{ fontSize: 11, fill: "#ffffff", fontFamily: "var(--font-mono)" }} />
              </Line>
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="overflow-x-auto -mx-5 px-5">
        <table className="w-full min-w-[520px]">
          <caption className="text-left mb-2"><span className="font-semibold">Nilai per tahun</span> <span className="text-muted">untuk validasi dengan perhitungan Excel</span></caption>
          <thead>
            <tr className="text-xs text-muted">
              <th className="text-left font-normal h-9">Indikator</th>
              {tahun.map(t => <th key={t} className="text-right font-normal">FY{t}</th>)}
            </tr>
          </thead>
          <tbody className="num">
            {INDIKATOR.map(i => (
              <tr key={i.key} className={`border-t border-rule h-[38px] ${pilih === i.key ? "bg-raised" : ""}`}>
                <td className="font-sans text-muted">{i.label}</td>
                {rows.map(r => <td key={r.tahun} className="text-right">{fmtInd(i, r[i.key])}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <details className="group">
        <summary className="cursor-pointer text-muted hover:text-ink select-none">Komponen laporan keuangan yang dipakai (Rp)</summary>
        <div className="overflow-x-auto -mx-5 px-5 mt-2">
          <table className="w-full min-w-[520px]">
            <tbody className="num">
              {KOMPONEN.map(([k, label]) => (
                <tr key={k} className="border-t border-rule h-[36px]">
                  <td className="font-sans text-muted">{label}</td>
                  {rows.map(r => <td key={r.tahun} className="text-right">{num(r[k])}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-xs text-muted mt-3">
            Sumber: laporan keuangan tahunan via Yahoo Finance. PER dan PBV memakai harga penutupan hari bursa terakhir tiap tahun;
            dividend yield memakai dividen yang dibayarkan pada tahun tersebut.
          </p>
        </div>
      </details>
    </section>
  );
}
