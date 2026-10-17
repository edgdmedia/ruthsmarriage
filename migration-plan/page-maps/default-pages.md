# Theme-default pages (Hello Elementor templates) + policy pages

These live pages aren't Elementor-built: blog posts, every archive, search, 404, Freebies and Privacy Policy. They use **Hello Elementor's default templates**, styled only by the theme reset + the kit fonts. Build them from one `HelloLayout` with a `.site-main` wrapper.

## Shared `.site-main` rules (from Hello `theme.css` + kit)
- Container: `max-width: 1140px`, centred, **padding `0 10px`** at ≤1140px widths (x=10 @390). Starts **8px below the header**: the h1 has `margin-top: 8px`, with `main` at header bottom + 8.
- Body text: **system stack 16px/24px `#333333`**, paragraph `margin: 0 0 0.9rem` (14.4px).
- Headings: **Nunito 600** (kit), colour `#333333`, `margin: 0.5rem 0 1rem` (8px top, 16px bottom). Sizes (Hello defaults): **h1 40px/48px** (`2.5rem`, line-height 1.2), **h2 32px/38.4px**, h3 28px, h4 24px, h5 20px, h6 16px.
- Links: **`#CC3366`** (`a { color: #c36 }`); hover `#336` (Hello default). Content links are underlined (they render with `text-decoration: underline` inside content).
- Images inside lists: `width: 100%; max-height: 500px; object-fit: cover` (Hello's `.wp-post-image`).
- Footer follows directly after `main`, with a ~14px gap (the last margin).

## Single blog post `/{slug}/`
Sample `/how-to-handle-a-difficult-spouse/`: page height 3599 / 4062 / 6778.
1. **h1** post title (40px/48px Nunito 600 `#333`). @390 it wraps (3 lines, 96px tall).
2. **No featured image** on the single post: Hello's single template doesn't print it. Match that.
3. **Content** (Portable Text): paragraphs, h2 (32px), lists, inline links (`#CC3366` underlined), images (full width, `height: auto`), bold.
4. **"Tagged"** line after the content: Hello prints `<span class="tag-links">Tagged <a>Instagram</a></span>`, system 16px, link `#CC3366`. Render the post's tags this way, comma-separated.
5. **Comments: not rendered** (README D3). Live shows the WP comment form with a math captcha here; leave it out. The page is about 300px shorter than live (QA note).
- Live content contains web.archive.org links. Phase 1 rewrites them to the original URLs.

## Archives: `/category/{slug}/`, `/tag/{slug}/`, `/service-type/{slug}/`, `/resource-type/{slug}/`, search
- **h1**: "Category: Marriage" / "Tag: Instagram" / "Service Type: Married" / "Resource Type: Book" / "Search results for: {q}" (Hello's `the_archive_title()` format: `{Taxonomy label}: {term}`).
- **Post list**: one `article` per entry, full width, stacked; each is:
  1. **h2** title link (32px/38.4px Nunito 600; the link colour is `#CC3366`, so the title shows **pink**).
  2. **Featured image** link: full width, `max-height: 500px`, `object-fit: cover`. @390 it shows at natural aspect (355×237). Omitted if missing (e.g. the video resource `article` is only 38px tall in search results).
  3. **Excerpt** `<p>`: system 16px/24px `#333` (WP auto excerpt, 55 words, or the manual excerpt).
  - Spacing between articles: 15px (`article` bottom margin, Hello default).
- **Pagination** (10 per page, WP default): `<nav>` flex `space-between`, margin `20px 0`, links "← Previous" (left) and "Next →" (right) in `#CC3366`. URLs `/category/marriage/page/2/` etc. (keep the WP `/page/N/` URL shape).
- Sources: category/tag → `posts`; service-type → `services` with that term (live order: by date desc); resource-type → `resources` with that term; search → posts + pages + services + resources (live search includes all public types).
- Page heights for QA: category 6876 / 7208 / 6257, tag 6852, service-type (married) 4455 / 4568 / 4547, resource-type (book) 2563 / 2652 / 3090, search ("marriage") 6380 / 6558 / 5919.

## 404
- h1 **"The page can't be found."** + p "It looks like nothing was found at this location." (Hello default 404). Main is 88px tall. Page height = viewport (900/768), 1384 @390. Return HTTP 404.

## Freebies `/freebies/`
- Only the h1 **"Freebies"**, then the footer (main 48px). Page height 900 / 768 / 1298. Match it; it's a known empty page (audit Known issue 4).

## Privacy Policy `/privacy-policy/`
- Hello default page: h1 "Privacy Policy", then the page content. Live content is WordPress's **"Suggested text:" boilerplate**, which starts with a duplicate "Privacy Policy" h1 inside the content. Port the content verbatim (the owner may replace it later), but **drop the duplicated inner h1**.
- Heights: 2184 / 2393 / 4141.

## Cancellation Policy `/cancellation-policy/` (page 334) and Confidentiality Policy `/confidentiality-policy/` (page 332)
Elementor pages:
1. `PageHero` **`photo`** (`_global.md`): titles "Cancellation Policy" / "Confidentiality Policy"; images per `_global.md`.
2. **Text section**: full width, padding `0 50px`, **50px top and bottom**, boxed 1140. One text block (Portable Text):
   - Body: **Poppins 400 16px/24px `#2E2E2E`** (kit text style, not the system stack).
   - h4: **Poppins 500 24px/28.8px** `#2E2E2E`, margins `8px 0 16px`.
   - h5: Poppins 500 20px/24px.
   - Links `#CC3366`.
   - Cancellation sections: "$50 fee (converted to your currency rate at the point of payment)" (h5), "CANCELLATIONS AND MISSED APPOINTMENTS" (h4), … ; the content is in the dump.
- Heights: Cancellation 2325 / 2473 / 4818. Confidentiality 2250 / 2302 / 3960.
- **These two pages' content is also rendered inside the booking modal** (`single-service.md`). Use the same Portable Text renderer in both places.
