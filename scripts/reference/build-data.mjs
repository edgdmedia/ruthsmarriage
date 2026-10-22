// Phase 5 — export the WordPress-derived seed into plain JSON files under src/data/.
//
// The site is now a plain Astro app: every collection is a JSON file, every image a
// local file under public/assets/. Re-runnable — it overwrites src/data/*.json and
// copies only the media that the content actually references.
//
// Usage: node scripts/reference/build-data.mjs
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const seed = JSON.parse(readFileSync(join(root, "seed/seed.json"), "utf8"));
const dataDir = join(root, "src/data");
const mediaSrc = join(root, "discovery/media");
const mediaOut = join(root, "public/assets/media");

// ---------------------------------------------------------------- media resolution
const copied = new Map();

/** Map a remote wp-content URL to a local `/assets/media/...` path, copying the file. */
function resolveMedia(url, alt = "") {
	if (typeof url !== "string" || !url) return null;
	if (copied.has(url)) return { ...copied.get(url), alt: alt || copied.get(url).alt };

	let rel = url.split("/wp-content/uploads/")[1];
	if (!rel) {
		// Already-local asset (e.g. /assets/hero/runway.jpg) — use as-is.
		return { src: url, alt };
	}
	rel = rel.split("?")[0].split("#")[0];

	// Prefer the exact file; fall back to the unsized original (WordPress size suffix).
	// `public/assets/media` holds the previously copied files, so the script still works
	// on a fresh clone where `discovery/media` is git-ignored.
	const candidates = [rel, rel.replace(/-\d+x\d+(?=\.\w+$)/, "")];
	let found = null;
	for (const c of candidates) {
		for (const base of [mediaSrc, mediaOut]) {
			const p = join(base, c);
			if (existsSync(p)) {
				found = { rel: c, path: p };
				break;
			}
		}
		if (found) break;
	}
	if (!found) {
		console.warn(`  ! media not found locally, keeping remote URL: ${url}`);
		return { src: url, alt };
	}

	const dest = join(mediaOut, found.rel);
	mkdirSync(dirname(dest), { recursive: true });
	if (found.path !== dest) copyFileSync(found.path, dest);

	const entry = { src: `/assets/media/${found.rel}`, alt };
	copied.set(url, entry);
	return { src: entry.src, alt: alt || entry.alt };
}

/** Walk an object and replace every {$media:{url,alt}} with {src,alt}. */
function mapMedia(value) {
	if (Array.isArray(value)) return value.map(mapMedia);
	if (value && typeof value === "object") {
		if (value.$media) return resolveMedia(value.$media.url, value.$media.alt);
		const out = {};
		for (const [k, v] of Object.entries(value)) out[k] = mapMedia(v);
		return out;
	}
	return value;
}

// ---------------------------------------------------------------- entry helpers
const termsByTaxonomy = Object.fromEntries(
	(seed.taxonomies || []).map((t) => [
		t.name,
		Object.fromEntries((t.terms || []).map((term) => [term.slug, term.label])),
	]),
);

function expandTerms(entry) {
	const out = {};
	for (const [taxonomy, slugs] of Object.entries(entry.taxonomies || {})) {
		out[taxonomy] = slugs.map((slug) => ({
			slug,
			label: termsByTaxonomy[taxonomy]?.[slug] ?? slug,
		}));
	}
	return out;
}

function toEntry(entry, { withTerms = true } = {}) {
	const data = mapMedia(entry.data);
	const out = {
		id: entry.id,
		slug: entry.slug,
		status: entry.status ?? "published",
		...(entry.order != null ? { order: entry.order } : {}),
		...(entry.published_at ? { publishedAt: entry.published_at } : {}),
		...data,
	};
	if (withTerms) out.terms = expandTerms(entry);
	return out;
}

const content = seed.content || {};
const collections = {};
for (const [name, items] of Object.entries(content)) {
	collections[name] = items.map((e) => toEntry(e));
}

// ---------------------------------------------------------------- banners (hero)
const banners = [
	{
		layout: "portrait",
		title: "Ruth’s Marriage",
		subtitle: "At Ruth’s Marriage, we believe you too can enjoy your marriage!",
		buttonLabel: "About Us",
		buttonUrl: "/about/",
		image: "/assets/hero/runway.jpg",
		mobileImage: "/assets/hero/dsc08266-mobile.jpg",
	},
	{
		layout: "overlay",
		title: "Support and Counsel",
		subtitle:
			"We are here to provide you with the support and counsel that you need to transform your marriage positively",
		buttonLabel: "Services",
		buttonUrl: "/services/",
		image: "/assets/hero/shkraba.jpg",
	},
	{
		layout: "overlay",
		title: "Resources and Tools",
		subtitle:
			"We believe most marriage problems can be solved with the right resources and tools",
		buttonLabel: "Resources",
		buttonUrl: "/resources/",
		image: "/assets/hero/couple-holding-hands.jpeg",
	},
];

// ---------------------------------------------------------------- settings
const settings = mapMedia(seed.settings);
if (settings.logo) settings.logo = { src: settings.logo.src, alt: settings.logo.alt };

// ---------------------------------------------------------------- write
mkdirSync(dataDir, { recursive: true });
const write = (file, value) =>
	writeFileSync(join(dataDir, file), JSON.stringify(value, null, "\t") + "\n");

write("settings.json", settings);
write("menus.json", seed.menus || []);
write("marquee.json", (collections.marquee_items || []).map((m) => ({ text: m.text, link: m.link })));
write("banners.json", banners);
write("services.json", collections.services || []);
write("resources.json", collections.resources || []);
write("testimonials.json", collections.testimonials || []);
write("posts.json", collections.posts || []);
write(
	"taxonomies.json",
	(seed.taxonomies || []).map((t) => ({
		name: t.name,
		label: t.label,
		labelSingular: t.labelSingular,
		terms: t.terms || [],
	})),
);

console.log(`data written to src/data/`);
console.log(`media copied to public/assets/media/ (${copied.size} files)`);
