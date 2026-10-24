// Replaces each post's `content` in src/data/posts.json with its full cleaned body
// from the Phase 1 dump (build-seed used to keep only 600 chars of plain text).
// Touches nothing else in the file. Usage: node scripts/reference/fill-post-content.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { cleanPostHtml } from "./post-html.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const raw = JSON.parse(readFileSync(join(root, "discovery/content/posts.json"), "utf8"));
const bodies = new Map(raw.map((p) => [p.slug, p.content]));
const file = join(root, "src/data/posts.json");
const posts = JSON.parse(readFileSync(file, "utf8"));

let filled = 0;
for (const post of posts) {
	const html = bodies.get(post.slug);
	if (!html) continue;
	post.content = [{ _type: "html", html: cleanPostHtml(html, root) }];
	filled++;
}
writeFileSync(file, JSON.stringify(posts, null, "\t") + "\n");
console.log(`filled ${filled}/${posts.length} posts`);
