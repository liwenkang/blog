---
title: Umi MFSU BUG
date: '2024-10-14'
tags:
  - UMI
  - MFSU
draft: true
summary: >-
  "umi": "3.5.41", if you open your chrome and open chrome devtools. then you
  run In your chrome's url input: localhost:8000(or your define port) you maybe
  find your page can't load in your chrome, just...
---

"umi": "3.5.41",

```ts
// config.ts
import { defineConfig } from 'umi'

export default defineConfig({
  // ...
  mfsu: {},
  // ...
})
```

if you open your chrome and open chrome devtools. then you run

```
npm run dev
```

In your chrome's url input: localhost:8000(or your define port)

you maybe find your page can't load in your chrome, just delete `mfsu`, then it will be fine.
