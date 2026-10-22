import type { CSSProperties, ReactNode } from "react";

/* WaveSection — pale-pink section with wave-brush shape dividers
   (_global.md → WaveSection): top wave 52px, bottom wave 40px, both white. */
export interface WaveSectionProps {
	children?: ReactNode;
	className?: string;
	style?: CSSProperties;
}

export const WaveSection = ({ children, className = "", style }: WaveSectionProps = {}) => (
	<section
		className={`wave-section ${className}`}
		style={{
			backgroundColor: "#BF1E720D",
			position: "relative",
			padding: "0 50px",
			...style,
		}}
	>
		<img
			className="wave-section__wave wave-section__wave--top"
			src="/assets/wave-brush.svg"
			alt=""
			aria-hidden="true"
		/>
		<img
			className="wave-section__wave wave-section__wave--bottom"
			src="/assets/wave-brush.svg"
			alt=""
			aria-hidden="true"
		/>
		<div className="wave-section-inner">{children}</div>
	</section>
);
