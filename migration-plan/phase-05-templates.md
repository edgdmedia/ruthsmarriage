# Phase 5: Routes and templates

**Goal:** Every in-scope page type is built on the Phase 4 components, wired to EmDash, and visually matches live.

**Skills:** `building-emdash-site` → `references/querying-and-rendering.md`, `references/site-features.md`; `wordpress-theme-to-emdash` → `phases/3-templates.md`, `phases/4-dynamic.md`.

**Spec source: `migration-plan/page-maps/<page>.md`**, one per route below. Build each page section by section from its map.

All routes are server-rendered; no `getStaticPaths` for CMS content. Use `entry.data.id` for `getEntryTerms`. Guard every cache hint.

## 5.1 Routes

| Route | File | Notes |
|---|---|---|
| `/` | `pages/index.astro` | Phase 4 |
| `/{slug}/` | `pages/[slug].astro` | Look up `pages` first, then `posts`; 404 if neither. A page whose slug has a dedicated section layout (about, our-story, founder, singles, married, services, resources, books, videos, inspired-features, contact, sponsored, announcements, event, policies, freebies) renders through a **layout registry** `src/page-layouts/<slug>.astro` that pulls its copy from the entry. Other pages use the generic Hello-style page layout. Posts use `PostLayout` (Hello default single: title, featured image, content, "Tagged …"; no comment form, D3). |
| `/askcoach/` | via `[slug]` + `Canvas.astro` | No header/footer (live uses `elementor_canvas`). The form comes in Phase 6 |
| `/service/{slug}/` | `pages/service/[slug].astro` | Matches single template 143: image, term pill (→ `/service-type/{term}/`), title, price, audience, format, content, notice, "Book Service" button (Phase 6 wires the off-canvas) |
| `/resource/{slug}/` | `pages/resource/[slug].astro` | Template 590: image, term pill, title, content, CTA button → `cta_url` (new tab, `rel="noopener"`). Videos show the embed |
| `/service-type/{slug}/` | `pages/service-type/[slug].astro` | Grid like `/singles/` / `/married/`. Check what live renders at this URL; if it's the Hello default archive, match that |
| `/resource-type/{slug}/` | same pattern | |
| `/category/{slug}/`, `/tag/{slug}/` | | Hello default archive ("Category: Marriage", title + excerpt list, pagination like live) |
| `/search/?q=` and `/?s=` | `pages/search.astro` | EmDash `search()`; `/?s=` handled in middleware (Phase 7). Matches the Hello default search page |
| `404` | `pages/404.astro` | Hello default 404, same copy as live |
| `/admin/` | `pages/admin.astro` | D11 landing page, `noindex` |

Grids on `/singles/`, `/married/`, `/services/`, `/resources/`, `/books/`, `/videos/` must reproduce the live **alternating** listing-item layouts (153/149, 301/305, 724/728: image left/right swaps). Read each item's CSS file.

`/freebies/`: live shows only the title. Match that and flag it in the report (Known issue 4).

## 5.2 Visual parity
Run `scripts/qa/visual.mjs` for every route in the audit inventory at 1440/1024/390. Target **≤ 2% mismatch** per page and width, with masks for dynamic regions listed. Save diffs to `discovery/qa/`.

## Acceptance checks
- Mismatch table for all pages in the report (with masks)
- Every page renders with the seed and also with an empty collection (no crash, empty sections hidden)
- `pnpm typecheck`, `pnpm build` green
- Commit `phase-05: templates`
