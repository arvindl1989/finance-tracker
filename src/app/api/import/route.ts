import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const PORTFOLIO_ID = "demo-portfolio";

function n(v: unknown): number | null {
  if (v === null || v === undefined || v === "" || v === "N/A" || v === "n/a") return null;
  const x = Number(v);
  return isNaN(x) ? null : x;
}

function pick(row: Record<string, unknown>, ...keys: string[]): unknown {
  for (const k of keys) {
    for (const rowKey of Object.keys(row)) {
      if (rowKey.toLowerCase().replace(/[\s_-]/g, "") === k.toLowerCase().replace(/[\s_-]/g, "")) {
        if (row[rowKey] !== undefined && row[rowKey] !== null && row[rowKey] !== "") return row[rowKey];
      }
    }
  }
  return undefined;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { holdings } = body as { holdings: Record<string, unknown>[] };
    if (!Array.isArray(holdings) || !holdings.length)
      return NextResponse.json({ error: "No holdings data received" }, { status: 400 });

    // Ensure user + portfolio exist
    const user = await prisma.user.upsert({
      where: { email: "demo@equityportfolio.com" },
      update: {},
      create: { email: "demo@equityportfolio.com", name: "Demo Investor" },
    });
    await prisma.portfolio.upsert({
      where: { id: PORTFOLIO_ID },
      update: {},
      create: { id: PORTFOLIO_ID, userId: user.id, name: "Growth & Quality Portfolio", currency: "INR" },
    });

    let created = 0, updated = 0;
    const errors: string[] = [];

    for (const raw of holdings) {
      try {
        const stockCode = String(pick(raw, "StockCode","stockcode","symbol","ticker") ?? "").trim().toUpperCase();
        if (!stockCode) continue;

        const qty    = n(pick(raw, "Quantity","qty","shares")) ?? 0;
        const avgBuy = n(pick(raw, "AverageBuyPrice","avgprice","averageprice","buyprice")) ?? 0;
        const cur    = n(pick(raw, "CurrentPrice","currentprice","ltp","price")) ?? avgBuy;

        const totalCost    = qty * avgBuy;
        const currentValue = qty * cur;
        const gainLoss     = currentValue - totalCost;
        const gainLossPct  = totalCost > 0 ? (gainLoss / totalCost) * 100 : 0;

        const curPE   = n(pick(raw, "CurrentPE","currentpe","pe"));
        const histPE  = n(pick(raw, "HistoricalAveragePE","historicalaveragePE","histpe","avgpe"));
        const eps     = n(pick(raw, "EPS","eps"));
        const bvps    = n(pick(raw, "BookValuePerShare","bvps","bookvalue"));
        const roe     = n(pick(raw, "ROEPercent","roe","roepercent"));
        const roce    = n(pick(raw, "ROCEPercent","roce","rocepercent"));
        const de      = n(pick(raw, "DebtToEquityRatio","de","debtequity","d/e"));
        const revG    = n(pick(raw, "RevenueGrowthPercent","revenuegrowth","revgrowth"));
        const epsG    = n(pick(raw, "EPSGrowthPercent","epsgrowth","earningsgrowth"));
        const w52h    = n(pick(raw, "Week52High","52weekhigh","52whigh","52wh"));
        const w52l    = n(pick(raw, "Week52Low","52weeklow","52wlow","52wl"));
        const ath     = n(pick(raw, "AllTimeHigh","allTimehigh","ath"));
        const div     = n(pick(raw, "DividendReceived","dividend","dividends")) ?? 0;
        const targetW = n(pick(raw, "TargetWeightPercent","targetweight","targetallocation"));

        const graham = eps && bvps && eps > 0 && bvps > 0 ? Math.sqrt(22.5 * eps * bvps) : null;
        const mos    = graham ? ((graham - cur) / graham) * 100 : null;
        const gPrem  = graham ? ((cur - graham) / graham) * 100 : null;

        const peStatus = curPE && histPE && histPE > 0
          ? curPE < histPE * 0.9 ? "Cheap" : curPE > histPE * 1.1 ? "Expensive" : "Fair"
          : null;

        const d52h = w52h ? ((cur - w52h) / w52h) * 100 : null;
        const d52l = w52l ? ((cur - w52l) / w52l) * 100 : null;
        const dAth = ath  ? ((cur - ath)  / ath)  * 100 : null;

        let buyScore = 0;
        if (curPE && histPE && curPE < histPE) buyScore += 20;
        if (mos && mos > 20) buyScore += 20;
        if (roe && roe > 15) buyScore += 15;
        if (roce && roce > 15) buyScore += 15;
        if (revG && revG > 10) buyScore += 10;
        if (epsG && epsG > 10) buyScore += 10;
        if (de !== null && de < 0.5) buyScore += 10;

        let sellScore = 0;
        if (gainLossPct > 100) sellScore += 30;
        if (curPE && histPE && curPE > histPE * 1.3) sellScore += 25;
        if (d52h !== null && Math.abs(d52h) < 5) sellScore += 15;

        let q = 0;
        if (roe)  q += Math.min(roe  / 50 * 25, 25);
        if (roce) q += Math.min(roce / 70 * 25, 25);
        if (de !== null) q += Math.max(0, 25 - de * 5);
        if (epsG) q += Math.min(epsG / 40 * 25, 25);

        const rec = buyScore >= 60 ? "Strong Buy" : buyScore >= 40 ? "Buy"
          : sellScore >= 60 ? "Strong Sell" : sellScore >= 40 ? "Sell" : "Hold";

        const payload = {
          portfolioId: PORTFOLIO_ID,
          stockCode,
          companyName: String(pick(raw, "CompanyName","company","name") ?? stockCode),
          industry: String(pick(raw, "Industry","sector") ?? "Unknown") || null,
          subIndustry: String(pick(raw, "SubIndustry","subindustry","subsector") ?? "") || null,
          marketCapCategory: String(pick(raw, "MarketCapCategory","marketcap","mcap") ?? "") || null,
          exchange: String(pick(raw, "Exchange","exchange") ?? "NSE") || null,
          quantity: qty,
          averageBuyPrice: avgBuy,
          totalCost,
          currentPrice: cur,
          currentValue,
          absoluteGainLoss: gainLoss,
          gainLossPercent: gainLossPct,
          dividendReceived: div,
          currentPE: curPE,
          historicalAveragePE: histPE,
          peStatus,
          eps, bookValuePerShare: bvps,
          grahamNumber: graham,
          grahamPremiumDiscountPercent: gPrem,
          marginOfSafetyPercent: mos,
          roePercent: roe, rocePercent: roce,
          debtToEquityRatio: de,
          revenueGrowthPercent: revG,
          epsGrowthPercent: epsG,
          qualityScore: q,
          week52High: w52h, week52Low: w52l,
          distanceFrom52WHighPercent: d52h,
          distanceFrom52WLowPercent: d52l,
          allTimeHigh: ath,
          distanceFromATHPercent: dAth,
          targetWeightPercent: targetW,
          buyScore, sellScore,
          buySignal: buyScore >= 40,
          sellSignal: sellScore >= 40,
          recommendation: rec,
          riskRating: "Medium",
          concentrationRiskScore: null,
          investmentThesis: String(pick(raw, "InvestmentThesis","thesis","investmentthesis") ?? "") || null,
          notes: String(pick(raw, "Notes","notes","comments") ?? "") || null,
        };

        const id = `demo-${stockCode}`;
        const exists = await prisma.holding.findUnique({ where: { id } });
        if (exists) {
          await prisma.holding.update({ where: { id }, data: payload });
          updated++;
        } else {
          await prisma.holding.create({ data: { id, ...payload } });
          created++;
        }
      } catch (e) {
        errors.push(String(e).slice(0, 120));
      }
    }

    return NextResponse.json({ created, updated, errors });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error("Import error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
