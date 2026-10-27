#!/usr/bin/env bash
#
# Deploy the site on the VPS: pull, install, build, restart.
#
# Runs as the `ruthsmarriage` user (the app's own user). It needs no
# password: the only privileged step is the restart, and the sudo rule in
# deploy/sudoers-ruthsmarriage allows exactly that one command.
#
#   bash scripts/deploy-vps.sh          # deploy the current branch
#   bash scripts/deploy-vps.sh --check  # build, but do not restart
#
# What it does NOT do: migrate the database, touch the media, or change
# anything outside /home/ruthsmarriage/app. The database is migrated by
# EmDash itself on the first request after the restart (runtime migrations),
# and the media stays in R2.
set -euo pipefail

APP_DIR="${APP_DIR:-/home/ruthsmarriage/app}"
BUILD_ENV="${BUILD_ENV:-/etc/ruthsmarriage.build.env}"
SERVICE="${SERVICE:-ruthsmarriage.service}"
CHECK_ONLY=0

if [ "${1:-}" = "--check" ]; then
	CHECK_ONLY=1
fi

cd "$APP_DIR"

# Node 24 is installed for this user only (fnm, under ~/.local/share/fnm), so
# the PATH has to come from the user's own environment. The systemd unit does
# not need it: it names the node binary by its full path.
FNM_DIR="$HOME/.local/share/fnm"
if [ -d "$FNM_DIR" ]; then
	export PATH="$FNM_DIR:$PATH"
	eval "$(command -v fnm >/dev/null 2>&1 && fnm env --shell bash)"
fi

if ! command -v node >/dev/null 2>&1; then
	echo "node is not on the PATH. Install Node 24 for the $USER user (see docs/vps-runbook.md §3)." >&2
	exit 1
fi
if ! command -v pnpm >/dev/null 2>&1; then
	echo "pnpm is not on the PATH. Run: corepack enable pnpm (see docs/vps-runbook.md §3)." >&2
	exit 1
fi

echo "==> Node $(node --version), pnpm $(pnpm --version)"

if git rev-parse --git-dir >/dev/null 2>&1; then
	echo "==> Branch and status"
	git rev-parse --abbrev-ref HEAD
	git status --short

	if [ -n "$(git status --porcelain)" ]; then
		echo "    the working tree has changes — commit them or stash them first" >&2
		exit 1
	fi

	# A checkout without an upstream (the app was copied onto the server
	# rather than cloned from a repository) has nothing to pull.
	if git rev-parse --abbrev-ref --symbolic-full-name '@{u}' >/dev/null 2>&1; then
		echo "==> Pull"
		git pull --ff-only
	else
		echo "==> No upstream branch — skipping the pull (the app was copied in)"
	fi
else
	# The app was copied onto the server instead of cloned from a repository.
	# There is nothing to pull; the files are updated by copying them again.
	echo "==> No git checkout here — skipping the pull (the app was copied in)"
fi

echo "==> Install dependencies"
pnpm install --frozen-lockfile

# The build needs the site URL, the database path and the session directory:
# they are baked into the bundle. The secrets are not needed here — they are
# read at runtime from /etc/ruthsmarriage.env.
if [ -f "$BUILD_ENV" ]; then
	echo "==> Build (configuration from $BUILD_ENV)"
	set -a
	# shellcheck disable=SC1090
	. "$BUILD_ENV"
	set +a
else
	echo "    $BUILD_ENV is missing — building with the built-in defaults" >&2
fi
pnpm build

# The build leaves a stale server bundle in dist/ — Astro's build clears it,
# but an interrupted build can leave a half-written one. A quick check that
# the entry point exists saves a restart into a broken service.
if [ ! -f dist/server/entry.mjs ]; then
	echo "    dist/server/entry.mjs is missing — the build did not finish" >&2
	exit 1
fi

if [ "$CHECK_ONLY" = "1" ]; then
	echo "==> Build OK (not restarting: --check)"
	exit 0
fi

echo "==> Restart $SERVICE"
sudo systemctl restart "$SERVICE"

sleep 2
echo "==> Status"
sudo systemctl status "$SERVICE" --no-pager --lines=10 || true

echo
# Smoke test on the origin itself: from GitHub's runners the site is behind
# Cloudflare's bot rules, which answer 403 to data-centre traffic. A deploy
# that leaves the site down fails here, and so does the Actions run.
PORT_TO_CHECK=${PORT:-4322}
for i in $(seq 1 15); do
	code=$(curl -s -o /dev/null -w '%{http_code}' "http://127.0.0.1:${PORT_TO_CHECK}/" || true)
	[ "$code" = "200" ] && break
	sleep 2
done
if [ "$code" != "200" ]; then
	echo "    the site answers $code on 127.0.0.1:${PORT_TO_CHECK} after the restart" >&2
	exit 1
fi
echo "Deployed: the site answers 200 on 127.0.0.1:${PORT_TO_CHECK}"
