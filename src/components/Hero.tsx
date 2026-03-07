import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-24 pb-12 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(0,224,255,0.1),transparent_50%)]" />
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-primary/20 rounded-full blur-[120px] -translate-x-1/2" />
      <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-secondary/20 rounded-full blur-[120px] translate-x-1/2" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col lg:flex-row items-center gap-16">
        {/* Left Content */}
        <div className="flex-1 text-center lg:text-left">
          <div className="inline-block relative group animate-fade-in-up">
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="relative mb-6 px-6 py-2 rounded-full border border-border bg-muted/50 backdrop-blur-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">SAM AI Lens</span>
            </div>
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
            Transform how users interact with <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">data</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto lg:mx-0">
            Unlock a new way to interact with your data. Enable natural language queries and deliver instant and intelligent insights directly to your users.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
            <button className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-primary to-secondary text-white font-bold text-lg hover:shadow-[0_0_30px_rgba(0,224,255,0.4)] transition-all duration-300 transform hover:-translate-y-1">
              Request a demo
            </button>
            <Link href="/dashboard" className="w-full text-center sm:w-auto px-8 py-4 rounded-full glass border border-border hover:bg-muted font-semibold transition-all duration-300">
              Open Dashboard App
            </Link>
          </div>
        </div>

        {/* Right Visual / Power BI Embed Placeholder */}
        <div className="flex-1 w-full max-w-2xl lg:max-w-none">
          <div className="glass rounded-2xl border border-border p-2 shadow-2xl relative group">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
            
            {/* Mock Dashboard UI */}
            <div className="bg-card rounded-xl overflow-hidden border border-border aspect-[4/3] flex flex-col relative z-10">
              {/* Header */}
              <div className="h-12 border-b border-border flex items-center px-4 justify-between bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="text-primary font-bold mr-2">SAM</span> 
                    <span className="text-muted-foreground">Specialization</span>
                    <div className="text-xs text-muted-foreground ml-2">Power BI Embed - SAM AI Lens</div>
                  </div>
                </div>
              </div>
              
              {/* Body */}
              <div className="flex-1 p-6 flex flex-col gap-6 relative overflow-hidden">
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-secondary/10 blur-3xl rounded-full" />
                
                {/* Chat simulation */}
                <div className="glass p-3 rounded-lg border-primary/20 w-3/4 max-w-xs self-end mb-2 backdrop-blur-md">
                  <p className="text-sm">"Show me the sales performance by region for Q3."</p>
                </div>
                
                {/* Chart placeholders */}
                <div className="flex-1 flex gap-4">
                  <div className="flex-1 glass rounded-lg border-border flex items-end p-4 justify-between">
                    {[40, 70, 45, 90, 65, 30].map((h, i) => (
                      <div key={i} className="w-8 bg-gradient-to-t from-primary/80 to-primary/40 rounded-t-sm" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
