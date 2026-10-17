# AGENTS.md — ruthsmarriage


## Project
**1:1 port** of **ruthsmarriage.com** (marriage counselling and coaching; WordPress + Hello Elementor + Elementor Pro + JetEngine) to **Astro + EmDash CMS on Cloudflare Workers (D1 + R2)**. The design must stay **pixel-identical** at 1440/1024/390. This is not a redesign.
The plan lives at `~/Projects/ruthsmarriage/migration-plan/` (`$PLAN`). Read `$PLAN/README.md` and `$PLAN/00-site-audit.md` before any work. The visual and content reference is in `discovery/`.

## Stack
- Astro (`output: "server"`), `@astrojs/cloudflare`, `@astrojs/react` (the admin UI needs it)
- EmDash: `emdash`, `@emdash-cms/cloudflare` (d1, r2), worker entry `src/worker.ts`; scaffolded from `cloudflare:starter`
- pnpm, TypeScript strict
- Plain CSS with custom properties named after the Elementor kit globals (`src/styles/tokens.css`). No Tailwind. Fonts: Nunito + Poppins via `@fontsource`. Carousels: Swiper.

## Rules
1. **Verify EmDash APIs against current docs before using them** (Context7 `/websites/emdashcms`, https://docs.emdashcms.com, and the `building-emdash-site` skill). If the docs and the plan disagree, follow the docs and note the deviation in the phase report.
2. EmDash gotchas: image fields are objects (use `<Image>` from `emdash/ui`). `entry.id` is the slug; `entry.data.id` is the ULID. Taxonomy names must match the seed exactly (`category`, `tag`, `service_type`, `resource_type`). No `getStaticPaths` for CMS content. Pass each query's `cacheHint` to `Astro.cache.set()`, guarded: `if (Astro.cache?.enabled && hint) Astro.cache.set(hint)` (an unguarded undefined hint 500s **only in production**). Repeated `set()` calls combine. `getSeoMeta()` already appends ` | <site title>`, so pass the bare title.
3. **Fidelity beats taste.** `migration-plan/page-maps/` is the 1:1 spec for every page (written by Claude from live measurements); it wins over every other source. Fill gaps from `discovery/specs/raw/` and `discovery/raw/css/post-*.css`. If a map is ambiguous, ask rather than guess. Don't "improve" spacing, colour, copy or layout. Deviations need the human's approval and a note in the report.
4. Never write to the live WordPress site. Scrape at ≤ 2 req/s.
5. Don't invent content (copy, prices, links, testimonials). Use `TODO(G3)` markers.
6. Stop and ask the human at gates G1–G5 (see `$PLAN/README.md`).
7. Each phase ends with: acceptance checks run → `$PLAN/progress/phase-NN-report.md` written → `git commit -m "phase-NN: …"`.
8. Secrets (`.env`, `EMDASH_ENCRYPTION_KEY`, `RESEND_API_KEY`, Turnstile secret, Cloudflare tokens) never get committed. `discovery/raw/` is git-ignored.
9. Keep components small and readable; no dead code; no `elementor-*` class names in the new markup.

## Cloudflare + EmDash traps (field notes from previous builds; check each against current docs)
1. **Dev server and Vite cache.** `pnpm dev` may return immediately and keep running in the background (logs in `.astro/dev.log`). After a dependency install, an `astro.config` edit, or odd island errors (`_jsxDEV is not a function`, 404s on `deps/…?v=`): `pnpm astro dev stop && rm -rf node_modules/.vite && pnpm dev`. A hot-reloaded dev server isn't proof that something works.
2. **Dev never exercises the Cloudflare cache** (`Astro.cache.enabled` is false). Cache code is verified only on a real deploy (Phase 9.4).
3. **Deploy = `pnpm build && pnpm wrangler deploy`, always together.** Wrangler deploys `dist/server/wrangler.json` from the build.
4. **Secrets belong to one Worker.** Never rename or delete/recreate the `ruthsmarriage` Worker. After deploys, compare `pnpm wrangler secret list` with the expected list.
5. **First-boot migration lock.** On `MigrationLockHeldError`: `pnpm wrangler d1 execute ruthsmarriage-db --remote --command "UPDATE _emdash_migrations_lock SET is_locked = 0"` (confirm the table name in the docs), then reload.
6. **Wrangler in non-interactive shells:** use `--yes`/`--force` where supported, set `CLOUDFLARE_ACCOUNT_ID`, and verify every create/delete with a `list`.
7. **No one-row "settings" collections.** Use site settings or a native plugin's `ctx.settings` over defaults.
8. **Forms:** Astro form parsing sends `null` for empty optional fields, so use `.nullish()`. Turnstile won't issue tokens to headless Chromium: test captcha in a real browser and use the always-pass keys in automation.

## Commands
- `pnpm dev`: local dev (local D1/R2 via the platform proxy); stop with `pnpm astro dev stop`
- `pnpm build && pnpm preview`: production build check
- `pnpm build && pnpm wrangler deploy`: deploy (never `wrangler deploy` alone)
- `npx emdash --help`: CLI (content, schema, media, taxonomy, menu, seed, site export/import)
- `pnpm test`: vitest (cache helper, legacy resolver)
- `pnpm qa:visual`, `pnpm qa:links`, `pnpm qa:urls`, `pnpm qa:a11y`: Phase 8 checks (all take `--base`)
