// Runtime secrets for hook handlers, which run without an Astro request context.
// Kept in its own module so the built-in import stays static.
export const env = globalThis.process?.env ?? {};
