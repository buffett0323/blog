export const site = {
	name: 'dLLM Notes',
	description:
		'Learning notes on diffusion language models: from the masked-diffusion objective to sampling, scaling, and fast inference.',
	author: { name: 'Buffett Liu', url: 'https://buffett0323.github.io/' },
	repo: 'https://github.com/buffett0323/blog',
};

export const SITE_TITLE = site.name;
export const SITE_DESCRIPTION = site.description;

// The site lives under a sub-path (see `base` in astro.config.mjs), so internal
// links must be prefixed. Pass paths starting with '/', e.g. withBase('/about/').
export function withBase(path: string) {
	return import.meta.env.BASE_URL.replace(/\/$/, '') + path;
}

export const pad = (n: number) => String(n).padStart(2, '0');
