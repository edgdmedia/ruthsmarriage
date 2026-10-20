# Phase 4 report — Design system, global chrome, homepage (2026-10-17)

## What was done

### 4.1 Foundations
- `src/styles/tokens.css`: all kit tokens from `_global.md` (colours `--color-primary #BF1E72`, `--color-accent #ED0D82`, `--color-plum #5A0F36`, `--color-plum-button #721646`, `--color-primary-14/5`, `--color-text #2E2E2E`, `--color-black`, `--color-heading-soft #363636`, `--color-grey-card #63666A`, `--color-grey-text #474A4D`, `--color-grey-light #EBEBEB`, `--color-footer-bg #0E0D0D`, `--color-footer-head #DFDFDF`, `--color-footer-text #CCCCCC`, `--color-dropdown-text #33373D`, `--color-body #333333`, `--shadow-header`, `--container 1140px`, breakpoints 1024/767). Fonts: Nunito 500/600/800/600italic, Poppins 400/500, Roboto 600 via `@fontsource`, system stack for unstyled body text. Headings line-height = 1.
- `src/styles/base.css`: Hello Elementor reset defaults.
- `src/styles/components.css`: extracted from React islands (Astro `<style>` blocks don't work in `.tsx`) — marquee keyframes, Swiper pagination/nav overrides, footer mobile media queries, hero responsive media queries.

### 4.2 Components (`src/components/`)
Icon components (13): caret-down, times, dot-circle, arrow-alt-circle-down, users, slider-prev-arrow, facebook, twitter, instagram, youtube, threads + wave-brush, waves SVGs.
Button (pink/white-hero/white-hero-lg/badge/plum-sm variants), SectionHeading, MarqueeBar (CSS translateX loop @~70px/s, stops under prefers-reduced-motion), Header (sticky main bar, Roboto nav, caret dropdowns, Ask Coach Ruth plum-sm button), Footer (4 columns + bottom row, socials with brand colours, dynamic copyright year), WaveSection (wave-brush top/bottom dividers), Carousel (Swiper, children-as-slides pattern for SSR, 3/2/1, dots for content / arrows for hero, autoplay 5s/9s), HeroSlider (portrait/overlay layouts, arrows, 9s autoplay), ServiceCard, TestimonialCard (dark/pink alternate, clip-path speech tail), ResourceCard, PostCard, PageHero (photo/pattern variants).

### 4.3 Layout
- `src/layouts/Base.astro`: EmDashHead/BodyStart/BodyEnd, getSeoMeta(), menus via `getMenuWithCacheHint`, settings via `getSiteSettingsWithCacheHint`, marquee items from `marquee_items` collection, all cache-hint sets guarded via `src/lib/cache.ts`.
- `src/layouts/Canvas.astro`: no-header/no-footer variant for /askcoach/.
- `src/pages/index.astro`: homepage — hero slider (3 static slides from capture data), intro statement, Counseling Services wave carousel (11 services), Testimonials carousel (6, dark/pink alternate), Resources wave carousel (11), Inspired Features carousel (6 posts).

### Dev tooling
- `test/cache.test.ts`: vitest for `setCacheHint` (5 tests, all pass).
- `pnpm build` ✅ green. `pnpm test` ✅ 5/5 pass.

### Fidelity loop (4.4)
- `scripts/reference/convert-styles.mjs`: one-off helper converting inline CSS strings `style="..."` → React style objects `style={{...}}` (React rejects string styles in SSR).
- `scripts/reference/remove-style-blocks.mjs`: removed Astro `<style>` blocks from `.tsx` islands (they don't render in React SSR); extracted into `components.css`.
- `scripts/qa/visual.mjs`: placeholder — extended in Phase 8.
- Screenshots captured for G2: `discovery/screenshots/g2-home-{1440,1024,390}.png` (homepage at 1440/1024/390 via agent-browser at localhost:4323).

### Deviations from the plan
1. **Homepage data**: seed has only 3 posts (Phase 3), so Inspired Features carousel shows 3 instead of 6. Phase 10 may import more.
2. **Hero slides**: baked into `index.astro` frontmatter from capture data (D15 — static, not a banner collection). `mobile_image` not yet implemented (DSC08266.jpg is 404 on live anyway).
3. **Mobile menu**: hamburger renders but the off-canvas panel + accordion submenus per `_global.md` §80-84 not yet implemented (desktop nav shows on mobile). Deferred to Phase 5 templates.
4. **Carousel children-as-slides pattern** used instead of `slides` prop — Astro serializes JSX props as TemplateResult objects which break React island SSR; children pass through correctly.
5. `trailingSlash` not set in `astro.config.mjs` — EmDash route tolerance unconfirmed; Phase 7 middleware will enforce trailing-slash if needed.

## Open issues / notes for Phase 5+
- **G2 gate pending**: human side-by-side approval of header/footer/home vs live at 1440/1024/390 has not yet happened. Screenshots captured at `discovery/screenshots/g2-home-*`. Need sign-off before Phase 5.
- TypeScript strict has some loose prop types on React components (porting priority was visual output); `pnpm typecheck` has errors but `pnpm build` is green.

## Acceptance checks
```
$ pnpm build        → ✅ Complete! (~7s)
$ pnpm test         → ✅ Test Files 1 passed, Tests 5 passed
```
Visual mismatch table: pending G2 — no pixel diffs generated yet (needs `scripts/qa/visual.mjs` from Phase 8 + human approval at G2).
