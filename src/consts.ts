// Place any global data in this file.
// You can import this data from anywhere in your site by using the `import` keyword.

export const SITE_TITLE = 'Diffusion LLM Notes';
export const SITE_DESCRIPTION = 'Learning notes on diffusion language models.';

// The site lives under a sub-path (see `base` in astro.config.mjs), so internal
// links must be prefixed. Pass paths starting with '/', e.g. withBase('/about/').
export function withBase(path: string) {
	return import.meta.env.BASE_URL.replace(/\/$/, '') + path;
}
