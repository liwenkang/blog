const fs = require('fs')
const path = require('path')
const matter = require('gray-matter')

const blogDir = path.join(process.cwd(), 'data', 'blog')

function fixDraftField(filePath) {
  const content = fs.readFileSync(filePath, 'utf8')
  const { data, content: markdownContent } = matter(content)
  const fileName = path.basename(filePath)

  let modified = false
  const changes = []

  // 如果 draft 字段不存在，添加默认值 false
  if (data.draft === undefined) {
    data.draft = false
    changes.push(`添加了 draft: false`)
    modified = true
  }

  // 如果 summary 为空字符串，移除它（让验证脚本忽略）
  if (data.summary === '') {
    delete data.summary
    changes.push(`移除了空的 summary 字段`)
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
  console.log('🔧 开始修复 draft 字段...\n')

  const files = fs
    .readdirSync(blogDir)
    .filter((file) => file.endsWith('.md') || file.endsWith('.mdx'))
    .filter((file) => file !== '.DS_Store.md') // 跳过系统文件

  let fixedCount = 0

  files.forEach((file) => {
    const filePath = path.join(blogDir, file)
    if (fixDraftField(filePath)) {
      fixedCount++
    }
  })

  console.log(`\n📊 修复完成:`)
  console.log(`- 检查文件数: ${files.length}`)
  console.log(`- 修复文件数: ${fixedCount}`)
  console.log(`- 完好文件数: ${files.length - fixedCount}`)
}

main()
