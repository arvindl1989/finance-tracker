"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, PieChart, TrendingUp, BarChart3, ShieldCheck,
  Bell, Star, Upload, Settings, Target, Zap, Activity, BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/allocation", label: "Allocation", icon: PieChart },
  { href: "/dashboard/pnl", label: "P&L", icon: TrendingUp },
  { href: "/dashboard/valuation", label: "Valuation", icon: BarChart3 },
  { href: "/dashboard/buy-opportunities", label: "Buy Engine", icon: Zap },
  { href: "/dashboard/sell-engine", label: "Sell Engine", icon: Target },
  { href: "/dashboard/rebalancing", label: "Rebalancing", icon: Activity },
  { href: "/dashboard/risk", label: "Risk", icon: ShieldCheck },
  { href: "/dashboard/quality", label: "Quality", icon: Star },
  { href: "/dashboard/alerts", label: "Alerts", icon: Bell },
  { href: "/dashboard/watchlist", label: "Watchlist", icon: BookOpen },
  { href: "/dashboard/import", label: "Import", icon: Upload },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex h-full w-64 flex-col border-r bg-card">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <TrendingUp className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <p className="text-sm font-bold">EquityLens</p>
          <p className="text-[10px] text-muted-foreground">Portfolio Intelligence</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Settings */}
      <div className="border-t p-3">
        <Link
          href="/dashboard/settings"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>
      </div>
    </aside>
  );
}
