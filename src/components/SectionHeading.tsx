/* SectionHeading — title + centred divider + optional subtitle (_global.md) */
export const SectionHeading = ({
	title = "",
	subtitle,
	className = "",
} = {}) => (
	<div
		className={`section-heading ${className}`}
		style={{ textAlign: "center", marginBottom: "20px" }}
	>
		{title && (
			<h2
				style={{ fontFamily: "'Nunito',sans-serif", fontSize: "32px", lineHeight: "32px", fontWeight: "600", color: "#000000", margin: "0 0 8px 0" }}
			>
				{title}
			</h2>
		)}
		{title && (
			<div
				style={{ width: "66px", height: "3px", borderTop: "3px solid #BF1E72", margin: "8px auto 0 auto" }}
			/>
		)}
		{subtitle && (
			<p
				style={{ fontFamily: "'Poppins',sans-serif", fontSize: "16px", lineHeight: "21px", fontWeight: "500", color: "#000000", margin: "20px 0 0 0" }}
			>
				{subtitle}
			</p>
		)}
	</div>
);
