#!/usr/bin/env node
/**
 * scripts/emdash/import-data.mjs
 *
 * Imports content from src/data/*.json into EmDash.
 * Idempotent by slug: re-running updates existing entries.
 * --dry-run: prints what would happen without making changes.
 *
 * Usage:
 *   node scripts/emdash/import-data.mjs                    # import all collections
 *   node scripts/emdash/import-data.mjs services resources # import specific collections
 *   node scripts/emdash/import-data.mjs --dry-run          # preview
 */
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { setTimeout as sleep } from "timers/promises";
import { createWriteStream } from "fs";
import { Readable } from "stream";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "../..");
const DATA_DIR = join(ROOT, "src/data");
const MEDIA_DIR = join(ROOT, "public/assets/media");

// ── CLI args ──────────────────────────────────────────────────────────────────
const dryRun = process.argv.includes("--dry-run");
const verbose = process.argv.includes("--verbose");
const args = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const collections = args.length ? args : ["services", "resources", "posts", "testimonials", "marquee_items"];

// ── helpers ───────────────────────────────────────────────────────────────────
const EM = process.env.EMDASH_URL ?? "http://127.0.0.1:4321";
const TOKEN = process.env.EMDASH_TOKEN ?? "";

function log(type, slug, msg) {
  console.log(`${dryRun ? "[DRY]" : ""} ${type.padEnd(8)} ${(slug || "-").padEnd(45)} ${msg}`);
}

async function emdash(method, path, body) {
  const res = await fetch(`${EM}/_emdash/api/${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${res.status} ${JSON.stringify(data)}`);
  return data;
}

// Upload a local file to EmDash media library and return the media ULID.
async function uploadMedia(srcPath) {
  if (dryRun) return { id: "DRY_MEDIA_ID", storageKey: "dry/key" };
  const form = new FormData();
  form.append("file", await readFile(srcPath));
  const res = await fetch(`${EM}/_emdash/api/media/upload`, {
    method: "POST",
    headers: TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {},
    body: form,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Media upload failed: ${res.status} ${JSON.stringify(data)}`);
  return data; // { id, storageKey, ... }
}

// Resolve the media library ID for an image from src/data/*.json format.
// { src: "/assets/media/...", alt } → EmDash media entry with storageKey.
const mediaCache = new Map();

async function resolveMediaRef(img) {
  if (!img?.src) return null;
  if (mediaCache.has(img.src)) return mediaCache.get(img.src);
  // Try to upload the local file if it exists
  const localPath = join(ROOT, "public", img.src);
  try {
    const result = await uploadMedia(localPath);
    mediaCache.set(img.src, result);
    return result;
  } catch {
    // Fallback: return the src as-is (direct URL, not media library)
    log("media", img.src, "fallback to direct src");
    return { id: null, storageKey: null, src: img.src, alt: img.alt };
  }
}

// Convert our internal HTML-block format to EmDash portable text.
function toPortableText(content) {
  if (!content) return [];
  if (Array.isArray(content)) {
    return content.map((block) => {
      if (block._type === "html") {
        // Wrap raw HTML as a single block. The admin will show it as non-editable.
        return { _type: "html", html: block.html };
      }
      if (block._type === "block") return block;
      return null;
    }).filter(Boolean);
  }
  return [];
}

// ── import one collection ─────────────────────────────────────────────────────
async function importCollection(name, entries) {
  log("COLLECTION", name, `→ ${entries.length} entries`);
  for (const entry of entries) {
    try {
      // Map our internal format to EmDash data format.
      const data = mapEntry(name, entry);

      // Check if entry exists by trying to get it
      let existing;
      try {
        existing = await emdash("GET", `content/${name}/${entry.slug}`);
      } catch {
        existing = null;
      }

      if (existing?.entry) {
        if (dryRun) {
          log("update", entry.slug, "[would update]");
        } else {
          // Update existing entry
          const updated = await emdash("PUT", `content/${name}/${entry.slug}`, { data });
          log("update", entry.slug, "updated");
        }
      } else {
        if (dryRun) {
          log("create", entry.slug, "[would create]");
        } else {
          const created = await emdash("POST", `content/${name}`, {
            id: entry.slug,
            data,
            status: entry.status === "draft" ? "draft" : "published",
          });
          log("create", entry.slug, "created");
        }
      }

      // Handle taxonomy terms (assign after creation)
      if (entry.terms && !dryRun) {
        for (const [taxonomy, terms] of Object.entries(entry.terms)) {
          for (const term of terms) {
            try {
              await emdash("POST", `taxonomy/${taxonomy}/terms`, {
                name: term.label,
                slug: term.slug,
                contentSlug: entry.slug,
                contentCollection: name,
              });
            } catch (e) {
              // Term assignment is best-effort
              log("taxonomy", `${name}/${entry.slug}`, `assign ${taxonomy}:${term.slug} failed (may already exist)`);
            }
          }
        }
      }

      // Rate limit: be nice to the local server
      if (!dryRun) await sleep(100);
    } catch (err) {
      log("ERROR", entry.slug, err.message);
    }
  }
}

// Map a src/data entry to EmDash data format.
function mapEntry(collection, entry) {
  switch (collection) {
    case "services": {
      const img = entry.featured_image;
      return {
        title: entry.title,
        ...(img ? { featured_image: { src: img.src, alt: img.alt || "" } } : {}),
        price_label: entry.price_label || null,
        audience_label: entry.audience_label || null,
        format: entry.format || null,
        notice: entry.notice || null,
        booking_url: entry.booking_url || null,
        content: toPortableText(entry.content),
        ...(entry.order != null ? { order: entry.order } : {}),
      };
    }
    case "resources": {
      const img = entry.featured_image;
      return {
        title: entry.title,
        ...(img ? { featured_image: { src: img.src, alt: img.alt || "" } } : {}),
        badge_label: entry.badge_label || null,
        ctas: entry.ctas || [],
        video_url: entry.video_url || null,
        excerpt: entry.excerpt || null,
        content: toPortableText(entry.content),
        ...(entry.order != null ? { order: entry.order } : {}),
      };
    }
    case "posts": {
      const img = entry.featured_image;
      return {
        title: entry.title,
        excerpt: entry.excerpt || null,
        ...(img ? { featured_image: { src: img.src, alt: img.alt || "" } } : {}),
        content: toPortableText(entry.content),
        ...(entry.publishedAt ? { published_at: entry.publishedAt } : {}),
      };
    }
    case "testimonials": {
      return {
        title: entry.title || null,
        quote: entry.quote || "",
        author: entry.author || null,
        ...(entry.order != null ? { order: entry.order } : {}),
      };
    }
    case "marquee_items": {
      return {
        text: entry.text || "",
        link: entry.link || "",
        ...(entry.order != null ? { order: entry.order } : {}),
      };
    }
    default:
      return entry;
  }
}

// ── main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\nEmDash import from src/data/`);
  console.log(`Target: ${EM}`);
  console.log(`Dry run: ${dryRun}\n`);

  // Load JSON data
  const data = {};
  for (const name of collections) {
    const file = join(DATA_DIR, `${name}.json`);
    if (!existsSync(file)) {
      log("SKIP", name, "file not found");
      continue;
    }
    const content = readFileSync(file, "utf8");
    try {
      data[name] = JSON.parse(content);
    } catch (e) {
      log("ERROR", name, `failed to parse JSON: ${e.message}`);
    }
  }

  // Import each collection
  for (const [name, entries] of Object.entries(data)) {
    if (!Array.isArray(entries)) {
      log("SKIP", name, "not an array");
      continue;
    }
    await importCollection(name, entries);
  }

  console.log(`\nDone${dryRun ? " (dry run)" : ""}.\n`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
