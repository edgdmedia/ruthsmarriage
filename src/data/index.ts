// Static content layer. Everything the site renders comes from the JSON files in this
// folder — there is no CMS, no database and no network call at request time.
//
// Regenerate with: node scripts/reference/build-data.mjs
import bannersJson from "./banners.json";
import marqueeJson from "./marquee.json";
import menusJson from "./menus.json";
import pagesJson from "./pages.json";
import postsJson from "./posts.json";
import resourcesJson from "./resources.json";
import servicesJson from "./services.json";
import settingsJson from "./settings.json";
import taxonomiesJson from "./taxonomies.json";
import testimonialsJson from "./testimonials.json";
import type {
	Banner,
	Menu,
	Page,
	Post,
	Resource,
	Service,
	SiteSettings,
	Taxonomy,
	Testimonial,
} from "./types";

export * from "./types";

export const settings = settingsJson as SiteSettings;
export const menus = menusJson as Menu[];
export const banners = bannersJson as Banner[];
export const marqueeItems = marqueeJson as Array<{ text: string; link: string }>;
export const services = servicesJson as Service[];
export const resources = resourcesJson as Resource[];
export const testimonials = testimonialsJson as Testimonial[];
export const posts = postsJson as Post[];
export const pages = pagesJson as Page[];
export const taxonomies = taxonomiesJson as Taxonomy[];

export const published = <T extends { status?: string }>(items: T[]) =>
	items.filter((i) => i.status !== "draft");

// ------------------------------------------------------------------ lookups
const bySlug = <T extends { slug: string }>(items: T[]) => {
	const map = new Map<string, T>();
	for (const item of items) map.set(item.slug, item);
	return map;
};

const serviceBySlug = bySlug(services);
const resourceBySlug = bySlug(resources);
const postBySlug = bySlug(posts);
const pageBySlug = bySlug(pages);

export const getService = (slug: string) => serviceBySlug.get(slug);
export const getResource = (slug: string) => resourceBySlug.get(slug);
export const getPost = (slug: string) => postBySlug.get(slug);
export const getPage = (slug: string) => pageBySlug.get(slug);

export const getMenu = (name: string) => menus.find((m) => m.name === name);

// ------------------------------------------------------------------ taxonomies
export const getTerm = (taxonomy: string, slug: string) =>
	taxonomies.find((t) => t.name === taxonomy)?.terms.find((term) => term.slug === slug);

export const postsInCategory = (category: string) =>
	posts.filter((p) => p.terms?.category?.some((c) => c.slug === category));

export const postsWithTag = (tag: string) =>
	posts.filter((p) => p.terms?.tag?.some((t) => t.slug === tag));

// ------------------------------------------------------------------ media
/** Normalised image source for a content entry's featured image, or "" when absent. */
export const imageSrc = (image?: { src?: string } | null) => image?.src ?? "";
