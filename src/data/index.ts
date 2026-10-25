/**
 * EmDash data layer.
 *
 * All templates import from here and nowhere else. The functions below wrap
 * EmDash's content API with the same names and types the templates expect,
 * so swapping the backing store (JSON → EmDash) never touches template code.
 *
 * Image handling:
 *   - EmDash media-library value: { id, src?, alt?, meta: { storageKey } }
 *     → resolve storageKey → /_emdash/api/media/file/<key>
 *   - Plain { src, alt }: use src directly (fallback for legacy / direct URLs)
 *
 * All data functions are async. Templates use: const svc = await getServices()
 * Static data (settings, banners, policies) is still imported from JSON.
 */
import { getEmDashCollection, getEmDashEntry, getMenu, getTerm } from "emdash";
import bannersJson from "./banners.json";
import settingsJson from "./settings.json";
import {
  confidentialityPolicyHtml,
  cancellationPolicyHtml,
} from "./policies";
import type {
  Service,
  Resource,
  Post,
  Testimonial,
  Menu,
  SiteSettings,
  Taxonomy,
  MediaRef,
  Term,
  PortableText,
} from "./types";
export * from "./types";

// ── static data (not in EmDash yet — banners, policies) ───────────────────────
export const settings = settingsJson as SiteSettings;
export const banners = bannersJson;
export const policies = {
  confidentiality: confidentialityPolicyHtml,
  cancellation: cancellationPolicyHtml,
};

// ── utilities ─────────────────────────────────────────────────────────────────

/** Filter published items (status !== "draft"). */
export const published = <T extends { status?: string }>(items: T[]) =>
  items.filter((i) => i.status !== "draft");

// ── image helper ──────────────────────────────────────────────────────────────

/** Resolve an EmDash image value to a plain { src, alt } for templates. */
function resolveImage(
  img:
    | { src?: string; alt?: string; meta?: { storageKey?: string } }
    | null
    | undefined
): MediaRef | null {
  if (!img) return null;
  if (img.src) return { src: img.src, alt: img.alt ?? "" };
  if (img.meta?.storageKey)
    return {
      src: `/_emdash/api/media/file/${img.meta.storageKey}`,
      alt: img.alt ?? "",
    };
  return null;
}

// ── mappers ───────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapService(entry: any) {
  if (!entry) return null;
  const d = entry.data;
  return {
    id: entry.id,
    slug: entry.id,
    status: d.status,
    order: d.order ?? undefined,
    publishedAt: d.publishedAt?.toISOString() ?? undefined,
    title: d.title ?? "",
    featured_image: resolveImage(d.featured_image),
    price_label: d.price_label ?? null,
    audience_label: d.audience_label ?? null,
    format: d.format ?? null,
    notice: d.notice ?? null,
    booking_url: d.booking_url ?? null,
    content: (d.content ?? []) as PortableText,
    terms: {} as Record<string, Term[]>,
  } satisfies Service;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapResource(entry: any) {
  if (!entry) return null;
  const d = entry.data;
  return {
    id: entry.id,
    slug: entry.id,
    status: d.status,
    order: d.order ?? undefined,
    publishedAt: d.publishedAt?.toISOString() ?? undefined,
    title: d.title ?? "",
    featured_image: resolveImage(d.featured_image),
    badge_label: d.badge_label ?? null,
    ctas: (d.ctas ?? []).map((c: { label?: string; url?: string }) => ({
      label: c.label ?? "",
      url: c.url ?? "",
    })),
    video_url: d.video_url ?? null,
    excerpt: d.excerpt ?? null,
    content: (d.content ?? []) as PortableText,
    terms: {} as Record<string, Term[]>,
  } satisfies Resource;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapPost(entry: any) {
  if (!entry) return null;
  const d = entry.data;
  return {
    id: entry.id,
    slug: entry.id,
    status: d.status,
    publishedAt: d.publishedAt?.toISOString() ?? undefined,
    title: d.title ?? "",
    excerpt: d.excerpt ?? null,
    featured_image: resolveImage(d.featured_image),
    content: (d.content ?? []) as PortableText,
    terms: {} as Record<string, Term[]>,
  } satisfies Post;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapTestimonial(entry: any) {
  if (!entry) return null;
  const d = entry.data;
  return {
    id: entry.id,
    slug: entry.id,
    status: d.status,
    order: d.order ?? undefined,
    publishedAt: d.publishedAt?.toISOString() ?? undefined,
    title: d.title ?? null,
    quote: d.quote ?? null,
    author: d.author ?? null,
    terms: {} as Record<string, Term[]>,
  } satisfies Testimonial;
}

function mapMenu(m: Awaited<ReturnType<typeof getMenu>>): Menu | null {
  if (!m) return null;
  return {
    name: m.name,
    label: m.label,
    items: (m.items ?? []) as unknown as Menu["items"],
  };
}

// ── async data API ─────────────────────────────────────────────────────────────

/** All published services, ordered by the `order` field. */
export async function getServices(): Promise<Service[]> {
  const { entries } = await getEmDashCollection("services", {
    status: "published",
    orderBy: { order: "asc" },
    limit: 100,
  });
  return entries.map(mapService).filter(Boolean) as Service[];
}

/** All published resources, ordered by the `order` field. */
export async function getResources(): Promise<Resource[]> {
  const { entries } = await getEmDashCollection("resources", {
    status: "published",
    orderBy: { order: "asc" },
    limit: 100,
  });
  return entries.map(mapResource).filter(Boolean) as Resource[];
}

/** All published testimonials. */
export async function getTestimonials(): Promise<Testimonial[]> {
  const { entries } = await getEmDashCollection("testimonials", {
    status: "published",
    limit: 100,
  });
  return entries.map(mapTestimonial).filter(Boolean) as Testimonial[];
}

/** All published posts, newest first. */
export async function getPosts(): Promise<Post[]> {
  const { entries } = await getEmDashCollection("posts", {
    status: "published",
    orderBy: { published_at: "desc" },
    limit: 200,
  });
  return entries.map(mapPost).filter(Boolean) as Post[];
}

/** Single service by slug. */
export async function getService(slug: string): Promise<Service | null> {
  const result = await getEmDashEntry("services", slug);
  return mapService(result.entry);
}

/** Single resource by slug. */
export async function getResource(slug: string): Promise<Resource | null> {
  const result = await getEmDashEntry("resources", slug);
  return mapResource(result.entry);
}

/** Single post by slug. */
export async function getPost(slug: string): Promise<Post | null> {
  const result = await getEmDashEntry("posts", slug);
  return mapPost(result.entry);
}

/** Posts in a category. */
export async function getPostsInCategory(category: string): Promise<Post[]> {
  const { entries } = await getEmDashCollection("posts", {
    status: "published",
    where: { category },
    orderBy: { published_at: "desc" },
    limit: 100,
  });
  return entries.map(mapPost).filter(Boolean) as Post[];
}

/** Posts with a tag. */
export async function getPostsWithTag(tag: string): Promise<Post[]> {
  const { entries } = await getEmDashCollection("posts", {
    status: "published",
    where: { tag },
    orderBy: { published_at: "desc" },
    limit: 100,
  });
  return entries.map(mapPost).filter(Boolean) as Post[];
}

/** The named menu. */
export async function getMenuByName(name: string): Promise<Menu | null> {
  const result = await getMenu(name);
  return mapMenu(result);
}

/** A taxonomy term. */
export async function getTaxonomyTerm(
  taxonomy: string,
  slug: string
): Promise<Term | null> {
  const term = await getTerm(taxonomy, slug);
  if (!term) return null;
  return { slug: term.slug, label: term.label };
}

/** All taxonomies with their terms. */
export async function getTaxonomies(): Promise<Taxonomy[]> {
  const { entries: cats } = await getEmDashCollection("category");
  const { entries: tags } = await getEmDashCollection("tag");
  const { entries: serviceTypes } = await getEmDashCollection("service_type");
  const { entries: resourceTypes } = await getEmDashCollection("resource_type");
  return [
    {
      name: "category",
      label: "Categories",
      labelSingular: "Category",
      terms: cats.map((e) => ({ slug: e.id, label: (e.data.name as string) ?? e.id })),
    },
    {
      name: "tag",
      label: "Tags",
      labelSingular: "Tag",
      terms: tags.map((e) => ({ slug: e.id, label: (e.data.name as string) ?? e.id })),
    },
    {
      name: "service_type",
      label: "Service Types",
      labelSingular: "Service Type",
      terms: serviceTypes.map((e) => ({ slug: e.id, label: (e.data.name as string) ?? e.id })),
    },
    {
      name: "resource_type",
      label: "Resource Types",
      labelSingular: "Resource Type",
      terms: resourceTypes.map((e) => ({
        slug: e.id,
        label: (e.data.name as string) ?? e.id,
      })),
    },
  ];
}

/** Marquee items, ordered. */
export async function getMarqueeItems(): Promise<
  Array<{ text: string; link: string }>
> {
  const { entries } = await getEmDashCollection("marquee_items", {
    status: "published",
    orderBy: { order: "asc" },
    limit: 10,
  });
  return entries.map((e) => ({
    text: (e.data.text as string) ?? "",
    link: (e.data.link as string) ?? "",
  }));
}

/** Normalised image source, or "" when absent. */
export function imageSrc(image?: { src?: string } | null): string {
  if (!image) return "";
  if (typeof image === "string") return image;
  return image.src ?? "";
}
