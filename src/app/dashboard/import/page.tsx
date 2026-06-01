"use client";
import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, CheckCircle, AlertCircle, Download } from "lucide-react";
import Papa from "papaparse";
import * as XLSX from "xlsx";

const SAMPLE_CSV = `StockCode,CompanyName,Industry,Quantity,AverageBuyPrice,CurrentPrice
RELIANCE,Reliance Industries,Energy,100,2200,2850
TCS,Tata Consultancy Services,Technology,50,3100,4180
HDFCBANK,HDFC Bank,Banking & Finance,200,1450,1620`;

const COLUMN_MAP: Record<string, string> = {
  stockcode: "stockCode", "stock code": "stockCode", symbol: "stockCode", ticker: "stockCode",
  companyname: "companyName", "company name": "companyName", company: "companyName",
  industry: "industry", sector: "industry",
  quantity: "quantity", qty: "quantity", shares: "quantity",
  averagebuyprice: "averageBuyPrice", "avg price": "averageBuyPrice", "average price": "averageBuyPrice", buyprice: "averageBuyPrice",
  currentprice: "currentPrice", "current price": "currentPrice", ltp: "currentPrice", price: "currentPrice",
};

function normalizeRow(row: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(row)) {
    const normalized = k.toLowerCase().trim();
    const mapped = COLUMN_MAP[normalized] ?? normalized;
    out[mapped] = v;
  }
  return out;
}

export default function ImportPage() {
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState<Record<string, string>[]>([]);
  const [fileName, setFileName] = useState("");
  const [status, setStatus] = useState<"idle" | "preview" | "importing" | "done" | "error">("idle");
  const [result, setResult] = useState<{ created: number; updated: number; errors: string[] } | null>(null);

  const processFile = (file: File) => {
    setFileName(file.name);
    const ext = file.name.split(".").pop()?.toLowerCase();

    if (ext === "csv") {
      Papa.parse(file, {
        header: true, skipEmptyLines: true,
        complete: (results) => {
          const rows = (results.data as Record<string, string>[]).map(normalizeRow);
          setPreview(rows.slice(0, 10));
          setStatus("preview");
        },
      });
    } else if (ext === "xlsx" || ext === "xls") {
      const reader = new FileReader();
      reader.onload = (e) => {
        const wb = XLSX.read(e.target?.result, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<Record<string, string>>(ws).map(normalizeRow);
        setPreview(rows.slice(0, 10));
        setStatus("preview");
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, []);

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleImport = async () => {
    setStatus("importing");
    try {
      const res = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ holdings: preview }),
      });
      const data = await res.json();
      setResult(data);
      setStatus("done");
    } catch {
      setStatus("error");
    }
  };

  const downloadSample = () => {
    const blob = new Blob([SAMPLE_CSV], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sample-portfolio.csv";
    a.click();
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">Import Portfolio</h1>
        <p className="text-muted-foreground text-sm">Upload Excel or CSV with your holdings data</p>
      </div>

      {/* Sample download */}
      <Card>
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Download Sample Template</p>
            <p className="text-xs text-muted-foreground">Use this format: StockCode, CompanyName, Industry, Quantity, AverageBuyPrice, CurrentPrice</p>
          </div>
          <Button variant="outline" size="sm" onClick={downloadSample}>
            <Download className="h-4 w-4 mr-2" />
            Sample CSV
          </Button>
        </CardContent>
      </Card>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer ${dragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
        onClick={() => document.getElementById("file-input")?.click()}
      >
        <input id="file-input" type="file" accept=".csv,.xlsx,.xls" onChange={onFileSelect} className="hidden" />
        <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
        <p className="text-sm font-medium">Drop your CSV or Excel file here</p>
        <p className="text-xs text-muted-foreground mt-1">Supports .csv, .xlsx, .xls</p>
        {fileName && <Badge variant="secondary" className="mt-3">{fileName}</Badge>}
      </div>

      {/* Preview */}
      {status === "preview" && preview.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span>Preview ({preview.length} rows detected)</span>
              <Button size="sm" onClick={handleImport}>Import Now</Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b">
                    {Object.keys(preview[0]).slice(0, 8).map((k) => (
                      <th key={k} className="pb-2 text-left font-medium text-muted-foreground pr-4">{k}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {preview.slice(0, 5).map((row, i) => (
                    <tr key={i}>
                      {Object.values(row).slice(0, 8).map((v, j) => (
                        <td key={j} className="py-1.5 pr-4">{String(v)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {status === "importing" && (
        <div className="flex items-center gap-3 rounded-lg border p-4">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" />
          <p className="text-sm">Importing holdings…</p>
        </div>
      )}

      {status === "done" && result && (
        <Card className="border-green-500/30 bg-green-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <p className="text-sm font-semibold text-green-500">Import Complete</p>
            </div>
            <p className="text-xs text-muted-foreground">Created: {result.created} | Updated: {result.updated}</p>
            {result.errors.length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-red-500">Errors: {result.errors.length}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {status === "error" && (
        <Card className="border-red-500/30 bg-red-500/5">
          <CardContent className="p-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <p className="text-sm text-red-500">Import failed. Please check your file format.</p>
          </CardContent>
        </Card>
      )}

      {/* Supported columns */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Supported Column Names</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {[
              ["StockCode / Symbol / Ticker", "Stock identifier"],
              ["CompanyName / Company", "Full company name"],
              ["Industry / Sector", "Business sector"],
              ["Quantity / Qty / Shares", "Number of shares"],
              ["AverageBuyPrice / AvgPrice", "Your purchase price"],
              ["CurrentPrice / LTP / Price", "Current market price"],
              ["CurrentPE / PE", "Current P/E ratio"],
              ["EPS", "Earnings per share"],
              ["BookValuePerShare / BVPS", "Book value per share"],
              ["ROE / ROCE", "Return ratios"],
            ].map(([col, desc]) => (
              <div key={col} className="space-y-0.5">
                <p className="font-mono font-medium">{col}</p>
                <p className="text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
