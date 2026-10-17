/* TestimonialCard — home testimonial carousel card (template 462/468 alternate).
   Dark at even indexes, pink at odd. Speech-bubble tail via clip-path. */
export const TestimonialCard = ({ testimonial, variant = "dark" }) => {
	const isDark = variant === "dark";
	const bg = isDark ? "#63666A" : "#BF1E7224";
	const textColor = isDark ? "#EBEBEB" : "#474A4D";
	const iconColor = isDark ? "#FFFFFF" : "#474A4D";
	const iconGap = isDark ? "20px" : "10px";
	return (
		<div
			style={{
				width: "367px",
				background: bg,
				borderRadius: "20px 20px 2px 20px",
				clipPath: "polygon(0 0, 100% 0%, 99% 72%, 100% 100%, 88% 95%, 0 92%)",
				padding: "0 20px",
				display: "flex",
				flexDirection: "column",
				gap: "10px",
				color: textColor,
				fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
				fontSize: "16px",
				lineHeight: "24px",
				minHeight: "260px",
				boxSizing: "border-box",
			}}
		>
			<img
				src="/assets/icons/users.svg"
				alt=""
				style={{ width: "23px", height: "23px", marginTop: "20px", marginBottom: "10px", flexShrink: 0 }}
			/>
			<p style={{ margin: 0, lineHeight: "24px" }}>{testimonial.quote}</p>
			<div style={{ flexGrow: 1, paddingBottom: "40px" }} />
		</div>
	);
};

