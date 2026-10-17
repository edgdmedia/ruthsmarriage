# Page maps: the 1:1 spec

Written by Claude from live measurements on **2026-10-16**, with the brand fonts injected (README D7). **These maps win over every other source** for layout and style. If one is ambiguous or contradicts what you see on live, write it in the phase report and ask; don't guess.

## Read in this order
1. [`_global.md`](_global.md): measurement conventions, tokens, fonts, header (marquee, nav, dropdowns, mobile menu), footer, and shared components (`SectionHeading`, `Button` variants, `WaveSection`, `Carousel`, `PageHero` variants).
2. The page maps:

| Map | Routes | Build in |
|---|---|---|
| [`home.md`](home.md) | `/` | Phase 4 (G2) |
| [`about.md`](about.md) | `/about/` | 5 |
| [`our-story.md`](our-story.md) | `/our-story/`, `/founder/` | 5 |
| [`contact.md`](contact.md) | `/contact/` | 5 |
| [`singles-married.md`](singles-married.md) | `/singles/`, `/married/` | 5 |
| [`services.md`](services.md) | `/services/` | 5 |
| [`resources-books-videos.md`](resources-books-videos.md) | `/resources/`, `/books/`, `/videos/` + the shared **`ListingRow`** spec | 5 |
| [`inspired-features.md`](inspired-features.md) | `/inspired-features/` (Blog Articles) | 5 |
| [`media-pages.md`](media-pages.md) | `/sponsored/`, `/announcements/`, `/event/` | 5 |
| [`askcoach.md`](askcoach.md) | `/askcoach/` (canvas, no chrome) | 5 + 6 |
| [`single-service.md`](single-service.md) | `/service/{slug}/` + **booking modal** | 5 + 6 |
| [`single-resource.md`](single-resource.md) | `/resource/{slug}/` | 5 |
| [`default-pages.md`](default-pages.md) | posts `/{slug}/`, category/tag/service-type/resource-type archives, search, 404, `/freebies/`, `/privacy-policy/`, `/cancellation-policy/`, `/confidentiality-policy/` | 5 |

## Evidence behind every number
- Screenshots: `discovery/screenshots/live/<page>-<1440|1024|390>.png` (31 pages × 3 widths) and `discovery/screenshots/live/states/` (dropdowns, mobile menu, sticky header, booking modal, form validation).
- Spec trees: `discovery/specs/raw/<page>-<width>.json`. Interaction states: `discovery/specs/states.json`.
- Tools (re-runnable): `scripts/reference/capture.mjs` (+ `extract-spec.js`), `states.mjs`, plus readers `outline.mjs <spec.json> [--skip-chrome]`, `responsive.mjs <page>` and `sections.mjs <page>`. Use them to answer "what exactly is X on live?" before asking.
- Assets: `assets/wave-brush.svg`, `assets/waves.svg`, and `assets/icons/*.svg` (every Font Awesome icon the site uses, plus the slider arrow).

## QA contract (Phase 4/5/8)
- Compare at the same layout widths (1425/1009/375, i.e. agent-browser with a scrollbar), fonts loaded, carousels on slide 0, autoplay stopped, entrance animations finished.
- The **section box tables** in each map are the primary check: each section's y/height within **±4px** (text-heavy sections ±1 line). Pixel diff ≤ 2% per page and width, with carousel tracks, the marquee and video frames masked.
- Expected differences, already decided (don't "fix" these back): intended fonts (D7); comments removed from posts (D3); `/services/` lists all services; video resources show their video; current year in the footer; corrected links; Turnstile on Ask Coach.
