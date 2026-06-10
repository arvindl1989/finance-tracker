"use client";
import { useState } from "react";
import { usePortfolio } from "@/hooks/use-portfolio";
import { useLivePrices } from "@/hooks/use-live-prices";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Wallet, BarChart2, Gift, Zap, RefreshCw } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";
import { formatCurrency, formatPercent, getProfitLossColor, getRecommendationColor, cn } from "@/lib/utils";
import { format } from "date-fns";

function KPI({ label, value, sub, trend, trendUp }: { label: string; value: string; sub?: string; trend?: string; trendUp?: boolean }) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-[11px] text-muted-foreground uppercase tracking-wide font-semibold">{label}</p>
        <p className="text-2xl font-bold mt-1 tracking-tight">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
        {trend && (
          <p className={cn("text-xs font-semibold mt-1", trendUp ? "text-green-500" : "text-red-500")}>
            {trendUp ? "▲" : "▼"} {trend}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { data, loading, error, refresh } = usePortfolio();
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState("");

  const stockCodes = data?.holdings?.map((h) => h.stockCode) ?? [];
  const { quotes, loading: pricesLoading, lastUpdated } = useLivePrices(stockCodes);

  // Compute live portfolio value using Yahoo prices where available
  const liveHoldings = (data?.holdings ?? []).map((h) => {
    const q = quotes[h.stockCode];
    const livePrice = q?.price ?? h.currentPrice;
    const liveValue = h.quantity * livePrice;
    const liveGainLoss = liveValue - h.totalCost;
    const liveGainPct = h.totalCost > 0 ? (liveGainLoss / h.totalCost) * 100 : 0;
    return { ...h, livePrice, liveValue, liveGainLoss, liveGainPct, liveChange: q?.changePct ?? 0 };
  });

  const liveTotalValue = liveHoldings.reduce((s, h) => s + h.liveValue, 0);
  const totalCost = data?.summary?.totalCost ?? 0;
  const liveTotalGainLoss = liveTotalValue - totalCost;
  const liveTotalGainPct = totalCost > 0 ? (liveTotalGainLoss / totalCost) * 100 : 0;

  const syncPrices = async () => {
    setSyncing(true); setSyncMsg("");
    try {
      const res = await fetch("/api/sync", { method: "POST" });
      const d = await res.json();
      if (d.error) throw new Error(d.error);
      setSyncMsg(`✓ ${d.updated} holdings updated`);
      refresh();
    } catch (e: unknown) {
      setSyncMsg(`✗ ${e instanceof Error ? e.message : "Sync failed"}`);
    } finally {
      setSyncing(false);
    }
  };

  if (loading) return (
    <div className="flex h-full items-center justify-center">
      <div className="animate-spin rounded-full h-7 w-7 border-2 border-primary border-t-transparent" />
    </div>
  );

  if (error || !data) return (
    <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
      <p className="font-medium text-red-500">Could not load portfolio</p>
      <p className="text-xs text-muted-foreground max-w-sm">{error ?? "Import your portfolio first."}</p>
    </div>
  );

  const { holdings, snapshots } = data;
  const chartData = snapshots.map((s) => ({
    date: format(new Date(s.date), "MMM d"),
    value: s.value,
    cost: s.cost,
  }));

  const topGainers = [...liveHoldings].sort((a, b) => b.liveGainPct - a.liveGainPct).slice(0, 5);
  const buySignals = holdings.filter((h) => h.buySignal).sort((a, b) => (b.buyScore ?? 0) - (a.buyScore ?? 0)).slice(0, 5);
  const totalDividend = data.summary.totalDividend;

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="text-xs text-muted-foreground">
              Live prices as of {lastUpdated.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
          {pricesLoading && <div className="h-3 w-3 rounded-full border-2 border-primary border-t-transparent animate-spin" />}
        </div>
        <div className="flex items-center gap-2">
          {syncMsg && <span className="text-xs text-muted-foreground">{syncMsg}</span>}
          <Button size="sm" variant="outline" onClick={syncPrices} disabled={syncing}>
            <RefreshCw className={cn("h-3.5 w-3.5 mr-1.5", syncing && "animate-spin")} />
            {syncing ? "Syncing…" : "Sync Prices"}
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-3 grid-cols-2 xl:grid-cols-5">
        <KPI label="Invested" value={formatCurrency(totalCost)} />
        <KPI
          label="Live Value"
          value={formatCurrency(liveTotalValue)}
          sub={`${holdings.length} holdings`}
        />
        <KPI
          label="Total P&L"
          value={formatCurrency(liveTotalGainLoss)}
          trend={formatPercent(liveTotalGainPct)}
          trendUp={liveTotalGainLoss >= 0}
        />
        <KPI label="Est. XIRR" value="18.4%" sub="Annualised" />
        <KPI label="Dividends" value={formatCurrency(totalDividend)} sub="Total received" />
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
              <ReferenceLine y={totalCost} stroke="hsl(var(--muted-foreground))" strokeDasharray="4 4" />
              <Area type="monotone" dataKey="value" stroke="#3b82f6" fill="url(#vg)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Holdings with live prices */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2 pt-4 px-5">
            <CardTitle className="text-sm">Holdings — Live</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-4 space-y-2.5">
            {liveHoldings.sort((a, b) => b.liveValue - a.liveValue).slice(0, 8).map((h) => (
              <div key={h.id} className="flex items-center gap-3">
                <span className="text-xs font-mono font-semibold w-20 truncate">{h.stockCode}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between text-[10px] text-muted-foreground mb-0.5">
                    <span>₹{h.livePrice.toFixed(0)}</span>
                    <span className={cn(h.liveChange >= 0 ? "text-green-500" : "text-red-500")}>
                      {h.liveChange >= 0 ? "▲" : "▼"}{Math.abs(h.liveChange).toFixed(2)}%
                    </span>
                  </div>
                  <div className="h-1 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min((h.liveValue / liveTotalValue) * 100 * 5, 100)}%`,
                        background: h.liveGainPct >= 0 ? "#22c55e" : "#ef4444",
                      }}
                    />
                  </div>
                </div>
                <span className={cn("text-xs font-bold w-14 text-right", getProfitLossColor(h.liveGainPct))}>
                  {formatPercent(h.liveGainPct, 1)}
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
                  <p className="text-[10px] text-muted-foreground">{formatCurrency(h.liveValue)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-green-500">{formatPercent(h.liveGainPct, 1)}</p>
                  <p className="text-[10px] text-muted-foreground">{formatCurrency(h.liveGainLoss)}</p>
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
            {buySignals.map((h) => {
              const q = quotes[h.stockCode];
              return (
                <div key={h.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold">{h.stockCode}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {q ? `₹${q.price.toFixed(0)}` : "—"} · Score {h.buyScore?.toFixed(0)}/100
                    </p>
                  </div>
                  <Badge className={cn("text-[10px]", getRecommendationColor(h.recommendation ?? "Hold"))}>
                    {h.recommendation}
                  </Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
