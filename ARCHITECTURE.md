# Architecture Document
# Dashboard Analisa Saham

## Diagram Sistem

```
┌─────────────────────────────────────────────┐
│                  Browser                     │
│                                             │
│  Next.js 16.2.7 (localhost:3000)            │
│  ┌─────────────────────────────────────┐    │
│  │ page.js (state pusat)               │    │
│  │  stockData, infoData, period        │    │
│  │                                     │    │
│  │  SearchBar  →  onSearch(ticker, p)  │    │
│  │  StockChart ←  stockData.historis   │    │
│  │  Indicators ←  stockData            │    │
│  │  ForecastChart ←  ticker (on-demand)│    │
│  │  FundamentalCard ← infoData         │    │
│  │  PeerComparison ← ticker (auto)     │    │
│  │  PortfolioSimulator ← harga         │    │
│  │  ChatAI ← stockData, infoData       │    │
│  └──────────────┬──────────────────────┘    │
│                 │ fetch                      │
└─────────────────┼───────────────────────────┘
                  │
         ┌────────┴────────┐
         │                 │
    /api/chat          /stock/*
    (Next.js           (FastAPI
    Route Handler)      backend)
         │                 │
         ▼                 ▼
   OpenRouter API    Yahoo Finance
   (gemma-4-31b)    (via yfinance)
```

---

## Frontend Architecture

### State Management
Tidak menggunakan Redux/Zustand. Semua state di `page.js` dan di-pass sebagai props.
Cukup untuk project ini karena tidak ada shared state antar halaman.

```js
// page.js — single source of truth
const [stockData, setStockData] = useState(null);  // data teknikal + historis
const [infoData, setInfoData]   = useState(null);  // data fundamental
const [loading, setLoading]     = useState(false);
const [error, setError]         = useState(null);
const [period, setPeriod]       = useState("6mo");
```

### Data Flow
1. User ketik ticker → `SearchBar.onSearch(ticker)` dipanggil
2. `page.js` fetch dua endpoint parallel: `/stock/{ticker}` + `/stock/{ticker}/info`
3. Response disimpan ke `stockData` dan `infoData`
4. Semua komponen re-render dengan data baru
5. `PeerComparison` auto-fetch `/stock/{ticker}/peers` via `useEffect([ticker])`
6. `ForecastChart` fetch on-demand saat user klik "Lihat Prediksi"

### Komponen & Tanggung Jawab
| Komponen | Input Props | Tanggung Jawab |
|----------|-------------|----------------|
| `SearchBar` | `onSearch`, `loading` | Input + quick-pick, format ticker |
| `StockChart` | `data` (historis[]) | Grafik harga + volume ComposedChart |
| `Indicators` | `data` (stockData) | Panel RSI/MACD/MA + Support/Resistance |
| `FundamentalCard` | `data` (infoData) | Grid 8 metrik fundamental |
| `ForecastChart` | `ticker` | Fetch on-demand, grafik prediksi |
| `PeerComparison` | `ticker` | Auto-fetch peers, tabel perbandingan |
| `PortfolioSimulator` | `harga`, `ticker` | Kalkulator P&L, pure frontend |
| `ChatAI` | `stockData`, `infoData` | Floating chat, POST ke /api/chat |

---

## Backend Architecture

### Endpoint Summary
```
GET  /                          → health check
GET  /stock/{ticker}            → harga, indikator teknikal, historis
GET  /stock/{ticker}/info       → data fundamental (Yahoo Finance .info)
GET  /stock/{ticker}/forecast   → prediksi harga N hari ke depan
GET  /stock/{ticker}/peers      → perbandingan saham sejenis
```

### Kalkulasi Indikator (main.py)
```
RSI(14)     → hitung_rsi()   : rolling gain/loss 14 periode
MACD        → hitung_macd()  : EMA12 - EMA26, signal EMA9
MA20/MA50   → pandas rolling : bisa None kalau data < N
Support     → min(Low, 20 hari terakhir)
Resistance  → max(High, 20 hari terakhir)
Perubahan   → Close[-1] - Close[-2]
```

### Rekomendasi Scoring
```python
skor = 0
RSI < 30     → +2   (oversold = potensi beli)
RSI > 70     → -2   (overbought = potensi jual)
MACD > Signal → +1
MA20 > MA50   → +1  (golden cross)

skor >= 2  → "Beli"  (green)
skor <= -2 → "Jual"  (red)
else       → "Tahan" (yellow)
```

### Peer Comparison — Concurrency
Fetch peers dilakukan parallel pakai `ThreadPoolExecutor(max_workers=4)`.
yfinance tidak async, jadi pakai thread pool untuk performa.

---

## Tech Decisions & Rationale

| Keputusan | Pilihan | Alasan |
|-----------|---------|--------|
| AI Provider | OpenRouter (bukan Gemini langsung) | Free tier Gemini quota = 0 di project ini |
| AI Model | `google/gemma-4-31b-it:free` | Gratis, response bahasa Indonesia bagus |
| Data Source | Yahoo Finance (yfinance) | Gratis, cover semua saham `.JK`, mudah pakai |
| Chart Library | Recharts | Native React, support ComposedChart (line + bar) |
| State | React useState di page.js | Cukup untuk skala project, tidak perlu Redux |
| DB | Tidak ada | Data real-time, tidak perlu persistensi |
| CSS | Tailwind v4 | Utility-first, cepat untuk prototyping |
| Caching | Belum ada | Next step sebelum deploy ke production |

---

## Deployment Plan (Fase 6)

```
Frontend → Vercel
  - connect GitHub repo
  - set env: NEXT_PUBLIC_API_URL=https://backend.railway.app
  - set env: OPENROUTER_API_KEY=sk-or-v1-...

Backend → Railway
  - Dockerfile atau Nixpacks auto-detect Python
  - set PORT env
  - CORS allow origin: https://dashboard-saham.vercel.app
```

Perlu update `allow_origins` di `main.py` sebelum deploy:
```python
allow_origins=["https://dashboard-saham.vercel.app", "http://localhost:3000"]
```
