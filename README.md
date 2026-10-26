# dLLM Notes

**Diffusion language models, from the objective to production.**

This repository is the source for [dLLM Notes](https://buffett0323.github.io/blog/), a visual, step-by-step guide to how diffusion language models work and how to serve them. The notes start with the basic idea of generating text by filling in blanks, then build toward training objectives, sampling algorithms, and inference systems. Interactive demos make the mechanics easier to follow.

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
| M07 | Starting from an AR checkpoint | Dream and DiffuLLaMA: reuse the weights, change the objective. | planned |
| M08 | Block diffusion | Autoregressive across blocks, diffusion within them. | planned |

#### Steering

| # | Note | Hook | Status |
| --- | --- | --- | --- |
| M09 | Constrained decoding | Grammars, when the order is not left to right. | planned |
| M10 | Reinforcement learning for dLLMs | Policy gradients without a tractable likelihood. | planned |

### Into Production

What it takes to serve a diffusion LLM fast and cheaply.

#### Making one request fast

| # | Note | Hook | Status |
| --- | --- | --- | --- |
| P01 | [Caching without causality](https://buffett0323.github.io/blog/posts/kv-cache/) | Bidirectional attention breaks the KV cache. Mostly. | live |
| P02 | Parallel decoding | How many tokens can we commit in one step? | planned |

#### Serving many requests

| # | Note | Hook | Status |
| --- | --- | --- | --- |
| P03 | Batching denoising steps | Every request is at a different noise level. Can they share a step? | planned |
| P04 | A serving engine for dLLMs | Scheduler, cache manager, sampler: what changes from an AR engine. | planned |

## Running locally

```sh
nvm use            # Node 22 (see .nvmrc)
npm install
npm run dev        # http://localhost:4321/blog/
npm run build
```

Push to `main` and GitHub Actions deploys to GitHub Pages. The site is served under `/blog`, so internal links use `withBase()` from `src/consts.ts`.
