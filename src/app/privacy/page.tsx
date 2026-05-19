/**
 * Privacy Policy — required by Apple App Store and most app stores.
 * Source of truth: cybermail-app/app-store/privacy-policy.md
 *
 * Renders at https://cybrmail.net/privacy
 */
import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — CyberMail",
  description:
    "We collect the minimum data needed to give you an email account. We don't sell your data, ever.",
};

export default function PrivacyPolicy() {
  return (
    <main style={styles.page}>
      <nav style={styles.nav}>
        <Link href="/" style={styles.brand}>
          <span style={styles.brandIcon}>⚡</span>
          <span style={styles.brandText}>CYBERMAIL</span>
        </Link>
        <Link href="/support" style={styles.navLink}>
          Support
        </Link>
      </nav>

      <article style={styles.article}>
        <div style={styles.eyebrow}>LEGAL</div>
        <h1 style={styles.h1}>Privacy Policy</h1>
        <p style={styles.meta}>
          Effective May 18, 2026 · Last updated May 18, 2026
        </p>

        <section style={styles.tldr}>
          <strong>TL;DR — </strong>
          We collect the minimum data needed to give you an email account
          and the AI brain features. We do not sell your data, ever. Your
          email contents are encrypted at rest on servers we own in
          Germany. We do not use third-party advertising, analytics, or
          trackers. You can delete your account and all data at any time
          from Settings → Account → Delete Account.
        </section>

        <h2 style={styles.h2}>What we collect</h2>
        <ol style={styles.list}>
          <li>
            <strong>Account info</strong> — email address, password
            (argon2id-hashed), display name. You provide this at signup.
          </li>
          <li>
            <strong>Email contents</strong> — messages you send and
            receive, including subject, body, attachments. Stored
            encrypted at rest in Postgres on Hetzner Cloud (Germany).
          </li>
          <li>
            <strong>Calendar events</strong> — events you create or that
            our brain auto-suggests from your email.
          </li>
          <li>
            <strong>Brain memory</strong> — knowledge graph entities
            (people, organizations, places, dates, amounts) extracted
            from your email locally on our server using compromise.js
            NLP. Linked to your user account.
          </li>
          <li>
            <strong>Settings + preferences</strong> — quiet hours,
            blocklists, subscription tier, etc.
          </li>
          <li>
            <strong>Crash reports</strong> — if you opt in, anonymous
            stack traces sent to Sentry. Default: OFF.
          </li>
        </ol>

        <h2 style={styles.h2}>What we don&apos;t collect</h2>
        <ul style={styles.list}>
          <li>Location data</li>
          <li>Contacts from your phone&apos;s address book</li>
          <li>Photos, camera, or microphone access</li>
          <li>Browsing history</li>
          <li>Cross-site identifiers</li>
          <li>Advertising IDs (IDFA)</li>
          <li>
            Financial information (Apple handles all payments via App
            Store IAP)
          </li>
        </ul>

        <h2 style={styles.h2}>What we don&apos;t do</h2>
        <ul style={styles.list}>
          <li>Sell or rent your data to any third party</li>
          <li>
            Use your data to train machine learning models we don&apos;t
            own
          </li>
          <li>Show advertising</li>
          <li>Track you across other apps or websites</li>
          <li>
            Send your email contents to OpenAI, Google, Anthropic, or
            any LLM unless YOU explicitly enable the optional &quot;AI
            Synthesis&quot; feature (off by default; requires you to
            provide your own API key)
          </li>
        </ul>

        <h2 style={styles.h2}>Who has access</h2>
        <ul style={styles.list}>
          <li>
            <strong>You</strong> — full access via the iOS app and web
            client at app.cybrmail.net
          </li>
          <li>
            <strong>Our infrastructure team</strong> — encrypted-at-rest
            storage. For end-to-end encrypted messages, even we cannot
            read the body. For other messages, access is restricted to
            incident response and logged.
          </li>
          <li>
            <strong>Apple</strong> — only when reviewing the app for App
            Store compliance, using a dedicated test account
          </li>
          <li>
            <strong>Law enforcement</strong> — only with a valid
            subpoena or court order. We will notify you unless legally
            prohibited.
          </li>
        </ul>

        <h2 style={styles.h2}>Data location</h2>
        <p style={styles.p}>
          All servers are in Germany (Hetzner Cloud, Falkenstein /
          Helsinki). Data is NOT transferred outside the EU/US for
          processing.
        </p>

        <h2 style={styles.h2}>Your rights (GDPR + CCPA)</h2>
        <ul style={styles.list}>
          <li>
            <strong>Access</strong> — request a copy of all data we have
            about you (Settings → Account → Export Data)
          </li>
          <li>
            <strong>Rectify</strong> — fix any inaccurate info
          </li>
          <li>
            <strong>Delete</strong> — permanently remove your account
            and all data (Settings → Account → Delete Account). This is
            irreversible.
          </li>
          <li>
            <strong>Portability</strong> — export your email and
            calendar in standard formats (mbox + iCal)
          </li>
          <li>
            <strong>Object</strong> — opt out of crash reporting at any
            time
          </li>
        </ul>
        <p style={styles.p}>
          To exercise any of these rights, use the app&apos;s built-in
          controls or email{" "}
          <a href="mailto:privacy@cybrmail.net" style={styles.a}>
            privacy@cybrmail.net
          </a>
          .
        </p>

        <h2 style={styles.h2}>Children</h2>
        <p style={styles.p}>
          CyberMail is not directed at children under 13 and we do not
          knowingly collect data from them. If you believe a child has
          signed up, email{" "}
          <a href="mailto:privacy@cybrmail.net" style={styles.a}>
            privacy@cybrmail.net
          </a>{" "}
          and we will delete the account immediately.
        </p>

        <h2 style={styles.h2}>Subscriptions, Cancellation &amp; Refunds</h2>
        <p style={styles.p}>
          CyberMail offers three auto-renewing monthly subscriptions —
          Verified ($4.99/mo), Pro ($9.99/mo), Business ($24.99/mo) — sold
          exclusively through the Apple App Store using StoreKit. We do not
          accept payments outside the App Store.
        </p>
        <p style={styles.p}>
          <strong>Auto-renewal:</strong> subscriptions automatically renew at
          the same price unless cancelled at least 24 hours before the end of
          the current period. Your iTunes account is charged within 24 hours
          before each renewal.
        </p>
        <p style={styles.p}>
          <strong>Cancellation:</strong> open the iOS Settings app → tap your
          Apple ID → <strong>Subscriptions</strong> → <strong>CyberMail</strong>{" "}
          → <strong>Cancel Subscription</strong>. Or in the CyberMail app:
          Settings → Subscription → Manage in App Store. Cancellation takes
          effect at the end of the current billing period — your subscription
          remains active until then.
        </p>
        <p style={styles.p}>
          <strong>Refunds:</strong> <strong>all sales are final.</strong>{" "}
          CyberMail does not provide refunds for any portion of a subscription
          period, including unused time after cancellation. All payments are
          processed by Apple, so refund requests must go to Apple at{" "}
          <a href="https://reportaproblem.apple.com/" style={styles.a}>
            reportaproblem.apple.com
          </a>
          . Apple decides refund eligibility at their sole discretion.
          CyberMail cannot override or expedite Apple&apos;s refund decisions.
        </p>
        <p style={styles.p}>
          <strong>Account deletion vs subscription cancellation:</strong>{" "}
          deleting your CyberMail account (Settings → Delete Account) does NOT
          cancel your App Store subscription. Cancel that separately or you
          will continue to be charged.
        </p>

        <h2 style={styles.h2}>Changes</h2>
        <p style={styles.p}>
          If we materially change this policy, we&apos;ll notify you
          in-app at least 30 days before the change takes effect. The
          most current version always lives at{" "}
          <a href="https://cybrmail.net/privacy" style={styles.a}>
            cybrmail.net/privacy
          </a>
          .
        </p>

        <h2 style={styles.h2}>Contact</h2>
        <ul style={styles.list}>
          <li>
            General:{" "}
            <a href="mailto:support@cybrmail.net" style={styles.a}>
              support@cybrmail.net
            </a>
          </li>
          <li>
            Privacy questions:{" "}
            <a href="mailto:privacy@cybrmail.net" style={styles.a}>
              privacy@cybrmail.net
            </a>
          </li>
          <li>
            Security disclosure:{" "}
            <a href="mailto:security@cybrmail.net" style={styles.a}>
              security@cybrmail.net
            </a>
          </li>
        </ul>

        <p style={styles.signoff}>
          CyberMail is operated by <strong>AR Dynamics Inc</strong>.
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
    maxWidth: 720,
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
    maxWidth: 720,
    margin: "0 auto",
    padding: "24px 24px 80px",
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
  meta: {
    fontSize: 13,
    color: "var(--text-muted)",
    margin: "0 0 32px",
  } as const,
  tldr: {
    background: "var(--bg-card)",
    border: "1px solid var(--border)",
    borderLeft: "4px solid var(--primary)",
    padding: "16px 18px",
    borderRadius: 10,
    fontSize: 15,
    lineHeight: 1.6,
    color: "var(--text-secondary)",
    marginBottom: 40,
  } as const,
  h2: {
    fontSize: 22,
    fontWeight: 700,
    marginTop: 36,
    marginBottom: 14,
    color: "var(--text)",
  } as const,
  list: {
    fontSize: 15,
    lineHeight: 1.7,
    color: "var(--text-secondary)",
    paddingLeft: 22,
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
    maxWidth: 720,
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
