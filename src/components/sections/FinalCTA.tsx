"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function FinalCTA() {
  return (
    <section className="relative py-32 lg:py-44 overflow-hidden">
      {/* Background visual */}
      <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg-elev/40 to-bg pointer-events-none" />
      <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />

      <div className="relative mx-auto max-w-5xl px-6 lg:px-10 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="relative mx-auto mb-12 h-44 w-44"
        >
          <div className="absolute inset-0 m-auto h-full w-full rounded-3xl bg-cyber-cyan/30 blur-2xl" />
          <div className="relative h-full w-full rounded-3xl overflow-hidden border border-cyber-cyan/30 cyber-glow">
            <Image
              src="/icon-512.png"
              alt="Cybrmail"
              fill
              className="object-cover"
            />
          </div>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="font-display font-bold tracking-tight text-4xl sm:text-5xl lg:text-6xl leading-[1.05]"
        >
          The inbox you wished{" "}
          <span className="text-gradient-cyber">already existed</span>.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-7 text-lg lg:text-xl text-ink-dim max-w-2xl mx-auto"
        >
          Download Cybrmail and ditch the five apps your email is currently scattered across.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-10 flex flex-wrap justify-center gap-4"
        >
          <a
            href="https://apps.apple.com/app/cybrmail"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-cyber-cyan text-bg font-semibold text-base cyber-glow hover:scale-[1.02] active:scale-[0.98] transition-transform"
          >
            Download on iOS
          </a>
          <a
            href="https://play.google.com/store/apps/details?id=com.ardynamics.cybermail"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-full border border-white/15 bg-white/[0.03] hover:bg-white/[0.08] backdrop-blur-sm text-ink text-base font-medium transition-colors"
          >
            Get on Android
          </a>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-10 text-xs text-ink-mute font-mono uppercase tracking-wider"
        >
          Free tier · No credit card · Cancel paid plans anytime
        </motion.p>
      </div>
    </section>
  );
}
