# Phase 09b Report (supplement) — Post-links additions

**Owner approval:** G4 gate passed verbally (items 1–3 of the prior session
deferred commit; all current items covered by G4 / owner review).

---

## What was done

### 1 — PortableText marks renderer (link highlighting)

**File:** `src/components/PortableText.astro`

The renderer was joining span text with `c.text` and ignoring all inline marks,
so bold, italic and links in post content were silently dropped.

Rewritten to iterate children marks and emit nested HTML elements:
- `bold` → `<strong>`
- `italic` → `<em>`
- `underline` → `<u>`
- `strike-through` → `<s>`
- `code` → `<code>`
- `link` (with `href`) → `<a href="…" target="_blank" rel="noopener noreferrer">`

The CSS in `posts/[slug].astro` (`color: #bf1e72; text-decoration: underline`)
already styled links — they now actually render.

### 2 — Share buttons (blog posts only)

**New files:**
- `src/components/ShareButtons.tsx` — React component with:
  - Web Share API (mobile native share)
  - Facebook, X (Twitter), WhatsApp, Email
  - Copy link with clipboard API + `"Copied!"` feedback
- `src/components/icons/whatsapp.tsx` — WhatsApp SVG icon
- `src/pages/sitemap.xml.astro` — full sitemap for all content types

**Modified:** `src/pages/posts/[slug].astro`
- `ShareButtons` imported with `client:load`
- Sits below `PortableText`, above tags
- CSS added: plum/pink pill buttons, hover states, responsive (labels hide on mobile)

### 3 — SEO fixes

#### sitemap.xml
`src/pages/sitemap.xml.astro` — generates `/sitemap.xml` with:
- Static pages (home, about, services, resources, posts, videos, contact, etc.)
- All published posts, resources, services with `lastmod` from `publishedAt`
- Priority `1.0` for homepage, `0.9` for listing pages, `0.7` for content, `0.6` for archive items

#### JSON-LD structured data
| Page | Schema |
|---|---|
| Homepage (`index.astro`) | `Organization` with name, url, logo, social links |
| Blog post (`posts/[slug].astro`) | `BlogPosting` with author (Coach Ruth), datePublished, publisher |
| Resource detail | `Article` (or `VideoObject` for videos) |
| Service detail | `Service` |

#### `og:type` dynamic
`Base.astro` now accepts a `type` prop (defaults to `"website"`).
Posts pass `type="article"`.

#### Canonical + description on detail pages
- `posts/[slug].astro`: already had `getSeoMeta`; fixed hardcoded `"https://www.ruthsmarriage.com"` → `settings.url`
- `resource/[slug].astro`: added `getSeoMeta` with canonical + og:image
- `service/[slug].astro`: added `getSeoMeta` with canonical + og:image
- Homepage (`index.astro`): added proper `title`, `description`, `canonical`, `og:image` to `<Base>`

#### Homepage tagline
`settings.tagline` was `""`. Set to:
> "Marriage counseling and coaching for couples and singles seeking to grow together God's way."
(~110 chars)

This now activates the homepage `<meta name="description">` and Open Graph description.

#### robots.txt
Added `Sitemap:` directive.

#### All canonical URLs
All `getSeoMeta` calls now use `settings.url` instead of hardcoded
`"https://www.ruthsmarriage.com"`.

---

## Auto-deploy setup

**New file:** `.github/workflows/deploy.yml`

```
Push to dev  →  CI (typecheck + test + build)
Push to main →  CI, then SSH deploy to VPS via appleboy/ssh-action
```

The deploy script (`scripts/deploy-vps.sh`) already existed and is unchanged.

**Setup steps** (for the owner, documented in `docs/vps-runbook.md §20`):
1. Generate a deploy key on the VPS (`ssh-keygen` as `ruthsmarriage`)
2. Add the public key to GitHub → Deploy Keys (with write access)
3. Add three GitHub repository secrets: `VPS_HOST`, `VPS_SSH_KEY`, `VPS_KNOWN_HOSTS`
4. Lock the deploy key to the deploy script via `command=` in `authorized_keys`

---

## Verification

- `pnpm typecheck` → **0 errors**
- `pnpm build` → **Complete**

---

## Files changed

```
.github/workflows/deploy.yml           [new]
docs/vps-runbook.md                    [append §20]
public/robots.txt                     [Sitemap directive]
src/components/PortableText.astro      [span renderer rewrite]
src/components/ShareButtons.tsx        [new — React component]
src/components/icons/whatsapp.tsx      [new]
src/data/settings.json                 [tagline filled in]
src/layouts/Base.astro                [type prop, og:type dynamic]
src/pages/index.astro                  [SEO props + JSON-LD]
src/pages/posts/[slug].astro           [type=article + JSON-LD + ShareButtons]
src/pages/resource/[slug].astro        [getSeoMeta + JSON-LD]
src/pages/service/[slug].astro         [getSeoMeta + JSON-LD]
src/pages/sitemap.xml.astro            [new]
```

## Previously uncommitted (carried from prior session)

```
emdash-env.d.ts                        [EntryLink type]
seed/seed.json                         [links field schema]
src/data/index.ts                      [mapLinks, mapTerms, mapResource badge default]
src/data/types.ts                      [EntryLink interface]
src/pages/videos/index.astro           [title under embeds]
src/styles/components.css              [ServiceCard panel inset fix]
src/components/ServiceCard.tsx        [panel full-width]
test/data.test.ts                     [mapper unit tests]
```
