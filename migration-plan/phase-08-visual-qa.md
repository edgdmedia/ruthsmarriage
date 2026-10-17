# Phase 8: Visual QA and parity verification

**Goal:** Prove with scripts that the new site matches live and nothing is broken. Run against local (`pnpm build && pnpm preview`) here; Phase 9 re-runs it on staging and Phase 10 on production. Restart the dev server cleanly before any dev-server check (AGENTS.md trap 1).

**Skills:** `wordpress-theme-to-emdash` → `phases/6-verify.md`, `agent-browser`, `web-perf`.

All scripts take `--base <url>`.

## 8.1 `pnpm qa:visual`: pixel parity
Every page in the audit inventory + all 11 services + all 11 resources + post, category, tag, search, 404 at 1440/1024/390. Compare against **live re-shot with `scripts/reference/capture.mjs`**, never a plain screenshot of live: plain live renders fallback fonts (README D7), and the capture script injects the working fonts. Re-shoot at the same time so content drift doesn't count as a regression. Also check the section-box tables in `migration-plan/page-maps/*.md` (±4px). Pass = **≤ 2% mismatch** per page and width with the documented masks. Also compare the interaction states from `discovery/screenshots/states/`.

## 8.2 `pnpm qa:links`
Crawl the new site from `/`: every internal link returns 200 (or an intended 301 → 200); every image loads; external links (Selar, links.ruthsmarriage.com, socials) respond < 400; no `web.archive.org`, `/wp-content/` or `ruthsmarriage.com/?` links left.

## 8.3 `pnpm qa:urls`: legacy URLs
Every URL from the live `wp-sitemap.xml` sub-sitemaps + the REST `link`s + the redirect cases in 7.2: content URLs → 200 at the **same path**; dropped/legacy → one 301 hop → 200.

## 8.4 `pnpm qa:a11y`
axe-core on home, a service (off-canvas open), `/askcoach/`, a post: zero serious/critical violations. No horizontal scroll at 390px. Visible focus. Note that matching live colours exactly may fail contrast in places (e.g. white on `#ED0D82`). Report those and ask the human before changing any colour.

## 8.5 Editor workflow
In local admin: edit a service price → visible on the single page, the card and the footer link text; add a resource with a badge → appears in its grid and the homepage carousel; reorder banners; change the marquee text in settings; publish a scheduled post → appears in "Inspired Features" after the cron runs.

## Acceptance checks
- All QA outputs under `discovery/qa/<env>/`, summary table in the report
- Every failure fixed or explicitly accepted by the human
- Commit `phase-08: qa suite`
