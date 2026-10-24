/* Header — Elementor template 63. Marquee bar (scrolls away) + sticky main bar.
   Data: EmDash "primary" menu + marquee_items; logo from settings; Ask Coach Ruth → /askcoach/.
   Breakpoints (_global.md Main bar): tablet ≤1024px (nav column becomes hamburger,
   order last, width 10%), mobile ≤767px (space-between; logo 30%, nav 15%, CTA 50%).
   Layout lives in components.css (.site-header-* classes) — inline styles can't
   carry media queries.

   Behaviour:
   - Desktop dropdowns open on hover/focus (CSS) and close on Esc (JS).
   - Mobile (≤1024): the hamburger is a disclosure button for a full-width panel
     directly under the main bar (as live: no overlay, no extra close buttons, page
     still scrolls). Accordion submenus; opening focuses the first item; Esc
     closes and returns focus to the hamburger.
   - Main bar shrinks slightly on scroll (sticky shadow stays).
 */
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { MarqueeBar } from "./MarqueeBar";
import { Button } from "./Button";
import { IconCaretDown } from "./icons/caret-down";
import { IconTimes } from "./icons/times";
import { IconBars } from "./icons/bars";
import { IconSearch } from "./icons/search";

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

const SCROLL_SHRINK_PX = 10;

export const Header = ({
	menu,
	marqueeItems,
	logoSrc,
	askCoachHref = "/askcoach/",
}: HeaderProps) => {
	const items = menu?.items || [];
	const [open, setOpen] = useState(false);
	const [scrolled, setScrolled] = useState(false);
	const [searchOpen, setSearchOpen] = useState(false);
	const searchInputRef = useRef<HTMLInputElement>(null);
	useEffect(() => {
		if (searchOpen) searchInputRef.current?.focus({ preventScroll: true });
	}, [searchOpen]);
	const panelRef = useRef<HTMLDivElement>(null);
	// Focus returns here when the mobile panel closes (it opened from this button).
	const toggleRef = useRef<HTMLButtonElement>(null);

	// --- sticky header shrink on scroll ---
	const onScroll = useCallback(() => {
		setScrolled(window.scrollY > SCROLL_SHRINK_PX);
	}, []);
	useEffect(() => {
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, [onScroll]);

	// --- open / close mobile panel ---
	const openPanel = useCallback(() => setOpen(true), []);
	const closePanel = useCallback(() => {
		setOpen(false);
		toggleRef.current?.focus({ preventScroll: true });
	}, []);

	// --- Esc closes desktop dropdowns (blur the focused item/button) ---
	const handleKeyDown = (event: KeyboardEvent) => {
		if (event.key !== "Escape") return;
		const active = document.activeElement;
		if (!active) return;
		// If focus is inside a dropdown or on a parent button, blur it so the
		// CSS :focus-within dropdown closes.
		if (
			active.closest(".site-header-dropdown") ||
			active.closest(".site-header-nav-item button")
		) {
			(active as HTMLElement).blur();
		}
		// Close the mobile panel too.
		if (open) closePanel();
	};
	useEffect(() => {
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [open, closePanel]);

	// Focus the first focusable element when the panel opens.
	useEffect(() => {
		if (!open || !panelRef.current) return;
		const timer = setTimeout(() => {
			panelRef.current?.querySelector<HTMLElement>("a, button")?.focus({ preventScroll: true });
		}, 50);
		return () => clearTimeout(timer);
	}, [open]);

	// --- mobile submenu accordion state (one parent open at a time) ---
	const [subOpen, setSubOpen] = useState<number | null>(null);
	const toggleSubmenu = (i: number) =>
		setSubOpen((cur) => (cur === i ? null : i));

	const hasChildren = (item: MenuItem) =>
		Boolean(item.children && item.children.length);

	return (
		<header className="site-header">
			{marqueeItems && marqueeItems.length > 0 && (
				<MarqueeBar items={marqueeItems} />
			)}
			<div
				className={`site-header-main ${scrolled ? "site-header--scrolled" : ""}`}
			>
				<div className="site-header-logo">
					<a href="/" aria-label="Ruth's Marriage">
						<img src={logoSrc || "/assets/logo-2-1.png"} alt="Ruth's Marriage" />
					</a>
				</div>
				<nav className="site-header-nav" aria-label="Primary">
					<div className="site-header-nav-items">
						{items.map((item, i) => (
							<Fragment key={i}>
								{i > 0 && (
									<span
										className="site-header-nav-divider"
										aria-hidden="true"
									/>
								)}
								<DesktopNavItem item={item} />
							</Fragment>
						))}
					</div>
					<button
						ref={toggleRef}
						type="button"
						className="site-header-toggle"
						aria-label={open ? "Close menu" : "Menu"}
						aria-expanded={open}
						aria-controls="site-header-mobile-panel"
						onClick={open ? closePanel : openPanel}
					>
						{open ? <IconTimes /> : <IconBars />}
					</button>
				</nav>
				<div className="site-header-cta">
					<button
						type="button"
						className="site-header-search-toggle"
						aria-label={searchOpen ? "Close search" : "Search"}
						aria-expanded={searchOpen}
						aria-controls="site-header-search"
						onClick={() => setSearchOpen((v) => !v)}
					>
						{searchOpen ? <IconTimes /> : <IconSearch />}
					</button>
					<Button variant="plum-sm" href={askCoachHref}>
						Ask Coach Ruth
					</Button>
				</div>
				{searchOpen && (
					<form
						id="site-header-search"
						className="site-header-search"
						action="/"
						method="get"
						role="search"
						onKeyDown={(e) => e.key === "Escape" && setSearchOpen(false)}
					>
						<input
							ref={searchInputRef}
							type="search"
							name="s"
							placeholder="Search the site"
							aria-label="Search"
							required
						/>
						<button type="submit">Search</button>
					</form>
				)}
			</div>
			{open && (
				<div ref={panelRef} id="site-header-mobile-panel" className="site-header-mobile-panel">
					<nav className="site-header-mobile-nav" aria-label="Primary">
						{items.map((item, i) => (
							<MobileNavItem
								key={i}
								item={item}
								index={i}
								isOpen={subOpen === i}
								toggleSubmenu={toggleSubmenu}
								hasChildren={hasChildren(item)}
							/>
						))}
					</nav>
				</div>
			)}
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
					<span className="site-header-nav-caret">
						<IconCaretDown />
					</span>
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

type MobileNavItemProps = {
	item: MenuItem;
	index: number;
	isOpen: boolean;
	toggleSubmenu: (i: number) => void;
	hasChildren: boolean;
};

const MobileNavItem = ({ item, index, isOpen, toggleSubmenu, hasChildren }: MobileNavItemProps) => (
	<div className="site-header-mobile-item">
		{hasChildren ? (
			<button
				type="button"
				className="site-header-mobile-parent"
				aria-expanded={isOpen}
				onClick={() => toggleSubmenu(index)}
			>
				{item.label}
				<IconCaretDown className="site-header-mobile-caret" />
			</button>
		) : (
			<a className="site-header-mobile-link" href={item.url || "#"}>
				{item.label}
			</a>
		)}
		{hasChildren && isOpen && (
			<div className="site-header-mobile-submenu">
				{item.children!.map((c, j) => (
					<a key={j} className="site-header-mobile-sublink" href={c.url || "#"}>
						{c.label}
					</a>
				))}
			</div>
		)}
	</div>
);
