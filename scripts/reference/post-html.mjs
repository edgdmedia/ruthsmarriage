// Cleans a WordPress post body (discovery/content/posts.json `content`) into the
// HTML stored as a post's `{ _type: "html" }` content block.
// - unwraps <span> (WP's `font-weight: 400` noise) and drops loading hints
// - rewrites web.archive.org links to the original URL; own-site links become paths
// - points /wp-content/uploads/ images at the local copy in public/assets/media/
// Classes are kept: live's block styles (centred quotes, pull-quotes, inline colours) use them.
import { existsSync } from "node:fs";
import { join } from "node:path";

const ARCHIVE = /https?:\/\/web\.archive\.org\/web\/\d+(?:im_)?\//g;
const OWN_SITE = /https?:\/\/(?:www\.)?ruthsmarriage\.com(?=\/)/g;

// "2023/11/Have-Sex-Pray-Mockup-300x300.png" → the local path, trying the
// resized file first, then the original upload.
const localUpload = (root, rel) => {
	for (const candidate of [rel, rel.replace(/-\d+x\d+(\.\w+)$/, "$1")]) {
		if (existsSync(join(root, "public/assets/media", candidate))) return `/assets/media/${candidate}`;
	}
	return null;
};

export const cleanPostHtml = (html, root) =>
	html
		.replace(ARCHIVE, "")
		.replace(OWN_SITE, "")
		.replace(/<\/?span\b[^>]*>/g, "")
		.replace(/\s(?:fetchpriority|decoding|srcset|sizes)="[^"]*"/g, "")
		// Images missing on live too (they 404 there) are dropped rather than shown broken.
		.replace(/<img\b[^>]*src="[^"]*\/wp-content\/uploads\/([^"]+)"[^>]*>/g, (tag, rel) =>
			localUpload(root, rel) ? tag : "",
		)
		.replace(/\/wp-content\/uploads\/([^"'\s)]+)/g, (match, rel) =>
			localUpload(root, rel) ?? `https://www.ruthsmarriage.com/wp-content/uploads/${rel}`,
		)
		.trim();

// Old post/resource URLs inside post bodies that live has since renamed (same
// content, longer slug). Everything else that 404s on live too is unlinked.
const RENAMED = {
	"/habits-that-will-increase-your-intimacy-in-marriage/": "/3-habits-that-will-increase-your-intimacy-in-marriage/",
	"/common-causes-of-conflicts-in-marriage/":
		"/effective-communication-and-conflict-guide-for-relationships-and-marriage-common-causes-of-conflicts-in-marriage/",
	"/how-to-rebuild-your-marriage-from-a-difficult-place/": "/how-to-rebuild-your-marriage-from-a-difficult-place-3-proven-steps/",
	"/realistic-and-unrealistic-expectations-in-relationships/": "/expectations-realistic-and-unrealistic-expectations-in-relationships/",
	"/three-things-to-let-go-in-your-marriage/": "/building-a-thriving-marriage-three-things-to-let-go-in-your-marriage/",
	"/resource/60-fun-games-and-intimate-bonding-activities-for-couples/": "/resource/60-fun-games-and-activities-for-couples/",
};

/** Repoint renamed internal links and unwrap ones that don't exist (keeps the text). */
export const fixInternalLinks = (html, validPaths) =>
	html.replace(/<a\b([^>]*)href="(\/[^"]*)"([^>]*)>([\s\S]*?)<\/a>/g, (tag, pre, href, post, text) => {
		const path = RENAMED[href] ?? href;
		if (validPaths.has(path)) return `<a${pre}href="${path}"${post}>${text}</a>`;
		return text;
	});

/** Every internal page path the site serves (for fixInternalLinks). */
export const sitePaths = ({ posts, resources, services, pages }) =>
	new Set([
		"/",
		...pages.map((p) => `/${p}/`),
		...posts.map((s) => `/${s}/`),
		...resources.map((s) => `/resource/${s}/`),
		...services.map((s) => `/service/${s}/`),
	]);
