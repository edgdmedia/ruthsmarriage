# Phase 9b: VPS staging behind Cloudflare

**Goal:** The EmDash site from 9a runs on the owner's VPS at a **staging hostname**, behind Cloudflare. It must be:
- cached at the edge, and purged when content is published;
- backed up off-site;
- deployed from GitHub;
- onboarded with editors.

**Live WordPress is untouched:** `www` and the apex keep pointing at it until Phase 10.

**Skills:** `deploying-emdash-cloudflare`, read in full, including `vps.md`, which is the field guide for this phase. Also `cloudflare`, `creating-plugins` (purge plugin) and `emdash-cli`.

**Reference implementation:** `~/Projects/securityfocus` (`main`). Copy these and adapt the names; don't reinvent them:
- `docs/vps-runbook.md`
- `deploy/`
- `scripts/deploy-vps.sh`
- `scripts/backup-vps.sh`
- `src/middleware.ts`
- `src/lib/cache-tags.ts`
- `plugins/cloudflare-purge/`
- `.github/workflows/deploy.yml`

## Who does what
- **opencode** writes every file plus `docs/vps-runbook.md`, and verifies from outside (HTTP checks, QA scripts).
- **The owner** runs every command on the server and every change in Cloudflare.
- The runbook gives **one command per line**. Laptop-side steps use Claude Code's `!` prefix. **Never ask for a secret in chat.** Check one with `grep -c '^KEY=.' <file>`.

## Gate G4a 🧑 (ask before writing server files)
1. **The box:**
   - OS;
   - web server (nginx or Apache);
   - is it Virtualmin/Webmin, and does it host other sites;
   - free port (default 4321);
   - disk space;
   - the site user's name (suggest `ruthsmarriage`).
2. **GitHub:** there is no remote yet. Create a **private** repo, push `main`, and add a `dev` branch.
3. **Staging hostname:** suggest `vps.ruthsmarriage.com`.
4. **Approval for each Cloudflare change** in 9b.4. **MX and email records are never touched.**

## 9b.1 Production code (laptop)
- **`src/middleware.ts`:** cache headers and `Cache-Tag`, following securityfocus and vps.md's "Cache headers" row.
  - **Cacheable:** public 200 → `public, max-age=300, s-maxage=2592000`; 404 → 60 s.
  - **Never cached:** `private, no-store` for:
    - `/_emdash/*`, `/admin`, `/login`, `/_actions/*`;
    - any request with an `astro-session` cookie;
    - any POST result page (Ask Coach).
  - **Assets:**
    - `/_astro/*` gets 1 y `immutable`.
    - `public/` assets have unhashed names, so give them 7 days.
    - Media served from `/_emdash/api/media/file/` gets 1 y `immutable`.
  - No `stale-while-revalidate`.
- **`src/lib/cache-tags.ts`:**
  - Collection tags: `posts`, `services`, `resources`, `testimonials`, `marquee_items`.
  - Chrome tags: `menus`, `settings`.
  - Plus `all`.
  - Every path maps to the collections it renders. The header and footer appear on every page, so every page carries `menus` and `settings`.
- **`plugins/cloudflare-purge`:** copy it, keeping the rules:
  - `afterSave` only for `status === "published"`, debounced 30 s;
  - retry on 429.
  - `ask_coach_questions` saves must **never** purge.
- **Client IP:** the origin accepts Cloudflare only, so `cf-connecting-ip` is trustworthy. The Ask Coach rate limit already reads it first. Set the adapter's trusted proxy headers as vps.md says.
- **`deploy/`:**
  - `ruthsmarriage.service`;
  - an nginx (or Apache) conf;
  - `cloudflare-ips.txt`;
  - `sudoers-ruthsmarriage`;
  - `ruthsmarriage.env.example` and `ruthsmarriage.build.env.example`, with **names only**.

  The env files need:
  - `DATABASE_PATH`, `MEDIA_DIR`, `SESSION_DIR`;
  - `EMDASH_SITE_URL`, `EMDASH_ENCRYPTION_KEY`;
  - `RESEND_API_KEY`;
  - `S3_BUCKET`, `S3_ENDPOINT`, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` (R2 media);
  - `TURNSTILE_SECRET_KEY`, and `PUBLIC_TURNSTILE_SITE_KEY` (**build** env: public values are baked in);
  - `EMDASH_URL=http://127.0.0.1:<port>`, `EMDASH_TOKEN`;
  - `CF_ZONE_ID`, `CF_PURGE_TOKEN`.

  Do **not** set `ASKCOACH_TO`: the default, admin@ruthsmarriage.com, applies. 🧑 Confirm before the first real send.
- **`scripts/deploy-vps.sh`:**
  - refuses a dirty tree;
  - pulls `--ff-only`;
  - installs, builds and restarts;
  - smoke-tests `127.0.0.1:<port>`.
- **`scripts/backup-vps.sh`:**
  - backs up the DB with `sqlite3 .backup` plus `PRAGMA integrity_check` (media is already in R2);
  - keeps 14 days;
  - copies off-site with rclone to a **separate private R2 bucket** (`no_head = true`, 30-day lifecycle rule).
- **`.github/workflows/deploy.yml`:**
  - `dev` runs typecheck, tests and build.
  - `main` deploys only when the matching tree passed on `dev`.
  - It SSHes in with a key pinned by `command=` and purges everything after each deploy.

## 9b.2 Server (owner, from `docs/vps-runbook.md`)
Follow vps.md's "Server" section. The traps are listed there:
- the site user;
- fnm and Node 24, using `~/.local/share/fnm/aliases/default/bin/node` in systemd (**never** the `fnm_multishells` path);
- pnpm via corepack;
- clone and build with the build env;
- data, uploads and session dirs **outside** the app dir;
- `<app>/.astro` created before the first start;
- `/etc/ruthsmarriage.env` (root, 600);
- systemd with `ProtectSystem=strict` and `ReadWritePaths`, **one process**;
- sudoers limited to `systemctl restart|status`, checked with `visudo -c`;
- web server conf in `conf.d/` (never Virtualmin's vhost), with:
  - `listen <box-IP>:80` and `:443 ssl`;
  - the `geo $realip_remote_addr` Cloudflare-only block;
  - a Cloudflare Origin Certificate;
- `nginx -t` before every reload.

## 9b.3 Data
1. Copy the local `data/emdash.db` (via `sqlite3 .backup`) to the server. Upload `data/uploads/` to the **R2 media bucket with the same keys** (rclone, `no_head = true`) so the stored `storageKey`s resolve; spot-check images through `/_emdash/api/media/file/<key>`. Then upload a new image in the staging admin and confirm it lands in the bucket.
2. Run `PRAGMA integrity_check` there and compare per-collection counts with 9a.
3. Rebuild search with one request: `/_emdash/api/search?q=a`.
4. Create a new `content:write` token on staging for `EMDASH_TOKEN`.

**From here on, the staging database *is* production.** Phase 10 only changes the URL.

## 9b.4 Cloudflare (owner, each change approved)
- A proxied `A` record from the staging hostname to the box IP.
- An Origin Certificate (apex plus wildcard) for the box.
- A **Cache Rule**, which is required: Cloudflare never caches HTML by default. See vps.md for the expression and settings.
- An API token with **Cache Purge** only, for the plugin and CI.
- An R2 **media** bucket `ruthsmarriage-media` (private; the site serves it via `/_emdash/api/media/file/`, so no public access) plus an R2 S3 API token scoped to it. **Never delete this bucket.**
- A **separate** private R2 bucket for backups, with its own token. Never back up into the media bucket: the media route serves any key in it.
- Add the staging hostname to the **Turnstile widget's** hostnames.
- **Staging must not be indexed.** Serve `X-Robots-Tag: noindex` plus a `Disallow: /` robots.txt on any host that isn't the production URL.

## 9b.5 Verify on staging
- **Origin is Cloudflare-only:** through Cloudflare you get 200; `curl --resolve <host>:443:<ip>` gets 403.
- `pnpm qa:visual --base https://<staging>` and `interactions.mjs` against staging give the same results as 9a.
- **Edge caching:** request home, a service, a post, `/askcoach/` and `/_emdash/admin` twice each, and record `cf-cache-status`, `cache-control` and `cache-tag`:
  - public pages show HIT on the second request;
  - `/_emdash/*` is never cached.
- **Purge:**
  - Publish a service price change, then confirm the page goes MISS once, then HIT, showing the new price.
  - A scheduled post goes live and the purge log shows it.
  - An Ask Coach submission causes **no** purge.
- **Ask Coach, in a real browser, with the real Turnstile keys:**
  - the draft appears in the admin, and the email arrives at `delivered@resend.dev`;
  - 🧑 with the owner's OK, one real send to admin@ruthsmarriage.com, checking the inbox and not spam.
- **Admin:** sign in with the **email link**. Passkeys are bound to the domain, so they won't carry over from staging to `www`.
- **Media:** every image on staging loads from R2 (no 404s in `qa:visual`); an admin upload appears in `ruthsmarriage-media`.
- **Backups:** run one, list it in the backup bucket, and **restore it once** into a scratch path with `integrity_check`.
- **CI:** push a trivial change to `dev` → green → merge to `main` → it deploys, purges and passes the origin smoke test.

## 9b.6 Editors 🧑 Gate G4
- Ask for the editor list: name, email, role. Invite each person.
- Write `docs/EDITOR-GUIDE.md` (1–2 pages with screenshots) covering:
  - signing in at `/admin/`;
  - editing a service (price, booking link) and a resource (badge, CTA links);
  - writing a blog post;
  - testimonials;
  - the marquee;
  - menus;
  - site settings and socials;
  - **reading and archiving Ask Coach questions**.

## Acceptance checks
- The staging verification table (cache, purge, QA, backups/restore, CI) is in the report.
- Env var **names** on the server match `deploy/*.env.example` (`grep -c` per name, no values).
- The owner confirms at least one editor can sign in.
- Write `$PLAN/progress/phase-09b-report.md`. Commit `phase-09b: VPS staging`.
