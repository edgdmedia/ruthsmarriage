// Phase 1.1 — raw dump of the live WordPress site into discovery/raw/ (git-ignored).
//  1. REST collections (paginated, per_page=100)          -> discovery/raw/json/<type>.json
//  2. Rendered HTML of every inventory URL                 -> discovery/raw/html/<name>.html
//  3. Elementor kit CSS (the plan's list + every post-N.css found in the dumped HTML)
//                                                          -> discovery/raw/css/post-<N>.css
// Read-only. Rate limit: >=600ms between requests (~1.6 req/s). See migration-plan/phase-01-reference.md.
// Usage: node scripts/reference/dump-wp.mjs [--only json|html|css]
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const onlyArg = process.argv.find((a, i) => process.argv[i - 1] === "--only") || "";
const only = onlyArg ? onlyArg.split(",") : [];
const doIt = (k) => !only.length || only.includes(k);

const BASE = "https://www.ruthsmarriage.com";
const UA = "ruthsmarriage-migration/1.0 (reference capture; read-only)";
const outJson = join(root, "discovery/raw/json");
const outHtml = join(root, "discovery/raw/html");
const outCss = join(root, "discovery/raw/css");
for (const d of [outJson, outHtml, outCss]) mkdirSync(d, { recursive: true });

let last = 0;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function get(url) {
  const wait = 600 - (Date.now() - last);
  if (wait > 0) await sleep(wait);
  for (let attempt = 1; ; attempt++) {
    let res;
    try {
      res = await fetch(url, { headers: { "User-Agent": UA } });
    } catch (e) {
      if (attempt >= 4) throw e;
      await sleep(1500 * attempt);
      continue;
    }
    last = Date.now();
    if ((res.status === 429 || res.status >= 500) && attempt < 4) {
      await sleep(1500 * attempt);
      continue;
    }
    return res;
  }
}

// ---------- 1. REST ----------
const REST_TYPES = ["posts", "pages", "resource", "service", "banner", "testimonial", "media", "categories", "tags", "resource-type", "service-type"];
const EMBED = new Set(["posts", "pages", "resource", "service", "banner"]);
async function getJSONish(res) {
  // Some endpoints (pages with _embed) emit an Elementor <style> warning before the JSON body.
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    const start = text.indexOf("[");
    if (start < 0) throw new Error("non-JSON body: " + text.slice(0, 120));
    console.log(`  (stripped ${start} bytes of junk prefix)`);
    return JSON.parse(text.slice(start));
  }
}

async function restDump(type) {
  const items = [];
  for (let page = 1; ; page++) {
    const qs = `per_page=100&page=${page}${EMBED.has(type) ? "&_embed" : ""}`;
    let res = await get(`${BASE}/wp-json/wp/v2/${type}?${qs}`);
    if (!res.ok && EMBED.has(type) && res.status === 400) {
      // some CPTs reject _embed; the plan already knew testimonial is awkward
      res = await get(`${BASE}/wp-json/wp/v2/${type}?per_page=100&page=${page}`);
    }
    if (!res.ok) throw new Error(`${type} p${page}: HTTP ${res.status}`);
    items.push(...(await getJSONish(res)));
    const totalPages = Number(res.headers.get("x-wp-totalpages") || 1);
    if (page >= totalPages) break;
  }
  writeFileSync(join(outJson, `${type}.json`), JSON.stringify(items));
  console.log(`json ${type}: ${items.length}`);
  return items;
}
if (doIt("json")) for (const t of REST_TYPES) await restDump(t);

// ---------- 2. HTML ----------
// Static inventory mirrors capture.mjs's PAGES (kept in sync manually; capture.mjs re-runs are independent).
const PAGES = {
  home: "/", about: "/about/", "our-story": "/our-story/", founder: "/founder/",
  singles: "/singles/", married: "/married/", services: "/services/", resources: "/resources/",
  books: "/books/", videos: "/videos/", freebies: "/freebies/", "inspired-features": "/inspired-features/",
  sponsored: "/sponsored/", announcements: "/announcements/", event: "/event/", askcoach: "/askcoach/",
  contact: "/contact/", "cancellation-policy": "/cancellation-policy/",
  "confidentiality-policy": "/confidentiality-policy/", "privacy-policy": "/privacy-policy/",
  "service-type-married": "/service-type/married/", "service-type-singles": "/service-type/singles/",
  "resource-type-resource": "/resource-type/resource/", "resource-type-book": "/resource-type/book/",
  "resource-type-video": "/resource-type/video/",
  category: "/category/marriage/", tag: "/tag/instagram/", search: "/?s=marriage",
  "404": "/this-page-does-not-exist-xyz/",
};
const read = (t) => JSON.parse(readFileSync(join(outJson, `${t}.json`), "utf8"));
const allServiceSlugs = await read("service").map((s) => s.slug).filter((s) => !/^auto-draft/.test(s));
const allResourceSlugs = await read("resource").map((s) => s.slug).filter((s) => !/^auto-draft/.test(s));
const allPostSlugs = await read("posts").map((s) => s.slug).filter((s) => !/^auto-draft/.test(s));
const allTagSlugs = await read("tags").map((t) => t.slug);

const htmlTargets = { ...PAGES };
for (const s of allServiceSlugs) htmlTargets[`service__${s}`] = `/service/${s}/`;
for (const s of allResourceSlugs) htmlTargets[`resource__${s}`] = `/resource/${s}/`;
for (const s of allPostSlugs.slice(0, 1)) htmlTargets[`post__${s}`] = `/${s}/`; // plan: one post; Phase 10 covers the rest
for (const s of allTagSlugs) htmlTargets[`tag__${s}`] = `/tag/${s}/`;

if (doIt("html")) {
  for (const [name, path] of Object.entries(htmlTargets)) {
    const file = join(outHtml, `${name.replace(/[^a-z0-9_-]/gi, "_")}.html`);
    if (existsSync(file)) { console.log(`html ${name}: cached`); continue; }
    const res = await get(BASE + path);
    if (!res.ok && !(path === PAGES["404"] && res.status === 404)) { console.log(`FAIL html ${name}: ${res.status} ${path}`); continue; }
    writeFileSync(file, await res.text());
    console.log(`html ${name}: ${res.status}`);
  }
}

// ---------- 3. Elementor CSS ----------
const cssIds = new Set([6, 23, 63, 329, 100, 116, 159, 462, 468, 225, 239, 143, 590, 377, 394, 153, 149, 301, 305, 724, 728, 187]);
if (doIt("css")) {
  for (const f of readdirSync(outHtml)) {
    const html = readFileSync(join(outHtml, f), "utf8");
    for (const m of html.matchAll(/elementor\/css\/post-(\d+)\.css/g)) cssIds.add(Number(m[1]));
  }
  for (const id of [...cssIds].sort((a, b) => a - b)) {
    const file = join(outCss, `post-${id}.css`);
    if (existsSync(file)) continue;
    const res = await get(`${BASE}/wp-content/uploads/elementor/css/post-${id}.css`);
    if (!res.ok) { console.log(`FAIL css post-${id}: ${res.status}`); continue; }
    writeFileSync(file, await res.text());
    console.log(`css post-${id}`);
  }
}
console.log("dump done");
