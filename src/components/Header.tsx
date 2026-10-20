/* Header — Elementor template 63. Marquee bar (scrolls away) + sticky main bar.
   Data: EmDash "primary" menu + marquee_items; logo from settings; Ask Coach Ruth → /askcoach/.
   Breakpoints (_global.md Main bar): tablet ≤1024px (nav column becomes hamburger,
   order last, width 10%), mobile ≤767px (space-between; logo 30%, nav 15%, CTA 50%).
   Layout lives in components.css (.site-header-* classes) — inline styles can't
   carry media queries. */
import { useState } from "react";
import { MarqueeBar } from "./MarqueeBar";
import { Button } from "./Button";
import { IconCaretDown } from "./icons/caret-down";
import { IconTimes } from "./icons/times";
import { IconBars } from "./icons/bars";

interface MenuItem {
	label: string;
	url?: string;
	children?: MenuItem[];
}

interface HeaderProps {
	menu?: { items: MenuItem[] } | null;
	marqueeItems?: Array<{ text: string; link: string }>;
	logoSrc?: string;
	askCoachHref?: string;
}

export const Header = ({ menu, marqueeItems, logoSrc, askCoachHref = "/askcoach/" }: HeaderProps) => {
	const items = menu?.items || [];
	const [open, setOpen] = useState(false);

	return (
		<header className="site-header">
			{marqueeItems && marqueeItems.length > 0 && <MarqueeBar items={marqueeItems} />}
			<div className="site-header-main">
				<div className="site-header-logo">
					<a href="/" aria-label="Ruth's Marriage">
						<img src={logoSrc || "/assets/logo-2-1.png"} alt="Ruth's Marriage" />
					</a>
				</div>
				<nav className="site-header-nav" aria-label="Primary">
					<div className="site-header-nav-items">
						{items.map((item, i) => (
							<DesktopNavItem key={i} item={item} />
						))}
					</div>
					<button
						type="button"
						className="site-header-toggle"
						aria-label="Menu"
						aria-expanded={open}
						onClick={() => setOpen((o) => !o)}
					>
						{open ? (
							<IconTimes />
						) : (
							<IconBars />
						)}
					</button>
				</nav>
				<div className="site-header-cta">
					<Button variant="plum-sm" href={askCoachHref}>
						Ask Coach Ruth
					</Button>
				</div>
			</div>
		</header>
	);
};

const DesktopNavItem = ({ item }: { item: MenuItem }) => {
	const hasChildren = item.children && item.children.length;
	return (
		<div className="site-header-nav-item">
			{hasChildren ? (
				<button type="button" aria-expanded="false">
					{item.label}
					<IconCaretDown style={{ width: "12px", height: "12px", padding: "10px 0 10px 10px" }} />
				</button>
			) : (
				<a href={item.url || "#"}>{item.label}</a>
			)}
			{hasChildren && (
				<div className="site-header-dropdown">
					{item.children!.map((c, j) => (
						<a key={j} href={c.url || "#"}>
							{c.label}
						</a>
					))}
				</div>
			)}
		</div>
	);
};
