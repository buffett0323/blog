# dLLM Notes

**Diffusion language models, from the objective to production.**

This repository is the source for [dLLM Notes](https://buffett0323.github.io/blog/), a visual, step-by-step guide to how diffusion language models work and how to serve them. The notes start with the basic idea of generating text by filling in blanks, then build toward training objectives, sampling algorithms, and inference systems. Interactive demos make the mechanics easier to follow, and a reading list keeps annotated copies of the papers behind the notes.

## The roadmap

### Inside the Model

How a diffusion LLM is built, trained, and sampled.

#### Foundations

| # | Note | Hook | Status |
| --- | --- | --- | --- |
| M01 | [Why not left to right?](https://buffett0323.github.io/blog/posts/why-diffusion/) | Autoregression commits one token at a time. What if we did not? | live |
| M02 | [Diffusion on discrete tokens](https://buffett0323.github.io/blog/posts/discrete-diffusion/) | There is no Gaussian noise for a vocabulary. | live |
| M03 | [Masked diffusion models](https://buffett0323.github.io/blog/posts/masked-diffusion/) | One kind of noise: [MASK]. One loss: a weighted cross-entropy. | live |
| M04 | [Where the prompt goes](https://buffett0323.github.io/blog/posts/prompting/) | Only the answer starts as noise. | live |
| M05 | [Sampling and remasking](https://buffett0323.github.io/blog/posts/sampling/) | Which blanks do we fill, and when do we change our mind? | live |

#### Scaling up

| # | Note | Hook | Status |
| --- | --- | --- | --- |
| M06 | LLaDA | Does masked diffusion scale like autoregression? | planned |
| M07 | [Starting from an AR checkpoint](https://buffett0323.github.io/blog/posts/ar-to-diffusion/) | Reuse the AR weights; change the mask and the objective. | live |
| M08 | Block diffusion | Autoregressive across blocks, diffusion within them. | planned |
| M09 | [Mixture-of-Experts dLLMs](https://buffett0323.github.io/blog/posts/moe-dllm/) | Sparse experts, dense blocks: every token in the block wakes up its own experts. | live |

#### Steering

| # | Note | Hook | Status |
| --- | --- | --- | --- |
| M10 | Constrained decoding | Grammars, when the order is not left to right. | planned |
| M11 | Reinforcement learning for dLLMs | Policy gradients without a tractable likelihood. | planned |

### Into Production

What it takes to serve a diffusion LLM fast and cheaply.

#### Making one request fast

| # | Note | Hook | Status |
| --- | --- | --- | --- |
| P01 | [Caching without causality](https://buffett0323.github.io/blog/posts/kv-cache/) | Bidirectional attention breaks the KV cache. Mostly. | live |
| P02 | [Parallel decoding](https://buffett0323.github.io/blog/posts/parallel-decoding/) | How many tokens can we commit in one step? | live |

#### Serving many requests

| # | Note | Hook | Status |
| --- | --- | --- | --- |
| P03 | [Batching denoising steps](https://buffett0323.github.io/blog/posts/batching/) | Every request is at a different noise level. Can they share a step? | live |
| P04 | A serving engine for dLLMs | Scheduler, cache manager, sampler: what changes from an AR engine. | planned |

## Paper notes

[The reading list](https://buffett0323.github.io/blog/papers/) shows each paper's original PDF with highlights and margin notes.

| Paper | Topic | Notes |
| --- | --- | --- |
| [Fast-dLLM](https://buffett0323.github.io/blog/papers/fast-dllm/) | Block-wise approximate KV cache, confidence-thresholded parallel decoding | on the PDF |
| [dKV-Cache](https://buffett0323.github.io/blog/papers/dkv-cache/) | Delayed caching of decoded tokens | on the PDF |
| [dLLM-Cache](https://buffett0323.github.io/blog/papers/dllm-cache/) | Adaptive prompt and response caching | text only (license) |
| [TEAM](https://buffett0323.github.io/blog/papers/team/) | Expert activation in MoE dLLMs | on the PDF |
| [dLLM-Serve](https://buffett0323.github.io/blog/papers/dllm-serve/) | Serving: logit memory, Refresh/Reuse scheduling, per-head sparse KV | on the PDF |

## Writing

- **A note:** add `src/content/blog/<slug>.mdx`. If `<slug>` matches an entry in `src/series.ts`, the note is numbered and placed on the roadmap; otherwise it is listed under "Other notes". `draft: true` keeps it out of the build.
- **A paper:** put the PDF in `public/pdfs/` and add `src/content/papers/<slug>.mdx`. Pin notes to the PDF with `<Annotation page={5} line={41} text="...">`, or mark text without a note with `<Highlight page={5} line={36} text="..." />` (the text may span lines); open the page with `?lines` in the URL to see line numbers. Omit `pdf` when the license does not allow reposting it; the notes are then shown as text.
- **Demos** are Astro components in `src/components/`, one per figure.

## Running locally

```sh
nvm use            # Node 22 (see .nvmrc)
npm install
npm run dev        # http://localhost:4321/blog/
npm run build
```

Push to `main` and GitHub Actions deploys to GitHub Pages. The site is served under `/blog`, so internal links use `withBase()` from `src/consts.ts`.
