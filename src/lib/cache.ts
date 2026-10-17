/* Guarded cache-hint helper (AGENTS.md rule 2).
   Call inside page/component frontmatter: `setCacheHint(Astro.cache, hint)`.
   Dev: Astro.cache.enabled === false → no-op. Production: repeated set() calls combine.
   Unguarded undefined hints 500 only in production — this guard prevents that. */
export function setCacheHint(
	cache: { enabled?: boolean; set?: (hint: unknown) => void } | undefined,
	hint: unknown
) {
	if (cache?.enabled && hint) {
		cache.set?.(hint as never);
	}
}
