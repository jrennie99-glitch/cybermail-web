"use client";
/**
 * /app — the actual web client. Login → Inbox + Brain + Calendar in one page.
 *
 * Shares the same backend as iOS. Free Android support comes for free
 * (just open this URL in any Chrome browser on any platform).
 */
import { useEffect, useState } from "react";
import * as api from "@/lib/api";

type View = "loading" | "login" | "app";

export default function AppPage() {
  const [view, setView] = useState<View>("loading");

  useEffect(() => {
    setView(api.hasToken() ? "app" : "login");
  }, []);

  if (view === "loading") return null;
  if (view === "login") return <Login onLogin={() => setView("app")} />;
  return <Inbox onLogout={() => setView("login")} />;
}

// ─── Login ─────────────────────────────────────────────────────────────
function Login({ onLogin }: { onLogin: () => void }) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    setBusy(true);
    setError("");
    try {
      if (mode === "login") await api.login(email, password);
      else await api.signup(email, password, name || undefined);
      onLogin();
    } catch (err: unknown) {
      setError((err as Error).message ?? "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={loginStyles.wrap}>
      <div style={loginStyles.card}>
        <div style={loginStyles.label}>CYBERMAIL</div>
        <h1 style={loginStyles.title}>{mode === "login" ? "Sign in" : "Create account"}</h1>
        {mode === "signup" && (
          <input style={loginStyles.input} value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name (optional)" />
        )}
        <input
          style={loginStyles.input}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@example.com"
          type="email"
        />
        <input
          style={loginStyles.input}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="password"
          type="password"
        />
        {error && <div style={loginStyles.error}>{error}</div>}
        <button style={loginStyles.btn} onClick={submit} disabled={busy || !email || !password}>
          {busy ? "..." : mode === "login" ? "Sign in" : "Create account"}
        </button>
        <button style={loginStyles.toggle} onClick={() => setMode(mode === "login" ? "signup" : "login")}>
          {mode === "login" ? "No account? Sign up" : "Already have an account?"}
        </button>
      </div>
    </div>
  );
}

// ─── Inbox + Brain + Calendar (3-pane app shell) ──────────────────────
type Tab = "inbox" | "brain" | "calendar";

function Inbox({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState<Tab>("brain");

  async function doLogout() {
    await api.logout();
    onLogout();
  }

  return (
    <div style={appStyles.wrap}>
      <aside style={appStyles.side}>
        <div style={appStyles.brand}>
          <span style={appStyles.brandIcon}>{"⚡"}</span>
          <span style={appStyles.brandText}>CYBERMAIL</span>
        </div>
        <nav style={appStyles.nav}>
          <TabBtn label="🧠 Brain" active={tab === "brain"} onClick={() => setTab("brain")} />
          <TabBtn label="📬 Inbox" active={tab === "inbox"} onClick={() => setTab("inbox")} />
          <TabBtn label="📅 Calendar" active={tab === "calendar"} onClick={() => setTab("calendar")} />
        </nav>
        <button onClick={doLogout} style={appStyles.logout}>Sign out</button>
      </aside>
      <main style={appStyles.main}>
        {tab === "brain" && <BrainTab />}
        {tab === "inbox" && <InboxTab />}
        {tab === "calendar" && <CalendarTab />}
      </main>
    </div>
  );
}

function TabBtn({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ ...appStyles.tabBtn, ...(active ? appStyles.tabBtnActive : {}) }}>
      {label}
    </button>
  );
}

// ─── Brain tab ─────────────────────────────────────────────────────────
function BrainTab() {
  const [briefing, setBriefing] = useState<Awaited<ReturnType<typeof api.brainBriefing>> | null>(null);
  const [askQ, setAskQ] = useState("");
  const [askAnswer, setAskAnswer] = useState<Awaited<ReturnType<typeof api.brainAsk>> | null>(null);
  const [asking, setAsking] = useState(false);

  useEffect(() => {
    api.brainBriefing().then(setBriefing).catch(() => {});
  }, []);

  async function ask() {
    if (!askQ.trim()) return;
    setAsking(true);
    try {
      setAskAnswer(await api.brainAsk(askQ));
    } finally {
      setAsking(false);
    }
  }

  return (
    <div style={tabStyles.content}>
      <h1 style={tabStyles.h1}>🧠 Brain</h1>
      <div style={tabStyles.askRow}>
        <input
          style={tabStyles.input}
          value={askQ}
          onChange={(e) => setAskQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && ask()}
          placeholder="Ask your inbox anything…"
        />
        <button style={tabStyles.btn} onClick={ask} disabled={asking}>
          {asking ? "..." : "Ask"}
        </button>
      </div>
      {askAnswer && (
        <div style={tabStyles.card}>
          <div style={tabStyles.cardText}>{askAnswer.answerText}</div>
          {askAnswer.results.length > 0 && (
            <ul style={tabStyles.list}>
              {askAnswer.results.map((r) => (
                <li key={r.id} style={tabStyles.listItem}>
                  <strong>{r.subject ?? "(no subject)"}</strong>
                  <div style={tabStyles.sub}>{r.from_address} · {new Date(r.created_at).toLocaleDateString()}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      {briefing && (
        <>
          <div style={tabStyles.statRow}>
            <Stat n={briefing.newMessageCount} label="new emails (24h)" />
            <Stat n={briefing.overduePromises.length} label="overdue" />
            <Stat n={briefing.decisions.length} label="recent decisions" />
          </div>
          {briefing.overduePromises.length > 0 && (
            <Section title="⚠️ Overdue promises">
              {briefing.overduePromises.map((p) => (
                <div key={p.id} style={tabStyles.row}>
                  <div>{p.text}</div>
                  {p.dueAt && <div style={tabStyles.sub}>{new Date(p.dueAt).toLocaleDateString()}</div>}
                </div>
              ))}
            </Section>
          )}
          {briefing.upcomingPromises.length > 0 && (
            <Section title="📌 Coming up">
              {briefing.upcomingPromises.slice(0, 5).map((p) => (
                <div key={p.id} style={tabStyles.row}>
                  <div>{p.text}</div>
                  {p.dueAt && <div style={tabStyles.sub}>{new Date(p.dueAt).toLocaleDateString()}</div>}
                </div>
              ))}
            </Section>
          )}
          {briefing.decisions.length > 0 && (
            <Section title="✅ Decisions">
              {briefing.decisions.slice(0, 5).map((d) => (
                <div key={d.id} style={tabStyles.row}>
                  <div>{d.summary ?? d.text}</div>
                  <div style={tabStyles.sub}>{new Date(d.createdAt).toLocaleDateString()}</div>
                </div>
              ))}
            </Section>
          )}
        </>
      )}
    </div>
  );
}

function Stat({ n, label }: { n: number; label: string }) {
  return (
    <div style={tabStyles.stat}>
      <div style={tabStyles.statN}>{n}</div>
      <div style={tabStyles.statL}>{label}</div>
    </div>
  );
}
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={tabStyles.card}>
      <div style={tabStyles.cardTitle}>{title}</div>
      {children}
    </div>
  );
}

// ─── Inbox tab ─────────────────────────────────────────────────────────
function InboxTab() {
  const [messages, setMessages] = useState<Awaited<ReturnType<typeof api.listMessages>>["messages"]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const inboxes = await api.listInboxes();
        if (inboxes.inboxes.length > 0) {
          const r = await api.listMessages(inboxes.inboxes[0].id);
          setMessages(r.messages);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div style={tabStyles.content}>Loading…</div>;
  return (
    <div style={tabStyles.content}>
      <h1 style={tabStyles.h1}>📬 Inbox</h1>
      {messages.length === 0 && <div style={tabStyles.sub}>No messages yet.</div>}
      {messages.map((m) => (
        <div key={m.id} style={tabStyles.message}>
          <strong>{m.subject ?? "(no subject)"}</strong>
          <div style={tabStyles.sub}>{m.fromAddress ?? m.from_address} · {new Date(m.createdAt).toLocaleString()}</div>
          {m.summary && <div style={tabStyles.summary}>{m.summary}</div>}
        </div>
      ))}
    </div>
  );
}

// ─── Calendar tab ──────────────────────────────────────────────────────
function CalendarTab() {
  const [events, setEvents] = useState<Awaited<ReturnType<typeof api.listEvents>>["events"]>([]);
  useEffect(() => {
    const now = new Date();
    const horizon = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    api.listEvents(now, horizon).then((r) => setEvents(r.events)).catch(() => {});
  }, []);
  return (
    <div style={tabStyles.content}>
      <h1 style={tabStyles.h1}>📅 Calendar</h1>
      {events.length === 0 && <div style={tabStyles.sub}>No upcoming events.</div>}
      {events.map((e) => (
        <div key={e.id} style={tabStyles.event}>
          <strong>{e.title}{e.suggested ? " ✨" : ""}</strong>
          <div style={tabStyles.sub}>
            {new Date(e.startsAt).toLocaleString()} → {new Date(e.endsAt).toLocaleString()}
          </div>
          {e.location && <div style={tabStyles.sub}>📍 {e.location}</div>}
        </div>
      ))}
    </div>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────
const loginStyles: Record<string, React.CSSProperties> = {
  wrap: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 },
  card: { background: "var(--bg-card)", padding: 32, borderRadius: 16, maxWidth: 380, width: "100%", border: "1px solid var(--border)" },
  label: { color: "var(--primary)", letterSpacing: 3, fontWeight: 800, fontSize: 12, marginBottom: 16 },
  title: { fontSize: 28, marginBottom: 24 },
  input: { width: "100%", marginBottom: 12, fontSize: 15 },
  btn: { width: "100%", background: "var(--primary)", color: "var(--bg)", padding: 14, borderRadius: 10, fontWeight: 700, fontSize: 16, marginTop: 8 },
  toggle: { width: "100%", marginTop: 16, color: "var(--primary)", fontSize: 13 },
  error: { background: "rgba(255,23,68,0.12)", border: "1px solid var(--danger)", color: "var(--danger)", padding: 10, borderRadius: 8, fontSize: 13, marginBottom: 12 },
};

const appStyles: Record<string, React.CSSProperties> = {
  wrap: { display: "flex", minHeight: "100vh" },
  side: { width: 240, background: "var(--bg-card)", padding: 24, display: "flex", flexDirection: "column", borderRight: "1px solid var(--border)" },
  brand: { display: "flex", alignItems: "center", gap: 8, marginBottom: 32 },
  brandIcon: { fontSize: 22 },
  brandText: { fontWeight: 900, letterSpacing: 3, fontSize: 14, color: "var(--primary)" },
  nav: { display: "flex", flexDirection: "column", gap: 4, flex: 1 },
  tabBtn: { padding: "12px 14px", borderRadius: 10, fontSize: 15, color: "var(--text-secondary)", textAlign: "left" },
  tabBtnActive: { background: "var(--bg-elev)", color: "var(--text)", fontWeight: 600 },
  logout: { padding: "12px 14px", color: "var(--danger)", fontSize: 13, textAlign: "left", marginTop: 32 },
  main: { flex: 1, overflow: "auto" },
};

const tabStyles: Record<string, React.CSSProperties> = {
  content: { padding: 40, maxWidth: 880, margin: "0 auto" },
  h1: { fontSize: 32, fontWeight: 900, marginBottom: 24 },
  askRow: { display: "flex", gap: 12, marginBottom: 24 },
  input: { flex: 1, fontSize: 15 },
  btn: { background: "var(--primary)", color: "var(--bg)", padding: "12px 24px", borderRadius: 10, fontWeight: 700 },
  statRow: { display: "flex", gap: 12, marginBottom: 24 },
  stat: { flex: 1, background: "var(--bg-card)", padding: 20, borderRadius: 14, textAlign: "center" },
  statN: { fontSize: 32, fontWeight: 800, color: "var(--primary)" },
  statL: { fontSize: 12, color: "var(--text-muted)", marginTop: 4 },
  card: { background: "var(--bg-card)", padding: 20, borderRadius: 14, marginBottom: 16 },
  cardTitle: { fontSize: 16, fontWeight: 700, marginBottom: 12 },
  cardText: { fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6 },
  row: { padding: "10px 0", borderTop: "1px solid var(--border)" },
  list: { listStyle: "none", padding: 0, marginTop: 12 },
  listItem: { padding: "10px 0", borderTop: "1px solid var(--border)" },
  sub: { fontSize: 12, color: "var(--text-muted)", marginTop: 4 },
  message: { background: "var(--bg-card)", padding: 16, borderRadius: 12, marginBottom: 10 },
  summary: { color: "var(--text-secondary)", fontSize: 13, marginTop: 8 },
  event: { background: "var(--bg-card)", padding: 16, borderRadius: 12, marginBottom: 10 },
};
