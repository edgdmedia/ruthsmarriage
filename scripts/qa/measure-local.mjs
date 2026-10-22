// Measures the local site's header/footer/section boxes with agent-browser and prints them
// in the same shape as the live spec (x,y,w,h) so the two can be diffed by eye.
// Usage: node scripts/qa/measure-local.mjs [--base http://localhost:4321] [--width 1440] [--path /]
import { execFileSync } from "node:child_process";

const arg = (n, d) => {
	const i = process.argv.indexOf(`--${n}`);
	return i > -1 ? process.argv[i + 1] : d;
};
const base = arg("base", "http://localhost:4321");
const width = Number(arg("width", "1440"));
const height = Number(arg("height", "900"));
const path = arg("path", "/");

const S = ["--session", "measure-local"];
const ab = (...a) =>
	execFileSync("agent-browser", [...S, ...a], { encoding: "utf8", maxBuffer: 64 << 20 });
const js = (code) => {
	let r = execFileSync("agent-browser", [...S, "eval", "--stdin"], {
		input: code,
		encoding: "utf8",
		maxBuffer: 64 << 20,
	}).trim();
	if (r.startsWith('"')) r = JSON.parse(r);
	return JSON.parse(r);
};

ab("set", "viewport", String(width), String(height));
ab("open", base + path);
ab("wait", "1200");

const out = js(`JSON.stringify((() => {
  const box = (e) => { const r = e.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top + scrollY), Math.round(r.width), Math.round(r.height)]; };
  const o = { header: null, navItems: [], footerCols: [], sections: [] };
  const header = document.querySelector('header');
  if (header) {
    o.header = box(header);
    const items = header.querySelectorAll('.site-header-nav-items > *');
    items.forEach(i => o.navItems.push({ text: i.textContent.trim().slice(0,30), box: box(i) }));
    const logo = header.querySelector('.site-header-logo');
    const nav = header.querySelector('.site-header-nav');
    const cta = header.querySelector('.site-header-cta');
    if (logo) o.logo = box(logo);
    if (nav) o.nav = box(nav);
    if (cta) o.cta = box(cta);
    const navmenu = header.querySelector('.site-header-nav-items');
    if (navmenu) o.navItemsBox = box(navmenu);
  }
  const footer = document.querySelector('footer');
  if (footer) {
    o.footer = box(footer);
    footer.querySelectorAll('.footer-col').forEach(c => o.footerCols.push({ t: c.querySelector('.footer-col-title')?.textContent, box: box(c) }));
  }
  const main = document.querySelector('main');
  if (main) [...main.children].forEach(c => o.sections.push({ tag: c.tagName + '.' + (String(c.className)||'').split(' ')[0], box: box(c) }));
  return o;
})())`);

console.log(JSON.stringify(out, null, 1));
ab("close");
