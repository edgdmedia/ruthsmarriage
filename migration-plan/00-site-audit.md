# Site Audit — ruthsmarriage.com (captured 2026-10-16)

Facts gathered from the live site before planning. Every phase depends on them. Phase 1 re-captures the visual reference and Phase 8 verifies against it. Treat anything marked **verify** as unconfirmed. **For layout/style, `page-maps/` supersedes this file.**

## Stack today

| Item | Value |
|---|---|
| CMS | WordPress, theme **Hello Elementor 3.4.7** + **Elementor 4.2 / Elementor Pro 4.0** |
| Listings / CPTs | **JetEngine** (CPTs `resource`, `service`, `testimonial`, `banner`; taxonomies `resource-type`, `service-type`; listing items drive every grid/carousel) |
| SEO | **All in One SEO** (`aioseo_head_json` on REST objects; `wp-sitemap.xml` also live) |
| Other plugins | WooCommerce (pages exist, unused, **dropped**), MailPoet + Mailchimp (no visible form on any page), WPForms (no visible form), Code Snippets (booking-policy shortcode), WP Mail SMTP, Really Simple Security, AIOS |
| CDN | Already proxied through **Cloudflare** (`server: cloudflare`, `cf-ray`, email obfuscation `/cdn-cgi/l/email-protection`) |
| Analytics | No GA/GTM/Clarity tag found in HTML (**verify** with the owner) |
| Permalinks | Posts **`/{slug}/`** (same namespace as pages). CPTs: `/resource/{slug}/`, `/service/{slug}/`, `/service-type/{slug}/`, `/resource-type/{slug}/`. `/category/{slug}/`, `/tag/{slug}/` |
| Site title (WP) | "Ruths Marriage" (no apostrophe; `<title>` = "Home - Ruths Marriage") |
| Logo | `https://www.ruthsmarriage.com/wp-content/uploads/2025/06/logo-2-1.png` |
| Favicon | `…/uploads/2025/06/logo-2-e1750027646616-150x150.png` (32) and `…/logo-2-e1750027646616.png` (192) |
| Contact | `admin@ruthsmarriage.com`, `ruthsmarriage@gmail.com` |
| Socials (confirmed by owner 2026-10-16) | `https://twitter.com/ruthsmarriage`, `https://facebook.com/RuthsMarriage`, `https://threads.com/RuthsMarriage`, `https://instagram.com/askcoachruth` (Ask Coach page); YouTube URL still to come (G3) |
| External commerce | Services book via **Selar** (`https://selar.com/<code>`, per service). Resources link out to `https://links.ruthsmarriage.com/<slug>` or Selar. No on-site cart. |

## Design tokens (Elementor kit, `post-6.css`)

| Token | Value | Use |
|---|---|---|
| `--e-global-color-primary` | `#BF1E72` | magenta: headings accents, dividers, nav hover |
| `--e-global-color-accent` | `#ED0D82` | bright pink: buttons, active carousel dot |
| `--e-global-color-secondary` | `#000000` | |
| `--e-global-color-text` | `#2E2E2E` | body text |
| `--e-global-color-e39f6bc` | `#5A0F36` | deep plum: top bar, service card title box, "Ask Coach Ruth" button |
| `--e-global-color-c9d189f` | `#BF1E7224` | magenta 14% (tints) |
| `--e-global-color-7060d75` | `#BF1E720D` | magenta 5%: pale pink section backgrounds |
| `--e-global-color-0d0d7ba` | `#CCCCCC` | |
| Primary/accent font | **Nunito** 600 / 500 (h1, h2) | |
| Secondary/text font | **Poppins** 400 (body, h6) | Roboto 600 is used only by the desktop header nav |
| Container | 1140px (boxed), tablet breakpoint 1024px, mobile 767px (Elementor defaults) | |

Other observed styles (confirm with computed styles in Phase 1): pill buttons (fully rounded, pink `#ED0D82`, white text), wavy **shape dividers** at top/bottom of pale-pink sections, testimonial cards alternating dark grey (`#5F6266`-ish) and pale pink with a "speech-bubble" tail, footer near-black with 4 columns.

## Page inventory (live, 2026-10-16)

| URL | Template | Content / widgets |
|---|---|---|
| `/` (page 23, `elementor_header_footer`) | Elementor | Hero **banner slider** (3 `banner` CPT slides, autoplay, arrows) → intro text + "About Us" button → **Counseling Services** carousel (pale-pink, wave dividers, 3 visible, dots, "All Services") → **Testimonials** carousel (3 visible, alternating colours) → **Resources** carousel (image cards with badge pill + title overlay, "All Resources") → **Inspired Features** carousel (latest posts: image, category pill, title, excerpt) → footer |
| `/about/` | Elementor | Page-hero component (JetEngine component 377) + text, divider, icon boxes |
| `/our-story/`, `/founder/` | Elementor | Page-hero component 377 + heading + text. Founder links to Typeform `https://form.typeform.com/to/T6W82ycq` |
| `/singles/`, `/married/` | Elementor | Heading + JetEngine grid of `service` filtered by `service-type` (listing items 153/149 alternate layouts) |
| `/services/` | Elementor | Page-hero component 394 + grids of all services |
| `/resources/` | Elementor | Grid of `resource` (type `resource`), listing items 301/305 alternating; CTA buttons to links.ruthsmarriage.com / Selar |
| `/books/` | Elementor | Component 394 + grid of `resource` type `book` (items 724/728) |
| `/videos/` | Elementor | Grid of `resource` type `video` (item 187) with **video** widget (YouTube embeds) |
| `/inspired-features/` (blog) | Elementor | Component 377 + post grid (item 239) + **search** widget + Elementor posts widget |
| `/sponsored/`, `/announcements/`, `/event/` | Elementor | Hero only, no body content (`page-maps/media-pages.md`) |
| `/freebies/` | Hello theme default | Only the title "Freebies" (empty page) |
| `/contact/` | Elementor | Hero component 377, icons + emails, social icons |
| `/askcoach/` | `elementor_canvas` (**no header/footer**) | Heading, divider, **form** (Category select: Love/Dating/Marriage/Sex/Faith/Life + Question textarea + Send), social icons (YouTube, Instagram) |
| `/cancellation-policy/`, `/confidentiality-policy/`, `/privacy-policy/` | Elementor / default | Legal text |
| Single **post** `/{slug}/` | Hello theme default (no Elementor single template) | Title, featured image, content, "Tagged …", WP comment form with math captcha |
| Single **service** `/service/{slug}/` | Elementor single 143 | Featured image, service-type term, title, price ("₦160,000/$160"), audience label ("(For Married or Engaged Couples)"), format ("Zoom Video Session"), description, notice text, **"Book Service" opens an off-canvas** with the confidentiality + cancellation policy text and an **"I agree" checkbox that enables "Book Now"** → Selar URL (`data-url`) |
| Single **resource** `/resource/{slug}/` | Elementor single 590 | Featured image, resource-type term, title, content, "Learn More" button → external URL |
| `/category/marriage/`, `/tag/*`, `/?s=` | Hello theme default | Simple archive list (title + excerpt) |
| 404 | Hello theme default | |
| `/shop/`, `/cart/`, `/checkout/`, `/my-account/` | WooCommerce | **Dropped** (D2) |
| `/sample-page/` | default | Junk; don't migrate |

**Global header (Elementor 63):** plum **marquee top bar** "Join the 28 Days Lovers Again Challenge with Coach Ruth" (scrolling text → `/resource/28-days-lovers-again-challenge/`) → sticky main bar: logo left, centred nav with dropdowns, "Ask Coach Ruth" plum pill button right (→ `/askcoach`). Mobile: hamburger (**capture in Phase 1**).

**Primary menu:** About ▾ (About Us, Our Story, Our Founder) · Counseling Services ▾ (Singles, Married) · Resources ▾ (Courses, Guides, and Intimacy Builders → `/resources/`, Books, Videos) · Freebies ▾ (Blog Articles → `/inspired-features/`) · Media ▾ (Sponsored, Announcements, Event Gallery → `/event/`).

**Global footer (Elementor 329):** 4 columns: **Contact** (2 emails + social icon circles: Facebook, Twitter, Instagram, YouTube, Threads) · **Services** (6 service links) · **Resources** (6 resource links) · **Links** (the primary menu again, as dropdowns). Bottom row: "Ruth's Marriage © 2025. All rights reserved." · Cancellation Policy · Confidentiality Policy.

## Content inventory

| Type | Count | Notes |
|---|---|---|
| Posts | 16 | All in category `marriage`. Tags: `instagram` (14), `godly-perspective` (1). 0 comments ever. |
| Pages | 25 | ~20 real (see table above); WooCommerce 4 + `sample-page` dropped |
| `service` | 11 | `service-type`: married (6), singles (5). Several titles exist in both types (different slugs, e.g. `…-classes` and `…-classes-2`). Fields: price, audience label, format, Selar booking URL. |
| `resource` | 11 | `resource-type`: resource (6), book (3), video (2). Fields: badge label (e.g. "Join the Challenge", "Hardcopy (Nigeria)"), CTA URL, CTA label ("Learn More"), video URL for videos |
| `testimonial` | 6 | Not public via REST (scrape the text from the homepage carousel) |
| `banner` | 3 | Hero slides: `ruths-marriage` ("At Ruth's Marriage, we believe you too can enjoy your marriage!", button "About Us"), `support-and-counsel`, `resources-and-tools`. Each has a featured image. |
| Media | 63 attachments | Owner's own media: reuse is allowed |

## Known issues on the live site (keep the look, but fix these silently)
1. Broken web.archive.org links in content (Twitter, mailto, external) → replace with the original target.
2. Static "© 2025" → render the current year.
3. Comment form + math captcha on posts with 0 comments ever (see D3).
4. `/freebies/` is empty and the "Freebies" menu item only holds "Blog Articles".
5. Duplicate services per audience (`-2` slugs) → keep both: URLs must survive.
6. **Brand fonts never load on live** (CORS: CSS on `www`, font files on the apex). The port uses the intended Nunito/Poppins/Roboto (README D7).
7. `/services/` lists only the first 6 services (JetEngine's default query size). The port lists all of them (`page-maps/services.md`).
9. Single **video** resources show only a title (the template doesn't render the video). The port embeds `video_url` (`page-maps/single-resource.md`).
8. Contact page and footer: the Twitter/mailto links point at web.archive.org, and the Instagram/YouTube icons have no href. Use the settings values (D14).
