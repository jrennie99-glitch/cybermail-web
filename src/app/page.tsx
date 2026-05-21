/**
 * CyberMail marketing landing page.
 * Deployed at cybrmail.net (root).
 *
 * Goal: convert visitor → App Store download.
 * Must communicate the pitch in ~5 seconds of skimming.
 */
import Link from "next/link";

export default function Landing() {
  return (
    <main>
      {/* Top nav */}
      <nav style={styles.nav}>
        <div style={styles.brand}>
          <span style={styles.brandIcon}>{"⚡"}</span>
          <span style={styles.brandText}>CYBERMAIL</span>
        </div>
        <div style={styles.navLinks}>
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <a href="#brain">Brain</a>
          <Link href="/app" style={styles.signInBtn}>Sign in</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={styles.hero}>
        <div style={styles.heroLabel}>EMAIL FOR THE WEB3 GENERATION</div>
        <h1 style={styles.heroTitle}>
          The first email with a <span style={styles.heroAccent}>local-first AI brain</span>.
        </h1>
        <p style={styles.heroSub}>
          Token-gated mailboxes. Self-destructing messages. Wallet sign-in.
          Auto-tracked promises. Your knowledge graph builds itself.
          <strong style={{ color: "var(--text)" }}>
            {" "}Your email never leaves the server.
          </strong>
        </p>
        <div style={styles.heroCta}>
          <a
            href="https://apps.apple.com/app/cybermail"
            target="_blank"
            rel="noopener"
            style={{ ...styles.btnPrimary, fontSize: 18 }}
          >
            Get on iOS
          </a>
          <Link href="/app" style={styles.btnSecondary}>
            Open in browser
          </Link>
        </div>
        <div style={styles.heroSocialProof}>
          🛡️ End-to-end encryption · 💀 Self-destructing email · 🔗 Web3 native
        </div>
      </section>

      {/* The "what makes us different" grid */}
      <section id="features" style={styles.features}>
        <h2 style={styles.sectionTitle}>What no other email app has</h2>

        <div style={styles.featureGrid}>
          <FeatureCard
            icon="🧠"
            title="Local-first AI brain"
            text="Knowledge graph, promise tracker, decision log — all in-process. Your email never touches OpenAI or Anthropic."
          />
          <FeatureCard
            icon="💀"
            title="Self-destructing email"
            text="Send view-once or time-bombed messages. The body wipes from our server when it expires."
          />
          <FeatureCard
            icon="🛡️"
            title="Anti-AI spam shield"
            text="Detects LLM-generated cold pitches via 12 heuristic signals. Auto-quarantines the slop."
          />
          <FeatureCard
            icon="🎟️"
            title="Token-gated mailboxes"
            text="Restrict your inbox to wallets holding a specific NFT. On-chain check across 5 chains."
          />
          <FeatureCard
            icon="🎭"
            title="Burner addresses"
            text="One-tap throwaway aliases. Kill the burner when spam starts. Your real address stays clean."
          />
          <FeatureCard
            icon="📅"
            title="Email-native calendar"
            text="Mentions of meetings in your inbox become calendar suggestions automatically. CalDAV ready."
          />
          <FeatureCard
            icon="🧘"
            title="Wellbeing built in"
            text="Quiet hours auto-lock the inbox at night. Inbox health score with coaching. One-tap unsubscribe."
          />
          <FeatureCard
            icon="🔐"
            title="Argon2id passwords"
            text="GPU-resistant hashing, account lockout, server-side JWT revocation. Your account is fortress-grade."
          />
          <FeatureCard
            icon="🔗"
            title="Sign in with wallet"
            text="SIWE + ENS / Unstoppable Domain resolution. Your wallet is your identity."
          />
        </div>
      </section>

      {/* Brain spotlight */}
      <section id="brain" style={styles.brainSection}>
        <div style={styles.brainContent}>
          <div style={styles.brainLabel}>THE BRAIN</div>
          <h2 style={styles.sectionTitle}>It remembers the gist. Drops the words.</h2>
          <p style={styles.brainText}>
            Traditional email stores every word you ever received. CyberBrain
            reads, extracts entities, builds a knowledge graph, and after 30
            days <strong>drops the raw text</strong> — keeping only the facts
            worth remembering. A 10-year-old inbox uses the same disk as a
            fresh one.
          </p>
          <ul style={styles.brainList}>
            <li>✅ Auto-extracted promise tracker — never miss a commitment</li>
            <li>✅ Decision log — what you agreed to, when, with whom</li>
            <li>✅ Knowledge graph — Obsidian-style backlinks across email</li>
            <li>✅ TextRank summary on every message</li>
            <li>✅ Ask CyberBrain — natural-language search over your inbox</li>
            <li>✅ $0/month, $0/email, no third-party AI ever reads your mail</li>
          </ul>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={styles.pricing}>
        <h2 style={styles.sectionTitle}>Free while we&apos;re in early access.</h2>
        <div style={styles.pricingGrid}>
          <PricingCard
            name="Free"
            price="$0"
            features={[
              "@cybrmail.net address",
              "Local-first AI brain",
              "Burner addresses",
              "Self-destructing messages",
              "Calendar + Wellbeing suite",
              "E2E encryption",
            ]}
            highlight
          />
        </div>
        <p style={styles.pricingFooter}>
          Every feature is free today — no subscriptions, no in-app purchases.
        </p>
      </section>

      {/* Final CTA */}
      <section style={styles.finalCta}>
        <h2 style={styles.sectionTitle}>Email is broken. We fixed it.</h2>
        <div style={styles.heroCta}>
          <a
            href="https://apps.apple.com/app/cybermail"
            target="_blank"
            rel="noopener"
            style={{ ...styles.btnPrimary, fontSize: 18 }}
          >
            Download for iOS
          </a>
          <Link href="/app" style={styles.btnSecondary}>
            Use in browser
          </Link>
        </div>
      </section>

      <footer style={styles.footer}>
        <div>© 2026 AR Dynamics · CyberMail · cybrmail.net</div>
        <div style={styles.footerLinks}>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <a href="mailto:hello@cybrmail.net">hello@cybrmail.net</a>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({ icon, title, text }: { icon: string; title: string; text: string }) {
  return (
    <div style={styles.featureCard}>
      <div style={styles.featureIcon}>{icon}</div>
      <h3 style={styles.featureTitle}>{title}</h3>
      <p style={styles.featureText}>{text}</p>
    </div>
  );
}

function PricingCard({
  name,
  price,
  features,
  highlight,
}: {
  name: string;
  price: string;
  features: string[];
  highlight?: boolean;
}) {
  return (
    <div style={{ ...styles.pricingCard, ...(highlight ? styles.pricingCardHighlight : {}) }}>
      {highlight && <div style={styles.popularBadge}>MOST POPULAR</div>}
      <h3 style={styles.pricingName}>{name}</h3>
      <div style={styles.pricingPrice}>
        {price}
        <span style={styles.pricingPriceSuffix}>/mo</span>
      </div>
      <ul style={styles.pricingFeatures}>
        {features.map((f) => (
          <li key={f}>{f}</li>
        ))}
      </ul>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 32px",
    borderBottom: "1px solid var(--border)",
    position: "sticky",
    top: 0,
    background: "rgba(10, 14, 23, 0.95)",
    backdropFilter: "blur(20px)",
    zIndex: 10,
  },
  brand: { display: "flex", alignItems: "center", gap: 8 },
  brandIcon: { fontSize: 24 },
  brandText: { fontWeight: 900, letterSpacing: 3, fontSize: 16, color: "var(--primary)" },
  navLinks: { display: "flex", alignItems: "center", gap: 32 },
  signInBtn: {
    background: "var(--primary)",
    color: "var(--bg)",
    padding: "10px 20px",
    borderRadius: 10,
    fontWeight: 700,
  },

  hero: { padding: "100px 32px 80px", textAlign: "center", maxWidth: 960, margin: "0 auto" },
  heroLabel: {
    color: "var(--primary)",
    letterSpacing: 3,
    fontWeight: 800,
    fontSize: 12,
    marginBottom: 24,
  },
  heroTitle: {
    fontSize: 64,
    lineHeight: 1.1,
    fontWeight: 900,
    marginBottom: 24,
    letterSpacing: -1,
  },
  heroAccent: { color: "var(--primary)" },
  heroSub: {
    fontSize: 19,
    color: "var(--text-secondary)",
    maxWidth: 720,
    margin: "0 auto 40px",
    lineHeight: 1.6,
  },
  heroCta: { display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" },
  heroSocialProof: {
    marginTop: 40,
    color: "var(--text-muted)",
    fontSize: 13,
  },

  features: { padding: "100px 32px", maxWidth: 1200, margin: "0 auto" },
  sectionTitle: {
    fontSize: 40,
    fontWeight: 900,
    textAlign: "center",
    marginBottom: 48,
    letterSpacing: -0.5,
  },
  featureGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: 20,
  },
  featureCard: {
    background: "var(--bg-card)",
    padding: 28,
    borderRadius: 16,
    border: "1px solid var(--border)",
  },
  featureIcon: { fontSize: 32, marginBottom: 12 },
  featureTitle: { fontSize: 18, fontWeight: 700, marginBottom: 8 },
  featureText: { color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.5 },

  brainSection: {
    padding: "100px 32px",
    background: "var(--bg-card)",
    borderTop: "1px solid var(--border)",
    borderBottom: "1px solid var(--border)",
  },
  brainContent: { maxWidth: 760, margin: "0 auto" },
  brainLabel: {
    color: "var(--accent)",
    letterSpacing: 3,
    fontWeight: 800,
    fontSize: 12,
    marginBottom: 16,
    textAlign: "center",
  },
  brainText: {
    fontSize: 17,
    color: "var(--text-secondary)",
    lineHeight: 1.7,
    marginBottom: 32,
    textAlign: "center",
  },
  brainList: { listStyle: "none", padding: 0, fontSize: 15, lineHeight: 2.2 },

  pricing: { padding: "100px 32px", maxWidth: 1200, margin: "0 auto" },
  pricingGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 16,
  },
  pricingCard: {
    background: "var(--bg-card)",
    padding: 24,
    borderRadius: 16,
    border: "1px solid var(--border)",
    position: "relative",
  },
  pricingCardHighlight: { borderColor: "var(--primary)", borderWidth: 2 },
  popularBadge: {
    position: "absolute",
    top: -10,
    right: 16,
    background: "var(--primary)",
    color: "var(--bg)",
    padding: "4px 10px",
    borderRadius: 8,
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: 1,
  },
  pricingName: { fontSize: 20, fontWeight: 700, marginBottom: 4 },
  pricingPrice: { fontSize: 36, fontWeight: 900, color: "var(--primary)", marginBottom: 16 },
  pricingPriceSuffix: { fontSize: 14, color: "var(--text-muted)", fontWeight: 500 },
  pricingFeatures: {
    listStyle: "none",
    padding: 0,
    fontSize: 14,
    lineHeight: 2.1,
    color: "var(--text-secondary)",
  },
  pricingFooter: { textAlign: "center", color: "var(--text-muted)", fontSize: 12, marginTop: 32 },

  finalCta: { padding: "100px 32px", textAlign: "center" },

  btnPrimary: {
    background: "var(--primary)",
    color: "var(--bg)",
    padding: "16px 32px",
    borderRadius: 12,
    fontWeight: 700,
    textDecoration: "none",
    display: "inline-block",
  },
  btnSecondary: {
    background: "var(--bg-card)",
    border: "1px solid var(--border)",
    color: "var(--text-secondary)",
    padding: "16px 32px",
    borderRadius: 12,
    fontWeight: 600,
    textDecoration: "none",
    display: "inline-block",
  },

  footer: {
    padding: "32px",
    borderTop: "1px solid var(--border)",
    color: "var(--text-muted)",
    fontSize: 12,
    display: "flex",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 16,
  },
  footerLinks: { display: "flex", gap: 24 },
};
