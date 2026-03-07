import { Zap, ShieldCheck, Cpu } from "lucide-react";

export default function Benefits() {
  const benefits = [
    {
      title: "Informed decisions",
      description:
        "Move beyond guesswork — leverage data-backed insights to make informed decisions that reduce risk and accelerate growth.",
      icon: <ShieldCheck className="w-8 h-8 text-primary" />,
    },
    {
      title: "Streamlined operations",
      description:
        "Automate processes and reduce manual effort with insights that keep your operations running smoothly.",
      icon: <Zap className="w-8 h-8 text-secondary" />,
    },
    {
      title: "Plug-and-play extensibility",
      description:
        "Quickly connect to your existing tools and systems with plug-and-play extensibility, so your data workflows stay seamless and scalable.",
      icon: <Cpu className="w-8 h-8 text-primary" />,
    },
  ];

  return (
    <section className="py-16 md:py-24 relative overflow-hidden border-y border-border bg-muted/5">
      {/* Background gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-foreground">
            See how your business can benefit from{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              SAM AI Lens
            </span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Transform raw data into clear insights that drive smarter and faster
            decisions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="glass p-8 rounded-2xl hover:-translate-y-2 transition-transform duration-500 border border-border group relative bg-card/50"
            >
              {/* Hover glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none" />
              
              <div className="w-16 h-16 rounded-xl glass flex items-center justify-center mb-6 relative z-10 border-border shadow-[0_0_20px_rgba(0,224,255,0.1)] group-hover:scale-110 transition-transform duration-500">
                {benefit.icon}
              </div>
              <h3 className="text-xl font-bold text-foreground mb-4 relative z-10">{benefit.title}</h3>
              <p className="text-muted-foreground leading-relaxed relative z-10">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
