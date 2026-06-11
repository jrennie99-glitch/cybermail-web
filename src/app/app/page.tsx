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
import {
  Inbox, Star, Send, Archive, Trash2, Search, RotateCw, Reply, Forward,
  PenLine, ArrowLeft, Play, Pause, Square, Mic, Bot, Flame, Brain,
  Calendar, LogOut, Paperclip, Mail, MailOpen, Undo2, X, Sparkles,
  Volume2, VolumeX, Drama, Plus, Download,
  Settings, ChevronDown, Check, Copy, AtSign
} from "lucide-react";

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
      // Marketing funnel: /app?demo=1 drops straight into a seeded demo account
      if (!api.hasToken() && typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        if (params.get("demo") === "1") {
          try {
            await api.demoLogin();
            window.history.replaceState({}, "", window.location.pathname);
          } catch { /* fall through to auth */ }
        }
      }
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
  // signup sub-path: create a brand-new @cybrmail.net address, or bring an existing email
  const [signupPath, setSignupPath] = useState<"create" | "existing">("create");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [handle, setHandle] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [handleStatus, setHandleStatus] = useState<null | "checking" | "available" | "unavailable">(null);
  const [handleReason, setHandleReason] = useState("");
  const [hasWallet, setHasWallet] = useState(false);
  const [health, setHealth] = useState<{ reachable: boolean; detail: string } | null>(null);
  const [providers, setProviders] = useState<{ apple: boolean; google: boolean; github: boolean }>({
    apple: false,
    google: false,
    github: false,
  });

  useEffect(() => {
    if (typeof window !== "undefined")
      setHasWallet(!!(window as { ethereum?: unknown }).ethereum);
    api.getAuthProviders().then(setProviders).catch(() => {});
    let stopped = false;
    const tick = () => api.healthCheck().then((h) => {
      if (stopped) return;
      setHealth(h);
      if (!h.reachable) setTimeout(tick, 20000); // keep retrying only while down
    });
    tick();
    return () => { stopped = true; };
  }, []);

  const cleanedHandle = handle.toLowerCase().replace(/[^a-z0-9.]/g, "");

  // Live availability while creating a new address at signup
  useEffect(() => {
    if (mode !== "signup" || signupPath !== "create" || cleanedHandle.length < 3) {
      setHandleStatus(null);
      setSuggestions([]);
      return;
    }
    setHandleStatus("checking");
    let stale = false;
    const t = setTimeout(async () => {
      try {
        const r = await api.checkHandle(cleanedHandle);
        if (stale) return;
        if (r.available) {
          setHandleStatus("available");
          setSuggestions([]);
          setHandleReason("");
        } else {
          setHandleStatus("unavailable");
          setHandleReason(r.reason === "taken" ? "Taken" : r.reason || "Unavailable");
          setSuggestions(r.suggestions ?? []);
        }
      } catch {
        if (!stale) setHandleStatus(null);
      }
    }, 700);
    return () => { stale = true; clearTimeout(t); };
  }, [mode, signupPath, cleanedHandle]);

  async function submitEmail() {
    setError("");
    if (mode === "signup" && signupPath === "create") {
      if (cleanedHandle.length < 3) { setError("Pick your address first."); return; }
      if (!password || password.length < 8) { setError("Password must be at least 8 characters."); return; }
      setBusy(true);
      try {
        await api.signupWithHandle(cleanedHandle, password, name || undefined);
        onSignedIn(false); // address is the account — nothing to verify
      } catch (err: unknown) {
        const e = err as Error & { status?: number; body?: { suggestions?: string[] } };
        if (e.status === 409 && e.body?.suggestions) {
          setError(`${cleanedHandle}@cybrmail.net is taken. Try one of these:`);
          setSuggestions(e.body.suggestions);
        } else {
          setError(e.message ?? "Couldn't create your address.");
        }
      } finally {
        setBusy(false);
      }
      return;
    }
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
      const msg = (err as Error).message ?? "Auth failed.";
      setError(/failed to fetch|networkerror|load failed/i.test(msg) ? `Can't reach the mail server at ${api.API_BASE_URL}. The backend is down or misrouted — see the banner above.` : msg);
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
    <div className="grid min-h-screen grid-cols-1 bg-[#04070D] text-white lg:grid-cols-[1.1fr_0.9fr]">
      {/* ─── LEFT PANE: cinematic brand video + value prop ───────────── */}
      <aside className="relative hidden overflow-hidden lg:block">
        <video
          src="/brand-hero.mp4"
          poster="/brand-hero-poster.jpg"
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover object-center"
          aria-hidden
        >
          <source src="/brand-hero.webm" type="video/webm" />
          <source src="/brand-hero.mp4" type="video/mp4" />
        </video>
        {/* Cinematic gradient overlays — preserve video center, darken edges for legibility */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#04070D] via-transparent to-[#04070D]/40" aria-hidden />
        <div className="absolute inset-0 bg-gradient-to-b from-[#04070D]/60 via-transparent to-[#04070D]" aria-hidden />

        {/* Top: logo */}
        <a
          href="https://cybrmail.net"
          className="absolute left-12 top-12 z-10 flex items-center gap-3 text-white/95 transition hover:text-white"
        >
          <Logo className="h-9 w-9" />
          <span className="font-mono text-sm font-bold tracking-[0.3em]">CYBRMAIL</span>
        </a>

        {/* Center: tagline */}
        <div className="absolute inset-x-0 bottom-32 z-10 px-12">
          <p className="mb-4 inline-flex items-center gap-2.5 rounded-full border border-cyan-400/25 bg-cyan-500/10 px-4 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.25em] text-cyan-300 backdrop-blur-md">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400/70" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-cyan-300" />
            </span>
            Live · v1.0.1
          </p>
          <h2 className="font-display text-balance text-[3.5rem] font-bold leading-[0.92] tracking-[-0.02em] xl:text-[4.5rem]">
            Email,
            <br />
            <span className="text-gradient-cyber">reimagined.</span>
          </h2>
          <p className="mt-5 max-w-md text-pretty text-base text-white/70">
            End-to-end encrypted. A private AI brain that runs on-device.
            Wallet sign-in. Real digital postal mailbox. One inbox.
          </p>
        </div>

        {/* Bottom: trust strip */}
        <div className="absolute inset-x-0 bottom-10 z-10 grid grid-cols-3 gap-px border-t border-white/5 px-12 pt-6 text-center text-[10px] font-medium uppercase tracking-widest text-white/40">
          <div>E2E encrypted</div>
          <div className="border-x border-white/5">Zero trackers</div>
          <div>Open source</div>
        </div>
      </aside>

      {/* ─── RIGHT PANE: sign-in card ─────────────────────────────────── */}
      <main className="relative flex flex-col px-6 py-10 sm:px-12 lg:px-16">
        {/* Mobile-only logo */}
        <a
          href="https://cybrmail.net"
          className="mb-10 flex items-center gap-3 self-start text-white/90 transition hover:text-white lg:hidden"
        >
          <Logo className="h-8 w-8" />
          <span className="font-mono text-sm font-bold tracking-[0.3em]">CYBRMAIL</span>
        </a>

        {/* Background tint */}
        <div
          className="pointer-events-none absolute inset-0 hidden lg:block"
          style={{
            background:
              "radial-gradient(900px circle at 80% 20%, rgba(0,229,255,0.06), transparent 60%)",
          }}
          aria-hidden
        />

        <div className="relative mx-auto flex w-full max-w-sm flex-1 flex-col justify-center">
          {health && !health.reachable && (
            <div className="mb-6 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3">
              <div className="text-sm font-semibold text-red-300">⚠ Can&apos;t reach the mail server</div>
              <p className="mt-1 text-xs leading-relaxed text-red-200/80">{health.detail}</p>
              <p className="mt-1 text-xs text-red-200/60">Sign-in will fail until this is fixed — retrying automatically…</p>
            </div>
          )}

          {/* Header */}
          <div className="mb-8">
            <h1 className="font-display text-4xl font-bold tracking-tight sm:text-[2.75rem]">
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
            <p className="mt-3 text-pretty text-[15px] text-white/55">
              {mode === "signin"
                ? "Sign in to your private inbox."
                : "Free forever. Encrypted by default."}
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
            <>
              {/* Path picker: brand-new address vs existing email */}
              <div className="grid grid-cols-2 gap-1 rounded-xl border border-white/10 bg-white/[0.02] p-1">
                <button
                  onClick={() => { setSignupPath("create"); setError(""); }}
                  className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                    signupPath === "create"
                      ? "bg-gradient-to-r from-cyan-500/20 to-violet-500/15 text-white shadow-[inset_0_0_0_1px_rgba(0,229,255,0.25)]"
                      : "text-white/50 hover:text-white"
                  }`}
                >
                  Create a new address
                </button>
                <button
                  onClick={() => { setSignupPath("existing"); setError(""); }}
                  className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                    signupPath === "existing"
                      ? "bg-gradient-to-r from-cyan-500/20 to-violet-500/15 text-white shadow-[inset_0_0_0_1px_rgba(0,229,255,0.25)]"
                      : "text-white/50 hover:text-white"
                  }`}
                >
                  Use my email
                </button>
              </div>
              <input
                type="text"
                autoComplete="name"
                placeholder="Your name (optional)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3.5 text-sm text-white placeholder:text-white/30 transition focus:border-cyan-400/50 focus:bg-white/[0.05] focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
              />
            </>
          )}

          {mode === "signup" && signupPath === "create" ? (
            <>
              <div
                className={`flex items-stretch overflow-hidden rounded-xl border bg-white/[0.03] transition focus-within:ring-2 ${
                  handleStatus === "available"
                    ? "border-emerald-400/50 focus-within:ring-emerald-400/20"
                    : handleStatus === "unavailable"
                      ? "border-red-400/40 focus-within:ring-red-400/15"
                      : "border-white/10 focus-within:border-cyan-400/50 focus-within:ring-cyan-400/20"
                }`}
              >
                <input
                  type="text"
                  spellCheck={false}
                  autoCapitalize="none"
                  placeholder="yourname"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9.]/g, "").slice(0, 30))}
                  className="min-w-0 flex-1 bg-transparent px-4 py-3.5 font-mono text-sm text-white placeholder:text-white/25 focus:outline-none"
                />
                <span className="flex select-none items-center border-l border-white/10 bg-white/[0.02] px-3 font-mono text-xs text-cyan-300/80">
                  @cybrmail.net
                </span>
              </div>
              <div className="min-h-[1rem] text-xs" aria-live="polite">
                {handleStatus === "checking" && <span className="text-white/40">Checking…</span>}
                {handleStatus === "available" && <span className="text-emerald-300">✓ {cleanedHandle}@cybrmail.net is available</span>}
                {handleStatus === "unavailable" && <span className="text-red-300">✗ {handleReason}</span>}
              </div>
              {suggestions.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => { setHandle(s); setError(""); }}
                      className="rounded-full border border-cyan-400/25 bg-cyan-500/[0.07] px-3 py-1 font-mono text-xs text-cyan-300 transition hover:border-cyan-400/60 hover:bg-cyan-500/15"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
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
          )}
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
          disabled={
            busy ||
            !password ||
            (mode === "signup" && signupPath === "create"
              ? cleanedHandle.length < 3 || handleStatus === "unavailable" || handleStatus === "checking"
              : !email)
          }
          className="mt-5 w-full rounded-xl bg-gradient-to-r from-cyan-400 to-violet-500 px-5 py-4 text-sm font-semibold text-[#04070D] shadow-[0_8px_32px_-8px_rgba(0,229,255,0.5)] transition hover:shadow-[0_12px_40px_-8px_rgba(0,229,255,0.7)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy
            ? "..."
            : mode === "signin"
              ? "Sign in"
              : signupPath === "create" && cleanedHandle.length >= 3
                ? `Create ${cleanedHandle}@cybrmail.net`
                : "Create account"}
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

          <button
            onClick={async () => {
              setBusy(true);
              setError("");
              try {
                await api.demoLogin();
                onSignedIn(false);
              } catch (e: unknown) {
                setError((e as Error).message ?? "Demo unavailable right now.");
              } finally {
                setBusy(false);
              }
            }}
            disabled={busy}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-violet-400/30 bg-violet-500/[0.08] px-5 py-3.5 text-sm font-semibold text-violet-200 transition hover:border-violet-400/60 hover:bg-violet-500/15 disabled:opacity-50"
          >
            ▶ Try the live demo — no signup
          </button>

          <p className="mt-8 text-center text-[11px] text-white/30">
            By continuing you agree to our{" "}
            <a
              href="https://cybrmail.net/terms"
              className="underline transition hover:text-white/60"
            >
              terms
            </a>{" "}
            and{" "}
            <a
              href="https://cybrmail.net/privacy"
              className="underline transition hover:text-white/60"
            >
              privacy policy
            </a>
            .
          </p>
        </div>
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
type ComposePrefill = { to?: string; subject?: string; text?: string };

type ShellView = api.Folder | "brain" | "calendar" | "burners" | "agents" | "assistant" | "settings";

function Shell({ onLogout }: { onLogout: () => void }) {
  const [view, setView] = useState<ShellView>("inbox");
  const [searchQ, setSearchQ] = useState("");
  const [inboxes, setInboxes] = useState<api.Inbox[] | null>(null); // null = loading
  const [inboxErr, setInboxErr] = useState("");
  const [activeId, setActiveId] = useState<number | null>(null);
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [compose, setCompose] = useState<ComposePrefill | null>(null);
  const [copied, setCopied] = useState(false);

  async function loadInboxes() {
    try {
      const r = await api.listInboxes();
      setInboxes(r.inboxes);
    } catch (err: unknown) {
      setInboxes([]);
      setInboxErr((err as Error).message ?? "Couldn't load inboxes.");
    }
  }
  useEffect(() => { loadInboxes(); }, []);

  const inbox = inboxes && inboxes.length > 0 ? (inboxes.find((i) => i.id === activeId) ?? inboxes[0]) : null;
  const isMail = view === "inbox" || view === "starred" || view === "sent" || view === "archive" || view === "trash";

  if (inboxes === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#04070D]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
      </div>
    );
  }

  if (!inbox) {
    return (
      <ClaimAddress
        loadError={inboxErr}
        onClaimed={(ib) => setInboxes([ib])}
        onLogout={onLogout}
      />
    );
  }

  function copyAddress() {
    navigator.clipboard?.writeText(inbox!.address).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#04070D] text-white">
      {/* ── Top bar: brand · search · identity ─────────────────────── */}
      <header className="flex h-16 shrink-0 items-center gap-3 border-b border-white/[0.07] bg-[#070B14] px-4 sm:gap-6 sm:px-6">
        <div className="flex items-center gap-2.5">
          <Logo className="h-7 w-7" />
          <span className="hidden font-mono text-xs font-bold tracking-[0.3em] sm:inline">CYBRMAIL</span>
        </div>
        <div className="relative mx-auto w-full max-w-2xl">
          <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="search"
            placeholder="Search mail"
            value={searchQ}
            onChange={(e) => {
              setSearchQ(e.target.value);
              if (!isMail) setView("inbox");
            }}
            className="block w-full rounded-full border border-white/10 bg-white/[0.05] py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/35 transition focus:border-cyan-400/40 focus:bg-white/[0.07] focus:outline-none"
          />
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <AddressSwitcher
            inboxes={inboxes}
            active={inbox}
            open={switcherOpen}
            setOpen={setSwitcherOpen}
            onSwitch={(id) => { setActiveId(id); setSwitcherOpen(false); setView("inbox"); }}
            onAdd={() => { setSwitcherOpen(false); setView("settings"); }}
            onCopy={copyAddress}
            copied={copied}
          />
          <button
            onClick={onLogout}
            title="Sign out"
            className="rounded-full border border-white/10 px-3 py-2 text-xs text-white/50 transition hover:border-white/25 hover:text-white"
          >
            <LogOut size={15} />
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* ── Left rail: compose + folders + apps ────────────────────── */}
        <aside className="hidden w-60 shrink-0 flex-col gap-1 overflow-y-auto border-r border-white/[0.07] bg-[#060A12] p-4 sm:flex">
          <button
            onClick={() => setCompose({})}
            className="mb-4 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-violet-500 px-5 py-3.5 text-sm font-semibold text-[#04070D] shadow-[0_8px_24px_-8px_rgba(0,229,255,0.5)] transition hover:shadow-[0_10px_32px_-8px_rgba(0,229,255,0.7)]"
          >
            <PenLine size={17} /> Compose
          </button>
          {FOLDERS.map((f) => (
            <RailBtn
              key={f.key}
              icon={f.icon}
              label={f.label}
              active={view === f.key}
              onClick={() => { setView(f.key); setSearchQ(""); }}
              badge={f.key === "inbox" ? inbox.unread : undefined}
            />
          ))}
          <div className="my-3 border-t border-white/[0.07]" />
          <RailBtn icon={<Sparkles size={17} />} label="Assistant" active={view === "assistant"} onClick={() => setView("assistant")} />
          <RailBtn icon={<Brain size={17} />} label="Brain" active={view === "brain"} onClick={() => setView("brain")} />
          <RailBtn icon={<Calendar size={17} />} label="Calendar" active={view === "calendar"} onClick={() => setView("calendar")} />
          <div className="my-3 border-t border-white/[0.07]" />
          <RailBtn icon={<Drama size={17} />} label="Burners" active={view === "burners"} onClick={() => setView("burners")} />
          <RailBtn icon={<Bot size={17} />} label="Agents" active={view === "agents"} onClick={() => setView("agents")} />
          <div className="flex-1" />
          <RailBtn icon={<Settings size={17} />} label="Settings" active={view === "settings"} onClick={() => setView("settings")} />
        </aside>

        {/* ── Main surface ───────────────────────────────────────────── */}
        <main className="flex min-w-0 flex-1 flex-col overflow-hidden pb-16 sm:pb-0">
          {/* Mobile folder strip */}
          {isMail && (
            <div className="flex shrink-0 gap-1 overflow-x-auto border-b border-white/[0.07] p-2 sm:hidden">
              {FOLDERS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setView(f.key)}
                  className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                    view === f.key
                      ? "bg-gradient-to-r from-cyan-500/25 to-violet-500/20 text-white"
                      : "text-white/50"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}
          {isMail ? (
            <div className="min-h-0 flex-1">
              <MailView
                inbox={inbox}
                folder={view as api.Folder}
                q={searchQ}
                onCompose={(p) => setCompose(p ?? {})}
                onCountsChanged={loadInboxes}
              />
            </div>
          ) : (
            <div className="min-h-0 flex-1 overflow-y-auto">
              {view === "assistant" ? (
                <AssistantView address={inbox.address} />
              ) : view === "brain" ? (
                <BrainTab />
              ) : view === "burners" ? (
                <BurnersView />
              ) : view === "agents" ? (
                <AgentsView />
              ) : view === "settings" ? (
                <SettingsView
                  inboxes={inboxes}
                  activeId={inbox.id}
                  onSwitch={(id) => setActiveId(id)}
                  onChanged={loadInboxes}
                  onLogout={onLogout}
                />
              ) : (
                <CalendarTab />
              )}
            </div>
          )}
        </main>
      </div>

      {/* Mobile bottom nav + FAB */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex border-t border-white/10 bg-[#070B14] sm:hidden">
        {([["inbox", "📬", "Inbox"], ["brain", "🧠", "Brain"], ["calendar", "📅", "Calendar"], ["assistant", "✏️", "Compose"], ["settings", "⚙️", "Settings"]] as const).map(([k, emoji, label]) => (
          <button
            key={k}
            onClick={() => setView(k)}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium ${
              (k === "inbox" ? isMail : view === k) ? "text-cyan-300" : "text-white/50"
            }`}
          >
            <span className="text-xl leading-none">{emoji}</span>
            {label}
          </button>
        ))}
      </div>
      <button
        onClick={() => setCompose({})}
        className="fixed bottom-20 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-400 to-violet-500 text-xl text-[#04070D] shadow-[0_12px_32px_-8px_rgba(0,229,255,0.7)] sm:hidden"
        title="Compose"
      >
        <PenLine size={22} />
      </button>

      {compose !== null && (
        <ComposeModal inbox={inbox} prefill={compose} onClose={() => setCompose(null)} />
      )}
    </div>
  );
}

function RailBtn({
  icon,
  label,
  active,
  onClick,
  badge,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  badge?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 rounded-full px-4 py-2 text-sm transition ${
        active
          ? "bg-gradient-to-r from-cyan-500/20 to-violet-500/10 font-semibold text-white shadow-[inset_0_0_0_1px_rgba(0,229,255,0.2)]"
          : "text-white/60 hover:bg-white/[0.04] hover:text-white"
      }`}
    >
      <span className="flex w-5 items-center justify-center">{icon}</span>
      <span className="flex-1 text-left">{label}</span>
      {badge ? (
        <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-[10px] font-bold text-cyan-300">{badge}</span>
      ) : null}
    </button>
  );
}

// ───────────────────────────────────────────────────────────────────────
//  ADDRESS SWITCHER — multi-address dropdown in the top bar
// ───────────────────────────────────────────────────────────────────────
function AddressSwitcher({
  inboxes, active, open, setOpen, onSwitch, onAdd, onCopy, copied,
}: {
  inboxes: api.Inbox[] | null;
  active: api.Inbox | null;
  open: boolean;
  setOpen: (v: boolean) => void;
  onSwitch: (id: number) => void;
  onAdd: () => void;
  onCopy: () => void;
  copied: boolean;
}) {
  if (!active) return null;
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        title="Switch address"
        className="flex max-w-[240px] items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/[0.07] py-1.5 pl-1.5 pr-3 transition hover:border-cyan-400/50"
      >
        <Avatar name={active.displayName || active.address} seed={active.address} />
        <span className="hidden truncate font-mono text-xs text-cyan-200 md:block">{active.address}</span>
        <ChevronDown size={14} className="shrink-0 text-cyan-300/60" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-2 w-72 overflow-hidden rounded-2xl border border-white/10 bg-[#0b101b] p-1.5 shadow-[0_24px_64px_-16px_rgba(0,0,0,0.9)]">
            <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-white/35">Your addresses</div>
            {(inboxes ?? []).map((ib) => (
              <button
                key={ib.id}
                onClick={() => onSwitch(ib.id)}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left transition hover:bg-white/[0.05]"
              >
                <Avatar name={ib.displayName || ib.address} seed={ib.address} />
                <span className="min-w-0 flex-1 truncate font-mono text-xs text-white/80">{ib.address}</span>
                {ib.id === active.id && <Check size={15} className="shrink-0 text-cyan-300" />}
              </button>
            ))}
            <div className="my-1 border-t border-white/[0.07]" />
            <button onClick={onCopy} className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm text-white/70 transition hover:bg-white/[0.05]">
              <Copy size={15} /> {copied ? "Copied ✓" : "Copy current address"}
            </button>
            <button onClick={onAdd} className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm font-medium text-cyan-300 transition hover:bg-white/[0.05]">
              <Plus size={15} /> Add a new address
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────
//  SETTINGS — addresses, signature, account
// ───────────────────────────────────────────────────────────────────────
function SettingsView({
  inboxes, activeId, onSwitch, onChanged, onLogout,
}: {
  inboxes: api.Inbox[] | null;
  activeId: number;
  onSwitch: (id: number) => void;
  onChanged: () => void;
  onLogout: () => void;
}) {
  const [handle, setHandle] = useState("");
  const [creating, setCreating] = useState(false);
  const [err, setErr] = useState("");
  const [sig, setSig] = useState("");
  const [sigSaved, setSigSaved] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") setSig(localStorage.getItem("cybrmail_signature") || "");
  }, []);

  async function create() {
    const h = handle.trim().toLowerCase();
    if (!h) return;
    setCreating(true); setErr("");
    try {
      const r = await api.createInbox(h);
      setHandle("");
      onChanged();
      onSwitch(r.inbox.id);
    } catch (e: unknown) {
      setErr((e as Error).message ?? "Couldn't create address.");
    } finally { setCreating(false); }
  }

  function saveSig() {
    localStorage.setItem("cybrmail_signature", sig);
    setSigSaved(true); setTimeout(() => setSigSaved(false), 1800);
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-8 sm:px-8">
      <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
      <p className="mt-1 text-sm text-white/50">Manage your addresses, signature, and account.</p>

      <section className="mt-8">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-white/90"><AtSign size={16} className="text-cyan-300" /> Your addresses</h2>
        <p className="mt-1 text-xs text-white/45">Create as many @cybrmail.net addresses as you want. Switch between them anytime.</p>
        <div className="mt-3 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
          {(inboxes ?? []).map((ib, i) => (
            <div key={ib.id} className={`flex items-center gap-3 px-4 py-3 ${i > 0 ? "border-t border-white/[0.06]" : ""}`}>
              <Avatar name={ib.displayName || ib.address} seed={ib.address} />
              <div className="min-w-0 flex-1">
                <div className="truncate font-mono text-sm text-white/85">{ib.address}</div>
                {ib.id === activeId && <div className="text-[11px] font-medium text-cyan-300">Active</div>}
              </div>
              {ib.id === activeId ? (
                <span className="shrink-0 rounded-full bg-cyan-500/15 px-3 py-1 text-xs font-semibold text-cyan-300">Current</span>
              ) : (
                <button onClick={() => onSwitch(ib.id)} className="shrink-0 rounded-full border border-white/15 px-3 py-1 text-xs text-white/70 transition hover:border-cyan-400/50 hover:text-white">Switch to</button>
              )}
            </div>
          ))}
        </div>

        <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
          <div className="text-sm font-medium text-white/85">Create a new address</div>
          <div className="mt-2 flex items-center gap-2">
            <div className="flex min-w-0 flex-1 items-center rounded-xl border border-white/10 bg-white/[0.03] focus-within:border-cyan-400/50">
              <input
                value={handle}
                onChange={(e) => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9.]/g, ""))}
                onKeyDown={(e) => e.key === "Enter" && create()}
                placeholder="newname"
                className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none"
              />
              <span className="shrink-0 px-3 font-mono text-sm text-white/40">@cybrmail.net</span>
            </div>
            <button onClick={create} disabled={creating || !handle.trim()} className="shrink-0 rounded-xl bg-gradient-to-r from-cyan-400 to-violet-500 px-4 py-2.5 text-sm font-semibold text-[#04070D] transition disabled:opacity-50">
              {creating ? "…" : "Create"}
            </button>
          </div>
          {err && <div className="mt-2 text-xs text-red-300">{err}</div>}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-white/90"><PenLine size={16} className="text-cyan-300" /> Signature</h2>
        <p className="mt-1 text-xs text-white/45">Automatically added to the bottom of messages you compose.</p>
        <textarea
          value={sig}
          onChange={(e) => setSig(e.target.value)}
          rows={4}
          placeholder={"— Sent from Cybrmail"}
          className="mt-3 block w-full resize-none rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-white/85 placeholder:text-white/30 focus:border-cyan-400/50 focus:outline-none"
        />
        <button onClick={saveSig} className="mt-2 rounded-xl border border-white/15 px-4 py-2 text-xs text-white/80 transition hover:border-cyan-400/50 hover:text-white">
          {sigSaved ? "Saved ✓" : "Save signature"}
        </button>
      </section>

      <section className="mt-8 border-t border-white/[0.07] pt-6">
        <h2 className="text-sm font-semibold text-white/90">Account</h2>
        <button onClick={onLogout} className="mt-3 rounded-xl border border-red-500/25 px-4 py-2.5 text-sm text-red-300 transition hover:bg-red-500/10">Sign out</button>
      </section>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────
//  CLAIM ADDRESS — first-run onboarding: pick your @cybrmail.net handle
// ───────────────────────────────────────────────────────────────────────
const HANDLE_RE = /^[a-z0-9](?:[a-z0-9.]{1,28}[a-z0-9])?$/;

function ClaimAddress({
  loadError,
  onClaimed,
  onLogout,
}: {
  loadError?: string;
  onClaimed: (inbox: api.Inbox) => void;
  onLogout: () => void;
}) {
  const [handle, setHandle] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  // null = nothing typed yet · "checking" · "available" · "unavailable"
  const [status, setStatus] = useState<null | "checking" | "available" | "unavailable">(null);
  const [reason, setReason] = useState("");

  const cleaned = handle.toLowerCase().replace(/[^a-z0-9.]/g, "");
  const valid = HANDLE_RE.test(cleaned) && !cleaned.includes("..");

  // Live availability: debounce 350ms after typing stops, ignore stale replies
  useEffect(() => {
    if (!cleaned || cleaned.length < 3) {
      setStatus(null);
      setSuggestions([]);
      setReason("");
      return;
    }
    setStatus("checking");
    let stale = false;
    const t = setTimeout(async () => {
      try {
        const r = await api.checkHandle(cleaned);
        if (stale) return;
        if (r.available) {
          setStatus("available");
          setSuggestions([]);
          setReason("");
        } else {
          setStatus("unavailable");
          setReason(r.reason === "taken" ? "Taken" : r.reason || "Unavailable");
          setSuggestions(r.suggestions ?? []);
        }
      } catch {
        if (!stale) setStatus(null); // backend missing the endpoint — claim still does a final check
      }
    }, 700);
    return () => { stale = true; clearTimeout(t); };
  }, [cleaned]);

  async function claim(h?: string) {
    const target = h ?? cleaned;
    if (!HANDLE_RE.test(target) || target.includes("..")) {
      setError("3–30 characters: lowercase letters, numbers, single dots. Must start and end with a letter or number.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const r = await api.createInbox(target);
      onClaimed(r.inbox);
    } catch (err: unknown) {
      const e = err as Error & { status?: number; body?: { suggestions?: string[] } };
      if (e.status === 404) {
        setError("The server doesn't support address creation yet (POST /api/inboxes returned 404). The app is ready — the backend needs this endpoint.");
      } else if (e.status === 409) {
        setError(`${target}@cybrmail.net is taken. Try one of these:`);
        setSuggestions(e.body?.suggestions ?? suggestions);
      } else {
        setError(e.message ?? "Couldn't create your address. Try again.");
      }
    } finally {
      setBusy(false);
    }
  }

  function pick(s: string) {
    setHandle(s);
    setError("");
  }

  const inputRing =
    status === "available"
      ? "border-emerald-400/50 focus-within:ring-emerald-400/20"
      : status === "unavailable"
        ? "border-red-400/40 focus-within:ring-red-400/15"
        : "border-white/10 focus-within:border-cyan-400/50 focus-within:ring-cyan-400/20";

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#04070D] px-6 text-white">
      <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(800px circle at 50% 30%, rgba(0,229,255,0.07), transparent 60%)" }}
        aria-hidden
      />
      <div className="relative w-full max-w-md">
        <div className="mb-6 flex items-center gap-3">
          <Logo className="h-7 w-7" />
          <span className="font-mono text-xs font-semibold tracking-[0.3em]">CYBRMAIL</span>
        </div>
        <h1 className="font-display text-4xl font-bold tracking-tight">
          Claim your <span className="text-gradient-cyber">address.</span>
        </h1>
        <p className="mt-3 text-[15px] text-white/55">
          This is your permanent Cybrmail identity. Pick it well — it&apos;s yours forever.
        </p>

        {loadError && (
          <div className="mt-5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            Couldn&apos;t check existing inboxes ({loadError}). You can still try claiming one.
          </div>
        )}

        <div className={`mt-7 flex items-stretch overflow-hidden rounded-xl border bg-white/[0.03] transition focus-within:ring-2 ${inputRing}`}>
          <input
            autoFocus
            type="text"
            spellCheck={false}
            autoCapitalize="none"
            placeholder="yourname"
            value={handle}
            onChange={(e) => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9.]/g, "").slice(0, 30))}
            onKeyDown={(e) => e.key === "Enter" && status === "available" && claim()}
            className="min-w-0 flex-1 bg-transparent px-4 py-4 font-mono text-base text-white placeholder:text-white/25 focus:outline-none"
          />
          <span className="flex select-none items-center border-l border-white/10 bg-white/[0.02] px-4 font-mono text-sm text-cyan-300/80">
            @cybrmail.net
          </span>
        </div>

        {/* Live status line */}
        <div className="mt-2 min-h-[1.25rem] text-sm" aria-live="polite">
          {status === "checking" && <span className="text-white/40">Checking…</span>}
          {status === "available" && (
            <span className="text-emerald-300">✓ {cleaned}@cybrmail.net is available</span>
          )}
          {status === "unavailable" && <span className="text-red-300">✗ {reason}</span>}
        </div>

        {/* Suggestion chips */}
        {suggestions.length > 0 && (
          <div className="mt-2">
            <div className="mb-2 text-xs uppercase tracking-widest text-white/35">Available instead</div>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => pick(s)}
                  className="rounded-full border border-cyan-400/25 bg-cyan-500/[0.07] px-3.5 py-1.5 font-mono text-sm text-cyan-300 transition hover:border-cyan-400/60 hover:bg-cyan-500/15"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <button
          onClick={() => claim()}
          disabled={busy || !valid || status === "unavailable" || status === "checking"}
          className="mt-5 w-full rounded-xl bg-gradient-to-r from-cyan-400 to-violet-500 px-5 py-4 text-sm font-semibold text-[#04070D] shadow-[0_8px_32px_-8px_rgba(0,229,255,0.5)] transition hover:shadow-[0_12px_40px_-8px_rgba(0,229,255,0.7)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? "Claiming..." : cleaned && valid ? `Claim ${cleaned}@cybrmail.net` : "Claim your address"}
        </button>

        <button
          onClick={onLogout}
          className="mt-6 w-full text-center text-sm text-white/40 transition hover:text-white/70"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────
//  COMPOSE — send mail from your address
// ───────────────────────────────────────────────────────────────────────
const DESTRUCT_OPTIONS = [
  { key: "off", label: "Normal" },
  { key: "1h", label: "1 hour", hours: 1 },
  { key: "24h", label: "24 hours", hours: 24 },
  { key: "7d", label: "7 days", hours: 168 },
  { key: "once", label: "View once" },
] as const;

function ComposeModal({ inbox, prefill, onClose }: { inbox: api.Inbox; prefill?: ComposePrefill; onClose: () => void }) {
  const [to, setTo] = useState(prefill?.to ?? "");
  const [subject, setSubject] = useState(prefill?.subject ?? "");
  const [text, setText] = useState(() => {
    const base = prefill?.text ?? "";
    const sig = typeof window !== "undefined" ? (localStorage.getItem("cybrmail_signature") || "") : "";
    if (!sig) return base;
    return base ? `${base}\n\n${sig}` : `\n\n${sig}`;
  });
  const [files, setFiles] = useState<api.OutAttachment[]>([]);
  const [destruct, setDestruct] = useState<(typeof DESTRUCT_OPTIONS)[number]["key"]>("off");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function addFiles(list: FileList | null) {
    if (!list) return;
    setError("");
    for (const f of Array.from(list)) {
      if (f.size > 15 * 1024 * 1024) { setError(`${f.name} is over the 15 MB limit.`); continue; }
      const dataBase64 = await new Promise<string>((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(String(r.result).split(",")[1] ?? "");
        r.onerror = () => rej(new Error("Read failed"));
        r.readAsDataURL(f);
      });
      setFiles((prev) => [...prev, { filename: f.name, mime: f.type || "application/octet-stream", dataBase64 }]);
    }
  }

  const recipients = to.split(/[,;\s]+/).map((s) => s.trim()).filter(Boolean);
  const validTo = recipients.length > 0 && recipients.every((r) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(r));

  async function send() {
    if (!validTo) { setError("Enter at least one valid recipient address."); return; }
    if (!subject.trim() && !text.trim()) { setError("Add a subject or a message."); return; }
    setBusy(true);
    setError("");
    try {
      const opt = DESTRUCT_OPTIONS.find((d) => d.key === destruct);
      await api.sendEmail({
        inboxId: inbox.id, to: recipients, subject: subject.trim(), text,
        attachments: files.length ? files : undefined,
        selfDestruct: destruct === "off" ? undefined
          : destruct === "once" ? { viewOnce: true }
          : { hours: (opt as { hours?: number }).hours },
      });
      setSent(true);
      setTimeout(onClose, 1200);
    } catch (err: unknown) {
      setError((err as Error).message ?? "Send failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-end sm:justify-end sm:bg-transparent sm:p-6 sm:backdrop-blur-none"
      onClick={(e) => e.target === e.currentTarget && !busy && onClose()}
    >
      <div className="w-full max-w-xl rounded-t-2xl border border-white/10 bg-[#0A0F1A] shadow-[0_24px_80px_-12px_rgba(0,0,0,0.9)] sm:rounded-2xl">
        <div className="flex items-center justify-between rounded-t-2xl bg-[#0D1322] px-5 py-3">
          <h2 className="text-sm font-bold tracking-tight">New message</h2>
          <button onClick={onClose} disabled={busy} className="rounded-lg px-2 py-1 text-white/40 transition hover:bg-white/[0.06] hover:text-white">✕</button>
        </div>
        <div className="p-5">

        <div className="space-y-3">
          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3">
            <span className="text-xs uppercase tracking-widest text-white/35">From</span>
            <span className="truncate font-mono text-sm text-cyan-300">{inbox.address}</span>
          </div>
          <input
            type="text"
            placeholder="To — recipient@example.com, another@example.com"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="block w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-white/30 transition focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
          />
          <input
            type="text"
            placeholder="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="block w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-white/30 transition focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
          />
          <textarea
            placeholder="Write your message..."
            rows={8}
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="block w-full resize-y rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm leading-relaxed text-white placeholder:text-white/30 transition focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
          />
        </div>

        {/* Attachments */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <label className="cursor-pointer rounded-full border border-white/15 px-3.5 py-1.5 text-xs text-white/70 transition hover:border-cyan-400/50 hover:text-white">
            <Paperclip size={14} className="mr-1.5 inline" /> Attach files
            <input type="file" multiple className="hidden" onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />
          </label>
          {files.map((f, i) => (
            <span key={i} className="flex items-center gap-1.5 rounded-full bg-white/[0.06] px-3 py-1.5 text-xs text-white/80">
              <Paperclip size={12} className="inline" /> {f.filename}
              <button onClick={() => setFiles(files.filter((_, j) => j !== i))} className="text-white/40 hover:text-white">✕</button>
            </span>
          ))}
        </div>

        {/* Self-destruct */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="mr-1 inline-flex items-center gap-1 text-xs text-white/40"><Flame size={13} /> Self-destruct:</span>
          {DESTRUCT_OPTIONS.map((d) => (
            <button
              key={d.key}
              onClick={() => setDestruct(d.key)}
              className={`rounded-full px-3 py-1 text-xs transition ${
                destruct === d.key
                  ? "bg-gradient-to-r from-orange-500/30 to-red-500/25 font-semibold text-orange-200 shadow-[inset_0_0_0_1px_rgba(251,146,60,0.4)]"
                  : "text-white/45 hover:text-white"
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>
        )}

        <div className="mt-5 flex items-center justify-end gap-3">
          <button onClick={onClose} disabled={busy} className="rounded-xl px-4 py-3 text-sm text-white/50 transition hover:text-white">
            Discard
          </button>
          <button
            onClick={send}
            disabled={busy || sent}
            className="rounded-xl bg-gradient-to-r from-cyan-400 to-violet-500 px-6 py-3 text-sm font-semibold text-[#04070D] transition hover:shadow-[0_10px_32px_-8px_rgba(0,229,255,0.6)] disabled:opacity-60"
          >
            {sent ? "Sent ✓" : busy ? "Sending..." : "Send"}
          </button>
        </div>
        </div>
      </div>
    </div>
  );
}

function BrainTab() {
  const [briefing, setBriefing] = useState<Awaited<ReturnType<typeof api.brainBriefing>> | null>(null);
  const [health, setHealth] = useState<Awaited<ReturnType<typeof api.getInboxHealth>> | null>(null);
  const [briefErr, setBriefErr] = useState("");
  const [askQ, setAskQ] = useState("");
  const [askAnswer, setAskAnswer] = useState<Awaited<ReturnType<typeof api.brainAsk>> | null>(null);
  const [asking, setAsking] = useState(false);
  const [askErr, setAskErr] = useState("");

  useEffect(() => {
    api.brainBriefing().then(setBriefing).catch((e: Error) => setBriefErr(e.message ?? "Couldn't load briefing."));
    api.getInboxHealth().then(setHealth).catch(() => {});
  }, []);

  async function ask() {
    if (!askQ.trim()) return;
    setAsking(true);
    setAskErr("");
    try {
      setAskAnswer(await api.brainAsk(askQ));
    } catch (e: unknown) {
      setAskErr((e as Error).message ?? "Search failed.");
    } finally {
      setAsking(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl p-5 sm:p-8">
      <h1 className="text-center text-2xl font-bold tracking-tight">🧠 CyberBrain</h1>

      <div className="mt-5 rounded-3xl border border-cyan-500/40 px-6 py-8 text-center">
        <div className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">Since yesterday</div>
        <div className="mt-2 text-6xl font-extrabold text-white">{briefing?.newMessageCount ?? 0}</div>
        <div className="mt-1 text-base text-slate-400">new emails</div>
      </div>

      <div className="mt-5 rounded-3xl border border-violet-500/60 px-5 py-4">
        <div className="text-xs font-bold uppercase tracking-[0.2em] text-violet-400">Ask CyberBrain</div>
        <div className="mt-2 flex gap-2">
        <input
          value={askQ}
          onChange={(e) => setAskQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && ask()}
          placeholder="Search your inbox by meaning..."
          className="flex-1 bg-transparent text-base placeholder:text-white/70 focus:outline-none"
        />
        <button
          onClick={ask}
          disabled={asking}
          className="rounded-xl bg-gradient-to-r from-cyan-400 to-violet-500 px-5 py-3 text-sm font-semibold text-[#04070D] disabled:opacity-50"
        >
          {asking ? "..." : "Ask"}
        </button>
        </div>
      </div>

      {askErr && (
        <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{askErr}</div>
      )}
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

      {briefErr && (
        <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{briefErr}</div>
      )}
      {briefing && (
        <>
          <div className="mt-6 grid grid-cols-3 gap-3">
            <Stat n={briefing.newMessageCount} label="new (24h)" />
            <Stat n={briefing.overduePromises.length} label="overdue" />
            <Stat n={briefing.decisions.length} label="decisions" />
          </div>

          {health && (
            <Card className="mt-4">
              <CardTitle>💟 Inbox health</CardTitle>
              <div className="flex items-center gap-4">
                <div className="text-3xl font-bold text-cyan-300">{health.score}</div>
                <p className="text-sm text-white/70">{health.coaching}</p>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 border-t border-white/10 pt-3 text-center">
                <div><div className="text-sm font-semibold text-white/90">{health.metrics.inboundCount}</div><div className="text-[10px] uppercase tracking-widest text-white/35">in / 7d</div></div>
                <div><div className="text-sm font-semibold text-white/90">{health.metrics.outboundCount}</div><div className="text-[10px] uppercase tracking-widest text-white/35">out / 7d</div></div>
                <div><div className="text-sm font-semibold text-white/90">{Math.round(health.metrics.readRate * 100)}%</div><div className="text-[10px] uppercase tracking-widest text-white/35">read rate</div></div>
              </div>
            </Card>
          )}

          {briefing.newMessageCount === 0 &&
            briefing.overduePromises.length === 0 &&
            briefing.upcomingPromises.length === 0 &&
            briefing.decisions.length === 0 && (
            <Card className="mt-4">
              <p className="text-sm text-white/60">
                Your Brain learns from your mail. As messages arrive, briefings,
                promises, and decisions appear here automatically.
              </p>
            </Card>
          )}

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
const FOLDERS: { key: api.Folder; label: string; icon: React.ReactNode }[] = [
  { key: "inbox", label: "Inbox", icon: <Inbox size={17} /> },
  { key: "starred", label: "Starred", icon: <Star size={17} /> },
  { key: "sent", label: "Sent", icon: <Send size={17} /> },
  { key: "archive", label: "Archive", icon: <Archive size={17} /> },
  { key: "trash", label: "Trash", icon: <Trash2 size={17} /> },
];

// ─── Read-aloud (browser speech synthesis — free, on-device) ──────────
const AUTOREAD_KEY = "cybermail_autoread";

function getAutoRead(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(AUTOREAD_KEY) === "1";
}
function setAutoReadPref(v: boolean) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AUTOREAD_KEY, v ? "1" : "0");
}

function speechText(from: string, subject: string | null, body: string | null) {
  return `Message from ${displayName(from)}. Subject: ${subject || "no subject"}. ${body || "The message is empty."}`;
}

function MailView({
  inbox,
  folder,
  q,
  onCompose,
  onCountsChanged,
}: {
  inbox: api.Inbox;
  folder: api.Folder;
  q: string;
  onCompose: (p?: ComposePrefill) => void;
  onCountsChanged: () => void;
}) {
  const [messages, setMessages] = useState<api.MessageSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openId, setOpenId] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [autoRead, setAutoRead] = useState(false);
  useEffect(() => { setAutoRead(getAutoRead()); }, []);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const r = await api.listMessages(inbox.id, { folder, q: q || undefined });
      setMessages(r.messages);
    } catch (err: unknown) {
      setError((err as Error).message ?? "Couldn't load messages.");
    } finally {
      setLoading(false);
    }
  }
  // Reload when folder changes; debounce when searching
  useEffect(() => {
    setOpenId(null);
    const t = setTimeout(load, q ? 300 : 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inbox.id, folder, q]);

  async function act(id: number, patch: Parameters<typeof api.updateMessage>[1]) {
    try {
      await api.updateMessage(id, patch);
      load();
      onCountsChanged();
    } catch (err: unknown) {
      setError((err as Error).message ?? "Action failed.");
    }
  }
  async function destroy(id: number) {
    try {
      await api.deleteMessage(id);
      load();
      onCountsChanged();
    } catch (err: unknown) {
      setError((err as Error).message ?? "Delete failed.");
    }
  }

  const readingPane = openId !== null ? (
    <ReadingPane
      id={openId}
      onBack={() => { setOpenId(null); load(); onCountsChanged(); }}
      onAct={act}
      onReply={(m) =>
        onCompose({
          to: m.fromAddress,
          subject: m.subject?.startsWith("Re:") ? m.subject : `Re: ${m.subject ?? ""}`,
          text: `\n\n――― On ${new Date(m.sentAt ?? m.createdAt).toLocaleString()}, ${m.fromAddress} wrote:\n${(m.textBody ?? "").split("\n").map((l) => `> ${l}`).join("\n")}`,
        })
      }
      onForward={(m) =>
        onCompose({
          subject: m.subject?.startsWith("Fwd:") ? m.subject : `Fwd: ${m.subject ?? ""}`,
          text: `\n\n――― Forwarded message ―――\nFrom: ${m.fromAddress}\nDate: ${new Date(m.sentAt ?? m.createdAt).toLocaleString()}\nSubject: ${m.subject ?? ""}\n\n${m.textBody ?? ""}`,
        })
      }
    />
  ) : null;

  return (
    <div className="flex h-full min-h-0">
      {/* ── LIST COLUMN ── */}
      <div className={`min-h-0 w-full overflow-y-auto lg:w-[420px] lg:shrink-0 lg:border-r lg:border-white/[0.07] ${openId !== null ? "hidden lg:block" : "block"}`}>
      {/* Toolbar */}
      <div className="sticky top-0 z-10 flex h-12 items-center justify-between gap-3 border-b border-white/[0.07] bg-[#04070D]/90 px-4 backdrop-blur sm:px-6">
        <div className="text-sm font-semibold capitalize text-white/80">
          {q ? `Results for “${q}”` : folder}
          <span className="ml-2 text-xs font-normal text-white/35">{messages.length || ""}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => { const v = !autoRead; setAutoRead(v); setAutoReadPref(v); if (!v) window.speechSynthesis?.cancel(); }}
            title={autoRead ? "Auto-read is ON — messages are read aloud when opened" : "Auto-read is OFF"}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs transition ${
              autoRead
                ? "bg-gradient-to-r from-cyan-500/25 to-violet-500/20 font-semibold text-cyan-200 shadow-[inset_0_0_0_1px_rgba(0,229,255,0.3)]"
                : "text-white/45 hover:bg-white/[0.06] hover:text-white"
            }`}
          >
            {autoRead ? <Volume2 size={14} /> : <VolumeX size={14} />} Auto-read {autoRead ? "on" : "off"}
          </button>
          <button
            onClick={load}
            disabled={loading}
            title="Refresh"
            className="rounded-full p-2 text-white/50 transition hover:bg-white/[0.06] hover:text-white disabled:opacity-40"
          >
            <RotateCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {error && (
        <div className="m-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error} <button onClick={load} className="underline">Retry</button>
        </div>
      )}

      {/* Message list — Gmail-dense rows */}
      {!loading && !error && messages.length === 0 ? (
        folder === "inbox" && !q ? (
          <div className="mx-auto mt-16 max-w-sm px-6 text-center">
            <Inbox size={40} className="mx-auto text-white/25" />
            <p className="mt-4 text-white/60">Your inbox is live and listening.</p>
            <button
              onClick={() => {
                navigator.clipboard?.writeText(inbox.address);
                setCopied(true);
                setTimeout(() => setCopied(false), 1800);
              }}
              className="mt-3 rounded-full border border-cyan-400/25 bg-cyan-500/10 px-4 py-2 font-mono text-sm text-cyan-300 transition hover:border-cyan-400/50"
            >
              {copied ? "Copied ✓" : inbox.address}
            </button>
            <p className="mt-3 text-sm text-white/40">Mail sent here lands in seconds.</p>
          </div>
        ) : (
          <div className="mt-16 text-center text-white/40">
            {q ? `Nothing matches “${q}”.` : `Nothing in ${folder}.`}
          </div>
        )
      ) : (
        <div className="divide-y divide-white/[0.05]">
          {messages.map((m) => {
            const unread = m.read === false;
            const who = folder === "sent" ? `To: ${(m.toAddresses ?? []).join(", ")}` : displayName(m.fromAddress ?? m.from_address ?? "");
            return (
              <div
                key={m.id}
                className="group relative flex cursor-pointer items-start gap-3 px-4 py-3 transition hover:bg-white/[0.035] sm:px-6"
                onClick={() => setOpenId(m.id)}
              >
                {/* unread accent bar */}
                <span className={`absolute left-0 top-2 bottom-2 w-[3px] rounded-full ${unread ? "bg-gradient-to-b from-cyan-400 to-violet-500" : "bg-transparent"}`} />
                <Avatar name={who} seed={m.fromAddress ?? m.from_address ?? who} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className={`min-w-0 flex-1 truncate text-[15px] ${unread ? "font-semibold text-white" : "font-medium text-white/70"}`}>
                      {who}
                    </span>
                    {m.labels?.filter((l) => l.startsWith("via ")).map((l) => (
                      <span key={l} className="shrink-0 rounded-full bg-violet-500/15 px-2 py-0.5 text-[10px] font-semibold text-violet-300">{l.replace(/^via /, "")}</span>
                    ))}
                    {m.starred && <Star size={13} className="shrink-0 fill-amber-300 text-amber-300" />}
                    {m.hasAttachments && <Paperclip size={13} className="shrink-0 text-white/40" />}
                    <span className="shrink-0 text-xs tabular-nums text-white/40">{relDate(m.createdAt)}</span>
                  </div>
                  <div className={`mt-0.5 truncate text-[14px] ${unread ? "text-white/90" : "text-white/55"}`}>
                    {m.subject || "(no subject)"}
                  </div>
                  {m.summary && (
                    <div className="mt-0.5 line-clamp-1 text-[13px] leading-snug text-white/35">{m.summary}</div>
                  )}
                </div>
                {/* hover action cluster */}
                <div className="absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-0.5 rounded-full border border-white/10 bg-[#0b101b] px-1 py-0.5 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.8)] sm:group-hover:flex sm:right-5">
                  <IconBtn title={m.starred ? "Unstar" : "Star"} onClick={(e) => { e.stopPropagation(); act(m.id, { starred: !m.starred }); }}>
                    <Star size={15} className={m.starred ? "fill-amber-300 text-amber-300" : ""} />
                  </IconBtn>
                  {folder !== "archive" && folder !== "trash" && folder !== "sent" && (
                    <IconBtn title="Archive" onClick={(e) => { e.stopPropagation(); act(m.id, { folder: "archive" }); }}><Archive size={15} /></IconBtn>
                  )}
                  {folder !== "trash" ? (
                    <IconBtn title="Trash" onClick={(e) => { e.stopPropagation(); act(m.id, { folder: "trash" }); }}><Trash2 size={15} /></IconBtn>
                  ) : (
                    <>
                      <IconBtn title="Restore" onClick={(e) => { e.stopPropagation(); act(m.id, { folder: "inbox" }); }}><Undo2 size={15} /></IconBtn>
                      <IconBtn title="Delete forever" onClick={(e) => { e.stopPropagation(); destroy(m.id); }}><X size={15} /></IconBtn>
                    </>
                  )}
                  <IconBtn title={unread ? "Mark read" : "Mark unread"} onClick={(e) => { e.stopPropagation(); act(m.id, { read: unread }); }}>
                    {unread ? <MailOpen size={15} /> : <Mail size={15} />}
                  </IconBtn>
                </div>
              </div>
            );
          })}
        </div>
      )}
      </div>{/* end list column */}

      {/* ── READING COLUMN ── */}
      <div className={`min-h-0 flex-1 overflow-y-auto ${openId !== null ? "block" : "hidden lg:block"}`}>
        {readingPane ?? (
          <div className="flex h-full flex-col items-center justify-center px-8 text-center">
            <Mail size={40} className="text-white/15" />
            <p className="mt-4 text-sm text-white/40">Select a message to read it here.</p>
          </div>
        )}
      </div>
    </div>
  );
}

const AVATAR_HUES = [188, 262, 330, 32, 152, 210, 0, 280, 100];
function Avatar({ name, seed }: { name: string; seed: string }) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const hue = AVATAR_HUES[h % AVATAR_HUES.length];
  return (
    <div
      className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white sm:flex"
      style={{ background: `linear-gradient(135deg, hsl(${hue} 70% 45%), hsl(${(hue + 40) % 360} 70% 35%))` }}
    >
      {(name[0] || "?").toUpperCase()}
    </div>
  );
}

function displayName(addr: string) {
  const m = addr.match(/^(.*?)\s*<.*>$/);
  if (m && m[1]) return m[1].trim();
  return addr.split("@")[0] || addr;
}

function relDate(iso: string) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  if (d.getFullYear() === now.getFullYear()) return d.toLocaleDateString([], { month: "short", day: "numeric" });
  return d.toLocaleDateString([], { year: "numeric", month: "short", day: "numeric" });
}

function IconBtn({ title, onClick, children }: { title: string; onClick: (e: React.MouseEvent) => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="rounded-full p-1.5 text-sm text-white/50 transition hover:bg-white/[0.08] hover:text-white"
    >
      {children}
    </button>
  );
}

// ─── Reading pane — Gmail-style message view ──────────────────────────
type FullMessage = Awaited<ReturnType<typeof api.getMessage>>["message"];

function ReadingPane({
  id,
  onBack,
  onAct,
  onReply,
  onForward,
}: {
  id: number;
  onBack: () => void;
  onAct: (id: number, patch: Parameters<typeof api.updateMessage>[1]) => Promise<void>;
  onReply: (m: FullMessage) => void;
  onForward: (m: FullMessage) => void;
}) {
  const [msg, setMsg] = useState<FullMessage | null>(null);
  const [error, setError] = useState("");
  const [speech, setSpeech] = useState<"idle" | "playing" | "paused">("idle");

  useEffect(() => {
    api.getMessage(id)
      .then((r) => setMsg(r.message))
      .catch((err: unknown) => setError((err as Error).message ?? "Couldn't open this message."));
  }, [id]);

  // Stop speaking when leaving the message
  useEffect(() => () => { window.speechSynthesis?.cancel(); }, [id]);

  function startSpeaking(m: FullMessage, spokenBody: string | null) {
    const synth = window.speechSynthesis;
    if (!synth) return;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(speechText(m.fromAddress, m.subject, spokenBody));
    u.rate = 1.02;
    u.onend = () => setSpeech("idle");
    u.onerror = () => setSpeech("idle");
    synth.speak(u);
    setSpeech("playing");
  }

  function toggleSpeech(m: FullMessage, spokenBody: string | null) {
    const synth = window.speechSynthesis;
    if (!synth) return;
    if (speech === "playing") { synth.pause(); setSpeech("paused"); }
    else if (speech === "paused") { synth.resume(); setSpeech("playing"); }
    else startSpeaking(m, spokenBody);
  }

  const body =
    msg?.textBody ??
    (msg?.htmlBody
      ? msg.htmlBody
          .replace(/<style[\s\S]*?<\/style>/gi, "")
          .replace(/<script[\s\S]*?<\/script>/gi, "")
          .replace(/<br\s*\/?>/gi, "\n")
          .replace(/<\/p>/gi, "\n\n")
          .replace(/<[^>]+>/g, "")
          .replace(/&nbsp;/g, " ")
          .replace(/&amp;/g, "&")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .trim()
      : null);

  const initial = (displayName(msg?.fromAddress ?? "?")[0] || "?").toUpperCase();

  // Auto-read on open (after the message and body are ready)
  const autoTriggered = typeof window !== "undefined" && getAutoRead();
  useEffect(() => {
    if (msg && autoTriggered) startSpeaking(msg, body);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [msg]);

  return (
    <div>
      {/* Toolbar */}
      <div className="flex h-12 items-center gap-1 border-b border-white/[0.07] px-3 sm:px-5">
        <IconBtn title="Back" onClick={onBack}><ArrowLeft size={18} /></IconBtn>
        <div className="mx-1 h-5 w-px bg-white/10" />
        <IconBtn title="Archive" onClick={async () => { await onAct(id, { folder: "archive" }); onBack(); }}><Archive size={17} /></IconBtn>
        <IconBtn title="Trash" onClick={async () => { await onAct(id, { folder: "trash" }); onBack(); }}><Trash2 size={17} /></IconBtn>
        <IconBtn title="Mark unread" onClick={async () => { await onAct(id, { read: false }); onBack(); }}><MailOpen size={17} /></IconBtn>
      </div>

      {error && (
        <div className="m-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>
      )}
      {!msg && !error && <div className="p-8 text-white/40">Opening...</div>}
      {msg && (
        <div className="mx-auto max-w-3xl px-4 py-6 sm:px-8">
          <h1 className="text-[1.4rem] font-semibold leading-snug tracking-tight">{msg.subject || "(no subject)"}</h1>

          {/* Sender card */}
          <div className="mt-5 flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 font-semibold text-[#04070D]">
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline gap-x-2">
                <strong className="text-[15px] text-white">{displayName(msg.fromAddress)}</strong>
                <span className="truncate font-mono text-xs text-white/40">{msg.fromAddress.replace(/^.*</, "<")}</span>
              </div>
              <div className="text-xs text-white/45">to {msg.toAddresses.join(", ")}</div>
            </div>
            <span className="shrink-0 text-xs text-white/40">{new Date(msg.sentAt ?? msg.createdAt).toLocaleString()}</span>
            <button
              onClick={() => toggleSpeech(msg, body)}
              title={speech === "playing" ? "Pause reading" : "Read this email aloud"}
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition ${
                speech !== "idle"
                  ? "bg-gradient-to-r from-cyan-400 to-violet-500 text-[#04070D] shadow-[0_4px_16px_-4px_rgba(0,229,255,0.6)]"
                  : "border border-white/15 text-white/70 hover:border-cyan-400/50 hover:text-white"
              }`}
            >
              {speech === "playing" ? <Pause size={15} /> : <Play size={15} className="ml-0.5" />}
            </button>
            {speech !== "idle" && (
              <button
                onClick={() => { window.speechSynthesis?.cancel(); setSpeech("idle"); }}
                title="Stop"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 text-white/70 transition hover:border-red-400/50 hover:text-red-300"
              >
                <Square size={13} />
              </button>
            )}
          </div>

          {msg.viewOnce && (
            <div className="mt-4 rounded-xl border border-orange-500/30 bg-orange-500/10 px-4 py-2.5 text-sm text-orange-200">
              🔥 View-once message — it burns when you leave this screen.
            </div>
          )}
          {msg.expiresAt && !msg.viewOnce && (
            <div className="mt-4 rounded-xl border border-orange-500/20 bg-orange-500/[0.06] px-4 py-2.5 text-xs text-orange-200/80">
              🔥 Self-destructs {new Date(msg.expiresAt).toLocaleString()}
            </div>
          )}

          {/* Body */}
          <div className="mt-6 whitespace-pre-wrap text-[15px] leading-relaxed text-white/90">
            {body ?? <span className="text-white/40">(empty message)</span>}
          </div>

          {/* Attachments */}
          {(msg.attachments?.length ?? 0) > 0 && (
            <div className="mt-6 flex flex-wrap gap-2 border-t border-white/10 pt-4">
              {msg.attachments!.map((a) => (
                <button
                  key={a.id}
                  onClick={() => api.downloadAttachment(a.id, a.filename).catch(() => setError("Download failed."))}
                  className="flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2.5 text-sm text-white/85 transition hover:border-cyan-400/50 hover:text-white"
                >
                  <Download size={15} /> {a.filename}
                  <span className="text-xs text-white/40">{(a.size / 1024).toFixed(0)} KB</span>
                </button>
              ))}
            </div>
          )}

          {/* Reply / Forward */}
          <div className="mt-8 flex gap-2">
            <button
              onClick={() => onReply(msg)}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-2.5 text-sm font-medium text-white/85 transition hover:border-cyan-400/50 hover:text-white"
            >
              <Reply size={16} /> Reply
            </button>
            <button
              onClick={() => onForward(msg)}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-2.5 text-sm font-medium text-white/85 transition hover:border-cyan-400/50 hover:text-white"
            >
              <Forward size={16} /> Forward
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Assistant: talk to your email ────────────────────────────────────
type ChatMsg = { role: "user" | "assistant"; content: string; actions?: api.AssistantAction[] };

const ASSIST_SUGGESTIONS = [
  "Summarize my unread mail",
  "Find a news article about AI and email it to ",
  "Email bob@cybrmail.net that I'm running 10 minutes late",
  "What did I get from Alice this week?",
];

function actionChip(a: api.AssistantAction) {
  const label =
    a.tool === "send_email" ? `📧 Sent “${(a.input as { subject?: string })?.subject ?? "email"}” to ${((a.input as { to?: string[] })?.to ?? []).join(", ")}` :
    a.tool === "web_search" ? `🌐 Searched the web: “${(a.input as { query?: string })?.query ?? ""}”` :
    a.tool === "search_mail" ? `📨 Searched your mail: “${(a.input as { query?: string })?.query ?? ""}”` :
    a.tool === "read_message" ? `📖 Read a message` : a.tool;
  return a.ok ? label : `⚠️ ${label} — ${a.error}`;
}

function AssistantView({ address }: { address: string }) {
  const [msgs, setMsgs] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);

  async function send(text?: string) {
    const content = (text ?? input).trim();
    if (!content || busy) return;
    const next: ChatMsg[] = [...msgs, { role: "user", content }];
    setMsgs(next);
    setInput("");
    setBusy(true);
    try {
      const r = await api.assistantChat(next.map(({ role, content }) => ({ role, content })));
      setMsgs([...next, { role: "assistant", content: r.reply, actions: r.actions }]);
    } catch (e: unknown) {
      setMsgs([...next, { role: "assistant", content: `⚠️ ${(e as Error).message ?? "Something went wrong."}` }]);
    } finally {
      setBusy(false);
    }
  }

  function mic() {
    const W = window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionLike; SpeechRecognition?: new () => SpeechRecognitionLike };
    const Ctor = W.SpeechRecognition ?? W.webkitSpeechRecognition;
    if (!Ctor) { setMsgs((m) => [...m, { role: "assistant", content: "Voice input isn't supported in this browser — type your command instead." }]); return; }
    const rec = new Ctor();
    rec.lang = navigator.language || "en-US";
    rec.interimResults = false;
    rec.onresult = (e) => {
      const t = e.results?.[0]?.[0]?.transcript;
      if (t) send(t);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    setListening(true);
    rec.start();
  }

  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col p-4 sm:p-6">
      <h1 className="flex items-center gap-2.5 text-2xl font-bold tracking-tight"><Sparkles size={24} className="text-cyan-300" /> Assistant</h1>
      <p className="mt-1 text-sm text-white/55">
        Talk to your email. It can search your mail, find things on the web, and send email as {address}.
      </p>

      <div className="mt-5 flex-1 space-y-4 overflow-y-auto pb-4">
        {msgs.length === 0 && (
          <div className="space-y-2">
            <div className="text-xs uppercase tracking-widest text-white/35">Try saying</div>
            <div className="flex flex-wrap gap-2">
              {ASSIST_SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => (s.endsWith(" ") ? setInput(s) : send(s))}
                  className="rounded-full border border-white/12 px-3.5 py-2 text-left text-xs text-white/70 transition hover:border-cyan-400/50 hover:text-white"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {msgs.map((m, i) => (
          <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                m.role === "user"
                  ? "bg-gradient-to-r from-cyan-500/25 to-violet-500/20 text-white"
                  : "border border-white/10 bg-white/[0.03] text-white/90"
              }`}
            >
              <div className="whitespace-pre-wrap">{m.content}</div>
              {m.actions && m.actions.length > 0 && (
                <div className="mt-2.5 space-y-1 border-t border-white/10 pt-2">
                  {m.actions.map((a, j) => (
                    <div key={j} className="text-xs text-cyan-300/80">{actionChip(a)}</div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {busy && (
          <div className="flex items-center gap-2 text-sm text-white/40">
            <span className="h-2 w-2 animate-ping rounded-full bg-cyan-400" /> Working…
          </div>
        )}
      </div>

      <div className="flex items-end gap-2 border-t border-white/[0.07] pt-4">
        <button
          onClick={mic}
          title="Speak your command"
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition ${
            listening
              ? "animate-pulse bg-gradient-to-r from-red-500 to-orange-500 text-white"
              : "border border-white/15 text-white/70 hover:border-cyan-400/50 hover:text-white"
          }`}
        >
          <Mic size={18} />
        </button>
        <textarea
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="Tell your email what to do…"
          className="max-h-32 min-h-[2.75rem] flex-1 resize-none rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm placeholder:text-white/30 focus:border-cyan-400/50 focus:outline-none"
        />
        <button
          onClick={() => send()}
          disabled={busy || !input.trim()}
          className="h-11 shrink-0 rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 px-6 text-sm font-semibold text-[#04070D] disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
}

interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  onresult: ((e: { results?: { [i: number]: { [j: number]: { transcript?: string } } } }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
}

// ─── Burners: disposable addresses ────────────────────────────────────
function BurnersView() {
  const [burners, setBurners] = useState<api.Burner[]>([]);
  const [label, setLabel] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const load = () => api.listBurners().then((r) => setBurners(r.burners)).catch((e: Error) => setError(e.message));
  useEffect(() => { load(); }, []);

  async function create() {
    setBusy(true);
    setError("");
    try {
      await api.createBurner(label.trim() || undefined);
      setLabel("");
      load();
    } catch (e: unknown) {
      setError((e as Error).message ?? "Couldn't create burner.");
    } finally {
      setBusy(false);
    }
  }

  function copy(b: api.Burner) {
    navigator.clipboard?.writeText(b.address);
    setCopiedId(b.id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  return (
    <div className="mx-auto max-w-3xl p-6 sm:p-8">
      <h1 className="flex items-center gap-2.5 text-2xl font-bold tracking-tight"><Drama size={24} className="text-cyan-300" /> Burner addresses</h1>
      <p className="mt-2 text-sm text-white/55">
        Disposable addresses that forward to your inbox. Give them to newsletters,
        sign-ups, anyone you don&apos;t fully trust — kill one and its mail bounces forever.
      </p>

      <div className="mt-6 flex gap-2">
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && create()}
          placeholder="Label (e.g. “newsletter sign-ups”) — optional"
          className="flex-1 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm placeholder:text-white/30 focus:border-cyan-400/50 focus:outline-none"
        />
        <button
          onClick={create}
          disabled={busy}
          className="rounded-xl bg-gradient-to-r from-cyan-400 to-violet-500 px-5 py-3 text-sm font-semibold text-[#04070D] disabled:opacity-50"
        >
          {busy ? "..." : <span className="inline-flex items-center gap-1.5"><Plus size={15} /> New burner</span>}
        </button>
      </div>

      {error && <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>}

      <div className="mt-6 space-y-2">
        {burners.length === 0 && (
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-8 text-center text-white/40">
            No burners yet. Create one and watch the spam stay out of your real inbox.
          </div>
        )}
        {burners.map((b) => (
          <div key={b.id} className={`flex flex-wrap items-center gap-3 rounded-xl border p-4 ${b.active ? "border-white/10 bg-white/[0.02]" : "border-white/5 bg-white/[0.01] opacity-60"}`}>
            <button onClick={() => copy(b)} className="font-mono text-sm text-cyan-300 transition hover:text-cyan-200">
              {copiedId === b.id ? "Copied ✓" : b.address}
            </button>
            {b.label && <span className="text-xs text-white/45">{b.label}</span>}
            <span className={`ml-auto rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${b.active ? "bg-emerald-500/15 text-emerald-300" : "bg-white/[0.06] text-white/40"}`}>
              {b.active ? "Active" : "Killed"}
            </span>
            <button
              onClick={() => api.setBurnerActive(b.id, !b.active).then(load)}
              className={`rounded-full border px-4 py-1.5 text-xs transition ${b.active ? "border-red-400/30 text-red-300 hover:border-red-400/70" : "border-white/15 text-white/60 hover:border-cyan-400/50 hover:text-white"}`}
            >
              {b.active ? "Kill" : "Revive"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Agents: AI citizens with their own address + API key ─────────────
function AgentsView() {
  const [agents, setAgents] = useState<api.Agent[]>([]);
  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [newKey, setNewKey] = useState<{ key: string; address: string } | null>(null);
  const [keyCopied, setKeyCopied] = useState(false);

  const load = () => api.listAgents().then((r) => setAgents(r.agents)).catch((e: Error) => setError(e.message));
  useEffect(() => { load(); }, []);

  async function create() {
    if (!name.trim() || !handle.trim()) { setError("Give your agent a name and a handle."); return; }
    setBusy(true);
    setError("");
    try {
      const r = await api.createAgent(name.trim(), handle.trim());
      setNewKey({ key: r.apiKey, address: r.agent.address });
      setName("");
      setHandle("");
      load();
    } catch (e: unknown) {
      setError((e as Error).message ?? "Couldn't create agent.");
    } finally {
      setBusy(false);
    }
  }

  const apiBase = process.env.NEXT_PUBLIC_API_BASE || "https://api.cybrmail.net";

  return (
    <div className="mx-auto max-w-3xl p-6 sm:p-8">
      <h1 className="flex items-center gap-2.5 text-2xl font-bold tracking-tight"><Bot size={24} className="text-cyan-300" /> AI Agents</h1>
      <p className="mt-2 text-sm text-white/55">
        Give any AI agent its own @cybrmail.net address and API key. Agents send,
        read, and reply to mail programmatically — email becomes their interface.
      </p>

      <div className="mt-6 grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Agent name (e.g. “Research Bot”)"
          className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm placeholder:text-white/30 focus:border-cyan-400/50 focus:outline-none"
        />
        <div className="flex items-stretch overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] focus-within:border-cyan-400/50">
          <input
            value={handle}
            onChange={(e) => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9.]/g, "").slice(0, 30))}
            placeholder="handle"
            className="min-w-0 flex-1 bg-transparent px-4 py-3 font-mono text-sm placeholder:text-white/25 focus:outline-none"
          />
          <span className="flex select-none items-center border-l border-white/10 px-3 font-mono text-xs text-cyan-300/70">@cybrmail.net</span>
        </div>
        <button
          onClick={create}
          disabled={busy}
          className="rounded-xl bg-gradient-to-r from-cyan-400 to-violet-500 px-5 py-3 text-sm font-semibold text-[#04070D] disabled:opacity-50"
        >
          {busy ? "..." : <span className="inline-flex items-center gap-1.5"><Plus size={15} /> Create agent</span>}
        </button>
      </div>

      {error && <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>}

      {newKey && (
        <div className="mt-4 rounded-xl border border-cyan-400/30 bg-cyan-500/[0.07] p-5">
          <div className="text-sm font-semibold text-white">🔑 API key for {newKey.address}</div>
          <p className="mt-1 text-xs text-amber-300/90">Shown once — copy it now. Only a hash is stored.</p>
          <div className="mt-3 flex items-center gap-2">
            <code className="min-w-0 flex-1 truncate rounded-lg bg-black/40 px-3 py-2.5 font-mono text-xs text-cyan-200">{newKey.key}</code>
            <button
              onClick={() => { navigator.clipboard?.writeText(newKey.key); setKeyCopied(true); setTimeout(() => setKeyCopied(false), 1500); }}
              className="shrink-0 rounded-lg border border-cyan-400/40 px-4 py-2.5 text-xs text-cyan-200 transition hover:bg-cyan-500/15"
            >
              {keyCopied ? "Copied ✓" : "Copy"}
            </button>
          </div>
          <details className="mt-3">
            <summary className="cursor-pointer text-xs text-white/50 hover:text-white/80">Show your agent how to use it</summary>
            <pre className="mt-2 overflow-x-auto rounded-lg bg-black/40 p-3 text-[11px] leading-relaxed text-white/70">{`# Send mail as the agent
curl -X POST ${apiBase}/api/send \\
  -H "Authorization: Bearer ${newKey.key.slice(0, 12)}..." \\
  -H "Content-Type: application/json" \\
  -d '{"inboxId": <inboxId>, "to": ["someone@cybrmail.net"],
       "subject": "Hello", "text": "Sent by an agent."}'

# Read its inbox
curl ${apiBase}/api/inboxes/<inboxId>/messages \\
  -H "Authorization: Bearer ${newKey.key.slice(0, 12)}..."

# Who am I
curl ${apiBase}/api/agent/me -H "Authorization: Bearer ..."`}</pre>
          </details>
          <button onClick={() => setNewKey(null)} className="mt-3 text-xs text-white/40 hover:text-white/70">Dismiss</button>
        </div>
      )}

      <div className="mt-6 space-y-2">
        {agents.length === 0 && !newKey && (
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-8 text-center text-white/40">
            No agents yet. Create one and let your AI handle the mail.
          </div>
        )}
        {agents.map((a) => (
          <div key={a.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-400 to-cyan-400 text-sm font-bold text-[#04070D]">
              {a.name[0]?.toUpperCase() ?? "A"}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-white">{a.name}</div>
              <div className="truncate font-mono text-xs text-cyan-300/80">{a.address}</div>
            </div>
            <span className="ml-auto font-mono text-[10px] text-white/30">{a.keyPrefix}…</span>
            <button
              onClick={() => api.deleteAgent(a.id).then(load)}
              className="rounded-full border border-red-400/30 px-4 py-1.5 text-xs text-red-300 transition hover:border-red-400/70"
            >
              Revoke key
            </button>
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
      <h1 className="flex items-center gap-2.5 text-3xl font-bold tracking-tight"><Calendar size={26} className="text-cyan-300" /> Calendar</h1>
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
