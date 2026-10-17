# About Us `/about/` (Elementor page 26)

Reference: `discovery/screenshots/live/about-{1440,1024,390}.png`. Uses `PageHero` (variant `photo`, see `_global.md`).

| Section | 1440 | 1024 | 390 |
|---|---|---|---|
| Header | 0+137 | 0+137 | 0+128 |
| 1 PageHero `dc5bbca` | 137+350 | 137+309 | 128+259 |
| 2 Story + photo `08f0ebe` | 487+646 | 446+896 | 387+1380 |
| 3 Our Values `f7553c8` | 1133+473 | 1342+667 | 1767+1270 |
| Footer | 1607+486 | 2009+503 | 3036+1099 |
| **Page** | 2092 | 2511 | 4135 |

## 1. PageHero (`photo` variant)
Title "About Us"; image `uploads/2025/06/0f916965-7f23-496.jpg`.

## 2. Story + photo (`08f0ebe`)
- Full width, padding `0 30px` (`0 20px` @390), 30px top/bottom (the inner row starts 30px down). Inner boxed 1140: **two columns of 560px** with a 20px gap, each with padding 10px. **Fade-in** entrance animation on both columns (Elementor `fadeIn`, 1.25s; respect `prefers-reduced-motion`).
- @≤1024 the columns **stack** (text first, then photo), full width.
- **Left: text** (page `content`, Portable Text): Poppins 400 **16px/24px** `#2E2E2E`, paragraph spacing 14.4px (`margin-bottom: 0.9em`). 6 paragraphs (copy in `discovery/content/pages/about.json`).
  - **Drop cap** on the first letter: Poppins 400 **50px/50px** `#BF1E72`, floated left, `margin-right: 10px`, box 36×50 (it spans 2 lines). Implement with `p:first-of-type::first-letter`, or a `dropCap` block style.
- **Right: photo** column: background image `uploads/2025/06/about-ruths-marriage.webp`, `cover`, centre; the column height matches the text column (586 @1440). @1024 and @390: `min-height: 398px`, `background-position: 0 -129px` @1024 and `0 0` @390.

## 3. Our Values (`f7553c8`)
- Full width, bg **`#E91B8212`** (`rgba(233,27,130,.07)`), padding `0 50px`; the heading starts 50px down, with 50px below the boxes.
- Heading "Our Values": Nunito 600 32px/32px **`#BF1E72`**, centred (161.8px wide).
- Divider: **59×2, `#000000`** (2px solid), centred, widget 12px; entrance `fadeInLeft`.
- Row: flex, gap 20, padding 10px, 4 **icon boxes** with **unequal widths** (content-sized on live: 212 / 265 / 265 / 318 @1440). Use `flex: 1 1 auto` with those as `flex-basis`, or a grid `212fr 265fr 265fr 318fr`. Each has an entrance `fadeInDown`.
  - Icon: 60×60 circle, **2px solid `#BF1E72`** border, padding 14px, icon 28px `#BF1E72` ("framed" view). Icons: Love `far-heart`, Client Satisfaction `far-smile`, Professionalism `fas-check`, People-centric `fas-users`.
  - Title h3: Poppins **600 22px/26.4px** `#252627`, centred, margin `8px 0 16px` (the icon-to-title spacing is 23px from the icon bottom).
  - Text: Poppins 400 16px/24px `#000000`, centred.
  - Copy: Love: "We love and relate with empathy towards all people." Client Satisfaction: "Our services are client-focused and tailored to meet individual needs and our employees are trained to meet and exceed our client expectations." Professionalism: "Our employees carry themselves professionally, convey a good attitude, and communicate with our clients and their coworkers in a professional manner." People-centric: "We take client feedback into consideration when implementing changes or making decisions. Whether as a client or employee, we strive to ensure a secure and safe…" (take the full text from the content dump).
- @1024: a **2×2 grid** (each 427 wide). @390: one column (255 wide inside a 275 box with 50px side padding).

## Data
`pages/about`: `hero_image`, `hero_title`, `content` (story), plus a `values` block (4 × {icon, title, text}), editable as a custom Portable Text block `iconBoxGrid`.
