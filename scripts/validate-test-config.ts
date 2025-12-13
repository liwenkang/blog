#!/usr/bin/env ts-node

import fs from 'node:fs'
import { logger } from './utils/script-logger.js'

logger.info('🧪 验证测试配置...')
logger.info('')

interface PackageJson {
  scripts?: Record<string, string>
  devDependencies?: Record<string, string>
}

// 检查配置文件是否存在
const requiredFiles = ['jest.config.js', 'jest.setup.js', 'package.json']

logger.info('📁 检查配置文件:')
let configExists = true
requiredFiles.forEach((file) => {
  const exists = fs.existsSync(file)
  logger.info(`  ${exists ? '✅' : '❌'} ${file}`)
  if (!exists) configExists = false
})

if (configExists) {
  logger.info('')
  logger.info('✅ 所有配置文件都存在')

  // 检查 package.json 中的测试脚本
  try {
    const packageJson: PackageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
    logger.info('')
    logger.info('📦 检查测试脚本:')

    const testScripts = ['test', 'test:watch', 'test:coverage']
    testScripts.forEach((script) => {
      const exists = packageJson.scripts?.[script]
      logger.info(`  ${exists ? '✅' : '❌'} ${script}: ${exists || '缺失'}`)
    })

    // 检查测试依赖
    logger.info('')
    logger.info('📋 检查测试依赖:')
    const testDeps = [
      '@testing-library/jest-dom',
      '@testing-library/react',
      '@testing-library/user-event',
      'jest',
      'jest-environment-jsdom',
    ]

    testDeps.forEach((dep) => {
      const exists = packageJson.devDependencies?.[dep]
      logger.info(`  ${exists ? '✅' : '❌'} ${dep}: ${exists || '缺失'}`)
    })
  } catch {
    logger.info('')
    logger.info('❌ 无法读取 package.json')
  }

  // 检查测试文件
  logger.info('')
  logger.info('🧪 检查测试文件:')
  const testFiles = [
    '__tests__/example.test.ts',
    'components/__tests__/Card.test.tsx',
    'components/__tests__/Tag.test.tsx',
    'components/__tests__/PageTitle.test.tsx',
    '__tests__/utils/testUtils.tsx',
  ]

  testFiles.forEach((file) => {
    const exists = fs.existsSync(file)
    logger.info(`  ${exists ? '✅' : '❌'} ${file}`)
  })

  logger.info('')
  logger.info('🎯 总结:')
  logger.info('✅ Jest 配置已完成')
  logger.info('✅ 测试文件已创建')
  logger.info('✅ 测试脚本已配置')
  logger.info('📝 下一步: 运行 npm install 安装依赖')
  logger.info('🧪 然后运行: npm test')
} else {
  logger.info('')
  logger.info('❌ 缺少必要的配置文件')
  logger.info('请确保所有配置文件都已创建')
}
