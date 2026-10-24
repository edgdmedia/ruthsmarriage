/* PageHero — page header for the static pages. Same markup and styles as
   WaveHero.astro (components.css "Page header", owner request 2026-10-24):
   - "photo" keeps the page's photo under a plum gradient;
   - "pattern" / "pattern-flat" tile `image` if given, else the pink circles. */
export interface PageHeroProps {
	variant?: "photo" | "pattern" | "pattern-flat";
	title?: string;
	image?: string;
	className?: string;
}

export const PageHero = ({ variant = "photo", title, image, className = "" }: PageHeroProps = {}) => {
	const photo = variant === "photo" && Boolean(image);
	return (
		<header
			className={`wave-hero ${photo ? "wave-hero--photo" : "wave-hero--pattern"} ${className}`.trim()}
			style={image ? ({ "--hero-bg": `url("${image}")` } as React.CSSProperties) : undefined}
		>
			<div className="wave-hero__inner">{title && <h1 className="wave-hero__title">{title}</h1>}</div>
			<img className="wave-hero__waves" src="/assets/waves.svg" alt="" />
		</header>
	);
};
