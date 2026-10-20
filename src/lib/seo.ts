// SEO meta for a content entry. `getSeoMeta` from the CMS is gone, so this
// reproduces the small subset the site actually used: title, description,
// canonical URL and og:image.

export interface SeoInput {
	title: string;
	description?: string | null;
	image?: string | null;
	siteTitle: string;
	siteUrl: string;
	path: string;
}

export function getSeoMeta({
	title,
	description,
	image,
	siteTitle,
	siteUrl,
	path,
}: SeoInput) {
	const fullTitle = title === siteTitle ? title : `${title} | ${siteTitle}`;
	const canonical = `${siteUrl}${path.replace(/\/$/, "")}`;
	return {
		title: fullTitle,
		ogTitle: fullTitle,
		description: description ?? null,
		canonical,
		ogImage: image ? `${siteUrl}${image}` : null,
	};
}
