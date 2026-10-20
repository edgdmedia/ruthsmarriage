import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { join } from "node:path";
import {
	banners,
	getMenu,
	getPage,
	getPost,
	getResource,
	getService,
	getTerm,
	menus,
	pages,
	posts,
	postsInCategory,
	postsWithTag,
	resources,
	services,
	settings,
	taxonomies,
	testimonials,
} from "../src/data";

const publicDir = join(process.cwd(), "public");

const imageExists = (src?: string | null) =>
	!src || (src.startsWith("/") && existsSync(join(publicDir, src.replace(/^\//, ""))));

describe("content data", () => {
	it("loads every collection", () => {
		expect(services.length).toBeGreaterThan(0);
		expect(resources.length).toBeGreaterThan(0);
		expect(testimonials.length).toBeGreaterThan(0);
		expect(posts.length).toBeGreaterThan(0);
		expect(banners.length).toBeGreaterThan(0);
	});

	it("has unique slugs per collection", () => {
		for (const items of [services, resources, posts]) {
			const slugs = items.map((i) => i.slug);
			expect(new Set(slugs).size).toBe(slugs.length);
		}
	});

	it("resolves entries by slug", () => {
		expect(getService(services[0].slug)?.id).toBe(services[0].id);
		expect(getResource(resources[0].slug)?.id).toBe(resources[0].id);
		expect(getPost(posts[0].slug)?.id).toBe(posts[0].id);
		expect(getPage("about")?.title).toBe("About Us");
		expect(getService("does-not-exist")).toBeUndefined();
	});

	it("resolves menus and taxonomy terms", () => {
		expect(getMenu("primary")?.items.length).toBeGreaterThan(0);
		expect(getMenu("footer-services")?.items.length).toBeGreaterThan(0);
		expect(getMenu("footer-resources")?.items.length).toBeGreaterThan(0);
		expect(getTerm("category", "marriage")?.label).toBe("Marriage");
		expect(taxonomies.map((t) => t.name)).toContain("tag");
	});

	it("links posts to their taxonomy terms", () => {
		expect(postsInCategory("marriage").length).toBeGreaterThan(0);
		expect(postsWithTag("instagram").length).toBeGreaterThan(0);
	});

	it("has a local file for every referenced image", () => {
		for (const item of [...services, ...resources, ...posts, ...pages]) {
			expect(imageExists(item.featured_image?.src)).toBe(true);
			expect(imageExists(item.hero_image?.src)).toBe(true);
			expect(imageExists(item.side_image?.src)).toBe(true);
		}
		expect(imageExists(settings.logo?.src)).toBe(true);
		for (const banner of banners) {
			expect(imageExists(banner.image)).toBe(true);
		}
		// Image blocks inside page content (e.g. story photo columns).
		for (const page of pages) {
			for (const block of page.content) {
				if (block.type === "image") expect(imageExists(block.src)).toBe(true);
			}
		}
	});

	it("keeps menu urls pointing at real pages", () => {
		for (const menu of menus) {
			for (const item of menu.items) {
				for (const child of item.children ?? []) {
					expect(child.url.startsWith("/")).toBe(true);
				}
			}
		}
	});
});
