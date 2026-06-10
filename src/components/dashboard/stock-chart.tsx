"use client";
import { useState } from "react";
import { useStockHistory } from "@/hooks/use-live-prices";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";

const PERIODS = ["1D", "1W", "1M", "3M", "1Y", "5Y"] as const;

interface Props { stockCode: string; companyName: string }

export function StockChart({ stockCode, companyName }: Props) {
  const [period, setPeriod] = useState<string>("1M");
  const { candles, loading } = useStockHistory(stockCode, period);

  const chartData = candles.map((c) => ({
    time: format(new Date(c.time), period === "1D" ? "HH:mm" : period === "1W" ? "EEE" : "MMM d"),
    close: c.close,
    open: c.open,
  }));

  const isUp = chartData.length > 1
    ? (chartData.at(-1)?.close ?? 0) >= (chartData[0]?.close ?? 0)
    : true;

  return (
    <Card>
      <CardHeader className="pb-2 pt-4 px-5">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">{stockCode} — {companyName}</CardTitle>
          <div className="flex gap-1">
            {PERIODS.map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors
                  ${period === p ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"}`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-2 pb-3">
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex h-40 items-center justify-center text-xs text-muted-foreground">
            No data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={chartData} margin={{ left: 4, right: 4 }}>
              <defs>
                <linearGradient id={`grad-${stockCode}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isUp ? "#22c55e" : "#ef4444"} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={isUp ? "#22c55e" : "#ef4444"} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="time" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `₹${v}`} width={60} domain={["auto", "auto"]} />
              <Tooltip
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                formatter={(v: number) => [formatCurrency(v), "Price"]}
              />
              <Area
                type="monotone"
                dataKey="close"
                stroke={isUp ? "#22c55e" : "#ef4444"}
                fill={`url(#grad-${stockCode})`}
                strokeWidth={1.5}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
