# ruthsmarriage.com → Astro + EmDash on Cloudflare: Migration Plan

This folder is a step-by-step runbook for **opencode** to execute. A human runs the phases in order and clears the gates marked 🧑. Each phase file is a self-contained prompt: paste it into opencode, or tell opencode "Execute `migration-plan/phase-NN-*.md`".

Start by reading [`00-site-audit.md`](00-site-audit.md). It holds every fact this plan relies on: the Elementor tokens, page inventory, CPTs, URL shapes and the booking flow.

## Division of labour

- **Claude** owns the **page maps**: [`page-maps/`](page-maps/README.md) has one file per live page/template. Each maps every section → component → EmDash field, with exact measurements at 1440/1024/390 taken from the live site (`discovery/specs/raw/`, `discovery/screenshots/live/`). This is the 1:1 spec. If a page map and anything else disagree on layout or style, **the page map wins**.
- **opencode** owns everything else: scaffold, content model, seed, components, routes, interactions, forms, SEO, QA, deploy. If a page map is ambiguous or contradicts what opencode sees on live, opencode records it in the phase report and asks. It doesn't guess.

## The one goal: a 1:1 visual port

This is **not a redesign**. Each public page must look and behave the same as the live Elementor site at desktop (1440), tablet (1024) and mobile (390), including carousels, the marquee, dropdowns, the off-canvas booking policy and the wave dividers. The visual reference is the live site plus `discovery/`. Fidelity is measured in Phase 8 with pixel diffs. Where the live site is broken (see the audit's "Known issues"), keep the look and fix the behaviour.

## Target architecture

```
Browser ─▶ Cloudflare (ruthsmarriage.com zone, already proxied)
            └─▶ Worker "ruthsmarriage"  (Astro SSR, @astrojs/cloudflare)
                  ├─ static assets  ← public/assets/ (images, fonts, css)
                  └─ JSON content  ← src/data/*.json, bundled at build time
```

- **Framework:** Astro (server output) + React islands, `@astrojs/cloudflare`. **No CMS** — see decision D16 (decided by human 2026-10-20).
- **Content:** JSON files under `src/data/`, generated from `seed/seed.json` (the WordPress capture) by `pnpm data:build`. Full copy for every static page, all services, resources, testimonials and 3 blog posts. The full post import is optional (Phase 10).

## Decisions already made (defaults; override before starting if you disagree)

| # | Decision | Default chosen | Why |
|---|---|---|---|
| D1 | URLs | **Identical to WordPress**: posts and pages at `/{slug}/`, `/service/{slug}/`, `/resource/{slug}/`, `/service-type/{slug}/`, `/resource-type/{slug}/`, `/category/{slug}/`, `/tag/{slug}/`, trailing slash | No redirects needed for content; keeps SEO and shared links |
| D2 | WooCommerce | **Dropped.** `/shop/`, `/cart/`, `/checkout/`, `/my-account/` → 301 `/resources/` | Unused; resources sell through Selar/links.ruthsmarriage.com |
| D3 | Blog comments | **Off** (0 comments ever). The post layout leaves out the comment form | Removes spam surface; EmDash comments can be enabled later |
| D4 | Ask Coach form | Server-handled form (EmDash forms if the installed version provides them, otherwise an Astro action) + **Turnstile**, emailed via **Resend** to **admin@ruthsmarriage.com** (decided 2026-10-16) | The Elementor form posted to WP mail |
| D5 | Booking flow | Keep exactly: "Book Service" → off-canvas policy panel → "I agree" checkbox enables "Book Now" → per-service Selar URL | Payment stays on Selar |
| D6 | Styling | Plain CSS + custom properties named after the Elementor globals (`--color-primary: #BF1E72`, …). No Tailwind | Easiest way to match Elementor's CSS one-to-one |
| D7 | Fonts | **Intended fonts** (decided 2026-10-16). On live, every font file fails CORS (CSS from `www`, files from the apex), so visitors see Helvetica/Arial. The port loads what the kit specifies: **Nunito** (headings/buttons), **Poppins** (text), **Roboto** 600 (header nav only), self-hosted with `@fontsource`, weights per the page maps. Unstyled body text keeps Hello's system stack (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, …`), exactly as live. The reference captures in `discovery/screenshots/live/` were taken **with the fonts fixed**, so they show the intended design | The intended design, measured |
| D8 | Carousels | Live uses JetEngine **slick** sliders. Use Swiper or Embla configured to behave like slick: 3/2/1 per view, infinite, 500ms speed, pause on hover, autoplay **9000ms hero / 5000ms content**, dots (content) or arrows (hero). Exact spec in `page-maps/_global.md` → Carousel | Behaviour parity without jQuery |
| D9 | Media | Reuse the site's own images (the owner's rights). Download them in Phase 1 and ship them with the seed | Pixel parity needs the real images |
| D10 | Header marquee | A **content type** `marquee_items` (`text`, `link`, `order`). Every published item scrolls in the plum top bar. Seed: "Join the 28 Days Lovers Again Challenge with Coach Ruth" → `https://www.ruthsmarriage.com/resource/28-days-lovers-again-challenge/` (decided 2026-10-16). It's a list, so the "no one-row collection" trap doesn't apply | Editors manage announcements like content |
| D10b | Other singletons | Contact emails, socials and footer copy live in **EmDash site settings** (or a plugin's `ctx.settings`), never a one-row collection | AGENTS.md trap 7 |
| D13 | Brand name | **"Ruth's Marriage"** everywhere, including `<title>` and SEO (live's "Ruths Marriage" is corrected) | Decided 2026-10-16 |
| D14 | Socials | Twitter `https://twitter.com/ruthsmarriage`, Facebook `https://facebook.com/RuthsMarriage`, Threads `https://threads.com/RuthsMarriage`; Instagram `https://instagram.com/askcoachruth` (Ask Coach page). YouTube: `TODO(G3)` | Decided 2026-10-16 |
| D15 | Hero banners | **No `banner` content type.** The 3 hero slides ship as static content in the homepage hero component (copy/images from `discovery/content/banners.json`, which feeds Phase 3/4 code, not the CMS). Decided by human 2026-10-17, overrides the audit's `banner` CPT and README's "banners" sample content | Ruth doesn't edit hero slides; they're page furniture |
| D11 | Editor entry | `/admin/` landing page links to `/_emdash/admin`. `/wp-admin*` and `/wp-login.php` → 302 `/admin/`. `/wp-json/*` and `/xmlrpc.php` → 410 | Ruth's team keeps their habits |
| D12 | Repo | `~/Projects/ruthsmarriage` (this folder), pnpm |
| D16 | **No CMS** | **EmDash is dropped** (decided by human 2026-10-20). The site is plain Astro: content lives in JSON files under `src/data/`, images as local files under `public/assets/`. `seed/seed.json` stays the captured source of truth and `pnpm data:build` regenerates `src/data/`. This overrides D3/D4/D10/D10b/D11, which all assumed a CMS/admin UI | The site is a faithful visual port; a CMS adds D1/R2, an admin UI and a content pipeline without changing a single pixel. Editors can still be given a CMS later — the data layer is a plain import surface | |

## Human gates 🧑 (opencode must STOP and ask at these)

| Gate | Phase | What you provide |
|---|---|---|
| G1 | 0 | Run `! pnpm wrangler login` and confirm the Cloudflare account that owns the `ruthsmarriage.com` zone |
| G2 | V1 | Approve the **header, footer and homepage** side-by-side against live (1440/1024/390) before the other templates are built |
| G2b | V8 | Visual sign-off of **all 31 pages × 3 widths** (`discovery/qa/REPORT.md` + side-by-sides). Nothing non-visual starts before this |
| G3 | 6 | Resend API key + verified sending domain (`ruthsmarriage.com` DNS records in Resend), Turnstile site/secret keys, and the YouTube channel URL. (Recipient, socials, marquee and brand name are already decided: D4, D10, D13, D14) |
| G4 | 9 | Create the editor accounts (names and emails) and review staging |
| G5 | 10 | Approve the cutover window and the DNS/route switch. Decide whether to import all 16 posts now |

## ⏩ Current focus: the visual track (decided 2026-10-22)

**Work from [`VISUAL-TRACK.md`](VISUAL-TRACK.md) until the human signs off G2b.** It sets the build order (V1 homepage → V8 full sweep), the compare loop (`node scripts/qa/visual-compare.mjs`) and what's paused: the Ask Coach email backend, Phase 7 (SEO/redirects/perf), Phase 9 (deploy) and Phase 10 (cutover). The latest review is [`reviews/G2-home-2026-10-22.md`](reviews/G2-home-2026-10-22.md).

## Phases

| # | File | Outcome |
|---|---|---|
| 0 | [phase-00-setup.md](phase-00-setup.md) | Tooling verified, git initialised, AGENTS.md installed |
| 1 | [phase-01-reference.md](phase-01-reference.md) | Pixel reference: screenshots at 3 widths, interaction states, computed-style specs per section, media + brand assets, content dump |
| 2 | [phase-02-scaffold.md](phase-02-scaffold.md) | Astro + EmDash project runs locally with D1/R2 |
| 3 | [phase-03-content-model.md](phase-03-content-model.md) | Seed: collections, taxonomies, menus, settings, sample content |
| 4 | [phase-04-design-system.md](phase-04-design-system.md) | Tokens, base CSS, header/footer/global components, homepage: **G2 approval** |
| 5 | [phase-05-templates.md](phase-05-templates.md) | Every route built to match live |
| 6 | [phase-06-interactions-forms.md](phase-06-interactions-forms.md) | Booking off-canvas, Ask Coach form, search, mobile nav, carousels finished |
| 7 | [phase-07-seo-redirects-perf.md](phase-07-seo-redirects-perf.md) | SEO parity, legacy redirects, caching, image delivery |
| 8 | [phase-08-visual-qa.md](phase-08-visual-qa.md) | Automated pixel-diff + link + a11y checks pass |
| 9 | [phase-09-deploy-staging.md](phase-09-deploy-staging.md) | Live on `*.workers.dev` with the seed; editors onboarded |
| 10 | [phase-10-cutover.md](phase-10-cutover.md) | Optional full post import, route switch, monitoring, rollback, WP retirement |

## Skills opencode should load

opencode discovers skills from `~/.agents/skills`, `~/.claude/skills` and `~/.config/opencode/skills`.

| Skill | Use in phase |
|---|---|
| `wordpress-theme-to-emdash` (its `phases/1-discovery.md` … `6-verify.md`, `references/concept-mapping.md`) | 1, 3, 4, 5, 8 |
| `building-emdash-site` (+ `references/*.md`) | 2, 3, 5, 6, 7 |
| `emdash-cli` | 3, 9, 10 |
| `deploying-emdash-cloudflare` (dev cache, cache hints, forms + Turnstile, secrets, migration lock, `/admin` landing) | 2, 6, 7, 9, 10 |
| `agent-browser` (run `agent-browser skills get core --full` once) | 1, 4, 5, 8 |
| `cloudflare`, `wrangler`, `workers-best-practices`, `web-perf` | 6, 7, 9, 10 |
| Resend docs (Context7 / resend.com/docs; use the REST API with `fetch` from the Worker, no Node-only SDK features) | 6 |
| `context7-mcp` / `find-docs` | All. **Check EmDash APIs against current docs** (Context7 `/websites/emdashcms`, docs.emdashcms.com); EmDash changes fast |

`frontend-design` and `ui-ux-pro-max` are **not** used: they push toward redesign, and this port is 1:1.

## Ground rules for opencode (also in AGENTS.md)

1. Never write to the live WordPress site. Scrape at ≤ 2 requests/second with a User-Agent.
2. **Fidelity beats taste.** Don't "improve" spacing, colours, copy or layout. If something looks wrong on live, record it in the phase report and match it anyway, unless it's listed under "Known issues" in the audit.
3. Commit at the end of every phase with `phase-NN: <summary>`, after writing `migration-plan/progress/phase-NN-report.md` (what was done, deviations, open issues).
4. Never claim a phase complete without running its **Acceptance checks** and pasting their output into the report.
5. Don't invent content (copy, links, prices, testimonials). Leave `TODO(G3)` markers.
