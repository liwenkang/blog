const fs = require('fs')
const path = require('path')
const matter = require('gray-matter')
const readingTime = require('reading-time')
const { logger } = require('./utils/script-logger')

// 搜索索引数据存放路径
const SEARCH_INDEX_PATH = path.join(process.cwd(), 'public', 'search.json')
const CONTENT_DIR = path.join(process.cwd(), 'data', 'blog')

/**
 * 从markdown内容中提取纯文本
 * 移除markdown语法，保留纯文本内容用于搜索
 */
function extractTextFromMarkdown(content) {
  return (
    content
      // 移除代码块
      .replace(/```[\s\S]*?```/g, '')
      // 移除行内代码
      .replace(/`[^`]*`/g, '')
      // 移除标题标记
      .replace(/^#+\s/gm, '')
      // 移除链接格式
      .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
      // 移除图片标记
      .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
      // 移除强调标记
      .replace(/\*\*([^*]*)\*\*/g, '$1')
      .replace(/\*([^*]*)\*/g, '$1')
      // 移除列表标记
      .replace(/^[\s]*[-*+]\s/gm, '')
      .replace(/^[\s]*\d+\.\s/gm, '')
      // 移除引用标记
      .replace(/^>\s/gm, '')
      // 移除多余的空行
      .replace(/\n\s*\n/g, '\n')
      .trim()
  )
}

/**
 * 清理文本，移除特殊字符但保留中英文和空格
 */
function cleanText(text) {
  return text
    .replace(/[^\w\s\u4e00-\u9fff]/g, ' ') // 保留中英文、数字、空格
    .replace(/\s+/g, ' ') // 合并多个空格
    .trim()
}

/**
 * 生成搜索索引
 */
async function generateSearchIndex() {
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

    const searchIndex = []

    for (const file of files) {
      try {
        const filePath = path.join(CONTENT_DIR, file)
        const source = fs.readFileSync(filePath, 'utf8')
        const { data: frontmatter, content } = matter(source)

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
        logger.error('处理文件时出错', error, { file })
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
    logger.error('生成搜索索引时出错', error)
    process.exit(1)
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  generateSearchIndex()
}

module.exports = { generateSearchIndex }
