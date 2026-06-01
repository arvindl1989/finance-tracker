import { NextResponse } from "next/server";
import { prisma, dbMissing } from "@/lib/db";

const DEMO_PORTFOLIO_ID = "demo-portfolio";

export async function GET() {
  if (dbMissing() || !prisma) {
    return NextResponse.json({ error: "DATABASE_URL not configured. Add a PostgreSQL database in Railway and set DATABASE_URL." }, { status: 503 });
  }
  try {
    const holdings = await prisma.holding.findMany({
      where: { portfolioId: DEMO_PORTFOLIO_ID },
      orderBy: { currentValue: "desc" },
    });

    const totalValue = holdings.reduce((s, h) => s + Number(h.currentValue), 0);
    const totalCost  = holdings.reduce((s, h) => s + Number(h.totalCost), 0);
    const totalDividend = holdings.reduce((s, h) => s + Number(h.dividendReceived), 0);

    const snapshots = await prisma.portfolioSnapshot.findMany({
      where: { portfolioId: DEMO_PORTFOLIO_ID },
      orderBy: { snapshotDate: "asc" },
      take: 30,
    });

    return NextResponse.json({
      holdings: holdings.map((h) => ({
        ...h,
        quantity: Number(h.quantity),
        averageBuyPrice: Number(h.averageBuyPrice),
        totalCost: Number(h.totalCost),
        currentPrice: Number(h.currentPrice),
        currentValue: Number(h.currentValue),
        absoluteGainLoss: Number(h.absoluteGainLoss),
        gainLossPercent: Number(h.gainLossPercent),
        dividendReceived: Number(h.dividendReceived),
        portfolioWeightPercent: Number(h.portfolioWeightPercent ?? 0),
        targetWeightPercent: h.targetWeightPercent ? Number(h.targetWeightPercent) : null,
        currentPE: h.currentPE ? Number(h.currentPE) : null,
        historicalAveragePE: h.historicalAveragePE ? Number(h.historicalAveragePE) : null,
        eps: h.eps ? Number(h.eps) : null,
        bookValuePerShare: h.bookValuePerShare ? Number(h.bookValuePerShare) : null,
        grahamNumber: h.grahamNumber ? Number(h.grahamNumber) : null,
        grahamPremiumDiscountPercent: h.grahamPremiumDiscountPercent ? Number(h.grahamPremiumDiscountPercent) : null,
        marginOfSafetyPercent: h.marginOfSafetyPercent ? Number(h.marginOfSafetyPercent) : null,
        roePercent: h.roePercent ? Number(h.roePercent) : null,
        rocePercent: h.rocePercent ? Number(h.rocePercent) : null,
        debtToEquityRatio: h.debtToEquityRatio ? Number(h.debtToEquityRatio) : null,
        revenueGrowthPercent: h.revenueGrowthPercent ? Number(h.revenueGrowthPercent) : null,
        epsGrowthPercent: h.epsGrowthPercent ? Number(h.epsGrowthPercent) : null,
        qualityScore: h.qualityScore ? Number(h.qualityScore) : null,
        week52High: h.week52High ? Number(h.week52High) : null,
        week52Low: h.week52Low ? Number(h.week52Low) : null,
        distanceFrom52WHighPercent: h.distanceFrom52WHighPercent ? Number(h.distanceFrom52WHighPercent) : null,
        distanceFrom52WLowPercent: h.distanceFrom52WLowPercent ? Number(h.distanceFrom52WLowPercent) : null,
        allTimeHigh: h.allTimeHigh ? Number(h.allTimeHigh) : null,
        distanceFromATHPercent: h.distanceFromATHPercent ? Number(h.distanceFromATHPercent) : null,
        buyScore: h.buyScore ? Number(h.buyScore) : null,
        sellScore: h.sellScore ? Number(h.sellScore) : null,
        concentrationRiskScore: h.concentrationRiskScore ? Number(h.concentrationRiskScore) : null,
      })),
      summary: {
        totalValue,
        totalCost,
        totalGainLoss: totalValue - totalCost,
        totalGainLossPercent: totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0,
        totalDividend,
      },
      snapshots: snapshots.map((s) => ({
        date: s.snapshotDate,
        value: Number(s.totalValue),
        cost: Number(s.totalCost),
        gainLoss: Number(s.gainLoss),
      })),
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
