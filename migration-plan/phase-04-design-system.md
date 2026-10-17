# Phase 4: Design system, global chrome, homepage (G2)

**Goal:** Tokens, base CSS and the shared components reproduce the live site exactly. The header, footer and homepage match live closely enough for the human to sign off before the rest is built.

**Skills:** `wordpress-theme-to-emdash` → `phases/2-design.md`, `phases/3-templates.md`; `agent-browser`. Inputs, in priority order: **`migration-plan/page-maps/`** (`_global.md`, `home.md`), `discovery/specs/raw/*.json`, `discovery/raw/css/*.css`, `discovery/screenshots/live/`.

**Method: port the CSS, don't eyeball it.** For each widget, read the matching rules in `discovery/raw/css/post-N.css` (e.g. `.elementor-63 .elementor-element-xxxx .elementor-button{…}`) and the computed specs. Then write the equivalent rules on semantic class names. Keep Elementor's responsive overrides at the same breakpoints (≤1024, ≤767). Don't copy Elementor's frontend CSS wholesale or keep `elementor-*` class names.

## 4.1 Foundations
- `src/styles/tokens.css`: colours named after the kit globals (`--color-primary #BF1E72`, `--color-accent #ED0D82`, `--color-text #2E2E2E`, `--color-plum #5A0F36`, `--color-primary-14 #BF1E7224`, `--color-primary-5 #BF1E720D`, `--color-grey #CCCCCC`, plus any others from `DESIGN-current.md`), font families, the type scale **as measured** (not a fluid redesign), spacing, radii, shadows, container 1140px, breakpoints 1024/767
- `src/styles/base.css`: reset matching Hello Elementor's `reset.css` + `theme.css` defaults (they affect the default-template pages: posts, archives, 404)
- Fonts: `@fontsource/nunito` and `@fontsource/poppins` (only the weights in use), preloaded. Check that the glyph metrics match live (line breaks in headings must land on the same words)
- Icons: the exact Font Awesome icons from Phase 1, as inline SVG (no FA kit)

## 4.2 Components (`src/components/`)
All specs are in `migration-plan/page-maps/`: `MarqueeBar`, `Header`, `MobileNav`, `Footer`, `Button` (variants), `SectionHeading`, `WaveSection`/`ShapeDivider` (`wave-brush`, `waves`), `Carousel`, `HeroSlider` (`portrait`/`overlay` slides), `ServiceCard`, `ResourceCard`, `TestimonialCard`, `PostCard`, `PageHero` (`photo`/`pattern`/`pattern-flat`), `ListingRow` (A/B), `IconBoxGrid`, `SocialIcons` (circle/rounded-square), `BookingModal`, `HelloLayout` (theme-default pages). Copy SVGs from `page-maps/assets/`.

All components must handle missing images, long titles and an empty list (render nothing rather than an empty section).

## 4.3 Layout + homepage
- `src/layouts/Base.astro`: `<EmDashHead>`, `<EmDashBodyStart>`, `<EmDashBodyEnd>`, `getSeoMeta()` (bare title), menus via `getMenuWithCacheHint`, settings via `getSiteSettingsWithCacheHint`, cache hints guarded (AGENTS.md rule 2) through `src/lib/cache.ts`, with a unit test for the undefined hint. `Canvas.astro` variant without header/footer, for `/askcoach/`.
- `src/pages/index.astro`: the homepage section by section, in live order, from EmDash data (banners, services, testimonials, resources, latest posts).

## 4.4 Fidelity loop
Write `scripts/qa/visual.mjs` now (Phase 8 extends it). Reuse `scripts/reference/capture.mjs` (`--base http://localhost:4321 --shots discovery/qa/local --specs discovery/qa/local-specs`) to shoot the new site under the same conditions. Then pixel-diff against `discovery/screenshots/live/<page>-<width>.png` with `pixelmatch` (threshold 0.1), and compare the section boxes in each page map with `sections.mjs`-style output from the new specs. The new site has no `[data-elementor-type]` markup, so give each top-level section a `data-section="<live container id>"` attribute (e.g. `data-section="04f860d"`) and make `extract-spec.js` read it. That's the cheapest way to pair sections. It outputs diff PNGs and a mismatch % per page to `discovery/qa/`. Iterate on header, footer and home until mismatch is **≤ 2% at each width** (dynamic areas such as autoplay or the marquee offset may be masked; list the masks).

🧑 **Gate G2:** show the human side-by-side live vs new (and the diff images) for header, footer and home at the three widths. Iterate until approved. Record the approval in the report.

## Acceptance checks
- Visual mismatch table (page × width) in the report, all ≤ 2% (or human-accepted)
- `pnpm test` (cache helper) + `pnpm build` green
- Commit `phase-04: design system + home`
