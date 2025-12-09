const fs = require('fs')
const path = require('path')
const matter = require('gray-matter')

const blogDir = path.join(process.cwd(), 'data', 'blog')

// 必需字段
const requiredFields = ['title', 'date']
// 推荐字段
const recommendedFields = ['tags', 'summary', 'draft']

function validateFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8')
  const { data } = matter(content)
  const fileName = path.basename(filePath)
  const errors = []
  const warnings = []

  // 检查必需字段
  requiredFields.forEach((field) => {
    if (!data[field]) {
      errors.push(`缺少必需字段: ${field}`)
    }
  })

  // 检查推荐字段
  recommendedFields.forEach((field) => {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      warnings.push(`缺少推荐字段: ${field}`)
    }
  })

  // 检查字段类型
  if (data.tags && !Array.isArray(data.tags)) {
    errors.push('tags 字段应该是数组类型')
  }

  if (data.draft !== undefined && typeof data.draft !== 'boolean') {
    errors.push('draft 字段应该是布尔类型')
  }

  // 检查日期格式
  if (data.date && isNaN(Date.parse(data.date))) {
    errors.push('date 字段格式无效')
  }

  return { fileName, errors, warnings, frontmatter: data }
}

function main() {
  console.log('🔍 开始检查博客文章数据完整性...\n')

  const files = fs
    .readdirSync(blogDir)
    .filter((file) => file.endsWith('.md') || file.endsWith('.mdx'))

  let totalErrors = 0
  let totalWarnings = 0
  const problematicFiles = []

  files.forEach((file) => {
    const filePath = path.join(blogDir, file)
    const { fileName, errors, warnings, frontmatter } = validateFile(filePath)

    if (errors.length > 0 || warnings.length > 0) {
      console.log(`📄 ${fileName}`)
      if (errors.length > 0) {
        console.log('❌ 错误:')
        errors.forEach((error) => console.log(`   - ${error}`))
        totalErrors += errors.length
      }
      if (warnings.length > 0) {
        console.log('⚠️ 警告:')
        warnings.forEach((warning) => console.log(`   - ${warning}`))
        totalWarnings += warnings.length
      }
      console.log('📋 当前frontmatter:', JSON.stringify(frontmatter, null, 2))
      console.log('---\n')
      problematicFiles.push({ fileName, errors, warnings })
    }
  })

  console.log(`\n📊 检查完成:`)
  console.log(`- 总文件数: ${files.length}`)
  console.log(`- 错误数: ${totalErrors}`)
  console.log(`- 警告数: ${totalWarnings}`)
  console.log(`- 有问题的文件: ${problematicFiles.length}`)

  if (totalErrors > 0) {
    console.log(`\n❌ 发现 ${totalErrors} 个错误，需要修复`)
    process.exit(1)
  } else if (totalWarnings > 0) {
    console.log(`\n⚠️ 发现 ${totalWarnings} 个警告，建议修复`)
  } else {
    console.log(`\n✅ 所有文件数据完整性检查通过！`)
  }
}

main()
