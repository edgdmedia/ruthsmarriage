import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import { defineConfig, envField } from "astro/config";

export default defineConfig({
	output: "server",
	adapter: cloudflare(),
	image: {
		layout: "constrained",
		responsiveStyles: true,
	},
	integrations: [react()],
	devToolbar: { enabled: false },
	env: {
		schema: {
			// Ask Coach form (phase 6.4). Secrets live in .env locally (git-ignored) and in
			// the server's env file on the VPS — never in git.
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
			// Ask Coach questions are also saved to EmDash's ask_coach_questions collection
			// (phase 9). Token: an EmDash personal access token with only content:write.
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
		},
	},
});
