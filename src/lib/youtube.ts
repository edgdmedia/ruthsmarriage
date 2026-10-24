/** The 11-char video id from a youtu.be, watch?v= or /embed/ URL. */
export const youtubeId = (url: string | null | undefined) =>
	url?.match(/(?:youtu\.be\/|[?&]v=|\/embed\/)([\w-]{11})/)?.[1] ?? null;
