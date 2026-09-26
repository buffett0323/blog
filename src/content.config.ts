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

export const collections = { blog };
