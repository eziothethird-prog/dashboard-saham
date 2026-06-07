"use client";
import { useState } from "react";

export default function SearchBar({ onSearch, loading }) {
  const [input, setInput] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!input.trim()) return;
    const ticker = input.trim().toUpperCase();
    const formatted = ticker.includes(".") ? ticker : `${ticker}.JK`;
    onSearch(formatted);
  }

  const populer = ["BBCA", "BBRI", "TLKM", "ASII", "GOTO", "BREN", "BMRI"];

  return (
    <div className="space-y-2">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Masukkan kode saham (contoh: BBCA atau BBCA.JK)"
          className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-500 transition"
        />
        <button type="submit" disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-5 py-2.5 rounded-lg text-sm font-medium transition">
          {loading ? "..." : "Cari"}
        </button>
      </form>
      <div className="flex gap-2 flex-wrap">
        {populer.map(kode => (
          <button key={kode} onClick={() => onSearch(`${kode}.JK`)} disabled={loading}
            className="px-3 py-1 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-gray-400 hover:text-white rounded-md text-xs transition">
            {kode}
          </button>
        ))}
      </div>
    </div>
  );
}