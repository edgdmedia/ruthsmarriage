# Phase 10: Content top-up, cutover, retirement

**Goal:** www.ruthsmarriage.com serves the new site, with no broken links and a tested rollback.

**Skills:** `deploying-emdash-cloudflare`, `wrangler`, `cloudflare`, `emdash-cli`.

## 10.1 Content top-up 🧑 Gate G5
Ask the human whether to import the remaining posts (16 total on live) before cutover. If yes, create them on staging from `discovery/content/posts.json` with `npx emdash content create` (or EmDash's WordPress importer if the human provides a WXR/Exporter plugin). Convert the HTML to Portable Text, upload the images, and assign the category and tags. Also re-check that services/resources/prices on live haven't changed since Phase 1 (re-run the 1.2 extraction and diff).

## 10.2 Pre-flight
- The human picks the window and freezes WordPress edits.
- Screenshot the DNS records and any Page/Redirect/Cache Rules to `discovery/dns-before/`. **MX and email records must stay untouched** (`admin@ruthsmarriage.com`).
- Keep WordPress reachable for rollback via a protected hostname (e.g. `wp-old.ruthsmarriage.com` behind Cloudflare Access). Don't touch `links.ruthsmarriage.com` (a separate link service).

## 10.3 Switch
- Confirm that the zone and the Worker are in the same account (G1).
- Add Worker Custom Domains for `www.ruthsmarriage.com` and the apex (apex → www 301, matching live). If an existing DNS record blocks it, delete it, `pnpm build && pnpm wrangler deploy`, then confirm. Run `pnpm wrangler secret list` (trap 4).
- Disable WordPress-specific Cloudflare rules that interfere.
- Keep workers.dev enabled (noindexed) until 10.5.

## 10.4 Verify (T+0 to T+1h)
`qa:visual` against the Phase 1 screenshots, plus `qa:links`, `qa:urls` and Lighthouse on production. An editor changes a page's text end-to-end. Submit Ask Coach for real. Facebook Sharing Debugger on the home page and a service.

## 10.5 Monitor and retire
- 2 weeks: EmDash 404 log daily (add redirects), Worker errors, Search Console (submit the sitemap).
- **Rollback** (rehearsed once on staging before cutover): remove the Worker custom domains and restore the DNS records from `dns-before/`.
- After ≥ 30 days stable, with the human's go-ahead: final WP backup, shut down WP hosting, cancel Elementor Pro/JetEngine licences.

## Acceptance checks
- Production QA green; the human confirms editors work in EmDash
- Rollback rehearsal documented
- Commit `phase-10: cutover`
