"use client";
import { Bell, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const PAGE_TITLES: Record<string, { title: string; sub: string }> = {
  "/dashboard": { title: "Portfolio Overview", sub: "Growth & Quality Portfolio" },
  "/dashboard/allocation": { title: "Allocation", sub: "Weight distribution across sectors & stocks" },
  "/dashboard/pnl": { title: "Profit & Loss", sub: "Stock-wise and industry-wise performance" },
  "/dashboard/valuation": { title: "Valuation", sub: "PE analysis · Graham Number · Margin of Safety" },
  "/dashboard/buy-opportunities": { title: "Buy Engine", sub: "Scored buy opportunities · 7-factor model" },
  "/dashboard/sell-engine": { title: "Sell Engine", sub: "Profit-booking and exit signals" },
  "/dashboard/rebalancing": { title: "Rebalancing", sub: "Align allocation to target weights" },
  "/dashboard/risk": { title: "Risk Dashboard", sub: "Concentration · sector exposure · volatility" },
  "/dashboard/quality": { title: "Quality Score", sub: "ROE · ROCE · debt · growth composite score" },
  "/dashboard/alerts": { title: "Alerts", sub: "Price · valuation · allocation notifications" },
  "/dashboard/watchlist": { title: "Watchlist", sub: "Track potential additions" },
  "/dashboard/import": { title: "Import Portfolio", sub: "Upload Excel or CSV" },
};

export function Header() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  useEffect(() => setMounted(true), []);

  const page = PAGE_TITLES[pathname] ?? { title: "Dashboard", sub: "" };

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
      <div>
        <p className="font-bold text-base leading-none">{page.title}</p>
        {page.sub && <p className="text-xs text-muted-foreground mt-1">{page.sub}</p>}
      </div>
      <div className="flex items-center gap-1.5">
        <Link href="/dashboard/alerts">
          <Button variant="ghost" size="icon" className="relative h-8 w-8 rounded-lg">
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-red-500" />
          </Button>
        </Link>
        {mounted && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        )}
        <div className="ml-1 h-8 w-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-white shadow-sm shadow-primary/30">
          DI
        </div>
      </div>
    </header>
  );
}
