"use client";
import { Bell, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/allocation": "Allocation",
  "/dashboard/pnl": "Profit & Loss",
  "/dashboard/valuation": "Valuation",
  "/dashboard/buy-opportunities": "Buy Engine",
  "/dashboard/sell-engine": "Sell Engine",
  "/dashboard/rebalancing": "Rebalancing",
  "/dashboard/risk": "Risk",
  "/dashboard/quality": "Quality",
  "/dashboard/alerts": "Alerts",
  "/dashboard/watchlist": "Watchlist",
  "/dashboard/import": "Import",
};

export function Header() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  useEffect(() => setMounted(true), []);

  return (
    <header className="flex h-14 items-center justify-between border-b bg-card px-6">
      <p className="font-semibold text-sm">{PAGE_TITLES[pathname] ?? "Dashboard"}</p>
      <div className="flex items-center gap-1">
        <Link href="/dashboard/alerts">
          <Button variant="ghost" size="icon" className="relative h-8 w-8">
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-red-500" />
          </Button>
        </Link>
        {mounted && (
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            {theme === "dark"
              ? <Sun className="h-4 w-4" />
              : <Moon className="h-4 w-4" />}
          </Button>
        )}
        <div className="ml-1 h-7 w-7 rounded-full bg-primary flex items-center justify-center text-[11px] font-bold text-primary-foreground">
          DI
        </div>
      </div>
    </header>
  );
}
