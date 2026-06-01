import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const DEMO_PORTFOLIO_ID = "demo-portfolio";

function num(v: unknown): number | null {
  if (v === null || v === undefined || v === "" || v === "N/A") return null;
  const n = Number(v);
  return isNaN(n) ? null : n;
}

function mapRow(row: Record<string, unknown>) {
  const g = (keys: string[]) => {
    for (const k of keys) {
      const v = row[k] ?? row[k.toLowerCase()] ?? row[k.toUpperCase()];
      if (v !== undefined && v !== null && v !== "") return v;
    }
    return undefined;
  };

  const stockCode = String(g(["StockCode","stockCode","Stock Code","symbol","ticker"]) ?? "").trim();
  const quantity = num(g(["Quantity","quantity","qty","Qty","shares"])) ?? 0;
  const avgPrice = num(g(["AverageBuyPrice","averageBuyPrice","AvgPrice","Avg Price","average price","buyprice"])) ?? 0;
  const currentPrice = num(g(["CurrentPrice","currentPrice","Current Price","LTP","ltp","price"])) ?? avgPrice;

  return {
    stockCode,
    companyName: String(g(["CompanyName","companyName","Company Name","company"]) ?? stockCode),
    industry: String(g(["Industry","industry","Sector","sector"]) ?? "Unknown"),
    subIndustry: String(g(["SubIndustry","subIndustry","Sub Industry"]) ?? ""),
    marketCapCategory: String(g(["MarketCapCategory","marketCapCategory","Market Cap"]) ?? ""),
    exchange: String(g(["Exchange","exchange"]) ?? "NSE"),
    quantity,
    averageBuyPrice: avgPrice,
    currentPrice,
    dividendReceived: num(g(["DividendReceived","dividendReceived","Dividend"])) ?? 0,
    currentPE: num(g(["CurrentPE","currentPE","Current PE","pe","PE"])),
    historicalAveragePE: num(g(["HistoricalAveragePE","historicalAveragePE","Historical PE","Hist PE"])),
    eps: num(g(["EPS","eps"])),
    bookValuePerShare: num(g(["BookValuePerShare","bookValuePerShare","BVPS","Book Value"])),
    roePercent: num(g(["ROEPercent","roePercent","ROE","roe"])),
    rocePercent: num(g(["ROCEPercent","rocePercent","ROCE","roce"])),
    debtToEquityRatio: num(g(["DebtToEquityRatio","debtToEquityRatio","D/E","DE","debt equity"])),
    revenueGrowthPercent: num(g(["RevenueGrowthPercent","revenueGrowthPercent","Revenue Growth"])),
    epsGrowthPercent: num(g(["EPSGrowthPercent","epsGrowthPercent","EPS Growth"])),
    week52High: num(g(["Week52High","week52High","52W High","52 Week High"])),
    week52Low: num(g(["Week52Low","week52Low","52W Low","52 Week Low"])),
    allTimeHigh: num(g(["AllTimeHigh","allTimeHigh","ATH","All Time High"])),
    targetWeightPercent: num(g(["TargetWeightPercent","targetWeightPercent","Target Weight","target weight"])),
    investmentThesis: String(g(["InvestmentThesis","investmentThesis","Investment Thesis","thesis"]) ?? ""),
    notes: String(g(["Notes","notes"]) ?? ""),
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { holdings } = body as { holdings: Record<string, unknown>[] };

    if (!holdings || !Array.isArray(holdings)) {
      return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
    }

    // Ensure demo portfolio exists
    await prisma.portfolio.upsert({
      where: { id: DEMO_PORTFOLIO_ID },
      update: {},
      create: {
        id: DEMO_PORTFOLIO_ID,
        userId: (await prisma.user.upsert({
          where: { email: "demo@equityportfolio.com" },
          update: {},
          create: { email: "demo@equityportfolio.com", name: "Demo Investor" },
        })).id,
        name: "Growth & Quality Portfolio",
        currency: "INR",
      },
    });

    const results = { created: 0, updated: 0, errors: [] as string[] };

    for (const rawRow of holdings) {
      try {
        const r = mapRow(rawRow);
        if (!r.stockCode) continue;

        const totalCost = r.quantity * r.averageBuyPrice;
        const currentValue = r.quantity * r.currentPrice;
        const gainLoss = currentValue - totalCost;
        const gainLossPct = totalCost > 0 ? (gainLoss / totalCost) * 100 : 0;

        const grahamNumber = r.eps && r.bookValuePerShare && r.eps > 0 && r.bookValuePerShare > 0
          ? Math.sqrt(22.5 * r.eps * r.bookValuePerShare) : null;
        const mos = grahamNumber ? ((grahamNumber - r.currentPrice) / grahamNumber) * 100 : null;
        const grahamPremium = grahamNumber ? ((r.currentPrice - grahamNumber) / grahamNumber) * 100 : null;

        const peStatus = r.currentPE && r.historicalAveragePE && r.historicalAveragePE > 0
          ? r.currentPE < r.historicalAveragePE * 0.9 ? "Cheap"
          : r.currentPE > r.historicalAveragePE * 1.1 ? "Expensive" : "Fair"
          : null;

        const w52H = r.week52High ?? r.currentPrice;
        const w52L = r.week52Low ?? r.currentPrice;
        const distFrom52WH = ((r.currentPrice - w52H) / w52H) * 100;
        const distFrom52WL = ((r.currentPrice - w52L) / w52L) * 100;
        const distFromATH = r.allTimeHigh ? ((r.currentPrice - r.allTimeHigh) / r.allTimeHigh) * 100 : null;

        let buyScore = 0;
        if (r.currentPE && r.historicalAveragePE && r.currentPE < r.historicalAveragePE) buyScore += 20;
        if (mos && mos > 20) buyScore += 20;
        if (r.roePercent && r.roePercent > 15) buyScore += 15;
        if (r.rocePercent && r.rocePercent > 15) buyScore += 15;
        if (r.revenueGrowthPercent && r.revenueGrowthPercent > 10) buyScore += 10;
        if (r.epsGrowthPercent && r.epsGrowthPercent > 10) buyScore += 10;
        if (r.debtToEquityRatio !== null && r.debtToEquityRatio !== undefined && r.debtToEquityRatio < 0.5) buyScore += 10;

        let sellScore = 0;
        if (gainLossPct > 100) sellScore += 30;
        if (r.currentPE && r.historicalAveragePE && r.currentPE > r.historicalAveragePE * 1.3) sellScore += 25;
        if (Math.abs(distFrom52WH) < 5) sellScore += 15;

        let qualityScore = 0;
        if (r.roePercent) qualityScore += Math.min(r.roePercent / 50 * 25, 25);
        if (r.rocePercent) qualityScore += Math.min(r.rocePercent / 70 * 25, 25);
        if (r.debtToEquityRatio != null) qualityScore += Math.max(0, 25 - r.debtToEquityRatio * 5);
        if (r.epsGrowthPercent) qualityScore += Math.min(r.epsGrowthPercent / 40 * 25, 25);

        const rec = buyScore >= 60 ? "Strong Buy" : buyScore >= 40 ? "Buy"
          : sellScore >= 60 ? "Strong Sell" : sellScore >= 40 ? "Sell" : "Hold";

        const id = `demo-${r.stockCode}`;
        const payload = {
          portfolioId: DEMO_PORTFOLIO_ID,
          stockCode: r.stockCode,
          companyName: r.companyName,
          industry: r.industry || null,
          subIndustry: r.subIndustry || null,
          marketCapCategory: r.marketCapCategory || null,
          exchange: r.exchange || null,
          quantity: r.quantity,
          averageBuyPrice: r.averageBuyPrice,
          totalCost,
          currentPrice: r.currentPrice,
          currentValue,
          absoluteGainLoss: gainLoss,
          gainLossPercent: gainLossPct,
          dividendReceived: r.dividendReceived ?? 0,
          currentPE: r.currentPE,
          historicalAveragePE: r.historicalAveragePE,
          peStatus,
          eps: r.eps,
          bookValuePerShare: r.bookValuePerShare,
          grahamNumber,
          grahamPremiumDiscountPercent: grahamPremium,
          marginOfSafetyPercent: mos,
          roePercent: r.roePercent,
          rocePercent: r.rocePercent,
          debtToEquityRatio: r.debtToEquityRatio,
          revenueGrowthPercent: r.revenueGrowthPercent,
          epsGrowthPercent: r.epsGrowthPercent,
          qualityScore,
          week52High: r.week52High,
          week52Low: r.week52Low,
          distanceFrom52WHighPercent: distFrom52WH,
          distanceFrom52WLowPercent: distFrom52WL,
          allTimeHigh: r.allTimeHigh,
          distanceFromATHPercent: distFromATH,
          targetWeightPercent: r.targetWeightPercent,
          buyScore,
          sellScore,
          buySignal: buyScore >= 40,
          sellSignal: sellScore >= 40,
          recommendation: rec,
          riskRating: r.targetWeightPercent && r.targetWeightPercent > 15 ? "Very High" : r.targetWeightPercent && r.targetWeightPercent > 10 ? "High" : "Medium",
          concentrationRiskScore: null,
          investmentThesis: r.investmentThesis || null,
          notes: r.notes || null,
        };

        const existing = await prisma.holding.findUnique({ where: { id } });
        if (existing) {
          await prisma.holding.update({ where: { id }, data: payload });
          results.updated++;
        } else {
          await prisma.holding.create({ data: { id, ...payload } });
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
