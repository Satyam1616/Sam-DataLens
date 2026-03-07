import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Benefits from "@/components/Benefits";
import Features from "@/components/Features";
import Footer from "@/components/Footer";
import { Mail } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col pt-[72px]">
      <Navbar />
      <Hero />
      <Benefits />
      <Features />
      
      {/* Call to Action Section */}
      <section className="py-16 md:py-32 relative overflow-hidden border-t border-border bg-gradient-to-b from-transparent to-primary/5">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[150px] pointer-events-none" />
        
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <div className="inline-block px-4 py-1.5 rounded-full glass border border-primary/30 text-primary text-sm font-semibold tracking-wider mb-6 uppercase bg-muted/30">
            Get Started
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10">
            Explore how SAM AI Lens can enhance your data analysis.
          </p>
          <div className="glass p-8 rounded-2xl border border-border bg-card/50 max-w-lg mx-auto transform hover:scale-[1.02] transition-transform duration-300 shadow-2xl">
            <h3 className="text-2xl font-bold mb-4 text-foreground">Interested in learning more? Request a demo to learn how SAM AI Lens can transform your interactions with data.</h3>
          </div>
          
          <div className="flex flex-col items-center justify-center gap-6">
            <button className="px-10 py-5 rounded-full bg-foreground text-background font-bold text-lg hover:opacity-90 transition-opacity shadow-[0_0_40px_rgba(255,255,255,0.2)]">
              Contact Us
            </button>
            <p className="text-muted-foreground mt-6 font-medium tracking-wide text-sm flex items-center justify-center gap-2">
              <Mail className="w-4 h-4" />
              CustomerSuccess@sam.com
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
