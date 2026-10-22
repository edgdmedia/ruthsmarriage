import type { IconProps } from "./types";
export const IconSmile = ({ className = "", style }: IconProps = {}) => (
	<svg className={className} style={style} aria-hidden="true" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor">
		<circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"></circle>
		<path d="M9.5 9.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5zM15 9.5c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5.67-1.5 1.5-1.5 1.5.67 1.5 1.5zM12 16c-2.2 0-4.2-1.2-5.3-3 1-1.8 3-2.9 5.3-2.9s4.3 1.1 5.3 3c-1.1 1.8-3.1 3-5.3 3z"></path>
	</svg>
);
