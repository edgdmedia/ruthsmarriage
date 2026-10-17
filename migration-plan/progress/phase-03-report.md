# Phase 3 report — Content model and seed (2026-10-17)

## What was done

1. Read installed EmDash docs references (`schema-and-seed.md`, `site-features.md` from the `building-emdash-site` skill) and confirmed field types, `$media` shape, seed structure, taxonomy/menu semantics against the current version.
2. Wrote `scripts/reference/build-seed.mjs`: generates `seed/seed.json` from `discovery/content/*` (captured from live in Phase 1) — no invented content.
3. `npx emdash seed seed/seed.json --validate` ✅ seed file is valid.
4. Fresh local DB: `pnpm astro dev stop`, `rm -rf .wrangler data.db .emdash`, `pnpm dev` (daemon on 4323), applied seed via `POST /_emdash/api/setup/dev-bypass`.
5. Counts via `npx emdash content list <col> -u http://localhost:4323`: pages 19, services 11, resources 11, testimonials 6, posts 3, marquee_items 1 — all within acceptance ranges.
6. Spot checks: service `one-hour-couples-counseling-session` has `price_label: ₦160,000/$160` and `booking_url`; resource `52-rules-of-dating-and-relationships` has `ctas` array. `npx emdash types -u http://localhost:4323` generated `emdash-env.d.ts` with 7 collection interfaces, no errors.
7. Replaced the starter `seed/seed.json` (posts/pages only). `package.json#emdash.seed` already points at `seed/seed.json`.

## Seed contents (from live capture)

- Settings: title "Ruth's Marriage", url, social ({facebook, twitter, instagram, threads}; youtube TODO(G3)). Custom keys `contact_emails`/`askcoach_recipient` NOT in seed — EmDash settings keys are fixed (title, tagline, logo, favicon, url, postsPerPage, dateFormat, timezone, social, seo); per AGENTS rule 2/deploying-emdash-cloudflare, these belong in a native plugin's `ctx.settings` (Phase 6 plugin) rather than a one-row collection. Recorded as deviation.
- Collections: `posts` `/{slug}` (16 available, 3 seeded — newest), `pages` `/{slug}` (19), `services` `/service/{slug}` (11, with price_label/audience_label/format/booking_url/order), `resources` `/resource/{slug}` (11, with badge_label/ctas repeater/video_url/order), `testimonials` (6, non-routable), `marquee_items` (1 item: "Join the 28 Days Lovers Again Challenge…" → `/resource/28-days-lovers-again-challenge/`).
- No `banners` collection — README D15: hero slides are static component content from `discovery/content/banners.json` (overrides the plan's banner CPT).
- Taxonomies: `category`→posts (marriage), `tag`→posts (instagram, godly-perspective), `service_type`→services (married, singles), `resource_type`→resources (resource, book, video).
- Menus: `primary` (5 dropdowns, parents non-linking to `#`), `footer-services` (6), `footer-resources` (6), `footer-legal` (2). Footer "Links" column reuses `primary` at render time.
- Media: `$media` references to live wp-content URLs (EmDash downloads on apply); alt text captured where available.
- `banners`, `contact_emails`, etc. intentionally excluded per above.

## Deviations from the plan

1. **No `banners` collection** (README D15, human decision 2026-10-17) — contradicts phase-03-content-model.md's banner row; docs/decision win.
2. **Custom settings keys omitted** (`contact_emails[]`, `askcoach_recipient`, copyright) — not in EmDash's fixed settings key list; will be a native plugin with `ctx.settings` in Phase 6, per D10b/AgENTS trap 7.
3. Posts seeded: 3 newest (plan: 3–6; Phase 10 may import the remaining 13).
4. `urlPattern` for non-routable collections (testimonials, marquee_items) set to `/{slug}` because the schema requires a string; they're not linked anywhere.
5. Dev server URL landed on 4323 again (default inspector busy); stop via `pnpm astro dev stop`, logs `.astro/dev.log`.

## Acceptance checks — output

```
$ npx emdash seed seed/seed.json --validate
✔ Seed file is valid

$ for col in pages services resources testimonials posts marquee_items; do
    npx emdash content list $col -u http://localhost:4323 2>/dev/null | grep -c '"slug"'
  done
19   pages   (acceptance: ≈ 19)
11   services
11   resources
6    testimonials
3    posts     (acceptance: 3–6)
1    marquee_items

$ npx emdash content get services one-hour-couples-counseling-session -u http://localhost:4323
  price_label: ₦160,000/$160
  booking_url: https://selar.com/gykh   (all 11 services have both)

$ npx emdash types -u http://localhost:4323   → emdash-env.d.ts regenerated, 7 collection interfaces, no errors
```

**Note:** dev server is running (pid, port 4323, background). The admin account exists (setup complete via dev-bypass) but its credentials/email were not captured by automation; the human can sign in via magic link at `http://localhost:4323/_emdash/admin` — the token appears in `.astro/dev.log` as `[dev-email]`.
