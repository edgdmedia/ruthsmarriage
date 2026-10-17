/* PostCard — home "Inspired Features" carousel card (template 239).
   360 wide in a 390px slide; whole card links to the post. */
export const PostCard = ({ post }: { post: { slug: string; title: string; featuredImage?: string; excerpt?: string; category?: { slug?: string; label?: string } | string } }) => {
	const excerpt = post.excerpt ? post.excerpt.split(/\s+/).slice(0, 10).join(" ") + "…" : "";
	const catLabel = typeof post.category === "string" ? post.category : post.category?.label;
	const catSlug = typeof post.category === "string" ? post.category : post.category?.slug;
	return (
		<a
			href={`/${post.slug}/`}
			style={{
				display: "block",
				width: "360px",
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
				{post.featuredImage && (
					<img
						src={post.featuredImage}
						alt=""
						style={{ width: "330px", minHeight: "164px", objectFit: "cover", borderRadius: 0, display: "block" }}
					/>
				)}
				{catLabel && (
					<a
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
					style="font-family:'Nunito',sans-serif;font-size:16px;line-height:16px;font-weight:700;color:#BF1E72;margin:0;text-align:left;"
				>
					{post.title}
				</h2>
				{excerpt && (
					<p
						style="font-family:'Poppins',sans-serif;font-size:14px;line-height:21px;font-weight:400;color:#333333;margin:0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;"
					>
						{excerpt}
					</p>
				)}
			</div>
			<style>{`
				a:hover { box-shadow: 0 0 22px -1px rgba(0,0,0,0.5); }
			`}</style>
		</a>
	);
};
