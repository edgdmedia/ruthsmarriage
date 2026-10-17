/* Footer — Elementor template 329. Near-black, 4 columns + bottom row.
   Data: menus "primary" / "footer-services" / "footer-resources", settings socials + emails. */
import { IconFacebook } from "./icons/facebook";
import { IconTwitter } from "./icons/twitter";
import { IconInstagram } from "./icons/instagram";
import { IconYoutube } from "./icons/youtube";
import { IconThreads } from "./icons/threads";

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

export const Footer = ({ menus, settings }: { menus?: FooterMenus; settings?: FooterSettings } = {}) => {
	const primary = menus?.primary || { items: [] };
	const services = menus?.footerServices || { items: [] };
	const resources = menus?.footerResources || { items: [] };
	const socials = settings?.social || {};
	const emails = settings?.contactEmails || ["admin@ruthsmarriage.com", "ruthsmarriage@gmail.com"];
	const year = new Date().getFullYear();

	return (
		<footer className="site-footer" style={{ background: "#0E0D0D", padding: "0 10px" }}>
			<div
				className="footer-inner"
				style={{ maxWidth: "1140px", margin: "0 auto", padding: "50px 0 40px", display: "flex", gap: "20px", flexWrap: "wrap" }}
			>
				{/* 1. Contact */}
				<div className="footer-col" style={{ flex: "1 1 270px", minWidth: "232px", padding: "10px", display: "flex", flexDirection: "column", gap: "20px" }}>
					<h5
						style="font-family:'Nunito',sans-serif;font-size:20px;line-height:20px;font-weight:600;color:#DFDFDF;margin:0 0 8px 0;"
					>
						Contact
					</h5>
					{emails.map((email, i) => (
						<a
							key={i}
							href={`mailto:${email}`}
							style="font-family:'Poppins',sans-serif;font-size:15px;line-height:22.5px;font-weight:400;color:#CCCCCC;text-decoration:underline;"
						>
							{email}
						</a>
					))}
					<div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
						{SOCIALS.map((s) => {
							const url = socials[s.key];
							if (!url) return null;
							return (
								<a
									key={s.key}
									href={url}
									target="_blank"
									rel="noopener noreferrer"
									style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "34px", height: "34px", borderRadius: "50%", background: s.bg }}
								>
									<s.Icon style={{ width: "17px", height: "17px", color: "#ffffff" }} />
								</a>
							);
						})}
					</div>
				</div>
				{/* 2. Services */}
				<MenuColumn title="Services" items={services.items} />
				{/* 3. Resources */}
				<MenuColumn title="Resources" items={resources.items} />
				{/* 4. Links (vertical primary menu) */}
				<div className="footer-col" style={{ flex: "1 1 270px", minWidth: "232px", padding: "10px", display: "flex", flexDirection: "column", gap: "20px" }}>
					<h5
						style="font-family:'Nunito',sans-serif;font-size:20px;line-height:20px;font-weight:600;color:#DFDFDF;margin:0;"
					>
						Links
					</h5>
					{primary.items.map((item, i) => (
						<VerticalMenuItem key={i} item={item} />
					))}
				</div>
			</div>
			<div
				className="footer-bottom"
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					padding: "10px",
					height: "66px",
				}}
			>
				<div
					style={{
						fontFamily: "Nunito, sans-serif",
						fontSize: "16px",
						lineHeight: "16px",
						fontWeight: "600",
						color: "#CCCCCC",
					}}
				>
					Ruth's Marriage © {year}. All rights reserved.
				</div>
				<nav
					style={{
						display: "flex",
						gap: "0",
					}}
				>
					<a
						href="/cancellation-policy/"
						style="font-family:'Nunito',sans-serif;font-size:16px;line-height:20px;font-weight:600;color:#CCCCCC;padding:13px 20px;"
					>
						Cancellation Policy
					</a>
					<a
						href="/confidentiality-policy/"
						style="font-family:'Nunito',sans-serif;font-size:16px;line-height:20px;font-weight:600;color:#CCCCCC;padding:13px 20px;"
					>
						Confidentiality Policy
					</a>
				</nav>
			</div>
			<style>{`
				@media (max-width: 767px) {
					.site-footer .footer-inner { flex-direction: column-reverse; gap: 20px; }
					.site-footer .footer-bottom { flex-direction: row-reverse; flex-wrap: wrap-reverse; justify-content: center; text-align: center; }
					.site-footer .footer-bottom a { padding: 2px 4px !important; }
				}
			`}</style>
		</footer>
	);
};

const MenuColumn = ({ title, items }) => (
	<div style={{ flex: "1 1 270px", minWidth: "232px", padding: "10px", display: "flex", flexDirection: "column", gap: "20px" }}>
		<h5
			style="font-family:'Nunito',sans-serif;font-size:20px;line-height:20px;font-weight:600;color:#DFDFDF;margin:0 0 8px 0;"
		>
			{title}
		</h5>
		{items.map((item, i) => (
			<a
				key={i}
				href={item.url || "#"}
				style="font-family:'Poppins',sans-serif;font-size:14px;line-height:16.8px;font-weight:400;color:#CCCCCC;text-decoration:underline;display:block;"
			>
				{item.label}
			</a>
		))}
	</div>
);

const VerticalMenuItem = ({ item }) => (
	<div style={{ display: "flex", flexDirection: "column", gap: "4px", padding: "10px" }}>
		{item.children && item.children.length ? (
			<div>
				<button
					type="button"
					style={{
						border: "none",
						background: "transparent",
						padding: "5px 0",
						fontFamily: "Nunito, sans-serif",
						fontSize: "16px",
						lineHeight: "20px",
						fontWeight: "600",
						color: "#CCCCCC",
						cursor: "pointer",
						textAlign: "left",
					}}
				>
					{item.label}
				</button>
				{item.children.map((c, j) => (
					<a
						key={j}
						href={c.url || "#"}
						style="font-family:'Nunito',sans-serif;font-size:16px;line-height:20px;font-weight:600;color:#CCCCCC;text-decoration:underline;padding-left:20px;display:block;"
					>
						{c.label}
					</a>
				))}
			</div>
		) : (
			<a
				href={item.url || "#"}
				style="font-family:'Nunito',sans-serif;font-size:16px;line-height:20px;font-weight:600;color:#CCCCCC;text-decoration:underline;padding:5px 0;display:block;"
			>
				{item.label}
			</a>
		)}
	</div>
);
