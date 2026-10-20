// A small, tolerant HTML tree parser.
//
// The WordPress dumps in discovery/raw/html are server-rendered Elementor pages.
// They are well enough formed that a simple tag scanner gives us a tree we can
// walk, which is far more reliable than regular expressions for pulling the
// content out of nested Elementor containers.
//
// Usage:
//   import { parse, text, innerHTML, outerHTML, findAll, classList } from "./html-tree.mjs";
//   const root = parse(html);
//   const nodes = findAll(root, (n) => n.attrs["data-widget_type"]);

const VOID = new Set([
	"area", "base", "br", "col", "embed", "hr", "img", "input",
	"link", "meta", "param", "source", "track", "wbr",
]);

// Elements whose content is raw text, not markup.
const RAW_TEXT = new Set(["script", "style", "textarea", "title"]);

/** Find the `>` that ends a tag, skipping any inside quoted attribute values. */
function findTagEnd(html, start) {
	let quote = null;
	for (let i = start; i < html.length; i++) {
		const c = html[i];
		if (quote) {
			if (c === quote) quote = null;
			continue;
		}
		if (c === '"' || c === "'") {
			quote = c;
			continue;
		}
		if (c === ">") return i;
	}
	return html.length;
}

/** Parse an attribute list (`a="1" b='2' c`) into a plain object. */
function parseAttrs(src) {
	const attrs = {};
	const re = /([a-zA-Z_:][-\w:.]*)\s*(?:=\s*("([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g;
	let m;
	while ((m = re.exec(src))) {
		const name = m[1].toLowerCase();
		const value = m[3] ?? m[4] ?? m[5] ?? "";
		attrs[name] = decodeEntities(value);
	}
	return attrs;
}

const NAMED = {
	amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ",
	hellip: "…", mdash: "—", ndash: "–", lsquo: "‘",
	rsquo: "’", ldquo: "“", rdquo: "”", times: "×",
};

/** Decode the HTML entities WordPress leaves in titles and text. */
export function decodeEntities(input) {
	if (typeof input !== "string") return input;
	return input.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (full, body) => {
		if (body[0] === "#") {
			const code =
				body[1] === "x" || body[1] === "X"
					? parseInt(body.slice(2), 16)
					: parseInt(body.slice(1), 10);
			if (Number.isFinite(code) && code > 0 && code <= 0x10ffff) {
				try {
					return String.fromCodePoint(code);
				} catch {
					return full;
				}
			}
			return full;
		}
		const named = NAMED[body.toLowerCase()];
		return named ?? full;
	});
}

/**
 * Parse an HTML string into a tree.
 * Node shape: { tag, attrs, children: Node[], raw?: string }
 */
export function parse(html) {
	const root = { tag: "#root", attrs: {}, children: [] };
	const stack = [root];
	let i = 0;

	const pushText = (text) => {
		if (!text) return;
		stack[stack.length - 1].children.push({ tag: "#text", text, children: [] });
	};

	while (i < html.length) {
		const lt = html.indexOf("<", i);
		if (lt === -1) {
			pushText(html.slice(i));
			break;
		}
		if (lt > i) pushText(html.slice(i, lt));

		if (html.startsWith("<!--", lt)) {
			const end = html.indexOf("-->", lt + 4);
			i = end === -1 ? html.length : end + 3;
			continue;
		}
		if (html.startsWith("<!", lt) || html.startsWith("<?", lt)) {
			const end = html.indexOf(">", lt);
			i = end === -1 ? html.length : end + 1;
			continue;
		}
		if (html.startsWith("</", lt)) {
			const end = html.indexOf(">", lt);
			const tag = html.slice(lt + 2, end === -1 ? html.length : end).trim().toLowerCase();
			for (let k = stack.length - 1; k > 0; k--) {
				if (stack[k].tag === tag) {
					stack.length = k;
					break;
				}
			}
			i = end === -1 ? html.length : end + 1;
			continue;
		}

		const end = findTagEnd(html, lt);
		const raw = html.slice(lt + 1, end);
		const m = /^([a-zA-Z][\w:-]*)/.exec(raw);
		if (!m) {
			i = end + 1;
			continue;
		}
		const tag = m[1].toLowerCase();
		const selfClose = /\/\s*$/.test(raw);
		const node = {
			tag,
			attrs: parseAttrs(raw.slice(m[1].length)),
			children: [],
		};
		stack[stack.length - 1].children.push(node);

		if (RAW_TEXT.has(tag)) {
			const close = html.toLowerCase().indexOf(`</${tag}`, end + 1);
			const closeEnd = close === -1 ? html.length : html.indexOf(">", close);
			node.raw = html.slice(end + 1, close === -1 ? html.length : close);
			i = closeEnd === -1 ? html.length : closeEnd + 1;
			continue;
		}
		if (!selfClose && !VOID.has(tag)) stack.push(node);
		i = end + 1;
	}
	return root;
}

/** The classes of a node, as an array. */
export function classList(node) {
	const c = node?.attrs?.class;
	return c ? c.split(/\s+/).filter(Boolean) : [];
}

/** Does the node carry the given class? */
export function hasClass(node, name) {
	return classList(node).includes(name);
}

/** Depth-first walk. `fn` may return false to skip a node's children. */
export function walk(node, fn) {
	for (const child of node.children || []) {
		if (child.tag === "#text") continue;
		if (fn(child) === false) continue;
		walk(child, fn);
	}
}

/** All descendants matching `predicate`, in document order. */
export function findAll(node, predicate) {
	const out = [];
	walk(node, (n) => {
		if (predicate(n)) out.push(n);
	});
	return out;
}

/** First descendant matching `predicate`. */
export function find(node, predicate) {
	return findAll(node, predicate)[0] || null;
}

/** Direct children matching `predicate`. */
export function childrenOf(node, predicate) {
	return (node?.children || []).filter(
		(c) => c.tag !== "#text" && (!predicate || predicate(c)),
	);
}

/** The concatenated, whitespace-collapsed text of a node and its descendants. */
export function text(node) {
	if (!node) return "";
	if (node.tag === "#text") return node.text || "";
	const own = node.raw || "";
	const kids = (node.children || []).map(text).join("");
	return (own + kids).replace(/\s+/g, " ").trim();
}

/** The text of a node without collapsing — used for attribute-free comparisons. */
export function rawText(node) {
	if (!node) return "";
	if (node.tag === "#text") return node.text || "";
	const own = node.raw || "";
	const kids = (node.children || []).map(rawText).join("");
	return own + kids;
}

/** Serialise a node's children back to HTML. */
export function innerHTML(node) {
	return (node?.children || []).map(outerHTML).join("");
}

/** Serialise a node back to HTML. */
export function outerHTML(node) {
	if (!node) return "";
	if (node.tag === "#text") return node.text || "";
	const attrs = Object.entries(node.attrs || {})
		.map(([k, v]) => (v === "" ? ` ${k}` : ` ${k}="${escapeAttr(v)}"`))
		.join("");
	if (VOID.has(node.tag)) return `<${node.tag}${attrs}>`;
	if (RAW_TEXT.has(node.tag)) return `<${node.tag}${attrs}>${node.raw || ""}</${node.tag}>`;
	return `<${node.tag}${attrs}>${innerHTML(node)}</${node.tag}>`;
}

function escapeAttr(value) {
	return String(value)
		.replace(/&/g, "&amp;")
		.replace(/"/g, "&quot;")
		.replace(/</g, "&lt;");
}
