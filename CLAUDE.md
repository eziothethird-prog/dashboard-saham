# Dashboard Analisa Saham — Konteks Project untuk Claude Code

## Gambaran Project
Dashboard analitik untuk skripsi (proposal: `Proposal_Penelitian_Luthfita_Implementasi_Dashboard_Analitik.docx`).
Evaluasi kinerja 5 emiten consumer goods BEI: CMRY, ICBP, JPFA, GGRM, MYOR (saham BEI lain tetap bisa dicari).
Satu halaman dengan 4 bagian sesuai wireframe proposal: Overview, Analisis Teknikal, Analisis Fundamental, Komparasi Emiten.
Fitur di luar proposal (proyeksi harga, chat AI, simulasi posisi, sinyal beli/jual, peers) sengaja dihapus.

## Struktur Folder
```
dashboard-saham/
├── vercel.json            # Vercel Services: /stock/* → backend, sisanya → frontend
├── frontend/              # Next.js 16
│   ├── app/page.js        # state pusat: ticker, periode, data harga, fundamental, komparasi
│   ├── components/
│   │   ├── Overview.js     # KPI (harga, volume, market cap, skor 0–100), grafik 30 hari, info emiten
│   │   ├── Technical.js    # candlestick + MA, volume, RSI/MACD (toggle), tabel OHLCV
│   │   ├── Fundamental.js  # 10 kartu FY terbaru vs th. lalu, tren per tahun, tabel per tahun + komponen laporan
│   │   ├── Comparison.js   # tabel 10 indikator × emiten (terbaik disorot), radar, peringkat skor
│   │   ├── DataTable.js    # tabel sorting + pagination
│   │   ├── SearchBar.js    # SAMPEL = 5 emiten
│   │   └── Rail.js
│   └── lib/ (format.js, indikator.js)
└── backend/main.py        # FastAPI: /stock/{t}, /stock/{t}/info, /stock/compare
```

## Data fundamental
- Dihitung dari laporan keuangan tahunan Yahoo (`income_stmt`, `balance_sheet`) dengan rumus Tabel 3.7 proposal. Tersedia FY2022–FY2025 (Yahoo hanya ±4 tahun; FY2026 belum tutup buku).
- DER = total liabilitas / ekuitas × 100% (dalam persen). PER/PBV pakai harga penutupan riil hari bursa terakhir tiap tahun; dividend yield pakai dividen yang dibayar pada tahun itu.
- Skor fundamental 0–100: min-max per indikator antar emiten pembanding, searah "lebih baik", dirata-rata (`hitung_skor` di `main.py`).

## Tech Stack
| Layer | Teknologi |
|-------|-----------|
| Frontend | Next.js 16.2.7, React 19, Tailwind CSS v4, Recharts 3 |
| Backend | FastAPI 0.136, Python, yfinance 1.4, pandas |
| Data | Yahoo Finance via yfinance (tidak ada DB lokal) |

## Environment Variables
**`frontend/.env.local`**
```
NEXT_PUBLIC_API_URL=http://localhost:8000
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
- Fokus daftar populer: consumer goods (MYOR, ICBP, INDF, UNVR, GGRM, HMSP, CMRY, JPFA).
- `/stock/{t}/info`: revenue & net income growth dihitung dari `income_stmt` tahunan (FY terbaru vs sebelumnya), DER = total liabilitas / ekuitas dari `balance_sheet`. Growth kuartalan `info` yfinance sengaja tidak dipakai (tidak stabil).

## Desain UI
- Style "data-terminal" (taste-skill app sheet, `frontend/.taste-skill/direction.json`). Token warna di `@theme` `app/globals.css` (`bg-surface`, `text-muted`, `text-positive`, dst.) — jangan pakai warna default Tailwind.
- Font: Public Sans untuk teks, IBM Plex Mono (`.num`) hanya untuk angka.
- Warna hanya di data: garis harga biru `#4a8ad6`, hijau/merah hanya untuk perubahan harga dan untung/rugi. Seleksi (tab periode, ticker aktif) = garis bawah 1px aksen.
- Format angka lewat `lib/format.js` (id-ID, tanda + / − di teks).
- `?t=BBCA` di URL langsung membuka saham.

## Bug yang Sudah Difix
- `ma50 = NaN` saat period pendek → sekarang return `None`, sudah handle di semua komponen
- MA display `"Rp undefined"` → sudah guard dengan `data.ma50 != null`
