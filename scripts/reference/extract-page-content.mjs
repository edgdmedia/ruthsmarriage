// Phase 5 — pull the real body copy out of the captured WordPress pages and write
// it back into seed/seed.json.
//
// The captures in discovery/raw/html are server-rendered Elementor (or Gutenberg)
// pages. Rather than re-implement Elementor, this script walks the rendered DOM
// and turns each widget into a typed content block:
//
//   heading | paragraph | image | button | iconBox | list | quote | divider |
//   video | html | listing | hero | icon
//
// The result is a flat, ordered block list per page — the copy and the assets,
// without the Elementor layout. The layout is the job of the page maps
// (migration-plan/page-maps/), which stay the 1:1 spec.
//
// Usage: node scripts/reference/extract-page-content.mjs [--dry]
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
	parse,
	find,
	findAll,
	childrenOf,
	text,
	innerHTML,
	outerHTML,
	classList,
	decodeEntities,
} from "./lib/html-tree.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const htmlDir = join(root, "discovery/raw/html");
const cssDir = join(root, "discovery/raw/css");
const seedPath = join(root, "seed/seed.json");
const dry = process.argv.includes("--dry");

const seed = JSON.parse(readFileSync(seedPath, "utf8"));

// ---------------------------------------------------------------- helpers

/** Strip scripts, styles and inline event handlers out of a chunk of HTML. */
function sanitize(html) {
	return html
		.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
		.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "")
		.replace(/\son[a-z]+\s*=\s*"[^"]*"/gi, "")
		.replace(/\son[a-z]+\s*=\s*'[^']*'/gi, "");
}

/** Decode CF-obfuscated emails, tidy mailto links, and strip unsafe markup. */
function cleanHtml(html) {
	html = sanitize(html);
	if (html.includes("data-cfemail")) {
		html = decodeCFEmail(html);
		html = html.replace(
			/<a href="https:\/\/web\.archive\.org\/web\/[^"]*mailto:([^"]+)"[^>]*>([^<]*)<\/a>/g,
			'<a href="mailto:$1">$2</a>',
		);
	}
	return html;
}

/** Decode Cloudflare's email obfuscation (`__cf_email__`) back to plain text. */
function decodeCFEmail(input) {
	if (typeof input !== "string") return input;
	return input.replace(
		/<span[^>]*class="__cf_email__"[^>]*data-cfemail="([0-9a-fA-F]+)"[^>]*>[^<]*<\/span>/g,
		(full, hex) => {
			const key = parseInt(hex.slice(0, 2), 16);
			let out = "";
			for (let i = 2; i + 1 < hex.length; i += 2) {
				out += String.fromCodePoint(parseInt(hex.slice(i, i + 2), 16) ^ key);
			}
			return out;
		},
	);
}

/** The plain text of a node, entities decoded and whitespace collapsed. */
const plain = (node) => decodeEntities(text(node));

/** Replace an Elementor drop-cap span with just its letter, then drop any residue. */
function stripDropCap(html) {
	return html
		.replace(
			/<span class="elementor-drop-cap">\s*<span class="elementor-drop-cap-letter">([^<]*)<\/span>\s*<\/span>/g,
			"$1",
		)
		.replace(/<span class="elementor-drop-cap">[\s\S]*<\/span>\s*/g, "");
}

/** Read the per-post Elementor stylesheet and index the background images by element id. */
function readBackgroundImages(elementorId) {
	const file = join(cssDir, `post-${elementorId}.css`);
	const map = new Map();
	if (!existsSync(file)) return map;
	const css = readFileSync(file, "utf8");
	const re = /elementor-element-([0-9a-f]{7})[^{]*\{[^}]*background-image:\s*url\(["']?([^"')]+)["']?\)/g;
	let m;
	while ((m = re.exec(css))) {
		if (!map.has(m[1])) map.set(m[1], m[2]);
	}
	// Inline <style> blocks inside the page carry the same declarations.
	return map;
}

/** The background image of an element, from the page's own <style> blocks. */
function inlineBackgrounds(rootNode) {
	const map = new Map();
	for (const style of findAll(rootNode, (n) => n.tag === "style")) {
		const css = style.raw || "";
		const re = /elementor-element-([0-9a-f]{7})[^{]*\{[^}]*background-image:\s*url\(["']?([^"')]+)["']?\)/g;
		let m;
		while ((m = re.exec(css))) {
			if (!map.has(m[1])) map.set(m[1], m[2]);
		}
	}
	return map;
}

const slugify = (value) =>
	String(value || "")
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");

// ---------------------------------------------------------------- widget handlers

/** The icon name of an inline SVG (Elementor writes it as `e-far-heart`). */
function svgIcon(node) {
	const svg = find(node, (n) => n.tag === "svg");
	if (!svg) return "";
	const cls = svg.attrs.class || "";
	const match = cls.match(/\be-(fa[srlbd]?|far|fas)-([\w-]+)\b/);
	if (match) return `${match[1]}-${match[2]}`;
	const fa = cls.match(/\bfa[srlbd]?\s+fa-([\w-]+)\b/);
	return fa ? fa[1] : "";
}

/** One block from a single element inside a text-editor widget. */
function blockFromElement(el, dropCap) {
	switch (el.tag) {
		case "p": {
			let html = cleanHtml(stripDropCap(innerHTML(el)));
			const t = plain(el);
			if (!t.trim()) return null;
			return { type: "paragraph", html, ...(dropCap ? { dropCap: true } : {}) };
		}
		case "h1":
		case "h2":
		case "h3":
		case "h4":
		case "h5":
		case "h6":
			return {
				type: "heading",
				level: Number(el.tag[1]),
				text: plain(el),
				html: innerHTML(el),
			};
		case "ul":
		case "ol":
			return {
				type: "list",
				ordered: el.tag === "ol",
				items: childrenOf(el, (n) => n.tag === "li").map((li) => plain(li)),
			};
		case "blockquote":
			return { type: "quote", html: innerHTML(el) };
		case "figure": {
			const img = find(el, (n) => n.tag === "img");
			if (!img) return null;
			return {
				type: "image",
				src: img.attrs.src || "",
				alt: img.attrs.alt || "",
			};
		}
		case "img":
			return { type: "image", src: el.attrs.src || "", alt: el.attrs.alt || "" };
		case "br":
			return null;
		default:
			return { type: "html", html: cleanHtml(outerHTML(el)) };
	}
}

function handleWidget(node, widgetType, ctx) {
	const short = widgetType.replace(/\.default$/, "");

	switch (short) {
		case "heading": {
			const title = find(node, (n) => classList(n).includes("elementor-heading-title"));
			if (!title) return [];
			const level = /^h([1-6])$/.exec(title.tag)?.[1] ?? "2";
			return [
				{
					type: "heading",
					level: Number(level),
					text: plain(title),
					html: innerHTML(title),
				},
			];
		}

		case "text-editor": {
			const container =
				find(node, (n) => classList(n).includes("elementor-widget-container")) || node;
			const settings = node.attrs["data-settings"] || "";
			const dropCap = /"drop_cap":"yes"/.test(settings);
			const blocks = [];
			let first = dropCap;
			for (const el of childrenOf(container)) {
				const block = blockFromElement(el, first);
				if (!block) continue;
				first = false;
				blocks.push(block);
			}
			return blocks;
		}

		case "button": {
			const link = find(node, (n) => n.tag === "a" && classList(n).includes("elementor-button"));
			if (!link) return [];
			const labelNode = find(link, (n) => classList(n).includes("elementor-button-text"));
			const iconNode = find(link, (n) => classList(n).includes("elementor-button-icon"));
			return [
				{
					type: "button",
					label: plain(labelNode || link),
					href: link.attrs.href || "",
					...(iconNode ? { icon: svgIcon(iconNode) } : {}),
				},
			];
		}

		case "divider":
			return [{ type: "divider" }];

		case "icon-box": {
			const title = find(node, (n) => classList(n).includes("elementor-icon-box-title"));
			const desc = find(node, (n) => classList(n).includes("elementor-icon-box-description"));
			const iconWrap = find(node, (n) => classList(n).includes("elementor-icon-box-icon"));
			return [
				{
					type: "iconBox",
					icon: iconWrap ? svgIcon(iconWrap) : "",
					title: plain(title || node),
					text: desc ? plain(desc) : "",
				},
			];
		}

		case "icon": {
			const iconWrap = find(node, (n) => classList(n).includes("elementor-icon"));
			return [{ type: "icon", icon: iconWrap ? svgIcon(iconWrap) : svgIcon(node) }];
		}

		case "video": {
			const frame = find(node, (n) => n.tag === "iframe");
			if (!frame) return [];
			return [
				{
					type: "video",
					src: frame.attrs.src || "",
					title: frame.attrs.title || "",
				},
			];
		}

		case "html":
		case "shortcode": {
			const container =
				find(node, (n) => classList(n).includes("elementor-widget-container")) || node;
			const html = cleanHtml(innerHTML(container)).trim();
			return html ? [{ type: "html", html }] : [];
		}

		case "jet-listing-grid": {
			const grid = find(node, (n) => classList(n).includes("jet-listing-grid__items"));
			let settings = {};
			try {
				settings = JSON.parse(grid?.attrs["data-nav"] || "{}").widget_settings || {};
			} catch {
				settings = {};
			}
			return [
				{
					type: "listing",
					listingId: settings.lisitng_id ?? settings.listing_id ?? null,
					postType: ctx.listingPostType || null,
					limit: settings.posts_num ?? null,
					columns: settings.columns ?? null,
				},
			];
		}

		case "jet-engine-component-377":
		case "jet-engine-component-394": {
			// The page hero: a JetEngine component that paints a background image
			// and carries the page title.
			const container = find(node, (n) => n.attrs["data-element_type"] === "container");
			const titleNode = find(node, (n) => classList(n).includes("elementor-heading-title"));
			const image =
				(container && ctx.backgrounds.get(container.attrs["data-id"])) ||
				findAll(node, (n) => n.tag === "style")
					.map((s) => (s.raw || "").match(/background-image:\s*url\(["']?([^"')]+)/))
					.find(Boolean)?.[1] ||
				"";
			return [
				{
					type: "hero",
					title: plain(titleNode || node),
					image,
					variant: short.endsWith("394") ? "pattern" : "photo",
				},
			];
		}

		case "posts.classic":
			return [{ type: "listing", listingId: "posts", postType: "posts", limit: null, columns: null }];

		default:
			return [];
	}
}

// ---------------------------------------------------------------- page extraction

/** Walk an Elementor container and collect its widgets in document order. */
function collectWidgets(node, out, ctx) {
	for (const child of childrenOf(node)) {
		const widgetType = child.attrs["data-widget_type"];
		if (widgetType) {
			out.push(...handleWidget(child, widgetType, ctx));
			continue; // nested widgets belong to their parent widget
		}
		if (child.attrs["data-element_type"] === "container") {
			// A column with its own background image contributes an image block.
			const bg = ctx.backgrounds.get(child.attrs["data-id"]);
			if (bg && !ctx.heroContainerIds.has(child.attrs["data-id"])) {
				out.push({ type: "image", src: bg, alt: "", background: true });
			}
		}
		collectWidgets(child, out, ctx);
	}
}

/** Extract the blocks of a Gutenberg (block-editor) page. */
function extractGutenberg(main) {
	const content = find(main, (n) => classList(n).includes("page-content"));
	const scope = content || main;
	const blocks = [];
	for (const el of childrenOf(scope)) {
		if (el.tag === "header") {
			const h1 = find(el, (n) => /^h[1-6]$/.test(n.tag));
			if (h1) blocks.push({ type: "heading", level: 1, text: plain(h1), html: innerHTML(h1) });
			continue;
		}
		const block = blockFromElement(el, false);
		if (block) blocks.push(block);
	}
	return blocks;
}

/** Extract one page from its HTML dump. */
function extractPage(slug) {
	const file = join(htmlDir, `${slug}.html`);
	if (!existsSync(file)) return null;
	const html = readFileSync(file, "utf8");
	const doc = parse(html);

	const pageRoot = find(doc, (n) => n.attrs["data-elementor-type"] === "wp-page");
	if (!pageRoot) {
		const main = find(doc, (n) => n.tag === "main");
		if (!main) return null;
		return { blocks: extractGutenberg(main), elementorId: null };
	}

	const elementorId = pageRoot.attrs["data-elementor-id"];
	const backgrounds = new Map([
		...readBackgroundImages(elementorId),
		...inlineBackgrounds(pageRoot),
	]);

	// The hero container's own background is the hero image, not a content image.
	const heroContainerIds = new Set();
	for (const node of findAll(pageRoot, (n) =>
		n.attrs["data-widget_type"]?.startsWith("jet-engine-component-"),
	)) {
		const container = find(node, (n) => n.attrs["data-element_type"] === "container");
		if (container) heroContainerIds.add(container.attrs["data-id"]);
	}

	// A listing grid tells us which post type the page lists.
	let listingPostType = null;
	const grid = find(pageRoot, (n) => n.attrs["data-widget_type"] === "jet-listing-grid.default");
	if (grid) {
		const items = find(grid, (n) => n.classList?.includes?.("jet-listing-grid__item"));
		const cls = items ? (items.attrs.class || "") : "";
		if (cls.includes("service")) listingPostType = "services";
		else if (cls.includes("resource")) listingPostType = "resources";
		else listingPostType = "posts";
	}

	const ctx = { backgrounds, heroContainerIds, listingPostType };
	const blocks = [];
	for (const section of childrenOf(pageRoot, (n) => n.attrs["data-element_type"] === "container")) {
		collectWidgets(section, blocks, ctx);
	}
	return { blocks, elementorId };
}

// ---------------------------------------------------------------- run

const pages = seed.content?.pages || [];
const report = [];

for (const page of pages) {
	const slug = page.slug;
	const result = extractPage(slug);
	if (!result) {
		report.push({ slug, status: "no capture" });
		continue;
	}
	const blocks = result.blocks;

	const hero = blocks.find((b) => b.type === "hero");
	const data = page.data || {};

	// Named fields the page maps ask for.
	const next = {
		...data,
		hero_title: hero ? hero.title : data.hero_title ?? null,
		hero_image: hero && hero.image ? { $media: { url: hero.image, alt: "" } } : data.hero_image ?? null,
		content: blocks.filter(
			(b) => b.type !== "hero" && !(b.type === "image" && b.background),
		),
	};
	if (hero) next.hero_variant = hero.variant;

	// The photo column of the story section (about / our-story / founder).
	const sideImage = blocks.find((b) => b.type === "image" && b.background);
	if (sideImage) next.side_image = { $media: { url: sideImage.src, alt: "" } };

	// "Our Values" is four icon boxes on the about page.
	const iconBoxes = blocks.filter((b) => b.type === "iconBox");
	if (iconBoxes.length === 4 && /values/i.test(blocks.map((b) => b.text || "").join(" "))) {
		next.values = iconBoxes.map((b) => ({ icon: b.icon, title: b.title, text: b.text }));
	}

	page.data = next;
	report.push({
		slug,
		status: "ok",
		blocks: next.content.length,
		words: next.content
			.map((b) => (b.text || b.label || b.items?.join(" ") || b.html || ""))
			.join(" ")
			.split(/\s+/)
			.filter(Boolean).length,
	});
}

console.log(report.map((r) =>
	r.status === "ok"
		? `${r.slug.padEnd(26)} ${String(r.blocks).padStart(3)} blocks  ${String(r.words).padStart(5)} words`
		: `${r.slug.padEnd(26)} ${r.status}`,
).join("\n"));

if (!dry) {
	writeFileSync(seedPath, JSON.stringify(seed, null, "\t") + "\n");
	console.log("\nseed/seed.json updated");
}
