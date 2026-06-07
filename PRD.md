# Product Requirements Document
# Dashboard Analisa Saham

## 1. Overview

### Problem Statement
Investor retail Indonesia kesulitan mengakses analisis saham yang komprehensif dalam satu tempat.
Tools yang ada (RTI, Stockbit) berbayar atau terlalu kompleks. Dashboard ini menyediakan analisis
teknikal + fundamental + AI gratis berbasis web.

### Target User
- Fresh investor yang baru belajar saham Indonesia
- Investor retail yang ingin second opinion cepat sebelum beli/jual
- Mahasiswa/pelajar yang belajar analisis saham

### Goal
Satu halaman yang cukup untuk membuat keputusan investasi awal: lihat grafik, cek indikator,
baca fundamental, tanya AI.

---

## 2. Fitur yang Sudah Ada (Implemented)

### F-01 · Search Saham
- Input kode saham bebas (BBCA atau BBCA.JK)
- Auto-append `.JK` untuk saham Indonesia
- 7 tombol quick-pick: BBCA, BBRI, TLKM, ASII, GOTO, BREN, BMRI

### F-02 · Grafik Harga Interaktif
- Line chart harga penutupan + MA20 + MA50 (dashed)
- Bar chart volume di layer yang sama (dual Y-axis)
- Filter periode: 1mo, 3mo, 6mo, 1y, 2y
- Tooltip dengan format Rp

### F-03 · Indikator Teknikal
- RSI (14) — label Overbought/Oversold/Normal dengan warna
- MACD line + Signal line
- MA20 dan MA50 (handle null kalau data kurang)
- Support level (min Low 20 hari terakhir)
- Resistance level (max High 20 hari terakhir)

### F-04 · Harga & Rekomendasi
- Harga terakhir (penutupan)
- Perubahan harga hari ini: nominal + persentase (hijau/merah)
- Badge rekomendasi: Beli / Tahan / Jual (berdasarkan skor RSI + MACD + MA crossover)

### F-05 · Data Fundamental
- Market Cap, P/E Ratio, P/B Ratio, ROE, EPS
- Dividend Yield, 52W High, 52W Low
- Deskripsi singkat perusahaan (3 baris, clamp)

### F-06 · Prediksi Harga (Forecast)
- On-demand (user klik tombol)
- Pilihan horizon: 7, 14, 30 hari
- Metode: rata-rata perubahan harian historis (1 tahun data)
- Grafik line dashed hijau + disclaimer

### F-07 · Peer Comparison
- Auto-load setelah ticker dipilih
- Hardcode mapping sektor (perbankan, telco, consumer, energi, dll)
- Tabel: Ticker, Harga, P/E, P/B, ROE, Market Cap
- ROE > 15% highlight hijau; baris ticker aktif highlight biru

### F-08 · Portfolio Simulator
- Input: jumlah lot (1 lot = 100 saham) dan harga beli
- Output: modal, nilai sekarang, P&L (Rp + %)
- Real-time update saat input berubah
- Disclaimer biaya broker tidak termasuk

### F-09 · Chat AI
- Floating button kanan bawah
- Context: data saham aktif dikirim ke AI setiap sesi
- Model: `google/gemma-4-31b-it:free` via OpenRouter
- History chat tersimpan di React state (hilang saat refresh)

---

## 3. Fitur yang Belum Ada (Backlog)

### B-01 · Candlestick Pattern Recognition (Medium)
- Deteksi otomatis Hammer, Doji, Engulfing, dll
- Tampil sebagai marker di atas grafik
- Kalkulasi di backend (Python)

### B-02 · News Sentiment (Hard)
- Butuh news API eksternal (Google News RSS atau NewsAPI)
- Ringkasan sentimen (Positif/Negatif/Netral) via AI
- Tidak feasible tanpa API key tambahan

### B-03 · Stock Screener (Hard)
- Filter: ROE > X%, PE < Y, dll
- Butuh scan ratusan ticker → lambat dengan Yahoo Finance
- Perlu caching atau data provider lain

### B-04 · Dividend History (Easy)
- `yf.Ticker.dividends` sudah tersedia
- Tambah chart riwayat dividen per tahun

### B-05 · Watchlist (Medium)
- Simpan daftar saham favorit di localStorage
- Dashboard mini untuk semua saham dalam watchlist

### B-06 · Deploy (Next - Fase 6)
- Frontend → Vercel
- Backend → Railway
- Set env vars di kedua platform

---

## 4. Non-Functional Requirements
- Response backend < 3 detik untuk data saham tunggal
- Peer comparison boleh lebih lama (parallel fetch 4 ticker)
- UI responsive (mobile-friendly grid)
- Tidak ada autentikasi (public tool)
- Data bersumber dari Yahoo Finance — disclaimer harga bisa delay
