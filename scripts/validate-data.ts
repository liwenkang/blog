#!/usr/bin/env ts-node

import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import { logger } from './utils/script-logger.js'

const blogDir = path.join(process.cwd(), 'data', 'blog')

interface Frontmatter {
  title?: string
  date?: string
  tags?: string | string[]
  summary?: string
  draft?: boolean
}

interface ValidationResult {
  fileName: string
  errors: string[]
  warnings: string[]
  frontmatter: Frontmatter
}

interface ProblematicFile {
  fileName: string
  errors: string[]
  warnings: string[]
}

// 必需字段
const requiredFields = ['title', 'date']
// 推荐字段
const recommendedFields = ['tags', 'summary', 'draft']

function validateFile(filePath: string): ValidationResult {
  const content = fs.readFileSync(filePath, 'utf8')
  const { data } = matter(content) as { data: Frontmatter }
  const fileName = path.basename(filePath)
  const errors: string[] = []
  const warnings: string[] = []

  // 检查必需字段
  requiredFields.forEach((field) => {
    if (!data[field as keyof Frontmatter]) {
      errors.push(`缺少必需字段: ${field}`)
    }
  })

  // 检查推荐字段
  recommendedFields.forEach((field) => {
    const value = data[field as keyof Frontmatter]
    if (value === undefined || value === null || value === '') {
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
  if (data.date && Number.isNaN(Date.parse(data.date))) {
    errors.push('date 字段格式无效')
  }

  return { fileName, errors, warnings, frontmatter: data }
}

function main() {
  logger.info('🔍 开始检查博客文章数据完整性...')
  logger.info('')

  const files = fs
    .readdirSync(blogDir)
    .filter((file) => file.endsWith('.md') || file.endsWith('.mdx'))

  let totalErrors = 0
  let totalWarnings = 0
  const problematicFiles: ProblematicFile[] = []

  files.forEach((file) => {
    const filePath = path.join(blogDir, file)
    const { fileName, errors, warnings, frontmatter } = validateFile(filePath)

    if (errors.length > 0 || warnings.length > 0) {
      logger.info(`📄 ${fileName}`)
      if (errors.length > 0) {
        logger.info('❌ 错误:')
        errors.forEach((error) => logger.info(`   - ${error}`))
        totalErrors += errors.length
      }
      if (warnings.length > 0) {
        logger.info('⚠️ 警告:')
        warnings.forEach((warning) => logger.info(`   - ${warning}`))
        totalWarnings += warnings.length
      }
      logger.info(`📋 当前frontmatter: ${JSON.stringify(frontmatter, null, 2)}`)
      logger.info('---')
      logger.info('')
      problematicFiles.push({ fileName, errors, warnings })
    }
  })

  logger.info('')
  logger.info(`📊 检查完成:`)
  logger.info(`- 总文件数: ${files.length}`)
  logger.info(`- 错误数: ${totalErrors}`)
  logger.info(`- 警告数: ${totalWarnings}`)
  logger.info(`- 有问题的文件: ${problematicFiles.length}`)

  if (totalErrors > 0) {
    logger.info('')
    logger.info(`❌ 发现 ${totalErrors} 个错误，需要修复`)
    process.exit(1)
  } else if (totalWarnings > 0) {
    logger.info('')
    logger.info(`⚠️ 发现 ${totalWarnings} 个警告，建议修复`)
  } else {
    logger.info('')
    logger.info(`✅ 所有文件数据完整性检查通过！`)
  }
}

main()
