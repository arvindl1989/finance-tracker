"use client";
import { usePortfolio } from "@/hooks/use-portfolio";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatPercent } from "@/lib/utils";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  Treemap, Legend,
} from "recharts";

const COLORS = ["#3b82f6","#8b5cf6","#ec4899","#f59e0b","#10b981","#06b6d4","#f97316","#84cc16","#6366f1","#14b8a6","#e11d48","#7c3aed"];

interface TreemapContentProps {
  x?: number; y?: number; width?: number; height?: number;
  name?: string; value?: number; depth?: number;
}

const CustomTreemapContent = ({ x = 0, y = 0, width = 0, height = 0, name, value }: TreemapContentProps) => {
  if (width < 30 || height < 20) return null;
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill="hsl(var(--primary))" fillOpacity={0.2} stroke="hsl(var(--background))" strokeWidth={2} rx={4} />
      <text x={x + width / 2} y={y + height / 2 - 6} textAnchor="middle" fill="hsl(var(--foreground))" fontSize={11} fontWeight={600}>{name}</text>
      <text x={x + width / 2} y={y + height / 2 + 10} textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize={10}>{value?.toFixed(1)}%</text>
    </g>
  );
};

export default function AllocationPage() {
  const { data, loading } = usePortfolio();
  if (loading) return <div className="flex h-full items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  if (!data) return null;

  const { holdings, summary } = data;

  // Industry allocation
  const industryMap = new Map<string, number>();
  holdings.forEach((h) => {
    const ind = h.industry ?? "Other";
    industryMap.set(ind, (industryMap.get(ind) ?? 0) + h.currentValue);
  });
  const industryData = Array.from(industryMap.entries()).map(([name, value]) => ({
    name, value: Number(((value / summary.totalValue) * 100).toFixed(2)),
  })).sort((a, b) => b.value - a.value);

  // Market cap allocation
  const mcapMap = new Map<string, number>();
  holdings.forEach((h) => {
    const cat = h.marketCapCategory ?? "Unknown";
    mcapMap.set(cat, (mcapMap.get(cat) ?? 0) + h.currentValue);
  });
  const mcapData = Array.from(mcapMap.entries()).map(([name, value]) => ({
    name, value: Number(((value / summary.totalValue) * 100).toFixed(2)),
  }));

  // Stock treemap data
  const treemapData = holdings.map((h) => ({
    name: h.stockCode,
    value: Number(h.portfolioWeightPercent.toFixed(2)),
  }));

  const highConcentration = holdings.filter((h) => h.portfolioWeightPercent > 15);
  const moderateConcentration = holdings.filter((h) => h.portfolioWeightPercent > 10 && h.portfolioWeightPercent <= 15);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Allocation Dashboard</h1>
        <p className="text-muted-foreground text-sm">Portfolio weight distribution and concentration analysis</p>
      </div>

      {/* Alerts */}
      {highConcentration.length > 0 && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4">
          <p className="text-sm font-medium text-red-500">⚠ Concentration Alert</p>
          <p className="text-xs text-muted-foreground mt-1">
            {highConcentration.map((h) => h.stockCode).join(", ")} exceed 15% allocation threshold
          </p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Industry Donut */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">By Industry</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <ResponsiveContainer width={180} height={180}>
                <PieChart>
                  <Pie data={industryData} cx={85} cy={85} innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={2}>
                    {industryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => [`${v}%`, ""]} contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {industryData.map((item, i) => (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="truncate max-w-[100px]">{item.name}</span>
                    </div>
                    <span className="font-semibold">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Market Cap Donut */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">By Market Cap</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <ResponsiveContainer width={180} height={180}>
                <PieChart>
                  <Pie data={mcapData} cx={85} cy={85} innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={2}>
                    {mcapData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => [`${v}%`, ""]} contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-3">
                {mcapData.map((item, i) => (
                  <div key={item.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                        <span>{item.name}</span>
                      </div>
                      <span className="font-semibold">{item.value}%</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full">
                      <div className="h-1.5 rounded-full" style={{ width: `${item.value}%`, background: COLORS[i % COLORS.length] }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Treemap */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Stock Weight Treemap</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <Treemap data={treemapData} dataKey="value" aspectRatio={4 / 3} content={<CustomTreemapContent />} />
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Holdings Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Stock-wise Allocation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {holdings.sort((a, b) => b.portfolioWeightPercent - a.portfolioWeightPercent).map((h) => (
              <div key={h.id} className="flex items-center gap-4">
                <div className="w-24 text-xs font-medium truncate">{h.stockCode}</div>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${h.portfolioWeightPercent}%`,
                      background: h.portfolioWeightPercent > 15 ? "#ef4444" : h.portfolioWeightPercent > 10 ? "#f59e0b" : "#3b82f6",
                    }}
                  />
                </div>
                <div className="w-12 text-right text-xs font-semibold">{h.portfolioWeightPercent.toFixed(1)}%</div>
                <div className="w-24 text-right text-xs text-muted-foreground">{formatCurrency(h.currentValue)}</div>
                {h.portfolioWeightPercent > 15 && <Badge variant="danger" className="text-[10px]">High</Badge>}
                {h.portfolioWeightPercent > 10 && h.portfolioWeightPercent <= 15 && <Badge variant="warning" className="text-[10px]">Watch</Badge>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
