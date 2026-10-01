"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, Menu, X } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

const links = [
  { name: "Features", href: "#features" },
  { name: "How it works", href: "#how" },
  { name: "Why DataLens", href: "#why" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? "border-b border-border bg-background/80 backdrop-blur" : "border-b border-transparent"}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <Sparkles size={16} className="text-primary-foreground" />
          </div>
          <span className="font-semibold tracking-tight text-lg">DataLens</span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <a key={l.name} href={l.href} className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">{l.name}</a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href="/login" className="hidden sm:inline-flex px-3.5 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Login</Link>
          <Link href="/dashboard" className="inline-flex px-3.5 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary-hover transition-colors">Open app</Link>
          <button onClick={() => setOpen((o) => !o)} className="md:hidden p-2 text-muted-foreground">{open ? <X size={20} /> : <Menu size={20} />}</button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="px-4 py-3 space-y-1">
            {links.map((l) => (
              <a key={l.name} href={l.href} onClick={() => setOpen(false)} className="block px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted">{l.name}</a>
            ))}
            <Link href="/login" onClick={() => setOpen(false)} className="block px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-muted">Login</Link>
          </div>
        </div>
      )}
    </nav>
  );
}
