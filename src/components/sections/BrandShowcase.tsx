"use client";

/**
 * Cinematic brand showcase — IMG_7959 (C + envelope) takes the full
 * viewport with parallax + overlay copy. The "what is Cybrmail" moment.
 */
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";

export default function BrandShowcase() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-20%", "20%"]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.1, 1, 1.1]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

  return (
    <section
      ref={ref}
      className="relative min-h-screen w-full overflow-hidden flex items-center justify-center"
    >
      {/* Massive parallax brand image as background */}
      <motion.div
        style={{ y, scale }}
        className="absolute inset-0 z-0"
      >
        <div className="absolute inset-0 bg-cyber-cyan/8 blur-3xl" />
        <Image
          src="/brand-mark.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-90"
          aria-hidden
        />
        {/* Dark overlay so text is legible */}
        <div className="absolute inset-0 bg-gradient-to-r from-bg via-bg/40 to-bg/10" />
        <div className="absolute inset-0 bg-gradient-to-b from-bg/60 via-transparent to-bg" />
      </motion.div>

      {/* Foreground copy */}
      <motion.div
        style={{ opacity }}
        className="relative z-10 mx-auto max-w-7xl px-6 lg:px-10 w-full"
      >
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-150px" }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="text-xs font-mono uppercase tracking-[0.3em] text-cyber-cyan mb-7"
          >
            // Built different
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-150px" }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="font-display font-bold tracking-tight text-6xl sm:text-7xl lg:text-[6.5rem] leading-[0.92]"
          >
            Not another{" "}
            <span className="line-through opacity-40 font-light">Gmail</span>
            <br />
            <span className="text-gradient-cyber">clone.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-150px" }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="mt-10 text-xl lg:text-2xl text-ink-dim leading-relaxed font-light max-w-xl"
          >
            Email hasn't changed since 1971. We rebuilt it from the protocol up
            — with cryptography on by default, an AI brain in your pocket, and
            a postal address that lives inside the same inbox.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-150px" }}
            transition={{ duration: 0.9, delay: 0.35 }}
            className="mt-12 grid grid-cols-3 gap-8 max-w-md"
          >
            <Stat number="0" label="trackers" />
            <Stat number="100%" label="encrypted" />
            <Stat number="Free" label="to start" />
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

function Stat({ number, label }: { number: string; label: string }) {
  return (
    <div>
      <div className="font-display text-4xl lg:text-5xl font-bold text-cyber-cyan tracking-tight">
        {number}
      </div>
      <div className="text-xs font-mono uppercase tracking-wider text-ink-dim mt-1.5">
        {label}
      </div>
    </div>
  );
}
