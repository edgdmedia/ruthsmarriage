import { useState } from "react";

interface Props {
	title: string;
	url: string;
	/** Plain-text excerpt (auto-generated from content if not set). */
	excerpt?: string;
}

/**
 * Fully functional share buttons row — Web Share API (mobile) + explicit
 * network buttons for Facebook, X, WhatsApp, Email + Copy Link.
 * Used on blog post pages only.
 *
 * The first item is a plain text "Share:" label. The remaining buttons
 * open the respective sharing dialogs pre-filled with the post title,
 * URL and excerpt (where the platform supports it).
 */
export function ShareButtons({ title, url, excerpt }: Props) {
	const [copied, setCopied] = useState(false);

	const encoded = encodeURIComponent(url);
	const encodedTitle = encodeURIComponent(title);
	const encodedExcerpt = excerpt ? encodeURIComponent(excerpt) : "";

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

	// Build Twitter share text: title + excerpt (if available)
	const twitterText = excerpt
		? `${title} — ${excerpt}`
		: title;
	const twitterUrl = `https://twitter.com/intent/tweet?url=${encoded}&text=${encodeURIComponent(twitterText)}`;

	// WhatsApp: title + excerpt + url
	const whatsappText = excerpt
		? `${title}\n\n${excerpt}\n\n${url}`
		: `${title}\n\n${url}`;
	const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappText)}`;

	return (
		<div className="share-buttons" role="group" aria-label="Share this article">
			{/* Plain text label — not a button */}
			<span className="share-label" aria-hidden="true">Share:</span>

			<a
				className="share-btn"
				href={`https://www.facebook.com/sharer/sharer.php?u=${encoded}`}
				target="_blank"
				rel="noopener noreferrer"
				title="Share on Facebook"
			>
				<svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
					<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
				</svg>
				<span className="share-btn__label">Facebook</span>
			</a>

			<a
				className="share-btn"
				href={twitterUrl}
				target="_blank"
				rel="noopener noreferrer"
				title="Share on X"
			>
				<svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
					<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.26 5.632L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
				</svg>
				<span className="share-btn__label">X</span>
			</a>

			<a
				className="share-btn"
				href={whatsappUrl}
				target="_blank"
				rel="noopener noreferrer"
				title="Share on WhatsApp"
			>
				<svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
					<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
				</svg>
				<span className="share-btn__label">WhatsApp</span>
			</a>

			<a
				className="share-btn"
				href={`mailto:?subject=${encodedTitle}&body=${encoded}%0A%0A${encodedExcerpt}`}
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
