import type { PortableText } from "../data/types";

/** Strip tags, decode the entities WordPress emits, and collapse whitespace. */
export function htmlToText(raw: string | null | undefined): string {
	if (!raw) return "";
	return raw
		.replace(/<[^>]+>/g, " ")
		.replace(/&#8230;|&hellip;/gi, "…")
		.replace(/&#8217;|&rsquo;/gi, "’")
		.replace(/&#8216;|&lsquo;/gi, "‘")
		.replace(/&#8220;|&ldquo;/gi, "“")
		.replace(/&#8221;|&rdquo;/gi, "”")
		.replace(/&#8211;|&ndash;/gi, "–")
		.replace(/&#8212;|&mdash;/gi, "—")
		.replace(/&nbsp;/gi, " ")
		.replace(/&amp;/gi, "&")
		.replace(/&#\d+;/g, "")
		.replace(/\s+/g, " ")
		.trim();
}

/** Plain text of a content field (block spans or raw HTML blocks). */
export const contentText = (content: PortableText | null | undefined) =>
	htmlToText(
		(content ?? [])
			.map((b) => (b._type === "html" ? b.html : b.children.map((c) => c.text).join("")))
			.join(" "),
	);

/** WordPress archive excerpt: the manual excerpt, else the first 55 words + " […]". */
export function archiveExcerpt(entry: { excerpt?: string | null; content?: PortableText | null }): string {
	if (entry.excerpt) return htmlToText(entry.excerpt);
	const words = contentText(entry.content).split(" ").filter(Boolean);
	return words.length > 55 ? `${words.slice(0, 55).join(" ")} […]` : words.join(" ");
}
