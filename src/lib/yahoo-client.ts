// Fetches Yahoo Finance data from the BROWSER (not the server).
// Yahoo blocks server/datacenter IPs — browser requests work fine.

export interface YahooQuote {
  stockCode: string;
  price: number;
  changePct: number;
  week52High: number | null;
  week52Low: number | null;
  pe: number | null;
  eps: number | null;
  bookValue: number | null;
  roe: number | null;
  debtToEquity: number | null;
  revenueGrowth: number | null;
  earningsGrowth: number | null;
  name: string;
}

function toNS(code: string) {
  if (code.includes(".")) return code;
  return `${code}.NS`;
}

export async function fetchYahooQuotesBrowser(codes: string[]): Promise<YahooQuote[]> {
  const symbols = codes.map(toNS).join(",");
  const fields = [
    "regularMarketPrice", "regularMarketChangePercent",
    "fiftyTwoWeekHigh", "fiftyTwoWeekLow",
    "trailingPE", "epsTrailingTwelveMonths", "bookValue",
    "returnOnEquity", "shortName",
  ].join(",");

  const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbols}&fields=${fields}&crumb=`;

  const res = await fetch(url, {
    headers: {
      "Accept": "application/json",
      "User-Agent": navigator.userAgent,
    },
  });

  if (!res.ok) throw new Error(`Yahoo returned ${res.status}`);
  const data = await res.json();
  const results: YahooQuote[] = [];

  for (const q of data?.quoteResponse?.result ?? []) {
    const code = q.symbol.replace(".NS", "").replace(".BO", "");
    results.push({
      stockCode: code,
      price:        q.regularMarketPrice           ?? 0,
      changePct:    q.regularMarketChangePercent    ?? 0,
      week52High:   q.fiftyTwoWeekHigh              ?? null,
      week52Low:    q.fiftyTwoWeekLow               ?? null,
      pe:           q.trailingPE                    ?? null,
      eps:          q.epsTrailingTwelveMonths        ?? null,
      bookValue:    q.bookValue                     ?? null,
      roe:          q.returnOnEquity ? q.returnOnEquity * 100 : null,
      debtToEquity: null,
      revenueGrowth: null,
      earningsGrowth: null,
      name:         q.shortName ?? code,
    });
  }
  return results;
}

export async function fetchYahooFundamentalsBrowser(code: string): Promise<Partial<YahooQuote>> {
  const symbol = toNS(code);
  const url = `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${symbol}?modules=financialData,defaultKeyStatistics,summaryDetail`;

  const res = await fetch(url, {
    headers: { "Accept": "application/json", "User-Agent": navigator.userAgent },
  });
  if (!res.ok) return {};

  const data = await res.json();
  const result = data?.quoteSummary?.result?.[0];
  if (!result) return {};

  const fin  = result.financialData       ?? {};
  const stat = result.defaultKeyStatistics ?? {};
  const det  = result.summaryDetail        ?? {};

  return {
    pe:             det.trailingPE?.raw       ?? stat.trailingPE?.raw       ?? null,
    eps:            stat.trailingEps?.raw     ?? null,
    bookValue:      stat.bookValue?.raw       ?? null,
    roe:            fin.returnOnEquity?.raw   ? fin.returnOnEquity.raw * 100   : null,
    debtToEquity:   fin.debtToEquity?.raw     ?? null,
    revenueGrowth:  fin.revenueGrowth?.raw    ? fin.revenueGrowth.raw * 100    : null,
    earningsGrowth: fin.earningsGrowth?.raw   ? fin.earningsGrowth.raw * 100   : null,
  };
}
