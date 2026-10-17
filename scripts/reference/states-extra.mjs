// Phase 1.4 (gap) — interaction states not covered by capture.mjs/states.mjs:
// each content carousel on slide 2, hero slider on every slide, top-nav hover, askcoach
// category selected. Writes discovery/screenshots/live/states/ + discovery/specs/states-extra.json.
// Usage: node scripts/reference/states-extra.mjs
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const out = "discovery/screenshots/live/states";
mkdirSync(out, { recursive: true });
const S = ["--session", "states-extra"];
const ab = (...a) => execFileSync("agent-browser", [...S, ...a], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
const js = (code) => {
  let r = execFileSync("agent-browser", [...S, "eval", "--stdin"], { input: code, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }).trim();
  if (r.startsWith('"')) r = JSON.parse(r);
  try { return JSON.parse(r); } catch { return r; }
};
const base = "https://www.ruthsmarriage.com";
const specs = {};
const step = (name, fn) => { try { fn(); console.log("ok", name); } catch (e) { console.log("FAIL", name, String(e.message).slice(0, 200)); } };

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

step("home carousels + hero", () => {
  ab("set", "viewport", "1440", "900");
  ab("open", base + "/");
  ab("wait", "2500");
  js(fixFonts);
  ab("wait", "400");
  const grids = js(`[...document.querySelectorAll('[data-listing-id]')].map(e => e.getAttribute('data-listing-id'))`);
  for (const id of [...new Set(grids)]) {
    js(`(() => {
      const items = document.querySelector('[data-listing-id="${id}"]');
      const s = items?.closest('.jet-listing__slider, .jet-listing-grid__slider, .slick-slider') || items?.parentElement?.querySelector('.slick-initialized') || items;
      if (!s) return false;
      try { jQuery(s).slick('slickPause'); } catch {}
      return true;
    })()`);
    ab("wait", "300");
    for (const i of id === "100" ? [1, 2] : [1]) {
      js(`(() => {
        const items = document.querySelector('[data-listing-id="${id}"]');
        const s = items?.closest('.jet-listing__slider, .jet-listing-grid__slider, .slick-slider') || items?.parentElement?.querySelector('.slick-initialized') || items;
        if (!s) throw new Error('no slider for ${id}');
        try { jQuery(s).slick('slickGoTo', ${i}, true); } catch (e) { throw new Error('slickGoTo ${id}: ' + e.message); }
        (items || s).scrollIntoView({ block: "center" });
        return true;
      })()`);
      ab("wait", "700");
      ab("screenshot", join(out, `carousel-${id}-slide${i + 1}-1440.png`));
      if (id === "159") specs.dotsActive = js(`(() => { const d = document.querySelector('[data-listing-id="159"] .slick-dots .slick-active button, [data-listing-id="159"] .slick-dots li.slick-active'); const c = getComputedStyle(d?.parentElement || document.body); return JSON.stringify({ bg: c.backgroundColor, html: d ? d.outerHTML.slice(0, 200) : null }); })()`);
    }
  }
  // top-nav hover (dropdown-adjacent states.mjs covers submenu hover only)
  js("window.scrollTo(0, 0)");
  ab("wait", "400");
  ab("hover", ".elementor-nav-menu--main > ul > li:nth-child(2) > a");
  ab("wait", "500");
  ab("screenshot", join(out, "nav-item-hover-1440.png"));
  specs.navHover = js(`(() => { const a = document.querySelector('.elementor-nav-menu--main > ul > li:nth-child(2) > a'); const c = getComputedStyle(a); return JSON.stringify({ color: c.color, borderBottom: c.borderBottom, text: a.innerText.trim() }); })()`);
});

step("askcoach category selected", () => {
  ab("open", base + "/askcoach/");
  ab("wait", "2200");
  js(fixFonts);
  ab("select", ".elementor-form select", "Marriage");
  ab("wait", "300");
  js("document.querySelector('.elementor-form').scrollIntoView({ block: 'center' })");
  ab("wait", "400");
  ab("screenshot", join(out, "askcoach-category-selected-1440.png"));
});

writeFileSync("discovery/specs/states-extra.json", JSON.stringify(specs, null, 1));
ab("close");
console.log("states-extra done");
