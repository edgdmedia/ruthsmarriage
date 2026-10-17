// Turns a spec tree from capture.mjs into a compact, readable outline.
// Usage: node scripts/reference/outline.mjs discovery/specs/raw/home-1440.json [--skip-chrome]
import { readFileSync } from "node:fs";

const file = process.argv[2];
const skipChrome = process.argv.includes("--skip-chrome");
const spec = JSON.parse(readFileSync(file, "utf8"));

const ABBR = {
	display: "d", flexDirection: "dir", flexWrap: "wrap", justifyContent: "jc", alignItems: "ai", gap: "gap",
	width: "w", maxWidth: "maxw", minHeight: "minh", backgroundColor: "bg", backgroundImage: "bgimg", backgroundSize: "bgsize",
	backgroundPosition: "bgpos", borderRadius: "radius", boxShadow: "shadow", fontFamily: "ff", fontSize: "fs", fontWeight: "fw",
	lineHeight: "lh", letterSpacing: "ls", color: "c", textAlign: "ta", textTransform: "tt", fontStyle: "fst", textDecorationLine: "td",
	position: "pos", zIndex: "z", overflow: "ovf", opacity: "op", top: "top", borderTop: "bt", borderBottom: "bb", borderLeft: "bl",
	borderRight: "br", textShadow: "tsh", transform: "tf", marginTop: "mt", marginBottom: "mb",
};
const SKIP = new Set(["id", "type", "cls", "box", "children", "parts", "text", "html", "settings", "shapes", "items", "carousel", "sliderOptions", "grid", "tag", "src", "natural", "alt", "objectFit", "href", "svg", "item", "template", "paddingTop", "paddingRight", "paddingBottom", "paddingLeft"]);
const rgb = (v) => String(v).replace(/rgba?\((\d+), (\d+), (\d+)(?:, ([\d.]+))?\)/g, (_, r, g, b, a) => "#" + [r, g, b].map((x) => (+x).toString(16).padStart(2, "0")).join("").toUpperCase() + (a && a !== "1" ? `/${a}` : ""));
const pad = (n) => {
	const p = [n.paddingTop, n.paddingRight, n.paddingBottom, n.paddingLeft].map((x) => x || "0px");
	return p.every((x) => x === "0px") ? "" : ` pad=${p.join(" ").replace(/px/g, "")}`;
};
const styles = (n) =>
	Object.entries(n)
		.filter(([k]) => !SKIP.has(k))
		.map(([k, v]) => `${ABBR[k] || k}=${rgb(v)}`)
		.join(" ") + pad(n);
const b = (x) => (x ? `@${x.join(",")}` : "");

const lines = [];
const out = (d, s) => lines.push("  ".repeat(d) + s);
const node = (n, d) => {
	if (n.item) {
		out(d, `• item tpl=${n.template ?? "-"} ${b(n.box)}`);
		(n.children || []).forEach((c) => (c.tag ? leaf(c, d + 1) : node(c, d + 1)));
		return;
	}
	let head = `[${n.type}${n.id ? " " + n.id : ""}] ${b(n.box)} ${styles(n)}`;
	if (n.cls && /hidden|sticky|invisible|animated/.test(n.cls)) head += ` cls="${n.cls.match(/\S*(hidden|sticky|invisible|animated)\S*/g).join(" ")}"`;
	if (n.items != null) head += ` items=${n.items} carousel=${n.carousel} grid=${rgb(JSON.stringify(n.grid))}`;
	out(d, head.trim());
	if (n.settings) out(d + 1, `settings: ${JSON.stringify(n.settings)}`);
	if (n.sliderOptions) out(d + 1, `slider: ${n.sliderOptions}`);
	(n.shapes || []).forEach((s) => out(d + 1, `shape ${s.pos} ${b(s.box)} fill=${rgb(s.fill)}`));
	if (n.html) out(d + 1, `html: ${n.html.slice(0, 300)}`);
	if (n.text && !n.parts?.length) out(d + 1, `"${n.text.slice(0, 200)}"`);
	(n.parts || []).forEach((p) => leaf(p, d + 1));
	(n.children || []).forEach((c) => (c.tag ? leaf(c, d + 1) : node(c, d + 1)));
};
const leaf = (p, d) => {
	let s = `<${p.tag}> ${b(p.box)} ${styles(p)}`;
	if (p.src) s += ` src=${p.src} natural=${p.natural} fit=${p.objectFit}${p.alt ? ` alt="${p.alt}"` : ""}`;
	if (p.href) s += ` href=${p.href}`;
	if (p.text) s += ` "${p.text.slice(0, 160)}"`;
	out(d, s.trim());
};

out(0, `# ${spec.url} viewport=${spec.viewport} height=${spec.pageHeight}`);
for (const doc of spec.documents) {
	if (skipChrome && (doc.type === "header" || doc.type === "footer")) {
		out(0, `## ${doc.type} ${doc.id} ${b(doc.box)} (see _global)`);
		continue;
	}
	out(0, `## ${doc.type} ${doc.id} ${b(doc.box)}`);
	doc.children.forEach((c) => node(c, 1));
}
if (spec.helloMain) {
	out(0, `## hello-theme main ${b(spec.helloMain.box)} ${styles(spec.helloMain)}`);
	spec.helloMain.parts.forEach((p) => leaf(p, 1));
}
console.log(lines.join("\n"));
