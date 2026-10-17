/* ServiceCard — home "Counseling Services" carousel card (template 159).
   367×300 inside a 387px slide; whole card links to /service/{slug}/. */
export const ServiceCard = ({ service }) => {
	const titlePanelBottom = `calc(100% - 20px)`;
	return (
		<a
			href={`/service/${service.slug}/`}
			style={{
				display: "block",
				width: "367px",
				minHeight: "300px",
				backgroundImage: `url(${service.featuredImage || ""})`,
				backgroundSize: "cover",
				backgroundPosition: "center",
				borderRadius: "0 0 30px 30px",
				overflow: "hidden",
				textDecoration: "none",
				color: "inherit",
				boxSizing: "border-box",
			}}
		>
			<div style={{ padding: "0 20px", display: "flex", flexDirection: "column", height: "100%", justifyContent: "flex-end" }}>
				<div
					style={{
						background: "#5A0F36",
						borderRadius: "0 0 20px 20px",
						padding: "10px",
						gap: "10px",
						width: "327px",
						marginBottom: "-20px",
						display: "flex",
						flexDirection: "column",
					}}
				>
					<div style={{ width: "40px", height: "2px", borderTop: "2px solid #BF1E72", marginBottom: "0" }} />
					<h3
						style="font-family:'Nunito',sans-serif;font-size:19px;line-height:19px;font-weight:600;color:#ffffff;margin:0;"
					>
						{service.title}
					</h3>
					{service.audienceLabel && (
						<h4
							style="font-family:'Nunito',sans-serif;font-size:17px;line-height:17px;font-weight:600;font-style:italic;color:#ffffff;margin:0;"
						>
							{service.audienceLabel}
						</h4>
					)}
				</div>
			</div>
		</a>
	);
};
