"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, PieChart, TrendingUp, BarChart3,
  ShieldCheck, Bell, Star, Upload, Target, Zap,
  Activity, BookOpen, LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navGroups = [
  {
    label: "Overview",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/dashboard/allocation", label: "Allocation", icon: PieChart },
      { href: "/dashboard/pnl", label: "P & L", icon: TrendingUp },
    ],
  },
  {
    label: "Decisions",
    items: [
      { href: "/dashboard/valuation", label: "Valuation", icon: BarChart3 },
      { href: "/dashboard/buy-opportunities", label: "Buy Engine", icon: Zap },
      { href: "/dashboard/sell-engine", label: "Sell Engine", icon: Target },
      { href: "/dashboard/rebalancing", label: "Rebalancing", icon: Activity },
    ],
  },
  {
    label: "Analysis",
    items: [
      { href: "/dashboard/risk", label: "Risk", icon: ShieldCheck },
      { href: "/dashboard/quality", label: "Quality Score", icon: Star },
      { href: "/dashboard/watchlist", label: "Watchlist", icon: BookOpen },
      { href: "/dashboard/alerts", label: "Alerts", icon: Bell },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <aside className="hidden lg:flex h-full w-56 flex-col border-r bg-card">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2.5 border-b px-5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
          <TrendingUp className="h-4 w-4 text-primary-foreground" />
        </div>
        <div>
          <p className="text-sm font-bold leading-none">EquityLens</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Portfolio Intel</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="px-2 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                  >
                    <item.icon className={cn("h-4 w-4 shrink-0", isActive ? "text-primary" : "")} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t p-3 space-y-0.5">
        <Link
          href="/dashboard/import"
          className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        >
          <Upload className="h-4 w-4" />
          Import Data
        </Link>
        <button
          onClick={() => router.push("/")}
          className="w-full flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Home
        </button>
      </div>
    </aside>
  );
}
