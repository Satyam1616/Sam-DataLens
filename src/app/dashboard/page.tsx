"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Send, Database, Upload, Download, FileSpreadsheet, Sparkles, Menu, X,
  Save, CheckCircle2, LogOut, Trash2, ArrowUpRight, Zap,
} from "lucide-react";
import { datasetFromCSV, Dataset } from "@/lib/csv";
import { SAMPLE_CSV, SAMPLE_NAME } from "@/lib/sampleData";
import ChartView from "@/components/ChartView";

type Message = {
  id: string;
  role: "user" | "assistant" | "system";
  content?: string;
  result?: any;
  suggested?: string[];
  poweredBy?: "groq" | "heuristic";
  saved?: boolean;
};

const MAX_ROWS = 5000;
const uid = () => Math.random().toString(36).slice(2);

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [history, setHistory] = useState<any[]>([]);
  const [savingId, setSavingId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const greeting = (ds: Dataset): Message => ({
    id: uid(),
    role: "assistant",
    content: `Loaded "${ds.name}" — ${ds.rows.length.toLocaleString()} rows across ${ds.columns.length} columns. Ask me anything about it in plain English.`,
    suggested: defaultSuggestions(ds),
  });

  const loadSample = useCallback(() => {
    const ds = datasetFromCSV(SAMPLE_CSV, SAMPLE_NAME);
    setDataset(ds);
    setMessages([greeting(ds)]);
  }, []);

  useEffect(() => { if (status === "unauthenticated") router.push("/login"); }, [status, router]);
  useEffect(() => { loadSample(); }, [loadSample]);
  useEffect(() => {
    if (status === "authenticated")
      fetch("/api/queries").then((r) => r.json()).then((d) => setHistory(d.data || [])).catch(() => {});
  }, [status]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  const handleUpload = async (file: File) => {
    const text = await file.text();
    const ds = datasetFromCSV(text, file.name);
    if (!ds.columns.length || !ds.rows.length) {
      setMessages((m) => [...m, { id: uid(), role: "system", content: "That file didn't parse into any rows. Please upload a valid CSV with a header row." }]);
      return;
    }
    setDataset(ds);
    setMessages([greeting(ds)]);
  };

  const downloadSample = () => {
    const blob = new Blob([SAMPLE_CSV], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = SAMPLE_NAME; a.click();
    URL.revokeObjectURL(url);
  };

  const handleSend = async (text: string = input) => {
    const q = text.trim();
    if (!q || !dataset || loading) return;
    setMessages((m) => [...m, { id: uid(), role: "user", content: q }]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: q,
          dataset: { name: dataset.name, columns: dataset.columns, rows: dataset.rows.slice(0, MAX_ROWS) },
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setMessages((m) => [...m, {
        id: uid(), role: "assistant", content: data.insight,
        result: data.data?.length ? data : undefined,
        suggested: data.suggestedQuestions, poweredBy: data.poweredBy,
      }]);
    } catch {
      setMessages((m) => [...m, { id: uid(), role: "system", content: "Sorry — I couldn't analyse that. Try rephrasing your question." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (msgId: string, msg: Message) => {
    setSavingId(msgId);
    try {
      const parent = [...messages].slice(0, messages.findIndex((m) => m.id === msgId)).reverse().find((m) => m.role === "user");
      const res = await fetch("/api/queries", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: parent?.content || msg.result?.title || "Saved insight", sql: "", chartType: msg.result?.chartType, chartData: msg.result }),
      });
      if (res.ok) {
        setMessages((m) => m.map((x) => (x.id === msgId ? { ...x, saved: true } : x)));
        fetch("/api/queries").then((r) => r.json()).then((d) => setHistory(d.data || [])).catch(() => {});
      }
    } catch { /* ignore */ } finally { setSavingId(null); }
  };

  const deleteHistory = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/queries?id=${id}`, { method: "DELETE" });
      if (res.ok) setHistory((h) => h.filter((q) => q.id !== id));
    } catch { /* ignore */ }
  };

  if (status === "loading") {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="h-6 w-6 rounded-full border-2 border-border border-t-primary animate-spin" />
    </div>;
  }

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {sidebarOpen && <div className="md:hidden fixed inset-0 bg-black/40 z-20" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`${sidebarOpen ? "w-[85vw] sm:w-72 translate-x-0" : "-translate-x-full md:translate-x-0 md:w-0"} fixed md:relative h-full z-30 flex-shrink-0 border-r border-border bg-card transition-all duration-300 flex flex-col overflow-hidden`}>
        <div className="h-16 px-5 flex items-center justify-between border-b border-border min-w-[260px]">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles size={16} className="text-primary-foreground" />
            </div>
            <span className="font-semibold tracking-tight">DataLens</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-muted-foreground"><X size={18} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6 min-w-[260px]">
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5"><Database size={13} /> Dataset</h3>
            <div className="surface rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <FileSpreadsheet size={15} className="text-primary flex-shrink-0" />
                <span className="text-sm font-medium truncate">{dataset?.name ?? "No data"}</span>
              </div>
              {dataset && (
                <>
                  <div className="text-xs text-muted-foreground mb-3">{dataset.rows.length.toLocaleString()} rows · {dataset.columns.length} columns</div>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {dataset.columns.slice(0, 10).map((c) => (
                      <span key={c.name} className="px-1.5 py-0.5 text-[10px] rounded border border-border bg-muted text-muted-foreground">{c.name}</span>
                    ))}
                  </div>
                </>
              )}
              <div className="flex flex-col gap-2">
                <button onClick={() => fileRef.current?.click()} className="w-full inline-flex items-center justify-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary-hover transition-colors">
                  <Upload size={13} /> Upload CSV
                </button>
                <div className="flex gap-2">
                  <button onClick={loadSample} className="flex-1 text-xs font-medium px-2 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors">Sample</button>
                  <button onClick={downloadSample} className="inline-flex items-center justify-center gap-1 text-xs font-medium px-2 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors" title="Download sample CSV"><Download size={13} /></button>
                </div>
              </div>
              <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); e.target.value = ""; }} />
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Saved</h3>
            {history.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">No saved insights yet.</p>
            ) : (
              <ul className="space-y-1.5">
                {history.slice(0, 8).map((q) => (
                  <li key={q.id} className="group flex items-center justify-between gap-2 px-3 py-2 rounded-lg border border-border hover:border-primary/40 bg-card transition-colors">
                    <span className="text-xs truncate text-foreground">{q.question}</span>
                    <button onClick={(e) => deleteHistory(q.id, e)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-rose-500 transition-all"><Trash2 size={12} /></button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border flex items-center justify-between px-4 md:px-6 bg-background/80 backdrop-blur">
          <div className="flex items-center gap-3">
            {!sidebarOpen && <button onClick={() => setSidebarOpen(true)} className="text-muted-foreground hover:text-foreground"><Menu size={20} /></button>}
            <div>
              <h1 className="font-semibold tracking-tight leading-none">Workspace</h1>
              <p className="text-xs text-muted-foreground mt-1">Natural-language analytics</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-muted-foreground px-2.5 py-1 rounded-full border border-border">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Ready
            </span>
            {session?.user && (
              <div className="flex items-center gap-2 pl-2 border-l border-border">
                <div className="h-7 w-7 rounded-full bg-muted border border-border flex items-center justify-center text-xs font-medium">{(session.user.name || "U")[0].toUpperCase()}</div>
                <span className="text-sm hidden md:block">{session.user.name}</span>
                <button onClick={() => signOut({ callbackUrl: "/" })} className="text-muted-foreground hover:text-foreground ml-1"><LogOut size={16} /></button>
              </div>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6">
          <div className="max-w-3xl mx-auto space-y-5 pb-28">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} msg={msg} onSuggest={handleSend} onSave={handleSave} saving={savingId === msg.id} />
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Zap size={14} className="text-primary animate-pulse" /> Analysing your data…
              </div>
            )}
            <div ref={endRef} />
          </div>
        </div>

        {/* Composer */}
        <div className="border-t border-border bg-background px-4 md:px-8 py-4">
          <div className="max-w-3xl mx-auto">
            <div className="surface rounded-xl flex items-end gap-2 p-2 focus-within:ring-2 focus-within:ring-[var(--ring)] transition-shadow">
              <textarea value={input} onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder={dataset ? `Ask about ${dataset.name}…` : "Upload a CSV to begin…"} rows={1}
                className="flex-1 bg-transparent resize-none outline-none text-sm px-3 py-2 max-h-32 placeholder:text-muted-foreground" />
              <button onClick={() => handleSend()} disabled={!input.trim() || loading || !dataset}
                className="p-2.5 rounded-lg bg-primary text-primary-foreground disabled:opacity-40 hover:bg-primary-hover transition-colors">
                <Send size={16} />
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground mt-2 text-center">DataLens interprets your question, computes real numbers from your data, then explains the result.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ msg, onSuggest, onSave, saving }: { msg: Message; onSuggest: (q: string) => void; onSave: (id: string, m: Message) => void; saving: boolean }) {
  if (msg.role === "user") {
    return <div className="flex justify-end"><div className="max-w-[85%] bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm">{msg.content}</div></div>;
  }
  if (msg.role === "system") {
    return <div className="flex justify-center"><div className="text-xs text-muted-foreground bg-muted border border-border rounded-full px-3 py-1.5">{msg.content}</div></div>;
  }
  return (
    <div className="flex gap-3">
      <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center flex-shrink-0 mt-0.5"><Sparkles size={14} className="text-primary-foreground" /></div>
      <div className="flex-1 min-w-0 space-y-3">
        {msg.content && <p className="text-sm leading-relaxed text-foreground">{msg.content}</p>}
        {msg.result && (
          <div className="surface rounded-xl p-4">
            <div className="flex items-center justify-between gap-3 mb-3">
              <h3 className="text-sm font-medium truncate">{msg.result.title}</h3>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => onSave(msg.id, msg)} disabled={msg.saved || saving}
                  className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg border transition-colors ${msg.saved ? "border-emerald-500/30 text-emerald-600 dark:text-emerald-400" : "border-border hover:bg-muted"}`}>
                  {saving ? <div className="h-3 w-3 rounded-full border-2 border-border border-t-primary animate-spin" /> : msg.saved ? <><CheckCircle2 size={13} /> Saved</> : <><Save size={13} /> Save</>}
                </button>
              </div>
            </div>
            <ChartView result={msg.result} />
          </div>
        )}
        {msg.suggested && msg.suggested.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {msg.suggested.map((s, i) => (
              <button key={i} onClick={() => onSuggest(s)} className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full border border-border hover:bg-muted hover:border-primary/40 transition-colors text-foreground">
                {s} <ArrowUpRight size={11} className="text-muted-foreground" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function defaultSuggestions(ds: Dataset): string[] {
  const num = ds.columns.find((c) => c.type === "number");
  const date = ds.columns.find((c) => c.type === "date");
  const cat = ds.columns.filter((c) => c.type === "string" && c.distinct > 1 && c.distinct <= 50);
  const out: string[] = [];
  if (num && cat[0]) out.push(`${num.name} by ${cat[0].name}`);
  if (num && date) out.push(`${num.name} trend over time`);
  if (num && cat[1]) out.push(`Share of ${num.name} by ${cat[1].name}`);
  if (out.length < 3 && num) out.push(`Total ${num.name}`);
  return out.slice(0, 3);
}
