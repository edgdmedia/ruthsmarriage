/* Footer — Elementor template 329. Near-black, 4 columns + bottom row.
   Data: menus "primary" / "footer-services" / "footer-resources", settings socials + emails.
   Spec: _global.md Footer section. */
import { useState } from "react";
import { IconFacebook } from "./icons/facebook";
import { IconTwitter } from "./icons/twitter";
import { IconInstagram } from "./icons/instagram";
import { IconYoutube } from "./icons/youtube";
import { IconThreads } from "./icons/threads";
import { IconCaretDown } from "./icons/caret-down";

const SOCIALS = [
	{ key: "facebook", bg: "#3B5998", Icon: IconFacebook },
	{ key: "twitter", bg: "#1DA1F2", Icon: IconTwitter },
	{ key: "instagram", bg: "#262626", Icon: IconInstagram },
	{ key: "youtube", bg: "#CD201F", Icon: IconYoutube },
	{ key: "threads", bg: "#000000", Icon: IconThreads },
];

interface MenuItem {
	label: string;
	url?: string;
	children?: MenuItem[];
}

interface FooterMenus {
	primary?: { items: MenuItem[] };
	footerServices?: { items: MenuItem[] };
	footerResources?: { items: MenuItem[] };
}

interface FooterSettings {
	social?: Record<string, string>;
	contactEmails?: string[];
	title?: string;
	url?: string;
}

export const Footer = ({
	menus,
	settings,
}: { menus?: FooterMenus; settings?: FooterSettings } = {}) => {
	const primary = menus?.primary || { items: [] };
	const services = menus?.footerServices || { items: [] };
	const resources = menus?.footerResources || { items: [] };
	const socials = settings?.social || {};
	const emails = settings?.contactEmails || ["admin@ruthsmarriage.com", "ruthsmarriage@gmail.com"];
	const year = new Date().getFullYear();

	return (
		<footer className="site-footer">
			<div className="footer-inner">
				{/* 4-column row: Contact, Services, Resources, Links */}
				<div className="footer-grid">
					{/* 1. Contact */}
					<div className="footer-col footer-contact">
						<h5 className="footer-col-title">Contact</h5>
						<p className="footer-emails">
							{emails.map((email, i) => (
								<span key={i}>
									<a href={`mailto:${email}`}>{email}</a>
									{i < emails.length - 1 && ", "}
								</span>
							))}
						</p>
						<div className="footer-socials">
							{SOCIALS.map((s) => {
								const url = socials[s.key];
								if (!url) return null;
								return (
									<a
										key={s.key}
										href={url}
										target="_blank"
										rel="noopener noreferrer"
										className="footer-social"
										style={{ background: s.bg }}
									>
										<s.Icon />
									</a>
								);
							})}
						</div>
					</div>

					{/* 2. Services */}
					<FooterMenuColumn title="Services" items={services.items} />

					{/* 3. Resources */}
					<FooterMenuColumn title="Resources" items={resources.items} />

					{/* 4. Links (vertical primary menu with carets) */}
					<div className="footer-col footer-links">
						<h5 className="footer-col-title">Links</h5>
						<div className="footer-links-list">
							{primary.items.map((item, i) => (
								<FooterDropdownItem key={i} item={item} />
							))}
						</div>
					</div>
				</div>

				{/* Bottom bar: copyright left, legal links right (desktop); legal above copyright centered (mobile) */}
				<div className="footer-bottom">
					<div className="footer-copyright">
						Ruth's Marriage © {year}. All rights reserved.
					</div>
					<nav className="footer-legal">
						<a href="/cancellation-policy/">Cancellation Policy</a>
						<a href="/confidentiality-policy/">Confidentiality Policy</a>
					</nav>
				</div>
			</div>
		</footer>
	);
};

const FooterMenuColumn = ({ title, items }: { title: string; items: MenuItem[] }) => (
	<div className="footer-col">
		<h5 className="footer-col-title">{title}</h5>
		<ul className="footer-menu">
			{items.map((item, i) => (
				<li key={i}>
					<a href={item.url || "#"} className="footer-menu-link">
						{item.label}
					</a>
				</li>
			))}
		</ul>
	</div>
);

const FooterDropdownItem = ({ item }: { item: MenuItem }) => {
	const hasChildren = item.children && item.children.length;
	const [open, setOpen] = useState(false);
	return (
		<div className={`footer-dropdown-item${open ? " active" : ""}`}>
			<button
				type="button"
				className="footer-dropdown-toggle"
				aria-expanded={open}
				onClick={() => setOpen((o) => !o)}
			>
				<span>{item.label}</span>
				{hasChildren && <IconCaretDown style={{ width: "12px", height: "12px", flexShrink: 0 }} />}
			</button>
			{hasChildren && (
				<ul className="footer-dropdown-children">
					{item.children!.map((c, j) => (
						<li key={j}>
							<a href={c.url || "#"} className="footer-dropdown-child-link">
								{c.label}
							</a>
						</li>
					))}
				</ul>
			)}
		</div>
	);
};
