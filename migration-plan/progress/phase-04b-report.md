# Phase 04b report — Exit EmDash: static JSON content layer (2026-10-20)

## Why

The port is a **visual** 1:1 of a static marketing site. The CMS (EmDash + D1 + R2 + admin UI) added a
content pipeline, a database, a media bucket and a scheduled worker without changing a single pixel.
The human decided (2026-10-20) to drop it: **the site is now a plain Astro app** whose content is
JSON files in the project.

Recorded as decision **D16** in `$PLAN/README.md` (target architecture + decisions table updated).

## What was done

### Content layer (new)
- `src/data/*.json` — one file per collection: `settings`, `menus`, `banners`, `marquee`, `services`,
  `resources`, `testimonials`, `posts`, `pages`, `taxonomies`.
- `src/data/types.ts` — types for every collection (`MediaRef`, `Term`, `PortableText`, `Service`,
  `Resource`, `Testimonial`, `Post`, `Page`, `Menu`, `Banner`, `SiteSettings`, `Taxonomy`).
- `src/data/index.ts` — the only import surface for content: collections, lookups
  (`getService`, `getResource`, `getPost`, `getPage`, `getMenu`, `getTerm`) and taxonomy queries
  (`postsInCategory`, `postsWithTag`).
- `scripts/reference/build-data.mjs` (`pnpm data:build`) — regenerates `src/data/*.json` from
  `seed/seed.json`, expands taxonomy terms onto entries, decodes the WordPress HTML entities left in
  titles, and copies the referenced media from `discovery/media/` into `public/assets/media/`.
  `seed/seed.json` remains the captured source of truth; `src/data/*.json` is generated output.

### Media
- 20 referenced images copied to `public/assets/media/<year>/<month>/…` (7.7 MB) and referenced as
  `/assets/media/…`. The hero images stay in `public/assets/hero/`.
- The `/_emdash/api/media/file/{storageKey}` URL scheme is gone; cards now read `featured_image.src`.

### EmDash removed
- `astro.config.mjs` — the `emdash()` integration, `d1()` and `r2()` are gone; only the Cloudflare
  adapter + React remain.
- `wrangler.jsonc` — `main` is now `@astrojs/cloudflare/entrypoints/server`, `assets` points at
  `./dist/client`; the D1 database, the R2 bucket, the cron trigger and the custom worker entry
  (`src/worker.ts`) are gone. `pnpm deploy` deploys `dist/server/wrangler.json` (written by the adapter).
- Deleted: `src/worker.ts`, `src/live.config.ts`, `emdash-env.d.ts`, `src/lib/cache.ts`,
  `src/utils/site-identity.ts`, `.emdash/`, `.agents/skills/` (EmDash skills), `.mcp.json`
  (EmDash docs MCP), `.env` (`EMDASH_ENCRYPTION_KEY`).
- `package.json` — `emdash` and `@emdash-cms/cloudflare` removed; `@types/react` + `@types/react-dom`
  added; `data:build` script added.
- `worker-configuration.d.ts` regenerated (`wrangler types`): only the `ASSETS` binding remains.

### Pages
- `src/layouts/Base.astro` — EmDash head/body hooks and `createPublicPageContext` replaced with
  plain meta tags (title, description, canonical, OG, Twitter card). Menus, settings and marquee
  items now come from `src/data`.
- `src/layouts/Canvas.astro` — same, no EmDash.
- `src/pages/index.astro` — reads `banners`, `services`, `testimonials`, `resources`, `posts` from
  `src/data`; the markup the human wrote is unchanged.
- `src/pages/[slug].astro`, `posts/index.astro`, `posts/[slug].astro`, `category/[slug].astro`,
  `tag/[slug].astro` — rewritten against the JSON layer. Unknown slugs rewrite to `/404`.
- `src/components/PortableText.astro` — replaces `emdash/ui`'s `PortableText` (block/span shape only,
  which is all the captured content uses).
- `src/lib/seo.ts` — replaces `getSeoMeta()` (title, description, canonical, og:image).

### Bugs found and fixed along the way
1. **Nested `<a>` broke two cards.** `PostCard` and `ResourceCard` wrapped their whole card in an
   `<a>` and then nested a category link / badge button inside it. Nested anchors are invalid HTML —
   the browser's parser closed the outer `<a>` and the card rendered as an empty anchor, losing its
   white background, radius, shadow and padding (visible in the Inspired Features section).
   Both cards are now `<article>` elements with a stretched title link
   (`::after { inset: 0 }`) and the in-card links raised above it with `z-index`.
   `AGENTS.md` rule 8 records the rule.
2. **`PageHero.tsx` did not compile** — a stray `}` and `{h1 && …}` (undefined identifier) instead of
   `{title && …}`. The component was unused, so it never ran. Rewritten.
3. **React prop types were missing everywhere.** Components used the `= {}` default-parameter
   destructuring pattern, so TypeScript inferred `{}` for the props and every `href`, `children`,
   `style` and `subtitle` was an error. Explicit prop interfaces added to `Button`, `SectionHeading`,
   `WaveSection`, `MarqueeBar`, `PageHero`, the 14 icons (shared `IconProps`) and the four cards.
   `pnpm typecheck` is now **0 errors** (it was 259).
4. **WordPress entities in titles** — `Have Sex &#038; Pray` rendered literally.
   `decodeEntities()` in the data build script now cleans them; the footer shows `Have Sex & Pray`.
5. **`ResourceCard` badge label** read `badgeLabel`; the field is `badge_label`. Fixed.

## Acceptance checks

```
$ pnpm typecheck   → ✅ 0 errors, 0 warnings (44 files)
$ pnpm test        → ✅ Test Files 1 passed, Tests 7 passed
$ pnpm build       → ✅ Complete!
$ pnpm dev         → home 200 · /about/ 200 · /posts/ 200 · /posts/{slug}/ 200
                      /category/marriage/ 200 · /tag/instagram/ 200 · /nope/ 404
```

Visual: `discovery/screenshots/g2-home-{1440,1024,390}.png` re-captured. No broken images
(`broken: []`), 6 post cards, 11 resources, 11 services, 6 testimonials, dots below the slides in all
four content carousels.

`test/cache.test.ts` (the EmDash cache-hint helper) was replaced by `test/data.test.ts`, which
asserts the JSON layer: collections load, slugs are unique, lookups resolve, taxonomy terms link
posts to categories/tags, **every referenced image has a file under `public/`**, and menu URLs are
root-relative.

## Deviations from the plan
1. **D16 — no CMS** (human decision). Overrides D3, D4, D10, D10b and D11, which assumed EmDash.
   Consequences for later phases:
   - **D4 (Ask Coach form)** — no EmDash forms. Use an Astro action + Turnstile + Resend directly.
   - **D10 / D10b (marquee, contact emails, socials)** — live in `src/data/settings.json` and
     `src/data/marquee.json`; they are edited in the repo, not in an admin UI.
   - **D11 (editor entry, `/admin/`)** — no admin UI to link to. `/admin/` either 404s or gets a
     short "contact us to edit" page; decide at G3.
   - **D3 (comments)** — unchanged, comments stay off.
2. `Astro.cache` hints are gone (there is no query to hint). The Worker still gets Cloudflare's
   default caching; Phase 7 decides the real cache policy.

## Open issues / notes for Phase 5+
- **G2 gate still pending** — the human has not yet signed off the homepage against live at
  1440/1024/390. Screenshots are in `discovery/screenshots/g2-home-*`.
- Inner pages (`/about/`, `/our-story/`, service/resource detail templates) are still the bare
  Phase-3 placeholders — Phase 5 builds them to the page maps.
- The captured page bodies are thin: `src/data/pages.json` currently holds the page title plus a few
  headings. The real body copy is in `discovery/content/` and still needs importing.
- `src/data/` is generated output but is committed (the site must build without `discovery/`).
  Re-run `pnpm data:build` after touching `seed/seed.json`.
