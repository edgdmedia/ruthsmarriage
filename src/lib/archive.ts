/* Archive helpers for the Hello-default listing pages (category, tag, service
   type, resource type, search). Spec: page-maps/default-pages.md "Archives". */
import type { ArchiveItem } from "../components/ArchiveList.astro";
import type { Post, Resource, Service } from "../data/types";
import { archiveExcerpt, contentText } from "./excerpt";

export const PER_PAGE = 10;

export const postItem = (p: Post): ArchiveItem => ({
	title: p.title,
	url: `/${p.slug}/`,
	image: p.featured_image,
	excerpt: archiveExcerpt(p),
	kind: "article",
	label: "Article",
});
export const serviceItem = (s: Service): ArchiveItem => ({
	title: s.title,
	url: `/service/${s.slug}/`,
	image: s.featured_image,
	excerpt: archiveExcerpt(s),
	kind: "service",
	label: "Service",
});
export const resourceItem = (r: Resource): ArchiveItem => ({
	title: r.title,
	url: `/resource/${r.slug}/`,
	image: r.featured_image,
	excerpt: archiveExcerpt(r),
	kind: "resource",
	label: r.terms?.resource_type?.[0]?.label ?? "Resource",
});

/** Page number from a `[...page]` rest param: undefined → 1, "page/N" → N (N ≥ 2), else null (404). */
export function pageNumber(param: string | undefined): number | null {
	if (!param) return 1;
	const n = Number(param.match(/^page\/(\d+)\/?$/)?.[1]);
	return n >= 2 ? n : null;
}

/** One page of `items` with WordPress-shaped prev/next URLs; null if the page is out of range. */
export function paginate<T>(items: T[], page: number, url: (page: number) => string) {
	const pages = Math.max(1, Math.ceil(items.length / PER_PAGE));
	if (page > pages) return null;
	return {
		page,
		pages,
		items: items.slice((page - 1) * PER_PAGE, page * PER_PAGE),
		prevUrl: page > 1 ? url(page - 1) : null,
		nextUrl: page < pages ? url(page + 1) : null,
	};
}

/** `/category/marriage/` + page → `/category/marriage/page/2/`. */
export const pagedUrl = (base: string) => (page: number) => (page === 1 ? base : `${base}page/${page}/`);

/** WordPress-style search: title matches first, then content/excerpt matches. */
export function searchEntries(query: string, sources: { title: string; text: string; item: ArchiveItem }[]) {
	const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
	if (terms.length === 0) return [];
	const has = (s: string) => terms.every((t) => s.toLowerCase().includes(t));
	const inTitle = sources.filter((s) => has(s.title));
	const inText = sources.filter((s) => !has(s.title) && has(s.text));
	return [...inTitle, ...inText].map((s) => s.item);
}

export const searchSource = <T extends { title: string; excerpt?: string | null; content?: Post["content"] }>(
	entry: T,
	item: ArchiveItem,
) => ({ title: entry.title, text: `${contentText(entry.content)} ${entry.excerpt ?? ""}`, item });
