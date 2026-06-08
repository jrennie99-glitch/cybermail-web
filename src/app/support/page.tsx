/**
 * Support page — required by Apple App Store.
 * Source of truth: cybermail-app/app-store/support.md
 *
 * Renders at https://cybrmail.net/support
 */
import Link from "next/link";

export const metadata = {
  title: "Support — CyberMail",
  description:
    "Get help with your CyberMail account, report bugs, request features, or contact our team.",
};

export default function Support() {
  return (
    <main style={styles.page}>
      <nav style={styles.nav}>
        <Link href="/" style={styles.brand}>
          <span style={styles.brandIcon}>⚡</span>
          <span style={styles.brandText}>CYBERMAIL</span>
        </Link>
        <Link href="/privacy" style={styles.navLink}>
          Privacy
        </Link>
      </nav>

      <article style={styles.article}>
        <div style={styles.eyebrow}>HELP</div>
        <h1 style={styles.h1}>Support</h1>
        <p style={styles.lead}>
          We&apos;re a small team and we read every message. Pick the fastest
          path for what you need.
        </p>

        <section style={styles.contactGrid}>
          <a href="mailto:jrennie99@gmail.com" style={styles.contactCard}>
            <div style={styles.cardLabel}>ACCOUNT + BILLING</div>
            <div style={styles.cardEmail}>jrennie99@gmail.com</div>
            <div style={styles.cardSub}>Typically respond within 2-24 hours</div>
          </a>
          <a href="mailto:jrennie99@gmail.com" style={styles.contactCard}>
            <div style={styles.cardLabel}>FEATURE REQUESTS</div>
            <div style={styles.cardEmail}>jrennie99@gmail.com</div>
            <div style={styles.cardSub}>Send us the use case, not just the ask</div>
          </a>
          <a href="mailto:jrennie99@gmail.com" style={styles.contactCard}>
            <div style={styles.cardLabel}>SECURITY DISCLOSURE</div>
            <div style={styles.cardEmail}>jrennie99@gmail.com</div>
            <div style={styles.cardSub}>24-hour response. Acknowledged publicly.</div>
          </a>
          <a href="mailto:jrennie99@gmail.com" style={styles.contactCard}>
            <div style={styles.cardLabel}>PRIVACY + DATA</div>
            <div style={styles.cardEmail}>jrennie99@gmail.com</div>
            <div style={styles.cardSub}>Export your data, delete your account</div>
          </a>
        </section>

        <h2 style={styles.h2}>Quick answers</h2>

        <div style={styles.faq}>
          <h3 style={styles.faqQ}>Why does the brain work without an LLM?</h3>
          <p style={styles.faqA}>
            Because our knowledge-graph extraction runs entirely on our server with
            no LLM dependency. compromise.js + chrono-node + regex + Postgres FTS
            do the work. Smart, fast, free, private. If you want LLM-synthesized
            answers, plug in your own API key (Settings → Brain → API Keys).
          </p>
        </div>

        <div style={styles.faq}>
          <h3 style={styles.faqQ}>Where are servers located?</h3>
          <p style={styles.faqA}>
            Hetzner Cloud, Germany (Falkenstein and Helsinki regions). All data stays in the EU/US.
          </p>
        </div>

        <div style={styles.faq}>
          <h3 style={styles.faqQ}>Will you ever sell ads?</h3>
          <p style={styles.faqA}>
            No. We don&apos;t sell ads and we never will. If our funding model
            ever changes, we&apos;ll tell you 60 days in advance and give you a
            one-click data export and account deletion.
          </p>
        </div>

        <div style={styles.faq}>
          <h3 style={styles.faqQ}>Can I email people on Gmail / Outlook?</h3>
          <p style={styles.faqA}>
            Yes. Outbound to external addresses is delivered by Resend with SPF and
            DKIM signing. Receiving from external senders requires our Postfix mail
            server (rolling out — check{" "}
            <a href="/" style={styles.a}>
              cybrmail.net
            </a>{" "}
            for status).
          </p>
        </div>

        <div style={styles.faq}>
          <h3 style={styles.faqQ}>Can I subscribe to my calendar in Apple Calendar?</h3>
          <p style={styles.faqA}>
            Yes. In the iOS app: Settings → Calendar → Subscribe URL. Paste into
            Apple Calendar → File → New Calendar Subscription. Events sync
            automatically.
          </p>
        </div>

        <div style={styles.faq}>
          <h3 style={styles.faqQ}>What&apos;s agent-to-agent direct delivery?</h3>
          <p style={styles.faqA}>
            When you send from your @cybrmail.net address to another @cybrmail.net
            user, we skip the round-trip through Resend / SMTP / Postfix and write
            the message straight into the recipient&apos;s inbox. Instant. Free. Never
            leaves our server.
          </p>
        </div>

        <h2 style={styles.h2}>Pricing &amp; account</h2>
        <div style={styles.faq}>
          <h3 style={styles.faqQ}>Is CyberMail free?</h3>
          <p style={styles.faqA}>
            Yes. CyberMail is currently free — no subscriptions and no in-app
            purchases. Every feature is available to all users at no cost.
          </p>
        </div>

        <div style={styles.faq}>
          <h3 style={styles.faqQ}>How do I delete my account?</h3>
          <p style={styles.faqA}>
            In the iOS app: <strong>Settings → Delete Account</strong>. Confirm
            with your password. Your account, all inboxes, messages, contacts,
            burner addresses, and encryption keys are permanently deleted within
            30 seconds. This is irreversible.
          </p>
        </div>

        <h2 style={styles.h2}>Bug reports</h2>
        <p style={styles.p}>
          Two ways:{" "}
          <strong>In-app</strong> — Settings → Send Feedback → describe what
          went wrong. Device logs attach automatically with your permission.{" "}
          <strong>Email</strong> —{" "}
          <a href="mailto:jrennie99@gmail.com" style={styles.a}>
            jrennie99@gmail.com
          </a>{" "}
          with your iOS version, app version (Settings → About), and what you
          were doing when it broke.
        </p>

        <p style={styles.signoff}>
          CyberMail is built by <strong>AR Dynamics Inc</strong>. Made with code
          that doesn&apos;t suck.
        </p>
      </article>

      <footer style={styles.footer}>
        <Link href="/" style={styles.footerLink}>
          ← Back to cybrmail.net
        </Link>
      </footer>
    </main>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "var(--bg)",
    color: "var(--text)",
    fontFamily: "var(--font-sans)",
  } as const,
  nav: {
    maxWidth: 760,
    margin: "0 auto",
    padding: "28px 24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  } as const,
  brand: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    textDecoration: "none",
    color: "inherit",
  } as const,
  brandIcon: { fontSize: 18 } as const,
  brandText: {
    fontSize: 12,
    fontWeight: 800,
    letterSpacing: 2,
    color: "var(--text)",
  } as const,
  navLink: {
    fontSize: 13,
    color: "var(--text-muted)",
    textDecoration: "none",
    fontWeight: 600,
  } as const,
  article: {
    maxWidth: 760,
    margin: "0 auto",
    padding: "24px 24px 60px",
  } as const,
  eyebrow: {
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: 2,
    color: "var(--primary)",
    marginBottom: 8,
  } as const,
  h1: {
    fontSize: 40,
    fontWeight: 800,
    lineHeight: 1.1,
    margin: "0 0 12px",
    color: "var(--text)",
  } as const,
  lead: {
    fontSize: 17,
    color: "var(--text-secondary)",
    lineHeight: 1.6,
    marginTop: 0,
    marginBottom: 32,
  } as const,
  contactGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: 12,
    marginBottom: 48,
  } as const,
  contactCard: {
    background: "var(--bg-card)",
    border: "1px solid var(--border)",
    borderRadius: 12,
    padding: "16px 18px",
    textDecoration: "none",
    color: "inherit",
    display: "block",
  } as const,
  cardLabel: {
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: 1.5,
    color: "var(--primary)",
    marginBottom: 6,
  } as const,
  cardEmail: {
    fontSize: 15,
    fontWeight: 700,
    color: "var(--text)",
    marginBottom: 4,
  } as const,
  cardSub: {
    fontSize: 12,
    color: "var(--text-muted)",
  } as const,
  h2: {
    fontSize: 22,
    fontWeight: 700,
    marginTop: 36,
    marginBottom: 14,
    color: "var(--text)",
  } as const,
  faq: {
    marginBottom: 20,
  } as const,
  faqQ: {
    fontSize: 16,
    fontWeight: 700,
    color: "var(--text)",
    margin: "0 0 6px",
  } as const,
  faqA: {
    fontSize: 14,
    lineHeight: 1.6,
    color: "var(--text-secondary)",
    margin: 0,
  } as const,
  p: {
    fontSize: 15,
    lineHeight: 1.7,
    color: "var(--text-secondary)",
    margin: "0 0 14px",
  } as const,
  a: {
    color: "var(--primary)",
    textDecoration: "underline",
    textUnderlineOffset: 2,
  } as const,
  signoff: {
    fontSize: 14,
    color: "var(--text-muted)",
    marginTop: 48,
    paddingTop: 24,
    borderTop: "1px solid var(--border)",
  } as const,
  footer: {
    maxWidth: 760,
    margin: "0 auto",
    padding: "0 24px 60px",
  } as const,
  footerLink: {
    fontSize: 13,
    color: "var(--primary)",
    textDecoration: "none",
    fontWeight: 600,
  } as const,
};
