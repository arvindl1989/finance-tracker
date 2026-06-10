"use client";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileSpreadsheet, CheckCircle, Download, ArrowRight, RefreshCw, GitMerge } from "lucide-react";

export default function ImportPage() {
  const router = useRouter();
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<Record<string, unknown>[]>([]);
  const [status, setStatus] = useState<"idle" | "parsing" | "preview" | "uploading" | "done" | "error">("idle");
  const [mode, setMode] = useState<"replace" | "merge">("replace");
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
        rows = Papa.parse<Record<string, unknown>>(text, { header: true, skipEmptyLines: true }).data;
      } else {
        const XLSX = await import("xlsx");
        const buffer = await f.arrayBuffer();
        const wb = XLSX.read(buffer, { type: "array" });
        const sheetName = wb.SheetNames.includes("Portfolio") ? "Portfolio" : wb.SheetNames[0];
        rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(wb.Sheets[sheetName]);
      }
      if (!rows.length) { setStatus("error"); setErrorMsg("No rows found in file."); return; }
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
        const sheetName = wb.SheetNames.includes("Portfolio") ? "Portfolio" : wb.SheetNames[0];
        allRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(wb.Sheets[sheetName]);
      }
      const res = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ holdings: allRows, mode }),
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
  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0]; if (f) parseFile(f);
  }, [parseFile]);

  const cols = preview[0] ? Object.keys(preview[0]).slice(0, 6) : [];

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-bold">Import Portfolio</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Upload an Excel (.xlsx) or CSV file with your holdings</p>
      </div>

      {/* Done */}
      {status === "done" && result && (
        <Card className="border-green-500/30 bg-green-500/5">
          <CardContent className="p-6 text-center space-y-3">
            <CheckCircle className="h-10 w-10 text-green-500 mx-auto" />
            <p className="font-semibold">
              {mode === "replace" ? "Portfolio replaced!" : "Portfolio updated!"}
            </p>
            <p className="text-sm text-muted-foreground">
              {result.created} stocks added · {result.updated} updated
              {mode === "replace" && " · old data cleared"}
            </p>
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
          {/* Mode selector */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setMode("replace")}
              className={`rounded-xl border-2 p-4 text-left transition-all ${mode === "replace" ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <RefreshCw className={`h-4 w-4 ${mode === "replace" ? "text-primary" : "text-muted-foreground"}`} />
                <p className="text-sm font-semibold">Replace All</p>
              </div>
              <p className="text-xs text-muted-foreground">Clears existing portfolio completely and loads fresh data from this file. Use this for a new dataset.</p>
            </button>
            <button
              onClick={() => setMode("merge")}
              className={`rounded-xl border-2 p-4 text-left transition-all ${mode === "merge" ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <GitMerge className={`h-4 w-4 ${mode === "merge" ? "text-primary" : "text-muted-foreground"}`} />
                <p className="text-sm font-semibold">Merge / Update</p>
              </div>
              <p className="text-xs text-muted-foreground">Updates existing stocks and adds new ones. Keeps stocks not in the file. Use this to update prices or add new holdings.</p>
            </button>
          </div>

          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => document.getElementById("fi")?.click()}
            className={`rounded-xl border-2 border-dashed p-12 text-center cursor-pointer transition-all select-none
              ${dragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/40 hover:bg-muted/20"}`}
          >
            <input id="fi" type="file" accept=".csv,.xlsx,.xls" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) parseFile(f); }} />
            <Upload className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
            <p className="font-medium text-sm">Drop your file here or click to browse</p>
            <p className="text-xs text-muted-foreground mt-1">.xlsx · .xls · .csv</p>
            {status === "error" && <p className="mt-3 text-xs text-red-500">{errorMsg}</p>}
          </div>
        </>
      )}

      {/* Parsing */}
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
              <div>
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4" />
                  Preview — {preview.length} rows shown
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  Mode: <span className={`font-semibold ${mode === "replace" ? "text-orange-500" : "text-blue-500"}`}>
                    {mode === "replace" ? "⚠ Replace All (existing data will be cleared)" : "Merge / Update"}
                  </span>
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={reset}>Cancel</Button>
                <Button size="sm" onClick={handleImport}
                  className={mode === "replace" ? "bg-orange-500 hover:bg-orange-600 text-white" : ""}>
                  {mode === "replace" ? "Replace Portfolio" : "Import & Merge"}
                </Button>
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
                    {Object.keys(preview[0]).length > 6 && (
                      <th className="px-3 py-2 text-muted-foreground">+{Object.keys(preview[0]).length - 6} more</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {preview.map((row, i) => (
                    <tr key={i} className="hover:bg-muted/30">
                      {cols.map((k) => (
                        <td key={k} className="px-3 py-2 whitespace-nowrap max-w-[160px] truncate">{String(row[k] ?? "")}</td>
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
          <p className="text-sm text-muted-foreground">
            {mode === "replace" ? "Clearing old data and importing…" : "Merging holdings…"}
          </p>
        </div>
      )}

      {/* Column guide */}
      {(status === "idle" || status === "error") && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground uppercase tracking-wide">Required columns</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-1.5">
              {["StockCode", "CompanyName", "Quantity", "AverageBuyPrice"].map((c) => (
                <code key={c} className="rounded border bg-muted px-2 py-0.5 text-xs font-mono">{c}</code>
              ))}
              <span className="text-xs text-muted-foreground self-center">— everything else is fetched from Yahoo Finance</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
