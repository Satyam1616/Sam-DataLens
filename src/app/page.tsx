import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Benefits from "@/components/Benefits";
import Features from "@/components/Features";
import Footer from "@/components/Footer";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />
      <Hero />
      <Features />
      <Benefits />

      {/* CTA */}
      <section className="py-20 md:py-28 border-t border-border bg-card-muted">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">Start exploring your data</h2>
          <p className="mt-4 text-muted-foreground text-lg">Open the workspace and ask your first question — the sample dataset is already loaded.</p>
          <div className="mt-8">
            <Link href="/dashboard" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary-hover transition-colors">
              Open workspace <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
