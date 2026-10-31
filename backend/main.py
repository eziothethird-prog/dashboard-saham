from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from concurrent.futures import ThreadPoolExecutor
import yfinance as yf
import pandas as pd
import time
import os

# Vercel Functions hanya bisa menulis ke /tmp; yfinance menyimpan cache timezone & cookie di disk.
if os.getenv("VERCEL"):
    yf.set_tz_cache_location("/tmp/yfinance-cache")

app = FastAPI()

_raw_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,https://dashboard-saham.vercel.app")
allowed_origins = [o.strip() for o in _raw_origins.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    # Preview deployment Vercel: dashboard-saham-git-<branch>-<akun>.vercel.app
    allow_origin_regex=r"https://dashboard-saham-[a-z0-9-]+\.vercel\.app",
    allow_methods=["*"],
    allow_headers=["*"],
)

# Lima emiten sampel penelitian (Tabel 3.5 proposal).
EMITEN_SAMPEL = ["CMRY.JK", "ICBP.JK", "JPFA.JK", "GGRM.JK", "MYOR.JK"]

# 10 indikator fundamental dan arah "lebih baik" (True = makin tinggi makin baik).
INDIKATOR = {
    "roe": True, "roa": True, "eps": True, "der": False, "pbv": False,
    "npm": True, "per": False, "dividend_yield": True,
    "revenue_growth": True, "net_income_growth": True,
}

# ============================================================
# HELPER — indikator teknikal (deret penuh untuk grafik)
# ============================================================
def hitung_rsi(series, period=14):
    delta = series.diff()
    gain  = delta.clip(lower=0).rolling(period).mean()
    loss  = (-delta.clip(upper=0)).rolling(period).mean()
    return 100 - (100 / (1 + gain / loss))

def hitung_macd(series):
    macd   = series.ewm(span=12).mean() - series.ewm(span=26).mean()
    signal = macd.ewm(span=9).mean()
    return macd, signal

def bulat(v, d=2):
    return None if v is None or pd.isna(v) else round(float(v), d)

# ============================================================
# ENDPOINT 1 — health check
# ============================================================
@app.get("/")
def root():
    return {"status": "ok", "message": "Dashboard Saham API"}

# ============================================================
# ENDPOINT 2 — komparasi 5 emiten (didefinisikan sebelum /stock/{ticker})
# ============================================================
@app.get("/stock/compare")
def compare(tickers: str = ",".join(EMITEN_SAMPEL)):
    daftar = [t.strip().upper() for t in tickers.split(",") if t.strip()][:8]
    with ThreadPoolExecutor(max_workers=len(daftar) or 1) as ex:
        hasil = list(ex.map(_fundamental_aman, daftar))
    emiten = [h for h in hasil if h]
    return {"emiten": emiten, "skor": hitung_skor(emiten)}

# ============================================================
# ENDPOINT 3 — data harga historis + indikator teknikal
# ============================================================
@app.get("/stock/{ticker}")
def get_stock(ticker: str, period: str = "1y",
              start: str | None = Query(None, pattern=r"^\d{4}-\d{2}-\d{2}$"),
              end: str | None = Query(None, pattern=r"^\d{4}-\d{2}-\d{2}$")):
    try:
        # start/end (end eksklusif) untuk periode penelitian tetap, mis. 2022-01-01..2026-01-01
        t = yf.Ticker(ticker)
        df = t.history(start=start, end=end) if start else t.history(period=period)
        if df.empty:
            raise HTTPException(status_code=404, detail=f"Ticker {ticker} tidak ditemukan")

        close = df["Close"]
        df["MA20"] = close.rolling(20).mean()
        df["MA50"] = close.rolling(50).mean()
        df["RSI"] = hitung_rsi(close)
        df["MACD"], df["SIGNAL"] = hitung_macd(close)

        harga_terakhir   = round(close.iloc[-1], 2)
        harga_sebelumnya = round(close.iloc[-2], 2) if len(df) >= 2 else harga_terakhir
        perubahan        = round(harga_terakhir - harga_sebelumnya, 2)

        historis = [{
            "date":   idx.strftime("%Y-%m-%d"),
            "open":   bulat(row["Open"]),
            "high":   bulat(row["High"]),
            "low":    bulat(row["Low"]),
            "close":  bulat(row["Close"]),
            "volume": int(row["Volume"]),
            "ma20":   bulat(row["MA20"]),
            "ma50":   bulat(row["MA50"]),
            "rsi":    bulat(row["RSI"]),
            "macd":   bulat(row["MACD"], 4),
            "signal": bulat(row["SIGNAL"], 4),
        } for idx, row in df.iterrows()]

        return {
            "ticker":        ticker.upper(),
            "harga":         harga_terakhir,
            "perubahan":     perubahan,
            "perubahan_pct": round(perubahan / harga_sebelumnya * 100, 2) if harga_sebelumnya else 0,
            "volume":        int(df["Volume"].iloc[-1]),
            "historis":      historis,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================
# ENDPOINT 4 — profil + 10 indikator fundamental per tahun buku
# ============================================================
@app.get("/stock/{ticker}/info")
def get_stock_info(ticker: str):
    try:
        data = fundamental(ticker.upper())
    except LookupError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    return data

# ============================================================
# FUNDAMENTAL — dihitung dari laporan keuangan tahunan dengan rumus Tabel 3.7 proposal
# ============================================================
_CACHE: dict[str, tuple[float, dict]] = {}
_CACHE_TTL = 6 * 3600  # laporan tahunan jarang berubah; hemat panggilan ke Yahoo

def _fundamental_aman(ticker):
    try:
        return fundamental(ticker)
    except Exception:
        return None

def fundamental(ticker: str) -> dict:
    hit = _CACHE.get(ticker)
    if hit and time.time() - hit[0] < _CACHE_TTL:
        return hit[1]

    stock = yf.Ticker(ticker)
    info = stock.info
    if not info or "symbol" not in info:
        raise LookupError(f"Ticker {ticker} tidak ditemukan")

    inc, bs = stock.income_stmt, stock.balance_sheet
    # Harga penutupan riil (tanpa penyesuaian dividen) di hari bursa terakhir tiap tahun
    harga = stock.history(period="6y", auto_adjust=False)["Close"]
    harga_akhir_tahun = harga.groupby(harga.index.year).last()
    div = stock.dividends
    dps_per_tahun = div.groupby(div.index.year).sum() if not div.empty else pd.Series(dtype=float)

    def nilai(df, nama, tahun):
        for col in df.columns:
            if col.year == tahun and nama in df.index:
                v = df.loc[nama, col]
                return None if pd.isna(v) else float(v)
        return None

    def bagi(a, b, kali=1.0):
        return a / b * kali if a is not None and b not in (None, 0) else None

    def tumbuh(now, prev):
        return (now - prev) / abs(prev) * 100 if now is not None and prev not in (None, 0) else None

    tahun_tersedia = sorted({c.year for c in inc.columns} & {c.year for c in bs.columns})
    tahunan = []
    for th in tahun_tersedia:
        laba    = nilai(inc, "Net Income Common Stockholders", th) or nilai(inc, "Net Income", th)
        pendapatan = nilai(inc, "Total Revenue", th)
        ekuitas = nilai(bs, "Stockholders Equity", th)
        aset    = nilai(bs, "Total Assets", th)
        # "Total Utang" proposal = jumlah liabilitas di laporan keuangan
        utang   = nilai(bs, "Total Liabilities Net Minority Interest", th)
        saham   = nilai(bs, "Ordinary Shares Number", th) or nilai(bs, "Share Issued", th)
        if laba is None or ekuitas is None:
            continue  # kolom tahun yang kosong di Yahoo (biasanya tahun tertua)
        p   = float(harga_akhir_tahun[th]) if th in harga_akhir_tahun.index else None
        eps = bagi(laba, saham)
        bvps = bagi(ekuitas, saham)
        dps = float(dps_per_tahun[th]) if th in dps_per_tahun.index else 0.0
        tahunan.append({
            "tahun":             th,
            "roe":               bagi(laba, ekuitas, 100),
            "roa":               bagi(laba, aset, 100),
            "eps":               eps,
            "der":               bagi(utang, ekuitas, 100),
            "pbv":               bagi(p, bvps),
            "npm":               bagi(laba, pendapatan, 100),
            "per":               bagi(p, eps),
            "dividend_yield":    bagi(dps, p, 100),
            "revenue_growth":    tumbuh(pendapatan, nilai(inc, "Total Revenue", th - 1)),
            "net_income_growth": tumbuh(laba, nilai(inc, "Net Income Common Stockholders", th - 1) or nilai(inc, "Net Income", th - 1)),
            # komponen mentah, untuk validasi manual di Excel
            "laba_bersih": laba, "pendapatan": pendapatan, "ekuitas": ekuitas, "total_aset": aset,
            "total_utang": utang, "saham_beredar": saham, "harga_akhir_tahun": p, "dps": dps,
        })
    for r in tahunan:
        for k, v in r.items():
            if isinstance(v, float):
                r[k] = round(v, 4)

    def safe(key, default=None):
        v = info.get(key, default)
        return v if v not in (None, "N/A", float("inf")) else default

    data = {
        "ticker":     ticker,
        "nama":       safe("longName", ticker),
        "sektor":     safe("sector", "-"),
        "industri":   safe("industry", "-"),
        "market_cap": safe("marketCap"),
        "deskripsi":  safe("longBusinessSummary", "-"),
        "tahunan":    tahunan,
    }
    _CACHE[ticker] = (time.time(), data)
    return data

# ============================================================
# SKOR FUNDAMENTAL 0–100 — relatif terhadap emiten yang dibandingkan
# ============================================================
def hitung_skor(emiten: list[dict]) -> dict:
    """Per tahun & per indikator: min-max antar emiten (searah 'lebih baik'),
    lalu skor emiten = rata-rata nilai indikatornya x 100.
    PER/PBV <= 0 (rugi / ekuitas negatif) dianggap terburuk."""
    hasil = {e["ticker"]: {} for e in emiten}
    semua_tahun = sorted({r["tahun"] for e in emiten for r in e["tahunan"]})
    for th in semua_tahun:
        baris = {e["ticker"]: next((r for r in e["tahunan"] if r["tahun"] == th), None) for e in emiten}
        per_indikator = {t: {} for t in baris}
        for ind, naik in INDIKATOR.items():
            nilai = {t: (r or {}).get(ind) for t, r in baris.items()}
            valid = {t: v for t, v in nilai.items() if v is not None and not (ind in ("per", "pbv") and v <= 0)}
            for t, v in nilai.items():
                if v is None:
                    continue
                if t not in valid:
                    per_indikator[t][ind] = 0.0
                    continue
                lo, hi = min(valid.values()), max(valid.values())
                n = 0.5 if hi == lo else (v - lo) / (hi - lo)
                per_indikator[t][ind] = round((n if naik else 1 - n) * 100, 1)
        for t, s in per_indikator.items():
            if s:
                hasil[t][th] = {"total": round(sum(s.values()) / len(s), 1), "indikator": s}
    return hasil


# Self-check skor: yang terbaik di semua indikator dapat 100, terburuk 0.
_a = {"ticker": "A", "tahunan": [{"tahun": 1, **{k: (2 if naik else 1) for k, naik in INDIKATOR.items()}}]}
_b = {"ticker": "B", "tahunan": [{"tahun": 1, **{k: (1 if naik else 2) for k, naik in INDIKATOR.items()}}]}
assert hitung_skor([_a, _b])["A"][1]["total"] == 100 and hitung_skor([_a, _b])["B"][1]["total"] == 0
