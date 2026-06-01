"use client";
import { useState } from "react";
import { usePortfolio } from "@/hooks/use-portfolio";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatPercent, getProfitLossBg } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";

export default function PnLPage() {
  const { data, loading } = usePortfolio();
  const [sortBy, setSortBy] = useState<"percent" | "absolute">("percent");

  if (loading) return <div className="flex h-full items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  if (!data) return null;

  const { holdings, summary } = data;
  const sorted = [...holdings].sort((a, b) =>
    sortBy === "percent" ? b.gainLossPercent - a.gainLossPercent : b.absoluteGainLoss - a.absoluteGainLoss
  );
  const topGainers = sorted.filter((h) => h.gainLossPercent > 0).slice(0, 5);
  const topLosers = [...sorted].reverse().filter((h) => h.gainLossPercent < 0).slice(0, 3);

  // Industry P&L
  const industryPnL = new Map<string, { cost: number; value: number }>();
  holdings.forEach((h) => {
    const ind = h.industry ?? "Other";
    const prev = industryPnL.get(ind) ?? { cost: 0, value: 0 };
    industryPnL.set(ind, { cost: prev.cost + h.totalCost, value: prev.value + h.currentValue });
  });
  const industryData = Array.from(industryPnL.entries()).map(([name, { cost, value }]) => ({
    name, gainLoss: value - cost, percent: ((value - cost) / cost) * 100,
  })).sort((a, b) => b.gainLoss - a.gainLoss);

  const barData = holdings.map((h) => ({
    name: h.stockCode,
    value: sortBy === "percent" ? h.gainLossPercent : h.absoluteGainLoss / 1000,
  })).sort((a, b) => b.value - a.value);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Profit & Loss</h1>
          <p className="text-muted-foreground text-sm">Stock-wise and industry-wise performance</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setSortBy("percent")} className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${sortBy === "percent" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"}`}>
            By % Return
          </button>
          <button onClick={() => setSortBy("absolute")} className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${sortBy === "absolute" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"}`}>
            By Absolute ₹
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid gap-4 grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total P&L</p>
            <p className={`text-xl font-bold ${summary.totalGainLoss >= 0 ? "text-green-500" : "text-red-500"}`}>
              {formatCurrency(summary.totalGainLoss)}
            </p>
            <p className="text-xs text-muted-foreground">{formatPercent(summary.totalGainLossPercent)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Winners</p>
            <p className="text-xl font-bold text-green-500">{holdings.filter((h) => h.gainLossPercent > 0).length}</p>
            <p className="text-xs text-muted-foreground">of {holdings.length} holdings</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Best Performer</p>
            <p className="text-xl font-bold">{topGainers[0]?.stockCode ?? "-"}</p>
            <p className="text-xs text-green-500">{topGainers[0] ? formatPercent(topGainers[0].gainLossPercent) : ""}</p>
          </CardContent>
        </Card>
      </div>

      {/* Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Stock-wise P&L</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={barData} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => sortBy === "percent" ? `${v}%` : `₹${v}K`} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={70} />
              <Tooltip
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                formatter={(v: number) => [sortBy === "percent" ? `${v.toFixed(2)}%` : formatCurrency(v * 1000), "P&L"]}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {barData.map((entry, i) => (
                  <Cell key={i} fill={entry.value >= 0 ? "#22c55e" : "#ef4444"} fillOpacity={0.8} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Industry P&L */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Industry P&L</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {industryData.map((ind) => (
                <div key={ind.name} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{ind.name}</p>
                    <p className="text-xs text-muted-foreground">{formatCurrency(ind.gainLoss)}</p>
                  </div>
                  <span className={`text-sm font-semibold px-2 py-0.5 rounded ${getProfitLossBg(ind.percent)}`}>
                    {formatPercent(ind.percent)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Full P&L Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Stock P&L Table</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="pb-2 text-left">Stock</th>
                  <th className="pb-2 text-right">Cost</th>
                  <th className="pb-2 text-right">Value</th>
                  <th className="pb-2 text-right">P&L</th>
                  <th className="pb-2 text-right">%</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sorted.map((h) => (
                  <tr key={h.id}>
                    <td className="py-2 font-medium">{h.stockCode}</td>
                    <td className="py-2 text-right text-muted-foreground">{formatCurrency(h.totalCost)}</td>
                    <td className="py-2 text-right">{formatCurrency(h.currentValue)}</td>
                    <td className={`py-2 text-right font-medium ${h.absoluteGainLoss >= 0 ? "text-green-500" : "text-red-500"}`}>
                      {formatCurrency(h.absoluteGainLoss)}
                    </td>
                    <td className={`py-2 text-right font-bold ${h.gainLossPercent >= 0 ? "text-green-500" : "text-red-500"}`}>
                      {formatPercent(h.gainLossPercent)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
