# Phase 2: Scaffold Astro + EmDash for Cloudflare

**Goal:** The project runs locally (`pnpm dev`) with the D1 + R2 bindings, and the EmDash admin is reachable at `/_emdash/admin`.

**Skills:** `building-emdash-site` → `references/configuration.md`, `deploying-emdash-cloudflare`, `wrangler`. Check the scaffold command against current docs first (Context7 `/websites/emdashcms`).

## Steps

1. Scaffold into a temp folder, then move the files in. The repo root isn't empty, so don't use `--force` on it:
   ```bash
   cd ~/Projects && npm create emdash@latest ruthsmarriage-tmp -- --template cloudflare:starter --platform cloudflare --pm pnpm --no-sandboxed-plugins --no-install --yes
   ```
   (Verified 2026-10-16 with `create-emdash@1.3.0`: this produces `astro.config.mjs`, `wrangler.jsonc`, `src/worker.ts`, `src/live.config.ts`, `seed/seed.json`, starter pages, `.env` with `EMDASH_ENCRYPTION_KEY`, and its own `AGENTS.md` + `.agents/skills/`.)
   Move everything into `~/Projects/ruthsmarriage/`. **Don't overwrite** our `AGENTS.md`: append any useful template guidance to it under "Template notes". Merge `.gitignore`. Keep the template's `.agents/skills/` (opencode reads them). Delete `ruthsmarriage-tmp`. Confirm `.env` is git-ignored.
2. `wrangler.jsonc`:
   - `name`: `ruthsmarriage`
   - D1 binding `DB` → `database_name: "ruthsmarriage-db"`
   - R2 binding `MEDIA` → `bucket_name: "ruthsmarriage-media"`
   - keep `compatibility_flags: ["nodejs_compat"]`, the `* * * * *` cron, and `main: "./src/worker.ts"`
   - leave `worker_loaders` commented out (no sandboxed plugins)
3. `astro.config.mjs`: keep the template's `cloudflare()`, `react()`, and `emdash({ database: d1({ binding: "DB", session: "auto", coalesce: true }), storage: r2({ binding: "MEDIA" }) })`, and add `siteUrl: "https://www.ruthsmarriage.com"` (the live site canonicalises to **www**). Set `trailingSlash: "always"` if the docs confirm EmDash's routes tolerate it; otherwise handle it in middleware (Phase 7) and note the choice.
4. `pnpm install`. Add dev tooling: `vitest`, `@types/node`, `pixelmatch`, `pngjs`, `@axe-core/playwright` (or the agent-browser equivalent). Add scripts: `test`, `typecheck` (`astro check`), and `qa:visual`, `qa:links`, `qa:a11y` placeholders.
5. Strip the starter's demo look (keep `live.config.ts`, `worker.ts`, EmDash wiring and the route files as a starting point). The layout renders "Ruth's Marriage, rebuild in progress".
6. Run `pnpm dev`. Record whether it stays in the foreground or backgrounds itself (AGENTS.md trap 1), how to stop it and where the logs go. Open `http://localhost:4321/_emdash/admin` with agent-browser and complete the setup wizard (site title "Ruth's Marriage", admin = edgdmedia@gmail.com unless told otherwise). **Don't** load the starter's sample content.
7. `pnpm build` must succeed.

## Acceptance checks
- `pnpm build` and `pnpm typecheck` pass
- Screenshot of the local admin dashboard at `discovery/screenshots/local-admin.png`
- `wrangler.jsonc` shows DB, MEDIA and the cron; no remote Cloudflare resources created
- Commit `phase-02: astro+emdash scaffold`
