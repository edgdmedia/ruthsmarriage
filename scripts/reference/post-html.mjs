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
