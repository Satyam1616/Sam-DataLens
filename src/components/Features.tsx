import { MessageSquare, ShieldCheck, LineChart, Upload, Database, Zap } from "lucide-react";

const features = [
  { icon: MessageSquare, title: "Natural language queries", desc: "Ask in plain English. No SQL, no formula syntax, no learning curve." },
  { icon: LineChart, title: "Auto-charts & insights", desc: "The right chart type is picked for you, with a written takeaway grounded in the numbers." },
  { icon: Upload, title: "Bring your own data", desc: "Drop in any CSV. Columns and types are detected automatically." },
  { icon: ShieldCheck, title: "Safe by design", desc: "Generated SQL is parsed and validated SELECT-only with enforced row limits." },
  { icon: Database, title: "Numbers you can trust", desc: "The AI decides what to compute; the engine does the math — figures are never hallucinated." },
  { icon: Zap, title: "Fast answers", desc: "Interpretations and insights come back in a second or two." },
];

export default function Features() {
  return (
    <section id="features" className="py-20 md:py-28 border-t border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="max-w-2xl mb-14">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">Everything you need to explore data</h2>
          <p className="mt-4 text-muted-foreground text-lg">From raw CSV to a clear answer, without the spreadsheet gymnastics.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f) => (
            <div key={f.title} className="surface rounded-xl p-6 hover:border-primary/40 transition-colors">
              <div className="h-10 w-10 rounded-lg bg-muted border border-border flex items-center justify-center mb-4">
                <f.icon size={18} className="text-primary" />
              </div>
              <h3 className="font-medium mb-1.5">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
