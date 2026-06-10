"use client";
import { useState, useEffect, useCallback } from "react";

export interface LiveQuote {
  symbol: string;
  price: number;
  change: number;
  changePct: number;
  week52High: number;
  week52Low: number;
  pe: number | null;
  eps: number | null;
  bookValue: number | null;
  marketCap: number | null;
  name: string;
}

export function useLivePrices(stockCodes: string[], refreshMs = 300000) {
  const [quotes, setQuotes] = useState<Record<string, LiveQuote>>({});
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetch_ = useCallback(async () => {
    if (!stockCodes.length) return;
    setLoading(true);
    setError(null);
    try {
      const { fetchYahooQuotesBrowser } = await import("@/lib/yahoo-client");
      const results = await fetchYahooQuotesBrowser(stockCodes);
      const map: Record<string, LiveQuote> = {};
      for (const q of results) {
        map[q.stockCode] = {
          symbol: q.stockCode,
          price: q.price,
          change: 0,
          changePct: q.changePct,
          week52High: q.week52High ?? 0,
          week52Low: q.week52Low ?? 0,
          pe: q.pe,
          eps: q.eps,
          bookValue: q.bookValue,
          marketCap: null,
          name: q.name,
        };
      }
      setQuotes(map);
      setLastUpdated(new Date());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to fetch prices");
    } finally {
      setLoading(false);
    }
  }, [stockCodes.join(",")]);

  useEffect(() => { fetch_(); }, [fetch_]);
  useEffect(() => {
    if (!refreshMs) return;
    const id = setInterval(fetch_, refreshMs);
    return () => clearInterval(id);
  }, [fetch_, refreshMs]);

  return { quotes, loading, lastUpdated, error, refresh: fetch_ };
}

export function useStockHistory(symbol: string, period: string) {
  const [candles, setCandles] = useState<{ time: string; open: number; high: number; low: number; close: number }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!symbol) return;
    setLoading(true);
    fetch(`/api/prices/history?symbol=${symbol}&period=${period}`)
      .then((r) => r.json())
      .then((d) => { if (!d.error) setCandles(d.candles ?? []); })
      .finally(() => setLoading(false));
  }, [symbol, period]);

  return { candles, loading };
}
