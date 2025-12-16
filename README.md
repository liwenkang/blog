[简体中文](README.md) | [English](README.en.md)

![banner](/public/static/images/twitter-card.png)

# Tailwind Next.js 博客模板（TypeScript）

![coverage](https://img.shields.io/badge/coverage-11.35%25-red) ![node](https://img.shields.io/badge/node-%3E%3D22.0.0-339933?logo=node.js) [![CI](https://github.com/liwenkang/blog/actions/workflows/ci.yml/badge.svg)](https://github.com/liwenkang/blog/actions/workflows/ci.yml)

一个使用 Next.js 15、React 19、Tailwind CSS 3 与 TypeScript 构建的现代化 Markdown/MDX 博客模板。内置 SEO、RSS、站内搜索、深浅色主题、评论与邮件订阅、代码高亮、KaTeX 数学公式、Sentry 监控等；生产环境自动切换到 Preact 以优化体积与性能。

若需英文文档，请参见 README.en.md。

## 特性概览

- 现代技术栈：Next.js 15、React 19、TypeScript 5、Tailwind CSS 3
- 内容系统：MDX（mdx-bundler）、文章目录（TOC）、代码高亮（rehype-prism-plus）、KaTeX 数学公式、参考文献（rehype-citation）
- 性能优化：生产环境使用 Preact、细粒度图片配置、HTTP 安全与缓存头、滚动恢复与包优化
- 站内搜索：基于 FlexSearch，构建时生成索引
- 交互与可用性：深浅色主题（next-themes）、移动端友好、无障碍与可访问性样式
- 数据与 SEO：RSS、Sitemap、结构化数据、社交卡片
- 评论与订阅：支持 Giscus / Utterances / Disqus 与 Mailchimp / ConvertKit / 等主流服务
- 质量保障：ESLint + Prettier、Jest + Testing Library、严格 TypeScript 设置
- 监控与可观测性：Sentry、Web Vitals、错误边界组件、性能监控组件

> 说明：本项目在 docs/ 下提供迁移与改进记录（如 TypeScript 迁移、配置优化等），便于二次开发与团队协作。

## 技术栈

- 应用框架：Next.js 15（React 19）
- 语言与样式：TypeScript、Tailwind CSS 3、PostCSS、Autoprefixer
- 内容处理：mdx-bundler、remark/rehype 插件（GFM、Math、Prism、高亮、Slug、Citation 等）
- 搜索索引：FlexSearch（构建时生成）
- 监控与埋点：Sentry（@sentry/nextjs）、Web Vitals
- 测试与规范：Jest、@testing-library/react、ESLint、Prettier、Husky + lint-staged

## 目录结构（节选）

- components/：UI 组件（导航、布局、SEO、主题切换、搜索、评论等）
- layouts/：页面布局（文章、列表、作者等）
- pages/：Next.js 路由与页面
- lib/：工具、MDX 处理、RSS、env 校验、Web Vitals 等
- data/：站点元信息、导航、作者与文章内容（MD/MDX）
- scripts/：构建与辅助脚本（搜索索引、Sitemap、Compose、验证等）
- public/：静态资源（图像、图标等）

## 快速开始

### 先决条件

- Node.js >= 22（本仓库 engines 要求）

### 安装依赖

```bash
npm install
```

### 开发调试

两种方式任选其一：

```bash
# 热更新开发服务器
npm run dev

# 带数据目录热监听的开发模式（适合写作）
npm start
```

打开 http://localhost:3000 预览站点。

### 构建与预览

```bash
# 生成搜索索引 + Next 构建 + 生成站点地图
npm run build

# 生产预览
npm run serve
```

### 代码质量与测试

```bash
# 代码检查与格式化
npm run lint
npm run prettier

# 单元测试
npm test
npm run test:watch
npm run test:coverage
```

## 内容创作

- 文章存放：data/blog 下（支持 .md 与 .mdx）
- 新建文章：

```bash
# 交互式创建文章（需要 ts-node）
npx ts-node ./scripts/compose.ts
```

### Frontmatter 规范（常用字段）

```yaml
---
title: 标题（必填）
date: 'YYYY-MM-DD'（必填）
tags: ['tag1', 'tag2']（可选，数组）
draft: false # 是否草稿
summary: 摘要（可选）
images: ['/static/images/xxx.jpg'] # 用于社交卡片
authors: ['default'] # 对应 data/authors 下文件名
layout: PostLayout # 布局，可选
canonicalUrl: https://example.com/blog/my-post # SEO 规范链接
---
```

## 配置说明

- 站点信息：data/siteMetadata.ts（标题、描述、语言、链接等）
- 导航菜单：data/headerNavLinks.ts
- 项目卡片：data/projectsData.ts
- 图片与静态资源：public/static
- 安全策略与打包：next.config.js（CSP、安全头、图片策略、Preact 别名、Sentry）

### 环境变量

在 .env.local 中配置（以下按功能可选）：

- 评论系统（COMMENT_PROVIDER：giscus | utterances | disqus）
  - Giscus：NEXT_PUBLIC_GISCUS_REPO、NEXT_PUBLIC_GISCUS_REPOSITORY_ID、NEXT_PUBLIC_GISCUS_CATEGORY、NEXT_PUBLIC_GISCUS_CATEGORY_ID
  - Utterances：NEXT_PUBLIC_UTTERANCES_REPO
  - Disqus：NEXT_PUBLIC_DISQUS_SHORTNAME
- 邮件订阅（NEWSLETTER_PROVIDER：mailchimp | buttondown | convertkit | klaviyo | revue | emailoctopus）
  - Mailchimp：MAILCHIMP_API_KEY、MAILCHIMP_API_SERVER、MAILCHIMP_AUDIENCE_ID
  - 其他提供商见 lib/env-validation.ts
- 分析与监控：NEXT_PUBLIC_GA_ID、NEXT_PUBLIC_SENTRY_DSN
- Sentry 构建（可选）：SENTRY_ORG、SENTRY_PROJECT（用于源码映射上传与构建插件）

开发模式会自动执行基本的环境变量校验（见 lib/env-validation.ts）。

## 部署指南

- Vercel（推荐）：零配置部署 Next.js；将 .env.\* 同步至项目环境即可。
- Netlify：使用其 Next.js 运行时支持；注意保留 `next/image` 与 ISR/SSR 支持。
- 其他平台（GitHub Pages、Firebase 等）：若不支持 `next/image`，请改用第三方图片优化服务或使用原生 `<img>`。
- CSP 调整：如接入新的第三方脚本/样式/iframe，需在 next.config.js 中更新 Content-Security-Policy。

## 常用脚本

- 分析包体积：`npm run analyze`（设置 `ANALYZE=true`）
- 生成搜索索引：`ts-node scripts/generate-search-index.mts`（构建过程会自动执行）
- 生成站点地图：`ts-node scripts/generate-sitemap.mts`（构建过程会自动执行）

## CI 工作流（手动触发）

- 入口：在 GitHub 仓库的 Actions 页面打开本项目工作流。
  - https://github.com/liwenkang/blog/actions/workflows/ci.yml
- 手动触发：点击页面右上角的“Run workflow”，选择要运行的分支后再次点击“Run workflow”。
- 工作流行为：安装依赖 → Lint → 测试覆盖率 → 构建；使用 matrix 并行验证多平台（Ubuntu/Mac/Windows）与多 Node 版本（22.x/22.11.0）；启用 npm 与 `.next/cache` 缓存加速。
- 徽章更新：仅在 Ubuntu + Node 22.x 的作业中更新 README 覆盖率徽章，避免并发冲突。
- 提示：若默认分支非 `main`/`master`，可在工作流 `on.push` 的分支列表中自行调整。

## 文档与报告

项目在 docs/ 目录下提供了多份中文说明与改进报告，例如：

- TypeScript 迁移完成报告.md
- 配置警告修复报告.md
- 搜索功能实现报告.md
- P0/P1 改进完成与验证报告

欢迎按需查阅以了解实现细节与设计权衡。

## 许可协议

本项目采用 MIT 许可证，详见 LICENSE。

## 致谢

本项目基于 timlrx/tailwind-nextjs-starter-blog 思想与实现，结合 TypeScript 化与本地化需求进行了增强与整理。
