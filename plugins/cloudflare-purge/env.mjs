// Runtime configuration for the purge plugin, read at hook time (never at
// build time, never from the database). On the VPS the process environment
// comes from /etc/ruthsmarriage.env; in local dev from .env.
export const env = globalThis.process?.env ?? {};
