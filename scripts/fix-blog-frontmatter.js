const fs = require('fs')
const path = require('path')
const matter = require('gray-matter')
const { logger } = require('./utils/script-logger')

// unify console outputs through script logger
console.log = function (...args) {
  return logger.info(args[0], typeof args[1] === 'object' ? args[1] : {})
}
console.warn = function (...args) {
  return logger.warn(args[0], typeof args[1] === 'object' ? args[1] : {})
}
console.error = function (...args) {
  const [msg, maybeError, meta] = args
  if (maybeError instanceof Error) {
    return logger.error(msg, maybeError, typeof meta === 'object' ? meta : {})
  }
  return logger.error(msg, null, typeof maybeError === 'object' ? maybeError : {})
}

const blogDir = path.join(process.cwd(), 'data', 'blog')

// 生成智能摘要的函数
function generateSummary(title, content, tags) {
  // 如果内容很短，直接截取
  if (content.length < 150) {
    return content.replace(/[#*`]/g, '').trim()
  }

  // 尝试找到第一段文字
  const firstParagraph = content.match(/^([^#\n]+(?:\n[^#\n]+)*)/m)
  if (firstParagraph) {
    return (
      firstParagraph[1]
        .replace(/[#*`\[\]]/g, '')
        .trim()
        .substring(0, 150) + '...'
    )
  }

  // 默认基于标题生成
  return `关于 ${title} 的详细介绍和实践`
}

// 判断是否为草稿的智能逻辑
function isDraft(title, tags, content) {
  // 如果标题包含明显的草稿标识
  if (title.includes('TODO') || title.includes('草稿') || title.includes('WIP')) {
    return true
  }

  // 如果内容很短，可能是草稿
  if (content.length < 200) {
    return true
  }

  // 如果包含未完成的标识
  if (content.includes('TODO') || content.includes('待完成') || content.includes('WIP')) {
    return true
  }

  // 默认不是草稿
  return false
}

function fixFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8')
  const { data, content: markdownContent } = matter(content)
  const fileName = path.basename(filePath)

  let modified = false
  const changes = []

  // 修复 draft 字段
  if (data.draft === undefined) {
    data.draft = isDraft(data.title, data.tags, markdownContent)
    changes.push(`draft: ${data.draft}`)
    modified = true
  }

  // 修复 summary 字段
  if (!data.summary) {
    // 提取文章前200个字符作为摘要候选
    const contentPreview = markdownContent
      .replace(/^---[\s\S]*?---\n/, '') // 移除frontmatter
      .replace(/#{1,6}\s+/g, '') // 移除markdown标题
      .replace(/\*\*/g, '') // 移除粗体标记
      .replace(/\*/g, '') // 移除斜体标记
      .replace(/`[^`]*`/g, '') // 移除代码块
      .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // 移除链接，保留文本
      .replace(/\n+/g, ' ') // 替换换行为空格
      .trim()
      .substring(0, 200)

    data.summary = contentPreview + (contentPreview.length >= 200 ? '...' : '')
    changes.push(`添加了 summary 字段`)
    modified = true
  }

  // 确保 tags 是数组
  if (data.tags && !Array.isArray(data.tags)) {
    data.tags = [data.tags]
    changes.push(`修复了 tags 字段为数组`)
    modified = true
  }

  // 如果修改了，写回文件
  if (modified) {
    const updatedContent = matter.stringify(markdownContent, data)
    fs.writeFileSync(filePath, updatedContent, 'utf8')

    console.log(`🔧 ${fileName}`)
    changes.forEach((change) => console.log(`   - ${change}`))
    return true
  }

  return false
}

function main() {
  console.log('🔧 开始修复博客文章 frontmatter...\n')

  const files = fs
    .readdirSync(blogDir)
    .filter((file) => file.endsWith('.md') || file.endsWith('.mdx'))
    .filter((file) => file !== '.DS_Store.md') // 跳过系统文件

  let fixedCount = 0

  files.forEach((file) => {
    const filePath = path.join(blogDir, file)
    if (fixFile(filePath)) {
      fixedCount++
    }
  })

  console.log(`\n📊 修复完成:`)
  console.log(`- 检查文件数: ${files.length}`)
  console.log(`- 修复文件数: ${fixedCount}`)
  console.log(`- 完好文件数: ${files.length - fixedCount}`)

  if (fixedCount > 0) {
    console.log('\n✅ frontmatter 修复完成！建议运行验证脚本检查结果')
  } else {
    console.log('\n✅ 所有文件的 frontmatter 已经完整！')
  }
}

main()
