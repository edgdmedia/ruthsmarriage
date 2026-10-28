import { describe, expect, it } from "vitest";
import { mapResource, mapService } from "../src/data";
import type { Resource, Service } from "../src/data/types";

/* Unit tests of the EmDash → template mappers (phase 9a.4): a fixture entry
   in, the template type out. The data functions themselves are thin EmDash
   queries; the mapping is where behaviour lives. */

const fixtureTerms = {
	service_type: [{ slug: "married", label: "Married", name: "service_type" }],
};

const serviceEntry = {
	id: "private-premarital-counseling-classes",
	data: {
		status: "published",
		order: 3,
		publishedAt: new Date("2025-01-02T03:04:05Z"),
		title: "Private Premarital Counseling Classes",
		featured_image: { meta: { storageKey: "cover.png" }, alt: "cover" },
		price_label: "₦20,000",
		audience_label: "(For Engaged Couples)",
		format: "Virtual (Zoom)",
		notice: "Booking notice",
		booking_url: "https://selar.co/booking",
		links: [
			{ label: "Selar", link: "https://selar.co/x" },
			{ label: "Empty", link: "" },
			{ label: "No link field", link: null },
		],
		content: [{ _type: "block", style: "normal", children: [{ _type: "span", text: "Hello" }] }],
		terms: fixtureTerms,
	},
	edit: {},
};

const resourceEntry = {
	id: "52-rules-of-dating-and-relationships",
	data: {
		status: "published",
		order: 1,
		publishedAt: null,
		title: "52 Rules of Dating and Relationships",
		featured_image: { src: "https://example.com/a.png", alt: "a" },
		badge_label: "Learn More",
		links: [{ label: "Selar (ebook)", link: "https://selar.co/4486h3" }],
		video_url: null,
		excerpt: null,
		content: [],
		terms: {
			resource_type: [
				{ slug: "book", label: "Book", name: "resource_type" },
			],
		},
	},
	edit: {},
};

describe("EmDash mappers", () => {
	it("maps a service entry to the template Service", () => {
		const s = mapService(serviceEntry) as Service;
		expect(s).not.toBeNull();
		expect(s.slug).toBe("private-premarital-counseling-classes");
		expect(s.title).toBe("Private Premarital Counseling Classes");
		expect(s.booking_url).toBe("https://selar.co/booking");
		expect(s.publishedAt).toBe("2025-01-02T03:04:05.000Z");
		// Media-library values resolve to the media file route.
		expect(s.featured_image).toEqual({ src: "/_emdash/api/media/file/cover.png", alt: "cover" });
		expect(s.terms?.service_type).toEqual([{ slug: "married", label: "Married" }]);
	});

	it("keeps only links that have a link", () => {
		const s = mapService(serviceEntry) as Service;
		expect(s.links).toEqual([{ label: "Selar", url: "https://selar.co/x" }]);
	});

	it("maps a resource entry to the template Resource", () => {
		const r = mapResource(resourceEntry) as Resource;
		expect(r.slug).toBe("52-rules-of-dating-and-relationships");
		expect(r.badge_label).toBe("Learn More");
		// The links repeater reads `link`, not the old CTA `url`.
		expect(r.links).toEqual([{ label: "Selar (ebook)", url: "https://selar.co/4486h3" }]);
		expect(r.terms?.resource_type).toEqual([{ slug: "book", label: "Book" }]);
		expect(r.featured_image).toEqual({ src: "https://example.com/a.png", alt: "a" });
	});

	it("falls back safely on absent fields", () => {
		const r = mapResource({ id: "x", data: { status: "published", title: "X" }, edit: {} }) as Resource;
		expect(r.links).toEqual([]);
		expect(r.terms).toEqual({});
		expect(r.featured_image).toBeNull();
		// Owner (2026-10-28): badge defaults to "Learn More" when unset.
		expect(r.badge_label).toBe("Learn More");
		expect(r.video_url).toBeNull();
	});

	it("defaults the badge on an empty-string badge_label too", () => {
		const r = mapResource({ id: "x", data: { status: "published", title: "X", badge_label: "  " }, edit: {} }) as Resource;
		expect(r.badge_label).toBe("Learn More");
	});
});
