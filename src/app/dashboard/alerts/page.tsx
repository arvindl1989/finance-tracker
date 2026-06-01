"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, CheckCheck } from "lucide-react";
import { getSeverityColor } from "@/lib/utils";
import { format } from "date-fns";

interface Alert {
  id: string;
  stockCode: string;
  companyName: string;
  alertType: string;
  severity: string;
  message: string;
  value: number | null;
  threshold: number | null;
  isRead: boolean;
  createdAt: string;
}

const ALERT_TYPE_LABELS: Record<string, string> = {
  "52WH": "52W High",
  "52WL": "52W Low",
  "3YH": "3Y High",
  "3YL": "3Y Low",
  "5YH": "5Y High",
  "5YL": "5Y Low",
  ATH: "All-Time High",
  PE_HIGH: "PE High",
  PE_LOW: "PE Low",
  ALLOCATION: "Allocation",
  MOS: "Margin of Safety",
};

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  useEffect(() => {
    fetch("/api/alerts").then((r) => r.json()).then((d) => { setAlerts(d.alerts ?? []); setLoading(false); });
  }, []);

  const markRead = async (id: string) => {
    await fetch("/api/alerts", { method: "PATCH", body: JSON.stringify({ id }), headers: { "Content-Type": "application/json" } });
    setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, isRead: true } : a));
  };

  const filtered = filter === "unread" ? alerts.filter((a) => !a.isRead) : alerts;
  const unreadCount = alerts.filter((a) => !a.isRead).length;

  if (loading) return <div className="flex h-full items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="h-6 w-6" />
            Alerts
            {unreadCount > 0 && <Badge variant="destructive" className="ml-1">{unreadCount}</Badge>}
          </h1>
          <p className="text-muted-foreground text-sm">Price, valuation, and allocation alerts</p>
        </div>
        <div className="flex gap-2">
          <Button variant={filter === "all" ? "default" : "outline"} size="sm" onClick={() => setFilter("all")}>All</Button>
          <Button variant={filter === "unread" ? "default" : "outline"} size="sm" onClick={() => setFilter("unread")}>Unread ({unreadCount})</Button>
        </div>
      </div>

      {filtered.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No alerts to show</p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {filtered.map((alert) => (
          <Card key={alert.id} className={`transition-opacity ${alert.isRead ? "opacity-60" : ""}`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 rounded-lg px-2 py-0.5 text-[10px] font-semibold border ${getSeverityColor(alert.severity)}`}>
                    {alert.severity}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold">{alert.stockCode}</p>
                      <Badge variant="outline" className="text-[10px]">
                        {ALERT_TYPE_LABELS[alert.alertType] ?? alert.alertType}
                      </Badge>
                      {!alert.isRead && <div className="h-2 w-2 rounded-full bg-blue-500" />}
                    </div>
                    <p className="text-xs mt-1">{alert.message}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{format(new Date(alert.createdAt), "MMM d, yyyy")}</p>
                  </div>
                </div>
                {!alert.isRead && (
                  <Button variant="ghost" size="sm" onClick={() => markRead(alert.id)} className="shrink-0">
                    <CheckCheck className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
