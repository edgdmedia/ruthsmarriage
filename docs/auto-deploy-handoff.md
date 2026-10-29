# Auto-deploy: how it works (copied from the AbilityX setup) and what to fix here

## Why the main deploy fails today

Run 40763022546 (merge of PR #2 into `main`) fails in "Deploy to VPS" with:

```
getKeyFile error: open ~/.ssh/id_ed25519: no such file or directory
ssh: handshake failed: ssh: unable to authenticate, attempted methods [none]
```

`appleboy/ssh-action` is a **Docker** action. It runs in a container whose `~`
is not the runner's home, so the key written to the runner's `~/.ssh/id_ed25519`
does not exist inside it. Also, `known_hosts` is not an input of that action, so
the host key is not checked either.

**Fix: drop `appleboy/ssh-action` and call plain `ssh` from the runner** (below).

## How AbilityX does it (the pattern to copy)

1. **Two branches.** Push to `dev` → CI (typecheck, test, build). Merge
   `dev` → `main` → deploy. The deploy job does **not** build on the runner;
   the server builds itself.
2. **Gate.** The deploy job finds the `dev` commit whose git *tree* equals
   `main`'s tree, and deploys only if that commit's CI run succeeded. If `main`
   contains anything never checked on `dev`, nothing deploys.
3. **One SSH login, forced command.** The runner runs
   `ssh -i key ruthsmarriage@HOST` with no command. On the server the key is
   pinned in `~/.ssh/authorized_keys`:
   ```
   command="bash /home/ruthsmarriage/app/scripts/deploy-vps.sh",no-pty,no-port-forwarding,no-agent-forwarding,no-X11-forwarding ssh-ed25519 AAAA... github-deploy
   ```
   So the key can run the deploy script and nothing else.
4. **`scripts/deploy-vps.sh`** (already exists here): `git pull --ff-only`,
   `pnpm install --frozen-lockfile`, source the build env, `pnpm build`,
   `sudo systemctl restart ruthsmarriage.service`, then curl
   `127.0.0.1:$PORT` until it answers 200 (a down site fails the deploy).
5. **Sudo rule** allows only the restart and the status line. Each line must
   match the script's command **word for word**.
6. **Cloudflare purge** after the deploy (optional, needs
   `CLOUDFLARE_PURGE_TOKEN` + `CLOUDFLARE_ZONE_ID` secrets).

## Changes to make in this repo

### 1. `.github/workflows/deploy.yml` — replace the deploy job's steps

Remove: Setup pnpm, Setup Node, Install, Build, "Write SSH private key" and the
`appleboy/ssh-action` step. Use:

```yaml
  deploy:
    name: Deploy to VPS
    runs-on: ubuntu-latest
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    environment: production
    steps:
      - name: Deploy over SSH
        env:
          SSH_KEY: ${{ secrets.VPS_SSH_KEY }}
          KNOWN_HOSTS: ${{ secrets.VPS_KNOWN_HOSTS }}
          HOST: ${{ secrets.VPS_HOST }}
        run: |
          install -m 700 -d ~/.ssh
          printf '%s\n' "$SSH_KEY" > ~/.ssh/deploy_key
          chmod 600 ~/.ssh/deploy_key
          printf '%s\n' "$KNOWN_HOSTS" > ~/.ssh/known_hosts
          # The server's forced command runs scripts/deploy-vps.sh.
          ssh -i ~/.ssh/deploy_key -o BatchMode=yes ruthsmarriage@"$HOST"
```

Optional extras from AbilityX (`/Users/olalekan/Projects/stanforteedge/abilityX/.github/workflows/deploy.yml`):
- the "Require a passing check on development" step (change `development` → `dev`,
  `deploy.yml` workflow name stays; needs `permissions: actions: read` and
  `actions/checkout` with `fetch-depth: 0`);
- the "Purge Cloudflare's cache" step;
- `concurrency: { group: deploy-${{ github.ref }}, cancel-in-progress: false }`.

Also: set `node-version: "24"` in the CI job (package.json requires `>=24`).

### 2. `deploy/sudoers-ruthsmarriage` — status line doesn't match

The script runs `systemctl status ruthsmarriage.service --no-pager --lines=10`
but the rule allows only `systemctl status ruthsmarriage.service`. Change it to:

```
ruthsmarriage ALL=(root) NOPASSWD: /usr/bin/systemctl restart ruthsmarriage.service
ruthsmarriage ALL=(root) NOPASSWD: /usr/bin/systemctl status ruthsmarriage.service --no-pager --lines=10
```

Reinstall on the server (root): `install -o root -g root -m 440 deploy/sudoers-ruthsmarriage /etc/sudoers.d/ruthsmarriage && visudo -c`

### 3. Build env must be readable by the `ruthsmarriage` user

The script reads `BUILD_ENV=/etc/ruthsmarriage.build.env`. It holds no secrets
and must be readable by `ruthsmarriage` (AbilityX keeps it in the user's home,
`/home/ability-x/ability-x.build.env`, mode 644). Secrets stay in the root-only
runtime env file used by the systemd unit.

## One-time server/GitHub setup (verify each)

1. On the laptop: `ssh-keygen -t ed25519 -N "" -C github-deploy-ruthsmarriage -f ./rm_deploy`
2. On the server as `ruthsmarriage`: append the `command="..."` line above with
   the contents of `rm_deploy.pub` to `~/.ssh/authorized_keys` (dir 700, file 600).
3. On the server: `ssh-keyscan -t ed25519 localhost | sed 's/^localhost/<server IP>/'`
   → that line is `VPS_KNOWN_HOSTS`. Its host must equal `VPS_HOST` exactly.
4. GitHub secrets (repo-level or in the `production` environment — both work;
   they exist now): `VPS_HOST`, `VPS_SSH_KEY` (whole private key incl. BEGIN/END
   lines), `VPS_KNOWN_HOSTS`. Then delete `rm_deploy*` locally.
   If `VPS_SSH_KEY` was made for the old setup, check its public half is the
   one pinned in step 2.
5. The server checkout must be on `main`:
   `cd /home/ruthsmarriage/app && git checkout main && git pull --ff-only`.
   If the repo is private, the server needs a read-only GitHub deploy key to pull.
6. If the `production` environment has required reviewers, the deploy waits
   for approval — that is expected, not a failure.

## Test

- On the server as `ruthsmarriage`: `bash ~/app/scripts/deploy-vps.sh` must end
  with `Deployed: the site answers 200`. Fix that first; CI can't do better.
- From the laptop: `ssh -i ./rm_deploy ruthsmarriage@<IP>` should run the
  deploy and exit (proves the forced command).
- Then merge `dev` → `main` and watch: `gh run watch`.

Reference files: AbilityX `docs/AbilityX-VPS-Runbook.md` §9, `scripts/deploy-vps.sh`,
`deploy/sudoers-ability-x`.
