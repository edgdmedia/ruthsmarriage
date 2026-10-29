import node from "@astrojs/node";
import react from "@astrojs/react";
import { defineConfig, envField, sessionDrivers } from "astro/config";
import emdash, { local, memoryCache, s3 } from "emdash/astro";
import { sqlite } from "emdash/db";
import { cloudflarePurge } from "@ruthsmarriage/cloudflare-purge";
import { resendEmail } from "@ruthsmarriage/resend-email";

// Dev runs on loopback, where EmDash needs no configured origin — and a
// config-file siteUrl would hijack unauthenticated admin redirects to the
// live site. Production builds bake the canonical origin in; staging builds
// override it: EMDASH_SITE_URL=https://vps.ruthsmarriage.com pnpm build
// (Keep defineConfig's object-literal form: the emdash integration does not
// mount its routes when astro.config passes a function to defineConfig.)
const siteUrl =
	process.env.NODE_ENV === "production"
		? (process.env.EMDASH_SITE_URL ?? "https://ruthsmarriage.com")
		: undefined;

// The database is a SQLite file. The path comes from the environment so the
// same build works on the laptop and on the server. It is read at BUILD time:
const databasePath = process.env.DATABASE_PATH ?? "./data/emdash.db";

// Media storage: S3 (R2) when S3_BUCKET is set, local otherwise.
// EMDASH_STORAGE=s3|local forces the choice.
// The default local dir is `./uploads` — where `emdash seed` writes media
// blobs (seed's `--uploads-dir` default). MEDIA_DIR overrides for the VPS.
const storageDriver = process.env.EMDASH_STORAGE ?? (process.env.S3_BUCKET ? "s3" : "local");
const storage =
	storageDriver === "s3"
		? s3()
		: local({
				directory: process.env.MEDIA_DIR ?? "./uploads",
				baseUrl: "/_emdash/api/media/file",
			});

// No Astro cache provider and no routeRules: the query cache (memoryCache)
// keeps the database quiet between writes. See vps.md note.

export default defineConfig({
	output: "server",
	adapter: node({ mode: "standalone" }),
	session: {
		driver: sessionDrivers.fsLite({ base: process.env.SESSION_DIR ?? "./.astro/sessions" }),
	},
	image: {
		layout: "constrained",
		responsiveStyles: true,
	},
	integrations: [
		react(),
		emdash({
			database: sqlite({ url: `file:${databasePath}` }),
			storage,
			objectCache: memoryCache({ defaultTtl: 3_600, revalidate: 0 }),
			siteUrl,
			trustedProxyHeaders: ["cf-connecting-ip", "x-forwarded-for"],
			plugins: [
				resendEmail({
					from: { email: "noreply@ruthsmarriage.com", name: "Ruth's Marriage" },
					replyTo: "admin@ruthsmarriage.com",
				}),
				// Purges Cloudflare's zone cache when content changes, so a publish
				// is visible at the edge straight away. Reads its credentials from
				// the process environment at hook time (CLOUDFLARE_ZONE_ID /
				// CLOUDFLARE_API_TOKEN); a no-op without them.
				cloudflarePurge(),
			],
		}),
	],
	devToolbar: { enabled: false },
	env: {
		schema: {
			// Ask Coach form (phase 6.4). Secrets live in .env locally (git-ignored)
			// and in the server's env file on the VPS — never in git.
			RESEND_API_KEY: envField.string({
				context: "server",
				access: "secret",
				optional: true,
			}),
			TURNSTILE_SECRET_KEY: envField.string({
				context: "server",
				access: "secret",
				optional: true,
			}),
			PUBLIC_TURNSTILE_SITE_KEY: envField.string({
				context: "client",
				access: "public",
				optional: true,
			}),
			ASKCOACH_TO: envField.string({
				context: "server",
				access: "public",
				default: "admin@ruthsmarriage.com",
			}),
			ASKCOACH_FROM: envField.string({
				context: "server",
				access: "public",
				default: "Ask Coach <askcoach@ruthsmarriage.com>",
			}),
			// Ask Coach questions saved to EmDash's ask_coach_questions collection (phase 9a.5).
			// Token: an EmDash personal access token with only content:write.
			EMDASH_URL: envField.string({
				context: "server",
				access: "public",
				optional: true,
			}),
			EMDASH_TOKEN: envField.string({
				context: "server",
				access: "secret",
				optional: true,
			}),
			// EmDash encryption key for sessions/tokens.
			// Generate with: npx emdash secrets generate
			EMDASH_ENCRYPTION_KEY: envField.string({
				context: "server",
				access: "secret",
				optional: true,
			}),
			// Cloudflare purge plugin (phase 9b.1). In env for clarity, though
			// the plugin reads them at hook time from the process environment.
			CLOUDFLARE_ZONE_ID: envField.string({
				context: "server",
				access: "public",
				optional: true,
			}),
			CLOUDFLARE_API_TOKEN: envField.string({
				context: "server",
				access: "secret",
				optional: true,
			}),
		},
	},
});
