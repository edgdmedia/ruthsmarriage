// Probe listing rows on live and local: per row, leaf boxes relative to the row top.
// Usage: node scripts/qa/probe-rows.mjs <path> <width> [rowIndex]
// Compares current live (with the font CORS fix from capture.mjs) against localhost:4321.
// Without rowIndex: one line per row with the height delta. With it: every leaf box in that row
// (tag, top, left, width, height relative to the row, font, text). Live items are 20px wider
// (-10px margin), so live x = local x + 10.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
const liveSettle = readFileSync(new URL("./live-settle.js", import.meta.url), "utf8");
const [path, width, only] = process.argv.slice(2);
const H = { 1440: 900, 1024: 768, 390: 844 };
const run = (session, url, itemSel) => {
	const S = ["--session", session];
	const ab = (...a) => execFileSync("agent-browser", [...S, ...a], { encoding: "utf8", maxBuffer: 64 << 20 });
	ab("set", "viewport", width, String(H[width]));
	ab("open", url);
	ab("wait", "1500");
	ab("eval", "(async()=>{for(let y=0;y<document.documentElement.scrollHeight;y+=300){scrollTo(0,y);await new Promise(r=>setTimeout(r,120));}scrollTo(0,0);await Promise.all([...document.images].map(i=>i.complete?0:new Promise(r=>{i.onload=i.onerror=r})));await document.fonts.ready;return 1})()");
	ab("wait", "800");
	if (url.includes("ruthsmarriage.com")) execFileSync("agent-browser", [...S, "eval", "--stdin"], { input: liveSettle, encoding: "utf8" });
	const code = `JSON.stringify((() => {
  const items = [...document.querySelectorAll(${JSON.stringify(itemSel)})];
  return items.map((it) => {
    const r0 = it.getBoundingClientRect();
    const leaves = [...it.querySelectorAll('h2,h3,p,img,a,li')].filter(e => e.getBoundingClientRect().height > 0);
    return { h: Math.round(r0.height), w: Math.round(r0.width), leaves: leaves.map(e => {
      const r = e.getBoundingClientRect(); const cs = getComputedStyle(e);
      return [e.tagName.toLowerCase(), Math.round(r.top - r0.top), Math.round(r.left - r0.left), Math.round(r.width), Math.round(r.height), cs.fontWeight + ' ' + cs.fontSize + '/' + cs.lineHeight, (e.textContent || e.getAttribute('src') || '').trim().slice(0, 24)].join(' ');
    }) };
  });
})())`;
	let r = execFileSync("agent-browser", [...S, "eval", "--stdin"], { input: code, encoding: "utf8", maxBuffer: 64 << 20 }).trim();
	if (r.startsWith('"')) r = JSON.parse(r);
	ab("close");
	return JSON.parse(r);
};
const live = run("probe-live", "https://www.ruthsmarriage.com" + path, ".jet-listing-grid__item");
const local = run("probe-local", "http://localhost:4321" + path, ".listing-row");
const n = Math.max(live.length, local.length);
for (let i = 0; i < n; i++) {
	if (only !== undefined && String(i) !== only) continue;
	const a = live[i], b = local[i];
	console.log(`## row ${i}: live ${a?.w}x${a?.h}  local ${b?.w}x${b?.h}  Δh ${(b?.h ?? 0) - (a?.h ?? 0)}`);
	if (only !== undefined) {
		console.log("live:"); a?.leaves.forEach((l) => console.log("  " + l));
		console.log("local:"); b?.leaves.forEach((l) => console.log("  " + l));
	}
}
