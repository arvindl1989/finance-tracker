"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, Plus, Trash2, Star } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const SAMPLE_WATCHLIST = [
  { id: "1", stockCode: "DIXON", companyName: "Dixon Technologies", targetPrice: 12000, targetPE: 40, targetMOS: 15, notes: "PLI beneficiary, electronics manufacturing", currentPrice: 15800, currentPE: 68 },
  { id: "2", stockCode: "DMART", companyName: "Avenue Supermarts (DMart)", targetPrice: 3500, targetPE: 80, targetMOS: 20, notes: "Consistent compounder, wait for correction", currentPrice: 4200, currentPE: 98 },
  { id: "3", stockCode: "POLYCAB", companyName: "Polycab India Ltd", targetPrice: 5500, targetPE: 35, targetMOS: 10, notes: "Wire & cable leader, infra tailwind", currentPrice: 6100, currentPE: 42 },
  { id: "4", stockCode: "IRCTC", companyName: "Indian Railway Catering", targetPrice: 700, targetPE: 55, targetMOS: 25, notes: "Monopoly business, wait for valuation comfort", currentPrice: 820, currentPE: 67 },
];

export default function WatchlistPage() {
  const [watchlist, setWatchlist] = useState(SAMPLE_WATCHLIST);
  const [newCode, setNewCode] = useState("");

  const remove = (id: string) => setWatchlist((prev) => prev.filter((w) => w.id !== id));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            Watchlist
          </h1>
          <p className="text-muted-foreground text-sm">Track potential additions and monitor buy opportunities</p>
        </div>
      </div>

      {/* Add to watchlist */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add to Watchlist</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Stock code (e.g., DMART)"
              value={newCode}
              onChange={(e) => setNewCode(e.target.value)}
              className="max-w-xs"
            />
            <Button size="sm" onClick={() => {
              if (newCode.trim()) {
                setWatchlist((prev) => [...prev, {
                  id: Date.now().toString(),
                  stockCode: newCode.toUpperCase(),
                  companyName: newCode.toUpperCase(),
                  targetPrice: 0, targetPE: 0, targetMOS: 0,
                  notes: "", currentPrice: 0, currentPE: 0,
                }]);
                setNewCode("");
              }
            }}>
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Watchlist Cards */}
      <div className="grid gap-4 lg:grid-cols-2">
        {watchlist.map((item) => {
          const priceAlert = item.currentPrice <= item.targetPrice && item.targetPrice > 0;
          const peAlert = item.currentPE <= item.targetPE && item.targetPE > 0;
          const mosOk = item.targetMOS > 0;

          return (
            <Card key={item.id} className={priceAlert || peAlert ? "border-green-500/30" : ""}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm flex items-center gap-2">
                      {item.stockCode}
                      {(priceAlert || peAlert) && <Badge variant="success" className="text-[10px]">Buy Zone</Badge>}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">{item.companyName}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-red-500" onClick={() => remove(item.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center rounded-lg bg-muted p-2">
                    <p className="text-[10px] text-muted-foreground">Target Price</p>
                    <p className="text-sm font-semibold">{item.targetPrice > 0 ? formatCurrency(item.targetPrice) : "—"}</p>
                    <p className={`text-[10px] mt-0.5 ${priceAlert ? "text-green-500" : "text-muted-foreground"}`}>
                      CMP: {item.currentPrice > 0 ? formatCurrency(item.currentPrice) : "N/A"}
                    </p>
                  </div>
                  <div className="text-center rounded-lg bg-muted p-2">
                    <p className="text-[10px] text-muted-foreground">Target PE</p>
                    <p className="text-sm font-semibold">{item.targetPE > 0 ? `${item.targetPE}x` : "—"}</p>
                    <p className={`text-[10px] mt-0.5 ${peAlert ? "text-green-500" : "text-muted-foreground"}`}>
                      Curr: {item.currentPE > 0 ? `${item.currentPE}x` : "N/A"}
                    </p>
                  </div>
                  <div className="text-center rounded-lg bg-muted p-2">
                    <p className="text-[10px] text-muted-foreground">Target MOS</p>
                    <p className="text-sm font-semibold">{item.targetMOS > 0 ? `${item.targetMOS}%` : "—"}</p>
                    <p className="text-[10px] mt-0.5 text-muted-foreground">Min safety</p>
                  </div>
                </div>

                {item.notes && (
                  <div className="rounded-lg bg-muted p-2">
                    <p className="text-[10px] text-muted-foreground">Thesis</p>
                    <p className="text-xs mt-0.5">{item.notes}</p>
                  </div>
                )}

                <div className="flex gap-2">
                  {priceAlert && <Badge variant="success" className="text-[10px] flex-1 justify-center">Price Alert: Below Target</Badge>}
                  {peAlert && <Badge variant="success" className="text-[10px] flex-1 justify-center">PE Alert: Below Target</Badge>}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
