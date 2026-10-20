import type { CSSProperties, ReactNode } from "react";

/* WaveSection — pale-pink section with plain borders (waves removed for now). */
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
			padding: "0 70px 70px",
			borderTop: "1px solid #EBEBEB",
			borderBottom: "1px solid #EBEBEB",
			...style,
		}}
	>
		<div className="wave-section-inner" style={{ position: "relative", zIndex: 2, paddingTop: "100px", maxWidth: "1140px", margin: "0 auto" }}>
			{children}
		</div>
	</section>
);
