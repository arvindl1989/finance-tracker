"use client";
import { usePortfolio } from "@/hooks/use-portfolio";
import { LiveTicker } from "@/components/dashboard/live-ticker";

export function TickerWrapper() {
  const { data } = usePortfolio();
  if (!data?.holdings?.length) return null;
  const codes = data.holdings.map((h) => h.stockCode);
  return <LiveTicker stockCodes={codes} />;
}
