"use client";

import { motion } from "framer-motion";
import { useState } from "react";

type Tier = {
  name: string;
  price: string;
  per: string;
  best?: boolean;
  features: string[];
  cta: string;
};

const tiers: Tier[] = [
  {
    name: "Free",
    price: "$0",
    per: "forever",
    features: [
      "Unlimited mail send/receive",
      "Wallet + Apple sign-in",
      "AI brain on free LLMs (Groq, OpenRouter)",
      "1 GB storage",
      "Burner addresses",
      "Phishing detection",
    ],
    cta: "Start free",
  },
  {
    name: "Verified",
    price: "$4.99",
    per: "/month",
    features: [
      "Everything in Free",
      "Verified wallet badge",
      "10 GB storage",
      "5 burner addresses",
      "Priority delivery",
    ],
    cta: "Go Verified",
  },
  {
    name: "Pro",
    price: "$8.99",
    per: "/month",
    best: true,
    features: [
      "Everything in Verified",
      "Always-on AI brain (proactive)",
      "Voice mode — talk to inbox",
      "Unlimited notes + knowledge graph",
      "View-once messages",
      "25 GB storage",
    ],
    cta: "Go Pro",
  },
  {
    name: "Privacy+",
    price: "$18.99",
    per: "/month",
    features: [
      "Everything in Pro",
      "Wallet-to-wallet XMTP messaging",
      "Real US digital postal address",
      "Bring-your-own-key (Anthropic / OpenAI / Google)",
      "Unlimited burners",
      "Custom domain",
      "100 GB storage",
    ],
    cta: "Go Privacy+",
  },
];

export default function Pricing() {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <section id="pricing" className="relative py-32 lg:py-44">
      <div className="absolute inset-0 bg-grid opacity-25 pointer-events-none" />
      <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-3xl mx-auto"
        >
          <div className="text-xs font-mono uppercase tracking-[0.2em] text-cyber-cyan/80 mb-5">
            // Pricing that adds up
          </div>
          <h2 className="font-display font-bold tracking-tight text-4xl sm:text-5xl lg:text-6xl leading-[1.05]">
            One app replaces <span className="text-gradient-cyber">≈$24/mo</span> of subscriptions
          </h2>
          <p className="mt-6 text-lg text-ink-dim">
            Gmail Workspace · 1Password · ProtonMail · a VPN · a virtual mailbox.
            Stack them, you're at ~$63/mo. Cybrmail does it for $18.99.
          </p>
        </motion.div>

        <div className="mt-20 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {tiers.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.7, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              className={`relative rounded-2xl p-7 transition-all duration-500 ${
                t.best
                  ? "glass border-glow scale-[1.03]"
                  : "glass"
              }`}
            >
              {t.best && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-cyber-cyan text-bg text-[10px] font-mono uppercase tracking-wider font-semibold">
                  Most popular
                </div>
              )}
              <div className="font-mono text-xs uppercase tracking-wider text-cyber-cyan/80 mb-2">
                {t.name}
              </div>
              <div className="flex items-baseline gap-1.5 mb-6">
                <span className="font-display text-4xl font-bold tracking-tight">{t.price}</span>
                <span className="text-ink-dim text-sm">{t.per}</span>
              </div>
              <ul className="space-y-2.5 text-sm text-ink-dim mb-7">
                {t.features.map((f) => (
                  <li key={f} className="flex gap-2.5">
                    <span className="text-cyber-cyan mt-0.5 shrink-0">✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <a
                href="https://apps.apple.com/app/cybrmail"
                className={`block text-center py-2.5 rounded-full text-sm font-semibold transition-colors ${
                  t.best
                    ? "bg-cyber-cyan text-bg hover:opacity-90"
                    : "border border-white/15 text-ink hover:bg-white/5"
                }`}
              >
                {t.cta}
              </a>
            </motion.div>
          ))}
        </div>

        <p className="text-center text-xs text-ink-mute font-mono mt-12 uppercase tracking-wider">
          Auto-renews monthly · Cancel anytime · Business plan $49.99/user/mo for teams
        </p>
      </div>
    </section>
  );
}
