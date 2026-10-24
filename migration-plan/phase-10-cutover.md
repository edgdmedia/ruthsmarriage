# Phase 10: Content top-up, cutover, retirement

**Goal:** www.ruthsmarriage.com serves the new site, with no broken links and a tested rollback.

**Skills:** `deploying-emdash-cloudflare` (`vps.md` → "Staging, then cutover"), `cloudflare`, `emdash-cli`.

> **Updated 2026-10-24 (D17):** the site runs on the VPS from Phase 9b, and the staging database is already production. The switch moves `www` and the apex from the WordPress host to the VPS; there is no Worker. Where this file mentions Workers, `wrangler` or workers.dev, use the VPS equivalent below.

## 10.1 Content top-up 🧑 Gate G5
Ask the human whether to import the remaining posts (16 total on live) before cutover. If yes, create them on staging from `discovery/content/posts.json` with `npx emdash content create` (or EmDash's WordPress importer if the human provides a WXR/Exporter plugin). Convert the HTML to Portable Text, upload the images, and assign the category and tags. Also re-check that services/resources/prices on live haven't changed since Phase 1 (re-run the 1.2 extraction and diff).

## 10.2 Pre-flight
- The human picks the window and freezes WordPress edits.
- Screenshot the DNS records and any Page/Redirect/Cache Rules to `discovery/dns-before/`. **MX and email records must stay untouched** (`admin@ruthsmarriage.com`).
- Keep WordPress reachable for rollback via a protected hostname (e.g. `wp-old.ruthsmarriage.com` behind Cloudflare Access). Don't touch `links.ruthsmarriage.com` (a separate link service).

## 10.3 Switch (owner runs each step)
- Set `EMDASH_SITE_URL=https://www.ruthsmarriage.com` in **both** env files (runtime + build), rebuild, restart.
- Add `www.ruthsmarriage.com` and the apex to the web server's `server_name`; `nginx -t`, reload.
- Cloudflare: point the `www` and apex `A`/`CNAME` records at the VPS IP (proxied); add both hosts to the Cache Rule; add an apex → `www` 301 Redirect Rule (matching live); add `www` to the Turnstile widget hostnames; Purge Everything. **MX and email records stay untouched.**
- Disable WordPress-specific Cloudflare rules that interfere.
- Keep the staging hostname up (noindexed) until 10.5.
- Editors re-register **passkeys** on `www` (staging passkeys don't carry over).

## 10.4 Verify (T+0 to T+1h)
`qa:visual` against the Phase 1 screenshots, plus `qa:links`, `qa:urls` and Lighthouse on production. An editor changes a page's text end-to-end. Submit Ask Coach for real. Facebook Sharing Debugger on the home page and a service.

## 10.5 Monitor and retire
- 2 weeks: EmDash 404 log daily (record only; the owner chose no redirects), `journalctl -u ruthsmarriage` errors, backups landing in R2, Search Console (submit the sitemap).
- **Rollback** (rehearsed once before cutover): restore the `www`/apex DNS records from `dns-before/` so they point at WordPress again.
- After ≥ 30 days stable, with the human's go-ahead: final WP backup, shut down WP hosting, cancel Elementor Pro/JetEngine licences.

## Acceptance checks
- Production QA green; the human confirms editors work in EmDash
- Rollback rehearsal documented
- Commit `phase-10: cutover`
