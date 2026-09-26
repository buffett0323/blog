# Diffusion LLM Notes

Learning notes on diffusion language models, deployed at https://buffett0323.github.io/blog/

- Write posts in `src/content/blog/*.md` (or `.mdx`). LaTeX math via `$...$` / `$$...$$`.
- `npm run dev` for local preview (requires Node >= 22.12), then open http://localhost:4321/blog/
- Push to `main` → GitHub Actions builds and deploys to GitHub Pages.
- The site is served under `/blog`, so internal links should use `withBase()` from `src/consts.ts`.
