export default function Indicators({ data }) {
  const cards = [
    { label: "RSI (14)",    value: data.rsi,
      note: data.rsi > 70 ? "Overbought" : data.rsi < 30 ? "Oversold" : "Normal",
      color: data.rsi > 70 ? "text-red-400" : data.rsi < 30 ? "text-green-400" : "text-gray-400" },
    { label: "MACD",        value: data.macd,        note: "Line",   color: "text-blue-400" },
    { label: "MACD Signal", value: data.macd_signal, note: "Signal", color: "text-purple-400" },
    { label: "MA 20", value: data.ma20 != null ? `Rp ${data.ma20.toLocaleString("id-ID")}` : "-",          note: "20 hari", color: "text-yellow-400" },
    { label: "MA 50", value: data.ma50 != null ? `Rp ${data.ma50.toLocaleString("id-ID")}` : "Data kurang", note: "50 hari", color: "text-violet-400" },
  ];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {cards.map(c => (
          <div key={c.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-1">{c.label}</p>
            <p className={`text-lg font-semibold ${c.color}`}>{c.value}</p>
            <p className="text-xs text-gray-600 mt-1">{c.note}</p>
          </div>
        ))}
      </div>

      {/* Support & Resistance */}
      {(data.support != null || data.resistance != null) && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-900 border border-green-900/40 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1">Support (20H)</p>
              <p className="text-lg font-semibold text-green-400">
                Rp {data.support?.toLocaleString("id-ID")}
              </p>
            </div>
            <span className="text-2xl opacity-30">📉</span>
          </div>
          <div className="bg-gray-900 border border-red-900/40 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1">Resistance (20H)</p>
              <p className="text-lg font-semibold text-red-400">
                Rp {data.resistance?.toLocaleString("id-ID")}
              </p>
            </div>
            <span className="text-2xl opacity-30">📈</span>
          </div>
        </div>
      )}
    </div>
  );
}