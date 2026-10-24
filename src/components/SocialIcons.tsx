/* SocialIcons — the five brand-colour circles (34px, 17px icon) used in the footer
   and on the Contact page. Data: settings.social; an icon whose URL is empty is
   hidden (README D14). Styles: components.css → ".social-icons". */
import { IconFacebook } from "./icons/facebook";
import { IconInstagram } from "./icons/instagram";
import { IconThreads } from "./icons/threads";
import { IconTwitter } from "./icons/twitter";
import { IconYoutube } from "./icons/youtube";

const SOCIALS = [
	{ key: "facebook", label: "Facebook", bg: "#3B5998", Icon: IconFacebook },
	{ key: "twitter", label: "Twitter", bg: "#1DA1F2", Icon: IconTwitter },
	{ key: "instagram", label: "Instagram", bg: "#262626", Icon: IconInstagram },
	{ key: "youtube", label: "YouTube", bg: "#CD201F", Icon: IconYoutube },
	{ key: "threads", label: "Threads", bg: "#000000", Icon: IconThreads },
];

export const SocialIcons = ({
	social = {},
	className = "",
}: { social?: Record<string, string>; className?: string } = {}) => (
	<div className={`social-icons ${className}`}>
		{SOCIALS.map((s) => {
			const url = social[s.key];
			if (!url) return null;
			return (
				<a
					key={s.key}
					href={url}
					target="_blank"
					rel="noopener noreferrer"
					aria-label={s.label}
					className="social-icon"
					style={{ background: s.bg }}
				>
					<s.Icon />
				</a>
			);
		})}
	</div>
);
