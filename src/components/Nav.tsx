"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -28, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-bg/70 backdrop-blur-xl border-b border-white/5"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-10 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <span className="relative inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg ring-1 ring-cyber-cyan/30 cyber-glow">
            <Image
              src="/icon-512.png"
              alt="Cybrmail"
              width={36}
              height={36}
              priority
              className="object-cover w-full h-full"
            />
          </span>
          <span className="font-display font-semibold tracking-tight text-lg">
            Cybrmail
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm text-ink-dim">
          <a href="#features" className="hover:text-ink transition-colors">Features</a>
          <a href="#brain" className="hover:text-ink transition-colors">AI Brain</a>
          <a href="#wallet" className="hover:text-ink transition-colors">Wallet</a>
          <a href="#postal" className="hover:text-ink transition-colors">Postal</a>
          <a href="#pricing" className="hover:text-ink transition-colors">Pricing</a>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="https://apps.apple.com/app/cybrmail"
            className="hidden sm:inline-flex text-sm text-ink-dim hover:text-ink transition-colors"
          >
            Download
          </a>
          <Link
            href="/app"
            className="text-sm font-medium px-4 py-2 rounded-full bg-cyber-cyan/10 border border-cyber-cyan/30 text-cyber-cyan hover:bg-cyber-cyan/20 transition-colors"
          >
            Open app
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}
