"use client";
import { useState, useRef, useEffect } from "react";

export default function ChatAI({ stockData, infoData }) {
  const [open, setOpen]       = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput]     = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef             = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
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
      setMessages(prev => [...prev, { role: "ai", content: data.reply }]);
    } catch {
      setMessages(prev => [...prev, { role: "ai", content: "Gagal menghubungi AI. Coba lagi." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open && (
        <div className="mb-3 w-80 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl flex flex-col" style={{ height: 420 }}>
          <div className="px-4 py-3 border-b border-gray-800 flex justify-between items-center">
            <span className="text-sm font-medium">Chat AI — {stockData?.ticker}</span>
            <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-white text-lg leading-none">×</button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <p className="text-xs text-gray-500 text-center mt-8">
                Tanya apa saja tentang {stockData?.ticker}!<br/>
                Contoh: "Apakah sekarang waktu yang baik untuk beli?"
              </p>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] text-xs px-3 py-2 rounded-xl leading-relaxed
                  ${m.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-800 text-gray-200"}`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-800 text-gray-400 text-xs px-3 py-2 rounded-xl">Sedang berpikir...</div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
          <div className="p-3 border-t border-gray-800 flex gap-2">
            <input value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendMessage()}
              placeholder="Ketik pertanyaan..."
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs outline-none focus:border-blue-500" />
            <button onClick={sendMessage} disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-3 py-2 rounded-lg text-xs transition">
              Kirim
            </button>
          </div>
        </div>
      )}
      <button onClick={() => setOpen(o => !o)}
        className="bg-blue-600 hover:bg-blue-700 w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-xl transition ml-auto">
        💬
      </button>
    </div>
  );
}