/* SectionHeading — title + centred divider + optional subtitle (_global.md) */
export const SectionHeading = ({
	title = "",
	subtitle,
	className = "",
} = {}) => (
	<div
		className={`section-heading ${className}`}
		style="text-align:center;margin-bottom:20px;"
	>
		{title && (
			<h2
				style="font-family:'Nunito',sans-serif;font-size:32px;line-height:32px;font-weight:600;color:#000000;margin:0 0 8px 0;"
			>
				{title}
			</h2>
		)}
		{title && (
			<div
				style="width:66px;height:3px;border-top:3px solid #BF1E72;margin:8px auto 0 auto;"
			/>
		)}
		{subtitle && (
			<p
				style="font-family:'Poppins',sans-serif;font-size:16px;line-height:21px;font-weight:500;color:#000000;margin:20px 0 0 0;"
			>
				{subtitle}
			</p>
		)}
	</div>
);
