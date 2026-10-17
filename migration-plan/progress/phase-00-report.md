# Phase 0 report — Setup and tooling (2026-10-17)

## What was done

- Read `README.md`, `00-site-audit.md`, `phase-00-setup.md` fully.
- Verified tooling (versions below); ran `agent-browser skills get core --full` once — its snapshot/`@ref` workflow is learned for Phases 1/4/5/8.
- `git init -b main` in `~/Projects/ruthsmarriage`. Existing files kept: `CLAUDE.md`, `discovery/`, `migration-plan/`, `scripts/reference/` (capture scripts from an earlier session).
- Created `AGENTS.md` (copied from `migration-plan/AGENTS.md.template`, "Copy this file…" line dropped), `.gitignore`, root `README.md`, `migration-plan/progress/`.
- Gate **G1** cleared: human ran `wrangler login`; `wrangler whoami` confirms the account (ID below). No Cloudflare resources created.
- Committed `phase-00: repo bootstrap` (1 commit).

## Tool versions

| Tool | Version | Required |
|---|---|---|
| node | v22.23.2 | ≥ 22 ✅ |
| pnpm | 10.33.2 | — |
| git | 2.39.5 (Apple Git-154) | — |
| agent-browser | 0.27.0 | — |
| wrangler (npx) | 4.119.0 | — |
| create-emdash | 1.3.0 | matches README ✅ |
| emdash | 1.3.0 | matches README ✅ |
| git-lfs | 3.8.0 (installed during phase) | **not used** — see deviation 2 |

## G1 — Cloudflare account

- Logged in via OAuth as `edgdmedia@gmail.com`.
- Account: **EDGD Media** — ID **`af273e5d58efe45fa36724c5a3e61052`** (single account on the token; human confirmed it owns the `ruthsmarriage.com` zone).
- Token scopes include: workers (write), workers_routes (write), d1 (write), pages (write), account (read). Sufficient for Phases 2/9/10.

## Deviations from the plan

1. **`.gitignore` additions**: `node-compile-cache/` and `v8-compile-cache-501/` (stray tool caches found in the folder) and `discovery/screenshots/` + `discovery/images/` (see 2).
2. **Reference captures are NOT committed to the main repo** (overrides the plan's Git-LFS step, per human decisions 2026-10-17: *"We don't need to commit them, only the images going to public or used in the app should be committed. Leave it in local. Don't commit to remote."* + *"can the reference be commit on local git and not on remote?"*). The ~113 MB in `discovery/screenshots/` and future `discovery/images/` media dumps are git-ignored by the main repo; no `.gitattributes`/LFS tracking was created. **Instead, `discovery/` is its own local-only git repo** (nested; commit `7c91452`, no remote — it can never be pushed). Phase 1+ must commit new captures inside that nested repo (`cd discovery && git add -A && git commit`). `discovery/specs/` (4.3 MB of computed-style JSON + `states.json`) is committed in BOTH: tracked by the main repo and ignored by the nested one, so spec updates are versioned in the repo that travels. `migration-plan/page-maps/assets/` (small SVG spec icons) is committed in the main repo. **Consequence for later phases**: Phase 8's pixel-diff baseline is versioned locally, and any remote of the main repo carries app code + specs only — still keep a disk backup (Time Machine) since the nested repo has no second copy anywhere.
3. **Two commits instead of one**: `phase-00: repo bootstrap`, then this report in a small follow-up commit (the report contains the bootstrap commit's own acceptance output).

## Open issues

- None blocking. Note: `00-site-audit.md` "Known issues" numbering skips 8/9 order — cosmetic only, no action.

## Acceptance checks

```
$ git log --oneline
9a343bf phase-00: repo bootstrap
```
(then this report's own commit follows)

```text
$ npx wrangler whoami
 👋 You are logged in with an OAuth Token, associated with the email edgdmedia@gmail.com.
┌──────────────┬──────────────────────────────────┐
│ Account Name │ Account ID                       │
├──────────────┼──────────────────────────────────┤
│ EDGD Media   │ af273e5d58efe45fa36724c5a3e61052 │
└──────────────┴──────────────────────────────────┘

$ ls migration-plan/progress/
phase-00-report.md

$ git status --short | wc -l
0   (clean tree)

$ du -sh .git
1.2M   (captures excluded as decided)
```
