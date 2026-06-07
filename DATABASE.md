# Database Document
# Dashboard Analisa Saham

## Tidak Ada Database Persisten

Project ini **tidak menggunakan database** (SQL/NoSQL). Semua data diambil real-time dari
Yahoo Finance setiap kali user request. Ini keputusan yang tepat untuk project ini karena:
- Data saham berubah setiap menit → cache akan stale
- Tidak ada user account → tidak perlu menyimpan data user
- Scope project: analisis, bukan trading platform

---

## Struktur Data (Response Shape)

### `/stock/{ticker}` — Data Teknikal
```json
{
  "ticker": "BBCA.JK",
  "harga": 5075.0,
  "perubahan": -350.0,
  "perubahan_pct": -6.45,
  "rsi": 21.13,
  "macd": -210.95,
  "macd_signal": -141.03,
  "ma20": 5911.25,
  "ma50": 6185.83,
  "support": 5075.0,
  "resistance": 6425.0,
  "rekomendasi": "Tahan",
  "warna": "yellow",
  "historis": [
    {
      "date": "2025-12-05",
      "open": 7856.09,
      "high": 7951.9,
      "low": 7856.09,
      "close": 7951.9,
      "volume": 71162300,
      "ma20": null,
      "ma50": null
    }
  ]
}
```

**Catatan:**
- `ma20`, `ma50` bisa `null` kalau data historis kurang dari 20/50 hari
- `perubahan` dan `perubahan_pct` dihitung dari Close[-1] vs Close[-2]
- `support` = min Low 20 hari terakhir; `resistance` = max High 20 hari terakhir
- `warna` salah satu dari: `"green"`, `"red"`, `"yellow"`

---

### `/stock/{ticker}/info` — Data Fundamental
```json
{
  "nama": "PT Bank Central Asia Tbk",
  "sektor": "Financial Services",
  "industri": "Banks - Regional",
  "market_cap": 619500000000000,
  "pe_ratio": 18.5,
  "pb_ratio": 3.2,
  "roe": 0.245,
  "eps": 1234.5,
  "dividend_yield": 0.028,
  "52w_high": 9900.0,
  "52w_low": 5000.0,
  "deskripsi": "PT Bank Central Asia Tbk..."
}
```

**Catatan:**
- Semua field bisa `null` kalau Yahoo Finance tidak punya datanya
- `roe` dalam desimal (0.245 = 24.5%); UI kalikan 100 untuk display
- `dividend_yield` dalam desimal (0.028 = 2.8%)
- `market_cap` dalam Rupiah

---

### `/stock/{ticker}/forecast` — Prediksi Harga
```json
{
  "ticker": "BBCA.JK",
  "days": 14,
  "forecast": [
    { "date": "2026-06-09", "harga": 5063.2 },
    { "date": "2026-06-10", "harga": 5051.5 }
  ]
}
```

**Metode prediksi:** rata-rata perubahan harian dari 1 tahun data historis, diaplikasikan
secara rekursif ke harga terakhir. Akurasi terbatas — untuk edukasi saja.

---

### `/stock/{ticker}/peers` — Perbandingan Peers
```json
{
  "ticker": "BBCA.JK",
  "peers": [
    {
      "ticker": "BBRI",
      "nama": "Bank Rakyat Indonesia",
      "harga": 3850.0,
      "pe_ratio": 7.04,
      "pb_ratio": 1.22,
      "roe": 0.181,
      "market_cap": 473000000000000
    }
  ]
}
```

**Catatan:** Peers diurutkan berdasarkan `market_cap` descending.
Field bisa `null` kalau Yahoo Finance tidak punya data untuk ticker tersebut.

---

## State di Frontend (React)

Tidak ada localStorage atau sessionStorage. Semua state hilang saat refresh.

| State | Type | Deskripsi |
|-------|------|-----------|
| `stockData` | object \| null | Response dari `/stock/{ticker}` |
| `infoData` | object \| null | Response dari `/stock/{ticker}/info` |
| `period` | string | Period aktif: "1mo", "3mo", "6mo", "1y", "2y" |
| `loading` | boolean | Loading indicator |
| `error` | string \| null | Pesan error |
| Chat messages | array (local) | History chat di ChatAI.js, per sesi |

---

## Rencana Caching (Belum Diimplementasi)

Kalau ingin optimasi performa sebelum deploy:

```python
# Opsi 1: in-memory cache sederhana di backend
from functools import lru_cache
import time

_cache = {}
CACHE_TTL = 300  # 5 menit

def get_cached(key, fn):
    now = time.time()
    if key in _cache and now - _cache[key]["ts"] < CACHE_TTL:
        return _cache[key]["data"]
    result = fn()
    _cache[key] = {"data": result, "ts": now}
    return result
```

```python
# Opsi 2: Redis (untuk production)
# pip install redis
import redis
r = redis.Redis()
```

Prioritas caching: endpoint `/stock/{ticker}/info` (fundamental jarang berubah)
dan `/stock/{ticker}/peers` (data lambat di-fetch karena parallel calls).
