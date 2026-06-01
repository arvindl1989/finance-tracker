"use client";
import { usePortfolio } from "@/hooks/use-portfolio";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, getPEStatusColor } from "@/lib/utils";
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, Cell,
} from "recharts";

export default function ValuationPage() {
  const { data, loading } = usePortfolio();
  if (loading) return <div className="flex h-full items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  if (!data) return null;

  const { holdings } = data;
  const withPE = holdings.filter((h) => h.currentPE && h.historicalAveragePE);
  const withGraham = holdings.filter((h) => h.grahamNumber && h.grahamNumber > 0);

  const peScatter = withPE.map((h) => ({
    x: h.historicalAveragePE!,
    y: h.currentPE!,
    name: h.stockCode,
    status: h.peStatus,
  }));

  const cheap = withPE.filter((h) => h.peStatus === "Cheap");
  const fair = withPE.filter((h) => h.peStatus === "Fair");
  const expensive = withPE.filter((h) => h.peStatus === "Expensive");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Valuation Dashboard</h1>
        <p className="text-muted-foreground text-sm">PE analysis, Graham Number, and Margin of Safety</p>
      </div>

      {/* PE Status Summary */}
      <div className="grid gap-4 grid-cols-3">
        <Card className="border-green-500/30 bg-green-500/5">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-500">{cheap.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Cheap (PE below avg)</p>
            <div className="mt-2 flex flex-wrap gap-1 justify-center">
              {cheap.map((h) => <Badge key={h.id} variant="success" className="text-[10px]">{h.stockCode}</Badge>)}
            </div>
          </CardContent>
        </Card>
        <Card className="border-yellow-500/30 bg-yellow-500/5">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-yellow-500">{fair.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Fairly Valued</p>
            <div className="mt-2 flex flex-wrap gap-1 justify-center">
              {fair.map((h) => <Badge key={h.id} variant="warning" className="text-[10px]">{h.stockCode}</Badge>)}
            </div>
          </CardContent>
        </Card>
        <Card className="border-red-500/30 bg-red-500/5">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-500">{expensive.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Expensive</p>
            <div className="mt-2 flex flex-wrap gap-1 justify-center">
              {expensive.map((h) => <Badge key={h.id} variant="danger" className="text-[10px]">{h.stockCode}</Badge>)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* PE Scatter Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Current PE vs Historical Average PE</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="x" name="Hist. Avg PE" tick={{ fontSize: 11 }} label={{ value: "Historical Avg PE", position: "insideBottom", offset: -4, fontSize: 11 }} />
              <YAxis dataKey="y" name="Current PE" tick={{ fontSize: 11 }} label={{ value: "Current PE", angle: -90, position: "insideLeft", fontSize: 11 }} />
              <ReferenceLine y={0} stroke="hsl(var(--border))" />
              <Tooltip
                cursor={{ strokeDasharray: "3 3" }}
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                content={({ payload }) => {
                  if (!payload?.length) return null;
                  const d = payload[0].payload;
                  return (
                    <div className="p-2 text-xs">
                      <p className="font-bold">{d.name}</p>
                      <p>Current PE: {d.y?.toFixed(1)}</p>
                      <p>Hist. Avg: {d.x?.toFixed(1)}</p>
                    </div>
                  );
                }}
              />
              <Scatter data={peScatter} name="Holdings">
                {peScatter.map((entry, i) => (
                  <Cell key={i} fill={entry.status === "Cheap" ? "#22c55e" : entry.status === "Expensive" ? "#ef4444" : "#f59e0b"} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
          <p className="text-xs text-muted-foreground text-center mt-2">Dots below diagonal = trading cheaper than historical average</p>
        </CardContent>
      </Card>

      {/* PE Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">PE Analysis by Stock</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b text-muted-foreground">
                <th className="pb-2 text-left">Stock</th>
                <th className="pb-2 text-right">Current PE</th>
                <th className="pb-2 text-right">Hist. Avg PE</th>
                <th className="pb-2 text-right">Premium/Disc</th>
                <th className="pb-2 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {withPE.sort((a, b) => (a.currentPE! / a.historicalAveragePE!) - (b.currentPE! / b.historicalAveragePE!)).map((h) => {
                const ratio = ((h.currentPE! - h.historicalAveragePE!) / h.historicalAveragePE!) * 100;
                return (
                  <tr key={h.id}>
                    <td className="py-2 font-medium">{h.stockCode}</td>
                    <td className="py-2 text-right">{h.currentPE?.toFixed(1)}x</td>
                    <td className="py-2 text-right text-muted-foreground">{h.historicalAveragePE?.toFixed(1)}x</td>
                    <td className={`py-2 text-right font-medium ${ratio <= 0 ? "text-green-500" : "text-red-500"}`}>
                      {ratio > 0 ? "+" : ""}{ratio.toFixed(1)}%
                    </td>
                    <td className="py-2 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${getPEStatusColor(h.peStatus ?? "")}`}>
                        {h.peStatus}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Graham Number Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Graham Number & Margin of Safety</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {withGraham.map((h) => {
              const mos = h.marginOfSafetyPercent ?? 0;
              const isSafe = mos > 0;
              return (
                <div key={h.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium">{h.stockCode}</span>
                      <span className="text-xs text-muted-foreground ml-2">Graham: {formatCurrency(h.grahamNumber ?? 0)} | Current: {formatCurrency(h.currentPrice)}</span>
                    </div>
                    <div className="text-right">
                      <span className={`text-sm font-bold ${isSafe ? "text-green-500" : "text-red-500"}`}>
                        MOS: {mos.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="relative h-2 bg-muted rounded-full">
                    <div
                      className={`h-full rounded-full ${isSafe ? "bg-green-500" : "bg-red-500"}`}
                      style={{ width: `${Math.min(Math.abs(mos), 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>{isSafe ? `${mos.toFixed(1)}% below intrinsic value — BUY zone` : `${Math.abs(mos).toFixed(1)}% ABOVE intrinsic value`}</span>
                    <span>EPS: ₹{h.eps?.toFixed(0)} | BVPS: ₹{h.bookValuePerShare?.toFixed(0)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
