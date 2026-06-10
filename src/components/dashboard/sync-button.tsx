"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchYahooQuotesBrowser, fetchYahooFundamentalsBrowser } from "@/lib/yahoo-client";

interface Props {
  stockCodes: string[];
  onDone?: () => void;
}

export function SyncButton({ stockCodes, onDone }: Props) {
  const [status, setStatus] = useState<"idle" | "fetching" | "saving" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");

  const handleSync = async () => {
    if (!stockCodes.length) return;
    setStatus("fetching");
    setMsg("Fetching live prices…");

    try {
      // Step 1: bulk quotes from browser
      const quotes = await fetchYahooQuotesBrowser(stockCodes);
      setMsg(`Got prices for ${quotes.length} stocks. Fetching fundamentals…`);

      // Step 2: fundamentals per stock (parallel, 5 at a time)
      const withFundamentals = [...quotes];
      for (let i = 0; i < quotes.length; i += 5) {
        const chunk = quotes.slice(i, i + 5);
        const results = await Promise.all(
          chunk.map((q) => fetchYahooFundamentalsBrowser(q.stockCode))
        );
        for (let j = 0; j < chunk.length; j++) {
          const fund = results[j];
          const idx = i + j;
          withFundamentals[idx] = {
            ...withFundamentals[idx],
            pe:             fund.pe             ?? withFundamentals[idx].pe,
            eps:            fund.eps            ?? withFundamentals[idx].eps,
            bookValue:      fund.bookValue      ?? withFundamentals[idx].bookValue,
            roe:            fund.roe            ?? withFundamentals[idx].roe,
            debtToEquity:   fund.debtToEquity   ?? null,
            revenueGrowth:  fund.revenueGrowth  ?? null,
            earningsGrowth: fund.earningsGrowth ?? null,
          };
        }
      }

      // Step 3: send to server to save
      setStatus("saving");
      setMsg("Saving to database…");
      const res = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quotes: withFundamentals }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setStatus("done");
      setMsg(`✓ ${data.updated} holdings updated with live data`);
      onDone?.();
      setTimeout(() => { setStatus("idle"); setMsg(""); }, 4000);
    } catch (e: unknown) {
      setStatus("error");
      setMsg(e instanceof Error ? e.message : "Sync failed");
      setTimeout(() => { setStatus("idle"); setMsg(""); }, 5000);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {msg && (
        <span className={cn(
          "text-xs",
          status === "done" ? "text-green-500" :
          status === "error" ? "text-red-500" :
          "text-muted-foreground"
        )}>
          {status === "done" && <CheckCircle className="inline h-3 w-3 mr-1" />}
          {status === "error" && <XCircle className="inline h-3 w-3 mr-1" />}
          {msg}
        </span>
      )}
      <Button
        size="sm"
        variant="outline"
        onClick={handleSync}
        disabled={status === "fetching" || status === "saving"}
      >
        <RefreshCw className={cn("h-3.5 w-3.5 mr-1.5", (status === "fetching" || status === "saving") && "animate-spin")} />
        {status === "fetching" ? "Fetching…" : status === "saving" ? "Saving…" : "Sync Prices"}
      </Button>
    </div>
  );
}
