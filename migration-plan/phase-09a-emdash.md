# Phase 9a: EmDash back in, locally (Node + SQLite)

**Goal:** The site looks and behaves exactly as signed off at G2b, but its content comes from **EmDash** (one SQLite file) and Ruth's team edits it at `/_emdash/admin`. Ask Coach questions land in the `ask_coach_questions` collection. **Local only:** no server, DNS or Cloudflare work in this phase.

**Decision D17 (owner, 2026-10-24):** EmDash comes back as the CMS, hosted on a VPS (Node + SQLite behind Cloudflare), not on Workers. This reverses D16 for content and admin. The visual result signed off at G2b is not up for change.

**Skills (load before starting):**
- `building-emdash-site` and all four of its `references/` files;
- `emdash-cli`, `creating-plugins`;
- `deploying-emdash-cloudflare`, including **`vps.md`**, which covers the code changes for Node + SQLite.

Check every EmDash API against current docs before using it: Context7 `/emdash-cms/emdash` or docs.emdashcms.com. The latest is `emdash@1.3.1`.

**Reference implementation:** `~/Projects/securityfocus` (`main`). It is a production EmDash site on a VPS. Copy its patterns, not its content:
- `astro.config.mjs`
- `src/middleware.ts`
- `src/lib/cache-tags.ts`
- `plugins/resend-email/`
- `plugins/cloudflare-purge/`

## Ground rule: no visual change
Before touching anything, record a **baseline**:
- `pnpm qa:visual` (all 31 pages × 3 widths);
- `node scripts/qa/interactions.mjs` (37 checks).

Save the summaries in the report. At the end of the phase, both must give the same results. Any pixel difference is a bug in the data mapping, not a design choice.

## 9a.0 Start clean
- `git status` must be clean, and Phase 6.4 (Ask Coach backend) must be committed. If either isn't, stop and ask.
- **Secrets.** `.env`, `.dev.vars` and `dev.local` are git-ignored and hold real keys (Resend, Turnstile). Never print them; check one with `grep -c '^KEY=.'`.

## 9a.1 Packages and config
- **Remove:**
  - `@astrojs/cloudflare`, `wrangler`, `@cloudflare/workers-types`;
  - `wrangler.jsonc`, `worker-configuration.d.ts`;
  - the `deploy` script.
- **Fold `.dev.vars` into `.env`.** Its values (including the owner's real Turnstile keys) already match `.env`. Check by key name, then delete `.dev.vars`.
- **Add** `emdash` and `@astrojs/node`. Then `pnpm astro dev stop && rm -rf node_modules/.vite` (Vite cache trap).
- **Node 24** (locally via fnm) to match the server. Add `"engines": { "node": ">=24" }`.
- **`astro.config.mjs`**, as in securityfocus:
  - `adapter: node({ mode: "standalone" })`;
  - `session: { driver: sessionDrivers.fsLite({ base: process.env.SESSION_DIR ?? "./.astro/sessions" }) }`.
  - `emdash({ ... })` takes:
    - `database: sqlite({ url: \`file:${DATABASE_PATH}\` })`, where `DATABASE_PATH` defaults to `./data/emdash.db`. The path is **baked at build time**, so it must be set in the build env too.
    - **Storage: images go to R2** (owner, 2026-10-24). Use `s3()` from `emdash/astro` against R2's S3 API when `S3_BUCKET` is set; otherwise fall back to `local({ directory: MEDIA_DIR ?? "./data/uploads", baseUrl: "/_emdash/api/media/file" })`. `EMDASH_STORAGE=s3|local` forces the choice. Copy the switch from securityfocus `astro.config.mjs`. The env names are `S3_BUCKET`, `S3_ENDPOINT`, `S3_REGION`, `S3_ACCESS_KEY_ID` and `S3_SECRET_ACCESS_KEY`; check `s3()`'s options in the docs. The media URLs stay `/_emdash/api/media/file/<key>` with either driver, so 9b only uploads the files. 9a runs on `local` (no Cloudflare work yet).
    - `objectCache: memoryCache({ defaultTtl: 3600, revalidate: 0 })`.
    - `plugins: [resendEmail(...)]` (9a.6).
    - `siteUrl`: production builds only, from `EMDASH_SITE_URL`. Keep the object-literal `defineConfig`.
  - **No Astro cache provider, no `routeRules`, no `Astro.cache.set()`.** See vps.md: a cache provider makes EmDash bypass its query cache.
  - Keep the `env.schema` block as it is (Ask Coach), including `EMDASH_URL` and `EMDASH_TOKEN`.
- Add `src/live.config.ts` (the boilerplate from `references/configuration.md`).
- Add `data/` to `.gitignore`.

## 9a.2 Schema (`seed/seed.json`)
The seed's collections were written in Phase 3, and the templates have moved on since. Make every collection's fields match **`src/data/types.ts`** exactly: every field a template reads must exist, with the right type.
- **Posts** carry full HTML (see 9a.3), resources have `ctas` and `video_url`, and so on.
- Add `supports: ["drafts", "revisions", "search", "seo"]` to posts, services and resources; Phase 7 fills the SEO fields.
- Keep `ask_coach_questions`, which is already in the seed. Its entries are drafts that the site never renders. Ruth reads them in the admin, so the collection is **not** `hidden`.
- **Settings:**
  - title "Ruth's Marriage" (D13);
  - tagline;
  - logo;
  - socials (D14).

  These come from `src/data/settings.json`. They are site settings, never a one-row collection.
- **Menus** come from `src/data/menus.json`. **Taxonomies:** `category`, `tag`, `service_type`, `resource_type`.
- **Stays in code** (page furniture, not CMS content):
  - hero banners (D15);
  - `src/data/policies.ts`;
  - the copy inside the `.astro` page files.
- Run `npx emdash seed seed/seed.json --validate`. An invalid seed is skipped silently on first boot.

## 9a.3 Content import
**The source is `src/data/*.json`, not the seed's `content`.** The JSON is what the owner signed off at G2b, and only it has the full post bodies.

Write `scripts/emdash/import-data.mjs`:
- It is **idempotent by slug**, has `--dry-run`, and prints a per-row report (slug, action).
- It uploads every image that content references (`/assets/media/…`) to the media library and points the image fields at the media entry.
- It assigns taxonomy terms and menu items, and publishes with the original `published_at`.
- Use the CLI (`emdash content create`, `media upload`) or the REST API with a local token. Check the installed version's flags with `npx emdash --help`.

**Post bodies.** All 16 posts are one `{ _type: "html", html }` block each (cleaned WordPress HTML). Prefer converting them to **real Portable Text** so Ruth can edit them in the admin:
- Look for an HTML → Portable Text converter in EmDash (its WordPress importer has one). Check Context7.
- Convert only if the result renders the same: pull-quotes, centred quotes, inline colours, images and YouTube embeds.
- If not, keep the html block, render it as today, and record that the admin shows it as one non-editable block.
- 🧑 Say which path you took and show one converted post in the admin.

**Counts must match:** 11 services, 11 resources, 6 testimonials, 1 marquee item, 16 posts, plus every term and menu item.

## 9a.4 Data layer swap
`src/data/index.ts` stays **the only import surface**, with the same names and the same types from `types.ts`, but the functions become async and read EmDash:
- `getEmDashCollection`, `getEmDashEntry`, `getMenu`, `getSiteSettings`, `getTerm`, `getEntriesByTerm`.
- Map EmDash entries to the existing types in **one mapper per collection**, so no template learns EmDash's shapes.
- **Images:**
  - A media-library value has **no `src`**. Resolve `meta.storageKey` → `/_emdash/api/media/file/<key>`, then fall back to `src`.
  - `imageSrc()` keeps its signature.
  - Remember `entry.id` (slug) vs `entry.data.id` (ULID).

Then:
- Update the 41 importers to `await`. Keep current behaviour everywhere:
  - random 6 per request in the carousels;
  - search through `lib/archive.ts` (same results);
  - pagination;
  - archives.
- When the counts and visuals match, delete the content JSON files (`posts`, `services`, `resources`, `testimonials`, `marquee`, `menus`, `settings`, `taxonomies`) and `scripts/reference/build-data.mjs`. They stay in git history. Keep `policies.ts` and `banners` if they're still used.
- Rewrite `test/data.test.ts` as unit tests of the mappers (a fixture entry in, the template type out), plus the image resolver.

## 9a.5 Ask Coach → collection
The action already saves (`src/actions/index.ts`, `saveQuestion`) via `POST {EMDASH_URL}/_emdash/api/content/ask_coach_questions` with a Bearer token.
1. In the admin, create a **personal access token with only `content:write`**.
2. In `.env`, set `EMDASH_URL=http://127.0.0.1:4321` and `EMDASH_TOKEN`.
3. Submit using the always-pass Turnstile keys, then switch back to the real keys.
4. The draft appears in the admin, and the email still arrives at `delivered@resend.dev`.

If the REST shape differs in the installed version (body, headers such as `X-EmDash-Request`, response), fix `saveQuestion` and record the change.

## 9a.6 Admin, email and keys
- **`/admin/` landing page**, as described in the `deploying-emdash-cloudflare` "/admin entry point" section:
  - brand plum/rose, logo, **Sign in** → `/_emdash/admin`;
  - `noindex, nofollow` meta tag plus an `X-Robots-Tag` header;
  - `Disallow: /admin` in robots.txt.
- `/login` → `/admin/`. **No `/wp-admin` aliases:** the owner decided on no redirects.
- **Email** (invites, magic links, recovery):
  - Copy `securityfocus/plugins/resend-email` as `plugins/resend-email` (`@ruthsmarriage/resend-email`). On Node, read the key from `process.env` instead of `cloudflare:workers`.
  - Set From to `Ruth's Marriage <noreply@ruthsmarriage.com>`; the domain is already verified in Resend.
  - Test with **Settings → Email → Send test** to `delivered@resend.dev`.
- **`EMDASH_ENCRYPTION_KEY`:** generate it with the CLI (`npx emdash secrets`; check the flags) into `.env`. 🧑 The owner stores it in their password manager.

## 9a.7 Verify
- `pnpm typecheck`: 0 errors. `pnpm test`: green. `pnpm build`.
- **Production preview:** `DATABASE_PATH=./data/emdash.db node dist/server/entry.mjs`. Every check below runs against this build, not `astro dev`.
- `pnpm qa:visual` (31 × 3) and `interactions.mjs` (37) give the **same results as the baseline**.
- **Edit round-trip:** change a service price in the admin and publish. The page shows it on the next request with no restart, which proves the memory-cache invalidation. Then revert the change.
- The Ask Coach draft is in the admin (9a.5).
- **Gate G3b 🧑:** the owner signs in locally, edits a service, reads an Ask Coach question and approves the admin.

## Acceptance checks
- The baseline vs after table (visual + interactions), plus content counts, in the report.
- `npx emdash seed --validate` output; `grep -rn "Astro.cache\|routeRules" src astro.config.mjs` → nothing.
- Update `AGENTS.md`:
  - Stack: EmDash + Node + SQLite.
  - Content model: EmDash collections; `src/data/index.ts` is the mapper surface.
  - Replace the Cloudflare traps with the VPS traps from vps.md.
  - Commands.
- Write `$PLAN/progress/phase-09a-report.md`. Commit `phase-09a: EmDash on Node + SQLite`.
