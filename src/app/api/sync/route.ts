import { NextRequest, NextResponse } from "next/server";
import { prisma, dbMissing } from "@/lib/db";

const PORTFOLIO_ID = "demo-portfolio";

const SECTOR_AVG_PE: Record<string, number> = {
  "Technology": 28, "Banking & Finance": 20, "Energy": 18,
  "Consumer Goods": 45, "Healthcare": 30, "Automobile": 22,
  "Industrials": 28, "Chemicals": 35, "Real Estate": 25,
  "Consumer Services": 55, "default": 25,
};

interface QuotePayload {
  stockCode: string;
  price: number;
  changePct?: number;
  week52High?: number;
  week52Low?: number;
  pe?: number;
  eps?: number;
  bookValue?: number;
  roe?: number;
  debtToEquity?: number;
  revenueGrowth?: number;
  earningsGrowth?: number;
}

// POST with client-side fetched quotes
export async function POST(req: NextRequest) {
  if (dbMissing() || !prisma)
    return NextResponse.json({ error: "DATABASE_URL not set" }, { status: 503 });

  try {
    const body = await req.json().catch(() => ({}));
    const clientQuotes: QuotePayload[] = body.quotes ?? [];

    const holdings = await prisma.holding.findMany({
      where: { portfolioId: PORTFOLIO_ID },
      select: { id: true, stockCode: true, quantity: true, totalCost: true, industry: true, historicalAveragePE: true },
    });

    if (!holdings.length)
      return NextResponse.json({ updated: 0, message: "No holdings found. Import a portfolio first." });

    // Build a lookup from client-provided quotes
    const quoteMap: Record<string, QuotePayload> = {};
    for (const q of clientQuotes) quoteMap[q.stockCode] = q;

    let updated = 0;
    for (const h of holdings) {
      const q = quoteMap[h.stockCode];
      if (!q || !q.price) continue;

      const qty      = Number(h.quantity);
      const cost     = Number(h.totalCost);
      const curVal   = qty * q.price;
      const gainLoss = curVal - cost;
      const gainLossPct = cost > 0 ? (gainLoss / cost) * 100 : 0;

      const eps       = q.eps       ?? null;
      const bookValue = q.bookValue ?? null;
      const pe        = q.pe        ?? null;
      const roe       = q.roe       ?? null;
      const de        = q.debtToEquity ?? null;
      const revG      = q.revenueGrowth ?? null;
      const epsG      = q.earningsGrowth ?? null;

      const graham = eps && bookValue && eps > 0 && bookValue > 0
        ? Math.sqrt(22.5 * eps * bookValue) : null;
      const mos    = graham ? ((graham - q.price) / graham) * 100 : null;
      const gPrem  = graham ? ((q.price - graham) / graham) * 100 : null;

      const histPE = h.historicalAveragePE
        ? Number(h.historicalAveragePE)
        : SECTOR_AVG_PE[h.industry ?? "default"] ?? 25;

      const peStatus = pe && histPE
        ? pe < histPE * 0.9 ? "Cheap" : pe > histPE * 1.1 ? "Expensive" : "Fair"
        : null;

      const d52h = q.week52High ? ((q.price - q.week52High) / q.week52High) * 100 : null;
      const d52l = q.week52Low  ? ((q.price - q.week52Low)  / q.week52Low)  * 100 : null;

      let buyScore = 0;
      if (pe && histPE && pe < histPE)  buyScore += 20;
      if (mos && mos > 20)              buyScore += 20;
      if (roe && roe > 15)              buyScore += 15;
      if (revG && revG > 10)            buyScore += 10;
      if (epsG && epsG > 10)            buyScore += 10;
      if (de != null && de < 0.5)       buyScore += 15;
      if (gainLossPct < 0)              buyScore += 10;

      let sellScore = 0;
      if (gainLossPct > 100)                         sellScore += 30;
      if (pe && histPE && pe > histPE * 1.3)         sellScore += 25;
      if (d52h != null && Math.abs(d52h) < 5)        sellScore += 15;

      let qualityScore = 0;
      if (roe)  qualityScore += Math.min(roe  / 50 * 25, 25);
      if (de != null) qualityScore += Math.max(0, 25 - de * 5);
      if (epsG) qualityScore += Math.min(epsG / 40 * 25, 25);
      if (revG) qualityScore += Math.min(revG / 40 * 25, 25);

      const rec = buyScore >= 60 ? "Strong Buy" : buyScore >= 40 ? "Buy"
        : sellScore >= 60 ? "Strong Sell" : sellScore >= 40 ? "Sell" : "Hold";

      await prisma.holding.update({
        where: { id: h.id },
        data: {
          currentPrice: q.price,
          currentValue: curVal,
          absoluteGainLoss: gainLoss,
          gainLossPercent: gainLossPct,
          ...(q.week52High && { week52High: q.week52High }),
          ...(q.week52Low  && { week52Low:  q.week52Low  }),
          distanceFrom52WHighPercent: d52h,
          distanceFrom52WLowPercent:  d52l,
          ...(pe        != null && { currentPE: pe }),
          historicalAveragePE: histPE,
          peStatus,
          ...(eps       != null && { eps }),
          ...(bookValue != null && { bookValuePerShare: bookValue }),
          grahamNumber: graham,
          grahamPremiumDiscountPercent: gPrem,
          marginOfSafetyPercent: mos,
          ...(roe       != null && { roePercent: roe }),
          ...(de        != null && { debtToEquityRatio: de }),
          ...(revG      != null && { revenueGrowthPercent: revG }),
          ...(epsG      != null && { epsGrowthPercent: epsG }),
          qualityScore,
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
    const msg = e instanceof Error ? e.message : "Unknown";
    console.error("Sync error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
