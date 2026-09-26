# dLLM Notes

Learning notes on diffusion language models, deployed at https://buffett0323.github.io/blog/

## Writing a note

1. Pick (or add) an entry in `src/series.ts`. That file is the roadmap, in two tracks:
   **Inside the Model** (`M01`, `M02`, ...: model design, objectives, sampling algorithms) and
   **Into Production** (`P01`, ...: inference and serving systems).
2. Create `src/content/blog/<slug>.mdx` with the same slug. It shows up as published and gets its code.
   A note whose slug is not in the roadmap is listed under "Other notes".
3. Frontmatter: `title`, `description`, `pubDate`, optional `hook`, `updatedDate`, `draft: true`
   (drafts show in `npm run dev` only).

Available in MDX:

- Math: `$...$` and `$$...$$` (KaTeX)
- `<details><summary>…</summary> … </details>` for derivations the main line can skip
- `<Note kind="key|aside|question">` callouts (`src/components/Note.astro`)
- `<DecodeDemo />`: interactive AR vs masked-diffusion decoding (`src/components/DecodeDemo.astro`)

## Development

```sh
nvm use            # Node 22 (see .nvmrc)
npm run dev        # http://localhost:4321/blog/
npm run build
```

Push to `main` and GitHub Actions deploys to GitHub Pages. The site is served under `/blog`,
so internal links go through `withBase()` from `src/consts.ts`.
