// Phase 1.2 gap-fill — parse the ALREADY-DUMPED HTML in discovery/raw/html/ to complete
// discovery/content/: resource cta/badge/videoUrl, hero banner slides (D15: static content,
// not a collection), carousel data-settings per grid, and the Ask Coach form schema.
// Offline: makes no network requests. Usage: node scripts/reference/extract-offline.mjs
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const htmlDir = join(root, "discovery/raw/html");
const out = join(root, "discovery/content");
const read = (p) => readFileSync(join(root, p), "utf8");
const readHtml = (name) => readFileSync(join(htmlDir, name), "utf8");
const decode = (s) => s.replaceAll("&quot;", '"').replaceAll("&#038;", "&").replaceAll("&#8217;", "'").replaceAll("&#8211;", "–").replaceAll("&amp;", "&").replaceAll("&#039;", "'");

const stripTags = (s) => decode(s).replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
const SELF_LINK = /ruthsmarriage\.com\/(resource|service)\//i;
// all elementor-button anchors in a chunk; external = not the card's own page link
const buttonsIn = (chunk) =>
  [...chunk.matchAll(/class="elementor-button[^"]*"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)]
    .map((m) => ({ text: stripTags(m[2]), href: decode(m[1]) }));
const externalButtons = (chunk) =>
  buttonsIn(chunk).filter((b) => /^https?:/.test(b.href) && !SELF_LINK.test(b.href));
const gridItems = (html) => {
  // split a listing grid's HTML into per-item chunks; items render in DOM (= query) order
  const idx = [...html.matchAll(/class="jet-listing-grid__item[^"]*"\s+data-post-id="(\d+)"/g)];
  return idx.map((m, i) => ({
    postId: Number(m[1]),
    chunk: html.slice(m.index, idx[i + 1]?.index ?? m.index + 20000),
  }));
};
const slugFromChunk = (chunk) =>
  (/"(https?:\/\/www\.ruthsmarriage\.com\/(?:service|resource)\/([^/"]+)\/)"/.exec(chunk) || [])[2] || null;
const videoFromChunk = (chunk) => {
  const m = /"youtube_url":"([^"]+)"/.exec(decode(chunk)) || /(?:https?:\/\/)?(?:www\.)?(youtube\.com\/[^"&<\\]+|youtu\.be\/[^"&<\\]+)/.exec(chunk);
  const v = m?.[1]?.replace(/\\\//g, "/");
  return v || null;
};
// ---------------------------------------------------------------- resources gap-fill
const resources = JSON.parse(read("discovery/content/resources.json"));
for (const r of resources) delete r.ctaSource; // reset fields that a previous buggy run may have polluted
for (const r of resources) { r.ctaUrl = null; r.ctaLabel = null; r.badgeLabel = null; r.videoUrl = null; }
const singleButtons = {};
for (const r of resources) {
  const h = readHtml(`resource__${r.slug}.html`);
  // buttons in the page content area (after the main wp-page container start)
  const bodyStart = h.indexOf('data-elementor-type="wp-page"') > -1 ? h.indexOf('data-elementor-type="wp-page"') : 0;
  singleButtons[r.slug] = buttonsIn(h.slice(bodyStart)).filter((b) => /^https?:/.test(b.href) && !SELF_LINK.test(b.href) && !/askcoach|wp-admin/i.test(b.href));
}
// listing grids across the archive pages: per-slug/per-postId badge/cta/video
const idToSlug = {};
for (const r of [...JSON.parse(read("discovery/raw/json/resource.json")), ...JSON.parse(read("discovery/raw/json/service.json"))]) idToSlug[r.id] = r.slug;
const gridBySlug = {}, gridById = {};
for (const page of ["home", "resources", "books", "videos", "inspired-features", "singles", "married", "services"]) {
  let h; try { h = readHtml(`${page}.html`); } catch { continue; }
  for (const gridHtml of h.split(/class="jet-listing-grid\b/).slice(1)) {
    const listingId = /data-listing-id="(\d+)"/.exec(gridHtml)?.[1]; // whole segment: the attr sits after a long data-nav blob
    for (const { postId, chunk } of gridItems("class=\"jet-listing-grid__item" + gridHtml)) {
      const slug = slugFromChunk(chunk) || idToSlug[postId];
      const found = { listingId, postId, video: videoFromChunk(chunk), buttons: externalButtons(chunk) };
      if (!(found.buttons.length || found.video)) continue;
      (gridBySlug[slug] ||= []).push(found);
      (gridById[postId] ||= []).push(found);
    }
  }
}
for (const r of resources) {
  const pid = Number(Object.keys(idToSlug).find((k) => idToSlug[k] === r.slug));
  const cards = [...(gridBySlug[r.slug] || []), ...(gridById[pid] || [])];
  const cardButtons = cards.flatMap((c) => c.buttons);
  // badge = the pill rendered on the listing card (its button); CTA = the single page's button, else the card's
  r.badgeLabel = cardButtons[0]?.text || null;
  const single = singleButtons[r.slug] || [];
  const cta = single.find((b) => /learn more/i.test(b.text)) || single[0] || cardButtons.find((b) => /learn more|buy|download|join|get|visit|watch/i.test(b.text)) || cardButtons[0] || null;
  if (cta) { r.ctaUrl = cta.href; r.ctaLabel = cta.text; }
  r.videoUrl = cards.map((c) => c.video).find(Boolean) || null;
}
writeFileSync(join(out, "resources.json"), JSON.stringify(resources, null, 1));
console.log("resources: " + resources.map((r) => `${r.slug} cta=${r.ctaUrl ? "y" : "MISSING"} badge=${r.badgeLabel ? "y" : "-"} video=${r.videoUrl ? "y" : "-"}`).join("\n  "));

// ---------------------------------------------------------------- hero slides (banners, D15) + carousel settings
const home = readHtml("home.html");
const heroIdx = home.indexOf("jet-listing-grid--100");
if (heroIdx < 0) throw new Error("hero grid 100 not found in home.html");
if (!/About Us/i.test(home.slice(heroIdx, heroIdx + 60000))) throw new Error("grid 100 does not contain the 'About Us' hero button — re-identify the hero grid");
const heroChunks = gridItems(home.slice(heroIdx)).slice(0, 3);
const slides = heroChunks.map(({ postId, chunk }) => {
  const b = /class="elementor-button[^"]*"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/.exec(chunk);
  return {
    postId,
    heading: stripTags(/<(h[1-3])[^>]*>([\s\S]*?)<\/\1>/.exec(chunk)?.[2] || ""),
    sub: stripTags(/<p[^>]*>([\s\S]*?)<\/p>/.exec(chunk)?.[1] || ""),
    button: b ? { text: stripTags(b[2]), href: decode(b[1]) } : null,
    image: /<img[^>]+src="([^"]+)"/.exec(chunk)?.[1] || (/background-image:url\("([^"]+)"\)/.exec(chunk) || [])[1] || null,
  };
});
const carousels = {};
for (const gridHtml of home.split(/class="jet-listing-grid\b/).slice(1)) {
  const segment = "class=\"jet-listing-grid" + gridHtml;
  const listingId = /data-listing-id="(\d+)"/.exec(segment)?.[1];
  if (!listingId) continue;
  const settings = {};
  for (const raw of [...segment.matchAll(/data-(?:slider_options|settings|nav)="([^"]{0,8000}?)"/g)].map((m) => decode(m[1]))) {
    try { const j = JSON.parse(raw); Object.assign(settings, j.carousel || j, j.slider_options || {}); } catch { /* truncated — skip */ }
  }
  carousels[listingId] = { items: gridItems("class=\"jet-listing-grid__item" + gridHtml).length, settings };
}
writeFileSync(join(out, "banners.json"), JSON.stringify({
  note: "D15: feeds the STATIC hero component; no banner content type. slides = hero grid DOM order.",
  gridId: "100", slides,
  restBanners: JSON.parse(read("discovery/raw/json/banner.json")).map((b) => ({ id: b.id, title: b.title?.rendered, link: b.link, image: b._embedded?.["wp:featuredmedia"]?.[0]?.source_url || null })),
}, null, 1));
writeFileSync(join(out, "carousels.json"), JSON.stringify(carousels, null, 1));
console.log(`hero slides: ${slides.length} (${slides.map((s) => s.heading?.slice(0, 40)).join(" / ")})`);
console.log("carousels: " + Object.entries(carousels).map(([id, c]) => `${id}:${c.items}`).join(" "));

// ---------------------------------------------------------------- askcoach form schema
const ask = readHtml("askcoach.html");
const formHtml = ask.match(/<form[\s\S]*?<\/form>/)?.[0] || null;
if (formHtml) {
  const fields = [...formHtml.matchAll(/<input[^>]*>/g)].map((m) => Object.fromEntries([...m[0].matchAll(/(\w+)="([^"]*)"/g)].map((a) => [a[1], decode(a[2])])));
  const select = /<select[^>]*name="([^"]*)"[\s\S]*?<\/select>/.exec(formHtml);
  const options = [...(select?.[0] || "").matchAll(/<option[^>]*value="([^"]*)"[^>]*>([^<]*)<\/option>/g)].map((m) => ({ value: decode(m[1]), label: stripTags(m[2]) }));
  const textarea = /<textarea[^>]*name="([^"]*)"/.exec(formHtml);
  const submit = /<button[^>]*type="submit"[^>]*>([\s\S]*?)<\/button>|type="submit"[^>]*value="([^"]*)"/.exec(formHtml);
  mkdirSync(join(out, "forms"), { recursive: true });
  writeFileSync(join(out, "forms", "askcoach.json"), JSON.stringify({
    action: /<form[^>]*action="([^"]*)"/.exec(formHtml)?.[1] || null,
    selectField: select?.[1], selectOptions: options,
    textareaField: textarea?.[1] || null,
    submitLabel: submit ? stripTags(submit[1] || submit[2] || "") : null,
    hiddenFields: fields.filter((f) => f.type === "hidden").map((f) => ({ name: f.name, value: f.value })),
    rawFormHtml: formHtml.slice(0, 12000),
  }, null, 1));
  console.log(`askcoach form: select(${options.length} options), textarea=${textarea?.[1]}, submit="${submit ? stripTags(submit[1] || submit[2] || "") : "?"}"`);
}

// ---------------------------------------------------------------- site.json archive.org replacement log
const allPages = readHtml("contact.html"); // spot check + collect global log from page JSONs already
console.log("offline gap-fill done");
