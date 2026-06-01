import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const DEMO_PORTFOLIO_ID = "demo-portfolio";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { holdings } = body as { holdings: Record<string, unknown>[] };

    if (!holdings || !Array.isArray(holdings)) {
      return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
    }

    const results = { created: 0, updated: 0, errors: [] as string[] };

    for (const row of holdings) {
      try {
        const stockCode = String(row.stockCode || row.StockCode || row["Stock Code"] || "").trim();
        if (!stockCode) continue;

        const quantity = Number(row.quantity || row.Quantity || 0);
        const avgPrice = Number(row.averageBuyPrice || row.AverageBuyPrice || row["Avg Price"] || 0);
        const currentPrice = Number(row.currentPrice || row.CurrentPrice || row["Current Price"] || avgPrice);
        const currentValue = quantity * currentPrice;
        const totalCost = quantity * avgPrice;

        const existingId = `demo-${stockCode}`;
        const existing = await prisma.holding.findUnique({ where: { id: existingId } });

        const data = {
          portfolioId: DEMO_PORTFOLIO_ID,
          stockCode,
          companyName: String(row.companyName || row.CompanyName || row["Company Name"] || stockCode),
          industry: String(row.industry || row.Industry || "Unknown"),
          quantity,
          averageBuyPrice: avgPrice,
          totalCost,
          currentPrice,
          currentValue,
          absoluteGainLoss: currentValue - totalCost,
          gainLossPercent: totalCost > 0 ? ((currentValue - totalCost) / totalCost) * 100 : 0,
        };

        if (existing) {
          await prisma.holding.update({ where: { id: existingId }, data });
          results.updated++;
        } else {
          await prisma.holding.create({ data: { id: existingId, ...data } });
          results.created++;
        }
      } catch (e) {
        results.errors.push(String(e));
      }
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Import failed" }, { status: 500 });
  }
}
