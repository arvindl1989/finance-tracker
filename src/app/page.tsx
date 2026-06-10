"use client";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { TrendingUp, Upload, CheckCircle, ArrowRight, BarChart3, ShieldCheck, Zap, RefreshCw, GitMerge, LayoutDashboard } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<"replace" | "merge">("replace");
  const [status, setStatus] = useState<"idle" | "parsing" | "uploading" | "done" | "error">("idle");
  const [result, setResult] = useState<{ created: number; updated: number } | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const processFile = useCallback(async (f: File) => {
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
      setStatus("uploading");
      const res = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ holdings: rows, mode }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
      setStatus("done");
      setTimeout(() => router.push("/dashboard"), 2000);
    } catch (e: unknown) {
      setStatus("error");
      setErrorMsg(e instanceof Error ? e.message : "Upload failed");
    }
  }, [router, mode]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0]; if (f) processFile(f);
  }, [processFile]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <TrendingUp className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg tracking-tight">EquityLens</span>
        </div>
        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-accent transition-colors"
        >
          <LayoutDashboard className="h-4 w-4" />
          View Dashboard
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl space-y-8">

          {/* Hero */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-muted-foreground mb-2">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              Portfolio Intelligence Platform
            </div>
            <h1 className="text-4xl font-bold tracking-tight">
              Upload your portfolio,<br />
              <span className="text-primary">get instant insights.</span>
            </h1>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              Drop your Excel or CSV file. We&apos;ll calculate valuations, risk scores, and buy/sell signals instantly.
            </p>
          </div>

          {/* Done state */}
          {status === "done" && result ? (
            <div className="rounded-2xl border border-green-500/30 bg-green-500/5 p-12 text-center space-y-3">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
              <p className="text-lg font-semibold">Portfolio imported!</p>
              <p className="text-sm text-muted-foreground">
                {result.created} stocks added · {result.updated} updated
                {mode === "replace" && " · previous data cleared"}
              </p>
              <p className="text-xs text-muted-foreground animate-pulse">Redirecting to dashboard…</p>
            </div>
          ) : (
            <>
              {/* Import mode toggle */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setMode("replace")}
                  className={`rounded-xl border-2 p-4 text-left transition-all ${mode === "replace" ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <RefreshCw className={`h-4 w-4 ${mode === "replace" ? "text-primary" : "text-muted-foreground"}`} />
                    <p className={`text-sm font-semibold ${mode === "replace" ? "text-foreground" : "text-muted-foreground"}`}>Replace All</p>
                    {mode === "replace" && <span className="ml-auto text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">Selected</span>}
                  </div>
                  <p className="text-xs text-muted-foreground">Clears existing portfolio and loads fresh. Use for a new dataset.</p>
                </button>
                <button
                  onClick={() => setMode("merge")}
                  className={`rounded-xl border-2 p-4 text-left transition-all ${mode === "merge" ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <GitMerge className={`h-4 w-4 ${mode === "merge" ? "text-primary" : "text-muted-foreground"}`} />
                    <p className={`text-sm font-semibold ${mode === "merge" ? "text-foreground" : "text-muted-foreground"}`}>Merge / Update</p>
                    {mode === "merge" && <span className="ml-auto text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">Selected</span>}
                  </div>
                  <p className="text-xs text-muted-foreground">Updates existing stocks and adds new ones. Keeps untouched stocks.</p>
                </button>
              </div>

              {/* Drop zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                onClick={() => status === "idle" && document.getElementById("home-file")?.click()}
                className={`rounded-2xl border-2 border-dashed p-14 text-center transition-all cursor-pointer select-none
                  ${dragging ? "border-primary bg-primary/5 scale-[1.01]" : "border-border hover:border-primary/40 hover:bg-muted/20"}
                  ${status !== "idle" && status !== "error" ? "pointer-events-none" : ""}`}
              >
                <input id="home-file" type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f); }} />

                {(status === "idle" || status === "error") && (
                  <>
                    <div className="mx-auto mb-4 h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <Upload className="h-7 w-7 text-primary" />
                    </div>
                    <p className="font-semibold text-base">Drop your portfolio file here</p>
                    <p className="text-sm text-muted-foreground mt-1">Supports .xlsx · .xls · .csv</p>
                    <div className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground">
                      <Upload className="h-4 w-4" />
                      Choose File
                    </div>
                    {status === "error" && <p className="mt-4 text-xs text-red-500 font-medium">{errorMsg}</p>}
                  </>
                )}

                {(status === "parsing" || status === "uploading") && (
                  <div className="space-y-3">
                    <div className="mx-auto h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                    <p className="text-sm font-medium">{status === "parsing" ? "Reading file…" : mode === "replace" ? "Clearing old data & importing…" : "Merging holdings…"}</p>
                    {file && <p className="text-xs text-muted-foreground">{file.name}</p>}
                  </div>
                )}
              </div>

              {/* Min columns note */}
              <div className="rounded-xl border bg-muted/30 px-5 py-4 flex items-center gap-3 flex-wrap">
                <p className="text-xs text-muted-foreground font-medium shrink-0">Minimum required:</p>
                {["StockCode", "CompanyName", "Quantity", "AverageBuyPrice"].map((c) => (
                  <code key={c} className="rounded border bg-background px-2 py-0.5 text-xs font-mono">{c}</code>
                ))}
                <p className="text-xs text-muted-foreground">— current price & fundamentals are fetched automatically via Yahoo Finance</p>
              </div>
            </>
          )}

          {/* Features */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: BarChart3, label: "Valuation Engine", desc: "Graham Number · PE · MOS" },
              { icon: Zap,       label: "Buy/Sell Scores",  desc: "7-factor · instant signals" },
              { icon: ShieldCheck, label: "Risk Dashboard", desc: "Concentration · sector" },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="rounded-xl border bg-card p-4 text-center space-y-1.5">
                <Icon className="h-5 w-5 mx-auto text-primary" />
                <p className="text-xs font-semibold">{label}</p>
                <p className="text-[10px] text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>

          {/* Already have data */}
          <p className="text-center text-xs text-muted-foreground">
            Already have a portfolio loaded?{" "}
            <button onClick={() => router.push("/dashboard")} className="text-primary font-medium underline underline-offset-2">
              Go to Dashboard →
            </button>
          </p>

        </div>
      </main>
    </div>
  );
}
