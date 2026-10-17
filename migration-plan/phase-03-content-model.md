# Phase 3: Content model and seed

**Goal:** `seed/seed.json` defines the full schema, menus, settings and sample content, so a fresh database gives a site with the same content structure as live.

**Skills:** `building-emdash-site` → `references/schema-and-seed.md`, `references/site-features.md`; `wordpress-theme-to-emdash` → `phases/5-seed.md`, `references/concept-mapping.md`; `emdash-cli`. Inputs: `discovery/content/*.json`, `discovery/media/`.

Check every field type, `urlPattern`, taxonomy, menu and settings key against the installed EmDash version's seed schema (`https://emdashcms.com/seed.schema.json` and the docs) before writing. Where the docs disagree with this file, follow the docs and record the deviation.

## 3.1 Collections

| Collection | `urlPattern` | Fields (beyond title/slug) | Supports |
|---|---|---|---|
| `posts` | `/{slug}` | `featured_image` (image), `content` (portableText), `excerpt` (text) | drafts, revisions, preview, scheduling, search, seo |
| `pages` | `/{slug}` | `content` (portableText), `hero_image` (image), `hero_title` (string), `hero_subtitle` (text). Elementor-built pages render from **Astro section components** (Phase 5); their copy goes into Portable Text blocks or custom block types, so editors can still edit text | drafts, revisions, preview, search, seo |
| `services` | `/service/{slug}` | `featured_image`, `price_label` (string, e.g. "₦160,000/$160"), `audience_label` (string), `format` (string, e.g. "Zoom Video Session"), `content` (portableText), `notice` (text, optional override of the settings default), `booking_url` (url), `order` (number) | drafts, revisions, preview, search, seo |
| `pages` extra fields | | `hero_image` (image), `hero_title` (string), `side_image` (image, story pages) | |

The page maps in `migration-plan/page-maps/` list each page's data needs under **Data**. They take precedence over this table if they differ.
| `resources` | `/resource/{slug}` | `featured_image`, `badge_label` (string), **`ctas`** (repeatable `{label, url}`; e.g. "Selar (ebook)" + "Amazon"), `video_url` (url, optional), `excerpt` (text), `content` (portableText), `order` (number) | drafts, revisions, preview, search, seo |
| `banners` | none (not routable) | `image`, `mobile_image` (optional), `layout` (`portrait`\|`overlay`), `subtitle` (text), `button_label`, `button_url`, `order` (number) | drafts |
| `testimonials` | none | `quote` (text), `author` (string, optional), `order` (number) | drafts |
| `marquee_items` (D10) | none | `text` (string, required), `link` (url), `order` (number) | drafts |

Posts and pages both live at `/{slug}`. Phase 5 resolves pages first, then posts, in a single `[slug].astro`. Record whether EmDash's own permalink/preview generation copes with the shared pattern.

Use a portableText **custom block type** for anything Elementor-only that an editor must be able to change inside a page (e.g. `iconBoxGrid`, `ctaButton`, `divider`). Keep the list short, and only add one when a page in `discovery/content/pages/` needs it.

## 3.2 Taxonomies
- `category` (posts, hierarchical): `marriage` (and `uncategorized`, kept empty)
- `tag` (posts): `instagram`, `godly-perspective`
- `service_type` (services): `married`, `singles`. Public archives at `/service-type/{slug}/`
- `resource_type` (resources): `resource`, `book`, `video`. Public archives at `/resource-type/{slug}/`

Use exactly these names in queries (AGENTS.md rule 2). If EmDash forbids hyphens, the URL segment stays `service-type` and only the internal name changes.

## 3.3 Menus
- `primary`: the 5 dropdowns from the audit, with labels and hrefs exactly as live (parents are non-links, `#`)
- `footer-services`: the 6 service links shown in the footer, in live order
- `footer-resources`: the 6 resource links shown in the footer, in live order
- `footer-legal`: Cancellation Policy, Confidentiality Policy
(The footer "Links" column reuses `primary`.)

## 3.4 Site settings (D10)
`title` "Ruth's Marriage" (D13), `tagline`, `logo`, `favicon`, plus custom keys if the version supports them (otherwise a small native plugin with `ctx.settings` merged over defaults, see the `creating-plugins` skill): `contact_emails[]` (`admin@ruthsmarriage.com`, `ruthsmarriage@gmail.com`), `social` (D14: twitter, facebook, threads, instagram; youtube `TODO(G3)`), `copyright_name` "Ruth's Marriage", `askcoach_recipient` `admin@ruthsmarriage.com`. The marquee is **not** a setting: it's the `marquee_items` collection (seed 1 item, D10).

## 3.5 Sample content
- **Marquee:** 1 item ("Join the 28 Days Lovers Again Challenge with Coach Ruth" → `https://www.ruthsmarriage.com/resource/28-days-lovers-again-challenge/`; store it as the relative path `/resource/28-days-lovers-again-challenge/`)
- **Pages:** every page in the audit inventory except WooCommerce and `sample-page`, with the live copy from `discovery/content/pages/` (real copy, not lorem)
- **Services:** all 11; **Resources:** all 11; **Banners:** 3; **Testimonials:** 6. These are small, and the layouts depend on them
- **Posts:** 3 (the 3 newest shown in the homepage "Inspired Features" carousel). More than 3 cards are needed for the carousel on live, so check whether it shows 6. If so, seed 6.
- Media: upload from `discovery/media/` via the seed's media mechanism, with alt text

Apply the seed locally (see "Applying Seeds" in the skill reference; use `npx emdash seed` or the dev-bypass endpoint). Then run `npx emdash export-seed --with-content=all` and diff it with `seed/seed.json` to prove the round trip.

## Acceptance checks
- Fresh local DB (`rm -rf .wrangler/state` then `pnpm dev`) + seed → `npx emdash content list <collection>` counts: pages ≈ 19, services 11, resources 11, banners 3, testimonials 6, posts 3–6
- Every service has `price_label` and `booking_url`; every resource has `cta_url`
- `npx emdash types` generates types without errors
- Commit `phase-03: content model + seed`
