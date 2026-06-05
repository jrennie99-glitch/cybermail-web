"use client";

/**
 * Full-bleed cinematic moment — IMG_7960 (pure C with purple gradient)
 * as a massive immersive backdrop with overlaid headline. Pause moment
 * between sections.
 */
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";

export default function Immersive() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["15%", "-15%"]);
  const rot = useTransform(scrollYProgress, [0, 1], [-3, 3]);

  return (
    <section
      ref={ref}
      className="relative min-h-[100vh] w-full overflow-hidden flex items-center justify-center"
    >
      {/* Background image — massive, slowly rotating + drifting */}
      <motion.div
        style={{ y, rotate: rot }}
        className="absolute inset-0 z-0 scale-110"
      >
        <Image
          src="/brand-splash.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-95"
          aria-hidden
        />
        {/* Deep vignette + tint */}
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-bg/60 to-bg" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-bg/70" />
      </motion.div>

      {/* Overlay copy — centered, large */}
      <div className="relative z-10 mx-auto max-w-4xl px-6 lg:px-10 text-center">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1 }}
          className="text-xs font-mono uppercase tracking-[0.4em] text-cyber-cyan/80 mb-8"
        >
          // Your data, your keys, your inbox
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="font-display font-bold tracking-tight text-[3.75rem] sm:text-7xl lg:text-[6.5rem] leading-[0.95]"
        >
          We literally{" "}
          <span className="text-gradient-cyber">cannot</span>
          <br />
          read your mail.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, delay: 0.2 }}
          className="mt-10 text-lg lg:text-xl text-ink-dim font-light leading-relaxed max-w-2xl mx-auto"
        >
          Every message is encrypted with libsodium on your device before it
          leaves. The decryption keys live in your secure enclave — never on
          our servers. Subpoena us, we have ciphertext. That's it.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.5 }}
          className="mt-14 flex items-center justify-center gap-6 text-xs text-ink-dim font-mono uppercase tracking-wider"
        >
          <span className="flex items-center gap-2.5">
            <span className="h-1.5 w-1.5 rounded-full bg-cyber-cyan animate-pulse" />
            libsodium · XChaCha20-Poly1305
          </span>
          <span className="hidden sm:inline-flex items-center gap-2.5">
            <span className="h-1.5 w-1.5 rounded-full bg-cyber-violet animate-pulse" />
            Argon2id key derivation
          </span>
        </motion.div>
      </div>
    </section>
  );
}
