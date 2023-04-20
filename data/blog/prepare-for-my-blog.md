---
title: Prepare for my blog
date: '2023-04-20'
tags: ['blog config']
draft: false
summary: Two mistakes in my blog config
---

# Prepare for my blog

After I deploy my website, I find two mistakes in my blog config.

1. I want to use [giscus](https://giscus.app/), but I find it can't work in my blog. I open an article, and scroll down, click the `Load Comments` button, and it shows:

```
The giscus is not installed on this repository
```

My giscus's config is written in `.env.example` file, then I write some code in `/components/comments/Giscus.js`

```js
const {
  repo,
  repositoryId,
  category,
  categoryId,
  mapping,
  reactions,
  metadata,
  inputPosition,
  lang,
} = siteMetadata?.comment?.giscusConfig

console.log('siteMetadata?.comment?.giscusConfig', siteMetadata?.comment?.giscusConfig)
```

and I find the `siteMetadata?.comment?.giscusConfig` is `{}`, so I think the config is not loaded.I search it in Google, and the env config file should end with `.env`, so I rename `.env.example` to `.env`, and it works.

2. When I open the developer tools, I find there are some errors in the console.

```
Refused to load the stylesheet 'https://giscus.app/default.css' because it violates the following Content Security Policy directive: "style-src 'self' 'unsafe-inline'". Note that 'style-src-elem' was not explicitly set, so 'style-src' is used as a fallback.
```

It's an error about the `Content Security Policy`, I search it in Google, and I find the solution is to change `style-src` in the `ContentSecurityPolicy` config in `next.config.js`.

```js
// You might need to insert additional domains in script-src if you are using external services
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' giscus.app;
  style-src 'self' 'unsafe-inline' giscus.app;
  img-src * blob: data:;
  media-src 'none';
  connect-src *;
  font-src 'self';
  frame-src giscus.app
`
```

That's mean I trust the file in `giscus.app` domain, and I can use the `https://giscus.app/default.css` file.
