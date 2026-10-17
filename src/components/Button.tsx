/* Button variants — measured from live Elementor buttons (_global.md → Buttons).
   No visible hover change (0.3s transition kept) unless a page map says otherwise. */
export const Button = ({
	href,
	children,
	variant = "pink",
	className = "",
	iconBefore,
	iconAfter,
	...rest
} = {}) => {
	const variants = {
		pink: {
			"class": "btn btn--pink",
			style: "color:#ffffff;background-color:#ED0D82;border-radius:20px;padding:12px 24px;font-family:'Nunito',sans-serif;font-size:15px;line-height:15px;font-weight:500;transition:all 0.3s;",
		},
		"white-hero": {
			"class": "btn btn--white-hero",
			style: "color:#BF1E72;background-color:#ffffff;border-radius:20px;padding:12px 24px;font-family:'Nunito',sans-serif;font-size:15px;line-height:15px;font-weight:500;transition:all 0.3s;",
		},
		"white-hero-lg": {
			"class": "btn btn--white-hero-lg",
			style: "color:#BF1E72;background-color:#ffffff;border-radius:20px;padding:15px 30px;font-family:'Nunito',sans-serif;font-size:16px;line-height:16px;font-weight:600;transition:all 0.3s;",
		},
		badge: {
			"class": "btn btn--badge",
			style: "color:#BF1E72;background-color:#ffffff;border-radius:20px;padding:8px 10px 5px;font-family:'Nunito',sans-serif;font-size:13px;line-height:13px;font-weight:500;transition:all 0.3s;display:inline-flex;align-items:center;gap:6px;",
		},
		"plum-sm": {
			"class": "btn btn--plum-sm",
			style: "color:#ffffff;background-color:#721646;border-radius:10px;padding:10px;font-family:'Nunito',sans-serif;font-size:12px;line-height:12px;font-weight:500;transition:all 0.3s;min-height:32px;display:inline-flex;align-items:center;justify-content:center;",
		},
	};
	const v = variants[variant] || variants.pink;
	const Tag = href ? "a" : "button";
	return (
		<Tag
			className={`button ${v["class"]} ${className}`}
			style={v.style}
			{...(href ? { href } : { type: "button" })}
			{...rest}
		>
			{iconBefore && <span style="margin-right:5px;">{iconBefore}</span>}
			{children}
			{iconAfter && <span style="margin-left:5px;">{iconAfter}</span>}
		</Tag>
	);
};
