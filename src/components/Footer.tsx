/* Footer — Elementor template 329. Near-black, 4 columns + bottom row.
   Data: menus "footer-services" / "footer-resources", FOOTER_LINKS, settings socials + emails.
   Spec: _global.md Footer section. */
import { SocialIcons } from "./SocialIcons";

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

const FOOTER_LINKS: MenuItem[] = [
	{ label: "About Us", url: "/about/" },
	{ label: "Our Story", url: "/our-story/" },
	{ label: "Blog Articles", url: "/inspired-features/" },
	{ label: "Videos", url: "/videos/" },
	{ label: "Ask Coach Ruth", url: "/askcoach/" },
	{ label: "Contact", url: "/contact/" },
];

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
						<SocialIcons social={socials} className="footer-socials" />
					</div>

					{/* 2. Services */}
					<FooterMenuColumn title="Services" items={services.items} />

					{/* 3. Resources */}
					<FooterMenuColumn title="Resources" items={resources.items} />

					{/* 4. Links: a short list of plain links (owner request 2026-10-24; live repeats the dropdown menu) */}
					<FooterMenuColumn title="Links" items={FOOTER_LINKS} />
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

