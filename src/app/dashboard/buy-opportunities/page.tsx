"use client";
import { usePortfolio } from "@/hooks/use-portfolio";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, formatPercent, getRecommendationColor } from "@/lib/utils";
import { TrendingUp, CheckCircle, XCircle } from "lucide-react";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from "recharts";

function ScoreFactor({ label, value, pass }: { label: string; value: string; pass: boolean }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
      <div className="flex items-center gap-2">
        {pass ? <CheckCircle className="h-3.5 w-3.5 text-green-500" /> : <XCircle className="h-3.5 w-3.5 text-red-500" />}
        <span className="text-xs">{label}</span>
      </div>
      <span className="text-xs font-medium">{value}</span>
    </div>
  );
}

export default function BuyOpportunitiesPage() {
  const { data, loading } = usePortfolio();
  if (loading) return <div className="flex h-full items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  if (!data) return null;

  const { holdings } = data;
  const ranked = [...holdings].sort((a, b) => (b.buyScore ?? 0) - (a.buyScore ?? 0));
  const topBuys = ranked.slice(0, 3);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Buy Opportunity Engine</h1>
        <p className="text-muted-foreground text-sm">Scored buy opportunities based on valuation, quality, and growth metrics</p>
      </div>

      {/* Top 3 buy cards */}
      <div className="grid gap-4 lg:grid-cols-3">
        {topBuys.map((h, rank) => {
          const radarData = [
            { subject: "PE Value", A: h.currentPE && h.historicalAveragePE && h.currentPE < h.historicalAveragePE ? 100 : 30 },
            { subject: "MOS", A: Math.max(0, Math.min((h.marginOfSafetyPercent ?? 0) * 2, 100)) },
            { subject: "ROE", A: Math.min((h.roePercent ?? 0) * 2.5, 100) },
            { subject: "ROCE", A: Math.min((h.rocePercent ?? 0) * 2, 100) },
            { subject: "EPS Growth", A: Math.min((h.epsGrowthPercent ?? 0) * 2, 100) },
            { subject: "Low Debt", A: Math.max(0, 100 - (h.debtToEquityRatio ?? 0) * 20) },
          ];
          return (
            <Card key={h.id} className={rank === 0 ? "border-blue-500/40 bg-blue-500/5" : ""}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">{h.stockCode}</CardTitle>
                    <p className="text-xs text-muted-foreground">{h.industry}</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-500">{h.buyScore?.toFixed(0)}</div>
                    <div className="text-[10px] text-muted-foreground">Buy Score</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <ResponsiveContainer width="100%" height={160}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9 }} />
                    <Radar name={h.stockCode} dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                  </RadarChart>
                </ResponsiveContainer>

                <div className="space-y-0.5">
                  <ScoreFactor label="PE below historical" value={`${h.currentPE?.toFixed(1)}x vs ${h.historicalAveragePE?.toFixed(1)}x avg`} pass={!!(h.currentPE && h.historicalAveragePE && h.currentPE < h.historicalAveragePE)} />
                  <ScoreFactor label="Margin of Safety >20%" value={`${h.marginOfSafetyPercent?.toFixed(1)}%`} pass={(h.marginOfSafetyPercent ?? 0) > 20} />
                  <ScoreFactor label="ROE >15%" value={`${h.roePercent?.toFixed(1)}%`} pass={(h.roePercent ?? 0) > 15} />
                  <ScoreFactor label="ROCE >15%" value={`${h.rocePercent?.toFixed(1)}%`} pass={(h.rocePercent ?? 0) > 15} />
                  <ScoreFactor label="EPS Growth >10%" value={`${h.epsGrowthPercent?.toFixed(1)}%`} pass={(h.epsGrowthPercent ?? 0) > 10} />
                  <ScoreFactor label="Low Debt (D/E <0.5)" value={`${h.debtToEquityRatio?.toFixed(2)}`} pass={(h.debtToEquityRatio ?? 99) < 0.5} />
                </div>

                <div className="pt-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Buy Score</span>
                    <span className="font-medium">{h.buyScore?.toFixed(0)}/100</span>
                  </div>
                  <Progress value={h.buyScore ?? 0} className="h-2" />
                </div>

                <Badge className={`w-full justify-center ${getRecommendationColor(h.recommendation ?? "Hold")}`}>
                  {h.recommendation}
                </Badge>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Full ranking table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-blue-500" />
            Full Buy Score Ranking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b text-muted-foreground">
                <th className="pb-2 text-left">Rank</th>
                <th className="pb-2 text-left">Stock</th>
                <th className="pb-2 text-right">Buy Score</th>
                <th className="pb-2 text-right">PE Status</th>
                <th className="pb-2 text-right">MOS%</th>
                <th className="pb-2 text-right">ROE%</th>
                <th className="pb-2 text-right">ROCE%</th>
                <th className="pb-2 text-right">D/E</th>
                <th className="pb-2 text-center">Signal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {ranked.map((h, i) => (
                <tr key={h.id} className={i < 3 ? "bg-blue-500/5" : ""}>
                  <td className="py-2 font-bold text-muted-foreground">#{i + 1}</td>
                  <td className="py-2">
                    <div className="font-medium">{h.stockCode}</div>
                    <div className="text-muted-foreground">{h.industry}</div>
                  </td>
                  <td className="py-2 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${h.buyScore ?? 0}%` }} />
                      </div>
                      <span className="font-bold text-blue-500">{h.buyScore?.toFixed(0)}</span>
                    </div>
                  </td>
                  <td className="py-2 text-right">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${h.peStatus === "Cheap" ? "text-green-500 bg-green-500/10" : h.peStatus === "Expensive" ? "text-red-500 bg-red-500/10" : "text-yellow-500 bg-yellow-500/10"}`}>
                      {h.peStatus ?? "N/A"}
                    </span>
                  </td>
                  <td className={`py-2 text-right ${(h.marginOfSafetyPercent ?? 0) > 0 ? "text-green-500" : "text-red-500"}`}>
                    {h.marginOfSafetyPercent?.toFixed(1) ?? "N/A"}%
                  </td>
                  <td className={`py-2 text-right ${(h.roePercent ?? 0) > 15 ? "text-green-500" : "text-muted-foreground"}`}>
                    {h.roePercent?.toFixed(1) ?? "N/A"}%
                  </td>
                  <td className={`py-2 text-right ${(h.rocePercent ?? 0) > 15 ? "text-green-500" : "text-muted-foreground"}`}>
                    {h.rocePercent?.toFixed(1) ?? "N/A"}%
                  </td>
                  <td className={`py-2 text-right ${(h.debtToEquityRatio ?? 99) < 0.5 ? "text-green-500" : "text-red-500"}`}>
                    {h.debtToEquityRatio?.toFixed(2) ?? "N/A"}
                  </td>
                  <td className="py-2 text-center">
                    {h.buySignal ? (
                      <Badge variant="success" className="text-[10px]">BUY</Badge>
                    ) : (
                      <span className="text-[10px] text-muted-foreground">—</span>
                    )}
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
