import { NextResponse } from "next/server";
import { prisma, dbMissing } from "@/lib/db";

const PORTFOLIO_ID = "demo-portfolio";

function toYahoo(code: string) {
  if (code.includes(".")) return code;
  return `${code}.NS`;
}

// Sector-based historical average PE fallback when not in DB
const SECTOR_AVG_PE: Record<string, number> = {
  "Technology": 28, "Banking & Finance": 20, "Energy": 18,
  "Consumer Goods": 45, "Healthcare": 30, "Automobile": 22,
  "Industrials": 28, "Chemicals": 35, "Real Estate": 25,
  "Consumer Services": 55, "default": 25,
};

interface FundamentalsResult {
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
}

// Fetch bulk prices (one request for all symbols)
async function fetchBulkPrices(codes: string[]): Promise<Record<string, FundamentalsResult>> {
  const symbols = codes.map(toYahoo).join(",");
  const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbols}&fields=regularMarketPrice,regularMarketChangePercent,fiftyTwoWeekHigh,fiftyTwoWeekLow,trailingPE,epsTrailingTwelveMonths,bookValue,returnOnEquity`;

  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Yahoo quote API ${res.status}`);

  const data = await res.json();
  const result: Record<string, FundamentalsResult> = {};

  for (const q of data?.quoteResponse?.result ?? []) {
    const code = q.symbol.replace(".NS", "").replace(".BO", "");
    result[code] = {
      price: q.regularMarketPrice ?? 0,
      changePct: q.regularMarketChangePercent ?? 0,
      week52High: q.fiftyTwoWeekHigh ?? null,
      week52Low: q.fiftyTwoWeekLow ?? null,
      pe: q.trailingPE ?? null,
      eps: q.epsTrailingTwelveMonths ?? null,
      bookValue: q.bookValue ?? null,
      roe: q.returnOnEquity ? q.returnOnEquity * 100 : null,
      debtToEquity: null,
      revenueGrowth: null,
      earningsGrowth: null,
    };
  }
  return result;
}

// Fetch detailed fundamentals for a single stock
async function fetchFundamentals(code: string): Promise<Partial<FundamentalsResult>> {
  const symbol = toYahoo(code);
  const url = `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${symbol}?modules=financialData,defaultKeyStatistics,summaryDetail`;

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
      cache: "no-store",
    });
    if (!res.ok) return {};
    const data = await res.json();
    const result = data?.quoteSummary?.result?.[0];
    if (!result) return {};

    const fin  = result.financialData ?? {};
    const stat = result.defaultKeyStatistics ?? {};
    const det  = result.summaryDetail ?? {};

    return {
      pe:             det.trailingPE?.raw ?? stat.trailingPE?.raw ?? null,
      eps:            stat.trailingEps?.raw ?? null,
      bookValue:      stat.bookValue?.raw ?? null,
      roe:            fin.returnOnEquity?.raw ? fin.returnOnEquity.raw * 100 : null,
      debtToEquity:   fin.debtToEquity?.raw ?? null,
      revenueGrowth:  fin.revenueGrowth?.raw ? fin.revenueGrowth.raw * 100 : null,
      earningsGrowth: fin.earningsGrowth?.raw ? fin.earningsGrowth.raw * 100 : null,
    };
  } catch {
    return {};
  }
}

export async function POST() {
  if (dbMissing() || !prisma)
    return NextResponse.json({ error: "DATABASE_URL not set" }, { status: 503 });

  try {
    const holdings = await prisma.holding.findMany({
      where: { portfolioId: PORTFOLIO_ID },
      select: { id: true, stockCode: true, quantity: true, totalCost: true, industry: true, historicalAveragePE: true },
    });
    if (!holdings.length)
      return NextResponse.json({ updated: 0, message: "No holdings found. Import a portfolio first." });

    const codes = holdings.map((h) => h.stockCode);

    // Step 1: bulk price fetch
    const prices = await fetchBulkPrices(codes);

    // Step 2: per-stock fundamentals (parallel, limited)
    const fundChunks = [];
    for (let i = 0; i < codes.length; i += 5) {
      fundChunks.push(codes.slice(i, i + 5));
    }
    const fundMap: Record<string, Partial<FundamentalsResult>> = {};
    for (const chunk of fundChunks) {
      const results = await Promise.all(chunk.map(async (code) => ({ code, data: await fetchFundamentals(code) })));
      for (const { code, data } of results) fundMap[code] = data;
    }

    let updated = 0;
    for (const h of holdings) {
      const p = prices[h.stockCode];
      const f = fundMap[h.stockCode] ?? {};
      if (!p || !p.price) continue;

      // Merge price + fundamentals (fundamentals override if richer)
      const pe          = f.pe          ?? p.pe;
      const eps         = f.eps         ?? p.eps;
      const bookValue   = f.bookValue   ?? p.bookValue;
      const roe         = f.roe         ?? p.roe;
      const de          = f.debtToEquity;
      const revG        = f.revenueGrowth;
      const epsG        = f.earningsGrowth;

      const qty      = Number(h.quantity);
      const cost     = Number(h.totalCost);
      const curVal   = qty * p.price;
      const gainLoss = curVal - cost;
      const gainLossPct = cost > 0 ? (gainLoss / cost) * 100 : 0;

      // Graham Number + MOS
      const graham = eps && bookValue && eps > 0 && bookValue > 0
        ? Math.sqrt(22.5 * eps * bookValue) : null;
      const mos    = graham ? ((graham - p.price) / graham) * 100 : null;
      const gPrem  = graham ? ((p.price - graham) / graham) * 100 : null;

      // Historical average PE — keep existing DB value or use sector fallback
      const existingHistPE = h.historicalAveragePE ? Number(h.historicalAveragePE) : null;
      const sectorPE = SECTOR_AVG_PE[h.industry ?? "default"] ?? 25;
      const histPE = existingHistPE ?? sectorPE;

      const peStatus = pe && histPE
        ? pe < histPE * 0.9 ? "Cheap" : pe > histPE * 1.1 ? "Expensive" : "Fair"
        : null;

      // 52W distances
      const d52h = p.week52High ? ((p.price - p.week52High) / p.week52High) * 100 : null;
      const d52l = p.week52Low  ? ((p.price - p.week52Low)  / p.week52Low)  * 100 : null;

      // Buy / sell scores
      let buyScore = 0;
      if (pe && histPE && pe < histPE)        buyScore += 20;
      if (mos && mos > 20)                    buyScore += 20;
      if (roe && roe > 15)                    buyScore += 15;
      if (revG && revG > 10)                  buyScore += 10;
      if (epsG && epsG > 10)                  buyScore += 10;
      if (de != null && de < 0.5)             buyScore += 15;
      if (gainLossPct < 0)                    buyScore += 10; // dip buyer bonus

      let sellScore = 0;
      if (gainLossPct > 100)                             sellScore += 30;
      if (pe && histPE && pe > histPE * 1.3)             sellScore += 25;
      if (d52h !== null && Math.abs(d52h) < 5)           sellScore += 15;

      // Quality score
      let q = 0;
      if (roe)  q += Math.min(roe  / 50 * 25, 25);
      if (de != null) q += Math.max(0, 25 - de * 5);
      if (epsG) q += Math.min(epsG / 40 * 25, 25);
      if (revG) q += Math.min(revG / 40 * 25, 25);

      const rec = buyScore >= 60 ? "Strong Buy" : buyScore >= 40 ? "Buy"
        : sellScore >= 60 ? "Strong Sell" : sellScore >= 40 ? "Sell" : "Hold";

      await prisma.holding.update({
        where: { id: h.id },
        data: {
          currentPrice: p.price,
          currentValue: curVal,
          absoluteGainLoss: gainLoss,
          gainLossPercent: gainLossPct,
          ...(p.week52High && { week52High: p.week52High }),
          ...(p.week52Low  && { week52Low:  p.week52Low  }),
          distanceFrom52WHighPercent: d52h,
          distanceFrom52WLowPercent:  d52l,
          ...(pe         !== null && { currentPE: pe }),
          historicalAveragePE: histPE,
          peStatus,
          ...(eps        !== null && { eps }),
          ...(bookValue  !== null && { bookValuePerShare: bookValue }),
          grahamNumber: graham,
          grahamPremiumDiscountPercent: gPrem,
          marginOfSafetyPercent: mos,
          ...(roe        !== null && { roePercent: roe }),
          ...(de         !== null && { debtToEquityRatio: de }),
          ...(revG       !== null && { revenueGrowthPercent: revG }),
          ...(epsG       !== null && { epsGrowthPercent: epsG }),
          qualityScore: q,
          buyScore,
          sellScore,
          buySignal: buyScore >= 40,
          sellSignal: sellScore >= 40,
          recommendation: rec,
          lastUpdatedDate: new Date(),
        },
      });
      updated++;
    }

    // Portfolio snapshot
    const all = await prisma.holding.findMany({ where: { portfolioId: PORTFOLIO_ID } });
    const totalValue = all.reduce((s, h) => s + Number(h.currentValue), 0);
    const totalCost  = all.reduce((s, h) => s + Number(h.totalCost), 0);
    await prisma.portfolioSnapshot.create({
      data: { portfolioId: PORTFOLIO_ID, snapshotDate: new Date(), totalValue, totalCost, gainLoss: totalValue - totalCost },
    });

    return NextResponse.json({ updated, totalValue, timestamp: new Date().toISOString() });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error("Sync error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
