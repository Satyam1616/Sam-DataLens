const steps = [
  { n: "01", title: "Upload your CSV", desc: "Drag in a file or start with the built-in sample. DataLens profiles every column and its type." },
  { n: "02", title: "Ask a question", desc: "“Revenue by region”, “profit trend over time”, “which segment is growing fastest?” — however you'd say it." },
  { n: "03", title: "Read the answer", desc: "A chart plus a plain-English insight computed from your actual rows, ready to save or revisit." },
];

export default function Benefits() {
  return (
    <>
      <section id="how" className="py-20 md:py-28 border-t border-border bg-card-muted">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mb-14">
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">Three steps to an answer</h2>
            <p className="mt-4 text-muted-foreground text-lg">No setup, no modelling, no dashboards to configure.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((s) => (
              <div key={s.n} className="relative">
                <div className="text-5xl font-semibold text-primary/15 mb-3">{s.n}</div>
                <h3 className="font-medium text-lg mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="why" className="py-20 md:py-28 border-t border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">Built for answers you can trust</h2>
            <p className="mt-4 text-muted-foreground text-lg leading-relaxed">
              Most “AI analytics” tools let the model make up numbers. DataLens separates the two jobs:
              the LLM only decides <em>what</em> to measure, and a deterministic engine does the arithmetic
              on your real data. Every figure on screen traces back to a row you uploaded.
            </p>
            <ul className="mt-6 space-y-3">
              {["LLM-planned, code-computed results", "SELECT-only SQL validation on the live-DB path", "Works offline with a deterministic fallback"].map((t) => (
                <li key={t} className="flex items-center gap-3 text-sm">
                  <span className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs">✓</span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="surface rounded-2xl p-6">
            <div className="text-xs text-muted-foreground mb-2">Example insight</div>
            <div className="text-sm leading-relaxed text-foreground">
              “Profit peaked at <span className="font-medium">$81,202</span> in March 2025 before falling
              <span className="font-medium"> 56%</span> by October. Investigate the Q4 dip in APAC, where
              discounts rose fastest.”
            </div>
            <div className="mt-4 pt-4 border-t border-border text-xs text-muted-foreground">Generated from the sample dataset · grounded in computed rows</div>
          </div>
        </div>
      </section>
    </>
  );
}
