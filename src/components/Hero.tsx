"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";

const GradientMesh = dynamic(() => import("@/components/scene/GradientMesh"), {
  ssr: false,
});

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
};

export default function Hero() {
  return (
    <section className="relative min-h-screen w-full overflow-hidden">
      {/* WebGL animated gradient mesh background */}
      <GradientMesh />

      {/* Subtle grid overlay */}
      <div className="absolute inset-0 bg-grid opacity-40 pointer-events-none" />

      {/* Top vignette */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-bg/70 to-transparent pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-10 pt-32 lg:pt-40 pb-24 grid lg:grid-cols-[1.05fr_0.95fr] gap-10 items-center min-h-[calc(100vh-4rem)]">
        {/* Left: copy */}
        <div className="max-w-2xl">
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyber-cyan/10 border border-cyber-cyan/25 text-xs font-mono tracking-wider text-cyber-cyan uppercase mb-7"
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
            className="font-display font-bold tracking-tight text-5xl sm:text-6xl lg:text-7xl xl:text-[5.25rem] leading-[1.02]"
          >
            The inbox{" "}
            <span className="text-gradient-cyber">that thinks for itself.</span>
          </motion.h1>

          <motion.p
            {...fadeUp}
            transition={{ duration: 0.85, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="mt-7 text-lg sm:text-xl text-ink-dim max-w-xl leading-relaxed"
          >
            End-to-end encrypted email with an on-device AI brain, wallet
            identity, and a real US digital postal address —{" "}
            <span className="text-ink">all in one app</span>. The first inbox
            built for the post-password, post-spam, post-surveillance era.
          </motion.p>

          <motion.div
            {...fadeUp}
            transition={{ duration: 0.85, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <a
              href="https://apps.apple.com/app/cybrmail"
              className="group relative inline-flex items-center gap-3 px-7 py-3.5 rounded-full bg-cyber-cyan text-bg font-semibold text-base cyber-glow hover:scale-[1.02] active:scale-[0.99] transition-transform"
            >
              Download on iOS
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="opacity-80 group-hover:translate-x-0.5 transition-transform">
                <path d="M5 12h14m0 0l-6-6m6 6l-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
            <Link
              href="/app"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border border-white/15 bg-white/[0.03] hover:bg-white/[0.07] text-ink text-base font-medium backdrop-blur-sm transition-colors"
            >
              Open in browser
            </Link>
          </motion.div>

          <motion.div
            {...fadeUp}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-12 flex items-center gap-6 text-xs text-ink-dim font-mono uppercase tracking-wider"
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

        {/* Right: real brand image — floating, glowing */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative h-[460px] sm:h-[560px] lg:h-[640px] w-full flex items-center justify-center"
        >
          {/* Cyan halo behind the brand image */}
          <div className="absolute inset-0 m-auto h-[78%] w-[78%] rounded-full bg-cyber-cyan/25 blur-[120px] pointer-events-none" />
          <div className="absolute inset-0 m-auto h-[55%] w-[55%] rounded-full bg-cyber-violet/30 blur-[100px] pointer-events-none translate-x-12 translate-y-10" />

          {/* The brand image — floating, subtle tilt + glow */}
          <motion.div
            animate={{
              y: [0, -14, 0],
              rotate: [-1.5, 1.5, -1.5],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="relative w-[85%] max-w-[480px] aspect-[784/1168] drop-shadow-[0_30px_60px_rgba(0,229,255,0.35)]"
          >
            <Image
              src="/brand-hero.jpg"
              alt="Cybrmail — 3D encrypted envelope"
              fill
              priority
              className="object-contain rounded-3xl"
              sizes="(max-width: 768px) 80vw, 480px"
            />
          </motion.div>
        </motion.div>
      </div>

      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-bg to-transparent pointer-events-none" />
    </section>
  );
}
