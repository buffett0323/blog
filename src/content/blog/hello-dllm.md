---
title: 'Hello, Diffusion LLMs'
description: 'Why I am starting this blog, and a quick test of math rendering.'
pubDate: '2026-09-26'
---

This blog is where I write down what I learn about diffusion language models.

## Math works

Inline math like $q(x_t \mid x_0)$ and display math:

$$
\mathcal{L}_{\text{MDM}} = -\,\mathbb{E}_{t, x_0, x_t}\left[\frac{1}{t}\sum_{i=1}^{L} \mathbf{1}[x_t^i = \texttt{[MASK]}] \log p_\theta(x_0^i \mid x_t)\right]
$$

## Code works

```python
def add_noise(x0, t, mask_id):
    mask = torch.rand_like(x0, dtype=torch.float) < t
    return torch.where(mask, mask_id, x0)
```
