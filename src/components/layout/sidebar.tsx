"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, PieChart, TrendingUp, BarChart3,
  ShieldCheck, Bell, Star, Upload, Target, Zap,
  Activity, BookOpen, ChevronRight,
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
    <aside className="hidden lg:flex h-full w-60 flex-col bg-card border-r border-border">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-5 border-b border-border">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-sm shadow-primary/30">
          <TrendingUp className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-base font-bold leading-none tracking-tight">EquityLens</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Portfolio Intelligence</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-5 px-3 space-y-6">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
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
                      "flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                      isActive
                        ? "bg-primary text-white shadow-sm shadow-primary/20"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="h-4 w-4 shrink-0" />
                      {item.label}
                    </div>
                    {isActive && <ChevronRight className="h-3.5 w-3.5 opacity-70" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-border p-3">
        <button
          onClick={() => router.push("/dashboard/import")}
          className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-all duration-150"
        >
          <Upload className="h-4 w-4" />
          Import Data
        </button>
      </div>
    </aside>
  );
}
