// Phase 1.3 — download every site image referenced by the dumped HTML/JSON at the largest size.
// Strips -WxH size suffixes (keeps -scaled, already largest). Writes discovery/media/<same path as
// wp-content/uploads/...>, manifest.json, failures.json. Rate limit ~1.6 req/s. Read-only GETs.
// Usage: node scripts/reference/download-media.mjs
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const out = join(root, "discovery/media");
const BASE = "https://www.ruthsmarriage.com";
const UA = "ruthsmarriage-migration/1.0 (reference capture; read-only)";

let last = 0;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function get(url) {
  const w = 600 - (Date.now() - last);
  if (w > 0) await sleep(w);
  for (let a = 1; ; a++) {
    let res;
    try { res = await fetch(url, { headers: { "User-Agent": UA } }); }
    catch (e) { if (a >= 3) throw e; await sleep(1500 * a); continue; }
    last = Date.now();
    if ((res.status === 429 || res.status >= 500) && a < 3) { await sleep(1500 * a); continue; }
    return res;
  }
}

// ---- collect referenced URLs (with alt text where known) --------------------------------
const uploads = new Map(); // normalizedUrl -> {alts:Set, sources:Set, fallbacks:Set}
const note = (u, alt, src) => {
  const m = u.match(/https?:\/\/[^/]+\/wp-content\/uploads\/(.+)$/);
  if (!m) return;
  const path = m[1].split("?")[0].split("#")[0];
  const norm = "https://www.ruthsmarriage.com/wp-content/uploads/" + path.replace(/-\d+x\d+(?=\.\w+$)/, "");
  const e = uploads.get(norm) || { alts: new Set(), sources: new Set(), fallbacks: new Set() };
  if (alt) e.alts.add(alt);
  e.sources.add(src);
  if (norm !== "https://www.ruthsmarriage.com/wp-content/uploads/" + path) e.fallbacks.add("https://www.ruthsmarriage.com/wp-content/uploads/" + path);
  uploads.set(norm, e);
};

const scanHtml = (file) => {
  const h = readFileSync(file, "utf8");
  for (const m of h.matchAll(/<img[^>]+src="([^"]+)"[^>]*>/g)) {
    const alt = (/alt="([^"]*)"/.exec(m[0]) || [])[1] || "";
    note(m[1].replace(/&amp;/g, "&"), alt, file.split("/").pop());
  }
  for (const m of h.matchAll(/(?:background-image:\s*url\(["']?|content=["'])(https?:[^"')]+\/wp-content\/uploads\/[^"')?]+\.(?:png|jpe?g|webp|gif|svg))/g)) note(m[1], "", file.split("/").pop());
  for (const m of h.matchAll(/property="og:image"\s+content="([^"]+)"/g)) note(m[1], "", file.split("/").pop());
};
for (const dir of ["discovery/raw/html", "discovery/raw/css"]) {
  const d = join(root, dir);
  if (!existsSync(d)) continue;
  for (const f of readdirSync(d)) scanHtml(join(d, f));
}
for (const t of ["media", "posts", "resource", "service", "banner"]) {
  const items = JSON.parse(readFileSync(join(root, `discovery/raw/json/${t}.json`), "utf8"));
  const walk = (v) => {
    if (typeof v === "string") { for (const m of v.matchAll(/https?:[^"'<)\s]+\/wp-content\/uploads\/[^"'<)\s]+\.(?:png|jpe?g|webp|gif)/g)) note(m[0], "", t); }
    else if (v && typeof v === "object") for (const x of Object.values(v)) walk(x);
  };
  walk(items);
}
// favicons + logo from any dumped page head
for (const m of readFileSync(join(root, "discovery/raw/html/home.html"), "utf8").matchAll(/<link[^>]+rel="(?:icon|apple-touch-icon)[^"]*"[^>]+href="([^"]+)"|rel="[^"]*icon[^"]*"[^>]+href="([^"]+)"/g)) {
  note(m[1] || m[2], "favicon", "home.html");
}
if (!existsSync(out)) mkdirSync(out, { recursive: true });
console.log(`referenced images (normalized): ${uploads.size}`);

// ---- image dimensions without deps ------------------------------------------------------
function dims(buf, name) {
  const ext = name.split(".").pop().toLowerCase();
  try {
    if (ext === "png") return [buf.readUInt32BE(16), buf.readUInt32BE(20)];
    if (ext === "gif") return [buf.readUInt16LE(6), buf.readUInt16LE(8)];
    if (ext === "jpeg" || ext === "jpg") {
      let i = 2;
      while (i < buf.length) {
        if (buf[i] !== 0xff) { i++; continue; }
        const marker = buf[i + 1];
        if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) return [buf.readUInt16BE(i + 9), buf.readUInt16BE(i + 7)];
        i += 2 + buf.readUInt16BE(i + 2);
      }
    }
    if (ext === "webp") {
      const f = buf.toString("latin1", 12, 16);
      if (f === "VP8X") return [buf.readUIntLE(24, 3) + 1, buf.readUIntLE(27, 3) + 1];
      if (f === "VP8L") { const bits = buf.readUInt32LE(21); return [(bits & 0x3fff) + 1, ((bits >> 14) & 0x3fff) + 1]; }
      if (f === "VP8 ") return [buf.readUInt16LE(30) & 0x3fff, buf.readUInt16LE(32) & 0x3fff];
    }
    if (ext === "svg") {
      const s = buf.toString("utf8");
      const vb = /viewBox="[^"]*\s([\d.]+)\s([\d.]+)/.exec(s);
      const w = /width="([\d.]+)/.exec(s), hh = /height="([\d.]+)/.exec(s);
      if (w && hh) return [Number(w[1]), Number(hh[1])];
      if (vb) return [Number(vb[1]), Number(vb[2])];
    }
  } catch { /* best effort */ }
  return [null, null];
}

// ---- download ---------------------------------------------------------------------------
const manifest = [], failures = [];
for (const [url, info] of uploads) {
  const rel = url.replace(/^https?:\/\/[^/]+\/wp-content\/uploads\//, "");
  const localPath = join(out, rel);
  const entry = { url, localPath: "discovery/media/" + rel, width: null, height: null, alt: [...info.alts][0] || "" };
  const sizes = [url, ...info.fallbacks]; // original first, then the referenced sized versions as fallback
  let done = false;
  for (const s of sizes) {
    if (s === url && existsSync(localPath)) {
      const b = readFileSync(localPath); const [w, h] = dims(b, rel); entry.width = w; entry.height = h;
      manifest.push(entry); done = true; break;
    }
    let res;
    try { res = await get(s); } catch (e) { continue; }
    if (!res.ok) continue;
    const buf = Buffer.from(await res.arrayBuffer());
    mkdirSync(dirname(localPath), { recursive: true });
    writeFileSync(localPath, buf);
    const [w, h] = dims(buf, rel);
    entry.width = w; entry.height = h;
    manifest.push(entry); done = true;
    console.log(`ok ${rel} ${w}x${h} (${(buf.length / 1024) | 0}K) via ${s === url ? "original" : "fallback"}`);
    break;
  }
  if (!done) { failures.push({ url, status: "all candidates failed", tried: sizes }); console.log(`FAIL ${rel}`); }
}
mkdirSync(out, { recursive: true });
writeFileSync(join(out, "manifest.json"), JSON.stringify(manifest, null, 1));
writeFileSync(join(out, "failures.json"), JSON.stringify(failures, null, 1));
console.log(`manifest: ${manifest.length}, failures: ${failures.length}`);
