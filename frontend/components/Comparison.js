"use client";
import { useState } from "react";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from "recharts";
import { INDIKATOR, KELOMPOK, fmtInd, WARNA_EMITEN } from "@/lib/indikator";
import { num } from "@/lib/format";

const kode = t => t.replace(".JK", "");

// Nilai terbaik satu baris: tertinggi, atau terendah untuk DER/PBV/PER (PER/PBV <= 0 tidak dihitung).
function terbaik(ind, nilai) {
  const valid = nilai.filter(([, v]) => v != null && !(ind.unit === "x" && v <= 0));
  if (valid.length < 2) return null;
  return valid.reduce((a, b) => ((ind.naik ? b[1] > a[1] : b[1] < a[1]) ? b : a))[0];
}

export default function Comparison({ compare, current, onSelect }) {
  const emiten = compare?.emiten ?? [];
  const semuaTahun = [...new Set(emiten.flatMap(e => e.tahunan.map(r => r.tahun)))].sort();
  const [tahun, setTahun] = useState(null);
  const [aktif, setAktif] = useState(null); // null = semua emiten
  const [kelompok, setKelompok] = useState("Semua");

  if (!emiten.length) {
    return (
      <section id="komparasi" aria-labelledby="komp-judul" className="card p-5">
        <h2 id="komp-judul" className="text-base font-semibold mb-2">Komparasi emiten</h2>
        <div className="space-y-3 pt-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-7" />)}</div>
      </section>
    );
  }

  const th = tahun ?? semuaTahun.at(-1);
  const warna = Object.fromEntries(emiten.map((e, i) => [e.ticker, WARNA_EMITEN[i % WARNA_EMITEN.length]]));
  const dipilih = emiten.filter(e => !aktif || aktif.includes(e.ticker));
  const baris = INDIKATOR.filter(i => kelompok === "Semua" || i.kelompok === kelompok);
  const nilai = (e, key) => e.tahunan.find(r => r.tahun === th)?.[key] ?? null;
  const skor = t => compare.skor?.[t]?.[th];

  function toggle(t) {
    const set = aktif ?? emiten.map(e => e.ticker);
    const next = set.includes(t) ? set.filter(x => x !== t) : [...set, t];
    if (next.length >= 2) setAktif(next.length === emiten.length ? null : next);
  }

  const radar = INDIKATOR.map(i => ({
    label: i.pendek ?? i.label,
    ...Object.fromEntries(dipilih.map(e => [e.ticker, skor(e.ticker)?.indikator?.[i.key] ?? null])),
  }));
  const skorBaris = dipilih.map(e => [e.ticker, skor(e.ticker)?.total ?? null]);
  const skorTerbaik = terbaik({ naik: true, unit: "" }, skorBaris);

  return (
    <section id="komparasi" aria-labelledby="komp-judul" className="card p-5 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <h2 id="komp-judul" className="text-base font-semibold">Komparasi emiten <span className="font-normal text-muted">FY{th}</span></h2>
        <nav aria-label="Tahun buku" className="flex border-b border-line">
          {semuaTahun.map(t => (
            <button key={t} onClick={() => setTahun(t)} aria-pressed={th === t}
              className={`num px-3 h-8 -mb-px border-b transition-colors ${th === t ? "border-accent text-ink" : "border-transparent text-muted hover:text-ink"}`}>
              FY{t}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-3 justify-between">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Emiten yang dibandingkan (minimal 2)">
          {emiten.map(e => {
            const on = !aktif || aktif.includes(e.ticker);
            return (
              <button key={e.ticker} onClick={() => toggle(e.ticker)} aria-pressed={on}
                className={`num h-8 px-3 rounded-full border flex items-center gap-2 transition-colors ${on ? "border-control text-ink" : "border-line text-faint"}`}>
                <span className="w-2 h-2 rounded-full" style={{ background: on ? warna[e.ticker] : "#3a3a3e" }} />{kode(e.ticker)}
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap gap-1 text-xs" role="group" aria-label="Filter kelompok indikator">
          {["Semua", ...KELOMPOK].map(k => (
            <button key={k} onClick={() => setKelompok(k)} aria-pressed={kelompok === k}
              className={`h-7 px-3 rounded-full transition-colors ${kelompok === k ? "bg-raised text-ink" : "text-muted hover:text-ink"}`}>
              {k}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto -mx-5 px-5">
        <table className="w-full min-w-[560px]">
          <caption className="sr-only">Perbandingan 10 indikator fundamental FY{th}</caption>
          <thead>
            <tr className="text-xs text-muted">
              <th className="text-left font-normal h-9">Indikator</th>
              {dipilih.map(e => (
                <th key={e.ticker} className="text-right font-normal">
                  <button onClick={() => onSelect(e.ticker)} title={`Buka ${e.nama}`}
                    className={`num hover:text-ink transition-colors ${e.ticker === current ? "text-ink border-b border-accent" : ""}`}>
                    {kode(e.ticker)}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="num">
            {baris.map(i => {
              const v = dipilih.map(e => [e.ticker, nilai(e, i.key)]);
              const best = terbaik(i, v);
              return (
                <tr key={i.key} className="border-t border-rule h-[38px]">
                  <td className="font-sans"><span className="text-ink">{i.label}</span> <span className="text-xs text-muted hidden sm:inline">{i.kelompok}</span></td>
                  {v.map(([t, x]) => (
                    <td key={t} className="text-right">
                      <span className={t === best ? "bg-pos-bg text-pos-ink px-1.5 py-0.5 rounded font-medium" : ""}>{fmtInd(i, x)}</span>
                    </td>
                  ))}
                </tr>
              );
            })}
            <tr className="border-t border-control h-[42px]">
              <td className="font-sans text-ink font-semibold">Skor fundamental</td>
              {skorBaris.map(([t, s]) => (
                <td key={t} className="text-right">
                  <span className={t === skorTerbaik ? "bg-pos-bg text-pos-ink px-1.5 py-0.5 rounded font-medium" : ""}>{s == null ? "–" : num(s, 0)}</span>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted">
        <span className="bg-pos-bg text-pos-ink px-1.5 py-0.5 rounded">Disorot</span> = nilai terbaik per indikator
        (tertinggi; terendah untuk DER, PBV dan PER).
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
        <div className="lg:col-span-7">
          <h3 className="mb-1"><span className="font-semibold">Radar skor indikator</span> <span className="text-muted">0 = terburuk, 100 = terbaik di antara pembanding</span></h3>
          <div className="flex flex-wrap gap-4 text-xs text-muted mb-1">
            {dipilih.map(e => (
              <span key={e.ticker} className="flex items-center gap-1.5"><span className="w-3 h-0.5" style={{ background: warna[e.ticker] }} />{kode(e.ticker)}</span>
            ))}
          </div>
          <div className="h-[320px] md:h-[380px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radar} outerRadius="68%">
                <PolarGrid stroke="#2a2a2e" />
                <PolarAngleAxis dataKey="label" tick={{ fontSize: 11, fill: "#bdbdc0" }} />
                <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                <Tooltip formatter={(v, t) => [v == null ? "–" : num(v, 0), kode(t)]}
                  contentStyle={{ background: "#212023", border: "1px solid #3a3a3e", borderRadius: 4, fontSize: 12 }} />
                {dipilih.map(e => (
                  <Radar key={e.ticker} dataKey={e.ticker} name={e.ticker} stroke={warna[e.ticker]} fill={warna[e.ticker]}
                    fillOpacity={e.ticker === current ? 0.18 : 0.04} strokeWidth={e.ticker === current ? 2 : 1.25} isAnimationActive={false} />
                ))}
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-5">
          <h3 className="font-semibold mb-3">Peringkat skor fundamental <span className="font-normal text-muted">FY{th}</span></h3>
          <ol className="space-y-3">
            {[...skorBaris].sort((a, b) => (b[1] ?? -1) - (a[1] ?? -1)).map(([t, s]) => (
              <li key={t}>
                <div className="flex items-baseline justify-between mb-1.5">
                  <span className={`num ${t === current ? "text-ink" : "text-muted"}`}>
                    <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ background: warna[t] }} />{kode(t)}
                  </span>
                  <span className="num">{s == null ? "–" : num(s, 0)}<span className="text-muted text-xs"> / 100</span></span>
                </div>
                <div className="h-1.5 rounded-full bg-raised">
                  <div className="h-full rounded-full" style={{ width: `${s ?? 0}%`, background: warna[t] }} />
                </div>
              </li>
            ))}
          </ol>
          <p className="text-xs text-muted mt-5">
            Skor tiap indikator = posisi nilai emiten di antara pembanding (min–max), searah &ldquo;lebih baik&rdquo;;
            PER/PBV negatif dihitung terburuk. Skor fundamental = rata-rata 10 skor indikator.
          </p>
        </div>
      </div>
    </section>
  );
}
