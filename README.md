# cybermail-web

The CyberMail web client + marketing landing page.

- **/** — Marketing landing page (cybrmail.net root)
- **/app** — Full CyberMail web client (Brain · Inbox · Calendar)

Shares the same backend as iOS at `api.cybrmail.net`.

## Stack
- Next.js 15 (App Router)
- React 19
- Zero CSS framework — pure CSS variables matching the iOS brand
- No external API dependencies — only `fetch` to the CyberMail backend

## Deploy

### Vercel (recommended — 2 minutes)
1. Create a new Vercel project pointing at this repo
2. Framework preset: **Next.js** (auto-detected)
3. Environment variable (optional, defaults to prod):
   ```
   NEXT_PUBLIC_API_BASE=https://api.cybrmail.net
   ```
4. Set domains:
   - `cybrmail.net` → root → landing page
   - `app.cybrmail.net` → /app
5. DNS at Unstoppable Domains:
   - `A @ → 76.76.21.21` (Vercel)
   - `CNAME app → cname.vercel-dns.com`

### Local dev
```bash
npm install
npm run dev
# → http://localhost:3000
```

## What's inside

### Landing page (`/`)
Targets new visitors. Sections:
- Hero with the pitch
- "What no other email app has" feature grid (9 cards)
- Brain spotlight (memory architecture explainer)
- Pricing (Free / Verified / Pro / Business)
- Final CTA → App Store

### Web client (`/app`)
Targets users who want CyberMail in any browser (instant Android support
via Chrome). Login → 3-tab app shell:
- **🧠 Brain** — daily briefing, ask-anything search, promises, decisions
- **📬 Inbox** — message list with brain-extracted summaries
- **📅 Calendar** — upcoming events (suggested events marked ✨)

Token stored in `localStorage`. All API calls go to `NEXT_PUBLIC_API_BASE`.
