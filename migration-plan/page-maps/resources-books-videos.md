# Resources `/resources/` (page 37), Books `/books/` (page 39), Videos `/videos/` (page 41)

All three list `resources` filtered by `resource_type` (`resource` / `book` / `video`).

| Page | Hero (1440 / 1024 / 390) | List | Footer y @1440 | Page h (1440 / 1024 / 390) |
|---|---|---|---|---|
| Resources | `pattern-flat`, 350 / 350 / 350 | 487+5611 (6 rows) | 6098 | 6584 / 5770 / 8148 |
| Books | `pattern` (component 394), 350 / 300 / 250 | 487+2062 (3 rows) | 2549 | 3035 / 2902 / 4494 |
| Videos | `pattern-flat`, 350 / 350 / 259 | 487+1440 (2 videos) | 1927 | 2413 / 2169 / 1952 |

Hero titles: Resources "**Courses, Guides & Intimacy Builders**" (Nunito 600 55px, 904px wide, centred). Books "Books" (Nunito 700, component 394). Videos "Videos" (Nunito 600).

## `ListingRow`: one component for every alternating list (Services, Singles, Married, Resources, Books)

Rows alternate **A** (even index) and **B** (odd index). Shared rules: text centred, gap 20px, the sticky image column is on desktop+tablet only, and rows have 10px outer spacing.

| Property | A (white, image left) | B (pink band, image right) |
|---|---|---|
| Row background | none | `#BF1E7224` + wave-brush top/bottom, **60px** tall, width `calc(100% + 1.3px)` (40px / 150% @≤767) |
| Row padding | `0 10px` | `70px 50px` (@≤767: `80px 20px` for services, `50px 20px` for resources/books) |
| Column split (image : text) | **Services: 40 : 60**. **Resources/Books: 50 : 50** | **60 text : 40 image**, all lists |
| Image column padding | `20px 20px 50px` (`20px` @≤767) | `20px 20px 50px` (`0` @≤767 for resources/books) |
| Image style | **2px solid `#BF1E7224`, radius 5px**, natural aspect | no border, no radius, natural aspect |
| Text column padding | `50px 30px` (`30px` services / `20px` resources/books @≤767) | `70px 30px` (`20px` resources/books @≤767) |
| Title h2 | Nunito 700 32px/32px **`#000`** | Nunito 700 32px/32px **`#444547`** |
| Audience label (services only) | Poppins 400 italic 17px, `margin-top: -10px` | same |
| Format (services only) | Poppins 600 16px `#000` | same |
| Body | Poppins 400 **15px/22.5px** `#2E2E2E` | Poppins 400 **16px/24px** `#2E2E2E` |
| Button | Nunito 600 15px, white on **`#BF1E72`**, padding 12px 24px, radius 20px | services: white on **`#ED0D82`**; resources/books: white on **`#BF1E72`** |
| Mobile order | image then text | **image then text** (`column-reverse`) |

**Button label and target:**
- services: "Details & Pricing" → `/service/{slug}/`
- resources: `badge_label` if set, else "Learn More" → `/resource/{slug}/` (e.g. "Join the Challenge" for the 28-day challenge)
- books: "Learn More"-style label from the resource → `/resource/{slug}/`. Check `discovery/content/resources.json` for the exact labels (e.g. "Hardcopy (Nigeria)").

Live also has a second, always-hidden button group (`elementor-hidden-desktop/tablet/mobile`) in templates 301/305. **Don't render it.**

## Resources list
- Source: `resources` with `resource_type = resource` (6), live order: The 28 Days Lovers Again Challenge · The Ultimate Couples Hard Conversations Guide · … (`order` field; take the sequence from the content dump).
- Images are tall portrait book/guide covers (e.g. IMG_1053.png 512×800); the image column grows to the image height (A @1440: 520×921).

## Books list
- Source: `resource_type = book` (3): Have Sex & Pray, 50 Intimate Conversations…, 52 Rules of Dating… (confirm order).
- Rows: templates 724 (A) / 728 (B), same as the Resources variants (50:50 in A). Images are square (520×520 in A). **No sticky** on Books images.

## Videos list (template 187)
- Section: padding `0 50px`, 50px top and bottom. Boxed 1140 single column.
- Each item: padding `0 10px` plus 10px vertical spacing. A **16:9 YouTube embed**, 1120×630 @1440, full item width, black background (`--video-aspect-ratio: 1.77777`). The `video_url` field holds the YouTube URL.
- Implement as a **lite embed** (poster image + play button → iframe on click, README Phase 6.6). Before click, it must look like Elementor's video widget poster: the YouTube thumbnail filling the 16:9 box. QA masks the frame.
- Source: `resource_type = video` (2).
