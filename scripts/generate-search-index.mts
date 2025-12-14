#!/usr/bin/env ts-node

import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import readingTime from 'reading-time'
import { logger } from './utils/script-logger.js'

// 搜索索引数据存放路径
const SEARCH_INDEX_PATH = path.join(process.cwd(), 'public', 'search.json')
const CONTENT_DIR = path.join(process.cwd(), 'data', 'blog')

interface SearchIndexItem {
  id: string
  title: string
  summary: string
  content: string
  tags: string[]
  date: string
  readingTime: string
  url: string
  searchText: string
}

interface Frontmatter {
  title?: string
  summary?: string
  tags?: string[]
  date?: string
  draft?: boolean
}

/**
 * 从markdown内容中提取纯文本
 * 移除markdown语法，保留纯文本内容用于搜索
 */
function extractTextFromMarkdown(content: string): string {
  return (
    content
      // 移除代码块
      .replaceAll(/```[\s\S]*?```/g, '')
      // 移除行内代码
      .replaceAll(/`[^`]*`/g, '')
      // 移除标题标记
      .replaceAll(/^#+\s/gm, '')
      // 移除链接格式
      .replaceAll(/\[([^\]]*)\]\([^)]*\)/g, '$1')
      // 移除图片标记
      .replaceAll(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
      // 移除强调标记
      .replaceAll(/\*\*([^*]*)\*\*/g, '$1')
      .replaceAll(/\*([^*]*)\*/g, '$1')
      // 移除列表标记
      .replaceAll(/^\s*[-*+]\s/gm, '')
      .replaceAll(/^\s*\d+\.\s/gm, '')
      // 移除引用标记
      .replaceAll(/^>\s/gm, '')
      // 移除多余的空行
      .replaceAll(/\n\s*\n/g, '\n')
      .trim()
  )
}

/**
 * 清理文本，移除特殊字符但保留中英文和空格
 */
function cleanText(text: string): string {
  return text
    .replaceAll(/[^\w\s\u4e00-\u9fff]/g, ' ') // 保留中英文、数字、空格
    .replaceAll(/\s+/g, ' ') // 合并多个空格
    .trim()
}

/**
 * 生成搜索索引
 */
async function generateSearchIndex(): Promise<void> {
  try {
    logger.info('开始生成搜索索引...')

    if (!fs.existsSync(CONTENT_DIR)) {
      logger.error('内容目录不存在', null, { dir: CONTENT_DIR })
      process.exit(1)
    }

    const files = fs
      .readdirSync(CONTENT_DIR, { withFileTypes: true })
      .filter(
        (dirent) => dirent.isFile() && (dirent.name.endsWith('.md') || dirent.name.endsWith('.mdx'))
      )
      .map((dirent) => dirent.name)

    const searchIndex: SearchIndexItem[] = []

    for (const file of files) {
      try {
        const filePath = path.join(CONTENT_DIR, file)
        const source = fs.readFileSync(filePath, 'utf8')
        const { data: frontmatter, content } = matter(source) as {
          data: Frontmatter
          content: string
        }

        // 跳过草稿
        if (frontmatter.draft === true) {
          continue
        }

        const slug = file.replace(/\.(mdx|md)$/, '')
        const plainText = extractTextFromMarkdown(content)
        const searchText = cleanText(`${frontmatter.title || ''} ${plainText}`)

        // 计算阅读时间
        const stats = readingTime(content)

        searchIndex.push({
          id: slug,
          title: frontmatter.title || '',
          summary: frontmatter.summary || plainText.substring(0, 160) + '...',
          content: plainText.substring(0, 1000), // 限制内容长度
          tags: frontmatter.tags || [],
          date: frontmatter.date || '',
          readingTime: stats.text,
          url: `/blog/${slug}`,
          searchText: searchText, // 用于搜索的纯文本
        })

        logger.info('已处理', { file })
      } catch (error) {
        logger.error('处理文件时出错', error as Error, { file })
      }
    }

    // 确保public目录存在
    const publicDir = path.dirname(SEARCH_INDEX_PATH)
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true })
    }

    // 写入搜索索引文件
    fs.writeFileSync(SEARCH_INDEX_PATH, JSON.stringify(searchIndex, null, 2))

    logger.success('搜索索引生成成功', { count: searchIndex.length })
    logger.info('索引文件路径', { path: SEARCH_INDEX_PATH })
  } catch (error) {
    logger.error('生成搜索索引时出错', error as Error)
    process.exit(1)
  }
}

// 如果直接运行此脚本 - 使用 top-level await
if (import.meta.url === `file://${process.argv[1]}`) {
  await generateSearchIndex()
}

export { generateSearchIndex }
