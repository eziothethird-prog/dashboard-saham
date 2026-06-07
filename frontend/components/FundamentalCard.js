export default function FundamentalCard({ data }) {
    const items = [
      { label: "Market Cap",     value: data.market_cap ? `Rp ${(data.market_cap/1e12).toFixed(2)}T` : "-" },
      { label: "P/E Ratio",      value: data.pe_ratio?.toFixed(2) ?? "-" },
      { label: "P/B Ratio",      value: data.pb_ratio?.toFixed(2) ?? "-" },
      { label: "ROE",            value: data.roe ? `${(data.roe * 100).toFixed(1)}%` : "-" },
      { label: "EPS",            value: data.eps?.toFixed(2) ?? "-" },
      { label: "Dividend Yield", value: data.dividend_yield ? `${(data.dividend_yield * 100).toFixed(2)}%` : "-" },
      { label: "52W High",       value: data["52w_high"] ? `Rp ${data["52w_high"].toLocaleString("id-ID")}` : "-" },
      { label: "52W Low",        value: data["52w_low"]  ? `Rp ${data["52w_low"].toLocaleString("id-ID")}` : "-" },
    ];
  
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <h3 className="text-sm font-medium text-gray-400 mb-4">Data Fundamental</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {items.map(i => (
            <div key={i.label}>
              <p className="text-xs text-gray-500">{i.label}</p>
              <p className="text-sm font-medium text-white mt-0.5">{i.value}</p>
            </div>
          ))}
        </div>
        {data.deskripsi && data.deskripsi !== "-" && (
          <p className="text-xs text-gray-500 mt-4 leading-relaxed line-clamp-3">{data.deskripsi}</p>
        )}
      </div>
    );
  }