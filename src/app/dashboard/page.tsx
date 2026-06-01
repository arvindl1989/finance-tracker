"use client";
import { usePortfolio } from "@/hooks/use-portfolio";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Wallet, BarChart2, Gift, Zap } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from "recharts";
import { formatCurrency, formatPercent, getProfitLossColor, getRecommendationColor, cn } from "@/lib/utils";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

function KPI({ label, value, sub, trend, trendUp }: { label: string; value: string; sub?: string; trend?: string; trendUp?: boolean }) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">{label}</p>
        <p className="text-2xl font-bold mt-1 tracking-tight">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
        {trend && (
          <p className={cn("text-xs font-medium mt-1", trendUp ? "text-green-500" : "text-red-500")}>
            {trendUp ? "▲" : "▼"} {trend}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { data, loading, error } = usePortfolio();

  if (loading) return (
    <div className="flex h-full items-center justify-center">
      <div className="animate-spin rounded-full h-7 w-7 border-2 border-primary border-t-transparent" />
    </div>
  );

  if (error || !data) return (
    <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
      <p className="font-medium text-red-500">Could not load portfolio</p>
      <p className="text-xs text-muted-foreground max-w-sm">
        {error ?? "No data found. Import your portfolio first."}
      </p>
    </div>
  );

  const { summary, holdings, snapshots } = data;
  const chartData = snapshots.map((s) => ({
    date: format(new Date(s.date), "MMM d"),
    value: s.value,
    cost: s.cost,
  }));

  const topGainers = [...holdings].sort((a, b) => b.gainLossPercent - a.gainLossPercent).slice(0, 5);
  const buySignals = holdings.filter((h) => h.buySignal).sort((a, b) => (b.buyScore ?? 0) - (a.buyScore ?? 0)).slice(0, 5);

  return (
    <div className="space-y-5">
      {/* KPIs */}
      <div className="grid gap-3 grid-cols-2 xl:grid-cols-5">
        <KPI label="Invested" value={formatCurrency(summary.totalCost)} />
        <KPI
          label="Current Value"
          value={formatCurrency(summary.totalValue)}
          sub={`${holdings.length} holdings`}
        />
        <KPI
          label="Total P&L"
          value={formatCurrency(summary.totalGainLoss)}
          trend={formatPercent(summary.totalGainLossPercent)}
          trendUp={summary.totalGainLoss >= 0}
        />
        <KPI label="Est. XIRR" value="18.4%" sub="Annualised" />
        <KPI label="Dividends" value={formatCurrency(summary.totalDividend)} sub="Total received" />
      </div>

      {/* Chart */}
      <Card>
        <CardHeader className="pb-0 pt-4 px-5">
          <CardTitle className="text-sm font-semibold">Portfolio Value — 30 Days</CardTitle>
        </CardHeader>
        <CardContent className="pt-3 px-2 pb-2">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData} margin={{ left: 8, right: 8 }}>
              <defs>
                <linearGradient id="vg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => formatCurrency(v)} width={72} />
              <Tooltip
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                formatter={(v: number) => [formatCurrency(v), "Value"]}
              />
              <ReferenceLine y={summary.totalCost} stroke="hsl(var(--muted-foreground))" strokeDasharray="4 4" />
              <Area type="monotone" dataKey="value" stroke="#3b82f6" fill="url(#vg)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Holdings weight */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2 pt-4 px-5">
            <CardTitle className="text-sm">Holdings</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-4 space-y-3">
            {holdings.sort((a, b) => b.portfolioWeightPercent - a.portfolioWeightPercent).slice(0, 8).map((h) => (
              <div key={h.id} className="flex items-center gap-3">
                <span className="text-xs font-mono font-medium w-20 truncate">{h.stockCode}</span>
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min(h.portfolioWeightPercent * 5, 100)}%`,
                      background: h.portfolioWeightPercent > 15 ? "#ef4444" : "#3b82f6",
                    }}
                  />
                </div>
                <span className={cn("text-xs font-semibold w-12 text-right", getProfitLossColor(h.gainLossPercent))}>
                  {formatPercent(h.gainLossPercent, 1)}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Top gainers */}
        <Card>
          <CardHeader className="pb-2 pt-4 px-5">
            <CardTitle className="text-sm flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-green-500" /> Top Gainers
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-4 space-y-3">
            {topGainers.map((h) => (
              <div key={h.id} className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold">{h.stockCode}</p>
                  <p className="text-[10px] text-muted-foreground">{formatCurrency(h.currentValue)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-green-500">{formatPercent(h.gainLossPercent, 1)}</p>
                  <p className="text-[10px] text-muted-foreground">{formatCurrency(h.absoluteGainLoss)}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Buy signals */}
        <Card>
          <CardHeader className="pb-2 pt-4 px-5">
            <CardTitle className="text-sm flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-blue-500" /> Buy Signals
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-4 space-y-3">
            {buySignals.length === 0 && <p className="text-xs text-muted-foreground">No active buy signals</p>}
            {buySignals.map((h) => (
              <div key={h.id} className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold">{h.stockCode}</p>
                  <p className="text-[10px] text-muted-foreground">Score {h.buyScore?.toFixed(0)}/100</p>
                </div>
                <Badge className={cn("text-[10px]", getRecommendationColor(h.recommendation ?? "Hold"))}>
                  {h.recommendation}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
