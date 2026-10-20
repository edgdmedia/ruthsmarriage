import type { Post } from "../data/types";

/* PostCard — home "Inspired Features" carousel card (template 239).
   360 wide in a 390px slide; whole card links to the post. */

/* The seeded excerpt is raw WP HTML (e.g. "<p>…&#8230;</p>"). Strip tags,
   decode the common entities, collapse whitespace, then trim to `words`. */
function cleanExcerpt(raw: string | null | undefined, words = 25): string {
	if (!raw) return "";
	const decoded = raw
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
		.trim()
		.replace(/[.…]+$/g, "")
		.trim();
	const parts = decoded.split(" ");
	if (parts.length <= words) return decoded;
	return parts.slice(0, words).join(" ") + "…";
}

export const PostCard = ({ post }: { post: Post }) => {
	const img = post.featured_image;
	const imgUrl = img?.src ?? "";
	const excerpt = cleanExcerpt(post.excerpt, 25);
	const category = post.terms?.category?.[0];
	const catLabel = category?.label;
	const catSlug = category?.slug;
	return (
		<article
			className="post-card"
			style={{
				display: "block",
				width: "100%",
				maxWidth: "360px",
				background: "#ffffff",
				borderRadius: "10px",
				boxShadow: "0 0 28px -10px rgba(156,156,156,0.5)",
				transition: "box-shadow 0.3s",
				textDecoration: "none",
				color: "inherit",
				overflow: "hidden",
			}}
		>
			<div
				style={{
					padding: "15px 15px",
					display: "flex",
					flexDirection: "column",
					gap: "13px",
					height: "100%",
				}}
			>
				{imgUrl && (
					<img
						src={imgUrl}
						alt=""
						style={{ width: "100%", minHeight: "164px", objectFit: "cover", borderRadius: 0, display: "block" }}
					/>
				)}
				{catLabel && (
					<a
						className="post-card__category"
						href={catSlug ? `/category/${catSlug}/` : "#"}
						style={{
							display: "inline-flex",
							alignItems: "center",
							background: "#BF1E72",
							padding: "0 5px 1px",
							borderRadius: "20px",
							fontSize: "12px",
							lineHeight: "18px",
							fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
							color: "#FDFDFD",
							textDecoration: "none",
						}}
					>
						<span
							style={{
								display: "inline-block",
								width: "10px",
								height: "10px",
								borderRadius: "100%",
								background: "#ffffff",
								marginRight: "3px",
							}}
						/>
						{catLabel}
					</a>
				)}
				<h2
					style={{ fontFamily: "'Nunito',sans-serif", fontSize: "16px", lineHeight: "16px", fontWeight: "700", color: "#BF1E72", margin: "0", textAlign: "left" }}
				>
					<a className="post-card__title" href={`/${post.slug}/`}>
						{post.title}
					</a>
				</h2>
				{excerpt && (
					<p
						style={{ fontFamily: "'Poppins',sans-serif", fontSize: "14px", lineHeight: "21px", fontWeight: "400", color: "#333333", margin: "0", display: "-webkit-box", WebkitLineClamp: "4", WebkitBoxOrient: "vertical", overflow: "hidden" }}
					>
						{excerpt}
					</p>
				)}
			</div>
		</article>
	);
};
