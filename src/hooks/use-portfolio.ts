"use client";
import { useState, useEffect } from "react";

export interface Holding {
  id: string;
  stockCode: string;
  companyName: string;
  industry: string | null;
  subIndustry: string | null;
  marketCapCategory: string | null;
  exchange: string | null;
  quantity: number;
  averageBuyPrice: number;
  totalCost: number;
  currentPrice: number;
  currentValue: number;
  absoluteGainLoss: number;
  gainLossPercent: number;
  dividendReceived: number;
  portfolioWeightPercent: number;
  targetWeightPercent: number | null;
  currentPE: number | null;
  historicalAveragePE: number | null;
  peStatus: string | null;
  eps: number | null;
  bookValuePerShare: number | null;
  grahamNumber: number | null;
  grahamPremiumDiscountPercent: number | null;
  marginOfSafetyPercent: number | null;
  roePercent: number | null;
  rocePercent: number | null;
  debtToEquityRatio: number | null;
  revenueGrowthPercent: number | null;
  epsGrowthPercent: number | null;
  qualityScore: number | null;
  week52High: number | null;
  week52Low: number | null;
  distanceFrom52WHighPercent: number | null;
  distanceFrom52WLowPercent: number | null;
  allTimeHigh: number | null;
  distanceFromATHPercent: number | null;
  buyScore: number | null;
  sellScore: number | null;
  buySignal: boolean;
  sellSignal: boolean;
  recommendation: string | null;
  concentrationRiskScore: number | null;
  riskRating: string | null;
  investmentThesis: string | null;
  notes: string | null;
}

export interface PortfolioSummary {
  totalValue: number;
  totalCost: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  totalDividend: number;
}

export interface Snapshot {
  date: string;
  value: number;
  cost: number;
  gainLoss: number;
}

export interface PortfolioData {
  holdings: Holding[];
  summary: PortfolioSummary;
  snapshots: Snapshot[];
}

export function usePortfolio() {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/portfolio")
      .then((r) => r.json())
      .then((d) => {
        if (d?.error) { setError(d.error); setLoading(false); return; }
        setData(d);
        setLoading(false);
      })
      .catch((e) => { setError(e.message); setLoading(false); });
  }, []);

  const refresh = () => {
    setLoading(true);
    fetch("/api/portfolio")
      .then((r) => r.json())
      .then((d) => { if (!d?.error) setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  };

  return { data, loading, error, refresh };
}
