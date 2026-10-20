/* Marquee bar — plum top bar with scrolling announcement(s).
   Data: marquee_items collection (text, link, order). Reimplements live's <marquee scrollamount=6 scrolldelay=85>
   as a CSS translateX loop at ~70px/s. Stops under prefers-reduced-motion. */
export interface MarqueeItem {
	text: string;
	link?: string;
}

export interface MarqueeBarProps {
	items?: MarqueeItem[];
}

export const MarqueeBar = ({ items = [] }: MarqueeBarProps = {}) => {
	const fill = items.length ? [...items, ...items, ...items, ...items] : [];
	return (
		<div className="marquee-bar">
			<div className="marquee-inner">
				<div className="marquee-track">
					{fill.map((item, i) => (
						<span key={i}>
							{item.link ? (
								<a href={item.link}>{item.text}</a>
							) : (
								item.text
							)}
							{fill.length - 1 !== i && <span className="marquee-sep"> | </span>}
						</span>
					))}
				</div>
			</div>
		</div>
	);
};
