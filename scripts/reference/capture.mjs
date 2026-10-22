// Captures the live site's pixel reference: full-page screenshots + computed-style spec trees.
// Usage: node scripts/reference/capture.mjs [--base https://www.ruthsmarriage.com] [--only home,about] [--widths 1440,1024,390] [--session name] [--force]
// Skips page/width pairs that already have both a spec and a screenshot unless --force.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PAGES } from "./pages.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "../..");
const arg = (name, fallback) => {
	const i = process.argv.indexOf(`--${name}`);
	return i > -1 ? process.argv[i + 1] : fallback;
};
const base = arg("base", "https://www.ruthsmarriage.com");
const widths = arg("widths", "1440,1024,390").split(",").map(Number);
const only = arg("only", "")?.split(",").filter(Boolean);
const session = arg("session", "default");
const force = process.argv.includes("--force");
const outShots = join(root, arg("shots", "discovery/screenshots/live"));
const outSpecs = join(root, arg("specs", "discovery/specs/raw"));
mkdirSync(outShots, { recursive: true });
mkdirSync(outSpecs, { recursive: true });

export { PAGES };

const extractor = readFileSync(join(here, "extract-spec.js"), "utf8");
// Live bug: Elementor loads its local Google Fonts from the apex host while pages are served
// from www, so the font files fail CORS and visitors see fallback fonts. The port uses the
// intended fonts (decided 2026-10-16), so re-declare the same @font-face rules from www.
const settle = `(async () => {
  const sheets = ['nunito', 'poppins', 'roboto'];
  for (const s of sheets) {
    const link = [...document.querySelectorAll('link[rel=stylesheet]')].find(l => l.href.includes('google-fonts/css/' + s));
    if (!link) continue;
    const css = await (await fetch(link.href.replace('//ruthsmarriage.com', '//www.ruthsmarriage.com'))).text();
    const style = document.createElement('style');
    style.textContent = css.replaceAll('https://ruthsmarriage.com/', 'https://www.ruthsmarriage.com/');
    document.head.append(style);
    link.remove();
  }
  // Drop any already-failed faces so they can't shadow the working ones.
  [...document.fonts].filter(f => f.status === 'error').forEach(f => document.fonts.delete(f));
  await Promise.allSettled(['600 16px Nunito', '800 16px Nunito', '400 16px Poppins', '500 16px Poppins', '600 15px Roboto'].map(f => document.fonts.load(f)));
  await document.fonts.ready;
  document.querySelectorAll('.swiper, .swiper-container').forEach(s => { s.swiper?.autoplay?.stop(); s.swiper?.slideTo?.(0, 0); });
  document.querySelectorAll('.slick-slider').forEach(s => { try { jQuery(s).slick('slickPause').slick('slickGoTo', 0, true); } catch {} });
  const h = document.documentElement.scrollHeight;
  for (let y = 0; y < h; y += 400) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 120)); }
  document.querySelectorAll('.elementor-invisible').forEach(e => e.classList.remove('elementor-invisible'));
  window.scrollTo(0, 0);
  await new Promise(r => setTimeout(r, 800));
  return document.fonts.status;
})()`;

const ab = (...a) => execFileSync("agent-browser", ["--session", session, ...a], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
const evalJs = (js) => execFileSync("agent-browser", ["--session", session, "eval", "--stdin"], { input: js, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });

for (const [name, path] of Object.entries(PAGES)) {
	if (only.length && !only.includes(name)) continue;
	for (const w of widths) {
		if (!force && existsSync(join(outSpecs, `${name}-${w}.json`)) && existsSync(join(outShots, `${name}-${w}.png`))) continue;
		const h = w === 390 ? 844 : w === 1024 ? 768 : 900;
		try {
			ab("set", "viewport", String(w), String(h));
			ab("open", base + path);
			ab("wait", "2500");
			evalJs(settle);
			let raw = evalJs(extractor).trim();
			// agent-browser prints the returned string JSON-encoded
			if (raw.startsWith('"')) raw = JSON.parse(raw);
			writeFileSync(join(outSpecs, `${name}-${w}.json`), JSON.stringify(JSON.parse(raw), null, 1));
			ab("screenshot", "--full", join(outShots, `${name}-${w}.png`));
			console.log(`ok ${name} @${w}`);
		} catch (e) {
			console.log(`FAIL ${name} @${w}: ${String(e.message).slice(0, 200)}`);
		}
	}
}
