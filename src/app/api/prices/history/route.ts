import { NextRequest, NextResponse } from "next/server";

const RANGES: Record<string, { range: string; interval: string }> = {
  "1D": { range: "1d",  interval: "5m"  },
  "1W": { range: "5d",  interval: "15m" },
  "1M": { range: "1mo", interval: "1d"  },
  "3M": { range: "3mo", interval: "1d"  },
  "1Y": { range: "1y",  interval: "1wk" },
  "5Y": { range: "5y",  interval: "1mo" },
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get("symbol");
  const period = searchParams.get("period") ?? "1M";
  if (!symbol) return NextResponse.json({ error: "symbol required" }, { status: 400 });

  const yahooSymbol = symbol.includes(".") ? symbol : `${symbol}.NS`;
  const { range, interval } = RANGES[period] ?? RANGES["1M"];

  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?range=${range}&interval=${interval}&includePrePost=false`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      next: { revalidate: 300 },
    });
    if (!res.ok) throw new Error(`Yahoo ${res.status}`);

    const json = await res.json();
    const result = json?.chart?.result?.[0];
    if (!result) throw new Error("No data returned");

    const timestamps: number[] = result.timestamp ?? [];
    const closes: number[] = result.indicators?.quote?.[0]?.close ?? [];
    const highs: number[]  = result.indicators?.quote?.[0]?.high  ?? [];
    const lows: number[]   = result.indicators?.quote?.[0]?.low   ?? [];
    const opens: number[]  = result.indicators?.quote?.[0]?.open  ?? [];
    const volumes: number[] = result.indicators?.quote?.[0]?.volume ?? [];

    const candles = timestamps.map((t, i) => ({
      time: new Date(t * 1000).toISOString(),
      open:  opens[i]   ?? null,
      high:  highs[i]   ?? null,
      low:   lows[i]    ?? null,
      close: closes[i]  ?? null,
      volume: volumes[i] ?? null,
    })).filter((c) => c.close !== null);

    return NextResponse.json({
      symbol: yahooSymbol,
      period,
      currency: result.meta?.currency ?? "INR",
      candles,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
