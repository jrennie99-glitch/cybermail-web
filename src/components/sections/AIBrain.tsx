"use client";

import { motion } from "framer-motion";

export default function AIBrain() {
  return (
    <section id="brain" className="relative py-32 lg:py-44 overflow-hidden">
      {/* Background tint */}
      <div className="absolute inset-0 bg-gradient-to-b from-bg via-bg-elev/40 to-bg pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-10 grid lg:grid-cols-2 gap-16 items-center">
        {/* Left — copy */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="text-xs font-mono uppercase tracking-[0.2em] text-cyber-cyan/80 mb-5">
            // The brain
          </div>
          <h2 className="font-display font-bold tracking-tight text-4xl sm:text-5xl lg:text-6xl leading-[1.05]">
            Your inbox{" "}
            <span className="text-gradient-cyber">knows your life</span>
            . Locally.
          </h2>
          <p className="mt-6 text-lg text-ink-dim leading-relaxed">
            Promises you've made. Decisions still pending. The thread where someone
            said yes. The bills you actually owe. The brain reads every message
            once, builds a knowledge graph, and surfaces what matters — running
            on Apple Foundation Models on-device, or free open-source LLMs.
          </p>

          <div className="mt-10 grid grid-cols-2 gap-y-5 gap-x-8 text-sm">
            {[
              ["Promise tracker", "Surfaces commitments you forgot you made"],
              ["Decision log", "What you decided, when, and the thread it came from"],
              ["Smart reply", "Suggestions in your voice, not LLM-corporate"],
              ["Voice mode", "Talk to your inbox like ChatGPT voice"],
            ].map(([t, c]) => (
              <div key={t}>
                <div className="text-cyber-cyan text-xs font-mono uppercase tracking-wider mb-1.5">
                  {t}
                </div>
                <div className="text-ink-dim leading-relaxed">{c}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right — terminal demo */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          {/* Halo */}
          <div className="absolute inset-0 m-auto h-[80%] w-[80%] rounded-full bg-cyber-violet/20 blur-[100px] pointer-events-none" />

          <div className="relative glass rounded-2xl p-1 border-glow">
            {/* macOS-window header */}
            <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/5">
              <div className="h-3 w-3 rounded-full bg-red-400/70" />
              <div className="h-3 w-3 rounded-full bg-yellow-400/70" />
              <div className="h-3 w-3 rounded-full bg-green-400/70" />
              <div className="ml-4 text-xs font-mono text-ink-mute">
                brain · 04:21 PST
              </div>
            </div>

            <div className="p-6 font-mono text-[13px] leading-relaxed">
              <div className="text-cyber-cyan">$ cybrmail brain ask</div>
              <div className="text-ink-dim mt-3">
                &gt; what did I promise alex last week?
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="mt-5 pl-3 border-l-2 border-cyber-cyan/40 text-ink"
              >
                <div className="text-cyber-cyan text-xs uppercase tracking-wider mb-2">
                  3 commitments
                </div>
                <ul className="space-y-2.5 text-ink-dim">
                  <li>
                    <span className="text-ink">Mon 5/19</span> — sending Q3
                    deck by Friday
                  </li>
                  <li>
                    <span className="text-ink">Tue 5/20</span> — intro to
                    Sarah at Stripe
                  </li>
                  <li>
                    <span className="text-ink">Wed 5/21</span> — review the
                    contract draft
                  </li>
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 1.2, duration: 0.5 }}
                className="mt-5 text-xs text-ink-mute"
              >
                ↑ ran in 240ms on-device · 0 tokens sent off the device
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 1.6, duration: 0.4 }}
                className="mt-6 inline-flex items-center text-cyber-cyan"
              >
                <span>$</span>
                <span className="ml-2 inline-block w-2 h-4 bg-cyber-cyan animate-pulse" />
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
