/* Marquee bar — plum top bar with scrolling announcement(s).
   Data: marquee_items collection (text, link, order). Reimplements live's
   <marquee scrollamount=6 scrolldelay=85> as a CSS translateX loop at
   ~70px/s: the track starts just off the right edge and scrolls left, wrapping
   seamlessly (two copies of the group, -50% = one group). Stops under
   prefers-reduced-motion. */
export interface MarqueeItem {
	text: string;
	link?: string;
}

export interface MarqueeBarProps {
	items?: MarqueeItem[];
}

export const MarqueeBar = ({ items = [] }: MarqueeBarProps = {}) => {
	// Two copies of the group so the -50% loop is seamless.
	const fill = items.length ? [...items, ...items] : [];
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
