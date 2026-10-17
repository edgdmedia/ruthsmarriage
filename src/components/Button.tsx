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
			style: {
				color: "#ffffff",
				backgroundColor: "#ED0D82",
				borderRadius: "20px",
				padding: "12px 24px",
				fontFamily: "'Nunito',sans-serif",
				fontSize: "15px",
				lineHeight: "15px",
				fontWeight: "500",
				transition: "all 0.3s",
			},
		},
		"white-hero": {
			"class": "btn btn--white-hero",
			style: {
				color: "#BF1E72",
				backgroundColor: "#ffffff",
				borderRadius: "20px",
				padding: "12px 24px",
				fontFamily: "'Nunito',sans-serif",
				fontSize: "15px",
				lineHeight: "15px",
				fontWeight: "500",
				transition: "all 0.3s",
			},
		},
		"white-hero-lg": {
			"class": "btn btn--white-hero-lg",
			style: {
				color: "#BF1E72",
				backgroundColor: "#ffffff",
				borderRadius: "20px",
				padding: "15px 30px",
				fontFamily: "'Nunito',sans-serif",
				fontSize: "16px",
				lineHeight: "16px",
				fontWeight: "600",
				transition: "all 0.3s",
			},
		},
		badge: {
			"class": "btn btn--badge",
			style: {
				color: "#BF1E72",
				backgroundColor: "#ffffff",
				borderRadius: "20px",
				padding: "8px 10px 5px",
				fontFamily: "'Nunito',sans-serif",
				fontSize: "13px",
				lineHeight: "13px",
				fontWeight: "500",
				transition: "all 0.3s",
				display: "inline-flex",
				alignItems: "center",
				gap: "6px",
			},
		},
		"plum-sm": {
			"class": "btn btn--plum-sm",
			style: {
				color: "#ffffff",
				backgroundColor: "#721646",
				borderRadius: "10px",
				padding: "10px",
				fontFamily: "'Nunito',sans-serif",
				fontSize: "12px",
				lineHeight: "12px",
				fontWeight: "500",
				transition: "all 0.3s",
				minHeight: "32px",
				display: "inline-flex",
				alignItems: "center",
				justifyContent: "center",
			},
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
			{iconBefore && <span style={{ marginRight: "5px" }}>{iconBefore}</span>}
			{children}
			{iconAfter && <span style={{ marginLeft: "5px" }}>{iconAfter}</span>}
		</Tag>
	);
};
