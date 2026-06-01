import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, currency = "INR"): string {
  if (currency === "INR") {
    if (Math.abs(value) >= 10000000) return `₹${(value / 10000000).toFixed(2)}Cr`;
    if (Math.abs(value) >= 100000) return `₹${(value / 100000).toFixed(2)}L`;
    if (Math.abs(value) >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
    return `₹${value.toFixed(2)}`;
  }
  return new Intl.NumberFormat("en-IN", { style: "currency", currency }).format(value);
}

export function formatNumber(value: number, decimals = 2): string {
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatPercent(value: number, decimals = 2): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(decimals)}%`;
}

export function getProfitLossColor(value: number): string {
  return value >= 0 ? "text-green-500" : "text-red-500";
}

export function getProfitLossBg(value: number): string {
  return value >= 0 ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500";
}

export function getRecommendationColor(rec: string): string {
  switch (rec) {
    case "Strong Buy": return "bg-green-600 text-white";
    case "Buy": return "bg-green-500/20 text-green-500";
    case "Hold": return "bg-yellow-500/20 text-yellow-500";
    case "Sell": return "bg-red-500/20 text-red-500";
    case "Strong Sell": return "bg-red-600 text-white";
    default: return "bg-muted text-muted-foreground";
  }
}

export function getRiskColor(risk: string): string {
  switch (risk) {
    case "Low": return "text-green-500";
    case "Medium": return "text-yellow-500";
    case "High": return "text-orange-500";
    case "Very High": return "text-red-500";
    default: return "text-muted-foreground";
  }
}

export function getPEStatusColor(status: string): string {
  switch (status) {
    case "Cheap": return "bg-green-500/20 text-green-500";
    case "Fair": return "bg-yellow-500/20 text-yellow-500";
    case "Expensive": return "bg-red-500/20 text-red-500";
    default: return "bg-muted text-muted-foreground";
  }
}

export function calculateGrahamNumber(eps: number, bvps: number): number {
  return Math.sqrt(22.5 * eps * bvps);
}

export function calculateMOS(intrinsicValue: number, currentPrice: number): number {
  return ((intrinsicValue - currentPrice) / intrinsicValue) * 100;
}

export function getSeverityColor(severity: string): string {
  switch (severity) {
    case "Critical": return "bg-red-500/20 text-red-500 border-red-500/30";
    case "Warning": return "bg-yellow-500/20 text-yellow-500 border-yellow-500/30";
    case "Info": return "bg-blue-500/20 text-blue-500 border-blue-500/30";
    default: return "bg-muted text-muted-foreground";
  }
}

export function toDecimal(val: unknown): number {
  if (val === null || val === undefined) return 0;
  return Number(val);
}
