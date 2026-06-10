import { NextRequest, NextResponse } from "next/server";

const YAHOO_BASE = "https://query1.finance.yahoo.com/v8/finance/chart";
const YAHOO_QUOTE = "https://query1.finance.yahoo.com/v7/finance/quote";

function toYahooSymbol(code: string): string {
  // Already suffixed
  if (code.includes(".")) return code;
  // Common index / ETF exceptions
  const bse: Record<string, string> = { SENSEX: "^BSESN", NIFTY: "^NSEI", "NIFTY50": "^NSEI" };
  if (bse[code]) return bse[code];
  return `${code}.NS`;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const symbols = searchParams.get("symbols")?.split(",").filter(Boolean) ?? [];
  if (!symbols.length) return NextResponse.json({ error: "No symbols provided" }, { status: 400 });

  const yahooSymbols = symbols.map(toYahooSymbol).join(",");

  try {
    const url = `${YAHOO_QUOTE}?symbols=${yahooSymbols}&fields=regularMarketPrice,regularMarketChangePercent,regularMarketChange,fiftyTwoWeekHigh,fiftyTwoWeekLow,trailingPE,epsTrailingTwelveMonths,bookValue,regularMarketVolume,marketCap,shortName,longName,currency`;

    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json",
      },
      next: { revalidate: 300 }, // cache 5 min
    });

    if (!res.ok) throw new Error(`Yahoo returned ${res.status}`);

    const data = await res.json();
    const quotes = data?.quoteResponse?.result ?? [];

    const result: Record<string, {
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
      currency: string;
    }> = {};

    for (const q of quotes) {
      // Map back to original code
      const origCode = q.symbol.replace(".NS", "").replace(".BO", "");
      result[origCode] = {
        symbol: q.symbol,
        price: q.regularMarketPrice ?? 0,
        change: q.regularMarketChange ?? 0,
        changePct: q.regularMarketChangePercent ?? 0,
        week52High: q.fiftyTwoWeekHigh ?? 0,
        week52Low: q.fiftyTwoWeekLow ?? 0,
        pe: q.trailingPE ?? null,
        eps: q.epsTrailingTwelveMonths ?? null,
        bookValue: q.bookValue ?? null,
        marketCap: q.marketCap ?? null,
        name: q.longName ?? q.shortName ?? origCode,
        currency: q.currency ?? "INR",
      };
    }

    return NextResponse.json(result);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
