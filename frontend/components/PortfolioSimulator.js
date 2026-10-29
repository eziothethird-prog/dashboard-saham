"use client";
import { useState } from "react";
import { num, rp, signed, signedPct, tone } from "@/lib/format";

function Field({ id, label, suffix, value, onChange }) {
  return (
    <div>
      <label htmlFor={id} className="block text-muted mb-1.5">{label}</label>
      <div className="relative">
        <input id={id} type="number" min="1" inputMode="numeric" value={value}
          onChange={e => onChange(Math.max(1, Number(e.target.value) || 1))}
          className="num w-full h-[34px] bg-ground border border-line rounded-md pl-3 pr-12 outline-none focus:border-control transition-colors" />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted pointer-events-none">{suffix}</span>
      </div>
    </div>
  );
}

export default function PortfolioSimulator({ harga, ticker }) {
  const [lot, setLot] = useState(10);
  const [hargaBeli, setHargaBeli] = useState(harga);

  const lembar = lot * 100;
  const modal = lembar * hargaBeli;
  const nilaiKini = lembar * harga;
  const pl = nilaiKini - modal;
  const plPct = modal > 0 ? (pl / modal) * 100 : 0;

  return (
    <section className="card p-5 h-full flex flex-col" aria-labelledby="sim-judul">
      <h2 id="sim-judul" className="text-base font-semibold mb-4">Posisi {ticker.replace(".JK", "")}</h2>

      <div className="grid grid-cols-2 gap-4 mb-5">
        <Field id="lot" label="Jumlah lot" suffix="lot" value={lot} onChange={setLot} />
        <Field id="beli" label="Harga beli" suffix="/lbr" value={hargaBeli} onChange={setHargaBeli} />
      </div>

      <dl>
        {[
          ["Jumlah saham", `${num(lembar)} lbr`],
          ["Modal", rp(modal)],
          ["Nilai di harga sekarang", rp(nilaiKini)],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4 py-2 border-b border-rule">
            <dt className="text-muted">{k}</dt>
            <dd className="num">{v}</dd>
          </div>
        ))}
        <div className="flex justify-between items-baseline gap-4 pt-3">
          <dt className="text-muted">Untung / rugi</dt>
          <dd className={`num text-right ${tone(pl)}`}>
            <span className="text-xl">{signed(pl)}</span>
            <span className="block text-xs">{signedPct(plPct)}</span>
          </dd>
        </div>
      </dl>

      <p className="text-xs text-muted mt-auto pt-4">1 lot = 100 lembar. Belum termasuk fee broker dan pajak.</p>
    </section>
  );
}
