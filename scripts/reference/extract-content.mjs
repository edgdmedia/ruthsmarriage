// Phase 1.2 — extract normalised content JSON into discovery/content/ for the Phase 3 seed.
// Reads the live DOM via agent-browser (one visit per URL) plus the REST dumps in discovery/raw/json/.
// Read-only. Usage: node scripts/reference/extract-content.mjs [slug1 slug2 ...]
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const raw = join(root, "discovery/raw");
const out = join(root, "discovery/content");
mkdirSync(join(out, "pages"), { recursive: true });

const BASE = "https://www.ruthsmarriage.com";
const S = ["--session", "content"];
const only = process.argv.slice(2);
const ab = (...a) => execFileSync("agent-browser", [...S, ...a], { encoding: "utf8", maxBuffer: 128 * 1024 * 1024 });
function evl(code) {
  let r = execFileSync("agent-browser", [...S, "eval", "--stdin"], { input: code, encoding: "utf8", maxBuffer: 128 * 1024 * 1024 }).trim();
  if (r.startsWith('"')) r = JSON.parse(r);
  return JSON.parse(r);
}
const readJson = (t) => JSON.parse(readFileSync(join(raw, `json/${t}.json`), "utf8"));

// ---------------------------------------------------------------- browser-side helpers (injected into eval)
const HELPERS = `
const $  = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => [...(r || document).querySelectorAll(s)];
const txt = (s, r) => $(s, r)?.innerText?.trim() || null;
const pageRoot = () => $$('.elementor[data-elementor-type]').find(e => ['wp-page','wp-post'].includes(e.getAttribute('data-elementor-type'))) || $('main') || document.body;
const slugOf = (href) => { try { return decodeURIComponent(new URL(href).pathname).replace(/^\\/|^\\//, '').replace(/\\/+$/, ''); } catch { return null; } };
// Unwrap web.archive.org links (audit known-issue 1). Collect replacements in window.__repl.
const cleanHref = (a) => {
  if (!a) return a;
  const m = a.match(/^https?:\\/\\/web\\.archive\\.org\\/web\\/[0-9]+[a-z_]*\\/(.+)$/);
  if (m) { (window.__repl ||= []).push({ from: a, to: m[1] }); return m[1]; }
  return a;
};
`;

// Generic page → ordered sections with widget content (for pages/<slug>.json + site.json).
const EX_PAGE = `(() => {
  ${HELPERS}
  window.__repl = [];
  const root = pageRoot();
  const widget = (w) => {
    const type = (w.getAttribute('data-widget_type') || '').replace('.default', '') || (w.closest('.e-off-canvas') ? 'off-canvas' : 'container');
    const o = { type };
    const h = $('h1,h2,h3,h4,h5,h6', w); if (h) o.heading = { tag: h.tagName.toLowerCase(), text: h.innerText.trim() };
    const b = $('a.elementor-button, .elementor-button a', w);
    if (b) o.button = { text: b.innerText.trim(), href: cleanHref(b.href) };
    const img = w.matches('img') ? w : $('img', w); if (img) o.image = { src: img.src, alt: img.alt };
    const ifr = $('iframe', w); if (ifr) o.iframe = ifr.src;
    const as = $$('a[href]', w); if (as.length) o.links = as.map(a => ({ text: a.innerText.trim().slice(0, 140), href: cleanHref(a.href) }));
    const ic = $$('i[class*="fa-"]', w); if (ic.length) o.icons = [...new Set(ic.map(i => i.className.toString().trim()))];
    if (type === 'text-editor') { const c = $('.elementor-widget-container', w); if (c) o.html = c.innerHTML; }
    return o;
  };
  const sections = [...root.children].map((s, i) => ({ i, widgets: $$('[data-widget_type]', s).map(widget) }));
  const nav = $('header .elementor-nav-menu--main > ul, header nav ul');
  const menu = nav ? [...nav.children].map(li => ({
    text: $(':scope > a', li)?.innerText.trim(), href: cleanHref($(':scope > a', li)?.href),
    children: $$(':scope > .sub-menu > li', li).map(sli => ({ text: $('a', sli)?.innerText.trim(), href: cleanHref($('a', sli)?.href) })),
  })) : [];
  const marquee = $('.e-marquee, [class*="marquee"]');
  const footerEl = $$('footer .elementor, footer').pop();
  const socials = $$('footer a[href*="facebook"], footer a[href*="twitter"], footer a[href*="instagram"], footer a[href*="youtube"], footer a[href*="threads"], footer a[href*="mailto"], header a[href*="mailto"]', document).map(a => ({ text: a.innerText.trim() || a.className.toString().slice(0, 40), href: cleanHref(a.href) }));
  return JSON.stringify({
    url: location.href, title: document.title,
    site: {
      menu,
      marquee: marquee ? { text: marquee.innerText.trim(), links: $$('a', marquee).map(a => ({ text: a.innerText.trim(), href: cleanHref(a.href) })) } : null,
      footer: footerEl ? {
        headings: $$('h2,h3,h4,.elementor-heading-title', footerEl).map(e => e.innerText.trim()),
        links: $$('a[href]', footerEl).map(a => ({ text: a.innerText.trim(), href: cleanHref(a.href) })),
        text: footerEl.innerText.trim(),
      } : null,
      socials,
      logo: ($('header img') || {}).src || null,
    },
    sections,
    replacements: window.__repl,
  });
})()`;

// Homepage extras: hero slides + testimonial cards (slick clones de-duped).
const EX_HOME = `(() => {
  ${HELPERS}
  const hero = $$('[data-widget_type="text-editor"].elementor-widget, .jet-listing-grid__item', pageRoot());
  const slides = $$('.slick-slide:not(.slick-cloned), .swiper-slide:not(.swiper-slide-duplicate)').map(s => {
    const b = $('a.elementor-button, a', s);
    return {
      heading: $('h1,h2,h3', s)?.innerText.trim() || null,
      sub: $$('h4,h5,h6,p', s).map(e => e.innerText.trim()).filter(Boolean)[0] || null,
      button: b ? { text: b.innerText.trim(), href: cleanHref(b.href) } : null,
      image: (s.matches('img') ? s : $('img', s))?.src || (s.style.backgroundImage || '').replace(/^url\\(["']?|["']?\\)$/g, '') || null,
    };
  });
  const grids = {};
  $$('[data-listing-id]').forEach(g => {
    const id = g.getAttribute('data-listing-id');
    (grids[id] ||= []).push(...$$('.jet-listing-grid__item:not(.slick-cloned)', g).map(el => ({
      postId: el.getAttribute('data-post-id'),
      slug: slugOf(el.querySelector('[data-url]')?.getAttribute('data-url') || $('a', el)?.href || ''),
      text: el.innerText.trim().slice(0, 600),
      bg: getComputedStyle(el.querySelector('.e-con, .elementor') || el).backgroundColor,
      badge: $$('span, .elementor-heading-title', el).map(e => e.innerText.trim()).filter(t => t && t.length < 60)[0] || null,
      button: (() => { const b = $('a.elementor-button, a', el); return b ? { text: b.innerText.trim(), href: cleanHref(b.href) } : null; })(),
      image: $('img', el)?.src || null,
    })));
  });
  return JSON.stringify({ slides, grids });
})()`;

// Single service/resource: template fields + booking off-canvas.
const EX_SINGLE = `(() => {
  ${HELPERS}
  const root = pageRoot();
  const book = $('.e-off-canvas [data-url], .e-off-canvas .book-button');
  const learn = [...$$('a.elementor-button', root)].find(a => /learn more|read more|buy|get|download|visit|watch/i.test(a.innerText));
  const headingTexts = [...$$('.elementor-heading-title, h1,h2,h3,h4,h5,h6,p', root)].map(e => e.innerText.trim()).filter(Boolean);
  return JSON.stringify({
    title: txt('h1') || txt('.elementor-heading-title', root),
    allTexts: headingTexts.slice(0, 80),
    contentHtml: ($('.elementor-widget-theme-post-content', root) || {}).innerHTML || null,
    image: $('img', root)?.src || null,
    imageAlt: $('img', root)?.alt || null,
    bookingUrl: book ? cleanHref(book.getAttribute('data-url') || book.href) : null,
    offcanvasText: ($('.e-off-canvas') || {}).innerText?.trim().slice(0, 4000) || null,
    offcanvasHtml: ($('.e-off-canvas') || {}).innerHTML?.slice(0, 40000) || null,
    ctaButton: learn ? { text: learn.innerText.trim(), href: cleanHref(learn.href) } : null,
    iframe: $('iframe')?.src || null,
    replacements: window.__repl,
  });
})()`;

const grab = (path, code) => {
  ab("set", "viewport", "1440", "900");
  ab("open", BASE + path);
  ab("wait", "2500");
  return evl(code);
};
const want = (name) => !only.length || only.includes(name);
const log = (...a) => console.log(...a);

const isReal = (p) => p.status === "publish" && !/^auto-draft|^\d+$/.test(p.slug);
const termOf = (p, tax) => (p._embedded?.["wp:term"] || []).flat().find(t => t.taxonomy === tax)?.slug || null;

// ------------------------------------------------------------------- home: hero + testimonials + site chrome
if (want("home")) {
  const home = grab("/", EX_PAGE);
  writeFileSync(join(out, "pages", "home.json"), JSON.stringify(home, null, 1));
  const home2 = grab("/", EX_HOME); // re-open: slick mutates the DOM between evals
  writeFileSync(join(out, "pages", "home-grids.json"), JSON.stringify(home2, null, 1));
  writeFileSync(join(out, "site.json"), JSON.stringify(home.site, null, 1));
  log(`home: ${home2.slides.length} slides, grids: ${Object.keys(home2.grids).join(", ")}, menu items: ${home.site.menu.length}, footer links: ${home.site.footer?.links.length}`);

  // banners.json — feeds the STATIC hero (README D15), not a CMS collection.
  const banners = readJson("banner").map(b => b.id);
  writeFileSync(join(out, "banners.json"), JSON.stringify({
    note: "D15: static hero content, not a banner content type. slideOrder = slick DOM order.",
    domSlides: home2.slides,
    restBanners: readJson("banner").map(b => ({ id: b.id, title: b.title?.rendered, excerpt: b.excerpt?.rendered, image: b._embedded?.["wp:featuredmedia"]?.[0]?.source_url || null, link: b.link })),
  }, null, 1));
  log(`banners: ${home2.slides.length} DOM slides, ${banners.length} REST banners`);
}

// ------------------------------------------------------------------- services
if (want("services")) {
  const rows = [];
  for (const s of readJson("service").filter(isReal)) {
    try {
      const r = grab(`/service/${s.slug}/`, EX_SINGLE);
      const joined = r.allTexts.join(" | ");
      rows.push({
        slug: s.slug,
        title: s.title.rendered.replace(/&#8217;|&rsquo;/g, "'"),
        serviceType: termOf(s, "service-type"),
        price: joined.match(/₦[\d,.]+\s*\/\s*\$[\d,.]+|₦[\d,.]+|\$[\d,.]+/)?.[0] || null,
        audienceLabel: joined.match(/\(For [^)]+\)/)?.[0] || null,
        format: joined.match(/Zoom Video Session|Zoom [A-Za-z ]{3,30}|In-person[ A-Za-z]*|Phone Session|Video Session/)?.[0] || null,
        description: r.contentHtml,
        allTexts: r.allTexts, // includes the notice line; Phase 3 picks the exact one
        bookingUrl: r.bookingUrl,
        offcanvasHtml: r.offcanvasHtml,
        featuredImage: r.image || s._embedded?.["wp:featuredmedia"]?.[0]?.source_url || null,
        link: s.link,
      });
      log(`service ${s.slug}: price=${rows.at(-1).price ? "y" : "MISSING"} booking=${rows.at(-1).bookingUrl ? "y" : "MISSING"} type=${rows.at(-1).serviceType}`);
    } catch (e) { log(`FAIL service ${s.slug}: ${String(e.message).slice(0, 120)}`); }
  }
  writeFileSync(join(out, "services.json"), JSON.stringify(rows, null, 1));
}

// ------------------------------------------------------------------- resources
if (want("resources")) {
  const grids = JSON.parse(readFileSync(join(out, "pages", "home-grids.json"), "utf8")).grids;
  const gridIndex = {};
  for (const items of Object.values(grids || {})) for (const it of items) if (it.slug) gridIndex[it.slug] = it;
  const rows = [];
  for (const rc of readJson("resource").filter(isReal)) {
    try {
      const r = grab(`/resource/${rc.slug}/`, EX_SINGLE);
      const inGrid = gridIndex[rc.slug];
      rows.push({
        slug: rc.slug,
        title: rc.title.rendered.replace(/&#8217;|&rsquo;/g, "'"),
        resourceType: termOf(rc, "resource-type"),
        badgeLabel: inGrid?.badge || null,
        ctaLabel: r.ctaButton?.text || inGrid?.button?.text || null,
        ctaUrl: r.ctaButton?.href || inGrid?.button?.href || null,
        videoUrl: r.iframe || null,
        excerpt: rc.excerpt?.rendered?.replace(/<\/?p>/g, "").trim() || null,
        content: r.contentHtml || rc.content?.rendered || null,
        featuredImage: r.image || rc._embedded?.["wp:featuredmedia"]?.[0]?.source_url || null,
        link: rc.link,
      });
      log(`resource ${rc.slug}: cta=${rows.at(-1).ctaUrl ? "y" : "MISSING"} type=${rows.at(-1).resourceType} video=${r.iframe ? "y" : "-"}`);
    } catch (e) { log(`FAIL resource ${rc.slug}: ${String(e.message).slice(0, 120)}`); }
  }
  writeFileSync(join(out, "resources.json"), JSON.stringify(rows, null, 1));
}

// ------------------------------------------------------------------- testimonials (from REST + home carousel)
if (want("testimonials")) {
  const rest = readJson("testimonial").map(t => ({
    id: t.id, title: t.title?.rendered || null, text: (t.content?.rendered || "").replace(/<\/?p>/g, "").trim() || null,
  }));
  const dom = [];
  for (const [gid, items] of Object.entries(JSON.parse(readFileSync(join(out, "pages", "home-grids.json"), "utf8")).grids || {})) {
    for (const it of items) if (it.text && it.text.length > 30 && !it.slug) dom.push({ listing: gid, ...it });
  }
  writeFileSync(join(out, "testimonials.json"), JSON.stringify({ rest: rest.filter(t => t.text || t.title), dom }, null, 1));
  log(`testimonials: rest=${rest.length} domCards=${dom.length}`);
}

// ------------------------------------------------------------------- posts (REST only, no visits)
if (want("posts")) {
  writeFileSync(join(out, "posts.json"), JSON.stringify(readJson("posts").filter(p => p.status === "publish").map(p => ({
    slug: p.slug, title: p.title?.rendered, date: p.date, excerpt: p.excerpt?.rendered,
    content: p.content?.rendered,
    featuredImage: p._embedded?.["wp:featuredmedia"]?.[0]?.source_url || null,
    categories: (p._embedded?.["wp:term"] || []).flat().filter(t => t.taxonomy === "category").map(t => t.slug),
    tags: (p._embedded?.["wp:term"] || []).flat().filter(t => t.taxonomy === "post_tag").map(t => t.slug),
    aioseo: p.aioseo_head_json ? { title: p.aioseo_head_json.title, description: p.aioseo_head_json.description, canonical: p.aioseo_head_json.canonical_url } : null,
    link: p.link,
  })), null, 1));
  log("posts written");
}

// ------------------------------------------------------------------- static pages
const STATIC = ["about", "our-story", "founder", "singles", "married", "services", "resources", "books", "videos", "freebies", "inspired-features", "sponsored", "announcements", "event", "askcoach", "contact", "cancellation-policy", "confidentiality-policy", "privacy-policy"];
for (const slug of STATIC) {
  if (!want(slug) && !want("pages")) continue;
  try {
    const p = grab(`/${slug}/`, EX_PAGE);
    writeFileSync(join(out, "pages", `${slug}.json`), JSON.stringify(p, null, 1));
    log(`page ${slug}: ${p.sections.length} sections, ${p.replacements.length} archive.org unwraps`);
  } catch (e) { log(`FAIL page ${slug}: ${String(e.message).slice(0, 120)}`); }
}

ab("close");
log("content extraction done");
