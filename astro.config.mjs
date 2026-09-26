// @ts-check
import mdx from '@astrojs/mdx';
import { unified } from '@astrojs/markdown-remark';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';

// https://astro.build/config
export default defineConfig({
	// Served as a GitHub Pages project site at https://buffett0323.github.io/blog/
	// Internal links go through withBase() in src/consts.ts, so the base path lives only here.
	site: 'https://buffett0323.github.io',
	base: '/blog',
	integrations: [mdx(), sitemap()],
	markdown: {
		// Astro 7 defaults to the Sätteri processor; unified is needed for remark/rehype plugins (KaTeX).
		processor: unified({ remarkPlugins: [remarkMath], rehypePlugins: [rehypeKatex] }),
		// Both themes are emitted as CSS variables; global.css picks one per color scheme.
		shikiConfig: { themes: { light: 'github-light', dark: 'github-dark' }, defaultColor: false },
	},
});
