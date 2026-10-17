# Phase 9: Deploy to Cloudflare (staging)

**Goal:** The site runs on `ruthsmarriage.<account>.workers.dev` with the seeded content in remote D1/R2, QA passes there, and editors have accounts.

**Skills:** `deploying-emdash-cloudflare`, `wrangler`, `cloudflare`, `emdash-cli`. Docs: deployment/cloudflare, core migrations.

## 9.1 Create resources
```bash
pnpm wrangler d1 create ruthsmarriage-db         # copy database_id into wrangler.jsonc
pnpm wrangler r2 bucket create ruthsmarriage-media
```
Secrets: `pnpm wrangler secret put EMDASH_ENCRYPTION_KEY` (new production key; the human stores it in their password manager), Turnstile secret, and anything the email setup needs. Set `EMDASH_SITE_URL`/`siteUrl`. Record the **expected secret names** in the report and compare with `pnpm wrangler secret list` after every deploy (trap 4). Verify each resource with `wrangler d1 list` / `wrangler r2 bucket list` (trap 6).

## 9.2 Deploy
`pnpm build && pnpm wrangler deploy` (always both, trap 3). Complete setup at `/_emdash/admin` with the human's admin email. If requests 500 with `MigrationLockHeldError`, clear the lock (trap 5).

## 9.3 Content to staging
Use EmDash site export/import from local to staging (`npx emdash site export` / `site import --analyze` → `--plan … --confirm`; check `npx emdash site --help` for the installed version's flags). Fallback: apply `seed/seed.json` remotely. Report which path was used.

## 9.4 Verify on staging
Re-run `qa:visual` (against live), `qa:links`, `qa:urls`, `qa:a11y` and Lighthouse with `--base https://ruthsmarriage.<acct>.workers.dev`. Cache check: request home, a service, a post and `/_emdash/admin` twice each and record `cf-cache-status`, `cache-control`, `age`. Public pages should be cacheable; `/_emdash/*` must not be. Edit a service price and confirm the change appears within the expected TTL. Submit the Ask Coach form with real Turnstile keys in a real browser.

## 9.5 Editors 🧑 Gate G4
Ask the human for the editor list (name, email, role) and invite them. Write `docs/EDITOR-GUIDE.md` (1–2 pages with screenshots): log in, edit a page's text, add/edit a service (price, booking link), a resource (badge, link), a banner, a testimonial, a blog post; change the marquee/contact/socials in settings; read Ask Coach submissions (if stored).

## 9.6 Protect staging
Cloudflare Access or `X-Robots-Tag: noindex` on the workers.dev host.

## Acceptance checks
- QA green on staging; secret list matches; cache table attached
- The human confirms at least one editor can log in
- Commit `phase-09: staging deploy`
