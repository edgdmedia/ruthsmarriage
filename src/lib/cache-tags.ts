/**
 * The cache groups a public page belongs to.
 *
 * Cloudflare's zone cache, in front of the origin, stores a page under the
 * tags in its `Cache-Tag` response header. The purge plugin
 * (plugins/cloudflare-purge) asks Cloudflare to drop a group when content
 * changes, so the two have to agree on the names — they are the same names
 * EmDash invalidates in its own cache after a write: the collection name.
 *
 * The groups are:
 *
 *  - the collection tags — `posts`, `services`, `resources`,
 *    `testimonials`, `marquee_items`. A publish purges the collection, which
 *    drops every page that renders it: the home page, the archive pages, the
 *    taxonomies and the entry itself. Purging "posts" also drops the home
 *    page and the sidebar on post pages, which is deliberate — a re-render
 *    on the VPS costs no quota — and it keeps the purge simple.
 *  - the chrome tags — `menus`, `settings` and the taxonomies. The header and
 *    footer appear on every page, so every public page carries them. They
 *    change rarely (a menu is edited in the admin), so they are only here so
 *    a manual purge by tag can find them.
 *  - `all` — every public page. The emergency switch: a purge by this tag
 *    empties the whole cache. EmDash never purges it by itself.
 *
 * The tags are per path, not per query: Astro's route cache is not used on
 * this deployment (see the note in astro.config.mjs), so the middleware works
 * out the groups from the path it is serving.
 *
 * A note on posts: they are served at /<slug>/ (WordPress-style single-segment
 * URLs), the same shape as the static pages (/about, /contact). There is no
 * way to tell them apart from the path alone, so every single-segment page is
 * tagged "posts". A post publish purges the static pages too — a harmless
 * extra re-render — and it guarantees the new post's own URL is dropped.
 */

/** The chrome: menus, settings and the taxonomies. Every page carries these. */
export const CHROME_TAGS = [
	"menus",
	"settings",
	"marquee_items", // rendered in the header on every page: a marquee publish purges the whole site
	"emdash:taxonomy:category",
	"emdash:taxonomy:tag",
	"emdash:taxonomy:service_type",
	"emdash:taxonomy:resource_type",
];

/** Every public page. The emergency switch. */
export const ALL_TAG = "all";

const CATEGORY_PATH = /^\/category\/[^/]+(\/page\/\d+)?\/?$/;
const TAG_PATH = /^\/tag\/[^/]+(\/page\/\d+)?\/?$/;
const SERVICE_TYPE_PATH = /^\/service-type\/[^/]+(\/page\/\d+)?\/?$/;
const RESOURCE_TYPE_PATH = /^\/resource-type\/[^/]+(\/page\/\d+)?\/?$/;
const SEARCH_PAGE = /^\/search(\/page\/\d+)?\/?$/;

/** A path with a file extension is a file, not a page. */
const FILE_PATH = /\.[a-z0-9]{2,5}$/i;

/** The admin, its API and the login page: never cached. */
const PRIVATE_PATH = /^\/(_emdash|admin|login)(\/|$)/;

/**
 * The collections a public path shows.
 *
 * Empty for a path that is not a public page (the admin, the API, a file) —
 * those are never cached.
 */
export function collectionsForPath(pathname: string): string[] {
	if (PRIVATE_PATH.test(pathname)) return [];
	if (FILE_PATH.test(pathname)) return [];
	// Normalise so the trailing slash never matters.
	const path = pathname.endsWith("/") ? pathname : `${pathname}/`;

	// The home page renders all four slider collections.
	if (path === "/") return ["posts", "services", "resources", "testimonials"];
	if (SEARCH_PAGE.test(path)) return ["posts", "services", "resources"];

	// Pages that render the "services" collection.
	if (
		path === "/services/" ||
		path === "/singles/" ||
		path === "/married/" ||
		path === "/service-type/" ||
		SERVICE_TYPE_PATH.test(path) ||
		/^\/service\/[^/]+\/?$/.test(path)
	) {
		return ["services"];
	}

	// Pages that render the "resources" collection.
	if (
		path === "/resources/" ||
		path === "/books/" ||
		path === "/videos/" ||
		path === "/resource-type/" ||
		RESOURCE_TYPE_PATH.test(path) ||
		/^\/resource\/[^/]+\/?$/.test(path)
	) {
		return ["resources"];
	}

	// Pages that render the "posts" collection.
	if (path === "/posts/" || path === "/inspired-features/") return ["posts"];
	if (CATEGORY_PATH.test(path) || TAG_PATH.test(path)) return ["posts"];

	// A single-segment page: a blog post /<slug>/ or a static page (/about,
	// /contact …). Both carry "posts" (see the note above). /404/ is served
	// as a public page too, so it falls through here and stays cacheable.
	if (/^\/[^/]+\/?$/.test(path)) return ["posts"];
	return [];
}

/**
 * The full tag list for a public path: the collections it shows, the chrome
 * and "all".
 */
export function tagsForPath(pathname: string): string[] {
	const collections = collectionsForPath(pathname);
	if (collections.length === 0) return [];
	return [...collections, ...CHROME_TAGS, ALL_TAG];
}
