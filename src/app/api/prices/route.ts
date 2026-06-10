import { NextRequest, NextResponse } from "next/server";

function toYahooSymbol(code: string): string {
  if (code.includes(".")) return code;
  const special: Record<string, string> = { SENSEX: "^BSESN", NIFTY: "^NSEI", NIFTY50: "^NSEI" };
  return special[code] ?? `${code}.NS`;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const symbols = searchParams.get("symbols")?.split(",").filter(Boolean) ?? [];
  if (!symbols.length) return NextResponse.json({ error: "No symbols" }, { status: 400 });

  const yahooSymbols = symbols.map(toYahooSymbol).join(",");
  const fields = [
    "regularMarketPrice", "regularMarketChangePercent", "regularMarketChange",
    "fiftyTwoWeekHigh", "fiftyTwoWeekLow",
    "trailingPE", "epsTrailingTwelveMonths", "bookValue",
    "returnOnEquity", "marketCap", "shortName", "longName", "currency",
  ].join(",");

  try {
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${yahooSymbols}&fields=${fields}`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
      next: { revalidate: 300 },
    });
    if (!res.ok) throw new Error(`Yahoo ${res.status}`);

    const data = await res.json();
    const result: Record<string, {
      symbol: string; price: number; change: number; changePct: number;
      week52High: number | null; week52Low: number | null;
      pe: number | null; eps: number | null; bookValue: number | null;
      roe: number | null; marketCap: number | null; name: string; currency: string;
    }> = {};

    for (const q of data?.quoteResponse?.result ?? []) {
      const code = q.symbol.replace(".NS", "").replace(".BO", "");
      result[code] = {
        symbol: q.symbol,
        price: q.regularMarketPrice ?? 0,
        change: q.regularMarketChange ?? 0,
        changePct: q.regularMarketChangePercent ?? 0,
        week52High: q.fiftyTwoWeekHigh ?? null,
        week52Low: q.fiftyTwoWeekLow ?? null,
        pe: q.trailingPE ?? null,
        eps: q.epsTrailingTwelveMonths ?? null,
        bookValue: q.bookValue ?? null,
        roe: q.returnOnEquity ? q.returnOnEquity * 100 : null,
        marketCap: q.marketCap ?? null,
        name: q.longName ?? q.shortName ?? code,
        currency: q.currency ?? "INR",
      };
    }

    return NextResponse.json(result);
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed" }, { status: 500 });
  }
}
