/* PageHero — page header variants (JetEngine components 377 "photo" / 394 "pattern").
   Data: page fields hero_title (default page title) and hero_image.
   min-height, padding, title size and wave height change per breakpoint, so they
   live in components.css ("PageHero"), not inline. */
export interface PageHeroProps {
	variant?: "photo" | "pattern" | "pattern-flat";
	title?: string;
	image?: string;
	className?: string;
}

export const PageHero = ({
	variant = "photo",
	title,
	image,
	className = "",
}: PageHeroProps = {}) => {
	const isPattern = variant === "pattern" || variant === "pattern-flat";
	const flat = variant === "pattern-flat";
	return (
		<div
			className={`page-hero page-hero--${variant} ${className}`}
			style={{
				width: "100%",
				position: "relative",
				backgroundImage: image ? `url(${image})` : undefined,
				backgroundSize: isPattern ? "auto" : "cover",
				backgroundPosition: "center",
				display: "flex",
				alignItems: isPattern ? "center" : "flex-end",
				justifyContent: isPattern ? "center" : "flex-start",
			}}
		>
			{isPattern ? (
				<div
					style={{
						position: "absolute",
						inset: 0,
						background: "#5A0F36",
						opacity: flat ? 1 : 0.89,
					}}
				/>
			) : (
				<div
					style={{
						position: "absolute",
						inset: 0,
						background:
							"linear-gradient(180deg, rgba(191,30,114,0.25) 0%, #000 100%)",
					}}
				/>
			)}
			<div
				className="page-hero__inner"
				style={{
					position: "relative",
					zIndex: 2,
					color: "#ffffff",
					width: "100%",
					maxWidth: "1140px",
					margin: "0 auto",
				}}
			>
				{title && (
					<h1
						style={{
							fontFamily: "Nunito, sans-serif",
							lineHeight: "1",
							fontWeight: flat ? 600 : 700,
							margin: 0,
							textAlign: isPattern ? "center" : "left",
						}}
					>
						{title}
					</h1>
				)}
			</div>
			{isPattern && (
				<img
					className="page-hero-waves"
					src="/assets/waves.svg"
					alt=""
					style={{
						position: "absolute",
						bottom: "-1px",
						left: "50%",
						transform: "translateX(-50%) rotate(180deg)",
						width: flat ? "calc(100% + 1.3px)" : "calc(117% + 1.3px)",
						objectFit: "cover",
						display: "block",
					}}
				/>
			)}
		</div>
	);
};
