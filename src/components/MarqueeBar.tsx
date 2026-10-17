/* Marquee bar — plum top bar with scrolling announcement(s).
   Data: marquee_items collection (text, link, order). Reimplements live's <marquee scrollamount=6 scrolldelay=85>
   as a CSS translateX loop at ~70px/s. Stops under prefers-reduced-motion. */
export const MarqueeBar = ({ items = [] } = {}) => {
	const reduce = typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;
	const fill = items.length ? [...items, ...items, ...items, ...items] : [];
	return (
		<div className="marquee-bar" style={{ background: "#5A0F36", height: "52px", padding: "0 10px" }}>
			<div
				className="marquee-inner"
				style={{ maxWidth: "1140px", margin: "0 auto", padding: "10px 0", display: "flex", alignItems: "center", gap: "0" }}
			>
				<div
					className="marquee-track"
					style={reduce ? {} : { display: "flex", gap: "0", animation: "marquee 14s linear infinite" }}
				>
					{fill.map((item, i) => (
						<span key={i} style={{ whiteSpace: "nowrap" }}>
							{item.link ? (
								<a
									href={item.link}
									style={{ color: "#ffffff", fontFamily: "system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif", fontSize: "17px", lineHeight: "25.5px", fontWeight: "600", textDecoration: "none" }}
								>
									{item.text}
								</a>
							) : (
								item.text
							)}
							{fill.length - 1 !== i && (
								<span style={{ color: "#ffffff", fontSize: "16px", lineHeight: "24px", fontWeight: "400", padding: "0 150px" }}> | </span>
							)}
						</span>
					))}
				</div>
			</div>
		</div>
	);
};
