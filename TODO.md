# TODO — Dashboard Analisa Saham
> Update file ini setiap selesai mengerjakan task. Tandai ✅ dan catat tanggal di progress log.

---

## Fase 1 — Setup Proyek
- [x] Init Next.js frontend (`npx create-next-app@latest frontend`)
- [x] Init FastAPI backend (`main.py`, install fastapi uvicorn yfinance pandas)
- [x] Install Tailwind CSS v4 + Recharts di frontend
- [x] Setup `.env.local` untuk API keys
- [x] Struktur folder: `dashboard-saham/frontend/` + `backend/`

---

## Fase 2 — Backend Data Saham
- [x] `GET /` — health check
- [x] `GET /stock/{ticker}` — data historis OHLCV + indikator teknikal
- [x] `GET /stock/{ticker}/info` — data fundamental (PE, PB, ROE, dll)
- [x] `GET /stock/{ticker}/forecast` — prediksi harga N hari ke depan
- [x] `GET /stock/{ticker}/peers` — perbandingan saham sejenis (concurrent fetch)
- [x] Hitung RSI(14), MACD, MA20, MA50 di backend
- [x] Hitung Support & Resistance (min/max Low/High 20 hari)
- [x] Hitung perubahan harga hari ini (nominal + persentase)
- [x] Handle `ma50 = NaN` → return `None` (fix bug JSON serialization)
- [x] Sinyal rekomendasi Beli/Jual/Tahan berdasarkan skor RSI+MACD+MA
- [x] CORS setup untuk localhost:3000
- [ ] Caching sederhana untuk endpoint yang lambat (peers, info)

---

## Fase 3 — Frontend Dashboard
- [x] `SearchBar` — input ticker + auto-append `.JK` + 7 tombol quick-pick
- [x] `StockChart` — line chart harga + MA20 + MA50 + bar volume (ComposedChart, dual Y-axis)
- [x] `Indicators` — panel RSI, MACD, MA20/50, Support, Resistance
- [x] `FundamentalCard` — 8 metrik + deskripsi perusahaan
- [x] Filter periode (1mo, 3mo, 6mo, 1y, 2y)
- [x] Badge rekomendasi Beli/Jual/Tahan dengan warna
- [x] Tampilan harga + perubahan hari ini (hijau/merah)
- [x] Empty state, loading state, error state
- [x] Layout responsive (grid cols-2 → cols-4/5 di desktop)

---

## Fase 4 — Fitur AI Analisis
- [x] `ForecastChart` — grafik prediksi on-demand (7/14/30 hari), reset saat ganti ticker
- [x] Disclaimer otomatis "Bukan saran investasi" di forecast
- [x] Sinyal rekomendasi otomatis di header dashboard

---

## Fase 5 — Chat AI
- [x] `ChatAI` — floating button kanan bawah, panel chat 420px
- [x] Inject data saham aktif (harga, RSI, MACD, rekomendasi, dll) ke system prompt
- [x] History chat disimpan di React state selama sesi
- [x] Migrasi dari `@google/generative-ai` → `@google/genai` → OpenRouter
- [x] Model: `google/gemma-4-31b-it:free` via OpenRouter (gratis, tidak butuh billing)
- [x] Error handling: tampil "Gagal menghubungi AI." kalau API error

---

## Fase 5b — Fitur Tambahan (di luar brief awal)
- [x] `PeerComparison` — tabel perbandingan PE, PB, ROE, Market Cap sejenis sektor
- [x] `PortfolioSimulator` — kalkulator P&L (lot × harga beli vs harga sekarang)
- [x] Support & Resistance levels di panel Indicators

---

## Fase 6 — Deploy & Portofolio
- [x] Update CORS di `backend/main.py` untuk allow origin Vercel (via env var `ALLOWED_ORIGINS`)
- [x] Tambah `requirements.txt` di backend/
- [ ] Deploy frontend ke Vercel (connect GitHub, set env vars)
- [ ] Test end-to-end setelah deploy
- [x] Tulis README.md dengan screenshot, demo link, tech stack

---

## Backlog (Opsional / Nice-to-have)
- [ ] Caching backend (in-memory atau Redis) untuk endpoint lambat
- [ ] Dividend history chart (`yf.Ticker.dividends` sudah tersedia)
- [ ] Watchlist — simpan saham favorit di localStorage
- [ ] Candlestick pattern recognition (Hammer, Doji, Engulfing)
- [ ] News sentiment (butuh API eksternal seperti NewsAPI)
- [ ] Stock screener (butuh scan banyak ticker, perlu optimasi)
- [ ] Dark/Light mode toggle
- [ ] Export data ke CSV

---

## Progress Log

| Tanggal | Yang Dikerjakan |
|---------|----------------|
| 2026-06-07 | Setup project, backend endpoints dasar, frontend awal berjalan |
| 2026-06-07 | Fix bug MA50 NaN → JSON error; restart backend + frontend berhasil |
| 2026-06-07 | Migrasi Gemini → OpenRouter; fix model `gemma-4-31b-it:free` |
| 2026-06-07 | Tambah volume chart, % change harga, quick-pick, fix ForecastChart reset, fix MA undefined |
| 2026-06-08 | Tambah Support/Resistance, Peer Comparison, Portfolio Simulator |
| 2026-06-08 | Buat dokumentasi: CLAUDE.md, PRD.md, ARCHITECTURE.md, DATABASE.md, TODO.md |
| 2026-06-08 | Buat requirements.txt; update CORS pakai env var ALLOWED_ORIGINS |
| 2026-06-08 | Tulis README.md lengkap (fitur, setup, API, deploy) |

---

## Status Saat Ini
**Fase yang aktif: Fase 6 (Deploy)**

Semua fitur inti sudah selesai dan berjalan di local:
- Backend: `localhost:8000`
- Frontend: `localhost:3000`

Next step: deploy ke Vercel + Railway.
