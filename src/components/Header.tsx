/* Header — Elementor template 63. Marquee bar (scrolls away) + sticky main bar.
   Data: EmDash "primary" menu; logo from settings; Ask Coach Ruth → /askcoach/.
   Breakpoints: tablet ≤1024px (hamburger replaces nav), mobile ≤767px. */
import { useState } from "react";
import { MarqueeBar } from "./MarqueeBar";
import { IconCaretDown } from "./icons/caret-down";
import { IconTimes } from "./icons/times";

interface HeaderProps {
	menu?: { items: Array<{ label: string; url?: string; children?: Array<{ label: string; url?: string }> }>; marqueeItems?: Array<{ text: string; link: string }> } | null;
	logoSrc?: string;
	askCoachHref?: string;
}

export const Header = ({ menu, logoSrc, askCoachHref = "/askcoach/" }: HeaderProps) => {
	const items = menu?.items || [];
	const [open, setOpen] = useState(false);

	return (
		<header className="site-header" style={{ position: "relative", zIndex: 1000 }}>
			{menu?.marqueeItems && <MarqueeBar items={menu.marqueeItems} />}
			<div
				className="site-header-main"
				style={{
					background: "#ffffff",
					boxShadow: "0 0 31px -11px rgba(86,86,86,0.23)",
					padding: "10px 20px",
					display: "flex",
					alignItems: "center",
					gap: "10px",
					position: "sticky",
					top: 0,
					zIndex: 1000,
				}}
			>
				<div
					className="header-logo"
					style={{
						width: "15%",
						display: "flex",
						justifyContent: "center",
						alignItems: "center",
					}}
				>
					<a href="/" aria-label="Ruth's Marriage">
						<img src={logoSrc || "/assets/logo.png"} alt="Ruth's Marriage" style={{ width: "116px", height: "65px", objectFit: "contain" }} />
					</a>
				</div>
				<nav
					className="header-nav"
					style={{
						width: "70%",
						display: "flex",
						justifyContent: "center",
						alignItems: "center",
					}}
				>
					{items.map((item, i) => (
						<DesktopNavItem key={i} item={item} />
					))}
				</nav>
				<div className="header-cta" style={{ width: "16%", display: "flex", justifyContent: "flex-end" }}>
					<a href={askCoachHref} className="btn btn--plum-sm">
						Ask Coach Ruth
					</a>
				</div>
				<button
					className="header-toggle"
					aria-label="Menu"
					aria-expanded={open}
					style={{
						display: "none",
						width: "44px",
						height: "44px",
						border: "1px solid #ED0D82",
						borderRadius: "3px",
						background: "transparent",
						padding: "7px",
					}}
					onClick={() => setOpen((o) => !o)}
				>
					{open ? (
						<IconTimes style={{ color: "#ED0D82", width: "28px", height: "28px" }} />
					) : (
						<IconCaretDown style={{ color: "#ED0D82", width: "28px", height: "28px" }} />
					)}
				</button>
			</div>
		</header>
	);
};

const DesktopNavItem = ({ item }) => {
	const hasChildren = item.children && item.children.length;
	return (
		<div style={{ display: "flex", alignItems: "center", position: hasChildren ? "relative" : undefined }}>
			{hasChildren ? (
				<button
					type="button"
					style={{
						border: "none",
						background: "transparent",
						padding: "13px 7px",
						fontFamily: "Roboto, sans-serif",
						fontSize: "15px",
						lineHeight: "20px",
						fontWeight: "600",
						color: "#000000",
						cursor: "pointer",
						display: "flex",
						alignItems: "center",
						gap: "4px",
					}}
				>
					{item.label}
					<IconCaretDown style={{ width: "12px", height: "12px", padding: "10px 0 10px 10px" }} />
				</button>
			) : (
				<a
					href={item.url || "#"}
					style={{
						padding: "13px 7px",
						fontFamily: "Roboto, sans-serif",
						fontSize: "15px",
						lineHeight: "20px",
						fontWeight: "600",
						color: "#000000",
					}}
				>
					{item.label}
				</a>
			)}
		</div>
	);
};
