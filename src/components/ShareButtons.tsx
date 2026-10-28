import { useState } from "react";
import { IconFacebook } from "./icons/facebook";
import { IconTwitter } from "./icons/twitter";
import { IconWhatsApp } from "./icons/whatsapp";

interface Props {
	title: string;
	url: string;
}

/**
 * Fully functional share buttons row — Web Share API (mobile) + explicit
 * network buttons for Facebook, X, WhatsApp, Email + Copy Link.
 * Used on blog post pages only.
 */
export function ShareButtons({ title, url }: Props) {
	const [copied, setCopied] = useState(false);

	const encoded = encodeURIComponent(url);
	const encodedTitle = encodeURIComponent(title);

	const copyLink = async () => {
		try {
			await navigator.clipboard.writeText(url);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch {
			// Fallback for browsers without clipboard API
			const el = document.createElement("textarea");
			el.value = url;
			document.body.appendChild(el);
			el.select();
			document.execCommand("copy");
			document.body.removeChild(el);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		}
	};

	const webShare = () => {
		if (typeof navigator.share === "function") {
			navigator.share({ title, url }).catch(() => {});
		} else {
			copyLink();
		}
	};

	return (
		<div className="share-buttons" role="group" aria-label="Share this article">
			{/* Web Share API (mobile) / copy fallback — shows as a generic link icon */}
			<button
				className="share-btn share-btn--webshare"
				onClick={webShare}
				title={typeof navigator.share === "function" ? "Share…" : "Copy link"}
				type="button"
			>
				<svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
					<path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92c0-1.61-1.31-2.92-2.92-2.92z" />
				</svg>
				<span className="share-btn__label">{typeof navigator.share === "function" ? "Share" : "Copy link"}</span>
			</button>

			<a
				className="share-btn"
				href={`https://www.facebook.com/sharer/sharer.php?u=${encoded}`}
				target="_blank"
				rel="noopener noreferrer"
				title="Share on Facebook"
			>
				<IconFacebook style={{ width: 18, height: 18 }} />
				<span className="share-btn__label">Facebook</span>
			</a>

			<a
				className="share-btn"
				href={`https://twitter.com/intent/tweet?url=${encoded}&text=${encodedTitle}`}
				target="_blank"
				rel="noopener noreferrer"
				title="Share on X"
			>
				<IconTwitter style={{ width: 18, height: 18 }} />
				<span className="share-btn__label">X</span>
			</a>

			<a
				className="share-btn"
				href={`https://wa.me/?text=${encodedTitle}%20${encoded}`}
				target="_blank"
				rel="noopener noreferrer"
				title="Share on WhatsApp"
			>
				<IconWhatsApp style={{ width: 18, height: 18 }} />
				<span className="share-btn__label">WhatsApp</span>
			</a>

			<a
				className="share-btn"
				href={`mailto:?subject=${encodedTitle}&body=${encoded}`}
				title="Share by email"
			>
				<svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
					<path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
				</svg>
				<span className="share-btn__label">Email</span>
			</a>

			{/* Copy link — also available via Web Share fallback */}
			<button
				className={`share-btn share-btn--copy ${copied ? "share-btn--copied" : ""}`}
				onClick={copyLink}
				title="Copy link"
				type="button"
			>
				{copied ? (
					<svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
						<path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
					</svg>
				) : (
					<svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
						<path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
					</svg>
				)}
				<span className="share-btn__label">{copied ? "Copied!" : "Copy"}</span>
			</button>
		</div>
	);
}
