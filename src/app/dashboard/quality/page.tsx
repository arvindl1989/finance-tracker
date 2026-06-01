"use client";
import { usePortfolio } from "@/hooks/use-portfolio";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatPercent } from "@/lib/utils";
import { Star, CheckCircle, XCircle } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";

function QualityBadge({ score }: { score: number }) {
  const label = score >= 80 ? "Excellent" : score >= 60 ? "Good" : score >= 40 ? "Average" : "Weak";
  const color = score >= 80 ? "text-green-500 bg-green-500/10" : score >= 60 ? "text-blue-500 bg-blue-500/10" : score >= 40 ? "text-yellow-500 bg-yellow-500/10" : "text-red-500 bg-red-500/10";
  return <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${color}`}>{label}</span>;
}

function MetricCheck({ label, value, threshold, unit = "%" }: { label: string; value: number | null; threshold: number; unit?: string }) {
  const pass = value != null && value >= threshold;
  return (
    <div className="flex items-center justify-between py-1">
      <div className="flex items-center gap-1.5 text-xs">
        {pass ? <CheckCircle className="h-3.5 w-3.5 text-green-500" /> : <XCircle className="h-3.5 w-3.5 text-red-500" />}
        <span className="text-muted-foreground">{label}</span>
      </div>
      <span className={`text-xs font-medium ${pass ? "text-green-500" : "text-red-500"}`}>
        {value != null ? `${value.toFixed(1)}${unit}` : "N/A"}
      </span>
    </div>
  );
}

export default function QualityPage() {
  const { data, loading } = usePortfolio();
  if (loading) return <div className="flex h-full items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  if (!data) return null;

  const { holdings } = data;
  const ranked = [...holdings].sort((a, b) => (b.qualityScore ?? 0) - (a.qualityScore ?? 0));

  const chartData = ranked.map((h) => ({
    name: h.stockCode,
    score: Number((h.qualityScore ?? 0).toFixed(1)),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Quality Dashboard</h1>
        <p className="text-muted-foreground text-sm">Quality scoring based on ROE, ROCE, debt, and growth metrics</p>
      </div>

      {/* Summary */}
      <div className="grid gap-4 grid-cols-3">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-500">{ranked.filter((h) => (h.qualityScore ?? 0) >= 70).length}</p>
            <p className="text-xs text-muted-foreground mt-1">High Quality (&gt;70)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{(holdings.reduce((s, h) => s + (h.qualityScore ?? 0), 0) / holdings.length).toFixed(1)}</p>
            <p className="text-xs text-muted-foreground mt-1">Portfolio Avg Score</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-500">{ranked[0]?.stockCode ?? "-"}</p>
            <p className="text-xs text-muted-foreground mt-1">Top Quality Stock</p>
          </CardContent>
        </Card>
      </div>

      {/* Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quality Score by Stock</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
              <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.score >= 70 ? "#22c55e" : entry.score >= 50 ? "#3b82f6" : entry.score >= 35 ? "#f59e0b" : "#ef4444"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Quality Cards */}
      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {ranked.map((h) => (
          <Card key={h.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm">{h.stockCode}</CardTitle>
                  <p className="text-xs text-muted-foreground">{h.industry}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold" style={{ color: (h.qualityScore ?? 0) >= 70 ? "#22c55e" : (h.qualityScore ?? 0) >= 50 ? "#3b82f6" : "#f59e0b" }}>
                    {(h.qualityScore ?? 0).toFixed(0)}
                  </div>
                  <QualityBadge score={h.qualityScore ?? 0} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="mb-2">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Quality Score</span>
                  <span>{(h.qualityScore ?? 0).toFixed(0)}/100</span>
                </div>
                <Progress value={h.qualityScore ?? 0} className="h-1.5" />
              </div>
              <div className="divide-y divide-border">
                <MetricCheck label="ROE > 15%" value={h.roePercent} threshold={15} />
                <MetricCheck label="ROCE > 15%" value={h.rocePercent} threshold={15} />
                <MetricCheck label="Revenue Growth > 10%" value={h.revenueGrowthPercent} threshold={10} />
                <MetricCheck label="EPS Growth > 10%" value={h.epsGrowthPercent} threshold={10} />
              </div>
              <div className="pt-1 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-muted-foreground">D/E Ratio</p>
                  <p className={`font-medium ${(h.debtToEquityRatio ?? 0) < 0.5 ? "text-green-500" : "text-red-500"}`}>
                    {h.debtToEquityRatio?.toFixed(2) ?? "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Rev. Growth</p>
                  <p className="font-medium">{h.revenueGrowthPercent?.toFixed(1) ?? "N/A"}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
