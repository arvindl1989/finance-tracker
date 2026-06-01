"use client";
import { usePortfolio } from "@/hooks/use-portfolio";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, formatPercent, getRecommendationColor } from "@/lib/utils";
import { Target, AlertTriangle } from "lucide-react";

function SellReason({ label, triggered, detail }: { label: string; triggered: boolean; detail: string }) {
  if (!triggered) return null;
  return (
    <div className="flex items-center gap-2 text-xs">
      <AlertTriangle className="h-3 w-3 text-red-500 shrink-0" />
      <span className="text-red-400">{label}</span>
      <span className="text-muted-foreground ml-auto">{detail}</span>
    </div>
  );
}

export default function SellEnginePage() {
  const { data, loading } = usePortfolio();
  if (loading) return <div className="flex h-full items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  if (!data) return null;

  const { holdings } = data;
  const ranked = [...holdings].sort((a, b) => (b.sellScore ?? 0) - (a.sellScore ?? 0));
  const sellCandidates = ranked.filter((h) => (h.sellScore ?? 0) >= 25);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Sell & Profit Booking Engine</h1>
        <p className="text-muted-foreground text-sm">Identify stocks for partial or full exit based on valuation and allocation rules</p>
      </div>

      {sellCandidates.length > 0 && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4">
          <p className="text-sm font-medium text-red-400">
            {sellCandidates.length} stock{sellCandidates.length > 1 ? "s" : ""} flagged for profit booking review
          </p>
        </div>
      )}

      {/* Top Sell Candidates */}
      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {ranked.slice(0, 6).map((h) => {
          const suggestedSellAmt = h.gainLossPercent > 100 ? h.currentValue * 0.25 :
            (h.portfolioWeightPercent > 15 ? (h.currentValue - h.currentValue * (15 / h.portfolioWeightPercent)) : 0);
          const suggestedSellQty = suggestedSellAmt > 0 ? Math.floor(suggestedSellAmt / h.currentPrice) : 0;
          const isSellCandidate = (h.sellScore ?? 0) >= 25;

          return (
            <Card key={h.id} className={isSellCandidate ? "border-red-500/30" : ""}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm">{h.stockCode}</CardTitle>
                    <p className="text-xs text-muted-foreground">{h.companyName}</p>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${isSellCandidate ? "text-red-500" : "text-muted-foreground"}`}>
                      {h.sellScore?.toFixed(0) ?? 0}
                    </div>
                    <div className="text-[10px] text-muted-foreground">Sell Score</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Sell Pressure</span>
                    <span className={isSellCandidate ? "text-red-500 font-medium" : "text-muted-foreground"}>
                      {h.sellScore?.toFixed(0) ?? 0}/100
                    </span>
                  </div>
                  <Progress value={h.sellScore ?? 0} className="h-1.5 [&>div]:bg-red-500" />
                </div>

                <div className="space-y-1 border rounded-lg p-2">
                  <SellReason label="Gain >100%" triggered={h.gainLossPercent > 100} detail={formatPercent(h.gainLossPercent)} />
                  <SellReason label="PE excessively high" triggered={!!(h.currentPE && h.historicalAveragePE && h.currentPE > h.historicalAveragePE * 1.3)} detail={`${h.currentPE?.toFixed(1)}x vs avg ${h.historicalAveragePE?.toFixed(1)}x`} />
                  <SellReason label="Overweight position" triggered={h.portfolioWeightPercent > 15} detail={`${h.portfolioWeightPercent.toFixed(1)}% of portfolio`} />
                  <SellReason label="Near 52W high" triggered={(h.distanceFrom52WHighPercent ?? -100) > -5} detail={`${h.distanceFrom52WHighPercent?.toFixed(1)}% from 52WH`} />
                  {(h.sellScore ?? 0) === 0 && <p className="text-xs text-muted-foreground text-center py-1">No sell triggers active</p>}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded bg-muted p-2">
                    <p className="text-muted-foreground">Current Value</p>
                    <p className="font-semibold">{formatCurrency(h.currentValue)}</p>
                  </div>
                  <div className="rounded bg-muted p-2">
                    <p className="text-muted-foreground">Total P&L</p>
                    <p className={`font-semibold ${h.absoluteGainLoss >= 0 ? "text-green-500" : "text-red-500"}`}>
                      {formatCurrency(h.absoluteGainLoss)}
                    </p>
                  </div>
                </div>

                {isSellCandidate && suggestedSellAmt > 0 && (
                  <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 space-y-1">
                    <p className="text-xs font-semibold text-red-400">Suggested Action</p>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Sell Amount</span>
                      <span className="font-medium">{formatCurrency(suggestedSellAmt)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Sell Qty (approx)</span>
                      <span className="font-medium">{suggestedSellQty} shares</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">At Price</span>
                      <span className="font-medium">{formatCurrency(h.currentPrice)}</span>
                    </div>
                  </div>
                )}

                <Badge className={`w-full justify-center text-xs ${getRecommendationColor(h.recommendation ?? "Hold")}`}>
                  {h.recommendation}
                </Badge>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Full table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-4 w-4 text-red-500" />
            All Holdings — Sell Score Ranking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b text-muted-foreground">
                <th className="pb-2 text-left">Stock</th>
                <th className="pb-2 text-right">Sell Score</th>
                <th className="pb-2 text-right">Gain %</th>
                <th className="pb-2 text-right">PE vs Avg</th>
                <th className="pb-2 text-right">Weight</th>
                <th className="pb-2 text-right">From 52WH</th>
                <th className="pb-2 text-right">Suggested Sell</th>
                <th className="pb-2 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {ranked.map((h) => {
                const suggestedSellAmt = h.gainLossPercent > 100 ? h.currentValue * 0.25 :
                  (h.portfolioWeightPercent > 15 ? (h.currentValue - h.currentValue * (15 / h.portfolioWeightPercent)) : 0);
                return (
                  <tr key={h.id} className={(h.sellScore ?? 0) >= 25 ? "bg-red-500/5" : ""}>
                    <td className="py-2 font-medium">{h.stockCode}</td>
                    <td className="py-2 text-right">
                      <span className={`font-bold ${(h.sellScore ?? 0) >= 40 ? "text-red-500" : (h.sellScore ?? 0) >= 25 ? "text-orange-500" : "text-muted-foreground"}`}>
                        {h.sellScore?.toFixed(0) ?? 0}
                      </span>
                    </td>
                    <td className={`py-2 text-right ${h.gainLossPercent >= 0 ? "text-green-500" : "text-red-500"}`}>
                      {formatPercent(h.gainLossPercent)}
                    </td>
                    <td className="py-2 text-right">
                      {h.currentPE && h.historicalAveragePE
                        ? <span className={h.currentPE > h.historicalAveragePE * 1.1 ? "text-red-500" : "text-muted-foreground"}>
                            {h.currentPE.toFixed(1)}x / {h.historicalAveragePE.toFixed(1)}x
                          </span>
                        : <span className="text-muted-foreground">N/A</span>}
                    </td>
                    <td className={`py-2 text-right ${h.portfolioWeightPercent > 15 ? "text-red-500 font-medium" : "text-muted-foreground"}`}>
                      {h.portfolioWeightPercent.toFixed(1)}%
                    </td>
                    <td className={`py-2 text-right ${(h.distanceFrom52WHighPercent ?? -100) > -5 ? "text-orange-500" : "text-muted-foreground"}`}>
                      {h.distanceFrom52WHighPercent?.toFixed(1) ?? "N/A"}%
                    </td>
                    <td className="py-2 text-right">
                      {suggestedSellAmt > 0 ? <span className="font-medium text-red-400">{formatCurrency(suggestedSellAmt)}</span> : <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="py-2 text-center">
                      <Badge className={`text-[10px] ${getRecommendationColor(h.recommendation ?? "Hold")}`}>
                        {h.recommendation}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
