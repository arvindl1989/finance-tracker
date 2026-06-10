import { NextResponse } from "next/server";
import { prisma, dbMissing } from "@/lib/db";

const PORTFOLIO_ID = "demo-portfolio";

export async function POST() {
  if (dbMissing() || !prisma)
    return NextResponse.json({ error: "DATABASE_URL not set" }, { status: 503 });

  try {
    const holdings = await prisma.holding.findMany({
      where: { portfolioId: PORTFOLIO_ID },
      select: { id: true, stockCode: true, quantity: true, totalCost: true },
    });
    if (!holdings.length) return NextResponse.json({ updated: 0 });

    const codes = holdings.map((h) => h.stockCode).join(",");
    const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const res = await fetch(`${base}/api/prices?symbols=${codes}`);
    if (!res.ok) throw new Error(`Price fetch failed: ${res.status}`);

    const prices: Record<string, {
      price: number; changePct: number; week52High: number; week52Low: number;
      pe: number | null; eps: number | null; bookValue: number | null;
    }> = await res.json();

    let updated = 0;
    for (const h of holdings) {
      const q = prices[h.stockCode];
      if (!q || !q.price) continue;

      const qty       = Number(h.quantity);
      const cost      = Number(h.totalCost);
      const curVal    = qty * q.price;
      const gainLoss  = curVal - cost;
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
          week52High: q.week52High || undefined,
          week52Low:  q.week52Low  || undefined,
          distanceFrom52WHighPercent: d52h,
          distanceFrom52WLowPercent:  d52l,
          currentPE: q.pe,
          eps: q.eps,
          bookValuePerShare: q.bookValue,
          grahamNumber: graham,
          grahamPremiumDiscountPercent: gPrem,
          marginOfSafetyPercent: mos,
          peStatus,
          lastUpdatedDate: new Date(),
        },
      });
      updated++;
    }

    // Save portfolio snapshot
    const allHoldings = await prisma.holding.findMany({ where: { portfolioId: PORTFOLIO_ID } });
    const totalValue = allHoldings.reduce((s, h) => s + Number(h.currentValue), 0);
    const totalCost  = allHoldings.reduce((s, h) => s + Number(h.totalCost), 0);
    await prisma.portfolioSnapshot.create({
      data: {
        portfolioId: PORTFOLIO_ID,
        snapshotDate: new Date(),
        totalValue,
        totalCost,
        gainLoss: totalValue - totalCost,
      },
    });

    return NextResponse.json({ updated, totalValue, timestamp: new Date().toISOString() });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
