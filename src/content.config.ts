import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// One file per note in src/content/blog/. The file name is the slug; if it matches an
// entry in src/series.ts the note is placed (and numbered) in the roadmap.
const blog = defineCollection({
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	schema: z.object({
		title: z.string(),
		// One-line teaser shown under the title and on the home page.
		hook: z.string().optional(),
		description: z.string(),
		pubDate: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
		// Drafts are visible in `npm run dev` but not built.
		draft: z.boolean().default(false),
	}),
});

// One file per paper in src/content/papers/. The PDF itself lives in public/pdfs/; the body is a
// short summary plus <Annotation> blocks, which the viewer pins next to the matching text in the PDF.
const papers = defineCollection({
	loader: glob({ base: './src/content/papers', pattern: '**/*.{md,mdx}' }),
	schema: z.object({
		title: z.string(),
		authors: z.string(),
		venue: z.string().optional(),
		year: z.number(),
		// File name under public/pdfs/, e.g. 'fast-dllm.pdf'.
		pdf: z.string(),
		url: z.url().optional(),
		// Shown under the viewer; redistributing a PDF needs a license that allows it.
		license: z.string().optional(),
		hook: z.string(),
		// When you read it; papers are listed newest first.
		readDate: z.coerce.date(),
		draft: z.boolean().default(false),
	}),
});

export const collections = { blog, papers };
