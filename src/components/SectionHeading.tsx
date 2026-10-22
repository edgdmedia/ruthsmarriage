/* SectionHeading — title + centred divider + optional subtitle (_global.md).
   Divider is a 19px-tall widget with the 66×3 bar 8px from its top; the gap
   above it is 20px. Testimonials use fontWeight 500 and showDivider false
   (home.md §4) and step the title size down at tablet/mobile. */
export interface SectionHeadingProps {
	title?: string;
	subtitle?: string;
	className?: string;
	fontWeight?: string;
	showDivider?: boolean;
}

export const SectionHeading = ({
	title = "",
	subtitle,
	className = "",
	fontWeight = "600",
	showDivider = true,
}: SectionHeadingProps = {}) => (
	<div className={`section-heading ${className}`}>
		{title && (
			<h2
				className="section-heading__title"
				style={{ fontWeight }}
			>
				{title}
			</h2>
		)}
		{title && showDivider && <div className="section-heading__divider" />}
		{subtitle && <p className="section-heading__subtitle">{subtitle}</p>}
	</div>
);
