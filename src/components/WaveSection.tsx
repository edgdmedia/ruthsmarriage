/* WaveSection — pale-pink section with wave-brush shape dividers top + bottom (_global.md). */
import { WaveDividerBrush } from "./icons/wave-brush";

export const WaveSection = ({ children, className = "", style } = {}) => (
	<section
		className={`wave-section ${className}`}
		style={{
			backgroundColor: "#BF1E720D",
			position: "relative",
			padding: "0 50px",
			...style,
		}}
	>
		<WaveDividerBrush
			className="wave-divider wave-divider-top"
			style={{
				position: "absolute",
				top: "-1px",
				left: "50%",
				transform: "translateX(-50%)",
				width: "calc(133% + 1.3px)",
				height: "52px",
				zIndex: 1,
			}}
		/>
		<WaveDividerBrush
			className="wave-divider wave-divider-bottom"
			style={{
				position: "absolute",
				bottom: "-1px",
				left: "50%",
				transform: "translateX(-50%) rotate(180deg)",
				width: "calc(116% + 1.3px)",
				height: "40px",
				zIndex: 1,
			}}
		/>
		<div className="wave-section-inner" style={{ position: "relative", zIndex: 2, paddingTop: "100px" }}>
			{children}
		</div>
	</section>
);
