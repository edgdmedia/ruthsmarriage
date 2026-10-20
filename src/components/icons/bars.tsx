import type { IconProps } from "./types";
export const IconBars = ({ className = "", style }: IconProps = {}) => (
	<svg className={className} style={style} aria-hidden="true" viewBox="0 0 448 512" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor">
		<path d="M0 96c0-13.3 10.7-24 24-24h400c13.3 0 24 10.7 24 24s-10.7 24-24 24H24C10.7 120 0 109.3 0 96zm448 160c0-13.3-10.7-24-24-24H24c-13.3 0-24 10.7-24 24s10.7 24 24 24h400c13.3 0 24-10.7 24-24zm0 160c0-13.3-10.7-24-24-24H24c-13.3 0-24 10.7-24 24s10.7 24 24 24h400c13.3 0 24-10.7 24-24z" />
	</svg>
);
