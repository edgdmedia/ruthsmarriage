/* Marquee bar — plum top bar with scrolling announcement(s).
   Data: marquee_items collection (text, link, order). Reimplements live's <marquee scrollamount=6 scrolldelay=85>
   as a CSS translateX loop at ~70px/s. Stops under prefers-reduced-motion. */
export const MarqueeBar = ({ items = [] } = {}) => {
	const reduce = typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;
	const fill = items.length ? [...items, ...items, ...items, ...items] : [];
	return (
		<div className="marquee-bar" style="background:#5A0F36;height:52px;padding:0 10px;">
			<div
				className="marquee-inner"
				style="max-width:1140px;margin:0 auto;padding:10px 0;display:flex;align-items:center;gap:0;"
			>
				<div
					className="marquee-track"
					style={reduce ? {} : { display: "flex", gap: "0", animation: "marquee 14s linear infinite" }}
				>
					{fill.map((item, i) => (
						<span key={i} style="white-space:nowrap;">
							{item.link ? (
								<a
									href={item.link}
									style="color:#ffffff;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;font-size:17px;line-height:25.5px;font-weight:600;text-decoration:none;"
								>
									{item.text}
								</a>
							) : (
								item.text
							)}
							{fill.length - 1 !== i && (
								<span style="color:#ffffff;font-size:16px;line-height:24px;font-weight:400;padding:0 150px;"> | </span>
							)}
						</span>
					))}
				</div>
			</div>
			{!reduce && (
				<style>{`
					@keyframes marquee {
						from { transform: translateX(0); }
						to { transform: translateX(-50%); }
					}
				`}</style>
			)}
		</div>
	);
};
