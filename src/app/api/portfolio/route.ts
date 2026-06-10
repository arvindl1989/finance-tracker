import { NextResponse } from "next/server";
import { prisma, dbMissing } from "@/lib/db";

const DEMO_PORTFOLIO_ID = "demo-portfolio";

function toNum(v: unknown): number { return Number(v ?? 0); }

export async function GET() {
  if (dbMissing() || !prisma)
    return NextResponse.json({ error: "DATABASE_URL not configured." }, { status: 503 });

  try {
    const holdings = await prisma.holding.findMany({
      where: { portfolioId: DEMO_PORTFOLIO_ID },
      orderBy: { currentValue: "desc" },
    });

    const totalValue   = holdings.reduce((s, h) => s + toNum(h.currentValue), 0);
    const totalCost    = holdings.reduce((s, h) => s + toNum(h.totalCost), 0);
    const totalDividend = holdings.reduce((s, h) => s + toNum(h.dividendReceived), 0);

    // Recalculate portfolio weights on the fly
    const mappedHoldings = holdings.map((h) => ({
      ...h,
      quantity: toNum(h.quantity),
      averageBuyPrice: toNum(h.averageBuyPrice),
      totalCost: toNum(h.totalCost),
      currentPrice: toNum(h.currentPrice),
      currentValue: toNum(h.currentValue),
      absoluteGainLoss: toNum(h.absoluteGainLoss),
      gainLossPercent: toNum(h.gainLossPercent),
      dividendReceived: toNum(h.dividendReceived),
      portfolioWeightPercent: totalValue > 0 ? (toNum(h.currentValue) / totalValue) * 100 : 0,
      targetWeightPercent: h.targetWeightPercent ? toNum(h.targetWeightPercent) : null,
      currentPE: h.currentPE ? toNum(h.currentPE) : null,
      historicalAveragePE: h.historicalAveragePE ? toNum(h.historicalAveragePE) : null,
      eps: h.eps ? toNum(h.eps) : null,
      bookValuePerShare: h.bookValuePerShare ? toNum(h.bookValuePerShare) : null,
      grahamNumber: h.grahamNumber ? toNum(h.grahamNumber) : null,
      grahamPremiumDiscountPercent: h.grahamPremiumDiscountPercent ? toNum(h.grahamPremiumDiscountPercent) : null,
      marginOfSafetyPercent: h.marginOfSafetyPercent ? toNum(h.marginOfSafetyPercent) : null,
      roePercent: h.roePercent ? toNum(h.roePercent) : null,
      rocePercent: h.rocePercent ? toNum(h.rocePercent) : null,
      debtToEquityRatio: h.debtToEquityRatio ? toNum(h.debtToEquityRatio) : null,
      revenueGrowthPercent: h.revenueGrowthPercent ? toNum(h.revenueGrowthPercent) : null,
      epsGrowthPercent: h.epsGrowthPercent ? toNum(h.epsGrowthPercent) : null,
      qualityScore: h.qualityScore ? toNum(h.qualityScore) : null,
      week52High: h.week52High ? toNum(h.week52High) : null,
      week52Low: h.week52Low ? toNum(h.week52Low) : null,
      distanceFrom52WHighPercent: h.distanceFrom52WHighPercent ? toNum(h.distanceFrom52WHighPercent) : null,
      distanceFrom52WLowPercent: h.distanceFrom52WLowPercent ? toNum(h.distanceFrom52WLowPercent) : null,
      allTimeHigh: h.allTimeHigh ? toNum(h.allTimeHigh) : null,
      distanceFromATHPercent: h.distanceFromATHPercent ? toNum(h.distanceFromATHPercent) : null,
      buyScore: h.buyScore ? toNum(h.buyScore) : null,
      sellScore: h.sellScore ? toNum(h.sellScore) : null,
      concentrationRiskScore: h.concentrationRiskScore ? toNum(h.concentrationRiskScore) : null,
    }));

    // Load or generate 30-day snapshots
    let rawSnaps = await prisma.portfolioSnapshot.findMany({
      where: { portfolioId: DEMO_PORTFOLIO_ID },
      orderBy: { snapshotDate: "asc" },
      take: 60,
    });

    if (rawSnaps.length === 0 && totalValue > 0) {
      // Generate simulated 30-day history and persist it
      const rows = Array.from({ length: 31 }, (_, i) => {
        const date = new Date();
        date.setHours(0, 0, 0, 0);
        date.setDate(date.getDate() - (30 - i));
        const progress = i / 30;
        const noise = (Math.random() - 0.47) * totalValue * 0.015;
        const val = totalValue * (0.91 + progress * 0.09) + noise;
        return {
          portfolioId: DEMO_PORTFOLIO_ID,
          snapshotDate: date,
          totalValue: val,
          totalCost,
          gainLoss: val - totalCost,
        };
      });
      await prisma.portfolioSnapshot.createMany({ data: rows, skipDuplicates: true });
      rawSnaps = await prisma.portfolioSnapshot.findMany({
        where: { portfolioId: DEMO_PORTFOLIO_ID },
        orderBy: { snapshotDate: "asc" },
        take: 60,
      });
    }

    const snapshots = rawSnaps.map((s) => ({
      date: s.snapshotDate,
      value: toNum(s.totalValue),
      cost: toNum(s.totalCost),
      gainLoss: toNum(s.gainLoss),
    }));

    return NextResponse.json({
      holdings: mappedHoldings,
      summary: {
        totalValue,
        totalCost,
        totalGainLoss: totalValue - totalCost,
        totalGainLossPercent: totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0,
        totalDividend,
      },
      snapshots,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error("Portfolio API error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
