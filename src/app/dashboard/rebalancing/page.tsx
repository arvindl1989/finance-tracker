"use client";
import { usePortfolio } from "@/hooks/use-portfolio";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { Activity, ArrowUp, ArrowDown, Minus } from "lucide-react";

export default function RebalancingPage() {
  const { data, loading } = usePortfolio();
  if (loading) return <div className="flex h-full items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  if (!data) return null;

  const { holdings, summary } = data;
  const withTarget = holdings.filter((h) => h.targetWeightPercent != null);

  const rebalanceItems = withTarget.map((h) => {
    const currentPct = h.portfolioWeightPercent;
    const targetPct = h.targetWeightPercent ?? currentPct;
    const diff = currentPct - targetPct;
    const targetValue = (targetPct / 100) * summary.totalValue;
    const currentValue = h.currentValue;
    const excessValue = currentValue - targetValue;
    const action = Math.abs(diff) < 0.5 ? "Hold" : diff > 0 ? "Sell" : "Buy";
    const tradeAmount = Math.abs(excessValue);
    const tradeQty = Math.floor(tradeAmount / h.currentPrice);

    return { ...h, currentPct, targetPct, diff, targetValue, excessValue, action, tradeAmount, tradeQty };
  });

  const totalBuyNeeded = rebalanceItems.filter((r) => r.action === "Buy").reduce((sum, r) => sum + r.tradeAmount, 0);
  const totalSellNeeded = rebalanceItems.filter((r) => r.action === "Sell").reduce((sum, r) => sum + r.tradeAmount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Portfolio Rebalancing</h1>
        <p className="text-muted-foreground text-sm">Align current allocation to target weights</p>
      </div>

      <div className="grid gap-4 grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total to Sell</p>
            <p className="text-xl font-bold text-red-500">{formatCurrency(totalSellNeeded)}</p>
            <p className="text-xs text-muted-foreground">{rebalanceItems.filter((r) => r.action === "Sell").length} stocks</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total to Buy</p>
            <p className="text-xl font-bold text-green-500">{formatCurrency(totalBuyNeeded)}</p>
            <p className="text-xs text-muted-foreground">{rebalanceItems.filter((r) => r.action === "Buy").length} stocks</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">In Balance</p>
            <p className="text-xl font-bold text-muted-foreground">{rebalanceItems.filter((r) => r.action === "Hold").length}</p>
            <p className="text-xs text-muted-foreground">within ±0.5% target</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Rebalancing Actions Required
          </CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b text-muted-foreground">
                <th className="pb-2 text-left">Stock</th>
                <th className="pb-2 text-right">Current %</th>
                <th className="pb-2 text-right">Target %</th>
                <th className="pb-2 text-right">Difference</th>
                <th className="pb-2 text-right">Current Value</th>
                <th className="pb-2 text-right">Target Value</th>
                <th className="pb-2 text-right">Trade Amount</th>
                <th className="pb-2 text-right">Trade Qty</th>
                <th className="pb-2 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rebalanceItems.sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff)).map((r) => (
                <tr key={r.id} className={r.action === "Sell" ? "bg-red-500/5" : r.action === "Buy" ? "bg-green-500/5" : ""}>
                  <td className="py-2.5">
                    <div className="font-medium">{r.stockCode}</div>
                    <div className="text-muted-foreground">{r.industry}</div>
                  </td>
                  <td className="py-2.5 text-right font-medium">{r.currentPct.toFixed(1)}%</td>
                  <td className="py-2.5 text-right text-muted-foreground">{r.targetPct.toFixed(1)}%</td>
                  <td className={`py-2.5 text-right font-semibold ${r.diff > 0.5 ? "text-red-500" : r.diff < -0.5 ? "text-green-500" : "text-muted-foreground"}`}>
                    {r.diff > 0 ? "+" : ""}{r.diff.toFixed(1)}%
                  </td>
                  <td className="py-2.5 text-right">{formatCurrency(r.currentValue)}</td>
                  <td className="py-2.5 text-right text-muted-foreground">{formatCurrency(r.targetValue)}</td>
                  <td className="py-2.5 text-right font-medium">
                    {r.action !== "Hold" ? formatCurrency(r.tradeAmount) : "—"}
                  </td>
                  <td className="py-2.5 text-right">
                    {r.action !== "Hold" ? `${r.tradeQty} shares` : "—"}
                  </td>
                  <td className="py-2.5 text-center">
                    {r.action === "Sell" ? (
                      <Badge variant="danger" className="gap-1 text-[10px]"><ArrowDown className="h-3 w-3" />Sell</Badge>
                    ) : r.action === "Buy" ? (
                      <Badge variant="success" className="gap-1 text-[10px]"><ArrowUp className="h-3 w-3" />Buy</Badge>
                    ) : (
                      <Badge variant="secondary" className="gap-1 text-[10px]"><Minus className="h-3 w-3" />Hold</Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Visual bars */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Current vs Target Allocation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {rebalanceItems.sort((a, b) => b.targetPct - a.targetPct).map((r) => (
            <div key={r.id} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-medium">{r.stockCode}</span>
                <span className="text-muted-foreground">Current: {r.currentPct.toFixed(1)}% | Target: {r.targetPct.toFixed(1)}%</span>
              </div>
              <div className="space-y-0.5">
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${Math.min(r.currentPct * 5, 100)}%` }} />
                </div>
                <div className="h-1 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-muted-foreground/40 rounded-full transition-all" style={{ width: `${Math.min(r.targetPct * 5, 100)}%` }} />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
