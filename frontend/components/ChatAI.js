"use client";
import { useState, useRef, useEffect } from "react";

const SARAN = [
  "Apakah sekarang waktu yang baik untuk beli?",
  "Jelaskan arti RSI dan MACD saham ini",
  "Bagaimana valuasinya dibanding peers?",
];

export default function ChatAI({ open, onClose, stockData, infoData }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const kode = stockData?.ticker?.replace(".JK", "");

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onKey = e => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  async function sendMessage(text = input) {
    const userMsg = text.trim();
    if (!userMsg || loading) return;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg, stockData, infoData }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "ai", content: data.reply || "AI tidak memberi jawaban. Coba lagi." }]);
    } catch {
      setMessages(prev => [...prev, { role: "ai", content: "Gagal menghubungi AI. Coba lagi.", error: true }]);
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <aside role="dialog" aria-label={`Tanya AI tentang ${kode}`}
      className="fixed z-40 inset-0 md:inset-auto md:right-4 md:bottom-4 md:top-18 md:w-[380px]
                 bg-surface md:border md:border-control md:rounded-md shadow-[0_12px_28px_rgba(0,0,0,.4)] flex flex-col">
      <div className="h-14 px-5 flex items-center justify-between border-b border-line shrink-0">
        <h2 className="text-base font-semibold">Tanya AI <span className="num font-normal text-muted">{kode}</span></h2>
        <button onClick={onClose} aria-label="Tutup chat"
          className="w-8 h-8 grid place-items-center rounded-full text-muted hover:text-ink hover:bg-raised transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19" /></svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4" aria-live="polite">
        {messages.length === 0 && (
          <div>
            <p className="text-muted mb-3">AI membaca harga, indikator dan fundamental {kode} yang tampil di layar.</p>
            <div className="space-y-1">
              {SARAN.map(s => (
                <button key={s} onClick={() => sendMessage(s)}
                  className="block w-full text-left px-3 py-2 rounded-md text-ink hover:bg-raised transition-colors">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "flex justify-end" : ""}>
            <p className={`whitespace-pre-wrap leading-relaxed ${m.role === "user"
              ? "max-w-[85%] bg-raised px-3 py-2 rounded-md"
              : m.error ? "text-neg-ink" : "text-ink"}`}>
              {m.content}
            </p>
          </div>
        ))}
        {loading && <p className="text-muted">Menulis jawaban…</p>}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={e => { e.preventDefault(); sendMessage(); }} className="p-4 border-t border-line flex gap-2 shrink-0">
        <label htmlFor="chat-input" className="sr-only">Pertanyaan</label>
        <input id="chat-input" ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
          placeholder={`Tanya soal ${kode}…`}
          className="flex-1 h-[34px] bg-ground border border-line rounded-full px-4 outline-none focus:border-control placeholder:text-faint" />
        <button type="submit" disabled={loading || !input.trim()}
          className="h-[34px] px-4 rounded-full bg-ink text-ground font-semibold disabled:opacity-40 hover:bg-white/85 transition">
          Kirim
        </button>
      </form>
    </aside>
  );
}
