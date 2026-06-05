"use client";

import { motion } from "framer-motion";

type Feature = {
  title: string;
  copy: string;
  icon: React.ReactNode;
};

const features: Feature[] = [
  {
    title: "End-to-end encryption",
    copy: "Libsodium under the hood. Even we can't read your mail. Keys never leave your device.",
    icon: <IconLock />,
  },
  {
    title: "On-device AI brain",
    copy: "Knowledge graph, promise tracker, decision log — runs locally. Your inbox never touches OpenAI or Anthropic unless you choose.",
    icon: <IconBrain />,
  },
  {
    title: "Wallet identity",
    copy: "Sign in with Ethereum, Apple, or password. No tracking pixel. No data sale. No marketing list.",
    icon: <IconWallet />,
  },
  {
    title: "Digital postal mail",
    copy: "Get a real US street address. Physical mail is photographed, OCR'd, and dropped into your inbox.",
    icon: <IconPostal />,
  },
  {
    title: "Anti-phishing shield",
    copy: "Detects LLM-written cold pitches via 12 heuristic signals. Auto-quarantines the slop before it loads.",
    icon: <IconShield />,
  },
  {
    title: "Self-destructing email",
    copy: "Send view-once or time-bombed messages. The body wipes from our server when it expires.",
    icon: <IconBurn />,
  },
];

export default function Features() {
  return (
    <section id="features" className="relative py-32 lg:py-44">
      <div className="absolute inset-0 bg-grid opacity-25 pointer-events-none" />
      <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-3xl"
        >
          <div className="text-xs font-mono uppercase tracking-[0.2em] text-cyber-cyan/80 mb-5">
            // Everything in one inbox
          </div>
          <h2 className="font-display font-bold tracking-tight text-4xl sm:text-5xl lg:text-6xl leading-[1.05]">
            Six pillars no other{" "}
            <span className="text-gradient-cyber">email app</span> ships together.
          </h2>
          <p className="mt-6 text-lg text-ink-dim leading-relaxed">
            Stop stitching Gmail + 1Password + a VPN + a wallet + a virtual
            mailbox. Cybrmail is all of it, end-to-end encrypted, with an AI
            brain that knows your life.
          </p>
        </motion.div>

        <div className="mt-20 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{
                duration: 0.7,
                delay: (i % 3) * 0.08,
                ease: [0.16, 1, 0.3, 1],
              }}
              whileHover={{ y: -4 }}
              className="glass rounded-2xl p-7 group relative overflow-hidden"
            >
              {/* Hover gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyber-cyan/0 via-cyber-cyan/0 to-cyber-cyan/8 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-cyber-cyan/10 border border-cyber-cyan/25 text-cyber-cyan mb-6 group-hover:bg-cyber-cyan/20 transition-colors">
                  {f.icon}
                </div>
                <h3 className="font-display font-semibold text-xl mb-3 tracking-tight">
                  {f.title}
                </h3>
                <p className="text-ink-dim leading-relaxed text-[15px]">
                  {f.copy}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Inline SVG icons (sharper than any icon lib at small sizes) ── */
function IconLock() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="10" width="16" height="11" rx="2.5" stroke="currentColor" strokeWidth="1.7" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="12" cy="15.5" r="1.4" fill="currentColor" />
    </svg>
  );
}
function IconBrain() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M9 6a3 3 0 0 0-3 3v.4A3 3 0 0 0 4.5 12 3 3 0 0 0 6 14.6V15a3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3 0Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/>
      <path d="M15 6a3 3 0 0 1 3 3v.4a3 3 0 0 1 1.5 2.6 3 3 0 0 1-1.5 2.6V15a3 3 0 0 1-3 3 3 3 0 0 1-3-3V6a3 3 0 0 1 3 0Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/>
    </svg>
  );
}
function IconWallet() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="7" width="18" height="12" rx="2.5" stroke="currentColor" strokeWidth="1.7" />
      <path d="M3 10h18" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="17" cy="14.5" r="1.4" fill="currentColor" />
    </svg>
  );
}
function IconPostal() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="6" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <path d="M3 8l9 6 9-6" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/>
    </svg>
  );
}
function IconShield() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M12 3l8 3v5c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6l8-3Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/>
      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function IconBurn() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M12 3c2.5 4 6 5 6 9a6 6 0 0 1-12 0c0-2 1-3 2-4 0 1.5 1 2 2 2 0-3-1-4 2-7Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/>
    </svg>
  );
}
