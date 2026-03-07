"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, ArrowRight, Activity, Zap, Shield, ChevronRight } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Services", href: "#" },
    { name: "Products", href: "#" },
    { name: "Partnerships", href: "#" },
    { name: "Resources", href: "#" },
    { name: "About us", href: "#" },
  ];

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? "glass shadow-lg py-3" : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group relative cursor-pointer z-50">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-bold text-white shadow-[0_0_20px_rgba(0,224,255,0.4)] group-hover:shadow-[0_0_30px_rgba(189,0,255,0.6)] transition-all duration-300">
              S
            </div>
            <span className="font-bold text-xl tracking-wide hidden sm:block">SAM</span>
          </Link>

          {/* Core Navigation Links */}
          <div className="hidden lg:flex items-center gap-8 bg-muted px-6 py-2.5 rounded-full border border-border">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground hover:text-primary transition-colors duration-200"
              >
                {link.name}
              </Link>
            ))}
            <ThemeToggle />
            <Link href="/login" className="hidden border border-border px-6 py-2.5 rounded-full text-foreground font-medium hover:bg-muted transition-colors sm:block">
              Login
            </Link>
            <Link
              href="#contact"
              className="px-5 py-2 rounded-full bg-primary text-white hover:bg-primary/90 text-sm font-medium transition-all duration-300 relative overflow-hidden group"
            >
              <span className="relative z-10">Contact us</span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {!menuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden glass absolute top-full left-0 w-full border-b border-border bg-background/95 backdrop-blur-md">
          <div className="px-4 pt-2 pb-6 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="block px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:text-foreground hover:bg-muted"
                onClick={() => setMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            
            <div className="border-t border-border my-2 pt-2 px-3 flex items-center justify-between">
              <span className="text-base font-medium text-muted-foreground">Theme</span>
              <ThemeToggle />
            </div>

            <div className="flex flex-col gap-2 px-3 pt-2">
              <Link
                href="/login"
                className="w-full text-center px-4 py-2 rounded-md border border-border text-foreground font-medium hover:bg-muted"
                onClick={() => setMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                href="#contact"
                className="w-full text-center px-4 py-2 rounded-md bg-primary text-white font-medium hover:bg-primary/90"
                onClick={() => setMenuOpen(false)}
              >
                Contact us
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
