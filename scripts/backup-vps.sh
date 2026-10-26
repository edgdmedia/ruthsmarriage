#!/usr/bin/env bash
#
# Nightly backup of the site's SQLite database.
#
# Run it from cron as the `ruthsmarriage` user (Webmin > Scheduled Cron Jobs
# is fine):
#
#     17 2 * * *  /home/ruthsmarriage/app/scripts/backup-vps.sh
#
# The copy is made with SQLite's own backup command, not with `cp`: the
# database runs in WAL mode, so the most recent changes live in the -wal file
# next to it. Copying the .db file alone would lose them — and copying it
# while the site writes to it can produce a corrupt file.
#
# The copies are kept for 14 days. An off-site copy goes to a dedicated
# backup R2 bucket (never the media bucket: the media route serves any key
# in that one), and retention there is an R2 lifecycle rule.
set -euo pipefail

DB="${DB:-/home/ruthsmarriage/data/emdash.db}"
BACKUP_DIR="${BACKUP_DIR:-/home/ruthsmarriage/backups}"
KEEP_DAYS="${KEEP_DAYS:-14}"
STAMP="$(date +%F)"

if ! command -v sqlite3 >/dev/null; then
	echo "backup-vps: the sqlite3 CLI is required" >&2
	exit 1
fi
if [ ! -f "$DB" ]; then
	echo "backup-vps: no database at $DB" >&2
	exit 1
fi

mkdir -p "$BACKUP_DIR"
# `sudo -u ruthsmarriage` from root's shell keeps /root as the working
# directory, which this user cannot read; find then fails under set -e.
cd "$BACKUP_DIR"
TARGET="$BACKUP_DIR/emdash-$STAMP.db"

echo "backup-vps: $DB -> $TARGET"
sqlite3 "$DB" ".backup '$TARGET'"

# A backup that cannot be opened is worse than no backup: it looks like a
# restore point and is not.
integrity=$(sqlite3 "$TARGET" "PRAGMA integrity_check;" || true)
if [ "$integrity" != "ok" ]; then
	echo "backup-vps: the copy failed its integrity check ($integrity) — not keeping it" >&2
	rm -f "$TARGET"
	exit 1
fi

# The off-site copy: a dedicated private R2 bucket, never the media bucket.
# Runs once an rclone remote named "r2" exists for this user (runbook §9).
# Retro rclone talks to R2 with no_head = true — see the runbook. Retention
# there is an R2 lifecycle rule, not this script.
OFFSITE="${OFFSITE:-r2:ruthsmarriage-backups}"
if command -v rclone >/dev/null && rclone listremotes 2>/dev/null | grep -qx "${OFFSITE%%:*}:"; then
	rclone copyto "$TARGET" "$OFFSITE/emdash-$STAMP.db"
	echo "backup-vps: copied off-site to $OFFSITE"
else
	echo "backup-vps: no rclone remote for $OFFSITE — off-site copy skipped" >&2
fi

find "$BACKUP_DIR" -maxdepth 1 -name 'emdash-*.db' -mtime "+$KEEP_DAYS" -print -delete

echo "backup-vps: done ($(du -h "$TARGET" | cut -f1))"
