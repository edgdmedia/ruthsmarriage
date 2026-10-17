// Lists what changes between widths for one page: per Elementor element id (first occurrence),
// prints props that differ at 1024 / 390 versus 1440, plus elements hidden at a width.
// Usage: node scripts/reference/responsive.mjs home [--skip-chrome]
import { existsSync, readFileSync } from "node:fs";

const page = process.argv[2];
const skipChrome = process.argv.includes("--skip-chrome");
const WIDTHS = [1440, 1024, 390];
const PROPS = ["display", "flexDirection", "flexWrap", "justifyContent", "alignItems", "gap", "minHeight", "paddingTop", "paddingRight", "paddingBottom", "paddingLeft", "fontSize", "lineHeight", "fontWeight", "textAlign", "backgroundSize", "backgroundPosition", "borderRadius", "letterSpacing"];

const collect = (spec) => {
	const map = new Map();
	const visit = (n, path) => {
		if (!n || typeof n !== "object") return;
		if (n.item) return n.children?.forEach((c, i) => visit(c, `${path}/item`));
		const key = n.id ? `${n.type} ${n.id}` : null;
		if (key && !map.has(key)) {
			const firstPart = n.parts?.find((p) => p.fontSize) || null;
			const props = {};
			for (const p of PROPS) if (n[p] != null) props[p] = n[p];
			if (firstPart) for (const p of ["fontSize", "lineHeight", "fontWeight", "textAlign", "paddingTop", "paddingRight"]) if (firstPart[p] != null) props[`<${firstPart.tag}>.${p}`] = firstPart[p];
			props.w = n.box?.[2];
			props.h = n.box?.[3];
			map.set(key, { props, text: (n.parts?.[0]?.text || n.text || "").slice(0, 40) });
		}
		n.children?.forEach((c) => visit(c, path));
	};
	for (const doc of spec.documents) {
		if (skipChrome && (doc.type === "header" || doc.type === "footer")) continue;
		doc.children.forEach((c) => visit(c, doc.type));
	}
	return map;
};

const specs = WIDTHS.map((w) => {
	const f = `discovery/specs/raw/${page}-${w}.json`;
	return existsSync(f) ? collect(JSON.parse(readFileSync(f, "utf8"))) : new Map();
});
const [desk, ...others] = specs;
for (const [key, { props, text }] of desk) {
	const changes = [];
	others.forEach((m, i) => {
		const o = m.get(key);
		const w = WIDTHS[i + 1];
		if (!o) return changes.push(`@${w}: HIDDEN/absent`);
		if (o.props.w === 0 || o.props.h === 0) return changes.push(`@${w}: hidden (0 size)`);
		const diff = Object.entries(o.props)
			.filter(([k, v]) => k !== "w" && k !== "h" && props[k] !== v)
			.map(([k, v]) => `${k}=${v}`);
		if (props.h && o.props.h && Math.abs(o.props.h - props.h) > 4) diff.push(`h=${o.props.h}`);
		if (diff.length) changes.push(`@${w}: ${diff.join(" ")}`);
	});
	if (changes.length) console.log(`${key} "${text}"  desk h=${props.h}\n    ${changes.join("\n    ")}`);
}
// Elements only present on smaller widths (mobile-only widgets)
others.forEach((m, i) => {
	for (const [key, { text }] of m) if (!desk.has(key)) console.log(`${key} "${text}" ONLY @${WIDTHS[i + 1]}`);
});
