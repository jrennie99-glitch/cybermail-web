"use client";

import { motion } from "framer-motion";

export default function WalletAndPostal() {
  return (
    <section className="relative py-32 lg:py-44">
      <div className="mx-auto max-w-7xl px-6 lg:px-10 grid lg:grid-cols-2 gap-6">
        {/* WALLET */}
        <motion.div
          id="wallet"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="glass rounded-3xl p-10 relative overflow-hidden group"
        >
          <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-cyber-cyan/10 blur-3xl group-hover:bg-cyber-cyan/15 transition-colors duration-700" />
          <div className="relative">
            <div className="text-xs font-mono uppercase tracking-[0.2em] text-cyber-cyan/80 mb-5">
              // Wallet identity
            </div>
            <h3 className="font-display font-bold tracking-tight text-3xl lg:text-4xl leading-[1.1]">
              Sign in with your wallet.{" "}
              <span className="text-gradient-cyber">No password to lose.</span>
            </h3>
            <p className="mt-5 text-ink-dim leading-relaxed">
              500+ wallets via WalletConnect, or Sign-In with Ethereum. We never
              touch your keys, your seed, or your gas — wallet is auth-only. No
              transactions. No swaps. No marketing list.
            </p>
            <ul className="mt-7 space-y-3 text-sm text-ink-dim">
              <Item>SIWE / WalletConnect / Sign in with Apple</Item>
              <Item>Wallet-to-wallet encrypted DMs via XMTP (Privacy+)</Item>
              <Item>Token-gated inbox rules — only NFT holders write</Item>
              <Item>Verified wallet badge on outgoing mail</Item>
            </ul>
          </div>
        </motion.div>

        {/* POSTAL */}
        <motion.div
          id="postal"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="glass rounded-3xl p-10 relative overflow-hidden group"
        >
          <div className="absolute -top-20 -left-20 h-60 w-60 rounded-full bg-cyber-violet/10 blur-3xl group-hover:bg-cyber-violet/15 transition-colors duration-700" />
          <div className="relative">
            <div className="text-xs font-mono uppercase tracking-[0.2em] text-cyber-violet/90 mb-5">
              // Digital postal service
            </div>
            <h3 className="font-display font-bold tracking-tight text-3xl lg:text-4xl leading-[1.1]">
              A real US address.{" "}
              <span className="text-gradient-cyber">Inside your inbox.</span>
            </h3>
            <p className="mt-5 text-ink-dim leading-relaxed">
              Get a physical US street address. Your mail is photographed,
              OCR'd, and dropped into your inbox the same day. Forward the
              important pieces, shred the rest — all from your phone.
            </p>
            <ul className="mt-7 space-y-3 text-sm text-ink-dim">
              <Item>Real USPS-routable address (not a PO box)</Item>
              <Item>Mail photo + OCR within 24 hours of arrival</Item>
              <Item>Forward, scan-inside, or shred in one tap</Item>
              <Item>Auto-pulled into the Brain — your bills tracked</Item>
            </ul>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Item({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-3 leading-relaxed">
      <span className="text-cyber-cyan mt-1 shrink-0 text-xs">▸</span>
      <span>{children}</span>
    </li>
  );
}
