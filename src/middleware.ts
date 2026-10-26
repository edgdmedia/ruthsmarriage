// Cache headers and Cache-Tag for Cloudflare's zone cache (see vps.md).
// astro.config.mjs uses no Astro cache provider and no routeRules, so this
// middleware is the only thing that decides what the edge keeps.
//
//   public page 200  → public, max-age=300, s-maxage=2592000  (edge 30 d)
//   public page 404  → public, max-age=60, s-maxage=60
//   admin / API / signed-in editor / POST → private, no-store
//   //_astro/*      → 1 y immutable (hashed build files)
//   /assets/*       → 7 d (unhashed names: the file behind a URL can change)
//   /_emdash/api/media/file/* → 1 y immutable (storage keys are ULIDs)
//
// No stale-while-revalidate: Cloudflare ignores it when s-maxage is present,
// so it would only re-render after the cache expired — the plain s-maxage
// above already does that and nothing extra.
//
// Every public page also carries a Cache-Tag header naming the groups it
// belongs to (src/lib/cache-tags.ts). The purge plugin
// (plugins/cloudflare-purge) asks Cloudflare to drop a group when its content
// changes, so a publish is visible at the edge within seconds.
import { defineMiddleware } from "astro:middleware";
import { tagsForPath } from "./lib/cache-tags";

// How long Cloudflare's edge cache keeps a public page, and how long a
// browser may keep it. The edge copy is the point of the whole setup: the
// database is only read when a page is missing from the cache, and a publish
// purges the pages it touched (plugins/cloudflare-purge). Browsers get five
// minutes, so a reader never sits on a stale homepage — and never sits on a
// stale article either, once the edge purge has run.
const EDGE_MAX_AGE = 2_592_000; // 30 days
const BROWSER_MAX_AGE = 300; // 5 minutes
// A 404 is cached for a minute: crawlers probe thousands of URLs and every
// one of them would otherwise be a render. A minute is short enough that a
// page published at a probed URL appears almost immediately.
const NOT_FOUND_MAX_AGE = 60;
// Media keys are ULIDs: the file behind a key never changes.
const MEDIA_MAX_AGE = 31_536_000; // 1 year
// /_astro/* files are content-hashed: their URL changes when the content
// changes, so they can live on the edge (and in browsers) for a year.
const BUILD_ASSET_MAX_AGE = 31_536_000;
// /assets/* and other public/ files keep unhashed names (a logo, a pattern,
// a hero image that is edited in place), so a year would be wrong. Seven
// days is a good middle ground: fast, and a changed file shows up within a
// week without a purge.
const PUBLIC_ASSET_MAX_AGE = 604_800; // 7 days

// The cache key is the full URL, so "/?utm_source=x" is a different cache entry
// from "/" — a cache MISS, and a full render with all its reads, for every
// unique query string a bot invents. Redirect those to the canonical URL: one
// cheap 301, and the clean URL is a cache HIT for everyone after it.
//
// /search keeps its query string (that is the search), /_emdash/* is the
// admin and its API. / and /page/* also keep theirs: index.astro and
// page/[n].astro use "?s=" to rewrite into the search route before the
// middleware can see the rewrite — every other path is canonised above.
//
// The root "/" is included with a separate term: "^\/(search|_emdash|page)""
// would not match it.
const KEEP_QUERY = /^(\/|\/(search|_emdash|page)($|\/))/;

// The admin, its API, anything a signed-in editor sees, and any POST result
// (the Ask Coach form redirects here mid-submission): never cached, by the
// browser or by the edge.
function isPrivate(pathname: string, request: Request): boolean {
	if (pathname.startsWith("/_emdash")) return true;
	if (pathname === "/admin" || pathname.startsWith("/admin/")) return true;
	if (pathname === "/login" || pathname.startsWith("/login/")) return true;
	// Astro actions POST to /_actions/*; the result page is a form roundtrip.
	if (pathname.startsWith("/_actions/")) return true;
	if (request.method === "POST") return true;
	// A session cookie means a signed-in editor. The name is EmDash's own.
	return request.headers.get("cookie")?.includes("astro-session=") ?? false;
}

function isPublicFile(pathname: string): boolean {
	// A hashed build asset or any other file under public/ (extension present).
	return /\.[a-z0-9]{2,5}$/i.test(pathname);
}

/**
 * Turn the path of a public request into the headers Cloudflare's zone cache
 * reads.
 *
 * The tags are the groups of src/lib/cache-tags.ts: the collection a page
 * shows, the chrome and "all". The purge plugin (plugins/cloudflare-purge)
 * purges the same names when content changes, so a publish drops exactly the
 * pages it should and the rest of the cache stays warm.
 */
function applyCacheHeaders(context: { url: URL; request: Request }, response: Response): Response {
	const { pathname } = context.url;

	if (pathname.startsWith("/_emdash/api/media/file")) {
		// A missing file must not stick around for a year.
		if (response.status === 200) {
			response.headers.set("Cache-Control", `public, max-age=${MEDIA_MAX_AGE}, immutable`);
		} else {
			response.headers.set("Cache-Control", "no-store");
		}
		response.headers.delete("Cache-Tag");
		return response;
	}

	// Build assets are hashed; serve them forever. Everything else in public/
	// keeps its name, so seven days.
	if (isPublicFile(pathname)) {
		const immutable = pathname.startsWith("/_astro/") ? ", immutable" : "";
		response.headers.set(
			"Cache-Control",
			`public, max-age=${pathname.startsWith("/_astro/") ? BUILD_ASSET_MAX_AGE : PUBLIC_ASSET_MAX_AGE}${immutable}`,
		);
		response.headers.delete("Cache-Tag");
		return response;
	}

	if (isPrivate(pathname, context.request)) {
		response.headers.set("Cache-Control", "private, no-store");
		response.headers.delete("Cache-Tag");
		return response;
	}

	const tags = tagsForPath(pathname);
	if (tags.length === 0) {
		response.headers.set("Cache-Control", "private, no-store");
		response.headers.delete("Cache-Tag");
		return response;
	}
	// No space after the comma: Cloudflare's cache tags may not contain
	// spaces, and it strips them anyway.
	response.headers.set("Cache-Tag", tags.join(","));

	if (response.status === 200) {
		response.headers.set(
			"Cache-Control",
			`public, max-age=${BROWSER_MAX_AGE}, s-maxage=${EDGE_MAX_AGE}`,
		);
	} else if (response.status === 404) {
		response.headers.set("Cache-Control", `public, max-age=${NOT_FOUND_MAX_AGE}, s-maxage=${NOT_FOUND_MAX_AGE}`);
	} else {
		// A redirect is handled above; anything else (500, 503) must not stick.
		response.headers.set("Cache-Control", "no-store");
		response.headers.delete("Cache-Tag");
	}
	return response;
}

export const onRequest = defineMiddleware(async (context, next) => {
	if (context.url.search && !KEEP_QUERY.test(context.url.pathname)) {
		const target = new URL(context.url.pathname, context.url);
		return new Response(null, {
			status: 301,
			headers: { Location: target.href, "Cache-Control": "public, max-age=86400" },
		});
	}

	const response = await next();
	return applyCacheHeaders(context, response);
});
