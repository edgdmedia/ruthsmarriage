# Global map: tokens, chrome, shared components

Source: live captures on 2026-10-16 with the intended fonts injected (README D7). Raw data: `discovery/specs/raw/home-{1440,1024,390}.json`, `discovery/specs/states.json`, `discovery/raw/css/post-{6,63,329,23}.css`. Screenshots: `discovery/screenshots/live/` and `…/live/states/`.

## Measurement conventions (read first)

- Captures use headless Chromium **with a 15px vertical scrollbar**, so the layout widths are **1425 / 1009 / 375** for viewports 1440 / 1024 / 390. Box coordinates in every map are `x,y,w,h` in CSS px at those layout widths. Phase 8's `qa:visual` must use the same browser (agent-browser) so the scrollbar matches.
- Elementor breakpoints: **tablet ≤ 1024px**, **mobile ≤ 767px**. Every "@1024" note applies to `max-width: 1024px`; every "@390" note applies to `max-width: 767px`.
- "Boxed" Elementor containers (`e-con-boxed`) centre a **1140px** inner box; at 1425 that's x = 142.5–1282.5. Most page sections are full-width containers with `padding: 0 50px` and a boxed inner.
- Values are copied as measured. Don't round 19px to 20px.

## Tokens (`src/styles/tokens.css`)

| Token | Value | Where it's used |
|---|---|---|
| `--color-primary` | `#BF1E72` | divider bars, white-button text, active nav, mobile toggle border/icon (`#ED0D82` on the icon, see header) |
| `--color-accent` | `#ED0D82` | pink pill buttons, active carousel dot, hamburger icon + border |
| `--color-plum` | `#5A0F36` | marquee bar background, service-card title panel |
| `--color-plum-button` | `#721646` | "Ask Coach Ruth" header button |
| `--color-primary-14` | `#BF1E7224` | inactive carousel dots; pink testimonial card background |
| `--color-primary-5` | `#BF1E720D` | pale-pink section backgrounds (wave sections) |
| `--color-text` | `#2E2E2E` | kit text colour (Poppins text widgets) |
| `--color-black` | `#000000` | section headings, nav items |
| `--color-heading-soft` | `#363636` | homepage intro statement |
| `--color-grey-card` | `#63666A` | dark testimonial card background |
| `--color-grey-text` | `#474A4D` | text/icon on the pink testimonial card |
| `--color-grey-light` | `#EBEBEB` | text on the dark testimonial card |
| `--color-footer-bg` | `#0E0D0D` | footer |
| `--color-footer-head` | `#DFDFDF` | footer column headings |
| `--color-footer-text` | `#CCCCCC` | footer links/text (kit global `0d0d7ba`) |
| `--color-dropdown-text` | `#33373D` | dropdown items (Elementor default) |
| `--color-body` | `#333333` | Hello theme body text (unstyled content) |
| `--shadow-header` | `0 0 31px -11px rgba(86,86,86,0.23)` | sticky main bar |
| `--container` | `1140px` | |

**Fonts** (self-host with `@fontsource`):
- **Nunito**: 500, 600, 800, plus 600 italic (service sub-labels). Headings, buttons, footer headings and links, dropdown items.
- **Poppins**: 400, 500. Text widgets, sub-headings (h6 style), footer post links, form fields.
- **Roboto**: 600. **Only** the desktop header nav items.
- **Body/system stack** for anything Elementor didn't style (testimonial text, card excerpts, Hello-theme pages): `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"`, 16px/24px, `#333333`. This is Hello Elementor's `reset.css` stack; copy it exactly.

Headings have **line-height = font-size** (Elementor sets `line-height: 1` on these widgets). Keep that, or multi-line headings will grow.

## Header (Elementor template 63) → `Header.astro` + `MarqueeBar.astro`

Total height 137 (desktop/tablet), 128 (mobile). Two stacked bars. Only the **main bar** is sticky (`position: sticky; top: 0` on all devices, z-index 1000); the marquee scrolls away.

### Marquee bar (`MarqueeBar`, data: `marquee_items` collection, README D10)
- Full width, bg `--color-plum`, padding `0 10px`, height **52**. Inner content box 1140 wide (989 @1024, 355 @390), 32 tall, vertically centred (10px top/bottom).
- Live uses a `<marquee>` scrolling right→left with `scrollamount=6`, `scrolldelay=85` (≈ 6px per 85ms ≈ **70px/s**). Reimplement with a CSS `@keyframes` translateX loop at ~70px/s. Live doesn't pause on hover; keep it that way. **Stop** it under `prefers-reduced-motion`.
- Content: each item's `text` as a link to its `link`. The sequence repeats to fill the loop (live repeats the single item 4×). Separator between repetitions: `<span> | </span>` in white 16px/24px 400 with `padding: 0 150px`.
- Link: white, **system stack** (not Nunito), **17px/25.5px 600**, no underline. The marquee box is 26px tall and starts 10px below the bar top. (Custom CSS on live: `.ruth-marquee a { color: white; font-weight: 600; font-size: 17px }`, `.ruth-marquee span { color: white; padding: 0 150px }`.)

### Main bar
- bg `#FFFFFF`, `--shadow-header`, padding `10px 20px`, height 85 (desktop/tablet) / 76 (mobile). Flex row with 10px gap. Three columns:

| Column | Desktop (≥1025) | Tablet (768–1024) | Mobile (≤767) |
|---|---|---|---|
| Logo | width 15% (202.7px @1425), logo img **116×65** at x=63 (centred in its column) | 142px column, logo 116×65, left-aligned x=33 | width 30% (99.5px), img **99.5×56**, left at x=20 |
| Nav | width 70%, nav centred; 5 top items | Order **last** (`order: 99999`), width 10%: only the **hamburger** shows, at the right edge | width 15%, hamburger at the right edge |
| Button | width 16%, right-aligned "Ask Coach Ruth" | width 75%, button right-aligned (x=778) | width 50%, button right-aligned (x=189) |

Mobile bar uses `justify-content: space-between`.

**Logo:** `uploads/2025/06/logo-2-1.png` (1000×563), linked to `/`.

**Desktop nav items** (Elementor SmartMenus horizontal, pointer "text", no animation):
- Roboto 15px/20px 600, colour `#000000`, padding `13px 7px` (item height 46). Each parent item has a caret `eicon-caret-down` (see `assets/icons/eicon-caret-down.svg`), with the caret span padded `10px 0 10px 10px`.
- Between items: a 12px-tall 1px divider, colour `#7A7A7A30` (`--e-nav-menu-divider-*`).
- Hover/active: text colour → `--color-primary` `#BF1E72` (the "text" pointer only changes colour).
- Labels/hrefs: About ▾ (About Us `/about/`, Our Story `/our-story/`, Our Founder `/founder/`) · Counseling Services ▾ (Singles `/singles/`, Married `/married/`) · Resources ▾ (Courses, Guides, and Intimacy Builders `/resources/`, Books `/books/`, Videos `/videos/`) · Freebies ▾ (Blog Articles `/inspired-features/`) · Media ▾ (Sponsored `/sponsored/`, Announcements `/announcements/`, Event Gallery `/event/`). Parents are not links (`href="#"`): render them as `<button>` with `aria-expanded`.

**Desktop dropdown** (screenshot `states/dropdown-resources-open-1440.png`):
- Opens on hover/focus directly under the item (top = bottom of the 46px item), left-aligned with the item.
- Panel: bg `#FFFFFF`, **no shadow, no radius, no border**, min-width 130px, width fits the longest label (276px for Resources).
- Items: Nunito 13px/20px 500, colour `#33373D`, padding `13px 20px` (46px tall). Hover: colour `--color-primary`, bg stays transparent (`#ED0D8200`).

**"Ask Coach Ruth" button:** `<a href="/askcoach/">`, Nunito 12px/12px 500, white on `#721646`, radius 10px, padding 10px, 106×32. Transition 0.3s. On live, hover keeps the same colours (no visible change). Match that.

### Hamburger + mobile menu (≤1024; screenshots `states/mobile-menu-open-{1024,390}.png`, `mobile-submenu-open-*.png`)
- Toggle: 44×44 @1024 (icon 28px, padding 7px) / 39.5×39.5 @390 (icon 25px, padding 6.25px). Transparent bg, **1px solid `#ED0D82` border, radius 3px**, icon colour `#ED0D82`. The icon becomes `fas-times` when open (`assets/icons/fas-times.svg`).
- Panel: full layout width, starts **directly under the main bar** (y=144 @1024, y=137 @390; Elementor adds `margin-top: 28px` @1024 relative to the toggle), bg white, no shadow. It pushes nothing (absolute) and isn't animated (opens instantly).
- Top-level items: Nunito **18px** @1024 / **16px** @390, weight 500, colour `#33373D`, padding `15px 37px`, row height 50. Each parent has a caret on the right. Tapping a parent expands its children inline below it (accordion; children indented by Elementor's default sub-item padding, see the screenshot). Hover/active colour `--color-primary`.

## Footer (Elementor template 329) → `Footer.astro`

- Full width, bg `#0E0D0D`, padding `0 10px`. Inner boxed 1140.
- **Columns row:** flex row, gap 20, padding `50px 0 40px`. Four columns, each **270px** (232 @1024), with padding 10px and an internal column gap of 20px. @390 the columns stack full width (355px), gap 20.
  1. **Contact:** h5 "Contact" (Nunito 20px/20px 600 `#DFDFDF`). Text: Poppins 15px/22.5px `#CCCCCC`: "admin@ruthsmarriage.com, ruthsmarriage@gmail.com" as two `mailto:` links. Social icons row: 5 circles **34×34**, gap ≈5px (x step 39), icon 17px **white**. Backgrounds: Facebook `#3B5998`, Twitter `#1DA1F2`, Instagram `#262626`, YouTube `#CD201F`, Threads `#000000`. Links from settings (README D14). Icons: `assets/icons/fab-*.svg`. Open in a new tab.
  2. **Services:** h5 "Services". List of 6 service titles (menu `footer-services`): Poppins 14px/16.8px 400 `#CCCCCC`, rows separated by 9px (grid row-gap 9). Links. Long titles wrap within 250px.
  3. **Resources:** same style, 6 resource titles (menu `footer-resources`).
  4. **Links:** h5 "Links". A **vertical** nav using the primary menu: Nunito 16px/20px 600 `#CCCCCC`, padding `5px 0` (30px rows), carets as in the header. Its submenus expand on hover/click like a vertical SmartMenu (match the live behaviour at each width).
- **Bottom row:** flex, `space-between`, align centre, padding 10px, height 66. Left: "Ruth's Marriage © {current year}. All rights reserved." (Nunito 16px/16px 600 `#CCCCCC`; the year is dynamic, a Known-issue fix). Right: horizontal nav "Cancellation Policy", "Confidentiality Policy" (Nunito 16px/20px 600 `#CCCCCC`, padding `13px 20px`).
  - @390: `flex-direction: row-reverse; flex-wrap: wrap-reverse`, so the links sit **above** and the copyright below, centred. Link padding `2px 4px`.
- Heights for QA: 486 @1440, 503 @1024, 1099 @390.

## Shared components

### `SectionHeading` (title + divider + optional subtitle)
- Title: Nunito **32px/32px 600** `#000`, centred (h2).
- Divider: a 66×3 bar, `border-top: 3px solid #BF1E72`, centred. The widget is 19px tall: 20px gap above, and the bar sits 8px from the widget top.
- Subtitle (optional): Poppins 16px/21px 500 `#000` centred (an h6 on live).
- Vertical rhythm inside sections: 20px gaps between widgets.

### Buttons (`Button.astro` variants)
| Variant | Font | Colours | Padding | Radius | Icon |
|---|---|---|---|---|---|
| `pink` (default CTA, e.g. "About Us", "All Services") | Nunito 15px/15px 500 | white on `#ED0D82` | 12px 24px (h 39) | 20px | none |
| `white-hero` (hero slide 1 "About Us") | Nunito 15px 500 | `#BF1E72` on `#FFFFFF` | 12px 24px | 20px | `far-arrow-alt-circle-down` 15px before the text, 5px gap |
| `white-hero-lg` (hero slides 2/3) | Nunito 16px 600 | `#BF1E72` on white | 15px 30px (h 46) | 20px | same icon at 16px |
| `badge` (resource-card pill) | Nunito 13px/13px 500 | `#BF1E72` on white | 8px 10px 5px | 20px | `fas-dot-circle` 13px |
| `plum-sm` ("Ask Coach Ruth") | Nunito 12px 500 | white on `#721646` | 10px | 10px | none |
Elementor's default button hover is no visible change for these, with a 0.3s transition. Keep `transition: all .3s` and no hover colour change unless a page map says otherwise.

### `WaveSection` (pale-pink section with wave-brush edges)
- bg `--color-primary-5` (`#BF1E720D` over white).
- Top and bottom shape dividers use the **same SVG**, `assets/wave-brush.svg` (Elementor "wave-brush", viewBox `0 0 283.5 27.8`, `preserveAspectRatio="none"`), **fill `#FFFFFF`**, absolutely positioned and centred horizontally:
  - **top:** height **52px**, width `calc(133% + 1.3px)`, `top: -1px`, centred with `left: 50%; transform: translateX(-50%)`.
  - **bottom:** height **40px**, width `calc(116% + 1.3px)`, `bottom: -1px`, flipped with `rotate(180deg)` (the matrix is `-1,0,0,-1`).
- The section keeps `padding: 0 50px` with an inner padding of 100px top (heading starts 100px below the section top; check each map).

### `Carousel` (replaces JetEngine **slick** sliders: README D8, revised)
Live uses slick. Use **any small slider** (Swiper or Embla) configured to behave like slick:
- `slidesToShow` 3 desktop / 2 tablet / 1 mobile (hero: 1), `slidesToScroll: 1`, `infinite: true`, `speed: 500ms`, `autoplay` with `pauseOnHover`. The delay is **5000ms** for content carousels and **9000ms** for the hero.
- Gaps: the slides have no gap; each item has an inner horizontal padding of 10px (3 × 387px slides in the 1140 box = 1161, so the track has a −10px margin on each side).
- **Dots** (content carousels): centred `ul` with margin `10px 0` (18px tall); each dot is **12×12**, radius 100%, margin 3px, inactive `#BF1E7224`, active `#ED0D82`; no numbers. Hover stays inactive-coloured.
- **Arrows** (hero only): 50×50 hit area, absolutely positioned, vertically centred (margin-top −25px), x = 10px from each edge; white 30×30 chevron SVG (`assets/icons/slider-prev-arrow.svg`; "next" is the same SVG mirrored with `scaleX(-1)`), no background.
- SSR the first `slidesToShow` slides so there's no layout shift and the carousel works without JS. `prefers-reduced-motion` disables autoplay.

### `PageHero`: two variants
Data: page fields `hero_title` (default = page title) and `hero_image`.

**Variant `photo`** (JetEngine component 377). Used on About, Our Story, Founder, Contact, Event, Inspired Features, Cancellation Policy, Confidentiality Policy.
- Full width, `min-height: 350px` (309 @1024, 259 @390), padding `0 50px` (25px @390), boxed 1140 inner.
- Background: page `hero_image`, `cover`, `center`. **Overlay** `::before`: `linear-gradient(180deg, rgba(191,30,114,.25) 0%, #000 100%)` at full opacity.
- Title (h2 on live; render as the page **h1** with the same styles): Nunito **700 55px/55px** white, left-aligned, **bottom-aligned** with 50px bottom padding (25px @390). **40px** @1024, **30px** @390.
- Images per page: about `2025/06/0f916965-7f23-496.jpg`; our-story `2025/06/GetPaidStock.com-6567a16e8212f.jpg`; founder `2025/06/Runway-2023-10-23T08_30_02.310Z-Expand-Image-scaled-1.jpg`; contact `2025/06/GetPaidStock.com-64f716fb8016a.jpg`; event `2025/06/photo-output-2.jpeg`; inspired-features `2025/06/GetPaidStock.com-64e4f5133c96c.jpg`; cancellation-policy `2025/06/GetPaidStock.com-654a59f8c0055.jpg`; confidentiality-policy `2025/06/istockphoto-109186945-612x612-1.jpg`.

**Variant `pattern`** (JetEngine component 394). Used on Services, Books, Sponsored.
- Full width. `min-height` **350 / 300 / 250px** (desktop / ≤1024 / ≤767). Padding `0 10px` desktop, **50px** @≤1024, **30px** @≤767. Title centred horizontally and vertically.
- Background: `uploads/2025/06/pink-overlapping-circles-pattern-beautiful-elegant-illustration-graphic-art-design-pink-overlapping-circles-pattern-204064734.webp`, `background-size: auto` (tiled), `center`. **Overlay** `::before`: `#5A0F36` at **opacity 0.89**.
- Title (h1): Nunito **700**, white, **55px / 40px / 35px** (line-height 1).
- Bottom shape divider **"waves"** (`assets/waves.svg`, white fill, flipped to the bottom): height **23px** (17px @≤767), width `calc(117% + 1.3px)`, centred.

**Variant `pattern-flat`** (page-built heroes on Singles and Married; see `singles-married.md`). Same background and overlay as `pattern`, but: min-height **350 at every width**, title Nunito **600** 55px at every width, and a waves divider **37px** tall at width `calc(100% + 1.3px)`.
