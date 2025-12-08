---
title: You Should Know About NextJs
date: '2023-05-05'
tags: ['NextJs']
draft: true
summary: A brief introduction about NextJs
---

Next.js is a powerful and popular open-source framework for building modern, scalable, and high-performance React applications. Developed by Vercel, Next.js aims to make it easier for developers to create server-rendered React applications with minimal configuration and a rich set of features.

Here's a brief introduction to some of the key features of Next.js:

Hybrid Rendering: Next.js supports both server-side rendering (SSR) and static site generation (SSG), allowing you to build highly optimized applications with the best rendering method for each page.

Automatic Code Splitting: Next.js automatically splits your code into smaller, optimized JavaScript bundles, improving the initial load time of your application and ensuring that users only download the code they need.

API Routes: Next.js includes built-in support for creating serverless API routes, enabling you to easily build server-side logic for your application without the need for a separate API server.

Dynamic Imports: Next.js supports dynamic imports, allowing you to load components and modules on demand, further improving the performance of your application.

Fast Refresh: The Fast Refresh feature in Next.js enables instant feedback during development by reflecting changes in your code without losing component state.

Optimized for Production: Next.js is designed for production environments, with features like automatic static optimization, bundle analyzer, and more, ensuring your application remains fast and efficient in production.

## dynamic routing

Dynamic routes let Next.js know that some pages should be rendered for each item ID. For example, if you create a page called `src/app/posts/[id]/index.js`, then it will be accessible at `posts/1`, `posts/2`, etc.

get nested router params

```js
// src/app/posts/[author]/[postId]/page.tsx
export default function PostContent({ params }: { params: string[] }) {
  console.log('params', params) // /posts/liwenkang/1 { author: 'liwenkang', postId: '1' }

  return (
    <main>
      <h1>PostContent</h1>
    </main>
  )
}
```

Optional Catch-all Segments

```js
// src/app/posts/[...author]/page.js: not includes the /posts
// src/app/posts/[[...author]]/page.js: includes the /posts
export default function PostContent({ params }: { params: any[] }) {
  console.log('params', params) // [...author] visit /posts/liwenkang/1:{ author: ['liwenkang', '1'] }
  console.log('params', params) // [[...author]] visit /posts:{}

  return (
    <main>
      <h1>{'PostContent'}</h1>
    </main>
  )
}
```

```js
<Link href=""></Link>
```

// 404 page: app/not-found.tsx

```js

```
