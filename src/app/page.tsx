"use client";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { TrendingUp, Upload, FileSpreadsheet, CheckCircle, ArrowRight, BarChart3, ShieldCheck, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const router = useRouter();
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
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
        const parsed = Papa.parse<Record<string, unknown>>(text, { header: true, skipEmptyLines: true });
        rows = parsed.data;
      } else {
        const XLSX = await import("xlsx");
        const buffer = await f.arrayBuffer();
        const wb = XLSX.read(buffer, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws);
      }

      if (!rows.length) { setStatus("error"); setErrorMsg("No rows found in file."); return; }

      setStatus("uploading");
      const res = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ holdings: rows }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
      setStatus("done");
      setTimeout(() => router.push("/dashboard"), 1800);
    } catch (e: unknown) {
      setStatus("error");
      setErrorMsg(e instanceof Error ? e.message : "Upload failed");
    }
  }, [router]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) processFile(f);
  }, [processFile]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) processFile(f);
  };

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
        <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")}>
          View Dashboard <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        <div className="w-full max-w-2xl space-y-10">
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
            <p className="text-muted-foreground text-base max-w-md mx-auto">
              Drop your Excel or CSV file with your holdings. We&apos;ll calculate valuations, risk scores, and buy/sell signals instantly.
            </p>
          </div>

          {/* Upload Box */}
          {status === "done" ? (
            <div className="rounded-2xl border border-green-500/30 bg-green-500/5 p-12 text-center space-y-3">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
              <p className="text-lg font-semibold">Portfolio imported!</p>
              <p className="text-sm text-muted-foreground">
                {result?.created} stocks added · {result?.updated} updated
              </p>
              <p className="text-xs text-muted-foreground">Redirecting to dashboard…</p>
            </div>
          ) : (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => status === "idle" && document.getElementById("home-file")?.click()}
              className={`rounded-2xl border-2 border-dashed p-14 text-center transition-all cursor-pointer select-none
                ${dragging ? "border-primary bg-primary/5 scale-[1.01]" : "border-border hover:border-primary/40 hover:bg-muted/30"}
                ${status !== "idle" ? "pointer-events-none" : ""}`}
            >
              <input id="home-file" type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={onFileChange} />

              {status === "idle" && (
                <>
                  <div className="mx-auto mb-4 h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Upload className="h-7 w-7 text-primary" />
                  </div>
                  <p className="font-semibold text-base">Drop your portfolio file here</p>
                  <p className="text-sm text-muted-foreground mt-1">Supports .xlsx · .xls · .csv</p>
                  <div className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground">
                    Choose File
                  </div>
                </>
              )}

              {(status === "parsing" || status === "uploading") && (
                <div className="space-y-3">
                  <div className="mx-auto h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                  <p className="text-sm font-medium">{status === "parsing" ? "Reading file…" : "Saving to database…"}</p>
                  {file && <p className="text-xs text-muted-foreground">{file.name}</p>}
                </div>
              )}

              {status === "error" && (
                <div className="space-y-2">
                  <p className="text-red-500 font-medium">Upload failed</p>
                  <p className="text-xs text-muted-foreground">{errorMsg}</p>
                  <button className="mt-3 text-xs text-primary underline" onClick={(e) => { e.stopPropagation(); setStatus("idle"); }}>
                    Try again
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Required columns hint */}
          {status === "idle" && (
            <div className="rounded-xl border bg-muted/30 p-5">
              <div className="flex items-center gap-2 mb-3">
                <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Required columns in your file</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {["StockCode","CompanyName","Quantity","AverageBuyPrice","CurrentPrice"].map((c) => (
                  <code key={c} className="rounded bg-background border px-2 py-0.5 text-xs font-mono">{c}</code>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <p className="text-xs text-muted-foreground w-full">Optional (unlock full analytics):</p>
                {["Industry","CurrentPE","HistoricalAveragePE","EPS","BookValuePerShare","ROEPercent","ROCEPercent","DebtToEquityRatio","Week52High","Week52Low","AllTimeHigh"].map((c) => (
                  <code key={c} className="rounded bg-background border px-2 py-0.5 text-[10px] font-mono text-muted-foreground">{c}</code>
                ))}
              </div>
            </div>
          )}

          {/* Feature pills */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: BarChart3, label: "Valuation Engine", desc: "Graham Number · PE analysis · MOS" },
              { icon: Zap, label: "Buy/Sell Scores", desc: "7-factor scoring · instant signals" },
              { icon: ShieldCheck, label: "Risk Dashboard", desc: "Concentration · sector exposure" },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="rounded-xl border bg-card p-4 text-center space-y-1.5">
                <Icon className="h-5 w-5 mx-auto text-primary" />
                <p className="text-xs font-semibold">{label}</p>
                <p className="text-[10px] text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
