# Phase 1: Capture the pixel reference

**Goal:** Everything needed to rebuild the site 1:1 without going back to WordPress: screenshots of every page at 3 widths, interaction states, **computed-style specs** per section, all images and brand assets, and the text content of every page and CPT entry.

**Skills:** `wordpress-theme-to-emdash` → `phases/1-discovery.md` + `phases/2-design.md`, `agent-browser`.

Output goes to `discovery/` (screenshots, specs, assets, committed) and `discovery/raw/` (HTML/JSON/CSS dumps, git-ignored). Scripts go in `scripts/reference/` (Node ESM). Scrape at ≤ 2 req/s with a User-Agent.

## 1.1 Raw dump: `scripts/reference/dump-wp.mjs`
- REST (`https://www.ruthsmarriage.com/wp-json/wp/v2/`, `per_page=100`): `posts?_embed`, `pages`, `resource`, `service`, `banner`, `media`, `categories`, `tags`, `resource-type`, `service-type` → `discovery/raw/json/<type>.json`. (`testimonial` returns 400. Get testimonials from the homepage HTML.)
- Rendered HTML of every URL in the audit's page inventory, plus every `/service/*/`, `/resource/*/`, `/service-type/*/` and one post → `discovery/raw/html/`.
- Elementor CSS: `wp-content/uploads/elementor/css/post-{6,23,63,329,100,116,159,462,468,225,239,143,590,377,394,153,149,301,305,724,728,187}.css` plus every other `post-N.css` referenced by any dumped page → `discovery/raw/css/`. These files hold the exact paddings, font sizes and colours per widget. **They are the primary spec source.**

## 1.2 Content extraction → `discovery/content/` (committed)
Write normalised JSON the seed (Phase 3) is built from:
- `services.json`: `{slug, title, serviceType, price, audienceLabel, format, description(html), notice, bookingUrl (from the shortcode's data-url), featuredImage}`. Parse these from the single-service HTML (template 143) and listing items 149/153.
- `resources.json`: `{slug, title, resourceType, badgeLabel, ctaLabel, ctaUrl, videoUrl?, excerpt, content(html), featuredImage}` from template 590 and listing items 301/305/724/728/187.
- `banners.json`: `{title, subtitle, buttonLabel, buttonUrl, image}` (3, in slider order).
- `testimonials.json`: text, in carousel order, with each card's colour variant.
- `pages/<slug>.json`: per static page, the ordered sections with headings, text (HTML), images, buttons (label + href) and icon names.
- `posts.json`: all 16 (title, slug, date, excerpt, content html, featured image, category, tags). The seed uses 3; Phase 10 may import the rest.
- `site.json`: menus (primary + footer columns), contact emails, socials, marquee text + link, footer copyright, policy links.
Replace any `web.archive.org/web/<ts>/<url>` link with `<url>` and log each replacement.

## 1.3 Media + brand: `scripts/reference/download-media.mjs`
Download every image referenced by the dumped pages/JSON at the **largest size available** (strip `-WxH` suffixes, keep `-scaled`) → `discovery/media/<same path as wp-content/uploads>`. Also the logo, favicons and any SVG/icon assets. Log failures to `discovery/media/failures.json`. Write `discovery/media/manifest.json` (`{url, localPath, width, height, alt}`).

> **Already done by Claude:** 1.4 (static screenshots) and 1.5 (computed-style specs) for every page at 1440/1024/390 are in `discovery/screenshots/live/` and `discovery/specs/raw/`, and the human-readable maps are in `migration-plan/page-maps/`. The tool is `scripts/reference/capture.mjs` (+ `extract-spec.js`); re-run it with `--only <page>` if live changes. The interaction states are in `discovery/screenshots/live/states/` and `discovery/specs/states.json` (dropdowns, mobile menu, sticky header, booking modal, Ask Coach validation). opencode does **1.1–1.3** (raw dump, content JSON, media download) and adds any missing state from 1.4. Skip anything already present. `DESIGN-current.md` (1.5) is replaced by `migration-plan/page-maps/_global.md`; don't write it.

## 1.4 Screenshots
Use agent-browser at **1440×900, 1024×768, 390×844**, full page, with animations settled (wait for fonts; pause the slick autoplay (`jQuery(el).slick('slickPause').slick('slickGoTo', 0, true)`) and go to slide 0; inject the working fonts as `capture.mjs` does before shooting) → `discovery/screenshots/<page>-<width>.png` for **every** page in the audit inventory + one service, one resource, one post, category, search, 404.

Interaction states (1440 and 390) → `discovery/screenshots/states/`:
- each primary-menu dropdown open; nav hover colour; button hover
- mobile hamburger menu open, and with a submenu expanded
- sticky header after scrolling 600px
- service "Book Service" off-canvas open; "I agree" unchecked vs checked
- each carousel on slide 2; the hero slider on each slide
- `/askcoach/` form with the category select open and the validation state

The 12 older screenshots already in `discovery/screenshots/` came from an earlier session at ~1265px. Keep them but don't use them as the diff baseline.

## 1.5 Computed-style specs → `discovery/specs/`
For each section of each page (Elementor `.elementor-section`/`.e-con` top-level containers, header, footer), use `agent-browser eval` at all three widths to record: bounding box, background (colour/image/gradient), padding/margin, and for every heading, text, button, image and icon inside it: font family/size/weight/line-height/letter-spacing/colour, border-radius, box-shadow, gap. Write one JSON per page (`specs/<page>.json`) and a human summary `discovery/DESIGN-current.md`:
- Final token table (confirm or correct the audit's colour and font table), including button, card and divider styles
- Header/marquee/footer structure and measurements
- Shape dividers: SVG path type (Elementor "wave"/"curve"…), height, colour, flip/invert. Copy the actual `<svg>` markup from the HTML.
- Carousel (slick) settings per carousel (slides per view per breakpoint, spaceBetween, autoplay delay, loop, arrows/dots, pause on hover). Read them from each widget's `data-settings`.
- Marquee: speed, direction, pause on hover
- Icon set used (Font Awesome version + exact icons, e.g. `fa-users` on testimonials)
- Breakpoints actually used

## Acceptance checks
- Screenshot count ≥ (pages in the inventory × 3) + interaction states; list them in the report
- `discovery/content/*.json` validates: 11 services all with `bookingUrl` and `price`, 11 resources with `ctaUrl`, 3 banners, 6 testimonials (report any missing field)
- Media failures = 0, or each failure listed
- Commit `phase-01: pixel reference + content capture`
