# Phase 5 report — Page content into the data layer (2026-10-20)

## What was done

Filled the full body copy into `src/data/pages.json` for all 19 seeded pages, pulling it from the captured WordPress dumps in `discovery/raw/html/<slug>.html` (the real source of copy; `discovery/content/pages/*.json` was structural only).

### New extraction script
`scripts/reference/extract-page-content.mjs` walks each page dump's DOM (a small tolerant parser in `scripts/reference/lib/html-tree.mjs`) and converts each Elementor widget into a typed content block:

- `heading` (level + text + html), `paragraph` (html, drop-cap flag), `image` (src/alt), `button` (label + href + icon)
- `divider`, `iconBox` (icon/title/text), `icon`, `video` (iframe src), `html`/`shortcode` (sanitised HTML)
- `listing` (jet-listing-grid post type), `hero` (title + background image + variant)
- Plumbing: decodes WordPress entities (`&#038;`), recovers Cloudflare-obfuscated emails (`__cf_email__`), resolves image `src`s to local `/assets/media/…` paths via `build-data.mjs`' media resolver, strips `<script>`/`<style>`/inline handlers.

The hero block is pulled out into `hero_title`/`hero_image` (and `side_image` for the story/photo column); "Our Values" on /about/ is captured as a `values` block (4 × icon/title/text). Blocks are ordered as they appear on the page.

### Content model
`src/data/types.ts` gained a `PageBlock` union (`PageContent`) alongside the legacy `PortableText` shape, so pages carry rich blocks while services/resources/posts keep block/span PortableText.

### Renderer
`src/components/PortableText.astro` renders both shapes: legacy block/span PortableText (services/resources/posts) and rich page blocks (headings, paragraphs, images, buttons, divider, icon boxes, icons, video, raw HTML). Icons are inline SVG so nothing needs a client React island.

### Page route
`src/pages/[slug].astro` now renders `PageHero` (photo variant) from `hero_title`/`hero_image`, and the side image column where present.

### Media
8 new images copied into `public/assets/media/` (about hero, story photo, founder photo, contact hero, etc.) — 29 files total.

### Tests
`test/data.test.ts` now asserts every referenced image (including page hero/side/content images) has a file under `public/`. All 7 tests pass.

## Acceptance checks
```
pnpm typecheck  → 0 errors, 0 warnings (48 files)
pnpm test       → Test Files 1 passed, Tests 7 passed
pnpm build      → Complete!
routes          → / /about/ /our-story/ /contact/ /askcoach/ /cancellation-policy/ /privacy-policy/ = 200
                      unknown slug = 404
```
Verified /about/ renders: hero "About Us" over its image, 6 story paragraphs (first with drop cap), side photo column, "Our Values" heading + divider + 4 icon boxes, all copy verbatim from the live dump.

## Deviations / notes
- Pages that are Gutenberg (not Elementor) — privacy-policy, confidentiality-policy, cancellation-policy — are extracted from their `<main>` block markup (headings, paragraphs); that's acceptable fidelity for policy text.
- Pages with no content in the dump (freebies, sponsored, event, videos) keep their existing thin content.
- `PostCard.tsx` shows a pre-existing, unstaged modification (indentation changed, `width: fit-content` added) that is **not** part of this work — left untouched.
- G2 homepage sign-off still pending; inner-page templates (services, resources, singles, married) still use Phase-3 placeholders and are built to their page maps in the next step.
