/* Header — Elementor template 63. Marquee bar (scrolls away) + sticky main bar.
   Data: EmDash "primary" menu + marquee_items; logo from settings; Ask Coach Ruth → /askcoach/.
   Breakpoints (_global.md Main bar): tablet ≤1024px (nav column becomes hamburger,
   order last, width 10%), mobile ≤767px (space-between; logo 30%, nav 15%, CTA 50%).
   Layout lives in components.css (.site-header-* classes) — inline styles can't
   carry media queries.

   Behaviour:
   - Desktop dropdowns open on hover/focus (CSS) and close on Esc (JS).
   - Mobile: hamburger opens a full-width panel under the main bar with accordion
     submenus; Esc closes, focus is trapped inside the panel, body scroll is locked.
   - Main bar shrinks slightly on scroll (sticky shadow stays).
 */
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
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
	const panelRef = useRef<HTMLDivElement>(null);
	const firstFocusableRef = useRef<HTMLElement | null>(null);
	const lastFocusableRef = useRef<HTMLElement | null>(null);
	const prevFocusedRef = useRef<HTMLElement | null>(null);

	const setFirstFocusableRef = useCallback((el: HTMLElement | null) => {
		firstFocusableRef.current = el;
	}, []);
	const setLastFocusableRef = useCallback((el: HTMLElement | null) => {
		lastFocusableRef.current = el;
	}, []);

	// --- sticky header shrink on scroll ---
	const onScroll = useCallback(() => {
		setScrolled(window.scrollY > SCROLL_SHRINK_PX);
	}, []);
	useEffect(() => {
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, [onScroll]);

	// --- open / close mobile panel ---
	const openPanel = useCallback(() => {
		prevFocusedRef.current = document.activeElement as HTMLElement | null;
		setOpen(true);
		document.body.style.overflow = "hidden";
	}, []);
	const closePanel = useCallback(() => {
		setOpen(false);
		document.body.style.overflow = "";
		if (prevFocusedRef.current) {
			prevFocusedRef.current.focus({ preventScroll: true });
			prevFocusedRef.current = null;
		}
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

	// --- focus trap inside the mobile panel ---
	const onPanelKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
		if (event.key !== "Escape") {
			// Cycle tab focus within the panel.
			if (event.key === "Tab") {
				if (event.shiftKey) {
					if (
						document.activeElement === firstFocusableRef.current
					) {
						event.preventDefault();
						lastFocusableRef.current?.focus({ preventScroll: true });
					}
				} else if (
					document.activeElement === lastFocusableRef.current
				) {
					event.preventDefault();
					firstFocusableRef.current?.focus({ preventScroll: true });
				}
			}
			return;
		}
		closePanel();
	};

	// Focus the first focusable element when the panel opens.
	useEffect(() => {
		if (!open || !panelRef.current) return;
		const timer = setTimeout(() => {
			firstFocusableRef.current?.focus({ preventScroll: true });
		}, 50);
		return () => clearTimeout(timer);
	}, [open]);

	// --- mobile submenu accordion state (one parent open at a time) ---
	const [subOpen, setSubOpen] = useState<number | null>(null);
	const toggleSubmenu = (i: number) =>
		setSubOpen((cur) => (cur === i ? null : i));

	const hasChildren = (item: MenuItem) =>
		Boolean(item.children && item.children.length);

	const itemCount = items.length;

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
						type="button"
						className="site-header-toggle"
						aria-label="Menu"
						aria-expanded={open}
						onClick={open ? closePanel : openPanel}
					>
						{open ? <IconTimes /> : <IconBars />}
					</button>
				</nav>
				<div className="site-header-cta">
					<Button variant="plum-sm" href={askCoachHref}>
						Ask Coach Ruth
					</Button>
				</div>
			</div>
			{open && (
				<div
					className="site-header-mobile-overlay"
					onClick={closePanel}
					aria-hidden="true"
				/>
			)}
			{open && (
				<div
					ref={panelRef}
					className="site-header-mobile-panel"
					onKeyDown={onPanelKeyDown}
					role="dialog"
					aria-modal="true"
					aria-label="Main menu"
				>
					<button
						type="button"
						className="site-header-mobile-close"
						ref={setFirstFocusableRef}
						onClick={closePanel}
						aria-label="Close menu"
					>
						<IconTimes />
					</button>
					<div className="site-header-mobile-logo">
						<a href="/" aria-label="Ruth's Marriage">
							<img
								src={logoSrc || "/assets/logo-2-1.png"}
								alt="Ruth's Marriage"
							/>
						</a>
					</div>
					<nav className="site-header-mobile-nav" aria-label="Primary">
						{items.map((item, i) => (
							<MobileNavItem
								key={i}
								item={item}
								index={i}
								isFirst={i === 0}
								isLast={i === itemCount - 1}
								isOpen={subOpen === i}
								toggleSubmenu={toggleSubmenu}
								hasChildren={hasChildren(item)}
								setFirstFocusableRef={setFirstFocusableRef}
								setLastFocusableRef={setLastFocusableRef}
							/>
						))}
					</nav>
					<div className="site-header-mobile-cta">
						<Button variant="plum-sm" href={askCoachHref}>
							Ask Coach Ruth
						</Button>
					</div>
					<button
						type="button"
						className="site-header-mobile-close-bottom"
						ref={setLastFocusableRef}
						onClick={closePanel}
						aria-label="Close menu"
					>
						<IconTimes />
					</button>
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
	isFirst: boolean;
	isLast: boolean;
	isOpen: boolean;
	toggleSubmenu: (i: number) => void;
	hasChildren: boolean;
	setFirstFocusableRef: (el: HTMLElement | null) => void;
	setLastFocusableRef: (el: HTMLElement | null) => void;
};

const MobileNavItem = ({
	item,
	index,
	isFirst,
	isLast,
	isOpen,
	toggleSubmenu,
	hasChildren,
	setFirstFocusableRef,
	setLastFocusableRef,
}: MobileNavItemProps) => (
	<div className="site-header-mobile-item">
		{hasChildren ? (
			<button
				type="button"
				className="site-header-mobile-parent"
				aria-expanded={isOpen}
				onClick={() => toggleSubmenu(index)}
			>
				{item.label}
				<IconCaretDown
					style={{
						width: "12px",
						height: "12px",
						marginLeft: "auto",
					}}
				/>
			</button>
		) : (
			<a
				className="site-header-mobile-link"
				href={item.url || "#"}
				ref={
					isFirst
						? setFirstFocusableRef
						: isLast
							? setLastFocusableRef
							: undefined
				}
			>
				{item.label}
			</a>
		)}
		{hasChildren && isOpen && (
			<div className="site-header-mobile-submenu">
				{item.children!.map((c, j) => (
					<a
						key={j}
						className="site-header-mobile-sublink"
						href={c.url || "#"}
					>
						{c.label}
					</a>
				))}
			</div>
		)}
	</div>
);
