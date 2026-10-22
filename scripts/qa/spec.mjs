// Looks up nodes in a captured live spec tree by id (or lists the tree with boxes).
// Usage: node scripts/qa/spec.mjs <page> <width> [id] [--tree]
//   node scripts/qa/spec.mjs home 1440 1e0d83a        → that node's box + children
//   node scripts/qa/spec.mjs home 1440 --tree         → the whole tree, indented
import { readFileSync } from "node:fs";
import { join } from "node:path";

const [page, width, id, ...rest] = process.argv.slice(2);
const file = join("discovery/specs/raw", `${page}-${width}.json`);
const spec = JSON.parse(readFileSync(file, "utf8"));
const tree = !!rest.includes("--tree");

const find = (node, target) => {
	if (!node) return null;
	if (node.id === target) return node;
	for (const c of node.children || []) {
		const hit = find(c, target);
		if (hit) return hit;
	}
	return null;
};

const lookup = (target) => {
	for (const doc of spec.documents) {
		if (doc.id === target) return doc;
		const hit = find(doc, target);
		if (hit) return hit;
	}
	return null;
};

if (tree) {
	const out = [];
	const walk = (n, d) => {
		const label = n.text ? ` "${String(n.text).slice(0, 40).replace(/\s+/g, " ")}"` : "";
		out.push(
			"  ".repeat(d) +
				`${n.id || n.tag || n.type} ${n.type || ""} [${(n.box || []).join(",")}]${label}`,
		);
		(n.children || []).forEach((c) => walk(c, d + 1));
	};
	spec.documents.forEach((d) => {
		out.push(`## ${d.type} ${d.id} [${d.box.join(",")}]`);
		(d.children || []).forEach((c) => walk(c, 1));
	});
	console.log(out.join("\n"));
} else if (id) {
	const node = lookup(id);
	if (!node) {
		console.log(`not found: ${id}`);
	} else {
		const out = [];
		const walk = (n, d) => {
			out.push(
				"  ".repeat(d) +
					`${n.id || n.tag || n.type} ${n.type || ""} [${(n.box || []).join(",")}]` +
					(n.text ? ` "${String(n.text).slice(0, 50).replace(/\s+/g, " ")}"` : ""),
			);
			(n.children || []).forEach((c) => walk(c, d + 1));
		};
		walk(node, 0);
		console.log(out.join("\n"));
	}
} else {
	console.log("usage: spec.mjs <page> <width> [id] [--tree]");
}
