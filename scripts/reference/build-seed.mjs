// Phase 3 step 1: build seed/seed.json from discovery/content/* (captured from live).
// Run: node scripts/reference/build-seed.mjs
// Then: npx emdash seed seed/seed.json --validate
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const c = (p) => JSON.parse(readFileSync(join(root, p), "utf8"));
const m = (v) => readFileSync(join(root, v), "utf8");

const MEDIA = (url, alt = "") => ({ $media: { url, alt, filename: url.split("/").pop() } });
const PT = (text, style = "normal") => ({
  _type: "block",
  style,
  children: [{ _type: "span", text: text || "" }],
});

const now = new Date().toISOString();
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

// ---------- captured content ----------
const services = c("discovery/content/services.json");
const resources = c("discovery/content/resources.json");
const testimonialsRaw = c("discovery/content/testimonials.json");
const postsRaw = c("discovery/content/posts.json");
const site = c("discovery/content/site.json");
const pages = {};
for (const f of ["about","our-story","founder","singles","married","services","resources","books","videos","freebies","inspired-features","sponsored","announcements","event","askcoach","contact","cancellation-policy","confidentiality-policy","privacy-policy"]) {
  try { pages[f] = c(`discovery/content/pages/${f}.json`); } catch {}
}

// ---------- helpers ----------
const termMap = {
  services: { married: "married", singles: "singles" },
  resources: { resource: "resource", book: "book", video: "video" },
};
const postTags = new Map(postsRaw.map(p => [p.slug, (p.tags || [])[0] || "instagram"]));

const pagePT = (slugName) => {
  const p = pages[slugName];
  if (!p) return [{ _type: "block", style: "normal", children: [{ _type: "span", text: "" }] }];
  const blocks = [];
  for (const s of p.sections || []) {
    for (const w of s.widgets || []) {
      if (w.heading) blocks.push(PT(w.heading.text, w.heading.tag === "h1" ? "h1" : w.heading.tag === "h2" ? "h2" : w.heading.tag === "h3" ? "h3" : "normal"));
      if (w.html) {
        const text = w.html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
        if (text) blocks.push(PT(text));
      }
    }
  }
  return blocks.length ? blocks : [{ _type: "block", style: "normal", children: [{ _type: "span", text: "" }] }];
};

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
    social: settingsSocial,
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
      slug: "pages", label: "Pages", labelSingular: "Page", urlPattern: "/{slug}",
      supports: ["drafts", "revisions", "preview", "search", "seo"],
      commentsEnabled: false,
      fields: [
        { slug: "title", label: "Title", type: "string", required: true, searchable: true },
        { slug: "hero_title", label: "Hero Title", type: "string" },
        { slug: "hero_image", label: "Hero Image", type: "image" },
        { slug: "side_image", label: "Side Image", type: "image" },
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
      id: `service-${i + 1}`, slug: s.slug, status: "published", order: i + 1,
      data: {
        title: s.title,
        featured_image: s.featured_image ? MEDIA(s.featured_image) : null,
        price_label: s.price || null,
        audience_label: s.audienceLabel || null,
        format: s.format || null,
        notice: null,
        booking_url: s.bookingUrl || null,
        content: s.allTexts ? [PT(s.allTexts.slice(0, 300).join(" ") || `${s.title} counseling service.`)] : [PT(`${s.title}.`)],
      },
      taxonomies: { service_type: [termMap.services[s.serviceType] || "married"] },
    })),
    resources: resources.map((r, i) => ({
      id: `resource-${i + 1}`, slug: r.slug, status: "published", order: i + 1,
      data: {
        title: r.title,
        featured_image: r.featured_image ? MEDIA(r.featured_image) : null,
        badge_label: r.badgeLabel || null,
        ctas: r.ctaUrl ? [{ label: r.ctaLabel || "Learn More", url: r.ctaUrl }] : [],
        video_url: r.videoUrl || null,
        excerpt: r.excerpt || null,
        content: r.content ? [PT(r.content.replace(/<[^>]+>/g, " ").slice(0, 400))] : [PT(`${r.title}.`)],
      },
      taxonomies: { resource_type: [termMap.resources[r.resourceType] || "resource"] },
    })),
    testimonials: testimonialsRaw.dom.map((t, i) => ({
      id: `testimonial-${i + 1}`, slug: `testimonial-${i + 1}`, status: "published", order: i + 1,
      data: { title: null, quote: t.text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(), author: null },
    })),
    pages: Object.entries(pages).map(([name, p], i) => {
      const img = p.sections?.flatMap(s => s.widgets || []).find(w => w.image)?.image;
      const heroImage = typeof img === "string" ? img : img?.src || null;
      return {
        id: `page-${i + 1}`, slug: name, status: "published",
        data: {
          title: p.title.replace(/\s*-\s*Ruths Marriage$/, "").replace(/\s*-\s*Ruth's Marriage$/, ""),
          hero_title: null,
          hero_image: heroImage ? MEDIA(heroImage) : null,
          side_image: null,
          content: pagePT(name),
        },
      };
    }),
    posts: postsRaw.filter(p => (p.status || "publish") === "publish")
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 3)
      .map((p, i) => ({
        id: `post-${i + 1}`, slug: p.slug, status: "published",
        data: {
          title: p.title,
          excerpt: p.excerpt || null,
          featured_image: p.featuredImage ? MEDIA(p.featuredImage) : null,
          content: p.content ? [PT(p.content.replace(/<[^>]+>/g, " ").slice(0, 600))] : [PT(p.excerpt || "")],
        },
        taxonomies: { category: ["marriage"], tag: [postTags.get(p.slug) || "instagram"] },
      })),
  },
};

mkdirSync(join(root, "seed"), { recursive: true });
writeFileSync(join(root, "seed/seed.json"), JSON.stringify(seed, null, 2));
const counts = { services: seed.content.services.length, resources: seed.content.resources.length, testimonials: seed.content.testimonials.length, pages: seed.content.pages.length, posts: seed.content.posts.length, marquee: seed.content.marquee_items.length };
console.log(JSON.stringify(counts));
