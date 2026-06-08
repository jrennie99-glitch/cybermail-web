/**
 * Web-side API client. Shares the same backend as iOS — all endpoints live
 * at NEXT_PUBLIC_API_BASE (default: https://api.cybrmail.net).
 *
 * Token storage: localStorage (web equivalent of iOS Keychain — encrypted
 * by the browser's profile, but not as secure as native keychain).
 */
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://api.cybrmail.net";
const TOKEN_KEY = "cybermail_token";

export class ApiError extends Error {
  status: number;
  body: unknown;
  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(t: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOKEN_KEY, t);
}

export function clearToken(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
}

export function hasToken(): boolean {
  return !!getToken();
}

interface RequestOpts {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  noAuth?: boolean;
}

async function request<T = unknown>(path: string, opts: RequestOpts = {}): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (!opts.noAuth) {
    const t = getToken();
    if (t) headers.Authorization = `Bearer ${t}`;
  }
  const res = await fetch(`${API_BASE}${path}`, {
    method: opts.method ?? "GET",
    headers,
    body: opts.body != null ? JSON.stringify(opts.body) : undefined,
  });
  let data: unknown = {};
  try { data = await res.json(); } catch {}
  if (!res.ok) {
    throw new ApiError((data as { error?: string })?.error ?? `HTTP ${res.status}`, res.status, data);
  }
  return data as T;
}

// Auth
export const login = async (email: string, password: string) => {
  const r = await request<{ token?: string; user?: unknown; twoFactorRequired?: boolean; preToken?: string }>(
    "/api/auth/login",
    { method: "POST", body: { email, password }, noAuth: true }
  );
  if (r.token) setToken(r.token);
  return r;
};

export const signup = async (email: string, password: string, name?: string) => {
  const r = await request<{ token: string; user: unknown }>("/api/auth/signup", {
    method: "POST",
    body: { email, password, name },
    noAuth: true,
  });
  if (r.token) setToken(r.token);
  return r;
};

export const logout = async () => {
  try { await request("/api/auth/logout", { method: "POST" }); } catch {}
  clearToken();
};

export const getMe = () => request<{ user: { id: number; email: string; name: string | null; plan: string; emailVerified?: boolean } }>("/api/auth/me");

// Inboxes + messages
export const listInboxes = () => request<{ inboxes: Array<{ id: number; address: string; displayName: string | null }> }>("/api/inboxes");
export const listMessages = (inboxId: number, limit = 50) =>
  request<{ messages: Array<{ id: number; subject: string; from_address?: string; fromAddress: string; summary?: string | null; createdAt: string; labels: string[] }> }>(
    `/api/inboxes/${inboxId}/messages?limit=${limit}`
  );
export const getMessage = (id: number) =>
  request<{ message: { id: number; subject: string | null; fromAddress: string; toAddresses: string[]; textBody: string | null; htmlBody: string | null; createdAt: string; sentAt: string | null; labels: string[] } }>(
    `/api/messages/${id}`
  );

// Brain
export const brainBriefing = () => request<{
  newMessageCount: number;
  overduePromises: Array<{ id: number; text: string; dueAt: string | null }>;
  upcomingPromises: Array<{ id: number; text: string; dueAt: string | null }>;
  decisions: Array<{ id: number; summary: string | null; text: string; createdAt: string }>;
  topSenders: Array<{ from_address: string; n: number }>;
}>("/api/brain/briefing");

export const brainAsk = (q: string) =>
  request<{ mode: string; answerText: string; results: Array<{ id: number; subject: string | null; from_address: string; summary: string | null; created_at: string }> }>(
    "/api/brain/ask",
    { method: "POST", body: { q } }
  );

// Calendar
export const listEvents = (from: Date, to: Date) =>
  request<{ events: Array<{ id: number; title: string; startsAt: string; endsAt: string; kind: string; location: string | null; suggested: boolean }>; attendees: Array<{ eventId: number; email: string; rsvp: string }> }>(
    `/api/calendar/events?from=${from.toISOString()}&to=${to.toISOString()}`
  );

// Wellbeing
export const getInboxHealth = () =>
  request<{ score: number; coaching: string; metrics: { inboundCount: number; outboundCount: number; readRate: number; spamCount: number; avgResponseMinutes: number } }>(
    "/api/wellbeing/inbox-health"
  );

// Send
export const sendEmail = (opts: { inboxId: number; to: string[]; subject: string; text: string; selfDestruct?: { hours?: number; viewOnce?: boolean } }) =>
  request("/api/send", { method: "POST", body: opts });

// ─── Web3: Sign in with Ethereum (SIWE) ─────────────────────────────────
export const web3Challenge = (wallet: string) =>
  request<{ nonce: string; message: string; expiresAt: string }>("/api/web3/challenge", {
    method: "POST",
    body: { wallet },
  });

export const web3Verify = (wallet: string, signature: string, unstoppableDomain?: string) =>
  request<{ ok: true; token: string; user: { id: number; email: string; name: string | null; plan: string } }>(
    "/api/web3/verify",
    { method: "POST", body: { wallet, signature, ...(unstoppableDomain ? { unstoppableDomain } : {}) } }
  );

// Sign in with Ethereum end-to-end: pops MetaMask, signs SIWE message, logs in.
export async function signInWithEthereum(): Promise<{ ok: true; token: string; user: { email: string } }> {
  const eth = (typeof window !== "undefined" ? (window as any).ethereum : null);
  if (!eth) throw new Error("No Ethereum wallet detected. Install MetaMask or use a Web3 browser.");
  const accounts: string[] = await eth.request({ method: "eth_requestAccounts" });
  if (!accounts || accounts.length === 0) throw new Error("No wallet account selected.");
  const wallet = accounts[0];
  const { message } = await web3Challenge(wallet);
  const signature: string = await eth.request({
    method: "personal_sign",
    params: [message, wallet],
  });
  const result = await web3Verify(wallet, signature);
  setToken(result.token);
  return { ok: true, token: result.token, user: { email: result.user.email } };
}

// Verify email with 6-digit code
export const verifyEmail = (code: string) =>
  request<{ ok: true; alreadyVerified?: boolean }>("/api/auth/verify-email", { method: "POST", body: { code } });

export const resendVerificationCode = () =>
  request<{ ok: true }>("/api/auth/verify-email/resend", { method: "POST" });

// OAuth provider availability + redirects
export const getAuthProviders = () =>
  request<{ apple: boolean; google: boolean; github: boolean }>("/api/auth/providers");

export const oauthRedirect = (provider: "apple" | "google" | "github") => {
  const base = (process.env.NEXT_PUBLIC_API_BASE || "https://api.cybrmail.net").replace(/\/$/, "");
  if (typeof window !== "undefined") window.location.href = `${base}/api/auth/${provider}/start`;
};
