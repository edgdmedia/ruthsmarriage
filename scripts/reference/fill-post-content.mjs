// Replaces each post's `content` in src/data/posts.json with its full cleaned body
// from the Phase 1 dump (build-seed used to keep only 600 chars of plain text).
// Touches nothing else in the file. Usage: node scripts/reference/fill-post-content.mjs
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { cleanPostHtml, fixInternalLinks, sitePaths } from "./post-html.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const raw = JSON.parse(readFileSync(join(root, "discovery/content/posts.json"), "utf8"));
const bodies = new Map(raw.map((p) => [p.slug, p.content]));
const file = join(root, "src/data/posts.json");
const posts = JSON.parse(readFileSync(file, "utf8"));
const slugs = (name) => JSON.parse(readFileSync(join(root, `src/data/${name}.json`), "utf8")).map((e) => e.slug);
const pages = readdirSync(join(root, "src/pages"), { withFileTypes: true })
	.filter((d) => d.isDirectory() && !d.name.startsWith("[")).map((d) => d.name);
const valid = sitePaths({ posts: posts.map((p) => p.slug), resources: slugs("resources"), services: slugs("services"), pages });

let filled = 0;
for (const post of posts) {
	const html = bodies.get(post.slug);
	if (!html) continue;
	post.content = [{ _type: "html", html: fixInternalLinks(cleanPostHtml(html, root), valid) }];
	filled++;
}
writeFileSync(file, JSON.stringify(posts, null, "\t") + "\n");
console.log(`filled ${filled}/${posts.length} posts`);
