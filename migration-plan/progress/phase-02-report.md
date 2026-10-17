# Phase 2 report — Scaffold Astro + EmDash for Cloudflare (2026-10-17)

## What was done

1. Scaffolded from `npm create emdash@latest` (`create-emdash@1.3.0`, `--template cloudflare:starter --platform cloudflare --pm pnpm --no-sandboxed-plugins --no-install --yes`) into a temp folder, then moved into `~/Projects/ruthsmarriage`. Kept our `AGENTS.md` (appended "Template notes"), merged `.gitignore` (added `.emdash/migrations.json`, `uploads/`, `.dev.vars*`, kept `.env` ignored), kept template's `.agents/skills/` (`building-emdash-site`, `creating-plugins`, `emdash-cli`), deleted the temp folder.
2. `wrangler.jsonc`: `name: ruthsmarriage`, `DB=ruthsmarriage-db`, `MEDIA=ruthsmarriage-media`, `nodejs_compat`, cron `* * * * *`, `worker_loaders` left commented out (no sandboxed plugins).
3. `astro.config.mjs`: template wiring (`cloudflare()` adapter, `react()`, `emdash({d1({binding:"DB", session:"auto", coalesce:true}), r2({binding:"MEDIA"})})`). `siteUrl` step from the plan was **reverted** — see deviation 1 below.
4. `pnpm install` (pnpm 11.9.0 resolved by corepack workspace). Added dev tooling: vitest 5.0.5, @types/node, pixelmatch 7.0.0, pngjs 7.0.0, @axe-core/playwright, playwright; wired `test`, `qa:visual`, `qa:links`, `qa:urls`, `qa:a11y` scripts as Phase-8 placeholders.
5. Stripped starter demo look — layout now renders "Ruth's Marriage — rebuild in progress" (plum bar). All `Astro.cache.set()` calls guarded (`cache?.enabled && hint`).
6. `pnpm dev` runs as a **background daemon** (AGENTS trap 1 confirmed): `astro dev stop` to kill it; logs in `.astro/dev.log`; default port 4321 → landed on **4323** (default inspector busy).
7. Completed the admin setup wizard end-to-end (auto-token flow): site title "Ruth's Marriage", **Empty site** (sample content deliberately not loaded), admin email `edgdmedia@gmail.com` — verified via `POST /_emdash/api/setup/admin/verify → 200`. Magic-link login tested with dev-email capture (`.astro/dev.log`). EmDash v1.3.0 dashboard reachable at `http://localhost:4323/_emdash/admin` as Admin.
8. `pnpm build` ✅ Complete. `pnpm typecheck` ✅ 0 errors, 0 warnings.
9. Generated `dist/server/wrangler.json` verified: name ruthsmarriage / DB / MEDIA / cron / main.

## Acceptance checks — output

```
$ pnpm build          # → "✓ Completed in 21.09s" / Server built ✅
$ pnpm typecheck      # → Result (14 files): 0 errors, 0 warnings, 0 hints ✅
$ pnpm emdash doctor  # → scheduler wiring ✅ (Cron Trigger + scheduled() handler)
                       #   database: not found at ./data.db — documented no-op for D1 projects
$ curl http://localhost:4323/_emdash/admin   → 302 (login, setup done)
$ ls discovery/screenshots/local-admin.png   # 64 KB — authenticated EmDash dashboard screenshot:
                                              #   "Ruth's Marriage", Dashboard, Pages 1, Posts 1,
                                              #   Media 0, User 1 (Olalekan edgdmedia@gmail.com)
```

## Deviations from the plan

1. **`siteUrl` NOT baked into `astro.config.mjs`.** The plan step 3 says `add siteUrl: "https://www.ruthsmarriage.com"`, but the current EmDash docs (deployment/cloudflare, "Custom domains"; and authentication guide) say `siteUrl` binds passkeys to its origin — I'd hard-coded it during dev setup and hit the exact failure ("Security error. Make sure you're on a secure connection" when registering a Touch ID passkey on localhost). Docs: passkeys are domain-bound, setup records the address it runs on as origin unless `siteUrl`/`EMDASH_SITE_URL` overrides it, and production should pass `EMDASH_SITE_URL` as a Worker secret instead. Decision: removed `siteUrl` from config; dev setup now binds to `localhost:4323`, production origin set via `EMDASH_SITE_URL` in Phase 9. **Recorded as deliberate deviation; docs win over plan.**
2. pnpm resolved to 11.9.0 (corepack workspace), not the 10.33.2 recorded in Phase 0 — harmless, plan doesn't pin it.
3. Dev port landed on 4323 (default inspector port busy); AGENTS trap 1 (stop/logs paths) verified against reality.
4. `emdash doctor` `database` error is documented no-op for D1 projects; not a failure.

## Open issues / notes for Phase 3+
- `seed/seed.json` is the template starter seed — Phase 3 replaces it with our content model (services/resources/testimonials/pages collections, taxonomies service_type/resource_type/category/tag, menus, widget areas, site settings). Migration-plan/00-site-audit.md is the source of truth for counts (11 services, 11 resources, 6 testimonials, 3 banners → static hero D15).
- Discovered pre-made ASTRO/seeder boilerplate exists: `seed/seed.json`, `src/pages/[slug].astro`, `category/[slug].astro`, etc. Review before rewriting from scratch.
- Email provider not yet configured (Resend + Turnstile keys come from G3, Phase 6). Magic link works locally via dev-email only.
