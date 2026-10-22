# Visual track: build order until visual sign-off (decided 2026-10-22)

**Visual first, deploy last.** Until the human signs off **G2b** (every page matches live), opencode works only on what's visible in the browser. Everything else is **paused**: the Ask Coach email backend (Resend/Turnstile), SEO/redirects/perf (Phase 7), staging deploy (Phase 9) and cutover (Phase 10). Don't run `wrangler deploy`, create Cloudflare resources, or wire Resend before G2b.

## The loop (every step below)
1. Build or fix against the page map (`page-maps/<page>.md`; `_global.md` for shared parts).
2. Run `node scripts/qa/visual-compare.mjs --pages <keys>` against the local dev server (`pnpm dev`, default `http://localhost:4321`; pass `--base` if different).
3. Read `discovery/qa/REPORT.md` and open `discovery/qa/<page>-<width>-sbs.png` (live left, new right).
4. Repeat until **every section is within ±4px** at 1440/1024/390 (carousel sections: ±1 line of card text) and the **pixel diff is ≤ 2%** with carousel tracks, the marquee and video frames masked. Commit `visual: <page(s)>` with the REPORT table pasted into `progress/visual-<step>.md`.

Tip: put `data-section="<live container id>"` on each top-level section (ids are in each page map's section table, e.g. `data-section="04f860d"`). The comparer then pairs sections exactly instead of by order.

## Steps

| Step | Scope | Page keys for the comparer | Exit |
|---|---|---|---|
| V1 | Foundations + header/footer + **homepage**: fix `reviews/G2-home-2026-10-22.md` items 1–10 | `home` | 🧑 **G2**: human approves the home side-by-sides |
| V2 | `ListingRow` pages (one component, five pages) + both `PageHero` pattern variants | `services,singles,married,resources,books` | comparer passes |
| V3 | Story pages + contact (PageHero photo, drop cap, icon boxes, cards) | `about,our-story,founder,contact` | comparer passes |
| V4 | Detail templates + **booking modal UI** (open/close, checkbox gating, flash, scroll-to-policy; Book Now is a plain link to `booking_url`) | `single-service,single-resource,single-resource-book,single-resource-video` (the video page is an expected difference, see the audit) | comparer passes; modal matches `screenshots/live/states/booking-offcanvas-*` |
| V5 | Blog + theme-default pages | `inspired-features,single-post,category,tag,service-type,resource-type,search,404,freebies,privacy-policy,cancellation-policy,confidentiality-policy` | comparer passes (single-post is ~300px shorter: comments removed, D3) |
| V6 | Remaining pages + **Ask Coach form UI only** (fields, Turnstile placeholder box, success/error message states toggled locally; no email sending yet) | `videos,sponsored,announcements,event,askcoach` | comparer passes |
| V7 | Interactions sweep: desktop dropdowns, mobile menu + accordion (1024 and 390), sticky header/columns/sidebar, carousel behaviour (random 6 per request, autoplay, dots, arrows, swipe), marquee | all | matches `screenshots/live/states/*`; keyboard + reduced-motion behave |
| V8 | **Full sweep**: `node scripts/qa/visual-compare.mjs` (all 31 pages × 3 widths) | all | 🧑 **G2b**: human signs off the full REPORT + side-by-sides |

## After G2b (unpause in this order)
1. Phase 6.4: Ask Coach backend (Astro action + Turnstile + **Resend**: the key is in `dev.local`, git-ignored; move it to `.dev.vars` for local and a Worker secret for prod).
2. Phase 7: SEO, legacy redirects, caching, performance.
3. Phase 9: staging deploy. Phase 10: cutover.

## Rules during the visual track
- The page maps win. If the map and live disagree, check live with the reference tools (`outline.mjs`, `responsive.mjs`, `sections.mjs`) and note it in the progress file; don't guess.
- Expected differences (don't "fix" them back): intended fonts (D7), no comments (D3), `/services/` lists all services, video resources show their video, current year in the footer, corrected links.
- No deploy, DNS, Resend or Cloudflare work. Local only.
