from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from concurrent.futures import ThreadPoolExecutor, as_completed
import yfinance as yf
import pandas as pd
from datetime import datetime
import os

app = FastAPI()

_raw_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000")
allowed_origins = [o.strip() for o in _raw_origins.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================
# HELPER — hitung indikator teknikal
# ============================================================
def hitung_rsi(series, period=14):
    delta = series.diff()
    gain  = delta.clip(lower=0).rolling(period).mean()
    loss  = (-delta.clip(upper=0)).rolling(period).mean()
    rs    = gain / loss
    return (100 - (100 / (1 + rs))).iloc[-1].round(2)

def hitung_macd(series):
    ema12  = series.ewm(span=12).mean()
    ema26  = series.ewm(span=26).mean()
    macd   = ema12 - ema26
    signal = macd.ewm(span=9).mean()
    return round(macd.iloc[-1], 4), round(signal.iloc[-1], 4)

def sinyal_rekomendasi(rsi, macd, macd_signal, ma20, ma50, harga):
    skor = 0
    # RSI
    if rsi < 30:   skor += 2   # oversold → beli
    elif rsi > 70: skor -= 2   # overbought → jual
    # MACD crossover
    if macd > macd_signal: skor += 1
    else:                  skor -= 1
    # MA crossover
    if ma20 is not None and ma50 is not None:
        if ma20 > ma50: skor += 1
        else:           skor -= 1

    if skor >= 2:    return "Beli", "green"
    elif skor <= -2: return "Jual", "red"
    else:            return "Tahan", "yellow"

# ============================================================
# ENDPOINT 1 — health check
# ============================================================
@app.get("/")
def root():
    return {"status": "ok", "message": "Dashboard Saham API"}

# ============================================================
# ENDPOINT 2 — data harga historis + indikator
# ============================================================
@app.get("/stock/{ticker}")
def get_stock(ticker: str, period: str = "6mo"):
    try:
        stock = yf.Ticker(ticker)
        df    = stock.history(period=period)

        if df.empty:
            raise HTTPException(status_code=404, detail=f"Ticker {ticker} tidak ditemukan")

        # Hitung indikator
        df["MA20"] = df["Close"].rolling(20).mean()
        df["MA50"] = df["Close"].rolling(50).mean()
        rsi              = hitung_rsi(df["Close"])
        macd, macd_sig   = hitung_macd(df["Close"])
        ma20             = round(df["MA20"].iloc[-1], 2) if not pd.isna(df["MA20"].iloc[-1]) else None
        ma50             = round(df["MA50"].iloc[-1], 2) if not pd.isna(df["MA50"].iloc[-1]) else None
        harga_terakhir   = round(df["Close"].iloc[-1], 2)
        harga_sebelumnya = round(df["Close"].iloc[-2], 2) if len(df) >= 2 else harga_terakhir
        lookback   = min(20, len(df))
        support    = round(df["Low"].tail(lookback).min(), 2)
        resistance = round(df["High"].tail(lookback).max(), 2)
        perubahan        = round(harga_terakhir - harga_sebelumnya, 2)
        perubahan_pct    = round((perubahan / harga_sebelumnya) * 100, 2) if harga_sebelumnya else 0
        rekomendasi, warna = sinyal_rekomendasi(rsi, macd, macd_sig, ma20, ma50, harga_terakhir)

        # Format data historis untuk grafik
        historis = []
        for idx, row in df.iterrows():
            historis.append({
                "date":   idx.strftime("%Y-%m-%d"),
                "open":   round(row["Open"],  2),
                "high":   round(row["High"],  2),
                "low":    round(row["Low"],   2),
                "close":  round(row["Close"], 2),
                "volume": int(row["Volume"]),
                "ma20":   round(row["MA20"], 2) if not pd.isna(row["MA20"]) else None,
                "ma50":   round(row["MA50"], 2) if not pd.isna(row["MA50"]) else None,
            })

        return {
            "ticker":       ticker.upper(),
            "harga":        harga_terakhir,
            "perubahan":    perubahan,
            "perubahan_pct": perubahan_pct,
            "rsi":          rsi,
            "macd":         macd,
            "macd_signal":  macd_sig,
            "ma20":         ma20,
            "ma50":         ma50,
            "rekomendasi":  rekomendasi,
            "warna":        warna,
            "support":      support,
            "resistance":   resistance,
            "historis":     historis,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================
# ENDPOINT 3 — data fundamental
# ============================================================
@app.get("/stock/{ticker}/info")
def get_stock_info(ticker: str):
    try:
        stock = yf.Ticker(ticker)
        info  = stock.info

        if not info or "symbol" not in info:
            raise HTTPException(status_code=404, detail=f"Ticker {ticker} tidak ditemukan")

        def safe(key, default=None):
            val = info.get(key, default)
            return val if val not in [None, "N/A", float("inf")] else default

        return {
            "nama":           safe("longName", ticker),
            "sektor":         safe("sector", "-"),
            "industri":       safe("industry", "-"),
            "market_cap":     safe("marketCap"),
            "pe_ratio":       safe("trailingPE"),
            "pb_ratio":       safe("priceToBook"),
            "roe":            safe("returnOnEquity"),
            "eps":            safe("trailingEps"),
            "dividend_yield": safe("dividendYield"),
            "52w_high":       safe("fiftyTwoWeekHigh"),
            "52w_low":        safe("fiftyTwoWeekLow"),
            "deskripsi":      safe("longBusinessSummary", "-"),
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================
# ENDPOINT 4 — forecasting sederhana (Moving Average)
# ============================================================
@app.get("/stock/{ticker}/forecast")
def get_forecast(ticker: str, days: int = 14):
    try:
        stock = yf.Ticker(ticker)
        df    = stock.history(period="1y")

        if df.empty:
            raise HTTPException(status_code=404, detail=f"Ticker {ticker} tidak ditemukan")

        # Prediksi pakai rata-rata perubahan harian
        closes        = df["Close"]
        avg_change    = closes.pct_change().mean()
        harga_terakhir = closes.iloc[-1]

        forecast = []
        harga = harga_terakhir
        for i in range(1, days + 1):
            harga = harga * (1 + avg_change)
            tanggal = pd.Timestamp.now() + pd.Timedelta(days=i)
            forecast.append({
                "date":  tanggal.strftime("%Y-%m-%d"),
                "harga": round(harga, 2),
            })

        return {
            "ticker":   ticker.upper(),
            "days":     days,
            "forecast": forecast,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================
# ENDPOINT 5 — peer comparison
# ============================================================
SEKTOR_PEERS = {
    "BBCA": ["BBRI.JK", "BMRI.JK", "BBNI.JK", "BNGA.JK"],
    "BBRI": ["BBCA.JK", "BMRI.JK", "BBNI.JK", "BNGA.JK"],
    "BMRI": ["BBCA.JK", "BBRI.JK", "BBNI.JK", "BNGA.JK"],
    "BBNI": ["BBCA.JK", "BBRI.JK", "BMRI.JK", "BNGA.JK"],
    "BNGA": ["BBCA.JK", "BBRI.JK", "BMRI.JK", "BBNI.JK"],
    "BRIS": ["BBCA.JK", "BBRI.JK", "BMRI.JK", "BBNI.JK"],
    "TLKM": ["EXCL.JK", "ISAT.JK", "FREN.JK"],
    "EXCL": ["TLKM.JK", "ISAT.JK", "FREN.JK"],
    "ISAT": ["TLKM.JK", "EXCL.JK", "FREN.JK"],
    "ASII": ["AUTO.JK", "SMSM.JK", "INDS.JK"],
    "UNVR": ["ICBP.JK", "MYOR.JK", "INDF.JK"],
    "ICBP": ["UNVR.JK", "MYOR.JK", "INDF.JK"],
    "MYOR": ["UNVR.JK", "ICBP.JK", "INDF.JK"],
    "GOTO": ["BUKA.JK", "EMTK.JK"],
    "BUKA": ["GOTO.JK", "EMTK.JK"],
    "ADRO": ["PTBA.JK", "ITMG.JK", "HRUM.JK"],
    "PTBA": ["ADRO.JK", "ITMG.JK", "HRUM.JK"],
    "ITMG": ["ADRO.JK", "PTBA.JK", "HRUM.JK"],
    "ANTM": ["MDKA.JK", "INCO.JK"],
    "MDKA": ["ANTM.JK", "INCO.JK"],
    "BREN": ["AKRA.JK", "RAJA.JK"],
    "SMRA": ["BSDE.JK", "CTRA.JK", "PWON.JK"],
    "BSDE": ["SMRA.JK", "CTRA.JK", "PWON.JK"],
}

def _fetch_peer(ticker_jk: str) -> dict | None:
    try:
        info = yf.Ticker(ticker_jk).info
        def safe(k):
            v = info.get(k)
            return v if v not in (None, "N/A", float("inf")) else None
        return {
            "ticker":     ticker_jk.replace(".JK", ""),
            "nama":       safe("shortName") or ticker_jk.replace(".JK", ""),
            "harga":      safe("currentPrice") or safe("regularMarketPrice"),
            "pe_ratio":   safe("trailingPE"),
            "pb_ratio":   safe("priceToBook"),
            "roe":        safe("returnOnEquity"),
            "market_cap": safe("marketCap"),
        }
    except Exception:
        return None

@app.get("/stock/{ticker}/peers")
def get_peers(ticker: str):
    kode = ticker.upper().replace(".JK", "")
    peer_list = SEKTOR_PEERS.get(kode, [])
    if not peer_list:
        return {"ticker": ticker.upper(), "peers": []}

    results = []
    with ThreadPoolExecutor(max_workers=4) as executor:
        futures = {executor.submit(_fetch_peer, p): p for p in peer_list}
        for future in as_completed(futures):
            r = future.result()
            if r:
                results.append(r)

    results.sort(key=lambda x: x.get("market_cap") or 0, reverse=True)
    return {"ticker": ticker.upper(), "peers": results}