"use client";
import { useParams } from "next/navigation";
import { usePortfolio } from "@/hooks/use-portfolio";
import { useLivePrices } from "@/hooks/use-live-prices";
import { StockChart } from "@/components/dashboard/stock-chart";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatPercent, getProfitLossColor, getRecommendationColor, cn } from "@/lib/utils";

export default function StockDetailPage() {
  const { code } = useParams<{ code: string }>();
  const { data, loading } = usePortfolio();
  const { quotes } = useLivePrices(code ? [code] : []);

  if (loading) return <div className="flex h-full items-center justify-center"><div className="animate-spin rounded-full h-7 w-7 border-2 border-primary border-t-transparent" /></div>;

  const holding = data?.holdings.find((h) => h.stockCode === code);
  const q = quotes[code];

  if (!holding) return <div className="text-center text-muted-foreground py-20">Stock not found in portfolio</div>;

  const livePrice = q?.price ?? holding.currentPrice;
  const liveValue = holding.quantity * livePrice;
  const liveGainLoss = liveValue - holding.totalCost;
  const liveGainPct = (liveGainLoss / holding.totalCost) * 100;

  const metrics = [
    { label: "Quantity", value: holding.quantity.toLocaleString() },
    { label: "Avg Buy Price", value: formatCurrency(holding.averageBuyPrice) },
    { label: "Live Price", value: q ? `₹${q.price.toFixed(2)}` : formatCurrency(holding.currentPrice) },
    { label: "Day Change", value: q ? `${q.changePct >= 0 ? "▲" : "▼"}${Math.abs(q.changePct).toFixed(2)}%` : "—" },
    { label: "52W High", value: q?.week52High ? formatCurrency(q.week52High) : "—" },
    { label: "52W Low", value: q?.week52Low ? formatCurrency(q.week52Low) : "—" },
    { label: "P/E Ratio", value: q?.pe ? `${q.pe.toFixed(1)}x` : "—" },
    { label: "EPS (TTM)", value: q?.eps ? `₹${q.eps.toFixed(2)}` : "—" },
    { label: "Book Value", value: q?.bookValue ? `₹${q.bookValue.toFixed(2)}` : "—" },
    { label: "Graham Number", value: holding.grahamNumber ? formatCurrency(holding.grahamNumber) : "—" },
    { label: "Margin of Safety", value: holding.marginOfSafetyPercent ? `${holding.marginOfSafetyPercent.toFixed(1)}%` : "—" },
    { label: "Quality Score", value: holding.qualityScore ? `${holding.qualityScore.toFixed(0)}/100` : "—" },
  ];

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{holding.stockCode}</h1>
          <p className="text-muted-foreground text-sm">{holding.companyName} · {holding.industry} · {holding.exchange}</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold">₹{livePrice.toFixed(2)}</p>
          {q && (
            <p className={cn("text-sm font-semibold", q.changePct >= 0 ? "text-green-500" : "text-red-500")}>
              {q.changePct >= 0 ? "▲" : "▼"} {Math.abs(q.changePct).toFixed(2)}% today
            </p>
          )}
          <Badge className={cn("mt-1", getRecommendationColor(holding.recommendation ?? "Hold"))}>
            {holding.recommendation}
          </Badge>
        </div>
      </div>

      {/* P&L Summary */}
      <div className="grid grid-cols-3 gap-3">
        <Card><CardContent className="p-4">
          <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Invested</p>
          <p className="text-lg font-bold mt-0.5">{formatCurrency(holding.totalCost)}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Current Value</p>
          <p className="text-lg font-bold mt-0.5">{formatCurrency(liveValue)}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Total P&L</p>
          <p className={cn("text-lg font-bold mt-0.5", getProfitLossColor(liveGainLoss))}>
            {formatCurrency(liveGainLoss)}
          </p>
          <p className={cn("text-xs font-semibold", getProfitLossColor(liveGainPct))}>{formatPercent(liveGainPct)}</p>
        </CardContent></Card>
      </div>

      {/* Live Chart from Yahoo Finance */}
      <StockChart stockCode={holding.stockCode} companyName={holding.companyName} />

      {/* Metrics grid */}
      <Card>
        <CardContent className="p-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {metrics.map(({ label, value }) => (
              <div key={label}>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wide">{label}</p>
                <p className="text-sm font-semibold mt-0.5">{value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {holding.investmentThesis && (
        <Card>
          <CardContent className="p-5">
            <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-2">Investment Thesis</p>
            <p className="text-sm leading-relaxed">{holding.investmentThesis}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
