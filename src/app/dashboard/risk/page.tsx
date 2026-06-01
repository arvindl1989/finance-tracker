"use client";
import { usePortfolio } from "@/hooks/use-portfolio";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { ShieldCheck } from "lucide-react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Radar, ResponsiveContainer, Tooltip,
} from "recharts";

function GaugeBar({ label, value, max = 100, color }: { label: string; value: number; max?: number; color: string }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium" style={{ color }}>{value.toFixed(1)}</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

export default function RiskPage() {
  const { data, loading } = usePortfolio();
  if (loading) return <div className="flex h-full items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  if (!data) return null;

  const { holdings, summary } = data;

  // Portfolio-level risk metrics
  const maxWeight = Math.max(...holdings.map((h) => h.portfolioWeightPercent));
  const hhi = holdings.reduce((sum, h) => sum + Math.pow(h.portfolioWeightPercent / 100, 2), 0) * 10000;
  const numSectors = new Set(holdings.map((h) => h.industry)).size;

  const industryMap = new Map<string, number>();
  holdings.forEach((h) => {
    const ind = h.industry ?? "Other";
    industryMap.set(ind, (industryMap.get(ind) ?? 0) + h.portfolioWeightPercent);
  });
  const maxSectorWeight = Math.max(...industryMap.values());

  const concentrationScore = Math.min((hhi / 100) * 2, 100);
  const sectorScore = Math.min(maxSectorWeight * 2, 100);
  const numHoldings = holdings.length;
  const diversificationScore = Math.max(0, 100 - numHoldings * 3);
  const portfolioHealthScore = Math.max(0, 100 - (concentrationScore * 0.4 + sectorScore * 0.3 + diversificationScore * 0.3));

  const radarData = [
    { subject: "Concentration", value: Math.min(concentrationScore, 100) },
    { subject: "Sector Risk", value: Math.min(sectorScore, 100) },
    { subject: "Diversification", value: Math.min(diversificationScore + 20, 100) },
    { subject: "Volatility", value: 45 },
    { subject: "Liquidity", value: 20 },
    { subject: "Valuation Risk", value: holdings.filter((h) => h.peStatus === "Expensive").length * 12 },
  ];

  const healthColor = portfolioHealthScore > 70 ? "#22c55e" : portfolioHealthScore > 40 ? "#f59e0b" : "#ef4444";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Risk Dashboard</h1>
        <p className="text-muted-foreground text-sm">Portfolio concentration, sector exposure, and risk scoring</p>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold" style={{ color: healthColor }}>{portfolioHealthScore.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground mt-1">Portfolio Health Score</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-orange-500">{hhi.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground mt-1">HHI Concentration Index</p>
            <p className="text-[10px] text-muted-foreground">&lt;1000 = Low, &lt;1800 = Medium</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold">{maxWeight.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mt-1">Largest Single Position</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold">{numSectors}</div>
            <p className="text-xs text-muted-foreground mt-1">Sectors Covered</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Radar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Risk Profile Radar</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} />
                <Radar name="Risk" dataKey="value" stroke="#ef4444" fill="#ef4444" fillOpacity={0.25} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Risk gauges */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Risk Factor Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <GaugeBar label="Concentration Risk (HHI-based)" value={Math.min(concentrationScore, 100)} color={concentrationScore > 60 ? "#ef4444" : concentrationScore > 35 ? "#f59e0b" : "#22c55e"} />
            <GaugeBar label="Sector Concentration" value={Math.min(sectorScore, 100)} color={sectorScore > 60 ? "#ef4444" : "#f59e0b"} />
            <GaugeBar label="Valuation Risk (% Expensive)" value={holdings.filter((h) => h.peStatus === "Expensive").length / holdings.length * 100} color="#f59e0b" />
            <GaugeBar label="Market Cap Risk (% SmallCap)" value={0} color="#3b82f6" />
          </CardContent>
        </Card>
      </div>

      {/* Per-stock risk table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" />
            Stock-wise Risk Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b text-muted-foreground">
                <th className="pb-2 text-left">Stock</th>
                <th className="pb-2 text-right">Weight</th>
                <th className="pb-2 text-right">Conc. Risk</th>
                <th className="pb-2 text-right">D/E Ratio</th>
                <th className="pb-2 text-right">Distance ATH</th>
                <th className="pb-2 text-center">Risk Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {holdings.sort((a, b) => (b.concentrationRiskScore ?? 0) - (a.concentrationRiskScore ?? 0)).map((h) => (
                <tr key={h.id}>
                  <td className="py-2 font-medium">{h.stockCode}</td>
                  <td className={`py-2 text-right ${h.portfolioWeightPercent > 15 ? "text-red-500 font-medium" : ""}`}>
                    {h.portfolioWeightPercent.toFixed(1)}%
                  </td>
                  <td className="py-2 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{
                          width: `${h.concentrationRiskScore ?? 0}%`,
                          background: (h.concentrationRiskScore ?? 0) > 70 ? "#ef4444" : (h.concentrationRiskScore ?? 0) > 40 ? "#f59e0b" : "#22c55e"
                        }} />
                      </div>
                      <span>{h.concentrationRiskScore?.toFixed(0) ?? 0}</span>
                    </div>
                  </td>
                  <td className={`py-2 text-right ${(h.debtToEquityRatio ?? 0) > 1 ? "text-red-500" : "text-muted-foreground"}`}>
                    {h.debtToEquityRatio?.toFixed(2) ?? "N/A"}
                  </td>
                  <td className={`py-2 text-right ${(h.distanceFromATHPercent ?? -100) > -10 ? "text-orange-500" : "text-muted-foreground"}`}>
                    {h.distanceFromATHPercent?.toFixed(1) ?? "N/A"}%
                  </td>
                  <td className="py-2 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      h.riskRating === "Very High" ? "bg-red-500/20 text-red-500" :
                      h.riskRating === "High" ? "bg-orange-500/20 text-orange-500" :
                      h.riskRating === "Medium" ? "bg-yellow-500/20 text-yellow-500" :
                      "bg-green-500/20 text-green-500"
                    }`}>
                      {h.riskRating ?? "N/A"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
