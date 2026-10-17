import { readFileSync, writeFileSync } from "node:fs";

for (const file of process.argv.slice(2)) {
	let input = readFileSync(file, "utf8");
	const out = input.replace(/<style>\{`[\s\S]*?`}<\/style>\n?/g, "");
	if (out !== input) {
		writeFileSync(file, out);
		console.log("removed style block from", file);
	} else {
		console.log("no style block in", file);
	}
}
