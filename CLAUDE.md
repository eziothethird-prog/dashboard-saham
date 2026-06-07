# Dashboard Analisa Saham — Konteks Project untuk Claude Code

## Gambaran Project
Web app analisa saham Indonesia real-time. User ketik kode saham (misal BBCA), dashboard
tampilkan grafik harga, indikator teknikal, data fundamental, prediksi harga, perbandingan
peers, simulasi portofolio, dan bisa tanya-jawab lewat chat AI.

## Struktur Folder
```
dashboard-saham/
├── frontend/          # Next.js 16.2.7
│   ├── app/
│   │   ├── page.js           # halaman utama, state management pusat
│   │   ├── layout.js
│   │   └── api/chat/route.js # API route → OpenRouter
│   └── components/
│       ├── SearchBar.js       # input + quick-pick saham populer
│       ├── StockChart.js      # line chart harga + volume bar (ComposedChart)
│       ├── Indicators.js      # RSI, MACD, MA20/50, Support, Resistance
│       ├── FundamentalCard.js # PE, PB, ROE, EPS, Market Cap, dll
│       ├── ForecastChart.js   # prediksi 7/14/30 hari (on-demand)
│       ├── PeerComparison.js  # tabel perbandingan peers sektor
│       ├── PortfolioSimulator.js # kalkulator P&L investasi
│       └── ChatAI.js          # floating chat (OpenRouter)
├── backend/           # FastAPI Python
│   ├── main.py        # semua endpoint dan logika
│   └── venv/
└── docs/              # file dokumentasi (CLAUDE.md, PRD.md, dll)
```

## Tech Stack
| Layer | Teknologi |
|-------|-----------|
| Frontend | Next.js 16.2.7, React 19, Tailwind CSS v4, Recharts 3 |
| Backend | FastAPI 0.136, Python, yfinance 1.4, pandas |
| AI Chat | OpenRouter API (model: `google/gemma-4-31b-it:free`) |
| Data | Yahoo Finance via yfinance (tidak ada DB lokal) |

## Environment Variables
**`frontend/.env.local`**
```
NEXT_PUBLIC_API_URL=http://localhost:8000
OPENROUTER_API_KEY=sk-or-v1-...
```

## Menjalankan Project
```bash
# Backend
cd backend && source venv/bin/activate
uvicorn main:app --reload --port 8000

# Frontend
cd frontend && npm run dev   # → localhost:3000
```

## Konvensi Penting
- Saham Indonesia pakai suffix `.JK` (BBCA → BBCA.JK). SearchBar auto-append `.JK` kalau user tidak tulis.
- `ma50` bisa `null` kalau period pendek (< 50 data poin). Semua komponen sudah handle null.
- Backend return `perubahan` dan `perubahan_pct` untuk % change harga hari ini.
- Peer comparison di-fetch otomatis saat ticker berubah; hardcode di `SEKTOR_PEERS` dict di `main.py`.
- Chat AI menggunakan OpenRouter (bukan Google Gemini langsung) karena free tier Gemini tidak tersedia.

## Bug yang Sudah Difix
- `ma50 = NaN` saat period pendek → sekarang return `None`, sudah handle di semua komponen
- ForecastChart tidak reset saat ganti ticker → fix dengan `useEffect([ticker])`
- MA display `"Rp undefined"` → sudah guard dengan `data.ma50 != null`
