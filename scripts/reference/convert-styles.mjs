import { readFileSync, writeFileSync } from "node:fs";

const kebabToCamel = (s) => s.replace(/-([a-z])/g, (_, c) => c.toUpperCase());

function parseCssToObject(css) {
	const pairs = [];
	let i = 0;
	const n = css.length;
	while (i < n) {
		while (i < n && css[i] === " ") i++;
		if (i >= n) break;
		let keyStart = i;
		while (i < n && css[i] !== ":") i++;
		const key = css.slice(keyStart, i).trim();
		i++;
		while (i < n && css[i] === " ") i++;
		let valStart = i;
		let depth = 0;
		while (i < n) {
			const ch = css[i];
			if (ch === "(") depth++;
			if (ch === ")") depth--;
			if (ch === ";" && depth === 0) break;
			i++;
		}
		const val = css.slice(valStart, i).trim();
		if (key && val) {
			const escaped = val.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
			pairs.push(`${kebabToCamel(key)}: "${escaped}"`);
		}
		if (i < n && css[i] === ";") i++;
	}
	return `{ ${pairs.join(", ")} }`;
}

for (const file of process.argv.slice(2)) {
	let input = readFileSync(file, "utf8");
	let out = input.replace(/style="([^"]*)"/g, (_m, css) => `style={${parseCssToObject(css)}}`);
	if (out !== input) {
		writeFileSync(file, out);
		console.log("updated", file);
	} else {
		console.log("no string styles in", file);
	}
}
