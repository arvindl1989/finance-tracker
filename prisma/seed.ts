import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const mockHoldings = [
  {
    stockCode: "RELIANCE",
    companyName: "Reliance Industries Ltd",
    industry: "Energy",
    subIndustry: "Oil & Gas",
    marketCapCategory: "LargeCap",
    exchange: "NSE",
    quantity: 100,
    averageBuyPrice: 2200,
    totalCost: 220000,
    currentPrice: 2850,
    eps: 98.5,
    bookValuePerShare: 1200,
    currentPE: 28.9,
    historicalAveragePE: 22.0,
    week52High: 3024,
    week52Low: 2180,
    year3High: 3024,
    year3Low: 1800,
    year5High: 3024,
    year5Low: 950,
    allTimeHigh: 3024,
    roePercent: 14.2,
    rocePercent: 12.8,
    debtToEquityRatio: 0.42,
    revenueGrowthPercent: 18.5,
    epsGrowthPercent: 22.1,
    targetWeightPercent: 12,
    dividendReceived: 4500,
    investmentThesis: "Diversified conglomerate with strong retail and telecom growth. Jio and Reliance Retail driving future value.",
  },
  {
    stockCode: "TCS",
    companyName: "Tata Consultancy Services Ltd",
    industry: "Technology",
    subIndustry: "IT Services",
    marketCapCategory: "LargeCap",
    exchange: "NSE",
    quantity: 50,
    averageBuyPrice: 3100,
    totalCost: 155000,
    currentPrice: 4180,
    eps: 128.7,
    bookValuePerShare: 485,
    currentPE: 32.5,
    historicalAveragePE: 28.0,
    week52High: 4300,
    week52Low: 3200,
    year3High: 4300,
    year3Low: 2800,
    year5High: 4300,
    year5Low: 1900,
    allTimeHigh: 4300,
    roePercent: 52.1,
    rocePercent: 68.4,
    debtToEquityRatio: 0.01,
    revenueGrowthPercent: 14.2,
    epsGrowthPercent: 16.8,
    targetWeightPercent: 10,
    dividendReceived: 5200,
    investmentThesis: "Market leader in Indian IT. Consistent dividend payer with strong free cash flow and global delivery model.",
  },
  {
    stockCode: "HDFCBANK",
    companyName: "HDFC Bank Ltd",
    industry: "Banking & Finance",
    subIndustry: "Private Sector Bank",
    marketCapCategory: "LargeCap",
    exchange: "NSE",
    quantity: 200,
    averageBuyPrice: 1450,
    totalCost: 290000,
    currentPrice: 1620,
    eps: 84.2,
    bookValuePerShare: 580,
    currentPE: 19.2,
    historicalAveragePE: 22.5,
    week52High: 1757,
    week52Low: 1363,
    year3High: 1757,
    year3Low: 1200,
    year5High: 1757,
    year5Low: 870,
    allTimeHigh: 1757,
    roePercent: 16.8,
    rocePercent: 18.2,
    debtToEquityRatio: 8.2,
    revenueGrowthPercent: 21.3,
    epsGrowthPercent: 19.7,
    targetWeightPercent: 15,
    dividendReceived: 7200,
    investmentThesis: "India's best managed private bank. Post HDFC merger synergies playing out. Consistent compounder.",
  },
  {
    stockCode: "INFY",
    companyName: "Infosys Ltd",
    industry: "Technology",
    subIndustry: "IT Services",
    marketCapCategory: "LargeCap",
    exchange: "NSE",
    quantity: 150,
    averageBuyPrice: 1380,
    totalCost: 207000,
    currentPrice: 1890,
    eps: 62.4,
    bookValuePerShare: 310,
    currentPE: 30.3,
    historicalAveragePE: 25.0,
    week52High: 1975,
    week52Low: 1351,
    year3High: 1975,
    year3Low: 1100,
    year5High: 1975,
    year5Low: 580,
    allTimeHigh: 1975,
    roePercent: 32.5,
    rocePercent: 42.8,
    debtToEquityRatio: 0.05,
    revenueGrowthPercent: 12.1,
    epsGrowthPercent: 14.3,
    targetWeightPercent: 10,
    dividendReceived: 6300,
  },
  {
    stockCode: "BAJFINANCE",
    companyName: "Bajaj Finance Ltd",
    industry: "Banking & Finance",
    subIndustry: "NBFC",
    marketCapCategory: "LargeCap",
    exchange: "NSE",
    quantity: 30,
    averageBuyPrice: 5800,
    totalCost: 174000,
    currentPrice: 7250,
    eps: 298.4,
    bookValuePerShare: 1850,
    currentPE: 24.3,
    historicalAveragePE: 38.0,
    week52High: 8192,
    week52Low: 6201,
    year3High: 8192,
    year3Low: 5000,
    year5High: 8192,
    year5Low: 2000,
    allTimeHigh: 8192,
    roePercent: 24.8,
    rocePercent: 11.2,
    debtToEquityRatio: 3.8,
    revenueGrowthPercent: 28.4,
    epsGrowthPercent: 31.2,
    targetWeightPercent: 8,
    dividendReceived: 1800,
    investmentThesis: "India's premier consumer lending franchise. Massive AUM growth. Potential re-rating catalyst from normalized credit costs.",
  },
  {
    stockCode: "WIPRO",
    companyName: "Wipro Ltd",
    industry: "Technology",
    subIndustry: "IT Services",
    marketCapCategory: "LargeCap",
    exchange: "NSE",
    quantity: 300,
    averageBuyPrice: 380,
    totalCost: 114000,
    currentPrice: 480,
    eps: 21.8,
    bookValuePerShare: 205,
    currentPE: 22.0,
    historicalAveragePE: 20.0,
    week52High: 544,
    week52Low: 415,
    year3High: 741,
    year3Low: 318,
    year5High: 741,
    year5Low: 165,
    allTimeHigh: 741,
    roePercent: 17.2,
    rocePercent: 22.1,
    debtToEquityRatio: 0.08,
    revenueGrowthPercent: 8.4,
    epsGrowthPercent: 9.8,
    targetWeightPercent: 6,
    dividendReceived: 3600,
  },
  {
    stockCode: "MARUTI",
    companyName: "Maruti Suzuki India Ltd",
    industry: "Automobile",
    subIndustry: "Passenger Vehicles",
    marketCapCategory: "LargeCap",
    exchange: "NSE",
    quantity: 20,
    averageBuyPrice: 8200,
    totalCost: 164000,
    currentPrice: 12400,
    eps: 485.2,
    bookValuePerShare: 3200,
    currentPE: 25.6,
    historicalAveragePE: 28.0,
    week52High: 13680,
    week52Low: 9420,
    year3High: 13680,
    year3Low: 6500,
    year5High: 13680,
    year5Low: 4000,
    allTimeHigh: 13680,
    roePercent: 18.4,
    rocePercent: 22.6,
    debtToEquityRatio: 0.02,
    revenueGrowthPercent: 16.8,
    epsGrowthPercent: 42.1,
    targetWeightPercent: 7,
    dividendReceived: 2400,
    investmentThesis: "Market leader in Indian PV with 42% market share. New SUV launches driving premiumization. CNG and hybrid transition positive.",
  },
  {
    stockCode: "ASIANPAINT",
    companyName: "Asian Paints Ltd",
    industry: "Consumer Goods",
    subIndustry: "Paints & Coatings",
    marketCapCategory: "LargeCap",
    exchange: "NSE",
    quantity: 60,
    averageBuyPrice: 2800,
    totalCost: 168000,
    currentPrice: 2950,
    eps: 52.4,
    bookValuePerShare: 295,
    currentPE: 56.3,
    historicalAveragePE: 62.0,
    week52High: 3868,
    week52Low: 2524,
    year3High: 3868,
    year3Low: 2200,
    year5High: 3868,
    year5Low: 1400,
    allTimeHigh: 3868,
    roePercent: 28.6,
    rocePercent: 36.4,
    debtToEquityRatio: 0.12,
    revenueGrowthPercent: 6.2,
    epsGrowthPercent: 4.8,
    targetWeightPercent: 5,
    dividendReceived: 1920,
    investmentThesis: "Consistent compounder with pricing power. Near-term headwinds from competition but long-term moat intact.",
  },
  {
    stockCode: "SUNPHARMA",
    companyName: "Sun Pharmaceutical Industries",
    industry: "Healthcare",
    subIndustry: "Pharmaceuticals",
    marketCapCategory: "LargeCap",
    exchange: "NSE",
    quantity: 120,
    averageBuyPrice: 980,
    totalCost: 117600,
    currentPrice: 1680,
    eps: 52.1,
    bookValuePerShare: 380,
    currentPE: 32.2,
    historicalAveragePE: 30.0,
    week52High: 1960,
    week52Low: 1150,
    year3High: 1960,
    year3Low: 750,
    year5High: 1960,
    year5Low: 410,
    allTimeHigh: 1960,
    roePercent: 15.2,
    rocePercent: 18.4,
    debtToEquityRatio: 0.18,
    revenueGrowthPercent: 14.6,
    epsGrowthPercent: 28.4,
    targetWeightPercent: 6,
    dividendReceived: 2400,
  },
  {
    stockCode: "TITAN",
    companyName: "Titan Company Ltd",
    industry: "Consumer Goods",
    subIndustry: "Jewelry & Watches",
    marketCapCategory: "LargeCap",
    exchange: "NSE",
    quantity: 80,
    averageBuyPrice: 1650,
    totalCost: 132000,
    currentPrice: 3580,
    eps: 54.2,
    bookValuePerShare: 285,
    currentPE: 66.1,
    historicalAveragePE: 72.0,
    week52High: 4008,
    week52Low: 3056,
    year3High: 4008,
    year3Low: 1900,
    year5High: 4008,
    year5Low: 900,
    allTimeHigh: 4008,
    roePercent: 29.4,
    rocePercent: 35.8,
    debtToEquityRatio: 0.05,
    revenueGrowthPercent: 22.4,
    epsGrowthPercent: 18.6,
    targetWeightPercent: 5,
    dividendReceived: 1760,
    investmentThesis: "Premium brand portfolio with strong consumer aspirational positioning. Gold price tailwind. Caratlane acquisition paying off.",
  },
  {
    stockCode: "PIDILITIND",
    companyName: "Pidilite Industries Ltd",
    industry: "Chemicals",
    subIndustry: "Specialty Chemicals",
    marketCapCategory: "LargeCap",
    exchange: "NSE",
    quantity: 70,
    averageBuyPrice: 2100,
    totalCost: 147000,
    currentPrice: 2980,
    eps: 42.8,
    bookValuePerShare: 268,
    currentPE: 69.6,
    historicalAveragePE: 68.0,
    week52High: 3264,
    week52Low: 2540,
    year3High: 3264,
    year3Low: 1850,
    year5High: 3264,
    year5Low: 1100,
    allTimeHigh: 3264,
    roePercent: 24.8,
    rocePercent: 30.2,
    debtToEquityRatio: 0.08,
    revenueGrowthPercent: 9.4,
    epsGrowthPercent: 11.2,
    targetWeightPercent: 4,
    dividendReceived: 980,
  },
  {
    stockCode: "NESTLEIND",
    companyName: "Nestle India Ltd",
    industry: "Consumer Goods",
    subIndustry: "FMCG - Food",
    marketCapCategory: "LargeCap",
    exchange: "NSE",
    quantity: 10,
    averageBuyPrice: 18000,
    totalCost: 180000,
    currentPrice: 22800,
    eps: 328.4,
    bookValuePerShare: 982,
    currentPE: 69.4,
    historicalAveragePE: 80.0,
    week52High: 27442,
    week52Low: 20542,
    year3High: 27442,
    year3Low: 16000,
    year5High: 27442,
    year5Low: 10000,
    allTimeHigh: 27442,
    roePercent: 110.2,
    rocePercent: 98.4,
    debtToEquityRatio: 0.01,
    revenueGrowthPercent: 8.6,
    epsGrowthPercent: 7.8,
    targetWeightPercent: 4,
    dividendReceived: 3200,
  },
];

async function main() {
  console.log("Seeding database...");

  // Create demo user
  const user = await prisma.user.upsert({
    where: { email: "demo@equityportfolio.com" },
    update: {},
    create: {
      email: "demo@equityportfolio.com",
      name: "Demo Investor",
    },
  });

  // Create portfolio
  const portfolio = await prisma.portfolio.upsert({
    where: { id: "demo-portfolio" },
    update: {},
    create: {
      id: "demo-portfolio",
      userId: user.id,
      name: "Growth & Quality Portfolio",
      description: "Long-term multi-cap portfolio focused on quality businesses",
      currency: "INR",
    },
  });

  // Calculate totals for each holding
  let totalPortfolioValue = 0;
  const holdingsWithCalc = mockHoldings.map((h) => {
    const currentValue = h.quantity * h.currentPrice;
    totalPortfolioValue += currentValue;
    return { ...h, currentValue };
  });

  // Upsert all holdings
  for (const h of holdingsWithCalc) {
    const currentValue = Number(h.currentValue);
    const totalCost = Number(h.totalCost);
    const gainLoss = currentValue - totalCost;
    const gainLossPercent = (gainLoss / totalCost) * 100;
    const weight = (currentValue / totalPortfolioValue) * 100;

    const grahamNumber = h.eps && h.bookValuePerShare
      ? Math.sqrt(22.5 * h.eps * h.bookValuePerShare)
      : null;
    const mos = grahamNumber
      ? ((grahamNumber - h.currentPrice) / grahamNumber) * 100
      : null;
    const grahamPremiumDiscount = grahamNumber
      ? ((h.currentPrice - grahamNumber) / grahamNumber) * 100
      : null;
    const peStatus = h.currentPE && h.historicalAveragePE
      ? h.currentPE < h.historicalAveragePE * 0.9
        ? "Cheap"
        : h.currentPE > h.historicalAveragePE * 1.1
        ? "Expensive"
        : "Fair"
      : null;

    // Buy score
    let buyScore = 0;
    if (h.currentPE && h.historicalAveragePE && h.currentPE < h.historicalAveragePE) buyScore += 20;
    if (mos && mos > 20) buyScore += 20;
    if (h.roePercent && h.roePercent > 15) buyScore += 15;
    if (h.rocePercent && h.rocePercent > 15) buyScore += 15;
    if (h.revenueGrowthPercent && h.revenueGrowthPercent > 10) buyScore += 10;
    if (h.epsGrowthPercent && h.epsGrowthPercent > 10) buyScore += 10;
    if (h.debtToEquityRatio && h.debtToEquityRatio < 0.5) buyScore += 10;

    const w52H = h.week52High ?? h.currentPrice;
    const w52L = h.week52Low ?? h.currentPrice;
    const distFrom52WH = ((h.currentPrice - w52H) / w52H) * 100;
    const distFrom52WL = ((h.currentPrice - w52L) / w52L) * 100;

    // Sell score
    let sellScore = 0;
    if (gainLossPercent > 100) sellScore += 30;
    if (h.currentPE && h.historicalAveragePE && h.currentPE > h.historicalAveragePE * 1.3) sellScore += 25;
    if (weight > 15) sellScore += 20;
    if (Math.abs(distFrom52WH) < 5) sellScore += 15;

    // Quality score
    let qualityScore = 0;
    if (h.roePercent) qualityScore += Math.min(h.roePercent / 50 * 25, 25);
    if (h.rocePercent) qualityScore += Math.min(h.rocePercent / 70 * 25, 25);
    if (h.debtToEquityRatio !== undefined) qualityScore += Math.max(0, 25 - h.debtToEquityRatio * 5);
    if (h.epsGrowthPercent) qualityScore += Math.min(h.epsGrowthPercent / 40 * 25, 25);
    const distFromATH = h.allTimeHigh ? ((h.currentPrice - h.allTimeHigh) / h.allTimeHigh) * 100 : null;

    let recommendation = "Hold";
    if (buyScore >= 60) recommendation = "Strong Buy";
    else if (buyScore >= 40) recommendation = "Buy";
    else if (sellScore >= 60) recommendation = "Strong Sell";
    else if (sellScore >= 40) recommendation = "Sell";

    const riskRating = weight > 15 ? "Very High" : weight > 10 ? "High" : weight > 5 ? "Medium" : "Low";

    await prisma.holding.upsert({
      where: { id: `demo-${h.stockCode}` },
      update: {
        currentPrice: h.currentPrice,
        currentValue,
        absoluteGainLoss: gainLoss,
        gainLossPercent,
        portfolioWeightPercent: weight,
        buyScore,
        sellScore,
        qualityScore,
        peStatus,
        grahamNumber,
        grahamPremiumDiscountPercent: grahamPremiumDiscount,
        marginOfSafetyPercent: mos,
        distanceFrom52WHighPercent: distFrom52WH,
        distanceFrom52WLowPercent: distFrom52WL,
        distanceFromATHPercent: distFromATH,
        recommendation,
        riskRating,
        lastUpdatedDate: new Date(),
      },
      create: {
        id: `demo-${h.stockCode}`,
        portfolioId: portfolio.id,
        stockCode: h.stockCode,
        companyName: h.companyName,
        industry: h.industry,
        subIndustry: h.subIndustry,
        marketCapCategory: h.marketCapCategory,
        exchange: h.exchange,
        quantity: h.quantity,
        averageBuyPrice: h.averageBuyPrice,
        totalCost: h.totalCost,
        currentPrice: h.currentPrice,
        currentValue,
        absoluteGainLoss: gainLoss,
        gainLossPercent,
        dividendReceived: h.dividendReceived ?? 0,
        portfolioWeightPercent: weight,
        targetWeightPercent: h.targetWeightPercent,
        currentPE: h.currentPE,
        historicalAveragePE: h.historicalAveragePE,
        peStatus,
        eps: h.eps,
        bookValuePerShare: h.bookValuePerShare,
        grahamNumber,
        grahamPremiumDiscountPercent: grahamPremiumDiscount,
        marginOfSafetyPercent: mos,
        roePercent: h.roePercent,
        rocePercent: h.rocePercent,
        debtToEquityRatio: h.debtToEquityRatio,
        revenueGrowthPercent: h.revenueGrowthPercent,
        epsGrowthPercent: h.epsGrowthPercent,
        qualityScore,
        week52High: h.week52High,
        week52Low: h.week52Low,
        distanceFrom52WHighPercent: distFrom52WH,
        distanceFrom52WLowPercent: distFrom52WL,
        year3High: h.year3High,
        year3Low: h.year3Low,
        year5High: h.year5High,
        year5Low: h.year5Low,
        allTimeHigh: h.allTimeHigh,
        distanceFromATHPercent: distFromATH,
        buyScore,
        sellScore,
        buySignal: buyScore >= 40,
        sellSignal: sellScore >= 40,
        recommendation,
        riskRating,
        concentrationRiskScore: weight > 15 ? 90 : weight > 10 ? 70 : weight > 5 ? 40 : 20,
        investmentThesis: h.investmentThesis,
      },
    });
  }

  // Create sample alerts
  await prisma.alert.createMany({
    data: [
      {
        userId: user.id,
        stockCode: "BAJFINANCE",
        companyName: "Bajaj Finance Ltd",
        alertType: "PE_LOW",
        severity: "Info",
        message: "BAJFINANCE PE (24.3x) is significantly below 5-year avg (38x) — potential buy opportunity",
        value: 24.3,
        threshold: 38,
      },
      {
        userId: user.id,
        stockCode: "TITAN",
        companyName: "Titan Company Ltd",
        alertType: "52WH",
        severity: "Warning",
        message: "TITAN is trading near 52-week high — consider partial profit booking",
        value: 3580,
        threshold: 4008,
      },
      {
        userId: user.id,
        stockCode: "HDFCBANK",
        companyName: "HDFC Bank Ltd",
        alertType: "ALLOCATION",
        severity: "Warning",
        message: "HDFCBANK allocation (15.8%) approaching concentration limit of 20%",
        value: 15.8,
        threshold: 20,
      },
    ],
    skipDuplicates: true,
  });

  // Create portfolio snapshots (last 30 days simulated)
  const snapshots = [];
  const baseValue = 1600000;
  for (let i = 30; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const noise = (Math.random() - 0.48) * 30000;
    const totalValue = baseValue + (30 - i) * 8000 + noise;
    snapshots.push({
      portfolioId: portfolio.id,
      snapshotDate: date,
      totalValue,
      totalCost: 1869600,
      gainLoss: totalValue - 1869600,
    });
  }
  await prisma.portfolioSnapshot.createMany({ data: snapshots, skipDuplicates: true });

  console.log("Seed complete.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
