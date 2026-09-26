import { type CollectionEntry, getCollection } from 'astro:content';

// The roadmap: single source of truth for the home page and note numbering.
// A note is "published" once src/content/blog/<slug>.md(x) exists; until then it shows as planned.
// Reorder, rename, or add freely; numbering is continuous across parts.
export interface Part {
	id: string;
	title: string;
	blurb: string;
	notes: { slug: string; title: string; hook: string }[];
}

export const parts: Part[] = [
	{
		id: 'foundations',
		title: 'From noise to text',
		blurb: 'What it means to generate language by denoising, and the objective that makes it trainable.',
		notes: [
			{ slug: '01-why-diffusion', title: 'Why not left to right?', hook: 'Autoregression commits one token at a time. What if we did not?' },
			{ slug: '02-discrete-diffusion', title: 'Diffusion on discrete tokens', hook: 'There is no Gaussian noise for a vocabulary.' },
			{ slug: '03-masked-diffusion', title: 'Masked diffusion models', hook: 'One kind of noise: [MASK]. One loss: a weighted cross-entropy.' },
			{ slug: '04-sampling', title: 'Sampling and remasking', hook: 'Which blanks do we fill, and when do we change our mind?' },
		],
	},
	{
		id: 'scaling',
		title: 'Scaling up',
		blurb: 'From small research models to dLLMs that compete with autoregressive ones.',
		notes: [
			{ slug: '05-llada', title: 'LLaDA', hook: 'Does masked diffusion scale like autoregression?' },
			{ slug: '06-ar-to-diffusion', title: 'Starting from an AR checkpoint', hook: 'Dream and DiffuLLaMA: reuse the weights, change the objective.' },
			{ slug: '07-block-diffusion', title: 'Block diffusion', hook: 'Autoregressive across blocks, diffusion within them.' },
		],
	},
	{
		id: 'inference',
		title: 'Making it fast',
		blurb: 'Parallel decoding is the promise. Bidirectional attention is the bill.',
		notes: [
			{ slug: '08-kv-cache', title: 'Caching without causality', hook: 'Bidirectional attention breaks the KV cache. Mostly.' },
			{ slug: '09-parallel-decoding', title: 'Parallel decoding', hook: 'How many tokens can we commit in one step?' },
			{ slug: '10-serving', title: 'Serving dLLMs', hook: 'What an inference engine for diffusion looks like.' },
		],
	},
	{
		id: 'beyond',
		title: 'Beyond sampling',
		blurb: 'Steering a model that does not write in order.',
		notes: [
			{ slug: '11-constrained-decoding', title: 'Constrained decoding', hook: 'Grammars, when the order is not left to right.' },
			{ slug: '12-rl', title: 'Reinforcement learning for dLLMs', hook: 'Policy gradients without a tractable likelihood.' },
		],
	},
];

export interface SeriesNote {
	slug: string;
	title: string;
	hook: string;
	number?: number;
	part?: Part;
	post?: CollectionEntry<'blog'>;
}

export const publishedPosts = () =>
	getCollection('blog', ({ data }) => import.meta.env.DEV || !data.draft);

// Roadmap entries joined with the notes that exist, plus any note not in the roadmap ("loose").
export async function getSeries() {
	const posts = await publishedPosts();
	const bySlug = new Map(posts.map((p) => [p.id, p]));
	let n = 0;
	const series: SeriesNote[] = parts.flatMap((part) =>
		part.notes.map((note) => {
			const post = bySlug.get(note.slug);
			return { ...note, title: post?.data.title ?? note.title, hook: post?.data.hook ?? note.hook, number: ++n, part, post };
		}),
	);
	const inSeries = new Set(series.map((s) => s.slug));
	const loose: SeriesNote[] = posts
		.filter((p) => !inSeries.has(p.id))
		.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())
		.map((post) => ({ slug: post.id, title: post.data.title, hook: post.data.hook ?? post.data.description, post }));
	return { series, loose };
}

export function readingMinutes(body = '') {
	const words = body
		.replace(/^import .*$/gm, '')
		.replace(/<[^>]+>/g, ' ')
		.split(/\s+/)
		.filter(Boolean).length;
	return Math.max(1, Math.round(words / 220));
}
