// Phase 3 step 1: build seed/seed.json from discovery/content/* (captured from live).
// Run: node scripts/reference/build-seed.mjs
// Then: npx emdash seed seed/seed.json --validate
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { cleanPostHtml, fixInternalLinks, sitePaths } from "./post-html.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const c = (p) => JSON.parse(readFileSync(join(root, p), "utf8"));
const m = (v) => readFileSync(join(root, v), "utf8");

const MEDIA = (url, alt = "") => ({ $media: { url, alt, filename: url.split("/").pop() } });
// Decode the numeric/named HTML entities WordPress leaves in titles (e.g. "&#038;", "&#8217;").
const decodeEntities = (s) =>
  typeof s !== "string" ? s : s
    .replace(/&#0*38;/gi, "&")
    .replace(/&#0*8217;/g, "’")
    .replace(/&#0*8216;/g, "‘")
    .replace(/&#0*8220;/g, "“")
    .replace(/&#0*8221;/g, "”")
    .replace(/&#0*8211;/g, "–")
    .replace(/&#0*8212;/g, "—")
    .replace(/&#0*8230;/g, "…")
    .replace(/&amp;/g, "&");
const PT = (text, style = "normal") => ({
  _type: "block",
  style,
  children: [{ _type: "span", text: text || "" }],
});

/** Split an HTML description into PortableText blocks, one per <p>.
    The inline markup (<strong>, <em>, <br>) is kept — the span is rendered as
    HTML, and dropping the <br>s would collapse the line breaks the live
    listing shows. Empty `&nbsp;` paragraphs are kept too: the live renders
    them as a blank line, and they change the block's height. */
const htmlPT = (html) => {
  const out = [];
  const re = /<p[^>]*>([\s\S]*?)<\/p>/gi;
  let m;
  while ((m = re.exec(String(html || "")))) {
    const inner = m[1];
    const blank = !inner.replace(/&nbsp;/gi, "").replace(/<[^>]+>/g, "").trim();
    const t = inner.replace(/[ \t\r\n]+/g, " ").trim();
    if (!t && !blank) continue;
    out.push(PT(decodeEntities(t || "\u00a0")));
  }
  return out;
};

const now = new Date().toISOString();
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

// ---------- captured content ----------
const services = c("discovery/content/services.json");
const resources = c("discovery/content/resources.json");
const testimonialsRaw = c("discovery/content/testimonials.json");
// The scraped listing truncates each quote; the WP REST dump has the full text.
const testimonialsFull = (() => {
  try {
    const raw = c("discovery/raw/json/testimonial.json");
    const list = Array.isArray(raw) ? raw : raw.dom;
    return new Map(list.map((t) => [String(t.id), (t.content?.rendered || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()]));
  } catch {
    return new Map();
  }
})();
const postsRaw = c("discovery/content/posts.json");
const validPaths = sitePaths({
  posts: postsRaw.map((p) => p.slug),
  resources: resources.map((r) => r.slug),
  services: services.map((s) => s.slug),
  pages: readdirSync(join(root, "src/pages"), { withFileTypes: true }).filter((d) => d.isDirectory() && !d.name.startsWith("[")).map((d) => d.name),
});
const site = c("discovery/content/site.json");

// ---------- helpers ----------
// Featured images: discovery/content/*.json captured og:image (always the site
// logo) as featuredImage, which is useless. The real per-entry image is the
// first wp-content image in the captured single-page body (discovery/raw/html/).
const bodyImage = (file) => {
  let h;
  try { h = m(`discovery/raw/html/${file}`); } catch { return null; }
  const body = h.split("</head>")[1] || h;
  const urls = body.match(/https?:\/\/www\.ruthsmarriage\.com\/wp-content\/uploads\/[^"'\s)]+/g) || [];
  const hit = urls.find((u) => !/logo|pink-overlapping|woocommerce-placeholder/i.test(u));
  return hit || null;
};
const FEAT = (file) => {
  const u = bodyImage(file);
  return u ? MEDIA(u) : null;
};
const termMap = {
  services: { married: "married", singles: "singles" },
  resources: { resource: "resource", book: "book", video: "video" },
};
// The live listing order, read off /singles/ and /married/ on 2026-10-22 (stable
// across loads). The two pages use different queries: /services/ has a third
// order, but the port lists all 11 services there anyway, so this order is the
// one that matches the pages the port can reproduce.
// NOTE: page-maps/singles-married.md lists a different singles order
// (Relationship Clarity, Dating Couples, Six Weeks Individual, Private
// Premarital, Dating Couple Coaching) — that is live's /services/ order, not
// /singles/. Logged in progress/visual-listing-rows.md.
const SERVICE_ORDER = [
  "one-hour-relationship-clarity-session",
  "one-hour-dating-couples-counseling-session",
  "one-hour-individual-counseling-session",
  "one-hour-couples-counseling-session",
  "two-sessions-couples-counseling",
  "private-premarital-counseling-classes",
  "the-dating-couple-coaching-cycle",
  "six-6-weeks-individual-therapy-cycle",
  "six-6-weeks-individual-therapy-cycle-2",
  "six-6-weeks-marriage-therapy-cycle",
  "private-premarital-counseling-classes-2",
];
const RESOURCE_ORDER = [
  "28-days-lovers-again-challenge",
  "the-ultimate-couples-hard-conversations-guide",
  "the-love-playbook",
  "baddie-in-bed-a-sex-guide-for-wives",
  "60-fun-games-and-activities-for-couples",
  "the-marriage-checkup-workbook",
  "have-sex-pray",
  "50-intimate-conversations-to-have-with-your-partner",
  "52-rules-of-dating-and-relationships",
  "how-do-we-discuss-our-sexual-fantasies-in-marriage",
  "how-to-deal-with-a-husband-who-flirts-and-cheats-with-other-women",
];
const orderOf = (list, slug) => {
  const i = list.indexOf(slug);
  return i === -1 ? list.length + 1 : i + 1;
};

/** The format line the live listing shows. `allTexts` is
    [title, price, (audience)?, format, ...description]; the scraped `format`
    field is missing for some services and singular where the listing is
    plural, so take it from allTexts and fall back to the scraped value. */
const formatOf = (s) => {
  const i = s.audienceLabel ? 3 : 2;
  const f = (s.allTexts || [])[i];
  if (f && f.length < 60 && !f.startsWith("(")) return f;
  return s.format || null;
};
const postTags = new Map(postsRaw.map(p => [p.slug, (p.tags || [])[0] || "instagram"]));

const settingsSocial = {};
for (const s of site.socials || []) {
  const m2 = s.href.match(/facebook|twitter|instagram|threads|youtube/i);
  if (m2) settingsSocial[m2[0].toLowerCase().replace("threads","threads")] = s.href;
}

// ---------- seed ----------
const seed = {
  "$schema": "https://emdashcms.com/seed.schema.json",
  version: "1",
  meta: { name: "Ruth's Marriage", description: "Marriage counselling and coaching — ported from WordPress", author: "Ruth's Marriage" },
  settings: {
    title: "Ruth's Marriage",
    tagline: "",
    url: "https://www.ruthsmarriage.com",
    logo: MEDIA("https://www.ruthsmarriage.com/wp-content/uploads/2025/06/logo-2-1.png", "Ruth's Marriage"),
    social: {
      facebook: "https://facebook.com/RuthsMarriage",
      twitter: "https://twitter.com/ruthsmarriage",
      instagram: "https://instagram.com/askcoachruth",
      youtube: "https://youtube.com/@ruthsmarriage", // TODO(G3)
      threads: "https://threads.com/RuthsMarriage",
    },
  },
  collections: [
    {
      slug: "posts", label: "Posts", labelSingular: "Post", urlPattern: "/{slug}",
      supports: ["drafts", "revisions", "preview", "scheduling", "search", "seo"],
      commentsEnabled: false,
      fields: [
        { slug: "title", label: "Title", type: "string", required: true, searchable: true },
        { slug: "featured_image", label: "Featured Image", type: "image" },
        { slug: "excerpt", label: "Excerpt", type: "text" },
        { slug: "content", label: "Content", type: "portableText", searchable: true },
      ],
    },
    {
      slug: "services", label: "Services", labelSingular: "Service", urlPattern: "/service/{slug}",
      supports: ["drafts", "revisions", "preview", "search", "seo"],
      commentsEnabled: false,
      fields: [
        { slug: "title", label: "Title", type: "string", required: true, searchable: true },
        { slug: "featured_image", label: "Featured Image", type: "image" },
        { slug: "price_label", label: "Price", type: "string" },
        { slug: "audience_label", label: "Audience", type: "string" },
        { slug: "format", label: "Format", type: "string" },
        { slug: "notice", label: "Booking Notice", type: "text" },
        { slug: "booking_url", label: "Booking URL", type: "url" },
        { slug: "order", label: "Order", type: "number" },
        { slug: "content", label: "Content", type: "portableText", searchable: true },
      ],
    },
    {
      slug: "resources", label: "Resources", labelSingular: "Resource", urlPattern: "/resource/{slug}",
      supports: ["drafts", "revisions", "preview", "search", "seo"],
      commentsEnabled: false,
      fields: [
        { slug: "title", label: "Title", type: "string", required: true, searchable: true },
        { slug: "featured_image", label: "Featured Image", type: "image" },
        { slug: "badge_label", label: "Badge", type: "string" },
        { slug: "ctas", label: "CTAs", type: "repeater", validation: { subFields: [{ slug: "label", label: "Label", type: "string" }, { slug: "url", label: "URL", type: "url" }] } },
        { slug: "video_url", label: "Video URL", type: "url" },
        { slug: "excerpt", label: "Excerpt", type: "text" },
        { slug: "order", label: "Order", type: "number" },
        { slug: "content", label: "Content", type: "portableText", searchable: true },
      ],
    },
    {
      slug: "testimonials", label: "Testimonials", labelSingular: "Testimonial", urlPattern: "/{slug}",
      supports: ["drafts"],
      commentsEnabled: false,
      fields: [
        { slug: "title", label: "Title", type: "string" },
        { slug: "quote", label: "Quote", type: "text", required: true },
        { slug: "author", label: "Author", type: "string" },
        { slug: "order", label: "Order", type: "number" },
      ],
    },
    {
      slug: "marquee_items", label: "Marquee Items", labelSingular: "Marquee Item", urlPattern: "/{slug}",
      supports: ["drafts"],
      commentsEnabled: false,
      fields: [
        { slug: "text", label: "Text", type: "string", required: true },
        { slug: "link", label: "Link", type: "url", required: true },
        { slug: "order", label: "Order", type: "number" },
      ],
    },
    {
      // Ask Coach form submissions (written by src/actions askCoach as drafts; never shown on the site).
      slug: "ask_coach_questions", label: "Ask Coach Questions", labelSingular: "Ask Coach Question",
      supports: ["drafts"],
      commentsEnabled: false,
      fields: [
        { slug: "title", label: "Title", type: "string", required: true },
        { slug: "category", label: "Category", type: "select", required: true, validation: { options: ["Love", "Dating", "Marriage", "Sex", "Faith", "Life"] } },
        { slug: "question", label: "Question", type: "text", required: true },
      ],
    },
  ],
  taxonomies: [
    { name: "category", label: "Categories", labelSingular: "Category", hierarchical: true, collections: ["posts"], terms: [{ slug: "marriage", label: "Marriage" }] },
    { name: "tag", label: "Tags", labelSingular: "Tag", hierarchical: false, collections: ["posts"], terms: [{ slug: "instagram", label: "Instagram" }, { slug: "godly-perspective", label: "Godly Perspective" }] },
    { name: "service_type", label: "Service Types", labelSingular: "Service Type", hierarchical: false, collections: ["services"], terms: [{ slug: "married", label: "Married" }, { slug: "singles", label: "Singles" }] },
    { name: "resource_type", label: "Resource Types", labelSingular: "Resource Type", hierarchical: false, collections: ["resources"], terms: [{ slug: "resource", label: "Resource" }, { slug: "book", label: "Book" }, { slug: "video", label: "Video" }] },
  ],
  menus: [
    { name: "primary", label: "Primary Navigation", items: [
      { type: "custom", label: "About", url: "#", children: [
        { type: "custom", label: "About Us", url: "/about/" },
        { type: "custom", label: "Our Story", url: "/our-story/" },
        { type: "custom", label: "Our Founder", url: "/founder/" },
      ] },
      { type: "custom", label: "Counseling Services", url: "#", children: [
        { type: "custom", label: "Singles", url: "/singles/" },
        { type: "custom", label: "Married", url: "/married/" },
      ] },
      { type: "custom", label: "Resources", url: "#", children: [
        { type: "custom", label: "Courses, Guides, and Intimacy Builders", url: "/resources/" },
        { type: "custom", label: "Books", url: "/books/" },
        { type: "custom", label: "Videos", url: "/videos/" },
      ] },
      { type: "custom", label: "Freebies", url: "#", children: [
        { type: "custom", label: "Blog Articles", url: "/inspired-features/" },
      ] },
      { type: "custom", label: "Media", url: "#", children: [
        { type: "custom", label: "Sponsored", url: "/sponsored/" },
        { type: "custom", label: "Announcements", url: "/announcements/" },
        { type: "custom", label: "Event Gallery", url: "/event/" },
      ] },
    ] },
    { name: "footer-services", label: "Footer: Services", items: [
      { type: "custom", label: "One Hour Relationship Clarity Session", url: "/service/one-hour-relationship-clarity-session/" },
      { type: "custom", label: "One Hour Dating Couples Counseling Session", url: "/service/one-hour-dating-couples-counseling-session/" },
      { type: "custom", label: "Six (6) Weeks Individual Therapy Cycle", url: "/service/six-6-weeks-individual-therapy-cycle/" },
      { type: "custom", label: "Private Premarital Counseling Classes", url: "/service/private-premarital-counseling-classes/" },
      { type: "custom", label: "The Dating Couple Coaching Cycle", url: "/service/the-dating-couple-coaching-cycle/" },
      { type: "custom", label: "One Hour Individual Counseling Session", url: "/service/one-hour-individual-counseling-session/" },
    ] },
    { name: "footer-resources", label: "Footer: Resources", items: [
      { type: "custom", label: "52 Rules of Dating and Relationships", url: "/resource/52-rules-of-dating-and-relationships/" },
      { type: "custom", label: "Have Sex & Pray", url: "/resource/have-sex-pray/" },
      { type: "custom", label: "50 Intimate Conversations to Have with Your Partner", url: "/resource/50-intimate-conversations-to-have-with-your-partner/" },
      { type: "custom", label: "The 28 Days Lovers Again Challenge", url: "/resource/28-days-lovers-again-challenge/" },
      { type: "custom", label: "The 60 Fun Games and Activities for Couples", url: "/resource/60-fun-games-and-activities-for-couples/" },
      { type: "custom", label: "How to Deal with a Husband who Flirts and Cheats with other Women", url: "/resource/how-to-deal-with-a-husband-who-flirts-and-cheats-with-other-women/" },
    ] },
    { name: "footer-legal", label: "Footer: Legal", items: [
      { type: "custom", label: "Cancellation Policy", url: "/cancellation-policy/" },
      { type: "custom", label: "Confidentiality Policy", url: "/confidentiality-policy/" },
    ] },
  ],
  content: {
    marquee_items: [
      { id: "marquee-1", slug: "28-days-lovers-again-challenge", status: "published", order: 1,
        data: { text: "Join the 28 Days Lovers Again Challenge with Coach Ruth", link: "/resource/28-days-lovers-again-challenge/" } },
    ],
    services: services.map((s, i) => ({
      id: `service-${i + 1}`, slug: s.slug, status: "published", order: orderOf(SERVICE_ORDER, s.slug),
      data: {
        title: decodeEntities(s.title),
        featured_image: FEAT(`service__${s.slug}.html`),
        price_label: s.price || null,
        audience_label: s.audienceLabel || null,
        format: formatOf(s),
        notice: null,
        booking_url: s.bookingUrl || null,
        content: htmlPT(s.description).length ? htmlPT(s.description) : [PT(`${s.title} counseling service.`)],
      },
      taxonomies: { service_type: [termMap.services[s.serviceType] || "married"] },
    })),
    resources: resources.map((r, i) => ({
      id: `resource-${i + 1}`, slug: r.slug, status: "published", order: orderOf(RESOURCE_ORDER, r.slug),
      data: {
        title: decodeEntities(r.title),
        featured_image: FEAT(`resource__${r.slug}.html`),
        badge_label: r.badgeLabel || null,
        ctas: r.ctaUrl ? [{ label: r.ctaLabel || "Learn More", url: r.ctaUrl }] : [],
        video_url: r.videoUrl || null,
        excerpt: r.excerpt || null,
        content: htmlPT(r.content).length ? htmlPT(r.content) : [PT(`${r.title}.`)],
      },
      taxonomies: { resource_type: [termMap.resources[r.resourceType] || "resource"] },
    })),
    testimonials: testimonialsRaw.dom.map((t, i) => ({
      id: `testimonial-${i + 1}`, slug: `testimonial-${i + 1}`, status: "published", order: i + 1,
      data: {
        title: null,
        quote: testimonialsFull.get(String(t.postId)) || t.text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
        author: null,
      },
    })),
    posts: postsRaw.filter(p => (p.status || "publish") === "publish")
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .map((p, i) => ({
        id: `post-${i + 1}`, slug: p.slug, status: "published",
        published_at: p.date || null,
        data: {
          title: decodeEntities(p.title),
          excerpt: p.excerpt || null,
          featured_image: p.featuredImage ? MEDIA(p.featuredImage) : null,
          content: p.content ? [{ _type: "html", html: fixInternalLinks(cleanPostHtml(p.content, root), validPaths) }] : [PT(p.excerpt || "")],
        },
        taxonomies: { category: ["marriage"], tag: [postTags.get(p.slug) || "instagram"] },
      })),
  },
};

mkdirSync(join(root, "seed"), { recursive: true });
writeFileSync(join(root, "seed/seed.json"), JSON.stringify(seed, null, 2));
const counts = { services: seed.content.services.length, resources: seed.content.resources.length, testimonials: seed.content.testimonials.length, posts: seed.content.posts.length, marquee: seed.content.marquee_items.length };
console.log(JSON.stringify(counts));
