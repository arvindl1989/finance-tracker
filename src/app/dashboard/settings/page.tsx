"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Settings, Download, RefreshCw } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Settings className="h-6 w-6" />Settings</h1>
        <p className="text-muted-foreground text-sm">Portfolio configuration and preferences</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Portfolio Settings</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Portfolio Name</label>
            <Input defaultValue="Growth & Quality Portfolio" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Currency</label>
            <Input defaultValue="INR" disabled />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Max Single Stock Allocation (%)</label>
            <Input type="number" defaultValue={15} />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Concentration Alert Threshold (%)</label>
            <Input type="number" defaultValue={20} />
          </div>
          <Button>Save Settings</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Valuation Thresholds</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Min Margin of Safety (%) for Buy</label>
              <Input type="number" defaultValue={20} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Min ROE (%) for Quality</label>
              <Input type="number" defaultValue={15} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Min ROCE (%) for Quality</label>
              <Input type="number" defaultValue={15} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Max D/E Ratio for Buy</label>
              <Input type="number" defaultValue={0.5} step={0.1} />
            </div>
          </div>
          <Button>Save Thresholds</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Export & Reports</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Export to CSV
            </Button>
            <Button variant="outline" className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Export to Excel
            </Button>
          </div>
          <Button variant="outline" className="w-full">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh All Data
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
