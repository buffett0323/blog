import { type CollectionEntry, getCollection } from 'astro:content';

// The roadmap: single source of truth for the home page, note codes (M01, P01, ...) and prev/next links.
// A note is "published" once src/content/blog/<slug>.md(x) exists; until then it shows as planned.
// Reorder, rename, or add freely; numbering is continuous within each track.
export interface Track {
	id: string;
	/** Letter prefix for note codes, e.g. 'M' gives M01, M02, ... */
	code: string;
	title: string;
	blurb: string;
	groups: { title: string; notes: { slug: string; title: string; hook: string }[] }[];
}

export const tracks: Track[] = [
	{
		id: 'model',
		code: 'M',
		title: 'Inside the Model',
		blurb: 'How a diffusion LLM is built, trained, and sampled: the objective, the architecture choices, and the algorithms that turn noise into text.',
		groups: [
			{
				title: 'Foundations',
				notes: [
					{ slug: 'why-diffusion', title: 'Why not left to right?', hook: 'Autoregression commits one token at a time. What if we did not?' },
					{ slug: 'discrete-diffusion', title: 'Diffusion on discrete tokens', hook: 'There is no Gaussian noise for a vocabulary.' },
					{ slug: 'masked-diffusion', title: 'Masked diffusion models', hook: 'One kind of noise: [MASK]. One loss: a weighted cross-entropy.' },
					{ slug: 'sampling', title: 'Sampling and remasking', hook: 'Which blanks do we fill, and when do we change our mind?' },
				],
			},
			{
				title: 'Scaling up',
				notes: [
					{ slug: 'llada', title: 'LLaDA', hook: 'Does masked diffusion scale like autoregression?' },
					{ slug: 'ar-to-diffusion', title: 'Starting from an AR checkpoint', hook: 'Dream and DiffuLLaMA: reuse the weights, change the objective.' },
					{ slug: 'block-diffusion', title: 'Block diffusion', hook: 'Autoregressive across blocks, diffusion within them.' },
				],
			},
			{
				title: 'Steering',
				notes: [
					{ slug: 'constrained-decoding', title: 'Constrained decoding', hook: 'Grammars, when the order is not left to right.' },
					{ slug: 'rl', title: 'Reinforcement learning for dLLMs', hook: 'Policy gradients without a tractable likelihood.' },
				],
			},
		],
	},
	{
		id: 'production',
		code: 'P',
		title: 'Into Production',
		blurb: 'What it takes to serve a diffusion LLM fast and cheaply: caching, parallel decoding, batching, and the shape of an inference engine.',
		groups: [
			{
				title: 'Making one request fast',
				notes: [
					{ slug: 'kv-cache', title: 'Caching without causality', hook: 'Bidirectional attention breaks the KV cache. Mostly.' },
					{ slug: 'parallel-decoding', title: 'Parallel decoding', hook: 'How many tokens can we commit in one step?' },
				],
			},
			{
				title: 'Serving many requests',
				notes: [
					{ slug: 'batching', title: 'Batching denoising steps', hook: 'Every request is at a different noise level. Can they share a step?' },
					{ slug: 'serving-engine', title: 'A serving engine for dLLMs', hook: 'Scheduler, cache manager, sampler: what changes from an AR engine.' },
				],
			},
		],
	},
];

export interface SeriesNote {
	slug: string;
	title: string;
	hook: string;
	/** e.g. 'M01'; absent for notes outside the roadmap */
	code?: string;
	track?: Track;
	group?: string;
	post?: CollectionEntry<'blog'>;
}

export const publishedPosts = () =>
	getCollection('blog', ({ data }) => import.meta.env.DEV || !data.draft);

// Roadmap entries joined with the notes that exist, plus any note not in the roadmap ("loose").
export async function getSeries() {
	const posts = await publishedPosts();
	const bySlug = new Map(posts.map((p) => [p.id, p]));
	const series: SeriesNote[] = tracks.flatMap((track) => {
		let n = 0;
		return track.groups.flatMap((group) =>
			group.notes.map((note) => {
				const post = bySlug.get(note.slug);
				return {
					...note,
					title: post?.data.title ?? note.title,
					hook: post?.data.hook ?? note.hook,
					code: track.code + String(++n).padStart(2, '0'),
					track,
					group: group.title,
					post,
				};
			}),
		);
	});
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
