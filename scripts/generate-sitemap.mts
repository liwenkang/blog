#!/usr/bin/env ts-node

import fs from 'node:fs'
import { globby } from 'globby'
import matter from 'gray-matter'
import prettier from 'prettier'
import { logger } from './utils/script-logger.mts'

// 读取 siteMetadata (避免 ESM 导入问题)
const getSiteUrl = (): string => {
  const metadataPath = './data/siteMetadata.ts'
  const content = fs.readFileSync(metadataPath, 'utf8')
  const regex = /siteUrl:\s*['"](https:\/\/liwenkang\.space)['"]/ 
  const match = regex.exec(content)
  return match ? match[1] : 'https://liwenkang.space'
}

const siteUrl = getSiteUrl()

interface Frontmatter {
  draft?: boolean
  canonicalUrl?: string
}

// Main execution with top-level await
const prettierConfig = await prettier.resolveConfig('./.prettierrc.js')
logger.info('开始生成站点地图...')
const pages = await globby([
  'pages/*.js',
  'pages/*.tsx',
  'data/blog/**/*.mdx',
  'data/blog/**/*.md',
  'public/tags/**/*.xml',
  '!pages/_*.js',
  '!pages/_*.tsx',
  '!pages/api',
])

const sitemap = `
        <?xml version="1.0" encoding="UTF-8"?>
        <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
            ${pages
              .map((page) => {
                // Exclude drafts from the sitemap
                if (page.search('.md') >= 1 && fs.existsSync(page)) {
                  const source = fs.readFileSync(page, 'utf8')
                  const fm = matter(source) as { data: Frontmatter }
                  if (fm.data.draft) {
                    return
                  }
                  if (fm.data.canonicalUrl) {
                    return
                  }
                }
                const path = page
                  .replace('pages/', '/')
                  .replace('data/blog', '/blog')
                  .replace('public/', '/')
                  .replace('.js', '')
                  .replace('.tsx', '')
                  .replace('.mdx', '')
                  .replace('.md', '')
                  .replace('/feed.xml', '')
                const route = path === '/index' ? '' : path

                if (page.includes('pages/404.') || page.includes('pages/blog/[...slug].')) {
                  return
                }
                return `
                    <url>
                        <loc>${siteUrl}${route}</loc>
                    </url>
                `
              })
              .join('')}
    </urlset>
  `

const formatted = await prettier.format(sitemap, {
  ...prettierConfig,
  parser: 'html',
})

fs.writeFileSync('public/sitemap.xml', formatted)
logger.success('站点地图生成成功', { output: 'public/sitemap.xml' })
