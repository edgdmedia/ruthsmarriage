/* PageHero — page header variants (JetEngine components 377 "photo" / 394 "pattern").
   Data: page fields hero_title (default page title) and hero_image. */
export const PageHero = ({ variant = "photo", title, image, className = "" } = {}) => {
	const isPattern = variant === "pattern" || variant === "pattern-flat";
	const flat = variant === "pattern-flat";
	return (
		<div
			className={`page-hero page-hero--${variant} ${className}`}
			style={{
				width: "100%",
				position: "relative",
				minHeight: flat ? "350px" : isPattern ? "350px" : "350px",
				padding: isPattern ? "0 10px" : "0 50px",
				backgroundImage: image ? `url(${image})` : undefined,
				backgroundSize: isPattern ? "auto" : "cover",
				backgroundPosition: "center",
				display: "flex",
				alignItems: isPattern ? "center" : "flex-end",
				justifyContent: isPattern ? "center" : "flex-start",
			}}
		>
			{isPattern && (
				<div
					style={{
						position: "absolute",
						inset: 0,
						background: "#5A0F36",
						opacity: flat ? 1 : 0.89,
					}}
				/>
			)}
			{!isPattern && (
				<div
					style={{
						position: "absolute",
						inset: 0,
						background: "linear-gradient(180deg, rgba(191,30,114,0.25) 0%, #000 100%)",
					}}
				/>
			)}
			<div
				style={{
					position: "relative",
					zIndex: 2,
					color: "#ffffff",
					maxWidth: "1140px",
					margin: "0 auto",
					paddingBottom: flat ? 0 : isPattern ? 0 : "50px",
				}}
			>
				{h1 && (
					<h1
						style={{
							fontFamily: "Nunito, sans-serif",
							fontSize: flat ? "55px" : isPattern ? "55px" : "55px",
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
					src="/assets/waves.svg"
					alt=""
					style={{
						position: "absolute",
						bottom: flat ? "-1px" : "-1px",
						left: "50%",
						transform: "translateX(-50%) rotate(180deg)",
						width: flat ? "calc(100% + 1.3px)" : "calc(117% + 1.3px)",
						height: flat ? "37px" : "23px",
						objectFit: "cover",
						display: "block",
					}}
				/>
			)}
			<style>{`
				@media (max-width: 1024px) {
					.page-hero--photo { min-height: 309px; padding: 0 25px; }
					.page-hero--photo h1 { font-size: 40px; padding-bottom: 25px; }
					.page-hero--pattern, .page-hero--pattern-flat { min-height: 300px; padding: 0 50px; }
					.page-hero--pattern h1 { font-size: 40px; }
				}
				@media (max-width: 767px) {
					.page-hero--photo { min-height: 259px; padding: 0 25px; }
					.page-hero--photo h1 { font-size: 30px; padding-bottom: 25px; }
					.page-hero--pattern, .page-hero--pattern-flat { min-height: 250px; padding: 0 30px; }
					.page-hero--pattern h1 { font-size: 35px; }
					.page-hero--pattern .wave-divider-bottom, .page-hero--pattern-flat img[src*="waves"] { height: 17px; }
				}
			`}</style>
		</div>
	);
