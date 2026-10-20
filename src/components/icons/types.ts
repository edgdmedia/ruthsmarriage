import type { CSSProperties } from "react";

/** Shared props for the inline SVG icon components. */
export interface IconProps {
	className?: string;
	style?: CSSProperties;
	"aria-hidden"?: boolean;
}
