---
title: "Hello World: Testing the Pipeline"
description: "A filler post to confirm that writing in Notion actually shows up on the website."
date: 2026-09-01
tags: ["meta", "engineering"]
notionId: "3ce07335-bb44-81ac-85b2-ffaee40c6d12"
---

This is filler text written in Notion. If you're reading it on the website, the whole pipeline works: Notion → GitHub Action → Astro → GitHub Pages.


## Why this post exists


The point of a test post is to exercise every formatting feature the converter has to handle, so nothing surprising shows up on the day of a real post. Below is a sampling.


### Text formatting


Here is **bold text**, here is _italic text_, and here is some `inline code`. Here is a [link to McGill](https://www.mcgill.ca/).


### A bulleted list

- Basketball
- Tennis
- Guitar
- Weight-lifting

### A numbered list

1. Write the post in Notion
2. Set Status to Published
3. Push to main (or wait for the daily rebuild)
4. Post appears on the site

### A quote

> The transmission of information over distances — often at frequencies far beyond human perception — feels almost magical.

### A code block


```python
import numpy as np

# A simple BPSK modulator
def bpsk_modulate(bits):
    return 2 * np.array(bits) - 1

print(bpsk_modulate([0, 1, 1, 0]))
```


### A divider, then a closing thought


---


Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.


If all of the above rendered correctly, the blog is ready for real content.

