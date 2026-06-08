"use client";
/**
 * /app — Cybrmail web client.
 *
 * Login flow (3 paths):
 *   1. Email + password — works today, hits /api/auth/{signup,login}
 *   2. Sign in with Ethereum — MetaMask popup, signs SIWE message, hits /api/web3
 *   3. (Email verify after signup — 6-digit code modal)
 *
 * After login: 3-pane app shell (Brain / Inbox / Calendar) talking to api.cybrmail.net.
 */
import { useEffect, useState } from "react";
import * as api from "@/lib/api";
import { Logo } from "@/components/Logo";

type View = "loading" | "auth" | "verify" | "app";

export default function AppPage() {
  const [view, setView] = useState<View>("loading");

  useEffect(() => {
    // Pick up token from OAuth callback (#token=...)
    if (typeof window !== "undefined" && window.location.hash.includes("token=")) {
      const params = new URLSearchParams(window.location.hash.slice(1));
      const t = params.get("token");
      if (t) {
        api.setToken(t);
        window.history.replaceState({}, "", window.location.pathname);
      }
    }
    (async () => {
      if (!api.hasToken()) {
        setView("auth");
        return;
      }
      try {
        const { user } = await api.getMe();
        if (user.emailVerified === false) {
          setView("verify");
        } else {
          setView("app");
        }
      } catch {
        api.clearToken();
        setView("auth");
      }
    })();
  }, []);

  if (view === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#04070D]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
      </div>
    );
  }
  if (view === "auth")
    return <Auth onSignedIn={(needsV) => setView(needsV ? "verify" : "app")} />;
  if (view === "verify")
    return (
      <VerifyEmail
        onVerified={() => setView("app")}
        onLogout={() => {
          api.clearToken();
          setView("auth");
        }}
      />
    );
  return (
    <Shell
      onLogout={() => {
        api.clearToken();
        setView("auth");
      }}
    />
  );
}

// ───────────────────────────────────────────────────────────────────────
//  AUTH SCREEN — branded, multi-method
// ───────────────────────────────────────────────────────────────────────
function Auth({ onSignedIn }: { onSignedIn: (needsVerify: boolean) => void }) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [hasWallet, setHasWallet] = useState(false);
  const [providers, setProviders] = useState<{ apple: boolean; google: boolean; github: boolean }>({
    apple: false,
    google: false,
    github: false,
  });

  useEffect(() => {
    if (typeof window !== "undefined")
      setHasWallet(!!(window as { ethereum?: unknown }).ethereum);
    api.getAuthProviders().then(setProviders).catch(() => {});
  }, []);

  async function submitEmail() {
    setError("");
    if (!email || !password) {
      setError("Email and password required.");
      return;
    }
    if (mode === "signup" && password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setBusy(true);
    try {
      if (mode === "signin") {
        await api.login(email, password);
        onSignedIn(false);
      } else {
        await api.signup(email, password, name || undefined);
        onSignedIn(true);
      }
    } catch (err: unknown) {
      setError((err as Error).message ?? "Auth failed.");
    } finally {
      setBusy(false);
    }
  }

  async function submitWallet() {
    setError("");
    setBusy(true);
    try {
      await api.signInWithEthereum();
      onSignedIn(false);
    } catch (err: unknown) {
      setError((err as Error).message ?? "Wallet sign-in failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#04070D] text-white">
      {/* Background: subtle grid + radial glow */}
      <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" aria-hidden />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(800px circle at 50% 0%, rgba(0,229,255,0.18), transparent 50%), radial-gradient(600px circle at 80% 80%, rgba(124,77,255,0.12), transparent 50%)",
        }}
        aria-hidden
      />

      <main className="relative mx-auto flex min-h-screen max-w-md flex-col px-6 py-12 sm:py-20">
        {/* Brand mark */}
        <a
          href="https://cybrmail.net"
          className="mb-12 flex items-center gap-3 self-start text-white/90 transition hover:text-white"
        >
          <Logo className="h-8 w-8" />
          <span className="font-mono text-sm font-semibold tracking-[0.3em]">CYBRMAIL</span>
        </a>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            {mode === "signin" ? (
              <>
                Welcome <span className="text-gradient-cyber">back.</span>
              </>
            ) : (
              <>
                Claim your <span className="text-gradient-cyber">inbox.</span>
              </>
            )}
          </h1>
          <p className="mt-3 text-pretty text-base text-white/60">
            {mode === "signin"
              ? "Sign in to your encrypted, AI-native inbox."
              : "Free forever. Encrypted by default. AI brain that runs on your device."}
          </p>
        </div>

        {/* Social + Wallet sign-in */}
        <div className="space-y-2.5">
          {providers.apple && (
            <button
              onClick={() => api.oauthRedirect("apple")}
              className="flex w-full items-center justify-center gap-3 rounded-xl bg-white px-5 py-3.5 text-sm font-semibold text-black transition hover:bg-white/90"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.6 12.7c0-2.6 2.1-3.8 2.2-3.9-1.2-1.8-3.1-2-3.7-2-1.6-.2-3.1.9-3.9.9-.8 0-2.1-.9-3.4-.9-1.8 0-3.4 1-4.3 2.6-1.8 3.2-.5 7.9 1.3 10.5.9 1.3 1.9 2.7 3.2 2.6 1.3-.1 1.8-.8 3.4-.8 1.6 0 2 .8 3.4.8 1.4 0 2.3-1.3 3.2-2.6.7-1 1.3-2.2 1.7-3.4-3.7-1.4-3.1-5.6-.1-7.8zM14.6 4.7c.7-.9 1.2-2.1 1.1-3.3-1 0-2.3.7-3 1.6-.6.8-1.2 2-1 3.2 1.1.1 2.2-.6 2.9-1.5z"/></svg>
              Continue with Apple
            </button>
          )}
          {providers.google && (
            <button
              onClick={() => api.oauthRedirect("google")}
              className="flex w-full items-center justify-center gap-3 rounded-xl bg-white px-5 py-3.5 text-sm font-semibold text-[#1f1f1f] transition hover:bg-white/90"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Continue with Google
            </button>
          )}
          {providers.github && (
            <button
              onClick={() => api.oauthRedirect("github")}
              className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#24292f] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#2c333a]"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55v-2.07c-3.2.7-3.87-1.37-3.87-1.37-.52-1.33-1.27-1.68-1.27-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.69 1.25 3.34.95.1-.74.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.04 0 0 .97-.31 3.18 1.18.92-.26 1.91-.39 2.89-.39s1.97.13 2.89.39c2.21-1.49 3.18-1.18 3.18-1.18.62 1.58.23 2.75.11 3.04.74.81 1.18 1.84 1.18 3.1 0 4.42-2.7 5.4-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .3.21.67.8.55C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z"/></svg>
              Continue with GitHub
            </button>
          )}
          {hasWallet && (
            <button
              onClick={submitWallet}
              disabled={busy}
              className="group flex w-full items-center justify-center gap-3 rounded-xl border border-white/15 bg-white/[0.04] px-5 py-3.5 text-sm font-medium text-white transition hover:border-cyan-400/40 hover:bg-white/[0.07] disabled:opacity-50"
            >
              <svg className="h-5 w-5" viewBox="0 0 32 32" fill="none">
                <path
                  d="M16 4l-8.66 5v10L16 24l8.66-5V9z"
                  stroke="url(#wgrad)"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
                <defs>
                  <linearGradient id="wgrad" x1="0" y1="0" x2="32" y2="32">
                    <stop offset="0%" stopColor="#00E5FF" />
                    <stop offset="100%" stopColor="#7C4DFF" />
                  </linearGradient>
                </defs>
              </svg>
              Continue with Ethereum
            </button>
          )}
        </div>

        {(providers.apple || providers.google || providers.github || hasWallet) && (
          <div className="my-6 flex items-center gap-4 text-xs uppercase tracking-widest text-white/30">
            <div className="h-px flex-1 bg-white/10" />
            or use email
            <div className="h-px flex-1 bg-white/10" />
          </div>
        )}

        {/* Email form */}
        <div className="space-y-3">
          {mode === "signup" && (
            <input
              type="text"
              autoComplete="name"
              placeholder="Your name (optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="block w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3.5 text-sm text-white placeholder:text-white/30 transition focus:border-cyan-400/50 focus:bg-white/[0.05] focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
            />
          )}
          <input
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && document.getElementById("pw-input")?.focus()
            }
            className="block w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3.5 text-sm text-white placeholder:text-white/30 transition focus:border-cyan-400/50 focus:bg-white/[0.05] focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
          />
          <input
            id="pw-input"
            type="password"
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            placeholder={mode === "signup" ? "Password (min 8 characters)" : "Password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submitEmail()}
            className="block w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3.5 text-sm text-white placeholder:text-white/30 transition focus:border-cyan-400/50 focus:bg-white/[0.05] focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
          />
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <button
          onClick={submitEmail}
          disabled={busy || !email || !password}
          className="mt-5 w-full rounded-xl bg-gradient-to-r from-cyan-400 to-violet-500 px-5 py-4 text-sm font-semibold text-[#04070D] shadow-[0_8px_32px_-8px_rgba(0,229,255,0.5)] transition hover:shadow-[0_12px_40px_-8px_rgba(0,229,255,0.7)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? "..." : mode === "signin" ? "Sign in" : "Create account"}
        </button>

        {/* Mode toggle */}
        <p className="mt-6 text-center text-sm text-white/50">
          {mode === "signin" ? (
            <>
              New to Cybrmail?{" "}
              <button
                onClick={() => {
                  setMode("signup");
                  setError("");
                }}
                className="font-medium text-cyan-300 transition hover:text-cyan-200"
              >
                Create an account →
              </button>
            </>
          ) : (
            <>
              Already have one?{" "}
              <button
                onClick={() => {
                  setMode("signin");
                  setError("");
                }}
                className="font-medium text-cyan-300 transition hover:text-cyan-200"
              >
                Sign in →
              </button>
            </>
          )}
        </p>

        {/* Trust strip */}
        <div className="mt-12 grid grid-cols-3 gap-3 text-center text-[10px] uppercase tracking-widest text-white/40">
          <Trust label="E2E encrypted" />
          <Trust label="Zero trackers" />
          <Trust label="Open source" />
        </div>

        <p className="mt-8 text-center text-xs text-white/30">
          By continuing you agree to our{" "}
          <a href="https://cybrmail.net/terms" className="underline transition hover:text-white/60">
            terms
          </a>{" "}
          and{" "}
          <a href="https://cybrmail.net/privacy" className="underline transition hover:text-white/60">
            privacy policy
          </a>
          .
        </p>
      </main>
    </div>
  );
}

function Trust({ label }: { label: string }) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] py-3">{label}</div>
  );
}

// ───────────────────────────────────────────────────────────────────────
//  VERIFY EMAIL — 6-digit code after signup
// ───────────────────────────────────────────────────────────────────────
function VerifyEmail({
  onVerified,
  onLogout,
}: {
  onVerified: () => void;
  onLogout: () => void;
}) {
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  async function submit() {
    if (code.length !== 6) {
      setError("Enter the 6-digit code from your email.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await api.verifyEmail(code);
      onVerified();
    } catch (err: unknown) {
      setError((err as Error).message ?? "Wrong code.");
    } finally {
      setBusy(false);
    }
  }

  async function resend() {
    setResending(true);
    try {
      await api.resendVerificationCode();
      setResent(true);
      setTimeout(() => setResent(false), 4000);
    } catch (err: unknown) {
      setError((err as Error).message ?? "Resend failed.");
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#04070D] px-6 text-white">
      <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" aria-hidden />
      <div className="relative w-full max-w-md">
        <div className="mb-6 flex items-center gap-3">
          <Logo className="h-7 w-7" />
          <span className="font-mono text-xs font-semibold tracking-[0.3em]">CYBRMAIL</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Verify your email</h1>
        <p className="mt-2 text-white/60">Enter the 6-digit code we sent to your inbox.</p>

        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          placeholder="000000"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          className="mt-6 block w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-5 text-center font-mono text-2xl tracking-[0.5em] text-white placeholder:text-white/20 focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
        />

        {error && (
          <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}
        {resent && (
          <div className="mt-4 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-200">
            New code sent.
          </div>
        )}

        <button
          onClick={submit}
          disabled={busy || code.length !== 6}
          className="mt-5 w-full rounded-xl bg-gradient-to-r from-cyan-400 to-violet-500 px-5 py-4 text-sm font-semibold text-[#04070D] transition hover:shadow-[0_12px_40px_-8px_rgba(0,229,255,0.7)] disabled:opacity-50"
        >
          {busy ? "Verifying..." : "Verify"}
        </button>

        <div className="mt-6 flex items-center justify-between text-sm text-white/50">
          <button onClick={resend} disabled={resending} className="transition hover:text-cyan-300">
            {resending ? "Sending..." : "Resend code"}
          </button>
          <button onClick={onLogout} className="transition hover:text-white/80">
            Use a different account
          </button>
        </div>
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────
//  APP SHELL — Brain / Inbox / Calendar
// ───────────────────────────────────────────────────────────────────────
type Tab = "brain" | "inbox" | "calendar";

function Shell({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState<Tab>("brain");
  return (
    <div className="flex min-h-screen bg-[#04070D] text-white">
      <aside className="hidden w-64 shrink-0 border-r border-white/5 bg-[#070B14] p-6 sm:flex sm:flex-col">
        <div className="mb-10 flex items-center gap-2.5">
          <Logo className="h-6 w-6" />
          <span className="font-mono text-xs font-semibold tracking-[0.3em]">CYBRMAIL</span>
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          <NavBtn icon="🧠" label="Brain" active={tab === "brain"} onClick={() => setTab("brain")} />
          <NavBtn icon="📬" label="Inbox" active={tab === "inbox"} onClick={() => setTab("inbox")} />
          <NavBtn icon="📅" label="Calendar" active={tab === "calendar"} onClick={() => setTab("calendar")} />
        </nav>
        <button
          onClick={onLogout}
          className="mt-6 rounded-lg px-3 py-2 text-left text-xs text-white/40 transition hover:bg-white/[0.04] hover:text-white/70"
        >
          Sign out
        </button>
      </aside>
      <main className="flex-1 overflow-auto">
        {tab === "brain" && <BrainTab />}
        {tab === "inbox" && <InboxTab />}
        {tab === "calendar" && <CalendarTab />}
      </main>
    </div>
  );
}

function NavBtn({
  icon,
  label,
  active,
  onClick,
}: {
  icon: string;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
        active
          ? "bg-gradient-to-r from-cyan-500/15 to-violet-500/10 text-white shadow-[inset_0_0_0_1px_rgba(0,229,255,0.2)]"
          : "text-white/60 hover:bg-white/[0.04] hover:text-white"
      }`}
    >
      <span className="text-lg">{icon}</span>
      {label}
    </button>
  );
}

// ─── Brain tab ────────────────────────────────────────────────────────
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
    <div className="mx-auto max-w-3xl p-8">
      <h1 className="text-3xl font-bold tracking-tight">🧠 Brain</h1>

      <div className="mt-6 flex gap-2">
        <input
          value={askQ}
          onChange={(e) => setAskQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && ask()}
          placeholder="Ask your inbox anything..."
          className="flex-1 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm placeholder:text-white/30 focus:border-cyan-400/50 focus:outline-none"
        />
        <button
          onClick={ask}
          disabled={asking}
          className="rounded-xl bg-gradient-to-r from-cyan-400 to-violet-500 px-5 py-3 text-sm font-semibold text-[#04070D] disabled:opacity-50"
        >
          {asking ? "..." : "Ask"}
        </button>
      </div>

      {askAnswer && (
        <Card className="mt-4">
          <p className="text-sm text-white/85">{askAnswer.answerText}</p>
          {askAnswer.results.length > 0 && (
            <ul className="mt-4 space-y-2 border-t border-white/10 pt-3">
              {askAnswer.results.map((r) => (
                <li key={r.id} className="text-sm">
                  <strong className="block text-white/90">{r.subject ?? "(no subject)"}</strong>
                  <div className="mt-1 text-xs text-white/50">
                    {r.from_address} · {new Date(r.created_at).toLocaleDateString()}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}

      {briefing && (
        <>
          <div className="mt-6 grid grid-cols-3 gap-3">
            <Stat n={briefing.newMessageCount} label="new (24h)" />
            <Stat n={briefing.overduePromises.length} label="overdue" />
            <Stat n={briefing.decisions.length} label="decisions" />
          </div>

          {briefing.overduePromises.length > 0 && (
            <Card className="mt-4">
              <CardTitle>⚠️ Overdue promises</CardTitle>
              {briefing.overduePromises.map((p) => (
                <Row key={p.id} text={p.text} sub={p.dueAt ? new Date(p.dueAt).toLocaleDateString() : undefined} />
              ))}
            </Card>
          )}
          {briefing.upcomingPromises.length > 0 && (
            <Card className="mt-4">
              <CardTitle>📌 Coming up</CardTitle>
              {briefing.upcomingPromises.slice(0, 5).map((p) => (
                <Row key={p.id} text={p.text} sub={p.dueAt ? new Date(p.dueAt).toLocaleDateString() : undefined} />
              ))}
            </Card>
          )}
          {briefing.decisions.length > 0 && (
            <Card className="mt-4">
              <CardTitle>✅ Decisions</CardTitle>
              {briefing.decisions.slice(0, 5).map((d) => (
                <Row key={d.id} text={d.summary ?? d.text} sub={new Date(d.createdAt).toLocaleDateString()} />
              ))}
            </Card>
          )}
        </>
      )}
    </div>
  );
}

function Stat({ n, label }: { n: number; label: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-center">
      <div className="text-2xl font-bold text-cyan-300">{n}</div>
      <div className="mt-1 text-xs uppercase tracking-widest text-white/40">{label}</div>
    </div>
  );
}
function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-xl border border-white/10 bg-white/[0.02] p-5 ${className}`}>{children}</div>;
}
function CardTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="mb-3 text-sm font-semibold text-white/90">{children}</h3>;
}
function Row({ text, sub }: { text: string; sub?: string }) {
  return (
    <div className="border-t border-white/5 py-2.5 first:border-t-0 first:pt-0">
      <div className="text-sm text-white/85">{text}</div>
      {sub && <div className="mt-0.5 text-xs text-white/40">{sub}</div>}
    </div>
  );
}

// ─── Inbox tab ────────────────────────────────────────────────────────
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

  if (loading) return <div className="p-8 text-white/40">Loading inbox...</div>;
  return (
    <div className="mx-auto max-w-3xl p-8">
      <h1 className="text-3xl font-bold tracking-tight">📬 Inbox</h1>
      <div className="mt-6 space-y-2">
        {messages.length === 0 && (
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-8 text-center text-white/40">
            No messages yet. Send yourself an email to see it land here.
          </div>
        )}
        {messages.map((m) => (
          <div key={m.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-4 transition hover:border-cyan-400/30">
            <div className="flex items-baseline justify-between gap-3">
              <strong className="truncate text-white/95">{m.subject ?? "(no subject)"}</strong>
              <span className="shrink-0 text-xs text-white/40">{new Date(m.createdAt).toLocaleString()}</span>
            </div>
            <div className="mt-1 text-xs text-white/50">{m.fromAddress ?? m.from_address}</div>
            {m.summary && <p className="mt-2 text-sm text-white/70 line-clamp-2">{m.summary}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Calendar tab ─────────────────────────────────────────────────────
function CalendarTab() {
  const [events, setEvents] = useState<Awaited<ReturnType<typeof api.listEvents>>["events"]>([]);
  useEffect(() => {
    const now = new Date();
    const horizon = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    api.listEvents(now, horizon).then((r) => setEvents(r.events)).catch(() => {});
  }, []);
  return (
    <div className="mx-auto max-w-3xl p-8">
      <h1 className="text-3xl font-bold tracking-tight">📅 Calendar</h1>
      {events.length === 0 && (
        <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.02] p-8 text-center text-white/40">
          No upcoming events.
        </div>
      )}
      <div className="mt-6 space-y-2">
        {events.map((e) => (
          <div key={e.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <strong className="text-white/95">
              {e.title}
              {e.suggested ? " ✨" : ""}
            </strong>
            <div className="mt-1 text-xs text-white/50">
              {new Date(e.startsAt).toLocaleString()} → {new Date(e.endsAt).toLocaleString()}
            </div>
            {e.location && <div className="mt-1 text-xs text-white/40">📍 {e.location}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
