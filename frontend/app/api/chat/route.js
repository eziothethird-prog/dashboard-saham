export async function POST(req) {
    const { message, stockData, infoData } = await req.json();
  
    const systemContext = `
  Kamu adalah analis saham profesional yang membantu investor Indonesia.
  Jawab dalam Bahasa Indonesia, singkat, padat, dan mudah dipahami.
  Selalu tambahkan disclaimer bahwa ini bukan saran investasi resmi.
  
  Data saham ${stockData.ticker} saat ini:
  - Nama: ${infoData?.nama || stockData.ticker}
  - Harga: Rp ${stockData.harga.toLocaleString("id-ID")}
  - RSI: ${stockData.rsi} ${stockData.rsi > 70 ? "(Overbought)" : stockData.rsi < 30 ? "(Oversold)" : "(Normal)"}
  - MACD: ${stockData.macd} | Signal: ${stockData.macd_signal}
  - MA20: Rp ${stockData.ma20?.toLocaleString("id-ID")}
  - MA50: Rp ${stockData.ma50?.toLocaleString("id-ID")}
  - Rekomendasi sistem: ${stockData.rekomendasi}
  - Sektor: ${infoData?.sektor || "-"}
  - P/E Ratio: ${infoData?.pe_ratio || "-"}
  - ROE: ${infoData?.roe ? (infoData.roe * 100).toFixed(1) + "%" : "-"}
  - ROA: ${infoData?.roa != null ? (infoData.roa * 100).toFixed(1) + "%" : "-"}
  - NPM: ${infoData?.npm != null ? (infoData.npm * 100).toFixed(1) + "%" : "-"}
  - EPS: ${infoData?.eps ?? "-"}
  - PBV: ${infoData?.pb_ratio ?? "-"}
  - DER (liabilitas/ekuitas): ${infoData?.der ?? "-"}
  - Dividend yield: ${infoData?.dividend_yield != null ? infoData.dividend_yield + "%" : "-"}
  - Revenue growth tahunan: ${infoData?.revenue_growth != null ? (infoData.revenue_growth * 100).toFixed(1) + "%" : "-"}
  - Net income growth tahunan: ${infoData?.net_income_growth != null ? (infoData.net_income_growth * 100).toFixed(1) + "%" : "-"}
  `;
  
    if (!process.env.OPENROUTER_API_KEY) {
      return Response.json({ reply: "OPENROUTER_API_KEY belum diisi di frontend/.env.local. Isi lalu restart npm run dev." }, { status: 500 });
    }

    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000",
        },
        body: JSON.stringify({
          // Model gratis sering kena rate limit (429); OpenRouter pindah ke model berikutnya saat gagal.
          models: [
            "google/gemma-4-31b-it:free",
            "google/gemma-4-26b-a4b-it:free",
            "openrouter/free",
          ],
          messages: [
            { role: "system", content: systemContext },
            { role: "user",   content: message },
          ],
        }),
      });
  
      const data = await res.json();
      if (!res.ok || data.error) {
        console.error("OpenRouter error:", res.status, data.error);
        return Response.json({ reply: `AI menolak permintaan (${res.status}): ${data.error?.message || "tanpa pesan"}` }, { status: 502 });
      }
      const reply = data.choices?.[0]?.message?.content || "Tidak ada jawaban.";
      return Response.json({ reply });
  
    } catch (e) {
      console.error("OpenRouter error:", e);
      return Response.json({ reply: "Gagal menghubungi AI." }, { status: 500 });
    }
  }