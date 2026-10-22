# Home `/` (Elementor page 23, template `elementor_header_footer`)

Reference: `discovery/screenshots/live/home-{1440,1024,390}.png`. Spec: `discovery/specs/raw/home-*.json`. Header/footer: `_global.md`.

## Section boxes (QA targets; y+h in px)

| # | Section | 1440 | 1024 | 390 |
|---|---|---|---|---|
| – | Header | 0+137 | 0+137 | 0+128 |
| 1 | Hero slider `5972661` | 137+920 | 137+788 | 128+864 |
| 2 | Intro statement `1316243` | 1057+217 | 925+217 | 992+337 |
| 3 | Counseling Services (wave) `04f860d` | 1274+740 | 1142+740 | 1329+856 |
| 4 | Testimonials `1f26c99` | 2014+773 | 1882+663 | 2185+948 |
| 5 | Resources (wave) `a5f2b88` | 2787+648 | 2545+648 | 3133+648 |
| 6 | Inspired Features `ab03957` | 3435+598 | 3193+593 | 3781+630 |
| – | Footer | 4034+486 | 3787+503 | 4411+1099 |
| | **Page height** | 4519 | 4289 | 5510 |

Testimonial and carousel heights depend on which slides are visible, and Services/Resources/Posts are **random per load on live**. So the live screenshots show one random draw. Mask the carousel tracks in pixel diffs and compare these boxes instead (`node scripts/qa/visual-compare.mjs --pages home`).

---

## 1. Hero slider → `HeroSlider` (data: `banners`, ordered by `order`)

- Section: full width, `padding: 10px`, `min-height: 100vh`. The slider fills it: a 1405px track at 1440. Autoplay **9000ms**, speed 500, infinite, pause on hover, **arrows yes, dots no** (see `_global.md` → Carousel).
- Each banner picks one of **two slide layouts** with a field `layout` (`portrait` | `overlay`), because live uses a different listing template per banner. Add the field to `banners` in Phase 3.

### Layout `portrait` (template 100; banner "Ruth's Marriage", slide 1)
- Box: `min-height: 95vh` (855 @1440, 729.6 @1024, 801.8 @390). Flex column, `justify-content: flex-end`. Padding `50px 50px 100px 80px` (desktop/tablet), `30px` all round @390.
- Background: banner `image` (`uploads/2025/06/Runway-2023-10-23T08_30_02.310Z-Expand-Image-scaled-1.jpg`), `background-size: 130% auto; background-position: center left` (0% 50%). **@≤767 swaps to a different image**, `uploads/2025/06/DSC08266-1-scaled-1.jpg`, with `background-size: cover; background-position: top center`. Add an optional `mobile_image` field to `banners`.
- No overlay.
- Content column: width **76%** desktop (866px), **88%** tablet, 100% mobile. Padding 10px, gap **30px**.
  - Title (h2): Nunito **800**, **99px/99px** desktop, **72px** @1024, **45px** @390; white; `text-shadow: 4px 0 22px rgba(0,0,0,.3)`.
  - Subtitle (p): Poppins 400, **24px/24px** desktop, **20px** @1024, **16px** @390; white.
  - Button: `white-hero` ("About Us" → `/about/`; live points at `https://ruthsmarriage.com/about`, normalise it), icon `far-arrow-alt-circle-down`.

### Layout `overlay` (template 116; banners "Support and Counsel", "Resources and Tools")
- Box: `min-height: 100vh` (900/768/844), flex column, `justify-content: center`. Padding `50px` (`30px` @≤767).
- Background: banner `image`, `cover`, `center right` (`top center` @≤767). **Overlay:** `::before` in `#5A0F36` at **opacity 0.57**.
- Content column: width **70%** (≥768), 100% mobile. Padding 10px, gap 20px.
  - Title: Nunito 800 **70px/70px** (wraps to 2 lines @1024), **44px** @390, white, same text-shadow.
  - Subtitle: Poppins 400 24px/24px, **16px** @390, white.
  - Button: `white-hero-lg` (Nunito 16px 600, padding 15px 30px), icon `far-arrow-alt-circle-down` 16px. Labels/hrefs from the banner (`Resources` → `/resources/`, and `/services/` for "Support and Counsel": check the banner JSON).

## 2. Intro statement (`1316243`)
- Full width, padding `0 50px` (boxed 1140). 50px above the heading, 50px below the button (217 total).
- Heading (h2, editable page copy): "Ruth's Marriage is a marriage counseling and relationship coaching company focused on helping couples enjoy their marriage God's way." Poppins **500 24px/24px**, `#363636`, centred. 2 lines @1440, 6 lines @390.
- 30px gap, then button `pink` "About Us" → `/about/`, centred.

## 3. Counseling Services → `WaveSection` + `SectionHeading` + `Carousel` of `ServiceCard`
- `WaveSection` (`_global.md`), min-height 513, padding `0 50px`; the heading starts **100px** below the section top. Total 740 (856 @390).
- `SectionHeading`: "Counseling Services" (32px/600), divider, subtitle h6 "We provide counseling services for married couples and singles across different parts of the globe. Our services range from individual sessions to couples sessions and are held virtually." (Poppins 16px/21px **500**, `#000`).
- Carousel: **3 / 2 / 1** per view, autoplay 5000ms, dots, no arrows. Source: **6 services picked at random on every request** (verified 2026-10-22: two consecutive live loads gave `142,141,139,131,140,137` and `131,139,142,141,137,130`; JetEngine `orderby: rand`, limit 6). So there are **6 dots**, not 11. Pick server-side per request (`Astro` SSR), and don't cache the HTML for long, or the "random" freezes.
- **`ServiceCard`** (template 159), 367×**300** inside a 387px slide (10px side padding):
  - Whole card is a link to `/service/{slug}/`.
  - Box: `min-height: 300px`, bg = service `featured_image` (`cover`, `center`), **radius `0 0 30px 30px`**, padding `0 20px`, flex column, content at the **bottom** (`justify-content: flex-end`).
  - Title panel: bg `#5A0F36`, **radius `0 0 20px 20px`**, padding 10px, gap 10px, width 327, flush with the card bottom (the panel's bottom edge = card bottom − 20px).
    - Divider: 40×2 bar, `border-top: 2px solid #BF1E72`, left-aligned (widget 10px tall).
    - Title h3: Nunito 600 **19px/19px** white.
    - Sub-label h4 (service `audience_label`, e.g. "(For Married or Engaged Couples)"): Nunito 600 **italic 17px/17px** white. Hidden when empty.
- 20px gap, dots, 20px gap, button `pink` "All Services" → `/services/`.

## 4. Testimonials → `Carousel` of `TestimonialCard` (data: `testimonials`)
- Plain white section, padding `0 50px`; the heading starts 70px below the section top, with 50px below the dots.
- Heading h2: "We believe you too can experience a positive transformation in your marriage. Hear what some of our clients are saying!!" Nunito **500** 32px/32px `#000` centred; **25px** @1024, **19px** @390. No divider.
- Carousel 3/2/1, 5000ms, dots. **Fixed order**, all 6 testimonials (WP ids 456→461). Slides alternate **dark / pink**, starting with dark at index 0 (live alternates templates 462/468).
- **`TestimonialCard`**, 367 wide, height = content (no equal heights: cards are top-aligned with different heights):
  - Padding `0 20px` plus the inner gaps below. Radius `20px 20px 2px 20px`. **Speech-bubble tail via clip-path**: `clip-path: polygon(0 0, 100% 0%, 99% 72%, 100% 100%, 88% 95%, 0 92%)`.
  - Icon `fas-users` (`assets/icons/fas-users.svg`) **23px**, 20px from the card top.
  - Quote: **system font stack** 16px/24px (not Poppins), left-aligned. The gap between icon and quote is 10px (pink) / 20px (dark).
  - Dark variant: bg `#63666A`, icon `#FFFFFF`, text `#EBEBEB`.
  - Pink variant: bg `#BF1E7224`, icon + text `#474A4D`.
  - Bottom padding: enough that the clip-path tail doesn't cut text (on live, text ends ≈ 40px above the card bottom).

## 5. Resources → `WaveSection` + `SectionHeading` + `Carousel` of `ResourceCard`
- WaveSection as in 3 (648 tall at every width). Heading "Resources" (32px **600**) + divider. **No subtitle.**
- Carousel 3/2/1, 5000ms, dots. Source: **6 random `resources`** per request, of any type including videos and books (same `orderby: rand`, limit 6 as Services). **6 dots.**
- **`ResourceCard`** (template 225), 367×**270**:
  - Whole card links to `/resource/{slug}/`.
  - bg = `featured_image` `cover center`, **radius 25px**, padding **20px**, flex column, **centred** vertically, gap 10px.
  - Overlay `::before`: `#5A0F36` at opacity **0.58**, **0.5 on hover** (Elementor's overlay transition, 0.3s).
  - Badge button (`badge` variant): label = `badge_label` (e.g. "Join the Challenge", "Hardcopy (Nigeria)", "Learn More"); icon `fas-dot-circle` 13px; centred; links to the resource. If `badge_label` is empty, live renders an **icon-only** pill (33px wide). Keep that.
  - Divider: **111×2 white** bar (`border-top: 2px solid #FFF`), centred, widget 24px tall.
  - Title h2: Nunito **700 22px/22px** white, centred.
- 20px gap, dots, 20px, button `pink` "All Resources" → `/resources/`.

## 6. Inspired Features → `SectionHeading` + `Carousel` of `PostCard`
- **White** background. Live sets wave-brush shape settings on this container, but with a white fill on white they're invisible, so skip them. Padding `0 50px`; heading 50px below the section top.
- Heading "Inspired Features": Nunito **700** 32px (note: 700 here, 600 in the other sections) + divider.
- Carousel 3/2/1, 5000ms, dots. Source: **6 random `posts`** per request (also `orderby: rand`, not "latest"). This needs ≥ 6 posts in the data, so seed more than 3 (all 16 are in `discovery/content/posts.json`).
- **`PostCard`** (template 239) in a 390px slide with 15px outer padding (card 360 wide, 15px from the slide top):
  - Card: bg white, **radius 10px**, `box-shadow: 0 0 28px -10px rgba(156,156,156,.5)`; **hover** `0 0 22px -1px rgba(0,0,0,.5)`. Padding `15px 15px` (image starts 15px in), flex column, gap 13px. Whole card links to the post.
  - Image: 330×**164** (`min-height: 164px`), `featured_image` cover, centre. No radius.
  - Category pill: bg `#BF1E72`, padding `0 5px 1px`, radius 20px, inline (73×25). Content: `fas-dot-circle` icon 10px white with a 3px right margin, then the category name at **12px/18px system font** `#FDFDFD`. It links to `/category/{slug}/`.
  - Title h2: Nunito **700 16px/16px** `#BF1E72`, left-aligned, links to the post.
  - Excerpt: Poppins 400 **14px/21px** `#333333`, **2 lines max**, ending "…" (live trims to ~10 words + "..."; use the post `excerpt` trimmed to 10 words + "...").
  - Card height 339 (369 slide).

## Interactions
- Hero: arrows + autoplay 9s; swipe on touch.
- Carousels: dots clickable; autoplay pauses on hover; touch swipe.
- Hover: post card shadow; resource card overlay 0.58→0.5. No other hover effects.

## Data the page needs (Phase 3 additions)
- `banners`: + `layout` (`portrait`|`overlay`), + `mobile_image` (image, optional), + `button_url`.
- `services`: `audience_label` shown on the card.
- `resources`: `badge_label` shown on the card.
- Home intro statement and section headings: editable copy on the `home` page entry (Portable Text or fields), not hard-coded.
