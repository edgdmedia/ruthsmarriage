// Captures interaction-state screenshots + specs on live (dropdowns, mobile menu, sticky header,
// booking off-canvas, Ask Coach form). Runs in its own agent-browser session.
// Usage: node scripts/reference/states.mjs
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const out = "discovery/screenshots/live/states";
mkdirSync(out, { recursive: true });
const S = ["--session", "states"];
const ab = (...a) => execFileSync("agent-browser", [...S, ...a], { encoding: "utf8" });
const js = (code) => execFileSync("agent-browser", [...S, "eval", "--stdin"], { input: code, encoding: "utf8" }).trim();

const fixFonts = `(async () => {
  for (const s of ['nunito', 'poppins', 'roboto']) {
    const link = [...document.querySelectorAll('link[rel=stylesheet]')].find(l => l.href.includes('google-fonts/css/' + s));
    if (!link) continue;
    const css = await (await fetch(link.href.replace('//ruthsmarriage.com', '//www.ruthsmarriage.com'))).text();
    const st = document.createElement('style');
    st.textContent = css.replaceAll('https://ruthsmarriage.com/', 'https://www.ruthsmarriage.com/');
    document.head.append(st); link.remove();
  }
  [...document.fonts].filter(f => f.status === 'error').forEach(f => document.fonts.delete(f));
  await Promise.allSettled(['600 16px Nunito', '500 16px Nunito', '400 16px Poppins', '600 15px Roboto'].map(f => document.fonts.load(f)));
  return 'ok';
})()`;

const open = (url, w, h) => {
	ab("set", "viewport", String(w), String(h));
	ab("open", url);
	ab("wait", "2500");
	js(fixFonts);
	ab("wait", "500");
};
// Styles of visible elements matching a selector, to document the open state.
const styleDump = (sel) =>
	js(`JSON.stringify([...document.querySelectorAll(${JSON.stringify(sel)})].filter(e => e.getBoundingClientRect().width > 0).slice(0, 25).map(e => {
  const c = getComputedStyle(e), r = e.getBoundingClientRect();
  return { tag: e.tagName, cls: e.className.toString().slice(0, 60), text: e.innerText?.trim().slice(0, 50), box: [r.left, r.top, r.width, r.height].map(Math.round),
    ff: c.fontFamily.split(',')[0], fs: c.fontSize, fw: c.fontWeight, c: c.color, bg: c.backgroundColor, pad: c.padding, shadow: c.boxShadow, radius: c.borderRadius, border: c.border, minw: c.minWidth, transition: c.transition.slice(0, 80) };
}))`);
const specs = {};
const shot = (name) => ab("screenshot", join(out, `${name}.png`));
const base = "https://www.ruthsmarriage.com";
const step = (name, fn) => {
	try {
		fn();
		console.log(`ok ${name}`);
	} catch (e) {
		console.log(`FAIL ${name}: ${String(e.message).slice(0, 200)}`);
	}
};

const menus = ["About", "Counseling Services", "Resources", "Freebies", "Media"];
step("desktop dropdowns", () => {
	open(base + "/", 1440, 900);
	menus.forEach((m, i) => {
		ab("hover", `.elementor-nav-menu--main > ul > li:nth-child(${i + 1}) > a`);
		ab("wait", "600");
		shot(`dropdown-${i + 1}-${m.toLowerCase().replace(/\s+/g, "-")}-1440`);
		if (i === 0) specs.dropdown = JSON.parse(JSON.parse(styleDump(".elementor-nav-menu--main .sub-menu, .elementor-nav-menu--main .sub-menu a")));
	});
	ab("hover", ".elementor-nav-menu--main > ul > li:nth-child(2) > ul li:first-child a");
	ab("wait", "400");
	specs.dropdownHover = JSON.parse(JSON.parse(styleDump(".elementor-nav-menu--main .sub-menu a:hover")));
	ab("hover", ".elementor-button[href='/askcoach']");
	ab("wait", "400");
	specs.askCoachHover = JSON.parse(JSON.parse(styleDump(".elementor-button[href='/askcoach']")));
	shot("askcoach-button-hover-1440");
});
step("sticky header", () => {
	js("window.scrollTo(0, 900)");
	ab("wait", "800");
	shot("sticky-header-1440");
	specs.sticky = JSON.parse(JSON.parse(styleDump(".elementor-sticky--active, .elementor-sticky")));
});
for (const [w, h] of [[1024, 768], [390, 844]]) {
	step(`mobile menu ${w}`, () => {
		open(base + "/", w, h);
		ab("click", ".elementor-menu-toggle");
		ab("wait", "700");
		shot(`mobile-menu-open-${w}`);
		specs[`mobileMenu${w}`] = JSON.parse(JSON.parse(styleDump(".elementor-nav-menu--dropdown.elementor-nav-menu__container, .elementor-nav-menu--dropdown.elementor-nav-menu__container > ul > li > a, .elementor-menu-toggle")));
		ab("click", ".elementor-nav-menu--dropdown.elementor-nav-menu__container > ul > li:nth-child(1) > a .sub-arrow");
		ab("wait", "600");
		shot(`mobile-submenu-open-${w}`);
	});
}
for (const w of [1440, 390]) {
	step(`booking off-canvas ${w}`, () => {
		open(base + "/service/one-hour-couples-counseling-session/", w, w === 390 ? 844 : 900);
		ab("click", "a[href*='off_canvas']");
		ab("wait", "1200");
		shot(`booking-offcanvas-${w}`);
		specs[`offcanvas${w}`] = JSON.parse(JSON.parse(styleDump(".e-off-canvas, .e-off-canvas__overlay, .e-off-canvas__main, .policy-agreement, .book-button, .policy-checkbox-label, .e-off-canvas h2, .e-off-canvas h3, .e-off-canvas p")));
		js("document.querySelector('.e-off-canvas__main')?.scrollTo(0, 99999); document.querySelector('.e-off-canvas__content')?.scrollTo(0, 99999)");
		ab("wait", "500");
		shot(`booking-offcanvas-bottom-${w}`);
		ab("check", "#policy-checkbox");
		ab("wait", "400");
		shot(`booking-offcanvas-agreed-${w}`);
		specs[`bookButtonAgreed${w}`] = JSON.parse(JSON.parse(styleDump(".book-button")));
	});
}
step("askcoach form", () => {
	open(base + "/askcoach/", 1440, 900);
	ab("click", ".elementor-form button[type=submit]");
	ab("wait", "800");
	shot("askcoach-validation-1440");
	specs.askcoachForm = JSON.parse(JSON.parse(styleDump(".elementor-form label, .elementor-form select, .elementor-form textarea, .elementor-form button, .elementor-message")));
});
writeFileSync("discovery/specs/states.json", JSON.stringify(specs, null, 1));
ab("close");
