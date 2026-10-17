/* ResourceCard — home "Resources" carousel card (template 225).
   367×270; whole card links to /resource/{slug}/. */
import { Button } from "./Button";

export const ResourceCard = ({ resource }: { resource: { slug: string; title: string; featuredImage?: string; badgeLabel?: string } }) => {
	const hasBadge = !!resource.badgeLabel;
	return (
		<a
			className="resource-card"
			href={`/resource/${resource.slug}/`}
			style={{
				display: "block",
				width: "367px",
				height: "270px",
				backgroundImage: `url(${resource.featuredImage || ""})`,
				backgroundSize: "cover",
				backgroundPosition: "center",
				borderRadius: "25px",
				overflow: "hidden",
				position: "relative",
				textDecoration: "none",
				color: "inherit",
				boxSizing: "border-box",
				transition: "all 0.3s",
			}}
		>
			<div
				style={{
					position: "absolute",
					inset: 0,
					background: "#5A0F36",
					opacity: "0.58",
					transition: "opacity 0.3s",
				}}
			/>
			<div style={{ padding: "20px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "10px", height: "100%", position: "relative", zIndex: 1 }}>
				{hasBadge ? (
					<Button
						variant="badge"
						href={`/resource/${resource.slug}/`}
					>
						{resource.badgeLabel}
					</Button>
				) : (
					<div style={{ width: "33px", height: "auto", borderRadius: "20px", background: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", padding: "8px 10px 5px" }}>
						<span style={{ display: "inline-block", width: "13px", height: "13px", borderRadius: "100%", background: "#BF1E72", marginRight: "6px" }} />
					</div>
				)}
				<div style={{ width: "111px", height: "2px", borderTop: "2px solid #FFFFFF", margin: "0 auto" }} />
				<h2
					style={{ fontFamily: "'Nunito',sans-serif", fontSize: "22px", lineHeight: "22px", fontWeight: "700", color: "#ffffff", margin: "0", textAlign: "center" }}
				>
					{resource.title}
				</h2>
			</div>
					</a>
	);
};
