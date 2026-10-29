"use client";
import { useState } from "react";

// Tabel dengan sorting per kolom dan pagination. Filter dikerjakan pemanggil (rows sudah tersaring).
export default function DataTable({ columns, rows, initialSort, pageSize = 10, caption }) {
  const [sort, setSort] = useState(initialSort ?? { key: columns[0].key, dir: "asc" });
  const [page, setPage] = useState(0);

  const sorted = [...rows].sort((a, b) => {
    const x = a[sort.key], y = b[sort.key];
    if (x == null) return 1;
    if (y == null) return -1;
    const r = x < y ? -1 : x > y ? 1 : 0;
    return sort.dir === "asc" ? r : -r;
  });
  const pages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const p = Math.min(page, pages - 1);
  const shown = sorted.slice(p * pageSize, p * pageSize + pageSize);

  function toggle(key) {
    setSort(s => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "desc" }));
    setPage(0);
  }

  return (
    <div>
      <div className="overflow-x-auto -mx-5 px-5">
        <table className="w-full min-w-[560px]">
          {caption && <caption className="sr-only">{caption}</caption>}
          <thead>
            <tr className="text-xs text-muted">
              {columns.map(c => (
                <th key={c.key} aria-sort={sort.key === c.key ? (sort.dir === "asc" ? "ascending" : "descending") : "none"}
                  className={`font-normal h-9 ${c.align === "right" ? "text-right" : "text-left"}`}>
                  <button onClick={() => toggle(c.key)}
                    className={`inline-flex items-center gap-1 hover:text-ink transition-colors ${sort.key === c.key ? "text-ink" : ""}`}>
                    {c.label}
                    <span aria-hidden="true" className="w-2">{sort.key === c.key ? (sort.dir === "asc" ? "↑" : "↓") : ""}</span>
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="num">
            {shown.map((r, i) => (
              <tr key={r.id ?? i} className="border-t border-rule h-[38px] hover:bg-raised transition-colors">
                {columns.map(c => (
                  <td key={c.key} className={c.align === "right" ? "text-right" : "text-left"}>
                    {c.format ? c.format(r[c.key], r) : r[c.key]}
                  </td>
                ))}
              </tr>
            ))}
            {shown.length === 0 && (
              <tr><td colSpan={columns.length} className="py-6 text-center text-muted font-sans">Tidak ada data pada filter ini.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between mt-3 text-xs text-muted">
        <span><span className="num text-ink">{rows.length}</span> baris</span>
        <div className="flex items-center gap-1">
          <button onClick={() => setPage(Math.max(0, p - 1))} disabled={p === 0}
            className="h-7 px-3 rounded-full border border-line hover:border-control disabled:opacity-40">Sebelumnya</button>
          <span className="num px-2">{p + 1}/{pages}</span>
          <button onClick={() => setPage(Math.min(pages - 1, p + 1))} disabled={p >= pages - 1}
            className="h-7 px-3 rounded-full border border-line hover:border-control disabled:opacity-40">Berikutnya</button>
        </div>
      </div>
    </div>
  );
}
