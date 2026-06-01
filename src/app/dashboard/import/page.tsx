"use client";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Download, ArrowRight } from "lucide-react";

const SAMPLE_CSV = `StockCode,CompanyName,Industry,Quantity,AverageBuyPrice,CurrentPrice,CurrentPE,HistoricalAveragePE,EPS,BookValuePerShare,ROEPercent,ROCEPercent,DebtToEquityRatio,Week52High,Week52Low,AllTimeHigh
RELIANCE,Reliance Industries Ltd,Energy,100,2200,2847,28.9,22,98.5,1218,14.2,12.8,0.42,3024,2180,3024
TCS,Tata Consultancy Services,Technology,50,3100,4182,32.5,28,128.7,485,52.1,68.4,0.01,4300,3204,4300
HDFCBANK,HDFC Bank Ltd,Banking & Finance,200,1450,1618,19.2,22.5,84.2,582,16.8,18.2,8.2,1757,1363,1757`;

export default function ImportPage() {
  const router = useRouter();
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<Record<string, unknown>[]>([]);
  const [status, setStatus] = useState<"idle" | "parsing" | "preview" | "uploading" | "done" | "error">("idle");
  const [result, setResult] = useState<{ created: number; updated: number; errors: string[] } | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const parseFile = useCallback(async (f: File) => {
    setFile(f);
    setStatus("parsing");
    setErrorMsg("");
    try {
      const ext = f.name.split(".").pop()?.toLowerCase();
      let rows: Record<string, unknown>[] = [];

      if (ext === "csv") {
        const Papa = (await import("papaparse")).default;
        const text = await f.text();
        const parsed = Papa.parse<Record<string, unknown>>(text, { header: true, skipEmptyLines: true });
        rows = parsed.data;
      } else {
        const XLSX = await import("xlsx");
        const buffer = await f.arrayBuffer();
        const wb = XLSX.read(buffer, { type: "array" });
        // prefer "Import Ready" sheet if present, else first sheet
        const sheetName = wb.SheetNames.includes("Import Ready") ? "Import Ready" : wb.SheetNames[0];
        const ws = wb.Sheets[sheetName];
        rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws);
      }

      if (!rows.length) { setStatus("error"); setErrorMsg("No rows found. Check the file has a header row."); return; }
      setPreview(rows.slice(0, 6));
      setStatus("preview");
    } catch (e: unknown) {
      setStatus("error");
      setErrorMsg(e instanceof Error ? e.message : "Could not read file");
    }
  }, []);

  const handleImport = async () => {
    setStatus("uploading");
    try {
      const ext = file!.name.split(".").pop()?.toLowerCase();
      let allRows: Record<string, unknown>[] = [];

      if (ext === "csv") {
        const Papa = (await import("papaparse")).default;
        const text = await file!.text();
        allRows = Papa.parse<Record<string, unknown>>(text, { header: true, skipEmptyLines: true }).data;
      } else {
        const XLSX = await import("xlsx");
        const buffer = await file!.arrayBuffer();
        const wb = XLSX.read(buffer, { type: "array" });
        const sheetName = wb.SheetNames.includes("Import Ready") ? "Import Ready" : wb.SheetNames[0];
        allRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(wb.Sheets[sheetName]);
      }

      const res = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ holdings: allRows }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
      setStatus("done");
    } catch (e: unknown) {
      setStatus("error");
      setErrorMsg(e instanceof Error ? e.message : "Upload failed");
    }
  };

  const reset = () => { setStatus("idle"); setFile(null); setPreview([]); setResult(null); setErrorMsg(""); };
  const onDrop = useCallback((e: React.DragEvent) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) parseFile(f); }, [parseFile]);
  const downloadSample = () => { const b = new Blob([SAMPLE_CSV], { type: "text/csv" }); const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = "sample-portfolio.csv"; a.click(); };

  const cols = preview[0] ? Object.keys(preview[0]).slice(0, 7) : [];

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-bold">Import Portfolio</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Upload an Excel (.xlsx) or CSV file to load your holdings</p>
      </div>

      {/* Done state */}
      {status === "done" && result && (
        <Card className="border-green-500/30 bg-green-500/5">
          <CardContent className="p-6 text-center space-y-3">
            <CheckCircle className="h-10 w-10 text-green-500 mx-auto" />
            <p className="font-semibold">Import complete</p>
            <p className="text-sm text-muted-foreground">{result.created} stocks added · {result.updated} updated</p>
            <div className="flex gap-3 justify-center pt-2">
              <Button onClick={() => router.push("/dashboard")}>
                Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={reset}>Import another</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload zone */}
      {(status === "idle" || status === "error") && (
        <>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => document.getElementById("fi")?.click()}
            className={`rounded-xl border-2 border-dashed p-12 text-center cursor-pointer transition-all select-none
              ${dragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/40 hover:bg-muted/20"}`}
          >
            <input id="fi" type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) parseFile(f); }} />
            <Upload className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
            <p className="font-medium text-sm">Drop your file here or click to browse</p>
            <p className="text-xs text-muted-foreground mt-1">.xlsx · .xls · .csv</p>
            {status === "error" && <p className="mt-3 text-xs text-red-500">{errorMsg}</p>}
          </div>

          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Need a template?</p>
            <Button variant="outline" size="sm" onClick={downloadSample}>
              <Download className="h-3.5 w-3.5 mr-2" /> Download sample CSV
            </Button>
          </div>
        </>
      )}

      {/* Parsing spinner */}
      {status === "parsing" && (
        <div className="rounded-xl border p-10 text-center space-y-3">
          <div className="h-8 w-8 mx-auto rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground">Reading {file?.name}…</p>
        </div>
      )}

      {/* Preview */}
      {status === "preview" && preview.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                Preview — {preview.length} rows shown
                {file && <span className="text-muted-foreground font-normal">({file.name})</span>}
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={reset}>Cancel</Button>
                <Button size="sm" onClick={handleImport}>Import All</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-xs">
                <thead className="bg-muted">
                  <tr>
                    {cols.map((k) => (
                      <th key={k} className="px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap">{k}</th>
                    ))}
                    {Object.keys(preview[0]).length > 7 && <th className="px-3 py-2 text-muted-foreground">+{Object.keys(preview[0]).length - 7} more</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {preview.map((row, i) => (
                    <tr key={i} className="hover:bg-muted/30">
                      {cols.map((k) => (
                        <td key={k} className="px-3 py-2 whitespace-nowrap max-w-[140px] truncate">{String(row[k] ?? "")}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Uploading */}
      {status === "uploading" && (
        <div className="rounded-xl border p-10 text-center space-y-3">
          <div className="h-8 w-8 mx-auto rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground">Saving to database…</p>
        </div>
      )}

      {/* Column guide */}
      {(status === "idle" || status === "error") && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground uppercase tracking-wide">Recognised column names</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-xs font-medium mb-1.5">Required</p>
              <div className="flex flex-wrap gap-1.5">
                {["StockCode","CompanyName","Quantity","AverageBuyPrice","CurrentPrice"].map((c) => (
                  <code key={c} className="rounded border bg-muted px-2 py-0.5 text-xs font-mono">{c}</code>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium mb-1.5">Optional (enables full scoring)</p>
              <div className="flex flex-wrap gap-1.5">
                {["Industry","CurrentPE","HistoricalAveragePE","EPS","BookValuePerShare","ROEPercent","ROCEPercent","DebtToEquityRatio","RevenueGrowthPercent","EPSGrowthPercent","Week52High","Week52Low","AllTimeHigh","DividendReceived","TargetWeightPercent"].map((c) => (
                  <code key={c} className="rounded border bg-muted px-2 py-0.5 text-[10px] font-mono text-muted-foreground">{c}</code>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
