import type { Service } from "../data/types";

/* ServiceCard — home "Counseling Services" carousel card (template 159).
   367×300 inside a 387px slide on desktop; full-width on mobile.
   Image is the card background; plum title panel sits at the bottom (flex-end). */
export const ServiceCard = ({ service }: { service: Service }) => {
	const img = service.featured_image;
	const imgUrl = img?.src ?? "";
	return (
		<a
			href={`/service/${service.slug}/`}
			style={{
				display: "flex",
				flexDirection: "column",
				justifyContent: "flex-end",
				width: "100%",
				maxWidth: "367px",
				minHeight: "300px",
				backgroundImage: imgUrl ? `url(${imgUrl})` : "none",
				backgroundSize: "cover",
				backgroundPosition: "center",
				borderRadius: "0 0 30px 30px",
				overflow: "hidden",
				textDecoration: "none",
				color: "inherit",
				boxSizing: "border-box",
				padding: "0 20px",
			}}
		>
			<div
				style={{
					background: "#5A0F36",
					borderRadius: "0 0 20px 20px",
					padding: "10px",
					gap: "10px",
					display: "flex",
					flexDirection: "column",
					boxSizing: "border-box",
				}}
			>
				<div style={{ width: "40px", height: "2px", borderTop: "2px solid #BF1E72" }} />
				<h3
					style={{ fontFamily: "'Nunito',sans-serif", fontSize: "19px", lineHeight: "19px", fontWeight: "600", color: "#ffffff", margin: "0" }}
				>
					{service.title}
				</h3>
				{service.audience_label && (
					<h4
						style={{ fontFamily: "'Nunito',sans-serif", fontSize: "17px", lineHeight: "17px", fontWeight: "600", fontStyle: "italic", color: "#ffffff", margin: "0" }}
					>
						{service.audience_label}
					</h4>
				)}
			</div>
		</a>
	);
};
