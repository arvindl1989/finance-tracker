import { NextResponse } from "next/server";
import { prisma, dbMissing } from "@/lib/db";

const PORTFOLIO_ID = "demo-portfolio";

function toYahoo(code: string) {
  if (code.includes(".")) return code;
  return `${code}.NS`;
}

async function fetchYahooPrices(codes: string[]) {
  const symbols = codes.map(toYahoo).join(",");
  const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbols}&fields=regularMarketPrice,regularMarketChangePercent,fiftyTwoWeekHigh,fiftyTwoWeekLow,trailingPE,epsTrailingTwelveMonths,bookValue`;

  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0" },
    cache: "no-store",
  });

  if (!res.ok) throw new Error(`Yahoo Finance returned ${res.status}`);
  const data = await res.json();
  const quotes: Record<string, {
    price: number; changePct: number;
    week52High: number | null; week52Low: number | null;
    pe: number | null; eps: number | null; bookValue: number | null;
  }> = {};

  for (const q of data?.quoteResponse?.result ?? []) {
    const origCode = q.symbol.replace(".NS", "").replace(".BO", "");
    quotes[origCode] = {
      price: q.regularMarketPrice ?? 0,
      changePct: q.regularMarketChangePercent ?? 0,
      week52High: q.fiftyTwoWeekHigh ?? null,
      week52Low: q.fiftyTwoWeekLow ?? null,
      pe: q.trailingPE ?? null,
      eps: q.epsTrailingTwelveMonths ?? null,
      bookValue: q.bookValue ?? null,
    };
  }
  return quotes;
}

export async function POST() {
  if (dbMissing() || !prisma)
    return NextResponse.json({ error: "DATABASE_URL not set" }, { status: 503 });

  try {
    const holdings = await prisma.holding.findMany({
      where: { portfolioId: PORTFOLIO_ID },
      select: { id: true, stockCode: true, quantity: true, totalCost: true },
    });

    if (!holdings.length)
      return NextResponse.json({ updated: 0, message: "No holdings found" });

    // Fetch live prices directly from Yahoo Finance
    const codes = holdings.map((h) => h.stockCode);
    const quotes = await fetchYahooPrices(codes);

    let updated = 0;
    for (const h of holdings) {
      const q = quotes[h.stockCode];
      if (!q || !q.price) continue;

      const qty      = Number(h.quantity);
      const cost     = Number(h.totalCost);
      const curVal   = qty * q.price;
      const gainLoss = curVal - cost;
      const gainLossPct = cost > 0 ? (gainLoss / cost) * 100 : 0;

      const graham = q.eps && q.bookValue && q.eps > 0 && q.bookValue > 0
        ? Math.sqrt(22.5 * q.eps * q.bookValue) : null;
      const mos    = graham ? ((graham - q.price) / graham) * 100 : null;
      const gPrem  = graham ? ((q.price - graham) / graham) * 100 : null;
      const peStatus = q.pe
        ? q.pe < 15 ? "Cheap" : q.pe > 35 ? "Expensive" : "Fair"
        : null;
      const d52h = q.week52High ? ((q.price - q.week52High) / q.week52High) * 100 : null;
      const d52l = q.week52Low  ? ((q.price - q.week52Low)  / q.week52Low)  * 100 : null;

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
          ...(q.pe        && { currentPE: q.pe }),
          ...(q.eps       && { eps: q.eps }),
          ...(q.bookValue && { bookValuePerShare: q.bookValue }),
          grahamNumber: graham,
          grahamPremiumDiscountPercent: gPrem,
          marginOfSafetyPercent: mos,
          peStatus,
          lastUpdatedDate: new Date(),
        },
      });
      updated++;
    }

    // Save today's portfolio snapshot
    const all = await prisma.holding.findMany({ where: { portfolioId: PORTFOLIO_ID } });
    const totalValue = all.reduce((s, h) => s + Number(h.currentValue), 0);
    const totalCost  = all.reduce((s, h) => s + Number(h.totalCost), 0);

    await prisma.portfolioSnapshot.create({
      data: {
        portfolioId: PORTFOLIO_ID,
        snapshotDate: new Date(),
        totalValue,
        totalCost,
        gainLoss: totalValue - totalCost,
      },
    });

    return NextResponse.json({
      updated,
      totalValue,
      fetched: Object.keys(quotes).length,
      timestamp: new Date().toISOString(),
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error("Sync error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
