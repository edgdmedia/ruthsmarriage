/* TestimonialCard — home testimonial carousel card (template 462/468 alternate).
   Dark at even indexes, pink at odd. Speech-bubble tail via clip-path.
   Icon is `fas-users` 23px (home.md §4). */
import { IconUsers } from "./icons/users";
import type { Testimonial } from "../data/types";

export const TestimonialCard = ({
	testimonial,
	variant = "dark",
}: {
	testimonial: Testimonial;
	variant?: "dark" | "pink";
}) => {
	const isDark = variant === "dark";
	const bg = isDark ? "#63666A" : "#BF1E7224";
	const textColor = isDark ? "#EBEBEB" : "#474A4D";
	const iconColor = isDark ? "#FFFFFF" : "#474A4D";
	// Live: 10px between icon and quote on the pink card, 20px on the dark one.
	const iconGap = isDark ? "20px" : "10px";
	return (
		<div
			style={{
				width: "100%",
				margin: "0 10px",
				background: bg,
				borderRadius: "20px 20px 2px 20px",
				clipPath: "polygon(0 0, 100% 0%, 99% 72%, 100% 100%, 88% 95%, 0 92%)",
				padding: "20px 20px 40px",
				display: "flex",
				flexDirection: "column",
				gap: iconGap,
				color: textColor,
				fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
				fontSize: "16px",
				lineHeight: "24px",
				boxSizing: "border-box",
			}}
		>
			<div style={{ height: "29px", display: "flex", alignItems: "center" }}>
				<IconUsers style={{ width: "23px", height: "23px", flexShrink: 0, color: iconColor }} />
			</div>
			<p style={{ margin: "0 0 14px 0", lineHeight: "24px" }}>{testimonial.quote}</p>
		</div>
	);
};
