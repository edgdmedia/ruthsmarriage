// V7 interaction checks (VISUAL-TRACK.md step V7; spec: page-maps/_global.md).
// Drives the local site with agent-browser and asserts behaviour, not pixels:
// dropdowns, mobile menu + accordion, sticky header/sidebar, carousels,
// marquee, keyboard and reduced motion. Prints PASS/FAIL per check.
// Usage: node scripts/qa/interactions.mjs [--base http://localhost:4321]
import { execFileSync } from "node:child_process";

const arg = (name, fallback) => {
	const i = process.argv.indexOf(`--${name}`);
	return i > -1 ? process.argv[i + 1] : fallback;
};
const base = arg("base", "http://localhost:4321");
const S = ["--session", "v7-interactions"];
const ab = (...a) => execFileSync("agent-browser", [...S, ...a], { encoding: "utf8", maxBuffer: 16 << 20 });
const js = (code) => {
	let r = execFileSync("agent-browser", [...S, "eval", "--stdin"], { input: code, encoding: "utf8" }).trim();
	if (r.startsWith('"')) r = JSON.parse(r);
	try {
		return JSON.parse(r);
	} catch {
		return r;
	}
};
const open = (path, w = 1440, h = 900) => {
	ab("set", "viewport", String(w), String(h));
	ab("open", base + path);
	ab("wait", "1500");
};

let failed = 0;
const check = (name, ok, detail = "") => {
	if (!ok) failed++;
	console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  (${detail})` : ""}`);
};

// ---------------------------------------------------------------- desktop nav
open("/");
const parents = js(`document.querySelectorAll('.site-header-nav-items .site-header-nav-item').length`);
for (let i = 0; i < parents; i++) {
	ab("hover", `.site-header-nav-items .site-header-nav-item:nth-of-type(${i + 1})`);
	const r = js(`(() => {
		const item = document.querySelectorAll('.site-header-nav-items .site-header-nav-item')[${i}];
		const dd = item.querySelector('.site-header-dropdown');
		if (!dd) return { none: true };
		const a = item.getBoundingClientRect(), b = dd.getBoundingClientRect();
		const longest = Math.max(...[...dd.querySelectorAll('a')].map((x) => x.scrollWidth));
		return { shown: getComputedStyle(dd).display !== 'none', dy: Math.round(b.top - a.bottom), dx: Math.round(b.left - a.left),
			fits: [...dd.querySelectorAll("a")].every((x) => x.getBoundingClientRect().height <= 47) && b.width + 1 >= longest, label: item.textContent.trim() };
	})()`);
	if (r.none) continue;
	check(`dropdown "${r.label}" opens on hover under its item`, r.shown && Math.abs(r.dy) <= 1 && Math.abs(r.dx) <= 1, `dy ${r.dy} dx ${r.dx}`);
	check(`dropdown "${r.label}" fits its longest label`, r.fits);
}
// Keyboard: Tab onto the first parent button opens its dropdown (focus-within).
ab("eval", "document.activeElement.blur(); window.scrollTo(0, 0)");
const kb = js(`(() => {
	const btn = document.querySelector('.site-header-nav-items .site-header-nav-item button');
	btn.focus();
	const dd = btn.closest('.site-header-nav-item').querySelector('.site-header-dropdown');
	return { open: getComputedStyle(dd).display !== 'none', isButton: btn.tagName === 'BUTTON', expanded: btn.getAttribute('aria-expanded') };
})()`);
check("keyboard focus on a parent opens its dropdown", kb.open);
check("nav parents are <button>s with aria-expanded", kb.isButton && kb.expanded !== null, `aria-expanded=${kb.expanded}`);

// --------------------------------------------------------------- sticky bars
const sticky = js(`(async () => {
	window.scrollTo(0, 1200); await new Promise((r) => setTimeout(r, 300));
	const bar = document.querySelector('.site-header-main').getBoundingClientRect();
	const mq = document.querySelector('.marquee-bar, .site-header .marquee')?.getBoundingClientRect();
	return { barTop: Math.round(bar.top), marqueeGone: mq ? mq.bottom <= 0 : true };
})()`);
check("main bar sticks to the top on scroll", sticky.barTop === 0, `top ${sticky.barTop}`);
check("marquee scrolls away", sticky.marqueeGone);

// ------------------------------------------------------------------ marquee
const mq = js(`(() => { const t = document.querySelector('.marquee-track'); const cs = t && getComputedStyle(t);
	return t ? { name: cs.animationName, state: cs.animationPlayState } : null; })()`);
check("marquee animates", mq && mq.name !== "none" && mq.state === "running", mq ? mq.name : "no .marquee-track");

// ---------------------------------------------------------------- carousels
open("/");
const car = js(`(() => [...document.querySelectorAll('.swiper[data-swiper]')].map((el) => {
	const sw = el.swiper; const cfg = JSON.parse(el.dataset.swiper);
	return { init: !!sw, autoplay: !!(sw && sw.autoplay && sw.autoplay.running), delay: cfg.delay ?? null,
		dots: el.querySelectorAll('.swiper-pagination-bullet').length, arrows: !!el.querySelector('.swiper-button-next'),
		index: sw ? sw.realIndex : null, loop: !!(sw && sw.params.loop) };
}))()`);
check("all carousels initialise", car.length > 0 && car.every((c) => c.init), `${car.filter((c) => c.init).length}/${car.length}`);
check("carousels autoplay", car.every((c) => c.autoplay), car.map((c) => (c.autoplay ? "on" : "off")).join(","));
check("hero delay 9000ms, content 5000ms", car[0]?.delay === 9000 && car.slice(1).every((c) => c.delay === 5000), car.map((c) => c.delay).join(","));
check("content carousels have dots; hero has arrows", car.slice(1).every((c) => c.dots > 0) && car[0]?.arrows);
check("carousels loop", car.every((c) => c.loop));
ab("wait", "5600");
const moved = js(`[...document.querySelectorAll('.swiper[data-swiper]')].slice(1).map((el) => el.swiper.realIndex)`);
check("content carousels advance after 5s", moved.every((i, n) => i !== car[n + 1].index), `index ${moved.join(",")}`);
// Pause on hover.
ab("hover", ".swiper[data-swiper]:nth-of-type(1)");
const paused = js(`(() => { const el = [...document.querySelectorAll('.swiper[data-swiper]')][1]; el.dispatchEvent(new PointerEvent('pointerenter', { pointerType: 'mouse' })); return el.swiper.autoplay?.paused ?? null; })()`);
check("autoplay pauses on hover", paused === true);
// Swipe: drag the first content carousel left.
const swiped = js(`(async () => {
	const el = [...document.querySelectorAll('.swiper[data-swiper]')][1]; const sw = el.swiper; const before = sw.realIndex;
	sw.slideNext(0); await new Promise((r) => setTimeout(r, 50)); return sw.realIndex !== before && sw.allowTouchMove;
})()`);
check("carousels accept swipe (touch move enabled)", swiped === true);
// Random 6 per request: the services carousel order differs between loads (best of 4).
const order = () => js(`[...document.querySelectorAll('.swiper[data-swiper]')][1].querySelectorAll('.swiper-slide:not(.swiper-slide-duplicate) a[href]')[0]?.getAttribute('href')`);
const seen = new Set();
for (let i = 0; i < 4; i++) {
	open("/");
	seen.add(order());
}
check("carousel picks change between requests", seen.size > 1, `${seen.size} distinct first slides in 4 loads`);

// ------------------------------------------------------------ reduced motion
ab("set", "media", "light", "reduced-motion");
open("/");
const rm = js(`(() => ({ autoplay: [...document.querySelectorAll('.swiper[data-swiper]')].some((el) => el.swiper?.autoplay?.running),
	marquee: getComputedStyle(document.querySelector('.marquee-track')).animationName }))()`);
check("reduced motion: no carousel autoplay", !rm.autoplay);
check("reduced motion: marquee stopped", rm.marquee === "none", rm.marquee);
ab("set", "media", "light", "no-preference");

// -------------------------------------------------------------- mobile menu
for (const [w, h] of [[1024, 768], [390, 844]]) {
	open("/", w, h);
	ab("eval", "document.querySelector('.site-header-toggle').click()");
	ab("wait", "700");
	const m = js(`(() => {
		const t = document.querySelector('.site-header-toggle'), p = document.querySelector('.site-header-mobile-panel');
		const bar = document.querySelector('.site-header-main').getBoundingClientRect();
		return { open: !!p, expanded: t.getAttribute('aria-expanded'), times: !!t.querySelector('svg') && t.getAttribute('aria-expanded') === 'true',
			top: p ? Math.round(p.getBoundingClientRect().top - bar.bottom) : null, focusIn: p ? p.contains(document.activeElement) : false,
			items: p ? p.querySelectorAll('.site-header-mobile-nav > *').length : 0 };
	})()`);
	check(`@${w} menu opens from the hamburger`, m.open && m.expanded === "true", `aria-expanded=${m.expanded}`);
	check(`@${w} panel starts under the main bar`, m.top !== null && Math.abs(m.top) <= 30, `gap ${m.top}px`);
	check(`@${w} focus moves into the menu`, m.focusIn);
	const acc = js(`(async () => {
		const btn = [...document.querySelectorAll('.site-header-mobile-panel button')].find((b) => b.getAttribute('aria-expanded') === 'false');
		if (!btn) return { none: true };
		btn.click(); await new Promise((r) => setTimeout(r, 150));
		const kids = btn.closest('li, div').querySelectorAll('a');
		return { expanded: btn.getAttribute('aria-expanded'), links: kids.length };
	})()`);
	check(`@${w} accordion expands a parent's children`, !acc.none && acc.expanded === "true" && acc.links > 0, `links ${acc.links}`);
	ab("press", "Escape");
	ab("wait", "200");
	const closed = js(`!document.querySelector('.site-header-mobile-panel') && document.activeElement === document.querySelector('.site-header-toggle')`);
	check(`@${w} Esc closes the menu and returns focus to the toggle`, closed === true);
}

// ------------------------------------------------------------ sticky sidebar
open("/inspired-features/");
const side = js(`(async () => { window.scrollTo(0, 1500); await new Promise((r) => setTimeout(r, 300));
	const s = document.querySelector('.blog__sidebar'); return { pos: getComputedStyle(s).position, top: Math.round(s.getBoundingClientRect().top) }; })()`);
check("blog sidebar is sticky", side.pos === "sticky" && side.top >= 0 && side.top <= 100, `${side.pos} top ${side.top}`);

ab("close");
console.log(failed ? `\n${failed} check(s) failed` : "\nall checks passed");
process.exit(failed ? 1 : 0);
