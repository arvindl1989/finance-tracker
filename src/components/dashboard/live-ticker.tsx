"use client";
import { useLivePrices } from "@/hooks/use-live-prices";
import { cn } from "@/lib/utils";
import { RefreshCw } from "lucide-react";

interface Props { stockCodes: string[] }

export function LiveTicker({ stockCodes }: Props) {
  const { quotes, loading, lastUpdated, refresh } = useLivePrices(stockCodes, 300000);

  return (
    <div className="flex items-center gap-1 border-b bg-muted/30 px-4 py-1.5 overflow-x-auto scrollbar-none">
      <div className="flex items-center gap-4 flex-nowrap min-w-0">
        {stockCodes.map((code) => {
          const q = quotes[code];
          if (!q) return (
            <span key={code} className="text-[11px] text-muted-foreground font-mono whitespace-nowrap">{code} —</span>
          );
          const up = q.changePct >= 0;
          return (
            <span key={code} className="flex items-center gap-1.5 text-[11px] font-mono whitespace-nowrap">
              <span className="font-semibold">{code}</span>
              <span>₹{q.price.toFixed(2)}</span>
              <span className={cn("font-medium", up ? "text-green-500" : "text-red-500")}>
                {up ? "▲" : "▼"}{Math.abs(q.changePct).toFixed(2)}%
              </span>
            </span>
          );
        })}
      </div>
      <div className="ml-auto flex items-center gap-2 pl-4 shrink-0">
        {lastUpdated && (
          <span className="text-[10px] text-muted-foreground">
            {lastUpdated.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
          </span>
        )}
        <button onClick={refresh} className="text-muted-foreground hover:text-foreground transition-colors" disabled={loading}>
          <RefreshCw className={cn("h-3 w-3", loading && "animate-spin")} />
        </button>
      </div>
    </div>
  );
}
