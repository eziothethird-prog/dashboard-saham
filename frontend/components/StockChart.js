"use client";
import {
  ComposedChart, Line, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
} from "recharts";

export default function StockChart({ data }) {
  const formatted = data.map(d => ({
    ...d,
    date: d.date.slice(5),
  }));

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <h3 className="text-sm font-medium text-gray-400 mb-4">Grafik Harga</h3>
      <ResponsiveContainer width="100%" height={340}>
        <ComposedChart data={formatted}>
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#6b7280" }} interval="preserveStartEnd" />
          <YAxis yAxisId="price" tick={{ fontSize: 11, fill: "#6b7280" }} width={70}
            tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
          <YAxis yAxisId="volume" orientation="right" tick={{ fontSize: 10, fill: "#4b5563" }} width={55}
            tickFormatter={v => `${(v/1e6).toFixed(0)}M`} />
          <Tooltip
            contentStyle={{ background: "#111827", border: "1px solid #374151", borderRadius: 8 }}
            formatter={(v, name) =>
              name === "Volume"
                ? [`${(v/1e6).toFixed(1)}M`, name]
                : [`Rp ${v.toLocaleString("id-ID")}`, name]
            }
          />
          <Legend />
          <Bar yAxisId="volume" dataKey="volume" name="Volume" fill="#1e3a5f" opacity={0.6} />
          <Line yAxisId="price" dataKey="close" name="Harga" stroke="#3b82f6" dot={false} strokeWidth={2} />
          <Line yAxisId="price" dataKey="ma20"  name="MA20"  stroke="#f59e0b" dot={false} strokeWidth={1.5} strokeDasharray="4 4" />
          <Line yAxisId="price" dataKey="ma50"  name="MA50"  stroke="#8b5cf6" dot={false} strokeWidth={1.5} strokeDasharray="4 4" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}