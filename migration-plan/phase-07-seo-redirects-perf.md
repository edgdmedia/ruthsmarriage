# Phase 7: SEO, redirects, caching, performance

> **Updated 2026-10-24:** runs **after** 9b. The owner chose **no legacy redirects**, so skip 7.2. Caching (7.3) is done in 9b (Cloudflare edge cache + purge); there are no Astro cache hints on the VPS. What remains: 7.1 SEO and 7.4 performance, against EmDash's SEO fields.

**Goal:** Search engines see the same URLs, titles and descriptions as before (or better), every legacy URL resolves, and pages are fast.

**Skills:** `building-emdash-site` → `references/site-features.md`; `deploying-emdash-cloudflare`; `web-perf`.

## 7.1 SEO parity
- For every page, post, service and resource: carry over the AIOSEO title and description from `aioseo_head_json` in `discovery/raw/json/` into EmDash's SEO fields. Pass `getSeoMeta()` the bare title; the final title format is `<Page> | Ruth's Marriage` (D13 corrects live's "Ruths Marriage").
- OG/Twitter tags, canonical with trailing slash, favicon set, `theme-color`.
- `/sitemap.xml` and `/robots.txt` come from EmDash's built-ins (confirm). Legacy `/wp-sitemap.xml`, `/sitemap_index.xml`, `/*-sitemap*.xml` → 301 `/sitemap.xml`.
- RSS: `/feed/` (posts) stays live.
- JSON-LD: Organization (name, logo, sameAs socials) on home; Article on posts; Service on services (if EmDash's built-in output allows extension).

## 7.2 Legacy resolver (`src/lib/legacy.ts` + `src/middleware.ts`)
A pure function `resolveLegacy(url)` with vitest tests (`tests/legacy.test.ts`), plus thin middleware. Check the order relative to EmDash's middleware (use `sequence()`). Single-hop rules:
1. `/shop/`, `/cart/`, `/checkout/`, `/my-account/*`, `/product/*` → 301 `/resources/` (D2)
2. `/sample-page/` → 301 `/`
3. `/?s=term` → 301 `/search/?q=term`; `/?p=<id>`, `/?page_id=<id>`, `/?attachment_id=*` → canonical (map from the dump) or `/`
4. Attachment pages (`/<parent>/<attachment-slug>/`, see the media `link`s in the dump) → parent URL
5. `/wp-content/uploads/<path>` → the R2 media URL via a bundled map built in Phase 3 (`src/data/media-url-map.json`)
6. `/wp-admin*`, `/wp-login.php` → 302 `/admin/`; `/wp-json/*`, `/xmlrpc.php` → 410 (D11)
7. `/feed/` variants and `/comments/feed/` → `/feed/`
8. Missing trailing slash on public HTML routes → add it. Exclude `/_emdash/*`, `/api/*` and anything with a file extension
Tests: one case per rule, every URL in `discovery/raw/` link lists, and "unknown path returns null".

## 7.3 Caching
Guarded cache hints on every CMS route (AGENTS.md rule 2). Static assets are immutable-hashed. Remember that dev never exercises the cache (trap 2); it's verified on staging in Phase 9.

## 7.4 Performance (without changing the look)
- Images through the EmDash `Image` component with responsive `srcset`; hero image `fetchpriority="high"`, everything else lazy
- Fonts: preload the 2 most-used weights, `font-display: swap`, subset to latin
- Slider JS only where needed; no jQuery; total JS on home < 60 KB gzip
- Targets (Lighthouse mobile, local preview): Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO 100 on home, a post, a service and `/resources/`

## Acceptance checks
- `pnpm test` green (legacy resolver)
- Table of title/description per URL: live vs new (script `scripts/qa/seo-parity.mjs`), with any differences explained
- Lighthouse scores in the report
- Commit `phase-07: seo + redirects + perf`
