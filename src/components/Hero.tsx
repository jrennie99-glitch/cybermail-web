"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

const GradientMesh = dynamic(() => import("@/components/scene/GradientMesh"), {
  ssr: false,
});

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
};

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  // Parallax: the brand image moves slower than the rest as you scroll
  const brandY = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);
  const brandScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const copyY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section ref={ref} className="relative min-h-[110vh] w-full overflow-hidden">
      {/* WebGL gradient mesh */}
      <GradientMesh />

      {/* Subtle grid */}
      <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />

      {/* Top vignette for nav */}
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-bg/80 to-transparent pointer-events-none z-10" />

      {/* === DRAMATIC BRAND IMAGE — fills the right ~55% of the viewport === */}
      <motion.div
        style={{ y: brandY, scale: brandScale }}
        className="absolute right-0 top-0 h-full w-full lg:w-[58%] z-0 flex items-center justify-center pointer-events-none"
      >
        {/* Massive halo behind it */}
        <div className="absolute inset-0 m-auto h-[75%] w-[75%] rounded-full bg-cyber-cyan/30 blur-[160px]" />
        <div className="absolute inset-0 m-auto h-[55%] w-[55%] rounded-full bg-cyber-violet/30 blur-[120px] translate-x-20 translate-y-20" />

        {/* The brand image — HUGE */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.4, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative h-[90%] w-full max-w-[860px] mx-auto"
        >
          <Image
            src="/brand-hero.jpg"
            alt="Cybrmail — 3D encrypted envelope"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 60vw"
            className="object-contain drop-shadow-[0_40px_90px_rgba(0,229,255,0.45)]"
            style={{
              maskImage:
                "radial-gradient(ellipse at center, black 60%, transparent 95%)",
              WebkitMaskImage:
                "radial-gradient(ellipse at center, black 60%, transparent 95%)",
            }}
          />
        </motion.div>
      </motion.div>

      {/* === COPY OVERLAY — left side, sits over the brand image gracefully === */}
      <motion.div
        style={{ y: copyY, opacity: copyOpacity }}
        className="relative z-20 mx-auto max-w-7xl px-6 lg:px-10 pt-36 lg:pt-44 pb-32 flex items-center min-h-[100vh]"
      >
        <div className="max-w-[640px] lg:max-w-[680px]">
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyber-cyan/10 border border-cyber-cyan/30 text-xs font-mono tracking-wider text-cyber-cyan uppercase mb-8 backdrop-blur-sm"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-cyber-cyan/70 animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-cyber-cyan" />
            </span>
            v1.0.1 · Now on iOS · Android in review
          </motion.div>

          <motion.h1
            {...fadeUp}
            transition={{ duration: 0.85, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
            className="font-display font-bold tracking-tight text-[3.5rem] sm:text-7xl lg:text-8xl xl:text-[7rem] leading-[0.95]"
          >
            Email,{" "}
            <span className="text-gradient-cyber">reimagined</span>
            <br />
            from the wire up.
          </motion.h1>

          <motion.p
            {...fadeUp}
            transition={{ duration: 0.85, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 text-xl sm:text-2xl text-ink-dim max-w-xl leading-[1.45] font-light"
          >
            End-to-end encrypted email with an on-device AI brain, wallet
            identity, and a real US postal address.{" "}
            <span className="text-ink font-normal">All in one app.</span>
          </motion.p>

          <motion.div
            {...fadeUp}
            transition={{ duration: 0.85, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="mt-12 flex flex-wrap items-center gap-4"
          >
            <a
              href="https://apps.apple.com/app/cybrmail"
              className="group relative inline-flex items-center gap-3 px-9 py-4 rounded-full bg-cyber-cyan text-bg font-semibold text-base cyber-glow hover:scale-[1.03] active:scale-[0.98] transition-transform"
            >
              Download on iOS
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="opacity-80 group-hover:translate-x-0.5 transition-transform">
                <path d="M5 12h14m0 0l-6-6m6 6l-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
            <Link
              href="/app"
              className="inline-flex items-center gap-2 px-9 py-4 rounded-full border border-white/15 bg-white/[0.04] hover:bg-white/[0.08] text-ink text-base font-medium backdrop-blur-md transition-colors"
            >
              Open in browser
            </Link>
          </motion.div>

          <motion.div
            {...fadeUp}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-16 flex items-center gap-6 text-xs text-ink-dim font-mono uppercase tracking-wider"
          >
            <span className="flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-cyber-cyan" />
              End-to-end encrypted
            </span>
            <span className="flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-cyber-cyan" />
              On-device AI
            </span>
            <span className="flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-cyber-cyan" />
              No tracking
            </span>
          </motion.div>
        </div>
      </motion.div>

      {/* Bottom fade into next section */}
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-bg via-bg/80 to-transparent pointer-events-none z-10" />

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.6 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 text-cyber-cyan/60 text-xs font-mono uppercase tracking-[0.25em] flex flex-col items-center gap-3"
      >
        <span>Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="h-8 w-px bg-gradient-to-b from-cyber-cyan/60 to-transparent"
        />
      </motion.div>
    </section>
  );
}
