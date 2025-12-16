[简体中文](README.md) | [English](README.en.md)

![banner](/public/static/images/twitter-card.png)

# Tailwind Next.js Blog Starter (TypeScript)

![coverage](https://img.shields.io/badge/coverage-11.35%25-red) ![node](https://img.shields.io/badge/node-%3E%3D22.0.0-339933?logo=node.js) [![CI](https://github.com/liwenkang/blog/actions/workflows/ci.yml/badge.svg)](https://github.com/liwenkang/blog/actions/workflows/ci.yml)

A modern Markdown/MDX blog starter built with Next.js 15, React 19, Tailwind CSS 3, and TypeScript. It ships with SEO, RSS, on-site search, dark/light theme, comments and newsletter, code highlighting, KaTeX, Sentry monitoring, and more. The production build automatically switches to Preact to reduce bundle size.

For the Chinese version, see README.md.

## Features

- Modern stack: Next.js 15, React 19, TypeScript 5, Tailwind CSS 3
- Content system: MDX (mdx-bundler), TOC, code highlighting (rehype-prism-plus), KaTeX, citations (rehype-citation)
- Performance: Preact alias in prod, fine‑tuned image config, HTTP security/cache headers, scroll restoration and package import optimizations
- Search: FlexSearch index generated at build time
- UX & accessibility: dark/light theme (next-themes), mobile-friendly, a11y styles
- SEO & data: RSS, sitemap, structured data, social cards
- Comments & newsletter: Giscus / Utterances / Disqus and Mailchimp / ConvertKit / etc.
- Quality: ESLint + Prettier, Jest + Testing Library, strict TS settings
- Observability: Sentry, Web Vitals, error boundaries and performance widgets

> See the docs/ folder for migration notes and improvement reports (TypeScript, config hardening, search implementation, etc.).

## Tech Stack

- Framework: Next.js 15 (React 19)
- Language & styling: TypeScript, Tailwind CSS 3, PostCSS, Autoprefixer
- Content: mdx-bundler with remark/rehype plugins (GFM, Math, Prism, Slug, Citation, etc.)
- Search: FlexSearch (build-time index)
- Monitoring: Sentry (@sentry/nextjs), Web Vitals
- Testing & linting: Jest, @testing-library/react, ESLint, Prettier, Husky + lint-staged

## Project Structure (partial)

- components/: UI components (navigation, layout, SEO, theme switch, search, comments, etc.)
- layouts/: page layouts (post, list, author, etc.)
- pages/: Next.js routes/pages
- lib/: utilities (MDX processing, RSS, env validation, Web Vitals, etc.)
- data/: site metadata, navigation, authors and posts (MD/MDX)
- scripts/: build and helper scripts (search index, sitemap, compose, validations, etc.)
- public/: static assets

## Getting Started

### Prerequisites

- Node.js >= 22 (per the repository engines field)

### Install

```bash
npm install
```

### Develop

Pick one of the following:

```bash
# Standard dev server with HMR
npm run dev

# Dev with data directory watcher (good for writing)
npm start
```

Open http://localhost:3000 to preview the site.

### Build & Preview

```bash
# Generates search index + Next build + sitemap
npm run build

# Production preview
npm run serve
```

### Lint & Test

```bash
npm run lint
npm run prettier

npm test
npm run test:watch
npm run test:coverage
```

## Writing Content

- Posts live under data/blog (supports .md and .mdx)
- Create a new post interactively:

```bash
npx ts-node ./scripts/compose.ts
```

### Frontmatter (common fields)

```yaml
---
title: Post title (required)
date: 'YYYY-MM-DD' (required)
tags: ['tag1', 'tag2']
draft: false
summary: Short summary
images: ['/static/images/xxx.jpg']
authors: ['default'] # match files under data/authors
layout: PostLayout
canonicalUrl: https://example.com/blog/my-post
---
```

## Configuration

- Site metadata: data/siteMetadata.ts
- Navigation: data/headerNavLinks.ts
- Project cards: data/projectsData.ts
- Static assets: public/static
- Security/build: next.config.js (CSP, security headers, image policy, Preact alias, Sentry)

### Environment Variables

Configure in .env.local (feature‑based and optional):

- Comments (COMMENT_PROVIDER: giscus | utterances | disqus)
  - Giscus: NEXT_PUBLIC_GISCUS_REPO, NEXT_PUBLIC_GISCUS_REPOSITORY_ID, NEXT_PUBLIC_GISCUS_CATEGORY, NEXT_PUBLIC_GISCUS_CATEGORY_ID
  - Utterances: NEXT_PUBLIC_UTTERANCES_REPO
  - Disqus: NEXT_PUBLIC_DISQUS_SHORTNAME
- Newsletter (NEWSLETTER_PROVIDER: mailchimp | buttondown | convertkit | klaviyo | revue | emailoctopus)
  - Mailchimp: MAILCHIMP_API_KEY, MAILCHIMP_API_SERVER, MAILCHIMP_AUDIENCE_ID
  - See lib/env-validation.ts for others
- Analytics/monitoring: NEXT_PUBLIC_GA_ID, NEXT_PUBLIC_SENTRY_DSN
- Sentry build (optional): SENTRY_ORG, SENTRY_PROJECT (for source map upload)

Basic env checks run automatically in development (see lib/env-validation.ts).

## Deployment

- Vercel (recommended): zero‑config for Next.js; add your .env.\* to project settings.
- Netlify: use its Next.js runtime; keep `next/image` and ISR/SSR enabled.
- Others (GitHub Pages/Firebase): if `next/image` is not supported, use a 3rd‑party image optimizer or replace with `<img>`.
- CSP: if you add 3rd‑party scripts/styles/iframes, update Content-Security-Policy in next.config.js.

## Useful Scripts

- Bundle analysis: `npm run analyze` (set `ANALYZE=true`)
- Search index: `ts-node scripts/generate-search-index.mts` (runs during build)
- Sitemap: `ts-node scripts/generate-sitemap.mts` (runs during build)

## Docs

See the Chinese docs under docs/ for migration notes, fix logs, and guides.

## License

MIT — see LICENSE.

## Credits

Inspired by and adapted from timlrx/tailwind-nextjs-starter-blog, with TypeScript and localization improvements.
