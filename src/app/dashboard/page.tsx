"use client";
import { usePortfolio } from "@/hooks/use-portfolio";
import { KPICard } from "@/components/dashboard/kpi-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp, TrendingDown, DollarSign, BarChart2,
  Gift, Wallet, ArrowUpRight, ArrowDownRight,
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, AreaChart, Area,
} from "recharts";
import { formatCurrency, formatPercent, getProfitLossColor, getRecommendationColor, cn } from "@/lib/utils";
import { format } from "date-fns";

export default function DashboardPage() {
  const { data, loading } = usePortfolio();

  if (loading) return <div className="flex h-full items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  if (error || !data) return (
    <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
      <p className="text-red-500 font-medium">Could not load portfolio data</p>
      <p className="text-xs text-muted-foreground max-w-sm">{error ?? "No data returned from API. Check that DATABASE_URL is set in Railway environment variables and the database is seeded."}</p>
    </div>
  );

  const { summary, holdings, snapshots } = data;
  const chartData = snapshots.map((s) => ({
    date: format(new Date(s.date), "MMM d"),
    value: s.value,
    cost: s.cost,
    gainLoss: s.gainLoss,
  }));

  const topGainers = [...holdings].sort((a, b) => b.gainLossPercent - a.gainLossPercent).slice(0, 5);
  const topLosers = [...holdings].sort((a, b) => a.gainLossPercent - b.gainLossPercent).slice(0, 3);
  const buyOpps = holdings.filter((h) => h.buySignal).slice(0, 4);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Portfolio Overview</h1>
        <p className="text-muted-foreground text-sm">Growth & Quality Portfolio · Last updated today</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <KPICard
          title="Total Invested"
          value={formatCurrency(summary.totalCost)}
          icon={Wallet}
          iconColor="text-blue-500"
        />
        <KPICard
          title="Current Value"
          value={formatCurrency(summary.totalValue)}
          subtitle={`${holdings.length} holdings`}
          icon={DollarSign}
          iconColor="text-green-500"
        />
        <KPICard
          title="Total P&L"
          value={formatCurrency(summary.totalGainLoss)}
          delta={formatPercent(summary.totalGainLossPercent)}
          deltaPositive={summary.totalGainLoss >= 0}
          icon={summary.totalGainLoss >= 0 ? TrendingUp : TrendingDown}
          iconColor={summary.totalGainLoss >= 0 ? "text-green-500" : "text-red-500"}
        />
        <KPICard
          title="XIRR (Est.)"
          value="18.4%"
          subtitle="Annualized return"
          icon={BarChart2}
          iconColor="text-purple-500"
        />
        <KPICard
          title="Dividend Income"
          value={formatCurrency(summary.totalDividend)}
          subtitle="Total received"
          icon={Gift}
          iconColor="text-orange-500"
        />
        <KPICard
          title="Buy Signals"
          value={String(holdings.filter((h) => h.buySignal).length)}
          subtitle={`${holdings.filter((h) => h.sellSignal).length} sell signals`}
          icon={ArrowUpRight}
          iconColor="text-emerald-500"
        />
      </div>

      {/* Portfolio Growth Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Portfolio Value (30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="valueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => formatCurrency(v)} />
              <Tooltip
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                formatter={(v: number) => [formatCurrency(v), "Portfolio Value"]}
              />
              <ReferenceLine y={summary.totalCost} stroke="hsl(var(--muted-foreground))" strokeDasharray="4" label={{ value: "Cost", fontSize: 10 }} />
              <Area type="monotone" dataKey="value" stroke="#3b82f6" fill="url(#valueGrad)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Top Gainers */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <ArrowUpRight className="h-4 w-4 text-green-500" />
              Top Gainers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topGainers.map((h) => (
              <div key={h.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{h.stockCode}</p>
                  <p className="text-xs text-muted-foreground">{formatCurrency(h.currentValue)}</p>
                </div>
                <span className="text-sm font-semibold text-green-500">{formatPercent(h.gainLossPercent)}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Buy Opportunities */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              Buy Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {buyOpps.length === 0 && <p className="text-xs text-muted-foreground">No active buy signals</p>}
            {buyOpps.map((h) => (
              <div key={h.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{h.stockCode}</p>
                  <p className="text-xs text-muted-foreground">Score: {h.buyScore?.toFixed(0)}/100</p>
                </div>
                <Badge className={getRecommendationColor(h.recommendation ?? "Hold")}>
                  {h.recommendation}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Holdings Table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">All Holdings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {holdings.slice(0, 6).map((h) => (
                <div key={h.id} className="flex items-center gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded bg-primary/10 text-[10px] font-bold text-primary">
                    {h.stockCode.slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{h.stockCode}</p>
                    <div className="h-1.5 mt-1 bg-muted rounded-full">
                      <div className="h-1.5 bg-primary rounded-full" style={{ width: `${Math.min(h.portfolioWeightPercent, 100)}%` }} />
                    </div>
                  </div>
                  <span className={cn("text-xs font-semibold", getProfitLossColor(h.gainLossPercent))}>
                    {formatPercent(h.gainLossPercent)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
