// Visual parity check: new site vs the live reference captured in discovery/.
// For each page × width it screenshots the new site (same browser, viewport and settle rules as
// scripts/reference/capture.mjs), pairs its top-level sections with the live ones in document order,
// reports height/offset drift, and writes a side-by-side image plus a pixel diff.
//
// Usage: node scripts/qa/visual-compare.mjs [--base http://localhost:4321] [--pages home,about] [--widths 1440,1024,390] [--tol 4]
// Output: discovery/qa/<page>-<width>-{local,sbs,diff}.png and discovery/qa/REPORT.md
//
// Section pairing: if the new markup puts data-section="<live container id>" on its top-level sections,
// those ids are matched exactly; otherwise sections are paired by order (header, main children, footer).
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";
import { PAGES, VIEWPORTS } from "../reference/pages.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const arg = (name, fallback) => {
	const i = process.argv.indexOf(`--${name}`);
	return i > -1 ? process.argv[i + 1] : fallback;
};
const base = arg("base", "http://localhost:4321");
const pages = arg("pages", Object.keys(PAGES).join(",")).split(",");
const widths = arg("widths", "1440,1024,390").split(",").map(Number);
const tol = Number(arg("tol", "4"));
const out = join(root, "discovery/qa");
mkdirSync(out, { recursive: true });

const S = ["--session", "visual-compare"];
const ab = (...a) => execFileSync("agent-browser", [...S, ...a], { encoding: "utf8", maxBuffer: 64 << 20 });
const js = (code) => {
	let r = execFileSync("agent-browser", [...S, "eval", "--stdin"], { input: code, encoding: "utf8", maxBuffer: 64 << 20 }).trim();
	if (r.startsWith('"')) r = JSON.parse(r);
	return JSON.parse(r);
};

const settle = `(async () => {
  document.querySelectorAll('.swiper').forEach(s => { s.swiper?.autoplay?.stop(); s.swiper?.slideToLoop?.(0, 0) ?? s.swiper?.slideTo?.(0, 0); });
  const h = document.documentElement.scrollHeight;
  for (let y = 0; y < h; y += 400) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 100)); }
  window.scrollTo(0, 0);
  // Force the web fonts in before measuring: they change the line wrapping, and
  // a late swap reflows the page underneath the screenshot.
  await Promise.allSettled(['600 16px Nunito','700 16px Nunito','800 16px Nunito','500 16px Nunito','400 16px Poppins','italic 400 16px Poppins','500 16px Poppins','600 16px Poppins','600 15px Roboto'].map(f => document.fonts.load(f)));
  await document.fonts.ready;
  // Then wait until the page height stops changing.
  let prev = -1, stable = 0;
  for (let i = 0; i < 30 && stable < 3; i++) {
    const cur = document.documentElement.scrollHeight;
    stable = cur === prev ? stable + 1 : 0;
    prev = cur;
    await new Promise(r => setTimeout(r, 150));
  }
  return JSON.stringify({ fonts: [...document.fonts].filter(f => f.status === 'loaded').map(f => f.family).filter((v, i, a) => a.indexOf(v) === i) });
})()`;

const measure = `JSON.stringify((() => {
  const box = (e) => { const r = e.getBoundingClientRect(); return [Math.round(r.top + scrollY), Math.round(r.height)]; };
  const visible = (e) => e.getBoundingClientRect().height > 0 && !/^(SCRIPT|STYLE|TEMPLATE|LINK)$/.test(e.tagName);
  const tagged = [...document.querySelectorAll('[data-section]')].filter(visible);
  const header = document.querySelector('body > header, body > * > header, header');
  const footer = [...document.querySelectorAll('footer')].pop();
  const rows = [];
  if (header && visible(header)) rows.push({ key: 'header', box: box(header) });
  if (tagged.length) tagged.forEach(e => rows.push({ key: e.dataset.section, box: box(e) }));
  else {
    const main = document.querySelector('main') || document.body;
    [...main.children].filter(e => visible(e) && e !== header && e !== footer && !e.contains(header))
      .forEach((e, i) => rows.push({ key: '#' + i + ' ' + e.tagName.toLowerCase() + (e.className ? '.' + String(e.className).split(' ')[0] : ''), box: box(e) }));
  }
  if (footer && visible(footer)) rows.push({ key: 'footer', box: box(footer) });
  return { rows, page: document.documentElement.scrollHeight };
})())`;

// Live sections from the captured spec tree, in document order.
const liveSections = (spec) => {
	const rows = [];
	for (const d of spec.documents) {
		if (d.type === "header" || d.type === "footer") rows.push({ key: d.type, box: [d.box[1], d.box[3]] });
		else d.children.forEach((c) => rows.push({ key: c.id, type: c.type, box: [c.box[1], c.box[3]] }));
	}
	if (spec.helloMain) rows.push({ key: "hello-main", box: [spec.helloMain.box[1], spec.helloMain.box[3]] });
	return rows.sort((a, b) => a.box[0] - b.box[0]);
};

// Regions to mask before the pixel diff: carousel tracks (live picks slides at
// random per request, so the two sides never show the same cards), the marquee
// (it scrolls) and video frames (iframes). VISUAL-TRACK.md gates on the diff
// with these masked.
// Only carousel listings are masked: on the listing pages (services, resources,
// …) the jet-listing-grid is static and is the content under test.
const maskTypes = new Set(["jet-listing-grid"]);
const maskRegions = (spec, imgW) => {
	const out = [];
	const walk = (n) => {
		if (n.type && maskTypes.has(n.type) && n.carousel && Array.isArray(n.box) && n.box[3] > 0) {
			out.push({ x: n.box[0], y: n.box[1], w: n.box[2], h: n.box[3] });
		}
		(n.children || []).forEach(walk);
	};
	for (const d of spec.documents) {
		if (d.type === "header") {
			// The marquee is the first bar of the header (it scrolls).
			const bar = (d.children || [])[0];
			if (bar && Array.isArray(bar.box)) out.push({ x: bar.box[0], y: bar.box[1], w: bar.box[2], h: bar.box[3] });
		}
		(d.children || []).forEach(walk);
	}
	// The live slider track overflows its container, so the next slide peeks
	// into the last 10px of the layout. The port clips it, so mask that strip.
	if (imgW > 0) out.push({ x: imgW - 10, y: 0, w: 10, h: 100000 });
	return out;
};

/** Paint the given rectangles a flat colour so they don't count as a diff. */
const applyMask = (img, regions) => {
	for (const r of regions) {
		const x0 = Math.max(0, Math.round(r.x));
		const y0 = Math.max(0, Math.round(r.y));
		const x1 = Math.min(img.width, Math.round(r.x + r.w));
		const y1 = Math.min(img.height, Math.round(r.y + r.h));
		for (let y = y0; y < y1; y++) {
			for (let x = x0; x < x1; x++) {
				const i = (y * img.width + x) * 4;
				img.data[i] = 255;
				img.data[i + 1] = 0;
				img.data[i + 2] = 255;
				img.data[i + 3] = 255;
			}
		}
	}
};

const pair = (live, local) => {
	const byKey = new Map(local.map((r) => [r.key, r]));
	const tagged = live.some((l) => byKey.has(l.key) && !["header", "footer"].includes(l.key));
	if (tagged) return live.map((l) => [l, byKey.get(l.key)]);
	const lh = live.filter((r) => !["header", "footer"].includes(r.key));
	const nh = local.filter((r) => !["header", "footer"].includes(r.key));
	const rows = [];
	const h = (k, list) => list.find((r) => r.key === k);
	if (h("header", live)) rows.push([h("header", live), h("header", local)]);
	for (let i = 0; i < Math.max(lh.length, nh.length); i++) rows.push([lh[i], nh[i]]);
	if (h("footer", live)) rows.push([h("footer", live), h("footer", local)]);
	return rows;
};

const diffImages = (livePath, localPath, name, mask = [], rows = []) => {
	const a = PNG.sync.read(readFileSync(livePath));
	const b = PNG.sync.read(readFileSync(localPath));
	const w = Math.min(a.width, b.width);
	const h = Math.min(a.height, b.height);
	const crop = (img) => {
		const o = new PNG({ width: w, height: h });
		for (let y = 0; y < h; y++) img.data.copy(o.data, y * w * 4, y * img.width * 4, y * img.width * 4 + w * 4);
		return o;
	};
	/** Crop a horizontal band of an image, starting at `y0`, `hh` tall. */
	const band = (img, y0, hh) => {
		const bh = Math.max(0, Math.min(hh, img.height - y0));
		const o = new PNG({ width: w, height: bh });
		for (let y = 0; y < bh; y++) {
			img.data.copy(o.data, y * w * 4, (y + y0) * img.width * 4, (y + y0) * img.width * 4 + w * 4);
		}
		return o;
	};
	// Full-page diff: mask the page-absolute regions on both sides.
	const ma = PNG.sync.read(readFileSync(livePath));
	const mb = PNG.sync.read(readFileSync(localPath));
	applyMask(ma, mask);
	applyMask(mb, mask);

	const ca = crop(ma);
	const cb = crop(mb);
	const diff = new PNG({ width: w, height: h });
	const bad = pixelmatch(ca.data, cb.data, diff.data, w, h, { threshold: 0.1 });
	writeFileSync(join(out, `${name}-diff.png`), PNG.sync.write(diff));

	// Section-aligned diff: compare each section at its own y on both sides, so a
	// height drift in one section does not shift every section below it.
	// The bands come from the UNMASKED images: a page-absolute mask would land on
	// a different section on the other side. Each band's mask is re-expressed
	// relative to its section, so the same content is ignored on both sides.
	let sBad = 0;
	let sArea = 0;
	const perSection = [];
	for (const [l, n] of rows) {
		if (!l || !n) {
			perSection.push(null);
			continue;
		}
		const lh = Math.round(l.box[1]);
		const nh = Math.round(n.box[1]);
		const ly = Math.round(l.box[0]);
		const ny = Math.round(n.box[0]);
		// Same band height on both sides, clamped to what each image still has.
		const hh = Math.min(lh, nh, a.height - ly, b.height - ny);
		if (hh <= 0) {
			perSection.push(null);
			continue;
		}
		const la = band(a, ly, hh);
		const lb = band(b, ny, hh);
		const rel = mask
			.map((m) => ({ ...m, y: m.y - ly }))
			.filter((m) => m.y + m.h > 0 && m.y < hh);
		applyMask(la, rel);
		applyMask(lb, rel);
		const d = new PNG({ width: w, height: hh });
		const bad = pixelmatch(la.data, lb.data, d.data, w, hh, { threshold: 0.1 });
		sBad += bad;
		sArea += w * hh;
		perSection.push(((bad / (w * hh)) * 100).toFixed(1));
	}

	// Side by side: live | magenta gutter | local, at full height of the taller page.
	const gap = 16;
	const sh = Math.max(a.height, b.height);
	const s = new PNG({ width: a.width + gap + b.width, height: sh });
	s.data.fill(255);
	for (let y = 0; y < sh; y++) {
		for (let x = a.width; x < a.width + gap; x++) s.data.set([255, 0, 255, 255], (y * s.width + x) * 4);
		if (y < a.height) a.data.copy(s.data, y * s.width * 4, y * a.width * 4, (y + 1) * a.width * 4);
		if (y < b.height) b.data.copy(s.data, (y * s.width + a.width + gap) * 4, y * b.width * 4, (y + 1) * b.width * 4);
	}
	writeFileSync(join(out, `${name}-sbs.png`), PNG.sync.write(s));
	return {
		full: ((bad / (w * h)) * 100).toFixed(1),
		aligned: sArea ? ((sBad / sArea) * 100).toFixed(1) : "0.0",
		perSection,
	};
};

const report = [`# Visual parity report`, ``, `Base: ${base} · tolerance ±${tol}px · ${new Date().toISOString().slice(0, 16)}`, ``];
const summary = ["| Page | Width | Page height live → new | Pixel diff | Sections off |", "|---|---|---|---|---|"];
const details = [];

for (const page of pages) {
	for (const w of widths) {
		const specFile = join(root, `discovery/specs/raw/${page}-${w}.json`);
		const livePng = join(root, `discovery/screenshots/live/${page}-${w}.png`);
		if (!existsSync(specFile) || !existsSync(livePng)) {
			console.log(`skip ${page} @${w}: no live reference`);
			continue;
		}
		const name = `${page}-${w}`;
		try {
			const live = JSON.parse(readFileSync(specFile, "utf8"));
			// Most Oct 16 references were captured with a 15px classic scrollbar, so the live
			// layout was 1425/1009/375 wide, not 1440/1024/390. Render the port at the
			// reference's own layout width (the full-width header/footer documents) so line
			// wraps compare like for like. The breakpoints still land in the same bucket.
			const layoutW = Math.max(...live.documents.map((d) => d.box?.[2] ?? 0)) || w;
			ab("set", "viewport", String(layoutW), String(VIEWPORTS[w]));
			ab("open", base + PAGES[page]);
			// The test browser shows its own scrollbar too. Hide it (rather than widening
			// the window, which pushed a 1024 reference past the ≤1024 breakpoint) so the
			// port lays out at exactly layoutW with the same breakpoints as live.
			js(`(() => { const s = document.createElement('style');
				s.textContent = 'html { scrollbar-width: none } html::-webkit-scrollbar { display: none }';
				document.head.append(s); return true; })()`);
			ab("wait", "1500");
			const { fonts } = js(settle);
			const local = js(measure);
			const localPng = join(out, `${name}-local.png`);
			ab("screenshot", "--full", localPng);
			const rows = pair(liveSections(live), local.rows);
			const livePngW = PNG.sync.read(readFileSync(livePng)).width;
			const mask = maskRegions(live, livePngW);
			const pct = diffImages(livePng, localPng, name, mask, rows);
			let off = 0;
			const lines = rows.map(([l, n], i) => {
				const dh = l && n ? n.box[1] - l.box[1] : null;
				const dy = l && n ? n.box[0] - l.box[0] : null;
				const flag = dh === null ? "MISSING" : Math.abs(dh) > tol ? "✗" : "✓";
				if (flag !== "✓") off++;
				const pd = pct.perSection[i];
				return `| ${l ? `${l.key}${l.type && l.type !== "container" ? ` (${l.type})` : ""}` : "—"} | ${l ? l.box.join("+") : "—"} | ${n ? `${n.key} ${n.box.join("+")}` : "—"} | ${dh ?? "—"} | ${dy ?? "—"} | ${pd === null ? "—" : `${pd}%`} | ${flag} |`;
			});
			summary.push(`| ${page} | ${w} | ${live.pageHeight} → ${local.page} (${local.page - live.pageHeight >= 0 ? "+" : ""}${local.page - live.pageHeight}) | ${pct.aligned}% (full ${pct.full}%) | ${off}/${rows.length} |`);
			details.push(`## ${page} @${w}`, ``, `Fonts loaded on new site: ${fonts.join(", ") || "**none**"} · layout width ${layoutW}${layoutW !== w ? " (reference had a scrollbar)" : ""}`, ``, "| Live section | Live y+h | New section y+h | Δh | Δy | Diff | |", "|---|---|---|---|---|---|---|", ...lines, ``, `Images: \`discovery/qa/${name}-sbs.png\` (live left), \`${name}-diff.png\``, ``);
			console.log(`ok ${name}: diff ${pct.aligned}% (full ${pct.full}%), ${off}/${rows.length} sections off, height ${live.pageHeight} → ${local.page}`);
		} catch (e) {
			console.log(`FAIL ${name}: ${String(e.message).slice(0, 200)}`);
		}
	}
}
writeFileSync(join(out, "REPORT.md"), [...report, ...summary, ``, ...details].join("\n"));
ab("close");
console.log(`report: discovery/qa/REPORT.md`);
