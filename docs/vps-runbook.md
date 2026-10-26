# Ruth's Marriage on the VPS — runbook

The site runs on the owner's VPS: Astro + EmDash on Node.js, with a SQLite
file for the database and Cloudflare still in front as the cache. The live
WordPress site stays untouched (www and the apex keep pointing at it) until
the Phase 10 cutover. Nothing in this document changes them.

The code lives on main (what deploys), with dev (where work happens) ahead
of it. This document is the operating manual: every step has the commands
to run, and what to expect when they work.

---

## 0. The steps, in order

**Two accounts are in play.** *You* are root (or a user with sudo) — the
commands that start with sudo are yours. The *site user* is
`ruthsmarriage`, the one the app runs as: the blocks that start with
`sudo -u ruthsmarriage -i bash` open a shell as that user. **The site
user's sudo rule only allows restarting the service** (Section 6).

| # | Step | Section |
|---|---|---|
| 1 | Check the box: web server, ports, quota, the ruthsmarriage user | Section 2 |
| 2 | Install Node 24 and pnpm for the ruthsmarriage user | Section 3 |
| 3 | Put the app in /home/ruthsmarriage/app (clone the private repo) | Section 4 |
| 4 | Create the tokens and the two environment files | Section 5 |
| 5 | Install the systemd service and the sudo rule | Section 6 |
| 6 | Copy the database and the media | Section 7 |
| 7 | Point the vhost at Node, install the certificate | Section 8 |
| 8 | Set up the nightly backup and the off-site copy | Section 9 |
| 9 | Create the Cloudflare Cache Rule (required) | Section 15 |
|10 | Stage on vps.ruthsmarriage.com and check it | Section 11 |
|11 | (Later) cut over to www | Section 12 |

Day to day: Section 13 (deploy), Section 14 (restart/logs), Section 10
(restore), Section 15 (cache), Section 16 (rotate secrets), Section 17
(troubleshooting), Section 18 (media R2).

---

## 1. What is where on the server

| What | Where |
|---|---|
| The app | /home/ruthsmarriage/app (a checkout of main) |
| The database | /home/ruthsmarriage/data/emdash.db (SQLite, WAL mode) |
| The session store | /home/ruthsmarriage/data/sessions |
| The media | Cloudflare R2, bucket ruthsmarriage-media |
| The backups | /home/ruthsmarriage/backups/emdash-YYYY-MM-DD.db |
| Runtime config | /etc/ruthsmarriage.env (600, root) |
| Build config | /etc/ruthsmarriage.build.env (644, root) |
| The service | ruthsmarriage.service (systemd) |
| The web server | nginx, the one Webmin/Virtualmin already runs |

```
Cloudflare (edge cache)  →  nginx  →  127.0.0.1:4321  →  Node
   proxies, orange cloud    allowlist:   the app            (astro)
   30-day TTL, purged      Cloudflare's  the systemd        + emdash
   by tag on publish       IP ranges     service           + SQLite
```

---

## 2. Before you start

Run these on the box. They answer the four questions the rest of the
setup depends on.

```bash
# 1. Which web server, and is Virtualmin installed?
nginx -v 2>&1
virtualmin --version 2>&1 | head -1

# 2. Which ports are taken? 4321 is the default.
ss -ltnp | grep -E ':(80|443|4321|8080|3000)\b'

# 3. How much room is there, and what is the quota for ruthsmarriage?
df -h /home
quota -s ruthsmarriage 2>/dev/null || su - ruthsmarriage -c 'quota -s'

# 4. What does the ruthsmarriage user own?
ls -la /home/ruthsmarriage/
```

| What you see | What it means | What to do |
|---|---|---|
| nginx version | nginx is the web server | Section 8 is the nginx path |
| virtualmin: command not found | No Virtualmin | Section 8 "without Virtualmin" |
| 4321 in the port list | The Node port is taken | Pick another port and change PORT= in /etc/ruthsmarriage.env AND in deploy/nginx-proxy.conf |
| The quota is smaller than ~2 GB | Not enough room | The media stays in R2, so the space is for the app alone (~500 MB) |

---

## 3. Node 24 and pnpm

Install Node 24 **for the `ruthsmarriage` user only**, so other sites on
this box keep the Node they have.

```bash
sudo -u ruthsmarriage -i bash

# 1. fnm (Node version manager, installed under the user's home)
curl -fsSL https://fnm.vercel.app/install | bash
export FNM_DIR="$HOME/.local/share/fnm"
export PATH="$FNM_DIR:$PATH"
eval "$(fnm env --shell bash)"

# 2. Node 24
fnm install 24
fnm default 24
node --version        # v24.x

# 3. pnpm via corepack (pinned by packageManager in package.json)
corepack enable pnpm

# 4. Make it survive a new shell
cat >> ~/.profile << 'EOF'
export FNM_DIR="$HOME/.local/share/fnm"
export PATH="$FNM_DIR:$PATH"
[ -s "$FNM_DIR/fnm" ] && eval "$(fnm env --shell bash)"
EOF
```

**Check it:**

```bash
sudo -u ruthsmarriage -i bash
ls -l ~/.local/share/fnm/aliases/default/bin/node
~/.local/share/fnm/aliases/default/bin/node -v   # v24.x
```

`which node` prints a temporary path — that is **not** what systemd uses.
The unit (Section 6) uses `~/.local/share/fnm/aliases/default/bin/node`.


---

## 4. The app

The repository is **https://github.com/edgdmedia/ruthsmarriage** (private).
On the server, clone as the `ruthsmarriage` user.

**Deploy key setup:**

```bash
# On the VPS, as the ruthsmarriage user:
sudo -u ruthsmarriage -i bash
ssh-keygen -t ed25519 -C "ruthsmarriage@<vps>" -N ""
cat ~/.ssh/id_ed25519.pub
```

Add that public key to the repository: GitHub → Settings → Deploy keys →
Add deploy key (read access is enough). Then clone:

```bash
sudo -u ruthsmarriage -i bash
mkdir -p /home/ruthsmarriage/app
cd /home/ruthsmarriage
git clone --branch main git@github.com:edgdmedia/ruthsmarriage.git app
cd app
git log --oneline -1     # should be phase-09b: VPS staging
```

**If there is no SSH access on the server**, copy the app with rsync instead:

```bash
# On the laptop:
rsync -az --delete \
  --exclude node_modules --exclude dist --exclude .astro \
  --exclude .env --exclude .env.local \
  ~/Projects/ruthsmarriage/ ruthsmarriage@<vps>:/home/ruthsmarriage/app/
```

**Then, in the app directory** (or skip if you rsynced):

```bash
sudo -u ruthsmarriage -i bash
cd /home/ruthsmarriage/app
pnpm --version            # 11.9.0 — corepack downloads the pinned version
pnpm install --frozen-lockfile
```

---

## 5. The tokens and the environment files

Three tokens, created in the Cloudflare dashboard:

| Token | Where | What it needs |
|---|---|---|
| R2 API token | R2 > Manage R2 API Tokens > Create API token | **Object Read & Write**, scoped to `ruthsmarriage-media`. |
| Cloudflare API token | My Profile > API Tokens > Create Custom Token | Zone > **Cache Purge**, for the ruthsmarriage.com zone. |
| EMDASH_ENCRYPTION_KEY | From the .env that has it (phase 9a tested locally) | The key that encrypts EmDash plugin settings. |

Now the two files:

```bash
cd /home/ruthsmarriage/app
sudo install -o root -g root -m 600 deploy/ruthsmarriage.env.example /etc/ruthsmarriage.env
sudo install -o root -g root -m 644 deploy/ruthsmarriage.build.env.example /etc/ruthsmarriage.build.env
```

Fill them in:

```bash
sudo nano /etc/ruthsmarriage.env          # secrets — mode 600, root only
sudo nano /etc/ruthsmarriage.build.env    # no secrets, mode 644
```

/etc/ruthsmarriage.env — **runtime**, read by systemd:

```
EMDASH_SITE_URL=https://vps.ruthsmarriage.com
EMDASH_ENCRYPTION_KEY=<from the laptop's .env>
RESEND_API_KEY=<from Resend>
CLOUDFLARE_ZONE_ID=<the zone id of ruthsmarriage.com>
CLOUDFLARE_API_TOKEN=<the cache-purge token from step 1>
S3_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
S3_BUCKET=ruthsmarriage-media
S3_ACCESS_KEY_ID=<the R2 access key id>
S3_SECRET_ACCESS_KEY=<the R2 secret>
EMDASH_URL=http://127.0.0.1:4321
EMDASH_TOKEN=<ec_pat_... from 9a>
TURNSTILE_SECRET_KEY=<from Cloudflare dashboard>
```

/etc/ruthsmarriage.build.env — **build time**, no secrets:

```
EMDASH_SITE_URL=https://vps.ruthsmarriage.com
DATABASE_PATH=/home/ruthsmarriage/data/emdash.db
SESSION_DIR=/home/ruthsmarriage/data/sessions
S3_BUCKET=ruthsmarriage-media
S3_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
S3_REGION=auto
PUBLIC_TURNSTILE_SITE_KEY=<the widget site key from Cloudflare>
```

**Check it:**

```bash
sudo grep -c 'EMDASH_ENCRYPTION_KEY=..' /etc/ruthsmarriage.env
sudo grep -c 'S3_ACCESS_KEY_ID=..' /etc/ruthsmarriage.env
```

Both must print 1.

---

## 6. The service

```bash
cd /home/ruthsmarriage/app
sudo install -o root -g root -m 644 deploy/ruthsmarriage.service /etc/systemd/system/ruthsmarriage.service
sudo install -o root -g root -m 440 deploy/sudoers-ruthsmarriage /etc/sudoers.d/ruthsmarriage
sudo visudo -c                                  # must print "parsed OK"
```

**Point ExecStart at the Node you installed.** The systemd unit reads the
profile, so use the full path:

```bash
NODE=$(sudo -u ruthsmarriage -i bash -lc 'echo ~/.local/share/fnm/aliases/default/bin/node')
echo "$NODE"        # /home/ruthsmarriage/.local/share/fnm/aliases/default/bin/node
sudo sed -i "s|^ExecStart=.*|ExecStart=$NODE ./dist/server/entry.mjs|" /etc/systemd/system/ruthsmarriage.service
grep '^ExecStart' /etc/systemd/system/ruthsmarriage.service
```

Then start it:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now ruthsmarriage
sudo systemctl status ruthsmarriage --no-pager
```

**Check it:**

```bash
sudo systemctl is-active ruthsmarriage       # active
sudo journalctl -u ruthsmarriage -n 20        # no errors
```

The service will fail until the database is there (Section 7) — that is
the next step, not a problem.


---

## 7. The database and the media

The database is already on the laptop at `data/emdash.db` (EmDash was set
up in phase 9a). Copy it to the server with SQLite's backup command:

**On the laptop:**

```bash
# Make a clean backup copy first (never cp a live WAL database)
cd ~/Projects/ruthsmarriage
sqlite3 data/emdash.db "PRAGMA integrity_check;"   # must print ok
sqlite3 data/emdash.db ".backup '/tmp/emdash-staging.db'"
scp /tmp/emdash-staging.db ruthsmarriage@<vps>:/home/ruthsmarriage/data/emdash.db.new
```

**On the server, as the ruthsmarriage user:**

```bash
ssh ruthsmarriage@<vps>
mkdir -p /home/ruthsmarriage/data
mv /home/ruthsmarriage/data/emdash.db.new /home/ruthsmarriage/data/emdash.db
chmod 600 /home/ruthsmarriage/data/emdash.db
ls -la /home/ruthsmarriage/data/
sqlite3 /home/ruthsmarriage/data/emdash.db "PRAGMA integrity_check;"   # ok
```

The media is already in R2 (it was uploaded during phase 9a). The stored
storageKeys resolve to `/_emdash/api/media/file/<key>` and those URLs point
to R2 via the S3 adapter — no upload needed.

**Rebuild the search index** (the FTS5 tables need population):

```bash
curl -s "http://127.0.0.1:4321/_emdash/api/search?q=a" > /dev/null
```

**Check a media URL** — from INSIDE the VPS (not from outside):

```bash
ssh ruthsmarriage@<vps> 'curl -sI http://127.0.0.1:4321/_emdash/api/media/file/$(sqlite3 /home/ruthsmarriage/data/emdash.db "SELECT storage_key FROM media LIMIT 1")' | head -1
# HTTP/1.1 200 OK
```

---

## 8. The web server: proxy and TLS

**The proxy** is a file of our own, `deploy/nginx-proxy.conf`, installed as
`/etc/nginx/conf.d/ruthsmarriage-node.conf`. Virtualmin manages the
WordPress vhost — leave that file alone; Virtualmin rewrites it. Our file
goes in conf.d/ where it wins before sites-enabled/.

Get the box's IP first:

```bash
hostname -I | awk '{print $1}'
```

Replace `<BOX_IP>` in `deploy/nginx-proxy.conf` with that address.

```bash
cd /home/ruthsmarriage/app
sudo sed -i 's/<BOX_IP>/<your-box-ip>/' deploy/nginx-proxy.conf
sudo install -o root -g root -m 644 deploy/nginx-proxy.conf /etc/nginx/conf.d/ruthsmarriage-node.conf
sudo nginx -t && sudo systemctl reload nginx
curl -sI http://127.0.0.1:4321/ | head -3        # the app answers on its own
```

**TLS.** Install a Cloudflare Origin Certificate on the virtual server
(Virtualmin > Manage SSL Certificate > Paste a certificate):

- Cloudflare dashboard: **SSL/TLS → Origin Server → Create Certificate**,
  host names `ruthsmarriage.com` and `*.ruthsmarriage.com`, key type RSA.
- Copy the cert and key into Virtualmin's SSL form.

The cert goes in `/etc/ssl/ruthsmarriage/origin.pem` and `origin.key`. Then
Cloudflare can use **Full (strict)**. The DNS record stays proxied.

**Verify from inside the VPS** (strict check against the hostname):

```bash
# From the VPS, this must 403 (Cloudflare-only origin):
curl -skI --resolve vps.ruthsmarriage.com:443:<box-ip> https://vps.ruthsmarriage.com/ | head -1
# HTTP/1.1 403 Forbidden

# Through Cloudflare it must work:
# (owner does this from their own machine, not from the VPS)
```


---

## 9. Backups

A nightly cron as the `ruthsmarriage` user. Webmin > Others > Scheduled
Cron Jobs:

```
17 2 * * *  /home/ruthsmarriage/app/scripts/backup-vps.sh
```

Or from the shell:

```bash
sudo crontab -u ruthsmarriage -e
```

**Run it once by hand:**

```bash
sudo -u ruthsmarriage -i bash
/home/ruthsmarriage/app/scripts/backup-vps.sh
ls -lh /home/ruthsmarriage/backups/
sqlite3 /home/ruthsmarriage/backups/emdash-$(date +%F).db "PRAGMA integrity_check;"  # ok
```

**The off-site copy** (the script's rclone step) needs an R2 remote named
`r2`. On the VPS, as the ruthsmarriage user:

1. Create an R2 API token (Cloudflare dashboard > R2 > Manage R2 API Tokens)
   with **Object Read & Write** for the `ruthsmarriage-backups` bucket.
2. Configure rclone with the account ID and token:

```bash
sudo -u ruthsmarriage -i bash
cat >> ~/.rclone.conf << 'EOF'
[r2]
type = cloudflare
account_id = <your-cloudflare-account-id>
token = <the-r2-api-token>
EOF
rclone listremotes    # must show r2:
```

Create the backup bucket in Cloudflare (R2 > Create bucket), named
`ruthsmarriage-backups` (private, 30-day lifecycle rule). The script
copies each nightly `.db` file to `r2:ruthsmarriage-backups/emdash-YYYY-MM-DD.db`.

---

## 10. Restoring

```bash
sudo systemctl stop ruthsmarriage
cp -a /home/ruthsmarriage/data/emdash.db /home/ruthsmarriage/data/emdash.db.broken
cp /home/ruthsmarriage/backups/emdash-YYYY-MM-DD.db /home/ruthsmarriage/data/emdash.db
rm -f /home/ruthsmarriage/data/emdash.db-wal /home/ruthsmarriage/data/emdash.db-shm
sqlite3 /home/ruthsmarriage/data/emdash.db "PRAGMA integrity_check;"   # ok
sudo systemctl start ruthsmarriage
curl -sI http://127.0.0.1:4321/ | head -3
```

The media is in R2 and is not part of the restore. The uploaded media is
immutable in R2 (identified by ULID storage key), so it cannot go stale.

**Always test a restore** into a scratch path before you need it:

```bash
sqlite3 /home/ruthsmarriage/backups/emdash-YYYY-MM-DD.db "PRAGMA integrity_check;"
sqlite3 /home/ruthsmarriage/backups/emdash-YYYY-MM-DD.db "SELECT COUNT(*) FROM ec_posts;"
```

---

## 11. Staging

Before the cutover, run the site on `vps.ruthsmarriage.com` so the real
domain is never the first place it is tried.

**Cloudflare (owner, Section 15 first):** add a proxied A record
`vps.ruthsmarriage.com` pointing to the VPS. Without it, step 3 fails with
DYNAMIC.

**Build and restart** with the staging origin:

```bash
sudo sed -i 's|^EMDASH_SITE_URL=.*|EMDASH_SITE_URL=https://vps.ruthsmarriage.com|' /etc/ruthsmarriage.build.env
sudo -u ruthsmarriage -i bash
cd /home/ruthsmarriage/app && bash scripts/deploy-vps.sh
```

**Run the checks** (from the VPS, then from your own machine):

```bash
# From the VPS — origin check:
SITE=http://127.0.0.1:4321
for u in / /services/ /posts/ /resources/ /askcoach/ /404/; do
  printf "%-30s " "$u"
  curl -s -o /dev/null -w "%{http_code}\n" "$SITE$u"
done

# From your laptop — edge cache check:
SITE=https://vps.ruthsmarriage.com
curl -sI "$SITE/" | grep -i cache-control        # s-maxage=2592000
curl -sI "$SITE/" | grep -i cache-tag            # posts,services,resources,testimonials,...
curl -sI "$SITE/" > /dev/null
curl -sI "$SITE/" | grep -i cf-cache-status       # HIT (second request)
```

**Purge on publish:** make a small change to a test post in the admin,
publish it, and confirm the home page goes MISS once, then HIT. The service
log says `[cloudflare-purge] purged`.

```bash
sudo journalctl -u ruthsmarriage -f | grep cloudflare-purge
```


---

## 12. The cutover checklist (the owner)

Nothing below is done by the code. Each step is the owner's, in this order.

**Before the switch**

1. Content freeze: tell the editors to stop editing.
2. Final database copy (repeat Section 7's steps to get the latest).
3. Build with the production origin and restart:

```bash
sudo sed -i 's|^EMDASH_SITE_URL=.*|EMDASH_SITE_URL=https://www.ruthsmarriage.com|' /etc/ruthsmarriage.build.env
sudo -u ruthsmarriage -i bash
cd /home/ruthsmarriage/app && bash scripts/deploy-vps.sh
```

4. In Cloudflare: remove the Worker's custom domain for www.ruthsmarriage.com
   and point the apex DNS record (proxied, orange cloud) at the VPS.
   Add www.ruthsmarriage.com to the Cache Rule (Section 15).
5. Redirect www to the apex with a Redirect Rule ("WWW to root" template).
6. Purge everything in Cloudflare.
7. Smoke test: home, a post, /askcoach/, admin.

**After the switch**

8. Keep the live WordPress site for 14 days as the rollback path.
9. After 14 days: delete the Worker and D1 if desired.
   **Never delete the R2 bucket `ruthsmarriage-media`**.

---

## 13. Deploying a change

**Branches.** `dev` is where work happens; `main` is what runs. GitHub
Actions (`.github/workflows/deploy.yml`) runs typecheck, tests and a build
on every push to `dev`. Promote either with a pull request dev → main
merged on GitHub, or with `git push origin dev:main`. The push to main
deploys without checking again.

**How the SSH login is locked down.** The key GitHub uses can do one thing:
its line in `/home/ruthsmarriage/.ssh/authorized_keys` starts with a forced
command:

```
command="cd /home/ruthsmarriage/app && bash scripts/deploy-vps.sh",no-port-forwarding,no-agent-forwarding,no-X11-forwarding,no-pty ssh-ed25519 AAAA... github-deploy
```

The repository secrets are `VPS_HOST`, `VPS_SSH_KEY` (private half) and
`VPS_KNOWN_HOSTS` (`ssh-keyscan -t ed25519 <vps-host>`).

**By hand**, on the server:

```bash
cd /home/ruthsmarriage/app
bash scripts/deploy-vps.sh
```

`bash scripts/deploy-vps.sh --check` builds without restarting.

---

## 14. Restarting, stopping, and the logs

```bash
sudo systemctl restart ruthsmarriage
sudo systemctl status ruthsmarriage
sudo systemctl stop ruthsmarriage
sudo journalctl -u ruthsmarriage -f          # follow
sudo journalctl -u ruthsmarriage --since "1 hour ago"
sudo journalctl -u ruthsmarriage -p ruthsmarriage   # only the site's own lines
```

Health check:

```bash
curl -sI http://127.0.0.1:4321/ | head -3
```

---

## 15. The cache

Three layers:

1. **Cloudflare's edge cache** — public page kept for 30 days, purged by
   tag on publish. **Requires a Cache Rule (below).**
2. **EmDash's query cache** (in the Node process) — DB read when content
   changes, not otherwise.
3. **The origin** — renders the page. It reads the DB only when the
   query cache has been invalidated.

### The Cloudflare Cache Rule (required)

Cloudflare does **not** cache HTML by default, whatever Cache-Control says.
Without the rule, every request reaches the VPS (DYNAMIC).

Cloudflare dashboard → ruthsmarriage.com → **Caching → Cache Rules →
Create rule**:

- **Rule name**: `Cache pages (origin decides)`
- **When incoming requests match** → *Edit expression*:

```
(http.host in {"vps.ruthsmarriage.com"}
 and not starts_with(http.request.uri.path, "/_emdash")
 and not http.cookie contains "astro-session=")
```

  At cutover add `, "www.ruthsmarriage.com"` to the host list.

- **Cache eligibility**: *Eligible for cache*
- **Edge TTL**: *Use cache-control header if present, bypass cache if not*
- **Browser TTL**: *Respect origin TTL*
- Leave everything else as it is. **Deploy.**

### Purging

A publish purges the edge automatically. If a change did not show up,
purge by hand — Cloudflare dashboard → Caching → Purge Cache → Custom Purge:

| What | Tag |
|---|---|
| Everything | `all` |
| Every page listing posts | `posts` |
| Every service page | `services` |
| Every resource page | `resources` |
| The category list | `emdash:taxonomy:category` |
| The tag list | `emdash:taxonomy:tag` |
| Site settings | `settings` |

---

## 16. Rotating the secrets

| Secret | Where it is | How to rotate |
|---|---|---|
| `EMDASH_ENCRYPTION_KEY` | /etc/ruthsmarriage.env | Keep the old key until plugin settings are re-saved: `EMDASH_ENCRYPTION_KEY=new,old` |
| `RESEND_API_KEY` | /etc/ruthsmarriage.env | Resend → API keys. Replace, restart. |
| `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY` | /etc/ruthsmarriage.env | R2 → Manage API tokens. Create new, replace both, restart, test. |
| `CLOUDFLARE_API_TOKEN` | /etc/ruthsmarriage.env | Cloudflare → My Profile → API Tokens → Create (Zone > Cache Purge). Replace, restart. |

After any change to /etc/ruthsmarriage.env:

```bash
sudo systemctl restart ruthsmarriage
sudo journalctl -u ruthsmarriage -n 10
```


---

## 17. Troubleshooting

| Symptom | What to check |
|---|---|
| The site is down | `sudo systemctl status ruthsmarriage` and `sudo journalctl -u ruthsmarriage -n 50` |
| The service will not start | The `ExecStart` path must match the fnm default node; `DATABASE_PATH` must exist and be writable |
| Every page is a 500 | The database was not migrated, or is not readable: `sqlite3 /home/ruthsmarriage/data/emdash.db "PRAGMA integrity_check;"` |
| The admin 404s | `EMDASH_ENCRYPTION_KEY` is missing from /etc/ruthsmarriage.env |
| Images are broken | The R2 credentials are wrong or the bucket name is not `ruthsmarriage-media`: check `curl -sI http://127.0.0.1:4321/_emdash/api/media/file/<id>` and the service log |
| A publish does not appear | The purge did not happen: check `CLOUDFLARE_ZONE_ID` / `CLOUDFLARE_API_TOKEN` are set. `sudo journalctl -u ruthsmarriage | grep cloudflare-purge` |
| The origin is being hammered | The edge is not caching: `curl -sI http://127.0.0.1:4321/ | grep cache-control` — must say `s-maxage=2592000` |
| Bots reach the origin | The allowlist in the vhost is missing or out of date (see deploy/cloudflare-ips.txt) |
| 403 from nginx | The request did not come through Cloudflare — that is the allowlist working. Test through the proxied hostname. |
| The deploy script says "node is not on the PATH" | Section 3: the profile lines are missing, or the script runs as a different user |

---

## 18. The media: R2 (decided)

**Decision (D17): the media stays in Cloudflare R2.** The site talks to
R2 over its S3 API. The stored storageKeys already resolve to
`/_emdash/api/media/file/<key>` and those URLs do not change.

Why this one:
- The images stay on Cloudflare's edge, fastest for visitors.
- Admin uploads go straight to R2 (the S3 adapter signs them).
- The VPS keeps only the database. No media directory to back up.
- R2 costs about $0.003/month for this amount of media.

**The token:** R2 > Manage R2 API Tokens > Create API token >
**Object Read & Write**, scoped to `ruthsmarriage-media`. Put the access
key id and secret into `/etc/ruthsmarriage.env`:

```
S3_ACCESS_KEY_ID=...
S3_SECRET_ACCESS_KEY=...
```

The site reads them at runtime, never at build time. A wrong key shows up
as broken images and a message in the log, not as a broken build.

**If the owner ever changes their mind:** set `EMDASH_STORAGE=local` and
`MEDIA_DIR=/home/ruthsmarriage/data/uploads` in /etc/ruthsmarriage.build.env,
copy the files across with rclone, and add the uploads directory to the
backup job. The content URLs do not change.

---

## 19. Still open (the owner has to answer)

- The **VPS address** and SSH access (the runbook assumes you can `ssh root@<vps>`).
- The **R2 API token** (read/write on `ruthsmarriage-media`) for the S3 adapter.
- The **Cloudflare API token** with Zone → Cache Purge for the zone.
- The **EMDASH_ENCRYPTION_KEY** from the laptop's .env.
- A **proxied A record** `vps.ruthsmarriage.com` pointing to the VPS (for staging).
- A free port for the Node process (4321 by default — check what the box already uses).
