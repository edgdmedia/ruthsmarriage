# Phase 0: Setup and tooling

**Goal:** Tools verified, git initialised in `~/Projects/ruthsmarriage`, Cloudflare access confirmed.

## Steps

1. Read `README.md` and `00-site-audit.md` in this folder fully.
2. Check tool versions and record them in the report:
   - `node -v` (need ≥ 22), `pnpm -v`, `git --version`
   - `agent-browser --version` (run `agent-browser skills get core --full` once to learn its commands)
   - `npx wrangler --version`, `npm view create-emdash version`, `npm view emdash version`
3. Init the repo in place. The folder already holds `CLAUDE.md`, `discovery/` (12 reference screenshots from an earlier session) and `migration-plan/`. Keep all of them.
   ```bash
   cd ~/Projects/ruthsmarriage && git init
   ```
   Create only:
   - `AGENTS.md`, copied from `migration-plan/AGENTS.md.template` (drop the first "Copy this file…" line)
   - `.gitignore`: `node_modules/ .env* .wrangler/ dist/ .astro/ data.db* *.emdash .DS_Store discovery/raw/`
   - `README.md` with a 5-line description and a link to `migration-plan/README.md`
   - **Git LFS for the reference screenshots** (`discovery/screenshots/live/` is ~100 MB of PNGs): `git lfs install && git lfs track "discovery/**/*.png" "discovery/**/*.jpeg" "discovery/**/*.jpg"`, then commit `.gitattributes`. If `git-lfs` isn't installed, ask the human to `! brew install git-lfs`. Don't commit the PNGs without LFS.
   Don't scaffold Astro yet (Phase 2 does that).
4. 🧑 **Gate G1:** Ask the human to run `! pnpm dlx wrangler login`, then run `npx wrangler whoami`. Confirm the account that owns the `ruthsmarriage.com` zone (it's already proxied by Cloudflare). Record the account ID in the report. **Don't** create any Cloudflare resources yet.
5. Create `migration-plan/progress/` for phase reports.

## Acceptance checks
- `git log --oneline` shows `phase-00: repo bootstrap`
- `npx wrangler whoami` lists the right account
- `migration-plan/progress/phase-00-report.md` exists with tool versions and the account ID
