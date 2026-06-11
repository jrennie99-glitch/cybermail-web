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
  if (res.status === 429) {
    // Edge rate-limit (e.g. Cloudflare). Wait and retry once before failing.
    await new Promise((r) => setTimeout(r, 1500));
    const retry = await fetch(`${API_BASE}${path}`, {
      method: opts.method ?? "GET",
      headers,
      body: opts.body != null ? JSON.stringify(opts.body) : undefined,
    });
    if (retry.ok) return retry.json() as Promise<T>;
    throw Object.assign(new Error("The server's edge protection is throttling requests (HTTP 429). Wait a few seconds and try again — and if this keeps happening, turn off Cloudflare proxying/Bot Fight Mode for api.cybrmail.net."), { status: 429 });
  }
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

/** Sign up by creating a brand-new @cybrmail.net address as the account. */
export const signupWithHandle = async (handle: string, password: string, name?: string) => {
  const r = await request<{ token: string; user: unknown; inbox: Inbox }>("/api/auth/signup", {
    method: "POST",
    body: { handle, password, name },
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
export interface Inbox { id: number; address: string; displayName: string | null; unread?: number }
export const listInboxes = () => request<{ inboxes: Inbox[] }>("/api/inboxes");

/**
 * Live availability check for a handle. Returns suggestions when taken,
 * reserved, or invalid.
 */
export const checkHandle = (username: string) =>
  request<{ available: boolean; address?: string; reason?: string; suggestions?: string[] }>(
    `/api/inboxes/check?username=${encodeURIComponent(username)}`
  );

/**
 * Claim an @cybrmail.net address. Sends both `username` and full `address`
 * so the backend can accept either shape. Backend errors (taken, invalid,
 * endpoint missing) surface as ApiError with the server's message.
 */
export const createInbox = (username: string) =>
  request<{ inbox: Inbox }>("/api/inboxes", {
    method: "POST",
    body: { username, address: `${username}@cybrmail.net` },
  });
export type Folder = "inbox" | "starred" | "sent" | "archive" | "trash";

export interface MessageSummary {
  id: number; subject: string | null; from_address?: string; fromAddress: string;
  toAddresses?: string[]; summary?: string | null; createdAt: string; labels: string[];
  read?: boolean; starred?: boolean; folder?: string; hasAttachments?: boolean;
}

export const listMessages = (inboxId: number, opts: { folder?: Folder; q?: string; limit?: number } = {}) => {
  const p = new URLSearchParams();
  p.set("limit", String(opts.limit ?? 50));
  if (opts.folder) p.set("folder", opts.folder);
  if (opts.q) p.set("q", opts.q);
  return request<{ messages: MessageSummary[] }>(`/api/inboxes/${inboxId}/messages?${p}`);
};

export const updateMessage = (id: number, patch: { starred?: boolean; read?: boolean; folder?: "inbox" | "sent" | "archive" | "trash" }) =>
  request<{ ok: true }>(`/api/messages/${id}`, { method: "PATCH", body: patch });

export const deleteMessage = (id: number) =>
  request<{ ok: true }>(`/api/messages/${id}`, { method: "DELETE" });

export const getMessage = (id: number) =>
  request<{ message: { id: number; subject: string | null; fromAddress: string; toAddresses: string[]; textBody: string | null; htmlBody: string | null; createdAt: string; sentAt: string | null; labels: string[]; starred?: boolean; folder?: string; attachments?: { id: number; filename: string; mime: string; size: number }[]; viewOnce?: boolean; expiresAt?: string | null } }>(
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
export interface OutAttachment { filename: string; mime: string; dataBase64: string }
export const sendEmail = (opts: {
  inboxId: number; to: string[]; subject: string; text: string;
  html?: string;
  attachments?: OutAttachment[];
  selfDestruct?: { hours?: number; viewOnce?: boolean };
}) => request<{ ok: true; messageId: number }>("/api/send", { method: "POST", body: opts });

// Authenticated attachment download → object URL
export async function downloadAttachment(id: number, filename: string) {
  const t = typeof window !== "undefined" ? window.localStorage.getItem("cybermail_token") : null;
  const res = await fetch(`${API_BASE}/api/attachments/${id}`, {
    headers: t ? { Authorization: `Bearer ${t}` } : {},
  });
  if (!res.ok) throw new ApiError(`Download failed (${res.status})`, res.status, null);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

// ─── Connection diagnostics ───
export const API_BASE_URL = API_BASE;
export async function healthCheck(): Promise<{ reachable: boolean; detail: string }> {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 6000);
    const res = await fetch(`${API_BASE}/api/health`, { signal: ctrl.signal });
    clearTimeout(t);
    if (!res.ok) return { reachable: false, detail: `Server answered with HTTP ${res.status} — wrong app may be attached to this domain.` };
    await res.json();
    return { reachable: true, detail: "Connected" };
  } catch {
    return { reachable: false, detail: `No response from ${API_BASE} — the backend container isn't reachable (check it's running, port set to 8080, and the domain is attached with HTTPS).` };
  }
}

// ─── Demo mode ───
export const demoLogin = async () => {
  const r = await request<{ token: string; user: unknown; address: string }>("/api/demo", {
    method: "POST",
    noAuth: true,
  });
  if (r.token) setToken(r.token);
  return r;
};

// ─── Assistant ───
export interface AssistantAction { tool: string; input?: Record<string, unknown>; ok: boolean; error?: string }
export const assistantChat = (messages: { role: "user" | "assistant"; content: string }[]) =>
  request<{ reply: string; actions: AssistantAction[] }>("/api/assistant/chat", {
    method: "POST",
    body: { messages },
  });

// ─── Burners ───
export interface Burner { id: number; address: string; label: string | null; active: boolean; createdAt?: string }
export const createBurner = (label?: string) =>
  request<{ burner: Burner }>("/api/burners", { method: "POST", body: { label } });
export const listBurners = () => request<{ burners: Burner[] }>("/api/burners");
export const setBurnerActive = (id: number, active: boolean) =>
  request<{ ok: true }>(`/api/burners/${id}`, { method: "PATCH", body: { active } });

// ─── Agents ───
export interface Agent { id: number; name: string; address: string; inboxId: number; keyPrefix: string; createdAt?: string }
export const createAgent = (name: string, handle: string) =>
  request<{ agent: Agent; apiKey: string }>("/api/agents", { method: "POST", body: { name, handle } });
export const listAgents = () => request<{ agents: Agent[] }>("/api/agents");
export const deleteAgent = (id: number) =>
  request<{ ok: true }>(`/api/agents/${id}`, { method: "DELETE" });

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
