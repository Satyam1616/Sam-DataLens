import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-[0.5] [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)] pointer-events-none" />
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-muted text-xs font-medium text-muted-foreground mb-6">
            <Sparkles size={13} className="text-primary" /> Powered by Groq LLMs
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight leading-[1.05] text-foreground">
            Ask your data anything.<br />
            <span className="text-primary">Get answers in seconds.</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed">
            Upload a CSV and ask questions in plain English. DataLens figures out what to compute,
            runs it on your real rows, and explains the result with a chart — no SQL, no dashboards to build.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link href="/dashboard" className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary-hover transition-colors">
              Open workspace <ArrowRight size={16} />
            </Link>
            <a href="#how" className="inline-flex items-center justify-center px-5 py-3 rounded-lg border border-border font-medium hover:bg-muted transition-colors">
              See how it works
            </a>
          </div>
        </div>

        {/* Product preview */}
        <div className="mt-16 surface rounded-2xl p-2 shadow-lg max-w-4xl">
          <div className="rounded-xl border border-border overflow-hidden bg-card">
            <div className="h-10 border-b border-border flex items-center gap-2 px-4">
              <span className="h-2.5 w-2.5 rounded-full bg-border" />
              <span className="h-2.5 w-2.5 rounded-full bg-border" />
              <span className="h-2.5 w-2.5 rounded-full bg-border" />
              <span className="ml-3 text-xs text-muted-foreground">DataLens — Workspace</span>
            </div>
            <div className="p-5 grid md:grid-cols-5 gap-4">
              <div className="md:col-span-2 space-y-3">
                <div className="text-xs font-medium text-muted-foreground">You asked</div>
                <div className="inline-block rounded-xl rounded-tr-sm bg-primary text-primary-foreground text-sm px-3 py-2">Revenue by region, highest first</div>
                <div className="text-xs text-muted-foreground pt-2">DataLens</div>
                <div className="text-sm text-foreground">North America leads with the largest share of revenue, followed by EMEA. Consider doubling down on APAC, which trails but is growing.</div>
              </div>
              <div className="md:col-span-3 rounded-lg border border-border p-4 flex items-end gap-3 h-48">
                {[90, 72, 48, 30].map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full rounded-t-md bg-primary/80" style={{ height: `${h}%` }} />
                    <span className="text-[10px] text-muted-foreground">{["NA", "EMEA", "APAC", "LATAM"][i]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
