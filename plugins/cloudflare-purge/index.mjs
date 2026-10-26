/**
 * Purges Cloudflare's zone cache when content changes.
 *
 * The site's cache is Cloudflare's edge, in front of the origin (see
 * src/middleware.ts): a public page is kept for 30 days and carries a
 * `Cache-Tag` header with the groups it belongs to — the collections it shows
 * ("posts", "services", "resources", "testimonials", "marquee_items"), the
 * chrome tags ("menus", "settings", the taxonomies) and "all"
 * (src/lib/cache-tags.ts). The tags are per path, so they carry no entry ids:
 * purging "posts" drops every page that shows posts, which is nearly the whole
 * site. That is deliberate — a re-render on the VPS costs no quota — and it
 * keeps the purge simple. Purge by tag is available on every Cloudflare plan.
 *
 * Purged on: publish, unpublish, delete, restore, and a save to an entry that
 * is already published. The last one matters: posts have revisions, so a body
 * edit waits for Publish, but live metadata is written straight to the live
 * row and only fires content:afterSave. That hook also fires on every draft
 * autosave, so it is debounced: one purge, 30 s after the last save.
 *
 * Never purged: the `ask_coach_questions` collection. Those are anonymous
 * form submissions saved as drafts for the coach to read — they are not on
 * any public page, and a submission must not cost a purge (or spam a rate
 * limit).
 *
 * Configuration (environment):
 *   CLOUDFLARE_ZONE_ID    the zone of ruthsmarriage.com              (required)
 *   CLOUDFLARE_API_TOKEN  a token with Zone > Cache Purge           (required)
 *   CLOUDFLARE_PURGE_ENABLED  set to "0" to switch the plugin off
 *
 * Without a token the plugin does nothing but say so once. A failed purge is
 * logged loudly: the edge would keep serving the old page until its 30 days
 * are up, so the owner has to know about it.
 */
import { definePlugin } from "emdash";

const ID = "cloudflare-purge";
const VERSION = "1.0.0";
const CAPABILITIES = ["content:read"];

// The Free plan allows 5 purge requests a minute. A publish is one request,
// but a bulk import is many, so a rate-limited answer is retried.
const RETRY_DELAYS_MS = [1_000, 5_000, 20_000];
const MAX_TAG_LENGTH = 1024;
const MAX_TAGS_PER_REQUEST = 100;

// A save to a published entry purges this long after the last save of a burst.
const SAVE_DEBOUNCE_MS = 30_000;
const pendingSaves = new Map();

// The collection the anonymous Ask Coach form saves into. It is never on a
// public page, so a submission never purges the cache.
const NEVER_PURGE = new Set(["ask_coach_questions"]);

let warned = false;

/** @param {{ zoneId?: string, apiToken?: string, enabled?: boolean }} options */
export function cloudflarePurge(options = {}) {
	return {
		id: ID,
		version: VERSION,
		format: "native",
		entrypoint: "@ruthsmarriage/cloudflare-purge",
		capabilities: CAPABILITIES,
		options,
	};
}

export function createPlugin(options = {}) {
	return definePlugin({
		id: ID,
		version: VERSION,
		capabilities: CAPABILITIES,
		hooks: {
			"content:afterPublish": {
				handler: async (event, ctx) => {
					await purgeEntry(event, ctx, "publish");
				},
			},
			"content:afterSave": {
				handler: async (event, ctx) => {
					if (NEVER_PURGE.has(event.collection)) return;
					if (event.content?.status !== "published") return;
					// The event cannot tell a draft autosave from a live write, and the
					// admin autosaves every few seconds. Purge once, after the saves stop.
					const key = `${event.collection}:${event.content.id}`;
					clearTimeout(pendingSaves.get(key));
					const timer = setTimeout(() => {
						pendingSaves.delete(key);
						purgeEntry(event, ctx, "save").catch(() => {});
					}, SAVE_DEBOUNCE_MS);
					timer.unref?.();
					pendingSaves.set(key, timer);
				},
			},
			"content:afterUnpublish": {
				handler: async (event, ctx) => {
					await purgeEntry(event, ctx, "unpublish");
				},
			},
			"content:afterDelete": {
				handler: async (event, ctx) => {
					// The delete event carries { id, collection }.
					await purgeTags([event.collection, event.id], ctx, "delete");
				},
			},
			"content:afterRestore": {
				handler: async (event, ctx) => {
					await purgeEntry(event, ctx, "restore");
				},
			},
		},
	});
}

export default createPlugin;

/**
 * Purge the collection of a content change. The entry id goes along too: it
 * costs nothing, and it keeps working if pages ever carry per-entry tags.
 */
async function purgeEntry(event, ctx, action) {
	if (NEVER_PURGE.has(event.collection)) return;
	const id = typeof event.content?.id === "string" ? event.content.id : undefined;
	await purgeTags([event.collection, id], ctx, action);
}

async function purgeTags(rawTags, ctx, action) {
	const tags = (rawTags ?? []).filter((t) => typeof t === "string" && t.length > 0).map((t) => t.slice(0, MAX_TAG_LENGTH));
	if (tags.length === 0) return;

	const { zoneId, apiToken, enabled } = await config();
	if (enabled === false) return;
	if (!zoneId || !apiToken) {
		if (!warned) {
			warned = true;
			ctx.log.warn("[cloudflare-purge] no CLOUDFLARE_ZONE_ID / CLOUDFLARE_API_TOKEN — the edge cache is not purged on publish");
		}
		return;
	}

	const body = { tags: tags.slice(0, MAX_TAGS_PER_REQUEST) };
	const url = `https://api.cloudflare.com/client/v4/zones/${zoneId}/purge_cache`;

	for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
		if (attempt > 0) await sleep(RETRY_DELAYS_MS[attempt - 1]);
		try {
			const res = await fetch(url, {
				method: "POST",
				headers: { Authorization: `Bearer ${apiToken}`, "Content-Type": "application/json" },
				body: JSON.stringify(body),
			});
			const payload = await res.json().catch(() => ({}));
			if (res.ok && payload?.success !== false) {
				ctx.log.info("[cloudflare-purge] purged", { action, tags: body.tags });
				return;
			}
			// 429 = rate limited (Free plan: 5 a minute). Anything else is a
			// configuration or permission problem, which a retry will not fix.
			if (res.status !== 429) {
				ctx.log.error("[cloudflare-purge] purge failed", {
					action,
					tags: body.tags,
					status: res.status,
					errors: payload?.errors,
				});
				return;
			}
			ctx.log.warn("[cloudflare-purge] rate limited, retrying", { action, attempt });
		} catch (error) {
			ctx.log.error("[cloudflare-purge] purge request failed", { action, tags: body.tags, error: String(error) });
			return;
		}
	}
	ctx.log.error("[cloudflare-purge] purge gave up after retries", { action, tags: body.tags });
}

async function config() {
	try {
		const { env } = await import("./env.mjs");
		return {
			zoneId: env?.CLOUDFLARE_ZONE_ID,
			apiToken: env?.CLOUDFLARE_API_TOKEN,
			enabled: env?.CLOUDFLARE_PURGE_ENABLED !== "0",
		};
	} catch {
		return { enabled: true };
	}
}

function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
