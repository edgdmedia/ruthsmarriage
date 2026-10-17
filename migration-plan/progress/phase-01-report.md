# Phase 1 report — Capture the pixel reference (2026-10-17)

Scope per plan: Claude had already done 1.4 (static screenshots) and 1.5 (computed-style specs + page-maps). opencode did **1.1 raw dump, 1.2 content extraction, 1.3 media**, plus the interaction states missing from 1.4. `DESIGN-current.md` not written, per the plan.

## What was done

### 1.1 Raw dump — `scripts/reference/dump-wp.mjs`
- REST (`per_page=100`, paginated, UA `ruthsmarriage-migration/1.0`, ≥600 ms spacing) → `discovery/raw/json/`: **posts 16, pages 25, resource 11, service 11, banner 3, testimonial 6, media 63, categories 2, tags 2, resource-type 3, service-type 2** — all match the audit.
- Rendered HTML, 54 files → `discovery/raw/html/`: the audit inventory + all 11 `/service/*/`, all 11 `/resource/*/`, 1 post, both tags, search, 404. 0 failures.
- Elementor CSS: the plan's 22 `post-N.css` + every `post-N.css` discovered in the HTML → `discovery/raw/css/` (**40 files**).
- `discovery/raw/` (9 MB) is git-ignored as planned.

### 1.2 Content extraction → `discovery/content/` (756 KB, committed to main + nested repo)
- `scripts/reference/extract-content.mjs` (live-DOM passes via agent-browser): services (11) with price/audience/format/bookingUrl/off-canvas policy HTML; resources (11); banners; homepage carousels; posts (from REST); `site.json` (primary menu 5 items + children, marquee, footer 4 columns + copyright, socials, logo); `pages/*.json` — ordered sections per static page; `forms/askcoach.json` — select options Love/Dating/Marriage/Sex/Faith/Life, `form_fields[message]`, submit "Send", 4 hidden fields, raw form HTML kept.
- `scripts/reference/extract-offline.mjs` (offline gap-fill from the dumps): resource badge/CTA/video URLs + hero slide order + per-grid carousel settings (`carousels.json`: grid 100 hero autoplaySpeed 9000, 159/225/239/462 content carousels).
- Archive.org unwrapping ran inside the DOM extractor; per-page replacement logs are in `pages/<slug>.json → replacements` (e.g. contact: 5, policies: 3).

### 1.3 Media — `scripts/reference/download-media.mjs`
- 70 unique referenced images (size-suffix stripped, `-scaled` kept, sized-version fallback). **66 downloaded** to `discovery/media/<uploads path>` (17 MB), `manifest.json` with `{url, localPath, width, height, alt}`.
- 4 failures — all genuine 404s on live (already deleted server-side):
  - `2023/08/DSC08266.jpg`, `2023/11/Have-Sex-Pray-Mockup.png`, `2023/12/depositphotos_619427310-…jpg` — referenced **only** inside old post `sexy-santa-4-ways-to-initiate-more-sex-intimacy-with-your-husband-this-holidays-2` (not a seed candidate; 3 seed posts are 2025/2025/2024).
  - `2026/03/woocommerce-placeholder.webp` — from the dropped WooCommerce pages.
- `discovery/media/` is committed **only to the local-only nested repo** (per the no-images-on-remote decision; .gitignore updated).

### 1.4 gap — new interaction states (`scripts/reference/states-extra.mjs`)
7 new screenshots → `discovery/screenshots/live/states/`: `carousel-100-slide2/3` (hero every slide), `carousel-159/225/239/462-slide2`, `nav-item-hover-1440`, `askcoach-category-selected-1440`. `states-extra.json` written — the `dotsActive`/`navHover` style reads are weak (see deviations); visuals are in the PNGs.

## Deviations & findings
1. **D15 added to `migration-plan/README.md`** (human decision): hero banners ship as **static** component content — no `banner` content type. `banners.json` holds the exact copy/CTAs/images the Phase 4 hero will hardcode, in DOM slider order.
2. **`testimonial` REST works** (the plan/audit expected 400): 6 items returned, but slugs are `auto-draft-*` — text cross-referenced with the 6 homepage carousel cards (`testimonials.json` keeps both sources).
3. **`pages` REST emits a 409-byte `<style>` warning before the JSON** — dump script strips and logs the junk prefix.
4. **Hero slide button hrefs on live**: slide 1 → `https://ruthsmarriage.com/about` (apex, no slash), slide 2 → `/service`, slide 3 → `/resources`. Captured as-is; Phase 4 should normalize slide 1 to `https://www.ruthsmarriage.com/about/` and confirm whether `/service` resolves (likely the services listing). Flagging rather than guessing.
5. **Badge vs CTA on resource cards**: the listing cards' badge pill IS the button ("Learn More" / "Join the Challenge" / "Download Here"); books' single-page buttons are the variant labels ("Hardcopy (Nigeria)", "Selar (ebook)") → those became `ctaLabel`, `badgeLabel` null for the 3 books. 9/11 resources have `ctaUrl`; the **2 video resources have none on live** (template 590 doesn't render the CTA — audit known-issue 9). Video URLs captured from the `/videos/` grid's `youtube_url` settings instead.
6. **Marquee is a native `<marquee class="ruth-marquee">`** with the announcement anchor repeated 4× — Phase 4 should port it as a CSS animation (D10 content type still applies).
7. Services `notice` is not a separate field — the full heading/paragraph text run is in `services.json → allTexts`, policy markup in `offcanvasHtml`; Phase 3/5 pick the exact notice line.
8. **New spec files** (`dotsActive`, `navHover`) are best-effort; the authoritative carousel/nav styling remains `page-maps/_global.md` (D8).
9. The dump script duplicates the page inventory from `capture.mjs` (capture.mjs executes its loop on import, so it can't be imported as a library). Keep the two lists in sync if the inventory changes.

## Acceptance checks

```
$ git log --oneline | head -2          # main repo
36d947f phase-01: pixel reference + content capture   # (the report commit follows)
2bb1bb6 phase-00: version reference captures in a local-only nested repo
$ git -C discovery log --oneline | head -1
e531986 phase-01: reference captures — new states (carousels/hero/nav/askcoach), media dump (66 files), content JSON

$ find discovery/screenshots/live -maxdepth 1 \( -name '*.png' -o -name '*.jpeg' \) | wc -l
93                       # 31 inventory pages × 3 widths (≥ required)

$ ls discovery/screenshots/live/states | wc -l
27                       # 19 from Claude + 8 new (incl. re-shot askcoach-category)

$ node -e '...content validation...'
services: 11 missing price: - missing booking: -
resources: 11 missing cta: ['how-do-we-discuss-…(video)', 'how-to-deal-with-…(video)']   # both intentional, see deviation 5
banners DOM: 3 REST: 3 | testimonials rest: 6 dom: 6
prices: ₦590,000/$590 ; ₦510,000/$510 ; ₦750,000/$750 ; ₦300,000/$300 ; ₦160,000/$160 ; ₦100,000/$100 ; ₦470,000/$470 ; ₦590,000/$590 ; ₦510,000/$510 ; ₦150,000/$150 ; ₦90,000/$90
bookings (first 3): https://selar.com/d4av ; https://selar.com/9jmn ; https://selar.com/fh75

$ grep "^FAIL" media.log
FAIL 2026/03/woocommerce-placeholder.webp              # Woo pages dropped (D2)
FAIL 2023/12/depositphotos_619427310-…jpg              # 404 on live; one 2023 post only
FAIL 2023/11/Have-Sex-Pray-Mockup.png                  # 404 on live; one 2023 post only
FAIL 2023/08/DSC08266.jpg                              # 404 on live; one 2023 post only
(manifest: 66, failures: 4 — each listed above)

$ git log --oneline (main)
<hash> phase-01: pixel reference + content capture

$ git log --oneline (nested discovery repo)
<hash> phase-01: reference captures — new states (carousels/hero/nav/askcoach), media dump (66 files), content JSON
```
