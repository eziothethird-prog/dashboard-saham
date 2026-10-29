# 📈 Dashboard Analisa Saham Indonesia

Dashboard analitik evaluasi kinerja emiten consumer goods BEI (CMRY, ICBP, JPFA, GGRM, MYOR): overview, analisis teknikal, 10 indikator fundamental FY2022–FY2025, dan komparasi emiten.

> **Demo:** [dashboard-saham.vercel.app](https://dashboard-saham.vercel.app)

---

## Fitur

| Fitur | Keterangan |
|-------|-----------|
| **Grafik Harga** | Line chart harga + MA20 + MA50 + volume bar (dual Y-axis) |
| **Indikator Teknikal** | RSI(14), MACD, Support & Resistance |
| **Data Fundamental** | P/E, P/B, ROE, EPS, Market Cap, Dividend Yield, 52W High/Low |
| **Rekomendasi** | Badge Beli / Tahan / Jual otomatis berdasarkan skor RSI + MACD + MA crossover |
| **Portfolio Simulator** | Kalkulator P&L berdasarkan jumlah lot dan harga beli |

---

## Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Frontend | Next.js 16.2.7, React 19, Tailwind CSS v4, Recharts 3 |
| Backend | FastAPI, Python, yfinance, pandas |
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
```


```bash
npm run dev
```

Frontend berjalan di `http://localhost:3000`.

---

## Struktur Folder

```
dashboard-saham/
├── vercel.json                  # Vercel Services: /stock/* → backend, sisanya → frontend
├── frontend/
│   ├── app/page.js              # satu halaman: Overview, Teknikal, Fundamental, Komparasi
│   ├── components/
│   │   ├── Overview.js
│   │   ├── Technical.js
│   │   ├── Fundamental.js
│   │   ├── Comparison.js
│   │   ├── DataTable.js
│   │   ├── SearchBar.js
│   │   └── Rail.js
│   └── lib/                     # format angka, daftar 10 indikator
└── backend/
    ├── main.py                  # semua endpoint FastAPI
    └── requirements.txt
```

---

## API Endpoints

```
GET /stock/{ticker}?period=1y          → harga harian OHLCV + MA20/50, RSI, MACD (period: 1mo, 3mo, 1y, 5y)
GET /stock/{ticker}/info               → profil + 10 indikator fundamental per tahun buku (FY2022–FY2025)
GET /stock/compare?tickers=CMRY.JK,…   → fundamental beberapa emiten + skor fundamental 0–100
```

Contoh: `GET /stock/CMRY.JK?period=5y`

Semua saham Indonesia menggunakan suffix `.JK` — SearchBar otomatis menambahkannya.

---

## Deploy

Satu project Vercel dengan **Services** (`vercel.json` di root): Next.js (`frontend/`) di `/`, FastAPI (`backend/`) di `/stock/*`, satu domain.

Saat import di Vercel: Root Directory `./`, Application Preset **Services**.

Environment variable project:
```
```
`NEXT_PUBLIC_API_URL` dikosongkan di Vercel (frontend memanggil `/stock/*` di domain yang sama). Untuk lokal isi `NEXT_PUBLIC_API_URL=http://127.0.0.1:8000` di `frontend/.env.local`.

---

## Disclaimer

Data bersumber dari Yahoo Finance dan bisa mengalami keterlambatan. Dashboard ini **bukan saran investasi**. Selalu lakukan riset mandiri sebelum membuat keputusan investasi.
