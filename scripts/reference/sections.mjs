// Prints top-level section boxes (y, h) per width for one page, for layout QA.
// Usage: node scripts/reference/sections.mjs <page>
import { existsSync, readFileSync } from "node:fs";
const page = process.argv[2];
const rows = new Map();
for (const w of [1440, 1024, 390]) {
	const f = `discovery/specs/raw/${page}-${w}.json`;
	if (!existsSync(f)) continue;
	const s = JSON.parse(readFileSync(f, "utf8"));
	for (const d of s.documents) {
		const kids = d.type === "header" || d.type === "footer" ? [{ id: d.type, box: d.box }] : d.children;
		for (const c of kids) {
			const k = c.id;
			if (!rows.has(k)) rows.set(k, { k, type: c.type ?? d.type });
			rows.get(k)[w] = `${c.box[1]}+${c.box[3]}`;
		}
	}
	if (s.helloMain) (rows.get("hello-main") ?? rows.set("hello-main", { k: "hello-main", type: "main" }).get("hello-main"))[w] = `${s.helloMain.box[1]}+${s.helloMain.box[3]}`;
	(rows.get("page") ?? rows.set("page", { k: "page", type: "total" }).get("page"))[w] = `h=${s.pageHeight}`;
}
console.log("| section | 1440 (y+h) | 1024 | 390 |\n|---|---|---|---|");
for (const r of rows.values()) console.log(`| ${r.type} \`${r.k}\` | ${r[1440] ?? "–"} | ${r[1024] ?? "–"} | ${r[390] ?? "–"} |`);
