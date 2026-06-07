# 📈 Dashboard Analisa Saham Indonesia

Dashboard analisis saham Indonesia real-time dengan indikator teknikal, data fundamental, prediksi harga, perbandingan peers, simulasi portofolio, dan chat AI.

> **Demo:** _(coming soon setelah deploy)_

---

## Fitur

| Fitur | Keterangan |
|-------|-----------|
| **Grafik Harga** | Line chart harga + MA20 + MA50 + volume bar (dual Y-axis) |
| **Indikator Teknikal** | RSI(14), MACD, Support & Resistance |
| **Data Fundamental** | P/E, P/B, ROE, EPS, Market Cap, Dividend Yield, 52W High/Low |
| **Rekomendasi** | Badge Beli / Tahan / Jual otomatis berdasarkan skor RSI + MACD + MA crossover |
| **Prediksi Harga** | Forecast 7 / 14 / 30 hari (on-demand) |
| **Peer Comparison** | Tabel perbandingan saham sejenis di sektor yang sama |
| **Portfolio Simulator** | Kalkulator P&L berdasarkan jumlah lot dan harga beli |
| **Chat AI** | Tanya-jawab analisis saham via AI (model Gemma via OpenRouter) |

---

## Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Frontend | Next.js 16.2.7, React 19, Tailwind CSS v4, Recharts 3 |
| Backend | FastAPI, Python, yfinance, pandas |
| AI Chat | OpenRouter API — `google/gemma-4-31b-it:free` (gratis) |
| Data | Yahoo Finance (real-time, tanpa database) |

---

## Cara Menjalankan (Local)

### Prasyarat
- Python 3.10+
- Node.js 18+

### 1. Clone repo

```bash
git clone https://github.com/<username>/dashboard-saham.git
cd dashboard-saham
```

### 2. Backend (FastAPI)

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Backend berjalan di `http://localhost:8000`.

### 3. Frontend (Next.js)

```bash
cd frontend
npm install
```

Buat file `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
OPENROUTER_API_KEY=sk-or-v1-...
```

> Dapatkan API key gratis di [openrouter.ai](https://openrouter.ai) — tidak butuh kartu kredit untuk model free tier.

```bash
npm run dev
```

Frontend berjalan di `http://localhost:3000`.

---

## Struktur Folder

```
dashboard-saham/
├── frontend/
│   ├── app/
│   │   ├── page.js              # halaman utama + state management
│   │   └── api/chat/route.js   # route handler → OpenRouter
│   └── components/
│       ├── SearchBar.js
│       ├── StockChart.js
│       ├── Indicators.js
│       ├── FundamentalCard.js
│       ├── ForecastChart.js
│       ├── PeerComparison.js
│       ├── PortfolioSimulator.js
│       └── ChatAI.js
└── backend/
    ├── main.py                  # semua endpoint FastAPI
    └── requirements.txt
```

---

## API Endpoints

```
GET /stock/{ticker}           → harga, RSI, MACD, MA, support, resistance, historis
GET /stock/{ticker}/info      → fundamental (PE, PB, ROE, dll)
GET /stock/{ticker}/forecast  → prediksi harga N hari ke depan
GET /stock/{ticker}/peers     → perbandingan saham sejenis sektor
```

Contoh: `GET /stock/BBCA.JK?period=6mo`

Semua saham Indonesia menggunakan suffix `.JK` — SearchBar otomatis menambahkannya.

---

## Deploy

| Platform | Service |
|----------|---------|
| Frontend | [Vercel](https://vercel.com) — connect GitHub, set env vars |
| Backend | [Railway](https://railway.app) — auto-detect Python, set `ALLOWED_ORIGINS` |

Environment variable di Railway:
```
ALLOWED_ORIGINS=https://dashboard-saham.vercel.app,http://localhost:3000
```

---

## Disclaimer

Data bersumber dari Yahoo Finance dan bisa mengalami keterlambatan. Prediksi harga menggunakan metode rata-rata historis sederhana — **bukan saran investasi**. Selalu lakukan riset mandiri sebelum membuat keputusan investasi.
