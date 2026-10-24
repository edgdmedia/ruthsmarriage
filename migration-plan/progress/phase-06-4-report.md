# Phase 6.4 — Ask Coach form backend

Date: 2026-10-24 (after G2b).

## What's built
- `src/actions/index.ts` → `askCoach` Astro action (`accept: "form"`, zod):
  category ∈ Love/Dating/Marriage/Sex/Faith/Life, question required (trimmed,
  ≤ 5000 chars), Turnstile token.
  1. Turnstile `siteverify` (unconfigured secret → allowed only in dev).
  2. Rate limit 5 per IP per hour, in memory (fine for one VPS process).
     IP = `CF-Connecting-IP` → `X-Real-IP` → connection address.
     `X-Forwarded-For` is ignored (client-controlled). **Phase 9: nginx must set
     `proxy_set_header X-Real-IP $remote_addr;`** (or Cloudflare in front).
  3. In parallel: **save** a draft entry to EmDash's `ask_coach_questions`
     collection (`POST {EMDASH_URL}/_emdash/api/content/ask_coach_questions`, Bearer
     `EMDASH_TOKEN`; fields title `<Category> · <date>`, category, question) and
     **email** via Resend REST `POST /emails`, subject `Ask Coach: <Category>`
     (category + question only, anonymous). Success if either works; if both fail
     the question is logged server-side so it isn't lost.
- Collection added to `seed/seed.json` and `scripts/reference/build-seed.mjs`
  (drafts only, never rendered by the site). Saving is skipped until EmDash exists.
- `/askcoach/` posts to the action (works without JS) and shows Elementor's
  messages; errors keep Send for a retry. Real Turnstile managed widget replaces
  the placeholder. Without a site key in production the Send button is disabled.
- Config: `astro.config.mjs` `env.schema` — `RESEND_API_KEY`, `TURNSTILE_SECRET_KEY`
  (secrets), `PUBLIC_TURNSTILE_SITE_KEY`, `ASKCOACH_TO` (default
  admin@ruthsmarriage.com), `ASKCOACH_FROM` (default `Ask Coach <askcoach@ruthsmarriage.com>`).
  Local values in `.env` / `.dev.vars` (git-ignored); Resend key copied from `dev.local`.

## Verified locally
- Browser: test widget issues a token → submit → "Your submission was successful."
  Resend accepted the send from `askcoach@ruthsmarriage.com`, so the domain is
  verified in Resend. Test sends went to Resend's sink `delivered@resend.dev`.
- Empty question → 400 "Please enter your question."
- 5 per hour → 429 "Too many questions. Please try again later."

- Mock EmDash endpoint: save sent with Bearer token and the right body; with the
  mock returning 500 the email still went and the visitor saw success.
- Real Turnstile keys now in `.env` and `.dev.vars` (owner-supplied); page renders them.

## Phase 9 (EmDash on the VPS)
- `emdash seed seed/seed.json --validate` must accept `ask_coach_questions`.
- Create a personal access token with **only `content:write`**; set `EMDASH_URL`
  (e.g. `http://127.0.0.1:<port>`) and `EMDASH_TOKEN` in the server env file.
- Submit one question and confirm the draft appears in the admin.

## Waiting on the owner (G3)
- Turnstile widget hostnames must include `localhost` (local) and the live domain.
- OK to send one real test to admin@ruthsmarriage.com (remove `ASKCOACH_TO` from `.env`).
