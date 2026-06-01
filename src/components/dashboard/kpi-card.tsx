import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string;
  subtitle?: string;
  delta?: string;
  deltaPositive?: boolean;
  icon: LucideIcon;
  iconColor?: string;
  gradient?: string;
}

export function KPICard({ title, value, subtitle, delta, deltaPositive, icon: Icon, iconColor = "text-primary", gradient }: KPICardProps) {
  return (
    <Card className={cn("overflow-hidden", gradient)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{title}</p>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
            {delta && (
              <span className={cn("inline-flex items-center text-xs font-medium", deltaPositive ? "text-green-500" : "text-red-500")}>
                {deltaPositive ? "▲" : "▼"} {delta}
              </span>
            )}
          </div>
          <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10", iconColor.replace("text-", "bg-").replace("-500", "-500/10"))}>
            <Icon className={cn("h-5 w-5", iconColor)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
